
import { StatusBar } from 'native-base';
import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';

const windowHeight = Dimensions.get('window').height;

export default function SplashScreen() {


  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor={"transparent"}
        animated={true}
        barStyle={"light-content"}
      />
      <Image
        source={require('../../assets/images/xpertLogo2.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.copyright}>
        &copy; {new Date().getFullYear()} XpertFarmer
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8cd18c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '60%',
    height: '30%',
  },
  copyright: {
    position: 'absolute',
    bottom: windowHeight * 0.03,
    textAlign: 'center',
    color: 'black',
    fontSize: 14,
    left: '35%',
    fontFamily: 'CustomFont',
  },
});


