import React, {useState, useEffect} from 'react';
import {
  Box,
  Text,
  Input,
  Button,
  VStack,
  Select,
  Radio,
  ScrollView,
  HStack,
  Modal,
} from 'native-base';
import {View, TouchableOpacity, StyleSheet, Image} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {icons} from '../../constants';
import {COLORS} from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';
import FastImage from 'react-native-fast-image';

export default function AddUtilityDetails({navigation, route}) {
  const [selectedUtility, setSelectedUtility] = useState('water'); // Default: Water Supply
  
  // Water Supply fields
  const [waterLevel, setWaterLevel] = useState('');
  const [waterSource, setWaterSource] = useState('');
  const [waterStorage, setWaterStorage] = useState('');
  const [entryDate, setEntryDate] = useState(new Date());
  const [showEntryDatePicker, setShowEntryDatePicker] = useState(false);
  const [isNewWaterSource, setIsNewWaterSource] = useState(true);
  const [existingWaterSources, setExistingWaterSources] = useState([
    {name: 'Borehole', capacity: '50000'},
    {name: 'Municipal Supply', capacity: '10000'},
    {name: 'Dam', capacity: '500000'},
    {name: 'Rainwater Harvesting', capacity: '20000'},
  ]);

  // Power Supply fields
  const [powerSource, setPowerSource] = useState('');
  const [powerCapacity, setPowerCapacity] = useState('');
  const [installationCost, setInstallationCost] = useState('');
  const [consumptionRate, setConsumptionRate] = useState('');
  const [consumptionCost, setConsumptionCost] = useState('');
  const [isNewPowerSource, setIsNewPowerSource] = useState(true);
  const [existingPowerSources, setExistingPowerSources] = useState([
    {name: 'Electricity', capacity: '100KW', installationCost: '60000', consumptionRate: '178', consumptionCost: '2743.26'},
    {name: 'Solar Power', capacity: '50K', installationCost: '110755', consumptionRate: '51', consumptionCost: '1169.34'},
    {name: 'Generator', capacity: '50KW', installationCost: '774471', consumptionRate: '127', consumptionCost: '2874.99'},
  ]);

  // Facility fields
  const [structureType, setStructureType] = useState('');
  const [structureCapacity, setStructureCapacity] = useState('');
  const [constructionCost, setConstructionCost] = useState('');
  const [condition, setCondition] = useState('');
  const [lastMaintenanceDate, setLastMaintenanceDate] = useState(new Date());
  const [showMaintenanceDatePicker, setShowMaintenanceDatePicker] = useState(false);
  const [maintenanceCost, setMaintenanceCost] = useState('');
  const [isNewStructure, setIsNewStructure] = useState(true);
  const [existingStructures, setExistingStructures] = useState([
    {type: 'Barn', capacity: '50 animals', constructionCost: '1255370', condition: 'Good', maintenanceDate: '10/05/2024', maintenanceCost: '64692'},
    {type: 'Dipping Tank', capacity: '200 animals', constructionCost: '551187', condition: 'Needs Repair', maintenanceDate: '12/10/2024', maintenanceCost: '92250'},
    {type: 'Cold Storage', capacity: '5000 liters', constructionCost: '2886478', condition: 'Needs Repair', maintenanceDate: '23/11/2024', maintenanceCost: '90992'},
    {type: 'Feed Store', capacity: '10000 kg', constructionCost: '4265217', condition: 'Good', maintenanceDate: '17/09/2023', maintenanceCost: '28232'},
    {type: 'Milking Parlor', capacity: '30 animals', constructionCost: '4648694', condition: 'Needs Repair', maintenanceDate: '19/06/2024', maintenanceCost: '19165'},
    {type: 'Veterinary Clinic', capacity: '20 animals', constructionCost: '2701564', condition: 'Needs Repair', maintenanceDate: '24/12/2024', maintenanceCost: '92662'},
    {type: 'Silage Pit', capacity: '15000 kg', constructionCost: '815541', condition: 'Needs Repair', maintenanceDate: '10/01/2025', maintenanceCost: '66515'},
    {type: 'Water Troughs', capacity: '5000 liters', constructionCost: '2829247', condition: 'Needs Repair', maintenanceDate: '10/06/2024', maintenanceCost: '54048'},
    {type: 'Calf Rearing Unit', capacity: '25 animals', constructionCost: '1305491', condition: 'Needs Repair', maintenanceDate: '20/11/2024', maintenanceCost: '96823'},
    {type: 'Fencing System', capacity: 'N/A meters', constructionCost: '2552497', condition: 'Needs Repair', maintenanceDate: '06/01/2025', maintenanceCost: '59907'},
  ]);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleWaterSourceChange = (value) => {
    if (value === 'new') {
      setWaterSource('');
      setWaterStorage('');
      setIsNewWaterSource(true);
      return;
    }
    
    setWaterSource(value);
    
    const existingSource = existingWaterSources.find(source => source.name === value);
    if (existingSource) {
      setWaterStorage(existingSource.capacity);
      setIsNewWaterSource(false);
    } else {
      setIsNewWaterSource(true);
    }
  };

  // Handle existing power source selection
  const handlePowerSourceChange = (value) => {
    if (value === 'new') {
      setPowerSource('');
      setPowerCapacity('');
      setInstallationCost('');
      setConsumptionRate('');
      setConsumptionCost('');
      setIsNewPowerSource(true);
      return;
    }
    
    setPowerSource(value);
    
    // If selecting an existing power source, set its details and mark as not new
    const existingSource = existingPowerSources.find(source => source.name === value);
    if (existingSource) {
      setPowerCapacity(existingSource.capacity);
      setInstallationCost(existingSource.installationCost);
      setConsumptionRate(existingSource.consumptionRate);
      setConsumptionCost(existingSource.consumptionCost);
      setIsNewPowerSource(false);
    } else {
      setIsNewPowerSource(true);
    }
  };

  // Handle existing structure selection
  const handleStructureTypeChange = (value) => {
    if (value === 'new') {
      setStructureType('');
      setStructureCapacity('');
      setConstructionCost('');
      setCondition('');
      setLastMaintenanceDate(new Date());
      setMaintenanceCost('');
      setIsNewStructure(true);
      return;
    }
    
    setStructureType(value);
    
    // If selecting an existing structure, set its details and mark as not new
    const existingStructure = existingStructures.find(structure => structure.type === value);
    if (existingStructure) {
      setStructureCapacity(existingStructure.capacity);
      setConstructionCost(existingStructure.constructionCost);
      setCondition(existingStructure.condition);
      // Parse the maintenance date
      const dateParts = existingStructure.maintenanceDate.split('/');
      if (dateParts.length === 3) {
        const newDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
        setLastMaintenanceDate(newDate);
      }
      setMaintenanceCost(existingStructure.maintenanceCost);
      setIsNewStructure(false);
    } else {
      setIsNewStructure(true);
    }
  };

  const handleEntryDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setEntryDate(selectedDate);
    }
    setShowEntryDatePicker(false);
  };

  const handleMaintenanceDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setLastMaintenanceDate(selectedDate);
    }
    setShowMaintenanceDatePicker(false);
  };

  return (
    <View style={{flex: 1, backgroundColor: COLORS.lightGreen}}>
      <SecondaryHeader title="Add Utility Record" />
      <ScrollView contentContainerStyle={styles.container}>
        <Box bg="white" p={6} borderRadius={8} shadow={1} mx={6} my={6}>
          <Text style={styles.headerText}>Fill in the Utility Details</Text>

          {/* Radio Buttons */}
          <VStack space={3}>
            <Text style={styles.label}>Utility</Text>
            <Radio.Group
              name="utilityGroup"
              value={selectedUtility}
              onChange={setSelectedUtility}>
              <VStack space={2}>
                <Radio value="water" colorScheme="green">
                  Water Supply
                </Radio>
                <Radio value="power" colorScheme="green">
                  Power Supply
                </Radio>
                <Radio value="facility" colorScheme="green">
                  Facility
                </Radio>
              </VStack>
            </Radio.Group>
          </VStack>

          {/* Water Supply Fields */}
          {selectedUtility === 'water' && (
            <VStack space={4} mt={4}>
              <Box>
                <Text style={styles.label}>Water Source</Text>
                <Select
                  selectedValue={waterSource}
                  minWidth="100%"
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  placeholder="Select water source"
                  onValueChange={handleWaterSourceChange}>
                  {existingWaterSources.map((source, index) => (
                    <Select.Item key={index} label={source.name} value={source.name} />
                  ))}
                  <Select.Item label="Add New Source" value="new" />
                </Select>
                {waterSource === 'new' && (
                  <Input
                    mt={2}
                    variant="outline"
                    backgroundColor={COLORS.lightGreen}
                    borderColor="gray.200"
                    placeholder="Enter new water source name"
                    onChangeText={setWaterSource}
                  />
                )}
              </Box>
              
              <Box>
                <Text style={styles.label}>Current Water Level (Liters)</Text>
                <Input
                  variant="outline"
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  placeholder="Enter current water level"
                  keyboardType="numeric"
                  value={waterLevel}
                  onChangeText={setWaterLevel}
                />
              </Box>
              
              {/* Entry Date Picker */}
              <Box>
                <Text style={styles.label}>Entry Date</Text>
                <HStack alignItems="center" space={3}>
                  <Input
                    flex={1}
                    backgroundColor={COLORS.lightGreen}
                    borderColor="gray.200"
                    value={entryDate.toLocaleDateString('en-GB')}
                    placeholder="DD/MM/YY"
                    isReadOnly
                  />
                  <TouchableOpacity onPress={() => setShowEntryDatePicker(true)}>
                    <Image
                      source={icons.calendar}
                      resizeMode="contain"
                      style={styles.calendarIcon}
                    />
                  </TouchableOpacity>
                </HStack>
                {showEntryDatePicker && (
                  <DateTimePicker
                    value={entryDate}
                    mode="date"
                    is24Hour={true}
                    onChange={handleEntryDateChange}
                  />
                )}
              </Box>
              
              <Box>
                <Text style={styles.label}>Water Storage Capacity (Liters)</Text>
                <Input
                  variant="outline"
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  placeholder="Enter storage capacity"
                  keyboardType="numeric"
                  value={waterStorage}
                  onChangeText={setWaterStorage}
                  isDisabled={!isNewWaterSource}
                />
                {!isNewWaterSource && (
                  <Text style={styles.helperText}>
                    Storage capacity is fixed for existing water sources
                  </Text>
                )}
              </Box>
            </VStack>
          )}

          {/* Power Supply Fields */}
          {selectedUtility === 'power' && (
            <VStack space={4} mt={4}>
              <Box>
                <Text style={styles.label}>Power Source</Text>
                <Select
                  selectedValue={powerSource}
                  minWidth="100%"
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  placeholder="Select power source"
                  onValueChange={handlePowerSourceChange}>
                  {existingPowerSources.map((source, index) => (
                    <Select.Item key={index} label={source.name} value={source.name} />
                  ))}
                  <Select.Item label="Add New Source" value="new" />
                </Select>
                {powerSource === 'new' && (
                  <Input
                    mt={2}
                    variant="outline"
                    backgroundColor={COLORS.lightGreen}
                    borderColor="gray.200"
                    placeholder="Enter new power source name"
                    onChangeText={setPowerSource}
                  />
                )}
              </Box>
              
              <Box>
                <Text style={styles.label}>Capacity</Text>
                <Input
                  variant="outline"
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  placeholder="Enter capacity (e.g., 50KW)"
                  value={powerCapacity}
                  onChangeText={setPowerCapacity}
                  isDisabled={!isNewPowerSource}
                />
                {!isNewPowerSource && (
                  <Text style={styles.helperText}>
                    Capacity is fixed for existing power sources
                  </Text>
                )}
              </Box>
              
              <Box>
                <Text style={styles.label}>Installation Cost</Text>
                <Input
                  variant="outline"
                
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  placeholder="Enter installation cost"
                  keyboardType="numeric"
                  value={installationCost}
                  onChangeText={setInstallationCost}
                  isDisabled={!isNewPowerSource}
                />
                {!isNewPowerSource && (
                  <Text style={styles.helperText}>
                    Installation cost is fixed for existing power sources
                  </Text>
                )}
              </Box>
              
              <Box>
                <Text style={styles.label}>Consumption Rate</Text>
                <Input
                  variant="outline"
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  placeholder="Enter consumption rate"
                  keyboardType="numeric"
                  value={consumptionRate}
                  onChangeText={setConsumptionRate}
                />
              </Box>
              
              <Box>
                <Text style={styles.label}>Consumption Cost</Text>
                <Input
                  variant="outline"
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  placeholder="Enter consumption cost"
                  keyboardType="numeric"
                  value={consumptionCost}
                  onChangeText={setConsumptionCost}
                />
              </Box>
            </VStack>
          )}

          {/* Facility Fields */}
          {selectedUtility === 'facility' && (
            <VStack space={4} mt={4}>
              <Box>
                <Text style={styles.label}>Structure Type</Text>
                <Select
                  selectedValue={structureType}
                  minWidth="100%"
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  placeholder="Select structure type"
                  onValueChange={handleStructureTypeChange}>
                  {existingStructures.map((structure, index) => (
                    <Select.Item key={index} label={structure.type} value={structure.type} />
                  ))}
                  <Select.Item label="Add New Structure" value="new" />
                </Select>
                {structureType === 'new' && (
                  <Input
                    mt={2}
                    variant="outline"
                    backgroundColor={COLORS.lightGreen}
                    borderColor="gray.200"
                    placeholder="Enter new structure type"
                    onChangeText={setStructureType}
                  />
                )}
              </Box>
              
              <Box>
                <Text style={styles.label}>Capacity</Text>
                <Input
                  variant="outline"
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  placeholder="Enter capacity (e.g., 50 animals)"
                  value={structureCapacity}
                  onChangeText={setStructureCapacity}
                  isDisabled={!isNewStructure}
                />
                {!isNewStructure && (
                  <Text style={styles.helperText}>
                    Capacity is fixed for existing structures
                  </Text>
                )}
              </Box>
              
              <Box>
                <Text style={styles.label}>Construction Cost</Text>
                <Input
                  variant="outline"
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  placeholder="Enter construction cost"
                  keyboardType="numeric"
                  value={constructionCost}
                  onChangeText={setConstructionCost}
                  isDisabled={!isNewStructure}
                />
                {!isNewStructure && (
                  <Text style={styles.helperText}>
                    Construction cost is fixed for existing structures
                  </Text>
                )}
              </Box>
              
              <Box>
                <Text style={styles.label}>Condition</Text>
                <Select
                  selectedValue={condition}
                  minWidth="100%"
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  placeholder="Select condition"
                  onValueChange={setCondition}>
                  <Select.Item label="Good" value="Good" />
                  <Select.Item label="Needs Repair" value="Needs Repair" />
                  <Select.Item label="Poor" value="Poor" />
                </Select>
              </Box>
              
              {/* Maintenance Date Picker */}
              <Box>
                <Text style={styles.label}>Last Maintenance Date</Text>
                <HStack alignItems="center" space={3}>
                  <Input
                    flex={1}
                    backgroundColor={COLORS.lightGreen}
                    borderColor="gray.200"
                    value={lastMaintenanceDate.toLocaleDateString('en-GB')}
                    placeholder="DD/MM/YY"
                    isReadOnly
                  />
                  <TouchableOpacity onPress={() => setShowMaintenanceDatePicker(true)}>
                    <Image
                      source={icons.calendar}
                      resizeMode="contain"
                      style={styles.calendarIcon}
                    />
                  </TouchableOpacity>
                </HStack>
                {showMaintenanceDatePicker && (
                  <DateTimePicker
                    value={lastMaintenanceDate}
                    mode="date"
                    is24Hour={true}
                    onChange={handleMaintenanceDateChange}
                  />
                )}
              </Box>
              
              <Box>
                <Text style={styles.label}>Maintenance Cost</Text>
                <Input
                  variant="outline"
                  backgroundColor={COLORS.lightGreen}
                  borderColor="gray.200"
                  placeholder="Enter maintenance cost"
                  keyboardType="numeric"
                  value={maintenanceCost}
                  onChangeText={setMaintenanceCost}
                />
              </Box>
            </VStack>
          )}

          {/* Submit Button */}
          <Button
            mt={6}
            colorScheme="green"
            onPress={() => setShowSuccessModal(true)}>
            Save Utility Record
          </Button>
        </Box>
      </ScrollView>

      {/* Success Modal */}
      <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)}>
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>Success</Modal.Header>
          <Modal.Body>
            <VStack space={3} alignItems="center">
              <FastImage
                source={icons.checkCircle}
                style={styles.successIcon}
                resizeMode={FastImage.resizeMode.contain}
              />
              <Text fontSize="md" textAlign="center">
                Utility record has been saved successfully!
              </Text>
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button
                variant="ghost"
                colorScheme="blueGray"
                onPress={() => {
                  setShowSuccessModal(false);
                }}>
                Add Another
              </Button>
              <Button
                colorScheme="green"
                onPress={() => {
                  setShowSuccessModal(false);
                  navigation.goBack();
                }}>
                Done
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.lightGreen,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: COLORS.darkGreen,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    color: COLORS.darkGray,
  },
  calendarIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.darkGreen,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
    fontStyle: 'italic',
  },
  successIcon: {
    width: 60,
    height: 60,
  },
});