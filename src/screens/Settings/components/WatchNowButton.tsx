import {Image, StyleSheet, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import {useTheme} from '@contexts/theme-context';
import themeColors from '@constants/themeColors';
import {ThemeColorSet} from '@types/theme-colors';

const WatchNowButton = () => {
  const {isDarkMode} = useTheme();
  const colors = themeColors[isDarkMode ? 'dark' : 'light'];
  const styles = createStyles(colors);
  return (
    <TouchableOpacity style={styles.container}>
      <Image source={require('../assets/PlayIcon.png')} style={styles.icon} />
      <Text style={styles.text}>DataReach App Tour</Text>
    </TouchableOpacity>
  );
};

export default WatchNowButton;

const createStyles = (colors: ThemeColorSet) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.cardBackground,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 16,
      paddingHorizontal: 50,
      borderRadius: 12,
    },
    icon: {
      width: 20,
      height: 20,
    },
    text: {
      color: 'white',
      fontWeight: '700',
      fontSize: 16,
    },
  });
