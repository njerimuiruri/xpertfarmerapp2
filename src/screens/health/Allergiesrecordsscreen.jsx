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

export default function Allergiesrecordsscreen({ navigation }) {
  const [animalIdOrFlockId, setAnimalIdOrFlockId] = useState('');
  const [dateRecorded, setDateRecorded] = useState(new Date());
  const [cause, setCause] = useState('');
  const [remedy, setRemedy] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setDateRecorded(selectedDate);
    }
    setShowDatePicker(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.lightGreen }}>
      <SecondaryHeader title="Allergy Details" />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'flex-start',
          marginTop: 5,
        }}>
        <Box bg="white" p={6} borderRadius={8} shadow={1} mx={6} my={8}>
          <Text style={{ fontSize: 16, color: 'black', marginBottom: 16, textAlign: 'center' }}>
            Fill in the allergy details
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
                Date Recorded
              </Text>
              <HStack alignItems="center">
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
              </HStack>
              {showDatePicker && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={dateRecorded}
                  mode="date"
                  is24Hour={true}
                  onChange={handleDateChange}
                />
              )}
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color="gray.700" mb={1}>
                Cause
              </Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Enter cause of allergy"
                value={cause}
                onChangeText={setCause}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color="gray.700" mb={1}>
                Remedy
              </Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Enter remedy"
                value={remedy}
                onChangeText={setRemedy}
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
  calendarIcon: {
    width: 40,
    height: 40,
    tintColor: COLORS.green,
  },
});