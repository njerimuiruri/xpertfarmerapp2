import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { icons } from '../../constants';
import { COLORS } from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';
import { deleteLivestock, getLivestockById } from '../../services/livestock';
import {
  getVaccinationsForLivestock,
  getAllergiesForLivestock,
  getBoostersForLivestock,
  getDewormingRecordsForLivestock,
  getGeneticDisorderRecordsForLivestock,
  getTreatmentsForLivestock,
} from '../../services/healthservice';

import { getBreedingRecordsForLivestock } from '../../services/breeding';
import { getFeedingProgramsForLivestock } from '../../services/feeding';

const { width } = Dimensions.get('window');

const AnimalDetailScreen = ({ route, navigation }) => {
  const { animalData } = route.params || {};
  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [healthHistory, setHealthHistory] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [boosters, setBoosters] = useState([]);
  const [dewormingRecords, setDewormingRecords] = useState([]);
  const [geneticDisorders, setGeneticDisorders] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [breedingRecords, setBreedingRecords] = useState([]);
  const [feedingPrograms, setFeedingPrograms] = useState([]);
  const [breedingLoading, setBreedingLoading] = useState(false);
  const [feedingLoading, setFeedingLoading] = useState(false);

  const [healthLoading, setHealthLoading] = useState(false);
  const [selectedHealthFilter, setSelectedHealthFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const RECORDS_PER_PAGE = 4; // Reduced for less crowding

  useEffect(() => {
    if (activeTab === 'health') {
      fetchHealthData();
    } else if (activeTab === 'breeding') {
      fetchBreedingData();
    } else if (activeTab === 'feeding') {
      fetchFeedingData();
    }
  }, [activeTab]);
  const fetchHealthData = async () => {
    try {
      setHealthLoading(true);
      const livestockId = animalData?.rawData?._id || animalData?.rawData?.id || animalData?.id;

      console.log('Fetching health data for livestock ID:', livestockId);

      if (!livestockId) {
        throw new Error('Animal ID not found');
      }

      const [
        livestockResponse,
        vaccinationsResponse,
        allergiesResponse,
        boostersResponse,
        dewormingResponse,
        disordersResponse,
        treatmentsResponse
      ] = await Promise.all([
        getLivestockById(livestockId),
        getVaccinationsForLivestock(livestockId),
        getAllergiesForLivestock(livestockId),
        getBoostersForLivestock(livestockId),
        getDewormingRecordsForLivestock(livestockId),
        getGeneticDisorderRecordsForLivestock(livestockId),
        getTreatmentsForLivestock(livestockId)
      ]);

      const events = livestockResponse?.healthEvent || [];
      const sortedEvents = [...events].sort((a, b) => new Date(b.date) - new Date(a.date));
      setHealthHistory(sortedEvents);

      const filterHealthRecordsForLivestock = (response, recordType) => {
        if (response.error) {
          console.error(`Error fetching ${recordType}:`, response.error);
          return [];
        }

        const data = response.data || [];
        console.log(`Raw ${recordType} data:`, data.length, 'records');

        const filteredRecords = data.filter(record => {
          const recordLivestockId = record.livestockId ||
            record.animalIdOrFlockId ||
            record.animalId;

          console.log(`${recordType} ${record._id || record.id}: livestockId=${recordLivestockId}, expected=${livestockId}`);

          const matches = recordLivestockId === livestockId ||
            recordLivestockId?.toString() === livestockId?.toString() ||
            record.livestockId?._id === livestockId ||
            record.livestockId?.id === livestockId;

          if (matches) {
            console.log(`✅ ${recordType} matches this livestock`);
          } else {
            console.log(`❌ ${recordType} does not match this livestock`);
          }

          return matches;
        });

        console.log(`Filtered ${recordType}: ${filteredRecords.length} out of ${data.length} total`);
        return filteredRecords;
      };

      const filteredVaccinations = filterHealthRecordsForLivestock(vaccinationsResponse, 'vaccinations');
      const sortedVaccinations = [...filteredVaccinations].sort((a, b) =>
        new Date(b.dateAdministered) - new Date(a.dateAdministered)
      );
      setVaccinations(sortedVaccinations);

      const filteredAllergies = filterHealthRecordsForLivestock(allergiesResponse, 'allergies');
      const sortedAllergies = [...filteredAllergies].sort((a, b) =>
        new Date(b.dateRecorded) - new Date(a.dateRecorded)
      );
      setAllergies(sortedAllergies);

      const filteredBoosters = filterHealthRecordsForLivestock(boostersResponse, 'boosters');
      const sortedBoosters = [...filteredBoosters].sort((a, b) =>
        new Date(b.dateAdministered) - new Date(a.dateAdministered)
      );
      setBoosters(sortedBoosters);

      const filteredDeworming = filterHealthRecordsForLivestock(dewormingResponse, 'deworming');
      const sortedDeworming = [...filteredDeworming].sort((a, b) =>
        new Date(b.dateAdministered) - new Date(a.dateAdministered)
      );
      setDewormingRecords(sortedDeworming);

      const filteredDisorders = filterHealthRecordsForLivestock(disordersResponse, 'disorders');
      const sortedDisorders = [...filteredDisorders].sort((a, b) =>
        new Date(b.dateRecorded) - new Date(a.dateRecorded)
      );
      setGeneticDisorders(sortedDisorders);

      const filteredTreatments = filterHealthRecordsForLivestock(treatmentsResponse, 'treatments');
      const sortedTreatments = [...filteredTreatments].sort((a, b) => {
        const dateA = new Date(a.dateAdministered || a.healthEventDate || a.dateStarted || a.createdAt);
        const dateB = new Date(b.dateAdministered || b.healthEventDate || b.dateStarted || b.createdAt);
        return dateB - dateA;
      });
      setTreatments(sortedTreatments);

    } catch (error) {
      console.error('Error fetching health data:', error);
      Alert.alert('Error', 'Failed to fetch health data. Please try again.');
    } finally {
      setHealthLoading(false);
    }
  };
  const fetchBreedingData = async () => {
    try {
      setBreedingLoading(true);
      const livestockId = animalData?.rawData?._id || animalData?.rawData?.id || animalData?.id;

      console.log('Fetching breeding data for livestock ID:', livestockId);

      if (!livestockId) {
        throw new Error('Animal ID not found');
      }

      const breedingResponse = await getBreedingRecordsForLivestock(livestockId);

      if (breedingResponse.error) {
        console.error('Error fetching breeding records:', breedingResponse.error);
        Alert.alert('Error', 'Failed to fetch breeding records');
        setBreedingRecords([]);
      } else {
        const sortedBreedingRecords = [...(breedingResponse.data || [])].sort((a, b) =>
          new Date(b.breedingDate || b.createdAt) - new Date(a.breedingDate || a.createdAt)
        );
        setBreedingRecords(sortedBreedingRecords);
      }
    } catch (error) {
      console.error('Error fetching breeding data:', error);
      Alert.alert('Error', 'Failed to fetch breeding data. Please try again.');
      setBreedingRecords([]);
    } finally {
      setBreedingLoading(false);
    }
  };
  const fetchFeedingData = async () => {
    try {
      setFeedingLoading(true);
      const livestockId = animalData?.rawData?._id || animalData?.rawData?.id || animalData?.id;

      console.log('Fetching feeding data for livestock ID:', livestockId);

      if (!livestockId) {
        throw new Error('Animal ID not found');
      }

      const feedingResponse = await getFeedingProgramsForLivestock(livestockId);

      if (feedingResponse.error) {
        console.error('Error fetching feeding programs:', feedingResponse.error);
        Alert.alert('Error', 'Failed to fetch feeding programs');
        setFeedingPrograms([]);
      } else {
        const sortedFeedingPrograms = [...(feedingResponse.data || [])].sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setFeedingPrograms(sortedFeedingPrograms);
      }
    } catch (error) {
      console.error('Error fetching feeding data:', error);
      Alert.alert('Error', 'Failed to fetch feeding data. Please try again.');
      setFeedingPrograms([]);
    } finally {
      setFeedingLoading(false);
    }
  };
  const handleHealthRecordPress = (record, recordType) => {
    const recordId = record._id || record.id;

    switch (recordType) {
      case 'vaccination':
        navigation.navigate('VaccineDetailScreen', {
          recordId: recordId,
          recordData: record,
          animalData: animalData
        });
        break;
      case 'treatment':
        navigation.navigate('TreatmentDetailScreen', {
          recordId: recordId,
          recordData: record,
          animalData: animalData
        });
        break
      case 'deworming':
        navigation.navigate('DewormingDetailScreen', {
          recordId: recordId,
          recordData: record,
          animalData: animalData
        });
        break;
      case 'booster':
        navigation.navigate('BoosterDetailScreen', {
          recordId: recordId,
          recordData: record,
          animalData: animalData
        });
        break;
      case 'disorder':
        navigation.navigate('GeneticDisorderDetailScreen', {
          recordId: recordId,
          recordData: record,
          animalData: animalData
        });
        break;
      case 'allergy':
        navigation.navigate('AllergyDetailScreen', {
          recordId: recordId,
          recordData: record,
          animalData: animalData
        });
        break;
      default:
        console.log('No detail screen defined for record type:', recordType);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditLivestockScreen', {
      livestockData: animalData,
      isEditing: true
    });
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const getSearchFilteredData = (data) => {
    if (!searchQuery.trim()) return data;

    return data.filter(record =>
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (record.performedBy && record.performedBy.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const getPaginatedData = (data) => {
    const searchFiltered = getSearchFilteredData(data);
    const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
    const endIndex = startIndex + RECORDS_PER_PAGE;

    return {
      paginatedData: searchFiltered.slice(startIndex, endIndex),
      totalRecords: searchFiltered.length,
      totalPages: Math.ceil(searchFiltered.length / RECORDS_PER_PAGE),
      hasMore: endIndex < searchFiltered.length
    };
  };

  const SearchBar = () => (
    <View style={styles.searchContainer}>
      <FastImage source={icons.search} style={styles.searchIcon} tintColor="#4CAF50" />
      <TextInput
        style={styles.searchInput}
        placeholder="Search health records..."
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          setCurrentPage(1);
        }}
        placeholderTextColor="#999"
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity
          onPress={() => setSearchQuery('')}
          style={styles.clearButton}
        >
          <FastImage source={icons.close} style={styles.clearSearchIcon} tintColor="#999" />
        </TouchableOpacity>
      )}
    </View>
  );

  const PaginationControls = ({ currentPage, totalPages, onPageChange }) => (
    <View style={styles.paginationContainer}>
      <TouchableOpacity
        style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
        onPress={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <Text style={[styles.paginationButtonText, currentPage === 1 && styles.disabledButtonText]}>
          Previous
        </Text>
      </TouchableOpacity>

      <View style={styles.pageInfo}>
        <Text style={styles.pageInfoText}>
          {currentPage} of {totalPages}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]}
        onPress={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <Text style={[styles.paginationButtonText, currentPage === totalPages && styles.disabledButtonText]}>
          Next
        </Text>
      </TouchableOpacity>
    </View>
  );

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      setShowDeleteModal(false);

      const livestockId = animalData.rawData?.id || animalData.id;
      if (!livestockId) {
        throw new Error('Livestock ID not found');
      }

      await deleteLivestock(livestockId);
      Alert.alert('Success', 'Livestock deleted successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Delete error:', error.message);
      Alert.alert('Error', error.message || 'Failed to delete livestock. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderDeleteModal = () => (
    <Modal
      transparent={true}
      visible={showDeleteModal}
      animationType="fade"
      onRequestClose={() => setShowDeleteModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalIconContainer}>
            <View style={styles.deleteIconWrapper}>
              <FastImage
                source={icons.warning || icons.delete}
                style={styles.deleteModalIcon}
                tintColor="#FF4444"
              />
            </View>
          </View>

          <Text style={styles.modalTitle}>Delete Animal</Text>
          <Text style={styles.modalMessage}>
            Are you sure you want to delete{' '}
            <Text style={styles.animalName}>{animalData.title || 'this animal'}</Text>?{'\n'}
            This action cannot be undone.
          </Text>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.cancelModalButton}
              onPress={() => setShowDeleteModal(false)}
            >
              <Text style={styles.cancelModalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteModalButton}
              onPress={confirmDelete}
              disabled={isDeleting}
            >
              <Text style={styles.deleteModalButtonText}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderTabs = () => {
    const tabs = [
      { id: 'overview', label: 'Overview', icon: icons.home },
      { id: 'health', label: 'Health', icon: icons.health },
      { id: 'breeding', label: 'Breeding', icon: icons.heart },
      { id: 'feeding', label: 'Feeding', icon: icons.feed },
    ];

    return (
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.7}
            >
              <FastImage
                source={tab.icon}
                style={styles.tabIcon}
                tintColor={activeTab === tab.id ? COLORS.white : '#4CAF50'}
              />
              <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const InfoRow = ({ label, value, isLast = false }) => (
    <View style={[styles.infoRow, isLast && styles.lastInfoRow]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || 'N/A'}</Text>
    </View>
  );

  const renderOverview = () => (
    <ScrollView style={styles.contentSection} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <FastImage source={icons.livestock} style={styles.sectionIcon} tintColor="#4CAF50" />
          <Text style={styles.sectionTitle}>Basic Information</Text>
        </View>

        <View style={styles.infoCard}>
          <InfoRow label="Animal ID" value={animalData.idNumber} />
          <InfoRow label="Type" value={animalData.type || animalData.livestockType} />
          <InfoRow label="Breed" value={animalData.breedType || animalData.breed} />
          <InfoRow label="Gender" value={animalData.gender || animalData.sex} />
          <InfoRow label="Date of Birth" value={animalData.dateOfBirth || animalData.dob} isLast />
        </View>
      </View>

      {animalData.type === 'poultry' && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FastImage source={icons.livestock} style={styles.sectionIcon} tintColor="#FF9800" />
            <Text style={styles.sectionTitle}>Poultry Details</Text>
          </View>

          <View style={styles.infoCard}>
            <InfoRow label="Flock ID" value={animalData.poultry?.flockId} />
            <InfoRow label="Initial Quantity" value={animalData.poultry?.initialQuantity} />
            <InfoRow label="Date of Stocking" value={animalData.poultry?.dateOfStocking} isLast />
          </View>
        </View>
      )}

      {animalData.type !== 'poultry' && animalData.mammal && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FastImage source={icons.livestock} style={styles.sectionIcon} tintColor="#2196F3" />
            <Text style={styles.sectionTitle}>Mammal Details</Text>
          </View>

          <View style={styles.infoCard}>
            <InfoRow label="Birth Weight" value={animalData.mammal.birthWeight} />
            <InfoRow label="Sire ID" value={animalData.mammal.sireId} />
            <InfoRow label="Dam ID" value={animalData.mammal.damId} isLast />
          </View>
        </View>
      )}
    </ScrollView>
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getAllHealthData = () => {
    let allHealthData = [];

    // Add general health events
    const healthEvents = healthHistory.map(event => ({
      ...event,
      type: 'health_event',
      date: event.date,
      title: event.eventType || 'Health Event',
      description: event.description || 'No description available'
    }));

    // Add vaccinations
    const vaccinationEvents = vaccinations.map(vaccination => ({
      ...vaccination,
      type: 'vaccination',
      date: vaccination.dateAdministered,
      title: vaccination.vaccinationAgainst || 'Vaccination',
      description: `${vaccination.drugAdministered} - ${vaccination.dosage}`,
      cost: vaccination.costOfVaccine || vaccination.costOfService,
      performedBy: vaccination.administeredBy
    }));

    // Add boosters
    const boosterEvents = boosters.map(booster => ({
      ...booster,
      type: 'booster',
      date: booster.dateAdministered,
      title: booster.boosterFor || 'Booster Shot',
      description: `${booster.drugAdministered} - ${booster.dosage}`,
      cost: booster.costOfBooster,
      performedBy: booster.administeredBy
    }));

    // Add deworming records
    const dewormingEvents = dewormingRecords.map(deworming => ({
      ...deworming,
      type: 'deworming',
      date: deworming.dateAdministered,
      title: 'Deworming Treatment',
      description: `${deworming.drugAdministered} - ${deworming.dosage}`,
      cost: deworming.costOfDeworming,
      performedBy: deworming.administeredBy
    }));

    // Add genetic disorders
    const disorderEvents = geneticDisorders.map(disorder => ({
      ...disorder,
      type: 'disorder',
      date: disorder.dateRecorded,
      title: disorder.disorderName || 'Genetic Disorder',
      description: disorder.description || disorder.symptoms,
      severity: disorder.severity
    }));

    // Add treatments
    const treatmentEvents = treatments.map((treatment, index) => {
      const treatmentDate = treatment.dateAdministered ||
        treatment.healthEventDate ||
        treatment.dateStarted ||
        treatment.createdAt ||
        new Date().toISOString();

      const treatmentTitle = treatment.diagnosis ||
        treatment.treatmentType ||
        treatment.treatmentDescription ||
        'Treatment';

      let treatmentDescription = treatment.treatmentDescription ||
        treatment.healthEventSymptoms ||
        treatment.drugAdministered ||
        'Treatment administered';

      if (treatment.drugAdministered && treatment.dosageAdministered) {
        treatmentDescription = `${treatment.drugAdministered} - ${treatment.dosageAdministered}`;
        if (treatment.treatmentDescription) {
          treatmentDescription += ` | ${treatment.treatmentDescription}`;
        }
      }

      const treatmentCost = treatment.costOfDrugs ||
        treatment.costOfService ||
        treatment.totalCost;

      const performedBy = treatment.medicalOfficerName ||
        treatment.veterinarian ||
        treatment.administeredBy;

      return {
        ...treatment,
        type: 'treatment',
        date: treatmentDate,
        title: treatmentTitle,
        description: treatmentDescription,
        cost: treatmentCost,
        performedBy: performedBy,
        endDate: treatment.dateEnded,
        drugAdministered: treatment.drugAdministered,
        dosage: treatment.dosageAdministered,
        symptoms: treatment.healthEventSymptoms,
        diagnosis: treatment.diagnosis,
        treatmentType: treatment.treatmentType,
        witness: treatment.farmerWitnessName,
        notes: treatment.notes
      };
    });

    // Add allergies
    const allergyEvents = allergies.map(allergy => ({
      ...allergy,
      type: 'allergy',
      date: allergy.dateRecorded,
      title: 'Allergy Record',
      description: `Cause: ${allergy.cause} | Remedy: ${allergy.remedy}`,
      eventType: 'allergies'
    }));

    allHealthData = [
      ...healthEvents,
      ...vaccinationEvents,
      ...boosterEvents,
      ...dewormingEvents,
      ...disorderEvents,
      ...treatmentEvents,
      ...allergyEvents
    ];

    return allHealthData.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const getFilteredHealthData = () => {
    const allHealthData = getAllHealthData();

    if (selectedHealthFilter === 'all') {
      return allHealthData;
    }

    if (selectedHealthFilter === 'treatment') {
      return allHealthData.filter(event => event.type === 'treatment');
    }

    if (selectedHealthFilter === 'vaccination') {
      return allHealthData.filter(event => event.type === 'vaccination');
    }

    if (selectedHealthFilter === 'allergies') {
      return allHealthData.filter(event => event.type === 'allergy' || event.eventType === 'allergies');
    }

    return allHealthData.filter(event => event.eventType === selectedHealthFilter || event.type === selectedHealthFilter);
  };

  const renderHealthSummary = () => (
    <View style={styles.healthSummaryContainer}>
      <View style={styles.healthStat}>
        <View style={[styles.healthStatIcon, { backgroundColor: '#E8F5E8' }]}>
          <FastImage source={icons.health} style={styles.statIcon} tintColor="#4CAF50" />
        </View>
        <Text style={styles.healthStatNumber}>{vaccinations.length}</Text>
        <Text style={styles.healthStatLabel}>Vaccinations</Text>
      </View>
      <View style={styles.healthStat}>
        <View style={[styles.healthStatIcon, { backgroundColor: '#E3F2FD' }]}>
          <FastImage source={icons.health} style={styles.statIcon} tintColor="#2196F3" />
        </View>
        <Text style={styles.healthStatNumber}>{treatments.length}</Text>
        <Text style={styles.healthStatLabel}>Treatments</Text>
      </View>
      <View style={styles.healthStat}>
        <View style={[styles.healthStatIcon, { backgroundColor: '#F3E5F5' }]}>
          <FastImage source={icons.health} style={styles.statIcon} tintColor="#9C27B0" />
        </View>
        <Text style={styles.healthStatNumber}>{dewormingRecords.length}</Text>
        <Text style={styles.healthStatLabel}>Deworming</Text>
      </View>
      <View style={styles.healthStat}>
        <View style={[styles.healthStatIcon, { backgroundColor: '#E0F2F1' }]}>
          <FastImage source={icons.health} style={styles.statIcon} tintColor="#00BCD4" />
        </View>
        <Text style={styles.healthStatNumber}>{boosters.length}</Text>
        <Text style={styles.healthStatLabel}>Boosters</Text>
      </View>

    </View>
  );

  const renderHealthRecords = () => {
    const filteredHealthData = getFilteredHealthData();
    const { paginatedData, totalRecords, totalPages } = getPaginatedData(filteredHealthData);

    const HealthFilterButtons = () => {
      const filters = [
        { id: 'all', label: 'All', color: '#4CAF50' },
        { id: 'treatment', label: 'Treatment', color: '#2196F3' },
        { id: 'vaccination', label: 'Vaccination', color: '#4CAF50' },
        { id: 'allergies', label: 'Allergies', color: '#FF9800' },
        { id: 'deworming', label: 'Deworming', color: '#9C27B0' },
        { id: 'disorder', label: 'Disorder', color: '#F44336' },
        { id: 'booster', label: 'Booster', color: '#00BCD4' },
      ];

      return (
        <View style={styles.healthFilterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.healthFilterButton,
                  selectedHealthFilter === filter.id && {
                    backgroundColor: filter.color,
                    borderColor: filter.color
                  },
                ]}
                onPress={() => {
                  setSelectedHealthFilter(filter.id);
                  setCurrentPage(1);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.healthFilterButtonText,
                    selectedHealthFilter === filter.id && styles.selectedHealthFilterButtonText,
                  ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      );
    };

    return (
      <ScrollView style={styles.contentSection} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FastImage source={icons.document} style={styles.sectionIcon} tintColor="#4CAF50" />
            <Text style={styles.sectionTitle}>Health Records</Text>
          </View>

          {renderHealthSummary()}

          <View style={styles.sectionNavContainer}>
            {renderSectionNavigationButton('health', 'Health Records', icons.health, '#4CAF50')}
          </View>
          <HealthFilterButtons />
          <SearchBar />

          {healthLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Loading health records...</Text>
            </View>
          ) : totalRecords === 0 ? (
            <View style={styles.noRecordsContainer}>
              <FastImage source={icons.document} style={styles.noRecordsIcon} tintColor="#ccc" />
              <Text style={styles.noRecordsText}>
                {searchQuery ? `No records found for "${searchQuery}"` :
                  selectedHealthFilter === 'all' ? 'No health records found' :
                    `No ${selectedHealthFilter} records found`}
              </Text>
            </View>
          ) : (
            <View style={styles.recordsContainer}>
              <Text style={styles.recordsCountText}>
                Showing {paginatedData.length} of {totalRecords} records
              </Text>

              {paginatedData.map((event, index) => (
                <TouchableOpacity
                  key={`${event.type}-${index}`}
                  style={[
                    styles.healthEvent,
                    { borderLeftColor: getEventTypeColor(event.eventType || event.type) }
                  ]}
                  onPress={() => handleHealthRecordPress(event, event.type)}
                  activeOpacity={0.8}
                >
                  <View style={styles.healthEventHeader}>
                    <View style={styles.healthEventTypeContainer}>
                      <View style={[
                        styles.healthEventTypeIndicator,
                        { backgroundColor: getEventTypeColor(event.eventType || event.type) }
                      ]}>
                        <Text style={styles.healthEventTypeText}>
                          {(event.eventType || event.type).charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.healthEventInfo}>
                        <Text style={styles.healthEventType} numberOfLines={1}>{event.title}</Text>
                        <Text style={styles.healthEventDate}>
                          {event.date ? formatDate(event.date) : 'Date not available'}
                        </Text>
                        {event.type && (
                          <Text style={styles.healthEventCategory}>
                            {event.type.replace('_', ' ').toUpperCase()}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.healthEventActions}>
                      <FastImage source={icons.chevronRight} style={styles.chevronIcon} tintColor="#4CAF50" />
                    </View>
                  </View>
                  <Text style={styles.healthEventDescription} numberOfLines={2}>
                    {event.description}
                  </Text>
                  {event.performedBy && (
                    <Text style={styles.healthEventPerformedBy}>
                      Performed by: {event.performedBy}
                    </Text>
                  )}
                  {event.cost && (
                    <Text style={styles.healthEventCost}>
                      Cost: ${event.cost}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}

              {totalPages > 1 && (
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  const getEventTypeColor = (eventType) => {
    const colorMap = {
      'vaccination': '#4CAF50',
      'treatment': '#2196F3',
      'allergies': '#FF9800',
      'allergy': '#FF9800',
      'deworming': '#9C27B0',
      'disorder': '#F44336',
      'booster': '#00BCD4',
      'health_event': '#607D8B',
      'default': '#757575'
    };
    return colorMap[eventType] || colorMap['default'];
  };

  const renderBreeding = () => (
    <ScrollView style={styles.contentSection} showsVerticalScrollIndicator={false}>


      {animalData.mammal && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FastImage source={icons.livestock} style={styles.sectionIcon} tintColor="#FF5722" />
            <Text style={styles.sectionTitle}>Parental Information</Text>
          </View>

          <View style={styles.infoCard}>
            <InfoRow label="Sire (Father)" value={animalData.mammal.sireId || 'Unknown'} />
            <InfoRow label="Dam (Mother)" value={animalData.mammal.damId || 'Unknown'} isLast />
          </View>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <FastImage source={icons.document} style={styles.sectionIcon} tintColor="#9C27B0" />
          <Text style={styles.sectionTitle}>Breeding Records</Text>
        </View>
        <View style={styles.sectionNavContainer}>
          {renderSectionNavigationButton('breeding', 'Breeding Records', icons.heart, '#E91E63')}
        </View>

        {breedingLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E91E63" />
            <Text style={styles.loadingText}>Loading breeding records...</Text>
          </View>
        ) : breedingRecords.length === 0 ? (
          <View style={styles.noRecordsContainer}>
            <FastImage source={icons.heart} style={styles.noRecordsIcon} tintColor="#ccc" />
            <Text style={styles.noRecordsText}>No breeding records available</Text>
            <Text style={styles.noRecordsSubtext}>
              Breeding records will appear here when they are added
            </Text>
          </View>
        ) : (
          <View style={styles.recordsContainer}>
            <Text style={styles.recordsCountText}>
              {breedingRecords.length} breeding record{breedingRecords.length !== 1 ? 's' : ''}
            </Text>

            {breedingRecords.map((record, index) => (
              <TouchableOpacity
                key={`breeding-${record._id || record.id}-${index}`}
                style={[styles.healthEvent, { borderLeftColor: '#E91E63' }]}
                onPress={() => {
                  // Navigate to breeding detail screen if available
                  navigation.navigate('BreedingDetailScreen', {
                    recordId: record._id || record.id,
                    recordData: record,
                    animalData: animalData
                  });
                }}
                activeOpacity={0.8}
              >
                <View style={styles.healthEventHeader}>
                  <View style={styles.healthEventTypeContainer}>
                    <View style={[
                      styles.healthEventTypeIndicator,
                      { backgroundColor: '#E91E63' }
                    ]}>
                      <Text style={styles.healthEventTypeText}>B</Text>
                    </View>
                    <View style={styles.healthEventInfo}>
                      <Text style={styles.healthEventType} numberOfLines={1}>
                        Breeding Record
                      </Text>
                      <Text style={styles.healthEventDate}>
                        {record.breedingDate ? formatDate(record.breedingDate) : 'Date not available'}
                      </Text>
                      <Text style={styles.healthEventCategory}>
                        {record.breedingMethod || 'BREEDING'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.healthEventActions}>
                    <FastImage source={icons.chevronRight} style={styles.chevronIcon} tintColor="#E91E63" />
                  </View>
                </View>
                <Text style={styles.healthEventDescription} numberOfLines={2}>
                  {record.notes || `Breeding between ${record.damId} (dam) and ${record.sireId} (sire)`}
                </Text>
                {record.expectedDeliveryDate && (
                  <Text style={styles.healthEventPerformedBy}>
                    Expected Delivery: {formatDate(record.expectedDeliveryDate)}
                  </Text>
                )}
                {record.breedingStatus && (
                  <Text style={styles.healthEventCost}>
                    Status: {record.breedingStatus}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderFeeding = () => (
    <ScrollView style={styles.contentSection} showsVerticalScrollIndicator={false}>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <FastImage source={icons.document} style={styles.sectionIcon} tintColor="#4CAF50" />
          <Text style={styles.sectionTitle}>Feeding Programs</Text>
        </View>
        <View style={styles.sectionNavContainer}>
          {renderSectionNavigationButton('feeding', 'Feeding Programs', icons.feed, '#FF9800')}
        </View>
        {feedingLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF9800" />
            <Text style={styles.loadingText}>Loading feeding programs...</Text>
          </View>
        ) : feedingPrograms.length === 0 ? (
          <View style={styles.noRecordsContainer}>
            <FastImage source={icons.feed} style={styles.noRecordsIcon} tintColor="#ccc" />
            <Text style={styles.noRecordsText}>No feeding programs available</Text>
            <Text style={styles.noRecordsSubtext}>
              Feeding programs will appear here when they are added
            </Text>
          </View>
        ) : (
          <View style={styles.recordsContainer}>
            <Text style={styles.recordsCountText}>
              {feedingPrograms.length} feeding program{feedingPrograms.length !== 1 ? 's' : ''}
            </Text>

            {feedingPrograms.map((program, index) => (
              <TouchableOpacity
                key={`feeding-${program._id || program.id}-${index}`}
                style={[styles.healthEvent, { borderLeftColor: '#FF9800' }]}
                onPress={() => {
                  navigation.navigate('FeedingDetailScreen', {
                    recordId: program._id || program.id,
                    recordData: program,
                    animalData: animalData
                  });
                }}
                activeOpacity={0.8}
              >
                <View style={styles.healthEventHeader}>
                  <View style={styles.healthEventTypeContainer}>
                    <View style={[
                      styles.healthEventTypeIndicator,
                      { backgroundColor: '#FF9800' }
                    ]}>
                      <Text style={styles.healthEventTypeText}>F</Text>
                    </View>
                    <View style={styles.healthEventInfo}>
                      <Text style={styles.healthEventType} numberOfLines={1}>
                        {program.feedType || 'Feeding Program'}
                      </Text>
                      <Text style={styles.healthEventDate}>
                        {program.createdAt ? formatDate(program.createdAt) : 'Date not available'}
                      </Text>
                      <Text style={styles.healthEventCategory}>
                        {program.programType || 'FEEDING'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.healthEventActions}>
                    <FastImage source={icons.chevronRight} style={styles.chevronIcon} tintColor="#FF9800" />
                  </View>
                </View>
                <Text style={styles.healthEventDescription} numberOfLines={2}>
                  {program.notes || `${program.feedType} feeding program`}
                </Text>
                {program.timeOfDay && program.timeOfDay.length > 0 && (
                  <Text style={styles.healthEventPerformedBy}>
                    Schedule: {program.timeOfDay.join(', ')}
                  </Text>
                )}
                {program.feedDetails && program.feedDetails.length > 0 && (
                  <Text style={styles.healthEventCost}>
                    Feed Types: {program.feedDetails.length}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'health':
        return renderHealthRecords();
      case 'breeding':
        return renderBreeding();
      case 'feeding':
        return renderFeeding();
      default:
        return renderOverview();
    }
  };

  if (!animalData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Animal data not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  const renderSectionNavigationButton = (sectionType, title, icon, color) => (
    <TouchableOpacity
      style={[styles.sectionNavButton, { borderColor: color }]}
      onPress={() => {
        switch (sectionType) {
          case 'health':
            navigation.navigate('HealthRecordsScreen', {
              animalData: animalData,
              livestockId: animalData?.rawData?._id || animalData?.rawData?.id || animalData?.id
            });
            break;
          case 'breeding':
            navigation.navigate('BreedingModuleLandingScreen', {
              animalData: animalData,
              livestockId: animalData?.rawData?._id || animalData?.rawData?.id || animalData?.id
            });
            break;
          case 'feeding':
            navigation.navigate('FeedingModuleScreen', {
              animalData: animalData,
              livestockId: animalData?.rawData?._id || animalData?.rawData?.id || animalData?.id
            });
            break;
        }
      }}
      activeOpacity={0.7}
    >
      <FastImage source={icon} style={[styles.sectionNavIcon, { tintColor: color }]} />
      <Text style={[styles.sectionNavText, { color: color }]}>View All {title}</Text>
      <FastImage source={icons.chevronRight} style={[styles.sectionNavChevron, { tintColor: color }]} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* <StatusBar barStyle="dark-content" backgroundColor="#ffffff" /> */}

      <SecondaryHeader
        title={animalData.title || `${animalData.type} ${animalData.idNumber}`}
        onBack={() => navigation.goBack()}
        rightComponent={
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleEdit}
              activeOpacity={0.7}
            >
              <FastImage source={icons.edit} style={styles.headerButtonIcon} tintColor="#4CAF50" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, styles.deleteButton]}
              onPress={handleDelete}
              activeOpacity={0.7}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#FF4444" />
              ) : (
                <FastImage source={icons.delete} style={styles.headerButtonIcon} tintColor="#FF4444" />
              )}
            </TouchableOpacity>
          </View>
        }
      />

      <View style={styles.animalHeader}>
        <View style={styles.animalImageContainer}>
          <FastImage
            source={animalData.imageUrl ? { uri: animalData.imageUrl } : icons.livestock}
            style={styles.animalImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.animalInfo}>
          <Text style={styles.animalTitle} numberOfLines={2}>
            {animalData.title || `${animalData.type} ${animalData.idNumber}`}
          </Text>
          <Text style={styles.animalSubtitle}>
            {animalData.breedType || animalData.breed} • {animalData.gender || animalData.sex}
          </Text>
          <Text style={styles.animalId}>ID: {animalData.idNumber}</Text>
        </View>
      </View>

      {renderTabs()}

      <View style={styles.contentContainer}>
        {renderContent()}
      </View>

      {renderDeleteModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  headerButtonIcon: {
    width: 20,
    height: 20,
  },
  animalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  animalImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  animalImage: {
    width: '100%',
    height: '100%',
  },
  animalInfo: {
    flex: 1,
    marginLeft: 16,
  },
  animalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  animalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  animalId: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
  tabContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabScrollContent: {
    paddingHorizontal: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeTab: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  tabIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  activeTabText: {
    color: '#fff',
  },
  contentContainer: {
    flex: 1,
    marginTop: 8,
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  infoCard: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastInfoRow: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  healthSummaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  healthStat: {
    alignItems: 'center',
    flex: 1,
  },
  healthStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    width: 20,
    height: 20,
  },
  healthStatNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  healthStatLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  healthFilterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  healthFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  healthFilterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  selectedHealthFilterButtonText: {
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingVertical: 12,
  },
  clearButton: {
    padding: 4,
  },
  clearSearchIcon: {
    width: 14,
    height: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
  noRecordsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noRecordsIcon: {
    width: 48,
    height: 48,
    marginBottom: 16,
  },
  noRecordsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  noRecordsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  recordsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  recordsCountText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
    textAlign: 'center',
  },
  healthEvent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  healthEventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  healthEventTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  healthEventTypeIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  healthEventTypeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  healthEventInfo: {
    flex: 1,
  },
  healthEventType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  healthEventDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  healthEventCategory: {
    fontSize: 10,
    color: '#999',
    fontWeight: '500',
  },
  healthEventActions: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronIcon: {
    width: 16,
    height: 16,
  },
  healthEventDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  healthEventPerformedBy: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  healthEventCost: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  paginationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  disabledButtonText: {
    color: '#999',
  },
  pageInfo: {
    paddingHorizontal: 16,
  },
  pageInfoText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    maxWidth: 320,
    width: '100%',
  },
  modalIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalIcon: {
    width: 28,
    height: 28,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  animalName: {
    fontWeight: '600',
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelModalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
    alignItems: 'center',
  },
  cancelModalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FF4444',
    marginLeft: 8,
    alignItems: 'center',
  },
  deleteModalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  healthSummarySection: {
    paddingBottom: 16,
  },
  sectionNavContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  sectionNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionNavIcon: {
    width: 20,
    height: 20,
  },
  sectionNavText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },
  sectionNavChevron: {
    width: 16,
    height: 16,
  },
  moreRecordsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default AnimalDetailScreen;