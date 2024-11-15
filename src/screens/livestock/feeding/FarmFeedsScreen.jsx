import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Select, Input, Radio } from 'native-base';
import SecondaryHeader from '../../../components/headers/secondary-header';

export default function FarmFeedsScreen() {
    const [selectedFeedType, setSelectedFeedType] = useState('');
    const [sourceOfFeed, setSourceOfFeed] = useState('');
    const [feedingSchedule, setFeedingSchedule] = useState('');
    const [quantity, setQuantity] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [supplierName, setSupplierName] = useState('');

    const handleSubmit = () => {
        const feedingData = {
            selectedFeedType,
            sourceOfFeed,
            feedingSchedule,
            quantity,
            purchasePrice,
            supplierName,
        };
        console.log(feedingData);
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <SecondaryHeader title="Farm Feeds" />
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.card}>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Type of Feed</Text>
                        <Select
                            selectedValue={selectedFeedType}
                            onValueChange={(value) => setSelectedFeedType(value)}
                            placeholder="Select Feed Type"
                        >
                            <Select.Item label="Basal feeds" value="Basal feeds" />
                            
                            <Select.Item label="Concentrates" value="Concentrates" />
                            <Select.Item label="Supplements" value="Supplements" />
                        </Select>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Source of Feed</Text>
                        <Radio.Group
                            name="sourceOfFeed"
                            value={sourceOfFeed}
                            onChange={setSourceOfFeed}
                        >
                            <Radio value="Personally Grown">
                                Personally Grown
                            </Radio>
                            <Radio value="Purchased">
                                Purchased
                            </Radio>
                            <Radio value="Mixed">
                                Mixed
                            </Radio>
                        </Radio.Group>
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
                        <Text style={styles.label}>Purchase Price</Text>
                        <Input
                            placeholder="Enter Purchase Price"
                            value={purchasePrice}
                            onChangeText={setPurchasePrice}
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
});