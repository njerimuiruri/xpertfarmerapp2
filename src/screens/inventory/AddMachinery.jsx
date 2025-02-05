import React, { useState } from 'react';
import {
  Box,
  Text,
  Input,
  Button,
  VStack,
  Select,
  ScrollView,
  HStack,
} from 'native-base';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import FastImage from 'react-native-fast-image';
import { icons } from '../../constants'; 
import { COLORS } from '../../constants/theme'; 
import SecondaryHeader from '../../components/headers/secondary-header';

export default function AddMachinery({ navigation }) {
  const [equipmentName, setEquipmentName] = useState('');
  const [equipmentId, setEquipmentId] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [currentLocation, setCurrentLocation] = useState('');
  const [condition, setCondition] = useState('');
  const [lastServiceDate, setLastServiceDate] = useState(new Date());
  const [nextServiceDate, setNextServiceDate] = useState(new Date());
  const [showPurchaseDatePicker, setShowPurchaseDatePicker] = useState(false);
  const [showLastServiceDatePicker, setShowLastServiceDatePicker] = useState(false);
  const [showNextServiceDatePicker, setShowNextServiceDatePicker] = useState(false);

  const handleDateChange = (setDate, setShowDatePicker) => (event, selectedDate) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
    setShowDatePicker(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.lightGreen }}>
      <SecondaryHeader title="Add Machinery" />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          marginTop: 5,
        }}>
        <Box bg="white" p={6} borderRadius={8} shadow={1} mx={6} my={8}>
          <Text
            style={{
              fontSize: 16,
              color: 'black',
              marginBottom: 16,
              textAlign: 'center',
            }}>
            Please fill in the inventory details.
          </Text>

          <VStack space={5}>
            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Equipment Name
              </Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Enter equipment name"
                value={equipmentName}
                onChangeText={setEquipmentName}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Equipment ID or Serial Number
              </Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Enter equipment ID"
                value={equipmentId}
                onChangeText={setEquipmentId}
              />
            </Box>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Purchase Date</Text>
              <View style={styles.dateContainer}>
                <Input
                  w="85%"
                  backgroundColor={COLORS.lightGreen}
                  value={purchaseDate.toLocaleDateString('en-GB')}
                  placeholder="DD/MM/YY"
                  isReadOnly
                />
                <TouchableOpacity onPress={() => setShowPurchaseDatePicker(true)}>
                  <Image
                    source={icons.calendar}
                    resizeMode="contain"
                    style={styles.calendarIcon}
                  />
                </TouchableOpacity>
              </View>
              {showPurchaseDatePicker && (
                <DateTimePicker
                  testID="purchaseDatePicker"
                  value={purchaseDate}
                  mode="date"
                  is24Hour={true}
                  onChange={handleDateChange(setPurchaseDate, setShowPurchaseDatePicker)}
                />
              )}
            </View>

            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Current Location
              </Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Enter current location"
                value={currentLocation}
                onChangeText={setCurrentLocation}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Condition
              </Text>
              <Select
                selectedValue={condition}
                minWidth="100%"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Select condition"
                onValueChange={setCondition}>
                <Select.Item label="New" value="new" />
                <Select.Item label="Used" value="used" />
                <Select.Item label="Refurbished" value="refurbished" />
              </Select>
            </Box>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Last Service Date</Text>
              <View style={styles.dateContainer}>
                <Input
                  w="85%"
                  backgroundColor={COLORS.lightGreen}
                  value={lastServiceDate.toLocaleDateString('en-GB')}
                  placeholder="DD/MM/YY"
                  isReadOnly
                />
                <TouchableOpacity onPress={() => setShowLastServiceDatePicker(true)}>
                  <Image
                    source={icons.calendar}
                    resizeMode="contain"
                    style={styles.calendarIcon}
                  />
                </TouchableOpacity>
              </View>
              {showLastServiceDatePicker && (
                <DateTimePicker
                  testID="lastServiceDatePicker"
                  value={lastServiceDate}
                  mode="date"
                  is24Hour={true}
                  onChange={handleDateChange(setLastServiceDate, setShowLastServiceDatePicker)}
                />
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Next Service Date</Text>
              <View style={styles.dateContainer}>
                <Input
                  w="85%"
                  backgroundColor={COLORS.lightGreen}
                  value={nextServiceDate.toLocaleDateString('en-GB')}
                  placeholder="DD/MM/YY"
                  isReadOnly
                />
                <TouchableOpacity onPress={() => setShowNextServiceDatePicker(true)}>
                  <Image
                    source={icons.calendar}
                    resizeMode="contain"
                    style={styles.calendarIcon}
                  />
                </TouchableOpacity>
              </View>
              {showNextServiceDatePicker && (
                <DateTimePicker
                  testID="nextServiceDatePicker"
                  value={nextServiceDate}
                  mode="date"
                  is24Hour={true}
                  onChange={handleDateChange(setNextServiceDate, setShowNextServiceDatePicker)}
                />
              )}
            </View>

            <HStack justifyContent="center" mt={6} space={8}>
              <Button
                variant="outline"
                borderWidth={1}
                borderColor={COLORS.green}
                borderRadius={8}
                px={6}
                py={3}
                _text={{
                  color: COLORS.green,
                }}
                onPress={() => navigation.goBack()}>
                Cancel
              </Button>

              <Button
                backgroundColor={COLORS.green}
                borderRadius={8}
                px={6}
                py={3}
                _pressed={{
                  bg: 'emerald.700',
                }}
                onPress={() => navigation.goBack()}>
                                    Save
              </Button>
            </HStack>
          </VStack>
        </Box>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.lightGray1,
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calendarIcon: {
    width: 40,
    height: 40,
    tintColor: COLORS.green2,
  },
});