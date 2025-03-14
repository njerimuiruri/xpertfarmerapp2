import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  StatusBar,
  SafeAreaView,
  Modal,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {icons} from '../../../constants';
import {COLORS} from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';
import DateTimePicker from '@react-native-community/datetimepicker';

const EditBreedingRecordScreen = ({route, navigation}) => {
  const {record} = route.params;
  
  const [breedingRecord, setBreedingRecord] = useState({...record});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateField, setDateField] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownField, setDropdownField] = useState(null);
  
  const dropdownOptions = {
    animalType: ['Dairy Cow', 'Goat', 'Swine', 'Sheep'],
    purpose: ['Improve Milk Production', 'Stocking Number', 'Immunity'],
    strategy: ['Cross Breeding', 'Breeding Within Breeds', 'Breeding Between Breeds'],
    serviceType: ['Artificial Insemination', 'Natural Mating', 'Embryo Transfer'],
    status: ['Pregnant', 'Delivered', 'Failed'],
  };
  
  useEffect(() => {
    if (breedingRecord.animalType === 'Dairy Cow') {
      setBreedingRecord(prev => ({...prev, gestationPeriod: '280 days'}));
    } else if (breedingRecord.animalType === 'Goat') {
      setBreedingRecord(prev => ({...prev, gestationPeriod: '150 days'}));
    } else if (breedingRecord.animalType === 'Swine') {
      setBreedingRecord(prev => ({...prev, gestationPeriod: '114 days'}));
    } else if (breedingRecord.animalType === 'Sheep') {
      setBreedingRecord(prev => ({...prev, gestationPeriod: '152 days'}));
    }
  }, [breedingRecord.animalType]);
  
  useEffect(() => {
    if (breedingRecord.serviceDate && breedingRecord.gestationPeriod) {
      const days = parseInt(breedingRecord.gestationPeriod.split(' ')[0]);
      const serviceDate = new Date(breedingRecord.serviceDate);
      const expectedDate = new Date(serviceDate);
      expectedDate.setDate(serviceDate.getDate() + days);
      
      const year = expectedDate.getFullYear();
      const month = String(expectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(expectedDate.getDate()).padStart(2, '0');
      
      setBreedingRecord(prev => ({
        ...prev, 
        expectedBirthDate: `${year}-${month}-${day}`
      }));
    }
  }, [breedingRecord.serviceDate, breedingRecord.gestationPeriod]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate && dateField) {
      const formattedDate = formatDate(selectedDate);
      setBreedingRecord({...breedingRecord, [dateField]: formattedDate});
    }
  };

  const showDatePickerModal = (field) => {
    setDateField(field);
    setShowDatePicker(true);
  };
  
  const showDropdownModal = (field) => {
    setDropdownField(field);
    setShowDropdown(true);
  };
  
  const handleSelectOption = (option) => {
    if (dropdownField) {
      setBreedingRecord({...breedingRecord, [dropdownField]: option});
      setShowDropdown(false);
    }
  };

  const validateForm = () => {
    if (!breedingRecord.animalId.trim()) {
      Alert.alert('Error', 'Animal ID is required');
      return false;
    }
    
    if (!breedingRecord.animalType) {
      Alert.alert('Error', 'Animal Type is required');
      return false;
    }
    
    if (!breedingRecord.purpose) {
      Alert.alert('Error', 'Breeding Purpose is required');
      return false;
    }
    
    if (!breedingRecord.strategy) {
      Alert.alert('Error', 'Breeding Strategy is required');
      return false;
    }
    
    if (!breedingRecord.serviceType) {
      Alert.alert('Error', 'Service Type is required');
      return false;
    }
    
    if (!breedingRecord.serviceDate) {
      Alert.alert('Error', 'Service Date is required');
      return false;
    }
    
    if (!breedingRecord.status) {
      Alert.alert('Error', 'Status is required');
      return false;
    }
    
    return true;
  };

 

  const renderDropdownModal = () => {
    if (!dropdownField) return null;
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDropdown}
        onRequestClose={() => setShowDropdown(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Select {dropdownField.charAt(0).toUpperCase() + dropdownField.slice(1)}
            </Text>
            
            <ScrollView style={styles.optionList}>
              {dropdownOptions[dropdownField]?.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.option,
                    breedingRecord[dropdownField] === option && styles.selectedOption,
                  ]}
                  onPress={() => handleSelectOption(option)}>
                  <Text
                    style={[
                      styles.optionText,
                      breedingRecord[dropdownField] === option && styles.selectedOptionText,
                    ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDropdown(false)}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
        <View style={{flex: 1, backgroundColor: COLORS.lightGreen}}>
    
      <SecondaryHeader title="Edit Breeding Record" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>Animal Information</Text>
          
          {/* Animal ID */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Animal ID</Text>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                value={breedingRecord.animalId}
                backgroundColor={COLORS.lightGreen}
                onChangeText={(text) => setBreedingRecord({...breedingRecord, animalId: text})}
                placeholder="Enter Animal ID"
              />
            </View>
          </View>
          
          {/* Animal Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Animal Type</Text>
            <TouchableOpacity 
              style={styles.pickerButton}
              onPress={() => showDropdownModal('animalType')}
            >
              <Text style={styles.pickerText}>
                {breedingRecord.animalType || 'Select Animal Type'}
              </Text>
              <FastImage
                source={icons.dropdown}
                style={styles.inputIcon}
                tintColor="#666"
              />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>Breeding Information</Text>
          
          {/* Purpose */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Breeding Purpose</Text>
            <TouchableOpacity 
              style={styles.pickerButton}
              onPress={() => showDropdownModal('purpose')}
            >
              <Text style={styles.pickerText}>
                {breedingRecord.purpose || 'Select Purpose'}
              </Text>
              <FastImage
                source={icons.dropdown}
                style={styles.inputIcon}
                tintColor="#666"
              />
            </TouchableOpacity>
          </View>
          
          {/* Strategy */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Breeding Strategy</Text>
            <TouchableOpacity 
              style={styles.pickerButton}
              onPress={() => showDropdownModal('strategy')}
            >
              <Text style={styles.pickerText}>
                {breedingRecord.strategy || 'Select Strategy'}
              </Text>
              <FastImage
                source={icons.dropdown}
                style={styles.inputIcon}
                tintColor="#666"
              />
            </TouchableOpacity>
          </View>
          
          {/* Service Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Service Type</Text>
            <TouchableOpacity 
              style={styles.pickerButton}
              onPress={() => showDropdownModal('serviceType')}
            >
              <Text style={styles.pickerText}>
                {breedingRecord.serviceType || 'Select Service Type'}
              </Text>
              <FastImage
                source={icons.dropdown}
                style={styles.inputIcon}
                tintColor="#666"
              />
            </TouchableOpacity>
          </View>
          
          {/* Service Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Service Date</Text>
            <TouchableOpacity 
              style={styles.datePickerButton}              
              onPress={() => showDatePickerModal('serviceDate')}
            >
              <Text style={styles.dateText}>
                {breedingRecord.serviceDate || 'Select Date'}
              </Text>
              <FastImage
                source={icons.calendar}
                style={styles.inputIcon}
                tintColor="#666"
              />
            </TouchableOpacity>
            {showDatePicker && dateField === 'serviceDate' && (
              <DateTimePicker
                value={breedingRecord.serviceDate ? new Date(breedingRecord.serviceDate) : new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Gestation Period</Text>
            <View style={[styles.textInputContainer, styles.readOnlyInput]}>
              <Text style={styles.readOnlyText}>{breedingRecord.gestationPeriod }</Text>
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Expected Birth Date</Text>
            <View style={[styles.textInputContainer, styles.readOnlyInput]}>
              <Text style={styles.readOnlyText}>{breedingRecord.expectedBirthDate}</Text>
            </View>
          </View>
          
          {/* Status */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Status</Text>
            <TouchableOpacity 
              style={styles.pickerButton}
              onPress={() => showDropdownModal('status')}
            >
              <Text style={[
                styles.pickerText,
                styles.statusText,
                breedingRecord.status === 'Pregnant' && styles.pregnantStatus,
                breedingRecord.status === 'Delivered' && styles.deliveredStatus,
                breedingRecord.status === 'Failed' && styles.failedStatus,
              ]}>
                {breedingRecord.status || 'Select Status'}
              </Text>
              <FastImage
                source={icons.dropdown}
                style={styles.inputIcon}
                tintColor="#666"
              />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Birth Details Section (visible only if status is Delivered) */}
        {breedingRecord.status === 'Delivered' && (
          <View style={styles.formCard}>
            <Text style={styles.cardTitle}>Birth Details</Text>
            
            {/* Birth Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Birth Date</Text>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => showDatePickerModal('birthDate')}
              >
                <Text style={styles.dateText}>
                  {breedingRecord.birthDate || 'Select Date'}
                </Text>
                <FastImage
                  source={icons.calendar}
                  style={styles.inputIcon}
                  tintColor="#666"
                />
              </TouchableOpacity>
              {showDatePicker && dateField === 'birthDate' && (
                <DateTimePicker
                  value={breedingRecord.birthDate ? new Date(breedingRecord.birthDate) : new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>
            
            {/* Delivery Method */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Delivery Method</Text>
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={breedingRecord.deliveryMethod}
                  onChangeText={(text) => setBreedingRecord({...breedingRecord, deliveryMethod: text})}
                  placeholder="E.g., Natural Birth, Assisted, etc."
                />
              </View>
            </View>
            
            {/* Number of Young Ones */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Number of Offspring</Text>
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={breedingRecord.youngOnes ? breedingRecord.youngOnes.toString() : ''}
                  onChangeText={(text) => setBreedingRecord({...breedingRecord, youngOnes: text})}
                  keyboardType="numeric"
                  placeholder="Enter number"
                />
              </View>
            </View>
            
            {/* Weight Fields */}
            {breedingRecord.animalType === 'Swine' ? (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Litter Weight</Text>
                <View style={styles.textInputContainer}>
                  <TextInput
                  style={styles.textInput}
                  value={breedingRecord.litterWeight ? breedingRecord.litterWeight.toString() : ''}
                  onChangeText={(text) => setBreedingRecord({...breedingRecord, litterWeight: text})}
                  keyboardType="numeric"
                  placeholder="Enter weight in kg"
                />
              </View>
            </View>
            ) : (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Birth Weight</Text>
                <View style={styles.textInputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={breedingRecord.birthWeight ? breedingRecord.birthWeight.toString() : ''}
                    onChangeText={(text) => setBreedingRecord({...breedingRecord, birthWeight: text})}
                    keyboardType="numeric"
                    placeholder="Enter weight in kg"
                  />
                </View>
              </View>
            )}
            
            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes</Text>
              <View style={[styles.textInputContainer, styles.textAreaContainer]}>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={breedingRecord.notes}
                  onChangeText={(text) => setBreedingRecord({...breedingRecord, notes: text})}
                  placeholder="Enter any additional notes"
                  multiline={true}
                  numberOfLines={4}
                />
              </View>
            </View>
          </View>
        )}
        
        {/* Save Button */}
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSaveRecord}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Render the dropdown modal */}
      {renderDropdownModal()}
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor:COLORS.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.green2,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textInputContainer: {
    backgroundColor:COLORS.lightGreen,
    borderRadius: 8,
    borderWidth: 1,
    borderColor:COLORS.lightGray1,
    height: 48,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 16,
    color: '#333',
  },
  readOnlyInput: {
    backgroundColor:COLORS.lightGreen,

  },
  readOnlyText: {
    fontSize: 16,
    color: '#666',
    
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 48,
    paddingHorizontal: 12,
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 48,
    paddingHorizontal: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  inputIcon: {
    width: 20,
    height: 20,
  },
  saveButton: {
    backgroundColor: COLORS.green2,
    borderRadius: 8,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusText: {
    fontWeight: '500',
  },
  pregnantStatus: {
    color: COLORS.green2,
  },
  deliveredStatus: {
    color: '#4CAF50',
  },
  failedStatus: {
    color: '#F44336',
  },
  textAreaContainer: {
    height: 100,
  },
  textArea: {
    textAlignVertical: 'top',
    height: 100,
    paddingTop: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    maxHeight: '70%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.green2,
    marginBottom: 16,
    textAlign: 'center',
  },
  optionList: {
    maxHeight: 250,
  },
  option: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  selectedOption: {
    backgroundColor: '#E8F5E9',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: COLORS.green2,
    fontWeight: '500',
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
});

export default EditBreedingRecordScreen;
                    