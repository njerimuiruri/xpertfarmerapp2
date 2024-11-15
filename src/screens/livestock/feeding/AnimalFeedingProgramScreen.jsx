import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Select, Input, Checkbox } from 'native-base';
import SecondaryHeader from '../../../components/headers/secondary-header';

export default function AddAnimalFeedingProgramScreen() {
    const [selectedFeedingPrograms, setSelectedFeedingPrograms] = useState([]);
    const [selectedAnimalId, setSelectedAnimalId] = useState('');
    const [selectedAnimalType, setSelectedAnimalType] = useState('');
    const [feedType, setFeedType] = useState('');
    const [feedSource, setFeedSource] = useState('');
    const [feedingSchedule, setFeedingSchedule] = useState('');
    const [quantity, setQuantity] = useState('');
    const [costPerUnit, setCostPerUnit] = useState('');
    const [totalCost, setTotalCost] = useState('');
    const [supplierName, setSupplierName] = useState('');
    const [date, setDate] = useState(new Date());

    const handleSubmit = () => {
        const feedingData = {
            selectedFeedingPrograms,
            selectedAnimalId,
            selectedAnimalType,
            feedType,
            feedSource,
            feedingSchedule,
            quantity,
            costPerUnit,
            totalCost,
            supplierName,
            date: date.toLocaleDateString(),
        };
        console.log(feedingData);
    };

    const handleFeedingProgramChange = (program) => {
        setSelectedFeedingPrograms(prev => prev.includes(program) ? prev.filter(item => item !== program) : [...prev, program]);
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <SecondaryHeader title="Feeding Program" />
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.card}>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Select Feeding Programs</Text>
                        <Checkbox
                            isChecked={selectedFeedingPrograms.includes("Single Animal Feeding Program")}
                            onChange={() => handleFeedingProgramChange("Single Animal Feeding Program")}
                        >
                            Single Animal Feeding Program
                        </Checkbox>
                        <View style={styles.inputSpacer} />

                        <Checkbox
                            isChecked={selectedFeedingPrograms.includes("Group Feeding Program")}
                            onChange={() => handleFeedingProgramChange("Group Feeding Program")}
                        >
                            Group Feeding Program
                        </Checkbox>
                        <View style={styles.inputSpacer} />

                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Animal ID</Text>
                        <Select
                            selectedValue={selectedAnimalId}
                            onValueChange={(value) => {
                                setSelectedAnimalId(value);
                                setSelectedAnimalType('');
                            }}
                            placeholder="Select Animal ID"
                        >
                            <Select.Item label="Dairy" value="Dairy" />
                            <Select.Item label="Beef" value="Beef" />
                            <Select.Item label="Swine" value="Swine" />
                            <Select.Item label="Poultry" value="Poultry" />
                            <Select.Item label="Sheep & Goats" value="Sheep & Goats" />
                        </Select>
                    </View>

                    {selectedAnimalId === "Dairy" && (
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Animal Type</Text>
                            <Select
                                selectedValue={selectedAnimalType}
                                onValueChange={(value) => setSelectedAnimalType(value)}
                                placeholder="Select Animal Type"
                            >
                                <Select.Item label="Calf" value="Calf" />
                                <Select.Item label="Heifer" value="Heifer" />
                                <Select.Item label="Lactating Cow" value="Lactating Cow" />
                                <Select.Item label="Dry Cow" value="Dry Cow" />
                            </Select>
                        </View>
                    )}

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Feed Type</Text>
                        <Select
                            selectedValue={feedType}
                            onValueChange={(value) => setFeedType(value)}
                            placeholder="Select Feed Type"
                        >
                            <Select.Item label="Concentrate" value="Concentrate" />
                            <Select.Item label="Roughage" value="Roughage" />
                            <Select.Item label="Supplement" value="Supplement" />
                        </Select>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Source of Feed</Text>
                        <Select
                            selectedValue={feedSource}
                            onValueChange={(value) => setFeedSource(value)}
                            placeholder="Select Source of Feed"
                        >
                            <Select.Item label="Personally Grown" value="Personally Grown" />
                            <Select.Item label="Purchased" value="Purchased" />
                            <Select.Item label="Mixed" value="Mixed" />
                        </Select>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Feeding Schedule</Text>
                        <Input
                            placeholder="Enter Feeding Schedule"
                            value={feedingSchedule}
                            onChangeText={setFeedingSchedule}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Quantity</Text>
                        <Input
                            placeholder="Enter Quantity"
                            value={quantity}
                            onChangeText={setQuantity}
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Cost Per Unit</Text>
                        <Input
                            placeholder="Enter Cost Per Unit"
                            value={costPerUnit}
                            onChangeText={setCostPerUnit}
                            keyboardType="numeric"
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

                    <Button onPress={handleSubmit} style={styles.submitButton}>
                        <Text style={styles.submitButtonText}>Submit</Text>
                    </Button>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#F8F9FA',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        marginBottom: 16,
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: '#333',
        marginBottom: 8,
    },
    submitButton: {
        backgroundColor: '#28a745',
        borderRadius: 5,
        paddingVertical: 12,
    },
    submitButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    inputSpacer: {
        height: 20, 
      },
});