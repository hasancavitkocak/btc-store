import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

interface AuthState {
  currentUser: User | null;
  users: User[];
  roles: Role[];
  isAuthenticated: boolean;
  
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addRole: (role: Omit<Role, 'id'>) => void;
  updateRole: (id: string, role: Partial<Role>) => void;
  deleteRole: (id: string) => void;
  hasPermission: (permission: Permission) => boolean;
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
  },
  {
    id: '2',
    username: 'temsilci1',
    password: 'demo123',
    email: 'temsilci1@example.com',
    roleId: '3', // Representative role
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

      login: (username, password) => {
        const user = get().users.find(
          (u) => u.username === username && u.password === password
        );
        
        if (user) {
          set({ currentUser: user, isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
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

      hasPermission: (permission) => {
        const { currentUser, roles } = get();
        if (!currentUser) return false;
        
        const userRole = roles.find((r) => r.id === currentUser.roleId);
        return userRole?.permissions.includes(permission) || false;
      }
    }),
    {
      name: 'auth-store'
    }
  )
);
