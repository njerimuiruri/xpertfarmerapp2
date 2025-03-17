import React, {useState} from 'react';
import {
  Box,
  Text,
  VStack,
  ScrollView,
  Button,
  HStack,
  Input,
} from 'native-base';
import {View, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {COLORS} from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';
import FastImage from 'react-native-fast-image';
import {icons} from '../../constants';

export default function Allergiesrecordsscreen({navigation}) {
  const [animalIdOrFlockId, setAnimalIdOrFlockId] = useState('');
  const [dateRecorded, setDateRecorded] = useState(new Date());
  const [cause, setCause] = useState('');
  const [remedy, setRemedy] = useState('');
  const [availableIds] = useState(['ID 1', 'ID 2', 'ID 3', 'ID 4']);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSave = () => {
    setShowSuccessModal(true);
  };

  const handleDone = () => {
    navigation.navigate('AllergyBoosterScreen');
  };
  const handleAddAnother = () => {
    setShowSuccessModal(false);
  };
  const handleSelect = value => {
    setAnimalIdOrFlockId(value);
    setDropdownVisible(false);
  };

  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setDateRecorded(selectedDate);
    }
    setShowDatePicker(false);
  };
  return (
    <View style={{flex: 1, backgroundColor: COLORS.lightGreen}}>
      <SecondaryHeader title="Allergy Details" />
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
            Fill in the allergy details
          </Text>
          <VStack space={5}>
            {/* Combined Input and Select */}
            <Box>
              <Text
                fontSize="sm"
                fontWeight="500"
                color={COLORS.darkGray3}
                mb={1}>
                Animal ID or Flock ID
              </Text>
              <View>
                <HStack
                  alignItems="center"
                  borderWidth={1}
                  borderRadius={8}
                  borderColor="gray.200">
                  <Input
                    flex={1}
                    variant="unstyled"
                    placeholder="Type or select ID"
                    value={animalIdOrFlockId}
                    onChangeText={text => setAnimalIdOrFlockId(text)}
                    backgroundColor="transparent"
                    borderColor="transparent"
                  />
                  <TouchableOpacity
                    style={{padding: 10}}
                    onPress={() => setDropdownVisible(prev => !prev)}>
                    <Text style={{fontSize: 16, color: COLORS.green}}>▼</Text>
                  </TouchableOpacity>
                </HStack>
                {dropdownVisible && (
                  <Box
                    bg="white"
                    mt={1}
                    borderWidth={1}
                    borderColor="gray.200"
                    borderRadius={8}>
                    {availableIds.map((id, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.dropdownItem}
                        onPress={() => handleSelect(id)}>
                        <Text style={styles.dropdownText}>{id}</Text>
                      </TouchableOpacity>
                    ))}
                  </Box>
                )}
              </View>
            </Box>

            <Box>
              <Text
                fontSize="sm"
                fontWeight="500"
                color={COLORS.darkGray3}
                mb={1}>
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

            {/* Cause */}
            <Box>
              <Text
                fontSize="sm"
                fontWeight="500"
                color={COLORS.darkGray3}
                mb={1}>
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

            {/* Remedy */}
            <Box>
              <Text
                fontSize="sm"
                fontWeight="500"
                color={COLORS.darkGray3}
                mb={1}>
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

            {/* Buttons */}
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
                Allergy Record Added Successfully!
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
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  dropdownText: {
    fontSize: 14,
    color: 'black',
  },
  calendarIcon: {
    width: 40,
    height: 40,
    tintColor: COLORS.green,
  },
});
