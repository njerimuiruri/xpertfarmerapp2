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
  ActivityIndicator,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import FastImage from 'react-native-fast-image';
import { icons } from '../../../constants';
import { COLORS } from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';
import { getLivestockForActiveFarm } from '../../../services/livestock';
import {
  getBreedingRecordById,
  updateBreedingRecord
} from '../../../services/breeding';

const EditBreedingRecordForm = ({ navigation, route }) => {
  const { recordId } = route.params;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [livestockLoading, setLivestockLoading] = useState(true);

  const [femaleAnimals, setFemaleAnimals] = useState([]);
  const [maleAnimals, setMaleAnimals] = useState([]);

  const [selectedDam, setSelectedDam] = useState(null);
  const [selectedSire, setSelectedSire] = useState(null);
  const [damSearchQuery, setDamSearchQuery] = useState('');
  const [sireSearchQuery, setSireSearchQuery] = useState('');
  const [showDamDropdown, setShowDamDropdown] = useState(false);
  const [showSireDropdown, setShowSireDropdown] = useState(false);

  const [purpose, setPurpose] = useState('Improve Milk Production');
  const [strategy, setStrategy] = useState('Cross Breeding');
  const [serviceType, setServiceType] = useState('Natural Mating');
  const [serviceDate, setServiceDate] = useState(new Date());
  const [showServiceDatePicker, setShowServiceDatePicker] = useState(false);
  const [numServices, setNumServices] = useState('1');
  const [firstHeatDate, setFirstHeatDate] = useState(new Date());
  const [showFirstHeatDatePicker, setShowFirstHeatDatePicker] = useState(false);

  const [sireCode, setSireCode] = useState('');
  const [aiType, setAiType] = useState('Regular AI');
  const [aiSource, setAiSource] = useState('Local');
  const [aiCost, setAiCost] = useState('');

  const [gestationDays, setGestationDays] = useState('');
  const [expectedBirthDate, setExpectedBirthDate] = useState('');

  const [originalRecord, setOriginalRecord] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownOptions, setDropdownOptions] = useState([]);

  const purposeOptions = [
    'Improve Milk Production',
    'Stocking Number',
    'Immunity',
    'Meat Production',
    'Breeding Stock',
  ];

  const strategyOptions = [
    'Cross Breeding',
    'Breeding Within Breeds',
    'Breeding Between Breeds',
    'Line Breeding',
    'Outcrossing',
  ];

  const serviceTypeOptions = ['Natural Mating', 'Artificial Insemination'];
  const aiTypeOptions = ['Sex Cell Semen', 'Regular AI'];
  const aiSourceOptions = ['Local', 'Imported'];

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setInitialLoading(true);

      await Promise.all([
        fetchLivestock(),
        fetchBreedingRecord()
      ]);
    } catch (error) {
      console.error('Error initializing data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchBreedingRecord = async () => {
    try {
      console.log('Fetching breeding record with ID:', recordId);

      const record = await getBreedingRecordById(recordId);
      console.log('Fetched breeding record:', record);

      setOriginalRecord(record);

      setPurpose(record.purpose || 'Improve Milk Production');
      setStrategy(record.strategy || 'Cross Breeding');
      setServiceType(record.serviceType || 'Natural Mating');
      setNumServices(record.numServices?.toString() || '1');
      setGestationDays(record.gestationDays?.toString() || '');

      if (record.serviceDate) {
        setServiceDate(new Date(record.serviceDate));
      }
      if (record.firstHeatDate) {
        setFirstHeatDate(new Date(record.firstHeatDate));
      }
      if (record.expectedBirthDate) {
        setExpectedBirthDate(new Date(record.expectedBirthDate).toISOString().split('T')[0]);
      }

      if (record.serviceType === 'Artificial Insemination') {
        setSireCode(record.sireCode || '');
        setAiType(record.aiType || 'Regular AI');
        setAiSource(record.aiSource || 'Local');
        setAiCost(record.aiCost?.toString() || '');
      }

    } catch (error) {
      console.error('Error fetching breeding record:', error);
      Alert.alert('Error', 'Failed to load breeding record details.');
    }
  };

  const fetchLivestock = async () => {
    try {
      setLivestockLoading(true);
      const { data: livestock, error } = await getLivestockForActiveFarm();

      if (error) {
        Alert.alert('Error', error);
        return;
      }

      if (!livestock || !Array.isArray(livestock)) {
        Alert.alert('Error', 'No livestock data available');
        return;
      }

      console.log('=== LIVESTOCK DEBUG INFO ===');
      console.log('Total livestock fetched:', livestock.length);

      const females = livestock.filter(animal => {
        const mammalGender = animal?.mammal?.gender;
        const poultryGender = animal?.poultry?.gender;
        const gender = mammalGender || poultryGender;

        if (!gender) {
          return false;
        }

        const normalizedGender = gender.toString().toLowerCase().trim();
        return normalizedGender === 'female';
      });

      const males = livestock.filter(animal => {
        const mammalGender = animal?.mammal?.gender;
        const poultryGender = animal?.poultry?.gender;
        const gender = mammalGender || poultryGender;

        if (!gender) {
          return false;
        }

        const normalizedGender = gender.toString().toLowerCase().trim();
        return normalizedGender === 'male';
      });

      setFemaleAnimals(females);
      setMaleAnimals(males);

      console.log('Females found:', females.length);
      console.log('Males found:', males.length);

    } catch (error) {
      console.error('Error fetching livestock:', error);
      Alert.alert('Error', 'Failed to fetch livestock data');
    } finally {
      setLivestockLoading(false);
    }
  };

  const setSelectedAnimalsFromRecord = () => {
    if (!originalRecord || femaleAnimals.length === 0 || maleAnimals.length === 0) {
      return;
    }

    if (originalRecord.damId) {
      const dam = femaleAnimals.find(animal => animal.id === originalRecord.damId);
      if (dam) {
        setSelectedDam(dam);
        console.log(' Found and set dam:', dam.id);
      } else {
        console.log(' Dam not found in female animals:', originalRecord.damId);
      }
    }

    if (originalRecord.sireId && originalRecord.serviceType === 'Natural Mating') {
      const sire = maleAnimals.find(animal => animal.id === originalRecord.sireId);
      if (sire) {
        setSelectedSire(sire);
        console.log(' Found and set sire:', sire.id);
      } else {
        console.log(' Sire not found in male animals:', originalRecord.sireId);
      }
    }
  };

  useEffect(() => {
    if (originalRecord && femaleAnimals.length > 0 && maleAnimals.length > 0) {
      setSelectedAnimalsFromRecord();
    }
  }, [originalRecord, femaleAnimals, maleAnimals]);

  const getFilteredAnimals = (animals, searchQuery) => {
    if (!searchQuery.trim()) return animals;

    const query = searchQuery.toLowerCase().trim();

    return animals.filter(animal => {
      const animalData = animal?.mammal || animal?.poultry;
      const idNumber = (animalData?.idNumber || '').toLowerCase();
      const breedType = (animalData?.breedType || '').toLowerCase();
      const type = (animal?.type || '').toLowerCase();
      const gender = (animalData?.gender || '').toLowerCase();

      return (
        idNumber.includes(query) ||
        breedType.includes(query) ||
        type.includes(query) ||
        gender.includes(query)
      );
    });
  };

  const filteredDams = getFilteredAnimals(femaleAnimals, damSearchQuery);
  const filteredSires = getFilteredAnimals(maleAnimals, sireSearchQuery);

  useEffect(() => {
    if (!selectedDam) return;

    let days = '280';
    const damType = selectedDam?.type?.toLowerCase() || '';

    if (damType.includes('goat')) days = '150';
    else if (damType.includes('swine') || damType.includes('pig')) days = '114';
    else if (damType.includes('sheep')) days = '152';
    else if (damType.includes('poultry') || damType.includes('chicken')) days = '21';

    setGestationDays(days);

    if (serviceDate) {
      const birthDate = new Date(serviceDate);
      birthDate.setDate(birthDate.getDate() + parseInt(days));
      setExpectedBirthDate(birthDate.toISOString().split('T')[0]);
    }
  }, [selectedDam, serviceDate]);

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
        if (value === 'Artificial Insemination') {
          setSelectedSire(null);
        }
        if (value === 'Natural Mating') {
          setSireCode('');
          setAiType('Regular AI');
          setAiSource('Local');
          setAiCost('');
        }
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

  const validateAnimalGender = (animal, expectedGender) => {
    const mammalGender = animal?.mammal?.gender;
    const poultryGender = animal?.poultry?.gender;
    const actualGender = mammalGender || poultryGender;

    console.log(`Validating ${expectedGender}: actualGender = "${actualGender}"`);

    if (!actualGender) {
      return {
        isValid: false,
        message: 'Gender information is missing',
        actualGender: null
      };
    }

    const normalizedActual = actualGender.toString().toLowerCase().trim();
    const normalizedExpected = expectedGender.toLowerCase().trim();

    const isValid = normalizedActual === normalizedExpected;

    return {
      isValid,
      message: isValid ? 'Valid' : `Expected exactly "${expectedGender}", got "${actualGender}"`,
      actualGender: actualGender
    };
  };

  const handleUpdate = async () => {
    if (!selectedDam) {
      Alert.alert('Validation Error', 'Please select a dam (female animal)');
      return;
    }

    if (serviceType === 'Natural Mating' && !selectedSire) {
      Alert.alert('Validation Error', 'Please select a sire (male animal) for natural mating');
      return;
    }

    if (serviceType === 'Artificial Insemination' && !sireCode.trim()) {
      Alert.alert('Validation Error', 'Please enter sire code for artificial insemination');
      return;
    }

    const damValidation = validateAnimalGender(selectedDam, 'female');
    if (!damValidation.isValid) {
      Alert.alert('Validation Error', `Dam validation failed: ${damValidation.message}`);
      console.error(' Dam validation failed:', damValidation);
      return;
    }

    if (selectedSire) {
      const sireValidation = validateAnimalGender(selectedSire, 'male');
      if (!sireValidation.isValid) {
        Alert.alert('Validation Error', `Sire validation failed: ${sireValidation.message}`);
        console.error(' Sire validation failed:', sireValidation);
        return;
      }
    }

    console.log(' Gender validation passed');

    try {
      setLoading(true);

      const payload = {
        damId: selectedDam.id,
        sireId: selectedSire?.id || null,
        purpose,
        strategy,
        serviceType,
        serviceDate: serviceDate.toISOString(),
        numServices: parseInt(numServices) || 1,
        firstHeatDate: firstHeatDate.toISOString(),
        gestationDays: parseInt(gestationDays),
        expectedBirthDate: new Date(expectedBirthDate).toISOString(),
      };

      if (serviceType === 'Artificial Insemination') {
        payload.sireCode = sireCode;
        payload.aiType = aiType;
        payload.aiSource = aiSource;
        payload.aiCost = parseFloat(aiCost) || 0;
      }

      console.log('Breeding Record Update Payload:', JSON.stringify(payload, null, 2));

      const { data, error } = await updateBreedingRecord(recordId, payload);

      if (error) {
        console.log('=== UPDATE ERROR DEBUG INFO ===');
        console.log('Error received:', error);
        Alert.alert('Error', error);
        return;
      }

      console.log('Breeding record updated successfully:', data);
      setModalVisible(true);

    } catch (error) {
      console.error('Error updating breeding record:', error);
      Alert.alert('Error', 'Failed to update breeding record. Please try again.');
    } finally {
      setLoading(false);
    }
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

  const AnimalDropdown = ({ label, selectedAnimal, onPress, required = false, count = 0 }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
        {count > 0 && <Text style={styles.countText}> ({count} available)</Text>}
      </Text>
      <TouchableOpacity style={styles.dropdownButton} onPress={onPress}>
        <Text style={[styles.dropdownButtonText, !selectedAnimal && styles.placeholderText]}>
          {selectedAnimal
            ? `${selectedAnimal?.mammal?.idNumber || selectedAnimal?.poultry?.idNumber} - ${selectedAnimal.type}`
            : `Select ${label}`
          }
        </Text>
        <FastImage
          source={icons.downArrow}
          style={styles.dropdownIcon}
          tintColor="#666"
        />
      </TouchableOpacity>
    </View>
  );

  const renderAnimalItem = ({ item, onSelect, onClose, setSearchQuery }) => {
    const animalData = item?.mammal || item?.poultry;
    const idNumber = animalData?.idNumber || 'No ID';
    const breedType = animalData?.breedType || 'Unknown Breed';
    const gender = animalData?.gender || 'Unknown';
    const type = item?.type || 'Unknown Type';

    return (
      <TouchableOpacity
        style={styles.animalItem}
        onPress={() => {
          onSelect(item);
          onClose();
          setSearchQuery('');
        }}
      >
        <Text style={styles.animalId}>{idNumber}</Text>
        <Text style={styles.animalDetails}>
          {type} - {breedType} ({gender})
        </Text>
      </TouchableOpacity>
    );
  };

  if (initialLoading || livestockLoading) {
    return (

      <View style={[styles.container]}>
        <SecondaryHeader title="Edit Breeding Record" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.green} />
          <Text style={styles.loadingText}>Loading breeding record data...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SecondaryHeader title="Edit Breeding Record" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Animal Selection</Text>

          <AnimalDropdown
            label="Dam (Female)"
            selectedAnimal={selectedDam}
            onPress={() => setShowDamDropdown(true)}
            required={true}
            count={femaleAnimals.length}
          />

          {selectedDam && (
            <View style={styles.selectedAnimalInfo}>
              <Text style={styles.selectedAnimalText}>
                Selected Dam: {selectedDam?.mammal?.idNumber || selectedDam?.poultry?.idNumber}
                ({selectedDam.type} - {selectedDam?.mammal?.breedType || selectedDam?.poultry?.breedType})
              </Text>
            </View>
          )}

          {serviceType === 'Natural Mating' && (
            <>
              <AnimalDropdown
                label="Sire (Male)"
                selectedAnimal={selectedSire}
                onPress={() => setShowSireDropdown(true)}
                required={true}
                count={maleAnimals.length}
              />

              {selectedSire && (
                <View style={styles.selectedAnimalInfo}>
                  <Text style={styles.selectedAnimalText}>
                    Selected Sire: {selectedSire?.mammal?.idNumber || selectedSire?.poultry?.idNumber}
                    ({selectedSire.type} - {selectedSire?.mammal?.breedType || selectedSire?.poultry?.breedType})
                  </Text>
                </View>
              )}
            </>
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
                <Text style={styles.label}>Sire Code <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={sireCode}
                  onChangeText={setSireCode}
                  placeholder="Enter sire code"
                  placeholderTextColor="#999"
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
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Expected Birth Date</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
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
              style={[styles.submitButton, styles.button, loading && styles.disabledButton]}
              onPress={handleUpdate}
              disabled={loading}>
              <Text style={styles.submitButtonText}>
                {loading ? 'Updating...' : 'Update Record'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showDamDropdown}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDamDropdown(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.animalModalContent}>
            <Text style={styles.modalTitle}>Select Dam (Female)</Text>

            <View style={styles.searchContainer}>
              <FastImage
                source={icons.search}
                style={styles.searchIcon}
                tintColor="#666"
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search female animals..."
                placeholderTextColor="#999"
                value={damSearchQuery}
                onChangeText={setDamSearchQuery}
              />
            </View>

            <FlatList
              data={filteredDams}
              keyExtractor={item => item.id}
              renderItem={({ item }) => renderAnimalItem({
                item,
                onSelect: (selected) => {
                  setSelectedDam(selected);
                  console.log(' Selected Dam ID:', selected.id);
                },
                onClose: () => setShowDamDropdown(false),
                setSearchQuery: setDamSearchQuery,
              })}
              style={styles.animalList}
              showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowDamDropdown(false);
                setDamSearchQuery('');
              }}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showSireDropdown}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSireDropdown(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.animalModalContent}>
            <Text style={styles.modalTitle}>Select Sire (Male)</Text>

            <View style={styles.searchContainer}>
              <FastImage
                source={icons.search}
                style={styles.searchIcon}
                tintColor="#666"
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search male animals..."
                placeholderTextColor="#999"
                value={sireSearchQuery}
                onChangeText={setSireSearchQuery}
              />
            </View>

            <FlatList
              data={filteredSires}
              keyExtractor={item => item.id}
              renderItem={({ item }) => renderAnimalItem({
                item,
                onSelect: (selected) => {
                  setSelectedSire(selected);
                  console.log(' Selected Sire ID:', selected.id);
                },
                onClose: () => setShowSireDropdown(false),
                setSearchQuery: setSireSearchQuery,
              })}
              style={styles.animalList}
              showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowSireDropdown(false);
                setSireSearchQuery('');
              }}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <FastImage
              source={icons.checkCircle}
              style={styles.successIcon}
              tintColor={COLORS.green}
            />
            <Text style={styles.successTitle}>Record Updated Successfully!</Text>
            <Text style={styles.successMessage}>
              The breeding record has been updated with the new information.
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                setModalVisible(false);
                navigation.goBack();
              }}>
              <Text style={styles.successButtonText}>Continue</Text>
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
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  refreshButton: {
    padding: 8,
  },
  refreshIcon: {
    width: 20,
    height: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    marginTop: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#e74c3c',
  },
  countText: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'normal',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  disabledInput: {
    backgroundColor: '#f8f9fa',
    color: '#666',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  dropdownIcon: {
    width: 20,
    height: 20,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  dateIcon: {
    width: 20,
    height: 20,
  },
  selectedAnimalInfo: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedAnimalText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    backgroundColor: COLORS.green,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  disabledButton: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    maxHeight: '70%',
    width: '80%',
  },
  animalModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  animalList: {
    maxHeight: 300,
  },
  animalItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  animalId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  animalDetails: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  successModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    width: '80%',
  },
  successIcon: {
    width: 60,
    height: 60,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  successButton: {
    backgroundColor: COLORS.green,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default EditBreedingRecordForm;