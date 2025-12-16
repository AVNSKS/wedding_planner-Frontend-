import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        try {
          const response = await authService.getProfile();
          // Backend returns { success: true, user: {...} }
          const userData = response.user || response;
          setUser(userData);
          setRole(userData.role);
        } catch (error) {
          console.error('Auth initialization failed:', error);
          authService.logout();
          setToken(null);
          setRole(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);
      
      setToken(data.token);
      setUser(data.user);
      setRole(data.user.role);
      
      // Dispatch custom event to notify other contexts
      window.dispatchEvent(new Event('authChange'));
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    return data;
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
    setRole(null);
    
    // Dispatch custom event to notify other contexts
    window.dispatchEvent(new Event('authChange'));
  };

  const value = {
    user,
    token,
    role,
    loading,
    login,
    register,
    logout,
    // Check both state and localStorage to handle state update delays
    isAuthenticated: !!token || !!localStorage.getItem('token'),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
