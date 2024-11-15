import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Button, Select, Input, Divider } from 'native-base';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'react-native';
import { icons } from '../../../constants';
import { COLORS } from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';

export default function LivestockFeedingScreen() {
    const [feedType, setFeedType] = useState('');
    const [feedSource, setFeedSource] = useState('');
    const [feedingSchedule, setFeedingSchedule] = useState('');
    const [quantity, setQuantity] = useState('');
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
        const feedingData = {
            feedType,
            feedSource,
            feedingSchedule,
            quantity,
            unit,
            costPerUnit,
            totalCost,
            supplierName,
            feedingMethod,
            storageLocation,
            nutritionalValue,
            remarks,
            date: date.toLocaleDateString(),
        };
        console.log(feedingData);
        // Save or submit the data
    };

    return (
        <View className="flex-1 bg-white">
            <SecondaryHeader title="Livestock Feeding Record" />
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Feed Type</Text>
                    <Select
                        selectedValue={feedType}
                        onValueChange={(value) => setFeedType(value)}
                        placeholder="Select Feed Type"
                    >
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
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Feed Source</Text>
                    <Select
                        selectedValue={feedSource}
                        onValueChange={(value) => setFeedSource(value)}
                        placeholder="Select Feed Source"
                    >
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
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Feeding Schedule</Text>
                    <Select
                        selectedValue={feedingSchedule}
                        onValueChange={(value) => setFeedingSchedule(value)}
                        placeholder="Select Feeding Schedule"
                    >
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
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Quantity</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Input
                            placeholder="Enter Quantity"
                            value={quantity}
                            keyboardType="numeric"
                            onChangeText={(value) => {
                                setQuantity(value);
                                calculateTotalCost();
                            }}
                            style={{ flex: 1 }}
                        />
                        <Select
                            selectedValue={unit}
                            onValueChange={(value) => setUnit(value)}
                            placeholder="Unit"
                            style={{ flex: 1, marginLeft: 10 }}
                        >
                            <Select.Item label="kg" value="kg" />
                            <Select.Item label="ton" value="ton" />
                            <Select.Item label="bale" value="bale" />
                        </Select>
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Cost per Unit</Text>
                    <Input
                        placeholder="Enter Cost per Unit"
                        value={costPerUnit}
                        keyboardType="numeric"
                        onChangeText={(value) => {
                            setCostPerUnit(value);
                            calculateTotalCost();
                        }}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Total Cost</Text>
                    <Input
                        value={totalCost}
                        isReadOnly
                        placeholder="Calculated Total Cost"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Supplier Name</Text>
                    <Input
                        placeholder="Enter Supplier Name"
                        value={supplierName}
                        onChangeText={setSupplierName}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Feeding Method</Text>
                    <Select
                        selectedValue={feedingMethod}
                        onValueChange={(value) => setFeedingMethod(value)}
                        placeholder="Select Feeding Method"
                    >
                        <Select.Item label="Manual" value="Manual" />
                        <Select.Item label="Automated" value="Automated" />
                    </Select>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Storage Location</Text>
                    <Input
                        placeholder="Enter Storage Location"
                        value={storageLocation}
                        onChangeText={setStorageLocation}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Nutritional Value</Text>
                    <Input
                        placeholder="Enter Nutritional Info (e.g., Protein %)"
                        value={nutritionalValue}
                        onChangeText={setNutritionalValue}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Date</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                        <Input
                            value={date.toLocaleDateString()}
                            isReadOnly
                            placeholder="Select Date"
                        />
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            onChange={onDateChange}
                        />
                    )}
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Remarks</Text>
                    <Input
                        placeholder="Enter any remarks"
                        value={remarks}
                        onChangeText={setRemarks}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                <Button onPress={handleSubmit} className="bg-green-600 border-0 py-3 mt-4">
                    <Text className="font-semibold text-white">Submit</Text>
                </Button>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#F8F9FA',
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: '#333',
        marginBottom: 8,
    },
});
