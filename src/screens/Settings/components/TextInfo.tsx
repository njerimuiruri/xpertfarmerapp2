import {StyleSheet, useWindowDimensions} from 'react-native';
import React from 'react';
import {MovieType} from '../data/data';
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {useTheme} from '@contexts/theme-context';
import themeColors from '@constants/themeColors';
import {ThemeColorSet} from '@types/theme-colors';

type Props = {
  item: MovieType;
  index: number;
  x: SharedValue<number>;
};

const TextInfo = ({item, index, x}: Props) => {
  const {width} = useWindowDimensions();
  const {isDarkMode} = useTheme();
  const colors = themeColors[isDarkMode ? 'dark' : 'light'];
  const styles = createStyles(colors);
  const animatedStyle = useAnimatedStyle(() => {
    const opacityAnim = interpolate(
      x.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [-2, 1, -2],
      Extrapolation.CLAMP,
    );
    return {
      opacity: opacityAnim,
    };
  });

  return (
    <Animated.Text style={[styles.text, animatedStyle]}>
      {item.title}
    </Animated.Text>
  );
};

export default TextInfo;

const createStyles = (colors: ThemeColorSet) =>
  StyleSheet.create({
    text: {
      color: colors.textPrimary,
      fontWeight: '700',
      fontSize: 16,
      textAlign: 'center',
      marginVertical: 16,
    },
  });
