import {StyleSheet, View, useWindowDimensions} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '@contexts/theme-context';

const Gradient = () => {
  const {isDarkMode} = useTheme();
  const {width} = useWindowDimensions();

  const gradientColors = isDarkMode
    ? ['rgba(15,16,20,0)', 'rgba(15,16,20,1)']
    : ['rgba(248,248,248,0)', 'rgba(248,248,248,1)'];

  const gradientColorsReverse = isDarkMode
    ? ['rgba(15,16,20,1)', 'rgba(15,16,20,0)']
    : ['rgba(248,248,248,1)', 'rgba(248,248,248,0)'];

  return (
    <View style={[styles.container, {width: width, height: width}]}>
      <LinearGradient colors={gradientColors} style={styles.gradientBottom} />
      <LinearGradient
        colors={gradientColorsReverse}
        style={styles.gradientTop}
      />
    </View>
  );
};

export default Gradient;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 180,
  },
  gradientTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 180,
  },
});
