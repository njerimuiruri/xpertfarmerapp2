import React, { createContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext({
  user: null,
  login: async () => { },
  logout: () => { },
  loading: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // User state
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user'); // Retrieve user from AsyncStorage
        if (storedUser) {
          setUser(JSON.parse(storedUser)); // Set the user if found in storage
        }
      } catch (error) {
        console.error('Failed to load user from storage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, _password) => {
    try {
      const mockUser = { id: '1', name: 'John Doe', email };
      await AsyncStorage.setItem('user', JSON.stringify(mockUser)); 
      setUser(mockUser); // Update user state
    } catch (error) {
      Alert.alert('Login failed', 'Invalid email or password');
      console.error('Login error:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user'); // Remove user from AsyncStorage
      setUser(null); // Clear user state
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
