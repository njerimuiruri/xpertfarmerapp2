import React, { useState, useEffect } from 'react';
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
  FormControl,
  IconButton,
  useToast,
} from 'native-base';
import { View, StyleSheet, Alert } from 'react-native';
import FastImage from 'react-native-fast-image';
import SecondaryHeader from '../../components/headers/secondary-header';
import { COLORS } from '../../constants/theme';
import { icons } from '../../constants';
import { updateEmployee, getEmployeeById, formatEmployeeData } from '../../services/employees';

const EditEmployeeScreen = ({ navigation, route }) => {
  const toast = useToast();
  const employeeId = route.params?.employeeId;

  // Personal Information
  const [employeeType, setEmployeeType] = useState('permanent');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [idNumber, setIdNumber] = useState('');

  // Professional Information
  const [dateOfEmployment, setDateOfEmployment] = useState('');
  const [role, setRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [showCustomRole, setShowCustomRole] = useState(false);
  const [paymentSchedule, setPaymentSchedule] = useState('daily');
  const [salary, setSalary] = useState('');
  const [workSchedule, setWorkSchedule] = useState('');
  const [endDate, setEndDate] = useState('');
  const [typeOfEngagement, setTypeOfEngagement] = useState('');

  // Benefits and statutory deductions
  const [selectedBenefits, setSelectedBenefits] = useState({
    paye: false,
    nssf: false,
    nhif: false,
    housingLevy: false,
    customBenefit: false
  });
  const [customBenefitName, setCustomBenefitName] = useState('');
  const [customBenefitAmount, setCustomBenefitAmount] = useState('');

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load employee data on component mount
  useEffect(() => {
    const loadEmployeeData = async () => {
      if (!employeeId) {
        Alert.alert('Error', 'No employee ID provided');
        navigation.goBack();
        return;
      }

      try {
        setInitialLoading(true);
        const employeeData = await getEmployeeById(employeeId);

        // Populate form fields with existing data
        setEmployeeType(employeeData.employeeType || 'permanent');
        setFirstName(employeeData.firstName || '');
        setMiddleName(employeeData.middleName || '');
        setLastName(employeeData.lastName || '');
        setPhone(employeeData.phone || '');
        setEmergencyContact(employeeData.emergencyContact || '');
        setIdNumber(employeeData.idNumber || '');
        setDateOfEmployment(employeeData.dateOfEmployment || '');
        setRole(employeeData.role || '');
        setPaymentSchedule(employeeData.paymentSchedule || 'daily');
        setSalary(employeeData.salary?.toString() || '');
        setWorkSchedule(employeeData.workSchedule || '');
        setEndDate(employeeData.endDate || '');
        setTypeOfEngagement(employeeData.typeOfEngagement || '');

        // Handle custom role
        if (employeeData.role && !['cleaner', 'feeder', 'milker'].includes(employeeData.role)) {
          setRole('custom');
          setCustomRole(employeeData.role);
          setShowCustomRole(true);
        }

        // Handle benefits
        if (employeeData.benefits && employeeData.benefits.length > 0) {
          const benefits = {
            paye: false,
            nssf: false,
            nhif: false,
            housingLevy: false,
            customBenefit: false
          };

          employeeData.benefits.forEach(benefit => {
            if (['paye', 'nssf', 'nhif', 'housingLevy'].includes(benefit.name)) {
              benefits[benefit.name] = true;
            } else {
              benefits.customBenefit = true;
              setCustomBenefitName(benefit.name);
              setCustomBenefitAmount(benefit.amount?.toString() || '');
            }
          });

          setSelectedBenefits(benefits);
        }

      } catch (error) {
        console.error('Error loading employee data:', error);
        toast.show({
          title: "Error",
          description: "Failed to load employee data",
          status: "error"
        });
        navigation.goBack();
      } finally {
        setInitialLoading(false);
      }
    };

    loadEmployeeData();
  }, [employeeId]);

  // Handle role selection
  const handleRoleSelect = (roleName) => {
    if (roleName === 'custom') {
      setShowCustomRole(true);
      setRole('custom');
    } else {
      setShowCustomRole(false);
      setRole(roleName);
      setCustomRole('');
    }
  };

  const validateForm = () => {
    if (!firstName.trim()) {
      toast.show({
        title: "Validation Error",
        description: "First name is required",
        status: "error"
      });
      return false;
    }

    if (!lastName.trim()) {
      toast.show({
        title: "Validation Error",
        description: "Last name is required",
        status: "error"
      });
      return false;
    }

    if (!phone.trim()) {
      toast.show({
        title: "Validation Error",
        description: "Phone number is required",
        status: "error"
      });
      return false;
    }

    if (!dateOfEmployment.trim()) {
      toast.show({
        title: "Validation Error",
        description: "Date of employment is required",
        status: "error"
      });
      return false;
    }

    if (!role.trim()) {
      toast.show({
        title: "Validation Error",
        description: "Role is required",
        status: "error"
      });
      return false;
    }

    if (role === 'custom' && !customRole.trim()) {
      toast.show({
        title: "Validation Error",
        description: "Custom role name is required",
        status: "error"
      });
      return false;
    }

    if (!salary.trim()) {
      toast.show({
        title: "Validation Error",
        description: "Salary is required",
        status: "error"
      });
      return false;
    }

    if (selectedBenefits.customBenefit && !customBenefitName.trim()) {
      toast.show({
        title: "Validation Error",
        description: "Custom benefit name is required",
        status: "error"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Prepare form data
      const formData = {
        firstName: firstName.trim(),
        middleName: middleName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        emergencyContact: emergencyContact.trim(),
        idNumber: idNumber.trim(),
        dateOfEmployment: dateOfEmployment.trim(),
        role,
        customRole: customRole.trim(),
        paymentSchedule,
        salary: salary.trim(),
        workSchedule,
        endDate: endDate.trim(),
        typeOfEngagement: typeOfEngagement.trim(),
        selectedBenefits,
        customBenefitName: customBenefitName.trim(),
        customBenefitAmount: customBenefitAmount.trim(),
      };

      // Format the data using the existing formatEmployeeData function
      const formattedData = formatEmployeeData(formData, employeeType);

      // Call the update API
      const result = await updateEmployee(employeeId, formattedData);

      if (result.error) {
        toast.show({
          title: "Update Failed",
          description: result.error,
          status: "error"
        });
        return;
      }

      // Show success modal
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Error updating employee:', error);
      toast.show({
        title: "Error",
        description: "Failed to update employee. Please try again.",
        status: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.lightGreen, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading employee data...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.lightGreen }}>
      <SecondaryHeader title="Edit Employee" />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          marginTop: 5,
          paddingBottom: 20,
        }}>
        <Box bg="white" p={6} borderRadius={8} shadow={1} mx={6} my={4}>
          <Text style={styles.titleText}>
            Edit Employee Details
          </Text>

          <VStack space={4} mt={4}>
            {/* Employee Type */}
            <FormControl>
              <FormControl.Label>
                <Text style={styles.label}>Employee Type</Text>
              </FormControl.Label>
              <Radio.Group
                name="employeeType"
                value={employeeType}
                onChange={value => setEmployeeType(value)}
                mt={1}
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

            {/* Personal Information */}
            <FormControl>
              <FormControl.Label>
                <Text style={styles.label}>First Name *</Text>
              </FormControl.Label>
              <Input
                value={firstName}
                onChangeText={setFirstName}
                placeholder="John"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
              />
            </FormControl>

            <FormControl>
              <FormControl.Label>
                <Text style={styles.label}>Middle Name</Text>
              </FormControl.Label>
              <Input
                value={middleName}
                onChangeText={setMiddleName}
                placeholder="Middle Name"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
              />
            </FormControl>

            <FormControl>
              <FormControl.Label>
                <Text style={styles.label}>Last Name *</Text>
              </FormControl.Label>
              <Input
                value={lastName}
                onChangeText={setLastName}
                placeholder="Doe"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
              />
            </FormControl>

            <FormControl>
              <FormControl.Label>
                <Text style={styles.label}>Phone Number *</Text>
              </FormControl.Label>
              <Input
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone Number"
                keyboardType="phone-pad"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
              />
            </FormControl>

            {employeeType === 'permanent' && (
              <FormControl>
                <FormControl.Label>
                  <Text style={styles.label}>Emergency Contact</Text>
                </FormControl.Label>
                <Input
                  value={emergencyContact}
                  onChangeText={setEmergencyContact}
                  placeholder="Emergency Contact"
                  keyboardType="phone-pad"
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                />
              </FormControl>
            )}

            <FormControl>
              <FormControl.Label>
                <Text style={styles.label}>ID Number</Text>
              </FormControl.Label>
              <Input
                value={idNumber}
                onChangeText={setIdNumber}
                placeholder="ID Number"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
              />
            </FormControl>

            {/* Professional Information */}
            <FormControl>
              <FormControl.Label>
                <Text style={styles.label}>Date of Employment *</Text>
              </FormControl.Label>
              <Input
                value={dateOfEmployment}
                onChangeText={setDateOfEmployment}
                placeholder="DD/MM/YYYY"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                InputRightElement={
                  <IconButton
                    icon={
                      <FastImage
                        source={icons.calendar}
                        style={{ width: 24, height: 24 }}
                      />
                    }
                    onPress={() => console.log("Open date picker")}
                  />
                }
              />
            </FormControl>

            <FormControl>
              <FormControl.Label>
                <Text style={styles.label}>Role *</Text>
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
                <FormControl mt={2}>
                  <FormControl.Label>
                    <Text style={styles.label}>Role Name *</Text>
                  </FormControl.Label>
                  <Input
                    value={customRole}
                    onChangeText={setCustomRole}
                    placeholder="role/title"
                    backgroundColor={COLORS.lightGreen}
                    borderColor="gray.200"
                  />
                </FormControl>
              )}
            </FormControl>

            {employeeType === 'permanent' && (
              <FormControl>
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
            )}

            {employeeType === 'casual' && (
              <>
                <FormControl>
                  <FormControl.Label>
                    <Text style={styles.label}>Work Schedule</Text>
                  </FormControl.Label>
                  <Select
                    selectedValue={workSchedule}
                    minWidth="100%"
                    backgroundColor={COLORS.lightGreen}
                    borderColor="gray.200"
                    placeholder="Select the hours"
                    onValueChange={setWorkSchedule}
                  >
                    <Select.Item label="Full Day (8 hours)" value="full" />
                    <Select.Item label="Half Day (4 hours)" value="half" />
                    <Select.Item label="Custom Hours" value="custom" />
                  </Select>
                </FormControl>

                <FormControl>
                  <FormControl.Label>
                    <Text style={styles.label}>End Date</Text>
                  </FormControl.Label>
                  <Input
                    value={endDate}
                    onChangeText={setEndDate}
                    placeholder="DD/MM/YYYY"
                    backgroundColor={COLORS.lightGreen}
                    borderColor="gray.200"
                  />
                </FormControl>

                <FormControl>
                  <FormControl.Label>
                    <Text style={styles.label}>Type of Engagement</Text>
                  </FormControl.Label>
                  <Input
                    value={typeOfEngagement}
                    onChangeText={setTypeOfEngagement}
                    placeholder="Type of Engagement"
                    backgroundColor={COLORS.lightGreen}
                    borderColor="gray.200"
                  />
                </FormControl>
              </>
            )}

            <FormControl>
              <FormControl.Label>
                <Text style={styles.label}>Salary (Kenya Shillings) *</Text>
              </FormControl.Label>
              <Input
                value={salary}
                onChangeText={setSalary}
                placeholder="11,000"
                keyboardType="numeric"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
              />
            </FormControl>

            {employeeType === 'permanent' && (
              <FormControl>
                <FormControl.Label>
                  <Text style={styles.label}>Statutory and Benefits</Text>
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
                    <FormControl>
                      <FormControl.Label>
                        <Text style={styles.label}>Benefit Name *</Text>
                      </FormControl.Label>
                      <Input
                        value={customBenefitName}
                        onChangeText={setCustomBenefitName}
                        placeholder="Benefit Name"
                        backgroundColor={COLORS.lightGreen}
                        borderColor="gray.200"
                      />
                    </FormControl>

                    <FormControl>
                      <FormControl.Label>
                        <Text style={styles.label}>Amount</Text>
                      </FormControl.Label>
                      <Input
                        value={customBenefitAmount}
                        onChangeText={setCustomBenefitAmount}
                        placeholder="5,000"
                        keyboardType="numeric"
                        backgroundColor={COLORS.lightGreen}
                        borderColor="gray.200"
                      />
                    </FormControl>
                  </VStack>
                )}
              </FormControl>
            )}
          </VStack>

          <HStack justifyContent="center" mt={6} space={4}>
            <Button
              variant="outline"
              borderColor={COLORS.green}
              style={styles.largeButton}
              onPress={() => navigation.goBack()}
              isDisabled={loading}>
              Cancel
            </Button>
            <Button
              backgroundColor={COLORS.green}
              style={styles.largeButton}
              onPress={handleSubmit}
              isLoading={loading}
              isDisabled={loading}>
              {loading ? 'Updating...' : 'Update'}
            </Button>
          </HStack>
        </Box>
      </ScrollView>

      {/* Employee Updated Successfully Modal */}
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
              Employee has been updated successfully!
            </Text>
          </Modal.Body>
          <Modal.Footer justifyContent="center">
            <Button
              backgroundColor={COLORS.green}
              style={styles.modalButton}
              onPress={() => {
                setShowSuccessModal(false);
                navigation.navigate("FarmEmployeeTableScreen");
              }}>
              Done
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  titleText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "center",
    alignSelf: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.darkGray3,
    marginBottom: 4,
  },
  modalButton: {
    width: 120,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
  },
  largeButton: {
    width: 160,
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 16,
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

export default EditEmployeeScreen;