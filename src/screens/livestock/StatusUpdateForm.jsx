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
import FastImage from 'react-native-fast-image';
import { icons } from '../../constants';
import { COLORS } from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';
import { updateLivestockStatus } from '../../services/livestock';

const StatusUpdateForm = ({ route, navigation }) => {
    const { animalId, animalData } = route.params;

    const [selectedStatus, setSelectedStatus] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const statusOptions = [
        {
            id: 'active',
            label: 'Active',
            description: 'Animal is healthy and active',
            color: COLORS.green,
            requiresReason: false,
        },
        {
            id: 'deceased',
            label: 'Deceased',
            description: 'Animal has passed away',
            color: COLORS.red,
            requiresReason: true,
            reasonPlaceholder: 'e.g., Natural causes due to age, Disease, etc.',
        },
        {
            id: 'sold',
            label: 'Sold',
            description: 'Animal has been sold',
            color: COLORS.orange,
            requiresReason: true,
            reasonPlaceholder: 'e.g., Sold to local farmer, Market sale, etc.',
        },
        {
            id: 'transferred',
            label: 'Transferred',
            description: 'Animal has been transferred to another farm',
            color: COLORS.purple,
            requiresReason: false,
            reasonPlaceholder: 'Optional: Reason for transfer',
            isTransfer: true,
        },
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

    const handleStatusUpdate = async () => {
        if (!selectedStatus) {
            Alert.alert('Error', 'Please select a status');
            return;
        }

        const selectedOption = statusOptions.find(option => option.id === selectedStatus);

        if (selectedOption?.isTransfer) {
            navigation.navigate('TransferForm', {
                animalId,
                animalData,
            });
            return;
        }

        if (selectedOption?.requiresReason && !reason.trim()) {
            Alert.alert('Error', `Reason is required when marking animal as ${selectedOption.label.toLowerCase()}`);
            return;
        }

        const livestockId = getLivestockId();

        if (!livestockId) {
            console.error('No valid livestock ID found:', {
                animalId,
                animalData,
                rawData: animalData?.rawData
            });
            Alert.alert('Error', 'Unable to identify the animal. Please try again.');
            return;
        }

        console.log('🔍 Using livestock ID:', livestockId);

        setLoading(true);

        try {
            const { data, error } = await updateLivestockStatus(
                livestockId,
                selectedStatus,
                reason.trim() || null
            );

            if (error) {
                Alert.alert('Error', error);
            } else {
                Alert.alert(
                    'Success',
                    `Animal status updated to ${selectedOption.label} successfully`,
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.goBack(),
                        },
                    ]
                );
            }
        } catch (error) {
            console.error('Error updating status:', error);
            Alert.alert('Error', 'Failed to update animal status. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderStatusOption = (option) => {
        const isSelected = selectedStatus === option.id;

        return (
            <TouchableOpacity
                key={option.id}
                style={[
                    styles.statusOption,
                    isSelected && styles.selectedStatusOption,
                    { borderColor: option.color }
                ]}
                onPress={() => setSelectedStatus(option.id)}
            >
                <View style={styles.statusOptionHeader}>
                    <View style={[styles.statusIndicator, { backgroundColor: option.color }]} />
                    <View style={styles.statusOptionContent}>
                        <Text style={[styles.statusOptionLabel, isSelected && styles.selectedStatusLabel]}>
                            {option.label}
                            {option.isTransfer && (
                                <Text style={styles.transferNote}> (Opens transfer form)</Text>
                            )}
                        </Text>
                        <Text style={styles.statusOptionDescription}>
                            {option.description}
                        </Text>
                    </View>
                    <View style={styles.radioButton}>
                        {isSelected && <View style={[styles.radioButtonInner, { backgroundColor: option.color }]} />}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const selectedOption = statusOptions.find(option => option.id === selectedStatus);

    return (
        <SafeAreaView style={styles.container}>
            <SecondaryHeader title="Update Status" />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Animal Info */}
                <View style={styles.animalInfoCard}>
                    <Text style={styles.animalInfoTitle}>Animal Information</Text>
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
                    <View style={styles.animalInfoRow}>
                        <Text style={styles.animalInfoLabel}>Current Status:</Text>
                        <Text style={[styles.animalInfoValue, { color: COLORS.green, fontWeight: '600' }]}>
                            {animalData?.status?.toUpperCase() || 'ACTIVE'}
                        </Text>
                    </View>
                </View>

                {/* Debug Info - Remove this in production */}
                {__DEV__ && (
                    <View style={styles.debugCard}>
                        <Text style={styles.debugTitle}>Debug Info (Dev Only)</Text>
                        <Text style={styles.debugText}>Animal ID: {animalId}</Text>
                        <Text style={styles.debugText}>Raw Data ID: {animalData?.rawData?._id}</Text>
                        <Text style={styles.debugText}>Animal Data ID: {animalData?.id}</Text>
                        <Text style={styles.debugText}>Selected ID: {getLivestockId()}</Text>
                    </View>
                )}

                {/* Status Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Select New Status</Text>
                    <Text style={styles.sectionDescription}>
                        Choose the new status for this animal
                    </Text>

                    <View style={styles.statusOptionsContainer}>
                        {statusOptions.map(renderStatusOption)}
                    </View>
                </View>

                {/* Reason Input - Only show if not transfer and reason is needed */}
                {selectedOption && !selectedOption.isTransfer && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Reason {selectedOption.requiresReason && <Text style={styles.required}>*</Text>}
                        </Text>
                        <Text style={styles.sectionDescription}>
                            {selectedOption.requiresReason
                                ? `Please provide a reason for marking this animal as ${selectedOption.label.toLowerCase()}`
                                : 'Optionally provide additional details'
                            }
                        </Text>

                        <TextInput
                            style={styles.reasonInput}
                            placeholder={selectedOption.reasonPlaceholder}
                            placeholderTextColor="#999"
                            value={reason}
                            onChangeText={setReason}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>
                )}

                {/* Transfer Info */}
                {selectedOption?.isTransfer && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Transfer Information</Text>
                        <Text style={styles.sectionDescription}>
                            You've selected to transfer this animal. Clicking "Proceed to Transfer" will take you to the transfer form where you can select the destination farm and provide transfer details.
                        </Text>

                        <View style={styles.transferInfoBox}>
                            <Text style={styles.transferInfoText}>
                                📋 In the transfer form you'll be able to:
                            </Text>
                            <Text style={styles.transferInfoItem}>• Select destination farm</Text>
                            <Text style={styles.transferInfoItem}>• Set transfer date</Text>
                            <Text style={styles.transferInfoItem}>• Provide transfer reason</Text>
                            <Text style={styles.transferInfoItem}>• Specify transport method</Text>
                        </View>
                    </View>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        (!selectedStatus || loading || !getLivestockId()) && styles.submitButtonDisabled
                    ]}
                    onPress={handleStatusUpdate}
                    disabled={!selectedStatus || loading || !getLivestockId()}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <Text style={styles.submitButtonText}>
                            {selectedOption?.isTransfer ? 'Proceed to Transfer' : 'Update Status'}
                        </Text>
                    )}
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
    animalInfoCard: {
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
    animalInfoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 12,
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
    debugCard: {
        backgroundColor: '#FFF3CD',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FFEAA7',
    },
    debugTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#856404',
        marginBottom: 8,
    },
    debugText: {
        fontSize: 12,
        color: '#856404',
        marginBottom: 4,
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
        marginBottom: 8,
    },
    sectionDescription: {
        fontSize: 14,
        color: COLORS.darkGray3,
        marginBottom: 16,
        lineHeight: 20,
    },
    required: {
        color: COLORS.red,
    },
    statusOptionsContainer: {
        gap: 12,
    },
    statusOption: {
        borderWidth: 2,
        borderColor: COLORS.lightGray2,
        borderRadius: 12,
        padding: 16,
        backgroundColor: COLORS.white,
    },
    selectedStatusOption: {
        backgroundColor: COLORS.lightGray,
        borderWidth: 2,
    },
    statusOptionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
    },
    statusOptionContent: {
        flex: 1,
    },
    statusOptionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.black,
        marginBottom: 4,
    },
    selectedStatusLabel: {
        color: COLORS.black,
    },
    statusOptionDescription: {
        fontSize: 14,
        color: COLORS.darkGray3,
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: COLORS.lightGray2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    reasonInput: {
        borderWidth: 1,
        borderColor: COLORS.lightGray2,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: COLORS.black,
        backgroundColor: COLORS.white,
        minHeight: 80,
    },
    submitButton: {
        backgroundColor: COLORS.green,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 32,
    },
    submitButtonDisabled: {
        backgroundColor: COLORS.gray,
    },
    submitButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default StatusUpdateForm;