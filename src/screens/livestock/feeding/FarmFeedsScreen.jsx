import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Select, Input, Radio, Box, VStack } from 'native-base';
import SecondaryHeader from '../../../components/headers/secondary-header';
import { COLORS } from '../../../constants/theme';

export default function FarmFeedsScreen({ navigation }) {
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
        // Save or submit the data
    };

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.lightGreen }}>
            <SecondaryHeader title="Farm Feeds" />
            <ScrollView contentContainerStyle={styles.container}>
                <Box bg="white" borderRadius={8} p={6} shadow={1} mx={6} my={8}>
                    <VStack space={4}>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Type of Feed</Text>
                            <Select
                                selectedValue={selectedFeedType}
                                onValueChange={(value) => setSelectedFeedType(value)}
                                placeholder="Select Feed Type"
                                backgroundColor={COLORS.lightGreen}
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
                                <Radio value="Personally Grown" my={1}>
                                    Personally Grown
                                </Radio>
                                <Radio value="Purchased" my={1}>
                                    Purchased
                                </Radio>
                                <Radio value="Mixed" my={1}>
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
                                backgroundColor={COLORS.lightGreen}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Quantity</Text>
                            <Input
                                placeholder="Enter Quantity"
                                value={quantity}
                                onChangeText={setQuantity}
                                keyboardType="numeric"
                                backgroundColor={COLORS.lightGreen}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Purchase Price</Text>
                            <Input
                                placeholder="Enter Purchase Price"
                                value={purchasePrice}
                                onChangeText={setPurchasePrice}
                                keyboardType="numeric"
                                backgroundColor={COLORS.lightGreen}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Supplier Name</Text>
                            <Input
                                placeholder="Enter Supplier Name"
                                value={supplierName}
                                onChangeText={setSupplierName}
                                backgroundColor={COLORS.lightGreen}
                            />
                        </View>

                        <Button onPress={handleSubmit} style={styles.submitButton}>
                            <Text style={styles.submitButtonText}>Submit</Text>
                        </Button>
                    </VStack>
                </Box>
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
    submitButton: {
        backgroundColor: COLORS.green,
        borderRadius: 5,
        paddingVertical: 12,
        marginTop: 10,
    },
    submitButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});