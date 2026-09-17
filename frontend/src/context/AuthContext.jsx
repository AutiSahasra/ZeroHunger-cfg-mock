import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPersona, setCurrentPersona] = useState(null); 
  const [loading, setLoading] = useState(true);
  
  // Temporary for compatibility with existing mock UI
  const [selectedCity, setSelectedCity] = useState('chennai');

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/me`, {
          withCredentials: true,
        });
        setCurrentUser(res.data);
        setCurrentPersona(res.data.role);
      } catch (error) {
        setCurrentUser(null);
        setCurrentPersona(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/login`,
      { email, password },
      { withCredentials: true }
    );
    setCurrentUser(res.data);
    setCurrentPersona(res.data.role);
    return res.data;
  };

  const register = async (userData) => {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/register`,
      userData,
      { withCredentials: true }
    );
    setCurrentUser(res.data);
    setCurrentPersona(res.data.role);
    return res.data;
  };

  const logout = async () => {
    await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/logout`, {}, { withCredentials: true });
    setCurrentUser(null);
    setCurrentPersona(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentPersona,
        loading,
        login,
        register,
        logout,
        // Compatibility
        selectedCity,
        setSelectedCity,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
