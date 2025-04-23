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
} from 'native-base';
import { StyleSheet, SafeAreaView, StatusBar, Alert } from 'react-native';
import { COLORS } from '../../constants/theme';
import { icons } from '../../constants';
import FastImage from 'react-native-fast-image';
import SecondaryHeader from '../../components/headers/secondary-header';

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

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

 

  const handleSave = () => {
    
      navigation.goBack();
    
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
            <FormControl isRequired>
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
              />
            </FormControl>

            <FormControl isRequired>
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
              >
                <Select.Item label="Turkana" value="Turkana" />
                <Select.Item label="Nairobi" value="Nairobi" />
                <Select.Item label="Mombasa" value="Mombasa" />
                <Select.Item label="Siaya" value="Siaya" />
              </Select>
            </FormControl>

            <FormControl isRequired>
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
              >
                <Select.Item label="Turkana" value="Turkana" />
                <Select.Item label="Siaya" value="Siaya" />
              </Select>
            </FormControl>

            <FormControl isRequired>
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
                InputRightElement={
                  <Text mr={4} color="gray.500">acres</Text>
                }
              />
            </FormControl>

            <FormControl isRequired>
              <FormControl.Label _text={{ fontWeight: "bold" }}>Ownership</FormControl.Label>
              <Radio.Group
                name="ownership"
                value={formData.ownership}
                onChange={(value) => handleInputChange("ownership", value)}
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
            </FormControl>
          </VStack>
        </Box>

        <Box bg="white" borderRadius={16} m={4} mt={0} p={6} shadow={2}>
          <Heading size="md" mb={4} color={COLORS.green}>Farming Activities</Heading>
          <Divider mb={4} />
          
          <VStack space={5}>
            <FormControl isRequired>
              <FormControl.Label _text={{ fontWeight: "bold" }}>Types of Farming</FormControl.Label>
              <Text fontSize="14" color="gray.500" mb={2}>
                Select one or more types of farming
              </Text>

              <Box bg="white" p={4} borderRadius={10} borderWidth={1} borderColor={COLORS.gray3} shadow={1}>
                <Checkbox.Group
                  colorScheme="green"
                  value={formData.farming_types}
                  onChange={(values) => setFormData(prev => ({ ...prev, farming_types: values }))}
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
                  </VStack>
                </Checkbox.Group>
              </Box>
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
           
          >
            Add Farm
          </Button>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:COLORS.lightGreen,
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