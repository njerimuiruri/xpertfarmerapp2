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
} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { icons } from '../../../constants';
import { COLORS } from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';
import { getAllergyById, updateAllergy, validateAllergyData } from '../../../services/healthservice';

const { width } = Dimensions.get('window');

const EditAllergyRecord = ({ navigation, route }) => {
    // Add safety checks for route params
    const { recordId, animalId, animalData } = route?.params || {};

    // Add early return or error handling if required params are missing
    if (!recordId || !animalId) {
        Alert.alert('Error', 'Record ID and Animal ID are required to edit allergy records.', [
            { text: 'OK', onPress: () => navigation.goBack() }
        ]);
        return (
            <SafeAreaView style={styles.container}>
                <SecondaryHeader
                    title="Edit Allergy Record"
                    showBack={true}
                    onBack={() => navigation.goBack()}
                />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Missing required information</Text>
                </View>
            </SafeAreaView>
        );
    }

    const [formData, setFormData] = useState({
        animalIdOrFlockId: animalId,
        dateRecorded: new Date(),
        cause: '',
        remedy: '',
        farmId: '',
        livestockId: animalId,
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingRecord, setIsLoadingRecord] = useState(true);

    // Load existing allergy record on component mount
    useEffect(() => {
        loadAllergyRecord();
    }, [recordId]);

    const loadAllergyRecord = async () => {
        setIsLoadingRecord(true);
        try {
            const result = await getAllergyById(recordId);

            if (result.error) {
                Alert.alert('Error', result.error, [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
                return;
            }

            const allergyData = result.data?.data || result.data;

            if (allergyData) {
                setFormData({
                    animalIdOrFlockId: allergyData.animalIdOrFlockId || animalId,
                    dateRecorded: new Date(allergyData.dateRecorded),
                    cause: allergyData.cause || '',
                    remedy: allergyData.remedy || '',
                    farmId: allergyData.farmId || '',
                    livestockId: allergyData.livestockId || animalId,
                });
            }
        } catch (error) {
            console.error('Error loading allergy record:', error);
            Alert.alert('Error', 'Failed to load allergy record. Please try again.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } finally {
            setIsLoadingRecord(false);
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
            setFormData(prev => ({ ...prev, dateRecorded: selectedDate }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.cause.trim()) {
            newErrors.cause = 'Please specify the cause of the allergy';
        }

        if (!formData.remedy.trim()) {
            newErrors.remedy = 'Please enter the remedy or treatment';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
            return;
        }

        const validation = validateAllergyData({
            cause: formData.cause,
            remedy: formData.remedy,
            dateRecorded: formData.dateRecorded,
        });

        if (!validation.isValid) {
            Alert.alert('Validation Error', validation.errors.join('\n'));
            return;
        }

        setIsLoading(true);

        try {
            // Prepare payload with ISO date string
            const payload = {
                ...formData,
                dateRecorded: formData.dateRecorded.toISOString(),
                cause: formData.cause.trim(),
                remedy: formData.remedy.trim(),
            };

            console.log('Update allergy payload:', payload);

            // Call the actual API service
            const result = await updateAllergy(recordId, payload);

            if (result.error) {
                Alert.alert('Error', result.error);
                return;
            }

            Alert.alert(
                'Success',
                'Allergy record has been updated successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to update allergy record. Please try again.');
            console.error('Error updating allergy:', error);
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
                style={[
                    styles.textInput,
                    options.multiline && styles.textArea,
                    errors[field] && styles.inputError
                ]}
                value={formData[field]?.toString()}
                onChangeText={(value) => handleInputChange(field, value)}
                placeholder={options.placeholder || `Enter ${label.toLowerCase()}`}
                keyboardType={options.keyboardType || 'default'}
                multiline={options.multiline}
                numberOfLines={options.numberOfLines || 1}
                placeholderTextColor="#9CA3AF"
                textAlignVertical={options.multiline ? 'top' : 'center'}
                editable={!isLoading && !isLoadingRecord}
            />
            {errors[field] && (
                <Text style={styles.errorText}>{errors[field]}</Text>
            )}
        </View>
    );

    // Show loading state while fetching record
    if (isLoadingRecord) {
        return (
            <SafeAreaView style={styles.container}>
                <SecondaryHeader
                    title="Edit Allergy Record"
                    showBack={true}
                    onBack={() => navigation.goBack()}
                />
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading allergy record...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <SecondaryHeader
                title="Edit Allergy Record"
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

                    {/* Animal Info Header */}
                    <LinearGradient
                        colors={['#FFFFFF', '#F8FAFC']}
                        style={styles.animalInfoCard}>
                        <View style={styles.animalCardHeader}>
                            <LinearGradient
                                colors={['#2196F3', '#1976D2']}
                                style={styles.animalAvatarContainer}>
                                <FastImage
                                    source={icons.livestock || icons.account}
                                    style={styles.animalAvatar}
                                    tintColor="#FFFFFF"
                                />
                            </LinearGradient>
                            <View style={styles.animalInfo}>
                                <Text style={styles.animalName}>{animalData?.title || 'Animal'}</Text>
                                <Text style={styles.animalId}>ID: {animalData?.idNumber || animalId}</Text>
                                <Text style={styles.recordId}>Record ID: {recordId}</Text>
                            </View>
                            <View style={styles.editIconContainer}>
                                <Text style={styles.editIcon}>✏️</Text>
                            </View>
                        </View>
                    </LinearGradient>

                    {renderFormGroup('Allergy Details', (
                        <>
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>
                                    Date Recorded <Text style={styles.required}>*</Text>
                                </Text>
                                <TouchableOpacity
                                    style={[styles.dateInput, (isLoading || isLoadingRecord) && styles.inputDisabled]}
                                    onPress={() => !isLoading && !isLoadingRecord && setShowDatePicker(true)}
                                    disabled={isLoading || isLoadingRecord}>
                                    <Text style={styles.dateText}>
                                        {formData.dateRecorded.toLocaleDateString()}
                                    </Text>
                                    <FastImage source={icons.calendar} style={styles.calendarIcon} />
                                </TouchableOpacity>
                            </View>

                            {renderInput('Cause of Allergy', 'cause', {
                                required: true,
                                placeholder: 'e.g., Pollen, Dust, Food allergen, Medication',
                                multiline: true,
                                numberOfLines: 3
                            })}

                            {renderInput('Remedy/Treatment', 'remedy', {
                                required: true,
                                placeholder: 'e.g., Antihistamines, Corticosteroids, Avoid allergen',
                                multiline: true,
                                numberOfLines: 4
                            })}
                        </>
                    ))}

                    {/* Additional Notes Section */}
                    <View style={styles.notesSection}>
                        <LinearGradient
                            colors={['#E3F2FD', '#BBDEFB']}
                            style={styles.notesCard}>
                            <View style={styles.notesHeader}>
                                <Text style={styles.notesIcon}>💡</Text>
                                <Text style={styles.notesTitle}>Editing Tips</Text>
                            </View>
                            <Text style={styles.notesText}>
                                • Update the information as needed{'\n'}
                                • Be specific about any changes in allergen or treatment{'\n'}
                                • Record date can be modified if the original date was incorrect{'\n'}
                                • All changes will be saved when you tap "Update Record"
                            </Text>
                        </LinearGradient>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, (isLoading || isLoadingRecord) && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={isLoading || isLoadingRecord}>
                        <LinearGradient
                            colors={(isLoading || isLoadingRecord) ? ['#9CA3AF', '#6B7280'] : ['#2196F3', '#1976D2']}
                            style={styles.submitGradient}>
                            <Text style={styles.submitText}>
                                {isLoading ? 'Updating Record...' : 'Update Allergy Record'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.bottomSpace} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Date Picker Modal */}
            {showDatePicker && (
                <DateTimePicker
                    value={formData.dateRecorded}
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

    // Error container for missing params
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#EF4444',
        textAlign: 'center',
    },

    // Loading container
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
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
    },
    recordId: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '400',
        marginTop: 2,
    },
    editIconContainer: {
        width: 40,
        height: 40,
        backgroundColor: '#E3F2FD',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editIcon: {
        fontSize: 20,
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
    textArea: {
        minHeight: 80,
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

    // Notes Section
    notesSection: {
        marginBottom: 24,
    },
    notesCard: {
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#90CAF9',
    },
    notesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    notesIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    notesTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1565C0',
    },
    notesText: {
        fontSize: 14,
        color: '#0D47A1',
        lineHeight: 20,
        fontWeight: '500',
    },

    // Submit Button
    submitButton: {
        marginTop: 20,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#2196F3',
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

    bottomSpace: {
        height: 40,
    },
});

export default EditAllergyRecord;