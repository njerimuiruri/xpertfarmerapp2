import React, {useState} from 'react';
import {
  Box,
  Text,
  Input,
  Button,
  VStack,
  Select,
  Radio,
  ScrollView,
  HStack,
  Modal,
} from 'native-base';
import {View, TouchableOpacity, StyleSheet, Image} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {icons} from '../../constants';
import {COLORS} from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';
import FastImage from 'react-native-fast-image';

export default function AddUtilityDetails({navigation}) {
  const [selectedUtility, setSelectedUtility] = useState('water'); // Default: Water Supply
  const [waterLevel, setWaterLevel] = useState('');
  const [waterSource, setWaterSource] = useState('');
  const [waterStorage, setWaterStorage] = useState('');

  const [powerSource, setPowerSource] = useState('');
  const [fuelStock, setFuelStock] = useState('');

  const [structureName, setStructureName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [condition, setCondition] = useState('');
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setExpiryDate(selectedDate);
    }
    setShowDatePicker(false);
  };

  return (
    <View style={{flex: 1, backgroundColor: COLORS.lightGreen}}>
      <SecondaryHeader title="Add Utility Record" />
      <ScrollView contentContainerStyle={styles.container}>
        <Box bg="white" p={6} borderRadius={8} shadow={1} mx={6} my={6}>
          <Text style={styles.headerText}>Fill in the Utility Details</Text>

          {/* Radio Buttons */}
          <VStack space={3}>
            <Text style={styles.label}>Utility</Text>
            <Radio.Group
              name="utilityGroup"
              value={selectedUtility}
              onChange={setSelectedUtility}>
              <VStack space={2}>
                <Radio value="water" colorScheme="green">
                  Water Supply
                </Radio>
                <Radio value="power" colorScheme="green">
                  Power Supply
                </Radio>
                <Radio value="facility" colorScheme="green">
                  Facility
                </Radio>
              </VStack>
            </Radio.Group>
          </VStack>

          {/* Water Supply Fields */}
          {selectedUtility === 'water' && (
            <VStack space={4} mt={4}>
              <Box>
                <Text style={styles.label}>Current Water Level</Text>
                <Input
                  variant="outline"
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  placeholder="Enter current water level"
                  value={waterLevel}
                  onChangeText={setWaterLevel}
                />
              </Box>
              <Box>
                <Text style={styles.label}>Water Source</Text>
                <Input
                  variant="outline"
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  placeholder="Enter water source"
                  value={waterSource}
                  onChangeText={setWaterSource}
                />
              </Box>
              <Box>
                <Text style={styles.label}>Water Storage Capacity</Text>
                <Input
                  variant="outline"
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  placeholder="Enter storage capacity"
                  value={waterStorage}
                  onChangeText={setWaterStorage}
                />
              </Box>
            </VStack>
          )}

          {/* Power Supply Fields */}
          {selectedUtility === 'power' && (
            <VStack space={4} mt={4}>
              <Box>
                <Text style={styles.label}>Power Source</Text>
                <Input
                  variant="outline"
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  placeholder="Enter power source"
                  value={powerSource}
                  onChangeText={setPowerSource}
                />
              </Box>
              <Box>
                <Text style={styles.label}>Generator Fuel Stock (Liters)</Text>
                <Input
                  variant="outline"
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  placeholder="Enter fuel stock"
                  keyboardType="numeric"
                  value={fuelStock}
                  onChangeText={setFuelStock}
                />
              </Box>
            </VStack>
          )}

          {/* Facility Fields */}
          {selectedUtility === 'facility' && (
            <VStack space={4} mt={4}>
              <Box>
                <Text style={styles.label}>Structure Name</Text>
                <Input
                  variant="outline"
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  placeholder="Enter structure name"
                  value={structureName}
                  onChangeText={setStructureName}
                />
              </Box>
              <Box>
                <Text style={styles.label}>Capacity</Text>
                <Input
                  variant="outline"
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  placeholder="Enter capacity"
                  keyboardType="numeric"
                  value={capacity}
                  onChangeText={setCapacity}
                />
              </Box>
              <Box>
                <Text style={styles.label}>Condition</Text>
                <Select
                  selectedValue={condition}
                  minWidth="100%"
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  placeholder="Select condition"
                  onValueChange={setCondition}>
                  <Select.Item label="New" value="new" />
                  <Select.Item label="Used" value="used" />
                  <Select.Item label="Needs Maintenance" value="maintenance" />
                </Select>
              </Box>

              {/* Expiry Date Picker */}
              <Box>
                <Text style={styles.label}>Expiry Date</Text>
                <HStack alignItems="center" space={3}>
                  <Input
                    flex={1}
                    backgroundColor={COLORS.lightGreen}
                    borderColor="gray.200"
                    value={expiryDate.toLocaleDateString('en-GB')}
                    placeholder="DD/MM/YY"
                    isReadOnly
                  />
                  <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                    <Image
                      source={icons.calendar}
                      resizeMode="contain"
                      style={styles.calendarIcon}
                    />
                  </TouchableOpacity>
                </HStack>
                {showDatePicker && (
                  <DateTimePicker
                    value={expiryDate}
                    mode="date"
                    is24Hour={true}
                    onChange={handleDateChange}
                  />
                )}
              </Box>
            </VStack>
          )}

          {/* Buttons */}
          <HStack justifyContent="center" mt={6} space={8}>
            <Button
              variant="outline"
              borderColor={COLORS.green}
              borderRadius={8}
              px={6}
              py={3}
              onPress={() => navigation.goBack()}>
              Cancel
            </Button>
            <Button
              backgroundColor={COLORS.green}
              borderRadius={8}
              px={6}
              py={3}
              onPress={() => setShowSuccessModal(true)}>
              Save
            </Button>
          </HStack>
        </Box>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}>
        <Modal.Content maxWidth="85%" borderRadius={12} p={5}>
          <Modal.Body alignItems="center">
            <FastImage
              source={icons.tick}
              style={styles.modalIcon}
              resizeMode="contain"
            />
            <Text style={styles.modalText}>
              Utility record saved successfully!
            </Text>
          </Modal.Body>
          <Modal.Footer justifyContent="center">
            <Button
              backgroundColor={COLORS.green}
              style={styles.modalButton}
              onPress={() => {
                setShowSuccessModal(false);
                navigation.goBack();
              }}>
              OK
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flexGrow: 1, justifyContent: 'center', marginTop: -180},
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.darkGray3,
    marginBottom: 5,
  },
  calendarIcon: {width: 30, height: 30, tintColor: COLORS.green},
  modalIcon: {width: 50, height: 50, tintColor: COLORS.green, marginBottom: 10},
});
