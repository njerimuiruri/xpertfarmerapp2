import React, { useState } from 'react';
import {
  Box, Text, VStack, HStack, ScrollView, FormControl, Input,
  Button, Select, CheckIcon, Radio, Checkbox, Heading, Divider,
  Spinner, useToast
} from 'native-base';
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { COLORS } from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';
import { createFarm } from '../../services/farm';

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
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
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
      // 🔥 Removed isActive
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
              <FormControl.Label>Farm Name</FormControl.Label>
              <Input
                value={formData.farm_name}
                onChangeText={val => handleInputChange('farm_name', val)}
                placeholder="e.g. Sunrise Farm"
              />
              <FormControl.ErrorMessage>{errors.farm_name}</FormControl.ErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={errors.county}>
              <FormControl.Label>County</FormControl.Label>
              <Select
                selectedValue={formData.county}
                placeholder="Select county"
                onValueChange={val => handleInputChange('county', val)}
                _selectedItem={{ bg: COLORS.lightGreen, endIcon: <CheckIcon size={5} /> }}
              >
                <Select.Item label="Nairobi" value="Nairobi" />
                <Select.Item label="Turkana" value="Turkana" />
                <Select.Item label="Mombasa" value="Mombasa" />
              </Select>
              <FormControl.ErrorMessage>{errors.county}</FormControl.ErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={errors.administrative_location}>
              <FormControl.Label>Administrative Location</FormControl.Label>
              <Input
                value={formData.administrative_location}
                onChangeText={val => handleInputChange('administrative_location', val)}
                placeholder="e.g. Kikuyu"
              />
              <FormControl.ErrorMessage>{errors.administrative_location}</FormControl.ErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={errors.farm_size}>
              <FormControl.Label>Farm Size (acres)</FormControl.Label>
              <Input
                value={formData.farm_size}
                keyboardType="numeric"
                onChangeText={val => handleInputChange('farm_size', val)}
              />
              <FormControl.ErrorMessage>{errors.farm_size}</FormControl.ErrorMessage>
            </FormControl>

            <FormControl isRequired>
              <FormControl.Label>Ownership</FormControl.Label>
              <Radio.Group
                name="ownership"
                value={formData.ownership}
                onChange={val => handleInputChange('ownership', val)}
              >
                <HStack space={4}>
                  <Radio value="Freehold">Freehold</Radio>
                  <Radio value="Leasehold">Leasehold</Radio>
                  <Radio value="Communal">Communal</Radio>
                </HStack>
              </Radio.Group>
            </FormControl>

            <FormControl isRequired isInvalid={errors.farming_types}>
              <FormControl.Label>Farming Types</FormControl.Label>
              <Checkbox.Group
                value={formData.farming_types}
                onChange={vals => handleInputChange('farming_types', vals)}
              >
                <VStack space={2}>
                  <Checkbox value="Dairy cattle">Dairy cattle</Checkbox>
                  <Checkbox value="Beef cattle">Beef cattle</Checkbox>
                  <Checkbox value="Poultry">Poultry</Checkbox>
                  <Checkbox value="Crops">Crops</Checkbox>
                </VStack>
              </Checkbox.Group>
              <FormControl.ErrorMessage>{errors.farming_types}</FormControl.ErrorMessage>
            </FormControl>

            {/* <FormControl>
              <FormControl.Label>Status</FormControl.Label>
              <Select
                selectedValue={formData.isActive ? 'active' : 'inactive'}
                onValueChange={(val) => handleInputChange('isActive', val === 'active')}
              >
                <Select.Item label="Active" value="active" />
                <Select.Item label="Inactive" value="inactive" />
              </Select>
            </FormControl> */}

            <Button
              mt={4}
              bg={COLORS.green}
              onPress={handleSave}
              isLoading={isLoading}
              isDisabled={isLoading}
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

