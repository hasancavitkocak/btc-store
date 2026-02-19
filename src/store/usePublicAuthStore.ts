import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient, AuthToken } from '@/lib/api';
import { setCookie, deleteCookie, getCookie } from '@/lib/cookies';
import { decodeJwt, isTokenExpired } from '@/lib/jwt';

export interface CurrentUser {
  username: string;
  firstName: string;
  lastName: string;
  language: string;
  picture: string;
  userGroups: string[];
}

interface PublicAuthState {
  currentUser: CurrentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setCurrentUser: (user: CurrentUser | null) => void;
  initializeAuth: () => Promise<void>;
  hasUserGroup: (group: string) => boolean;
}

export const usePublicAuthStore = create<PublicAuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (username, password) => {
        set({ isLoading: true });
        
        try {
          const response = await apiClient.login({ username, password });
          
          if (response.status === 'SUCCESS' && response.data) {
            const authData = response.data as AuthToken;
            
            // Save tokens to cookies (public uses authAccessToken/authRefreshToken)
            setCookie('authAccessToken', authData.accessToken);
            setCookie('authRefreshToken', authData.refreshToken);
            
            // Decode JWT to get user info
            const decoded = decodeJwt(authData.accessToken);
            if (!decoded) {
              set({ isLoading: false });
              return { 
                success: false, 
                error: 'Token decode hatası' 
              };
            }
            
            // Save user data to store
            const currentUser: CurrentUser = {
              username: decoded.username,
              firstName: decoded.firstName,
              lastName: decoded.lastName,
              language: decoded.language,
              picture: decoded.picture,
              userGroups: decoded.roles,
            };
            
            set({ 
              currentUser, 
              isAuthenticated: true,
              isLoading: false 
            });
            
            return { success: true };
          } else {
            set({ isLoading: false });
            return { 
              success: false, 
              error: response.errorMessage || 'Giriş başarısız' 
            };
          }
        } catch (error) {
          set({ isLoading: false });
          return { 
            success: false, 
            error: 'Bağlantı hatası oluştu' 
          };
        }
      },

      logout: () => {
        deleteCookie('authAccessToken');
        deleteCookie('authRefreshToken');
        set({ currentUser: null, isAuthenticated: false });
        
        // Anasayfaya yönlendir
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      },

      setCurrentUser: (user) => {
        set({ currentUser: user, isAuthenticated: !!user });
      },

      initializeAuth: async () => {
        const accessToken = getCookie('authAccessToken');
        const refreshToken = getCookie('authRefreshToken');
        
        // Access token yok ama refresh token varsa, refresh dene
        if (!accessToken && refreshToken) {
          try {
            const response = await apiClient.refreshToken(refreshToken);
            
            if (response.status === 'SUCCESS' && response.data) {
              const authData = response.data as AuthToken;
              
              // Yeni token'ları kaydet
              setCookie('authAccessToken', authData.accessToken);
              setCookie('authRefreshToken', authData.refreshToken);
              
              // Decode JWT to get user info
              const decoded = decodeJwt(authData.accessToken);
              if (decoded) {
                const currentUser: CurrentUser = {
                  username: decoded.username,
                  firstName: decoded.firstName,
                  lastName: decoded.lastName,
                  language: decoded.language,
                  picture: decoded.picture,
                  userGroups: decoded.roles,
                };
                
                set({ currentUser, isAuthenticated: true });
              }
              return;
            }
          } catch (error) {
            console.error('Public auth: Token refresh failed during init:', error);
          }
          
          // Refresh başarısız, logout yap
          deleteCookie('authAccessToken');
          deleteCookie('authRefreshToken');
          set({ currentUser: null, isAuthenticated: false });
          return;
        }
        
        if (!accessToken) {
          set({ currentUser: null, isAuthenticated: false });
          return;
        }

        // Token'ın süresi dolmuş mu kontrol et
        if (isTokenExpired(accessToken)) {
          // Refresh token varsa yenilemeyi dene
          if (refreshToken) {
            try {
              const response = await apiClient.refreshToken(refreshToken);
              
              if (response.status === 'SUCCESS' && response.data) {
                const authData = response.data as AuthToken;
                
                // Yeni token'ları kaydet
                setCookie('authAccessToken', authData.accessToken);
                setCookie('authRefreshToken', authData.refreshToken);
                
                // Decode JWT to get user info
                const decoded = decodeJwt(authData.accessToken);
                if (decoded) {
                  const currentUser: CurrentUser = {
                    username: decoded.username,
                    firstName: decoded.firstName,
                    lastName: decoded.lastName,
                    language: decoded.language,
                    picture: decoded.picture,
                    userGroups: decoded.roles,
                  };
                  
                  set({ currentUser, isAuthenticated: true });
                }
                return;
              }
            } catch (error) {
              console.error('Public auth: Token refresh failed:', error);
            }
          }
          
          // Refresh başarısız, logout yap
          deleteCookie('authAccessToken');
          deleteCookie('authRefreshToken');
          set({ currentUser: null, isAuthenticated: false });
          return;
        }

        // Token geçerli, JWT'den kullanıcı bilgilerini decode et
        const decoded = decodeJwt(accessToken);
        if (decoded) {
          const currentUser: CurrentUser = {
            username: decoded.username,
            firstName: decoded.firstName,
            lastName: decoded.lastName,
            language: decoded.language,
            picture: decoded.picture,
            userGroups: decoded.roles,
          };
          
          set({ currentUser, isAuthenticated: true });
        } else {
          set({ currentUser: null, isAuthenticated: false });
        }
      },

      hasUserGroup: (group) => {
        const { currentUser } = get();
        if (!currentUser) return false;
        
        return currentUser.userGroups?.includes(group) || false;
      }
    }),
    {
      name: 'public-auth-store',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      })
    }
  )
);
