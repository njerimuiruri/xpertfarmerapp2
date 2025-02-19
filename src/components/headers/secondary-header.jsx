import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import { icons } from '../../constants';
import { COLORS } from '../../constants/theme';
const SecondaryHeader = ({ title }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.header} className="px-2 py-5">
      <View style={styles.leftSection} className="relative top-4">
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}>
          <FastImage
            style={styles.icon}
            tintColor="white"
            source={icons.backarrow}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      <View style={styles.rightSection} className="relative top-4 mr-2">
        <TouchableOpacity>
          <FastImage
            style={styles.icon}
            tintColor="white"
            source={icons.settings}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.green2,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.white,
  },
  icon: {
    width: 25,
    height: 25,
  },
});

export default SecondaryHeader;