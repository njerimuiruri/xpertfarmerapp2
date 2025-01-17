import React, {useCallback, useEffect, useRef} from 'react';
import {View, Animated} from 'react-native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {HomeScreen} from '../screens';
import {useDrawerStatus} from '@react-navigation/drawer';
import FastImage from 'react-native-fast-image';
import {COLORS} from '../constants/theme';
import {icons} from '../constants';

const Tab = createMaterialTopTabNavigator();

const TabArr = [
  {
    route: 'Livestock',
    label: 'Livestock',
    activeIcon: icons.livestock,
    inActiveIcon: icons.livestock,
    Component: HomeScreen,
  },
  {
    route: 'Crops',
    label: 'Crops',
    activeIcon: icons.crops,
    inActiveIcon: icons.crops,
    Component: HomeScreen,
  },
  {
    route: 'Reports',
    label: 'Reports',
    activeIcon: icons.analysis,
    inActiveIcon: icons.analysis,
    Component: HomeScreen,
  },
];

export default function Tabs({navigation}) {
  const drawerStatus = useDrawerStatus();
  const offsetValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  const openDrawer = useCallback(() => {
    Animated.timing(offsetValue, {
      toValue: 240,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [offsetValue]);

  const closeDrawer = useCallback(() => {
    Animated.timing(offsetValue, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [offsetValue]);

  useEffect(() => {
    drawerStatus === 'open' ? openDrawer() : closeDrawer();
  }, [drawerStatus, openDrawer, closeDrawer]);

  return (
    <View style={{backgroundColor: 'green', flex: 1}}>
      <Animated.View
        style={{
          transform: [{scale: scaleValue}, {translateX: offsetValue}],
          flex: 1,
          borderRadius: 10,
        }}>
        <Tab.Navigator
          tabBarPosition="bottom"
          screenOptions={{
            lazy: false,
            tabBarPressColor: 'transparent',
            swipeEnabled: false,
            tabBarShowLabel: true,
            tabBarIndicatorStyle: {
              position: 'absolute',
              top: 0,
              height: 5,
              left: 20,
              width: 80,
              backgroundColor: COLORS.green,
              borderBottomRightRadius: 3,
              borderBottomLeftRadius: 3,
            },
            tabBarLabelStyle: {
              fontWeight: '800',
              fontFamily: 'serif',
              fontSize: 12,
              position: 'relative',
              top: 6,
              left: 3,
              textTransform: 'capitalize',
            },
            tabBarStyle: {
              height: 67,
              borderTopWidth: 1,
              borderColor: '#E6E7E8',
              backgroundColor: 'white',
            },
            tabBarActiveTintColor: COLORS.green,
            tabBarInactiveTintColor: 'black',
          }}>
          {TabArr.map((tab, index) => {
            const {route, Component, activeIcon} = tab;
            return (
              <Tab.Screen
                key={index}
                name={route}
                options={{
                  tabBarIcon: ({focused}) => (
                    <FastImage
                      source={activeIcon}
                      style={{
                        width: 38,
                        height: 38,
                      }}
                      resizeMode="contain"
                      tintColor={focused ? COLORS.green : 'gray'}
                    />
                  ),
                }}>
                {props => <Component {...props} navigation={navigation} />}
              </Tab.Screen>
            );
          })}
        </Tab.Navigator>
      </Animated.View>
    </View>
  );
}
