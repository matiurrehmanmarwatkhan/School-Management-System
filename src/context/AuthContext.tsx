import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '../types';
import { storageService } from '../services/storageService';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole | null;
  login: (email: string, role?: UserRole) => boolean;
  demoLogin: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  isParent: boolean;
  isStudent: boolean;
  isAccountant: boolean;
  updateCurrentUserProfile: (data: Partial<User>) => void;
}

const AUTH_USER_KEY = 'edumanage_auth_user_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    storageService.initializeIfEmpty();
    const saved = localStorage.getItem(AUTH_USER_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default to admin on first run for pleasant exploration
    const users = storageService.getUsers();
    return users.find((u) => u.role === 'admin') || null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  }, [currentUser]);

  const demoLogin = (role: UserRole) => {
    const users = storageService.getUsers();
    const target = users.find((u) => u.role === role);
    if (target) {
      setCurrentUser(target);
    }
  };

  const login = (email: string, preferredRole?: UserRole): boolean => {
    const users = storageService.getUsers();
    const target = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (target) {
      setCurrentUser(target);
      return true;
    }
    if (preferredRole) {
      demoLogin(preferredRole);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateCurrentUserProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    const users = storageService.getUsers().map((u) => (u.id === currentUser.id ? updated : u));
    storageService.saveUsers(users);
  };

  const role = currentUser?.role || null;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        login,
        demoLogin,
        logout,
        isAuthenticated: !!currentUser,
        isAdmin: role === 'admin',
        isTeacher: role === 'teacher',
        isParent: role === 'parent',
        isStudent: role === 'student',
        isAccountant: role === 'accountant',
        updateCurrentUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
