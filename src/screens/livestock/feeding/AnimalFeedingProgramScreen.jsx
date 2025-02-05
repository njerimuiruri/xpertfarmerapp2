import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import {
  Box,
  Text,
  Input,
  Button,
  VStack,
  Select,
  ScrollView,
  HStack,
} from 'native-base';
import DateTimePicker from '@react-native-community/datetimepicker';
import FastImage from 'react-native-fast-image';
import { icons } from '../../../constants';
import { COLORS } from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';

export default function LivestockFeedingScreen({ navigation }) {
    const [feedType, setFeedType] = useState('');
    const [feedSource, setFeedSource] = useState('');
    const [feedingSchedule, setFeedingSchedule] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [unit, setUnit] = useState('');
    const [costPerUnit, setCostPerUnit] = useState('');
    const [totalCost, setTotalCost] = useState('');
    const [supplierName, setSupplierName] = useState('');
    const [feedingMethod, setFeedingMethod] = useState('');
    const [storageLocation, setStorageLocation] = useState('');
    const [nutritionalValue, setNutritionalValue] = useState('');
    const [remarks, setRemarks] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const calculateTotalCost = () => {
        const cost = parseFloat(quantity || 0) * parseFloat(costPerUnit || 0);
        setTotalCost(cost ? cost.toFixed(2) : '');
    };

    const handleSubmit = () => {
        setModalVisible(true);
    };

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.lightGreen }}>
            <SecondaryHeader title="Livestock Feeding Record" />
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: 'center',
                    paddingTop: 5,  
                    paddingBottom: 20,
                }}>
                <Box bg="white" p={6} borderRadius={8} shadow={1} mx={6} my={8}>
                    <VStack space={5}>
                        <Box>
                            <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                                Feed Type
                            </Text>
                            <Select
                                selectedValue={feedType}
                                minWidth="100%"
                                backgroundColor={COLORS.lightGreen}
                                borderColor="gray.200"
                                placeholder="Select Feed Type"
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
                                onValueChange={setFeedType}>
                                <Select.Item label="Grains" value="Grains" />
                                <Select.Item label="Silage" value="Silage" />
                                <Select.Item label="Supplements" value="Supplements" />
                                <Select.Item label="Hay" value="Hay" />
                                <Select.Item label="Pellets" value="Pellets" />
                                <Select.Item label="Mash" value="Mash" />
                                <Select.Item label="Cubes" value="Cubes" />
                                <Select.Item label="Roots and Tubers" value="Roots and Tubers" />
                                <Select.Item label="Green Forage" value="Green Forage" />
                                <Select.Item label="Crop Residues" value="Crop Residues" />
                                <Select.Item label="Concentrates" value="Concentrates" />
                                <Select.Item label="Mineral Blocks" value="Mineral Blocks" />
                                <Select.Item label="By-products" value="By-products" />
                            </Select>
                        </Box>

                        <Box>
                            <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                                Feed Source
                            </Text>
                            <Select
                                selectedValue={feedSource}
                                minWidth="100%"
                                backgroundColor={COLORS.lightGreen}
                                borderColor="gray.200"
                                placeholder="Select Feed Source"
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
                                onValueChange={setFeedSource}>
                                <Select.Item label="Personal Grown" value="Personal Grown" />
                                <Select.Item label="Purchased" value="Purchased" />
                                <Select.Item label="Purchased & Grown" value="Purchased & Grown" />
                                <Select.Item label="Donated" value="Donated" />
                                <Select.Item label="Community Shared" value="Community Shared" />
                                <Select.Item label="Government Provided" value="Government Provided" />
                                <Select.Item label="Imported" value="Imported" />
                                <Select.Item label="Local Market" value="Local Market" />
                                <Select.Item label="Farmers' Cooperative" value="Farmers' Cooperative" />
                            </Select>
                        </Box>

                        <Box>
                            <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                                Feeding Schedule
                            </Text>
                            <Select
                                selectedValue={feedingSchedule}
                                minWidth="100%"
                                backgroundColor={COLORS.lightGreen}
                                borderColor="gray.200"
                                placeholder="Select Feeding Schedule"
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
                                onValueChange={setFeedingSchedule}>
                                <Select.Item label="Early Morning (5-7 AM)" value="Early Morning" />
                                <Select.Item label="Morning (7-9 AM)" value="Morning" />
                                <Select.Item label="Mid-Day (11 AM-1 PM)" value="Mid-Day" />
                                <Select.Item label="Afternoon (2-4 PM)" value="Afternoon" />
                                <Select.Item label="Evening (5-7 PM)" value="Evening" />
                                <Select.Item label="Night (7-9 PM)" value="Night" />
                                <Select.Item label="Twice Daily (Morning & Evening)" value="Twice Daily" />
                                <Select.Item label="Three Times Daily" value="Three Times Daily" />
                                <Select.Item label="Free Choice/Ad Libitum" value="Free Choice" />
                            </Select>
                        </Box>

                        <Box>
                            <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                                Quantity
                            </Text>
                            <HStack alignItems="center" space={2}>
                                <Select
                                    selectedValue={unit}
                                    minWidth="40%"
                                    backgroundColor={COLORS.lightGreen}
                                    borderColor="gray.200"
                                    placeholder="Select Unit"
                                    _selectedItem={{
                                        bg: 'teal.600',
                                    }}
                                    onValueChange={setUnit}>
                                    <Select.Item label="kg" value="kg" />
                                    <Select.Item label="ton" value="ton" />
                                    <Select.Item label="bale" value="bale" />
                                </Select>
                                <HStack flex={1} alignItems="center" space={2}>
                                    <Button
                                        onPress={() => {
                                            const currentValue = parseFloat(quantity) || 1;
                                            setQuantity(Math.max(currentValue - 1, 1).toString());
                                            calculateTotalCost();
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
                                        placeholder="Enter Quantity"
                                        keyboardType="numeric"
                                        value={quantity}
                                        onChangeText={text => {
                                            const numericText = text.replace(/[^0-9.]/g, '');
                                            setQuantity(numericText);
                                            calculateTotalCost();
                                        }}
                                    />
                                    <Button
                                        onPress={() => {
                                            const currentValue = parseFloat(quantity) || 1;
                                            setQuantity((currentValue + 1).toString());
                                            calculateTotalCost();
                                        }}
                                        variant="outline"
                                        p={2}>
                                        +
                                    </Button>
                                </HStack>
                            </HStack>
                        </Box>

                        <Box>
                            <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                                Cost per Unit
                            </Text>
                            <Input
                                variant="outline"
                                backgroundColor={COLORS.lightGreen}
                                borderColor="gray.200"
                                placeholder="Enter Cost per Unit"
                                keyboardType="numeric"
                                value={costPerUnit}
                                onChangeText={(value) => {
                                    setCostPerUnit(value);
                                    calculateTotalCost();
                                }}
                            />
                        </Box>

                        <Box>
                            <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                                Total Cost
                            </Text>
                            <Input
                                variant="outline"
                                backgroundColor={COLORS.lightGreen}
                                borderColor="gray.200"
                                value={totalCost}
                                isReadOnly
                                placeholder="Calculated Total Cost"
                            />
                        </Box>

                        <Box>
                            <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                                Supplier Name
                            </Text>
                            <Input
                                variant="outline"
                                backgroundColor={COLORS.lightGreen}
                                borderColor="gray.200"
                                placeholder="Enter Supplier Name"
                                value={supplierName}
                                onChangeText={setSupplierName}
                            />
                        </Box>

                        <Box>
                            <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                                Feeding Method
                            </Text>
                            <Select
                                selectedValue={feedingMethod}
                                minWidth="100%"
                                backgroundColor={COLORS.lightGreen}
                                borderColor="gray.200"
                                placeholder="Select Feeding Method"
                                _selectedItem={{
                                    bg: 'teal.600',
                                }}
                                onValueChange={setFeedingMethod}>
                                <Select.Item label="Manual" value="Manual" />
                                <Select.Item label="Automated" value="Automated" />
                            </Select>
                        </Box>

                        <Box>
                            <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                                Storage Location
                            </Text>
                            <Input
                                variant="outline"
                                backgroundColor={COLORS.lightGreen}
                                borderColor="gray.200"
                                placeholder="Enter Storage Location"
                                value={storageLocation}
                                onChangeText={setStorageLocation}
                            />
                        </Box>

                        <Box>
                            <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                                Nutritional Value
                            </Text>
                            <Input
                                variant="outline"
                                backgroundColor={COLORS.lightGreen}
                                borderColor="gray.200"
                                placeholder="Enter Nutritional Info (e.g., Protein %)"
                                value={nutritionalValue}
                                onChangeText={setNutritionalValue}
                            />
                        </Box>

                        <Box>
                            <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                                Date
                            </Text>
                            <View style={styles.dateContainer}>
                                <Input
                                    w="85%"
                                    backgroundColor={COLORS.lightGreen}
                                    value={date.toLocaleDateString('en-GB')}
                                    placeholder="DD/MM/YY"
                                    isReadOnly
                                />
                                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                                    <FastImage
                                        source={icons.calendar}
                                        resizeMode="contain"
                                        style={styles.calendarIcon}
                                    />
                                </TouchableOpacity>
                            </View>
                            {showDatePicker && (
                                <DateTimePicker
                                    testID="dateTimePicker"
                                    value={date}
                                    mode="date"
                                    is24Hour={true}
                                    onChange={onDateChange}
                                />
                            )}
                        </Box>

                        <Box>
                            <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                                Remarks
                            </Text>
                            <Input
                                variant="outline"
                                backgroundColor={COLORS.lightGreen}
                                borderColor="gray.200"
                                placeholder="Enter any remarks"
                                value={remarks}
                                onChangeText={setRemarks}
                                multiline
                                numberOfLines={3}
                            />
                        </Box>

                        <HStack justifyContent="center" mt={6} space={8}>
                            <Button
                                variant="outline"
                                borderWidth={1}
                                borderColor={COLORS.green}
                                borderRadius={8}
                                px={6}
                                py={3}
                                onPress={() => navigation.goBack()}>
                                Cancel
                            </Button>
                            <Button
                                backgroundColor={COLORS.green}
                                borderRadius={8}
                                px={6}
                                py={3}
                                _pressed={{
                                    bg: 'emerald.700',
                                }}
                                onPress={handleSubmit}>
                                Submit
                            </Button>
                        </HStack>
                    </VStack>
                    </Box>
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <FastImage 
                            className="w-[25px] h-[25px]" 
                            source={icons.tick} 
                        />
                        <Text style={styles.modalText}>Record added successfully</Text>
                        <Button
                            backgroundColor={COLORS.green}
                            borderRadius={8}
                            px={6}
                            py={2}
                            onPress={() => {
                                setModalVisible(false);
                                navigation.navigate('HomeScreen');
                            }}>
                            Ok
                        </Button>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    calendarIcon: {
        width: 40,
        height: 40,
        tintColor: COLORS.green2,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
        elevation: 5,
    },
    modalText: {
        marginBottom: 20,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '500',
    }
});