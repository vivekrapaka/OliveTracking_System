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
    console.log("resppp",response)
    const { accessToken, id, email: userEmail, fullName, role, projectIds, projectNames } = response.data; // Extract new fields
    localStorage.setItem('jwtToken', accessToken);
    console.log("in authcontextt",accessToken)
    const userData = { id, email: userEmail, fullName, role, projectIds, projectNames }; // Store new fields
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const signup = async (fullName, email, password,phone,location) => {
    const response = await AuthService.signup(fullName, email, password,phone,location);
    return response.data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


