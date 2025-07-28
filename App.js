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
  BusinessAnalyticsScreen,
  Otp,
  SignupScreen,
  ForgotPasswordScreen,
  OnboardingScreen,
  ResetPassword,
  EmailOtpScreen,
  ProfileScreen,
  PersonalInformation,
  AboutScreen,
  // farm
  FarmInformation,
  AddFarm,
  EditFarm,
  FarmDetailsModal,
  AddFarmDetailsScreen,

  // Employees
  AddEmployeeScreen,
  FarmEmployeeTableScreen,
  EditEmployeeScreen,
  EmployeeDetailScreen,

  // Livestock
  AddFlockDetailsScreen,
  AddLivestockScreen,
  EditLivestockScreen,
  StatusUpdateForm,
  TransferForm,
  SalesForm,
  HealthEventForm,
  AddLivestockGroupScreen,
  OptionDetailsScreen,
  OptionLivestockGroupScreen,
  AnimalDetailScreen,
  FeedingModuleScreen,
  MortalityForm,
  HealthHistoryScreen,

  // Breeding
  BreedingRecordForm,
  EditBreedingRecordScreen,
  BreedingRecordDetailScreen,
  ViewOffspringScreen,

  // Feeds
  LivestockFeedingScreen,
  AnimalFeedingProgramScreen,
  FarmFeedsScreen,
  EditFeedingRequirementScreen,
  FeedingDetailsScreen,

  //health
  AddHealthRecords,
  AddAllergiesRecords,
  EditAllergyRecord,
  AddBoostersRecords,
  AddDewormingRecords,
  AddGeneticsDisorderRecords,
  VaccineRecordsScreen,
  VaccineEditScreen,
  DewormingRecordsScreen,
  DewormingEditScreen,
  TreatmentDetailScreen,
  CurativeTreatmentRecordsScreen,
  CurativeTreatmentEditScreen,
  GeneticDisorderRecordsScreen,
  GeneticDisorderEditScreen,
  AddVaccineRecords,
  AddCurativeTreatmentRecords,
  FarmHealthRecords,
  AllergiesRecordsScreen,
  VaccineDetailScreen,
  BoostersRecordScreen,
  AllergyDetailScreen,
  BoosterDetailScreen,
  DewormingDetailScreen,
  GeneticDisorderDetailScreen,
  //Production
  AddDairyDetailsScreen,
  AddBeefDetailsScreen,
  BeefCattleDetailsScreen,
  SwineRecordScreen,
  AddSheepGoatDetailsScreen,
  SheepGoatDetailsScreen,
  PoultryFlockDetailsScreen,
  PoultryDetailsScreen,
  BeefCattleProductionListing,
  SwineProductionListScreen,
  SwineDetailsScreen,
  DairyProductionListScreen,
  DairyDetailsScreen,
  SheepAndGoatProductionListScreen,
  PoultryProductionListScreen,
  ProductionModuleLandingScreen,
  HealthRecordsScreen,
  LivestockModuleScreen,
  BreedingModuleLandingScreen,
  RecordBirthScreen,
  //home

  // inventory
  InventoryDashboard,
  AddInventory,
  AddMachinery,
  InventoryDetails,
  AddGoodsInStock,
  AddUtilityDetails,
  EditMachinery,
  EditInventoryItem,
  EditUtility,
  VerifyOtp,
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
                name="VerifyOtp"
                component={VerifyOtp}
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
                name="BusinessAnalyticsScreen"
                component={BusinessAnalyticsScreen}
                options={{headerShown: false}}
              />

              <Stack.Screen
                name="ProfileScreen"
                component={ProfileScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="PersonalInformation"
                component={PersonalInformation}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="AboutScreen"
                component={AboutScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="FarmInformation"
                component={FarmInformation}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="AddFarm"
                component={AddFarm}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="EditFarm"
                component={EditFarm}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="FarmDetailsModal"
                component={FarmDetailsModal}
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
                name="EmployeeDetailScreen"
                component={EmployeeDetailScreen}
                options={{headerShown: false}}
              />
              {/* livestock */}
              <Stack.Screen
                name="AddFlockDetailsScreen"
                component={AddFlockDetailsScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="EditBreedingRecordScreen"
                component={EditBreedingRecordScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="LivestockModuleScreen"
                component={LivestockModuleScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="MortalityForm"
                component={MortalityForm}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="SalesForm"
                component={SalesForm}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="AnimalDetailScreen"
                component={AnimalDetailScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="RecordBirthScreen"
                component={RecordBirthScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="FeedingModuleScreen"
                component={FeedingModuleScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="FeedingDetailsScreen"
                component={FeedingDetailsScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="AddLivestockScreen"
                component={AddLivestockScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="EditLivestockScreen"
                component={EditLivestockScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="AddLivestockGroupScreen"
                component={AddLivestockGroupScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="StatusUpdateForm"
                component={StatusUpdateForm}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="TransferForm"
                component={TransferForm}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="HealthEventForm"
                component={HealthEventForm}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="HealthHistoryScreen"
                component={HealthHistoryScreen}
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
                name="BreedingRecordDetailScreen"
                component={BreedingRecordDetailScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="LivestockFeedingScreen"
                component={LivestockFeedingScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="BreedingModuleLandingScreen"
                component={BreedingModuleLandingScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="GeneticDisorderDetailScreen"
                component={GeneticDisorderDetailScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="AnimalFeedingProgramScreen"
                component={AnimalFeedingProgramScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="ViewOffspringScreen"
                component={ViewOffspringScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="FarmFeedsScreen"
                component={FarmFeedsScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="EditFeedingRequirementScreen"
                component={EditFeedingRequirementScreen}
                options={{headerShown: false}}
              />
              {/* health */}
              <Stack.Screen
                name="AddHealthRecords"
                component={AddHealthRecords}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="HealthRecordsScreen"
                component={HealthRecordsScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="AddAllergiesRecords"
                component={AddAllergiesRecords}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="AllergiesRecordsScreen"
                component={AllergiesRecordsScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="EditAllergyRecord"
                component={EditAllergyRecord}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="AddBoostersRecords"
                component={AddBoostersRecords}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="AddDewormingRecords"
                component={AddDewormingRecords}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="AddGeneticsDisorderRecords"
                component={AddGeneticsDisorderRecords}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="AddCurativeTreatmentRecords"
                component={AddCurativeTreatmentRecords}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="AddVaccineRecords"
                component={AddVaccineRecords}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="VaccineEditScreen"
                component={VaccineEditScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="VaccineDetailScreen"
                component={VaccineDetailScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="DewormingRecordsScreen"
                component={DewormingRecordsScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="DewormingEditScreen"
                component={DewormingEditScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="VaccineRecordsScreen"
                component={VaccineRecordsScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="CurativeTreatmentRecordsScreen"
                component={CurativeTreatmentRecordsScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="TreatmentDetailScreen"
                component={TreatmentDetailScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="AllergyDetailScreen"
                component={AllergyDetailScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="CurativeTreatmentEditScreen"
                component={CurativeTreatmentEditScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="GeneticDisorderRecordsScreen"
                component={GeneticDisorderRecordsScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="BoosterDetailScreen"
                component={BoosterDetailScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="DewormingDetailScreen"
                component={DewormingDetailScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="GeneticDisorderEditScreen"
                component={GeneticDisorderEditScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="BoostersRecordScreen"
                component={BoostersRecordScreen}
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
              <Stack.Screen
                name="AddBeefDetailsScreen"
                component={AddBeefDetailsScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="ProductionModuleLandingScreen"
                component={ProductionModuleLandingScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="SwineRecordScreen"
                component={SwineRecordScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="AddSheepGoatDetailsScreen"
                component={AddSheepGoatDetailsScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="SheepGoatDetailsScreen"
                component={SheepGoatDetailsScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="PoultryFlockDetailsScreen"
                component={PoultryFlockDetailsScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="BeefCattleProductionListing"
                component={BeefCattleProductionListing}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="BeefCattleDetailsScreen"
                component={BeefCattleDetailsScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="SwineProductionListScreen"
                component={SwineProductionListScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="SwineDetailsScreen"
                component={SwineDetailsScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="DairyProductionListScreen"
                component={DairyProductionListScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="DairyDetailsScreen"
                component={DairyDetailsScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="SheepAndGoatProductionListScreen"
                component={SheepAndGoatProductionListScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="PoultryProductionListScreen"
                component={PoultryProductionListScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="PoultryDetailsScreen"
                component={PoultryDetailsScreen}
                options={{headerShown: false}}
              />
              {/* inventory */}
              <Stack.Screen
                name="InventoryDashboard"
                component={InventoryDashboard}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="AddInventory"
                component={AddInventory}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="EditMachinery"
                component={EditMachinery}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="EditInventoryItem"
                component={EditInventoryItem}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="EditUtility"
                component={EditUtility}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="AddMachinery"
                component={AddMachinery}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="AddGoodsInStock"
                component={AddGoodsInStock}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="AddUtilityDetails"
                component={AddUtilityDetails}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="InventoryDetails"
                component={InventoryDetails}
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
