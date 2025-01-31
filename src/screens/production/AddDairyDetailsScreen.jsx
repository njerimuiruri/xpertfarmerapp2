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

export default function DairyDetailsScreen({ navigation }) {
  const [animalIdOrFlockId, setAnimalIdOrFlockId] = useState('');
  const [dailyMilkYield, setDailyMilkYield] = useState('');
  const [milkQuality, setMilkQuality] = useState('');
  const [lactationPeriod, setLactationPeriod] = useState(new Date());
  const [dryingOffPeriod, setDryingOffPeriod] = useState(new Date());
  const [saleQuantity, setSaleQuantity] = useState('');
  const [saleDate, setSaleDate] = useState(new Date());
  const [marketPrice, setMarketPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [isCompany, setIsCompany] = useState(false);
  const [isIndividual, setIsIndividual] = useState(false);
  const [showLactationPicker, setShowLactationPicker] = useState(false);
  const [showDryingOffPicker, setShowDryingOffPicker] = useState(false);
  const [showSaleDatePicker, setShowSaleDatePicker] = useState(false);
const [availableIds] = useState(['ID 1', 'ID 2', 'ID 3', 'ID 4']);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleSelect = value => {
    setAnimalIdOrFlockId(value);
    setDropdownVisible(false);
  };
  const handleDateChange = (setter) => (event, selectedDate) => {
    setter(selectedDate || new Date());
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.lightGreen }}>
      <SecondaryHeader title="Dairy Details" />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'flex-start',
          marginTop: 5,
        }}>
        <Box bg="white" p={6} borderRadius={8} shadow={1} mx={6} my={8}>
          <Text style={{ fontSize: 16, color: 'black', marginBottom: 16, textAlign: 'center' }}>
            Fill in the Dairy details
          </Text>
          <VStack space={5}>
          <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
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
                    style={{ padding: 10 }}
                    onPress={() => setDropdownVisible(prev => !prev)}>
                    <Text style={{ fontSize: 16, color: COLORS.green }}>▼</Text>
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
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Daily Milk Yield
              </Text>
              <HStack alignItems="center" space={2}>
                <Button
                  onPress={() => {
                    const currentValue = parseFloat(dailyMilkYield) || 0;
                    setDailyMilkYield((currentValue - 1).toString());
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
                  placeholder="Enter yield"
                  keyboardType="numeric"
                  value={dailyMilkYield.toString()}
                  onChangeText={text => {
                    const numericText = text.replace(/[^0-9.]/g, ''); 
                    setDailyMilkYield(numericText);
                  }}
                />
                <Button
                  onPress={() => {
                    const currentValue = parseFloat(dailyMilkYield) || 0;
                    setDailyMilkYield((currentValue + 1).toString());
                  }}
                  variant="outline"
                  p={2}>
                  +
                </Button>
              </HStack>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Milk Quality
              </Text>
              <HStack alignItems="center" space={2}>
                <Button
                  onPress={() => {
                    const currentValue = parseFloat(milkQuality) || 0;
                    setMilkQuality((currentValue - 1).toString());
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
                  placeholder="Enter quality"
                  keyboardType="numeric"
                  value={milkQuality.toString()}
                  onChangeText={text => {
                    const numericText = text.replace(/[^0-9.]/g, '');
                    setMilkQuality(numericText);
                  }}
                />
                <Button
                  onPress={() => {
                    const currentValue = parseFloat(milkQuality) || 0;
                    setMilkQuality((currentValue + 1).toString());
                  }}
                  variant="outline"
                  p={2}>
                  +
                </Button>
              </HStack>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Lactation Period
              </Text>
              <HStack alignItems="center">
                <Input
                  w="85%"
                  backgroundColor={COLORS.lightGreen}
                  value={lactationPeriod.toLocaleDateString('en-GB')}
                  placeholder="DD/MM/YY"
                  isReadOnly
                />
                <TouchableOpacity onPress={() => setShowLactationPicker(true)}>
                  <Image
                    source={icons.calendar}
                    resizeMode="contain"
                    style={styles.calendarIcon}
                  />
                </TouchableOpacity>
              </HStack>
              {showLactationPicker && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={lactationPeriod}
                  mode="date"
                  is24Hour={true}
                  onChange={handleDateChange(setLactationPeriod)}
                />
              )}
            </Box>
            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Drying Off Period
              </Text>
              <HStack alignItems="center">
                <Input
                  w="85%"
                  backgroundColor={COLORS.lightGreen}
                  value={dryingOffPeriod.toLocaleDateString('en-GB')}
                  placeholder="DD/MM/YY"
                  isReadOnly
                />
                <TouchableOpacity onPress={() => setShowDryingOffPicker(true)}>
                  <Image
                    source={icons.calendar}
                    resizeMode="contain"
                    style={styles.calendarIcon}
                  />
                </TouchableOpacity>
              </HStack>
              {showDryingOffPicker && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={dryingOffPeriod}
                  mode="date"
                  is24Hour={true}
                  onChange={handleDateChange(setDryingOffPeriod)}
                />
              )}
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Sale Quantity
              </Text>
              <HStack alignItems="center" space={2}>
                <Button
                  onPress={() => {
                    const currentValue = parseFloat(saleQuantity) || 0;
                    setSaleQuantity((currentValue - 1).toString());
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
                  placeholder="Enter quantity"
                  keyboardType="numeric"
                  value={saleQuantity.toString()}
                  onChangeText={text => {
                    const numericText = text.replace(/[^0-9.]/g, ''); 
                    setSaleQuantity(numericText);
                  }}
                />
                <Button
                  onPress={() => {
                    const currentValue = parseFloat(saleQuantity) || 0;
                    setSaleQuantity((currentValue + 1).toString());
                  }}
                  variant="outline"
                  p={2}>
                  +
                </Button>
              </HStack>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Sale Date
              </Text>
              <HStack alignItems="center">
                <Input
                  w="85%"
                  backgroundColor={COLORS.lightGreen}
                  value={saleDate.toLocaleDateString('en-GB')}
                  placeholder="DD/MM/YY"
                  isReadOnly
                />
                <TouchableOpacity onPress={() => setShowSaleDatePicker(true)}>
                  <Image
                    source={icons.calendar}
                    resizeMode="contain"
                    style={styles.calendarIcon}
                  />
                </TouchableOpacity>
              </HStack>
              {showSaleDatePicker && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={saleDate}
                  mode="date"
                  is24Hour={true}
                  onChange={handleDateChange(setSaleDate)}
                />
              )}
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Market Price
              </Text>
              <HStack alignItems="center" space={2}>
                <Button
                  onPress={() => {
                    const currentValue = parseFloat(marketPrice) || 0;
                    setMarketPrice((currentValue - 1).toString());
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
                  placeholder="Enter market price"
                  keyboardType="numeric"
                  value={marketPrice.toString()}
                  onChangeText={text => {
                    const numericText = text.replace(/[^0-9.]/g, ''); 
                    setMarketPrice(numericText);
                  }}
                />
                <Button
                  onPress={() => {
                    const currentValue = parseFloat(marketPrice) || 0;
                    setMarketPrice((currentValue + 1).toString());
                  }}
                  variant="outline"
                  p={2}>
                  +
                </Button>
              </HStack>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Sale Price
              </Text>
              <HStack alignItems="center" space={2}>
                <Button
                  onPress={() => {
                    const currentValue = parseFloat(salePrice) || 0;
                    setSalePrice((currentValue - 1).toString());
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
                  placeholder="Enter sale price"
                  keyboardType="numeric"
                  value={salePrice.toString()}
                  onChangeText={text => {
                    const numericText = text.replace(/[^0-9.]/g, ''); 
                    setSalePrice(numericText);
                  }}
                />
                <Button
                  onPress={() => {
                    const currentValue = parseFloat(salePrice) || 0;
                    setSalePrice((currentValue + 1).toString());
                  }}
                  variant="outline"
                  p={2}>
                  +
                </Button>
              </HStack>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Buyer’s Name
              </Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Enter buyer’s name"
                value={buyerName}
                onChangeText={setBuyerName}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={2}>
                Buyer Type
              </Text>
              <VStack space={2}>
                <Checkbox
                  isChecked={isCompany}
                  onChange={() => setIsCompany(!isCompany)}>
                  Company
                </Checkbox>
                <Checkbox
                  isChecked={isIndividual}
                  onChange={() => setIsIndividual(!isIndividual)}>
                  Individual
                </Checkbox>
              </VStack>
            </Box>
          </VStack>

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
              }}>
              Save
            </Button>
          </HStack>
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
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  dropdownText: {
    fontSize: 14,
    color: 'black',
  },
});