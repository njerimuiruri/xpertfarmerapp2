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
  getGeneticDisorderRecordById,
  updateGeneticDisorderRecord,
  validateGeneticDisorderData
} from '../../../services/healthservice';
import { getLivestockForActiveFarm } from '../../../services/livestock';

const { width } = Dimensions.get('window');

const GeneticDisorderEditScreen = ({ navigation, route }) => {
  const { recordId, animalId, animalData } = route.params;
  const toast = useToast();

  // Form state
  const [formData, setFormData] = useState({
    animalIdOrFlockId: '',
    nameOfCondition: '',
    remedy: '',
    dateRecorded: new Date(),
    administeredByType: '',
    administeredByName: '',
    practiceId: '',
    technicianId: '',
    livestockId: '',
  });

  const [livestock, setLivestock] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [originalData, setOriginalData] = useState(null);

  // Administrator type options
  const administratorTypes = [
    'Veterinary',
    'Farm Manager',
    'Technician',
    'Owner',
    'Other'
  ];

  useEffect(() => {
    Promise.all([fetchGeneticDisorderData(), loadLivestock()]);
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

  const fetchGeneticDisorderData = async () => {
    try {
      setIsLoadingData(true);
      const result = await getGeneticDisorderRecordById(recordId);

      if (result.error) {
        Alert.alert('Error', result.error);
        navigation.goBack();
        return;
      }

      const geneticData = result.data;
      setOriginalData(geneticData);

      setFormData({
        animalIdOrFlockId: geneticData.animalIdOrFlockId || '',
        nameOfCondition: geneticData.nameOfCondition || '',
        remedy: geneticData.remedy || '',
        dateRecorded: geneticData.dateRecorded
          ? new Date(geneticData.dateRecorded)
          : new Date(),
        administeredByType: geneticData.administeredByType || '',
        administeredByName: geneticData.administeredByName || '',
        practiceId: geneticData.practiceId || '',
        technicianId: geneticData.technicianId || '',
        livestockId: geneticData.livestockId || animalId,
      });

      console.log('Fetched genetic disorder data:', geneticData);
    } catch (error) {
      console.error('Error fetching genetic disorder data:', error);
      Alert.alert('Error', 'Failed to load genetic disorder data. Please try again.');
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
      setFormData(prev => ({ ...prev, dateRecorded: selectedDate }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nameOfCondition.trim()) {
      newErrors.nameOfCondition = 'Please enter the name of the genetic condition';
    }

    if (!formData.remedy.trim()) {
      newErrors.remedy = 'Please enter the remedy or treatment';
    }

    if (!formData.administeredByType.trim()) {
      newErrors.administeredByType = 'Please select who administered the treatment';
    }

    if (!formData.administeredByName.trim()) {
      newErrors.administeredByName = 'Please enter the name of the administrator';
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
        nameOfCondition: formData.nameOfCondition.trim(),
        remedy: formData.remedy.trim(),
        dateRecorded: formData.dateRecorded.toISOString(),
        administeredByType: formData.administeredByType.trim(),
        administeredByName: formData.administeredByName.trim(),
        practiceId: formData.practiceId.trim(),
        technicianId: formData.technicianId.trim(),
        livestockId: formData.livestockId || animalId,
      };

      const validation = validateGeneticDisorderData(payload);
      if (!validation.isValid) {
        Alert.alert('Validation Error', validation.errors.join('\n'));
        return;
      }

      console.log('Updating genetic disorder with payload:', payload);

      const result = await updateGeneticDisorderRecord(recordId, payload);

      if (result.error) {
        Alert.alert('Error', result.error);
        return;
      }

      toast.show({
        title: 'Success',
        description: 'Genetic disorder record has been updated successfully!',
        status: 'success',
        placement: 'top',
        duration: 3000,
        backgroundColor: COLORS.green2,
        color: COLORS.white,
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error updating genetic disorder:', error);
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
                nameOfCondition: originalData.nameOfCondition || '',
                remedy: originalData.remedy || '',
                dateRecorded: originalData.dateRecorded
                  ? new Date(originalData.dateRecorded)
                  : new Date(),
                administeredByType: originalData.administeredByType || '',
                administeredByName: originalData.administeredByName || '',
                practiceId: originalData.practiceId || '',
                technicianId: originalData.technicianId || '',
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

  const renderPickerInput = (label, field, options, required = false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <View style={styles.pickerContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.pickerOption,
              formData[field] === option && styles.pickerOptionSelected,
              (isLoading || isLoadingData) && styles.inputDisabled
            ]}
            onPress={() => !isLoading && !isLoadingData && handleInputChange(field, option)}
            disabled={isLoading || isLoadingData}>
            <Text style={[
              styles.pickerOptionText,
              formData[field] === option && styles.pickerOptionTextSelected
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

  if (isLoadingData) {
    return (
      <SafeAreaView style={styles.container}>
        <SecondaryHeader
          title="Edit Genetic Record"
          showBack={true}
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading genetic disorder data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Get the animal info using the same method as VaccineRecordsScreen
  const animal = getAnimalInfo(formData.livestockId || animalId);

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader
        title="Edit Genetic Record"
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
                colors={['#DC2626', '#B91C1C']}
                style={styles.animalAvatarContainer}>
                <FastImage
                  source={icons.livestock || icons.account}
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

          {renderFormGroup('Genetic Condition Information', (
            <>
              {renderInput('Name of Condition', 'nameOfCondition', {
                required: true,
                placeholder: 'e.g., Osteogenesis Imperfecta, Hip Dysplasia, etc.'
              })}
              {renderInput('Remedy/Treatment', 'remedy', {
                required: true,
                multiline: true,
                numberOfLines: 3,
                placeholder: 'e.g., Administer 1ml of antibiotic every 8 hours'
              })}
            </>
          ))}

          {renderFormGroup('Date & Administration', (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Date Recorded <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[styles.dateInput, (isLoading || isLoadingData) && styles.inputDisabled]}
                  onPress={() => !isLoading && !isLoadingData && setShowDatePicker(true)}
                  disabled={isLoading || isLoadingData}>
                  <Text style={styles.dateText}>
                    {formData.dateRecorded.toLocaleDateString()}
                  </Text>
                  <FastImage source={icons.calendar} style={styles.calendarIcon} />
                </TouchableOpacity>
              </View>

              {renderPickerInput('Administered By Type', 'administeredByType', administratorTypes, true)}

              {renderInput('Administrator Name', 'administeredByName', {
                required: true,
                placeholder: 'e.g., Dr. Smith, John Doe, etc.'
              })}
            </>
          ))}

          {renderFormGroup('Additional Information (Optional)', (
            <>
              {renderInput('Practice ID', 'practiceId', {
                placeholder: 'e.g., VET12345'
              })}
              {renderInput('Technician ID', 'technicianId', {
                placeholder: 'e.g., TECH12345'
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
                colors={isLoading ? ['#9CA3AF', '#6B7280'] : ['#DC2626', '#B91C1C']}
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
          value={formData.dateRecorded}
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

  // Picker Styles
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  pickerOptionSelected: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  pickerOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  pickerOptionTextSelected: {
    color: '#DC2626',
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
    shadowColor: '#DC2626',
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

export default GeneticDisorderEditScreen;