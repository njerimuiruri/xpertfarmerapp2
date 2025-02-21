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
  Checkbox,
  Modal,
} from 'native-base';
import {View, TouchableOpacity, StyleSheet, Image} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import FastImage from 'react-native-fast-image';
import {icons} from '../../constants';
import {COLORS} from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';

export default function PoultryFlockDetailsScreen({navigation}) {
  const [flockId, setFlockId] = useState('');
  const [dailyEggCount, setDailyEggCount] = useState(0);
  const [eggWeight, setEggWeight] = useState(0);
  const [numberOfLayers, setNumberOfLayers] = useState(0);
  const [eggProductionDate, setEggProductionDate] = useState(new Date());
  const [saleWeight, setSaleWeight] = useState(0);
  const [saleDate, setSaleDate] = useState(new Date());
  const [marketPrice, setMarketPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [isCompany, setIsCompany] = useState(false);
  const [isIndividual, setIsIndividual] = useState(false);
  const [showEggProductionDatePicker, setShowEggProductionDatePicker] =
    useState(false);
  const [showSaleDatePicker, setShowSaleDatePicker] = useState(false);
  const [availableIds] = useState(['ID 1', 'ID 2', 'ID 3', 'ID 4']);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const handleDateChange = setter => (event, selectedDate) => {
    setter(selectedDate || new Date());
  };

  return (
    <View style={{flex: 1, backgroundColor: COLORS.lightGreen}}>
      <SecondaryHeader title="Add Poultry Record" />
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
            Fill in the poultry flock details
          </Text>

          <VStack space={5}>
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
                    value={flockId}
                    onChangeText={text => setFlockId(text)}
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

            {/* Egg Production */}
            <Text fontSize="lg" fontWeight="bold" color="gray.800" mt={4}>
              Egg Production
            </Text>
            <Box>
              <Text
                fontSize="sm"
                fontWeight="500"
                color={COLORS.darkGray3}
                mb={1}>
                Daily Egg Count
              </Text>
              <HStack alignItems="center" space={3}>
                <Button
                  onPress={() =>
                    setDailyEggCount(dailyEggCount > 0 ? dailyEggCount - 1 : 0)
                  }
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
                  placeholder="Daily egg count"
                  keyboardType="numeric"
                  value={dailyEggCount.toString()}
                  onChangeText={text =>
                    setDailyEggCount(Math.max(0, parseInt(text) || 0))
                  }
                />
                <Button
                  onPress={() => setDailyEggCount(dailyEggCount + 1)}
                  variant="outline"
                  style={styles.incrementButton}
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
                Egg Weight
              </Text>
              <HStack alignItems="center" space={3}>
                <Button
                  onPress={() =>
                    setEggWeight(eggWeight > 0 ? eggWeight - 1 : 0)
                  }
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
                  placeholder="Egg weight"
                  keyboardType="numeric"
                  value={eggWeight.toString()}
                  onChangeText={text =>
                    setEggWeight(Math.max(0, parseInt(text) || 0))
                  }
                />
                <Button
                  onPress={() => setEggWeight(eggWeight + 1)}
                  variant="outline"
                  style={styles.incrementButton}
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
                Number of Layers per Day
              </Text>
              <HStack alignItems="center" space={3}>
                <Button
                  onPress={() =>
                    setNumberOfLayers(
                      numberOfLayers > 0 ? numberOfLayers - 1 : 0,
                    )
                  }
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
                  placeholder="Number of layers"
                  keyboardType="numeric"
                  value={numberOfLayers.toString()}
                  onChangeText={text =>
                    setNumberOfLayers(Math.max(0, parseInt(text) || 0))
                  }
                />
                <Button
                  onPress={() => setNumberOfLayers(numberOfLayers + 1)}
                  variant="outline"
                  style={styles.incrementButton}
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
                Egg Production Date
              </Text>
              <HStack alignItems="center" space={3}>
                <Input
                  w="85%"
                  backgroundColor={COLORS.lightGreen}
                  value={eggProductionDate.toLocaleDateString('en-GB')}
                  placeholder="DD/MM/YY"
                  isReadOnly
                />
                <TouchableOpacity
                  onPress={() => setShowEggProductionDatePicker(true)}>
                  <Image
                    source={icons.calendar}
                    resizeMode="contain"
                    style={styles.calendarIcon}
                  />
                </TouchableOpacity>
              </HStack>
              {showEggProductionDatePicker && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={eggProductionDate}
                  mode="date"
                  is24Hour={true}
                  onChange={handleDateChange(setEggProductionDate)}
                />
              )}
            </Box>

            {/* Sale Information */}
            <Text fontSize="lg" fontWeight="bold" color="gray.800" mt={4}>
              Sale Information
            </Text>
            <Box>
              <Text
                fontSize="sm"
                fontWeight="500"
                color={COLORS.darkGray3}
                mb={1}>
                Sale Weight
              </Text>
              <HStack alignItems="center" space={3}>
                <Button
                  onPress={() =>
                    setSaleWeight(saleWeight > 0 ? saleWeight - 1 : 0)
                  }
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
                  onChangeText={text =>
                    setSaleWeight(Math.max(0, parseInt(text) || 0))
                  }
                />
                <Button
                  onPress={() => setSaleWeight(saleWeight + 1)}
                  variant="outline"
                  style={styles.incrementButton}
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
                Sale Date
              </Text>
              <HStack alignItems="center" space={3}>
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
              <Text
                fontSize="sm"
                fontWeight="500"
                color={COLORS.darkGray3}
                mb={1}>
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
              <Text
                fontSize="sm"
                fontWeight="500"
                color={COLORS.darkGray3}
                mb={1}>
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
              <Text
                fontSize="sm"
                fontWeight="500"
                color={COLORS.darkGray3}
                mb={1}>
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
              <Text
                fontSize="sm"
                fontWeight="500"
                color={COLORS.darkGray3}
                mb={2}>
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
              _pressed={{bg: 'emerald.700'}}
              onPress={() => setShowSaveModal(true)}>
              Save
            </Button>
          </HStack>
        </Box>
      </ScrollView>
      <Modal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)}>
        <Modal.Content maxWidth="85%" borderRadius={12} p={5}>
          <Modal.Body alignItems="center">
            <FastImage
              source={icons.tick}
              style={styles.modalIcon}
              resizeMode="contain"
            />
            <Text style={styles.modalText}>
              Poultry Record has been saved successfully!
            </Text>
          </Modal.Body>
          <Modal.Footer justifyContent="center">
            <Button
              backgroundColor={COLORS.green}
              style={styles.modalButton}
              onPress={() => {
                setShowSaveModal(false);
                navigation.navigate('PoultryProductionListScreen');
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
