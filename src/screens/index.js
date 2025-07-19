import LoginScreen from './Auth/login-screen';
import SignupScreen from './Auth/signup';
import ForgotPasswordScreen from './Auth/forgot-password';
import Otp from '../screens/Auth/otp';
import ResetPassword from '../screens/Auth/reset-password';
import EmailOtpScreen from '../screens/Auth/Email-Otp-Screen';

import HomeScreen from './Home/home';
// personal information
import ProfileScreen from './Home/profile-screen';
import PersonalInformation from './Home/PersonalInformation';
import AboutScreen from './Home/AboutScreen';

// Farm details
import AddFarm from './farm/AddFarm';
import EditFarm from './farm/EditFarm';
import FarmInformation from './farm/FarmInformation';
import FarmDetailsModal from './farm/FarmDetailsModal';

import OnboardingScreen from './Onboarding/OnboardingScreen';
// employees
import FarmEmployeeTableScreen from './employee/FarmEmployeeTableScreen';
import EditEmployeeScreen from './employee/EditEmployeeScreen';
import EmployeeDetailScreen from './employee/EmployeeDetailScreen';
import AddEmployeeScreen from './employee/AddEmployeeScreen';
// Flocks /Livestocks
import AddFlockDetailsScreen from './livestock/AddFlockDetails';
import AddLivestockScreen from './livestock/AddLivestockDetails';

import EditLivestockScreen from './livestock/EditLivestockScreen';

import StatusUpdateForm from './livestock/StatusUpdateForm';

import TransferForm from './livestock/TransferForm';

import MortalityForm from './livestock/MortalityForm';

import SalesForm from './livestock/SalesForm';

import HealthEventForm from './livestock/HealthEventForm';

import HealthHistoryScreen from './livestock/HealthHistoryScreen';

import AddLivestockGroupScreen from './livestock/AddGroupLivestock';
import OptionDetailsScreen from './livestock/optionDetails';
import OptionLivestockGroupScreen from './livestock/OptionLivestockGroup';

// Breeding screens
import BreedingModuleLandingScreen from './livestock/breeding/BreedingModuleLandingScreen';
import EditBreedingRecordScreen from './livestock/breeding/EditBreedingRecordScreen';
import RecordBirthScreen from './livestock/breeding/RecordBirthScreen';
import BreedingRecordDetailScreen from './livestock/breeding/BreedingRecordDetailScreen';

import ViewOffspringScreen from './livestock/breeding/ViewOffspringScreen ';

import LivestockModuleScreen from './livestock/LivestockModuleScreen';
import AnimalDetailScreen from './livestock/AnimalDetailScreen';
import BreedingRecordForm from './livestock/breeding/BreedingRecordForm';
import LivestockFeedingScreen from './livestock/feeding/LivestockFeedingScreen';
import AnimalFeedingProgramScreen from './livestock/feeding/AnimalFeedingProgramScreen';
import FarmFeedsScreen from './livestock/feeding/FarmFeedsScreen';
import EditFeedingRequirementScreen from './livestock/feeding/EditFeedingRequirementScreen';

import FeedingModuleScreen from './livestock/feeding/FeedingModuleScreen';
import FeedingDetailsScreen from './livestock/feeding/FeedingDetailsScreen';

// Health
import AddHealthRecords from './health/AddHealthRecords';

// vaccination
import VaccineRecordsScreen from './health/Vaccination/VaccineRecordsScreen';
import VaccineEditScreen from './health/Vaccination/VaccineEditScreen';
import AddVaccineRecords from './health/Vaccination/AddVaccineRecords';

import VaccineDetailScreen from './health/Vaccination/VaccineDetailScreen';

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

import EditAllergyRecord from './health/Allergies/EditAllergyRecord';

import AllergiesRecordsScreen from './health/Allergies/AllergiesRecordsScreen';

//Boosters
import AddBoostersRecords from './health/Boosters/AddBoostersRecords';

import BoostersRecordScreen from './health/Boosters/BoostersRecordScreen';

import FarmHealthRecords from './health/health-record/record';
import HealthRecordsScreen from './health/HealthRecordsScreen';

// Home DashboardScreen

//productionsScreen
import ProductionModuleLandingScreen from './production/ProductionModuleLandingScreen';
//dairy
import DairyProductionListScreen from './production/dairycattle/DairyProductionListScreen';
import DairyDetailsScreen from './production/dairycattle/DairyDetailsScreen';
import AddDairyDetailsScreen from './production/dairycattle/AddDairyDetailsScreen';
//beef
import AddBeefDetailsScreen from './production/beefcattle/AddBeefDetailsScreen';
import BeefCattleProductionListing from './production/beefcattle/BeefCattleProductionListing';

