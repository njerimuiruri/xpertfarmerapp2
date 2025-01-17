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
  const [healthEventSymptoms, setHealthEventSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentGiven, setTreatmentGiven] = useState({
    curative: false,
    preventive: false,
    supportive: false,
    behavioralAndAlternative: false,
  });
  const [dosage, setDosage] = useState(1);
  const [dateAdministered, setDateAdministered] = useState(new Date());
  const [medicalOfficerName, setMedicalOfficerName] = useState('');
  const [practiceId, setPracticeId] = useState('');
  const [costOfService, setCostOfService] = useState('');
  const [farmerWitness, setFarmerWitness] = useState('');
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setDateAdministered(selectedDate);
    }
    setShowDatePicker(false);
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
          <Text style={{ fontSize: 16, color: 'black', marginBottom: 16, textAlign: 'center' }}>
            Please fill in the deworming details.
          </Text>
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
                Health Event Symptoms
              </Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Enter symptoms"
                value={healthEventSymptoms}
                onChangeText={setHealthEventSymptoms}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color="gray.700" mb={1}>
                Diagnosis
              </Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Enter diagnosis"
                value={diagnosis}
                onChangeText={setDiagnosis}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color="gray.700" mb={1}>
                Treatment Given
              </Text>
              <VStack space={2}>
                <Checkbox
                  isChecked={treatmentGiven.curative}
                  onChange={() => setTreatmentGiven({ ...treatmentGiven, curative: !treatmentGiven.curative })}
                >
                  Curative
                </Checkbox>
                <Checkbox
                  isChecked={treatmentGiven.preventive}
                  onChange={() => setTreatmentGiven({ ...treatmentGiven, preventive: !treatmentGiven.preventive })}
                >
                  Preventive
                </Checkbox>
                <Checkbox
                  isChecked={treatmentGiven.supportive}
                  onChange={() => setTreatmentGiven({ ...treatmentGiven, supportive: !treatmentGiven.supportive })}
                >
                  Supportive
                </Checkbox>
                <Checkbox
                  isChecked={treatmentGiven.behavioralAndAlternative}
                  onChange={() => setTreatmentGiven({ ...treatmentGiven, behavioralAndAlternative: !treatmentGiven.behavioralAndAlternative })}
                >
                  Behavioral and Alternative
                </Checkbox>
              </VStack>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color="gray.700" mb={1}>
                Dosage Administered
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

            <View style={styles.formGroup}>
              <Text fontSize="sm" fontWeight="500" color="gray.700" mb={1}>Date Administered</Text>
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

              <HStack alignItems="center" space={2}>
                <Text fontSize="sm" fontWeight="500" color="gray.700">Cost of Drugs</Text>
                <Input
                  flex={1}
                  variant="outline"
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  placeholder="Enter cost of drugs"
                  keyboardType="numeric"
                  value={costOfService}
                  onChangeText={setCostOfService}
                />
              </HStack>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color="gray.700" mb={1}>
                Medical Officer Name
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
              <Text fontSize="sm" fontWeight="500" color="gray.700" mb={1}>
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

            <Box>
              <Text fontSize="sm" fontWeight="500" color="gray.700" mb={1}>
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
              <Text fontSize="sm" fontWeight="500" color="gray.700" mb={1}>
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