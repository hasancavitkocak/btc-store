import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient, AuthToken } from '@/lib/api';
import { setCookie, deleteCookie } from '@/lib/cookies';

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
            
            // Save tokens to cookies
            setCookie('accessToken', authData.accessToken, 7);
            setCookie('refreshToken', authData.refreshToken, 30);
            
            // Save user data to store
            const currentUser: CurrentUser = {
              username: authData.username,
              firstName: authData.firstName,
              lastName: authData.lastName,
              language: authData.language,
              picture: authData.picture,
              userGroups: authData.userGroups,
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
      },

      setCurrentUser: (user) => {
        set({ currentUser: user, isAuthenticated: !!user });
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
