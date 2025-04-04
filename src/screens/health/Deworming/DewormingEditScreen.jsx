import React, { useState } from 'react';
import {
  Box,
  Text,
  Input,
  Button,
  VStack,
  Select,
  ScrollView,
  Divider,
  HStack,
  Heading,
  Toast,
} from 'native-base';
import { View, TouchableOpacity, StyleSheet, Image, Keyboard } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import FastImage from 'react-native-fast-image';
import { icons } from '../../../constants';
import { COLORS } from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';

export default function DewormingEditScreen({ navigation, route }) {
  const dewormingRecord = route.params?.record || {};

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



  const handleSave = () => {


    setShowSuccessModal(true);

  };

  const handleDone = () => {
    navigation.navigate('DewormingRecordsScreen');
  };

  const handleAddAnother = () => {
    setShowSuccessModal(false);
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
            <Box >
              <Text fontSize="md" fontWeight="500" color={COLORS.darkGray3}>
                Animal ID or Flock ID
              </Text>
              <Select
                selectedValue={animalIdOrFlockId}
                minWidth="100%"
                backgroundColor={COLORS.lightGreen}
                onValueChange={setAnimalIdOrFlockId}
                _selectedItem={{
                  bg: "lightGreen",

                }}>
                <Select.Item label="ID 1" value="id1" />
                <Select.Item label="ID 2" value="id2" />
              </Select>
            </Box>

            <Box>
              <Text fontSize="md" fontWeight="500" color={COLORS.darkGray3}>
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
            <Box >
              <Text fontSize="md" fontWeight="500" color={COLORS.darkGray3}>
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


            {/* Dosage */}
            <Box >
              <Text fontSize="md" fontWeight="500" color={COLORS.darkGray3}>
                Dosage (ml)
              </Text>
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
            </Box>

            {/* Cost of Vaccine */}
            <Box >
              <Text fontSize="md" fontWeight="500" color={COLORS.darkGray3}>
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
            <Box >
              <Text fontSize="md" fontWeight="500" color={COLORS.darkGray3}>
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
            <Box >
              <Text fontSize="md" fontWeight="500" color={COLORS.darkGray3}>
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
            <Box >
              <Text fontSize="md" fontWeight="500" color={COLORS.darkGray3}>
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
            <Box >
              <Text fontSize="md" fontWeight="500" color={COLORS.darkGray3}>
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
            <Box >
              <Text fontSize="md" fontWeight="500" color={COLORS.darkGray3}>
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
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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