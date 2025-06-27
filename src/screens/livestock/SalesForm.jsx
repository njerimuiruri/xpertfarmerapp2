import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';
import { recordLivestockSale } from '../../services/livestock';

const SalesForm = ({ route, navigation }) => {
    const { animalId, animalData } = route.params;

    const [formData, setFormData] = useState({
        saleDate: new Date().toISOString().split('T')[0],
        buyerName: '',
        buyerContact: '',
        saleAmount: '',
        paymentMethod: 'cash',
        receiptNumber: '',
    });
    const [loading, setLoading] = useState(false);

    const paymentMethods = [
        { id: 'cash', label: 'Cash' },
        { id: 'mobile_money', label: 'Mobile Money' },
        { id: 'bank_transfer', label: 'Bank Transfer' },
        { id: 'cheque', label: 'Cheque' },
        { id: 'other', label: 'Other' },
    ];

    const getLivestockId = () => {
        if (animalData?.rawData?._id) {
            return animalData.rawData._id;
        }
        if (animalData?.rawData?.id) {
            return animalData.rawData.id;
        }
        if (animalId) {
            return animalId;
        }
        if (animalData?.id) {
            return animalData.id;
        }
        return null;
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const validateForm = () => {
        const { buyerName, buyerContact, saleAmount, saleDate } = formData;

        if (!buyerName.trim()) {
            Alert.alert('Validation Error', 'Buyer name is required');
            return false;
        }

        if (!buyerContact.trim()) {
            Alert.alert('Validation Error', 'Buyer contact is required');
            return false;
        }

        if (!saleAmount.trim() || isNaN(parseFloat(saleAmount)) || parseFloat(saleAmount) <= 0) {
            Alert.alert('Validation Error', 'Please enter a valid sale amount');
            return false;
        }

        if (!saleDate) {
            Alert.alert('Validation Error', 'Sale date is required');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        const livestockId = getLivestockId();

        if (!livestockId) {
            Alert.alert('Error', 'Unable to identify the animal. Please try again.');
            return;
        }

        setLoading(true);

        try {
            const saleData = {
                livestockId,
                saleDate: new Date(formData.saleDate).toISOString(),
                buyerName: formData.buyerName.trim(),
                buyerContact: formData.buyerContact.trim(),
                saleAmount: parseFloat(formData.saleAmount),
                paymentMethod: formData.paymentMethod,
                receiptNumber: formData.receiptNumber.trim() || null,
            };

            console.log('Recording sale with data:', saleData);

            const { data, error } = await recordLivestockSale(saleData);

            if (error) {
                Alert.alert('Error', error);
            } else {
                Alert.alert(
                    'Success',
                    'Livestock sale recorded successfully',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                navigation.navigate('LivestockModuleScreen');
                            },
                        },
                    ]
                );
            }
        } catch (error) {
            console.error('Error recording sale:', error);
            Alert.alert('Error', 'Failed to record livestock sale. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderPaymentMethodOption = (method) => {
        const isSelected = formData.paymentMethod === method.id;

        return (
            <TouchableOpacity
                key={method.id}
                style={[
                    styles.paymentMethodOption,
                    isSelected && styles.selectedPaymentMethod,
                ]}
                onPress={() => handleInputChange('paymentMethod', method.id)}
            >
                <View style={styles.radioButton}>
                    {isSelected && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={[
                    styles.paymentMethodLabel,
                    isSelected && styles.selectedPaymentMethodLabel
                ]}>
                    {method.label}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <SecondaryHeader title="Record Sale" />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Animal Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Animal Information</Text>
                    <View style={styles.animalInfoRow}>
                        <Text style={styles.animalInfoLabel}>Name:</Text>
                        <Text style={styles.animalInfoValue}>{animalData?.title || 'N/A'}</Text>
                    </View>
                    <View style={styles.animalInfoRow}>
                        <Text style={styles.animalInfoLabel}>ID:</Text>
                        <Text style={styles.animalInfoValue}>{getLivestockId() || 'N/A'}</Text>
                    </View>
                    <View style={styles.animalInfoRow}>
                        <Text style={styles.animalInfoLabel}>Type:</Text>
                        <Text style={styles.animalInfoValue}>{animalData?.type || 'N/A'}</Text>
                    </View>
                </View>

                {/* Sale Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sale Information</Text>

                    {/* Sale Date */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Sale Date <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            value={formData.saleDate}
                            onChangeText={(value) => handleInputChange('saleDate', value)}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Sale Amount */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Sale Amount (KES) <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            value={formData.saleAmount}
                            onChangeText={(value) => handleInputChange('saleAmount', value)}
                            placeholder="Enter sale amount"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                {/* Buyer Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Buyer Information</Text>

                    {/* Buyer Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Buyer Name <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            value={formData.buyerName}
                            onChangeText={(value) => handleInputChange('buyerName', value)}
                            placeholder="Enter buyer's full name"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Buyer Contact <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            value={formData.buyerContact}
                            onChangeText={(value) => handleInputChange('buyerContact', value)}
                            placeholder="Enter phone number or email"
                            placeholderTextColor="#999"
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Information</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Payment Method <Text style={styles.required}>*</Text></Text>
                        <View style={styles.paymentMethodsContainer}>
                            {paymentMethods.map(renderPaymentMethodOption)}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Receipt Number</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.receiptNumber}
                            onChangeText={(value) => handleInputChange('receiptNumber', value)}
                            placeholder="Enter receipt number (optional)"
                            placeholderTextColor="#999"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        loading && styles.submitButtonDisabled
                    ]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <Text style={styles.submitButtonText}>Record Sale</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.infoNote}>
                    <Text style={styles.infoNoteText}>
                        ℹ️ Recording this sale will automatically update the animal's status to "Sold" and remove it from active livestock.
                    </Text>
                </View>
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
    section: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 16,
    },
    animalInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray2,
    },
    animalInfoLabel: {
        fontSize: 14,
        color: COLORS.darkGray3,
        fontWeight: '500',
    },
    animalInfoValue: {
        fontSize: 14,
        color: COLORS.black,
        fontWeight: '600',
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.black,
        marginBottom: 8,
    },
    required: {
        color: COLORS.red,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.lightGray2,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: COLORS.black,
        backgroundColor: COLORS.white,
    },
    paymentMethodsContainer: {
        gap: 8,
    },
    paymentMethodOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: COLORS.lightGray2,
        borderRadius: 8,
        backgroundColor: COLORS.white,
    },
    selectedPaymentMethod: {
        borderColor: COLORS.green,
        backgroundColor: COLORS.lightGray,
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: COLORS.lightGray2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    radioButtonInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.green,
    },
    paymentMethodLabel: {
        fontSize: 16,
        color: COLORS.black,
    },
    selectedPaymentMethodLabel: {
        fontWeight: '600',
        color: COLORS.black,
    },
    submitButton: {
        backgroundColor: COLORS.green,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 16,
    },
    submitButtonDisabled: {
        backgroundColor: COLORS.gray,
    },
    submitButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
    infoNote: {
        backgroundColor: COLORS.lightBlue,
        borderRadius: 8,
        padding: 12,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: COLORS.blue,
    },
    infoNoteText: {
        fontSize: 14,
        color: COLORS.darkBlue,
        lineHeight: 20,
    },
});

export default SalesForm;