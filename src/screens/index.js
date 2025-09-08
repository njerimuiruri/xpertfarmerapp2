import LoginScreen from './Auth/login-screen';
import SignupScreen from './Auth/signup';
import ForgotPasswordScreen from './Auth/forgot-password';
import Otp from '../screens/Auth/otp';
import ResetPassword from '../screens/Auth/reset-password';
import EmailOtpScreen from '../screens/Auth/Email-Otp-Screen';

import HomeScreen from './Home/home';
import BusinessAnalyticsScreen from './Home/BusinessAnalyticsScreen';

import AccountsScreen from './Home/AccountsScreen';

import ChartOfAccountsScreen from './Accounts/ChartOfAccountsScreen';

import TrialBalanceScreen from './Accounts/TrialBalanceScreen';

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
import TreatmentDetailScreen from './health/Treatment/TreatmentDetailScreen';

//Genetic Disorders
import AddGeneticsDisorderRecords from './health/Disorders/AddGeneticsDisorderRecords';
import GeneticDisorderRecordsScreen from './health/Disorders/GeneticDisorderRecordsScreen';
import GeneticDisorderEditScreen from './health/Disorders/GeneticDisorderEditScreen';

//Allergies
import AddAllergiesRecords from './health/Allergies/AddAllergiesRecords';

import EditAllergyRecord from './health/Allergies/EditAllergyRecord';

import AllergiesRecordsScreen from './health/Allergies/AllergiesRecordsScreen';
import AllergyDetailScreen from './health/Allergies/AllergyDetailScreen';

//Boosters
import AddBoostersRecords from './health/Boosters/AddBoostersRecords';

import BoostersRecordScreen from './health/Boosters/BoostersRecordScreen';

import BoosterDetailScreen from './health/Boosters/BoosterDetailScreen';

import DewormingDetailScreen from './health/Deworming/DewormingDetailScreen';

import GeneticDisorderDetailScreen from './health/Disorders/GeneticDisorderDetailScreen';

import FarmHealthRecords from './health/health-record/record';
import HealthRecordsScreen from './health/HealthRecordsScreen';

// Home DashboardScreen

//productionsScreen
import SalesLandingPage from './production/SalesLandingPage';
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

import InventoryDetails from './inventory/InventoryDetails';

import AddInventory from './inventory/AddInventory';

import AddGoodsInStock from './inventory/AddGoodsInStock';
import AddUtilityDetails from './inventory/AddUtilityDetails';

import EditMachinery from './inventory/EditMachinery';

import EditInventoryItem from './inventory/EditInventoryItem';

import EditUtility from './inventory/EditUtility';

import VerifyOtp from './Auth/verify';
import AssetsJournalScreen from './Business-Analytics/journals/AssetsJournalScreen';
import PayrollJournalScreen from './Business-Analytics/journals/PayrollJournalScreen';

import PurchaseJournalScreen from './Business-Analytics/journals/PurchaseJournalScreen';

import GeneralJournalScreen from './Business-Analytics/journals/GeneralJournalScreen';

import EmployeesAnalyticsScreen from './Business-Analytics/farm-operations/EmployeesAnalyticsScreen';

import LivestockAnalyticsScreen from './Business-Analytics/farm-operations/LivestockAnalyticsScreen';

import FeedingAnalyticsScreen from './Business-Analytics/farm-operations/FeedingAnalyticsScreen';

import HealthAnalyticsScreen from './Business-Analytics/farm-operations/HealthAnalyticsScreen';
import BreedingAnalyticsScreen from './Business-Analytics/farm-operations/BreedingAnalyticsScreen';

import SalesAnalyticsScreen from './Business-Analytics/farm-operations/SalesAnalyticsScreen';

import InventoryAnalyticsScreen from './Business-Analytics/farm-operations/InventoryAnalyticsScreen';

import SalesJournalScreen from './Business-Analytics/journals/SalesJournalScreen';

import GeneralLedgerScreen from './Business-Analytics/journals/GeneralLedgerScreen';

import BalanceSheetScreen from './Accounts/BalanceSheetScreen';

import ProfitLossScreen from './Accounts/ProfitLossScreen ';

import CashFlowScreen from './Accounts/CashFlowScreen';

export {
  LoginScreen,
  SignupScreen,
  VerifyOtp,
  ForgotPasswordScreen,
  HomeScreen,
  BusinessAnalyticsScreen,
  AccountsScreen,
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
  TreatmentDetailScreen,
  CurativeTreatmentEditScreen,
  VaccineDetailScreen,
  GeneticDisorderRecordsScreen,
  GeneticDisorderEditScreen,
  AllergiesRecordsScreen,
  EditAllergyRecord,
  BoostersRecordScreen,
  AllergyDetailScreen,
  BoosterDetailScreen,
  DewormingDetailScreen,
  GeneticDisorderDetailScreen,

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
  SalesLandingPage,
  //inventory
  InventoryDashboard,
  AddInventory,
  AddMachinery,
  AddGoodsInStock,
  AddUtilityDetails,
  EditMachinery,
  EditInventoryItem,
  EditUtility,
  InventoryDetails,
  //business Analytics
  AssetsJournalScreen,
  GeneralLedgerScreen,
  PayrollJournalScreen,
  PurchaseJournalScreen,
  GeneralJournalScreen,
  SalesJournalScreen,
  EmployeesAnalyticsScreen,
  LivestockAnalyticsScreen,
  FeedingAnalyticsScreen,
  HealthAnalyticsScreen,
  BreedingAnalyticsScreen,
  SalesAnalyticsScreen,
  InventoryAnalyticsScreen,
  ChartOfAccountsScreen,
  TrialBalanceScreen,
  BalanceSheetScreen,
  ProfitLossScreen,
  CashFlowScreen,
};
