import React from 'react';
import {TouchableOpacity} from 'react-native';
import {useTheme} from '@contexts/theme-context';
import CustomIcon from './CustomIcon';
const ThemeToggleButton = () => {
  const {isDarkMode, toggleTheme} = useTheme();

  return (
    <TouchableOpacity onPress={toggleTheme}>
      {isDarkMode ? (
        <CustomIcon
          library="Fontisto"
          name="day-sunny"
          size={24}
          color="#FFFFFF"
        />
      ) : (
        <CustomIcon library="Octicons" name="moon" size={24} color="#000000" />
      )}
    </TouchableOpacity>
  );
};

export default ThemeToggleButton;
