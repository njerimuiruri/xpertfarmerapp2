import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { Button, Select, Input, Box, HStack, VStack, FormControl } from 'native-base';
import DateTimePicker from '@react-native-community/datetimepicker';
import FastImage from 'react-native-fast-image';
import { icons } from '../../../constants';
import { COLORS } from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';

export default function EditFeedingRequirementScreen({ navigation, route }) {
  // Get the requirement from the route params
  const { requirement } = route.params;

  // Extract feeding times from time of day array
  const initialTimeOfDay = requirement.timeOfDay || [];

  // Initialize state with existing requirement data
  const [animalType, setAnimalType] = useState(requirement.animalType || '');
  const [feedName, setFeedName] = useState(requirement.feedName || '');
  const [frequency, setFrequency] = useState(requirement.frequency || '');
  const [amount, setAmount] = useState(requirement.amount?.replace(/[^0-9.]/g, '') || '');
  const [unit, setUnit] = useState('kg');
  const [lastFedDate, setLastFedDate] = useState(new Date(requirement.lastFed || new Date()));
  const [nextFeedingDate, setNextFeedingDate] = useState(new Date(requirement.nextFeeding || new Date()));
  const [nutritionalInfo, setNutritionalInfo] = useState(requirement.nutritionalInfo || '');
  const [timeOfDay, setTimeOfDay] = useState(initialTimeOfDay);
  const [showLastFedDatePicker, setShowLastFedDatePicker] = useState(false);
  const [showNextFeedingDatePicker, setShowNextFeedingDatePicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (requirement.amount) {
      const amountParts = requirement.amount.split(' ');
      if (amountParts.length > 1) {
        // If the last part contains "kg", "g", etc.
        const unitPart = amountParts[amountParts.length - 1];
        if (unitPart === 'kg' || unitPart === 'g' || unitPart === 'per animal') {
          setUnit(unitPart);
        } else {
          // Default to kg if no unit is found
          setUnit('kg per animal');
        }
      }
    }
  }, [requirement.amount]);

  const onLastFedDateChange = (event, selectedDate) => {
    setShowLastFedDatePicker(false);
    if (selectedDate) {
      setLastFedDate(selectedDate);
    }
  };

  const onNextFeedingDateChange = (event, selectedDate) => {
    setShowNextFeedingDatePicker(false);
    if (selectedDate) {
      setNextFeedingDate(selectedDate);
    }
  };

  const toggleTimeOfDay = (time) => {
    if (timeOfDay.includes(time)) {
      setTimeOfDay(timeOfDay.filter(t => t !== time));
    } else {
      setTimeOfDay([...timeOfDay, time]);
    }
  };

  const handleSubmit = () => {
    // Validate inputs
    if (!animalType || !feedName || !frequency || !amount || timeOfDay.length === 0) {
      Alert.alert(
        "Incomplete Information",
        "Please fill in all required fields and select at least one feeding time.",
        [{ text: "OK" }]
      );
      return;
    }

    const formattedAmount = `${amount} ${unit}`;

    const updatedRequirement = {
      ...requirement,
      animalType,
      feedName,
      frequency,
      amount: formattedAmount,
      lastFed: lastFedDate.toISOString().split('T')[0],
      nextFeeding: nextFeedingDate.toISOString().split('T')[0],
      nutritionalInfo,
      timeOfDay,
    };

    // Show success modal
    setModalVisible(true);

    // You would typically update the data in a state management solution or API
    // For demonstration, we'll just send back the updated requirement
    navigation.navigate('FeedingModuleScreen', { updatedRequirement });
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.lightGreen }}>
      <SecondaryHeader title="Edit Feeding Requirement" />
      <ScrollView 
        contentContainerStyle={{ 
          flexGrow: 1, 
          padding: 16
        }}
      >
        <Box bg="white" p={4} borderRadius={8} shadow={1} mb={4}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <FormControl mb={4}>
            <FormControl.Label>Animal Type</FormControl.Label>
            <Select
              selectedValue={animalType}
              minWidth="100%"
              backgroundColor={COLORS.lightGreen}
              placeholder="Select Animal Type"
              onValueChange={setAnimalType}
            >
              <Select.Item label="Dairy Cattle" value="Dairy Cattle" />
              <Select.Item label="Beef Cattle" value="Beef Cattle" />
              <Select.Item label="Poultry" value="Poultry" />
              <Select.Item label="Swine" value="Swine" />
              <Select.Item label="Sheep" value="Sheep" />
              <Select.Item label="Goats" value="Goats" />
            </Select>
          </FormControl>
          
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
              onValueChange={setFrequency}
            >
              <Select.Item label="Once Daily" value="Once Daily" />
              <Select.Item label="Twice Daily" value="Twice Daily" />
              <Select.Item label="Three Times Daily" value="Three Times Daily" />
              <Select.Item label="Weekly" value="Weekly" />
              <Select.Item label="Free Choice" value="Free Choice" />
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
                onValueChange={setUnit}
              >
                <Select.Item label="kg" value="kg" />
                <Select.Item label="g" value="g" />
                <Select.Item label="kg per animal" value="kg per animal" />
                <Select.Item label="g per animal" value="g per animal" />
              </Select>
            </HStack>
          </FormControl>
        </Box>

        <Box bg="white" p={4} borderRadius={8} shadow={1} mb={4}>
          <Text style={styles.sectionTitle}>Nutritional Information</Text>
          
          <FormControl mb={4}>
            <FormControl.Label>Nutritional Details</FormControl.Label>
            <Input
              backgroundColor={COLORS.lightGreen}
              placeholder="e.g., Protein: 18%, Fiber: 12%, Fat: 4%"
              value={nutritionalInfo}
              onChangeText={setNutritionalInfo}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </FormControl>
        </Box>

        <Box bg="white" p={4} borderRadius={8} shadow={1} mb={4}>
          <Text style={styles.sectionTitle}>Feeding Schedule</Text>
          
          <FormControl mb={4}>
            <FormControl.Label>Last Fed Date</FormControl.Label>
            <HStack alignItems="center" space={2}>
              <Input
                flex={1}
                backgroundColor={COLORS.lightGreen}
                value={lastFedDate.toLocaleDateString('en-GB')}
                isReadOnly
              />
              <TouchableOpacity onPress={() => setShowLastFedDatePicker(true)}>
                <FastImage
                  source={icons.calendar}
                  style={styles.calendarIcon}
                  tintColor={COLORS.green2}
                />
              </TouchableOpacity>
            </HStack>
            {showLastFedDatePicker && (
              <DateTimePicker
                value={lastFedDate}
                mode="date"
                display="default"
                onChange={onLastFedDateChange}
              />
            )}
          </FormControl>
          
          <FormControl mb={4}>
            <FormControl.Label>Next Feeding Date</FormControl.Label>
            <HStack alignItems="center" space={2}>
              <Input
                flex={1}
                backgroundColor={COLORS.lightGreen}
                value={nextFeedingDate.toLocaleDateString('en-GB')}
                isReadOnly
              />
              <TouchableOpacity onPress={() => setShowNextFeedingDatePicker(true)}>
                <FastImage
                  source={icons.calendar}
                  style={styles.calendarIcon}
                  tintColor={COLORS.green2}
                />
              </TouchableOpacity>
            </HStack>
            {showNextFeedingDatePicker && (
              <DateTimePicker
                value={nextFeedingDate}
                mode="date"
                display="default"
                onChange={onNextFeedingDateChange}
              />
            )}
          </FormControl>
          
          <FormControl mb={4}>
            <FormControl.Label>Time of Day</FormControl.Label>
            <HStack flexWrap="wrap" space={2}>
              {['Morning', 'Afternoon', 'Evening'].map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeSlot,
                    timeOfDay.includes(time) && styles.selectedTimeSlot,
                  ]}
                  onPress={() => toggleTimeOfDay(time)}
                >
                  <Text style={[
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
        
        <HStack space={4} justifyContent="center" mt={4} mb={8}>
          <Button
            variant="outline"
            borderColor={COLORS.green}
            _text={{ color: COLORS.green }}
            onPress={() => navigation.goBack()}
          >
            Cancel
          </Button>
          <Button
            backgroundColor={COLORS.green}
            onPress={handleSubmit}
          >
            Save Changes
          </Button>
        </HStack>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FastImage 
              source={icons.tick} 
              style={styles.successIcon}
              tintColor={COLORS.green}
            />
            <Text style={styles.modalTitle}>Changes Saved</Text>
            <Text style={styles.modalText}>
              Feeding requirement has been updated successfully.
            </Text>
            <Button
              backgroundColor={COLORS.green}
              onPress={() => {
                setModalVisible(false);
                navigation.goBack();
              }}
              mt={4}
            >
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
    color: COLORS.green,
    marginBottom: 12,
  },
  calendarIcon: {
    width: 24,
    height: 24,
  },
  timeSlot: {
    backgroundColor: '#f1f3f4',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  selectedTimeSlot: {
    backgroundColor: COLORS.green,
  },
  timeSlotText: {
    color: '#333',
    fontWeight: '500',
  },
  selectedTimeSlotText: {
    color: 'white',
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
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  successIcon: {
    width: 50,
    height: 50,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.green,
  },
  modalText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
  }
});