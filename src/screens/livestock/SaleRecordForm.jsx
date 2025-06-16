import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { COLORS } from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';
import { recordLivestockSale } from '../../services/livestock';

const SaleRecordForm = ({ route, navigation }) => {
    const { animalId, animalData } = route.params;
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        buyerName: '',
        buyerContact: '',
        saleAmount: '',
        paymentMethod: 'cash',
        receiptNumber: '',
        saleDate: new Date().toISOString().split('T')[0],
    });

    const handleSubmit = async () => {
        if (!formData.buyerName.trim() || !formData.saleAmount) {
            Alert.alert('Error', 'Please fill in buyer name and sale amount');
            return;
        }

        setLoading(true);
        try {
            const saleData = {
                livestockId: animalData.rawData._id,
                saleDate: new Date(formData.saleDate).toISOString(),
                buyerName: formData.buyerName,
                buyerContact: formData.buyerContact,
                saleAmount: parseFloat(formData.saleAmount),
                paymentMethod: formData.paymentMethod,
                receiptNumber: formData.receiptNumber,
            };

            const { data, error } = await recordLivestockSale(saleData);

            if (error) {
                Alert.alert('Error', error);
            } else {
                Alert.alert('Success', 'Sale record created successfully', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to record sale');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <SecondaryHeader title="Record Sale" />
            <ScrollView style={styles.content}>
                <View style={styles.animalInfo}>
                    <Text style={styles.animalTitle}>{animalData.title}</Text>
                    <Text style={styles.animalId}>ID: {animalData.id}</Text>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Buyer Name *</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.buyerName}
                        onChangeText={(text) => setFormData({ ...formData, buyerName: text })}
                        placeholder="Enter buyer's name"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Buyer Contact</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.buyerContact}
                        onChangeText={(text) => setFormData({ ...formData, buyerContact: text })}
                        placeholder="Phone number or email"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Sale Amount (KES) *</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.saleAmount}
                        onChangeText={(text) => setFormData({ ...formData, saleAmount: text })}
                        placeholder="0.00"
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Payment Method</Text>
                    <View style={styles.radioGroup}>
                        {['cash', 'mobile_money', 'bank_transfer'].map((method) => (
                            <TouchableOpacity
                                key={method}
                                style={styles.radioItem}
                                onPress={() => setFormData({ ...formData, paymentMethod: method })}>
                                <View style={styles.radio}>
                                    {formData.paymentMethod === method && <View style={styles.radioSelected} />}
                                </View>
                                <Text style={styles.radioText}>{method.replace('_', ' ').toUpperCase()}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Receipt Number</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.receiptNumber}
                        onChangeText={(text) => setFormData({ ...formData, receiptNumber: text })}
                        placeholder="Optional receipt number"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Sale Date</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.saleDate}
                        onChangeText={(text) => setFormData({ ...formData, saleDate: text })}
                        placeholder="YYYY-MM-DD"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={loading}>
                    <Text style={styles.submitButtonText}>
                        {loading ? 'Recording...' : 'Record Sale'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.lightGray,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    animalInfo: {
        backgroundColor: COLORS.white,
        padding: 16,
        borderRadius: 8,
        marginBottom: 20,
    },
    animalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    animalId: {
        fontSize: 14,
        color: COLORS.gray,
        marginTop: 4,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.black,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.lightGray2,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: COLORS.black,
    },
    radioGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
        marginBottom: 10,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: COLORS.green,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioSelected: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.green,
    },
    radioText: {
        fontSize: 14,
        color: COLORS.black,
    },
    submitButton: {
        backgroundColor: COLORS.green,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    disabledButton: {
        backgroundColor: COLORS.gray,
    },
    submitButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default SaleRecordForm;