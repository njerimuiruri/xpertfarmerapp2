import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
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
} from 'native-base';
import DateTimePicker from '@react-native-community/datetimepicker';
import FastImage from 'react-native-fast-image';
import {icons} from '../../../constants';
import {COLORS} from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';

const TIME_OPTIONS = ['Morning', 'Afternoon', 'Evening', 'Night'];
const ANIMAL_TYPES = [
  'Dairy Cattle',
  'Beef Cattle',
  'Poultry',
  'Swine',
  'Sheep',
  'Goats',
];
const FREQUENCY_OPTIONS = [
  'Once Daily',
  'Twice Daily',
  'Three Times Daily',
  'Weekly',
  'Free Choice',
];
const UNIT_OPTIONS = [
  {label: 'kg', value: 'kg'},
  {label: 'g', value: 'g'},
  {label: 'kg per animal', value: 'kg per animal'},
  {label: 'g per animal', value: 'g per animal'},
];
const FEED_SOURCES = [
  'Personally Grown',
  'Grown and Purchased',
  'Purely Purchased',
];
const FEED_SCHEDULES = ['Daily', 'Twice Daily', 'Three Times Daily', 'Weekly'];

// Helper functions
const getLifecycleOptions = type => {
  const options = {
    'Dairy Cattle': ['Calf', 'Heifer', 'Lactating cows', 'Dry Cows'],
    'Beef Cattle': ['Starter', 'Grower', 'Finisher'],
    Swine: ['Starter', 'Grower', 'Finisher', 'Breeding herd'],
    Sheep: ['Lambs and Kids', 'Growing', 'Production', 'Maintenance'],
    Goats: ['Lambs and Kids', 'Growing', 'Production', 'Maintenance'],
    Poultry: ['Starter', 'Grower', 'Finisher', 'Layer'],
    Dairy: ['Calf', 'Heifer', 'Lactating cows', 'Dry Cows'],
    Beef: ['Starter', 'Grower', 'Finisher'],
    'Sheep and Goats': [
      'Lambs and Kids',
      'Growing',
      'Production',
      'Maintenance',
    ],
  };
  return type ? options[type] || [] : [];
};

