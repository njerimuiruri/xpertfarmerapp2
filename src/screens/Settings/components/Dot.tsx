import {StyleSheet, View} from 'react-native';
import React from 'react';
import {useTheme} from '@contexts/theme-context';
import themeColors from '@constants/themeColors';
import {ThemeColorSet} from '@types/theme-colors';

type Props = {
  index: number;
  paginationIndex: number;
};

const Dot = ({index, paginationIndex}: Props) => {
  const {isDarkMode} = useTheme();
  const colors = themeColors[isDarkMode ? 'dark' : 'light'];
  const styles = createStyles(colors);
  return (
    <View style={paginationIndex === index ? styles.dot : styles.dotOpacity} />
  );
};

export default Dot;

const createStyles = (colors: ThemeColorSet) =>
  StyleSheet.create({
    dot: {
      backgroundColor: colors.textPrimary,
      height: 8,
      width: 8,
      marginHorizontal: 2,
      borderRadius: 8,
    },
    dotOpacity: {
      backgroundColor: colors.textPrimary,
      height: 7,
      width: 7,
      marginHorizontal: 2,
      borderRadius: 8,
      opacity: 0.5,
    },
  });
