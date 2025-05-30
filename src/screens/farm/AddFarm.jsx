import React, { useState, useEffect } from 'react';
import {
  Box, Text, VStack, HStack, ScrollView, FormControl, Input,
  Button, Select, CheckIcon, Radio, Checkbox, Heading, Divider,
  Spinner, useToast
} from 'native-base';
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Dropdown } from 'react-native-element-dropdown';
import { COLORS } from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';
import { createFarm } from '../../services/farm';
import countyData from '../../assets/data/county_with_titled_wards.json';

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
  const [countyList, setCountyList] = useState([]);
  const [wardsList, setWardsList] = useState([]);
  const toast = useToast();

  // Initialize county list on component mount
  useEffect(() => {
    const counties = countyData.map(item => item.County);
    setCountyList(counties);
  }, []);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleCountyChange = (selectedCounty) => {
    handleInputChange('county', selectedCounty);
    const match = countyData.find(c => c.County === selectedCounty);
    setWardsList(match ? match.Wards : []);
    handleInputChange('administrative_location', '');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.farm_name.trim()) newErrors.farm_name = 'Farm name is required';
    if (!formData.county) newErrors.county = 'County is required';
    if (!formData.administrative_location) newErrors.administrative_location = 'Location is required';
    if (!formData.farm_size.trim() || isNaN(formData.farm_size) || parseFloat(formData.farm_size) <= 0)
      newErrors.farm_size = 'Valid farm size is required';
    if (!formData.ownership) newErrors.ownership = 'Ownership is required';
    if (formData.farming_types.length === 0) newErrors.farming_types = 'Select at least one type';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.show({ title: 'Validation Error', description: 'Check required fields.', status: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: formData.farm_name,
        county: formData.county,
        administrativeLocation: formData.administrative_location,
        size: parseFloat(formData.farm_size),
        ownership: formData.ownership,
        farmingTypes: formData.farming_types,
      };

      const result = await createFarm(payload);

      if (result.error) {
        toast.show({ title: 'Error', description: result.error, status: 'error' });
      } else {
        toast.show({
          title: 'Success',
          description: 'Farm created!',
          status: 'success',
          placement: 'top',
          duration: 3000,
          backgroundColor: COLORS.green2,
          color: COLORS.white,
        });
        navigation.navigate('FarmInformation', { refresh: true });
      }
    } catch (error) {
      console.error(error);
      toast.show({ title: 'Unexpected Error', description: 'Please try again.', status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader title="Add Farm" />
      <StatusBar translucent backgroundColor={COLORS.green2} barStyle={'light-content'} />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Box bg="white" borderRadius={16} p={6} shadow={2}>
          <Heading size="md" mb={4} color={COLORS.green}>Farm Information</Heading>
          <Divider mb={4} />

          <VStack space={4}>
            <FormControl isRequired isInvalid={errors.farm_name}>
              <FormControl.Label>
                <Text fontSize="16" fontWeight="500" color="gray.700">
                  Farm Name
                </Text>
              </FormControl.Label>
              <Input
                value={formData.farm_name}
                onChangeText={val => handleInputChange('farm_name', val)}
                placeholder="e.g. Sunrise Farm"
                variant="filled"
                backgroundColor="green.50"
                borderColor={errors.farm_name ? "red.500" : "green.100"}
                borderWidth={1}
                height={12}
                borderRadius={8}
                fontSize="16"
              />
              <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
                {errors.farm_name}
              </FormControl.ErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={errors.county}>
              <FormControl.Label>
                <Text fontSize="16" fontWeight="500" color="gray.700">
                  County
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

            <FormControl isRequired isInvalid={errors.administrative_location}>
              <FormControl.Label>
                <Text fontSize="16" fontWeight="500" color="gray.700">
                  Administrative Location
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
                placeholder="Select Administrative Location"
                searchPlaceholder="Search location..."
                value={formData.administrative_location}
                onChange={item => handleInputChange('administrative_location', item.value)}
                disable={!formData.county}
              />
              <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
                {errors.administrative_location}
              </FormControl.ErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={errors.farm_size}>
              <FormControl.Label>
                <Text fontSize="16" fontWeight="500" color="gray.700">
                  Farm Size (acres)
                </Text>
              </FormControl.Label>
              <Input
                value={formData.farm_size}
                keyboardType="numeric"
                onChangeText={val => handleInputChange('farm_size', val)}
                placeholder="e.g. 5.0"
                variant="filled"
                backgroundColor="green.50"
                borderColor={errors.farm_size ? "red.500" : "green.100"}
                borderWidth={1}
                height={12}
                borderRadius={8}
                fontSize="16"
              />
              <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
                {errors.farm_size}
              </FormControl.ErrorMessage>
            </FormControl>

            <FormControl isRequired>
              <FormControl.Label>
                <Text fontSize="16" fontWeight="500" color="gray.700">
                  Ownership
                </Text>
              </FormControl.Label>
              <Radio.Group
                name="ownership"
                value={formData.ownership}
                onChange={val => handleInputChange('ownership', val)}
              >
                <HStack space={4} flexWrap="wrap">
                  {['Freehold', 'Leasehold', 'Communal'].map(option => (
                    <Radio
                      key={option}
                      value={option}
                      colorScheme="green"
                      size="sm"
                    >
                      <Text fontSize="14">{option}</Text>
                    </Radio>
                  ))}
                </HStack>
              </Radio.Group>
            </FormControl>

            <FormControl isRequired isInvalid={errors.farming_types}>
              <FormControl.Label>
                <Text fontSize="16" fontWeight="500" color="gray.700">
                  Types of Farming
                </Text>
              </FormControl.Label>
              <Text fontSize="14" color="gray.500" mb={3}>
                Select one or more types of farming
              </Text>
              <Checkbox.Group
                colorScheme="green"
                value={formData.farming_types}
                onChange={vals => handleInputChange('farming_types', vals)}
              >
                <VStack space={3}>
                  {[
                    'Dairy cattle',
                    'Beef cattle',
                    'Dairy and Meat goat',
                    'Sheep and Goats',
                    'Poultry',
                    'Rabbit',
                    'Pigs (Swine)'
                  ].map(type => (
                    <Checkbox
                      key={type}
                      value={type}
                      size="sm"
                    >
                      <Text fontSize="14">{type}</Text>
                    </Checkbox>
                  ))}
                </VStack>
              </Checkbox.Group>
              <FormControl.ErrorMessage leftIcon={<Icon name="alert-circle-outline" size={16} color="#EF4444" />}>
                {errors.farming_types}
              </FormControl.ErrorMessage>
            </FormControl>

            <Button
              mt={4}
              bg={COLORS.green}
              onPress={handleSave}
              isLoading={isLoading}
              isDisabled={isLoading}
              height={12}
              borderRadius={8}
              _text={{ fontSize: "16", fontWeight: "500" }}
              _pressed={{ backgroundColor: "green.600" }}
            >
              {isLoading ? 'Saving...' : 'Add Farm'}
            </Button>
          </VStack>
        </Box>
      </ScrollView>
    </SafeAreaView>
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