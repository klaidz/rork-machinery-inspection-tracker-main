import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types';

// Define what data the Context provides
interface AuthContextType {
  user: User | null; // Keep 'user' for backwards compatibility if needed
  currentUser: User | null; // Preferred name
  login: (email: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  // New Helper
  isManagerOrAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock Users for Testing
const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Klaidas Admin', email: 'admin@rork.com', role: 'admin', payrollNumber: 'AD001' },
  { id: 'u2', name: 'John Driver', email: 'driver@rork.com', role: 'driver', payrollNumber: 'DR005' },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_USERS[0]); // Default to Admin for testing
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string) => {
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      const foundUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (foundUser) {
        setCurrentUser(foundUser);
      } else {
        alert('User not found (Try: admin@rork.com)');
      }
      setIsLoading(false);
    }, 1000);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Calculate role helper
  const isManagerOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  return (
    <AuthContext.Provider value={{
      user: currentUser, // Alias
      currentUser,
      login,
      logout,
      isLoading,
      isManagerOrAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}