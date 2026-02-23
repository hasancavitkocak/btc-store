import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient, AuthToken } from '@/lib/api';
import { setCookie, deleteCookie, getCookie } from '@/lib/cookies';
import { decodeJwt, isTokenExpired } from '@/lib/jwt';

export type Permission = 
  | 'view_dashboard'
  | 'manage_banners'
  | 'manage_categories'
  | 'manage_products'
  | 'manage_references'
  | 'manage_stories'
  | 'manage_header'
  | 'manage_kvkk'
  | 'view_forms'
  | 'manage_users'
  | 'view_documents'
  | 'manage_documents';

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  roleId: string;
  createdAt: string;
}

export interface CurrentUser {
  username: string;
  firstName: string;
  lastName: string;
  language: string;
  picture: string;
  userGroups: string[];
}

interface AuthState {
  currentUser: CurrentUser | null;
  users: User[];
  roles: Role[];
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setCurrentUser: (user: CurrentUser | null) => void;
  initializeAuth: () => Promise<void>;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addRole: (role: Omit<Role, 'id'>) => void;
  updateRole: (id: string, role: Partial<Role>) => void;
  deleteRole: (id: string) => void;
  hasPermission: (permission: Permission) => boolean;
  hasUserGroup: (group: string) => boolean;
}

const defaultRoles: Role[] = [
  {
    id: '1',
    name: 'Admin',
    permissions: [
      'view_dashboard',
      'manage_banners',
      'manage_categories',
      'manage_products',
      'manage_references',
      'manage_stories',
      'manage_header',
      'manage_kvkk',
      'view_forms',
      'manage_users',
      'view_documents',
      'manage_documents'
    ]
  },
  {
    id: '2',
    name: 'Editor',
    permissions: [
      'view_dashboard',
      'manage_banners',
      'manage_categories',
      'manage_products',
      'manage_references',
      'manage_stories',
      'view_forms',
      'view_documents',
      'manage_documents'
    ]
  },
  {
    id: '3',
    name: 'Satış Temsilcisi',
    permissions: ['view_dashboard', 'view_documents']
  },
  {
    id: '4',
    name: 'Viewer',
    permissions: ['view_dashboard', 'view_forms']
  }
];

const defaultUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    password: '123456',
    email: 'admin@example.com',
    roleId: '1',
    createdAt: new Date().toISOString()
  }
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: defaultUsers,
      roles: defaultRoles,
      isAuthenticated: false,
      isLoading: false,

      login: async (username, password) => {
        set({ isLoading: true });
        
        try {
          const response = await apiClient.login({ username, password });
          
          if (response.status === 'SUCCESS' && response.data) {
            const authData = response.data as AuthToken;
            
            // Save tokens to cookies (admin uses accessToken/refreshToken)
            setCookie('accessToken', authData.accessToken);
            setCookie('refreshToken', authData.refreshToken);
            
            // Decode JWT to get user info
            const decoded = decodeJwt(authData.accessToken);
            if (!decoded) {
              set({ isLoading: false });
              return { 
                success: false, 
                error: 'Token decode hatası' 
              };
            }
            
            // Token'dan gelen dili cookie'ye kaydet
            if (decoded.language) {
              setCookie('NEXT_LOCALE', decoded.language);
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
        deleteCookie('accessToken');
        deleteCookie('refreshToken');
        set({ currentUser: null, isAuthenticated: false });
        
        // Sayfa yenileme ile tüm state'i temizle
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/login';
        }
      },

      setCurrentUser: (user) => {
        set({ currentUser: user, isAuthenticated: !!user });
      },

      initializeAuth: async () => {
        const accessToken = getCookie('accessToken');
        const refreshToken = getCookie('refreshToken');
        
        // Access token yok ama refresh token varsa, refresh dene
        if (!accessToken && refreshToken) {
          try {
            const response = await apiClient.refreshToken(refreshToken);
            
            if (response.status === 'SUCCESS' && response.data) {
              const authData = response.data as AuthToken;
              
              // Yeni token'ları kaydet
              setCookie('accessToken', authData.accessToken);
              setCookie('refreshToken', authData.refreshToken);
              
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
            console.error('Token refresh failed during init:', error);
          }
          
          // Refresh başarısız, logout yap
          deleteCookie('accessToken');
          deleteCookie('refreshToken');
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
                setCookie('accessToken', authData.accessToken);
                setCookie('refreshToken', authData.refreshToken);
                
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
              console.error('Token refresh failed:', error);
            }
          }
          
          // Refresh başarısız, logout yap
          deleteCookie('accessToken');
          deleteCookie('refreshToken');
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

      addUser: (userData) => {
        const newUser: User = {
          ...userData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        };
        set((state) => ({ users: [...state.users, newUser] }));
      },

      updateUser: (id, userData) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...userData } : u))
        }));
      },

      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter((u) => u.id !== id)
        }));
      },

      addRole: (roleData) => {
        const newRole: Role = {
          ...roleData,
          id: Date.now().toString()
        };
        set((state) => ({ roles: [...state.roles, newRole] }));
      },

      updateRole: (id, roleData) => {
        set((state) => ({
          roles: state.roles.map((r) => (r.id === id ? { ...r, ...roleData } : r))
        }));
      },

      deleteRole: (id) => {
        set((state) => ({
          roles: state.roles.filter((r) => r.id !== id)
        }));
      },

      hasPermission: () => {
        const { currentUser } = get();
        if (!currentUser) return false;
        
        // Backend'den gelen userGroups'a göre permission kontrolü
        // Admin grubu varsa tüm izinler var
        if (currentUser.userGroups?.includes('ADMIN')) return true;
        
        // Diğer grup bazlı kontroller buraya eklenebilir
        return false;
      },

      hasUserGroup: (group) => {
        const { currentUser } = get();
        if (!currentUser) return false;
        
        return currentUser.userGroups?.includes(group) || false;
      }
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      })
    }
  )
);
