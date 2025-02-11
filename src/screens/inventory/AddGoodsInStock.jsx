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
  Modal,
} from 'native-base';
import {View, TouchableOpacity, StyleSheet, Image} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {icons} from '../../constants';
import {COLORS} from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';
import FastImage from 'react-native-fast-image';

export default function AddGoodsInStock({navigation}) {
  const [itemName, setItemName] = useState('');
  const [sku, setSku] = useState('');
  const [quantity, setQuantity] = useState('0');
  const [currentLocation, setCurrentLocation] = useState('');
  const [condition, setCondition] = useState('');
  const [expirationDate, setExpirationDate] = useState(new Date());
  const [showExpirationDatePicker, setShowExpirationDatePicker] =
    useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleDateChange =
    (setDate, setShowDatePicker) => (event, selectedDate) => {
      if (selectedDate) {
        setDate(selectedDate);
      }
      setShowDatePicker(false);
    };

  return (
    <View style={{flex: 1, backgroundColor: COLORS.lightGreen}}>
      <SecondaryHeader title="Add Goods in Stock" />
      <ScrollView contentContainerStyle={styles.container}>
        <Box bg="white" p={6} borderRadius={8} shadow={1} mx={6} my={8}>
          <Text style={styles.headerText}>
            Please fill in the inventory details.
          </Text>

          <VStack space={5}>
            <Box>
              <Text style={styles.label}>Item Name</Text>
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
              <Text style={styles.label}>SKU</Text>
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
              <Text style={styles.label}>Quantity</Text>
              <HStack alignItems="center" space={3}>
                <Button
                  onPress={() => {
                    const currentValue = parseFloat(quantity) || 0;
                    setQuantity(Math.max(currentValue - 1, 0).toString());
                  }}
                  variant="outline"
                  style={styles.incrementButton}
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
                  value={quantity}
                  onChangeText={text => {
                    const numericText = text.replace(/[^0-9]/g, '');
                    setQuantity(numericText);
                  }}
                  textAlign="center"
                />
                <Button
                  onPress={() => {
                    const currentValue = parseFloat(quantity) || 0;
                    setQuantity((currentValue + 1).toString());
                  }}
                  variant="outline"
                  style={styles.incrementButton}
                  p={2}>
                  +
                </Button>
              </HStack>
            </Box>

            <Box>
              <Text style={styles.label}>Current Location</Text>
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
              <Text style={styles.label}>Condition</Text>
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
                _text={{color: COLORS.green}}
                onPress={() => navigation.goBack()}>
                Cancel
              </Button>

              <Button
                backgroundColor={COLORS.green}
                borderRadius={8}
                px={6}
                py={3}
                _pressed={{bg: 'emerald.700'}}
                onPress={() => setShowSuccessModal(true)}>
                Save
              </Button>
            </HStack>
          </VStack>
        </Box>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}>
        <Modal.Content maxWidth="85%" borderRadius={12} p={5}>
          <Modal.Body alignItems="center">
            <FastImage
              source={icons.tick}
              style={styles.modalIcon}
              resizeMode="contain"
            />
            <Text style={styles.modalText}>
              Inventory record saved successfully!
            </Text>
          </Modal.Body>
          <Modal.Footer justifyContent="center">
            <Button
              backgroundColor={COLORS.green}
              style={styles.modalButton}
              onPress={() => {
                setShowSuccessModal(false);
                navigation.goBack();
              }}>
              OK
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    marginTop: 5,
  },
  headerText: {
    fontSize: 16,
    color: 'black',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.darkGray3,
    marginBottom: 5,
  },
  incrementButton: {
    width: 45,
    height: 45,
    borderRadius: 8,
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
  modalIcon: {
    width: 50,
    height: 50,
    tintColor: COLORS.green,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: COLORS.darkGray3,
  },
  modalButton: {
    width: 120,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
  },
});
