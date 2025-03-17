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
  Tooltip,
  Icon,
  Modal,
} from 'native-base';
import {View, TouchableOpacity, StyleSheet, Image} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import FastImage from 'react-native-fast-image';
import {icons} from '../../../constants';
import {COLORS} from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';
import {format} from 'date-fns';

export default function AnimalFeedingProgramScreen({navigation}) {
  const [sourceOfFeed, setSourceOfFeed] = useState('');
  const [feedingSchedule, setFeedingSchedule] = useState([]);
  const [quantity, setQuantity] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [purchasePrice, setPurchasePrice] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedFeeds, setSelectedFeeds] = useState([]);

  const [selectedFeedOptions, setSelectedFeedOptions] = useState({
    basal: false,
    concentrates: false,
    supplements: false,
  });
  
  // Check if purchase information should be visible
  const showPurchaseInfo = sourceOfFeed !== 'Personally grown';
  
  const handleFeedSelection = feedType => {
    setSelectedFeeds(
      prevSelected =>
        prevSelected.includes(feedType)
          ? prevSelected.filter(feed => feed !== feedType) 
          : [...prevSelected, feedType], 
    );
  };

  const handleFeedingScheduleSelection = schedule => {
    setFeedingSchedule(
      prevSelected =>
        prevSelected.includes(schedule)
          ? prevSelected.filter(item => item !== schedule) // Deselect if already selected
          : [...prevSelected, schedule], // Add if not selected
    );
  };

  const handleDateChange = (event, selectedDate) => {
    setPurchaseDate(selectedDate || new Date());
    setShowDatePicker(false);
  };

  const toggleFeedOption = option => {
    setSelectedFeedOptions(prev => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const handleQuantityChange = text => {
    const numericValue = text.replace(/[^0-9.]/g, '');
    setQuantity(numericValue);
  };

  return (
    <View style={{flex: 1, backgroundColor: COLORS.lightGreen}}>
      <SecondaryHeader title="Add Farm Feeds" />

      <ScrollView contentContainerStyle={styles.container}>
        <Box bg="white" p={6} borderRadius={8} shadow={1} width="100%">
          <Text style={styles.sectionTitle}>Add types of feeds</Text>
          <VStack space={2} style={styles.checkboxContainer}>
            <Checkbox
              value="basal"
              isChecked={selectedFeeds.includes('basal')}
              onChange={() => handleFeedSelection('basal')}
              colorScheme="green">
              Basal Feeds
            </Checkbox>

            <Checkbox
              value="concentrates"
              isChecked={selectedFeeds.includes('concentrates')}
              onChange={() => handleFeedSelection('concentrates')}
              colorScheme="green">
              Concentrates
            </Checkbox>

            <Checkbox
              value="supplements"
              isChecked={selectedFeeds.includes('supplements')}
              onChange={() => handleFeedSelection('supplements')}
              colorScheme="green">
              Supplements
            </Checkbox>
          </VStack>

         

          <Box mt={4}>
            <Text style={styles.label}>Source of feed</Text>
            <VStack space={2}>
              <Checkbox
                value="Personally grown"
                isChecked={sourceOfFeed === 'Personally grown'}
                onChange={() => setSourceOfFeed('Personally grown')}>
                Personally grown
              </Checkbox>
              <Checkbox
                value="Grown and purchased"
                isChecked={sourceOfFeed === 'Grown and purchased'}
                onChange={() => setSourceOfFeed('Grown and purchased')}>
                Grown and purchased
              </Checkbox>
              <Checkbox
                value="Purely purchased"
                isChecked={sourceOfFeed === 'Purely purchased'}
                onChange={() => setSourceOfFeed('Purely purchased')}>
                Purely purchased
              </Checkbox>
            </VStack>
          </Box>

          {/* Feeding Schedule Options */}
          <Box mt={4}>
            <Text style={styles.label}>Feeding schedule</Text>
            <VStack space={2}>
              <Checkbox
                value="Morning"
                isChecked={feedingSchedule.includes('Morning')}
                onChange={() => handleFeedingScheduleSelection('Morning')}
                colorScheme="green">
                Morning
              </Checkbox>
              
              <Checkbox
                value="Afternoon"
                isChecked={feedingSchedule.includes('Afternoon')}
                onChange={() => handleFeedingScheduleSelection('Afternoon')}
                colorScheme="green">
                Afternoon
              </Checkbox>
              
              <Checkbox
                value="Evening"
                isChecked={feedingSchedule.includes('Evening')}
                onChange={() => handleFeedingScheduleSelection('Evening')}
                colorScheme="green">
                Evening
              </Checkbox>
              
              <Checkbox
                value="Whole Day Grazing"
                isChecked={feedingSchedule.includes('Whole Day Grazing')}
                onChange={() => handleFeedingScheduleSelection('Whole Day Grazing')}
                colorScheme="green">
                Whole Day Grazing
              </Checkbox>
            </VStack>
          </Box>

          {/* Quantity - Numeric field */}
          <Box mt={4}>
            <Text style={styles.label}>Quantity (kg)</Text>
            <Input
              variant="outline"
              backgroundColor={COLORS.lightGreen}
              borderColor="gray.200"
              placeholder="Enter quantity in kg"
              keyboardType="numeric"
              value={quantity}
              onChangeText={handleQuantityChange}
              InputRightElement={
                <Text px={2} color="gray.500">
                  kg
                </Text>
              }
            />
          </Box>

          {/* Date - Visible to all */}
          <Box mt={4}>
            <Text style={styles.label}>Date</Text>
            <HStack alignItems="center" space={3}>
              <Input
                flex={1}
                backgroundColor={COLORS.lightGreen}
                value={format(purchaseDate, 'dd/MM/yyyy')}
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
                value={purchaseDate}
                mode="date"
                is24Hour={true}
                onChange={handleDateChange}
              />
            )}
          </Box>

          {showPurchaseInfo && (
            <Box mt={4}>
              <Text style={styles.label}>Purchase price</Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Enter price (Ksh)"
                keyboardType="numeric"
                value={purchasePrice}
                onChangeText={(text) => setPurchasePrice(text.replace(/[^0-9]/g, ''))}
                InputRightElement={
                  <Text px={2} color="gray.500">
                    Ksh
                  </Text>
                }
              />
            </Box>
          )}

          {showPurchaseInfo && (
            <Box mt={4}>
              <Text style={styles.label}>Supplier name</Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Enter supplier name"
                value={supplierName}
                onChangeText={setSupplierName}
              />
            </Box>
          )}

          <HStack justifyContent="center" mt={6} space={4}>
            <Button
              variant="outline"
              borderColor={COLORS.green}
              borderRadius={8}
              px={6}
              py={3}
              onPress={() => navigation.goBack()}>
              Back
            </Button>
            <Button
              backgroundColor={COLORS.green}
              borderRadius={8}
              px={6}
              py={3}
              onPress={() => setShowSubmitModal(true)}>
              Submit
            </Button>
          </HStack>
        </Box>
      </ScrollView>

      <Modal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)}>
        <Modal.Content maxWidth="85%" borderRadius={12} p={5}>
          <Modal.Body alignItems="center">
            <FastImage
              source={icons.tick}
              style={styles.modalIcon}
              resizeMode="contain"
            />
            <Text style={styles.modalText}>
              Feed record saved successfully!
            </Text>
          </Modal.Body>
          <Modal.Footer justifyContent="center">
            <Button
              backgroundColor={COLORS.green}
              style={styles.modalButton}
              onPress={() => {
                setShowSubmitModal(false); 
                setTimeout(() => navigation.navigate('FeedingModuleScreen'), 300); 
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
    justifyContent: 'flex-start',
    padding: 20,
    backgroundColor: COLORS.lightGreen,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.green,
    textAlign: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.darkGray3,
    marginBottom: 5,
  },
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
  checkboxContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
});