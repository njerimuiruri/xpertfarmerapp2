import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import FastImage from 'react-native-fast-image';
import SecondaryHeader from '../../components/headers/secondary-header';
import {icons} from '../../constants';
import {COLORS} from '../../constants/theme';

const EmployeeScreen = ({navigation}) => {
  return (
    <View style={{flex: 1, backgroundColor: COLORS.light}}>
      <SecondaryHeader title="Employees" />

      <View style={styles.contentContainer}>
        <FastImage
          source={require('../../assets/images/farmerandcow.png')}
          style={styles.image}
          resizeMode={FastImage.resizeMode.cover}
        />
        <Text style={styles.mainText}>You’re all set up</Text>
        <Text style={styles.subText}>
          You’ve not set your employee’s details yet
        </Text>
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddEmployeeScreen')}>
        <FastImage
          source={icons.plus}
          style={styles.fabIcon}
          tintColor="#fff"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    backgroundColor: COLORS.light,
    borderRadius: 10,
    padding: 20,
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: 250,
    height: 250,
  },
  mainText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkGray3,
    marginTop: 15,
  },
  subText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 5,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.green,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  fabIcon: {
    width: 24,
    height: 24,
  },
});

export default EmployeeScreen;
