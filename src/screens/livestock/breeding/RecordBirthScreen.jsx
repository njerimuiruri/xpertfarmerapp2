import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import DateTimePicker from '@react-native-community/datetimepicker';
import { icons } from '../../../constants';
import { COLORS } from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';
import { recordBirth } from '../../../services/breeding';

const RecordBirthScreen = ({ navigation, route }) => {
  const { breedingRecord } = route.params;

  // Form state
  const [formData, setFormData] = useState({
    birthDate: new Date(),
    deliveryMethod: 'Natural Birth',
    youngOnes: 1,
    birthWeight: '',
    litterWeight: '',
    offspringSex: '',
    notes: '',
  });

  // Offspring state
  const [offspring, setOffspring] = useState([
    {
      offspringId: '',
      sex: 'Male',
      birthWeight: '',
      notes: '',
    }
  ]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [errors, setErrors] = useState({});

  const deliveryMethods = [
    'Natural Birth',
    'Assisted Delivery',
    'Cesarean Section',
    'Veterinary Assistance Required'
  ];

  const sexOptions = ['Male', 'Female'];

  useEffect(() => {
    // Generate initial offspring ID
    generateOffspringId(0);
  }, []);

  const generateOffspringId = (index) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const animalType = breedingRecord.damInfo?.type || 'ANIMAL';
    const sequential = String(index + 1).padStart(3, '0');

    const id = `${animalType.toUpperCase()}-${year}${month}${day}-${sequential}`;

    setOffspring(prev => prev.map((item, idx) =>
      idx === index ? { ...item, offspringId: id } : item
    ));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }

    // Auto-update offspring count when youngOnes changes
    if (field === 'youngOnes') {
      const count = parseInt(value) || 1;
      updateOffspringCount(count);
    }
  };

  const updateOffspringCount = (count) => {
    const currentCount = offspring.length;

    if (count > currentCount) {
      // Add new offspring
      const newOffspring = [];
      for (let i = currentCount; i < count; i++) {
        newOffspring.push({
          offspringId: '',
          sex: 'Male',
          birthWeight: '',
          notes: '',
        });
      }
      setOffspring(prev => [...prev, ...newOffspring]);

      // Generate IDs for new offspring
      setTimeout(() => {
        for (let i = currentCount; i < count; i++) {
          generateOffspringId(i);
        }
      }, 100);
    } else if (count < currentCount) {
      // Remove excess offspring
      setOffspring(prev => prev.slice(0, count));
    }
  };

  const handleOffspringChange = (index, field, value) => {
    setOffspring(prev => prev.map((item, idx) =>
      idx === index ? { ...item, [field]: value } : item
    ));
  };

  const addOffspring = () => {
    const newIndex = offspring.length;
    setOffspring(prev => [...prev, {
      offspringId: '',
      sex: 'Male',
      birthWeight: '',
      notes: '',
    }]);

    setFormData(prev => ({ ...prev, youngOnes: offspring.length + 1 }));

    setTimeout(() => generateOffspringId(newIndex), 100);
  };

  const removeOffspring = (index) => {
    if (offspring.length > 1) {
      setOffspring(prev => prev.filter((_, idx) => idx !== index));
      setFormData(prev => ({ ...prev, youngOnes: offspring.length - 1 }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.birthDate) {
      newErrors.birthDate = 'Birth date is required';
    }

    if (!formData.youngOnes || formData.youngOnes < 1) {
      newErrors.youngOnes = 'Number of young ones must be at least 1';
    }

    if (formData.birthWeight && isNaN(parseFloat(formData.birthWeight))) {
      newErrors.birthWeight = 'Birth weight must be a valid number';
    }

    if (formData.litterWeight && isNaN(parseFloat(formData.litterWeight))) {
      newErrors.litterWeight = 'Litter weight must be a valid number';
    }

    offs
    pring.forEach((item, index) => {
      if (!item.offspringId.trim()) {
        newErrors[`offspring_${index}_id`] = 'Offspring ID is required';
      }
      if (item.birthWeight && isNaN(parseFloat(item.birthWeight))) {
        newErrors[`offspring_${index}_weight`] = 'Birth weight must be a valid number';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please correct the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        birthDate: formData.birthDate.toISOString(),
        deliveryMethod: formData.deliveryMethod,
        youngOnes: parseInt(formData.youngOnes),
        birthWeight: formData.birthWeight ? parseFloat(formData.birthWeight) : null,
        litterWeight: formData.litterWeight ? parseFloat(formData.litterWeight) : null,
        offspringSex: generateOffspringSexSummary(),
        notes: formData.notes,
        offspring: offspring.map(item => ({
          offspringId: item.offspringId.trim(),
          sex: item.sex,
          birthWeight: item.birthWeight ? parseFloat(item.birthWeight) : null,
          notes: item.notes.trim(),
        })),
      };

      console.log('Recording birth with payload:', JSON.stringify(payload, null, 2));

      const { data, error } = await recordBirth(breedingRecord.id, payload);

      if (error) {
        Alert.alert('Error', error);
        return;
      }

      Alert.alert(
        'Success',
        'Birth recorded successfully! The breeding record status has been updated.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
              navigation.navigate('BreedingModuleLandingScreen');
            },
          },
        ]
      );

    } catch (error) {
      console.error('Error recording birth:', error);
      Alert.alert('Error', 'Failed to record birth. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateOffspringSexSummary = () => {
    const sexCounts = offspring.reduce((acc, item) => {
      acc[item.sex.toLowerCase()] = (acc[item.sex.toLowerCase()] || 0) + 1;
      return acc;
    }, {});

    const parts = [];
    if (sexCounts.male) parts.push(`${sexCounts.male} male${sexCounts.male > 1 ? 's' : ''}`);
    if (sexCounts.female) parts.push(`${sexCounts.female} female${sexCounts.female > 1 ? 's' : ''}`);

    return parts.join(', ') || '0';
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, birthDate: selectedDate }));
    }
  };

  const renderDeliveryMethodModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showDeliveryModal}
      onRequestClose={() => setShowDeliveryModal(false)}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Delivery Method</Text>
          {deliveryMethods.map((method) => (
            <TouchableOpacity
              key={method}
              style={[
                styles.optionItem,
                formData.deliveryMethod === method && styles.selectedOption,
              ]}
              onPress={() => {
                handleInputChange('deliveryMethod', method);
                setShowDeliveryModal(false);
              }}>
              <Text
                style={[
                  styles.optionText,
                  formData.deliveryMethod === method && styles.selectedOptionText,
                ]}>
                {method}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setShowDeliveryModal(false)}>
            <Text style={styles.closeModalButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderOffspringSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Offspring Details</Text>
        <TouchableOpacity onPress={addOffspring} style={styles.addButton}>
          <FastImage source={icons.plus} style={styles.addIcon} tintColor={COLORS.green} />
          <Text style={styles.addButtonText}>Add Offspring</Text>
        </TouchableOpacity>
      </View>

      {offspring.map((item, index) => (
        <View key={index} style={styles.offspringCard}>
          <View style={styles.offspringHeader}>
            <Text style={styles.offspringTitle}>Offspring #{index + 1}</Text>
            {offspring.length > 1 && (
              <TouchableOpacity
                onPress={() => removeOffspring(index)}
                style={styles.removeButton}>
                <FastImage source={icons.remove} style={styles.removeIcon} tintColor={COLORS.red} />
              </TouchableOpacity>
            )}
          </View>



          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sex</Text>
            <View style={styles.sexContainer}>
              {sexOptions.map((sex) => (
                <TouchableOpacity
                  key={sex}
                  style={[
                    styles.sexOption,
                    item.sex === sex && styles.selectedSexOption,
                  ]}
                  onPress={() => handleOffspringChange(index, 'sex', sex)}>
                  <Text
                    style={[
                      styles.sexOptionText,
                      item.sex === sex && styles.selectedSexOptionText,
                    ]}>
                    {sex}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Birth Weight (kg)</Text>
            <TextInput
              style={[
                styles.input,
                errors[`offspring_${index}_weight`] && styles.inputError
              ]}
              value={item.birthWeight}
              onChangeText={(value) => handleOffspringChange(index, 'birthWeight', value)}
              placeholder="e.g., 35.5"
              keyboardType="decimal-pad"
            />
            {errors[`offspring_${index}_weight`] && (
              <Text style={styles.errorText}>{errors[`offspring_${index}_weight`]}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={item.notes}
              onChangeText={(value) => handleOffspringChange(index, 'notes', value)}
              placeholder="Any additional notes about this offspring..."
              multiline
              numberOfLines={3}
            />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader
        title="Record Birth"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>


          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Birth Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Birth Date *</Text>
              <TouchableOpacity
                style={[styles.input, styles.dateInput]}
                onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateText}>
                  {formData.birthDate.toLocaleDateString()}
                </Text>
                <FastImage source={icons.calendar} style={styles.dateIcon} tintColor={COLORS.gray} />
              </TouchableOpacity>
              {errors.birthDate && <Text style={styles.errorText}>{errors.birthDate}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Delivery Method</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDeliveryModal(true)}>
                <Text style={styles.inputText}>{formData.deliveryMethod}</Text>
                <FastImage source={icons.down} style={styles.dropdownIcon} tintColor={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Number of Young Ones *</Text>
                <TextInput
                  style={[styles.input, errors.youngOnes && styles.inputError]}
                  value={String(formData.youngOnes)}
                  onChangeText={(value) => handleInputChange('youngOnes', value)}
                  keyboardType="numeric"
                  placeholder="1"
                />
                {errors.youngOnes && <Text style={styles.errorText}>{errors.youngOnes}</Text>}
              </View>

              <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
                <Text style={styles.label}>Total Birth Weight (kg)</Text>
                <TextInput
                  style={[styles.input, errors.birthWeight && styles.inputError]}
                  value={formData.birthWeight}
                  onChangeText={(value) => handleInputChange('birthWeight', value)}
                  keyboardType="decimal-pad"
                  placeholder="35.5"
                />
                {errors.birthWeight && <Text style={styles.errorText}>{errors.birthWeight}</Text>}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Litter Weight (kg)</Text>
              <TextInput
                style={[styles.input, errors.litterWeight && styles.inputError]}
                value={formData.litterWeight}
                onChangeText={(value) => handleInputChange('litterWeight', value)}
                keyboardType="decimal-pad"
                placeholder="15.2"
              />
              {errors.litterWeight && <Text style={styles.errorText}>{errors.litterWeight}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>General Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(value) => handleInputChange('notes', value)}
                placeholder="Any general notes about the birth..."
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {renderOffspringSection()}



        </ScrollView>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <>
                <FastImage source={icons.submited} style={styles.submitIcon} tintColor={COLORS.white} />
                <Text style={styles.submitButtonText}>Record Birth</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.birthDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* Delivery Method Modal */}
      {renderDeliveryMethodModal()}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '600',
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray3,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    backgroundColor: COLORS.white,
  },
  inputError: {
    borderColor: COLORS.red,
  },
  inputText: {
    fontSize: 16,
    color: COLORS.black,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: COLORS.black,
  },
  dateIcon: {
    width: 20,
    height: 20,
  },
  dropdownIcon: {
    width: 16,
    height: 16,
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 12,
  },
  sexContainer: {
    flexDirection: 'row',
  },
  sexOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.gray3,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  selectedSexOption: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },
  sexOptionText: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '500',
  },
  selectedSexOptionText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: COLORS.lightGreen,
  },
  addIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  addButtonText: {
    fontSize: 14,
    color: COLORS.green,
    fontWeight: '600',
  },
  offspringCard: {
    backgroundColor: COLORS.lightGray2,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  offspringHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  offspringTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  removeButton: {
    padding: 4,
  },
  removeIcon: {
    width: 16,
    height: 16,
  },
  summaryCard: {
    backgroundColor: COLORS.lightBlue,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.blue,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: COLORS.blue,
    marginBottom: 4,
  },
  submitContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray3,
  },
  submitButton: {
    backgroundColor: COLORS.green,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.red,
    marginTop: 4,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: COLORS.black,
  },
  optionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray3,
  },
  selectedOption: {
    backgroundColor: COLORS.lightGreen,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.black,
  },
  selectedOptionText: {
    color: COLORS.green,
    fontWeight: 'bold',
  },
  closeModalButton: {
    backgroundColor: COLORS.gray3,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  closeModalButtonText: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: '600',
  },
});

export default RecordBirthScreen;