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
import {icons} from '../../constants'; // Ensure you have appropriate icons in your constants
import {COLORS} from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';

export default function AddGoodsInStock({navigation}) {
  const [itemName, setItemName] = useState('');
  const [sku, setSku] = useState('');
  const [quantity, setQuantity] = useState(0); // Change to number
  const [currentLocation, setCurrentLocation] = useState('');
  const [condition, setCondition] = useState('');
  const [expirationDate, setExpirationDate] = useState(new Date());
  const [showExpirationDatePicker, setShowExpirationDatePicker] =
    useState(false);

  const handleDateChange =
    (setDate, setShowDatePicker) => (event, selectedDate) => {
      if (selectedDate) {
        setDate(selectedDate);
      }
      setShowDatePicker(false);
    };

  const incrementQuantity = () => {
    setQuantity(prevQuantity => prevQuantity + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prevQuantity => (prevQuantity > 0 ? prevQuantity - 1 : 0));
  };

  return (
    <View style={{flex: 1, backgroundColor: COLORS.lightGreen}}>
      <SecondaryHeader title="Add Goods in Stock" />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
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
            Please fill in the inventory details.
          </Text>

          <VStack space={5}>
            <Box>
              <Text
                fontSize="sm"
                fontWeight="500"
                color={COLORS.darkGray3}
                mb={1}>
                Item Name
              </Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Enter item name"
                value={itemName}
                onChangeText={setItemName}
              />
            </Box>

            <Box>
              <Text
                fontSize="sm"
                fontWeight="500"
                color={COLORS.darkGray3}
                mb={1}>
                SKU
              </Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Enter SKU"
                value={sku}
                onChangeText={setSku}
              />
            </Box>

            <Box>
              <Text
                fontSize="sm"
                fontWeight="500"
                color={COLORS.darkGray3}
                mb={1}>
                Quantity
              </Text>
              <HStack alignItems="center" space={4}>
                <Button onPress={decrementQuantity} size="sm" colorScheme="red">
                  -
                </Button>
                <Input
                  variant="outline"
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  placeholder="0"
                  value={String(quantity)} // Convert to string for input
                  onChangeText={text => {
                    const num = parseInt(text, 10);
                    setQuantity(isNaN(num) ? 0 : num); // Allow manual input
                  }}
                  keyboardType="numeric"
                  width="50"
                  textAlign="center"
                />
                <Button
                  onPress={incrementQuantity}
                  size="sm"
                  colorScheme="green">
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
                Current Location
              </Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Enter current location"
                value={currentLocation}
                onChangeText={setCurrentLocation}
              />
            </Box>

            <Box>
              <Text
                fontSize="sm"
                fontWeight="500"
                color={COLORS.darkGray3}
                mb={1}>
                Condition
              </Text>
              <Select
                selectedValue={condition}
                minWidth="100%"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Select condition"
                onValueChange={setCondition}>
                <Select.Item label="New" value="new" />
                <Select.Item label="Used" value="used" />
                <Select.Item label="Refurbished" value="refurbished" />
              </Select>
            </Box>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Expiration Date</Text>
              <View style={styles.dateContainer}>
                <Input
                  w="85%"
                  backgroundColor={COLORS.lightGreen}
                  value={expirationDate.toLocaleDateString('en-GB')}
                  placeholder="DD/MM/YY"
                  isReadOnly
                />
                <TouchableOpacity
                  onPress={() => setShowExpirationDatePicker(true)}>
                  <Image
                    source={icons.calendar}
                    resizeMode="contain"
                    style={styles.calendarIcon}
                  />
                </TouchableOpacity>
              </View>
              {showExpirationDatePicker && (
                <DateTimePicker
                  testID="expirationDatePicker"
                  value={expirationDate}
                  mode="date"
                  is24Hour={true}
                  onChange={handleDateChange(
                    setExpirationDate,
                    setShowExpirationDatePicker,
                  )}
                />
              )}
            </View>

            <HStack justifyContent="center" mt={6} space={8}>
              <Button
                variant="outline"
                borderWidth={1}
                borderColor={COLORS.green}
                borderRadius={8}
                px={6}
                py={3}
                _text={{
                  color: COLORS.green,
                }}
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
                onPress={() => navigation.goBack()}>
                Save
              </Button>
            </HStack>
          </VStack>
        </Box>
      </ScrollView>
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
    color: COLORS.lightGray1,
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
    tintColor: COLORS.green2,
  },
});
