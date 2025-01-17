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

import { View, TouchableOpacity, StyleSheet, Image, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import FastImage from 'react-native-fast-image';
import { icons } from '../../constants';
import { COLORS } from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';

export default function AllergyBoosterScreen({ navigation }) {
  const [animalIdOrFlockId, setAnimalIdOrFlockId] = useState('');
  const [boostersOrAdditives, setBoostersOrAdditives] = useState('');
  const [purpose, setPurpose] = useState('');
  const [quantityGiven, setQuantityGiven] = useState(1);
  const [dateRecorded, setDateRecorded] = useState(new Date());
  const [costOfBooster, setCostOfBooster] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setDateRecorded(selectedDate);
    }
    setShowDatePicker(false);
  };
  const handleSubmit = () => {

    setModalVisible(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.lightGreen }}>
      <SecondaryHeader title="Fill in the allergy details" />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          marginTop: 5,
        }}>
        <Box bg="white" p={6} borderRadius={8} shadow={1} mx={6} my={8}>
          <VStack space={5}>
            <Box>
              <Text fontSize="sm" fontWeight="500" color="gray.700" mb={1}>
                Animal ID or Flock ID
              </Text>
              <Select
                selectedValue={animalIdOrFlockId}
                minWidth="100%"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Select ID"
                _selectedItem={{
                  bg: 'teal.600',
                  endIcon: (
                    <FastImage
                      source={icons.right_arrow}
                      className="w-[20px] h-[20px]"
                      tintColor="white"
                    />
                  ),
                }}
                onValueChange={setAnimalIdOrFlockId}>
                <Select.Item label="ID 1" value="id1" />
                <Select.Item label="ID 2" value="id2" />
              </Select>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color="gray.700" mb={1}>
                Name of the Boosters or Additives
              </Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Enter name of boosters or additives"
                value={boostersOrAdditives}
                onChangeText={setBoostersOrAdditives}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color="gray.700" mb={1}>
                Purpose
              </Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Enter purpose"
                value={purpose}
                onChangeText={setPurpose}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color="gray.700" mb={1}>
                Quantity Given
              </Text>
              <HStack alignItems="center" space={2}>
                <Button
                  onPress={() => {
                    const currentValue = parseFloat(quantityGiven) || 1;
                    setQuantityGiven(Math.max(currentValue - 1, 1).toString());
                  }}
                  variant="outline"
                  p={2}>
                  -
                </Button>
                <Input
                  flex={1}
                  variant="outline"
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  placeholder="Enter Quantity"
                  keyboardType="numeric"
                  value={quantityGiven.toString()}
                  onChangeText={text => {
                    const numericText = text.replace(/[^0-9.]/g, '');
                    setQuantityGiven(numericText);
                  }}
                />
                <Button
                  onPress={() => {
                    const currentValue = parseFloat(quantityGiven) || 1;
                    setQuantityGiven((currentValue + 1).toString());
                  }}
                  variant="outline"
                  p={2}>
                  +
                </Button>
              </HStack>
            </Box>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Date Recorded</Text>
              <View style={styles.dateContainer}>
                <Input
                  w="85%"
                  backgroundColor={COLORS.lightGreen}
                  value={dateRecorded.toLocaleDateString('en-GB')}
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
              </View>
              {showDatePicker && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={dateRecorded}
                  mode="date"
                  is24Hour={true}
                  onChange={handleDateChange}
                />
              )}
            </View>

            <Box>
              <Text fontSize="sm" fontWeight="500" color="gray.700" mb={1}>
                Cost of Booster or Additives
              </Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Enter cost"
                keyboardType="numeric"
                value={costOfBooster}
                onChangeText={setCostOfBooster}
              />
            </Box>

            <HStack justifyContent="center" mt={6} space={8}>
              <Button
                variant="outline"
                borderWidth={1}
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
                _pressed={{
                  bg: 'emerald.700',
                }}>
                Submit
              </Button>
            </HStack>
          </VStack>
        </Box>
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* <Image source={icons.checkmark} style={styles.checkIcon} /> */}
            <Text style={styles.modalText}>Health records added successfully</Text>
            <Button
              backgroundColor={COLORS.green}
              borderRadius={8}
              onPress={() => setModalVisible(false)}>
              Ok
            </Button>
          </View>
        </View>
      </Modal>
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
    color: 'gray.700',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
  },
  checkIcon: {
    width: 50,
    height: 50,
    marginBottom: 15,
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
});