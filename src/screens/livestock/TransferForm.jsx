import React, { useState, useEffect } from 'react';
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
import { Dropdown } from 'react-native-element-dropdown';
import { COLORS } from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';
import { transferLivestock, getUserFarms, getActiveFarmInfo } from '../../services/livestock';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TransferForm = ({ route, navigation }) => {
    const { animalId, animalData } = route.params;

    const [loading, setLoading] = useState(false);
    const [farms, setFarms] = useState([]);
    const [activeFarm, setActiveFarm] = useState(null);
    const [selectedDestinationFarm, setSelectedDestinationFarm] = useState('');
    const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
    const [reason, setReason] = useState('');
    const [transportMethod, setTransportMethod] = useState('');
    const [loadingFarms, setLoadingFarms] = useState(true);

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

    useEffect(() => {
        loadFarmsAndActiveFarm();
    }, []);

    const loadFarmsAndActiveFarm = async () => {
        setLoadingFarms(true);
        try {
            const { data: farmsData, error: farmsError } = await getUserFarms();
            if (farmsError) {
                Alert.alert('Error', `Failed to load farms: ${farmsError}`);
                return;
            }

            const { data: activeFarmData, error: activeFarmError } = await getActiveFarmInfo();
            if (activeFarmError) {
                Alert.alert('Error', `Failed to load active farm: ${activeFarmError}`);
                return;
            }

            // Get current user
            const userRaw = await AsyncStorage.getItem('user');
            const user = JSON.parse(userRaw || '{}');
            const userId = user?.id;

            // Filter to user's own farms
            const myFarms = (farmsData || []).filter(farm => farm.userId === userId);

            setFarms(myFarms);
            setActiveFarm(activeFarmData);

            const availableFarms = myFarms.filter(farm => farm.id !== activeFarmData?.id);

            if (availableFarms.length === 0) {
                Alert.alert(
                    'No Destination Farms',
                    'You need at least one other farm to transfer livestock to.',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            }
        } catch (error) {
            console.error('Error loading farms:', error);
            Alert.alert('Error', 'Failed to load farm information');
        } finally {
            setLoadingFarms(false);
        }
    };


    const handleTransfer = async () => {
        // Validation
        if (!selectedDestinationFarm) {
            Alert.alert('Error', 'Please select a destination farm');
            return;
        }

        if (!transferDate) {
            Alert.alert('Error', 'Please select a transfer date');
            return;
        }

        if (!reason.trim()) {
            Alert.alert('Error', 'Please provide a reason for the transfer');
            return;
        }

        const livestockId = getLivestockId();
        if (!livestockId) {
            Alert.alert('Error', 'Unable to identify the animal. Please try again.');
            return;
        }

        if (!activeFarm?.id) {
            Alert.alert('Error', 'Active farm information not available');
            return;
        }

        setLoading(true);

        try {
            const transferData = {
                livestockId,
                fromFarmId: activeFarm.id,
                toFarmId: selectedDestinationFarm,
                transferDate: new Date(transferDate).toISOString(),
                reason: reason.trim(),
                transportMethod: transportMethod.trim() || 'Standard transport',
            };

            console.log('Transfer data:', transferData);

            const { data, error } = await transferLivestock(transferData);

            if (error) {
                Alert.alert('Transfer Failed', error);
            } else {
                Alert.alert(
                    'Transfer Successful',
                    'The livestock has been successfully transferred.',
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
            console.error('Transfer error:', error);
            Alert.alert('Error', 'An unexpected error occurred during transfer');
        } finally {
            setLoading(false);
        }
    };

    const destinationFarms = farms.filter(farm => farm.id !== activeFarm?.id);
    const dropdownData = destinationFarms.map(farm => ({
        label: farm.name,
        value: farm.id,
    }));

    const handleFarmChange = (item) => {
        setSelectedDestinationFarm(item.value);
    };

    if (loadingFarms) {
        return (
            <SafeAreaView style={styles.container}>
                <SecondaryHeader title="Transfer Livestock" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading farm information...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <SecondaryHeader title="Transfer Livestock" />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Animal Information</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Name:</Text>
                        <Text style={styles.infoValue}>{animalData?.title || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>ID:</Text>
                        <Text style={styles.infoValue}>{getLivestockId() || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Type:</Text>
                        <Text style={styles.infoValue}>{animalData?.type || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Current Farm:</Text>
                        <Text style={styles.infoValue}>{activeFarm?.name || 'N/A'}</Text>
                    </View>
                </View>

                {/* Transfer Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Transfer Details</Text>

                    {/* Destination Farm Dropdown */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>
                            Destination Farm <Text style={styles.required}>*</Text>
                        </Text>
                        <Dropdown
                            style={[
                                styles.dropdown,
                                !selectedDestinationFarm && styles.dropdownError
                            ]}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            inputSearchStyle={styles.inputSearchStyle}
                            itemTextStyle={styles.itemTextStyle}
                            itemContainerStyle={styles.itemContainerStyle}
                            data={dropdownData}
                            search
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder="Select destination farm"
                            searchPlaceholder="Search farms..."
                            value={selectedDestinationFarm}
                            onChange={handleFarmChange}
                        />
                        {dropdownData.length === 0 && (
                            <Text style={styles.noFarmsText}>
                                No other farms available for transfer
                            </Text>
                        )}
                    </View>

                    {/* Transfer Date */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>
                            Transfer Date <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            value={transferDate}
                            onChangeText={setTransferDate}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor="#999"
                        />
                        <Text style={styles.inputHint}>Format: YYYY-MM-DD</Text>
                    </View>

                    {/* Reason */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>
                            Reason for Transfer <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={reason}
                            onChangeText={setReason}
                            placeholder="e.g., Better grazing facilities, Breeding program, etc."
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Transport Method</Text>
                        <TextInput
                            style={styles.input}
                            value={transportMethod}
                            onChangeText={setTransportMethod}
                            placeholder="e.g., Livestock transport truck, Own vehicle, etc."
                            placeholderTextColor="#999"
                        />
                        <Text style={styles.inputHint}>Optional: Specify how the animal will be transported</Text>
                    </View>
                </View>

                {selectedDestinationFarm && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Transfer Summary</Text>
                        <View style={styles.summaryContainer}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>From:</Text>
                                <Text style={styles.summaryValue}>{activeFarm?.name}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>To:</Text>
                                <Text style={styles.summaryValue}>
                                    {destinationFarms.find(f => f.id === selectedDestinationFarm)?.name}
                                </Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Animal:</Text>
                                <Text style={styles.summaryValue}>{animalData?.title}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Date:</Text>
                                <Text style={styles.summaryValue}>{transferDate}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Transfer Button */}
                <TouchableOpacity
                    style={[
                        styles.transferButton,
                        (!selectedDestinationFarm || !reason.trim() || !transferDate || loading) &&
                        styles.transferButtonDisabled
                    ]}
                    onPress={handleTransfer}
                    disabled={!selectedDestinationFarm || !reason.trim() || !transferDate || loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <Text style={styles.transferButtonText}>Complete Transfer</Text>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: COLORS.darkGray3,
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
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray2,
    },
    infoLabel: {
        fontSize: 14,
        color: COLORS.darkGray3,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        color: COLORS.black,
        fontWeight: '600',
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
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
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    inputHint: {
        fontSize: 12,
        color: COLORS.darkGray3,
        marginTop: 4,
        fontStyle: 'italic',
    },
    // Dropdown styles
    dropdown: {
        height: 50,
        borderColor: '#D1FAE5',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#F0FDF4',
    },
    dropdownError: {
        borderColor: 'red',
    },
    placeholderStyle: {
        fontSize: 16,
        color: '#1F2937',
    },
    selectedTextStyle: {
        fontSize: 16,
        color: '#1F2937',
    },
    inputSearchStyle: {
        fontSize: 14,
        color: '#1F2937',
    },
    itemTextStyle: {
        color: '#000',
        fontSize: 16,
    },
    itemContainerStyle: {
        backgroundColor: '#F0FDF4',
    },
    noFarmsText: {
        fontSize: 12,
        color: COLORS.red,
        marginTop: 4,
        fontStyle: 'italic',
    },
    summaryContainer: {
        backgroundColor: COLORS.lightGray,
        borderRadius: 8,
        padding: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    summaryLabel: {
        fontSize: 14,
        color: COLORS.darkGray3,
        fontWeight: '500',
    },
    summaryValue: {
        fontSize: 14,
        color: COLORS.black,
        fontWeight: '600',
    },
    transferButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 32,
    },
    transferButtonDisabled: {
        backgroundColor: COLORS.gray,
    },
    transferButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default TransferForm;