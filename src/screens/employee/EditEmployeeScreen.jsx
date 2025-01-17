import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Button, Box, VStack, HStack } from "native-base";
import SecondaryHeader from "../../components/headers/secondary-header";
import { COLORS } from '../../constants/theme';

const EditEmployeeScreen = ({ navigation }) => {
  const [fullName] = useState("John Doe");
  const [phone] = useState("0707");
  const [dateOfEmployment] = useState("01/01/2020");
  const [emergencyContact] = useState("Jane Doe");
  const [position] = useState("Farm Manager");
  const [employmentType] = useState("Permanent");
  const [workingHours] = useState("Full-Time");
  const [paymentRate] = useState("20.00");

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.lightGreen }}>
      <SecondaryHeader title="Edit Employee" />
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', marginTop: -10 }}>
        <Box bg="white" p={4} borderRadius={8} shadow={1} mx={6} mt={4}>
          <Text style={{
            fontSize: 16,
            color: 'black',
            marginBottom: 16,
            textAlign: 'center',
          }}>
            Employee Details
          </Text>
          <VStack space={4}>
            <View style={styles.formField}>
              <Text style={styles.label}>Attached Farm ID</Text>
              <Text style={styles.value}>Jk Farmer2</Text>
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Full Name</Text>
              <Text style={styles.value}>{fullName}</Text>
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Phone Number</Text>
              <Text style={styles.value}>{phone}</Text>
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Date of Employment</Text>
              <Text style={styles.value}>{dateOfEmployment}</Text>
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Emergency Contact</Text>
              <Text style={styles.value}>{emergencyContact}</Text>
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Position</Text>
              <Text style={styles.value}>{position}</Text>
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Employment Type</Text>
              <Text style={styles.value}>{employmentType}</Text>
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Working Hours</Text>
              <Text style={styles.value}>{workingHours}</Text>
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Payment Rates</Text>
              <Text style={styles.value}>{paymentRate}</Text>
            </View>
          </VStack>

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
              bg={COLORS.green2}
              borderRadius={8}
              px={6}
              py={3}
              _pressed={{
                bg: COLORS.lightGreen,
              }}
            >
              Submit
            </Button>
          </HStack>
        </Box>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  formField: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: COLORS.green,
  },
});

export default EditEmployeeScreen;