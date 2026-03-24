import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    if (username === 'admin' && password === 'admin') {
      const userData = { username, isAdmin: true, name: 'Admin' };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    }
    if (username === 'user' && password === 'user') {
      const userData = { username, isAdmin: false, name: 'User' };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    }
    return null;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = { user, loading, isAuthenticated: !!user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);