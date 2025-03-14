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
  Tooltip,
  Icon,
  Modal,
} from 'native-base';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import FastImage from 'react-native-fast-image';
import { icons } from '../../constants';
import { COLORS } from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';
import { format, addDays } from 'date-fns';

export default function BeefCattleScreen({ navigation }) {
  const [animalIdOrFlockId, setAnimalIdOrFlockId] = useState('');
  const [weightGain, setWeightGain] = useState('');
  const [weaningWeight, setWeaningWeight] = useState('');
  const [weightAtCheckup, setWeightAtCheckup] = useState('');
  const [saleWeight, setSaleWeight] = useState('');
  const [saleDate, setSaleDate] = useState(new Date());
  const [marketPrice, setMarketPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [isCompany, setIsCompany] = useState(false);
  const [isIndividual, setIsIndividual] = useState(false);
  const [showSaleDatePicker, setShowSaleDatePicker] = useState(false);
  const [isSaveDisabled, setIsSaveDisabled] = useState(false);
  const [availableIds] = useState(['ID 1', 'ID 2', 'ID 3', 'ID 4']);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const handleDateChange = (setter) => (event, selectedDate) => {
    setter(selectedDate || new Date());
  };

  const handleSelect = (id) => {
    setAnimalIdOrFlockId(id);
    setDropdownVisible(false);
    // optional: load weight gain data based on ID selection
  };

  const handleSave = () => {
    if (!animalIdOrFlockId) {
      setIsSaveDisabled(true);
      return;
    }
    setIsSaveDisabled(false);
    // Add your save logic here
  };

  const calculateProfit = () => {
    if (marketPrice && salePrice) {
      return (parseFloat(salePrice) - parseFloat(marketPrice)).toFixed(2);
    }
    return '--';
  };

  const calculateWeightGainRate = () => {
    if (weightGain && saleDate && saleDate > new Date()) {
      const daysGrown = (saleDate - new Date()) / (1000 * 60 * 60 * 24);
      return (parseFloat(weightGain) / daysGrown).toFixed(2);
    }
    return '--';
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.lightGreen }}>
      <SecondaryHeader title="Beef Cattle" />
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
            Fill in the Beef Cattle details
          </Text>
          <VStack space={5}>

            {/* Animal ID or Flock ID Section */}
            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Animal ID or Flock ID
              </Text>
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
            </Box>

            {/* Weight Gain Section */}
            <Box>
              <HStack alignItems="center" justifyContent="space-between">
                <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3}>
                  Weight Gain
                </Text>
                <Tooltip
                  label="Enter the total weight gained by the animal"
                  placement="top"
                  backgroundColor={COLORS.green}
                  _text={{ color: 'white' }}>
                  <Icon as={FastImage} source={icons.info} size={5} color="gray.500" />
                </Tooltip>
              </HStack>
              <HStack alignItems="center" space={3}>
                <Button
                  onPress={() => setWeightGain((parseFloat(weightGain) || 0) - 1)}
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
                  placeholder="Enter weight gain"
                  keyboardType="numeric"
                  value={weightGain.toString()}
                  onChangeText={text => {
                    const numericText = text.replace(/[^0-9.]/g, '');
                    setWeightGain(numericText);
                  }}
                />
                <Button
                  onPress={() => setWeightGain((parseFloat(weightGain) || 0) + 1)}
                  variant="outline"
                  style={styles.incrementButton}
                  p={2}>
                  +
                </Button>
              </HStack>
            </Box>

            {/* Sale Weight Section with Prefill Feature */}
            <Box>
              <HStack alignItems="center" justifyContent="space-between">
                <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3}>
                  Sale Weight
                </Text>
                <Tooltip
                  label="Enter the weight of the animal at the time of sale"
                  placement="top"
                  backgroundColor={COLORS.green}
                  _text={{ color: 'white' }}>
                  <Icon as={FastImage} source={icons.info} size={5} color="gray.500" />
                </Tooltip>
              </HStack>
              <HStack alignItems="center" space={3}>
                <Button
                  onPress={() => setSaleWeight((parseFloat(saleWeight) || 0) - 1)}
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
                  placeholder="Enter sale weight"
                  keyboardType="numeric"
                  value={saleWeight.toString()}
                  onChangeText={text => {
                    const numericText = text.replace(/[^0-9.]/g, '');
                    setSaleWeight(numericText);
                  }}
                />
                <Button
                  onPress={() => setSaleWeight((parseFloat(saleWeight) || 0) + 1)}
                  variant="outline"
                  style={styles.incrementButton}
                  p={2}>
                  +
                </Button>
              </HStack>
            </Box>

            {/* Sale Date Section */}
            <Box>
              <HStack alignItems="center" justifyContent="space-between">
                <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3}>
                  Sale Date
                </Text>
                <Tooltip
                  label="Select the date when the animal was sold"
                  placement="top"
                  backgroundColor={COLORS.green}
                  _text={{ color: 'white' }}>
                  <Icon as={FastImage} source={icons.info} size={5} color="gray.500" />
                </Tooltip>
              </HStack>
              <HStack alignItems="center" space={3}>
                <Input
                  w="85%"
                  backgroundColor={COLORS.lightGreen}
                  value={format(saleDate, 'dd/MM/yyyy')}
                  placeholder="DD/MM/YYYY"
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
                  maximumDate={addDays(new Date(), 1)}
                  onChange={handleDateChange(setSaleDate)}
                />
              )}
            </Box>

            {/* Additional Sales Information: Market Price and Sale Price */}
            <Box>
              <HStack alignItems="center" justifyContent="space-between">
                <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3}>
                  Market Price
                </Text>
                <Tooltip
                  label="Enter the current market rate for the sold beef"
                  placement="top"
                  backgroundColor={COLORS.green}
                  _text={{ color: 'white' }}>
                  <Icon as={FastImage} source={icons.info} size={5} color="gray.500" />
                </Tooltip>
              </HStack>
              <HStack alignItems="center" space={3}>
                <Button
                  onPress={() => setMarketPrice((parseFloat(marketPrice) || 0) - 1)}
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
                  placeholder="Enter market price"
                  keyboardType="numeric"
                  value={marketPrice.toString()}
                  onChangeText={text => {
                    const numericText = text.replace(/[^0-9.]/g, '');
                    setMarketPrice(numericText);
                  }}
                />
                <Button
                  onPress={() => setMarketPrice((parseFloat(marketPrice) || 0) + 1)}
                  variant="outline"
                  style={styles.incrementButton}
                  p={2}>
                  +
                </Button>
              </HStack>
            </Box>

            <Box>
              <HStack alignItems="center" justifyContent="space-between">
                <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3}>
                  Sale Price
                </Text>
                <Tooltip
                  label="Enter the price at which the animal was sold"
                  placement="top"
                  backgroundColor={COLORS.green}
                  _text={{ color: 'white' }}>
                  <Icon as={FastImage} source={icons.info} size={5} color="gray.500" />
                </Tooltip>
              </HStack>
              <HStack alignItems="center" space={3}>
                <Button
                  onPress={() => setSalePrice((parseFloat(salePrice) || 0) - 1)}
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
                  placeholder="Enter sale price"
                  keyboardType="numeric"
                  value={salePrice.toString()}
                  onChangeText={text => {
                    const numericText = text.replace(/[^0-9.]/g, '');
                    setSalePrice(numericText);
                  }}
                />
                <Button
                  onPress={() => setSalePrice((parseFloat(salePrice) || 0) + 1)}
                  variant="outline"
                  style={styles.incrementButton}
                  p={2}>
                  +
                </Button>
              </HStack>
            </Box>

            {/* Buyer's Name Section */}
            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={2}>
                Buyer's Name
              </Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Enter buyer's name"
                value={buyerName}
                onChangeText={setBuyerName}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={2}>
                Buyer Type
              </Text>
              <VStack space={2}>
                <Checkbox isChecked={isCompany} onChange={() => setIsCompany(!isCompany)}>
                  Company
                </Checkbox>
                <Checkbox isChecked={isIndividual} onChange={() => setIsIndividual(!isIndividual)}>
                  Individual
                </Checkbox>
              </VStack>
            </Box>

            <HStack justifyContent="center" mt={6} space={4}>
              <Button
                variant="outline"
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
                _pressed={{ bg: 'emerald.700' }}
                onPress={() => setShowSaveModal(true)}>
                Save
              </Button>
            </HStack>
          </VStack>
        </Box>
      </ScrollView>
      
      <Modal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)}>
        <Modal.Content maxWidth="85%" borderRadius={12} p={5}>
          <Modal.Body alignItems="center">
            <FastImage source={icons.tick} style={styles.modalIcon} resizeMode="contain" />
            <Text style={styles.modalText}>
             Beef record has been saved successfully!
            </Text>
          </Modal.Body>
          <Modal.Footer justifyContent="center">
            <Button
              backgroundColor={COLORS.green}
              style={styles.modalButton}
              onPress={() => {
                setShowSaveModal(false);
                navigation.navigate('AnimalProductionListScreen');
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
  incrementButton: {
    width: 45,
    height: 45,
    borderRadius: 8,
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