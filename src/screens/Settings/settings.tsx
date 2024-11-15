import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import {useTheme} from '@contexts/theme-context';
import CarouselDisneyScreen from './CarouselDisneyScreen';
import themeColors from '@constants/themeColors';
import CustomIcon from '@components/CustomIcon';
import {HStack} from 'native-base';
import {ThemeColorSet} from '@types/theme-colors';

export default function SettingsScreen() {
  const {isDarkMode} = useTheme();
  const colors = themeColors[isDarkMode ? 'dark' : 'light'];
  const styles = createStyles(colors);
  return (
    <View style={styles.container}>
      <CarouselDisneyScreen />
      <View className="mx-6 mt-4">
        <Text className=" text-2xl font-bold" style={styles.title}>
          My Services
        </Text>

        <HStack className="flex-row justify-between mt-4">
          <TouchableOpacity
            className="flex items-center gap-1"
            style={styles.button}>
            <CustomIcon
              library="Fontisto"
              name="player-settings"
              size={30}
              color={colors.textPrimary}
            />
            <Text style={styles.text}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex items-center gap-1"
            style={styles.button}>
            <CustomIcon
              library="FontAwesome5"
              name="map-marker-alt"
              size={30}
              color={colors.textPrimary}
            />
            <Text style={styles.text}>Maps</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex items-center gap-1"
            style={styles.button}>
            <CustomIcon
              library="Entypo"
              name="language"
              size={30}
              color={colors.textPrimary}
            />
            <Text style={styles.text}>Language</Text>
          </TouchableOpacity>
        </HStack>
      </View>
    </View>
  );
}
const createStyles = (colors: ThemeColorSet) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    text: {
      fontFamily: 'Poppins-SemiBold',
      fontSize: 16,
      color: colors.textPrimary,
    },
    title: {
      fontFamily: 'Poppins-Bold',
      fontSize: 24,
      color: colors.textPrimary,
    },
    button: {
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.cardBackground,
      padding: 16,
      borderRadius: 16,
      width: '31%',
    },
  });
