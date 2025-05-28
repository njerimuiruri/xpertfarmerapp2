import React, { useState, useEffect } from "react";
import { CodeField, Cursor } from 'react-native-confirmation-code-field';
import { Image, ScrollView, Dimensions, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { Box, Text, Input, Button, VStack, HStack, Pressable, Radio, Checkbox, Select, useToast, FormControl } from "native-base";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../../constants/theme';
import countyData from '../../assets/data/county_constituencies.json';
import { Dropdown } from 'react-native-element-dropdown';

import CustomIcon from '../../components/CustomIcon';
import { register } from '../../services/user';

const { width } = Dimensions.get("window");

export default function RegisterScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [countyList, setCountyList] = useState([]);
  const [constituencyList, setConstituencyList] = useState([]);
  const [residenceCountyList, setResidenceCountyList] = useState([]);
  const [residenceLocationList, setResidenceLocationList] = useState([]);
  const [formData, setFormData] = useState({
    farm_name: "",
    county: "",
    administrative_location: "",
    farm_size: "",
    ownership: "Freehold",
    farming_types: [],

    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "",
    date_of_birth: null,
    residence_county: "",
    residence_location: "",

    years_of_experience: "",
    email: "",
    phone_number: "",
    business_number: "",
    pin: "",
    confirmPin: "",
    country: 1,
  });
  const toast = useToast();

  const stepDescriptions = {
    1: "Farm Details",
    2: "Farm Activities",
    3: "Personal Information",
    4: "Professional Information",
    5: "Security Setup"
  };
  useEffect(() => {
    const counties = countyData.map(item => item.County);
    setCountyList(counties);
    setResidenceCountyList(counties);
  }, []);

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateCurrentStep = () => {
    let newErrors = {};
    let isValid = true;
    const requiredFieldsToast = () => toast.show({ description: "All required fields must be filled!", placement: "top", backgroundColor: "red.500" });

    switch (currentStep) {
      case 1:
        if (!formData.farm_name) newErrors.farm_name = "Farm name is required.";
        if (!formData.county) newErrors.county = "County is required.";
        if (!formData.administrative_location) newErrors.administrative_location = "Administrative location is required.";
        if (!formData.farm_size) newErrors.farm_size = "Farm size is required.";
        if (Object.keys(newErrors).length > 0) isValid = false;
        break;
      case 2:
        if (formData.farming_types.length === 0) {
          newErrors.farming_types = "Please select at least one farming type.";
          isValid = false;
        }
        break;
      case 3:
        if (!formData.first_name) newErrors.first_name = "First name is required.";
        if (!formData.last_name) newErrors.last_name = "Last name is required.";
        if (!formData.gender) newErrors.gender = "Gender is required.";
        if (!formData.date_of_birth) newErrors.date_of_birth = "Date of birth is required.";
        if (!formData.residence_county) newErrors.residence_county = "Residence county is required.";
        if (Object.keys(newErrors).length > 0) isValid = false;
        break;
      case 4:
        if (!formData.email) newErrors.email = "Email is required.";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email address is invalid.";
        if (!formData.phone_number) newErrors.phone_number = "Phone number is required.";
        if (Object.keys(newErrors).length > 0) isValid = false;
        break;
      case 5:
        if (!formData.pin) newErrors.pin = "PIN is required.";
        else if (formData.pin.length !== 4) newErrors.pin = "PIN must be 4 digits.";
        if (!formData.confirmPin) newErrors.confirmPin = "Confirm PIN is required.";
        else if (formData.confirmPin.length !== 4) newErrors.confirmPin = "Confirm PIN must be 4 digits.";
        else if (formData.pin && formData.confirmPin && formData.pin !== formData.confirmPin) newErrors.confirmPin = "PINs do not match.";
        if (Object.keys(newErrors).length > 0) isValid = false;
        break;
      default:
        break;
    }

    setErrors(newErrors);
    if (!isValid) {
      requiredFieldsToast();
    }
    return isValid;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
      } else {
        handleRegister();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const formatDateForAPI = (date) => {
    if (!date) return null;
    return date.toISOString().split('T')[0];
  };

  const handleRegister = async () => {
    if (!validateCurrentStep()) {
      return;
    }
    setLoading(true);
    try {
      const sanitizePhoneNumber = (input) => {
        let phone = (input || '').replace(/[^\d]/g, '');
        if (phone.startsWith('0')) phone = '254' + phone.slice(1);
        if (phone.startsWith('7') && phone.length === 9) phone = '254' + phone;
        if (!phone.startsWith('254') && phone.length >= 9 && phone[0] !== '+') phone = '254' + phone;
        return phone;
      };

      const payload = {
        firstName: formData.first_name,
        middleName: formData.middle_name,
        lastName: formData.last_name,
        gender: formData.gender,
        dob: formatDateForAPI(formData.date_of_birth),
        residenceCounty: formData.residence_county,
        residenceLocation: formData.residence_location,
        email: formData.email,
        phoneNumber: sanitizePhoneNumber(formData.phone_number),
        businessNumber: sanitizePhoneNumber(formData.business_number),
        pin: formData.pin,
        yearsOfExperience: formData.years_of_experience ? parseInt(formData.years_of_experience) : undefined,
        farmName: formData.farm_name,
        county: formData.county,
        administrativeLocation: formData.administrative_location,
        farmSize: formData.farm_size ? parseFloat(formData.farm_size) : undefined,
        ownership: formData.ownership,
        farmingTypes: Array.isArray(formData.farming_types) ? formData.farming_types : [],
      };

      const { data, error } = await register(payload);
      if (error) {
        toast.show({ description: error, placement: "top", backgroundColor: "red.500" });
        return;
      }
      toast.show({ description: data?.message || "Account created. Please verify OTP.", placement: "top", backgroundColor: "green.500" });
      navigation.navigate("VerifyOtp", { phoneNumber: payload.phoneNumber });
    } catch (error) {
      const msg = error?.response?.data?.message || "Registration failed. Please try again.";
      toast.show({ description: msg, placement: "top", backgroundColor: "red.500" });
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    const handleStepClick = (step) => {
      if (step <= currentStep) {
        setCurrentStep(step);
      } else {
        toast.show({
          description: "Please complete the current step first",
          placement: "top",
          backgroundColor: "orange.500"
        });
      }
    };

    return (
      <Box width="100%" mb={6}>
        <HStack justifyContent="space-between" mb={2}>
          {[1, 2, 3, 4, 5].map((step) => (
            <Pressable
              key={step}
              onPress={() => handleStepClick(step)}
              _pressed={{ opacity: 0.6, transform: [{ scale: 0.95 }] }}
              hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
            >
              <Box
                width={currentStep === step ? 10 : 8}
                height={currentStep === step ? 10 : 8}
                borderRadius="full"
                backgroundColor={
                  currentStep === step
                    ? "green.500"
                    : step < currentStep
                      ? "green.400"
                      : "gray.200"
                }
                justifyContent="center"
                alignItems="center"
                position="relative"
                shadow={currentStep === step ? 2 : 0}
              >
                <Text
                  color={
                    currentStep === step || step < currentStep
                      ? "white"
                      : "gray.400"
                  }
                  fontSize={currentStep === step ? "md" : "sm"}
                  fontWeight="bold"
                >
                  {step}
                </Text>
                {step < 5 && (
                  <Box
                    position="absolute"
                    height={1}
                    backgroundColor={step < currentStep ? "green.300" : "gray.300"}
                    width="100%"
                    left="100%"
                    top="50%"
                  />
                )}
              </Box>
            </Pressable>
          ))}
        </HStack>

        <Text fontSize="16" fontWeight="600" textAlign="center" color="green.600" mt={2}>
          {stepDescriptions[currentStep]}
        </Text>
      </Box>
    );
  };
  const renderForm = () => {
    switch (currentStep) {
      case 1:
        return renderFarmDetailsForm();
      case 2:
        return renderFarmActivitiesForm();
      case 3:
        return renderPersonalInfoForm();
      case 4:
        return renderProfessionalInfoForm();
      case 5:
        return renderSecuritySetupForm();
      default:
        return null;
    }
  };

  const renderFarmDetailsForm = () => {
    return (
      <VStack width="100%" space={4}>
        <FormControl isInvalid={'farm_name' in errors}>
          <FormControl.Label>
            <Text fontSize="16" fontWeight="500" color="gray.700">
              Farm Business Name *
            </Text>
          </FormControl.Label>
          <Input
            variant="filled"
            backgroundColor="green.50"
            borderColor={'farm_name' in errors ? "red.500" : "green.100"}
            borderWidth={1}
            width="100%"
            height={12}
            borderRadius={8}
            value={formData.farm_name}
            onChangeText={(value) => handleInputChange("farm_name", value)}
            placeholder="John Farm"
            fontSize="16"
          />
          <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
            {errors.farm_name}
          </FormControl.ErrorMessage>
        </FormControl>

        <FormControl isInvalid={'county' in errors}>
          <FormControl.Label>
            <Text fontSize="16" fontWeight="500" color="gray.700">
              County *
            </Text>
          </FormControl.Label>
          <Dropdown
            style={{
              height: 50,
              borderColor: errors.county ? 'red' : '#D1FAE5',
              borderWidth: 1,
              borderRadius: 8,
              paddingHorizontal: 12,
              backgroundColor: '#F0FDF4'
            }}
            placeholderStyle={{ fontSize: 16, color: '#1F2937' }}
            selectedTextStyle={{ fontSize: 16, color: '#1F2937' }}
            inputSearchStyle={{ fontSize: 14, color: '#1F2937' }}
            itemTextStyle={{ color: '#000', fontSize: 16 }}
            itemContainerStyle={{ backgroundColor: '#F0FDF4' }}
            data={countyList.map(name => ({ label: name, value: name }))}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select County"
            searchPlaceholder="Search county..."
            value={formData.county}
            onChange={item => {
              handleInputChange("county", item.value);
              const match = countyData.find(c => c.County === item.value);
              setConstituencyList(match ? match.Constituency : []);
              handleInputChange("administrative_location", "");
            }}
          />
          <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
            {errors.county}
          </FormControl.ErrorMessage>
        </FormControl>

        <FormControl isInvalid={'administrative_location' in errors}>
          <FormControl.Label>
            <Text fontSize="16" fontWeight="500" color="gray.700">
              Administrative location *
            </Text>
          </FormControl.Label>
          <Dropdown
            style={{
              height: 50,
              borderColor: errors.administrative_location ? 'red' : '#D1FAE5',
              borderWidth: 1,
              borderRadius: 8,
              paddingHorizontal: 12,
              backgroundColor: '#F0FDF4'
            }}
            placeholderStyle={{ fontSize: 16, color: '#1F2937' }}
            selectedTextStyle={{ fontSize: 16, color: '#1F2937' }}
            inputSearchStyle={{ fontSize: 14, color: '#1F2937' }}
            itemTextStyle={{ color: '#000', fontSize: 16 }}
            itemContainerStyle={{ backgroundColor: '#F0FDF4' }}
            data={constituencyList.map(name => ({ label: name, value: name }))}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select Administrative Location"
            searchPlaceholder="Search location..."
            value={formData.administrative_location}
            onChange={item => handleInputChange("administrative_location", item.value)}
          />
          <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
            {errors.administrative_location}
          </FormControl.ErrorMessage>
        </FormControl>

        <FormControl isInvalid={'farm_size' in errors}>
          <FormControl.Label>
            <Text fontSize="16" fontWeight="500" color="gray.700">
              Farm Size (Acres) *
            </Text>
          </FormControl.Label>
          <Input
            variant="filled"
            borderColor={'farm_size' in errors ? "red.500" : "green.100"}
            borderWidth={1}
            width="100%"
            backgroundColor="green.50"
            height={12}
            borderRadius={8}
            value={formData.farm_size}
            onChangeText={(value) => handleInputChange("farm_size", value)}
            placeholder="1 Acre"
            keyboardType="numeric"
            fontSize="16"
          />
          <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
            {errors.farm_size}
          </FormControl.ErrorMessage>
        </FormControl>

        <Box>
          <FormControl.Label mb={2}>
            <Text fontSize="16" fontWeight="500" color="gray.700">
              Ownership
            </Text>
          </FormControl.Label>
          <Radio.Group
            name="ownership"
            value={formData.ownership}
            onChange={(value) => handleInputChange("ownership", value)}
          >
            <HStack space={4} flexWrap="wrap">
              <Radio value="Freehold" colorScheme="green" size="sm">
                <Text fontSize="14">Freehold</Text>
              </Radio>
              <Radio value="Leasehold" colorScheme="green" size="sm">
                <Text fontSize="14">Leasehold</Text>
              </Radio>
              <Radio value="Communal" colorScheme="green" size="sm">
                <Text fontSize="14">Communal</Text>
              </Radio>
            </HStack>
          </Radio.Group>
        </Box>
      </VStack>
    );
  };

  const renderFarmActivitiesForm = () => {
    return (
      <VStack width="100%" space={4}>
        <FormControl isInvalid={'farming_types' in errors}>
          <FormControl.Label>
            <Text fontSize="16" fontWeight="500" color="gray.700">
              Types of Farming *
            </Text>
          </FormControl.Label>
          <Text fontSize="14" color="gray.500" mb={3}>
            Select one or more types of farming
          </Text>
          <Checkbox.Group
            colorScheme="green"
            value={formData.farming_types}
            onChange={(values) => {
              setFormData(prev => ({ ...prev, farming_types: values }));
              if (errors.farming_types) {
                setErrors(prev => ({ ...prev, farming_types: null }));
              }
            }}
          >
            <VStack space={3}>
              <Checkbox value="Dairy cattle" size="sm">
                <Text fontSize="14">Dairy cattle</Text>
              </Checkbox>
              <Checkbox value="Beef cattle" size="sm">
                <Text fontSize="14">Beef cattle</Text>
              </Checkbox>
              <Checkbox value="Dairy and Meat goat" size="sm">
                <Text fontSize="14">Dairy and Meat goat</Text>
              </Checkbox>
              <Checkbox value="Sheep and Goats" size="sm">
                <Text fontSize="14">Sheep and Goats</Text>
              </Checkbox>
              <Checkbox value="Poultry" size="sm">
                <Text fontSize="14">Poultry</Text>
              </Checkbox>
              <Checkbox value="Rabbit" size="sm">
                <Text fontSize="14">Rabbit</Text>
              </Checkbox>
              <Checkbox value="Pigs (Swine)" size="sm">
                <Text fontSize="14">Pigs (Swine)</Text>
              </Checkbox>
            </VStack>
          </Checkbox.Group>
          {'farming_types' in errors && (
            <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
              {errors.farming_types}
            </FormControl.ErrorMessage>
          )}
        </FormControl>
      </VStack>
    );
  };

  const renderPersonalInfoForm = () => {
    return (
      <VStack width="100%" space={4}>
        <FormControl isInvalid={'first_name' in errors}>
          <FormControl.Label>
            <Text fontSize="16" fontWeight="500" color="gray.700">
              First Name *
            </Text>
          </FormControl.Label>
          <Input
            variant="filled"
            borderColor={'first_name' in errors ? "red.500" : "green.100"}
            borderWidth={1}
            width="100%"
            backgroundColor="green.50"
            height={12}
            borderRadius={8}
            value={formData.first_name}
            onChangeText={(value) => handleInputChange("first_name", value)}
            placeholder="John"
            fontSize="16"
          />
          <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
            {errors.first_name}
          </FormControl.ErrorMessage>
        </FormControl>

        <FormControl>
          <FormControl.Label>
            <Text fontSize="16" fontWeight="500" color="gray.700">
              Middle Name
            </Text>
          </FormControl.Label>
          <Input
            variant="filled"
            borderColor="green.100"
            backgroundColor="green.50"
            borderWidth={1}
            width="100%"
            height={12}
            borderRadius={8}
            value={formData.middle_name}
            onChangeText={(value) => handleInputChange("middle_name", value)}
            placeholder="Doe"
            fontSize="16"
          />
        </FormControl>

        <FormControl isInvalid={'last_name' in errors}>
          <FormControl.Label>
            <Text fontSize="16" fontWeight="500" color="gray.700">
              Last Name *
            </Text>
          </FormControl.Label>
          <Input
            variant="filled"
            borderColor={'last_name' in errors ? "red.500" : "green.100"}
            borderWidth={1}
            width="100%"
            backgroundColor="green.50"
            height={12}
            borderRadius={8}
            value={formData.last_name}
            onChangeText={(value) => handleInputChange("last_name", value)}
            placeholder="Doe"
            fontSize="16"
          />
          <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
            {errors.last_name}
          </FormControl.ErrorMessage>
        </FormControl>

        <FormControl isInvalid={'gender' in errors}>
          <FormControl.Label mb={2}>
            <Text fontSize="16" fontWeight="500" color="gray.700">
              Gender *
            </Text>
          </FormControl.Label>
          <Radio.Group
            name="gender"
            value={formData.gender}
            onChange={(value) => handleInputChange("gender", value)}
          >
            <HStack space={6}>
              <Radio value="Male" colorScheme="green" size="sm">
                <Text fontSize="14">Male</Text>
              </Radio>
              <Radio value="Female" colorScheme="green" size="sm">
                <Text fontSize="14">Female</Text>
              </Radio>
            </HStack>
          </Radio.Group>
          <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
            {errors.gender}
          </FormControl.ErrorMessage>
        </FormControl>

        <FormControl isInvalid={'date_of_birth' in errors}>
          <FormControl.Label>
            <Text fontSize="16" fontWeight="500" color="gray.700">
              Date of Birth *
            </Text>
          </FormControl.Label>

          <Pressable onPress={() => setDatePickerVisible(true)}>
            <Box
              backgroundColor="green.50"
              borderColor={'date_of_birth' in errors ? "red.500" : "green.100"}
              borderWidth={1}
              height={12}
              borderRadius={8}
              flexDirection="row"
              alignItems="center"
              paddingX={4}
              justifyContent="space-between"
            >
              <Text
                fontSize="16"
                color={formData.date_of_birth ? "gray.800" : "gray.400"}
                flex={1}
              >
                {formData.date_of_birth
                  ? formData.date_of_birth.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })
                  : 'Select Date of Birth'
                }
              </Text>

              <Box
                backgroundColor="green.100"
                borderRadius={6}
                padding={2}
                marginLeft={2}
              >
                <Icon name="calendar" size={20} color="#059669" />
              </Box>
            </Box>
          </Pressable>

          {datePickerVisible && (
            <DateTimePicker
              value={formData.date_of_birth || new Date()}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={(event, date) => {
                setDatePickerVisible(false);
                if (date && event.type !== 'dismissed') {
                  handleInputChange("date_of_birth", date);
                }
              }}
            />
          )}

          <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
            {errors.date_of_birth}
          </FormControl.ErrorMessage>
        </FormControl>

        <FormControl isInvalid={'residence_county' in errors}>
          <FormControl.Label>
            <Text fontSize="16" fontWeight="500" color="gray.700">
              Residence County *
            </Text>
          </FormControl.Label>
          <Dropdown
            style={{
              height: 50,
              borderColor: errors.residence_county ? 'red' : '#D1FAE5',
              borderWidth: 1,
              borderRadius: 8,
              paddingHorizontal: 12,
              backgroundColor: '#F0FDF4'
            }}
            placeholderStyle={{ fontSize: 16, color: '#1F2937' }}
            selectedTextStyle={{ fontSize: 16, color: '#1F2937' }}
            inputSearchStyle={{ fontSize: 14, color: '#1F2937' }}
            itemTextStyle={{ color: '#000', fontSize: 16 }}
            itemContainerStyle={{ backgroundColor: '#F0FDF4' }}
            data={residenceCountyList.map(name => ({ label: name, value: name }))}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select Residence County"
            searchPlaceholder="Search county..."
            value={formData.residence_county}
            onChange={item => {
              handleInputChange("residence_county", item.value);
              const match = countyData.find(c => c.County === item.value);
              setResidenceLocationList(match ? match.Constituency : []);
              handleInputChange("residence_location", "");
            }}
          />
          <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
            {errors.residence_county}
          </FormControl.ErrorMessage>
        </FormControl>

        <FormControl>
          <FormControl.Label>
            <Text fontSize="16" fontWeight="500" color="gray.700">
              Residence Location
            </Text>
          </FormControl.Label>
          <Dropdown
            style={{
              height: 50,
              borderColor: errors.residence_location ? 'red' : '#D1FAE5',
              borderWidth: 1,
              borderRadius: 8,
              paddingHorizontal: 12,
              backgroundColor: '#F0FDF4'
            }}
            placeholderStyle={{ fontSize: 16, color: '#1F2937' }}
            selectedTextStyle={{ fontSize: 16, color: '#1F2937' }}
            inputSearchStyle={{ fontSize: 14, color: '#1F2937' }}
            itemTextStyle={{ color: '#000', fontSize: 16 }}
            itemContainerStyle={{ backgroundColor: '#F0FDF4' }}
            data={residenceLocationList.map(name => ({ label: name, value: name }))}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select Residence Location"
            searchPlaceholder="Search location..."
            value={formData.residence_location}
            onChange={item => handleInputChange("residence_location", item.value)}
          />
        </FormControl>
      </VStack>
    );
  };

  const renderProfessionalInfoForm = () => {
    return (
      <VStack width="100%" space={4}>
        <FormControl>
          <FormControl.Label>
            <Text fontSize="16" fontWeight="500" color="gray.700">
              Years of Farming Practice
            </Text>
          </FormControl.Label>
          <Input
            variant="filled"
            borderColor="green.100"
            borderWidth={1}
            width="100%"
            backgroundColor="green.50"
            height={12}
            borderRadius={8}
            value={formData.years_of_experience}
            onChangeText={(value) => handleInputChange("years_of_experience", value)}
            placeholder="Enter years"
            keyboardType="numeric"
            fontSize="16"
          />
        </FormControl>

        <FormControl isInvalid={'email' in errors}>
          <FormControl.Label>
            <Text fontSize="16" fontWeight="500" color="gray.700">
              E-mail Address *
            </Text>
          </FormControl.Label>
          <Input
            variant="filled"
            borderColor={'email' in errors ? "red.500" : "green.100"}
            borderWidth={1}
            width="100%"
            backgroundColor="green.50"
            height={12}
            borderRadius={8}
            value={formData.email}
            onChangeText={(value) => handleInputChange("email", value)}
            placeholder="your_email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            fontSize="16"
          />
          <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
            {errors.email}
          </FormControl.ErrorMessage>
        </FormControl>

        <FormControl>
          <FormControl.Label>
            <Text fontSize="16" fontWeight="500" color="gray.700">
              Business Number
            </Text>
          </FormControl.Label>
          <Input
            variant="filled"
            borderColor="green.100"
            borderWidth={1}
            width="100%"
            backgroundColor="green.50"
            height={12}
            borderRadius={8}
            value={formData.business_number}
            onChangeText={(value) => handleInputChange("business_number", value)}
            placeholder="0712345678"
            keyboardType="phone-pad"
            fontSize="16"
          />
        </FormControl>

        <FormControl isInvalid={'phone_number' in errors}>
          <FormControl.Label>
            <Text fontSize="16" fontWeight="500" color="gray.700">
              Additional Contact *
            </Text>
          </FormControl.Label>
          <Input
            variant="filled"
            borderColor={'phone_number' in errors ? "red.500" : "green.100"}
            borderWidth={1}
            width="100%"
            height={12}
            backgroundColor="green.50"
            borderRadius={8}
            value={formData.phone_number}
            onChangeText={(value) => handleInputChange("phone_number", value)}
            placeholder="0712345678"
            keyboardType="phone-pad"
            fontSize="16"
          />
          <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
            {errors.phone_number}
          </FormControl.ErrorMessage>
        </FormControl>
      </VStack>
    );
  };

  const renderSecuritySetupForm = () => {
    return (
      <VStack width="100%" space={6}>
        <FormControl isInvalid={!!errors.pin}>
          <FormControl.Label>
            <Text fontSize="16" fontWeight="500" color="gray.700">
              Set 4-digit PIN *
            </Text>
          </FormControl.Label>
          <CodeField
            value={formData.pin}
            onChangeText={value => handleInputChange("pin", value)}
            cellCount={4}
            rootStyle={styles.codeFieldRoot}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            renderCell={({ index, symbol, isFocused }) => (
              <Box
                key={index}
                style={[styles.cell, isFocused && styles.focusCell, !!errors.pin && styles.errorCell]}
              >
                <Text fontSize={24}>{symbol ? '•' : isFocused ? <Cursor /> : null}</Text>
              </Box>
            )}
          />
          <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={20} color="#EF4444" />}>
            {errors.pin}
          </FormControl.ErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.confirmPin}>
          <FormControl.Label>
            <Text fontSize="16" fontWeight="500" color="gray.700">
              Confirm 4-digit PIN *
            </Text>
          </FormControl.Label>
          <CodeField
            value={formData.confirmPin}
            onChangeText={value => handleInputChange("confirmPin", value)}
            cellCount={4}
            rootStyle={styles.codeFieldRoot}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            renderCell={({ index, symbol, isFocused }) => (
              <Box
                key={index}
                style={[styles.cell, isFocused && styles.focusCell, !!errors.confirmPin && styles.errorCell]}
              >
                <Text fontSize={24}>{symbol ? '•' : isFocused ? <Cursor /> : null}</Text>
              </Box>
            )}
          />
          <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={20} color="#EF4444" />}>
            {errors.confirmPin}
          </FormControl.ErrorMessage>
        </FormControl>

        <Box mt={2}>
          <Text fontSize="12" textAlign="center" color="gray.600">
            By tapping "Continue" you acknowledge that you have read and agreed to the{" "}
            <Text color="green.600" fontWeight="500">Terms and Conditions</Text>
          </Text>
        </Box>
      </VStack>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <Box flex={1} justifyContent="center" alignItems="center" backgroundColor="white">
        <Box
          position="absolute"
          top={0}
          left={0}
          width={width * 0.3}
          height={width * 0.3}
          backgroundColor="green.100"
          borderBottomRightRadius={width * 0.15}
          opacity={0.6}
        />

        <Box
          position="absolute"
          top={0}
          left={0}
          width="50%"
          height="20%"
          bg="green.100"
          borderBottomRightRadius="full"
        >
          <Box
            position="absolute"
            top={0}
            left={0}
            width="80%"
            height="80%"
            bg="green.200"
            borderBottomRightRadius="full"
          />
        </Box>


        <Box
          position="absolute"
          bottom={0}
          right={0}
          width="30%"
          height="15%"
          bg="green.50"
          borderTopLeftRadius="full"
        />
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <VStack space={6} alignItems="center" width="100%" maxWidth="400px">
            <Box alignItems="center" mb={4}>
              <CustomIcon name="logo" size={80} color="#059669" />
              <Text fontSize="24" fontWeight="bold" color="green.600" mt={2}>
                Xpert Farmers
              </Text>
              <Text fontSize="14" color="gray.500" textAlign="center" mt={1}>
                Join our farming community
              </Text>
            </Box>

            {renderStepIndicator()}

            <Box
              width="100%"
              backgroundColor="white"
              borderRadius={16}
              padding={6}
              shadow={2}
              borderWidth={1}
              borderColor="gray.100"
            >
              {renderForm()}
            </Box>

            <HStack width="100%" justifyContent="space-between" space={4} mt={4}>
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  borderColor="green.500"
                  borderWidth={1}
                  flex={1}
                  height={12}
                  borderRadius={8}
                  onPress={handlePrevious}
                  _text={{ color: "green.600", fontSize: "16", fontWeight: "500" }}
                >
                  Previous
                </Button>
              )}

              <Button
                backgroundColor="green.500"
                flex={currentStep > 1 ? 1 : undefined}
                width={currentStep === 1 ? "100%" : undefined}
                height={12}
                borderRadius={8}
                onPress={handleNext}
                isLoading={loading}
                isLoadingText={currentStep === 5 ? "Creating Account..." : "Please wait..."}
                _text={{ fontSize: "16", fontWeight: "500" }}
                _pressed={{ backgroundColor: "green.600" }}
              >
                {currentStep === 5 ? "Create Account" : "Continue"}
              </Button>
            </HStack>

            <HStack justifyContent="center" alignItems="center" mt={6}>
              <Text fontSize="14" color="gray.600">
                Already have an account?{" "}
              </Text>
              <Pressable onPress={() => navigation.navigate("SignInScreen")}>
                <Text fontSize="14" color="green.600" fontWeight="500">
                  Sign In
                </Text>
              </Pressable>
            </HStack>
          </VStack>
        </ScrollView>
      </Box>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  codeFieldRoot: {
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  cell: {
    width: 50,
    height: 50,
    lineHeight: 50,
    fontSize: 24,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FDF9',
    borderRadius: 8,
    textAlign: 'center',
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusCell: {
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
  },
  errorCell: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
});