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
  FormControl,
  CheckIcon,
  Center,
  Modal,
} from 'native-base';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';

export default function AddFarmScreen({ navigation }) {
  const [farmName, setFarmName] = useState("");
  const [county, setCounty] = useState("");
  const [adminLocation, setAdminLocation] = useState("");
  const [farmSize, setFarmSize] = useState("");
  const [ownership, setOwnership] = useState("Freehold");
  const [productionTypes, setProductionTypes] = useState([]);
  
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
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

  const handleProductionTypeToggle = (type) => {
    if (productionTypes.includes(type)) {
      setProductionTypes(productionTypes.filter(t => t !== type));
    } else {
      setProductionTypes([...productionTypes, type]);
    }
  };

  const handleSave = () => {
    // Here you would save the farm data
    setShowSuccessModal(true);
  };

  const handleDone = () => {
    navigation.navigate('ManageFarms');
  };

  const handleAddAnother = () => {
    // Reset all form fields
    setFarmName("");
    setCounty("");
    setAdminLocation("");
    setFarmSize("");
    setOwnership("Freehold");
    setProductionTypes([]);
    setFullName("");
    setPhoneNumber("");
    setEmail("");
    setShowSuccessModal(false);
  };

  return (
    <Box flex={1} bg={COLORS.lightGreen}>
      <SecondaryHeader title="Add New Farm" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box p={4}>
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
                  value={farmName}
                  onChangeText={setFarmName}
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
                  selectedValue={county}
                  onValueChange={(value) => {
                    setCounty(value);
                    setAdminLocation(""); // Reset admin location when county changes
                  }}
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
                  selectedValue={adminLocation}
                  onValueChange={setAdminLocation}
                  placeholder="Select administrative location"
                  backgroundColor={COLORS.lightGreen}
                  isDisabled={!county}
                  _selectedItem={{
                    bg: "teal.600",
                    endIcon: <CheckIcon size="5" />
                  }}
                >
                  {county && adminLocations[county]?.map(location => (
                    <Select.Item key={location} label={location} value={location} />
                  ))}
                </Select>
              </FormControl>
              
              <FormControl>
                <FormControl.Label _text={{ color: COLORS.darkGray3 }}>
                  Farm Size (Acres)
                </FormControl.Label>
                <Input
                  value={farmSize}
                  onChangeText={setFarmSize}
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
                  selectedValue={ownership}
                  onValueChange={setOwnership}
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
                      onPress={() => handleProductionTypeToggle(type)}
                      style={styles.checkboxContainer}
                    >
                      <Box 
                        style={styles.checkbox}
                        bg={productionTypes.includes(type) ? COLORS.green : "transparent"}
                        borderColor={COLORS.green}
                      >
                        {productionTypes.includes(type) && (
                          <Text color="white" fontSize="xs">✓</Text>
                        )}
                      </Box>
                      <Text color={COLORS.darkGray3}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </VStack>
              </FormControl>
            </VStack>
          </Box>
          
          <Box bg="white" borderRadius={12} p={4} shadow={2} mb={4}>
            <Text fontSize="lg" fontWeight="bold" color={COLORS.green2} mb={3}>
              Owner Details
            </Text>
            
            <VStack space={4}>
              <FormControl>
                <FormControl.Label _text={{ color: COLORS.darkGray3 }}>
                  Full Name
                </FormControl.Label>
                <Input
                  value={fullName}
                  onChangeText={setFullName}
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  placeholder="Enter full name"
                />
              </FormControl>
              
              <FormControl>
                <FormControl.Label _text={{ color: COLORS.darkGray3 }}>
                  Phone Number
                </FormControl.Label>
                <Input
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
              </FormControl>
              
              <FormControl>
                <FormControl.Label _text={{ color: COLORS.darkGray3 }}>
                  Email Address (Optional)
                </FormControl.Label>
                <Input
                  value={email}
                  onChangeText={setEmail}
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  placeholder="Enter email address"
                  keyboardType="email-address"
                />
              </FormControl>
            </VStack>
          </Box>
          
          <Button 
            onPress={handleSave}
            bg={COLORS.green2}
            _pressed={{ bg: COLORS.green }}
            mb={8}
          >
            Save Farm
          </Button>
        </Box>
      </ScrollView>
      
      {/* Success Modal */}
      <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} size="lg">
        <Modal.Content borderRadius={12}>
          <Modal.Body p={6}>
            <VStack space={4} alignItems="center">
              <Center 
                bg={COLORS.lightGreen} 
                size={20} 
                rounded="full"
              >
                <Text fontSize="3xl" color={COLORS.green}>✓</Text>
              </Center>
              
              <Text fontSize="xl" fontWeight="bold" textAlign="center">
                Farm Added Successfully
              </Text>
              
              <Text textAlign="center" color={COLORS.darkGray3}>
                Your farm has been added to your profile successfully.
              </Text>
              
              <HStack space={4} w="100%" mt={2}>
                <Button 
                  flex={1}
                  onPress={handleAddAnother}
                  variant="outline"
                  borderColor={COLORS.green2}
                  _text={{ color: COLORS.green2 }}
                  _pressed={{ bg: COLORS.lightGreen }}
                >
                  Add Another
                </Button>
                
                <Button 
                  flex={1}
                  onPress={handleDone}
                  bg={COLORS.green2}
                  _pressed={{ bg: COLORS.green }}
                >
                  Done
                </Button>
              </HStack>
            </VStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </Box>
  );
}

const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});