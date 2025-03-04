import React, { useState } from 'react';
import {
  Box,
  Text,
  Input,
  Button,
  VStack,
  Select,
  HStack,
  ScrollView,
  Modal,
} from 'native-base';
import { View, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import SecondaryHeader from '../../components/headers/secondary-header';
import { COLORS } from '../../constants/theme';
import { icons } from '../../constants'; 

export default function AddEmployeeScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfEmployment, setDateOfEmployment] = useState('');
  const [paymentRate, setPaymentRate] = useState('');
  const [workingHour, setWorkingHour] = useState('');
  const [position, setPosition] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const handleSubmit = () => {
    setShowSuccessModal(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.lightGreen }}>
      <SecondaryHeader title="Add Employee" />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          marginTop: 5,
        }}>
        <Box bg="white" p={6} borderRadius={8} shadow={1} mx={6} my={8}>
          <Text style={styles.titleText}>
            Please fill in the employee details.
          </Text>

          <VStack space={5}>
            <Box>
              <Text style={styles.label}>Full Name</Text>
              <Input
                value={fullName}
                onChangeText={setFullName}
                placeholder="Full Name"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
              />
            </Box>

            <Box>
              <Text style={styles.label}>Phone Number</Text>
              <Input
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone Number"
                keyboardType="phone-pad"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
              />
            </Box>

            <Box>
              <Text style={styles.label}>Date of Employment</Text>
              <Input
                value={dateOfEmployment}
                onChangeText={setDateOfEmployment}
                placeholder="Enter Employment Date"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
              />
            </Box>

            <Box>
              <Text style={styles.label}>Emergency Contact</Text>
              <Input
                value={emergencyContact}
                onChangeText={setEmergencyContact}
                placeholder="Emergency Contact"
                keyboardType="phone-pad"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
              />
            </Box>

            <Box>
              <Text style={styles.label}>Employment Type</Text>
              <Select
                selectedValue={employmentType}
                minWidth="100%"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Select Employment Type"
                onValueChange={setEmploymentType}>
                <Select.Item label="Permanent" value="permanent" />
                <Select.Item label="Contractual" value="contractual" />
              </Select>
            </Box>

            <Box>
              <Text style={styles.label}>Position</Text>
              <Input
                value={position}
                onChangeText={setPosition}
                placeholder="Position"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
              />
            </Box>

            <Box>
              <Text style={styles.label}>Working Hours</Text>
              <Select
                selectedValue={workingHour}
                minWidth="100%"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Choose Working Hours"
                onValueChange={setWorkingHour}>
                <Select.Item label="Full-Time" value="full-time" />
                <Select.Item label="Part-Time" value="part-time" />
                <Select.Item label="Seasonal" value="seasonal" />
              </Select>
            </Box>

            <Box>
              <Text style={styles.label}>Payment Rate</Text>
              <Input
                value={paymentRate}
                onChangeText={setPaymentRate}
                placeholder="Payment Rate"
                keyboardType="numeric"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
              />
            </Box>
          </VStack>

          <HStack justifyContent="center" mt={6} space={4}>
            <Button
              variant="outline"
              borderColor={COLORS.green}
              style={styles.largeButton}
              onPress={() => navigation.goBack()}>
              Back
            </Button>
            <Button
              backgroundColor={COLORS.green}
              style={styles.largeButton}
              onPress={handleSubmit}>
              Submit
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
              Your Employee has been updated successfully!
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
                Cancel
              </Button>
              <Button
                backgroundColor={COLORS.green}
                style={styles.modalButton}
                onPress={() => {
                  setShowSuccessModal(false);
                  setFullName('');
                  setPhone('');
                  setDateOfEmployment('');
                  setPaymentRate('');
                  setWorkingHour('');
                  setPosition('');
                  setEmploymentType('');
                  setEmergencyContact('');
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
    fontSize: 18,
    fontWeight: "bold",
    color:COLORS.black,
    marginBottom: 16,
    textAlign: "center", 
    alignSelf: "center", 
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
    tintColor:COLORS.white,
  },
  modalText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.darkGray3,
    marginTop: 10,
  },
});