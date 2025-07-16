import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
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
import { getFeedingProgramById, updateFeedingProgram } from '../../../services/feeding';

const EditFeedingRequirementScreen = ({ navigation, route }) => {
  const { programId } = route.params;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [livestock, setLivestock] = useState([]);
  const [loadingLivestock, setLoadingLivestock] = useState(true);

  const [programData, setProgramData] = useState({
    programType: '',
    animalId: '',
    animalType: '',
    lifecycleStages: [],
    groupId: '',
    groupType: '',
    groupLifecycleStages: [],
    feedType: '',
    timeOfDay: [],
    notes: '',
  });

  const [feedData, setFeedData] = useState({
    basal: {
      id: null,
      feedType: '',
      source: '',
      schedule: '',
      quantity: '',
      date: new Date(),
      cost: '',
      supplier: '',
    },
    concentrate: {
      id: null,
      feedType: '',
      source: '',
      schedule: '',
      quantity: '',
      date: new Date(),
      cost: '',
      supplier: '',
    },
    supplement: {
      id: null,
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
    const loadData = async () => {
      await Promise.all([
        fetchLivestock(),
        fetchFeedingProgram()
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  const fetchLivestock = async () => {
    try {
      setLoadingLivestock(true);
      const livestockData = await getLivestockForActiveFarm();
      setLivestock(livestockData);
    } catch (error) {
      console.error('Error fetching livestock:', error);
      Alert.alert('Error', 'Failed to load livestock data');
    } finally {
      setLoadingLivestock(false);
    }
  };

  const fetchFeedingProgram = async () => {
    try {
      const response = await getFeedingProgramById(programId);
      const program = response.data || response;

      // Set program data
      setProgramData({
        programType: program.programType || '',
        animalId: program.animalId || '',
        animalType: program.animalType || '',
        lifecycleStages: program.lifecycleStages || [],
        groupId: program.groupId || '',
        groupType: program.groupType || '',
        groupLifecycleStages: program.groupLifecycleStages || [],
        feedType: program.feedType || '',
        timeOfDay: program.timeOfDay || [],
        notes: program.notes || '',
      });

      // Transform feedDetails back to the component structure
      const feedDetails = program.feedDetails || [];
      const newFeedData = { ...feedData };

      feedDetails.forEach(feed => {
        const feedKey = feed.feedType.toLowerCase();
        if (newFeedData[feedKey]) {
          newFeedData[feedKey] = {
            id: feed.id || null,
            feedType: feed.feedType || '',
            source: feed.source || '',
            schedule: feed.schedule || '',
            quantity: feed.quantity?.toString() || '',
            date: feed.date ? new Date(feed.date) : new Date(),
            cost: feed.cost?.toString() || '',
            supplier: feed.supplier || '',
          };
        }
      });

      setFeedData(newFeedData);
    } catch (error) {
      console.error('Error fetching feeding program:', error);
      Alert.alert('Error', 'Failed to load feeding program data');
      navigation.goBack();
    }
  };

  const getAnimalOptions = () => {
    if (programData.programType === 'Single Animal') {
      return livestock
        .filter(animal => animal.category === 'mammal')
        .map(animal => ({
          id: animal.id,
          idNumber: animal.mammal?.idNumber || animal.id,
          type: animal.type,
          breedType: animal.mammal?.breedType || '',
          gender: animal.mammal?.gender || '',
        }));
    } else if (programData.programType === 'Group') {
      return livestock
        .filter(animal => animal.category === 'poultry')
        .map(animal => ({
          id: animal.id,
          flockId: animal.poultry?.flockId || animal.id,
          type: animal.type,
          breedType: animal.poultry?.breedType || '',
          quantity: animal.poultry?.currentQuantity || animal.poultry?.initialQuantity || 0,
        }));
    }
    return [];
  };

  const getAnimalTypeFromLivestockType = (livestockType) => {
    const typeMapping = {
      'dairyCattle': 'Dairy',
      'beefCattle': 'Beef',
      'swine': 'Swine',
      'sheep': 'Sheep and Goats',
      'goats': 'Sheep and Goats',
      'poultry': 'Poultry',
    };
    return typeMapping[livestockType] || livestockType;
  };

  const getLifecycleOptions = (type) => {
    const options = {
      Dairy: ['Calf', 'Heifer', 'Lactating cows', 'Dry Cows'],
      Beef: ['Starter', 'Grower', 'Finisher'],
      Swine: ['Starter', 'Grower', 'Finisher', 'Breeding herd'],
      'Sheep and Goats': [
        'Lambs and Kids',
        'Growing',
        'Production',
        'Maintenance',
      ],
      Poultry: ['Starter', 'Grower', 'Finisher', 'Layer'],
    };
    return type ? options[type] || [] : [];
  };

  const toggleSelection = (item, field) => {
    setProgramData(prev => {
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
    setProgramData(prev => ({
      ...prev,
      timeOfDay: prev.timeOfDay.includes(time)
        ? prev.timeOfDay.filter(t => t !== time)
        : [...prev.timeOfDay, time],
    }));
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

  const updateProgramData = (field, value) => {
    setProgramData(prev => ({ ...prev, [field]: value }));
  };

  const handleAnimalSelection = (animalId) => {
    const selectedAnimal = livestock.find(animal => animal.id === animalId);
    if (selectedAnimal) {
      const animalType = getAnimalTypeFromLivestockType(selectedAnimal.type);
      setProgramData(prev => ({
        ...prev,
        animalId: animalId,
        animalType: animalType,
        lifecycleStages: [],
      }));
    }
  };

  const handleGroupSelection = (groupId) => {
    const selectedGroup = livestock.find(animal => animal.id === groupId);
    if (selectedGroup) {
      const groupType = getAnimalTypeFromLivestockType(selectedGroup.type);
      setProgramData(prev => ({
        ...prev,
        groupId: groupId,
        groupType: groupType,
        groupLifecycleStages: [],
      }));
    }
  };

  const validateForm = () => {
    if (!programData.programType) {
      Alert.alert('Validation Error', 'Please select a program type');
      return false;
    }

    if (programData.programType === 'Single Animal') {
      if (!programData.animalId) {
        Alert.alert('Validation Error', 'Please select an animal');
        return false;
      }
      if (programData.lifecycleStages.length === 0) {
        Alert.alert('Validation Error', 'Please select at least one lifecycle stage');
        return false;
      }
    } else if (programData.programType === 'Group') {
      if (!programData.groupId) {
        Alert.alert('Validation Error', 'Please select a group');
        return false;
      }
      if (programData.groupLifecycleStages.length === 0) {
        Alert.alert('Validation Error', 'Please select at least one lifecycle stage');
        return false;
      }
    }

    if (!programData.feedType) {
      Alert.alert('Validation Error', 'Please select a feed type');
      return false;
    }

    if (!feedData.basal.feedType || !feedData.basal.source || !feedData.basal.schedule) {
      Alert.alert('Validation Error', 'Please complete all required basal feed fields');
      return false;
    }

    if (programData.feedType === 'Basal Feed + Concentrates + Supplements') {
      if (!feedData.concentrate.feedType || !feedData.concentrate.source || !feedData.concentrate.schedule) {
        Alert.alert('Validation Error', 'Please complete all required concentrate feed fields');
        return false;
      }
      if (!feedData.supplement.feedType || !feedData.supplement.source || !feedData.supplement.schedule) {
        Alert.alert('Validation Error', 'Please complete all required supplement feed fields');
        return false;
      }
    }

    if (programData.timeOfDay.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one feeding time');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const updateData = {
        programType: programData.programType,
        animalId: programData.programType === 'Single Animal' ? programData.animalId : null,
        animalType: programData.programType === 'Single Animal' ? programData.animalType : null,
        lifecycleStages: programData.programType === 'Single Animal' ? programData.lifecycleStages : [],
        groupId: programData.programType === 'Group' ? programData.groupId : null,
        groupType: programData.programType === 'Group' ? programData.groupType : null,
        groupLifecycleStages: programData.programType === 'Group' ? programData.groupLifecycleStages : [],
        feedType: programData.feedType,
        basal: {
          id: feedData.basal.id,
          ...feedData.basal,
          quantity: parseFloat(feedData.basal.quantity) || 0,
          cost: parseFloat(feedData.basal.cost) || 0,
          date: feedData.basal.date.toISOString(),
        },
        concentrate: programData.feedType === 'Basal Feed + Concentrates + Supplements' ? {
          id: feedData.concentrate.id,
          ...feedData.concentrate,
          quantity: parseFloat(feedData.concentrate.quantity) || 0,
          cost: parseFloat(feedData.concentrate.cost) || 0,
          date: feedData.concentrate.date.toISOString(),
        } : null,
        supplement: programData.feedType === 'Basal Feed + Concentrates + Supplements' ? {
          id: feedData.supplement.id,
          ...feedData.supplement,
          quantity: parseFloat(feedData.supplement.quantity) || 0,
          cost: parseFloat(feedData.supplement.cost) || 0,
          date: feedData.supplement.date.toISOString(),
        } : null,
        timeOfDay: programData.timeOfDay,
        notes: programData.notes,
      };

      console.log('Updating feeding program:', updateData);

      const result = await updateFeedingProgram(programId, updateData);

      if (result.error) {
        Alert.alert('Error', result.error);
      } else {
        Alert.alert('Success', 'Feeding program updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Error updating feeding program:', error);
      Alert.alert('Error', 'Failed to update feeding program. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderSelectionButtons = (options, selectedValues, onToggle) => (
    <HStack flexWrap="wrap" space={2}>
      {options.map((option) => (
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
  );

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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <SecondaryHeader
          title="Edit Feeding Program"
          onBackPress={() => navigation.goBack()}
          backgroundColor={COLORS.lightGreen}
        />
        <Center flex={1}>
          <ActivityIndicator size="large" color={COLORS.green2} />
          <Text style={styles.loadingText}>Loading feeding program...</Text>
        </Center>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader
        title="Edit Feeding Program"
        onBackPress={() => navigation.goBack()}
        backgroundColor={COLORS.lightGreen}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContainer}>
        {/* Program Type Section */}
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
            value={programData.programType}
            onChange={value => updateProgramData('programType', value)}>
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

        {/* Animal/Group Selection Section */}
        {programData.programType && (
          <Box bg="white" p={6} borderRadius={16} shadow={2} mb={6}>
            <HStack alignItems="center" mb={4}>
              <Box bg={COLORS.lightGreen} p={2} borderRadius={8} mr={3}>
                <Text style={styles.sectionIcon}>🐄</Text>
              </Box>
              <VStack flex={1}>
                <Text style={styles.sectionTitle}>
                  {programData.programType === 'Single Animal' ? 'Animal Selection' : 'Group Selection'}
                </Text>
                <Text style={styles.sectionSubtitle}>
                  {programData.programType === 'Single Animal'
                    ? 'Select the animal for this program'
                    : 'Select the group for this program'}
                </Text>
              </VStack>
            </HStack>

            {programData.programType === 'Single Animal' ? (
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
                      selectedValue={programData.animalId}
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
                          label={`${animal.idNumber} - ${animal.type} (${animal.breedType})`}
                          value={animal.id}
                        />
                      ))}
                    </Select>
                  )}
                </FormControl>

                {programData.animalType && (
                  <FormControl>
                    <FormControl.Label style={styles.formLabel}>Lifecycle Stages</FormControl.Label>
                    <Text style={styles.helpText}>Select applicable stages for your animal</Text>
                    {renderSelectionButtons(
                      getLifecycleOptions(programData.animalType),
                      programData.lifecycleStages,
                      (stage) => toggleSelection(stage, 'lifecycleStages')
                    )}
                  </FormControl>
                )}
              </VStack>
            ) : (
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
                      selectedValue={programData.groupId}
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
                          label={`${group.flockId} - ${group.type} (${group.quantity} birds)`}
                          value={group.id}
                        />
                      ))}
                    </Select>
                  )}
                </FormControl>

                {programData.groupType && (
                  <FormControl>
                    <FormControl.Label style={styles.formLabel}>Lifecycle Stages</FormControl.Label>
                    <Text style={styles.helpText}>Select applicable stages for your group</Text>
                    {renderSelectionButtons(
                      getLifecycleOptions(programData.groupType),
                      programData.groupLifecycleStages,
                      (stage) => toggleSelection(stage, 'groupLifecycleStages')
                    )}
                  </FormControl>
                )}
              </VStack>
            )}
          </Box>
        )}

        {/* Feed Type Section */}
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
            value={programData.feedType}
            onChange={value => updateProgramData('feedType', value)}>
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
        {programData.feedType && (
          <>
            {renderFeedForm('basal', 'Basal Feed', '🌾')}

            {programData.feedType === 'Basal Feed + Concentrates + Supplements' && (
              <>
                {renderFeedForm('concentrate', 'Concentrate Feed', '🥗')}
                {renderFeedForm('supplement', 'Supplement Feed', '💊')}
              </>
            )}
          </>
        )}

        {/* Feeding Schedule Section */}
        {programData.feedType && (
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
                      programData.timeOfDay.includes(time) && styles.selectedTimeChip,
                    ]}
                    onPress={() => toggleTimeOfDay(time)}>
                    <Text
                      style={[
                        styles.timeChipText,
                        programData.timeOfDay.includes(time) && styles.selectedTimeChipText,
                      ]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </HStack>
            </VStack>
          </Box>
        )}

        {/* Notes Section */}
        <Box bg="white" p={6} borderRadius={16} shadow={2} mb={6}>
          <HStack alignItems="center" mb={4}>
            <Box bg={COLORS.lightGreen} p={2} borderRadius={8} mr={3}>
              <Text style={styles.sectionIcon}>📝</Text>
            </Box>
            <VStack flex={1}>
              <Text style={styles.sectionTitle}>Additional Notes</Text>
              <Text style={styles.sectionSubtitle}>Any special instructions or observations</Text>
            </VStack>
          </HStack>

          <FormControl>
            <TextArea
              h={20}
              placeholder="Enter any additional notes or special instructions..."
              backgroundColor={COLORS.lightGreen}
              borderColor="transparent"
              borderRadius={12}
              fontSize={14}
              value={programData.notes}
              onChangeText={value => updateProgramData('notes', value)}
              _focus={{ borderColor: COLORS.green2, backgroundColor: 'white' }}
            />
          </FormControl>
        </Box>

        {/* Submit Button */}
        <Box mb={8}>
          <Button
            onPress={handleSubmit}
            isLoading={submitting}
            loadingText="Updating..."
            bg={COLORS.green2}
            borderRadius={12}
            py={4}
            _pressed={{ bg: COLORS.green2 }}
            _loading={{ bg: COLORS.green2 }}>
            <Text style={styles.buttonText}>Update Feeding Program</Text>
          </Button>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGreen,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.lightGreen,
  },
  scrollContainer: {
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.green2,
    textAlign: 'center',
  },
  sectionIcon: {
    fontSize: 20,
  },
  feedIcon: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
  },
  feedSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  radioContainer: {
    backgroundColor: COLORS.lightGreen,
    borderRadius: 12,
    padding: 12,
  },
  radioTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
  },
  radioSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 2,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  helpText: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 8,
  },
  chipButton: {
    backgroundColor: COLORS.lightGreen,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.green2,
    marginRight: 8,
  },
  selectedChip: {
    backgroundColor: COLORS.green2,
    borderColor: COLORS.green2,
  },
  chipText: {
    fontSize: 14,
    color: COLORS.green2,
    fontWeight: '500',
  },
  selectedChipText: {
    color: 'white',
  },
  timeChip: {
    backgroundColor: COLORS.lightGreen,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.green2,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTimeChip: {
    backgroundColor: COLORS.green2,
    borderColor: COLORS.green2,
  },
  timeChipText: {
    fontSize: 14,
    color: COLORS.green2,
    fontWeight: '500',
  },
  selectedTimeChipText: {
    color: 'white',
  },
  dateButton: {
    backgroundColor: COLORS.lightGreen,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.green2,
  },
  calendarIcon: {
    width: 20,
    height: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default EditFeedingRequirementScreen;