import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Input,
  Button,
  VStack,
  Select,
  ScrollView,
  HStack,
  Heading,
  Divider,
  Toast,
} from 'native-base';
import { View, TouchableOpacity, StyleSheet, Image, Keyboard } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import FastImage from 'react-native-fast-image';
import { icons } from '../../../constants';
import { COLORS } from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';

export default function DewormingEditScreen({ navigation, route }) {
  // Get the deworming record from route params if provided
  const dewormingRecord = route.params?.record || {};

  // Initialize state with existing record data or defaults
  const [animalIdOrFlockId, setAnimalIdOrFlockId] = useState(dewormingRecord.animalIdOrFlockId || '');
  const [dewormingAgainst, setDewormingAgainst] = useState(dewormingRecord.dewormingAgainst || '');
  const [dewormingDrug, setDewormingDrug] = useState(dewormingRecord.dewormingDrug || '');
  const [dosage, setDosage] = useState(dewormingRecord.dosage || 1);
  const [dateAdministered, setDateAdministered] = useState(dewormingRecord.dateAdministered ? new Date(dewormingRecord.dateAdministered) : new Date());
  const [costOfVaccine, setCostOfVaccine] = useState(dewormingRecord.costOfVaccine || '');
  const [costOfService, setCostOfService] = useState(dewormingRecord.costOfService || '');
  const [medicalOfficerName, setMedicalOfficerName] = useState(dewormingRecord.medicalOfficerName || '');
  const [practiceId, setPracticeId] = useState(dewormingRecord.practiceId || '');
  const [farmerWitness, setFarmerWitness] = useState(dewormingRecord.farmerWitness || '');
  const [notes, setNotes] = useState(dewormingRecord.notes || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setDateAdministered(selectedDate);
    }
    setShowDatePicker(false);
  };

  const validate = () => {
    return animalIdOrFlockId && dewormingAgainst && dewormingDrug;
  };

  const handleSave = () => {
    Keyboard.dismiss();
    
    if (validate()) {
      // In a real app, you would update the record in your database or state management
      setShowSuccessModal(true);
    } else {
      Toast.show({
        title: "Please fill all required fields",
        status: "warning",
        duration: 3000,
      });
    }
  };

  const handleDone = () => {
    navigation.navigate('DewormingRecordsScreen');
  };

  const handleAddAnother = () => {
    setShowSuccessModal(false);
    // Reset the state to allow adding another entry
    setAnimalIdOrFlockId('');
    setDewormingAgainst('');
    setDewormingDrug('');
    setDosage(1);
    setDateAdministered(new Date());
    setCostOfVaccine('');
    setCostOfService('');
    setMedicalOfficerName('');
    setPracticeId('');
    setFarmerWitness('');
    setNotes('');
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.lightGreen }}>
      <SecondaryHeader title="Edit Deworming Record" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        <Box bg="white" p={5} borderRadius={12} shadow={2} mx={4} my={4}>
          <Heading size="md" mb={4} color={COLORS.darkGray3}>
            Deworming Details
          </Heading>
          <Divider mb={4} />

          <VStack space={4}>
            {/* Animal ID or Flock ID */}
            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3}>
                Animal ID or Flock ID
              </Text>
              <Select
                selectedValue={animalIdOrFlockId}
                minWidth="100%"
                backgroundColor={COLORS.lightGreen}
                onValueChange={setAnimalIdOrFlockId}>
                {/* You'll have to replace these options with your actual IDs */}
                <Select.Item label="ID 1" value="id1" />
                <Select.Item label="ID 2" value="id2" />
              </Select>
            </Box>

            {/* Deworming Against */}
            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3}>
                Deworming Against
              </Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                placeholder="Enter parasite/condition"
                value={dewormingAgainst}
                onChangeText={setDewormingAgainst}
              />
            </Box>

            {/* Drug Administered */}
            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3}>
                Drug Administered
              </Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                placeholder="Enter drug name"
                value={dewormingDrug}
                onChangeText={setDewormingDrug}
              />
            </Box>

            {/* Date Administered */}
            <View style={styles.formGroup}>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3}>Date Administered</Text>
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

            {/* Dosage */}
            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3}>
                Dosage (ml)
              </Text>
              <HStack alignItems="center" space={2}>
                <Button
                  variant="outline"
                  onPress={() => {
                    const currentValue = parseFloat(dosage) || 1;
                    setDosage(Math.max(currentValue - 0.5, 0.5));
                  }}>
                  -
                </Button>
                <Input
                  flex={1}
                  variant="outline"
                  backgroundColor={COLORS.lightGreen}
                  placeholder="Enter Dosage"
                  keyboardType="numeric"
                  value={dosage.toString()}
                  onChangeText={text => {
                    const numericText = text.replace(/[^0-9.]/g, '');
                    setDosage(numericText || '0');
                  }}
                />
                <Button
                  variant="outline"
                  onPress={() => {
                    const currentValue = parseFloat(dosage) || 1;
                    setDosage(currentValue + 0.5);
                  }}>
                  +
                </Button>
              </HStack>
            </Box>

            {/* Cost of Vaccine */}
            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3}>
                Cost of Vaccine
              </Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                placeholder="Enter cost of vaccine"
                keyboardType="numeric"
                value={costOfVaccine}
                onChangeText={setCostOfVaccine}
              />
            </Box>

            {/* Administered by */}
            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3}>
                Administered by
              </Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                placeholder="Enter medical officer name"
                value={medicalOfficerName}
                onChangeText={setMedicalOfficerName}
              />
            </Box>

            {/* Practice ID */}
            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3}>
                Practice ID
              </Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                placeholder="Enter practice ID"
                value={practiceId}
                onChangeText={setPracticeId}
              />
            </Box>

            {/* Cost of Service */}
            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3}>
                Cost of Service
              </Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                placeholder="Enter cost of service"
                keyboardType="numeric"
                value={costOfService}
                onChangeText={setCostOfService}
              />
            </Box>

            {/* Farmer or Witness */}
            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3}>
                Farmer or Witness
              </Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                placeholder="Enter farmer or witness name"
                value={farmerWitness}
                onChangeText={setFarmerWitness}
              />
            </Box>

            {/* Notes */}
            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3}>
                Notes
              </Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                placeholder="Enter notes"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
              />
            </Box>

            <HStack justifyContent="space-between" mt={6} space={4}>
              <Button
                flex={1}
                variant="outline"
                borderWidth={1}
                borderColor={COLORS.green}
                borderRadius={8}
                onPress={() => navigation.goBack()}>
                Cancel
              </Button>

              <Button
                flex={1}
                backgroundColor={COLORS.green}
                onPress={handleSave}>
                Update Record
              </Button>
            </HStack>
          </VStack>
        </Box>
      </ScrollView>

      {/* Success Modal */}
      {showSuccessModal && (
        <Box 
          position="absolute" 
          top="0" 
          bottom="0" 
          left="0" 
          right="0" 
          bg="rgba(0,0,0,0.5)" 
          justifyContent="center" 
          alignItems="center">
          <Box bg="white" p={6} borderRadius={8} width="80%" maxWidth="400px">
            <VStack space={4} alignItems="center">
              <FastImage
                source={icons.tick} 
                style={{ width: 60, height: 60 }} 
                resizeMode="contain"
              />
              <Text fontSize="lg" fontWeight="bold" textAlign="center">
                Deworming Record Updated Successfully!
              </Text>
              <HStack space={4} mt={2}>
                <Button
                  flex={1}
                  variant="outline"
                  borderColor={COLORS.green}
                  onPress={handleDone}>
                  OK
                </Button>
                <Button
                  flex={1}
                  backgroundColor={COLORS.green}
                  onPress={handleAddAnother}>
                  Edit Another
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
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 10,
  },
  formGroup: {
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calendarIcon: {
    width: 32,
    height: 32,
    tintColor: COLORS.green,
  },
});