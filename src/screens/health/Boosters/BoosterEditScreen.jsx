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
    ActivityIndicator,
} from 'react-native';
import {
    useToast
} from 'native-base';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { icons } from '../../../constants';
import { COLORS } from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';
import {
    getBoosterById,
    updateBooster,
    validateBoosterData
} from '../../../services/healthservice';
import { getLivestockForActiveFarm } from '../../../services/livestock';

const { width } = Dimensions.get('window');

const BoosterEditScreen = ({ navigation, route }) => {
    const { recordId, recordData } = route.params;
    const toast = useToast();

    // Form state
    const [formData, setFormData] = useState({
        animalIdOrFlockId: '',
        boostersOrAdditives: '',
        purpose: '',
        quantityGiven: '',
        quantityUnit: '',
        dateAdministered: new Date(),
        costOfBooster: '',
        livestockId: '',
    });

    const [livestock, setLivestock] = useState([]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [originalData, setOriginalData] = useState(null);

    useEffect(() => {
        Promise.all([fetchBoosterData(), loadLivestock()]);
    }, [recordId]);

    const loadLivestock = async () => {
        try {
            const result = await getLivestockForActiveFarm();
            if (Array.isArray(result)) {
                setLivestock(result);
            } else {
                setLivestock([]);
            }
        } catch (error) {
            console.error('Failed to load livestock:', error);
            setLivestock([]);
        }
    };

    const getAnimalInfo = (animalId) => {
        return livestock.find(animal => animal.id === animalId);
    };

    const formatAnimalDisplayName = (animal) => {
        if (!animal) return 'Unknown Animal';

        if (animal.category === 'poultry' && animal.poultry) {
            return `${animal.type.toUpperCase()} - Flock ID: ${animal.poultry.flockId || 'N/A'}`;
        } else if (animal.category === 'mammal' && animal.mammal) {
            return `${animal.type.toUpperCase()} - ID: ${animal.mammal.idNumber || 'N/A'}`;
        }
        return `${animal.type.toUpperCase()} - ID: ${animal.id}`;
    };

    const fetchBoosterData = async () => {
        try {
            setIsLoadingData(true);
            const result = await getBoosterById(recordId);

            if (result.error) {
                Alert.alert('Error', result.error);
                navigation.goBack();
                return;
            }

            const boosterData = result.data;
            setOriginalData(boosterData);

            setFormData({
                animalIdOrFlockId: boosterData.animalIdOrFlockId || '',
                boostersOrAdditives: boosterData.boostersOrAdditives || '',
                purpose: boosterData.purpose || '',
                quantityGiven: boosterData.quantityGiven?.toString() || '',
                quantityUnit: boosterData.quantityUnit || '',
                dateAdministered: boosterData.dateAdministered
                    ? new Date(boosterData.dateAdministered)
                    : new Date(),
                costOfBooster: boosterData.costOfBooster?.toString() || '',
                livestockId: boosterData.livestockId || '',
            });

            console.log('Fetched booster data:', boosterData);
        } catch (error) {
            console.error('Error fetching booster data:', error);
            Alert.alert('Error', 'Failed to load booster data. Please try again.');
            navigation.goBack();
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setFormData(prev => ({ ...prev, dateAdministered: selectedDate }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.boostersOrAdditives.trim()) {
            newErrors.boostersOrAdditives = 'Please enter the booster/additive name';
        }

        if (!formData.purpose.trim()) {
            newErrors.purpose = 'Please enter the purpose';
        }

        if (!formData.quantityGiven || isNaN(parseFloat(formData.quantityGiven)) || parseFloat(formData.quantityGiven) <= 0) {
            newErrors.quantityGiven = 'Please enter a valid quantity greater than 0';
        }

        if (!formData.quantityUnit.trim()) {
            newErrors.quantityUnit = 'Please enter the quantity unit';
        }

        if (formData.costOfBooster && (isNaN(parseFloat(formData.costOfBooster)) || parseFloat(formData.costOfBooster) < 0)) {
            newErrors.costOfBooster = 'Please enter a valid cost (cannot be negative)';
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
            const payload = {
                animalIdOrFlockId: formData.animalIdOrFlockId,
                boostersOrAdditives: formData.boostersOrAdditives.trim(),
                purpose: formData.purpose.trim(),
                quantityGiven: parseFloat(formData.quantityGiven),
                quantityUnit: formData.quantityUnit.trim(),
                dateAdministered: formData.dateAdministered.toISOString(),
                costOfBooster: formData.costOfBooster ? parseFloat(formData.costOfBooster) : 0,
                livestockId: formData.livestockId,
            };

            const validation = validateBoosterData(payload);
            if (!validation.isValid) {
                Alert.alert('Validation Error', validation.errors.join('\n'));
                return;
            }

            console.log('Updating booster with payload:', payload);

            const result = await updateBooster(recordId, payload);

            if (result.error) {
                Alert.alert('Error', result.error);
                return;
            }

            toast.show({
                title: 'Success',
                description: 'Booster record has been updated successfully!',
                status: 'success',
                placement: 'top',
                duration: 3000,
                backgroundColor: COLORS.green2,
                color: COLORS.white,
            });
            navigation.goBack();
        } catch (error) {
            console.error('Error updating booster:', error);
            Alert.alert(
                'Error',
                'An unexpected error occurred. Please check your connection and try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        Alert.alert(
            'Reset Form',
            'Are you sure you want to reset all changes? This will restore the original values.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: () => {
                        if (originalData) {
                            setFormData({
                                animalIdOrFlockId: originalData.animalIdOrFlockId || '',
                                boostersOrAdditives: originalData.boostersOrAdditives || '',
                                purpose: originalData.purpose || '',
                                quantityGiven: originalData.quantityGiven?.toString() || '',
                                quantityUnit: originalData.quantityUnit || '',
                                dateAdministered: originalData.dateAdministered
                                    ? new Date(originalData.dateAdministered)
                                    : new Date(),
                                costOfBooster: originalData.costOfBooster?.toString() || '',
                                livestockId: originalData.livestockId || '',
                            });
                            setErrors({});
                        }
                    },
                },
            ]
        );
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
                editable={!isLoading && !isLoadingData}
            />
            {errors[field] && (
                <Text style={styles.errorText}>{errors[field]}</Text>
            )}
        </View>
    );

    if (isLoadingData) {
        return (
            <SafeAreaView style={styles.container}>
                <SecondaryHeader
                    title="Edit Booster Record"
                    showBack={true}
                    onBack={() => navigation.goBack()}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#10B981" />
                    <Text style={styles.loadingText}>Loading booster data...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Get the animal info
    const animal = getAnimalInfo(formData.livestockId);

    return (
        <SafeAreaView style={styles.container}>
            <SecondaryHeader
                title="Edit Booster Record"
                showBack={true}
                onBack={() => navigation.goBack()}
                rightComponent={
                    <TouchableOpacity onPress={handleReset} disabled={isLoading}>
                        <FastImage
                            source={icons.refresh || icons.reload}
                            style={[styles.resetIcon, isLoading && styles.iconDisabled]}
                            tintColor="#6B7280"
                        />
                    </TouchableOpacity>
                }
            />

            <KeyboardAvoidingView
                style={styles.keyboardAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}>

                    <LinearGradient
                        colors={['#FFFFFF', '#F8FAFC']}
                        style={styles.animalInfoCard}>
                        <View style={styles.animalCardHeader}>
                            <LinearGradient
                                colors={['#10B981', '#059669']}
                                style={styles.animalAvatarContainer}>
                                <FastImage
                                    source={icons.livestock || icons.account}
                                    style={styles.animalAvatar}
                                    tintColor="#FFFFFF"
                                />
                            </LinearGradient>
                            <View style={styles.animalInfo}>
                                <Text style={styles.animalName}>{formatAnimalDisplayName(animal)}</Text>
                                <Text style={styles.animalId}>
                                    ID: {animal?.mammal?.idNumber || animal?.poultry?.flockId || animal?.id || 'N/A'}
                                </Text>
                            </View>
                        </View>
                    </LinearGradient>

                    {renderFormGroup('Booster Information', (
                        <>
                            {renderInput('Booster/Additive Name', 'boostersOrAdditives', {
                                required: true,
                                placeholder: 'e.g., Vitamin B12, Iron supplement, etc.'
                            })}
                            {renderInput('Purpose', 'purpose', {
                                required: true,
                                placeholder: 'e.g., Growth promotion, Health maintenance, etc.',
                                multiline: true,
                                numberOfLines: 2
                            })}
                        </>
                    ))}

                    {renderFormGroup('Dosage Details', (
                        <>
                            {renderInput('Quantity Given', 'quantityGiven', {
                                required: true,
                                placeholder: '10.5',
                                keyboardType: 'numeric'
                            })}
                            {renderInput('Quantity Unit', 'quantityUnit', {
                                required: true,
                                placeholder: 'e.g., ml, mg, tablets, etc.'
                            })}
                        </>
                    ))}

                    {renderFormGroup('Administration Details', (
                        <>
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>
                                    Date Administered <Text style={styles.required}>*</Text>
                                </Text>
                                <TouchableOpacity
                                    style={[styles.dateInput, (isLoading || isLoadingData) && styles.inputDisabled]}
                                    onPress={() => !isLoading && !isLoadingData && setShowDatePicker(true)}
                                    disabled={isLoading || isLoadingData}>
                                    <Text style={styles.dateText}>
                                        {formData.dateAdministered.toLocaleDateString()}
                                    </Text>
                                    <FastImage source={icons.calendar} style={styles.calendarIcon} />
                                </TouchableOpacity>
                            </View>
                        </>
                    ))}

                    {/* Cost Information */}
                    {renderFormGroup('Cost Information (Optional)', (
                        <>
                            {renderInput('Cost of Booster', 'costOfBooster', {
                                keyboardType: 'numeric',
                                placeholder: '50.25'
                            })}
                        </>
                    ))}

                    {/* Action Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.cancelButton, isLoading && styles.buttonDisabled]}
                            onPress={() => navigation.goBack()}
                            disabled={isLoading}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={isLoading}>
                            <LinearGradient
                                colors={isLoading ? ['#9CA3AF', '#6B7280'] : ['#10B981', '#059669']}
                                style={styles.submitGradient}>
                                <Text style={styles.submitText}>
                                    {isLoading ? 'Updating...' : 'Update Record'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.bottomSpace} />
                </ScrollView>
            </KeyboardAvoidingView>

            {showDatePicker && (
                <DateTimePicker
                    value={formData.dateAdministered}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                />
            )}
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

    // Loading State
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
    },

    // Header Icons
    resetIcon: {
        width: 24,
        height: 24,
    },
    iconDisabled: {
        opacity: 0.5,
    },

    // Animal Info Card
    animalInfoCard: {
        borderRadius: 24,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 8,
    },
    animalCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    animalAvatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    animalAvatar: {
        width: 28,
        height: 28,
    },
    animalInfo: {
        flex: 1,
    },
    animalName: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 4,
    },
    animalId: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
        marginBottom: 8,
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

    // Button Container
    buttonContainer: {
        flexDirection: 'row',
        marginTop: 20,
        gap: 12,
    },

    // Cancel Button
    cancelButton: {
        flex: 1,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },

    // Submit Button
    submitButton: {
        flex: 2,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#10B981',
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
        fontSize: 16,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },

    buttonDisabled: {
        opacity: 0.6,
    },
    bottomSpace: {
        height: 40,
    },
});

export default BoosterEditScreen;