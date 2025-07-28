import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Button,
  Select,
  Input,
  Box,
  HStack,
  VStack,
  FormControl,
  Radio,
  TextArea,
  Center,
} from 'native-base';
import DateTimePicker from '@react-native-community/datetimepicker';
import FastImage from 'react-native-fast-image';
import { icons } from '../../../constants';
import { COLORS } from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';
import { getLivestockForActiveFarm } from '../../../services/livestock';
import { createFeedingProgram } from '../../../services/feeding';

const FarmFeedsScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [programType, setProgramType] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');

  const [livestock, setLivestock] = useState([]);
  const [loadingLivestock, setLoadingLivestock] = useState(true);

  const [animalData, setAnimalData] = useState({
    id: '',
    type: '',
    lifecycleStages: [],
    groupId: '',
    groupType: '',
    groupLifecycleStages: [],
  });

  const [feedType, setFeedType] = useState('');
  const [feedData, setFeedData] = useState({
    basal: {
      feedType: '',
      source: '',
      schedule: '',
      quantity: '',
      date: new Date(),
      cost: '',
      supplier: '',
    },
    concentrate: {
      feedType: '',
      source: '',
      schedule: '',
      quantity: '',
      date: new Date(),
      cost: '',
      supplier: '',
    },
    supplement: {
      feedType: '',
      source: '',
      schedule: '',
      quantity: '',
      date: new Date(),
      cost: '',
      supplier: '',
    },
  });

  const [datePickerVisible, setDatePickerVisible] = useState({
    basal: false,
    concentrate: false,
    supplement: false,
  });

  useEffect(() => {
    fetchLivestock();
  }, []);

  useEffect(() => {
    if (animalData.type)
      setAnimalData(prev => ({ ...prev, lifecycleStages: [] }));
    if (animalData.groupType)
      setAnimalData(prev => ({ ...prev, groupLifecycleStages: [] }));
  }, [animalData.type, animalData.groupType]);

  const fetchLivestock = async () => {
    try {
      setLoadingLivestock(true);
      const livestockData = await getLivestockForActiveFarm();
      setLivestock(livestockData);
      console.log('Fetched livestock:', livestockData);
    } catch (error) {
      console.error('Error fetching livestock:', error);
      Alert.alert('Error', 'Failed to load livestock data');
    } finally {
      setLoadingLivestock(false);
    }
  };

  const getAnimalOptions = () => {
    if (programType === 'Single Animal') {
      // Filter for mammals (non-poultry livestock)
      return livestock
        .filter(animal => animal.category === 'mammal' || animal.type !== 'poultry')
        .map(animal => ({
          id: animal.id,
          idNumber: animal.mammal?.idNumber || animal.id,
          type: animal.type,
          breedType: animal.mammal?.breedType || '',
          gender: animal.mammal?.gender || '',
          specificType: getSpecificAnimalType(animal),
          displayName: `${animal.mammal?.idNumber || animal.id} - ${getSpecificAnimalType(animal)} (${animal.mammal?.breedType || 'Unknown breed'})`
        }));
    } else if (programType === 'Group') {
      // Filter for poultry groups
      return livestock
        .filter(animal => animal.category === 'poultry' || animal.type === 'poultry')
        .map(animal => ({
          id: animal.id,
          flockId: animal.poultry?.flockId || animal.id,
          type: animal.type,
          breedType: animal.poultry?.breedType || '',
          quantity: animal.poultry?.currentQuantity || animal.poultry?.initialQuantity || 0,
          specificType: getSpecificAnimalType(animal),
          displayName: `${animal.poultry?.flockId || animal.id} - ${getSpecificAnimalType(animal)} (${animal.poultry?.quantity || 0} birds)`
        }));
    }
    return [];
  };


  const getAnimalTypeFromLivestockType = (livestockType) => {
    const typeMapping = {
      // Cattle types from your registration
      'dairyCattle': 'Dairy Cattle',
      'beefCattle': 'Beef Cattle',

      // Goat types from your registration
      'dairyGoats': 'Dairy Goats',
      'meatGoats': 'Meat Goats',

      // Other livestock from your registration
      'sheep': 'Sheep',
      'rabbit': 'Rabbit',
      'swine': 'Swine',
      'poultry': 'Poultry',

      // Additional mappings for compatibility
      'cattle': 'Beef Cattle',
      'goats': 'Meat Goats',
      'pigs': 'Swine',
      'chickens': 'Poultry',
    };

    return typeMapping[livestockType] || livestockType;
  };

  const getLifecycleOptions = (type, isGroup = false) => {
    const options = {
      // Dairy Cattle - specific to dairy operations
      'Dairy Cattle': [
        'Calf (0-6 months)',
        'Weaned Calf (6-12 months)',
        'Yearling Heifer (12-15 months)',
        'Breeding Heifer (15-24 months)',
        'Pregnant Heifer (First pregnancy)',
        'Fresh Cow (0-100 days in milk)',
        'Peak Lactation (100-200 days in milk)',
        'Mid Lactation (200-305 days in milk)',
        'Late Lactation (305+ days in milk)',
        'Dry Cow (60 days before calving)',
        'Transition Cow (Pre/Post calving)',
      ],

      // Beef Cattle - meat production focused
      'Beef Cattle': [
        'Calf (0-6 months)',
        'Weaned Calf (6-12 months)',
        'Yearling (12-18 months)',
        'Stocker/Backgrounder (18-24 months)',
        'Finisher/Feedlot (24+ months)',
        'Breeding Bull',
        'Breeding Cow',
        'Pregnant Cow',
        'Lactating Cow'
      ],

      // Dairy Goats - milk production focused
      'Dairy Goats': [
        'Kid (0-3 months)',
        'Weaned Kid (3-6 months)',
        'Young Doe (6-12 months)',
        'Breeding Doe (12+ months)',
        'Pregnant Doe',
        'Fresh Doe (Early lactation)',
        'Peak Lactation Doe',
        'Late Lactation Doe',
        'Dry Doe',
        'Breeding Buck',
      ],

      // Meat Goats - meat production focused
      'Meat Goats': [
        'Kid (0-3 months)',
        'Weaned Kid (3-6 months)',
        'Growing Kid (6-9 months)',
        'Market Goat (9-12 months)',
        'Breeding Doe',
        'Pregnant Doe',
        'Lactating Doe',
        'Breeding Buck',
        'Wether (Castrated male)',
      ],

      // Sheep - combined meat and wool
      'Sheep': [
        'Lamb (0-4 months)',
        'Weaned Lamb (4-6 months)',
        'Replacement Ewe Lamb (6-12 months)',
        'Yearling Ewe (12-18 months)',
        'Breeding Ewe',
        'Pregnant Ewe',
        'Lactating Ewe',
        'Dry Ewe',
        'Ram (Breeding male)',
        'Wether (Castrated male)',
        'Market Lamb',
      ],

      // Rabbit - fast reproduction cycle
      'Rabbit': [
        'Kit (0-4 weeks)',
        'Junior (4-6 months)',
        'Intermediate (6-8 months)',
        'Senior (8+ months)',
        'Breeding Doe',
        'Pregnant Doe',
        'Lactating Doe (with litter)',
        'Breeding Buck',
        'Market Rabbit',
      ],

      // Swine - pork production
      'Swine': [
        'Piglet/Suckling (0-3 weeks)',
        'Weaner (3-8 weeks)',
        'Nursery Pig (8-10 weeks)',
        'Grower (10-16 weeks)',
        'Finisher (16-24 weeks)',
        'Gilt (Young breeding female)',
        'Sow (Breeding female)',
        'Pregnant Sow',
        'Lactating Sow',
        'Boar (Breeding male)',
        'Market Hog',
      ],

      // Poultry - covers all bird types from your breeds
      'Poultry': [
        'Day-old Chick/Poult',
        'Starter (0-6 weeks)',
        'Grower (6-16 weeks)',
        'Developer (16-20 weeks)',
        'Layer (20+ weeks)',
        'Broiler (Meat bird)',
        'Breeder',
        'Spent Bird',
      ],

      // Specific poultry types based on breed
      'Broiler': [
        'Starter (0-14 days)',
        'Grower (15-28 days)',
        'Finisher (29-42 days)',
        'Withdrawal (43+ days)',
      ],

      'Layer': [
        'Day-old Chick',
        'Starter (0-6 weeks)',
        'Grower (6-16 weeks)',
        'Developer/Pullet (16-20 weeks)',
        'Peak Production (20-40 weeks)',
        'Late Production (40-72 weeks)',
        'Spent Hen (72+ weeks)',
      ],

      'Turkey': [
        'Poult (0-4 weeks)',
        'Starter (0-6 weeks)',
        'Grower (6-12 weeks)',
        'Finisher (12-16 weeks)',
        'Breeder Turkey',
        'Market Turkey',
      ],

      'Duck': [
        'Duckling (0-2 weeks)',
        'Starter (0-3 weeks)',
        'Grower (3-7 weeks)',
        'Finisher (7-8 weeks)',
        'Layer Duck',
        'Breeder Duck',
      ],

      'Quail': [
        'Chick (0-2 weeks)',
        'Starter (0-6 weeks)',
        'Grower (6-16 weeks)',
        'Layer/Breeder (16+ weeks)',
        'Market Quail',
      ],

      // Generic fallbacks
      'Dairy': [
        'Calf', 'Heifer', 'Lactating cows', 'Dry Cows'
      ],
      'Beef': [
        'Starter', 'Grower', 'Finisher'
      ],
      'Sheep and Goats': [
        'Lambs and Kids',
        'Growing',
        'Production',
        'Maintenance',
      ],
    };

    return type ? options[type] || [] : [];
  };
  const getSpecificAnimalType = (livestockItem) => {
    const baseType = getAnimalTypeFromLivestockType(livestockItem.type);

    // For poultry, check breed type to get more specific type
    if (livestockItem.type === 'poultry' && livestockItem.poultry?.breedType) {
      const breedType = livestockItem.poultry.breedType;

      // Map breed types to specific feeding categories
      const breedMapping = {
        'Broiler': 'Broiler',
        'Layer': 'Layer',
        'Turkey': 'Turkey',
        'Duck': 'Duck',
        'Quail': 'Quail',
        'Dual Purpose': 'Poultry',
        'Indigenous': 'Poultry',
      };

      return breedMapping[breedType] || 'Poultry';
    }

    return baseType;
  };


  const toggleSelection = (item, field) => {
    setAnimalData(prev => {
      const current = prev[field];
      return {
        ...prev,
        [field]: current.includes(item)
          ? current.filter(i => i !== item)
          : [...current, item],
      };
    });
  };

  const toggleTimeOfDay = time => {
    setTimeOfDay(prev =>
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time],
    );
  };

  const handleDateChange = (feedKey, selectedDate) => {
    setDatePickerVisible({ ...datePickerVisible, [feedKey]: false });
    if (selectedDate) {
      setFeedData(prev => ({
        ...prev,
        [feedKey]: { ...prev[feedKey], date: selectedDate },
      }));
    }
  };

  const updateFeedData = (feedKey, field, value) => {
    setFeedData(prev => ({
      ...prev,
      [feedKey]: { ...prev[feedKey], [field]: value },
    }));
  };

  const updateAnimalData = (field, value) => {
    setAnimalData(prev => ({ ...prev, [field]: value }));
  };

  const handleAnimalSelection = (animalId) => {
    const selectedAnimal = livestock.find(animal => animal.id === animalId);
    if (selectedAnimal) {
      const specificType = getSpecificAnimalType(selectedAnimal);

      setAnimalData(prev => ({
        ...prev,
        id: animalId,
        type: specificType,
        lifecycleStages: [], // Reset lifecycle stages when animal changes
      }));
    }
  };

  const handleGroupSelection = (groupId) => {
    const selectedGroup = livestock.find(animal => animal.id === groupId);
    if (selectedGroup) {
      const specificType = getSpecificAnimalType(selectedGroup);

      setAnimalData(prev => ({
        ...prev,
        groupId: groupId,
        groupType: specificType,
        groupLifecycleStages: [], // Reset lifecycle stages when group changes
      }));
    }
  };
  const renderAnimalSelectionSection = () => {
    // Check if no livestock exists
    if (livestock.length === 0 && !loadingLivestock) {
      return (
        <VStack space={4}>
          <Box bg={COLORS.lightYellow || '#FFF3CD'} p={4} borderRadius={12} borderWidth={1} borderColor={COLORS.orange || '#F0AD4E'}>
            <HStack alignItems="center" space={3}>
              <Text style={{ fontSize: 20 }}>⚠️</Text>
              <VStack flex={1}>
                <Text style={[styles.formLabel, { color: COLORS.orange || '#856404' }]}>
                  No Livestock Found
                </Text>
                <Text style={[styles.helpText, { color: COLORS.orange || '#856404' }]}>
                  You need to register livestock before creating a feeding program.
                  Please add animals to your farm first.
                </Text>
              </VStack>
            </HStack>
          </Box>
        </VStack>
      );
    }

    if (programType === 'Single Animal') {
      return (
        <VStack space={4}>
          <FormControl>
            <FormControl.Label style={styles.formLabel}>Select Animal</FormControl.Label>
            {loadingLivestock ? (
              <Center py={8}>
                <ActivityIndicator size="large" color={COLORS.green2} />
                <Text style={styles.loadingText}>Loading animals...</Text>
              </Center>
            ) : (
              <Select
                selectedValue={animalData.id}
                minWidth="100%"
                backgroundColor={COLORS.lightGreen}
                borderColor="transparent"
                borderRadius={12}
                placeholder="Choose an animal"
                fontSize={14}
                _focus={{ borderColor: COLORS.green2, backgroundColor: 'white' }}
                onValueChange={handleAnimalSelection}>
                {getAnimalOptions().map(animal => (
                  <Select.Item
                    key={animal.id}
                    label={animal.displayName}
                    value={animal.id}
                  />
                ))}
              </Select>
            )}
          </FormControl>

          {animalData.type && (
            <FormControl>
              <FormControl.Label style={styles.formLabel}>Lifecycle Stages</FormControl.Label>
              <Text style={styles.helpText}>
                Select applicable stages for your {animalData.type}
              </Text>
              {getLifecycleOptions(animalData.type).length > 0 ? (
                renderSelectionButtons(
                  getLifecycleOptions(animalData.type),
                  animalData.lifecycleStages,
                  (stage) => toggleSelection(stage, 'lifecycleStages')
                )
              ) : (
                <Text style={styles.helpText}>
                  No lifecycle stages available for {animalData.type}
                </Text>
              )}
            </FormControl>
          )}
        </VStack>
      );
    } else {
      return (
        <VStack space={4}>
          <FormControl>
            <FormControl.Label style={styles.formLabel}>Select Group</FormControl.Label>
            {loadingLivestock ? (
              <Center py={8}>
                <ActivityIndicator size="large" color={COLORS.green2} />
                <Text style={styles.loadingText}>Loading groups...</Text>
              </Center>
            ) : (
              <Select
                selectedValue={animalData.groupId}
                minWidth="100%"
                backgroundColor={COLORS.lightGreen}
                borderColor="transparent"
                borderRadius={12}
                placeholder="Choose a group"
                fontSize={14}
                _focus={{ borderColor: COLORS.green2, backgroundColor: 'white' }}
                onValueChange={handleGroupSelection}>
                {getAnimalOptions().map(group => (
                  <Select.Item
                    key={group.id}
                    label={group.displayName}
                    value={group.id}
                  />
                ))}
              </Select>
            )}
          </FormControl>

          {animalData.groupType && (
            <FormControl>
              <FormControl.Label style={styles.formLabel}>Lifecycle Stages</FormControl.Label>
              <Text style={styles.helpText}>
                Select applicable stages for your {animalData.groupType}
              </Text>
              {getLifecycleOptions(animalData.groupType, true).length > 0 ? (
                renderSelectionButtons(
                  getLifecycleOptions(animalData.groupType, true),
                  animalData.groupLifecycleStages,
                  (stage) => toggleSelection(stage, 'groupLifecycleStages')
                )
              ) : (
                <Text style={styles.helpText}>
                  No lifecycle stages available for {animalData.groupType}
                </Text>
              )}
            </FormControl>
          )}
        </VStack>
      );
    }
  };
  const validateStep1 = () => {
    if (!programType) {
      Alert.alert('Validation Error', 'Please select a program type to continue');
      return false;
    }

    if (programType === 'Single Animal') {
      if (!animalData.id) {
        Alert.alert('Validation Error', 'Please select an animal for your feeding program');
        return false;
      }
      if (!animalData.type) {
        Alert.alert('Validation Error', 'Please select an animal type');
        return false;
      }
      if (animalData.lifecycleStages.length === 0) {
        Alert.alert('Validation Error', 'Please select at least one lifecycle stage for your animal');
        return false;
      }
    } else if (programType === 'Group') {
      if (!animalData.groupId) {
        Alert.alert('Validation Error', 'Please select a group for your feeding program');
        return false;
      }
      if (!animalData.groupType) {
        Alert.alert('Validation Error', 'Please select a group type');
        return false;
      }
      if (animalData.groupLifecycleStages.length === 0) {
        Alert.alert('Validation Error', 'Please select at least one lifecycle stage for your group');
        return false;
      }
    }

    return true;
  };

  const validateStep2 = () => {
    if (!feedType) {
      Alert.alert('Validation Error', 'Please select a feed type for your program');
      return false;
    }

    if (!feedData.basal.feedType || !feedData.basal.source || !feedData.basal.schedule) {
      Alert.alert('Validation Error', 'Please complete all required basal feed fields (Type, Source, Schedule)');
      return false;
    }

    if (feedType === 'Basal Feed + Concentrates + Supplements') {
      if (!feedData.concentrate.feedType || !feedData.concentrate.source || !feedData.concentrate.schedule) {
        Alert.alert('Validation Error', 'Please complete all required concentrate feed fields');
        return false;
      }
      if (!feedData.supplement.feedType || !feedData.supplement.source || !feedData.supplement.schedule) {
        Alert.alert('Validation Error', 'Please complete all required supplement feed fields');
        return false;
      }
    }

    if (timeOfDay.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one feeding time');
      return false;
    }

    return true;
  };

  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setSubmitting(true);
    try {
      const feedingProgramData = {
        programType,
        animalId: programType === 'Single Animal' ? animalData.id : null,
        animalType: programType === 'Single Animal' ? animalData.type : null,
        lifecycleStages: programType === 'Single Animal' ? animalData.lifecycleStages : [],
        groupId: programType === 'Group' ? animalData.groupId : null,
        groupType: programType === 'Group' ? animalData.groupType : null,
        groupLifecycleStages: programType === 'Group' ? animalData.groupLifecycleStages : [],
        feedType,
        basal: {
          ...feedData.basal,
          quantity: parseFloat(feedData.basal.quantity) || 0,
          cost: parseFloat(feedData.basal.cost) || 0,
          date: feedData.basal.date.toISOString(),
        },
        concentrate: feedType === 'Basal Feed + Concentrates + Supplements' ? {
          ...feedData.concentrate,
          quantity: parseFloat(feedData.concentrate.quantity) || 0,
          cost: parseFloat(feedData.concentrate.cost) || 0,
          date: feedData.concentrate.date.toISOString(),
        } : null,
        supplement: feedType === 'Basal Feed + Concentrates + Supplements' ? {
          ...feedData.supplement,
          quantity: parseFloat(feedData.supplement.quantity) || 0,
          cost: parseFloat(feedData.supplement.cost) || 0,
          date: feedData.supplement.date.toISOString(),
        } : null,
        timeOfDay,
        notes,
      };

      console.log('Submitting feeding program:', feedingProgramData);

      const result = await createFeedingProgram(feedingProgramData);

      if (result.error) {
        Alert.alert('Error', result.error);
      } else {
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Error creating feeding program:', error);
      Alert.alert('Error', 'Failed to create feeding program. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderFeedForm = (feedKey, title, icon) => (
    <Box bg="white" p={6} borderRadius={16} shadow={2} mb={6}>
      <HStack alignItems="center" mb={4}>
        <Box bg={COLORS.lightGreen} p={2} borderRadius={8} mr={3}>
          <Text style={styles.feedIcon}>{icon}</Text>
        </Box>
        <Text style={styles.feedSectionTitle}>{title}</Text>
      </HStack>

      <VStack space={4}>
        <HStack space={3}>
          <FormControl flex={1} isRequired>
            <FormControl.Label style={styles.formLabel}>Feed Type</FormControl.Label>
            <Input
              backgroundColor={COLORS.lightGreen}
              borderColor="transparent"
              borderRadius={12}
              placeholder="e.g., Hay, Pellets, Grain"
              value={feedData[feedKey].feedType}
              onChangeText={value => updateFeedData(feedKey, 'feedType', value)}
              fontSize={14}
              _focus={{ borderColor: COLORS.green2, backgroundColor: 'white' }}
            />
          </FormControl>

          <FormControl flex={1} isRequired>
            <FormControl.Label style={styles.formLabel}>Source</FormControl.Label>
            <Select
              selectedValue={feedData[feedKey].source}
              minWidth="100%"
              backgroundColor={COLORS.lightGreen}
              borderColor="transparent"
              borderRadius={12}
              placeholder="Select Source"
              fontSize={14}
              _focus={{ borderColor: COLORS.green2, backgroundColor: 'white' }}
              onValueChange={value => updateFeedData(feedKey, 'source', value)}>
              {['Personally Grown', 'Grown and Purchased', 'Purely Purchased'].map(
                source => (
                  <Select.Item key={source} label={source} value={source} />
                ),
              )}
            </Select>
          </FormControl>
        </HStack>

        <HStack space={3}>
          <FormControl flex={1} isRequired>
            <FormControl.Label style={styles.formLabel}>Schedule</FormControl.Label>
            <Select
              selectedValue={feedData[feedKey].schedule}
              minWidth="100%"
              backgroundColor={COLORS.lightGreen}
              borderColor="transparent"
              borderRadius={12}
              placeholder="Select Schedule"
              fontSize={14}
              _focus={{ borderColor: COLORS.green2, backgroundColor: 'white' }}
              onValueChange={value => updateFeedData(feedKey, 'schedule', value)}>
              {['Daily', 'Twice Daily', 'Three Times Daily', 'Weekly'].map(
                schedule => (
                  <Select.Item key={schedule} label={schedule} value={schedule} />
                ),
              )}
            </Select>
          </FormControl>

          <FormControl flex={1}>
            <FormControl.Label style={styles.formLabel}>Quantity (kg)</FormControl.Label>
            <Input
              backgroundColor={COLORS.lightGreen}
              borderColor="transparent"
              borderRadius={12}
              placeholder="Amount"
              keyboardType="numeric"
              fontSize={14}
              value={feedData[feedKey].quantity}
              onChangeText={value => updateFeedData(feedKey, 'quantity', value)}
              _focus={{ borderColor: COLORS.green2, backgroundColor: 'white' }}
            />
          </FormControl>
        </HStack>

        <HStack space={3}>
          <FormControl flex={1}>
            <FormControl.Label style={styles.formLabel}>Date Acquired</FormControl.Label>
            <HStack alignItems="center" space={2}>
              <Input
                flex={1}
                backgroundColor={COLORS.lightGreen}
                borderColor="transparent"
                borderRadius={12}
                fontSize={14}
                value={feedData[feedKey].date.toLocaleDateString('en-GB')}
                isReadOnly
                _focus={{ borderColor: COLORS.green2, backgroundColor: 'white' }}
              />
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() =>
                  setDatePickerVisible({ ...datePickerVisible, [feedKey]: true })
                }>
                <FastImage
                  source={icons.calendar}
                  style={styles.calendarIcon}
                  tintColor={COLORS.green2}
                />
              </TouchableOpacity>
            </HStack>
            {datePickerVisible[feedKey] && (
              <DateTimePicker
                value={feedData[feedKey].date}
                mode="date"
                display="default"
                onChange={(event, date) => handleDateChange(feedKey, date)}
              />
            )}
          </FormControl>

          <FormControl flex={1}>
            <FormControl.Label style={styles.formLabel}>Cost</FormControl.Label>
            <Input
              backgroundColor={COLORS.lightGreen}
              borderColor="transparent"
              borderRadius={12}
              placeholder="Amount"
              keyboardType="numeric"
              fontSize={14}
              value={feedData[feedKey].cost}
              onChangeText={value => updateFeedData(feedKey, 'cost', value)}
              _focus={{ borderColor: COLORS.green2, backgroundColor: 'white' }}
            />
          </FormControl>
        </HStack>

        <FormControl>
          <FormControl.Label style={styles.formLabel}>Supplier</FormControl.Label>
          <Input
            backgroundColor={COLORS.lightGreen}
            borderColor="transparent"
            borderRadius={12}
            placeholder="Enter supplier name"
            fontSize={14}
            value={feedData[feedKey].supplier}
            onChangeText={value => updateFeedData(feedKey, 'supplier', value)}
            _focus={{ borderColor: COLORS.green2, backgroundColor: 'white' }}
          />
        </FormControl>
      </VStack>
    </Box>
  );

  const renderSelectionButtons = (options, selectedValues, onToggle) => (
    <Box>
      <HStack flexWrap="wrap" space={2}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.chipButton,
              selectedValues.includes(option) && styles.selectedChip,
              { marginBottom: 8 }
            ]}
            onPress={() => onToggle(option)}>
            <Text
              style={[
                styles.chipText,
                selectedValues.includes(option) && styles.selectedChipText,
              ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </HStack>
    </Box>
  );

  const renderStep1 = () => (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Box bg="white" p={6} borderRadius={16} shadow={2} mb={6}>
        <HStack alignItems="center" mb={4}>
          <Box bg={COLORS.lightGreen} p={2} borderRadius={8} mr={3}>
            <Text style={styles.sectionIcon}>🎯</Text>
          </Box>
          <VStack flex={1}>
            <Text style={styles.sectionTitle}>Program Type</Text>
            <Text style={styles.sectionSubtitle}>Choose your feeding program type</Text>
          </VStack>
        </HStack>

        <Radio.Group
          name="programType"
          value={programType}
          onChange={setProgramType}>
          <VStack space={3}>
            <Box style={styles.radioContainer}>
              <Radio value="Single Animal" my={1} colorScheme="green">
                <VStack ml={3}>
                  <Text style={styles.radioTitle}>Single Animal</Text>
                  <Text style={styles.radioSubtitle}>Create a feeding program for one animal</Text>
                </VStack>
              </Radio>
            </Box>
            <Box style={styles.radioContainer}>
              <Radio value="Group" my={1} colorScheme="green">
                <VStack ml={3}>
                  <Text style={styles.radioTitle}>Group</Text>
                  <Text style={styles.radioSubtitle}>Create a feeding program for a group of animals</Text>
                </VStack>
              </Radio>
            </Box>
          </VStack>
        </Radio.Group>
      </Box>

      {programType && (
        <Box bg="white" p={6} borderRadius={16} shadow={2} mb={6}>
          <HStack alignItems="center" mb={4}>
            <Box bg={COLORS.lightGreen} p={2} borderRadius={8} mr={3}>
              <Text style={styles.sectionIcon}>🐄</Text>
            </Box>
            <VStack flex={1}>
              <Text style={styles.sectionTitle}>
                {programType === 'Single Animal' ? 'Animal Selection' : 'Group Selection'}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {programType === 'Single Animal'
                  ? 'Select the animal for this program'
                  : 'Select the group for this program'}
              </Text>
            </VStack>
          </HStack>

          {renderAnimalSelectionSection()}
        </Box>
      )}
      <HStack justifyContent="flex-end" mt={4}>
        <TouchableOpacity
          style={[styles.nextButton, !programType && styles.disabledButton]}
          onPress={nextStep}
          disabled={!programType}>
          <Text style={styles.nextButtonText}>Next Step →</Text>
        </TouchableOpacity>
      </HStack>
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* Feed Type Selection */}
      <Box bg="white" p={6} borderRadius={16} shadow={2} mb={6}>
        <HStack alignItems="center" mb={4}>
          <Box bg={COLORS.lightGreen} p={2} borderRadius={8} mr={3}>
            <Text style={styles.sectionIcon}>🌾</Text>
          </Box>
          <VStack flex={1}>
            <Text style={styles.sectionTitle}>Feed Configuration</Text>
            <Text style={styles.sectionSubtitle}>Choose your feed type and details</Text>
          </VStack>
        </HStack>

        <Radio.Group
          name="feedType"
          value={feedType}
          onChange={setFeedType}>
          <VStack space={3}>
            <Box style={styles.radioContainer}>
              <Radio value="Basal Feed Only" my={1} colorScheme="green">
                <VStack ml={3}>
                  <Text style={styles.radioTitle}>Basal Feed Only</Text>
                  <Text style={styles.radioSubtitle}>Simple feeding with basic feed</Text>
                </VStack>
              </Radio>
            </Box>
            <Box style={styles.radioContainer}>
              <Radio value="Basal Feed + Concentrates + Supplements" my={1} colorScheme="green">
                <VStack ml={3}>
                  <Text style={styles.radioTitle}>Complete Feed Program</Text>
                  <Text style={styles.radioSubtitle}>Basal feed with concentrates and supplements</Text>
                </VStack>
              </Radio>
            </Box>
          </VStack>
        </Radio.Group>
      </Box>

      {/* Feed Forms */}
      {feedType && (
        <>
          {renderFeedForm('basal', 'Basal Feed', '🌾')}

          {feedType === 'Basal Feed + Concentrates + Supplements' && (
            <>
              {renderFeedForm('concentrate', 'Concentrate Feed', '🥗')}
              {renderFeedForm('supplement', 'Supplement Feed', '💊')}
            </>
          )}

          {/* Feeding Schedule */}
          <Box bg="white" p={6} borderRadius={16} shadow={2} mb={6}>
            <HStack alignItems="center" mb={4}>
              <Box bg={COLORS.lightGreen} p={2} borderRadius={8} mr={3}>
                <Text style={styles.sectionIcon}>⏰</Text>
              </Box>
              <VStack flex={1}>
                <Text style={styles.sectionTitle}>Feeding Schedule</Text>
                <Text style={styles.sectionSubtitle}>When do you plan to feed?</Text>
              </VStack>
            </HStack>

            <VStack space={3}>
              <Text style={styles.formLabel}>Time of Day</Text>
              <HStack flexWrap="wrap" space={2}>
                {['Morning', 'Afternoon', 'Evening', 'Night'].map(time => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeChip,
                      timeOfDay.includes(time) && styles.selectedTimeChip,
                    ]}
                    onPress={() => toggleTimeOfDay(time)}>
                    <Text
                      style={[
                        styles.timeChipText,
                        timeOfDay.includes(time) && styles.selectedTimeChipText,
                      ]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </HStack>
            </VStack>
          </Box>

          {/* Additional Notes */}
          <Box bg="white" p={6} borderRadius={16} shadow={2} mb={6}>
            <HStack alignItems="center" mb={4}>
              <Box bg={COLORS.lightGreen} p={2} borderRadius={8} mr={3}>
                <Text style={styles.sectionIcon}>📝</Text>
              </Box>
              <VStack flex={1}>
                <Text style={styles.sectionTitle}>Additional Notes</Text>
                <Text style={styles.sectionSubtitle}>Any special instructions or comments</Text>
              </VStack>
            </HStack>

            <TextArea
              backgroundColor={COLORS.lightGreen}
              borderColor="transparent"
              borderRadius={12}
              placeholder="Add any additional notes about this feeding program..."
              value={notes}
              onChangeText={setNotes}
              fontSize={14}
              numberOfLines={4}
              _focus={{ borderColor: COLORS.green2, backgroundColor: 'white' }}
            />
          </Box>
        </>
      )}

      {/* Navigation */}
      <HStack justifyContent="space-between" mt={4}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={prevStep}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!feedType || timeOfDay.length === 0) && styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={!feedType || timeOfDay.length === 0 || submitting}>
          {submitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Create Program</Text>
          )}
        </TouchableOpacity>
      </HStack>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader
        title="Farm Feeds"
        onBackPress={() => navigation.goBack()}
        backgroundColor={COLORS.lightGreen}
      />

      <View style={styles.stepIndicator}>
        <HStack space={4} alignItems="center" justifyContent="center">
          <Box style={[styles.stepCircle, currentStep >= 1 && styles.activeStep]}>
            <Text style={[styles.stepNumber, currentStep >= 1 && styles.activeStepNumber]}>1</Text>
          </Box>
          <Box style={[styles.stepLine, currentStep >= 2 && styles.activeStepLine]} />
          <Box style={[styles.stepCircle, currentStep >= 2 && styles.activeStep]}>
            <Text style={[styles.stepNumber, currentStep >= 2 && styles.activeStepNumber]}>2</Text>
          </Box>
        </HStack>
      </View>

      <View style={styles.content}>
        {currentStep === 1 ? renderStep1() : renderStep2()}
      </View>

      {/* Success Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Success!</Text>
            <Text style={styles.modalMessage}>
              Your feeding program has been created successfully.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                navigation.goBack();
              }}>
              <Text style={styles.modalButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGreen,
  },
  stepIndicator: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStep: {
    backgroundColor: COLORS.green2,
  },
  stepNumber: {
    color: COLORS.gray,
    fontWeight: 'bold',
    fontSize: 16,
  },
  activeStepNumber: {
    color: 'white',
  },
  stepLine: {
    height: 2,
    width: 50,
    backgroundColor: COLORS.lightGray,
  },
  activeStepLine: {
    backgroundColor: COLORS.green2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  radioContainer: {
    backgroundColor: COLORS.lightGreen,
    borderRadius: 12,
    padding: 12,
  },
  radioTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  radioSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 2,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 8,
  },
  chipButton: {
    backgroundColor: COLORS.lightGreen,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.green2,
  },
  selectedChip: {
    backgroundColor: COLORS.green2,
  },
  chipText: {
    fontSize: 14,
    color: COLORS.green2,
    fontWeight: '500',
  },
  selectedChipText: {
    color: 'white',
  },
  feedIcon: {
    fontSize: 18,
  },
  feedSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  dateButton: {
    backgroundColor: COLORS.lightGreen,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  calendarIcon: {
    width: 20,
    height: 20,
  },
  timeChip: {
    backgroundColor: COLORS.lightGreen,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.green2,
  },
  selectedTimeChip: {
    backgroundColor: COLORS.green2,
  },
  timeChipText: {
    fontSize: 14,
    color: COLORS.green2,
    fontWeight: '500',
  },
  selectedTimeChipText: {
    color: 'white',
  },
  nextButton: {
    backgroundColor: COLORS.green2,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backButtonText: {
    color: COLORS.gray,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: COLORS.green2,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 140,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: COLORS.lightGray,
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: COLORS.black,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: COLORS.gray,
  },
  modalButton: {
    backgroundColor: COLORS.green2,
    borderRadius: 20,
    padding: 15,
    elevation: 2,
    minWidth: 120,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default FarmFeedsScreen;