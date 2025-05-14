import React, { useState } from "react";
import { CodeField, Cursor } from 'react-native-confirmation-code-field';
import { Image, ScrollView } from "react-native";
import { Box, Text, Input, Button, VStack, HStack, Pressable, Radio, Checkbox, Select, useToast, FormControl } from "native-base";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomIcon from '../../components/CustomIcon';
import { register } from '../../services/user';

export default function RegisterScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
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
    age_group: "",
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
    4: "Professional Information"
  };

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
        if (!formData.age_group) newErrors.age_group = "Age group is required.";
        if (!formData.residence_county) newErrors.residence_county = "Residence county is required.";
        if (Object.keys(newErrors).length > 0) isValid = false;
        break;
      case 4:
        if (!formData.email) newErrors.email = "Email is required.";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email address is invalid.";
        if (!formData.phone_number) newErrors.phone_number = "Phone number is required.";
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
      if (currentStep < 4) {
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

  const handleRegister = async () => {
    // Final validation before submitting
    if (!validateCurrentStep()) { // Reuse validation for the final step
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
        ageGroup: formData.age_group,
        residenceCounty: formData.residence_county,
        residenceLocation: formData.residence_location,
        email: formData.email,
        phoneNumber: sanitizePhoneNumber(formData.phone_number),
        businessNumber: sanitizePhoneNumber(formData.business_number),
        pin: formData.pin,
        yearsOfExperience: formData.years_of_experience ? parseInt(formData.years_of_experience) : undefined,
        country: formData.country,
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
    return (
      <Box width="100%" mb={4}>
        <HStack justifyContent="space-between" mb={2}>
          {[1, 2, 3, 4].map((step) => (
            <Box
              key={step}
              width={currentStep === step ? 10 : 8}
              height={currentStep === step ? 10 : 8}
              borderRadius="full"
              backgroundColor={currentStep === step ? "#8FD28F" : "#F2F2F2"}
              justifyContent="center"
              alignItems="center"
              position="relative"
            >
              <Text
                color={currentStep === step ? "white" : "#AAAAAA"}
                fontSize={currentStep === step ? "md" : "sm"}
              >
                {step}
              </Text>
              {step < 4 && (
                <Box
                  position="absolute"
                  height={1}
                  backgroundColor="#DDDDDD"
                  width="100%"
                  left="100%"
                  top="50%"
                />
              )}
            </Box>
          ))}
        </HStack>

        {/* Step description text based on current step */}
        <Text fontSize="14" fontWeight="500" textAlign="center" color="gray.600" mt={2} mb={4}>
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
      default:
        return null;
    }
  };

  const renderFarmDetailsForm = () => {
    return (
      <VStack width="100%" space={4}>
        <FormControl isInvalid={'farm_name' in errors}>
          <Text fontSize="16" fontWeight="500" mb={1} color="black">
            Farm Business Name *
          </Text>
          <Input
            variant="outline"
            bg="white"
            borderColor={'farm_name' in errors ? "red.500" : "#DDDDDD"}
            width="100%"
            p={2}
            borderRadius={8}
            value={formData.farm_name}
            onChangeText={(value) => handleInputChange("farm_name", value)}
            placeholder="John Farm"
          />
          <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
            {errors.farm_name}
          </FormControl.ErrorMessage>
        </FormControl>

        <FormControl isInvalid={'county' in errors}>
          <Text fontSize="16" fontWeight="500" mb={1} color="black">
            County *
          </Text>
          <Select
            borderRadius={8}
            borderColor={'county' in errors ? "red.500" : "#DDDDDD"}
            width="100%"
            selectedValue={formData.county}
            onValueChange={(value) => handleInputChange("county", value)}
            placeholder="Select County"
          >
            <Select.Item label="Turkana" value="Turkana" />
            <Select.Item label="Nairobi" value="Nairobi" />
            <Select.Item label="Mombasa" value="Mombasa" />
            <Select.Item label="Siaya" value="Siaya" />
          </Select>
          <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
            {errors.county}
          </FormControl.ErrorMessage>
        </FormControl>

        <FormControl isInvalid={'administrative_location' in errors}>
          <Text fontSize="16" fontWeight="500" mb={1} color="black">
            Administrative location *
          </Text>
          <Select
            borderRadius={8}
            borderColor={'administrative_location' in errors ? "red.500" : "#DDDDDD"}
            width="100%"
            selectedValue={formData.administrative_location}
            onValueChange={(value) => handleInputChange("administrative_location", value)}
            placeholder="Select Location"
          >
            <Select.Item label="Turkana" value="Turkana" />
            <Select.Item label="Siaya" value="Siaya" />
          </Select>
          <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
            {errors.administrative_location}
          </FormControl.ErrorMessage>
        </FormControl>

        <FormControl isInvalid={'farm_size' in errors}>
          <Text fontSize="16" fontWeight="500" mb={1} color="black">
            Farm Size (Acres) *
          </Text>
          <Input
            variant="outline"
            borderColor={'farm_size' in errors ? "red.500" : "#DDDDDD"}
            width="100%"
            p={2}
            borderRadius={8}
            value={formData.farm_size}
            onChangeText={(value) => handleInputChange("farm_size", value)}
            placeholder="1 Acre"
            keyboardType="numeric"
          />
          <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
            {errors.farm_size}
          </FormControl.ErrorMessage>
        </FormControl>

        <Box>
          <Text fontSize="16" fontWeight="500" mb={1} color="black">
            Ownership
          </Text>
          <Radio.Group
            name="ownership"
            value={formData.ownership}
            onChange={(value) => handleInputChange("ownership", value)}
          >
            <HStack space={3}>
              <Radio value="Freehold" colorScheme="green">Freehold</Radio>
              <Radio value="Leasehold" colorScheme="green">Leasehold</Radio>
              <Radio value="Communal" colorScheme="green">Communal</Radio>
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
          <Text fontSize="16" fontWeight="500" mb={1} color="black">
            Types of Farming *
          </Text>
          <Text fontSize="14" color="gray.500" mb={4}>
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
              <Checkbox value="Dairy cattle">Dairy cattle</Checkbox>
              <Checkbox value="Beef cattle">Beef cattle</Checkbox>
              <Checkbox value="Dairy and Meat goat">Dairy and Meat goat</Checkbox>
              <Checkbox value="Sheep and Goats">Sheep and Goats</Checkbox>
              <Checkbox value="Poultry">Poultry</Checkbox>
              <Checkbox value="Rabbit">Rabbit</Checkbox>
              <Checkbox value="Pigs (Swine)">Pigs (Swine)</Checkbox>
            </VStack>
          </Checkbox.Group>
          {'farming_types' in errors && (
            <HStack alignItems="center" space={1} mt={1}>
              <Icon name="alert-circle-outline" size={16} color="#EF4444" />
              <Text color="red.500" fontSize="xs">{errors.farming_types}</Text>
            </HStack>
          )}
        </FormControl>
      </VStack>
    );
  };

  const renderPersonalInfoForm = () => {
    return (
      <VStack width="100%" space={4}>
        <FormControl isInvalid={'first_name' in errors}>
          <Text fontSize="16" fontWeight="500" mb={1} color="black">
            First Name *
          </Text>
          <Input
            variant="outline"
            borderColor={'first_name' in errors ? "red.500" : "#DDDDDD"}
            width="100%"
            p={2}
            borderRadius={8}
            value={formData.first_name}
            onChangeText={(value) => handleInputChange("first_name", value)}
            placeholder="John"
          />
          <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
            {errors.first_name}
          </FormControl.ErrorMessage>
        </FormControl>

        <Box>
          <Text fontSize="16" fontWeight="500" mb={1} color="black">
            Middle Name
          </Text>
          <Input
            variant="outline"
            borderColor="#DDDDDD"
            width="100%"
            p={2}
            borderRadius={8}
            value={formData.middle_name}
            onChangeText={(value) => handleInputChange("middle_name", value)}
            placeholder="Doe"
          />
        </Box>

        <FormControl isInvalid={'last_name' in errors}>
          <Text fontSize="16" fontWeight="500" mb={1} color="black">
            Last Name *
          </Text>
          <Input
            variant="outline"
            borderColor={'last_name' in errors ? "red.500" : "#DDDDDD"}
            width="100%"
            p={2}
            borderRadius={8}
            value={formData.last_name}
            onChangeText={(value) => handleInputChange("last_name", value)}
            placeholder="Doe"
          />
          <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
            {errors.last_name}
          </FormControl.ErrorMessage>
        </FormControl>

        <FormControl isInvalid={'gender' in errors}>
          <Text fontSize="16" fontWeight="500" mb={1} color="black">
            Gender *
          </Text>
          <Radio.Group
            name="gender"
            value={formData.gender}
            onChange={(value) => handleInputChange("gender", value)}
          >
            <HStack space={6}>
              <Radio value="Male" colorScheme="green">Male</Radio>
              <Radio value="Female" colorScheme="green">Female</Radio>
            </HStack>
          </Radio.Group>
          <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
            {errors.gender}
          </FormControl.ErrorMessage>
        </FormControl>

        <FormControl isInvalid={'age_group' in errors}>
          <Text fontSize="16" fontWeight="500" mb={1} color="black">
            Age Group *
          </Text>
          <Select
            borderRadius={8}
            borderColor={'age_group' in errors ? "red.500" : "#DDDDDD"}
            width="100%"
            selectedValue={formData.age_group}
            onValueChange={(value) => handleInputChange("age_group", value)}
            placeholder="Select Age Group"
          >
            <Select.Item label="15-24" value="15-24" />
            <Select.Item label="25-34" value="25-34" />
            <Select.Item label="35-44" value="35-44" />
            <Select.Item label="45-54" value="45-54" />
            <Select.Item label="55+" value="55+" />
          </Select>
          <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
            {errors.age_group}
          </FormControl.ErrorMessage>
        </FormControl>

        <FormControl isInvalid={'residence_county' in errors}>
          <Text fontSize="16" fontWeight="500" mb={1} color="black">
            Residence County *
          </Text>
          <Select
            borderRadius={8}
            borderColor={'residence_county' in errors ? "red.500" : "#DDDDDD"}
            width="100%"
            selectedValue={formData.residence_county}
            onValueChange={(value) => handleInputChange("residence_county", value)}
            placeholder="Select County"
          >
            <Select.Item label="Siaya" value="Siaya" />
            <Select.Item label="Nairobi" value="Nairobi" />
            <Select.Item label="Mombasa" value="Mombasa" />
            <Select.Item label="Turkana" value="Turkana" />
          </Select>
          <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
            {errors.residence_county}
          </FormControl.ErrorMessage>
        </FormControl>

        <Box>
          <Text fontSize="16" fontWeight="500" mb={1} color="black">
            Residence Location
          </Text>
          <Select
            borderRadius={8}
            borderColor="#DDDDDD"
            width="100%"
            selectedValue={formData.residence_location}
            onValueChange={(value) => handleInputChange("residence_location", value)}
            placeholder="Select Administrative County"
          >
            <Select.Item label="Siaya" value="Siaya" />
            <Select.Item label="Turkana" value="Turkana" />
          </Select>
        </Box>
      </VStack>
    );
  };

  const renderProfessionalInfoForm = () => {
    return (
      <VStack width="100%" space={4}>
        <Box>
          <Text fontSize="16" fontWeight="500" mb={1} color="black">
            Years of Farming Practice
          </Text>
          <Input
            variant="outline"
            borderColor="#DDDDDD"
            width="100%"
            p={2}
            borderRadius={8}
            value={formData.years_of_experience}
            onChangeText={(value) => handleInputChange("years_of_experience", value)}
            placeholder=""
            keyboardType="numeric"
          />
        </Box>

        <FormControl isInvalid={'email' in errors}>
          <Text fontSize="16" fontWeight="500" mb={1} color="black">
            E-mail Address *
          </Text>
          <Input
            variant="outline"
            borderColor={'email' in errors ? "red.500" : "#DDDDDD"}
            width="100%"
            p={2}
            borderRadius={8}
            value={formData.email}
            onChangeText={(value) => handleInputChange("email", value)}
            placeholder="your_email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
            {errors.email}
          </FormControl.ErrorMessage>
        </FormControl>

        <FormControl isInvalid={'phone_number' in errors}>
          <Text fontSize="16" fontWeight="500" mb={1} color="black">
            Additional Contact *
          </Text>
          <Input
            variant="outline"
            borderColor={'phone_number' in errors ? "red.500" : "#DDDDDD"}
            width="100%"
            p={2}
            borderRadius={8}
            value={formData.phone_number}
            onChangeText={(value) => handleInputChange("phone_number", value)}
            placeholder="0712345678"
            keyboardType="phone-pad"
          />
          <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
            {errors.phone_number}
          </FormControl.ErrorMessage>
        </FormControl>

        <Box>
          <Text fontSize="16" fontWeight="500" mb={1} color="black">
            Business Number
          </Text>
          <Input
            variant="outline"
            borderColor="#DDDDDD"
            width="100%"
            p={2}
            borderRadius={8}
            value={formData.business_number}
            onChangeText={(value) => handleInputChange("business_number", value)}
            placeholder="(___) ___-____"
            keyboardType="phone-pad"
          />
        </Box>

        {/* Modern PIN Input */}
        <FormControl isInvalid={!!errors.pin}>
          <Text fontSize="16" fontWeight="500" mb={1} color="black">
            Set 4-digit PIN *
          </Text>
          <CodeField
            value={formData.pin}
            onChangeText={value => handleInputChange("pin", value)}
            cellCount={4}
            rootStyle={{ marginBottom: ('pin' in errors) ? 0 : 20 }}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            renderCell={({ index, symbol, isFocused }) => (
              <Box
                key={index}
                width="60px"
                height="60px"
                borderWidth={0}
                borderRadius={8}
                justifyContent="center"
                alignItems="center"
                backgroundColor="#e5f3e5"
              >
                <Text fontSize={24}>{symbol ? '•' : isFocused ? <Cursor /> : null}</Text>
              </Box>
            )}
          />
          <FormControl.ErrorMessage leftIcon={<CustomIcon library="MaterialCommunityIcons" name="alert-circle-outline" size={20} color="#EF4444" />}>{errors.pin}</FormControl.ErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.confirmPin}>
          <Text fontSize="16" fontWeight="500" mb={1} color="black">
            Confirm 4-digit PIN *
          </Text>
          <CodeField
            value={formData.confirmPin}
            onChangeText={value => handleInputChange("confirmPin", value)}
            cellCount={4}
            rootStyle={{ marginBottom: ('confirmPin' in errors) ? 0 : 20 }}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            renderCell={({ index, symbol, isFocused }) => (
              <Box
                key={index}
                width="60px"
                height="60px"
                borderWidth={0}
                borderRadius={8}
                justifyContent="center"
                alignItems="center"
                backgroundColor="#e5f3e5"
              >
                <Text fontSize={24}>{symbol ? '•' : isFocused ? <Cursor /> : null}</Text>
              </Box>
            )}
          />
          <FormControl.ErrorMessage leftIcon={<CustomIcon library="MaterialCommunityIcons" name="alert-circle-outline" size={20} color="#EF4444" />}>{errors.confirmPin}</FormControl.ErrorMessage>
        </FormControl>

        <Box mt={2}>
          <Text fontSize="12" textAlign="center" color="black">
            By tapping "Continue" you acknowledge that you have read and agreed to the{" "}
            <Text color="#74c474">Terms and Conditions</Text>
          </Text>
        </Box>
      </VStack>
    );
  };

  return (
    <Box flex={1} backgroundColor="white">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box flex={1} paddingX={6} paddingY={8}>
          <Box position="absolute" top={0} left={0}>
            <Image source={require("../../assets/images/top-left-decoration.png")} style={{ width: 208, height: 144 }} />
          </Box>

          <Box mt={16} alignItems="center" mb={6}>
            <Text fontSize="22" fontWeight="bold" color="black">Registration</Text>
            <Text fontSize="14" color="gray.600">Set Up Your Farm</Text>
          </Box>

          {renderStepIndicator()}
          {renderForm()}

          <HStack width="100%" justifyContent="space-between" mt={8}>
            {currentStep > 1 ? (
              <Button
                onPress={handlePrevious}
                width="45%"
                variant="outline"
                borderColor="#8FD28F"
                _text={{ color: "#8FD28F" }}
              >
                Previous
              </Button>
            ) : (
              <Box width="45%" />
            )}

            <Button
              onPress={currentStep === 4 ? handleRegister : handleNext}
              width="45%"
              backgroundColor="#8FD28F"
              _text={{ color: "white" }}
              isLoading={loading && currentStep === 4}
            >
              {currentStep < 4 ? "Next" : "Continue"}
            </Button>
          </HStack>

          {currentStep === 1 && (
            <Box mt={8} flexDirection="row" justifyContent="center">
              <Text fontSize="12" color="black" className="text-[16px]">Already have an account? </Text>
              <Pressable onPress={() => navigation.navigate("SignInScreen")}>
                <Text fontSize="12" color="#74c474" fontWeight="bold" className="text-[16px] font-semibold">Login</Text>
              </Pressable>
            </Box>
          )}
        </Box>
      </ScrollView>
    </Box>
  );
}