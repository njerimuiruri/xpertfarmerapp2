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

export default function SheepGoatDetailsScreen({ navigation }) {
  const [animalIdOrFlockId, setAnimalIdOrFlockId] = useState('');
  const [shearingDate, setShearingDate] = useState(new Date());
  const [woolWeight, setWoolWeight] = useState(0);
  const [woolQuality, setWoolQuality] = useState('');
  const [weaningWeight, setWeaningWeight] = useState(0);
  const [milkYield, setMilkYield] = useState(0);
  const [saleWeight, setSaleWeight] = useState(0);
  const [saleDate, setSaleDate] = useState(new Date());
  const [marketPrice, setMarketPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [isCompany, setIsCompany] = useState(false);
  const [isIndividual, setIsIndividual] = useState(false);
  const [showShearingDatePicker, setShowShearingDatePicker] = useState(false);
  const [showSaleDatePicker, setShowSaleDatePicker] = useState(false);

  const handleDateChange = (setter) => (event, selectedDate) => {
    setter(selectedDate || new Date());
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.lightGreen }}>
      <SecondaryHeader title="Add Sheep/Goat Record" />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'flex-start',
          marginTop: 5,
        }}>
        <Box bg="white" p={6} borderRadius={8} shadow={1} mx={6} my={8}>
          <Text style={{ fontSize: 16, color: 'black', marginBottom: 16, textAlign: 'center' }}>
            Fill in the sheep/goat details
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

            {/* Wool/Fiber Production */}
            <Text fontSize="lg" fontWeight="bold" color="gray.800" mt={4}>
              Wool/Fiber Production
            </Text>
            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Shearing Date
              </Text>
              <HStack alignItems="center">
                <Input
                  w="85%"
                  backgroundColor={COLORS.lightGreen}
                  value={shearingDate.toLocaleDateString('en-GB')}
                  placeholder="DD/MM/YY"
                  isReadOnly
                />
                <TouchableOpacity onPress={() => setShowShearingDatePicker(true)}>
                  <Image
                    source={icons.calendar}
                    resizeMode="contain"
                    style={styles.calendarIcon}
                  />
                </TouchableOpacity>
              </HStack>
              {showShearingDatePicker && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={shearingDate}
                  mode="date"
                  is24Hour={true}
                  onChange={handleDateChange(setShearingDate)}
                />
              )}
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Wool Weight
              </Text>
              <HStack alignItems="center">
                <Button
                  onPress={() => setWoolWeight(woolWeight > 0 ? woolWeight - 1 : 0)}
                  variant="outline"
                  p={2}>
                  -
                </Button>
                <Input
                  flex={1}
                  variant="outline"
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  placeholder="Enter wool weight"
                  keyboardType="numeric"
                  value={woolWeight.toString()}
                  onChangeText={text => setWoolWeight(Math.max(0, parseInt(text) || 0))}
                />
                <Button
                  onPress={() => setWoolWeight(woolWeight + 1)}
                  variant="outline"
                  p={2}>
                  +
                </Button>
              </HStack>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Wool Quality
              </Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Enter wool quality"
                value={woolQuality}
                onChangeText={setWoolQuality}
              />
            </Box>

            {/* Meat and Milk Production */}
            <Text fontSize="lg" fontWeight="bold" color="gray.800" mt={4}>
              Meat and Milk Production
            </Text>
            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Weaning Weight
              </Text>
              <HStack alignItems="center">
                <Button
                  onPress={() => setWeaningWeight(weaningWeight > 0 ? weaningWeight - 1 : 0)}
                  variant="outline"
                  p={2}>
                  -
                </Button>
                <Input
                  flex={1}
                  variant="outline"
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  placeholder="Enter weaning weight"
                  keyboardType="numeric"
                  value={weaningWeight.toString()}
                  onChangeText={text => setWeaningWeight(Math.max(0, parseInt(text) || 0))}
                />
                <Button
                  onPress={() => setWeaningWeight(weaningWeight + 1)}
                  variant="outline"
                  p={2}>
                  +
                </Button>
              </HStack>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Milk Yield
              </Text>
              <HStack alignItems="center">
                <Button
                  onPress={() => setMilkYield(milkYield > 0 ? milkYield - 1 : 0)}
                  variant="outline"
                  p={2}>
                  -
                </Button>
                <Input
                  flex={1}
                  variant="outline"
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  placeholder="Enter milk yield"
                  keyboardType="numeric"
                  value={milkYield.toString()}
                  onChangeText={text => setMilkYield(Math.max(0, parseInt(text) || 0))}
                />
                <Button
                  onPress={() => setMilkYield(milkYield + 1)}
                  variant="outline"
                  p={2}>
                  +
                </Button>
              </HStack>
            </Box>

            {/* Sale Information */}
            <Text fontSize="lg" fontWeight="bold" color="gray.800" mt={4}>
              Sale Information
            </Text>
            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Sale Weight
              </Text>
              <HStack alignItems="center">
                <Button
                  onPress={() => setSaleWeight(saleWeight > 0 ? saleWeight - 1 : 0)}
                  variant="outline"
                  p={2}>
                  -
                </Button>
                <Input
                  flex={1}
                  variant="outline"
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  placeholder="Enter sale weight"
                  keyboardType="numeric"
                  value={saleWeight.toString()}
                  onChangeText={text => setSaleWeight(Math.max(0, parseInt(text) || 0))}
                />
                <Button
                  onPress={() => setSaleWeight(saleWeight + 1)}
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
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Enter market price"
                keyboardType="numeric"
                value={marketPrice}
                onChangeText={setMarketPrice}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Sale Price
              </Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Enter sale price"
                keyboardType="numeric"
                value={salePrice}
                onChangeText={setSalePrice}
              />
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
});