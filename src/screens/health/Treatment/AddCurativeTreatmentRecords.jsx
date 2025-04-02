import React, {useState} from 'react';
import {
  Box,
  Text,
  Input,
  Button,
  VStack,
  Select,
  ScrollView,
  HStack,
  Radio,
} from 'native-base';
import {View, TouchableOpacity, StyleSheet, Image} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import FastImage from 'react-native-fast-image';
import {icons} from '../../../constants';
import {COLORS} from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';

export default function AddCurativeTreatmentRecords({navigation}) {
  const [animalIdOrFlockId, setAnimalIdOrFlockId] = useState('');
  const [healthEventDate, setHealthEventDate] = useState(new Date());
  const [healthEventSymptoms, setHealthEventSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentType, setTreatmentType] = useState('');

  const [drugAdministered, setDrugAdministered] = useState('');
  const [dateAdministered, setDateAdministered] = useState(new Date());
  const [dosageAdministered, setDosageAdministered] = useState('1');
  const [costOfDrugs, setCostOfDrugs] = useState('');

  const [medicalOfficerName, setMedicalOfficerName] = useState('');
  const [licenseId, setLicenseId] = useState('');
  const [costOfService, setCostOfService] = useState('');

  const [farmerWitnessName, setFarmerWitnessName] = useState('');
  const [notes, setNotes] = useState('');
  const [treatmentDescription, setTreatmentDescription] = useState('');

  const [showHealthEventDatePicker, setShowHealthEventDatePicker] =
    useState(false);
  const [showDateAdministeredPicker, setShowDateAdministeredPicker] =
    useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleHealthEventDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setHealthEventDate(selectedDate);
    }
    setShowHealthEventDatePicker(false);
  };

  const handleDateAdministeredChange = (event, selectedDate) => {
    if (selectedDate) {
      setDateAdministered(selectedDate);
    }
    setShowDateAdministeredPicker(false);
  };

  const handleSave = () => {
    setShowSuccessModal(true);
  };
  const handleDone = () => {
    navigation.navigate('CurativeTreatmentRecordsScreen');
  };

  const handleAddAnother = () => {
    setShowSuccessModal(false);
  };

  const treatmentTypes = [
    'Curative',
    'Preventive',
    'Supportive',
    'Behavioral and Alternative',
  ];

  return (
    <View style={{flex: 1, backgroundColor: COLORS.lightGreen}}>
      <SecondaryHeader title="Curative Treatment" />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          marginTop: 5,
        }}>
        <Box bg="white" p={6} borderRadius={8} shadow={1} mx={6} my={8}>
          <VStack space={5}>
            <Box>
              <Text
                fontSize="sm"
                fontWeight="500"
                color={COLORS.darkGray3}
                mb={1}>
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

            <View style={styles.formGroup}>
              <Text
                fontSize="sm"
                fontWeight="500"
                color={COLORS.darkGray3}
                mb={1}>
                Health Event Date
              </Text>
              <View style={styles.dateContainer}>
                <Input
                  w="85%"
                  backgroundColor={COLORS.lightGreen}
                  value={healthEventDate.toLocaleDateString('en-GB')}
                  placeholder="DD/MM/YY"
                  isReadOnly
                />
                <TouchableOpacity
                  onPress={() => setShowHealthEventDatePicker(true)}>
                  <Image
                    source={icons.calendar}
                    resizeMode="contain"
                    style={styles.calendarIcon}
                  />
                </TouchableOpacity>
              </View>
              {showHealthEventDatePicker && (
                <DateTimePicker
                  testID="healthEventDatePicker"
                  value={healthEventDate}
                  mode="date"
                  is24Hour={true}
                  onChange={handleHealthEventDateChange}
                />
              )}
            </View>

            <Box>
              <Text
                fontSize="sm"
                fontWeight="500"
                color={COLORS.darkGray3}
                mb={1}>
                Health Event Symptoms
              </Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Enter symptoms"
                value={healthEventSymptoms}
                onChangeText={setHealthEventSymptoms}
                multiline
                numberOfLines={2}
              />
            </Box>

            <Box>
              <Text
                fontSize="sm"
                fontWeight="500"
                color={COLORS.darkGray3}
                mb={1}>
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
              <Text
                fontSize="sm"
                fontWeight="500"
                color={COLORS.darkGray3}
                mb={1}>
                Treatment Given
              </Text>
              <Radio.Group
                name="treatmentType"
                value={treatmentType}
                onChange={setTreatmentType}>
                <VStack space={2}>
                  {treatmentTypes.map(type => (
                    <Radio key={type} value={type} my={1}>
                      {type}
                    </Radio>
                  ))}
                </VStack>
              </Radio.Group>
            </Box>

            {/* Conditional Rendering of Curative Treatment Details */}
            {treatmentType === 'Curative' && (
              <VStack space={4} pl={4} mt={2}>
                <Text fontSize="md" fontWeight="500" color={COLORS.darkGray3}>
                  Curative Treatment Details:
                </Text>

                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="500"
                    color={COLORS.darkGray3}
                    mb={1}>
                    Drug Administered (Name and Type)
                  </Text>
                  <Input
                    variant="outline"
                    backgroundColor={COLORS.lightGreen}
                    borderColor="gray.200"
                    placeholder="Enter drug name and type"
                    value={drugAdministered}
                    onChangeText={setDrugAdministered}
                  />
                </Box>

                <View style={styles.formGroup}>
                  <Text
                    fontSize="sm"
                    fontWeight="500"
                    color={COLORS.darkGray3}
                    mb={1}>
                    Date Administered
                  </Text>
                  <View style={styles.dateContainer}>
                    <Input
                      w="85%"
                      backgroundColor={COLORS.lightGreen}
                      value={dateAdministered.toLocaleDateString('en-GB')}
                      placeholder="DD/MM/YY"
                      isReadOnly
                    />
                    <TouchableOpacity
                      onPress={() => setShowDateAdministeredPicker(true)}>
                      <Image
                        source={icons.calendar}
                        resizeMode="contain"
                        style={styles.calendarIcon}
                      />
                    </TouchableOpacity>
                  </View>
                  {showDateAdministeredPicker && (
                    <DateTimePicker
                      testID="dateAdministeredPicker"
                      value={dateAdministered}
                      mode="date"
                      is24Hour={true}
                      onChange={handleDateAdministeredChange}
                    />
                  )}
                </View>

                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="500"
                    color={COLORS.darkGray3}
                    mb={1}>
                    Dosage Administered
                  </Text>
                  <HStack alignItems="center" space={2}>
                    <Button
                      onPress={() => {
                        const currentValue =
                          parseFloat(dosageAdministered) || 1;
                        setDosageAdministered(
                          Math.max(currentValue - 1, 1).toString(),
                        );
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
                      value={dosageAdministered.toString()}
                      onChangeText={text => {
                        const numericText = text.replace(/[^0-9.]/g, '');
                        setDosageAdministered(numericText);
                      }}
                    />
                    <Button
                      onPress={() => {
                        const currentValue =
                          parseFloat(dosageAdministered) || 1;
                        setDosageAdministered((currentValue + 1).toString());
                      }}
                      variant="outline"
                      p={2}>
                      +
                    </Button>
                  </HStack>
                </Box>

                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="500"
                    color={COLORS.darkGray3}
                    mb={1}>
                    Cost of Drugs
                  </Text>
                  <Input
                    variant="outline"
                    backgroundColor={COLORS.lightGreen}
                    borderColor="gray.200"
                    placeholder="Enter cost of drugs"
                    keyboardType="numeric"
                    value={costOfDrugs}
                    onChangeText={setCostOfDrugs}
                  />
                </Box>
              </VStack>
            )}

            {/* Treatment Description for Non-Curative Types */}
            {(treatmentType === 'Preventive' || 
              treatmentType === 'Supportive' || 
              treatmentType === 'Behavioral and Alternative') && (
              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="500"
                  color={COLORS.darkGray3}
                  mb={1}>
                  Treatment Description
                </Text>
                <Input
                  variant="outline"
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  placeholder="Describe the preventive/supportive/behavioral treatment"
                  value={treatmentDescription}
                  onChangeText={setTreatmentDescription}
                  multiline
                  numberOfLines={4}
                />
              </Box>
            )}

            {/* Medical Officer */}
            <Box mt={2}>
              <Text
                fontSize="sm"
                fontWeight="500"
                color={COLORS.darkGray3}
                mb={1}>
                Medical Officer
              </Text>
              <VStack space={3} pl={4}>
                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="500"
                    color={COLORS.darkGray3}
                    mb={1}>
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
                  <Text
                    fontSize="sm"
                    fontWeight="500"
                    color={COLORS.darkGray3}
                    mb={1}>
                    License ID
                  </Text>
                  <Input
                    variant="outline"
                    backgroundColor={COLORS.lightGreen}
                    borderColor="gray.200"
                    placeholder="Enter license ID"
                    value={licenseId}
                    onChangeText={setLicenseId}
                  />
                </Box>

                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="500"
                    color={COLORS.darkGray3}
                    mb={1}>
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
              </VStack>
            </Box>

            {/* Farmer or Witness */}
            <Box>
              <Text
                fontSize="sm"
                fontWeight="500"
                color={COLORS.darkGray3}
                mb={1}>
                Farmer or Witness
              </Text>
              <VStack space={3} pl={4}>
                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="500"
                    color={COLORS.darkGray3}
                    mb={1}>
                    Name
                  </Text>
                  <Input
                    variant="outline"
                    backgroundColor={COLORS.lightGreen}
                    borderColor="gray.200"
                    placeholder="Enter farmer or witness name"
                    value={farmerWitnessName}
                    onChangeText={setFarmerWitnessName}
                  />
                </Box>

                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="500"
                    color={COLORS.darkGray3}
                    mb={1}>
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
              </VStack>
            </Box>

            {/* Navigation Buttons */}
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
          alignItems="center">
          <Box bg="white" p={6} borderRadius={8} width="80%" maxWidth="400px">
            <VStack space={4} alignItems="center">
              <FastImage
                source={icons.tick}
                style={{width: 60, height: 60}}
                resizeMode="contain"
              />
              <Text fontSize="lg" fontWeight="bold" textAlign="center">
                Curative Treatment Record Added Successfully!
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