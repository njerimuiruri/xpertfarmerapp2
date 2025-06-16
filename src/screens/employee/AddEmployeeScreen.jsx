import React, { useState } from 'react';
import {
  Box,
  Text,
  Input,
  Button,
  VStack,
  Select,
  HStack,
  Radio,
  ScrollView,
  Modal,
  Checkbox,
  Pressable,
  IconButton,
  FormControl,
} from 'native-base';
import { View, StyleSheet, Platform } from 'react-native';
import FastImage from 'react-native-fast-image';
import DateTimePicker from '@react-native-community/datetimepicker';
import SecondaryHeader from '../../components/headers/secondary-header';
import { COLORS } from '../../constants/theme';
import { icons } from '../../constants';
import { createEmployee, formatEmployeeData } from '../../services/employees';

export default function AddEmployeeScreen({ navigation }) {
  // State for step tracking
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps, setTotalSteps] = useState(2);
  const [endDate, setEndDate] = useState('');
  const [typeOfEngagement, setTypeOfEngagement] = useState('');
  const [employeeType, setEmployeeType] = useState('permanent');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [idNumber, setIdNumber] = useState('');

  const [dateOfEmployment, setDateOfEmployment] = useState('');
  const [role, setRole] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [customRole, setCustomRole] = useState('');
  const [showCustomRole, setShowCustomRole] = useState(false);
  const [paymentSchedule, setPaymentSchedule] = useState('daily');
  const [salary, setSalary] = useState('');
  const [workSchedule, setWorkSchedule] = useState('');


  const [selectedBenefits, setSelectedBenefits] = useState({
    paye: false,
    nssf: false,
    nhif: false,
    housingLevy: false,
    customBenefit: false
  });
  const [customBenefitName, setCustomBenefitName] = useState('');
  const [customBenefitAmount, setCustomBenefitAmount] = useState('');

  // Date picker states
  const [showEmploymentDatePicker, setShowEmploymentDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [employmentDateObj, setEmploymentDateObj] = useState(new Date());
  const [endDateObj, setEndDateObj] = useState(new Date());

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Date formatting function
  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Handle employment date change
  const onEmploymentDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || employmentDateObj;
    setShowEmploymentDatePicker(Platform.OS === 'ios');
    setEmploymentDateObj(currentDate);
    setDateOfEmployment(formatDate(currentDate));
  };

  // Handle end date change
  const onEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || endDateObj;
    setShowEndDatePicker(Platform.OS === 'ios');
    setEndDateObj(currentDate);
    setEndDate(formatDate(currentDate));
  };

  const handleRoleSelect = (roleName, isSelected) => {
    if (roleName === 'custom') {
      setShowCustomRole(isSelected);
      if (isSelected) {
        setSelectedRoles(prev => [...prev, 'custom']);
      } else {
        setSelectedRoles(prev => prev.filter(role => role !== 'custom'));
        setCustomRole('');
      }
    } else {
      if (isSelected) {
        setSelectedRoles(prev => [...prev, roleName]);
      } else {
        setSelectedRoles(prev => prev.filter(role => role !== roleName));
      }
    }
  };
  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Collect form data
      const formData = {
        firstName,
        middleName,
        lastName,
        phone,
        emergencyContact,
        idNumber,
        dateOfEmployment,
        role,
        customRole,
        paymentSchedule,
        salary,
        selectedBenefits,
        customBenefitName,
        customBenefitAmount,
        // For casual employees
        endDate,
        typeOfEngagement,
        workSchedule,
      };

      // Format data for API
      const employeeData = formatEmployeeData(formData, employeeType);

      console.log('Submitting employee data:', employeeData);

      // Call the API
      const { data, error } = await createEmployee(employeeData);

      if (error) {
        console.error('Failed to create employee:', error);
        alert(`Failed to create employee: ${error}`);
        return;
      }

      console.log('Employee created successfully:', data);

      // Show success modal
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  const renderStepIndicator = () => {
    return (
      <HStack mt={4} mb={6} px={6} position="relative" alignItems="center">
        <Box
          position="absolute"
          top="10px"
          left="0"
          right="0"
          height="2px"
          bg="gray.200"
          zIndex={0}
          mx={12}
        />

        <VStack flex={1} alignItems="center" zIndex={1}>
          <Box
            w="8"
            h="8"
            borderRadius="full"
            bg={currentStep >= 1 ? COLORS.green : "gray.200"}
            justifyContent="center"
            alignItems="center"
          >
            <Text color={currentStep >= 1 ? "white" : "gray.500"} fontWeight="bold">1</Text>
          </Box>
          <Text
            color={currentStep >= 1 ? COLORS.green : "gray.400"}
            fontSize="xs"
            mt={1}
            textAlign="center"
          >
            Personal{'\n'}Information
          </Text>
        </VStack>

        {/* Step 2 */}
        <VStack flex={1} alignItems="center" zIndex={1}>
          <Box
            w="8"
            h="8"
            borderRadius="full"
            bg={currentStep >= 2 ? COLORS.green : "gray.200"}
            justifyContent="center"
            alignItems="center"
          >
            <Text color={currentStep >= 2 ? "white" : "gray.500"} fontWeight="bold">2</Text>
          </Box>
          <Text
            color={currentStep >= 2 ? COLORS.green : "gray.400"}
            fontSize="xs"
            mt={1}
            textAlign="center"
          >
            Professional{'\n'}Information
          </Text>
        </VStack>
      </HStack>
    );
  };

  // Step 1: Personal Information
  const renderPersonalInformationForm = () => {
    return (
      <VStack space={4} px={4}>
        <FormControl>
          <Text style={styles.sectionTitle}>Select the type of labor</Text>
          <Radio.Group
            name="employeeType"
            value={employeeType}
            onChange={value => setEmployeeType(value)}
            mt={2}
          >
            <HStack space={6}>
              <Radio value="permanent" colorScheme="green">
                <Text ml={1}>Permanent</Text>
              </Radio>
              <Radio value="casual" colorScheme="green">
                <Text ml={1}>Casual</Text>
              </Radio>
            </HStack>
          </Radio.Group>
        </FormControl>

        <FormControl isRequired>
          <FormControl.Label>
            <Text style={styles.label}>First Name</Text>
          </FormControl.Label>
          <Input
            value={firstName}
            onChangeText={setFirstName}
            placeholder="John"
            borderColor="gray.300"
            backgroundColor={COLORS.lightGreen}
            p={3}
            borderRadius="md"
          />
        </FormControl>

        <FormControl>
          <FormControl.Label>
            <Text style={styles.label}>Middle Name</Text>
          </FormControl.Label>
          <Input
            value={middleName}
            onChangeText={setMiddleName}
            placeholder="Doe"
            borderColor="gray.300"
            backgroundColor={COLORS.lightGreen}
            p={3}
            borderRadius="md"
          />
        </FormControl>

        <FormControl isRequired>
          <FormControl.Label>
            <Text style={styles.label}>Last Name</Text>
          </FormControl.Label>
          <Input
            value={lastName}
            onChangeText={setLastName}
            placeholder="Doe"
            borderColor="gray.300"
            backgroundColor={COLORS.lightGreen}
            p={3}
            borderRadius="md"
          />
        </FormControl>

        <FormControl isRequired>
          <FormControl.Label>
            <Text style={styles.label}>Phone Number</Text>
          </FormControl.Label>
          <Input
            value={phone}
            onChangeText={setPhone}
            placeholder="(___) ___-____"
            keyboardType="phone-pad"
            backgroundColor={COLORS.lightGreen}
            borderColor="gray.300"
            p={3}
            borderRadius="md"
          />
        </FormControl>

        <FormControl>
          <FormControl.Label>
            <Text style={styles.label}>Emergency Contact</Text>
          </FormControl.Label>
          <Input
            value={emergencyContact}
            onChangeText={setEmergencyContact}
            placeholder="(___) ___-____"
            keyboardType="phone-pad"
            backgroundColor={COLORS.lightGreen}
            borderColor="gray.300"
            p={3}
            borderRadius="md"
          />
        </FormControl>

        <FormControl>
          <FormControl.Label>
            <Text style={styles.label}>ID Number</Text>
          </FormControl.Label>
          <Input
            value={idNumber}
            onChangeText={setIdNumber}
            placeholder="Enter ID number"
            backgroundColor={COLORS.lightGreen}
            borderColor="gray.300"
            p={3}
            borderRadius="md"
          />
        </FormControl>

        <Button
          mt={4}
          mb={8}
          backgroundColor={COLORS.green}
          onPress={handleNext}
          alignSelf="center"
          borderRadius="md"
          width="120px"
        >
          Next
        </Button>
      </VStack>
    );
  };

  // Step 2
  const renderProfessionalInformationForm = () => {
    return (
      <VStack space={4} px={4}>
        <FormControl isRequired>
          <FormControl.Label>
            <Text style={styles.label}>Date of Employment</Text>
          </FormControl.Label>
          <Pressable onPress={() => setShowEmploymentDatePicker(true)}>
            <Input
              value={dateOfEmployment}
              placeholder="DD/MM/YYYY"
              borderColor="gray.300"
              backgroundColor={COLORS.lightGreen}
              p={3}
              borderRadius="md"
              isReadOnly
              InputRightElement={
                <IconButton
                  icon={
                    <FastImage
                      source={icons.calendar}
                      style={{ width: 24, height: 24 }}
                    />
                  }
                  onPress={() => setShowEmploymentDatePicker(true)}
                />
              }
            />
          </Pressable>
        </FormControl>

        {showEmploymentDatePicker && (
          <DateTimePicker
            testID="employmentDatePicker"
            value={employmentDateObj}
            mode="date"
            display="default"
            onChange={onEmploymentDateChange}
          />
        )}

        <FormControl>
          <FormControl.Label>
            <Text style={styles.label}>End Date (If applicable)</Text>
          </FormControl.Label>
          <Pressable onPress={() => setShowEndDatePicker(true)}>
            <Input
              value={endDate}
              placeholder="DD/MM/YYYY"
              borderColor="gray.300"
              backgroundColor={COLORS.lightGreen}
              p={3}
              borderRadius="md"
              isReadOnly
              InputRightElement={
                <IconButton
                  icon={
                    <FastImage
                      source={icons.calendar}
                      style={{ width: 24, height: 24 }}
                    />
                  }
                  onPress={() => setShowEndDatePicker(true)}
                />
              }
            />
          </Pressable>
        </FormControl>

        {showEndDatePicker && (
          <DateTimePicker
            testID="endDatePicker"
            value={endDateObj}
            mode="date"
            display="default"
            onChange={onEndDateChange}
          />
        )}

        <FormControl isRequired>
          <FormControl.Label>
            <Text style={styles.label}>Role</Text>
          </FormControl.Label>
          <VStack space={2} mt={1}>
            <Checkbox
              value="cleaner"
              colorScheme="green"
              onChange={(isSelected) => handleRoleSelect('cleaner', isSelected)}
              isChecked={selectedRoles.includes('cleaner')}
            >
              Cleaner
            </Checkbox>
            <Checkbox
              value="feeder"
              colorScheme="green"
              onChange={(isSelected) => handleRoleSelect('feeder', isSelected)}
              isChecked={selectedRoles.includes('feeder')}
            >
              Feeder
            </Checkbox>
            <Checkbox
              value="milker"
              colorScheme="green"
              onChange={(isSelected) => handleRoleSelect('milker', isSelected)}
              isChecked={selectedRoles.includes('milker')}
            >
              Milker
            </Checkbox>
            <Checkbox
              value="custom"
              colorScheme="green"
              onChange={(isSelected) => handleRoleSelect('custom', isSelected)}
              isChecked={selectedRoles.includes('custom')}
            >
              Create new role
            </Checkbox>
          </VStack>

          {showCustomRole && (
            <FormControl mt={2} isRequired>
              <FormControl.Label>
                <Text style={styles.label}>Role Name</Text>
              </FormControl.Label>
              <Input
                value={customRole}
                onChangeText={setCustomRole}
                placeholder="role/title"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.300"
                p={3}
                borderRadius="md"
              />
            </FormControl>
          )}
        </FormControl>

        <FormControl isRequired>
          <FormControl.Label>
            <Text style={styles.label}>Payment Schedule</Text>
          </FormControl.Label>
          <Radio.Group
            name="paymentSchedule"
            value={paymentSchedule}
            onChange={value => setPaymentSchedule(value)}
            mt={1}
          >
            <HStack space={4} flexWrap="wrap">
              <Radio value="daily" colorScheme="green">
                <Text ml={1}>Daily</Text>
              </Radio>
              <Radio value="weekly" colorScheme="green">
                <Text ml={1}>Weekly</Text>
              </Radio>
              <Radio value="monthly" colorScheme="green">
                <Text ml={1}>Monthly</Text>
              </Radio>
            </HStack>
          </Radio.Group>
        </FormControl>

        <FormControl isRequired>
          <FormControl.Label>
            <Text style={styles.label}>Salary (Kenya Shillings)</Text>
          </FormControl.Label>
          <Input
            value={salary}
            onChangeText={setSalary}
            placeholder="11,000"
            backgroundColor={COLORS.lightGreen}
            keyboardType="numeric"
            borderColor="gray.300"
            p={3}
            borderRadius="md"
          />
        </FormControl>

        <FormControl>
          <FormControl.Label>
            <Text style={styles.label}>Statutory and Benefits (Select Relevant Fields)</Text>
          </FormControl.Label>
          <VStack space={2} mt={1}>
            <Checkbox
              value="paye"
              colorScheme="green"
              onChange={(isSelected) => setSelectedBenefits({ ...selectedBenefits, paye: isSelected })}
              isChecked={selectedBenefits.paye}
            >
              PAYE
            </Checkbox>
            <Checkbox
              value="nssf"
              colorScheme="green"
              onChange={(isSelected) => setSelectedBenefits({ ...selectedBenefits, nssf: isSelected })}
              isChecked={selectedBenefits.nssf}
            >
              NSSF
            </Checkbox>
            <Checkbox
              value="nhif"
              colorScheme="green"
              onChange={(isSelected) => setSelectedBenefits({ ...selectedBenefits, nhif: isSelected })}
              isChecked={selectedBenefits.nhif}
            >
              NHIF
            </Checkbox>
            <Checkbox
              value="housingLevy"
              colorScheme="green"
              onChange={(isSelected) => setSelectedBenefits({ ...selectedBenefits, housingLevy: isSelected })}
              isChecked={selectedBenefits.housingLevy}
            >
              Housing Levy
            </Checkbox>
            <Checkbox
              value="customBenefit"
              colorScheme="green"
              onChange={(isSelected) => setSelectedBenefits({ ...selectedBenefits, customBenefit: isSelected })}
              isChecked={selectedBenefits.customBenefit}
            >
              Add Benefit +
            </Checkbox>
          </VStack>

          {selectedBenefits.customBenefit && (
            <VStack space={3} mt={3}>
              <FormControl isRequired>
                <FormControl.Label>
                  <Text style={styles.label}>Benefit Name</Text>
                </FormControl.Label>
                <Input
                  value={customBenefitName}
                  onChangeText={setCustomBenefitName}
                  placeholder="role/title"
                  borderColor="gray.300"
                  p={3}
                  borderRadius="md"
                />
              </FormControl>

              <FormControl isRequired>
                <FormControl.Label>
                  <Text style={styles.label}>Amount</Text>
                </FormControl.Label>
                <Input
                  value={customBenefitAmount}
                  onChangeText={setCustomBenefitAmount}
                  placeholder="5,000"
                  keyboardType="numeric"
                  borderColor="gray.300"
                  backgroundColor={COLORS.lightGreen}
                  p={3}
                  borderRadius="md"
                />
              </FormControl>
            </VStack>
          )}
        </FormControl>

        <HStack justifyContent="space-between" mt={4} mb={8}>
          <Button
            variant="outline"
            borderColor={COLORS.green}
            onPress={handlePrevious}
            borderRadius="md"
            width="120px"
          >
            Previous
          </Button>
          <Button
            backgroundColor={COLORS.green}
            onPress={handleSubmit}
            borderRadius="md"
            width="120px"
          >
            Submit
          </Button>
        </HStack>
      </VStack>
    );
  };

  const renderCasualEmployeeForm = () => {
    return (
      <VStack space={4} px={4}>
        <FormControl isRequired>
          <FormControl.Label>
            <Text style={styles.label}>First Name</Text>
          </FormControl.Label>
          <Input
            value={firstName}
            onChangeText={setFirstName}
            placeholder="John"
            borderColor="gray.300"
            p={3}
            backgroundColor={COLORS.lightGreen}
            borderRadius="md"
          />
        </FormControl>

        <FormControl>
          <FormControl.Label>
            <Text style={styles.label}>Middle Name</Text>
          </FormControl.Label>
          <Input
            value={middleName}
            onChangeText={setMiddleName}
            placeholder="Doe"
            borderColor="gray.300"
            backgroundColor={COLORS.lightGreen}
            p={3}
            borderRadius="md"
          />
        </FormControl>

        <FormControl isRequired>
          <FormControl.Label>
            <Text style={styles.label}>Last Name</Text>
          </FormControl.Label>
          <Input
            value={lastName}
            onChangeText={setLastName}
            placeholder="Doe"
            borderColor="gray.300"
            p={3}
            backgroundColor={COLORS.lightGreen}
            borderRadius="md"
          />
        </FormControl>

        <FormControl isRequired>
          <FormControl.Label>
            <Text style={styles.label}>Phone Number</Text>
          </FormControl.Label>
          <Input
            value={phone}
            onChangeText={setPhone}
            placeholder="(___) ___-____"
            keyboardType="phone-pad"
            borderColor="gray.300"
            p={3}
            backgroundColor={COLORS.lightGreen}
            borderRadius="md"
          />
        </FormControl>

        <FormControl>
          <FormControl.Label>
            <Text style={styles.label}>Emergency Contact</Text>
          </FormControl.Label>
          <Input
            value={emergencyContact}
            onChangeText={setEmergencyContact}
            placeholder="(___) ___-____"
            keyboardType="phone-pad"
            backgroundColor={COLORS.lightGreen}
            borderColor="gray.300"
            p={3}
            borderRadius="md"
          />
        </FormControl>

        <FormControl>
          <FormControl.Label>
            <Text style={styles.label}>ID Number</Text>
          </FormControl.Label>
          <Input
            value={idNumber}
            onChangeText={setIdNumber}
            placeholder="Enter ID number"
            backgroundColor={COLORS.lightGreen}
            borderColor="gray.300"
            p={3}
            borderRadius="md"
          />
        </FormControl>

        <FormControl isRequired>
          <FormControl.Label>
            <Text style={styles.label}>Date of Employment</Text>
          </FormControl.Label>
          <Pressable onPress={() => setShowEmploymentDatePicker(true)}>
            <Input
              value={dateOfEmployment}
              placeholder="DD/MM/YYYY"
              borderColor="gray.300"
              p={3}
              backgroundColor={COLORS.lightGreen}
              borderRadius="md"
              isReadOnly
              InputRightElement={
                <IconButton
                  icon={
                    <FastImage
                      source={icons.calendar}
                      style={{ width: 24, height: 24 }}
                    />
                  }
                  onPress={() => setShowEmploymentDatePicker(true)}
                />
              }
            />
          </Pressable>
        </FormControl>

        {showEmploymentDatePicker && (
          <DateTimePicker
            testID="employmentDatePicker"
            value={employmentDateObj}
            mode="date"
            display="default"
            onChange={onEmploymentDateChange}
          />
        )}

        <FormControl isRequired>
          <FormControl.Label>
            <Text style={styles.label}>End Date</Text>
          </FormControl.Label>
          <Pressable onPress={() => setShowEndDatePicker(true)}>
            <Input
              value={endDate}
              placeholder="DD/MM/YYYY"
              borderColor="gray.300"
              backgroundColor={COLORS.lightGreen}
              p={3}
              borderRadius="md"
              isReadOnly
              InputRightElement={
                <IconButton
                  icon={
                    <FastImage
                      source={icons.calendar}
                      style={{ width: 24, height: 24 }}
                    />
                  }
                  onPress={() => setShowEndDatePicker(true)}
                />
              }
            />
          </Pressable>
        </FormControl>

        {showEndDatePicker && (
          <DateTimePicker
            testID="endDatePicker"
            value={endDateObj}
            mode="date"
            display="default"
            onChange={onEndDateChange}
          />
        )}

        <FormControl isRequired>
          <FormControl.Label>
            <Text style={styles.label}>Type of Engagement</Text>
          </FormControl.Label>
          <Select
            selectedValue={typeOfEngagement}
            minWidth="100%"
            borderColor="gray.300"
            p={3}
            borderRadius="md"
            backgroundColor={COLORS.lightGreen}
            placeholder="Select engagement type"
            onValueChange={setTypeOfEngagement}
          >
            <Select.Item label="Full-time" value="fulltime" />
            <Select.Item label="Part-time" value="parttime" />
            <Select.Item label="Contract" value="contract" />
            <Select.Item label="Seasonal" value="seasonal" />
            <Select.Item label="Daily Worker" value="daily" />
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormControl.Label>
            <Text style={styles.label}>Work Schedule</Text>
          </FormControl.Label>
          <Select
            selectedValue={workSchedule}
            minWidth="100%"
            borderColor="gray.300"
            p={3}
            borderRadius="md"
            backgroundColor={COLORS.lightGreen}
            placeholder="Select the hours"
            onValueChange={setWorkSchedule}
          >
            <Select.Item label="Full Day (8 hours)" value="full" />
            <Select.Item label="Half Day (4 hours)" value="half" />
            <Select.Item label="Custom Hours" value="custom" />
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormControl.Label>
            <Text style={styles.label}>Role</Text>
          </FormControl.Label>
          <VStack space={2} mt={1}>
            <Checkbox
              value="cleaner"
              colorScheme="green"
              onChange={() => handleRoleSelect('cleaner')}
              isChecked={role === 'cleaner'}
            >
              Cleaner
            </Checkbox>
            <Checkbox
              value="feeder"
              colorScheme="green"
              onChange={() => handleRoleSelect('feeder')}
              isChecked={role === 'feeder'}
            >
              Feeder
            </Checkbox>
            <Checkbox
              value="milker"
              colorScheme="green"
              onChange={() => handleRoleSelect('milker')}
              isChecked={role === 'milker'}
            >
              Milker
            </Checkbox>
            <Checkbox
              value="custom"
              colorScheme="green"
              onChange={() => handleRoleSelect('custom')}
              isChecked={role === 'custom'}
            >
              Create new role
            </Checkbox>
          </VStack>

          {showCustomRole && (
            <FormControl mt={2} isRequired>
              <FormControl.Label>
                <Text style={styles.label}>Role Name</Text>
              </FormControl.Label>
              <Input
                value={customRole}
                onChangeText={setCustomRole}
                placeholder="role/title"
                borderColor="gray.300"
                p={3}
                backgroundColor={COLORS.lightGreen}
                borderRadius="md"
              />
            </FormControl>
          )}
        </FormControl>

        <FormControl isRequired>
          <FormControl.Label>
            <Text style={styles.label}>Salary (Kenya Shillings)</Text>
          </FormControl.Label>
          <Input
            value={salary}
            onChangeText={setSalary}
            placeholder="11,000"
            keyboardType="numeric"
            borderColor="gray.300"
            backgroundColor={COLORS.lightGreen}
            p={3}
            borderRadius="md"
          />
        </FormControl>

        <HStack justifyContent="space-between" mt={4} mb={8}>
          <Button
            variant="outline"
            borderColor={COLORS.green}
            onPress={() => navigation.goBack()}
            borderRadius="md"
            width="120px"
          >
            Back
          </Button>
          <Button
            backgroundColor={COLORS.green}
            onPress={handleSubmit}
            borderRadius="md"
            width="120px"
          >
            Submit
          </Button>
        </HStack>
      </VStack>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.lightGreen }}>
      <SecondaryHeader title={employeeType === 'casual' ? "Register Employee (Casual)" : `Register Employee Step ${currentStep}`} />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 20,
        }}
      >
        <Box bg="white" p={4} mx={4} mt={4} borderRadius={12} shadow={1}>
          <Text style={styles.subtitleText}>
            Please fill out this form with the required information
          </Text>

          {employeeType === 'permanent' && renderStepIndicator()}

          {employeeType === 'permanent' && currentStep === 1 && renderPersonalInformationForm()}
          {employeeType === 'permanent' && currentStep === 2 && renderProfessionalInformationForm()}
          {employeeType === 'casual' && renderCasualEmployeeForm()}
        </Box>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}>
        <Modal.Content maxWidth="85%" borderRadius={12} p={5}>
          <Modal.Body alignItems="center">
            <View style={styles.iconContainer}>
              <FastImage
                source={icons.tick}
                style={styles.tickIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.modalText}>
              Employee has been registered successfully!
            </Text>
          </Modal.Body>
          <Modal.Footer justifyContent="center">
            <HStack space={4}>
              <Button
                variant="outline"
                borderColor={COLORS.green}
                style={styles.modalButton}
                onPress={() => {
                  setShowSuccessModal(false);
                  navigation.navigate("FarmEmployeeTableScreen");
                }}>
                View Employees
              </Button>
              <Button
                backgroundColor={COLORS.green}
                style={styles.modalButton}
                onPress={() => {
                  setShowSuccessModal(false);
                  setCurrentStep(1);
                  setFirstName('');
                  setMiddleName('');
                  setLastName('');
                  setPhone('');
                  setEmergencyContact('');
                  setIdNumber('');
                  setDateOfEmployment('');
                  setSelectedRoles([]);
                  setCustomRole('');
                  setShowCustomRole(false);
                  setPaymentSchedule('daily');
                  setSalary('');
                  setWorkSchedule('');
                  setSelectedBenefits({
                    paye: false,
                    nssf: false,
                    nhif: false,
                    housingLevy: false,
                    customBenefit: false
                  });
                  setCustomBenefitName('');
                  setCustomBenefitAmount('');
                }}>
                Add Another
              </Button>
            </HStack>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  titleText: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
    marginTop: 8,
    textAlign: "center",
  },
  subtitleText: {
    fontSize: 14,
    color: COLORS.darkGray3,
    marginBottom: 8,
    textAlign: "center",
  },
  stepIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepLabel: {
    fontSize: 12,
    color: COLORS.darkGray3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.darkGray3,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: COLORS.darkGray3,
    marginBottom: 4,
  },
  uploadBox: {
    height: 50,
    borderWidth: 1,
    borderColor: "gray.300",
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  uploadIDBox: {
    width: '80%',
    height: 150,
    borderWidth: 2,
    borderColor: COLORS.green,
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGreen,
    marginTop: 20,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.darkGray3,
    textAlign: "center",
  },
  uploadSubtext: {
    fontSize: 14,
    color: COLORS.darkGray3,
    textAlign: "center",
    marginHorizontal: 20,
  },
  modalButton: {
    width: 120,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.green,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  tickIcon: {
    width: 40,
    height: 40,
    tintColor: COLORS.white,
  },
  modalText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.darkGray3,
    marginTop: 10,
  },
});