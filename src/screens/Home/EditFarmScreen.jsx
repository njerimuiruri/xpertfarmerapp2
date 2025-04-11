import React, { useState } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  ScrollView,
  Input,
  Select,
  Button,
  Center,
  FormControl,
  CheckIcon,
  TextArea,
  Image,
} from 'native-base';
import { TouchableOpacity, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import { COLORS } from '../../constants/theme';
import { icons } from '../../constants';
import SecondaryHeader from '../../components/headers/secondary-header';

export default function EditFarmScreen({ navigation, route }) {
  const { farm } = route.params || { 
    farmName: "",
    county: "",
    adminLocation: "",
    farmSize: "",
    ownership: "",
    productionTypes: []
  };

  const [formData, setFormData] = useState({
    farmName: farm.farmName || "",
    county: farm.county || "",
    adminLocation: farm.adminLocation || "",
    farmSize: farm.farmSize || "",
    ownership: farm.ownership || "",
    productionTypes: farm.productionTypes || []
  });

  const counties = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Kiambu"];
  
  const adminLocations = {
    "Nairobi": ["Westlands", "Karen", "Eastleigh", "Kasarani"],
    "Mombasa": ["Nyali", "Kisauni", "Likoni", "Changamwe"],
    "Kisumu": ["Kisumu Central", "Nyando", "Muhoroni"],
    "Nakuru": ["Nakuru Town East", "Nakuru Town West", "Molo", "Naivasha"],
    "Kiambu": ["Thika", "Kiambu Town", "Limuru", "Kikuyu"],
  };

  const productionTypeOptions = [
    "Dairy cattle",
    "Beef cattle",
    "Dairy and Meat goats",
    "Sheep",
    "Poultry",
    "Rabbit",
    "Pig(swine)"
  ];

  // const handleProductionTypeToggle = (type) => {
  //   if (formData.productionTypes.includes(type)) {
  //     setFormData({
  //       ...formData,
  //       productionTypes: formData.productionTypes.filter(t => t !== type)
  //     });
  //   } else {
  //     setFormData({
  //       ...formData,
  //       productionTypes: [...formData.productionTypes, type]
  //     });
  //   }
  // };

  const handleSave = () => {
   
    navigation.goBack();
  };

  return (
    <Box flex={1} bg={COLORS.lightGreen}>
      <SecondaryHeader title="Edit Farm" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box p={4}>
          <Box bg="white" borderRadius={12} p={4} shadow={2} mb={4}>
            <Text fontSize="lg" fontWeight="bold" color={COLORS.green2} mb={3}>
              Farm Logo
            </Text>
            
            <Center>
              <Box mb={4} position="relative">
                {/* <Image
                  source={require('../../assets/images/farm-placeholder.png')}
                  style={styles.farmLogo}
                  alt="Farm Logo"
                  fallbackSource={{
                    uri: 'https://via.placeholder.com/150'
                  }}
                /> */}
                
                <TouchableOpacity 
                  style={styles.cameraIconContainer}
                  onPress={() => {/* Handle image upload */}}
                >
                  <FastImage
                    source={icons.camera}
                    style={styles.cameraIcon}
                    tintColor="white"
                  />
                </TouchableOpacity>
              </Box>
            </Center>
          </Box>
          
          <Box bg="white" borderRadius={12} p={4} shadow={2} mb={4}>
            <Text fontSize="lg" fontWeight="bold" color={COLORS.green2} mb={3}>
              Farm Details
            </Text>
            
            <VStack space={4}>
              <FormControl>
                <FormControl.Label _text={{ color: COLORS.darkGray3 }}>
                  Farm Name (Business Name)
                </FormControl.Label>
                <Input
                  value={formData.farmName}
                //   onChangeText={value => setFormData({...formData, farmName: value})}
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  placeholder="Enter farm name"
                />
              </FormControl>
              
              <FormControl>
                <FormControl.Label _text={{ color: COLORS.darkGray3 }}>
                  County
                </FormControl.Label>
                <Select
                  selectedValue={formData.county}
                  onValueChange={value => setFormData({
                    ...formData, 
                    county: value,
                    adminLocation: "" 
                  })}
                  placeholder="Select county"
                  backgroundColor={COLORS.lightGreen}
                  _selectedItem={{
                    bg: "teal.600",
                    endIcon: <CheckIcon size="5" />
                  }}
                >
                  {counties.map(county => (
                    <Select.Item key={county} label={county} value={county} />
                  ))}
                </Select>
              </FormControl>
              
              <FormControl>
                <FormControl.Label _text={{ color: COLORS.darkGray3 }}>
                  Administrative Location
                </FormControl.Label>
                <Select
                  selectedValue={formData.adminLocation}
                  onValueChange={value => setFormData({...formData, adminLocation: value})}
                  placeholder="Select administrative location"
                  backgroundColor={COLORS.lightGreen}
                  isDisabled={!formData.county}
                  _selectedItem={{
                    bg: "teal.600",
                    endIcon: <CheckIcon size="5" />
                  }}
                >
                  {formData.county && adminLocations[formData.county]?.map(location => (
                    <Select.Item key={location} label={location} value={location} />
                  ))}
                </Select>
              </FormControl>
              
              <FormControl>
                <FormControl.Label _text={{ color: COLORS.darkGray3 }}>
                  Farm Size (Acres)
                </FormControl.Label>
                <Input
                  value={formData.farmSize}
                  onChangeText={value => setFormData({...formData, farmSize: value})}
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  placeholder="Enter farm size in acres"
                  keyboardType="numeric"
                />
              </FormControl>
              
              <FormControl>
                <FormControl.Label _text={{ color: COLORS.darkGray3 }}>
                  Ownership
                </FormControl.Label>
                <Select
                  selectedValue={formData.ownership}
                  onValueChange={value => setFormData({...formData, ownership: value})}
                  placeholder="Select ownership type"
                  backgroundColor={COLORS.lightGreen}
                  _selectedItem={{
                    bg: "teal.600",
                    endIcon: <CheckIcon size="5" />
                  }}
                >
                  <Select.Item label="Freehold" value="Freehold" />
                  <Select.Item label="Leasehold" value="Leasehold" />
                  <Select.Item label="Communal" value="Communal" />
                </Select>
              </FormControl>
              
              <FormControl>
                <FormControl.Label _text={{ color: COLORS.darkGray3 }}>
                  Type of Production (Multiple Select)
                </FormControl.Label>
                <VStack space={2}>
                  {productionTypeOptions.map(type => (
                    <TouchableOpacity
                      key={type}
                      // onPress={() => handleProductionTypeToggle(type)}
                      style={styles.checkboxContainer}
                    >
                      <Box 
                        style={styles.checkbox}
                        bg={formData.productionTypes.includes(type) ? COLORS.green : "transparent"}
                        borderColor={COLORS.green}
                      >
                        {formData.productionTypes.includes(type) && (
                          <FastImage
                            source={icons.tick}
                            style={styles.checkIcon}
                            tintColor="white"
                          />
                        )}
                      </Box>
                      <Text color={COLORS.darkGray3}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </VStack>
              </FormControl>
            </VStack>
          </Box>
        </Box>
      </ScrollView>
      
      <HStack space={4} justifyContent="center" p={4} bg="white" shadow={2}>
        <Button
          flex={1}
          variant="outline"
          borderColor={COLORS.green}
          _text={{ color: COLORS.green }}
          onPress={() => navigation.goBack()}
        >
          Cancel
        </Button>
        
        <Button
          flex={1}
          bg={COLORS.green}
          _text={{ color: "white" }}
          onPress={handleSave}
        >
          Save Changes
        </Button>
      </HStack>
    </Box>
  );
}

const styles = StyleSheet.create({
  farmLogo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraIconContainer: {
    backgroundColor: COLORS.green,
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    width: 20,
    height: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    width: 14,
    height: 14,
  },
});