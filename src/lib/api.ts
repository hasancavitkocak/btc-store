import { getCookie, setCookie, deleteCookie } from './cookies';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090/webapp/api';

export interface ApiResponse<T = any> {
  status: 'SUCCESS' | 'ERROR';
  data?: T;
  errorMessage?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  username: string;
  firstName: string;
  lastName: string;
  language: string;
  picture: string;
  userGroups: string[];
}

export interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean>;
  skipAuth?: boolean;
}

class ApiClient {
  private baseURL: string;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(`${this.baseURL}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }
    
    return url.toString();
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const refreshToken = getCookie('refreshToken');
        if (!refreshToken) return false;

        const response = await fetch(`${this.baseURL}/token/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
          credentials: 'include',
        });

        if (!response.ok) return false;

        const data: AuthToken = await response.json();
        
        setCookie('accessToken', data.accessToken, 7);
        setCookie('refreshToken', data.refreshToken, 30);
        
        return true;
      } catch (error) {
        console.error('Token refresh failed:', error);
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const { params, skipAuth, ...options } = config;
    const url = this.buildUrl(endpoint, params);
    const token = getCookie('accessToken');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token && !skipAuth) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      let response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      // Token expired, try refresh
      if (response.status === 401 && !skipAuth && !endpoint.includes('/login')) {
        const refreshed = await this.refreshAccessToken();
        
        if (refreshed) {
          const newToken = getCookie('accessToken');
          if (newToken) {
            headers.Authorization = `Bearer ${newToken}`;
            response = await fetch(url, {
              ...options,
              headers,
              credentials: 'include',
            });
          }
        } else {
          // Refresh failed, clear tokens and redirect to login
          deleteCookie('accessToken');
          deleteCookie('refreshToken');
          
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin/login')) {
            window.location.href = '/admin/login';
          }
          
          return {
            status: 'ERROR',
            errorMessage: 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.',
          };
        }
      }

      const contentType = response.headers.get('content-type');
      const data = contentType?.includes('application/json') 
        ? await response.json() 
        : await response.text();

      if (!response.ok) {
        return {
          status: 'ERROR',
          errorMessage: data?.errorMessage || data?.message || 'Bir hata oluştu',
        };
      }

      return {
        status: 'SUCCESS',
        data,
      };
    } catch (error) {
      console.error('API Error:', error);
      return {
        status: 'ERROR',
        errorMessage: 'Bağlantı hatası oluştu',
      };
    }
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthToken>> {
    return this.post<AuthToken>('/login', credentials, { skipAuth: true });
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthToken>> {
    return this.post<AuthToken>('/token/refresh', { refreshToken }, { skipAuth: true });
  }

  // Upload helper
  async upload<T>(endpoint: string, formData: FormData, config?: RequestConfig): Promise<ApiResponse<T>> {
    const token = getCookie('accessToken');
    const headers: Record<string, string> = {};

    // Content-Type'ı ekleme - browser otomatik ekleyecek
    if (token && !config?.skipAuth) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
      });

      // Response'u parse et
      const contentType = response.headers.get('content-type');
      let data;
      
      try {
        if (contentType?.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          data = { message: text };
        }
      } catch (parseError) {
        console.error('Response parse error:', parseError);
        data = { message: 'Sunucu yanıtı okunamadı' };
      }

      if (!response.ok) {
        console.error('Upload failed:', response.status, data);
        return {
          status: 'ERROR',
          errorMessage: data?.errorMessage || data?.message || `HTTP ${response.status}: Upload hatası`,
        };
      }

      return {
        status: 'SUCCESS',
        data,
      };
    } catch (error) {
      console.error('Upload Error:', error);
      return {
        status: 'ERROR',
        errorMessage: error instanceof Error ? error.message : 'Upload sırasında bağlantı hatası oluştu',
      };
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
