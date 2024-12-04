import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Text, Input, Button, Select, CheckIcon, Box, HStack } from "native-base";
import FastImage from "react-native-fast-image";
import DateTimePicker from '@react-native-community/datetimepicker';
import SecondaryHeader from "../../components/headers/secondary-header";
import { icons } from "../../constants";
import {COLORS} from '../../constants/theme';

const AddEmployeeScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfEmployment, setDateOfEmployment] = useState("");
  const [paymentRate, setPaymentRate] = useState("");
  const [workingHour, setWorkingHour] = useState("");
  const [position, setPosition] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      setDateOfEmployment(selectedDate.toLocaleDateString());
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: COLORS.lightGreen}}>
      <SecondaryHeader title="Add Employee" />
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <Box bg="white" p={6} borderRadius={8} shadow={1} mx={6} my={8}>
          <Text  style={{
              fontSize: 16,
              color: 'black',
              marginBottom: 16,
              textAlign: 'center',
            }}>
            Please fill in the employee details.
          </Text>

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
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Input
              value={dateOfEmployment}
              isReadOnly
              placeholder="Select Date"
              style={styles.input}
              backgroundColor="#e8f5e9"
            />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              onChange={onDateChange}
            />
          )}
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
          <HStack justifyContent="center" mt={6} space={4}>
            <Button
              variant="outline"
              borderWidth={1}
              color={COLORS.green}

              borderColor={COLORS.green}
              borderRadius={8}
              px={6}
              py={3}
              onPress={() => navigation.goBack()}
            >
              Back
            </Button>
            <Button
              bg="emerald.600"
              borderRadius={8}
              px={6}
              py={3}
              _pressed={{
               bg:COLORS.green,
              }}
            >
              Submit
            </Button>
          </HStack>
        </Box>
      </ScrollView>
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
    color: "#000",
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
  }
});

export default AddEmployeeScreen;