import React, { useState } from "react";
import {
  Box,
  Text,
  Input,
  Button,
  VStack,
  Select,
  Checkbox,
  Switch,
  ScrollView,
  HStack,
  Fab,
} from "native-base";
import SecondaryHeader from "../../components/headers/secondary-header";
import { View } from "react-native";
import FastImage from "react-native-fast-image";
import { icons } from "../../constants";

export default function AddFarmDetailsScreen({ navigation }) {
  const [enableLocation, setEnableLocation] = useState(false);
  const [farmSize, setFarmSize] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");


  return (
    <View>
      <SecondaryHeader title="Add Farm Details" />


      <ScrollView>
        <Box bg="white" p={4} borderRadius={8} shadow={1} mb={8}>
          <Text fontSize="md" color="gray.600" mb={4}>
            Please fill in the farm details.
          </Text>

          <VStack space={5}>
            <Box>
              <Text fontSize="sm" fontWeight="500" color="gray.700" mb={1}>
                Region
              </Text>
              <Select
                selectedValue={selectedRegion}
                minWidth="100%"
                bg="gray.50"
                borderColor="gray.200"
                placeholder="Select region"
                _selectedItem={{
                  bg: "teal.600",
                  endIcon: <FastImage source={icons.right_arrow} className="w-[20px] h-[20px]" tintColor='white' />
                }}
                onValueChange={setSelectedRegion}
              >
                <Select.Item label="Region 1" value="region1" />
                <Select.Item label="Region 2" value="region2" />
              </Select>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color="gray.700" mb={1}>
                Division
              </Text>
              <Select
                selectedValue={selectedDivision}
                minWidth="100%"
                bg="gray.50"
                borderColor="gray.200"
                placeholder="Select division"
                _selectedItem={{
                  bg: "teal.600",
                  endIcon: <FastImage source={icons.right_arrow} className="w-[20px] h-[20px]" tintColor='white' />
                }}
                onValueChange={setSelectedDivision}
              >
                <Select.Item label="Division 1" value="division1" />
                <Select.Item label="Division 2" value="division2" />
              </Select>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color="gray.700" mb={1}>
                Administrative Location
              </Text>
              <Input
                variant="outline"
                bg="gray.50"
                borderColor="gray.200"
                placeholder="Enter Administrative Location"
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color="gray.700" mb={1}>
                Farm Size
              </Text>
              <Input
                variant="outline"
                bg="gray.50"
                borderColor="gray.200"
                placeholder="Enter Farm Size"
                keyboardType="numeric"
                value={farmSize}
                onChangeText={setFarmSize}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color="gray.700" mb={2}>
                Types of Farming
              </Text>
              <Text fontSize="xs" color="gray.600" mb={2}>
                Select one or more types of farming
              </Text>
              <VStack space={2}>
                <Checkbox value="dairy-cattle">Dairy cattle</Checkbox>
                <Checkbox value="beef-cattle">Beef cattle</Checkbox>
                <Checkbox value="dairy-meat-goat">Dairy and Meat goat</Checkbox>
                <Checkbox value="sheep-goats">Sheep and Goats</Checkbox>
                <Checkbox value="poultry">Poultry</Checkbox>
                <Checkbox value="rabbit">Rabbit</Checkbox>
                <Checkbox value="pigs">Pigs (Swine)</Checkbox>
              </VStack>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color="gray.700" mb={1}>
                Region
              </Text>
              <Select
                selectedValue={selectedRegion}
                minWidth="100%"
                bg="gray.50"
                borderColor="gray.200"
                placeholder="Select region"
                _selectedItem={{
                  bg: "teal.600",
                  endIcon: <FastImage source={icons.right_arrow} className="w-[20px] h-[20px]" tintColor='white' />
                }}
                onValueChange={setSelectedRegion}
              >
                <Select.Item label="Region 1" value="region1" />
                <Select.Item label="Region 2" value="region2" />
              </Select>
            </Box>


            <HStack justifyContent="space-between" mt={0}>

              <Button
                // isDisabled={!isFormComplete}
                width="100%"
                bg="emerald.600"

              >
                Save
              </Button>
            </HStack>




          </VStack>
        </Box>
      </ScrollView>
    </View>
  );
}
