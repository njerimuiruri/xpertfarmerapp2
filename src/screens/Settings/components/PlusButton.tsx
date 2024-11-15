import {StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import CustomIcon from '@components/CustomIcon';
import {useTheme} from '@contexts/theme-context';
import themeColors from '@constants/themeColors';
import {ThemeColorSet} from '@types/theme-colors';

const PlusButton = () => {
  const {isDarkMode} = useTheme();
  const colors = themeColors[isDarkMode ? 'dark' : 'light'];
  const styles = createStyles(colors);
  return (
    <TouchableOpacity style={styles.container}>
      <CustomIcon library="Octicons" name="bell" size={23} color="white" />
    </TouchableOpacity>
  );
};

export default PlusButton;

const createStyles = (colors: ThemeColorSet) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.cardBackground,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 16,
      borderRadius: 12,
    },
    icon: {
      width: 20,
      height: 20,
    },
    text: {
      color: 'white',
      fontWeight: '700',
      fontSize: 18,
    },
  });
