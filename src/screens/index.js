import LoginScreen from './Auth/login-screen';
import SignupScreen from './Auth/signup';
import ForgotPasswordScreen from './Auth/forgot-password';
import Otp from '../screens/Auth/otp';
import ResetPassword from '../screens/Auth/reset-password';
import EmailOtpScreen from '../screens/Auth/Email-Otp-Screen';

import HomeScreen from './Home/home';

import FarmRecord from './Home/Farm-records';
import ProfileScreen from './Home/profile-screen';
import AddFarmDetailsScreen from './farm/AddFarm-details';

import OnboardingScreen from './Onboarding/OnboardingScreen';
import FarmEmployeeTableScreen from './employee/FarmEmployeeTableScreen';
import EditEmployeeScreen from './employee/EditEmployeeScreen';

import EmployeeScreen from './employee/EmployeeScreen';
import AddEmployeeScreen from './employee/AddEmployeeScreen';
import AddFlockDetailsScreen from './livestock/AddFlockDetails';
import AddLivestockScreen from './livestock/AddLivestockDetails';
import AddLivestockGroupScreen from './livestock/AddGroupLivestock';
import OptionDetailsScreen from './livestock/optionDetails';
import OptionLivestockGroupScreen from './livestock/OptionLivestockGroup';


import BreedingModuleLandingScreen from './livestock/breeding/BreedingModuleLandingScreen';

import LivestockModuleScreen from './livestock/LivestockModuleScreen';
import AnimalDetailScreen from './livestock/AnimalDetailScreen';
import BreedingRecordForm from './livestock/breeding/BreedingRecordForm';
import LivestockFeedingScreen from './livestock/feeding/LivestockFeedingScreen';
import AnimalFeedingProgramScreen from './livestock/feeding/AnimalFeedingProgramScreen';
import FarmFeedsScreen from './livestock/feeding/FarmFeedsScreen';
import FeedingManagementScreen from './livestock/feeding/FeedingManagementScreen';
import EditFeedingRequirementScreen from './livestock/feeding/EditFeedingRequirementScreen';

import FeedingModuleScreen from './livestock/feeding/FeedingModuleScreen';



// Health
import AddHealthRecords from './health/AddHealthRecords';
import Allergiesrecordsscreen from './health/Allergiesrecordsscreen';
import AllergyBoosterScreen from './health/AllergyBoosterScreen';
import DewormingDetailsRecords from './health/DewormingDetailsRecords';
import Geneticdisorderscreen from './health/geneticdisorderscreen';
import VaccineDetailsScreen from './health/VaccineDetailsScreen';
import FarmHealthRecords from './health/health-record/record';
import HealthRecordsScreen from './health/HealthRecordsScreen';
import CurativeTreatmentScreen from './health/CurativeTreatmentScreen';


// Home DashboardScreen
import FarmDashboard from './Home/dashboard';

//productionsScreen
import AddDairyDetailsScreen from './production/AddDairyDetailsScreen';
import BeefDetailsScreen from './production/BeefDetailsScreen';
import ProductionScreen from './production/ProductionScreen';
import SwineRecordScreen from './production/SwineRecordScreen';
import SheepGoatDetailsScreen from './production/SheepGoatDetailsScreen';
import PoultryFlockDetailsScreen from './production/PoultryFlockDetailsScreen';
import AnimalProductionListScreen from './production/AnimalProductionListScreen';
import SwineProductionListScreen from './production/SwineProductionListScreen ';
import DairyProductionListScreen from './production/DairyProductionListScreen';
import SheepAndGoatProductionListScreen from './production/SheepAndGoatProductionListScreen';
import PoultryProductionListScreen from './production/PoultryFlockDetailsScreen';
import LivestockRecordsScreen from './livestock/LivestockRecordsScreen';

// inventory
import InventoryDashboard from './inventory/InventoryDashboard';
import AddMachinery from './inventory/AddMachinery';
import AddGoodsInStock from './inventory/AddGoodsInStock';
import AddUtilityDetails from './inventory/AddUtilityDetails';


export {
  LoginScreen,
  SignupScreen,
  ForgotPasswordScreen,
  HomeScreen,
  Otp,
  OnboardingScreen,
  ResetPassword,
  EmailOtpScreen,
  ProfileScreen,
  // Farm Records
  FarmRecord,
  AddFarmDetailsScreen,

  // Employees
  AddEmployeeScreen,
  EmployeeScreen,
  FarmEmployeeTableScreen,
  EditEmployeeScreen,

  // Livestock
  AddFlockDetailsScreen,
  AddLivestockScreen,
  AddLivestockGroupScreen,
  OptionDetailsScreen,
  OptionLivestockGroupScreen,
  LivestockModuleScreen,
  AnimalDetailScreen,
  FeedingModuleScreen,
  BreedingModuleLandingScreen,

  // Breeding
  BreedingRecordForm,
  // Feeding
  LivestockFeedingScreen,
  FarmFeedsScreen,
  AnimalFeedingProgramScreen,
  BeefDetailsScreen,
  FeedingManagementScreen,
  EditFeedingRequirementScreen,

  //health
  AddHealthRecords,
  Allergiesrecordsscreen,
  AllergyBoosterScreen,
  DewormingDetailsRecords,
  Geneticdisorderscreen,
  VaccineDetailsScreen,
  FarmHealthRecords,
  ProductionScreen,
  AddDairyDetailsScreen,
  CurativeTreatmentScreen,

  //home
  
  FarmDashboard,

//productionsrecord
  SwineRecordScreen,
  SheepGoatDetailsScreen,
  PoultryFlockDetailsScreen,
  AnimalProductionListScreen,
  SwineProductionListScreen,
  DairyProductionListScreen,
  SheepAndGoatProductionListScreen,
  PoultryProductionListScreen,
  HealthRecordsScreen,
  LivestockRecordsScreen,
  
  //inventory
  InventoryDashboard,
  AddMachinery,
  AddGoodsInStock,
  AddUtilityDetails,
};
