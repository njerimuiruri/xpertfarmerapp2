import React, { useState } from 'react';
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
} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { icons } from '../../../constants';
import { COLORS } from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';
// Import your vaccination service
import { createVaccination, validateVaccinationData } from '../../../services/healthservice';

const { width } = Dimensions.get('window');

const AddVaccineRecords = ({ navigation, route }) => {
  const { animalId, animalData, farmId } = route.params;

  // Form state
  const [formData, setFormData] = useState({
    animalIdOrFlockId: animalId,
    vaccinationAgainst: '',
    drugAdministered: '',
    dateAdministered: new Date(),
    dosage: '',
    costOfVaccine: '',
    administeredBy: '',
    practiceId: '',
    costOfService: '',
    farmId: farmId || animalId,
    livestockId: animalId,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.vaccinationAgainst.trim()) {
      newErrors.vaccinationAgainst = 'Please specify what the vaccination is against';
    }

    if (!formData.drugAdministered.trim()) {
      newErrors.drugAdministered = 'Please enter the drug administered';
    }

    if (!formData.dosage || isNaN(parseFloat(formData.dosage))) {
      newErrors.dosage = 'Please enter a valid dosage';
    }

    if (!formData.administeredBy.trim()) {
      newErrors.administeredBy = 'Please enter who administered the vaccine';
    }

    if (formData.costOfVaccine && isNaN(parseFloat(formData.costOfVaccine))) {
      newErrors.costOfVaccine = 'Please enter a valid cost';
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
        vaccinationAgainst: formData.vaccinationAgainst.trim(),
        drugAdministered: formData.drugAdministered.trim(),
        dateAdministered: formData.dateAdministered.toISOString(),
        dosage: parseFloat(formData.dosage),
        costOfVaccine: formData.costOfVaccine ? parseFloat(formData.costOfVaccine) : 0,
        administeredBy: formData.administeredBy.trim(),
        practiceId: formData.practiceId.trim(),
        costOfService: formData.costOfService ? parseFloat(formData.costOfService) : 0,
      };

      const validation = validateVaccinationData(payload);
      if (!validation.isValid) {
        Alert.alert('Validation Error', validation.errors.join('\n'));
        return;
      }

      console.log('Creating vaccination with payload:', payload);

      const result = await createVaccination(animalId, payload);

      if (result.error) {
        Alert.alert('Error', result.error);
        return;
      }

      Alert.alert(
        'Success',
        'Vaccine record has been added successfully!',
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
      console.error('Error adding vaccine:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please check your connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
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
        editable={!isLoading}
      />
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader
        title="Add Vaccine Record"
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

          {/* Animal Info Header */}
          <LinearGradient
            colors={['#FFFFFF', '#F8FAFC']}
            style={styles.animalInfoCard}>
            <View style={styles.animalCardHeader}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.animalAvatarContainer}>
                <FastImage
                  source={icons.livestock || icons.account}
                  style={styles.animalAvatar}
                  tintColor="#FFFFFF"
                />
              </LinearGradient>
              <View style={styles.animalInfo}>
                <Text style={styles.animalName}>{animalData?.title || 'Animal'}</Text>
                <Text style={styles.animalId}>ID: {animalData?.idNumber || animalId}</Text>
                <Text style={styles.farmId}>Farm ID: {farmId}</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Vaccine Information */}
          {renderFormGroup('Vaccine Information', (
            <>
              {renderInput('Vaccination Against', 'vaccinationAgainst', {
                required: true,
                placeholder: 'e.g., Newcastle Disease, Fowl Pox, etc.'
              })}
              {renderInput('Drug Administered', 'drugAdministered', {
                required: true,
                placeholder: 'e.g., Lasota, La Sota, etc.'
              })}
              {renderInput('Dosage', 'dosage', {
                required: true,
                placeholder: 'e.g., 0.5ml, 1 drop, etc.'
              })}
            </>
          ))}

          {/* Administration Details */}
          {renderFormGroup('Administration Details', (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Date Administered <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[styles.dateInput, isLoading && styles.inputDisabled]}
                  onPress={() => !isLoading && setShowDatePicker(true)}
                  disabled={isLoading}>
                  <Text style={styles.dateText}>
                    {formData.dateAdministered.toLocaleDateString()}
                  </Text>
                  <FastImage source={icons.calendar} style={styles.calendarIcon} />
                </TouchableOpacity>
              </View>

              {renderInput('Administered By', 'administeredBy', {
                required: true,
                placeholder: 'e.g., Dr. Smith, Farm Manager, etc.'
              })}
              {renderInput('Practice ID', 'practiceId', {
                placeholder: 'e.g., VET12345 (optional)'
              })}
            </>
          ))}

          {/* Cost Information */}
          {renderFormGroup('Cost Information (Optional)', (
            <>
              {renderInput('Cost of Vaccine', 'costOfVaccine', {
                keyboardType: 'numeric',
                placeholder: '25.00'
              })}
              {renderInput('Cost of Service', 'costOfService', {
                keyboardType: 'numeric',
                placeholder: '100.00'
              })}
            </>
          ))}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}>
            <LinearGradient
              colors={isLoading ? ['#9CA3AF', '#6B7280'] : ['#10B981', '#059669']}
              style={styles.submitGradient}>
              <Text style={styles.submitText}>
                {isLoading ? 'Adding Vaccine Record...' : 'Add Vaccine Record'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.dateAdministered}
          mode="date"
          display="default"
          onChange={handleDateChange}
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
  },
  farmId: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '400',
    marginTop: 2,
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

  bottomSpace: {
    height: 40,
  },
});

export default AddVaccineRecords;