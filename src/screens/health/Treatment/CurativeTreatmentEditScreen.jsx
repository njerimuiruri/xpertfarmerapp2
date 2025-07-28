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
  ActivityIndicator,
} from 'react-native';
import {
  useToast
} from 'native-base';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { icons } from '../../../constants';
import { COLORS } from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';
import {
  getTreatmentById,
  updateTreatment,
  validateTreatmentData
} from '../../../services/healthservice';
import { getLivestockForActiveFarm } from '../../../services/livestock';

const { width } = Dimensions.get('window');

const CurativeTreatmentEditScreen = ({ navigation, route }) => {
  const { recordId, animalId, animalData } = route.params;
  const toast = useToast();

  // Form state
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
    livestockId: '',
  });

  const [livestock, setLivestock] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEventDatePicker, setShowEventDatePicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    Promise.all([fetchTreatmentData(), loadLivestock()]);
  }, [recordId]);

  const loadLivestock = async () => {
    try {
      const result = await getLivestockForActiveFarm();
      if (Array.isArray(result)) {
        setLivestock(result);
      } else {
        setLivestock([]);
      }
    } catch (error) {
      console.error('Failed to load livestock:', error);
      setLivestock([]);
    }
  };

  const getAnimalInfo = (animalId) => {
    return livestock.find(animal => animal.id === animalId);
  };

  const formatAnimalDisplayName = (animal) => {
    if (!animal) return 'Unknown Animal';

    if (animal.category === 'poultry' && animal.poultry) {
      return `${animal.type.toUpperCase()} - Flock ID: ${animal.poultry.flockId || 'N/A'}`;
    } else if (animal.category === 'mammal' && animal.mammal) {
      return `${animal.type.toUpperCase()} - ID: ${animal.mammal.idNumber || 'N/A'}`;
    }
    return `${animal.type.toUpperCase()} - ID: ${animal.id}`;
  };

  const fetchTreatmentData = async () => {
    try {
      setIsLoadingData(true);
      const result = await getTreatmentById(recordId);

      if (result.error) {
        Alert.alert('Error', result.error);
        navigation.goBack();
        return;
      }

      const treatmentData = result.data;
      setOriginalData(treatmentData);

      setFormData({
        animalIdOrFlockId: treatmentData.animalIdOrFlockId || '',
        healthEventDate: treatmentData.healthEventDate
          ? new Date(treatmentData.healthEventDate)
          : new Date(),
        healthEventSymptoms: treatmentData.healthEventSymptoms || '',
        diagnosis: treatmentData.diagnosis || '',
        treatmentType: treatmentData.treatmentType || '',
        treatmentDescription: treatmentData.treatmentDescription || '',
        drugAdministered: treatmentData.drugAdministered || '',
        dateAdministered: treatmentData.dateAdministered
          ? new Date(treatmentData.dateAdministered)
          : new Date(),
        dosageAdministered: treatmentData.dosageAdministered?.toString() || '',
        costOfDrugs: treatmentData.costOfDrugs?.toString() || '',
        medicalOfficerName: treatmentData.medicalOfficerName || '',
        licenseId: treatmentData.licenseId || '',
        costOfService: treatmentData.costOfService?.toString() || '',
        farmerWitnessName: treatmentData.farmerWitnessName || '',
        notes: treatmentData.notes || '',
        livestockId: treatmentData.livestockId || animalId,
      });

      console.log('Fetched treatment data:', treatmentData);
    } catch (error) {
      console.error('Error fetching treatment data:', error);
      Alert.alert('Error', 'Failed to load treatment data. Please try again.');
      navigation.goBack();
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, dateAdministered: selectedDate }));
    }
  };

  const handleEventDateChange = (event, selectedDate) => {
    setShowEventDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, healthEventDate: selectedDate }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.healthEventSymptoms.trim()) {
      newErrors.healthEventSymptoms = 'Health event symptoms are required';
    }

    if (!formData.diagnosis.trim()) {
      newErrors.diagnosis = 'Diagnosis is required';
    }

    if (!formData.treatmentType.trim()) {
      newErrors.treatmentType = 'Treatment type is required';
    }

    if (!formData.treatmentDescription.trim()) {
      newErrors.treatmentDescription = 'Treatment description is required';
    }

    if (!formData.drugAdministered.trim()) {
      newErrors.drugAdministered = 'Drug administered is required';
    }

    if (!formData.dosageAdministered || isNaN(parseFloat(formData.dosageAdministered))) {
      newErrors.dosageAdministered = 'Please enter a valid dosage';
    }

    if (!formData.medicalOfficerName.trim()) {
      newErrors.medicalOfficerName = 'Medical officer name is required';
    }

    if (formData.costOfDrugs && isNaN(parseFloat(formData.costOfDrugs))) {
      newErrors.costOfDrugs = 'Please enter a valid cost for drugs';
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
        livestockId: formData.livestockId || animalId,
      };

      const validation = validateTreatmentData(payload);
      if (!validation.isValid) {
        Alert.alert('Validation Error', validation.errors.join('\n'));
        return;
      }

      console.log('Updating treatment with payload:', payload);

      const result = await updateTreatment(recordId, payload);

      if (result.error) {
        Alert.alert('Error', result.error);
        return;
      }

      toast.show({
        title: 'Success',
        description: 'Treatment record has been updated successfully!',
        status: 'success',
        placement: 'top',
        duration: 3000,
        backgroundColor: COLORS.green2,
        color: COLORS.white,
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error updating treatment:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please check your connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Form',
      'Are you sure you want to reset all changes? This will restore the original values.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            if (originalData) {
              setFormData({
                animalIdOrFlockId: originalData.animalIdOrFlockId || '',
                healthEventDate: originalData.healthEventDate
                  ? new Date(originalData.healthEventDate)
                  : new Date(),
                healthEventSymptoms: originalData.healthEventSymptoms || '',
                diagnosis: originalData.diagnosis || '',
                treatmentType: originalData.treatmentType || '',
                treatmentDescription: originalData.treatmentDescription || '',
                drugAdministered: originalData.drugAdministered || '',
                dateAdministered: originalData.dateAdministered
                  ? new Date(originalData.dateAdministered)
                  : new Date(),
                dosageAdministered: originalData.dosageAdministered?.toString() || '',
                costOfDrugs: originalData.costOfDrugs?.toString() || '',
                medicalOfficerName: originalData.medicalOfficerName || '',
                licenseId: originalData.licenseId || '',
                costOfService: originalData.costOfService?.toString() || '',
                farmerWitnessName: originalData.farmerWitnessName || '',
                notes: originalData.notes || '',
                livestockId: originalData.livestockId || animalId,
              });
              setErrors({});
            }
          },
        },
      ]
    );
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
        style={[styles.textInput, errors[field] && styles.inputError]}
        value={formData[field]?.toString()}
        onChangeText={(value) => handleInputChange(field, value)}
        placeholder={options.placeholder || `Enter ${label.toLowerCase()}`}
        keyboardType={options.keyboardType || 'default'}
        multiline={options.multiline}
        numberOfLines={options.numberOfLines || 1}
        placeholderTextColor="#9CA3AF"
        editable={!isLoading && !isLoadingData}
      />
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

  const renderDateInput = (label, field, showPicker, setShowPicker, onDateChange, required = false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TouchableOpacity
        style={[styles.dateInput, (isLoading || isLoadingData) && styles.inputDisabled]}
        onPress={() => !isLoading && !isLoadingData && setShowPicker(true)}
        disabled={isLoading || isLoadingData}>
        <Text style={styles.dateText}>
          {formData[field].toLocaleDateString()}
        </Text>
        <FastImage source={icons.calendar} style={styles.calendarIcon} />
      </TouchableOpacity>
    </View>
  );

  if (isLoadingData) {
    return (
      <SafeAreaView style={styles.container}>
        <SecondaryHeader
          title="Edit Treatment Record"
          showBack={true}
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading treatment data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const animal = getAnimalInfo(formData.livestockId || animalId);

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader
        title="Edit Treatment Record"
        showBack={true}
        onBack={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity onPress={handleReset} disabled={isLoading}>
            <FastImage
              source={icons.refresh || icons.reload}
              style={[styles.resetIcon, isLoading && styles.iconDisabled]}
              tintColor="#6B7280"
            />
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>

          <LinearGradient
            colors={['#FFFFFF', '#F8FAFC']}
            style={styles.animalInfoCard}>
            <View style={styles.animalCardHeader}>
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                style={styles.animalAvatarContainer}>
                <FastImage
                  source={icons.health || icons.medical || icons.account}
                  style={styles.animalAvatar}
                  tintColor="#FFFFFF"
                />
              </LinearGradient>
              <View style={styles.animalInfo}>
                <Text style={styles.animalName}>{formatAnimalDisplayName(animal)}</Text>
                <Text style={styles.animalId}>
                  ID: {animal?.mammal?.idNumber || animal?.poultry?.flockId || animal?.id || 'N/A'}
                </Text>
              </View>
            </View>
          </LinearGradient>

          {renderFormGroup('Health Event Information', (
            <>
              {renderDateInput('Health Event Date', 'healthEventDate', showEventDatePicker, setShowEventDatePicker, handleEventDateChange, true)}
              {renderInput('Health Event Symptoms', 'healthEventSymptoms', {
                required: true,
                multiline: true,
                numberOfLines: 3,
                placeholder: 'Describe the symptoms observed...'
              })}
              {renderInput('Diagnosis', 'diagnosis', {
                required: true,
                placeholder: 'Enter the diagnosis...'
              })}
            </>
          ))}

          {renderFormGroup('Treatment Information', (
            <>
              {renderInput('Treatment Type', 'treatmentType', {
                required: true,
                placeholder: 'e.g., Antibiotic, Antiviral, Surgery, etc.'
              })}
              {renderInput('Treatment Description', 'treatmentDescription', {
                required: true,
                multiline: true,
                numberOfLines: 3,
                placeholder: 'Describe the treatment given...'
              })}
              {renderInput('Drug Administered', 'drugAdministered', {
                required: true,
                placeholder: 'e.g., Penicillin, Oxytetracycline, etc.'
              })}
              {renderInput('Dosage Administered', 'dosageAdministered', {
                required: true,
                placeholder: 'e.g., 5ml, 2 tablets, etc.'
              })}
            </>
          ))}

          {renderFormGroup('Administration Details', (
            <>
              {renderDateInput('Date Administered', 'dateAdministered', showDatePicker, setShowDatePicker, handleDateChange, true)}
              {renderInput('Medical Officer Name', 'medicalOfficerName', {
                required: true,
                placeholder: 'e.g., Dr. John Smith'
              })}
              {renderInput('License ID', 'licenseId', {
                placeholder: 'e.g., VET12345 (optional)'
              })}
              {renderInput('Farmer Witness Name', 'farmerWitnessName', {
                placeholder: 'Name of farmer witness (optional)'
              })}
            </>
          ))}

          {renderFormGroup('Cost Information (Optional)', (
            <>
              {renderInput('Cost of Drugs', 'costOfDrugs', {
                keyboardType: 'numeric',
                placeholder: '50.00'
              })}
              {renderInput('Cost of Service', 'costOfService', {
                keyboardType: 'numeric',
                placeholder: '200.00'
              })}
            </>
          ))}

          {renderFormGroup('Additional Notes', (
            <>
              {renderInput('Notes', 'notes', {
                multiline: true,
                numberOfLines: 4,
                placeholder: 'Any additional notes or observations...'
              })}
            </>
          ))}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.cancelButton, isLoading && styles.buttonDisabled]}
              onPress={() => navigation.goBack()}
              disabled={isLoading}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}>
              <LinearGradient
                colors={isLoading ? ['#9CA3AF', '#6B7280'] : ['#EF4444', '#DC2626']}
                style={styles.submitGradient}>
                <Text style={styles.submitText}>
                  {isLoading ? 'Updating...' : 'Update Record'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </KeyboardAvoidingView>

      {showDatePicker && (
        <DateTimePicker
          value={formData.dateAdministered}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {showEventDatePicker && (
        <DateTimePicker
          value={formData.healthEventDate}
          mode="date"
          display="default"
          onChange={handleEventDateChange}
          maximumDate={new Date()}
        />
      )}
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

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Header Icons
  resetIcon: {
    width: 24,
    height: 24,
  },
  iconDisabled: {
    opacity: 0.5,
  },

  // Animal Info Card
  animalInfoCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  animalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  animalAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  animalAvatar: {
    width: 28,
    height: 28,
  },
  animalInfo: {
    flex: 1,
  },
  animalName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  animalId: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 8,
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

  // Button Container
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },

  // Cancel Button
  cancelButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },

  // Submit Button
  submitButton: {
    flex: 2,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#EF4444',
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
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  buttonDisabled: {
    opacity: 0.6,
  },
  bottomSpace: {
    height: 40,
  },
});

export default CurativeTreatmentEditScreen;