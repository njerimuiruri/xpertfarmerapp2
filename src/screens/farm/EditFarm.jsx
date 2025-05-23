import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Text, VStack, HStack, ScrollView, IconButton, FormControl, Input,
  Button, Select, CheckIcon, Radio, Checkbox, Heading, Divider, AlertDialog,
  Spinner, Center
} from 'native-base';
import { StyleSheet, SafeAreaView, StatusBar, Alert } from 'react-native';
import { COLORS } from '../../constants/theme';
import { icons } from '../../constants';
import FastImage from 'react-native-fast-image';
import SecondaryHeader from '../../components/headers/secondary-header';
import { getFarmById, updateFarm, deleteFarm } from '../../services/farm';

export default function EditFarm({ navigation, route }) {
  const { farm } = route.params;
  const cancelRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [error, setError] = useState(null);

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
    fetchFarmData();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.farm_name.trim()) return Alert.alert('Validation', 'Farm name is required');
    if (!formData.county) return Alert.alert('Validation', 'County is required');
    if (!formData.administrative_location) return Alert.alert('Validation', 'Location is required');
    if (!formData.farm_size.trim()) return Alert.alert('Validation', 'Size is required');
    if (formData.farming_types.length === 0) return Alert.alert('Validation', 'Select at least one type of farming');
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
      Alert.alert('Success', 'Farm updated successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('FarmInformation', { refresh: true })
        }
      ]);
    } catch (err) {
      Alert.alert('Error', typeof err === 'string' ? err : 'Failed to update farm');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteFarm(farm.id);
      Alert.alert('Deleted', 'Farm deleted successfully', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('FarmInformation', { refresh: true })
        }
      ]);
    } catch (err) {
      Alert.alert('Error', typeof err === 'string' ? err : 'Failed to delete farm');
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
              <FormControl.Label>Farm Name</FormControl.Label>
              <Input
                value={formData.farm_name}
                onChangeText={(value) => handleInputChange("farm_name", value)}
                placeholder="Enter farm name"
              />
            </FormControl>

            <FormControl isRequired>
              <FormControl.Label>County</FormControl.Label>
              <Select
                selectedValue={formData.county}
                onValueChange={(value) => handleInputChange("county", value)}
                placeholder="Select County"
                _selectedItem={{ bg: COLORS.lightGreen, endIcon: <CheckIcon size="5" /> }}
              >
                <Select.Item label="Turkana" value="Turkana" />
                <Select.Item label="Nairobi" value="Nairobi" />
                <Select.Item label="Mombasa" value="Mombasa" />
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormControl.Label>Administrative Location</FormControl.Label>
              <Input
                value={formData.administrative_location}
                onChangeText={(value) => handleInputChange("administrative_location", value)}
                placeholder="Enter location"
              />
            </FormControl>

            <FormControl isRequired>
              <FormControl.Label>Size (Acres)</FormControl.Label>
              <Input
                keyboardType="numeric"
                value={formData.farm_size}
                onChangeText={(value) => handleInputChange("farm_size", value)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormControl.Label>Ownership</FormControl.Label>
              <Radio.Group
                name="ownership"
                value={formData.ownership}
                onChange={(value) => handleInputChange("ownership", value)}
              >
                <HStack space={4}>
                  <Radio value="Freehold">Freehold</Radio>
                  <Radio value="Leasehold">Leasehold</Radio>
                </HStack>
              </Radio.Group>
            </FormControl>

            <FormControl isRequired>
              <FormControl.Label>Farming Types</FormControl.Label>
              <Checkbox.Group
                value={formData.farming_types}
                onChange={(values) => handleInputChange("farming_types", values)}
              >
                <VStack space={2}>
                  <Checkbox value="Dairy cattle">Dairy cattle</Checkbox>
                  <Checkbox value="Beef cattle">Beef cattle</Checkbox>
                  <Checkbox value="Poultry">Poultry</Checkbox>
                  <Checkbox value="Crops">Crops</Checkbox>
                  <Checkbox value="Goats">Goats</Checkbox>
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
