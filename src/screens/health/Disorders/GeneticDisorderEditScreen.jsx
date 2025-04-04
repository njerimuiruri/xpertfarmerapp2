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

export default function GeneticDisorderEditScreen({ navigation, route }) {
  const geneticDisorderRecord = route.params?.record || {};

  const [animalIdOrFlockId, setAnimalIdOrFlockId] = useState(geneticDisorderRecord.animalIdOrFlockId || '');
  const [conditionName, setConditionName] = useState(geneticDisorderRecord.conditionName || '');
  const [remedy, setRemedy] = useState(geneticDisorderRecord.remedy || '');
  const [dateRecorded, setDateRecorded] = useState(geneticDisorderRecord.dateRecorded ? new Date(geneticDisorderRecord.dateRecorded) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [errors, setErrors] = useState({});

  const commonConditions = [
    'Hereditary Cancer',
    'Chronic Kidney Disease',
    'Hip Dysplasia',
    'Diabetes',
    'Arthritis',
  ];

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setDateRecorded(selectedDate);
    }
    setShowDatePicker(false);
  };

  const handleUpdate = () => {  
      setShowUpdateModal(true);
   
  };

  const handleDone = () => {
    navigation.navigate('GeneticDisorderRecordsScreen');
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.lightGreen }}>
      <SecondaryHeader title="Edit Genetic Disorder Record" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        <Box bg="white" p={5} borderRadius={12} shadow={2} mx={4} my={4}>
          <Heading size="md" mb={4} color={COLORS.darkGray3}>
            Genetic Disorder Details
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
                borderColor={errors.animalIdOrFlockId ? "red.500" : "gray.200"}
                borderRadius={8}
                placeholder="Enter Animal ID or Flock ID"
                value={animalIdOrFlockId}
                onChangeText={setAnimalIdOrFlockId}
              />
              <FormControl.ErrorMessage>
                {errors.animalIdOrFlockId}
              </FormControl.ErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={'conditionName' in errors}>
              <FormControl.Label _text={styles.labelText}>
                Condition Name
              </FormControl.Label>
              <Select
                selectedValue={conditionName}
                minWidth="100%"
                backgroundColor={COLORS.lightGreen}
                borderColor={errors.conditionName ? "red.500" : "gray.200"}
                borderRadius={8}
                fontSize="md"
                placeholder="Select Condition"
                accessibilityLabel="Choose condition name"
                onValueChange={setConditionName}>
                {commonConditions.map((condition, index) => (
                  <Select.Item key={index} label={condition} value={condition} />
                ))}
              </Select>
              <FormControl.ErrorMessage>
                {errors.conditionName}
              </FormControl.ErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={'remedy' in errors}>
              <FormControl.Label _text={styles.labelText}>
                Remedy
              </FormControl.Label>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderColor={errors.remedy ? "red.500" : "gray.200"}
                borderRadius={8}
                placeholder="Enter recommended remedy"
                value={remedy}
                onChangeText={setRemedy}
              />
              <FormControl.ErrorMessage>
                {errors.remedy}
              </FormControl.ErrorMessage>
            </FormControl>

            <FormControl>
              <FormControl.Label _text={styles.labelText}>
                Date Recorded
              </FormControl.Label>
              <Box flexDirection="row" alignItems="center">
                <Input
                  flex={1}
                  backgroundColor={COLORS.lightGreen}
                  borderRadius={8}
                  isReadOnly
                  value={dateRecorded.toLocaleDateString('en-GB')}
                  placeholder="DD/MM/YYYY"
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
                  value={dateRecorded}
                  mode="date"
                  is24Hour={true}
                  onChange={handleDateChange}
                />
              )}
              <FormControl.HelperText>
                Select the date when the disorder was recorded
              </FormControl.HelperText>
            </FormControl>

            <HStack justifyContent="space-between" mt={6}>
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
                  style={{width: 60, height: 60}}
                  resizeMode="contain"
                />
              </Box>
              <Text fontSize="xl" fontWeight="bold" textAlign="center" color={COLORS.darkGray3}>
                Success!
              </Text>
              <Text fontSize="md" textAlign="center" color="gray.600">
                Genetic disorder record updated successfully
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