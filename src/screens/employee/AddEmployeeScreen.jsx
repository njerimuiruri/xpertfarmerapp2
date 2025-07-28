import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Modal,
  StatusBar,

  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from "../../constants/theme";
import SecondaryHeader from "../../components/headers/secondary-header";

import { createEmployee, formatEmployeeData } from '../../services/employees';


const AddEmployeeScreen = ({ navigation }) => {
  const [employeeType, setEmployeeType] = useState('permanent');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    phone: '',
    idNumber: '',
    emergencyContact: '',
    dateOfEmployment: new Date(),
    endDate: new Date(),
    paymentSchedule: 'monthly',
    salary: '',
    typeOfEngagement: 'seasonal',
    workSchedule: 'full',
    selectedRole: '',
    customRole: '',
    selectedBenefits: {
      paye: false,
      nssf: false,
      nhif: false,
      housingLevy: false,
      customBenefit: false,
    },
    customBenefitName: '',
    customBenefitAmount: '',
  });

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showBenefitModal, setShowBenefitModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEngagementModal, setShowEngagementModal] = useState(false);
  const [showWorkScheduleModal, setShowWorkScheduleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Added for delete modal

  const [showEmploymentDatePicker, setShowEmploymentDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const [errors, setErrors] = useState({});

  const predefinedRoles = [
    'milker',
    'cleaner',
    'farm manager',
    'veterinarian',
    'feed mixer',
    'security guard',
    'maintenance',
    'driver',
    'accountant',
    'supervisor',
  ];

  const predefinedBenefits = [
    { key: 'paye', name: 'PAYE', amount: 0 },
    { key: 'nssf', name: 'NSSF', amount: 1080 },
    { key: 'nhif', name: 'NHIF', amount: 1400 },
    { key: 'housingLevy', name: 'Housing Levy', amount: 375 },
  ];

  const paymentScheduleOptions = ['daily', 'weekly', 'monthly'];
  const engagementTypes = ['seasonal', 'temporary', 'contract'];
  const workScheduleTypes = ['full-time', 'part-time', 'flexible'];

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const formatPhoneNumber = (phone) => {
    let cleanPhone = phone.replace(/\D/g, '');

    if (cleanPhone.startsWith('254')) {
      cleanPhone = cleanPhone.substring(3);
    }

    if (cleanPhone.startsWith('0')) {
      cleanPhone = cleanPhone.substring(1);
    }

    return `+254${cleanPhone}`;
  };

  const handlePhoneChange = (field, text) => {
    updateFormData(field, text);
  };

  const handlePhoneBlur = (field) => {
    if (formData[field]) {
      const formatted = formatPhoneNumber(formData[field]);
      updateFormData(field, formatted);
    }
  };

  const selectRole = (role) => {
    updateFormData('selectedRole', role);
    setShowRoleModal(false);
  };

  const addCustomRole = () => {
    if (formData.customRole.trim()) {
      updateFormData('selectedRole', formData.customRole.trim());
      updateFormData('customRole', '');
      setShowRoleModal(false);
    }
  };

  const toggleBenefit = (benefitKey) => {
    setFormData(prev => ({
      ...prev,
      selectedBenefits: {
        ...prev.selectedBenefits,
        [benefitKey]: !prev.selectedBenefits[benefitKey],
      },
    }));
  };

  const addCustomBenefit = () => {
    if (formData.customBenefitName.trim() && formData.customBenefitAmount.trim()) {
      setFormData(prev => ({
        ...prev,
        selectedBenefits: {
          ...prev.selectedBenefits,
          customBenefit: true,
        },
      }));
      setShowBenefitModal(false);
    }
  };

  const formatDateForDisplay = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const onEmploymentDateChange = (event, selectedDate) => {
    setShowEmploymentDatePicker(false);
    if (selectedDate) {
      updateFormData('dateOfEmployment', selectedDate);
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      updateFormData('endDate', selectedDate);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const required = ['firstName', 'lastName', 'phone', 'salary'];

    required.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    if (formData.phone && !formData.phone.startsWith('+254')) {
      newErrors.phone = 'Phone number must be in Kenya format (+254...)';
    }

    if (formData.salary && isNaN(parseInt(formData.salary))) {
      newErrors.salary = 'Salary must be a valid number';
    }

    if (!formData.selectedRole) {
      newErrors.role = 'Please select a role';
    }

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
      const formattedData = formatEmployeeData(formData, employeeType);

      console.log('Submitting employee data:', JSON.stringify(formattedData, null, 2));

      const { data, error } = await createEmployee(formattedData);

      if (error) {
        Alert.alert('Error', error);
        return;
      }

      console.log('Employee created successfully:', data);

      setShowSuccessModal(true);

    } catch (error) {
      console.error('Error creating employee:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred while creating the employee. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderDropdownModal = (visible, setVisible, title, options, selectedValue, onSelect) => (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
          </View>

          <FlatList
            data={options}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.optionItem,
                  selectedValue === item && styles.selectedOption,
                ]}
                onPress={() => {
                  onSelect(item);
                  setVisible(false);
                }}>
                <Text style={[
                  styles.optionText,
                  selectedValue === item && styles.selectedOptionText,
                ]}>
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </Text>
                {selectedValue === item && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setVisible(false)}>
            <Text style={styles.closeModalButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderRoleModal = () => (
    <Modal visible={showRoleModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Role</Text>
          </View>

          <FlatList
            data={predefinedRoles}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.optionItem,
                  formData.selectedRole === item && styles.selectedOption,
                ]}
                onPress={() => selectRole(item)}>
                <Text style={[
                  styles.optionText,
                  formData.selectedRole === item && styles.selectedOptionText,
                ]}>
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </Text>
                {formData.selectedRole === item && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            )}
          />

          <View style={styles.customInputSection}>
            <Text style={styles.customLabel}>Add Custom Role</Text>
            <TextInput
              style={styles.customInput}
              value={formData.customRole}
              onChangeText={(text) => updateFormData('customRole', text)}
              placeholder="Enter custom role"
              placeholderTextColor={COLORS.textLight}
            />
            <TouchableOpacity style={styles.addCustomButton} onPress={addCustomRole}>
              <Text style={styles.addCustomButtonText}>Add Role</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setShowRoleModal(false)}>
            <Text style={styles.closeModalButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderBenefitModal = () => (
    <Modal visible={showBenefitModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Benefits</Text>
          </View>

          <FlatList
            data={predefinedBenefits}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.optionItem,
                  formData.selectedBenefits[item.key] && styles.selectedOption,
                ]}
                onPress={() => toggleBenefit(item.key)}>
                <Text style={[
                  styles.optionText,
                  formData.selectedBenefits[item.key] && styles.selectedOptionText,
                ]}>
                  {item.name} {item.amount > 0 && `(KSh ${item.amount.toLocaleString()})`}
                </Text>
                {formData.selectedBenefits[item.key] && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            )}
          />

          <View style={styles.customInputSection}>
            <Text style={styles.customLabel}>Add Custom Benefit</Text>
            <TextInput
              style={styles.customInput}
              value={formData.customBenefitName}
              onChangeText={(text) => updateFormData('customBenefitName', text)}
              placeholder="Benefit name"
              placeholderTextColor={COLORS.textLight}
            />
            <TextInput
              style={[styles.customInput, { marginTop: 8 }]}
              value={formData.customBenefitAmount}
              onChangeText={(text) => updateFormData('customBenefitAmount', text)}
              placeholder="Amount (KSh)"
              placeholderTextColor={COLORS.textLight}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.addCustomButton} onPress={addCustomBenefit}>
              <Text style={styles.addCustomButtonText}>Add Benefit</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setShowBenefitModal(false)}>
            <Text style={styles.closeModalButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
  const renderSuccessModal = () => (
    <Modal visible={showSuccessModal} transparent animationType="fade">
      <View style={styles.successModalOverlay}>
        <View style={styles.successModalCard}>
          {/* Success Icon */}
          <View style={styles.successIconContainer}>
            <View style={styles.successIcon}>
              <Text style={styles.successCheckmark}>✓</Text>
            </View>
          </View>

          {/* Success Content */}
          <Text style={styles.successTitle}>Employee Added!</Text>
          <Text style={styles.successMessage}>
            The employee has been successfully added to your team.
          </Text>

          <View style={styles.successButtonContainer}>
            <TouchableOpacity
              style={styles.successPrimaryButton}
              onPress={() => {
                setShowSuccessModal(false);
                navigation.navigate('FarmEmployeeTableScreen', {
                  refresh: true,
                  employeeAdded: true,
                  timestamp: Date.now()
                });
              }}>
              <Text style={styles.successPrimaryButtonText}>Done</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.successSecondaryButton}
              onPress={() => {
                setShowSuccessModal(false);
                setFormData({
                  firstName: '',
                  middleName: '',
                  lastName: '',
                  phone: '',
                  idNumber: '',
                  emergencyContact: '',
                  dateOfEmployment: new Date(),
                  endDate: new Date(),
                  paymentSchedule: 'monthly',
                  salary: '',
                  typeOfEngagement: 'seasonal',
                  workSchedule: 'full',
                  selectedRole: '',
                  customRole: '',
                  selectedBenefits: {
                    paye: false,
                    nssf: false,
                    nhif: false,
                    housingLevy: false,
                    customBenefit: false,
                  },
                  customBenefitName: '',
                  customBenefitAmount: '',
                });
                setErrors({});
              }}>
              <Text style={styles.successSecondaryButtonText}>Add Another</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader title="Add Employees" />

      <StatusBar
        translucent
        backgroundColor={COLORS.green2}
        animated={true}
        barStyle={'light-content'}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>



        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Employee Type</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                employeeType === 'permanent' && styles.selectedType,
              ]}
              onPress={() => setEmployeeType('permanent')}>
              <Text style={[
                styles.typeButtonText,
                employeeType === 'permanent' && styles.selectedTypeText,
              ]}>
                Permanent
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                employeeType === 'casual' && styles.selectedType,
              ]}
              onPress={() => setEmployeeType('casual')}>
              <Text style={[
                styles.typeButtonText,
                employeeType === 'casual' && styles.selectedTypeText,
              ]}>
                Casual
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Basic Information */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={[styles.input, errors.firstName && styles.inputError]}
              placeholder="Enter first name"
              placeholderTextColor={COLORS.textLight}
              value={formData.firstName}
              onChangeText={(text) => updateFormData('firstName', text)}
            />
            {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Middle Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter middle name (optional)"
              placeholderTextColor={COLORS.textLight}
              value={formData.middleName}
              onChangeText={(text) => updateFormData('middleName', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={[styles.input, errors.lastName && styles.inputError]}
              placeholder="Enter last name"
              placeholderTextColor={COLORS.textLight}
              value={formData.lastName}
              onChangeText={(text) => updateFormData('lastName', text)}
            />
            {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={[styles.input, errors.phone && styles.inputError]}
                placeholder="0712345678"
                placeholderTextColor={COLORS.textLight}
                value={formData.phone}
                onChangeText={(text) => handlePhoneChange('phone', text)}
                onBlur={() => handlePhoneBlur('phone')}
                keyboardType="phone-pad"
              />
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
              <Text style={styles.label}>ID Number</Text>
              <TextInput
                style={styles.input}
                placeholder="12345678"
                placeholderTextColor={COLORS.textLight}
                value={formData.idNumber}
                onChangeText={(text) => updateFormData('idNumber', text)}
                keyboardType="numeric"
              />
            </View>
          </View>

          {employeeType === 'permanent' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Emergency Contact</Text>
              <TextInput
                style={styles.input}
                placeholder="0712345678"
                placeholderTextColor={COLORS.textLight}
                value={formData.emergencyContact}
                onChangeText={(text) => handlePhoneChange('emergencyContact', text)}
                onBlur={() => handlePhoneBlur('emergencyContact')}
                keyboardType="phone-pad"
              />
            </View>
          )}
        </View>

        {/* Employment Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Employment Details</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Date of Employment *</Text>
              <TouchableOpacity
                style={[styles.input, styles.dateInput]}
                onPress={() => setShowEmploymentDatePicker(true)}>
                <Text style={styles.dateText}>
                  {formatDateForDisplay(formData.dateOfEmployment)}
                </Text>
                <Text style={styles.dateIcon}>📅</Text>
              </TouchableOpacity>
            </View>

            {employeeType === 'casual' && (
              <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
                <Text style={styles.label}>End Date *</Text>
                <TouchableOpacity
                  style={[styles.input, styles.dateInput]}
                  onPress={() => setShowEndDatePicker(true)}>
                  <Text style={styles.dateText}>
                    {formatDateForDisplay(formData.endDate)}
                  </Text>
                  <Text style={styles.dateIcon}>📅</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Role Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Role *</Text>
            <TouchableOpacity
              style={[styles.input, styles.dropdownButton, errors.role && styles.inputError]}
              onPress={() => setShowRoleModal(true)}>
              <Text style={[
                styles.dropdownText,
                !formData.selectedRole && styles.placeholderText
              ]}>
                {formData.selectedRole
                  ? formData.selectedRole.charAt(0).toUpperCase() + formData.selectedRole.slice(1)
                  : 'Select role'
                }
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
            {errors.role && <Text style={styles.errorText}>{errors.role}</Text>}
          </View>
        </View>

        {/* Payment Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Payment Schedule</Text>
            <TouchableOpacity
              style={[styles.input, styles.dropdownButton]}
              onPress={() => setShowPaymentModal(true)}>
              <Text style={styles.dropdownText}>
                {formData.paymentSchedule.charAt(0).toUpperCase() + formData.paymentSchedule.slice(1)}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Salary (KSh) *</Text>
            <TextInput
              style={[styles.input, errors.salary && styles.inputError]}
              placeholder="e.g., 50,000"
              placeholderTextColor={COLORS.textLight}
              value={formData.salary}
              onChangeText={(text) => updateFormData('salary', text)}
              keyboardType="numeric"
            />
            {errors.salary && <Text style={styles.errorText}>{errors.salary}</Text>}
          </View>
        </View>

        {/* Casual Employee Specific Fields */}
        {employeeType === 'casual' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Casual Employment Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Type of Engagement</Text>
              <TouchableOpacity
                style={[styles.input, styles.dropdownButton]}
                onPress={() => setShowEngagementModal(true)}>
                <Text style={styles.dropdownText}>
                  {formData.typeOfEngagement.charAt(0).toUpperCase() + formData.typeOfEngagement.slice(1)}
                </Text>
                <Text style={styles.dropdownIcon}>▼</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Work Schedule</Text>
              <TouchableOpacity
                style={[styles.input, styles.dropdownButton]}
                onPress={() => setShowWorkScheduleModal(true)}>
                <Text style={styles.dropdownText}>
                  {formData.workSchedule.charAt(0).toUpperCase() + formData.workSchedule.slice(1)}
                </Text>
                <Text style={styles.dropdownIcon}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Benefits Section for Permanent Employees */}
        {employeeType === 'permanent' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Benefits</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Employee Benefits</Text>
              <TouchableOpacity
                style={[styles.input, styles.dropdownButton]}
                onPress={() => setShowBenefitModal(true)}>
                <Text style={[
                  styles.dropdownText,
                  Object.values(formData.selectedBenefits).filter(Boolean).length === 0 && styles.placeholderText
                ]}>
                  {Object.values(formData.selectedBenefits).filter(Boolean).length > 0
                    ? `${Object.values(formData.selectedBenefits).filter(Boolean).length} benefit(s) selected`
                    : 'Select benefits'
                  }
                </Text>
                <Text style={styles.dropdownIcon}>▼</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.selectedItems}>
              {Object.entries(formData.selectedBenefits).map(([key, isSelected]) => {
                if (!isSelected) return null;

                const benefit = predefinedBenefits.find(b => b.key === key);
                if (benefit) {
                  return (
                    <View key={key} style={styles.selectedItem}>
                      <Text style={styles.selectedItemText}>
                        {benefit.name} {benefit.amount > 0 && `(KSh ${benefit.amount.toLocaleString()})`}
                      </Text>
                      <TouchableOpacity onPress={() => toggleBenefit(key)}>
                        <Text style={styles.removeButton}>×</Text>
                      </TouchableOpacity>
                    </View>
                  );
                }

                if (key === 'customBenefit') {
                  return (
                    <View key={key} style={styles.selectedItem}>
                      <Text style={styles.selectedItemText}>
                        {formData.customBenefitName} (KSh {parseInt(formData.customBenefitAmount || 0).toLocaleString()})
                      </Text>
                      <TouchableOpacity onPress={() => toggleBenefit(key)}>
                        <Text style={styles.removeButton}>×</Text>
                      </TouchableOpacity>
                    </View>
                  );
                }

                return null;
              })}
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
            <Text style={styles.submitButtonText}>Create Employee</Text>
          )}
        </TouchableOpacity>
      </View>

      {showEmploymentDatePicker && (
        <DateTimePicker
          value={formData.dateOfEmployment}
          mode="date"
          display="default"
          onChange={onEmploymentDateChange}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={formData.endDate}
          mode="date"
          display="default"
          onChange={onEndDateChange}
        />
      )}

      {renderRoleModal()}
      {renderBenefitModal()}
      {renderDropdownModal(
        showPaymentModal,
        setShowPaymentModal,
        'Select Payment Schedule',
        paymentScheduleOptions,
        formData.paymentSchedule,
        (value) => updateFormData('paymentSchedule', value)
      )}
      {renderDropdownModal(
        showEngagementModal,
        setShowEngagementModal,
        'Select Type of Engagement',
        engagementTypes,
        formData.typeOfEngagement,
        (value) => updateFormData('typeOfEngagement', value)
      )}
      {renderDropdownModal(
        showWorkScheduleModal,
        setShowWorkScheduleModal,
        'Select Work Schedule',
        workScheduleTypes,
        formData.workSchedule,
        (value) => updateFormData('workSchedule', value)
      )}
      {renderSuccessModal()}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGreen,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.black,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGreen,
    borderRadius: 8,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectedType: {
    backgroundColor: COLORS.green3,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.gray,
  },
  selectedTypeText: {
    color: COLORS.white,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.black,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.black,
  },
  inputError: {
    borderColor: COLORS.red,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.red,
    marginTop: 4,
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
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: COLORS.text,
  },
  dateIcon: {
    fontSize: 16,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: COLORS.black,
  },
  placeholderText: {
    color: COLORS.lightGray1,
  },
  dropdownIcon: {
    fontSize: 12,
    color: COLORS.gray,
  },
  selectedItems: {
    marginTop: 8,
  },
  selectedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.lightGreen,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  selectedItemText: {
    fontSize: 14,
    color: COLORS.black,
    flex: 1,
  },
  removeButton: {
    fontSize: 18,
    color: COLORS.gray,
    fontWeight: 'bold',
    paddingLeft: 8,
  },

  submitContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray1,
  },
  submitButton: {
    backgroundColor: COLORS.green,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray2,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.black,
    textAlign: 'center',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray1,
  },
  selectedOption: {
    backgroundColor: COLORS.lightGreen,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: '500',


  },
  selectedOptionText: {
    color: COLORS.black,
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 16,
    color: COLORS.green,
    fontWeight: 'bold',
  },
  customInputSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray1,
  },
  customLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.black,
    marginBottom: 8,
  },
  customInput: {
    backgroundColor: COLORS.gray,
    borderWidth: 1,
    borderColor: COLORS.lightGray1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.black,
  },
  addCustomButton: {
    backgroundColor: COLORS.green,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  addCustomButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.white,
  },
  closeModalButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray2,
  },
  closeModalButtonText: {
    fontSize: 16,
    color: COLORS.gray,
    fontWeight: '500',
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  successModalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.green,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  successCheckmark: {
    fontSize: 40,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  successButtonContainer: {
    width: '100%',
    gap: 12,
  },
  successPrimaryButton: {
    backgroundColor: COLORS.green,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  successPrimaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  successSecondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray1,
    width: '100%',
  },
  successSecondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.gray,
  },
});

export default AddEmployeeScreen;