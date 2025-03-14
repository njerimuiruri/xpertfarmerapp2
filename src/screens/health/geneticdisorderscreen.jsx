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
} from 'native-base';
import {View, TouchableOpacity, StyleSheet, Image} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import FastImage from 'react-native-fast-image';
import {icons} from '../../constants';
import {COLORS} from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';

export default function Geneticdisorderscreen({navigation}) {
  const [animalIdOrFlockId, setAnimalIdOrFlockId] = useState('');
  const [dateRecorded, setDateRecorded] = useState(new Date());
  const [nameOfCondition, setNameOfCondition] = useState('');
  const [remedy, setRemedy] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setDateRecorded(selectedDate);
    }
    setShowDatePicker(false);
  };
  const handleSave = () => {
    setShowSuccessModal(true);
  };

  const handleDone = () => {
    navigation.navigate('Allergiesrecordsscreen');
  };
  const handleAddAnother = () => {
    setShowSuccessModal(false);
  };
  return (
    <View style={{flex: 1, backgroundColor: COLORS.lightGreen}}>
      <SecondaryHeader title="Genetic Disorder Details" />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'flex-start',
          marginTop: 5,
        }}>
        <Box bg="white" p={6} borderRadius={8} shadow={1} mx={6} my={8}>
          <Text
            style={{
              fontSize: 16,
              color: 'black',
              marginBottom: 16,
              textAlign: 'center',
            }}>
            Fill in the Genetic disorder
          </Text>
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
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={{marginLeft: 10}}>
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
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Name of the Condition
              </Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Enter condition name"
                value={nameOfCondition}
                onChangeText={setNameOfCondition}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
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
                Genetic Disorder Record Added Successfully!
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
  calendarIcon: {
    width: 40,
    height: 40,
    tintColor: COLORS.green,
  },
});
