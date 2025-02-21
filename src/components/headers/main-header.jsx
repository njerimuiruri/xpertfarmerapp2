import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import FastImage from 'react-native-fast-image';
import {COLORS} from '../../constants/theme';
import {icons} from '../../constants';

const Header = ({navigation}) => {
  return (
    <View
      style={{
        backgroundColor: COLORS.green2,
      }}>
      <View className="mt-5 mx-4 py-2 flex flex-row justify-between items-center">
        <View className="flex flex-row space-x-3 items-center">
          <TouchableOpacity
            className=" p-[5px] rounded-md"
            onPress={() => navigation.openDrawer()}>
            <FastImage
              source={require('../../assets/icons/hamburger.png')}
              className="w-[30px] h-[25px] p-3"
              resizeMode="contain"
              tintColor="white"
            />
          </TouchableOpacity>
        </View>
        <Text
          className="text-white gray-900 text-[20px] font-bold text-center"
          style={styles.customFont}>
          XpertFarmer
        </Text>
        <View className="flex flex-row space-x-6">
          <TouchableOpacity>
            <FastImage
              className="w-[25px] h-[25px]"
              tintColor="white"
              source={icons.settings}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  customFont: {
    fontFamily: 'serif',
  },
  customColor: {
    color: '#e52e04',
  },
});
export default Header;
