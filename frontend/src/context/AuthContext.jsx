import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUsers, initStorage } from '../services/storageService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [currentPersona, setCurrentPersona] = useState('DONOR'); // 'DONOR', 'VOLUNTEER', 'ADMIN'
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedCity, setSelectedCity] = useState('chennai');

  useEffect(() => {
    initStorage();
    const storedUsers = getUsers();
    setUsers(storedUsers);
    
    // Default to first donor
    const defaultDonor = storedUsers.find(u => u.role === 'DONOR');
    setCurrentUser(defaultDonor || storedUsers[0]);
  }, []);

  const switchPersona = (role) => {
    setCurrentPersona(role);
    const storedUsers = getUsers();
    const match = storedUsers.find(u => u.role === role);
    if (match) {
      setCurrentUser(match);
    }
  };

  const switchUser = (userId) => {
    const storedUsers = getUsers();
    const found = storedUsers.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      setCurrentPersona(found.role);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        users,
        currentUser,
        currentPersona,
        selectedCity,
        setSelectedCity,
        switchPersona,
        switchUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
