import React, {useState, useEffect} from 'react';
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
import {icons} from '../../../constants';
import {COLORS} from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';

const BreedingRecordForm = ({navigation}) => {
  const [animalId, setAnimalId] = useState('');
  const [animalType, setAnimalType] = useState('Dairy Cow');
  const [purpose, setPurpose] = useState('Improve Milk Production');
  const [strategy, setStrategy] = useState('Cross Breeding');
  const [serviceType, setServiceType] = useState('Natural Mating');
  const [serviceDate, setServiceDate] = useState(new Date());
  const [showServiceDatePicker, setShowServiceDatePicker] = useState(false);
  const [sireCode, setSireCode] = useState('');
  const [aiType, setAiType] = useState('Regular AI');
  const [aiSource, setAiSource] = useState('Local');
  const [aiCost, setAiCost] = useState('');
  const [numServices, setNumServices] = useState('1');
  const [firstHeatDate, setFirstHeatDate] = useState(new Date());
  const [showFirstHeatDatePicker, setShowFirstHeatDatePicker] = useState(false);
  const [gestationDays, setGestationDays] = useState('');
  const [expectedBirthDate, setExpectedBirthDate] = useState('');
  const [birthRecorded, setBirthRecorded] = useState(false);
  const [birthDate, setBirthDate] = useState(new Date());
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('Natural Birth');
  const [youngOnes, setYoungOnes] = useState('1');
  const [birthWeight, setBirthWeight] = useState('');
  const [litterWeight, setLitterWeight] = useState('');
  const [offspringSex, setOffspringSex] = useState('');
  const [offspringIds, setOffspringIds] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownOptions, setDropdownOptions] = useState([]);

  const animalTypeOptions = [
    'Dairy Cow',
    'Beef Cattle',
    'Goat',
    'Sheep',
    'Swine',
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
  const deliveryMethodOptions = ['Natural Birth', 'Assisted', 'Cesarean'];

  useEffect(() => {
    let days = '280';
    if (animalType === 'Goat') days = '150';
    if (animalType === 'Swine') days = '114';
    if (animalType === 'Sheep') days = '152';
    setGestationDays(days);

    if (serviceDate) {
      const birthDate = new Date(serviceDate);
      birthDate.setDate(birthDate.getDate() + parseInt(days));
      setExpectedBirthDate(birthDate.toISOString().split('T')[0]);
    }
  }, [animalType, serviceDate]);

  const showDropdown = type => {
    switch (type) {
      case 'animalType':
        setDropdownOptions(animalTypeOptions);
        break;
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
      case 'deliveryMethod':
        setDropdownOptions(deliveryMethodOptions);
        break;
      default:
        setDropdownOptions([]);
    }
    setActiveDropdown(type);
    setDropdownVisible(true);
  };

  const handleSelect = value => {
    switch (activeDropdown) {
      case 'animalType':
        setAnimalType(value);
        break;
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
      case 'deliveryMethod':
        setDeliveryMethod(value);
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

  const handleBirthDateChange = (event, selectedDate) => {
    setShowBirthDatePicker(false);
    if (selectedDate) setBirthDate(selectedDate);
  };

  const handleSubmit = () => {
    setModalVisible(true);
  };
  const CustomDropdown = ({label, value, onPress}) => (
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

  const CustomDatePicker = ({label, value, showPicker, onPress}) => (
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
          onChange={onChange => setShowServiceDatePicker(false)}
        />
      )}
    </View>
  );

  return (
    <View style={{flex: 1, backgroundColor: COLORS.lightGreen}}>
      <SecondaryHeader title="Add Breeding Record" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Animal Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Animal ID</Text>
            <TextInput
              style={styles.input}
              value={animalId}
              onChangeText={setAnimalId}
              placeholder="Enter Animal ID"
              placeholderTextColor="#999"
              backgroundColor={COLORS.lightGreen}
            />
          </View>

          <CustomDropdown
            label="Animal Type"
            value={animalType}
            onPress={() => showDropdown('animalType')}
          />

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

          {/* Service Details */}
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

          {/* Gestation Details */}
          <Text style={styles.sectionTitle}>Gestation Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gestation Period (days)</Text>
            <TextInput
              style={[styles.input]}
              value={gestationDays}
              editable={false}
              backgroundColor={COLORS.lightGreen}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Expected Birth Date</Text>
            <TextInput
              style={[styles.input]}
              backgroundColor={COLORS.lightGreen}
              value={expectedBirthDate}
              editable={false}
            />
          </View>

          {/* Birth Records Toggle */}
          <TouchableOpacity
            style={styles.toggleContainer}
            onPress={() => setBirthRecorded(!birthRecorded)}>
            <Text style={styles.toggleLabel}>Record Birth Details</Text>
            <View
              style={[
                styles.toggleCircle,
                birthRecorded
                  ? styles.toggleCircleActive
                  : styles.toggleCircleInactive,
              ]}
            />
          </TouchableOpacity>

          {/* Birth Details (if toggled) */}
          {birthRecorded && (
            <>
              <Text style={styles.sectionTitle}>Birth Details</Text>

              <CustomDatePicker
                label="Birth Date"
                value={birthDate}
                onPress={() => setShowBirthDatePicker(true)}
                showPicker={showBirthDatePicker}
              />

              <CustomDropdown
                label="Delivery Method"
                value={deliveryMethod}
                onPress={() => showDropdown('deliveryMethod')}
              />

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Number of Young Ones</Text>
                <TextInput
                  style={styles.input}
                  value={youngOnes}
                  onChangeText={setYoungOnes}
                  placeholder="Enter number"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  backgroundColor={COLORS.lightGreen}
                />
              </View>

              {animalType === 'Swine' ? (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Litter Weight</Text>
                  <TextInput
                    style={styles.input}
                    value={litterWeight}
                    onChangeText={setLitterWeight}
                    placeholder="Total litter weight (e.g., 12 kg)"
                    placeholderTextColor="#999"
                    backgroundColor={COLORS.lightGreen}
                  />
                </View>
              ) : (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Birth Weight</Text>
                  <TextInput
                    style={styles.input}
                    value={birthWeight}
                    onChangeText={setBirthWeight}
                    placeholder="Birth weight (e.g., 3.5 kg)"
                    placeholderTextColor="#999"
                    backgroundColor={COLORS.lightGreen}
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Offspring Sex</Text>
                <TextInput
                  style={styles.input}
                  value={offspringSex}
                  onChangeText={setOffspringSex}
                  placeholder="E.g., 2 Males, 3 Females"
                  placeholderTextColor="#999"
                  backgroundColor={COLORS.lightGreen}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Offspring IDs</Text>
                <TextInput
                  style={styles.input}
                  value={offspringIds}
                  onChangeText={setOffspringIds}
                  placeholder="E.g., A101, A102, A103"
                  placeholderTextColor="#999"
                  backgroundColor={COLORS.lightGreen}
                />
              </View>
            </>
          )}

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
              renderItem={({item}) => (
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
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
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
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  dropdownButton: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownIcon: {
    width: 16,
    height: 16,
  },
  dateInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  dateIcon: {
    width: 20,
    height: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    marginVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  toggleCircle: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    backgroundColor: 'white',
  },
  toggleCircleActive: {
    backgroundColor: '#4CAF50',
  },
  toggleCircleInactive: {
    backgroundColor: '#e0e0e0',
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
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#333',
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
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
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    width: '85%',
  },
  // successIcon: {
  //   width: 0,
  //   height: 60,
  // },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.green,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  modalButton: {
    minWidth: 120,
    backgroundColor: COLORS.green,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default BreedingRecordForm;
