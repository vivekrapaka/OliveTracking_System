
import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthService from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = AuthService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await AuthService.signin(email, password);
    console.log("Login response:", response);
    
    const { 
      token, 
      id, 
      email: userEmail, 
      fullName, 
      roleTitle, 
      functionalGroup, 
      projectIds, 
      projectNames 
    } = response.data;
    
    localStorage.setItem('jwtToken', token);
    console.log("Stored JWT token:", token);
    
    // CRITICAL: Store functionalGroup as the key for all permission-based logic
    const userData = { 
      id, 
      email: userEmail, 
      fullName, 
      roleTitle, // Display title (e.g., "SDEII") - for display purposes only
      functionalGroup, // Permission group (e.g., "DEVELOPER") - THIS IS THE KEY
      role: roleTitle, // Keep for backward compatibility
      projectIds: projectIds || [], 
      projectNames: projectNames || []
    };
    
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const signup = async (fullName, email, password, phone, location) => {
    const response = await AuthService.signup(fullName, email, password, phone, location);
    return response.data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
