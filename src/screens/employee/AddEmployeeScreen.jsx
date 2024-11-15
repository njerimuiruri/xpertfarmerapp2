import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Input, Button, Select, CheckIcon } from "native-base";
import SecondaryHeader from "../../components/headers/secondary-header";
import { icons } from "../../constants";

const AddEmployeeScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfEmployment, setDateOfEmployment] = useState("");
  const [paymentRate, setPaymentRate] = useState("");
  const [workingHour, setWorkingHour] = useState("");
  const [position, setPosition] = useState("");
  const [employmentType, setEmploymentType] = useState("");



  return (
    <View className="flex-1 bg-white">
      <SecondaryHeader title="Add Employee" />
      <View className="rounded-lg m-4">
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
          <Text style={styles.label}>Date of Employment</Text>
          <Input
            value={dateOfEmployment}
            onChangeText={setDateOfEmployment}
            placeholder="DD/MM/YY"
            style={styles.input}
            backgroundColor="#e8f5e9"
          />
        </View>

        {/* <View style={styles.formField}>
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
        </View> */}

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
          <Text style={styles.label}>Working Hours</Text>
          <Select
            selectedValue={workingHour}
            minWidth="200"
            accessibilityLabel="Choose Working Hours"
            placeholder="Choose Working Hours"
            _selectedItem={{
              bg: 'teal.600',
              endIcon: <CheckIcon size="5" />,
            }}
            _light={{
              bg: 'coolGray.100',
              _hover: {
                bg: 'coolGray.200',
              },
              _focus: {
                bg: 'coolGray.200:alpha.70',
              },
            }}
            _dark={{
              bg: 'coolGray.800',
              _hover: {
                bg: 'coolGray.900',
              },
              _focus: {
                bg: 'coolGray.900:alpha.70',
              },
            }}
            mt={1}
            onValueChange={itemValue => setWorkingHour(itemValue)}
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

        <Button className="bg-emerald-600 border-0 py-3">
          <Text className="font-semibold text-white">Submit</Text>
        </Button>
      </View>
    </View>
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

export default AddEmployeeScreen;

