import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Text, VStack, HStack, ScrollView, IconButton, FormControl, Input,
  Button, Select, CheckIcon, Radio, Checkbox, Heading, Divider, AlertDialog,
  Spinner, Center, useToast
} from 'native-base';
import { StyleSheet, SafeAreaView, StatusBar, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Dropdown } from 'react-native-element-dropdown';
import { COLORS } from '../../constants/theme';
import { icons } from '../../constants';
import FastImage from 'react-native-fast-image';
import SecondaryHeader from '../../components/headers/secondary-header';
import { getFarmById, updateFarm, deleteFarm } from '../../services/farm';
import countyData from '../../assets/data/county_with_titled_wards.json';

export default function EditFarm({ navigation, route }) {
  const { farm } = route.params;
  const cancelRef = useRef(null);
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [error, setError] = useState(null);
  const [countyList, setCountyList] = useState([]);
  const [wardsList, setWardsList] = useState([]);

  const [formData, setFormData] = useState({
    farm_name: '',
    county: '',
    administrative_location: '',
    farm_size: '',
    ownership: 'Freehold',
    farming_types: [],
    isActive: false,
  });

  useEffect(() => {
    const counties = countyData.map(item => item.County);
    setCountyList(counties);
  }, []);

  useEffect(() => {
    fetchFarmData();
  }, []);

  useEffect(() => {
    if (formData.county) {
      const match = countyData.find(c => c.County === formData.county);
      setWardsList(match ? match.Wards : []);
    }
  }, [formData.county]);

  const fetchFarmData = async () => {
    try {
      setLoading(true);
      const data = await getFarmById(farm.id);

      setFormData({
        farm_name: data.name || '',
        county: data.county || '',
        administrative_location: data.administrativeLocation || '',
        farm_size: data.size?.toString() || '',
        ownership: data.ownership || 'Freehold',
        farming_types: Array.isArray(data.farmingTypes) ? data.farmingTypes : [],
        isActive: data.isActive || false,
      });
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to load farm data');
      toast.show({
        description: typeof err === 'string' ? err : 'Failed to load farm data',
        placement: "top",
        duration: 3000,
        backgroundColor: "red.500",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCountyChange = (selectedCounty) => {
    handleInputChange('county', selectedCounty);
    const match = countyData.find(c => c.County === selectedCounty);
    setWardsList(match ? match.Wards : []);
    handleInputChange('administrative_location', '');
  };

  const validateForm = () => {
    if (!formData.farm_name.trim()) {
      toast.show({
        description: "Farm name is required",
        placement: "top",
        duration: 2000,
        backgroundColor: "orange.500",
      });
      return false;
    }
    if (!formData.county) {
      toast.show({
        description: "County is required",
        placement: "top",
        duration: 2000,
        backgroundColor: "orange.500",
      });
      return false;
    }
    if (!formData.administrative_location) {
      toast.show({
        description: "Administrative location is required",
        placement: "top",
        duration: 2000,
        backgroundColor: "orange.500",
      });
      return false;
    }
    if (!formData.farm_size.trim()) {
      toast.show({
        description: "Farm size is required",
        placement: "top",
        duration: 2000,
        backgroundColor: "orange.500",
      });
      return false;
    }
    if (formData.farming_types.length === 0) {
      toast.show({
        description: "Select at least one type of farming",
        placement: "top",
        duration: 2000,
        backgroundColor: "orange.500",
      });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      const payload = {
        name: formData.farm_name.trim(),
        county: formData.county,
        administrativeLocation: formData.administrative_location,
        size: parseFloat(formData.farm_size),
        ownership: formData.ownership,
        farmingTypes: formData.farming_types,
        // isActive: formData.isActive,
      };
      await updateFarm(farm.id, payload);

      toast.show({
        description: "Farm updated successfully!",
        placement: "top",
        duration: 2000,
        backgroundColor: "green.500",
      });

      setTimeout(() => {
        navigation.navigate('FarmInformation', { refresh: true });
      }, 500);
    } catch (err) {
      toast.show({
        description: typeof err === 'string' ? err : 'Failed to update farm',
        placement: "top",
        duration: 3000,
        backgroundColor: "red.500",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteFarm(farm.id);

      toast.show({
        description: "Farm deleted successfully",
        placement: "top",
        duration: 2000,
        backgroundColor: "green.500",
      });

      // Navigate back after a short delay to let the toast show
      setTimeout(() => {
        navigation.navigate('FarmInformation', { refresh: true });
      }, 500);
    } catch (err) {
      toast.show({
        description: typeof err === 'string' ? err : 'Failed to delete farm',
        placement: "top",
        duration: 3000,
        backgroundColor: "red.500",
      });
    } finally {
      setDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <SecondaryHeader title="Edit Farm" />
        <StatusBar translucent backgroundColor={COLORS.green2} barStyle={'light-content'} />
        <Center flex={1}><Spinner size="lg" color={COLORS.green} /></Center>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader title="Edit Farm" />
      <StatusBar translucent backgroundColor={COLORS.green2} barStyle={'light-content'} />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Box bg="white" borderRadius={16} p={6} shadow={2}>
          <Heading size="md" mb={4} color={COLORS.green}>Farm Details</Heading>
          <Divider mb={4} />

          <VStack space={4}>
            <FormControl isRequired>
              <FormControl.Label>
                <Text fontSize="16" fontWeight="500" color="gray.700">
                  Farm Name
                </Text>
              </FormControl.Label>
              <Input
                value={formData.farm_name}
                onChangeText={(value) => handleInputChange("farm_name", value)}
                placeholder="Enter farm name"
                variant="filled"
                backgroundColor="green.50"
                borderColor="green.100"
                borderWidth={1}
                height={12}
                borderRadius={8}
                fontSize="16"
              />
            </FormControl>

            <FormControl isRequired>
              <FormControl.Label>
                <Text fontSize="16" fontWeight="500" color="gray.700">
                  County
                </Text>
              </FormControl.Label>
              <Dropdown
                style={{
                  height: 50,
                  borderColor: '#D1FAE5',
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
            </FormControl>

            <FormControl isRequired>
              <FormControl.Label>
                <Text fontSize="16" fontWeight="500" color="gray.700">
                  Administrative Location
                </Text>
              </FormControl.Label>
              <Dropdown
                style={{
                  height: 50,
                  borderColor: '#D1FAE5',
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
            </FormControl>

            <FormControl isRequired>
              <FormControl.Label>
                <Text fontSize="16" fontWeight="500" color="gray.700">
                  Size (Acres)
                </Text>
              </FormControl.Label>
              <Input
                keyboardType="numeric"
                value={formData.farm_size}
                onChangeText={(value) => handleInputChange("farm_size", value)}
                placeholder="e.g. 5.0"
                variant="filled"
                backgroundColor="green.50"
                borderColor="green.100"
                borderWidth={1}
                height={12}
                borderRadius={8}
                fontSize="16"
              />
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
                onChange={(value) => handleInputChange("ownership", value)}
              >
                <HStack space={4} flexWrap="wrap">
                  {["Freehold", "Leasehold", "Communal"].map((option) => (
                    <Radio
                      key={option}
                      value={option}
                      colorScheme="emerald"
                      size="sm"
                      _checked={{
                        borderColor: COLORS.green,
                        backgroundColor: COLORS.green,
                      }}
                      _icon={{
                        color: "white",
                      }}
                      _text={{
                        color: "#1F2937",
                        fontSize: "14",
                      }}
                    >
                      {option}
                    </Radio>
                  ))}
                </HStack>
              </Radio.Group>
            </FormControl>

            <FormControl isRequired>
              <FormControl.Label>
                <Text fontSize="16" fontWeight="500" color="gray.700">
                  Types of Farming
                </Text>
              </FormControl.Label>
              <Text fontSize="14" color="gray.500" mb={3}>
                Select one or more types of farming
              </Text>
              <Checkbox.Group
                value={formData.farming_types}
                onChange={(values) => handleInputChange("farming_types", values)}
              >
                <VStack space={3}>
                  {[
                    "Dairy cattle",
                    "Beef cattle",
                    "Dairy and Meat goat",
                    "Sheep and Goats",
                    "Poultry",
                    "Rabbit",
                    "Pigs (Swine)"
                  ].map((type) => (
                    <Checkbox
                      key={type}
                      value={type}
                      colorScheme="emerald"
                      size="sm"
                      _checked={{
                        backgroundColor: COLORS.green,
                        borderColor: COLORS.green,
                      }}
                      _icon={{
                        color: "white",
                      }}
                      _text={{
                        color: "#1F2937",
                        fontSize: "14",
                      }}
                    >
                      {type}
                    </Checkbox>
                  ))}
                </VStack>
              </Checkbox.Group>
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
          </VStack>
        </Box>

        <HStack mt={6} justifyContent="space-around">
          <Button
            onPress={handleSave}
            width="45%"
            backgroundColor="#8FD28F"
            _text={{ color: "white" }}
            isLoading={saving}
            isDisabled={deleting}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>

          <Button
            onPress={() => setIsDeleteOpen(true)}
            width="45%"
            variant="outline"
            borderColor="#8FD28F"
            _text={{ color: "#8FD28F" }}
            isLoading={deleting}
            isDisabled={saving}
          >
            Delete
          </Button>
        </HStack>
      </ScrollView>

      <AlertDialog
        leastDestructiveRef={cancelRef}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
      >
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Delete Farm</AlertDialog.Header>
          <AlertDialog.Body>
            Are you sure you want to delete "{formData.farm_name}"? This action cannot be undone.
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" onPress={() => setIsDeleteOpen(false)} ref={cancelRef}>
                Cancel
              </Button>
              <Button colorScheme="danger" onPress={handleDelete} isLoading={deleting}>
                Delete
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGreen,
  },
});