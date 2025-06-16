import React, { useState, useEffect } from "react";
import { CodeField, Cursor } from 'react-native-confirmation-code-field';
import { Image, ScrollView, Dimensions, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { Box, Text, Input, Button, VStack, HStack, Pressable, Radio, Checkbox, Select, useToast, FormControl, Modal } from "native-base";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../../constants/theme';
import countyData from '../../assets/data/county_constituency_wards.json';
import { Dropdown } from 'react-native-element-dropdown';

import CustomIcon from '../../components/CustomIcon';
import { register } from '../../services/user';
import TermsAndConditionsModal from "./TermsAndConditionsModal";

const { width } = Dimensions.get("window");

export default function RegisterScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Location data states
  const [countyList, setCountyList] = useState([]);
  const [constituencyList, setConstituencyList] = useState([]);
  const [wardsList, setWardsList] = useState([]);
  const [residenceCountyList, setResidenceCountyList] = useState([]);
  const [residenceConstituencyList, setResidenceConstituencyList] = useState([]);
  const [residenceWardsList, setResidenceWardsList] = useState([]);

  const [formData, setFormData] = useState({
    // Farm Details
    farm_name: "",
    county: "",
    constituency: "",
    administrative_location: "",
    farm_size: "",
    ownership: "Freehold",
    farming_types: [],

    // Personal Information
    national_id: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "",
    date_of_birth: null,
    residence_county: "",
    residence_constituency: "",
    residence_location: "",

    // Professional Information
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
  const renderTermsModal = () => {
    return (
      <Modal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} size="full">
        <Modal.Content maxWidth="95%" maxHeight="90%">
          <Modal.CloseButton />
          <Modal.Header>
            <Text fontSize="18" fontWeight="600" color="gray.800">
              Terms and Conditions
            </Text>
          </Modal.Header>
          <Modal.Body p={0}>
            <TermsAndConditionsModal />
          </Modal.Body>
          <Modal.Footer>
            <Button
              backgroundColor="green.500"
              onPress={() => setShowTermsModal(false)}
              width="100%"
              height={12}
              borderRadius={8}
            >
              <Text color="white" fontSize="16" fontWeight="500">
                Close
              </Text>
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    );
  };

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleCountyChange = (countyName) => {
    handleInputChange("county", countyName);
    const selectedCounty = countyData.find(c => c.County === countyName);

    if (selectedCounty) {
      const constituencies = selectedCounty.Constituencies.map(c => c.Constituency);
      setConstituencyList(constituencies);
    } else {
      setConstituencyList([]);
    }

    // Reset dependent fields
    handleInputChange("constituency", "");
    handleInputChange("administrative_location", "");
    setWardsList([]);
  };

  // Handle constituency selection for farm location
  const handleConstituencyChange = (constituencyName) => {
    handleInputChange("constituency", constituencyName);
    const selectedCounty = countyData.find(c => c.County === formData.county);

    if (selectedCounty) {
      const selectedConstituency = selectedCounty.Constituencies.find(c => c.Constituency === constituencyName);
      if (selectedConstituency) {
        setWardsList(selectedConstituency.Wards);
      } else {
        setWardsList([]);
      }
    }

    handleInputChange("administrative_location", "");
  };

  const handleResidenceCountyChange = (countyName) => {
    handleInputChange("residence_county", countyName);
    const selectedCounty = countyData.find(c => c.County === countyName);

    if (selectedCounty) {
      const constituencies = selectedCounty.Constituencies.map(c => c.Constituency);
      setResidenceConstituencyList(constituencies);
    } else {
      setResidenceConstituencyList([]);
    }

    handleInputChange("residence_constituency", "");
    handleInputChange("residence_location", "");
    setResidenceWardsList([]);
  };

  const handleResidenceConstituencyChange = (constituencyName) => {
    handleInputChange("residence_constituency", constituencyName);
    const selectedCounty = countyData.find(c => c.County === formData.residence_county);

    if (selectedCounty) {
      const selectedConstituency = selectedCounty.Constituencies.find(c => c.Constituency === constituencyName);
      if (selectedConstituency) {
        setResidenceWardsList(selectedConstituency.Wards);
      } else {
        setResidenceWardsList([]);
      }
    }

    handleInputChange("residence_location", "");
  };

  const validateCurrentStep = () => {
    let newErrors = {};
    let isValid = true;
    const requiredFieldsToast = () => toast.show({ description: "All required fields must be filled!", placement: "top", backgroundColor: "red.500" });

    switch (currentStep) {
      case 1:
        if (!formData.farm_name) newErrors.farm_name = "Farm name is required.";
        if (!formData.county) newErrors.county = "County is required.";
        if (!formData.constituency) newErrors.constituency = "Constituency is required.";
        if (!formData.administrative_location) newErrors.administrative_location = "Ward is required.";
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
        if (!formData.national_id) newErrors.national_id = "National ID is required.";
        else if (!/^\d{8,9}$/.test(formData.national_id)) newErrors.national_id = "National ID must be 8 or 9 digits.";
        if (!formData.first_name) newErrors.first_name = "First name is required.";
        if (!formData.last_name) newErrors.last_name = "Last name is required.";
        if (!formData.gender) newErrors.gender = "Gender is required.";
        if (!formData.date_of_birth) newErrors.date_of_birth = "Date of birth is required.";
        if (!formData.residence_county) newErrors.residence_county = "Residence county is required.";
        if (!formData.residence_constituency) newErrors.residence_constituency = "Residence constituency is required.";
        if (!formData.residence_location) newErrors.residence_location = "Residence ward is required.";
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
        if (!formData.terms_accepted) {
          newErrors.terms_accepted = "You must accept the terms and conditions.";
          isValid = false;
        }
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
        nationalId: formData.national_id,
        firstName: formData.first_name,
        middleName: formData.middle_name,
        lastName: formData.last_name,
        gender: formData.gender,
        dob: formatDateForAPI(formData.date_of_birth),
        residenceCounty: formData.residence_county,
        residenceConstituency: formData.residence_constituency,
        residenceLocation: formData.residence_location,
        email: formData.email,
        phoneNumber: sanitizePhoneNumber(formData.phone_number),
        businessNumber: sanitizePhoneNumber(formData.business_number),
        pin: formData.pin,
        yearsOfExperience: formData.years_of_experience ? parseInt(formData.years_of_experience) : undefined,
        farmName: formData.farm_name,
        county: formData.county,
        constituency: formData.constituency,
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
            onChange={item => handleCountyChange(item.value)}
          />
          <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
            {errors.county}
          </FormControl.ErrorMessage>
        </FormControl>

        <FormControl isInvalid={'constituency' in errors}>
          <FormControl.Label>
            <Text fontSize="16" fontWeight="500" color="gray.700">
              Constituency *
            </Text>
          </FormControl.Label>
          <Dropdown
            style={{
              height: 50,
              borderColor: errors.constituency ? 'red' : '#D1FAE5',
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
            placeholder="Select Constituency"
            searchPlaceholder="Search constituency..."
            value={formData.constituency}
            onChange={item => handleConstituencyChange(item.value)}
            disable={!formData.county}
          />
          <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
            {errors.constituency}
          </FormControl.ErrorMessage>
        </FormControl>

        <FormControl isInvalid={'administrative_location' in errors}>
          <FormControl.Label>
            <Text fontSize="16" fontWeight="500" color="gray.700">
              Ward *
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
            data={wardsList.map(name => ({ label: name, value: name }))}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select Ward"
            searchPlaceholder="Search ward..."
            value={formData.administrative_location}
            onChange={item => handleInputChange("administrative_location", item.value)}
            disable={!formData.constituency}
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
        <FormControl isInvalid={'national_id' in errors}>
          <FormControl.Label>
            <Text fontSize="16" fontWeight="500" color="gray.700">
              National ID *
            </Text>
          </FormControl.Label>
          <Input
            variant="filled"
            borderColor={'national_id' in errors ? "red.500" : "green.100"}
            borderWidth={1}
            width="100%"
            backgroundColor="green.50"
            height={12}
            borderRadius={8}
            value={formData.national_id}
            onChangeText={(value) => handleInputChange("national_id", value)}
            placeholder="123456789"
            keyboardType="numeric"
            maxLength={9}
            fontSize="16"
          />
          <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
            {errors.national_id}
          </FormControl.ErrorMessage>
        </FormControl>

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
              onChange={(event, selectedDate) => {
                setDatePickerVisible(false);
                if (selectedDate) {
                  handleInputChange("date_of_birth", selectedDate);
                }
              }}
              maximumDate={new Date()}
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
            onChange={item => handleResidenceCountyChange(item.value)}
          />
          <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
            {errors.residence_county}
          </FormControl.ErrorMessage>
        </FormControl>

        <FormControl isInvalid={'residence_constituency' in errors}>
          <FormControl.Label>
            <Text fontSize="16" fontWeight="500" color="gray.700">
              Residence Constituency *
            </Text>
          </FormControl.Label>
          <Dropdown
            style={{
              height: 50,
              borderColor: errors.residence_constituency ? 'red' : '#D1FAE5',
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
            data={residenceConstituencyList.map(name => ({ label: name, value: name }))}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select Residence Constituency"
            searchPlaceholder="Search constituency..."
            value={formData.residence_constituency}
            onChange={item => handleResidenceConstituencyChange(item.value)}
            disable={!formData.residence_county}
          />
          <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
            {errors.residence_constituency}
          </FormControl.ErrorMessage>
        </FormControl>

        <FormControl isInvalid={'residence_location' in errors}>
          <FormControl.Label>
            <Text fontSize="16" fontWeight="500" color="gray.700">
              Residence Ward *
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
            data={residenceWardsList.map(name => ({ label: name, value: name }))}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select Residence Ward"
            searchPlaceholder="Search ward..."
            value={formData.residence_location}
            onChange={item => handleInputChange("residence_location", item.value)}
            disable={!formData.residence_constituency}
          />
          <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
            {errors.residence_location}
          </FormControl.ErrorMessage>
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
              Years of Experience
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
            value={formData.years_of_experience}
            onChangeText={(value) => handleInputChange("years_of_experience", value)}
            placeholder="5"
            keyboardType="numeric"
            fontSize="16"
          />
        </FormControl>

        <FormControl isInvalid={'email' in errors}>
          <FormControl.Label>
            <Text fontSize="16" fontWeight="500" color="gray.700">
              Email Address *
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
            placeholder="john@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            fontSize="16"
          />
          <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
            {errors.email}
          </FormControl.ErrorMessage>
        </FormControl>

        <FormControl isInvalid={'phone_number' in errors}>
          <FormControl.Label>
            <Text fontSize="16" fontWeight="500" color="gray.700">
              Business Phone Number *
            </Text>
          </FormControl.Label>
          <Input
            variant="filled"
            borderColor={'phone_number' in errors ? "red.500" : "green.100"}
            borderWidth={1}
            width="100%"
            backgroundColor="green.50"
            height={12}
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

        <FormControl>
          <FormControl.Label>
            <Text fontSize="16" fontWeight="500" color="gray.700">
              Additional Contact Number
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
            value={formData.business_number}
            onChangeText={(value) => handleInputChange("business_number", value)}
            placeholder="0712345678"
            keyboardType="phone-pad"
            fontSize="16"
          />
        </FormControl>
      </VStack>
    );
  };

  const renderSecuritySetupForm = () => {
    return (
      <VStack width="100%" space={4}>
        <Text fontSize="16" fontWeight="600" color="gray.700" mb={2}>
          Create a 4-digit PIN for secure access
        </Text>

        <FormControl isInvalid={'pin' in errors}>
          <FormControl.Label>
            <Text fontSize="16" fontWeight="500" color="gray.700">
              PIN *
            </Text>
          </FormControl.Label>
          <Input
            variant="filled"
            borderColor={'pin' in errors ? "red.500" : "green.100"}
            borderWidth={1}
            width="100%"
            backgroundColor="green.50"
            height={12}
            borderRadius={8}
            value={formData.pin}
            onChangeText={(value) => handleInputChange("pin", value)}
            placeholder="••••"
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
            fontSize="16"
          />
          <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
            {errors.pin}
          </FormControl.ErrorMessage>
        </FormControl>

        <FormControl isInvalid={'confirmPin' in errors}>
          <FormControl.Label>
            <Text fontSize="16" fontWeight="500" color="gray.700">
              Confirm PIN *
            </Text>
          </FormControl.Label>
          <Input
            variant="filled"
            borderColor={'confirmPin' in errors ? "red.500" : "green.100"}
            borderWidth={1}
            width="100%"
            backgroundColor="green.50"
            height={12}
            borderRadius={8}
            value={formData.confirmPin}
            onChangeText={(value) => handleInputChange("confirmPin", value)}
            placeholder="••••"
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
            fontSize="16"
          />
          <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
            {errors.confirmPin}
          </FormControl.ErrorMessage>
        </FormControl>
        <FormControl isInvalid={'terms_accepted' in errors}>
          <HStack alignItems="flex-start" space={3} mt={4}>
            <Checkbox
              value="terms"
              isChecked={formData.terms_accepted}
              onChange={(isChecked) => handleInputChange("terms_accepted", isChecked)}
              colorScheme="green"
              size="sm"
              mt={1}
            />
            <VStack flex={1} space={1}>
              <Text fontSize="14" color="gray.700" flexWrap="wrap">
                I agree to the{" "}
                <Pressable onPress={() => setShowTermsModal(true)}>
                  <Text fontSize="14" color="green.600" textDecorationLine="underline">
                    Terms and Conditions
                  </Text>
                </Pressable>
                {" "}and{" "}
                <Pressable onPress={() => {/* Navigate to privacy policy page or open modal */ }}>
                  <Text fontSize="14" color="green.600" textDecorationLine="underline">
                    Privacy Policy
                  </Text>
                </Pressable>
              </Text>
            </VStack>
          </HStack>
          <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
            {errors.terms_accepted}
          </FormControl.ErrorMessage>
        </FormControl>
      </VStack>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Box flex={1} backgroundColor="white" safeArea>
          <Box paddingX={6} paddingY={4}>
            {/* Header */}
            <HStack alignItems="center" justifyContent="space-between" mb={6}>
              <Pressable onPress={() => navigation.goBack()}>
                <Icon name="arrow-left" size={24} color="#059669" />
              </Pressable>
              <Text fontSize="20" fontWeight="600" color="gray.800">
                Create Account
              </Text>
              <Box width={6} />
            </HStack>

            {/* Step Indicator */}
            {renderStepIndicator()}

            {/* Form */}
            {renderForm()}

            {/* Navigation Buttons */}
            <HStack justifyContent="space-between" mt={8} space={4}>
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  borderColor="green.500"
                  flex={1}
                  height={12}
                  onPress={handlePrevious}
                  borderRadius={8}
                >
                  <Text color="green.600" fontSize="16" fontWeight="500">
                    Previous
                  </Text>
                </Button>
              )}

              <Button
                backgroundColor="green.500"
                flex={currentStep === 1 ? 1 : 1}
                height={12}
                onPress={handleNext}
                isLoading={loading}
                isLoadingText="Processing..."
                borderRadius={8}
                _pressed={{ backgroundColor: "green.600" }}
              >
                <Text color="white" fontSize="16" fontWeight="500">
                  {currentStep === 5 ? "Create Account" : "Next"}
                </Text>
              </Button>
            </HStack>
          </Box>
          {renderTermsModal()}

        </Box>
      </ScrollView>
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
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FDF9",
    borderRadius: 8,
    textAlign: "center",
    marginHorizontal: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  focusCell: {
    borderColor: "#059669",
    backgroundColor: "#ECFDF5",
  },
  errorCell: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
});