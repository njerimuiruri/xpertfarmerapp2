import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import FastImage from 'react-native-fast-image';
import {COLORS} from '../../constants/theme';
import {icons} from '../../constants';

const Header = ({navigation, title = "XpertFarmer"}) => {
  return (
    <View
      style={{
        backgroundColor: COLORS.green2,
      }}>
      <View className="mt-8 mx-4 py-2 flex flex-row justify-between items-center">
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
          {title}
        </Text>
        <View className="flex flex-row space-x-6">
        <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')}>
        <FastImage className="w-[10px] h-[10px]" source={icons.avatar} style={styles.avatar} />
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 40,
  },
});

export default Header;