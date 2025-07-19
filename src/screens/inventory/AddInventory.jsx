import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    Platform,
    Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';
import { createInventory } from '../../services/inventoryService';

export default function AddInventory() {
    const navigation = useNavigation();
    const route = useRoute();
    const initialType = route.params?.type || 'machinery';

    const [selectedType, setSelectedType] = useState(initialType);
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [currentDateField, setCurrentDateField] = useState(null);

    // Custom picker states
    const [showCustomPicker, setShowCustomPicker] = useState(false);
    const [currentPickerField, setCurrentPickerField] = useState(null);
    const [currentPickerOptions, setCurrentPickerOptions] = useState([]);

    // Form data for different types
    const [machineryData, setMachineryData] = useState({
        equipmentName: '',
        equipmentId: '',
        purchaseDate: new Date(),
        currentLocation: '',
        condition: 'good',
        lastServiceDate: new Date(),
        nextServiceDate: new Date(),
    });

    const [goodsData, setGoodsData] = useState({
        itemName: '',
        sku: '',
        quantity: '',
        currentLocation: '',
        condition: 'good',
        expirationDate: new Date(),
    });

    const [utilityData, setUtilityData] = useState({
        utilityType: 'water',
        entryDate: new Date(),
        facilityCondition: 'good',
        // Water fields
        waterLevel: '',
        waterSource: '',
        waterStorage: '',
        // Power fields
        powerSource: '',
        powerCapacity: '',
        installationCost: '',
        consumptionRate: '',
        consumptionCost: '',
        // Structure fields
        structureType: '',
        structureCapacity: '',
        constructionCost: '',
        // Maintenance fields
        lastMaintenanceDate: new Date(),
        maintenanceCost: '',
    });

    const conditionOptions = ['excellent', 'good', 'fair', 'poor'];
    const utilityTypeOptions = ['water', 'power', 'electricity', 'structure', 'building'];

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate && currentDateField) {
            if (selectedType === 'machinery') {
                setMachineryData(prev => ({
                    ...prev,
                    [currentDateField]: selectedDate,
                }));
            } else if (selectedType === 'goodsInStock') {
                setGoodsData(prev => ({
                    ...prev,
                    [currentDateField]: selectedDate,
                }));
            } else if (selectedType === 'utilities') {
                setUtilityData(prev => ({
                    ...prev,
                    [currentDateField]: selectedDate,
                }));
            }
        }
        setCurrentDateField(null);
    };

    const showDatePickerFor = (fieldName) => {
        setCurrentDateField(fieldName);
        setShowDatePicker(true);
    };

    // Custom picker functions
    const showCustomPickerFor = (fieldName, options) => {
        setCurrentPickerField(fieldName);
        setCurrentPickerOptions(options);
        setShowCustomPicker(true);
    };

    const handleCustomPickerSelect = (value) => {
        if (currentPickerField) {
            if (selectedType === 'machinery') {
                setMachineryData(prev => ({
                    ...prev,
                    [currentPickerField]: value,
                }));
            } else if (selectedType === 'goodsInStock') {
                setGoodsData(prev => ({
                    ...prev,
                    [currentPickerField]: value,
                }));
            } else if (selectedType === 'utilities') {
                setUtilityData(prev => ({
                    ...prev,
                    [currentPickerField]: value,
                }));
            }
        }
        setShowCustomPicker(false);
        setCurrentPickerField(null);
        setCurrentPickerOptions([]);
    };

    const formatDateForDisplay = (date) => {
        return date.toLocaleDateString();
    };

    const formatDateForAPI = (date) => {
        return date.toISOString();
    };

    const validateForm = () => {
        if (selectedType === 'machinery') {
            if (!machineryData.equipmentName.trim()) {
                Alert.alert('Error', 'Equipment name is required');
                return false;
            }
            if (!machineryData.equipmentId.trim()) {
                Alert.alert('Error', 'Equipment ID is required');
                return false;
            }
            if (!machineryData.currentLocation.trim()) {
                Alert.alert('Error', 'Current location is required');
                return false;
            }
        } else if (selectedType === 'goodsInStock') {
            if (!goodsData.itemName.trim()) {
                Alert.alert('Error', 'Item name is required');
                return false;
            }
            if (!goodsData.sku.trim()) {
                Alert.alert('Error', 'SKU is required');
                return false;
            }
            if (!goodsData.quantity || parseInt(goodsData.quantity) <= 0) {
                Alert.alert('Error', 'Valid quantity is required');
                return false;
            }
            if (!goodsData.currentLocation.trim()) {
                Alert.alert('Error', 'Current location is required');
                return false;
            }
        } else if (selectedType === 'utilities') {
            if (utilityData.utilityType === 'water') {
                if (!utilityData.waterLevel || parseInt(utilityData.waterLevel) <= 0) {
                    Alert.alert('Error', 'Valid water level is required');
                    return false;
                }
                if (!utilityData.waterSource.trim()) {
                    Alert.alert('Error', 'Water source is required');
                    return false;
                }
                if (!utilityData.waterStorage || parseInt(utilityData.waterStorage) <= 0) {
                    Alert.alert('Error', 'Valid water storage is required');
                    return false;
                }
            } else if (utilityData.utilityType === 'power' || utilityData.utilityType === 'electricity') {
                if (!utilityData.powerSource.trim()) {
                    Alert.alert('Error', 'Power source is required');
                    return false;
                }
                if (!utilityData.powerCapacity.trim()) {
                    Alert.alert('Error', 'Power capacity is required');
                    return false;
                }
            } else if (utilityData.utilityType === 'structure' || utilityData.utilityType === 'building') {
                if (!utilityData.structureType.trim()) {
                    Alert.alert('Error', 'Structure type is required');
                    return false;
                }
                if (!utilityData.structureCapacity.trim()) {
                    Alert.alert('Error', 'Structure capacity is required');
                    return false;
                }
            }
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            let payload = {};

            if (selectedType === 'machinery') {
                payload = {
                    machinery: {
                        equipmentName: machineryData.equipmentName,
                        equipmentId: machineryData.equipmentId,
                        purchaseDate: formatDateForAPI(machineryData.purchaseDate),
                        currentLocation: machineryData.currentLocation,
                        condition: machineryData.condition,
                        lastServiceDate: formatDateForAPI(machineryData.lastServiceDate),
                        nextServiceDate: formatDateForAPI(machineryData.nextServiceDate),
                    },
                };
            } else if (selectedType === 'goodsInStock') {
                payload = {
                    goodsInStock: {
                        itemName: goodsData.itemName,
                        sku: goodsData.sku,
                        quantity: parseInt(goodsData.quantity),
                        currentLocation: goodsData.currentLocation,
                        condition: goodsData.condition,
                        expirationDate: formatDateForAPI(goodsData.expirationDate),
                    },
                };
            } else if (selectedType === 'utilities') {
                const utility = {
                    utilityType: utilityData.utilityType,
                    entryDate: formatDateForAPI(utilityData.entryDate),
                    facilityCondition: utilityData.facilityCondition,
                };

                // Add type-specific fields based on utility type
                if (utilityData.utilityType === 'water') {
                    utility.waterLevel = parseInt(utilityData.waterLevel);
                    utility.waterSource = utilityData.waterSource;
                    utility.waterStorage = parseInt(utilityData.waterStorage);
                } else if (utilityData.utilityType === 'power' || utilityData.utilityType === 'electricity') {
                    utility.powerSource = utilityData.powerSource;
                    utility.powerCapacity = utilityData.powerCapacity;
                    if (utilityData.installationCost) {
                        utility.installationCost = parseInt(utilityData.installationCost);
                    }
                    if (utilityData.consumptionRate) {
                        utility.consumptionRate = parseInt(utilityData.consumptionRate);
                    }
                    if (utilityData.consumptionCost) {
                        utility.consumptionCost = parseInt(utilityData.consumptionCost);
                    }
                } else if (utilityData.utilityType === 'structure' || utilityData.utilityType === 'building') {
                    utility.structureType = utilityData.structureType;
                    utility.structureCapacity = utilityData.structureCapacity;
                    if (utilityData.constructionCost) {
                        utility.constructionCost = parseInt(utilityData.constructionCost);
                    }
                }

                // Add maintenance fields if provided
                if (utilityData.lastMaintenanceDate) {
                    utility.lastMaintenanceDate = formatDateForAPI(utilityData.lastMaintenanceDate);
                }
                if (utilityData.maintenanceCost) {
                    utility.maintenanceCost = parseInt(utilityData.maintenanceCost);
                }

                payload = { utility };
            }

            console.log('Submitting payload:', JSON.stringify(payload, null, 2));

            const { data, error } = await createInventory(payload);

            if (error) {
                Alert.alert('Error', error);
            } else {
                Alert.alert('Success', 'Inventory item added successfully', [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack(),
                    },
                ]);
            }
        } catch (error) {
            console.error('Submit error:', error);
            Alert.alert('Error', 'Failed to add inventory item');
        } finally {
            setLoading(false);
        }
    };

    const renderTypeSelector = () => (
        <View style={styles.typeSelectorContainer}>
            <Text style={styles.sectionTitle}>Select Inventory Type</Text>
            <View style={styles.typeButtons}>
                {[
                    { key: 'machinery', label: 'Machinery', icon: '🚜' },
                    { key: 'goodsInStock', label: 'Goods in Stock', icon: '📦' },
                    { key: 'utilities', label: 'Utilities', icon: '⚡' },
                ].map((type) => (
                    <TouchableOpacity
                        key={type.key}
                        style={[
                            styles.typeButton,
                            selectedType === type.key && styles.selectedTypeButton,
                        ]}
                        onPress={() => setSelectedType(type.key)}
                    >
                        <Text style={styles.typeIcon}>{type.icon}</Text>
                        <Text
                            style={[
                                styles.typeButtonText,
                                selectedType === type.key && styles.selectedTypeButtonText,
                            ]}
                        >
                            {type.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderInput = (label, value, onChangeText, placeholder, keyboardType = 'default') => (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{label}</Text>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                keyboardType={keyboardType}
            />
        </View>
    );

    const renderDateInput = (label, value, fieldName) => (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{label}</Text>
            <TouchableOpacity
                style={styles.dateInput}
                onPress={() => showDatePickerFor(fieldName)}
            >
                <Text style={styles.dateInputText}>{formatDateForDisplay(value)}</Text>
                <Text style={styles.dateInputIcon}>📅</Text>
            </TouchableOpacity>
        </View>
    );

    // Custom picker component
    const renderCustomPicker = (label, value, fieldName, options) => (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{label}</Text>
            <TouchableOpacity
                style={styles.customPickerInput}
                onPress={() => showCustomPickerFor(fieldName, options)}
            >
                <Text style={styles.customPickerText}>{value}</Text>
                <Text style={styles.customPickerIcon}>▼</Text>
            </TouchableOpacity>
        </View>
    );

    const renderMachineryForm = () => (
        <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Machinery Details</Text>
            {renderInput(
                'Equipment Name *',
                machineryData.equipmentName,
                (text) => setMachineryData(prev => ({ ...prev, equipmentName: text })),
                'Enter equipment name'
            )}
            {renderInput(
                'Equipment ID *',
                machineryData.equipmentId,
                (text) => setMachineryData(prev => ({ ...prev, equipmentId: text })),
                'Enter equipment ID'
            )}
            {renderDateInput('Purchase Date', machineryData.purchaseDate, 'purchaseDate')}
            {renderInput(
                'Current Location *',
                machineryData.currentLocation,
                (text) => setMachineryData(prev => ({ ...prev, currentLocation: text })),
                'Enter current location'
            )}
            {renderCustomPicker('Condition', machineryData.condition, 'condition', conditionOptions)}
            {renderDateInput('Last Service Date', machineryData.lastServiceDate, 'lastServiceDate')}
            {renderDateInput('Next Service Date', machineryData.nextServiceDate, 'nextServiceDate')}
        </View>
    );

    const renderGoodsForm = () => (
        <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Goods in Stock Details</Text>
            {renderInput(
                'Item Name *',
                goodsData.itemName,
                (text) => setGoodsData(prev => ({ ...prev, itemName: text })),
                'Enter item name'
            )}
            {renderInput(
                'SKU *',
                goodsData.sku,
                (text) => setGoodsData(prev => ({ ...prev, sku: text })),
                'Enter SKU'
            )}
            {renderInput(
                'Quantity *',
                goodsData.quantity,
                (text) => setGoodsData(prev => ({ ...prev, quantity: text })),
                'Enter quantity',
                'numeric'
            )}
            {renderInput(
                'Current Location *',
                goodsData.currentLocation,
                (text) => setGoodsData(prev => ({ ...prev, currentLocation: text })),
                'Enter current location'
            )}
            {renderCustomPicker('Condition', goodsData.condition, 'condition', conditionOptions)}
            {renderDateInput('Expiration Date', goodsData.expirationDate, 'expirationDate')}
        </View>
    );

    const renderUtilityForm = () => (
        <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Utility Details</Text>
            {renderCustomPicker('Utility Type', utilityData.utilityType, 'utilityType', utilityTypeOptions)}
            {renderDateInput('Entry Date', utilityData.entryDate, 'entryDate')}
            {renderCustomPicker('Facility Condition', utilityData.facilityCondition, 'facilityCondition', conditionOptions)}

            {/* Water-specific fields */}
            {utilityData.utilityType === 'water' && (
                <>
                    {renderInput(
                        'Water Level (L) *',
                        utilityData.waterLevel,
                        (text) => setUtilityData(prev => ({ ...prev, waterLevel: text })),
                        'Enter water level',
                        'numeric'
                    )}
                    {renderInput(
                        'Water Source *',
                        utilityData.waterSource,
                        (text) => setUtilityData(prev => ({ ...prev, waterSource: text })),
                        'Enter water source'
                    )}
                    {renderInput(
                        'Water Storage (L) *',
                        utilityData.waterStorage,
                        (text) => setUtilityData(prev => ({ ...prev, waterStorage: text })),
                        'Enter water storage capacity',
                        'numeric'
                    )}
                </>
            )}

            {/* Power-specific fields */}
            {(utilityData.utilityType === 'power' || utilityData.utilityType === 'electricity') && (
                <>
                    {renderInput(
                        'Power Source *',
                        utilityData.powerSource,
                        (text) => setUtilityData(prev => ({ ...prev, powerSource: text })),
                        'Enter power source'
                    )}
                    {renderInput(
                        'Power Capacity *',
                        utilityData.powerCapacity,
                        (text) => setUtilityData(prev => ({ ...prev, powerCapacity: text })),
                        'Enter power capacity'
                    )}
                    {renderInput(
                        'Installation Cost',
                        utilityData.installationCost,
                        (text) => setUtilityData(prev => ({ ...prev, installationCost: text })),
                        'Enter installation cost',
                        'numeric'
                    )}
                    {renderInput(
                        'Consumption Rate',
                        utilityData.consumptionRate,
                        (text) => setUtilityData(prev => ({ ...prev, consumptionRate: text })),
                        'Enter consumption rate',
                        'numeric'
                    )}
                    {renderInput(
                        'Consumption Cost',
                        utilityData.consumptionCost,
                        (text) => setUtilityData(prev => ({ ...prev, consumptionCost: text })),
                        'Enter consumption cost',
                        'numeric'
                    )}
                </>
            )}

            {/* Structure-specific fields */}
            {(utilityData.utilityType === 'structure' || utilityData.utilityType === 'building') && (
                <>
                    {renderInput(
                        'Structure Type *',
                        utilityData.structureType,
                        (text) => setUtilityData(prev => ({ ...prev, structureType: text })),
                        'Enter structure type'
                    )}
                    {renderInput(
                        'Structure Capacity *',
                        utilityData.structureCapacity,
                        (text) => setUtilityData(prev => ({ ...prev, structureCapacity: text })),
                        'Enter structure capacity'
                    )}
                    {renderInput(
                        'Construction Cost',
                        utilityData.constructionCost,
                        (text) => setUtilityData(prev => ({ ...prev, constructionCost: text })),
                        'Enter construction cost',
                        'numeric'
                    )}
                </>
            )}

            {/* Maintenance fields */}
            <Text style={styles.subsectionTitle}>Maintenance (Optional)</Text>
            {renderDateInput('Last Maintenance Date', utilityData.lastMaintenanceDate, 'lastMaintenanceDate')}
            {renderInput(
                'Maintenance Cost',
                utilityData.maintenanceCost,
                (text) => setUtilityData(prev => ({ ...prev, maintenanceCost: text })),
                'Enter maintenance cost',
                'numeric'
            )}
        </View>
    );

    const renderForm = () => {
        switch (selectedType) {
            case 'machinery':
                return renderMachineryForm();
            case 'goodsInStock':
                return renderGoodsForm();
            case 'utilities':
                return renderUtilityForm();
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <SecondaryHeader title="Add Inventory Item" />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {renderTypeSelector()}
                {renderForm()}

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.submitButton]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <Text style={styles.submitButtonText}>Add Item</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Date Picker */}
            {showDatePicker && (
                <DateTimePicker
                    value={
                        selectedType === 'machinery' ? machineryData[currentDateField] :
                            selectedType === 'goodsInStock' ? goodsData[currentDateField] :
                                utilityData[currentDateField]
                    }
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                />
            )}

            {/* Custom Picker Modal */}
            <Modal
                visible={showCustomPicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCustomPicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Option</Text>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setShowCustomPicker(false)}
                            >
                                <Text style={styles.modalCloseText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalOptions}>
                            {currentPickerOptions.map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={styles.modalOption}
                                    onPress={() => handleCustomPickerSelect(option)}
                                >
                                    <Text style={styles.modalOptionText}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    typeSelectorContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    subsectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginTop: 16,
        marginBottom: 8,
    },
    typeButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    typeButton: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedTypeButton: {
        backgroundColor: COLORS.green2,
        borderColor: COLORS.green2,
    },
    typeIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    typeButtonText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        fontWeight: '500',
    },
    selectedTypeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    formContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fafafa',
    },
    dateInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#fafafa',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateInputText: {
        fontSize: 16,
        color: '#333',
    },
    dateInputIcon: {
        fontSize: 18,
        color: '#666',
    },
    customPickerInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#fafafa',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    customPickerText: {
        fontSize: 16,
        color: '#333',
        textTransform: 'capitalize',
    },
    customPickerIcon: {
        fontSize: 12,
        color: '#666',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        marginBottom: 32,
        gap: 16,
    },
    button: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    submitButton: {
        backgroundColor: COLORS.green2,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '50%',
        minHeight: '30%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    modalCloseButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCloseText: {
        fontSize: 16,
        color: '#666',
    },
    modalOptions: {
        maxHeight: 300,
    },
    modalOption: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalOptionText: {
        fontSize: 16,
        color: '#333',
        textTransform: 'capitalize',
    },
});