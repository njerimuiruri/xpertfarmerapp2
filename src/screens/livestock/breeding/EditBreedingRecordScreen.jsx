import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  getBreedingRecordById,
  updateBreedingRecord
} from '../../../services/breeding';
import { getLivestockForActiveFarm } from '../../../services/livestock';
import { icons } from '../../../constants';
import { COLORS } from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';

const ModernSuccessModal = ({ visible, onClose, title, message }) => (
  <Modal
    animationType="fade"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}>
    <View style={styles.successModalOverlay}>
      <View style={styles.successModalContent}>
        <View style={styles.successIconContainer}>
          <FastImage source={icons.success} style={styles.successIcon} tintColor={COLORS.green} />
        </View>
        <Text style={styles.successModalTitle}>{title}</Text>
        <Text style={styles.successModalMessage}>{message}</Text>
        <TouchableOpacity style={styles.successModalButton} onPress={onClose}>
          <Text style={styles.successModalButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const CustomPicker = ({ selectedValue, onValueChange, items, placeholder, label, error }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedItem = items.find(item => item.value === selectedValue);
  const displayText = selectedItem ? selectedItem.label : placeholder;

  const handleSelect = (value) => {
    onValueChange(value);
    setModalVisible(false);
  };

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.input, styles.pickerInput, error && styles.inputError]}
        onPress={() => setModalVisible(true)}>
        <Text style={[
          styles.inputText,
          !selectedItem && styles.placeholderText
        ]}>
          {displayText}
        </Text>
        <FastImage source={icons.down} style={styles.dropdownIcon} tintColor={COLORS.gray} />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}>
                <FastImage source={icons.close} style={styles.closeIcon} tintColor={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              {items.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.optionItem,
                    selectedValue === item.value && styles.selectedOption,
                  ]}
                  onPress={() => handleSelect(item.value)}>
                  <Text style={[
                    styles.optionText,
                    selectedValue === item.value && styles.selectedOptionText,
                  ]}>
                    {item.label}
                  </Text>
                  {selectedValue === item.value && (
                    <FastImage source={icons.check} style={styles.checkIcon} tintColor={COLORS.green} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const EditBreedingRecordForm = ({ navigation, route }) => {
  const { recordId } = route.params;

  // Form state
  const [formData, setFormData] = useState({
    damId: '',
    sireId: '',
    purpose: '',
    strategy: '',
    serviceType: '',
    serviceDate: new Date(),
    numServices: 1,
    firstHeatDate: new Date(),
    sireCode: '',
    aiType: '',
    aiSource: '',
    aiCost: '',
    gestationDays: 280,
    expectedBirthDate: new Date(),
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [livestock, setLivestock] = useState([]);
  const [loadingLivestock, setLoadingLivestock] = useState(true);
  const [showServiceDatePicker, setShowServiceDatePicker] = useState(false);
  const [showHeatDatePicker, setShowHeatDatePicker] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState({});

  // Options for dropdowns
  const breedingPurposes = [
    { label: 'Improve Milk Production', value: 'Improve Milk Production' },
    { label: 'Improve Immunity', value: 'Improve Immunity' },
    { label: 'Stocking', value: 'Stocking' },
    { label: 'Improve Meat Quality', value: 'Improve Meat Quality' },
    { label: 'Improve Reproduction', value: 'Improve Reproduction' },
    { label: 'Disease Resistance', value: 'Disease Resistance' },
    { label: 'Better Growth Rate', value: 'Better Growth Rate' },
  ];

  const breedingStrategies = [
    { label: 'Cross Breeding', value: 'Cross Breeding' },
    { label: 'Outcrossing', value: 'Outcrossing' },
    { label: 'Breeding Between Breeds', value: 'Breeding Between Breeds' },
    { label: 'Inbreeding', value: 'Inbreeding' },
    { label: 'Line Breeding', value: 'Line Breeding' },
    { label: 'Pure Breeding', value: 'Pure Breeding' },
  ];

  const serviceTypes = [
    { label: 'Natural Mating', value: 'Natural Mating' },
    { label: 'Artificial Insemination', value: 'Artificial Insemination' },
  ];

  const aiTypes = [
    { label: 'Regular AI', value: 'Regular AI' },
    { label: 'Sexed Semen', value: 'Sexed Semen' },
    { label: 'Frozen Semen', value: 'Frozen Semen' },
    { label: 'Fresh Semen', value: 'Fresh Semen' },
  ];

  const aiSources = [
    { label: 'Local', value: 'Local' },
    { label: 'International', value: 'International' },
    { label: 'Farm', value: 'Farm' },
    { label: 'Cooperative', value: 'Cooperative' },
  ];

  // Load data on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Calculate expected birth date when service date or gestation days change
  useEffect(() => {
    if (formData.serviceDate && formData.gestationDays) {
      const expectedDate = new Date(formData.serviceDate);
      expectedDate.setDate(expectedDate.getDate() + parseInt(formData.gestationDays));
      setFormData(prev => ({
        ...prev,
        expectedBirthDate: expectedDate,
      }));
    }
  }, [formData.serviceDate, formData.gestationDays]);

  // Auto-fill sire code when sire is selected and service type is AI
  useEffect(() => {
    if (formData.sireId && formData.serviceType === 'Artificial Insemination') {
      const selectedSire = livestock.find(animal => animal.id === formData.sireId);
      if (selectedSire?.mammal?.sireCode) {
        setFormData(prev => ({
          ...prev,
          sireCode: selectedSire.mammal.sireCode,
        }));
      } else {
        // Generate AI code if sire doesn't have sireCode
        const sireIdNumber = selectedSire?.mammal?.idNumber || 'UNKNOWN';
        const aiCode = `AI-${sireIdNumber}-${new Date().getFullYear()}`;
        setFormData(prev => ({
          ...prev,
          sireCode: aiCode,
        }));
      }
    } else if (formData.serviceType === 'Natural Mating') {
      // Clear AI-specific fields for natural mating
      setFormData(prev => ({
        ...prev,
        sireCode: '',
        aiType: '',
        aiSource: '',
        aiCost: '',
      }));
    }
  }, [formData.sireId, formData.serviceType, livestock]);

  const loadInitialData = async () => {
    try {
      setInitialLoading(true);

      // Load livestock and breeding record data in parallel
      const [livestockResult, breedingResult] = await Promise.all([
        loadLivestock(),
        loadBreedingRecord()
      ]);

      if (!livestockResult || !breedingResult) {
        Alert.alert('Error', 'Failed to load required data');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      Alert.alert('Error', 'Failed to load breeding record data');
      navigation.goBack();
    } finally {
      setInitialLoading(false);
    }
  };

  const loadLivestock = async () => {
    try {
      setLoadingLivestock(true);
      const farmLivestock = await getLivestockForActiveFarm();

      // Filter only active livestock (mammals) that can breed
      const breedingLivestock = farmLivestock.filter(animal =>
        animal.category === 'mammal' &&
        animal.mammal &&
        ['active'].includes(animal.status || 'active')
      );

      setLivestock(breedingLivestock);
      console.log('Loaded livestock for breeding:', breedingLivestock.length);
      return true;
    } catch (error) {
      console.error('Error loading livestock:', error);
      Alert.alert('Error', 'Failed to load livestock data');
      return false;
    } finally {
      setLoadingLivestock(false);
    }
  };

  const loadBreedingRecord = async () => {
    try {
      console.log('Loading breeding record with ID:', recordId);
      const breedingRecord = await getBreedingRecordById(recordId);

      if (!breedingRecord) {
        throw new Error('Breeding record not found');
      }

      console.log('Loaded breeding record:', breedingRecord);

      // Parse and set form data
      setFormData({
        damId: breedingRecord.damId || '',
        sireId: breedingRecord.sireId || '',
        purpose: breedingRecord.purpose || '',
        strategy: breedingRecord.strategy || '',
        serviceType: breedingRecord.serviceType || '',
        serviceDate: breedingRecord.serviceDate ? new Date(breedingRecord.serviceDate) : new Date(),
        numServices: breedingRecord.numServices || 1,
        firstHeatDate: breedingRecord.firstHeatDate ? new Date(breedingRecord.firstHeatDate) : new Date(),
        sireCode: breedingRecord.sireCode || '',
        aiType: breedingRecord.aiType || '',
        aiSource: breedingRecord.aiSource || '',
        aiCost: breedingRecord.aiCost?.toString() || '',
        gestationDays: breedingRecord.gestationDays || 280,
        expectedBirthDate: breedingRecord.expectedBirthDate ? new Date(breedingRecord.expectedBirthDate) : new Date(),
      });

      return true;
    } catch (error) {
      console.error('Error loading breeding record:', error);
      Alert.alert('Error', 'Failed to load breeding record details');
      return false;
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const onDateChange = (event, selectedDate, dateField, showField) => {
    if (showField === 'showServiceDatePicker') {
      setShowServiceDatePicker(false);
    } else if (showField === 'showHeatDatePicker') {
      setShowHeatDatePicker(false);
    }

    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        [dateField]: selectedDate,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.damId) newErrors.damId = 'Dam is required';
    if (!formData.sireId) newErrors.sireId = 'Sire is required';
    if (!formData.purpose) newErrors.purpose = 'Breeding purpose is required';
    if (!formData.strategy) newErrors.strategy = 'Breeding strategy is required';
    if (!formData.serviceType) newErrors.serviceType = 'Service type is required';
    if (!formData.numServices || formData.numServices < 1) newErrors.numServices = 'Number of services must be at least 1';
    if (!formData.gestationDays || formData.gestationDays < 1) newErrors.gestationDays = 'Gestation days must be valid';

    // Validate dam is female
    const selectedDam = livestock.find(animal => animal.id === formData.damId);
    if (selectedDam && selectedDam.mammal?.gender?.toLowerCase() !== 'female') {
      newErrors.damId = 'Dam must be a female animal';
    }

    // Validate sire is male
    const selectedSire = livestock.find(animal => animal.id === formData.sireId);
    if (selectedSire && selectedSire.mammal?.gender?.toLowerCase() !== 'male') {
      newErrors.sireId = 'Sire must be a male animal';
    }

    // Validate same animal not selected for both dam and sire
    if (formData.damId === formData.sireId && formData.damId) {
      newErrors.sireId = 'Dam and Sire cannot be the same animal';
    }

    // Validate AI specific fields
    if (formData.serviceType === 'Artificial Insemination') {
      if (!formData.aiType) newErrors.aiType = 'AI Type is required for Artificial Insemination';
      if (!formData.aiSource) newErrors.aiSource = 'AI Source is required for Artificial Insemination';
      if (!formData.aiCost || parseFloat(formData.aiCost) < 0) newErrors.aiCost = 'AI Cost must be a valid positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please correct the errors in the form');
      return;
    }

    try {
      setLoading(true);

      // Prepare payload
      const payload = {
        damId: formData.damId,
        sireId: formData.sireId,
        purpose: formData.purpose,
        strategy: formData.strategy,
        serviceType: formData.serviceType,
        serviceDate: formData.serviceDate.toISOString(),
        numServices: parseInt(formData.numServices),
        firstHeatDate: formData.firstHeatDate.toISOString(),
        gestationDays: parseInt(formData.gestationDays),
        expectedBirthDate: formData.expectedBirthDate.toISOString(),
      };

      // Add AI-specific fields if service type is Artificial Insemination
      if (formData.serviceType === 'Artificial Insemination') {
        payload.sireCode = formData.sireCode;
        payload.aiType = formData.aiType;
        payload.aiSource = formData.aiSource;
        payload.aiCost = parseFloat(formData.aiCost);
      }

      console.log('Updating breeding record:', payload);

      const { data, error } = await updateBreedingRecord(recordId, payload);

      if (error) {
        Alert.alert('Error', error);
        return;
      }

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error updating breeding record:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Get available livestock for dam (females) and sire (males)
  const getAvailableDams = () => livestock.filter(animal =>
    animal.mammal?.gender?.toLowerCase() === 'female'
  ).map(animal => ({
    label: formatLivestockDisplay(animal),
    value: animal.id
  }));

  const getAvailableSires = () => livestock.filter(animal =>
    animal.mammal?.gender?.toLowerCase() === 'male'
  ).map(animal => ({
    label: formatLivestockDisplay(animal),
    value: animal.id
  }));

  const formatLivestockDisplay = (animal) => {
    const mammalData = animal.mammal;
    return `${mammalData.idNumber} - ${animal.type} (${mammalData.breedType})`;
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigation.goBack();
  };

  if (initialLoading || loadingLivestock) {
    return (
      <SafeAreaView style={styles.container}>
        <SecondaryHeader
          title="Edit Breeding Record"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.green} />
          <Text style={styles.loadingText}>
            {initialLoading ? 'Loading breeding record...' : 'Loading livestock data...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader
        title="Edit Breeding Record"
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

          {/* Basic Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <CustomPicker
              selectedValue={formData.damId}
              onValueChange={(value) => handleInputChange('damId', value)}
              items={getAvailableDams()}
              placeholder="Select Dam..."
              label="Dam (Female) *"
              error={errors.damId}
            />

            <CustomPicker
              selectedValue={formData.sireId}
              onValueChange={(value) => handleInputChange('sireId', value)}
              items={getAvailableSires()}
              placeholder="Select Sire..."
              label="Sire (Male) *"
              error={errors.sireId}
            />

            <CustomPicker
              selectedValue={formData.purpose}
              onValueChange={(value) => handleInputChange('purpose', value)}
              items={breedingPurposes}
              placeholder="Select Purpose..."
              label="Breeding Purpose *"
              error={errors.purpose}
            />

            <CustomPicker
              selectedValue={formData.strategy}
              onValueChange={(value) => handleInputChange('strategy', value)}
              items={breedingStrategies}
              placeholder="Select Strategy..."
              label="Breeding Strategy *"
              error={errors.strategy}
            />
          </View>

          {/* Service Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Information</Text>

            <CustomPicker
              selectedValue={formData.serviceType}
              onValueChange={(value) => handleInputChange('serviceType', value)}
              items={serviceTypes}
              placeholder="Select Service Type..."
              label="Service Type *"
              error={errors.serviceType}
            />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Service Date *</Text>
              <TouchableOpacity
                style={[styles.input, styles.dateInput]}
                onPress={() => setShowServiceDatePicker(true)}>
                <Text style={styles.dateText}>
                  {formData.serviceDate.toLocaleDateString()}
                </Text>
                <FastImage source={icons.calendar} style={styles.dateIcon} tintColor={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Heat Date *</Text>
              <TouchableOpacity
                style={[styles.input, styles.dateInput]}
                onPress={() => setShowHeatDatePicker(true)}>
                <Text style={styles.dateText}>
                  {formData.firstHeatDate.toLocaleDateString()}
                </Text>
                <FastImage source={icons.calendar} style={styles.dateIcon} tintColor={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Number of Services *</Text>
                <TextInput
                  style={[styles.input, errors.numServices && styles.inputError]}
                  value={formData.numServices.toString()}
                  onChangeText={(value) => handleInputChange('numServices', parseInt(value) || 1)}
                  placeholder="1"
                  keyboardType="numeric"
                />
                {errors.numServices && <Text style={styles.errorText}>{errors.numServices}</Text>}
              </View>

              <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
                <Text style={styles.label}>Gestation Days *</Text>
                <TextInput
                  style={[styles.input, errors.gestationDays && styles.inputError]}
                  value={formData.gestationDays.toString()}
                  onChangeText={(value) => handleInputChange('gestationDays', parseInt(value) || 280)}
                  placeholder="280"
                  keyboardType="numeric"
                />
                {errors.gestationDays && <Text style={styles.errorText}>{errors.gestationDays}</Text>}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Expected Birth Date</Text>
              <View style={styles.readOnlyContainer}>
                <Text style={styles.readOnlyText}>
                  {formData.expectedBirthDate.toLocaleDateString()}
                </Text>
                <FastImage source={icons.info} style={styles.infoIcon} tintColor={COLORS.blue} />
              </View>
              <Text style={styles.helpText}>Automatically calculated from service date and gestation period</Text>
            </View>
          </View>

          {/* AI Information Section - Only show when AI is selected */}
          {formData.serviceType === 'Artificial Insemination' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Artificial Insemination Details</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Sire Code</Text>
                <View style={styles.readOnlyContainer}>
                  <Text style={styles.readOnlyText}>{formData.sireCode || 'Auto-generated'}</Text>
                  <FastImage source={icons.code} style={styles.infoIcon} tintColor={COLORS.blue} />
                </View>
                <Text style={styles.helpText}>Automatically filled based on selected sire</Text>
              </View>

              <CustomPicker
                selectedValue={formData.aiType}
                onValueChange={(value) => handleInputChange('aiType', value)}
                items={aiTypes}
                placeholder="Select AI Type..."
                label="AI Type *"
                error={errors.aiType}
              />

              <CustomPicker
                selectedValue={formData.aiSource}
                onValueChange={(value) => handleInputChange('aiSource', value)}
                items={aiSources}
                placeholder="Select AI Source..."
                label="AI Source *"
                error={errors.aiSource}
              />

              <View style={styles.inputGroup}>
                <Text style={styles.label}>AI Cost (KES) *</Text>
                <TextInput
                  style={[styles.input, errors.aiCost && styles.inputError]}
                  value={formData.aiCost}
                  onChangeText={(value) => handleInputChange('aiCost', value)}
                  placeholder="Enter AI cost"
                  keyboardType="numeric"
                />
                {errors.aiCost && <Text style={styles.errorText}>{errors.aiCost}</Text>}
              </View>
            </View>
          )}

        </ScrollView>

        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <>
                <FastImage source={icons.edit} style={styles.submitIcon} tintColor={COLORS.white} />
                <Text style={styles.submitButtonText}>Update Breeding Record</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>

      {/* Date Pickers */}
      {showServiceDatePicker && (
        <DateTimePicker
          value={formData.serviceDate}
          mode="date"
          display="default"
          onChange={(event, date) => onDateChange(event, date, 'serviceDate', 'showServiceDatePicker')}
          maximumDate={new Date()}
        />
      )}

      {showHeatDatePicker && (
        <DateTimePicker
          value={formData.firstHeatDate}
          mode="date"
          display="default"
          onChange={(event, date) => onDateChange(event, date, 'firstHeatDate', 'showHeatDatePicker')}
          maximumDate={new Date()}
        />
      )}

      {/* Success Modal */}
      <ModernSuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="Success!"
        message="Breeding record has been updated successfully. All changes have been saved."
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGreen,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.gray,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
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
    flex: 1,
  },
  pickerInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeholderText: {
    color: COLORS.gray,
  },
  dropdownIcon: {
    width: 16,
    height: 16,
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
  readOnlyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray2,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.gray4,
  },
  readOnlyText: {
    fontSize: 16,
    color: COLORS.gray,
    flex: 1,
  },
  infoIcon: {
    width: 18,
    height: 18,
  },
  helpText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
    fontStyle: 'italic',
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
  errorText: {
    fontSize: 12,
    color: COLORS.red,
    marginTop: 4,
  },
  submitContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButton: {
    backgroundColor: COLORS.green,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.gray,
    opacity: 0.6,
  },
  submitIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  closeButton: {
    padding: 4,
  },
  closeIcon: {
    width: 24,
    height: 24,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray5,
  },
  selectedOption: {
    backgroundColor: COLORS.lightGreen,
    borderRadius: 8,
    borderBottomWidth: 0,
    marginVertical: 2,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.black,
    flex: 1,
  },
  selectedOptionText: {
    color: COLORS.green,
    fontWeight: '600',
  },
  checkIcon: {
    width: 20,
    height: 20,
  },
  // Success Modal styles
  successModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  successModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successIcon: {
    width: 40,
    height: 40,
  },
  successModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
    textAlign: 'center',
  },
  successModalMessage: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  successModalButton: {
    backgroundColor: COLORS.green,
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  successModalButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditBreedingRecordForm;