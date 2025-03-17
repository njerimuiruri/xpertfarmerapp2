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
  Checkbox,
} from 'native-base';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import FastImage from 'react-native-fast-image';
import { icons } from '../../constants';
import { COLORS } from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';

export default function DewormingDetailsRecords({ navigation }) {
  const [animalIdOrFlockId, setAnimalIdOrFlockId] = useState('');
  const [dewormingAgainst, setDewormingAgainst] = useState('');
  const [dewormingDrug, setDewormingDrug] = useState('');
  const [dosage, setDosage] = useState(1);
  const [dateAdministered, setDateAdministered] = useState(new Date());
  const [costOfVaccine, setCostOfVaccine] = useState('');
  const [costOfService, setCostOfService] = useState('');
  const [medicalOfficerName, setMedicalOfficerName] = useState('');
  const [practiceId, setPracticeId] = useState('');
  const [farmerWitness, setFarmerWitness] = useState('');
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setDateAdministered(selectedDate);
    }
    setShowDatePicker(false);
  };
  const handleSave = () => {
   
    setShowSuccessModal(true);
  };

  const handleDone = () => {
    navigation.navigate('CurativeTreatmentScreen'); 
  };
  const handleAddAnother = () => {
   
    setShowSuccessModal(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.lightGreen }}>
      <SecondaryHeader title="Deworming Details" />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          marginTop: 5,
        }}>
        <Box bg="white" p={6} borderRadius={8} shadow={1} mx={6} my={8}>
         
          <VStack space={5}>
            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
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
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Deworming Against
              </Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Enter parasite/condition"
                value={dewormingAgainst}
                onChangeText={setDewormingAgainst}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                 Drug administered
              </Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Enter drug name"
                value={dewormingDrug}
                onChangeText={setDewormingDrug}
              />
            </Box>

            <View style={styles.formGroup}>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>Date</Text>
              <View style={styles.dateContainer}>
                <Input
                  w="85%"
                  backgroundColor={COLORS.lightGreen}
                  value={dateAdministered.toLocaleDateString('en-GB')}
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
                  value={dateAdministered}
                  mode="date"
                  is24Hour={true}
                  onChange={handleDateChange}
                />
              )}
            </View>

            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Dosage
              </Text>
              <HStack alignItems="center" space={2}>
                <Button
                  onPress={() => {
                    const currentValue = parseFloat(dosage) || 1;
                    setDosage(Math.max(currentValue - 1, 1).toString());
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
                  placeholder="Enter Dosage"
                  keyboardType="numeric"
                  value={dosage.toString()}
                  onChangeText={text => {
                    const numericText = text.replace(/[^0-9.]/g, '');
                    setDosage(numericText);
                  }}
                />
                <Button
                  onPress={() => {
                    const currentValue = parseFloat(dosage) || 1;
                    setDosage((currentValue + 1).toString());
                  }}
                  variant="outline"
                  p={2}>
                  +
                </Button>
              </HStack>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Cost of Vaccine
              </Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Enter cost of vaccine"
                keyboardType="numeric"
                value={costOfVaccine}
                onChangeText={setCostOfVaccine}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Administered by:
              </Text>
              <VStack space={3} pl={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                    Name
                  </Text>
                  <Input
                    variant="outline"
                    backgroundColor={COLORS.lightGreen}
                    borderColor="gray.200"
                    placeholder="Enter medical officer name"
                    value={medicalOfficerName}
                    onChangeText={setMedicalOfficerName}
                  />
                </Box>
                
                <Box>
                  <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                    Practice ID
                  </Text>
                  <Input
                    variant="outline"
                    backgroundColor={COLORS.lightGreen}
                    borderColor="gray.200"
                    placeholder="Enter practice ID"
                    value={practiceId}
                    onChangeText={setPracticeId}
                  />
                </Box>
              </VStack>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Cost of Service
              </Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Enter cost of service"
                keyboardType="numeric"
                value={costOfService}
                onChangeText={setCostOfService}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Farmer or Witness
              </Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Enter farmer or witness name"
                value={farmerWitness}
                onChangeText={setFarmerWitness}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Notes
              </Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Enter notes"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
              />
            </Box>

            <HStack justifyContent="center" mt={6} space={4}>
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
                              }}
                              onPress={handleSave}>
                              Done
                            </Button>
            </HStack>
          </VStack>
        </Box>
      </ScrollView>
      {showSuccessModal && (
        <Box 
          position="absolute" 
          top="0" 
          bottom="0" 
          left="0" 
          right="0" 
          bg="rgba(0,0,0,0.5)" 
          justifyContent="center" 
          alignItems="center"
        >
          <Box bg="white" p={6} borderRadius={8} width="80%" maxWidth="400px">
            <VStack space={4} alignItems="center">
              <FastImage
                source={icons.tick} 
                style={{width: 60, height: 60}}
                resizeMode="contain"
              />
              <Text fontSize="lg" fontWeight="bold" textAlign="center">
              Deworming Record Added Successfully!
              </Text>
              
              <HStack space={4} mt={2}>
                <Button
                  flex={1}
                  variant="outline"
                  borderColor={COLORS.green}
                  _text={{
                    color: COLORS.green,
                  }}
                  onPress={handleDone}>
                  OK
                </Button>
                <Button
                  flex={1}
                  bg={COLORS.green}
                  _pressed={{
                    bg: 'emerald.700',
                  }}
                  onPress={handleAddAnother}>
                  Add Another
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}

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
    tintColor: COLORS.green,
  },
});