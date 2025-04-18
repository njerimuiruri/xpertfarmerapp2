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
  FormControl,
  IconButton,
} from 'native-base';
import { View, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import SecondaryHeader from '../../components/headers/secondary-header';
import { COLORS } from '../../constants/theme';
import { icons } from '../../constants';

const EditEmployeeScreen = ({ navigation, route }) => {
  // Assuming employee data is passed as a parameter from previous screen
  // For demonstration, initializing with sample data
  // In a real app, you would use: const employeeData = route.params?.employeeData || {};
  
  const employeeData = {
    employeeType: 'permanent',
    firstName: 'John',
    middleName: '',
    lastName: 'Doe',
    phone: '0707123456',
    emergencyContact: '0712345678',
    idNumber: '12345678',
    dateOfEmployment: '01/01/2023',
    role: 'milker',
    customRole: '',
    paymentSchedule: 'monthly',
    salary: '11000',
    workSchedule: 'full',
    selectedBenefits: {
      paye: true,
      nssf: true,
      nhif: true,
      housingLevy: false,
      customBenefit: false
    },
    customBenefitName: '',
    customBenefitAmount: '',
  };

  // Personal Information
  const [employeeType, setEmployeeType] = useState(employeeData.employeeType || 'permanent');
  const [firstName, setFirstName] = useState(employeeData.firstName || '');
  const [middleName, setMiddleName] = useState(employeeData.middleName || '');
  const [lastName, setLastName] = useState(employeeData.lastName || '');
  const [phone, setPhone] = useState(employeeData.phone || '');
  const [emergencyContact, setEmergencyContact] = useState(employeeData.emergencyContact || '');
  const [idNumber, setIdNumber] = useState(employeeData.idNumber || '');
  
  // Professional Information
  const [dateOfEmployment, setDateOfEmployment] = useState(employeeData.dateOfEmployment || '');
  const [role, setRole] = useState(employeeData.role || '');
  const [customRole, setCustomRole] = useState(employeeData.customRole || '');
  const [showCustomRole, setShowCustomRole] = useState(employeeData.role === 'custom');
  const [paymentSchedule, setPaymentSchedule] = useState(employeeData.paymentSchedule || 'daily');
  const [salary, setSalary] = useState(employeeData.salary || '');
  const [workSchedule, setWorkSchedule] = useState(employeeData.workSchedule || '');
  
  // Benefits and statutory deductions
  const [selectedBenefits, setSelectedBenefits] = useState(employeeData.selectedBenefits || {
    paye: false,
    nssf: false,
    nhif: false,
    housingLevy: false,
    customBenefit: false
  });
  const [customBenefitName, setCustomBenefitName] = useState(employeeData.customBenefitName || '');
  const [customBenefitAmount, setCustomBenefitAmount] = useState(employeeData.customBenefitAmount || '');
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Handle role selection
  const handleRoleSelect = (roleName) => {
    if (roleName === 'custom') {
      setShowCustomRole(true);
      setRole('custom');
    } else {
      setShowCustomRole(false);
      setRole(roleName);
    }
  };
  
  const handleSubmit = () => {
    // Here you would implement the API call to update the employee data
    // This would include all the state values collected above
    setShowSuccessModal(true);
  };

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
                <Text style={styles.label}>First Name</Text>
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
                <Text style={styles.label}>Last Name</Text>
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
                <Text style={styles.label}>Phone Number</Text>
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
                <Text style={styles.label}>Date of Employment</Text>
              </FormControl.Label>
              <Input
                value={dateOfEmployment}
                onChangeText={setDateOfEmployment}
                placeholder="__/__/____"
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
                <FormControl mt={2}>
                  <FormControl.Label>
                    <Text style={styles.label}>Role Name</Text>
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
            )}

            <FormControl>
              <FormControl.Label>
                <Text style={styles.label}>Salary (Kenya Shillings)</Text>
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
                    onChange={(isSelected) => setSelectedBenefits({...selectedBenefits, paye: isSelected})}
                    isChecked={selectedBenefits.paye}
                  >
                    PAYE
                  </Checkbox>
                  <Checkbox 
                    value="nssf" 
                    colorScheme="green"
                    onChange={(isSelected) => setSelectedBenefits({...selectedBenefits, nssf: isSelected})}
                    isChecked={selectedBenefits.nssf}
                  >
                    NSSF
                  </Checkbox>
                  <Checkbox 
                    value="nhif" 
                    colorScheme="green"
                    onChange={(isSelected) => setSelectedBenefits({...selectedBenefits, nhif: isSelected})}
                    isChecked={selectedBenefits.nhif}
                  >
                    NHIF
                  </Checkbox>
                  <Checkbox 
                    value="housingLevy" 
                    colorScheme="green"
                    onChange={(isSelected) => setSelectedBenefits({...selectedBenefits, housingLevy: isSelected})}
                    isChecked={selectedBenefits.housingLevy}
                  >
                    Housing Levy
                  </Checkbox>
                  <Checkbox 
                    value="customBenefit" 
                    colorScheme="green"
                    onChange={(isSelected) => setSelectedBenefits({...selectedBenefits, customBenefit: isSelected})}
                    isChecked={selectedBenefits.customBenefit}
                  >
                    Add Benefit +
                  </Checkbox>
                </VStack>

                {selectedBenefits.customBenefit && (
                  <VStack space={3} mt={3}>
                    <FormControl>
                      <FormControl.Label>
                        <Text style={styles.label}>Benefit Name</Text>
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
              onPress={() => navigation.goBack()}>
              Cancel
            </Button>
            <Button
              backgroundColor={COLORS.green}
              style={styles.largeButton}
              onPress={handleSubmit}>
              Update
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