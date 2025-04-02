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
  FormControl,
  Divider,
  Toast,
} from 'native-base';
import { View, TouchableOpacity, StyleSheet, Image, Keyboard } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import FastImage from 'react-native-fast-image';
import { icons } from '../../../constants';
import { COLORS } from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';

export default function CurativeTreatmentEditScreen({ navigation, route }) {
  const treatmentRecord = route.params?.record || {};

  const [animalIdOrFlockId, setAnimalIdOrFlockId] = useState(treatmentRecord.animalIdOrFlockId || '');
  const [healthEventDate, setHealthEventDate] = useState(treatmentRecord.healthEventDate ? new Date(treatmentRecord.healthEventDate) : new Date());
  const [healthEventSymptoms, setHealthEventSymptoms] = useState(treatmentRecord.healthEventSymptoms || '');
  const [diagnosis, setDiagnosis] = useState(treatmentRecord.diagnosis || '');
  const [treatmentType, setTreatmentType] = useState(treatmentRecord.treatmentType || '');
  const [drugAdministered, setDrugAdministered] = useState(treatmentRecord.drugAdministered || '');
  const [dateAdministered, setDateAdministered] = useState(treatmentRecord.dateAdministered ? new Date(treatmentRecord.dateAdministered) : new Date());
  const [dosageAdministered, setDosageAdministered] = useState(treatmentRecord.dosageAdministered || '');
  const [costOfDrugs, setCostOfDrugs] = useState(treatmentRecord.costOfDrugs || '');
  const [medicalOfficerName, setMedicalOfficerName] = useState(treatmentRecord.medicalOfficerName || '');
  const [licenseId, setLicenseId] = useState(treatmentRecord.licenseId || '');
  const [costOfService, setCostOfService] = useState(treatmentRecord.costOfService || '');
  const [farmerWitnessName, setFarmerWitnessName] = useState(treatmentRecord.farmerWitnessName || '');
  const [notes, setNotes] = useState(treatmentRecord.notes || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [errors, setErrors] = useState({});

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setDateAdministered(selectedDate);
    }
    setShowDatePicker(false);
  };

 
  const handleDone = () => {
    navigation.navigate('CurativeTreatmentRecordsScreen');
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.lightGreen }}>
      <SecondaryHeader title="Edit Curative Treatment Record" />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Box bg="white" p={5} borderRadius={12} shadow={2} mx={4} my={4}>
          <Heading size="md" mb={4} color={COLORS.darkGray3}>
            Treatment Details
          </Heading>
          <Divider mb={4} />

          <VStack space={4}>
            <FormControl isRequired isInvalid={'animalIdOrFlockId' in errors}>
              <FormControl.Label _text={styles.labelText}>
                Animal ID or Flock ID
              </FormControl.Label>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                placeholder="Enter Animal ID"
                value={animalIdOrFlockId}
                onChangeText={setAnimalIdOrFlockId}
              />
              <FormControl.ErrorMessage>
                {errors.animalIdOrFlockId}
              </FormControl.ErrorMessage>
            </FormControl>

            {/* Health Event Symptoms */}
            <FormControl isRequired isInvalid={'healthEventSymptoms' in errors}>
              <FormControl.Label _text={styles.labelText}>
                Health Event Symptoms
              </FormControl.Label>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                placeholder="Describe symptoms"
                value={healthEventSymptoms}
                onChangeText={setHealthEventSymptoms}
              />
              <FormControl.ErrorMessage>
                {errors.healthEventSymptoms}
              </FormControl.ErrorMessage>
            </FormControl>

            {/* Diagnosis */}
            <FormControl isRequired isInvalid={'diagnosis' in errors}>
              <FormControl.Label _text={styles.labelText}>
                Diagnosis
              </FormControl.Label>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                placeholder="Enter diagnosis"
                value={diagnosis}
                onChangeText={setDiagnosis}
              />
              <FormControl.ErrorMessage>
                {errors.diagnosis}
              </FormControl.ErrorMessage>
            </FormControl>

            {/* Treatment Type */}
            <FormControl isRequired>
              <FormControl.Label _text={styles.labelText}>
                Treatment Type
              </FormControl.Label>
              <Select
                selectedValue={treatmentType}
                minWidth="100%"
                backgroundColor={COLORS.lightGreen}
                placeholder="Select Treatment Type"
                onValueChange={setTreatmentType}>
                <Select.Item label="Curative" value="Curative" />
                <Select.Item label="Preventive" value="Preventive" />
              </Select>
            </FormControl>

            {/* Drug Administered */}
            <FormControl isRequired isInvalid={'drugAdministered' in errors}>
              <FormControl.Label _text={styles.labelText}>
                Drug Administered
              </FormControl.Label>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                placeholder="Enter drug administered"
                value={drugAdministered}
                onChangeText={setDrugAdministered}
              />
              <FormControl.ErrorMessage>
                {errors.drugAdministered}
              </FormControl.ErrorMessage>
            </FormControl>

            {/* Date Administered */}
            <FormControl>
              <FormControl.Label _text={styles.labelText}>
                Date Administered
              </FormControl.Label>
              <Box flexDirection="row" alignItems="center">
                <Input
                  flex={1}
                  backgroundColor={COLORS.lightGreen}
                  placeholder="DD/MM/YY"
                  value={dateAdministered.toLocaleDateString('en-GB')}
                  isReadOnly
                />
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={styles.datePickerButton}>
                  <Image
                    source={icons.calendar}
                    resizeMode="contain"
                    style={styles.calendarIcon}
                  />
                </TouchableOpacity>
              </Box>
              {showDatePicker && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={dateAdministered}
                  mode="date"
                  is24Hour={true}
                  onChange={handleDateChange}
                />
              )}
            </FormControl>

            {/* Dosage Administered */}
            <FormControl isRequired>
              <FormControl.Label _text={styles.labelText}>
                Dosage Administered (ml)
              </FormControl.Label>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                placeholder="Dosage"
                keyboardType="numeric"
                value={dosageAdministered.toString()}
                onChangeText={text => setDosageAdministered(text.replace(/[^0-9]/g, ''))}
              />
            </FormControl>

            {/* Cost of Drugs */}
            <FormControl>
              <FormControl.Label _text={styles.labelText}>
                Cost of Drugs
              </FormControl.Label>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                placeholder="Cost"
                keyboardType="numeric"
                value={costOfDrugs}
                onChangeText={text => setCostOfDrugs(text.replace(/[^0-9.]/g, ''))}
              />
            </FormControl>

            {/* Medical Officer Name */}
            <FormControl>
              <FormControl.Label _text={styles.labelText}>
                Medical Officer Name
              </FormControl.Label>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                placeholder="Enter name"
                value={medicalOfficerName}
                onChangeText={setMedicalOfficerName}
              />
            </FormControl>

            {/* License ID */}
            <FormControl>
              <FormControl.Label _text={styles.labelText}>
                License ID
              </FormControl.Label>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                placeholder="Enter ID"
                value={licenseId}
                onChangeText={setLicenseId}
              />
            </FormControl>

            {/* Cost of Service */}
            <FormControl>
              <FormControl.Label _text={styles.labelText}>
                Cost of Service
              </FormControl.Label>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                placeholder="Cost"
                keyboardType="numeric"
                value={costOfService}
                onChangeText={text => setCostOfService(text.replace(/[^0-9.]/g, ''))}
              />
            </FormControl>

            {/* Farmer Witness Name */}
            <FormControl>
              <FormControl.Label _text={styles.labelText}>
                Farmer Witness Name
              </FormControl.Label>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                placeholder="Enter name"
                value={farmerWitnessName}
                onChangeText={setFarmerWitnessName}
              />
            </FormControl>

            {/* Notes */}
            <FormControl>
              <FormControl.Label _text={styles.labelText}>
                Notes
              </FormControl.Label>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                placeholder="Any additional notes"
                value={notes}
                onChangeText={setNotes}
                multiline={true}
                numberOfLines={4}
              />
            </FormControl>

            {/* Buttons */}
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
               >
                Update Record
              </Button>
            </HStack>
          </VStack>
        </Box>
      </ScrollView>

      {/* Success Modal */}
      {showUpdateModal && (
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
                Curative Treatment Record Updated Successfully!
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
                  onPress={() => {
                    setShowUpdateModal(false);
                    // Optionally reset the form data here if needed
                  }}>
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
  labelText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.darkGray3,
  },
  datePickerButton: {
    marginLeft: 8,
    padding: 6,
    backgroundColor: COLORS.lightGreen,
    borderRadius: 8,
  },
  calendarIcon: {
    width: 32,
    height: 32,
    tintColor: COLORS.green,
  },
});