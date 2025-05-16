import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
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

const FarmFeedsScreen = ({ navigation }) => {
  // Main state
  const [currentStep, setCurrentStep] = useState(1);
  const [programType, setProgramType] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState([]);

  // Animal/Group state
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
    if (animalData.type)
      setAnimalData(prev => ({ ...prev, lifecycleStages: [] }));
    if (animalData.groupType)
      setAnimalData(prev => ({ ...prev, groupLifecycleStages: [] }));
  }, [animalData.type, animalData.groupType]);

  const getLifecycleOptions = (type, isGroup = false) => {
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

  // Update feed data
  const updateFeedData = (feedKey, field, value) => {
    setFeedData(prev => ({
      ...prev,
      [feedKey]: { ...prev[feedKey], [field]: value },
    }));
  };

  const updateAnimalData = (field, value) => {
    setAnimalData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    return true;
  };

  const validateStep2 = () => {
    return true;
  };

  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) setCurrentStep(2);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    setModalVisible(true);
  };

  const renderFeedForm = (feedKey, title) => (
    <Box bg="white" p={4} borderRadius={8} shadow={1} mb={4}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <FormControl mb={4}>
        <FormControl.Label>Type of Feed</FormControl.Label>
        <Input
          backgroundColor={COLORS.lightGreen}
          placeholder="Enter Feed Type"
          value={feedData[feedKey].feedType}
          onChangeText={value => updateFeedData(feedKey, 'feedType', value)}
        />
      </FormControl>

      <FormControl mb={4}>
        <FormControl.Label>Source of Feed</FormControl.Label>
        <Select
          selectedValue={feedData[feedKey].source}
          minWidth="100%"
          backgroundColor={COLORS.lightGreen}
          placeholder="Select Source"
          onValueChange={value => updateFeedData(feedKey, 'source', value)}>
          {['Personally Grown', 'Grown and Purchased', 'Purely Purchased'].map(
            source => (
              <Select.Item key={source} label={source} value={source} />
            ),
          )}
        </Select>
      </FormControl>

      <FormControl mb={4}>
        <FormControl.Label>Feeding Schedule</FormControl.Label>
        <Select
          selectedValue={feedData[feedKey].schedule}
          minWidth="100%"
          backgroundColor={COLORS.lightGreen}
          placeholder="Select Schedule"
          onValueChange={value => updateFeedData(feedKey, 'schedule', value)}>
          {['Daily', 'Twice Daily', 'Three Times Daily', 'Weekly'].map(
            schedule => (
              <Select.Item key={schedule} label={schedule} value={schedule} />
            ),
          )}
        </Select>
      </FormControl>

      <FormControl mb={4}>
        <FormControl.Label>Quantity (kg)</FormControl.Label>
        <Input
          backgroundColor={COLORS.lightGreen}
          placeholder="Enter Quantity"
          keyboardType="numeric"
          value={feedData[feedKey].quantity}
          onChangeText={value => updateFeedData(feedKey, 'quantity', value)}
        />
      </FormControl>

      <FormControl mb={4}>
        <FormControl.Label>Date Acquired</FormControl.Label>
        <HStack alignItems="center" space={2}>
          <Input
            flex={1}
            backgroundColor={COLORS.lightGreen}
            value={feedData[feedKey].date.toLocaleDateString('en-GB')}
            isReadOnly
          />
          <TouchableOpacity
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

      <FormControl mb={4}>
        <FormControl.Label>Cost</FormControl.Label>
        <Input
          backgroundColor={COLORS.lightGreen}
          placeholder="Enter Cost"
          keyboardType="numeric"
          value={feedData[feedKey].cost}
          onChangeText={value => updateFeedData(feedKey, 'cost', value)}
        />
      </FormControl>

      <FormControl mb={4}>
        <FormControl.Label>Supplier</FormControl.Label>
        <Input
          backgroundColor={COLORS.lightGreen}
          placeholder="Enter Supplier"
          value={feedData[feedKey].supplier}
          onChangeText={value => updateFeedData(feedKey, 'supplier', value)}
        />
      </FormControl>
    </Box>
  );

  const renderSelectionButtons = (options, selectedValues, onToggle) => (
    <VStack space={2}>
      {options.map(option => (
        <TouchableOpacity
          key={option}
          style={[
            styles.selectionButton,
            selectedValues.includes(option) && styles.selectedButton,
          ]}
          onPress={() => onToggle(option)}>
          <Text
            style={[
              styles.selectionText,
              selectedValues.includes(option) && styles.selectedText,
            ]}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </VStack>
  );

  // Render step 1 content
  const renderStep1 = () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Box bg="white" p={4} borderRadius={8} shadow={1} mb={4}>
        <Text style={styles.sectionTitle}>Feeding Program Selection</Text>

        <FormControl mb={4}>
          <FormControl.Label>Program Type</FormControl.Label>
          <Radio.Group
            name="programType"
            value={programType}
            onChange={setProgramType}>
            <VStack space={2}>
              <Radio value="Single Animal" my={1}>
                Single Animal Feeding Program
              </Radio>
              <Radio value="Group" my={1}>
                Group Feeding Program
              </Radio>
            </VStack>
          </Radio.Group>
        </FormControl>
      </Box>

      {programType === 'Single Animal' && (
        <Box bg="white" p={4} borderRadius={8} shadow={1} mb={4}>
          <Text style={styles.sectionTitle}>Single Animal Details</Text>

          <FormControl mb={4}>
            <FormControl.Label>Animal ID</FormControl.Label>
            <Input
              backgroundColor={COLORS.lightGreen}
              placeholder="Enter Animal ID"
              value={animalData.id}
              onChangeText={value => updateAnimalData('id', value)}
            />
          </FormControl>

          <FormControl mb={4}>
            <FormControl.Label>Animal Type</FormControl.Label>
            <Select
              selectedValue={animalData.type}
              minWidth="100%"
              backgroundColor={COLORS.lightGreen}
              placeholder="Select Animal Type"
              onValueChange={value => updateAnimalData('type', value)}>
              {['Dairy', 'Beef', 'Swine', 'Sheep and Goats'].map(type => (
                <Select.Item key={type} label={type} value={type} />
              ))}
            </Select>
          </FormControl>

          {animalData.type && (
            <FormControl mb={4}>
              <FormControl.Label>Lifecycle Stage</FormControl.Label>
              {renderSelectionButtons(
                getLifecycleOptions(animalData.type),
                animalData.lifecycleStages,
                stage => toggleSelection(stage, 'lifecycleStages'),
              )}
            </FormControl>
          )}

          <Center mt={6}>
            <HStack space={4} justifyContent="center">
              <Button
                variant="outline"
                borderColor={COLORS.green}
                _text={{ color: COLORS.green }}
                borderRadius={8}
                onPress={() => navigation.goBack()}>
                Cancel
              </Button>
              <Button
                backgroundColor={COLORS.green}
                borderRadius={8}
                onPress={nextStep}>
                Next
              </Button>
            </HStack>
          </Center>
        </Box>
      )}

      {programType === 'Group' && (
        <Box bg="white" p={4} borderRadius={8} shadow={1} mb={4}>
          <Text style={styles.sectionTitle}>Group Details</Text>

          <FormControl mb={4}>
            <FormControl.Label>Group ID</FormControl.Label>
            <Input
              backgroundColor={COLORS.lightGreen}
              placeholder="Enter Group ID"
              value={animalData.groupId}
              onChangeText={value => updateAnimalData('groupId', value)}
            />
          </FormControl>

          <FormControl mb={4}>
            <FormControl.Label>Group Type</FormControl.Label>
            <Select
              selectedValue={animalData.groupType}
              minWidth="100%"
              backgroundColor={COLORS.lightGreen}
              placeholder="Select Group Type"
              onValueChange={value => updateAnimalData('groupType', value)}>
              {['Poultry', 'Dairy', 'Beef', 'Swine', 'Sheep and Goats'].map(
                type => (
                  <Select.Item key={type} label={type} value={type} />
                ),
              )}
            </Select>
          </FormControl>

          {animalData.groupType && (
            <FormControl mb={4}>
              <FormControl.Label>Lifecycle Stage</FormControl.Label>
              {renderSelectionButtons(
                getLifecycleOptions(animalData.groupType, true),
                animalData.groupLifecycleStages,
                stage => toggleSelection(stage, 'groupLifecycleStages'),
              )}
            </FormControl>
          )}

          <Center mt={6}>
            <HStack space={4} justifyContent="center">
              <Button
                variant="outline"
                borderColor={COLORS.green}
                _text={{ color: COLORS.green }}
                borderRadius={8}
                onPress={() => navigation.goBack()}>
                Cancel
              </Button>
              <Button
                backgroundColor={COLORS.green}
                borderRadius={8}
                onPress={nextStep}>
                Next
              </Button>
            </HStack>
          </Center>
        </Box>
      )}
    </ScrollView>
  );

  // Render step 2 content
  const renderStep2 = () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Box bg="white" p={4} borderRadius={8} shadow={1} mb={4}>
        <Text style={styles.sectionTitle}>Feeding Types</Text>

        <FormControl mb={4}>
          <FormControl.Label>Type of Feeds</FormControl.Label>
          <Radio.Group name="feedType" value={feedType} onChange={setFeedType}>
            <VStack space={2}>
              <Radio value="Basal Feeds" my={1}>
                Basal Feeds
              </Radio>
              <Radio value="Basal Feed + Concentrates + Supplements" my={1}>
                Basal Feed + Concentrates + Supplements
              </Radio>
            </VStack>
          </Radio.Group>
        </FormControl>
      </Box>

      {renderFeedForm('basal', 'Basal Feed Details')}

      {feedType === 'Basal Feed + Concentrates + Supplements' && (
        <>
          {renderFeedForm('concentrate', 'Concentrate Details')}
          {renderFeedForm('supplement', 'Supplement Details')}
        </>
      )}

      <Box bg="white" p={4} borderRadius={8} shadow={1} mb={4}>
        <Text style={styles.sectionTitle}>Feeding Time</Text>

        <FormControl mb={4}>
          <FormControl.Label>Time of Day</FormControl.Label>
          {renderSelectionButtons(
            ['Morning', 'Afternoon', 'Evening', 'Night'],
            timeOfDay,
            toggleTimeOfDay,
          )}
        </FormControl>
      </Box>

      <Box bg="white" p={4} borderRadius={8} shadow={1} mb={4}>
        <Text style={styles.sectionTitle}>Notes</Text>
        <FormControl mb={4}>
          <TextArea
            backgroundColor={COLORS.lightGreen}
            h={20}
            placeholder="Additional notes or instructions..."
          />
        </FormControl>

        <Center mt={6}>
          <HStack space={4} justifyContent="center">
            <Button
              variant="outline"
              borderColor={COLORS.green}
              _text={{ color: COLORS.green }}
              borderRadius={8}
              onPress={prevStep}>
              Back
            </Button>
            <Button
              variant="outline"
              borderColor={COLORS.green}
              _text={{ color: COLORS.green }}
              borderRadius={8}
              onPress={() => navigation.goBack()}>
              Cancel
            </Button>
            <Button
              backgroundColor={COLORS.green}
              borderRadius={8}
              onPress={handleSubmit}>
              Submit
            </Button>
          </HStack>
        </Center>
      </Box>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader
        title="Create Feeding Program"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.stepIndicator}>
        <View style={[styles.step, currentStep >= 1 && styles.activeStep]}>
          <Text
            style={[
              styles.stepText,
              currentStep >= 1 && styles.activeStepText,
            ]}>
            1
          </Text>
        </View>
        <View style={styles.stepLine} />
        <View style={[styles.step, currentStep >= 2 && styles.activeStep]}>
          <Text
            style={[
              styles.stepText,
              currentStep >= 2 && styles.activeStepText,
            ]}>
            2
          </Text>
        </View>
      </View>

      {currentStep === 1 ? renderStep1() : renderStep2()}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FastImage
              source={icons.tick}
              style={styles.successIcon}
              tintColor={COLORS.green}
            />
            <Text style={styles.modalText}>
              Your feeding program has been successfully created and saved.
            </Text>
            <Button
              backgroundColor={COLORS.green}
              borderRadius={8}
              mt={4}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate('FeedingModuleScreen');
              }}>
              Done
            </Button>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  step: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStep: { backgroundColor: COLORS.green },
  stepText: { fontSize: 16, fontWeight: 'bold', color: '#777' },
  activeStepText: { color: 'white' },
  stepLine: { flex: 0.2, height: 2, backgroundColor: '#E0E0E0' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: COLORS.green2,
  },
  selectionButton: {
    backgroundColor: COLORS.lightGreen,
    padding: 10,
    borderRadius: 5,
    marginBottom: 8,
  },
  selectedButton: { backgroundColor: COLORS.green },
  selectionText: { color: COLORS.green2 },
  selectedText: { color: 'white' },
  calendarIcon: { width: 24, height: 24 },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  successIcon: {
    width: 60,
    height: 60,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.green,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
});

export default FarmFeedsScreen;
