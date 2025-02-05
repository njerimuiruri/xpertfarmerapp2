import React, { useState } from "react";
import {
  Box,
  Text,
  Input,
  Button,
  VStack,
  Select,
  Checkbox,
  HStack,
  ScrollView,
  Switch,
} from "native-base";
import FastImage from "react-native-fast-image";
import DateTimePicker from '@react-native-community/datetimepicker';
import SecondaryHeader from "../../components/headers/secondary-header";
import { View } from "react-native";
import { icons } from "../../constants";
import { COLORS } from '../../constants/theme';

export default function AddEmployeeScreen({ navigation }) {
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
    <View style={{ flex: 1, backgroundColor: COLORS.lightGreen }}>
      <SecondaryHeader title="Add Employee" />
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', marginTop: 5 }}>
        <Box bg="white" p={6} borderRadius={8} shadow={1} mx={6} my={8}>
          <Text
            style={{
              fontSize: 16,
              color: 'black',
              marginBottom: 16,
              textAlign: 'center',
            }}>
            Please fill in the employee details.
          </Text>

          <VStack space={5}>
            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Full Name
              </Text>
              <Input
                value={fullName}
                onChangeText={setFullName}
                placeholder="Full Name"
                backgroundColor={COLORS.lightGreen}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Phone Number
              </Text>
              <Input
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone Number"
                keyboardType="phone-pad"
                backgroundColor={COLORS.lightGreen}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Date of Employment
              </Text>
              <Input
                value={dateOfEmployment}
                isReadOnly
                placeholder="Select Date"
                onTouchStart={() => setShowDatePicker(true)}
                backgroundColor={COLORS.lightGreen}
              />
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  onChange={onDateChange}
                />
              )}
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Emergency Contact
              </Text>
              <Input
                value={emergencyContact}
                onChangeText={setEmergencyContact}
                placeholder="Emergency Contact"
                keyboardType="phone-pad"
                backgroundColor={COLORS.lightGreen}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Employment Type
              </Text>
              <Select
                selectedValue={employmentType}
                minWidth="100%"
                backgroundColor={COLORS.lightGreen}
                placeholder="Select Employment Type"
                _selectedItem={{
                  bg: "teal.600",
                  endIcon: (
                    <FastImage
                      source={icons.right_arrow}
                      className="w-[20px] h-[20px]"
                      tintColor='white'
                    />
                  ),
                }}
                onValueChange={setEmploymentType}>
                <Select.Item label="Permanent" value="permanent" />
                <Select.Item label="Contractual" value="contractual" />
              </Select>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Position
              </Text>
              <Input
                value={position}
                onChangeText={setPosition}
                placeholder="Position"
                backgroundColor={COLORS.lightGreen}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Working Hours
              </Text>
              <Select
                selectedValue={workingHour}
                minWidth="100%"
                backgroundColor={COLORS.lightGreen}
                placeholder="Choose Working Hours"
                _selectedItem={{
                  bg: 'teal.600',
                  endIcon: <FastImage source={icons.right_arrow} className="w-[20px] h-[20px]" tintColor='white' />
                }}
                onValueChange={setWorkingHour}>
                <Select.Item label="Full-Time" value="full-time" />
                <Select.Item label="Part-Time" value="part-time" />
                <Select.Item label="Seasonal" value="seasonal" />
              </Select>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                Payment Rate
              </Text>
              <Input
                value={paymentRate}
                onChangeText={setPaymentRate}
                placeholder="Payment Rate"
                keyboardType="numeric"
                backgroundColor={COLORS.lightGreen}
              />
            </Box>
          </VStack>

          <HStack justifyContent="center" mt={6} space={4}>
            <Button
              variant="outline"
              borderWidth={1}
              borderColor={COLORS.green}
              borderRadius={8}
              px={6}
              py={3}
              onPress={() => navigation.goBack()}>
              Back
            </Button>
            <Button
              backgroundColor={COLORS.green}
              borderRadius={8}
              px={6}
              py={3}
              _pressed={{
                bg: 'emerald.700',
              }}>
              Submit
            </Button>
          </HStack>
        </Box>
        <View className="h-[60px] bg-white" />
      </ScrollView>
    </View>
  );
}