import BeefCattleDetailsScreen from './production/beefcattle/BeefCattleDetailsScreen';

//swine
import SwineRecordScreen from './production/swine/SwineRecordScreen';
import SwineProductionListScreen from './production/swine/SwineProductionListScreen ';
import SwineDetailsScreen from './production/swine/SwineDetailsScreen';

//poultry
import PoultryProductionListScreen from './production/poultry/PoultryProductionListScreen';
import PoultryFlockDetailsScreen from './production/poultry/PoultryFlockDetailsScreen';

import PoultryDetailsScreen from './production/poultry/PoultryDetailsScreen';

import AddSheepGoatDetailsScreen from './production/sheepandgoat/AddSheepGoatDetailsScreen';
import SheepAndGoatProductionListScreen from './production/sheepandgoat/SheepAndGoatProductionListScreen';

import SheepGoatDetailsScreen from './production/sheepandgoat/SheepGoatDetailsScreen';

// inventory
import InventoryDashboard from './inventory/InventoryDashboard';
import AddMachinery from './inventory/AddMachinery';

import AddInventory from './inventory/AddInventory';

import AddGoodsInStock from './inventory/AddGoodsInStock';
import AddUtilityDetails from './inventory/AddUtilityDetails';

import EditMachinery from './inventory/EditMachinery';

import EditInventoryItem from './inventory/EditInventoryItem';

import EditUtility from './inventory/EditUtility';

import VerifyOtp from './Auth/verify';

export {
  LoginScreen,
  SignupScreen,
  VerifyOtp,
  ForgotPasswordScreen,
  HomeScreen,
  Otp,
  OnboardingScreen,
  ResetPassword,
  EmailOtpScreen,
  //personal information
  ProfileScreen,
  PersonalInformation,
  AboutScreen,
  // Farm Records
  FarmInformation,
  AddFarm,
  EditFarm,
  FarmDetailsModal,

  // Employees
  AddEmployeeScreen,
  FarmEmployeeTableScreen,
  EditEmployeeScreen,
  EmployeeDetailScreen,
  // Livestock
  AddFlockDetailsScreen,
  AddLivestockScreen,
  EditLivestockScreen,
  AddLivestockGroupScreen,
  StatusUpdateForm,
  SalesForm,
  HealthHistoryScreen,
  TransferForm,
  HealthEventForm,
  OptionDetailsScreen,
  OptionLivestockGroupScreen,
  LivestockModuleScreen,
  MortalityForm,
  AnimalDetailScreen,
  FeedingModuleScreen,
  BreedingModuleLandingScreen,
  ViewOffspringScreen,

  // Breeding
  BreedingRecordForm,
  RecordBirthScreen,
  EditBreedingRecordScreen,
  BreedingRecordDetailScreen,
  // Feeding
  LivestockFeedingScreen,
  FarmFeedsScreen,
  AnimalFeedingProgramScreen,
  AddBeefDetailsScreen,
  EditFeedingRequirementScreen,
  FeedingDetailsScreen,

  //health
  AddHealthRecords,
  AddAllergiesRecords,
  AddBoostersRecords,
  AddDewormingRecords,
  AddGeneticsDisorderRecords,
  AddVaccineRecords,
  VaccineRecordsScreen,
  FarmHealthRecords,
  AddDairyDetailsScreen,
  AddCurativeTreatmentRecords,
  VaccineEditScreen,
  DewormingRecordsScreen,
  DewormingEditScreen,
  CurativeTreatmentRecordsScreen,
  CurativeTreatmentEditScreen,
  VaccineDetailScreen,
  GeneticDisorderRecordsScreen,
  GeneticDisorderEditScreen,
  AllergiesRecordsScreen,
  EditAllergyRecord,
  BoostersRecordScreen,

  //home

  //productionsrecord
  SwineRecordScreen,
  AddSheepGoatDetailsScreen,
  SheepGoatDetailsScreen,
  PoultryFlockDetailsScreen,
  BeefCattleProductionListing,
  BeefCattleDetailsScreen,
  SwineProductionListScreen,
  SwineDetailsScreen,
  DairyProductionListScreen,
  DairyDetailsScreen,
  SheepAndGoatProductionListScreen,
  PoultryProductionListScreen,
  PoultryDetailsScreen,
  HealthRecordsScreen,
  ProductionModuleLandingScreen,
  //inventory
  InventoryDashboard,
  AddInventory,
  AddMachinery,
  AddGoodsInStock,
  AddUtilityDetails,
  EditMachinery,
  EditInventoryItem,
  EditUtility,
};
