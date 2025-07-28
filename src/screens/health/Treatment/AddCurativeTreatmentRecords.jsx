import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { icons } from '../../../constants';
import { COLORS } from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';
import { createTreatment, validateTreatmentData } from '../../../services/healthservice';
import { getLivestockForActiveFarm } from '../../../services/livestock';

const { width } = Dimensions.get('window');

const AddCurativeTreatmentRecords = ({ navigation, route }) => {
  const routeParams = route?.params || {};

  const [livestock, setLivestock] = useState([]);
  const [selectedLivestock, setSelectedLivestock] = useState(null);
  const [showLivestockPicker, setShowLivestockPicker] = useState(false);
  const [loadingLivestock, setLoadingLivestock] = useState(true);

  const [formData, setFormData] = useState({
    animalIdOrFlockId: '',
    healthEventDate: new Date(),
    healthEventSymptoms: '',
    diagnosis: '',
    treatmentType: '',
    treatmentDescription: '',
    drugAdministered: '',
    dateAdministered: new Date(),
    dosageAdministered: '',
    costOfDrugs: '',
    medicalOfficerName: '',
    licenseId: '',
    costOfService: '',
    farmerWitnessName: '',
    notes: '',
    farmId: '',
    livestockId: '',
  });

  const [showHealthEventDatePicker, setShowHealthEventDatePicker] = useState(false);
  const [showDateAdministeredPicker, setShowDateAdministeredPicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Treatment type options
  const treatmentTypes = [
    'Deworming',
    'Antibiotic Treatment',
    'Pain Management',
    'Wound Treatment',
    'Nutritional Supplement',
    'Hormonal Treatment',
    'Anti-inflammatory',
    'Other'
  ];
  const [showTreatmentTypePicker, setShowTreatmentTypePicker] = useState(false);

  // Load livestock on component mount
  useEffect(() => {
    loadLivestock();
  }, []);

  // Pre-select livestock if coming from specific livestock screen
  useEffect(() => {
    if (routeParams.animalId && routeParams.animalData && livestock.length > 0) {
      const preSelectedLivestock = livestock.find(
        item => item.id === routeParams.animalId
      );
      if (preSelectedLivestock) {
        setSelectedLivestock(preSelectedLivestock);
        updateFormWithLivestock(preSelectedLivestock);
      }
    }
  }, [livestock, routeParams]);

  const loadLivestock = async () => {
    try {
      setLoadingLivestock(true);
      const livestockData = await getLivestockForActiveFarm();

      if (Array.isArray(livestockData)) {
        setLivestock(livestockData);
      } else {
        console.error('Expected array but got:', livestockData);
        setLivestock([]);
      }
    } catch (error) {
      console.error('Failed to load livestock:', error);
      Alert.alert('Error', 'Failed to load livestock. Please try again.');
      setLivestock([]);
    } finally {
      setLoadingLivestock(false);
    }
  };

  const updateFormWithLivestock = (selectedAnimal) => {
    setFormData(prev => ({
      ...prev,
      animalIdOrFlockId: selectedAnimal.id,
      livestockId: selectedAnimal.id,
      farmId: selectedAnimal.farmId,
    }));
  };

  const handleLivestockSelection = (animal) => {
    setSelectedLivestock(animal);
    updateFormWithLivestock(animal);
    setShowLivestockPicker(false);

    // Clear livestock selection error if it exists
    if (errors.livestock) {
      setErrors(prev => ({ ...prev, livestock: null }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleHealthEventDateChange = (event, selectedDate) => {
    setShowHealthEventDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, healthEventDate: selectedDate }));
    }
  };

  const handleDateAdministeredChange = (event, selectedDate) => {
    setShowDateAdministeredPicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, dateAdministered: selectedDate }));
    }
  };

  const handleTreatmentTypeSelection = (type) => {
    setFormData(prev => ({ ...prev, treatmentType: type }));
    setShowTreatmentTypePicker(false);
    // Clear error if it exists
    if (errors.treatmentType) {
      setErrors(prev => ({ ...prev, treatmentType: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate livestock selection
    if (!selectedLivestock) {
      newErrors.livestock = 'Please select a livestock/animal';
    }

    if (!formData.healthEventSymptoms.trim()) {
      newErrors.healthEventSymptoms = 'Please describe the health event symptoms';
    }

    if (!formData.diagnosis.trim()) {
      newErrors.diagnosis = 'Please enter a diagnosis';
    }

    if (!formData.treatmentType.trim()) {
      newErrors.treatmentType = 'Please select a treatment type';
    }

    if (!formData.treatmentDescription.trim()) {
      newErrors.treatmentDescription = 'Please describe the treatment';
    }

    if (!formData.drugAdministered.trim()) {
      newErrors.drugAdministered = 'Please enter the drug administered';
    }

    if (!formData.dosageAdministered || isNaN(parseFloat(formData.dosageAdministered))) {
      newErrors.dosageAdministered = 'Please enter a valid dosage';
    }

    if (!formData.medicalOfficerName.trim()) {
      newErrors.medicalOfficerName = 'Please enter the medical officer name';
    }

    if (formData.costOfDrugs && isNaN(parseFloat(formData.costOfDrugs))) {
      newErrors.costOfDrugs = 'Please enter a valid cost';
    }

    if (formData.costOfService && isNaN(parseFloat(formData.costOfService))) {
      newErrors.costOfService = 'Please enter a valid service cost';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        animalIdOrFlockId: formData.animalIdOrFlockId,
        healthEventDate: formData.healthEventDate.toISOString(),
        healthEventSymptoms: formData.healthEventSymptoms.trim(),
        diagnosis: formData.diagnosis.trim(),
        treatmentType: formData.treatmentType.trim(),
        treatmentDescription: formData.treatmentDescription.trim(),
        drugAdministered: formData.drugAdministered.trim(),
        dateAdministered: formData.dateAdministered.toISOString(),
        dosageAdministered: parseFloat(formData.dosageAdministered),
        costOfDrugs: formData.costOfDrugs ? parseFloat(formData.costOfDrugs) : 0,
        medicalOfficerName: formData.medicalOfficerName.trim(),
        licenseId: formData.licenseId.trim(),
        costOfService: formData.costOfService ? parseFloat(formData.costOfService) : 0,
        farmerWitnessName: formData.farmerWitnessName.trim(),
        notes: formData.notes.trim(),
      };

      const validation = validateTreatmentData(payload);
      if (!validation.isValid) {
        Alert.alert('Validation Error', validation.errors.join('\n'));
        return;
      }

      console.log('Creating treatment with payload:', payload);

      const result = await createTreatment(selectedLivestock.id, payload);

      if (result.error) {
        Alert.alert('Error', result.error);
        return;
      }

      Alert.alert(
        'Success',
        'Treatment record has been added successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error adding treatment:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please check your connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatLivestockDisplayName = (animal) => {
    if (animal.category === 'poultry' && animal.poultry) {
      return `${animal.type.toUpperCase()} - Flock ID: ${animal.poultry.flockId || 'N/A'}`;
    } else if (animal.category === 'mammal' && animal.mammal) {
      return `${animal.type.toUpperCase()} - ID: ${animal.mammal.idNumber || 'N/A'}`;
    }
    return `${animal.type.toUpperCase()} - ID: ${animal.id}`;
  };

  const formatLivestockSubtitle = (animal) => {
    if (animal.category === 'poultry' && animal.poultry) {
      return `${animal.poultry.breedType || 'Unknown breed'} • ${animal.poultry.gender || 'Unknown gender'}`;
    } else if (animal.category === 'mammal' && animal.mammal) {
      return `${animal.mammal.breedType || 'Unknown breed'} • ${animal.mammal.gender || 'Unknown gender'}`;
    }
    return 'Livestock details';
  };

  const renderFormGroup = (title, children) => (
    <View style={styles.formGroup}>
      <Text style={styles.groupTitle}>{title}</Text>
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={styles.groupContainer}>
        {children}
      </LinearGradient>
    </View>
  );

  const renderInput = (label, field, options = {}) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label}
        {options.required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        style={[
          styles.textInput,
          errors[field] && styles.inputError,
          options.multiline && styles.textAreaInput
        ]}
        value={formData[field]?.toString()}
        onChangeText={(value) => handleInputChange(field, value)}
        placeholder={options.placeholder || `Enter ${label.toLowerCase()}`}
        keyboardType={options.keyboardType || 'default'}
        multiline={options.multiline}
        numberOfLines={options.numberOfLines || 1}
        placeholderTextColor="#9CA3AF"
        editable={!isLoading}
      />
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

  const renderLivestockPicker = () => (
    <Modal
      visible={showLivestockPicker}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowLivestockPicker(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Livestock</Text>
            <TouchableOpacity
              onPress={() => setShowLivestockPicker(false)}
              style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {loadingLivestock ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.loadingText}>Loading livestock...</Text>
            </View>
          ) : livestock.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No livestock found</Text>
              <Text style={styles.emptySubtext}>
                Add some livestock to your farm first
              </Text>
            </View>
          ) : (
            <FlatList
              data={livestock}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.livestockItem,
                    selectedLivestock?.id === item.id && styles.selectedLivestockItem
                  ]}
                  onPress={() => handleLivestockSelection(item)}>
                  <View style={styles.livestockIcon}>
                    <FastImage
                      source={icons.livestock || icons.account}
                      style={styles.livestockIconImage}
                      tintColor="#10B981"
                    />
                  </View>
                  <View style={styles.livestockInfo}>
                    <Text style={styles.livestockName}>
                      {formatLivestockDisplayName(item)}
                    </Text>
                    <Text style={styles.livestockSubtitle}>
                      {formatLivestockSubtitle(item)}
                    </Text>
                  </View>
                  {selectedLivestock?.id === item.id && (
                    <FastImage
                      source={icons.check || icons.account}
                      style={styles.checkIcon}
                      tintColor="#10B981"
                    />
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.modalList}
            />
          )}
        </View>
      </View>
    </Modal>
  );

  const renderTreatmentTypePicker = () => (
    <Modal
      visible={showTreatmentTypePicker}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowTreatmentTypePicker(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Treatment Type</Text>
            <TouchableOpacity
              onPress={() => setShowTreatmentTypePicker(false)}
              style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={treatmentTypes}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.treatmentTypeItem,
                  formData.treatmentType === item && styles.selectedTreatmentTypeItem
                ]}
                onPress={() => handleTreatmentTypeSelection(item)}>
                <Text style={[
                  styles.treatmentTypeName,
                  formData.treatmentType === item && styles.selectedTreatmentTypeName
                ]}>
                  {item}
                </Text>
                {formData.treatmentType === item && (
                  <FastImage
                    source={icons.check || icons.account}
                    style={styles.checkIcon}
                    tintColor="#10B981"
                  />
                )}
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.modalList}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader
        title="Add Treatment Record"
        showBack={true}
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>

          {/* Livestock Selection */}
          {renderFormGroup('Select Livestock', (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Select Animal/Livestock <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.livestockSelector,
                  errors.livestock && styles.inputError,
                  isLoading && styles.inputDisabled
                ]}
                onPress={() => !isLoading && setShowLivestockPicker(true)}
                disabled={isLoading}>
                {selectedLivestock ? (
                  <View style={styles.selectedLivestockDisplay}>
                    <View style={styles.selectedLivestockIcon}>
                      <FastImage
                        source={icons.livestock || icons.account}
                        style={styles.selectedLivestockIconImage}
                        tintColor="#10B981"
                      />
                    </View>
                    <View style={styles.selectedLivestockInfo}>
                      <Text style={styles.selectedLivestockName}>
                        {formatLivestockDisplayName(selectedLivestock)}
                      </Text>
                      <Text style={styles.selectedLivestockSubtitle}>
                        {formatLivestockSubtitle(selectedLivestock)}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.placeholderText}>
                    {loadingLivestock ? 'Loading livestock...' : 'Tap to select livestock'}
                  </Text>
                )}
                <FastImage
                  source={icons.dropdown || icons.account}
                  style={styles.dropdownIcon}
                  tintColor="#6B7280"
                />
              </TouchableOpacity>
              {errors.livestock && (
                <Text style={styles.errorText}>{errors.livestock}</Text>
              )}
            </View>
          ))}

          {/* Health Event Information */}
          {renderFormGroup('Health Event Information', (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Health Event Date <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[styles.dateInput, isLoading && styles.inputDisabled]}
                  onPress={() => !isLoading && setShowHealthEventDatePicker(true)}
                  disabled={isLoading}>
                  <Text style={styles.dateText}>
                    {formData.healthEventDate.toLocaleDateString()}
                  </Text>
                  <FastImage source={icons.calendar} style={styles.calendarIcon} />
                </TouchableOpacity>
              </View>

              {renderInput('Health Event Symptoms', 'healthEventSymptoms', {
                required: true,
                placeholder: 'Describe the symptoms observed...',
                multiline: true,
                numberOfLines: 3
              })}

              {renderInput('Diagnosis', 'diagnosis', {
                required: true,
                placeholder: 'Enter the diagnosis...'
              })}
            </>
          ))}

          {/* Treatment Information */}
          {renderFormGroup('Treatment Information', (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Treatment Type <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[
                    styles.treatmentTypeSelector,
                    errors.treatmentType && styles.inputError,
                    isLoading && styles.inputDisabled
                  ]}
                  onPress={() => !isLoading && setShowTreatmentTypePicker(true)}
                  disabled={isLoading}>
                  <Text style={[
                    styles.treatmentTypeText,
                    !formData.treatmentType && styles.placeholderText
                  ]}>
                    {formData.treatmentType || 'Select treatment type'}
                  </Text>
                  <FastImage
                    source={icons.dropdown || icons.account}
                    style={styles.dropdownIcon}
                    tintColor="#6B7280"
                  />
                </TouchableOpacity>
                {errors.treatmentType && (
                  <Text style={styles.errorText}>{errors.treatmentType}</Text>
                )}
              </View>

              {renderInput('Treatment Description', 'treatmentDescription', {
                required: true,
                placeholder: 'Describe the treatment given...',
                multiline: true,
                numberOfLines: 3
              })}

              {renderInput('Drug Administered', 'drugAdministered', {
                required: true,
                placeholder: 'e.g., Penicillin, Ivermectin, etc.'
              })}

              {renderInput('Dosage Administered', 'dosageAdministered', {
                required: true,
                placeholder: 'e.g., 5ml, 2 tablets, etc.'
              })}

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Date Administered <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[styles.dateInput, isLoading && styles.inputDisabled]}
                  onPress={() => !isLoading && setShowDateAdministeredPicker(true)}
                  disabled={isLoading}>
                  <Text style={styles.dateText}>
                    {formData.dateAdministered.toLocaleDateString()}
                  </Text>
                  <FastImage source={icons.calendar} style={styles.calendarIcon} />
                </TouchableOpacity>
              </View>
            </>
          ))}

          {/* Medical Officer Information */}
          {renderFormGroup('Medical Officer Information', (
            <>
              {renderInput('Medical Officer Name', 'medicalOfficerName', {
                required: true,
                placeholder: 'e.g., Dr. Smith, Vet John Doe'
              })}
              {renderInput('License ID', 'licenseId', {
                placeholder: 'e.g., VET12345 (optional)'
              })}
              {renderInput('Farmer Witness Name', 'farmerWitnessName', {
                placeholder: 'Name of farmer witness (optional)'
              })}
            </>
          ))}

          {/* Cost Information */}
          {renderFormGroup('Cost Information (Optional)', (
            <>
              {renderInput('Cost of Drugs', 'costOfDrugs', {
                keyboardType: 'numeric',
                placeholder: '25.00'
              })}
              {renderInput('Cost of Service', 'costOfService', {
                keyboardType: 'numeric',
                placeholder: '100.00'
              })}
            </>
          ))}

          {/* Additional Notes */}
          {renderFormGroup('Additional Information', (
            renderInput('Notes', 'notes', {
              placeholder: 'Any additional notes or observations...',
              multiline: true,
              numberOfLines: 4
            })
          ))}

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (isLoading || !selectedLivestock) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isLoading || !selectedLivestock}>
            <LinearGradient
              colors={
                isLoading || !selectedLivestock
                  ? ['#9CA3AF', '#6B7280']
                  : ['#10B981', '#059669']
              }
              style={styles.submitGradient}>
              <Text style={styles.submitText}>
                {isLoading ? 'Adding Treatment Record...' : 'Add Treatment Record'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Pickers */}
      {showHealthEventDatePicker && (
        <DateTimePicker
          value={formData.healthEventDate}
          mode="date"
          display="default"
          onChange={handleHealthEventDateChange}
          maximumDate={new Date()}
        />
      )}

      {showDateAdministeredPicker && (
        <DateTimePicker
          value={formData.dateAdministered}
          mode="date"
          display="default"
          onChange={handleDateAdministeredChange}
          maximumDate={new Date()}
        />
      )}

      {/* Modals */}
      {renderLivestockPicker()}
      {renderTreatmentTypePicker()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // Form Groups
  formGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  groupContainer: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 6,
  },

  // Input Styles
  inputContainer: {
    marginBottom: 20,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    fontWeight: '500',
  },
  textAreaInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputDisabled: {
    opacity: 0.6,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    fontWeight: '500',
  },

  // Livestock Selector
  livestockSelector: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 56,
  },
  selectedLivestockDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedLivestockIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedLivestockIconImage: {
    width: 20,
    height: 20,
  },
  selectedLivestockInfo: {
    flex: 1,
  },
  selectedLivestockName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  selectedLivestockSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  placeholderText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  dropdownIcon: {
    width: 20,
    height: 20,
  },

  // Treatment Type Selector
  treatmentTypeSelector: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 56,
  },
  treatmentTypeText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },

  // Date Input
  dateInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  calendarIcon: {
    width: 20,
    height: 20,
    tintColor: '#6B7280',
  },

  // Submit Button
  submitButton: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  submitButtonDisabled: {
    shadowOpacity: 0.1,
  },
  submitGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#6B7280',
    fontWeight: '300',
  },
  modalList: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },

  // Livestock Item
  livestockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  selectedLivestockItem: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
  },
  livestockIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  livestockIconImage: {
    width: 24,
    height: 24,
  },
  livestockInfo: {
    flex: 1,
  },
  livestockName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  livestockSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  checkIcon: {
    width: 24,
    height: 24,
    marginLeft: 12,
  },

  bottomSpace: {
    height: 40,
  },
});

export default AddCurativeTreatmentRecords;