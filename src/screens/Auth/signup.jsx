import React, { useState } from "react";
import { CodeField, Cursor } from 'react-native-confirmation-code-field';
import { Image, ScrollView } from "react-native";
import { Box, Text, Input, Button, VStack, HStack, Pressable, Radio, Checkbox, Select, useToast } from "native-base";
import { register } from '../../services/user';

export default function RegisterScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
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
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.farm_name || !formData.county || !formData.administrative_location || !formData.farm_size) {
          toast.show({ description: "All fields with * are required!", placement: "top", backgroundColor: "red.500" });
          return false;
        }
        return true;
      case 2:
        if (formData.farming_types.length === 0) {
          toast.show({ description: "Please select at least one farming type!", placement: "top", backgroundColor: "red.500" });
          return false;
        }
        return true;
      case 3:
        if (!formData.first_name || !formData.last_name || !formData.gender || !formData.age_group || !formData.residence_county) {
          toast.show({ description: "All fields with * are required!", placement: "top", backgroundColor: "red.500" });
          return false;
        }
        return true;
      case 4:
        if (!formData.email || !formData.phone_number || !formData.pin || !formData.confirmPin) {
          toast.show({ description: "All fields with * are required!", placement: "top", backgroundColor: "red.500" });
          return false;
        }
        if (formData.pin.length !== 4 || formData.confirmPin.length !== 4) {
          toast.show({ description: "PIN must be 4 digits!", placement: "top", backgroundColor: "red.500" });
          return false;
        }
        if (formData.pin !== formData.confirmPin) {
          toast.show({ description: "PINs do not match!", placement: "top", backgroundColor: "red.500" });
          return false;
        }
        return true;
      default:
        return true;
    }
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
    if (!formData.email || !formData.phone_number || !formData.pin || !formData.confirmPin) {
      toast.show({ description: "All fields with * are required!", placement: "top", backgroundColor: "red.500" });
      return;
    }
    if (formData.pin.length !== 4 || formData.confirmPin.length !== 4) {
      toast.show({ description: "PIN must be 4 digits!", placement: "top", backgroundColor: "red.500" });
      return;
    }
    if (formData.pin !== formData.confirmPin) {
      toast.show({ description: "PINs do not match!", placement: "top", backgroundColor: "red.500" });
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
        <Box>
          <Text fontSize="16" fontWeight="500" mb={1} color="black">
            Farm Business Name
          </Text>
          <Input
            variant="outline"
            bg="white"
            borderColor="#DDDDDD"
            width="100%"
            p={2}
            borderRadius={8}
            value={formData.farm_name}
            onChangeText={(value) => handleInputChange("farm_name", value)}
            placeholder="John Farm"
          />
        </Box>

        <Box>
          <Text fontSize="16" fontWeight="500" mb={1} color="black">
            County
          </Text>
          <Select
            borderRadius={8}
            borderColor="#DDDDDD"
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
        </Box>

        <Box>
          <Text fontSize="16" fontWeight="500" mb={1} color="black">
            Administrative location
          </Text>
          <Select
            borderRadius={8}
            borderColor="#DDDDDD"
            width="100%"
            selectedValue={formData.administrative_location}
            onValueChange={(value) => handleInputChange("administrative_location", value)}
            placeholder="Select Location"
          >
            <Select.Item label="Turkana" value="Turkana" />
            <Select.Item label="Siaya" value="Siaya" />
          </Select>
        </Box>

        <Box>
          <Text fontSize="16" fontWeight="500" mb={1} color="black">
            Farm Size (Acres)
          </Text>
          <Input
            variant="outline"
            borderColor="#DDDDDD"
            width="100%"
            p={2}
            borderRadius={8}
            value={formData.farm_size}
            onChangeText={(value) => handleInputChange("farm_size", value)}
            placeholder="1 Acre"
            keyboardType="numeric"
          />
        </Box>

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
        <Box>
          <Text fontSize="16" fontWeight="500" mb={1} color="black">
            Types of Farming
          </Text>
          <Text fontSize="14" color="gray.500" mb={4}>
            Select one or more types of farming
          </Text>

          <Checkbox.Group
            colorScheme="green"
            value={formData.farming_types}
            onChange={(values) => setFormData(prev => ({ ...prev, farming_types: values }))}
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
        </Box>
      </VStack>
    );
  };

  const renderPersonalInfoForm = () => {
    return (
      <VStack width="100%" space={4}>
        <Box>
          <Text fontSize="16" fontWeight="500" mb={1} color="black">
            First Name
          </Text>
          <Input
            variant="outline"
            borderColor="#DDDDDD"
            width="100%"
            p={2}
            borderRadius={8}
            value={formData.first_name}
            onChangeText={(value) => handleInputChange("first_name", value)}
            placeholder="John"
          />
        </Box>

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

        <Box>
          <Text fontSize="16" fontWeight="500" mb={1} color="black">
            Last Name
          </Text>
          <Input
            variant="outline"
            borderColor="#DDDDDD"
            width="100%"
            p={2}
            borderRadius={8}
            value={formData.last_name}
            onChangeText={(value) => handleInputChange("last_name", value)}
            placeholder="Doe"
          />
        </Box>

        <Box>
          <Text fontSize="16" fontWeight="500" mb={1} color="black">
            Gender
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
        </Box>

        <Box>
          <Text fontSize="16" fontWeight="500" mb={1} color="black">
            Age Group
          </Text>
          <Select
            borderRadius={8}
            borderColor="#DDDDDD"
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
        </Box>

        <Box>
          <Text fontSize="16" fontWeight="500" mb={1} color="black">
            Residence County
          </Text>
          <Select
            borderRadius={8}
            borderColor="#DDDDDD"
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
        </Box>

        <Box>
          <Text fontSize="16" fontWeight="500" mb={1} color="black">
            Residence Location
          </Text>
          <Select
            borderRadius={8}
            borderColor="#DDDDDD"
            width="100%"
            selectedValue={formData.residence_location}
            onValueChange={(value) => handleInputChange("residence_location ", value)}
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

        <Box>
          <Text fontSize="16" fontWeight="500" mb={1} color="black">
            E-mail Address
          </Text>
          <Input
            variant="outline"
            borderColor="#DDDDDD"
            width="100%"
            p={2}
            borderRadius={8}
            value={formData.email}
            onChangeText={(value) => handleInputChange("email", value)}
            placeholder="your_email@example.com"
            keyboardType="email-address"
          />
        </Box>

        <Box>
          <Text fontSize="16" fontWeight="500" mb={1} color="black">
            Additional Contact
          </Text>
          <Input
            variant="outline"
            borderColor="#DDDDDD"
            width="100%"
            p={2}
            borderRadius={8}
            value={formData.phone_number}
            onChangeText={(value) => handleInputChange("phone_number", value)}
            placeholder="(___) ___-____"
            keyboardType="phone-pad"
          />
        </Box>

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
        <Box>
          <Text fontSize="16" fontWeight="500" mb={1} color="black">
            Set 4-digit PIN
          </Text>
          <CodeField
            value={formData.pin}
            onChangeText={value => handleInputChange("pin", value)}
            cellCount={4}
            rootStyle={{ marginBottom: 20 }}
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
        </Box>

        <Box>
          <Text fontSize="16" fontWeight="500" mb={1} color="black">
            Confirm 4-digit PIN
          </Text>
          <CodeField
            value={formData.confirmPin}
            onChangeText={value => handleInputChange("confirmPin", value)}
            cellCount={4}
            rootStyle={{ marginBottom: 20 }}
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
        </Box>

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
              <Text fontSize="12" color="black" className="text-[16px] font-semibold">Already have an account? </Text>
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