export default function EditFeedingRequirementScreen({navigation, route}) {
  const {requirement} = route.params;
  const initialTimeOfDay = requirement.timeOfDay || [];
  const initialProgramType =
    requirement.programDetails?.programType || 'Single Animal';

  // Basic state
  const [animalType, setAnimalType] = useState(requirement.animalType || '');
  const [feedName, setFeedName] = useState(requirement.feedName || '');
  const [frequency, setFrequency] = useState(requirement.frequency || '');
  const [amount, setAmount] = useState(
    requirement.amount?.replace(/[^0-9.]/g, '') || '',
  );
  const [unit, setUnit] = useState('kg');
  const [timeOfDay, setTimeOfDay] = useState(initialTimeOfDay);
  const [additionalNotes, setAdditionalNotes] = useState(
    requirement.additionalNotes || '',
  );

  const [lastFedDate, setLastFedDate] = useState(
    new Date(requirement.lastFed || new Date()),
  );
  const [nextFeedingDate, setNextFeedingDate] = useState(
    new Date(requirement.nextFeeding || new Date()),
  );

  const [showLastFedDatePicker, setShowLastFedDatePicker] = useState(false);
  const [showNextFeedingDatePicker, setShowNextFeedingDatePicker] =
    useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Program details state
  const [programType, setProgramType] = useState(initialProgramType);
  const [animalId, setAnimalId] = useState(
    requirement.programDetails?.animalId || '',
  );
  const [groupId, setGroupId] = useState(
    requirement.programDetails?.groupId || '',
  );
  const [lifecycleStages, setLifecycleStages] = useState(
    requirement.programDetails?.lifecycleStages || [],
  );
  const [groupLifecycleStages, setGroupLifecycleStages] = useState(
    requirement.programDetails?.groupLifecycleStages || [],
  );
  const [feedType, setFeedType] = useState(
    requirement.programDetails?.feedType || 'Basal Feeds',
  );

  const [showBasalDatePicker, setShowBasalDatePicker] = useState(false);
  const [showConcentrateDatePicker, setShowConcentrateDatePicker] =
    useState(false);
  const [showSupplementDatePicker, setShowSupplementDatePicker] =
    useState(false);

  const createInitialFeedState = detailsKey => ({
    feedType: requirement.programDetails?.[detailsKey]?.feedType || '',
    source: requirement.programDetails?.[detailsKey]?.source || '',
    schedule: requirement.programDetails?.[detailsKey]?.schedule || '',
    quantity: requirement.programDetails?.[detailsKey]?.quantity || '',
    date: new Date(
      requirement.programDetails?.[detailsKey]?.dateAcquired || new Date(),
    ),
    cost: requirement.programDetails?.[detailsKey]?.cost || '',
    supplier: requirement.programDetails?.[detailsKey]?.supplier || '',
  });

  const [basalFeed, setBasalFeed] = useState(
    createInitialFeedState('basalDetails'),
  );
  const [concentrateFeed, setConcentrateFeed] = useState(
    createInitialFeedState('concentrateDetails'),
  );
  const [supplementFeed, setSupplementFeed] = useState(
    createInitialFeedState('supplementDetails'),
  );

  // Extract unit from amount on initial load
  useEffect(() => {
    if (requirement.amount) {
      const amountParts = requirement.amount.split(' ');
      if (amountParts.length > 1) {
        const unitPart = amountParts[amountParts.length - 1];
        if (
          unitPart === 'kg' ||
          unitPart === 'g' ||
          unitPart === 'per animal'
        ) {
          setUnit(unitPart);
        } else {
          setUnit('kg per animal');
        }
      }
    }
  }, [requirement.amount]);

  // Generic toggle function
  const toggleArrayItem = (arr, setArr, item) => {
    setArr(arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]);
  };

  // Date change handlers
  const handleDateChange =
    (setDate, setShowPicker) => (event, selectedDate) => {
      setShowPicker(false);
      if (selectedDate) setDate(selectedDate);
    };

  // Feed update handler
  const updateFeed = (feed, setFeed) => (field, value) => {
    setFeed(prev => ({...prev, [field]: value}));
  };

  // Render components
  const renderSelectionButtons = (options, selectedValues, onToggle) => (
    <HStack flexWrap="wrap" space={2}>
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
    </HStack>
  );

  // DateInput component for reuse
  const DateInput = ({value, showPicker, setShowPicker, onChange}) => (
    <HStack alignItems="center" space={2}>
      <Input
        flex={1}
        backgroundColor={COLORS.lightGreen}
        value={value.toLocaleDateString('en-GB')}
        isReadOnly
      />
      <TouchableOpacity onPress={() => setShowPicker(true)}>
        <FastImage
          source={icons.calendar}
          style={styles.calendarIcon}
          tintColor={COLORS.green2}
        />
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={value}
          mode="date"
          display="default"
          onChange={onChange}
        />
      )}
    </HStack>
  );

  // Feed form component
  const FeedForm = ({
    feed,
    updateFn,
    title,
    showDatePicker,
    setShowDatePicker,
    onDateChange,
  }) => (
    <Box bg="white" p={4} borderRadius={8} shadow={1} mb={4}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <FormControl mb={4}>
        <FormControl.Label>Type of Feed</FormControl.Label>
        <Input
          backgroundColor={COLORS.lightGreen}
          placeholder="Enter Feed Type"
          value={feed.feedType}
          onChangeText={value => updateFn('feedType', value)}
        />
      </FormControl>

      <FormControl mb={4}>
        <FormControl.Label>Source of Feed</FormControl.Label>
        <Select
          selectedValue={feed.source}
          minWidth="100%"
          backgroundColor={COLORS.lightGreen}
          placeholder="Select Source"
          onValueChange={value => updateFn('source', value)}>
          {FEED_SOURCES.map(source => (
            <Select.Item key={source} label={source} value={source} />
          ))}
        </Select>
      </FormControl>

      <FormControl mb={4}>
        <FormControl.Label>Feeding Schedule</FormControl.Label>
        <Select
          selectedValue={feed.schedule}
          minWidth="100%"
          backgroundColor={COLORS.lightGreen}
          placeholder="Select Schedule"
          onValueChange={value => updateFn('schedule', value)}>
          {FEED_SCHEDULES.map(schedule => (
            <Select.Item key={schedule} label={schedule} value={schedule} />
          ))}
        </Select>
      </FormControl>

      <FormControl mb={4}>
        <FormControl.Label>Quantity (kg)</FormControl.Label>
        <Input
          backgroundColor={COLORS.lightGreen}
          placeholder="Enter Quantity"
          keyboardType="numeric"
          value={feed.quantity}
          onChangeText={value => updateFn('quantity', value)}
        />
      </FormControl>

      <FormControl mb={4}>
        <FormControl.Label>Date Acquired</FormControl.Label>
        <DateInput
          value={feed.date}
          showPicker={showDatePicker}
          setShowPicker={setShowDatePicker}
          onChange={onDateChange}
        />
      </FormControl>

      <FormControl mb={4}>
        <FormControl.Label>Cost</FormControl.Label>
        <Input
          backgroundColor={COLORS.lightGreen}
          placeholder="Enter Cost"
          keyboardType="numeric"
          value={feed.cost}
          onChangeText={value => updateFn('cost', value)}
        />
      </FormControl>

      <FormControl mb={4}>
        <FormControl.Label>Supplier</FormControl.Label>
        <Input
          backgroundColor={COLORS.lightGreen}
          placeholder="Enter Supplier"
          value={feed.supplier}
          onChangeText={value => updateFn('supplier', value)}
        />
      </FormControl>
    </Box>
  );

  const handleSubmit = () => {
    // Validate inputs
    if (
      !animalType ||
      !feedName ||
      !frequency ||
      !amount ||
      timeOfDay.length === 0
    ) {
      Alert.alert(
        'Incomplete Information',
        'Please fill in all required fields and select at least one feeding time.',
        [{text: 'OK'}],
      );
      return;
    }

    const updatedRequirement = {
      ...requirement,
      animalType,
      feedName,
      frequency,
      amount: `${amount} ${unit}`,
      lastFed: lastFedDate.toISOString().split('T')[0],
      nextFeeding: nextFeedingDate.toISOString().split('T')[0],
      timeOfDay,
      additionalNotes,
      programDetails: {
        programType,
        ...(programType === 'Single Animal'
          ? {animalId, animalType, lifecycleStages}
          : {groupId, groupType: animalType, groupLifecycleStages}),
        feedType,
        basalDetails: {
          ...basalFeed,
          dateAcquired: basalFeed.date.toISOString().split('T')[0],
        },
        ...(feedType === 'Basal Feed + Concentrates + Supplements' && {
          concentrateDetails: {
            ...concentrateFeed,
            dateAcquired: concentrateFeed.date.toISOString().split('T')[0],
          },
          supplementDetails: {
            ...supplementFeed,
            dateAcquired: supplementFeed.date.toISOString().split('T')[0],
          },
        }),
      },
    };

    setModalVisible(true);

  
  };

  return (
    <View style={{flex: 1, backgroundColor: COLORS.lightGreen}}>
      <SecondaryHeader title="Edit Feeding Requirement" />
      <ScrollView contentContainerStyle={{flexGrow: 1, padding: 16}}>
        {/* Program Type Selection */}
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

        {/* Animal/Group Information */}
        <Box bg="white" p={4} borderRadius={8} shadow={1} mb={4}>
          <Text style={styles.sectionTitle}>
            {programType === 'Single Animal'
              ? 'Animal Information'
              : 'Group Information'}
          </Text>

          <FormControl mb={4}>
            <FormControl.Label>
              {programType === 'Single Animal' ? 'Animal ID' : 'Group ID'}
            </FormControl.Label>
            <Input
              backgroundColor={COLORS.lightGreen}
              placeholder={`Enter ${
                programType === 'Single Animal' ? 'Animal' : 'Group'
              } ID`}
              value={programType === 'Single Animal' ? animalId : groupId}
              onChangeText={
                programType === 'Single Animal' ? setAnimalId : setGroupId
              }
            />
          </FormControl>

          <FormControl mb={4}>
            <FormControl.Label>
              {programType === 'Single Animal' ? 'Animal Type' : 'Group Type'}
            </FormControl.Label>
            <Select
              selectedValue={animalType}
              minWidth="100%"
              backgroundColor={COLORS.lightGreen}
              placeholder={`Select ${
                programType === 'Single Animal' ? 'Animal' : 'Group'
              } Type`}
              onValueChange={setAnimalType}>
              {ANIMAL_TYPES.map(type => (
                <Select.Item key={type} label={type} value={type} />
              ))}
            </Select>
          </FormControl>

          {animalType && (
            <FormControl mb={4}>
              <FormControl.Label>Lifecycle Stage</FormControl.Label>
              {renderSelectionButtons(
                getLifecycleOptions(animalType),
                programType === 'Single Animal'
                  ? lifecycleStages
                  : groupLifecycleStages,
                item =>
                  toggleArrayItem(
                    programType === 'Single Animal'
                      ? lifecycleStages
                      : groupLifecycleStages,
                    programType === 'Single Animal'
                      ? setLifecycleStages
                      : setGroupLifecycleStages,
                    item,
                  ),
              )}
            </FormControl>
          )}
        </Box>

        {/* Feed Type Selection */}
        <Box bg="white" p={4} borderRadius={8} shadow={1} mb={4}>
          <Text style={styles.sectionTitle}>Feeding Types</Text>
          <FormControl mb={4}>
            <FormControl.Label>Type of Feeds</FormControl.Label>
            <Radio.Group
              name="feedType"
              value={feedType}
              onChange={setFeedType}>
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

        {/* Feed Forms */}
        <FeedForm
          feed={basalFeed}
          updateFn={updateFeed(basalFeed, setBasalFeed)}
          title="Basal Feed Details"
          showDatePicker={showBasalDatePicker}
          setShowDatePicker={setShowBasalDatePicker}
          onDateChange={handleDateChange(
            date => setBasalFeed(prev => ({...prev, date})),
            setShowBasalDatePicker,
          )}
        />

        {feedType === 'Basal Feed + Concentrates + Supplements' && (
          <>
            <FeedForm
              feed={concentrateFeed}
              updateFn={updateFeed(concentrateFeed, setConcentrateFeed)}
              title="Concentrate Details"
              showDatePicker={showConcentrateDatePicker}
              setShowDatePicker={setShowConcentrateDatePicker}
              onDateChange={handleDateChange(
                date => setConcentrateFeed(prev => ({...prev, date})),
                setShowConcentrateDatePicker,
              )}
            />
            <FeedForm
              feed={supplementFeed}
              updateFn={updateFeed(supplementFeed, setSupplementFeed)}
              title="Supplement Details"
              showDatePicker={showSupplementDatePicker}
              setShowDatePicker={setShowSupplementDatePicker}
              onDateChange={handleDateChange(
                date => setSupplementFeed(prev => ({...prev, date})),
                setShowSupplementDatePicker,
              )}
            />
          </>
        )}

        {/* Basic Feeding Schedule */}
        <Box bg="white" p={4} borderRadius={8} shadow={1} mb={4}>
          <Text style={styles.sectionTitle}>Feeding Schedule</Text>

          <FormControl mb={4}>
            <FormControl.Label>Last Fed Date</FormControl.Label>
            <DateInput
              value={lastFedDate}
              showPicker={showLastFedDatePicker}
              setShowPicker={setShowLastFedDatePicker}
              onChange={handleDateChange(
                setLastFedDate,
                setShowLastFedDatePicker,
              )}
            />
          </FormControl>

          <FormControl mb={4}>
            <FormControl.Label>Next Feeding Date</FormControl.Label>
            <DateInput
              value={nextFeedingDate}
              showPicker={showNextFeedingDatePicker}
              setShowPicker={setShowNextFeedingDatePicker}
              onChange={handleDateChange(
                setNextFeedingDate,
                setShowNextFeedingDatePicker,
              )}
            />
          </FormControl>

          <FormControl mb={4}>
            <FormControl.Label>Time of Day</FormControl.Label>
            <HStack flexWrap="wrap" space={2}>
              {TIME_OPTIONS.map(time => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeSlot,
                    timeOfDay.includes(time) && styles.selectedTimeSlot,
                  ]}
                  onPress={() =>
                    toggleArrayItem(timeOfDay, setTimeOfDay, time)
                  }>
                  <Text
                    style={[
                      styles.timeSlotText,
                      timeOfDay.includes(time) && styles.selectedTimeSlotText,
                    ]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </HStack>
          </FormControl>
        </Box>

        {/* Feed Name and Additional Info */}
        <Box bg="white" p={4} borderRadius={8} shadow={1} mb={4}>
          <Text style={styles.sectionTitle}>Additional Information</Text>

          <FormControl mb={4}>
            <FormControl.Label>Feed Name</FormControl.Label>
            <Input
              backgroundColor={COLORS.lightGreen}
              placeholder="Enter Feed Name"
              value={feedName}
              onChangeText={setFeedName}
            />
          </FormControl>

          <FormControl mb={4}>
            <FormControl.Label>Feeding Frequency</FormControl.Label>
            <Select
              selectedValue={frequency}
              minWidth="100%"
              backgroundColor={COLORS.lightGreen}
              placeholder="Select Frequency"
              onValueChange={setFrequency}>
              {FREQUENCY_OPTIONS.map(option => (
                <Select.Item key={option} label={option} value={option} />
              ))}
            </Select>
          </FormControl>

          <FormControl mb={4}>
            <FormControl.Label>Amount</FormControl.Label>
            <HStack space={2}>
              <Input
                flex={2}
                backgroundColor={COLORS.lightGreen}
                placeholder="Enter Amount"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
              <Select
                flex={1}
                selectedValue={unit}
                backgroundColor={COLORS.lightGreen}
                onValueChange={setUnit}>
                {UNIT_OPTIONS.map(option => (
                  <Select.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Select>
            </HStack>
          </FormControl>

          <FormControl mb={4}>
            <FormControl.Label>Additional Notes</FormControl.Label>
            <TextArea
              backgroundColor={COLORS.lightGreen}
              h={20}
              placeholder="Additional notes or instructions..."
              value={additionalNotes}
              onChangeText={setAdditionalNotes}
            />
          </FormControl>
        </Box>

        <HStack space={4} justifyContent="center" mt={4} mb={8}>
          <Button
            variant="outline"
            borderColor={COLORS.green}
            _text={{color: COLORS.green}}
            onPress={() => navigation.goBack()}>
            Cancel
          </Button>
          <Button backgroundColor={COLORS.green} onPress={handleSubmit}>
            Save Changes
          </Button>
        </HStack>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.iconContainer}>
              <FastImage
                source={icons.tick}
                style={styles.successIcon}
                resizeMode="contain"
                tintColor={COLORS.green}
              />
            </View>
            <Text style={styles.modalTitle}>Changes Saved</Text>
            <Text style={styles.modalText}>
              Feeding requirement has been updated successfully.
            </Text>
            <Button
              backgroundColor={COLORS.green}
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                navigation.goBack();
              }}>
              OK
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: COLORS.green2,
  },
  timeSlot: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.green,
    marginBottom: 8,
  },
  selectedTimeSlot: {
    backgroundColor: COLORS.green,
  },
  timeSlotText: {
    color: COLORS.green,
  },
  selectedTimeSlotText: {
    color: 'white',
  },
  selectionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.green,
    marginBottom: 8,
  },
  selectedButton: {
    backgroundColor: COLORS.green,
  },
  selectionText: {
    color: COLORS.green,
  },
  selectedText: {
    color: 'white',
  },
  calendarIcon: {
    width: 24,
    height: 24,
  },
  // Add or update these in your styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    width: '85%',
  },
  iconContainer: {
    marginBottom: 16,
  },
  successIcon: {
    width: 60,
    height: 60,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.green2,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  modalButton: {
    minWidth: 120,
  },
});
