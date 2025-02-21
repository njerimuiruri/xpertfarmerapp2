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
  Modal
} from 'native-base';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import FastImage from 'react-native-fast-image';
import { icons } from '../../constants';
import { COLORS } from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';

export default function SwineRecordScreen({ navigation }) {
  const [animalIdOrFlockId, setAnimalIdOrFlockId] = useState('');
  const [litterSize, setLitterSize] = useState(0);
  const [birthWeight, setBirthWeight] = useState(0);
  const [weaningDate, setWeaningDate] = useState(new Date());
  const [weaningWeight, setWeaningWeight] = useState(0);
  const [entryWeight, setEntryWeight] = useState(0);
  const [finisherPhaseWeight, setFinisherPhaseWeight] = useState(0);
  const [saleWeight, setSaleWeight] = useState(0);
  const [saleDate, setSaleDate] = useState(new Date());
  const [marketPrice, setMarketPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [isCompany, setIsCompany] = useState(false);
  const [isIndividual, setIsIndividual] = useState(false);
  const [showWeaningDatePicker, setShowWeaningDatePicker] = useState(false);
  const [showSaleDatePicker, setShowSaleDatePicker] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const handleDateChange = (setter) => (event, selectedDate) => {
    setter(selectedDate || new Date());
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.lightGreen }}>
      <SecondaryHeader title="Add Swine Record" />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'flex-start',
          marginTop: 5,
        }}>
        <Box bg="white" p={6} borderRadius={8} shadow={1} mx={6} my={8}>
          <Text style={{ fontSize: 16, color: 'black', marginBottom: 16, textAlign: 'center' }}>
            Fill in the swine details
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

            {/* Farrowing Records */}
            <Text fontSize="lg" fontWeight="bold" color="gray.800" mt={4}>
              Farrowing Records (Breeding Sows)
            </Text>
            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Litter Size (Number)
              </Text>
              <HStack alignItems="center" space={3}>
                <Button
                  onPress={() => setLitterSize(litterSize > 0 ? litterSize - 1 : 0)}
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
                  placeholder="Enter litter size"
                  keyboardType="numeric"
                  value={litterSize.toString()}
                  onChangeText={text => setLitterSize(Math.max(0, parseInt(text) || 0))}
                />
                <Button
                  onPress={() => setLitterSize(litterSize + 1)}
                  variant="outline"
                  style={styles.incrementButton}
                  p={2}>
                  +
                </Button>
              </HStack>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Birth Weight
              </Text>
              <HStack alignItems="center"space={3}>
                <Button
                  onPress={() => setBirthWeight(birthWeight > 0 ? birthWeight - 1 : 0)}
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
                  placeholder="Enter birth weight"
                  keyboardType="numeric"
                  value={birthWeight.toString()}
                  onChangeText={text => setBirthWeight(Math.max(0, parseInt(text) || 0))}
                />
                <Button
                  onPress={() => setBirthWeight(birthWeight + 1)}
                  variant="outline"
                  style={styles.incrementButton}

                  p={2}>
                  +
                </Button>
              </HStack>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Weaning Date
              </Text>
              <HStack alignItems="center" space={3}>
                <Input
                  w="85%"
                  backgroundColor={COLORS.lightGreen}
                  value={weaningDate.toLocaleDateString('en-GB')}
                  placeholder="DD/MM/YY"
                  isReadOnly
                />
                <TouchableOpacity onPress={() => setShowWeaningDatePicker(true)}>
                  <Image
                    source={icons.calendar}
                    resizeMode="contain"
                    style={styles.calendarIcon}
                  />
                </TouchableOpacity>
              </HStack>
              {showWeaningDatePicker && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={weaningDate}
                  mode="date"
                  is24Hour={true}
                  onChange={handleDateChange(setWeaningDate)}
                />
              )}
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Weaning Weight
              </Text>
              <HStack alignItems="center" space={3}>
                <Button
                  onPress={() => setWeaningWeight(weaningWeight > 0 ? weaningWeight - 1 : 0)}
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
                  placeholder="Enter weaning weight"
                  keyboardType="numeric"
                  value={weaningWeight.toString()}
                  onChangeText={text => setWeaningWeight(Math.max(0, parseInt(text) || 0))}
                />
                <Button
                  onPress={() => setWeaningWeight(weaningWeight + 1)}
                  variant="outline"
                  style={styles.incrementButton}

                  p={2}>
                  +
                </Button>
              </HStack>
            </Box>

            {/* Growth and Market Records */}
            <Text fontSize="lg" fontWeight="bold" color="gray.800" mt={4}>
              Growth and Market Records
            </Text>
            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Entry Weight
              </Text>
              <HStack alignItems="center" space={3}>
                <Button
                  onPress={() => setEntryWeight(entryWeight > 0 ? entryWeight - 1 : 0)}
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
                  placeholder="Enter entry weight"
                  keyboardType="numeric"
                  value={entryWeight.toString()}
                  onChangeText={text => setEntryWeight(Math.max(0, parseInt(text) || 0))}
                />
                <Button
                  onPress={() => setEntryWeight(entryWeight + 1)}
                  variant="outline"
                  style={styles.incrementButton}

                  p={2}>
                  +
                </Button>
              </HStack>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Finisher Phase Weight
              </Text>
              <HStack alignItems="center" space={3}>
                <Button
                  onPress={() => setFinisherPhaseWeight(finisherPhaseWeight > 0 ? finisherPhaseWeight - 1 : 0)}
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
                  placeholder="Enter finisher phase weight"
                  keyboardType="numeric"
                  value={finisherPhaseWeight.toString()}
                  onChangeText={text => setFinisherPhaseWeight(Math.max(0, parseInt(text) || 0))}
                />
                <Button
                  onPress={() => setFinisherPhaseWeight(finisherPhaseWeight + 1)}
                  variant="outline"
                  style={styles.incrementButton}

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
              <HStack alignItems="center" space={3}>
                <Button
                  onPress={() => setSaleWeight(saleWeight > 0 ? saleWeight - 1 : 0)}
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
                  onChangeText={text => setSaleWeight(Math.max(0, parseInt(text) || 0))}
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
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
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
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Market Price (Autofilled)
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
          <Button variant="outline" borderColor={COLORS.green} borderRadius={8} px={6} py={3} onPress={() => navigation.goBack()}>
                Cancel
              </Button>
              <Button backgroundColor={COLORS.green} borderRadius={8} px={6} py={3} _pressed={{ bg: "emerald.700" }} onPress={() => setShowSaveModal(true)}>
                Save
              </Button>
          </HStack>
        </Box>
      </ScrollView>
      <Modal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)}>
        <Modal.Content maxWidth="85%" borderRadius={12} p={5}>
          <Modal.Body alignItems="center">
            <FastImage source={icons.tick} style={styles.modalIcon} resizeMode="contain" />
            <Text style={styles.modalText}>Swine Record has been saved successfully!</Text>
          </Modal.Body>
          <Modal.Footer justifyContent="center">
            <Button backgroundColor={COLORS.green} style={styles.modalButton} onPress={() => {
                setShowSaveModal(false);
                navigation.navigate("SwineProductionListScreen"); 
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
    fontWeight: "bold",
    textAlign: "center",
    color: COLORS.darkGray3,
  },
  modalButton: {
    width: 120,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
  },
});