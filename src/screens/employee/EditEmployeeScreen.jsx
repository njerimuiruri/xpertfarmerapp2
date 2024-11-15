import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Input, Button, Select, Modal, Box } from "native-base";
import SecondaryHeader from "../../components/headers/secondary-header";
import { icons } from "../../constants";
import FastImage from "react-native-fast-image";

const EditEmployeeScreen = ({ navigation }) => {
  const employeeData = {
    employeeId: "E12345",
    farmId: "F67890",
    fullName: "John Doe",
    phone: "123-456-7890",
    address: "123 Farm Lane",
    dateOfEmployment: "01/01/2020",
    emergencyContact: "Jane Doe",
    position: "Farm Manager",
    employmentType: "Permanent",
    workingHours: "Full-Time",
    paymentRate: "20.00"
  };

  const [fullName, setFullName] = useState(employeeData.fullName);
  const [phone, setPhone] = useState(employeeData.phone);
  const [dateOfEmployment, setDateOfEmployment] = useState(employeeData.dateOfEmployment);
  const [emergencyContact, setEmergencyContact] = useState(employeeData.emergencyContact);
  const [position, setPosition] = useState(employeeData.position);
  const [employmentType, setEmploymentType] = useState(employeeData.employmentType);
  const [workingHours, setWorkingHours] = useState(employeeData.workingHours);
  const [paymentRate, setPaymentRate] = useState(employeeData.paymentRate);


  return (
    <View className="bg-white flex-1">
      <SecondaryHeader title="Edit Employee" />
      <View className="p-4">
        <View style={styles.formField}>
          <Text style={styles.label}>Full Name</Text>
          <Input
            value={fullName}
            onChangeText={setFullName}
            placeholder="Full Name"
            style={styles.input}
            backgroundColor="#e8f5e9"
          />
        </View>

        <View style={styles.formField}>
          <Text style={styles.label}>Phone Number</Text>
          <Input
            value={phone}
            onChangeText={setPhone}
            placeholder="Phone Number"
            keyboardType="phone-pad"
            style={styles.input}
            backgroundColor="#e8f5e9"
          />
        </View>

        <View style={styles.formField}>
          <Text style={styles.label}>Emergency Contact</Text>
          <Input
            value={emergencyContact}
            onChangeText={setEmergencyContact}
            placeholder="Emergency Contact"
            keyboardType="phone-pad"
            style={styles.input}
            backgroundColor="#e8f5e9"
          />
        </View>

        <View style={styles.formField}>
          <Text style={styles.label}>Date of Employment</Text>
          <Input
            value={dateOfEmployment}
            onChangeText={setDateOfEmployment}
            placeholder="DD/MM/YY"
            style={styles.input}
            backgroundColor="#e8f5e9"
          />
        </View>

        <View style={styles.formField}>
          <Text style={styles.label}>Position</Text>
          <Input
            value={position}
            onChangeText={setPosition}
            placeholder="Position"
            style={styles.input}
            backgroundColor="#e8f5e9"
          />
        </View>

        <View style={styles.formField}>
          <Text style={styles.label}>Employment Type</Text>
          <Select
            selectedValue={employmentType}
            minWidth="200"
            accessibilityLabel="Select Employment Type"
            placeholder="Select Employment Type"
            _selectedItem={{
              bg: "teal.600",
              endIcon: <FastImage source={icons.right_arrow} className="w-[20px] h-[20px]" tintColor='white' />

            }}
            mt={1}
            onValueChange={setEmploymentType}
          >
            <Select.Item label="Permanent" value="permanent" />
            <Select.Item label="Contractual" value="contractual" />
          </Select>
        </View>

        <View style={styles.formField}>
          <Text style={styles.label}>Working Hours</Text>
          <Select
            selectedValue={workingHours}
            minWidth="200"
            accessibilityLabel="Choose Working Hours"
            placeholder="Choose Working Hours"
            _selectedItem={{
              bg: "teal.600",
              endIcon: <FastImage source={icons.right_arrow} className="w-[20px] h-[20px]" tintColor='white' />

            }}
            mt={1}
            onValueChange={setWorkingHours}
          >
            <Select.Item label="Full-Time" value="full-time" />
            <Select.Item label="Part-Time Morning and Evening" value="part-time-morning-evening" />
            <Select.Item label="Weekends Only" value="weekends-only" />
            <Select.Item label="Seasonal (Harvest Periods)" value="seasonal" />
          </Select>
        </View>

        <View style={styles.formField}>
          <Text style={styles.label}>Payment Rate</Text>
          <Input
            value={paymentRate}
            onChangeText={setPaymentRate}
            placeholder="Payment Rate"
            keyboardType="numeric"
            style={styles.input}
            backgroundColor="#e8f5e9"
          />
        </View>

        <Button className="bg-emerald-600 rounded-md h-12 justify-center">
          <Text className="text-white font-semibold">Save Changes</Text>
        </Button>
      </View>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e8f5e9",
  },
  scrollViewContent: {
    paddingVertical: 20,
  },
  formContainer: {
    backgroundColor: "white",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  formField: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
  },
  submitButton: {
    marginTop: 24,
    backgroundColor: "#8bc34a",
    borderRadius: 8,
    height: 45,
    justifyContent: "center",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalContainer: {
    padding: 16,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#8bc34a",
    borderRadius: 8,
    height: 45,
    width: "100%",
    justifyContent: "center",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default EditEmployeeScreen;



