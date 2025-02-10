import React, {useState} from 'react';
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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from 'native-base';
import SecondaryHeader from '../../components/headers/secondary-header';
import {View, StyleSheet} from 'react-native';
import FastImage from 'react-native-fast-image';
import {icons} from '../../constants';
import {COLORS} from '../../constants/theme';

export default function AddFarmDetailsScreen({navigation}) {
  const [enableLocation, setEnableLocation] = useState(false);
  const [farmSize, setFarmSize] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');

  return (
    <View style={{flex: 1, backgroundColor: COLORS.lightGreen}}>
      <SecondaryHeader title="Add Farm Details" />
      <ScrollView 
        contentContainerStyle={{ 
          flexGrow: 1, 
          justifyContent: 'center', 
          marginTop: 5 
        }}
      >
        <Box bg="white" p={6} borderRadius={8} shadow={1} mx={6} my={8}>
          <Text
            style={{
              fontSize: 16,
              color: 'black',
              marginBottom: 16,
              textAlign: 'center',
            }}>
            Please fill in the farm details.
          </Text>

          <VStack space={5}>
            <Box>
              <Text style={styles.label}>Farm ID</Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                isReadOnly
                placeholder="F12345"
              />
            </Box>

            <Box>
              <Text style={styles.label}>Region</Text>
              <Select
                selectedValue={selectedRegion}
                minWidth="100%"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Select region"
                _selectedItem={{
                  bg: 'teal.600',
                  endIcon: (
                    <FastImage
                      source={icons.right_arrow}
                      style={{ width: 20, height: 20 }}
                      tintColor="white"
                    />
                  ),
                }}
                onValueChange={setSelectedRegion}>
                <Select.Item label="Region 1" value="region1" />
                <Select.Item label="Region 2" value="region2" />
              </Select>
            </Box>

            <HStack alignItems="center" justifyContent="space-between">
              <Text style={styles.label}>Enable location</Text>
              <Switch
                isChecked={enableLocation}
                onToggle={setEnableLocation}
              />
            </HStack>

            <Box>
              <Text style={styles.label}>Division</Text>
              <Select
                selectedValue={selectedDivision}
                minWidth="100%"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Select division"
                _selectedItem={{
                  bg: 'teal.600',
                  endIcon: (
                    <FastImage
                      source={icons.right_arrow}
                      style={{ width: 20, height: 20 }}
                      tintColor="white"
                    />
                  ),
                }}
                onValueChange={setSelectedDivision}>
                <Select.Item label="Division 1" value="division1" />
                <Select.Item label="Division 2" value="division2" />
              </Select>
            </Box>

            <Box>
              <Text style={styles.label}>Administrative Location</Text>
              <Input
                variant="outline"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
                placeholder="Enter Administrative Location"
              />
            </Box>

            <Box>
              <Text style={styles.label}>Farm Size (in Hectares)</Text>
              <HStack alignItems="center" space={2}>
                <Button
                  onPress={() => {
                    const currentValue = parseFloat(farmSize) || 0;
                    setFarmSize(Math.max(currentValue - 1, 0).toString());
                  }}
                  variant="outline"
                  p={2}>
                  -
                </Button>
                <Input
                  flex={1}
                  variant="outline"
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  placeholder="Enter Farm Size"
                  keyboardType="numeric"
                  value={farmSize}
                  onChangeText={text => {
                    const numericText = text.replace(/[^0-9.]/g, '');
                    setFarmSize(numericText);
                  }}
                />
                <Button
                  onPress={() => {
                    const currentValue = parseFloat(farmSize) || 0;
                    setFarmSize((currentValue + 1).toString());
                  }}
                  variant="outline"
                  p={2}>
                  +
                </Button>
              </HStack>
              <Text fontSize="xs" color="gray.500" mt={1}>
                Farm size is measured in hectares.
              </Text>
            </Box>

            <Box>
              <Text style={styles.label}>Types of Farming</Text>
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
          </VStack>

          <HStack justifyContent="center" mt={6} space={8}>
            <Button
              variant="outline"
              borderWidth={1}
              borderColor={COLORS.green}
              borderRadius={8}
              px={6}
              py={3}
              onPress={() => navigation.goBack()}>
              Back
            </Button>
            <Button
              backgroundColor={COLORS.green}
              borderRadius={8}
              px={6}
              py={3}
              _pressed={{
                bg: 'emerald.700',
              }}>
              Submit
            </Button>
          </HStack>
        </Box>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  }
});