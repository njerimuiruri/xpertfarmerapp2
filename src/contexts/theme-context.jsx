import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

// Define ThemeContext with its default value
const ThemeContext = createContext(undefined);

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Load theme preference from AsyncStorage
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('theme'); // Retrieve theme preference
        if (storedTheme) {
          setIsDarkMode(storedTheme === 'dark'); // Set theme based on stored value
        } else {
          setIsDarkMode(systemColorScheme === 'dark'); // Default to system setting if no preference
        }
      } catch (error) {
        console.error('Failed to load theme from storage:', error);
        setIsDarkMode(systemColorScheme === 'dark'); // Fallback to system setting on error
      }
    };

    loadTheme();
  }, [systemColorScheme]);

  useEffect(() => {
    // Save theme preference to AsyncStorage
    const saveTheme = async () => {
      try {
        await AsyncStorage.setItem('theme', isDarkMode ? 'dark' : 'light'); // Save theme preference
      } catch (error) {
        console.error('Failed to save theme to storage:', error);
      }
    };

    saveTheme();
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode); // Toggle between light and dark mode
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
