
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AuthService from '../services/auth';

interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
  projectIds: number[];
  projectNames: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  signup: (fullName: string, email: string, phone: string, location: string, password: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = AuthService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
      console.log('User loaded from localStorage:', storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    console.log('Login attempt for:', email);
    const response = await AuthService.signin(email, password);
    const { token, id, email: userEmail, fullName, role, projectIds, projectNames } = response.data;
    
    console.log('Login successful, storing token and user data');
    localStorage.setItem('jwtToken', token);
    const userData = { id, email: userEmail, fullName, role, projectIds, projectNames };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    console.log('Logging out user');
    AuthService.logout();
    setUser(null);
  };

  const signup = async (fullName: string, email: string, phone: string, location: string, password: string) => {
    const response = await AuthService.signup(fullName, email, phone, location, password);
    return response.data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup }}>
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
