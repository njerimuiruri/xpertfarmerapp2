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

import EditBreedingRecordScreen from './livestock/breeding/EditBreedingRecordScreen';

import RecordBirthScreen from './livestock/breeding/RecordBirthScreen';

import LivestockModuleScreen from './livestock/LivestockModuleScreen';
import AnimalDetailScreen from './livestock/AnimalDetailScreen';
import BreedingRecordForm from './livestock/breeding/BreedingRecordForm';
import LivestockFeedingScreen from './livestock/feeding/LivestockFeedingScreen';
import AnimalFeedingProgramScreen from './livestock/feeding/AnimalFeedingProgramScreen';
import FarmFeedsScreen from './livestock/feeding/FarmFeedsScreen';
import EditFeedingRequirementScreen from './livestock/feeding/EditFeedingRequirementScreen';

import FeedingModuleScreen from './livestock/feeding/FeedingModuleScreen';



// Health
import AddHealthRecords from './health/AddHealthRecords';

// vaccination
import VaccineRecordsScreen from './health/Vaccination/VaccineRecordsScreen';
import VaccineEditScreen from './health/Vaccination/VaccineEditScreen';
import AddVaccineRecords from './health/Vaccination/AddVaccineRecords';
//deworming
import AddDewormingRecords from './health/Deworming/AddDewormingRecords';
import DewormingRecordsScreen from './health/Deworming/DewormingRecordsScreen';
import DewormingEditScreen from './health/Deworming/DewormingEditScreen';
//treatment
import CurativeTreatmentEditScreen from './health/Treatment/CurativeTreatmentEditScreen';
import AddCurativeTreatmentRecords from './health/Treatment/AddCurativeTreatmentRecords';
import CurativeTreatmentRecordsScreen from './health/Treatment/CurativeTreatmentRecordsScreen';
//Genetic Disorders
import AddGeneticsDisorderRecords from './health/Disorders/AddGeneticsDisorderRecords';
import GeneticDisorderRecordsScreen from './health/Disorders/GeneticDisorderRecordsScreen';
import GeneticDisorderEditScreen from './health/Disorders/GeneticDisorderEditScreen';

//Allergies
import AddAllergiesRecords from './health/Allergies/AddAllergiesRecords';

import AllergiesRecordsScreen from './health/Allergies/AllergiesRecordsScreen';


//Boosters
import AddBoostersRecords from './health/Boosters/AddBoostersRecords';

import FarmHealthRecords from './health/health-record/record';
import HealthRecordsScreen from './health/HealthRecordsScreen';
import HealthRecordsLandingScreen from './health/HealthRecordsLandingScreen';
import EditHealthRecordScreen from './health/EditHealthRecordScreen';




// Home DashboardScreen

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

// inventory
import InventoryDashboard from './inventory/InventoryDashboard';
import AddMachinery from './inventory/AddMachinery';
import AddGoodsInStock from './inventory/AddGoodsInStock';
import AddUtilityDetails from './inventory/AddUtilityDetails';



import EditMachinery from './inventory/EditMachinery';

import EditInventoryItem from './inventory/EditInventoryItem';

import EditUtility from './inventory/EditUtility';

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
  RecordBirthScreen,
  EditBreedingRecordScreen,
  // Feeding
  LivestockFeedingScreen,
  FarmFeedsScreen,
  AnimalFeedingProgramScreen,
  BeefDetailsScreen,
  EditFeedingRequirementScreen,

  //health
  AddHealthRecords,
  AddAllergiesRecords,
  AddBoostersRecords,
  AddDewormingRecords,
  AddGeneticsDisorderRecords,
  AddVaccineRecords,
  VaccineRecordsScreen,
  FarmHealthRecords,
  ProductionScreen,
  AddDairyDetailsScreen,
  AddCurativeTreatmentRecords,
  HealthRecordsLandingScreen,
  EditHealthRecordScreen,
  VaccineEditScreen,
  DewormingRecordsScreen,
  DewormingEditScreen,
  CurativeTreatmentRecordsScreen,
  CurativeTreatmentEditScreen,
  GeneticDisorderRecordsScreen,
  GeneticDisorderEditScreen,
  AllergiesRecordsScreen,


  //home
  

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
  
  //inventory
  InventoryDashboard,
  AddMachinery,
  AddGoodsInStock,
  AddUtilityDetails,
  EditMachinery,
  EditInventoryItem,
  EditUtility,
};
