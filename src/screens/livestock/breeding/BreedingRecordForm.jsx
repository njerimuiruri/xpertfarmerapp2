import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import FastImage from 'react-native-fast-image';
import { icons } from '../../../constants';
import { COLORS } from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';

const BreedingRecordForm = ({ navigation }) => {
  // Animal selection state
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [animalSearchQuery, setAnimalSearchQuery] = useState('');
  const [showAnimalDropdown, setShowAnimalDropdown] = useState(false);

  // Form state
  const [purpose, setPurpose] = useState('Improve Milk Production');
  const [strategy, setStrategy] = useState('Cross Breeding');
  const [serviceType, setServiceType] = useState('Natural Mating');
  const [serviceDate, setServiceDate] = useState(new Date());
  const [showServiceDatePicker, setShowServiceDatePicker] = useState(false);
  const [numServices, setNumServices] = useState('1');
  const [firstHeatDate, setFirstHeatDate] = useState(new Date());
  const [showFirstHeatDatePicker, setShowFirstHeatDatePicker] = useState(false);

  // AI specific fields
  const [sireCode, setSireCode] = useState('');
  const [aiType, setAiType] = useState('Regular AI');
  const [aiSource, setAiSource] = useState('Local');
  const [aiCost, setAiCost] = useState('');

  // Calculated fields
  const [gestationDays, setGestationDays] = useState('');
  const [expectedBirthDate, setExpectedBirthDate] = useState('');

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownOptions, setDropdownOptions] = useState([]);

  // Static data for animals (in real app, this would come from API)
  const animalsList = [
    { id: 'cmbdvu9gh0001hj8n06nva367', idNumber: 'KE-DAIRY-001', type: 'Dairy Cow', breedType: 'Holstein' },
    { id: 'cmbdvu9gh0002hj8n06nva368', idNumber: 'KE-DAIRY-002', type: 'Dairy Cow', breedType: 'Jersey' },
    { id: 'cmbdvu9gh0003hj8n06nva369', idNumber: 'KE-GOAT-001', type: 'Goat', breedType: 'Toggenburg' },
    { id: 'cmbdvu9gh0004hj8n06nva370', idNumber: 'KE-SHEEP-001', type: 'Sheep', breedType: 'Dorper' },
    { id: 'cmbdvu9gh0005hj8n06nva371', idNumber: 'KE-SWINE-001', type: 'Swine', breedType: 'Large White' },
  ];

  const purposeOptions = [
    'Improve Milk Production',
    'Stocking Number',
    'Immunity',
  ];

  const strategyOptions = [
    'Cross Breeding',
    'Breeding Within Breeds',
    'Breeding Between Breeds',
  ];

  const serviceTypeOptions = ['Natural Mating', 'Artificial Insemination'];
  const aiTypeOptions = ['Sex Cell Semen', 'Regular AI'];
  const aiSourceOptions = ['Local', 'Imported'];

  // Filter animals based on search query
  const filteredAnimals = animalsList.filter(animal =>
    animal.idNumber.toLowerCase().includes(animalSearchQuery.toLowerCase()) ||
    animal.type.toLowerCase().includes(animalSearchQuery.toLowerCase()) ||
    animal.breedType.toLowerCase().includes(animalSearchQuery.toLowerCase())
  );

  // Calculate gestation period and expected birth date
  useEffect(() => {
    if (!selectedAnimal) return;

    let days = '280';
    if (selectedAnimal.type === 'Goat') days = '150';
    if (selectedAnimal.type === 'Swine') days = '114';
    if (selectedAnimal.type === 'Sheep') days = '152';
    setGestationDays(days);

    if (serviceDate) {
      const birthDate = new Date(serviceDate);
      birthDate.setDate(birthDate.getDate() + parseInt(days));
      setExpectedBirthDate(birthDate.toISOString().split('T')[0]);
    }
  }, [selectedAnimal, serviceDate]);

  const showDropdown = type => {
    switch (type) {
      case 'purpose':
        setDropdownOptions(purposeOptions);
        break;
      case 'strategy':
        setDropdownOptions(strategyOptions);
        break;
      case 'serviceType':
        setDropdownOptions(serviceTypeOptions);
        break;
      case 'aiType':
        setDropdownOptions(aiTypeOptions);
        break;
      case 'aiSource':
        setDropdownOptions(aiSourceOptions);
        break;
      default:
        setDropdownOptions([]);
    }
    setActiveDropdown(type);
    setDropdownVisible(true);
  };

  const handleSelect = value => {
    switch (activeDropdown) {
      case 'purpose':
        setPurpose(value);
        break;
      case 'strategy':
        setStrategy(value);
        break;
      case 'serviceType':
        setServiceType(value);
        break;
      case 'aiType':
        setAiType(value);
        break;
      case 'aiSource':
        setAiSource(value);
        break;
    }
    setDropdownVisible(false);
  };

  const handleServiceDateChange = (event, selectedDate) => {
    setShowServiceDatePicker(false);
    if (selectedDate) setServiceDate(selectedDate);
  };

  const handleFirstHeatDateChange = (event, selectedDate) => {
    setShowFirstHeatDatePicker(false);
    if (selectedDate) setFirstHeatDate(selectedDate);
  };

  const handleSubmit = () => {
    if (!selectedAnimal) {
      alert('Please select an animal');
      return;
    }

    // Prepare payload according to your API structure
    const payload = {
      damId: selectedAnimal.id, // Using selected animal as dam
      // sireId would be selected from another dropdown or provided differently
      farmId: "cmbduehjf0003l8048w6lbxxt", // This should come from user context
      purpose,
      strategy,
      serviceType,
      serviceDate: serviceDate.toISOString(),
      numServices: parseInt(numServices),
      firstHeatDate: firstHeatDate.toISOString(),
      gestationDays: parseInt(gestationDays),
      expectedBirthDate: new Date(expectedBirthDate).toISOString(),
    };

    // Add AI-specific fields if applicable
    if (serviceType === 'Artificial Insemination') {
      payload.sireCode = sireCode;
      payload.aiType = aiType;
      payload.aiSource = aiSource;
      payload.aiCost = parseFloat(aiCost) || 0;
    }

    console.log('Breeding Record Payload:', payload);
    setModalVisible(true);
  };

  const CustomDropdown = ({ label, value, onPress }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.dropdownButton} onPress={onPress}>
        <Text style={styles.dropdownButtonText}>{value}</Text>
        <FastImage
          source={icons.downArrow}
          style={styles.dropdownIcon}
          tintColor="#666"
        />
      </TouchableOpacity>
    </View>
  );

  const CustomDatePicker = ({ label, value, onPress, showPicker, onChange }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.dateInput} onPress={onPress}>
        <Text style={styles.dateText}>{value.toISOString().split('T')[0]}</Text>
        <FastImage
          source={icons.calendar}
          style={styles.dateIcon}
          tintColor="#666"
        />
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={value}
          mode="date"
          display="default"
          onChange={onChange}
        />
      )}
    </View>
  );

  const AnimalDropdown = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Select Animal</Text>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setShowAnimalDropdown(true)}
      >
        <Text style={styles.dropdownButtonText}>
          {selectedAnimal ? `${selectedAnimal.idNumber} - ${selectedAnimal.type}` : 'Select Animal'}
        </Text>
        <FastImage
          source={icons.downArrow}
          style={styles.dropdownIcon}
          tintColor="#666"
        />
      </TouchableOpacity>
    </View>
  );

  const renderAnimalItem = ({ item }) => (
    <TouchableOpacity
      style={styles.animalItem}
      onPress={() => {
        setSelectedAnimal(item);
        setShowAnimalDropdown(false);
        setAnimalSearchQuery('');
      }}
    >
      <Text style={styles.animalId}>{item.idNumber}</Text>
      <Text style={styles.animalDetails}>{item.type} - {item.breedType}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.lightGreen }}>
      <SecondaryHeader title="Add Breeding Record" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Animal Selection</Text>

          <AnimalDropdown />

          {selectedAnimal && (
            <View style={styles.selectedAnimalInfo}>
              <Text style={styles.selectedAnimalText}>
                Selected: {selectedAnimal.idNumber} ({selectedAnimal.type} - {selectedAnimal.breedType})
              </Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Breeding Details</Text>

          <CustomDropdown
            label="Purpose"
            value={purpose}
            onPress={() => showDropdown('purpose')}
          />

          <CustomDropdown
            label="Strategy"
            value={strategy}
            onPress={() => showDropdown('strategy')}
          />

          <Text style={styles.sectionTitle}>Service Details</Text>

          <CustomDropdown
            label="Service Type"
            value={serviceType}
            onPress={() => showDropdown('serviceType')}
          />

          <CustomDatePicker
            label="Service Date"
            value={serviceDate}
            onPress={() => setShowServiceDatePicker(true)}
            showPicker={showServiceDatePicker}
            onChange={handleServiceDateChange}
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Number of Services</Text>
            <TextInput
              style={styles.input}
              value={numServices}
              onChangeText={setNumServices}
              placeholder="Number of services"
              placeholderTextColor="#999"
              keyboardType="numeric"
              backgroundColor={COLORS.lightGreen}
            />
          </View>

          <CustomDatePicker
            label="First Heat Date"
            value={firstHeatDate}
            onPress={() => setShowFirstHeatDatePicker(true)}
            showPicker={showFirstHeatDatePicker}
            onChange={handleFirstHeatDateChange}
          />

          {/* AI specific fields */}
          {serviceType === 'Artificial Insemination' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Sire Code</Text>
                <TextInput
                  style={styles.input}
                  value={sireCode}
                  onChangeText={setSireCode}
                  placeholder="Enter sire code"
                  placeholderTextColor="#999"
                  backgroundColor={COLORS.lightGreen}
                />
              </View>

              <CustomDropdown
                label="AI Type"
                value={aiType}
                onPress={() => showDropdown('aiType')}
              />

              {aiType === 'Regular AI' && (
                <CustomDropdown
                  label="AI Source"
                  value={aiSource}
                  onPress={() => showDropdown('aiSource')}
                />
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>AI Cost</Text>
                <TextInput
                  style={styles.input}
                  value={aiCost}
                  onChangeText={setAiCost}
                  placeholder="Enter cost"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  backgroundColor={COLORS.lightGreen}
                />
              </View>
            </>
          )}

          <Text style={styles.sectionTitle}>Gestation Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gestation Period (days)</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={gestationDays}
              editable={false}
              backgroundColor={COLORS.lightGray2}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Expected Birth Date</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              backgroundColor={COLORS.lightGray2}
              value={expectedBirthDate}
              editable={false}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.cancelButton, styles.button]}
              onPress={() => navigation.goBack()}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, styles.button]}
              onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Save Record</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Animal Selection Modal */}
      <Modal
        visible={showAnimalDropdown}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAnimalDropdown(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.animalModalContent}>
            <Text style={styles.modalTitle}>Select Animal</Text>

            <View style={styles.searchContainer}>
              <FastImage
                source={icons.search}
                style={styles.searchIcon}
                tintColor="#666"
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by ID, type, or breed..."
                placeholderTextColor="#999"
                value={animalSearchQuery}
                onChangeText={setAnimalSearchQuery}
              />
            </View>

            <FlatList
              data={filteredAnimals}
              keyExtractor={item => item.id}
              renderItem={renderAnimalItem}
              style={styles.animalList}
              showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowAnimalDropdown(false);
                setAnimalSearchQuery('');
              }}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* General Dropdown Modal */}
      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select {activeDropdown}</Text>
            <FlatList
              data={dropdownOptions}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => handleSelect(item)}>
                  <Text style={styles.optionText}>{item}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Success Modal */}
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.successModalContent}>
            <FastImage
              source={icons.tick}
              style={styles.successIcon}
              resizeMode="contain"
              tintColor={COLORS.green}
            />
            <Text style={styles.modalText}>
              Breeding record has been added successfully.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate('BreedingModuleLandingScreen');
              }}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginTop: 16,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray1,
    paddingBottom: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.lightGray2,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: COLORS.black,
    backgroundColor: COLORS.white,
  },
  disabledInput: {
    backgroundColor: COLORS.lightGray2,
    color: COLORS.gray,
  },
  dropdownButton: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.gray3,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: COLORS.black,
    flex: 1,
  },
  dropdownIcon: {
    width: 16,
    height: 16,
  },
  dateInput: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.gray3,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
  },
  dateText: {
    fontSize: 16,
    color: COLORS.black,
  },
  dateIcon: {
    width: 20,
    height: 20,
  },
  selectedAnimalInfo: {
    backgroundColor: COLORS.lightGreen,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedAnimalText: {
    fontSize: 14,
    color: COLORS.green,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  button: {
    width: 140,
    marginHorizontal: 10,
  },
  submitButton: {
    backgroundColor: COLORS.green2,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray2,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray3,
  },
  cancelButtonText: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  animalModalContent: {
    width: '95%',
    maxHeight: '85%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: COLORS.black,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray2,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 48,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
  },
  animalList: {
    maxHeight: 300,
  },
  animalItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray2,
  },
  animalId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  animalDetails: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 2,
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: COLORS.lightGray2,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: '500',
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.black,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  successModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    elevation: 5,
    width: '85%',
    alignItems: 'center',
  },
  successIcon: {
    width: 64,
    height: 64,
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: COLORS.black,
  },
  modalButton: {
    minWidth: 120,
    backgroundColor: COLORS.green,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderRadius: 8,
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BreedingRecordForm;