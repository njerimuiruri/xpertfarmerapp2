import React, { useState } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  ScrollView,
  IconButton,
  FormControl,
  Input,
  Button,
  TextArea,
  Select,
  CheckIcon,
  Radio,
  Checkbox,
  Heading,
  Divider,
  Icon,
  Pressable,
  Spinner,
  useToast,
} from 'native-base';
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { COLORS } from '../../constants/theme';
import { icons } from '../../constants';
import FastImage from 'react-native-fast-image';
import SecondaryHeader from '../../components/headers/secondary-header';
import { createFarm } from '../../services/farm'; // Import the farm service
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddFarm({ navigation }) {
  const [formData, setFormData] = useState({
    farm_name: '',
    county: '',
    administrative_location: '',
    farm_size: '',
    ownership: 'Freehold',
    farming_types: [],
    isActive: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.farm_name.trim()) {
      newErrors.farm_name = 'Farm name is required';
    }

    if (!formData.county) {
      newErrors.county = 'County is required';
    }

    if (!formData.administrative_location) {
      newErrors.administrative_location = 'Administrative location is required';
    }

    if (!formData.farm_size.trim()) {
      newErrors.farm_size = 'Farm size is required';
    } else if (isNaN(parseFloat(formData.farm_size)) || parseFloat(formData.farm_size) <= 0) {
      newErrors.farm_size = 'Please enter a valid farm size';
    }

    if (!formData.ownership) {
      newErrors.ownership = 'Ownership type is required';
    }

    if (formData.farming_types.length === 0) {
      newErrors.farming_types = 'Please select at least one farming type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.show({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get user information from AsyncStorage
      const userString = await AsyncStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;

      if (!user || !user.id) {
        toast.show({
          title: "Error",
          description: "User information not found. Please login again.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        return;
      }

      // Construct the payload here
      const payload = {
        name: formData.farm_name,
        county: formData.county,
        administrativeLocation: formData.administrative_location,
        size: parseFloat(formData.farm_size),
        ownership: formData.ownership,
        farmingTypes: formData.farming_types,
        userId: user.id,
      };

      const result = await createFarm(payload);

      if (result.error) {
        toast.show({
          title: "Error",
          description: result.error,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      } else {
        toast.show({
          title: "Success",
          description: "Farm created successfully!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // Navigate back or to farms list
        navigation.goBack();
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.show({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader title="Add Farm" />
      <StatusBar
        translucent
        backgroundColor={COLORS.green2}
        animated={true}
        barStyle={'light-content'}
      />

      <ScrollView flex={1}>
        <Box bg="white" borderRadius={16} m={4} p={6} shadow={2}>
          <Heading size="md" mb={4} color={COLORS.green}>Farm Information</Heading>
          <Divider mb={4} />

          <VStack space={5}>
            <FormControl isRequired isInvalid={errors.farm_name}>
              <FormControl.Label _text={{ fontWeight: "bold" }}>Farm Name (Business Name)</FormControl.Label>
              <Input
                value={formData.farm_name}
                onChangeText={(value) => handleInputChange("farm_name", value)}
                placeholder="Enter farm name"
                borderRadius={10}
                borderColor={COLORS.gray3}
                backgroundColor={COLORS.lightGreen}
                fontSize="md"
                bg="white"
                shadow={1}
                isDisabled={isLoading}
              />
              <FormControl.ErrorMessage>
                {errors.farm_name}
              </FormControl.ErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={errors.county}>
              <FormControl.Label _text={{ fontWeight: "bold" }}>County</FormControl.Label>
              <Select
                selectedValue={formData.county}
                borderRadius={10}
                borderColor={COLORS.gray3}
                backgroundColor={COLORS.lightGreen}
                fontSize="md"
                placeholder="Select County"
                onValueChange={(value) => handleInputChange("county", value)}
                _selectedItem={{
                  bg: COLORS.lightGreen,
                  endIcon: <CheckIcon size={5} color={COLORS.green} />
                }}
                bg="white"
                shadow={1}
                isDisabled={isLoading}
              >
                <Select.Item label="Turkana" value="Turkana" />
                <Select.Item label="Nairobi" value="Nairobi" />
                <Select.Item label="Mombasa" value="Mombasa" />
                <Select.Item label="Siaya" value="Siaya" />
                <Select.Item label="Kiambu" value="Kiambu" />
              </Select>
              <FormControl.ErrorMessage>
                {errors.county}
              </FormControl.ErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={errors.administrative_location}>
              <FormControl.Label _text={{ fontWeight: "bold" }}>Administrative Location</FormControl.Label>
              <Select
                selectedValue={formData.administrative_location}
                borderRadius={10}
                borderColor={COLORS.gray3}
                backgroundColor={COLORS.lightGreen}
                fontSize="md"
                placeholder="Select Location"
                onValueChange={(value) => handleInputChange("administrative_location", value)}
                _selectedItem={{
                  bg: COLORS.lightGreen,
                  endIcon: <CheckIcon size={5} color={COLORS.green} />
                }}
                bg="white"
                shadow={1}
                isDisabled={isLoading}
              >
                <Select.Item label="Turkana" value="Turkana" />
                <Select.Item label="Siaya" value="Siaya" />
                <Select.Item label="Kikuyu" value="Kikuyu" />
              </Select>
              <FormControl.ErrorMessage>
                {errors.administrative_location}
              </FormControl.ErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={errors.farm_size}>
              <FormControl.Label _text={{ fontWeight: "bold" }}>Farm Size (Acres)</FormControl.Label>
              <Input
                value={formData.farm_size}
                onChangeText={(value) => handleInputChange("farm_size", value)}
                placeholder="Enter farm size (e.g. 5.2)"
                borderRadius={10}
                borderColor={COLORS.gray3}
                backgroundColor={COLORS.lightGreen}
                fontSize="md"
                bg="white"
                shadow={1}
                keyboardType="numeric"
                isDisabled={isLoading}
                InputRightElement={
                  <Text mr={4} color="gray.500">acres</Text>
                }
              />
              <FormControl.ErrorMessage>
                {errors.farm_size}
              </FormControl.ErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={errors.ownership}>
              <FormControl.Label _text={{ fontWeight: "bold" }}>Ownership</FormControl.Label>
              <Radio.Group
                name="ownership"
                value={formData.ownership}
                onChange={(value) => handleInputChange("ownership", value)}
                isDisabled={isLoading}
              >
                <HStack space={4} flexWrap="wrap">
                  <Radio value="Freehold" colorScheme="green" my={1}>
                    <Text ml={2}>Freehold</Text>
                  </Radio>
                  <Radio value="Leasehold" colorScheme="green" my={1}>
                    <Text ml={2}>Leasehold</Text>
                  </Radio>
                  <Radio value="Communal" colorScheme="green" my={1}>
                    <Text ml={2}>Communal</Text>
                  </Radio>
                </HStack>
              </Radio.Group>
              <FormControl.ErrorMessage>
                {errors.ownership}
              </FormControl.ErrorMessage>
            </FormControl>
          </VStack>
        </Box>

        <Box bg="white" borderRadius={16} m={4} mt={0} p={6} shadow={2}>
          <Heading size="md" mb={4} color={COLORS.green}>Farming Activities</Heading>
          <Divider mb={4} />

          <VStack space={5}>
            <FormControl isRequired isInvalid={errors.farming_types}>
              <FormControl.Label _text={{ fontWeight: "bold" }}>Types of Farming</FormControl.Label>
              <Text fontSize="14" color="gray.500" mb={2}>
                Select one or more types of farming
              </Text>

              <Box bg="white" p={4} borderRadius={10} borderWidth={1} borderColor={COLORS.gray3} shadow={1}>
                <Checkbox.Group
                  colorScheme="green"
                  value={formData.farming_types}
                  onChange={(values) => setFormData(prev => ({ ...prev, farming_types: values }))}
                  isDisabled={isLoading}
                >
                  <VStack space={3}>
                    <Checkbox value="Dairy cattle">
                      <Text ml={2}>Dairy cattle</Text>
                    </Checkbox>
                    <Checkbox value="Beef cattle">
                      <Text ml={2}>Beef cattle</Text>
                    </Checkbox>
                    <Checkbox value="Dairy and Meat goat">
                      <Text ml={2}>Dairy and Meat goat</Text>
                    </Checkbox>
                    <Checkbox value="Sheep and Goats">
                      <Text ml={2}>Sheep and Goats</Text>
                    </Checkbox>
                    <Checkbox value="Poultry">
                      <Text ml={2}>Poultry</Text>
                    </Checkbox>
                    <Checkbox value="Rabbit">
                      <Text ml={2}>Rabbit</Text>
                    </Checkbox>
                    <Checkbox value="Pigs (Swine)">
                      <Text ml={2}>Pigs (Swine)</Text>
                    </Checkbox>
                    <Checkbox value="Crops">
                      <Text ml={2}>Crops</Text>
                    </Checkbox>
                  </VStack>
                </Checkbox.Group>
              </Box>
              <FormControl.ErrorMessage>
                {errors.farming_types}
              </FormControl.ErrorMessage>
            </FormControl>

            <FormControl>
              <FormControl.Label _text={{ fontWeight: "bold" }}>Status</FormControl.Label>
              <Select
                selectedValue={formData.isActive ? "active" : "inactive"}
                borderRadius={10}
                borderColor={COLORS.gray3}
                backgroundColor={COLORS.lightGreen}
                fontSize="md"
                onValueChange={(value) =>
                  setFormData({ ...formData, isActive: value === "active" })
                }
                _selectedItem={{
                  bg: COLORS.lightGreen,
                  endIcon: <CheckIcon size={5} color={COLORS.green} />
                }}
                bg="white"
                shadow={1}
                isDisabled={isLoading}
              >
                <Select.Item label="Active" value="active" />
                <Select.Item label="Inactive" value="inactive" />
              </Select>
            </FormControl>
          </VStack>
        </Box>

        <Box p={4} pb={8}>
          <Button
            bg={COLORS.green}
            borderRadius={10}
            onPress={handleSave}
            py={4}
            _text={{ fontWeight: "bold", fontSize: "md" }}
            shadow={3}
            isLoading={isLoading}
            isDisabled={isLoading}
            leftIcon={isLoading ? <Spinner size="sm" color="white" /> : null}
          >
            {isLoading ? 'Creating Farm...' : 'Add Farm'}
          </Button>
        </Box>
      </ScrollView>
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGreen,
  },
  headerIcon: {
    width: 24,
    height: 24,
  },
  buttonIcon: {
    width: 20,
    height: 20,
  },
});