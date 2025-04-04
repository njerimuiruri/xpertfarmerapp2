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
  Icon,
  Divider,
  Toast,
  IconButton,
} from 'native-base';
import { View, TouchableOpacity, StyleSheet, Image, Keyboard } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import FastImage from 'react-native-fast-image';
import { icons } from '../../../constants';
import { COLORS } from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';

export default function VaccineEditScreen({ navigation, route }) {
  const vaccineRecord = route.params?.record || {};

  const [animalIdOrFlockId, setAnimalIdOrFlockId] = useState(vaccineRecord.animalIdOrFlockId || '');
  const [vaccinationAgainst, setVaccinationAgainst] = useState(vaccineRecord.vaccinationAgainst || '');
  const [drugAdministered, setDrugAdministered] = useState(vaccineRecord.drugAdministered || '');
  const [dateAdministered, setDateAdministered] = useState(
    vaccineRecord.dateAdministered ? new Date(vaccineRecord.dateAdministered) : new Date()
  );
  const [dosage, setDosage] = useState(vaccineRecord.dosage || 1);
  const [costOfVaccine, setCostOfVaccine] = useState(vaccineRecord.costOfVaccine || '');
  const [administeredBy, setAdministeredBy] = useState(vaccineRecord.administeredBy || '');
  const [practiceId, setPracticeId] = useState(vaccineRecord.practiceId || '');
  const [costOfService, setCostOfService] = useState(vaccineRecord.costOfService || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [errors, setErrors] = useState({});

  const commonAnimals = ['Cow', 'Goat', 'Sheep', 'Chicken', 'Pig'];

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setDateAdministered(selectedDate);
    }
    setShowDatePicker(false);
  };



  const handleUpdate = () => {

    setShowUpdateModal(true);

  };

  const handleDone = () => {
    navigation.navigate('VaccineRecordsScreen');
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.lightGreen }}>
      <SecondaryHeader title="Edit Vaccine Record" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        <Box bg="white" p={5} borderRadius={12} shadow={2} mx={4} my={4}>
          <Heading size="md" mb={4} color={COLORS.darkGray3}>
            Vaccination Details
          </Heading>
          <Divider mb={4} />

          <VStack space={4}>
            <FormControl isRequired isInvalid={'animalIdOrFlockId' in errors}>
              <FormControl.Label _text={styles.labelText}>
                Animal ID or Flock ID
              </FormControl.Label>
              <Select
                selectedValue={animalIdOrFlockId}
                minWidth="100%"
                backgroundColor={COLORS.lightGreen}
                borderRadius={8}
                fontSize="md"
                placeholder="Select Animal ID"
                _selectedItem={{
                  bg: 'emerald.100',

                }}
                accessibilityLabel="Choose Animal ID"
                onValueChange={setAnimalIdOrFlockId}>
                {commonAnimals.map((animal, index) => (
                  <Select.Item
                    key={index}
                    label={`${animal} ${index + 1}`}
                    value={`${animal.charAt(0)}00${index + 1}`}
                  />
                ))}
              </Select>

              <FormControl.HelperText>
                Select an animal from your registered livestock
              </FormControl.HelperText>
            </FormControl>

            {/* Vaccination Type */}
            <FormControl>
              <FormControl.Label _text={styles.labelText}>
                Vaccination Against
              </FormControl.Label>
              <Select
                selectedValue={vaccinationAgainst}
                minWidth="100%"
                backgroundColor={COLORS.lightGreen}
                borderRadius={8}
                fontSize="md"
                placeholder="Select disease or condition"
                _selectedItem={{
                  bg: 'emerald.100',

                }}
                onValueChange={setVaccinationAgainst}>
                <Select.Item label="Foot and Mouth Disease" value="Foot and Mouth Disease" />
                <Select.Item label="Anthrax" value="Anthrax" />
                <Select.Item label="PPR" value="PPR" />
                <Select.Item label="Brucellosis" value="Brucellosis" />
                <Select.Item label="Newcastle Disease" value="Newcastle Disease" />
              </Select>

            </FormControl>

            {/* Drug Name */}
            <FormControl isRequired isInvalid={'drugAdministered' in errors}>
              <FormControl.Label _text={styles.labelText}>
                Drug Administered
              </FormControl.Label>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderRadius={8}
                height={12}
                fontSize="md"
                placeholder="Enter vaccine or drug name"
                value={drugAdministered}
                onChangeText={setDrugAdministered}
              />

            </FormControl>

            {/* Date Section */}
            <FormControl>
              <FormControl.Label _text={styles.labelText}>
                Date Administered
              </FormControl.Label>
              <Box flexDirection="row" alignItems="center">
                <Input
                  flex={1}
                  backgroundColor={COLORS.lightGreen}
                  borderRadius={8}
                  height={12}
                  fontSize="md"
                  value={dateAdministered.toLocaleDateString('en-GB')}
                  placeholder="DD/MM/YY"
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
              <FormControl.HelperText>
                Select the date when vaccination was given
              </FormControl.HelperText>
            </FormControl>

            {/* Dosage with Stepper */}
            <FormControl>
              <FormControl.Label _text={styles.labelText}>
                Dosage (ml)
              </FormControl.Label>
              <HStack alignItems="center" space={2}>
                <Button
                  onPress={() => {
                    const currentValue = parseFloat(dosage) || 1;
                    setDosage(Math.max(currentValue - 0.5, 0.5));
                  }}
                  variant="outline"
                  borderColor={COLORS.green}
                  borderRadius="full"
                  p={0}
                  height={10}
                  width={10}
                  _text={{
                    fontSize: "xl",
                    fontWeight: "bold",
                    color: COLORS.green,
                  }}>
                  -
                </Button>
                <Input
                  flex={1}
                  textAlign="center"
                  variant="outline"
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  borderRadius={8}
                  height={12}
                  fontSize="md"
                  keyboardType="numeric"
                  value={dosage.toString()}
                  onChangeText={text => {
                    const numericText = text.replace(/[^0-9.]/g, '');
                    setDosage(numericText || 1);
                  }}
                  InputRightElement={
                    <Text px={2} color={COLORS.darkGray3}>
                      ml
                    </Text>
                  }
                />
                <Button
                  onPress={() => {
                    const currentValue = parseFloat(dosage) || 1;
                    setDosage(currentValue + 0.5);
                  }}
                  variant="outline"
                  borderColor={COLORS.green}
                  borderRadius="full"
                  p={0}
                  height={10}
                  width={10}
                  _text={{
                    fontSize: "xl",
                    fontWeight: "bold",
                    color: COLORS.green,
                  }}>
                  +
                </Button>
              </HStack>
              <FormControl.HelperText>
                Standard dose is typically 1-2ml per animal
              </FormControl.HelperText>
            </FormControl>

            <Divider my={2} />
            <Heading size="sm" mb={2} color={COLORS.darkGray3}>
              Costs & Administration
            </Heading>

            {/* Cost of Vaccine */}
            <FormControl>
              <FormControl.Label _text={styles.labelText}>
                Cost of Vaccine
              </FormControl.Label>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                borderRadius={8}
                height={12}
                fontSize="md"
                placeholder="0.00"
                keyboardType="numeric"
                value={costOfVaccine}
                InputLeftElement={
                  <Text px={3} color={COLORS.darkGray3}>
                    $
                  </Text>
                }
                onChangeText={text => {
                  const numericText = text.replace(/[^0-9.]/g, '');
                  setCostOfVaccine(numericText);
                }}
              />
            </FormControl>

            {/* Administrator */}
            <FormControl>
              <FormControl.Label _text={styles.labelText}>
                Administered By
              </FormControl.Label>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                borderRadius={8}
                height={12}
                fontSize="md"
                placeholder="Veterinarian or staff name"
                value={administeredBy}
                onChangeText={setAdministeredBy}
              />
            </FormControl>

            {/* Practice ID */}
            <FormControl>
              <FormControl.Label _text={styles.labelText}>
                Practice ID
              </FormControl.Label>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                borderRadius={8}
                height={12}
                fontSize="md"
                placeholder="Veterinary practice ID"
                value={practiceId}
                onChangeText={setPracticeId}
              />
              <FormControl.HelperText>
                ID number of the veterinary practice (if applicable)
              </FormControl.HelperText>
            </FormControl>

            {/* Service Cost */}
            <FormControl>
              <FormControl.Label _text={styles.labelText}>
                Cost of Service
              </FormControl.Label>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                borderRadius={8}
                height={12}
                fontSize="md"
                placeholder="0.00"
                keyboardType="numeric"
                value={costOfService}
                InputLeftElement={
                  <Text px={3} color={COLORS.darkGray3}>
                    $
                  </Text>
                }
                onChangeText={text => {
                  const numericText = text.replace(/[^0-9.]/g, '');
                  setCostOfService(numericText);
                }}
              />
              <FormControl.HelperText>
                Fee charged by veterinarian (if applicable)
              </FormControl.HelperText>
            </FormControl>

            {/* Buttons */}
            <HStack justifyContent="space-between" mt={6} space={4}>
              <Button
                flex={1}
                variant="outline"
                borderWidth={1}
                borderColor={COLORS.green}
                borderRadius={8}
                py={3}
                _text={{
                  color: COLORS.green,
                  fontWeight: "600",
                }}
                onPress={() => navigation.goBack()}>
                Cancel
              </Button>

              <Button
                flex={1}
                backgroundColor={COLORS.green}
                borderRadius={8}
                py={3}
                _pressed={{
                  bg: 'emerald.700',
                }}
                _text={{
                  fontWeight: "600",
                }}
                onPress={handleUpdate}>
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
          alignItems="center"
          zIndex={999}
        >
          <Box bg="white" p={6} borderRadius={16} width="80%" maxWidth="400px" shadow={5}>
            <VStack space={4} alignItems="center">
              <Box
                bg="emerald.100"
                p={4}
                borderRadius="full"
              >
                <FastImage
                  source={icons.tick}
                  style={{ width: 60, height: 60 }}
                  resizeMode="contain"
                />
              </Box>
              <Text fontSize="xl" fontWeight="bold" textAlign="center" color={COLORS.darkGray3}>
                Success!
              </Text>
              <Text fontSize="md" textAlign="center" color="gray.600">
                Vaccine record updated successfully
              </Text>

              <Button
                width="100%"
                bg={COLORS.green}
                borderRadius={8}
                py={3}
                _pressed={{
                  bg: 'emerald.700',
                }}
                _text={{
                  fontWeight: "600",
                }}
                onPress={handleDone}>
                Done
              </Button>
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