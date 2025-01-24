import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NativeBaseProvider, StatusBar} from 'native-base';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Splash from './src/screens/SplashScreen/index';
import {ToastProvider} from 'react-native-toast-notifications';
// import DrawerNav from "./src/navigation/drawer/drawer1/DrawerNav1";

const Stack = createNativeStackNavigator();

import {
  LoginScreen,
  HomeScreen,
  Otp,
  SignupScreen,
  ForgotPasswordScreen,
  OnboardingScreen,
  ResetPassword,
  EmailOtpScreen,
  FarmRecord,
  ProfileScreen,
  AddFarmDetailsScreen,
  AddEmployeeScreen,
  FarmEmployeeTableScreen,
  EditEmployeeScreen,
  AddFlockDetailsScreen,
  AddLivestockScreen,
  AddLivestockGroupScreen,
  OptionDetailsScreen,
  OptionLivestockGroupScreen,
  BreedingRecordForm,
  LivestockFeedingScreen,
  AnimalFeedingProgramScreen,
  FarmFeedsScreen,
  AddDairyDetailsScreen,

  //health
  AddHealthRecords,
  Allergiesrecordsscreen,
  AllergyBoosterScreen,
  DewormingDetailsRecords,
  Geneticdisorderscreen,
  VaccineDetailsScreen,

  //home
  FarmDashboard,
  FarmHealthRecords,
} from './src/screens/index';
import DrawerNav from './src/navigation/drawer/DrawerNav1';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  const [signInNeeded, setSignInNeeded] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {
        await Promise.all([]);

        const FirstLaunch = await AsyncStorage.getItem('isFirstLaunch');
        if (FirstLaunch === null) {
          setIsFirstLaunch(true);
          await AsyncStorage.setItem('isFirstLaunch', 'false');
        }

        setTimeout(() => {
          setIsLoading(false);
        }, 4000);
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();
  }, []);

  if (isLoading) {
    return <Splash />;
  }

  return (
    <>
      <NativeBaseProvider>
        <ToastProvider>
          <StatusBar
            translucent
            backgroundColor={'transparent'}
            animated={true}
            barStyle={'light-content'}
          />
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
              }}>
              {!isFirstLaunch ? (
                <Stack.Screen
                  name="onBoardingScreen"
                  component={OnboardingScreen}
                  options={{headerShown: false}}
                />
              ) : signInNeeded ? (
                <Stack.Screen
                  name="SignInScreen2"
                  component={LoginScreen}
                  options={{headerShown: false}}
                />
              ) : null}
              <Stack.Screen
                name="DrawerNav"
                component={DrawerNav}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="SignInScreen"
                component={LoginScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="SignupScreen"
                component={SignupScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="ForgotPasswordScreen"
                component={ForgotPasswordScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="OtpSreen"
                component={Otp}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="ResetPasswordScreen"
                component={ResetPassword}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="EmailOtpScreen"
                component={EmailOtpScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="HomeScreen"
                component={HomeScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="FarmDashboard"
                component={FarmDashboard}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="ProfileScreen"
                component={ProfileScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="FarmRecord"
                component={FarmRecord}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="AddFarmDetailsScreen"
                component={AddFarmDetailsScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="AddEmployeeScreen"
                component={AddEmployeeScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="FarmEmployeeTableScreen"
                component={FarmEmployeeTableScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="EditEmployeeScreen"
                component={EditEmployeeScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="AddFlockDetailsScreen"
                component={AddFlockDetailsScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="AddLivestockScreen"
                component={AddLivestockScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="AddLivestockGroupScreen"
                component={AddLivestockGroupScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="OptionDetailsScreen"
                component={OptionDetailsScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="OptionLivestockGroupScreen"
                component={OptionLivestockGroupScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="BreedingRecordForm"
                component={BreedingRecordForm}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="LivestockFeedingScreen"
                component={LivestockFeedingScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="AnimalFeedingProgramScreen"
                component={AnimalFeedingProgramScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="FarmFeedsScreen"
                component={FarmFeedsScreen}
                options={{headerShown: false}}
              />

              {/* health */}
              <Stack.Screen
                name="AddHealthRecords"
                component={AddHealthRecords}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="Allergiesrecordsscreen"
                component={Allergiesrecordsscreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="AllergyBoosterScreen"
                component={AllergyBoosterScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="DewormingDetailsRecords"
                component={DewormingDetailsRecords}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="Geneticdisorderscreen"
                component={Geneticdisorderscreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="VaccineDetailsScreen"
                component={VaccineDetailsScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="FarmHealthRecords"
                component={FarmHealthRecords}
                options={{headerShown: false}}
              />

              <Stack.Screen
                name="AddDairyDetailsScreen"
                component={AddDairyDetailsScreen}
                options={{headerShown: false}}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </ToastProvider>
      </NativeBaseProvider>
      <Toast />
    </>
  );
}
