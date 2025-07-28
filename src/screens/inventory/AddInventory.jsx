import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Modal,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { icons } from '../../constants';
import { COLORS } from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';
import { createInventoryItem, formatInventoryData } from '../../services/inventoryService';

const { width } = Dimensions.get('window');

const AddInventory = ({ navigation, route }) => {
    // Get optional params
    const routeParams = route?.params || {};

    // Inventory type state
    const [inventoryTypes] = useState([
        { id: 'goodsInStock', name: 'Goods in Stock', icon: 'package' },
        { id: 'machinery', name: 'Machinery', icon: 'settings' },
        { id: 'utility', name: 'Utilities', icon: 'power' },
    ]);

    const [selectedInventoryType, setSelectedInventoryType] = useState(null);
    const [showInventoryTypePicker, setShowInventoryTypePicker] = useState(false);

    // Form state for different inventory types
    const [formData, setFormData] = useState({
        // Goods in Stock fields
        itemName: '',
        sku: '',
        quantity: '',
        currentLocation: '',
        condition: '',
        expirationDate: new Date(),

        // Machinery fields
        equipmentName: '',
        equipmentId: '',
        purchaseDate: new Date(),
        lastServiceDate: new Date(),
        nextServiceDate: new Date(),

        // Utility fields
        utilityType: 'water',
        waterLevel: '',
        waterSource: '',
        waterStorage: '',
        entryDate: new Date(),
        powerSource: '',
        powerCapacity: '',
        installationCost: '',
        consumptionRate: '',
        consumptionCost: '',
        structureType: '',
        structureCapacity: '',
        constructionCost: '',
        facilityCondition: '',
        lastMaintenanceDate: new Date(),
        maintenanceCost: '',
    });

    const [showDatePickers, setShowDatePickers] = useState({
        expirationDate: false,
        purchaseDate: false,
        lastServiceDate: false,
        nextServiceDate: false,
        entryDate: false,
        lastMaintenanceDate: false,
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // Utility types for dropdown
    const [utilityTypes] = useState([
        { id: 'water', name: 'Water' },
        { id: 'power', name: 'Power/Electricity' },
        { id: 'structure', name: 'Structure/Building' },
    ]);

    // Pre-select inventory type if coming from specific screen
    useEffect(() => {
        if (routeParams.inventoryType) {
            const preSelectedType = inventoryTypes.find(
                type => type.id === routeParams.inventoryType
            );
            if (preSelectedType) {
                setSelectedInventoryType(preSelectedType);
            }
        }
    }, [routeParams]);

    const handleInventoryTypeSelection = (type) => {
        setSelectedInventoryType(type);
        setShowInventoryTypePicker(false);

        // Clear inventory type error if it exists
        if (errors.inventoryType) {
            setErrors(prev => ({ ...prev, inventoryType: null }));
        }

        // Reset form data when changing inventory type
        setFormData(prev => ({
            ...prev,
            // Keep common fields, reset type-specific ones
            itemName: '',
            sku: '',
            quantity: '',
            equipmentName: '',
            equipmentId: '',
            waterLevel: '',
            waterSource: '',
            waterStorage: '',
            powerSource: '',
            powerCapacity: '',
            installationCost: '',
            consumptionRate: '',
            consumptionCost: '',
            structureType: '',
            structureCapacity: '',
            constructionCost: '',
            facilityCondition: '',
            maintenanceCost: '',
        }));
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleDateChange = (field, event, selectedDate) => {
        setShowDatePickers(prev => ({ ...prev, [field]: false }));
        if (selectedDate) {
            setFormData(prev => ({ ...prev, [field]: selectedDate }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validate inventory type selection
        if (!selectedInventoryType) {
            newErrors.inventoryType = 'Please select an inventory type';
            setErrors(newErrors);
            return false;
        }

        // Validate based on inventory type
        switch (selectedInventoryType.id) {
            case 'goodsInStock':
                if (!formData.itemName.trim()) {
                    newErrors.itemName = 'Item name is required';
                }
                if (!formData.sku.trim()) {
                    newErrors.sku = 'SKU is required';
                }
                if (!formData.quantity || isNaN(formData.quantity) || parseInt(formData.quantity) < 0) {
                    newErrors.quantity = 'Valid quantity is required';
                }
                if (!formData.currentLocation.trim()) {
                    newErrors.currentLocation = 'Current location is required';
                }
                if (!formData.condition.trim()) {
                    newErrors.condition = 'Condition is required';
                }
                break;

            case 'machinery':
                if (!formData.equipmentName.trim()) {
                    newErrors.equipmentName = 'Equipment name is required';
                }
                if (!formData.equipmentId.trim()) {
                    newErrors.equipmentId = 'Equipment ID is required';
                }
                if (!formData.currentLocation.trim()) {
                    newErrors.currentLocation = 'Current location is required';
                }
                if (!formData.condition.trim()) {
                    newErrors.condition = 'Condition is required';
                }
                break;

            case 'utility':
                if (!formData.utilityType) {
                    newErrors.utilityType = 'Utility type is required';
                }

                // Conditional validation based on utility type
                if (formData.utilityType === 'water') {
                    if (!formData.waterSource.trim()) {
                        newErrors.waterSource = 'Water source is required';
                    }
                    if (!formData.waterLevel || isNaN(formData.waterLevel) || parseInt(formData.waterLevel) < 0) {
                        newErrors.waterLevel = 'Valid water level is required';
                    }
                }

                if (formData.utilityType === 'power') {
                    if (!formData.powerSource.trim()) {
                        newErrors.powerSource = 'Power source is required';
                    }
                    if (!formData.powerCapacity.trim()) {
                        newErrors.powerCapacity = 'Power capacity is required';
                    }
                }

                if (formData.utilityType === 'structure') {
                    if (!formData.structureType.trim()) {
                        newErrors.structureType = 'Structure type is required';
                    }
                    if (!formData.facilityCondition.trim()) {
                        newErrors.facilityCondition = 'Facility condition is required';
                    }
                }
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
            return;
        }

        setIsLoading(true);

        try {
            // Format data based on inventory type
            const formattedData = formatInventoryData(formData, selectedInventoryType.id);

            if (!formattedData) {
                Alert.alert('Error', 'Failed to format inventory data');
                return;
            }

            console.log('Creating inventory item with data:', formattedData);

            const result = await createInventoryItem(formattedData);

            if (result.error) {
                Alert.alert('Error', result.error);
                return;
            }

            Alert.alert(
                'Success',
                `${selectedInventoryType.name} item has been added successfully!`,
                [
                    {
                        text: 'Add Another',
                        onPress: () => {
                            // Reset form but keep inventory type
                            setFormData({
                                itemName: '',
                                sku: '',
                                quantity: '',
                                currentLocation: '',
                                condition: '',
                                expirationDate: new Date(),
                                equipmentName: '',
                                equipmentId: '',
                                purchaseDate: new Date(),
                                lastServiceDate: new Date(),
                                nextServiceDate: new Date(),
                                utilityType: 'water',
                                waterLevel: '',
                                waterSource: '',
                                waterStorage: '',
                                entryDate: new Date(),
                                powerSource: '',
                                powerCapacity: '',
                                installationCost: '',
                                consumptionRate: '',
                                consumptionCost: '',
                                structureType: '',
                                structureCapacity: '',
                                constructionCost: '',
                                facilityCondition: '',
                                lastMaintenanceDate: new Date(),
                                maintenanceCost: '',
                            });
                            setErrors({});
                        },
                    },
                    {
                        text: 'Done',
                        onPress: () => {
                            navigation.goBack();
                        },
                    },
                ]
            );
        } catch (error) {
            console.error('Error adding inventory item:', error);
            Alert.alert(
                'Error',
                'An unexpected error occurred. Please check your connection and try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const renderFormGroup = (title, children) => (
        <View style={styles.formGroup}>
            <Text style={styles.groupTitle}>{title}</Text>
            <LinearGradient
                colors={['#FFFFFF', '#F8FAFC']}
                style={styles.groupContainer}>
                {children}
            </LinearGradient>
        </View>
    );

    const renderInput = (label, field, options = {}) => (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
                {label}
                {options.required && <Text style={styles.required}> *</Text>}
            </Text>
            <TextInput
                style={[styles.textInput, errors[field] && styles.inputError]}
                value={formData[field]?.toString()}
                onChangeText={(value) => handleInputChange(field, value)}
                placeholder={options.placeholder || `Enter ${label.toLowerCase()}`}
                keyboardType={options.keyboardType || 'default'}
                multiline={options.multiline}
                numberOfLines={options.numberOfLines || 1}
                placeholderTextColor="#9CA3AF"
                editable={!isLoading}
            />
            {errors[field] && (
                <Text style={styles.errorText}>{errors[field]}</Text>
            )}
        </View>
    );

    const renderDateInput = (label, field, options = {}) => (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
                {label}
                {options.required && <Text style={styles.required}> *</Text>}
            </Text>
            <TouchableOpacity
                style={[styles.dateInput, isLoading && styles.inputDisabled]}
                onPress={() => !isLoading && setShowDatePickers(prev => ({ ...prev, [field]: true }))}
                disabled={isLoading}>
                <Text style={styles.dateText}>
                    {formData[field].toLocaleDateString()}
                </Text>
                <FastImage source={icons.calendar} style={styles.calendarIcon} />
            </TouchableOpacity>
        </View>
    );

    const renderInventoryTypePicker = () => (
        <Modal
            visible={showInventoryTypePicker}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowInventoryTypePicker(false)}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Inventory Type</Text>
                        <TouchableOpacity
                            onPress={() => setShowInventoryTypePicker(false)}
                            style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>×</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={inventoryTypes}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.inventoryTypeItem,
                                    selectedInventoryType?.id === item.id && styles.selectedInventoryTypeItem
                                ]}
                                onPress={() => handleInventoryTypeSelection(item)}>
                                <View style={styles.inventoryTypeIcon}>
                                    <FastImage
                                        source={icons[item.icon] || icons.account}
                                        style={styles.inventoryTypeIconImage}
                                        tintColor="#EF4444"
                                    />
                                </View>
                                <View style={styles.inventoryTypeInfo}>
                                    <Text style={styles.inventoryTypeName}>
                                        {item.name}
                                    </Text>
                                </View>
                                {selectedInventoryType?.id === item.id && (
                                    <FastImage
                                        source={icons.check || icons.account}
                                        style={styles.checkIcon}
                                        tintColor="#EF4444"
                                    />
                                )}
                            </TouchableOpacity>
                        )}
                        contentContainerStyle={styles.modalList}
                    />
                </View>
            </View>
        </Modal>
    );

    const renderUtilityTypeSelector = () => (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
                Utility Type <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.radioGroup}>
                {utilityTypes.map((type) => (
                    <TouchableOpacity
                        key={type.id}
                        style={[
                            styles.radioOption,
                            formData.utilityType === type.id && styles.radioOptionSelected
                        ]}
                        onPress={() => handleInputChange('utilityType', type.id)}
                        disabled={isLoading}>
                        <View style={[
                            styles.radioCircle,
                            formData.utilityType === type.id && styles.radioCircleSelected
                        ]}>
                            {formData.utilityType === type.id && (
                                <View style={styles.radioInner} />
                            )}
                        </View>
                        <Text style={[
                            styles.radioText,
                            formData.utilityType === type.id && styles.radioTextSelected
                        ]}>
                            {type.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderInventoryTypeSpecificFields = () => {
        if (!selectedInventoryType) return null;

        switch (selectedInventoryType.id) {
            case 'goodsInStock':
                return (
                    <>
                        {renderInput('Item Name', 'itemName', { required: true })}
                        {renderInput('SKU', 'sku', { required: true })}
                        {renderInput('Quantity', 'quantity', {
                            required: true,
                            keyboardType: 'numeric',
                            placeholder: 'Enter quantity (e.g., 100)'
                        })}
                        {renderInput('Current Location', 'currentLocation', { required: true })}
                        {renderInput('Condition', 'condition', {
                            required: true,
                            placeholder: 'e.g., New, Good, Fair, Poor'
                        })}
                        {renderDateInput('Expiration Date', 'expirationDate')}
                    </>
                );

            case 'machinery':
                return (
                    <>
                        {renderInput('Equipment Name', 'equipmentName', { required: true })}
                        {renderInput('Equipment ID', 'equipmentId', { required: true })}
                        {renderDateInput('Purchase Date', 'purchaseDate')}
                        {renderInput('Current Location', 'currentLocation', { required: true })}
                        {renderInput('Condition', 'condition', {
                            required: true,
                            placeholder: 'e.g., Excellent, Good, Fair, Poor'
                        })}
                        {renderDateInput('Last Service Date', 'lastServiceDate')}
                        {renderDateInput('Next Service Date', 'nextServiceDate')}
                    </>
                );

            case 'utility':
                return (
                    <>
                        {renderUtilityTypeSelector()}
                        {renderDateInput('Entry Date', 'entryDate')}

                        {/* Water-specific fields */}
                        {formData.utilityType === 'water' && (
                            <>
                                {renderInput('Water Level', 'waterLevel', {
                                    required: true,
                                    keyboardType: 'numeric',
                                    placeholder: 'Enter water level (liters or %)'
                                })}
                                {renderInput('Water Source', 'waterSource', {
                                    required: true,
                                    placeholder: 'e.g., Borehole, River, Municipal'
                                })}
                                {renderInput('Water Storage', 'waterStorage', {
                                    keyboardType: 'numeric',
                                    placeholder: 'Storage capacity (liters)'
                                })}
                            </>
                        )}

                        {/* Power-specific fields */}
                        {formData.utilityType === 'power' && (
                            <>
                                {renderInput('Power Source', 'powerSource', {
                                    required: true,
                                    placeholder: 'e.g., Grid, Solar, Generator'
                                })}
                                {renderInput('Power Capacity', 'powerCapacity', {
                                    required: true,
                                    placeholder: 'e.g., 5KW, 10KVA'
                                })}
                                {renderInput('Installation Cost', 'installationCost', {
                                    keyboardType: 'numeric',
                                    placeholder: 'Enter cost (optional)'
                                })}
                                {renderInput('Consumption Rate', 'consumptionRate', {
                                    keyboardType: 'numeric',
                                    placeholder: 'kWh per month'
                                })}
                                {renderInput('Consumption Cost', 'consumptionCost', {
                                    keyboardType: 'numeric',
                                    placeholder: 'Monthly cost'
                                })}
                            </>
                        )}

                        {/* Structure-specific fields */}
                        {formData.utilityType === 'structure' && (
                            <>
                                {renderInput('Structure Type', 'structureType', {
                                    required: true,
                                    placeholder: 'e.g., Barn, Shed, Greenhouse'
                                })}
                                {renderInput('Structure Capacity', 'structureCapacity', {
                                    placeholder: 'e.g., 50 animals, 1000 sq ft'
                                })}
                                {renderInput('Construction Cost', 'constructionCost', {
                                    keyboardType: 'numeric',
                                    placeholder: 'Total construction cost'
                                })}
                                {renderInput('Facility Condition', 'facilityCondition', {
                                    required: true,
                                    placeholder: 'e.g., Excellent, Good, Needs Repair'
                                })}
                                {renderDateInput('Last Maintenance Date', 'lastMaintenanceDate')}
                                {renderInput('Maintenance Cost', 'maintenanceCost', {
                                    keyboardType: 'numeric',
                                    placeholder: 'Last maintenance cost'
                                })}
                            </>
                        )}
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <SecondaryHeader
                title="Add Inventory Item"
                showBack={true}
                onBack={() => navigation.goBack()}
            />

            <KeyboardAvoidingView
                style={styles.keyboardAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}>

                    {/* Inventory Type Selection */}
                    {renderFormGroup('Select Inventory Type', (
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>
                                Inventory Type <Text style={styles.required}>*</Text>
                            </Text>
                            <TouchableOpacity
                                style={[
                                    styles.inventoryTypeSelector,
                                    errors.inventoryType && styles.inputError,
                                    isLoading && styles.inputDisabled
                                ]}
                                onPress={() => !isLoading && setShowInventoryTypePicker(true)}
                                disabled={isLoading}>
                                {selectedInventoryType ? (
                                    <View style={styles.selectedInventoryTypeDisplay}>
                                        <View style={styles.selectedInventoryTypeIcon}>
                                            <FastImage
                                                source={icons[selectedInventoryType.icon] || icons.account}
                                                style={styles.selectedInventoryTypeIconImage}
                                                tintColor="#EF4444"
                                            />
                                        </View>
                                        <Text style={styles.selectedInventoryTypeName}>
                                            {selectedInventoryType.name}
                                        </Text>
                                    </View>
                                ) : (
                                    <Text style={styles.placeholderText}>
                                        Tap to select inventory type
                                    </Text>
                                )}
                                <FastImage
                                    source={icons.dropdown || icons.account}
                                    style={styles.dropdownIcon}
                                    tintColor="#6B7280"
                                />
                            </TouchableOpacity>
                            {errors.inventoryType && (
                                <Text style={styles.errorText}>{errors.inventoryType}</Text>
                            )}
                        </View>
                    ))}

                    {/* Dynamic Fields Based on Inventory Type */}
                    {selectedInventoryType && renderFormGroup(
                        `${selectedInventoryType.name} Details`,
                        renderInventoryTypeSpecificFields()
                    )}

                    {/* Submit Button */}
                    {selectedInventoryType && (
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                isLoading && styles.submitButtonDisabled
                            ]}
                            onPress={handleSubmit}
                            disabled={isLoading}>
                            <LinearGradient
                                colors={
                                    isLoading
                                        ? ['#9CA3AF', '#6B7280']
                                        : ['#EF4444', '#DC2626']
                                }
                                style={styles.submitGradient}>
                                <Text style={styles.submitText}>
                                    {isLoading ? 'Adding Item...' : `Add ${selectedInventoryType.name}`}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}

                    <View style={styles.bottomSpace} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Date Picker Modals */}
            {Object.keys(showDatePickers).map(dateField => (
                showDatePickers[dateField] && (
                    <DateTimePicker
                        key={dateField}
                        value={formData[dateField]}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => handleDateChange(dateField, event, selectedDate)}
                        maximumDate={dateField.includes('next') ? undefined : new Date()}
                    />
                )
            ))}

            {/* Inventory Type Picker Modal */}
            {renderInventoryTypePicker()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },

    // Form Groups
    formGroup: {
        marginBottom: 24,
    },
    groupTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    groupContainer: {
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 6,
    },

    // Input Styles
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    required: {
        color: '#EF4444',
    },
    textInput: {
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#1F2937',
        backgroundColor: '#FFFFFF',
        fontWeight: '500',
        textAlignVertical: 'top',
    },
    inputError: {
        borderColor: '#EF4444',
    },
    inputDisabled: {
        opacity: 0.6,
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
        fontWeight: '500',
    },

    // Inventory Type Selector
    inventoryTypeSelector: {
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 56,
    },
    selectedInventoryTypeDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    selectedInventoryTypeIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    selectedInventoryTypeIconImage: {
        width: 20,
        height: 20,
    },
    selectedInventoryTypeName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    placeholderText: {
        fontSize: 16,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    dropdownIcon: {
        width: 20,
        height: 20,
    },

    // Date Input
    dateInput: {
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 16,
        color: '#1F2937',
        fontWeight: '500',
    },
    calendarIcon: {
        width: 20,
        height: 20,
        tintColor: '#6B7280',
    },

    // Radio Group (for utility types)
    radioGroup: {
        flexDirection: 'column',
        gap: 12,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    radioOptionSelected: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#9CA3AF',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioCircleSelected: {
        borderColor: '#EF4444',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#EF4444',
    },
    radioText: {
        fontSize: 16,
        color: '#374151',
        fontWeight: '500',
    },
    radioTextSelected: {
        color: '#EF4444',
        fontWeight: '600',
    },

    // Submit Button
    submitButton: {
        marginTop: 20,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
    },
    submitButtonDisabled: {
        shadowOpacity: 0.1,
    },
    submitGradient: {
        paddingVertical: 18,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    submitText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '60%',
        minHeight: '40%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1F2937',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 24,
        color: '#6B7280',
        fontWeight: '600',
    },
    modalList: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },

    // Inventory Type Item Styles
    inventoryTypeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginBottom: 12,
        borderRadius: 16,
        backgroundColor: '#F8FAFC',
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    selectedInventoryTypeItem: {
        backgroundColor: '#FEF2F2',
        borderColor: '#EF4444',
    },
    inventoryTypeIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    inventoryTypeIconImage: {
        width: 24,
        height: 24,
    },
    inventoryTypeInfo: {
        flex: 1,
    },
    inventoryTypeName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
    },
    checkIcon: {
        width: 24,
        height: 24,
    },

    // Bottom spacing
    bottomSpace: {
        height: 40,
    },
});

export default AddInventory;