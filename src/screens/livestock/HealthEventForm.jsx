import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Alert,
    Platform,
    ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import FastImage from 'react-native-fast-image';
import { icons } from '../../constants';
import { COLORS } from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';
import { recordHealthEvent } from '../../services/livestock';

const HealthEventForm = ({ route, navigation }) => {
    const { animalId, animalData } = route.params;

    // Form state
    const [eventType, setEventType] = useState('vaccination');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [description, setDescription] = useState('');
    const [performedBy, setPerformedBy] = useState('');
    const [medications, setMedications] = useState(['']);
    const [dosage, setDosage] = useState('');
    const [cost, setCost] = useState('');
    const [nextScheduled, setNextScheduled] = useState(null);
    const [showNextScheduledPicker, setShowNextScheduledPicker] = useState(false);
    const [loading, setLoading] = useState(false);

    // Pre-fill some common descriptions based on event type
    const getDefaultDescription = (type) => {
        if (type === 'vaccination') {
            return 'Routine vaccination';
        } else {
            return 'Treatment for health condition';
        }
    };

    useEffect(() => {
        setDescription(getDefaultDescription(eventType));
    }, [eventType]);

    const handleAddMedication = () => {
        setMedications([...medications, '']);
    };

    const handleRemoveMedication = (index) => {
        if (medications.length > 1) {
            const newMedications = medications.filter((_, i) => i !== index);
            setMedications(newMedications);
        }
    };

    const handleMedicationChange = (index, value) => {
        const newMedications = [...medications];
        newMedications[index] = value;
        setMedications(newMedications);
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const handleNextScheduledChange = (event, selectedDate) => {
        setShowNextScheduledPicker(false);
        if (selectedDate) {
            setNextScheduled(selectedDate);
        }
    };

    const validateForm = () => {
        if (!description.trim()) {
            Alert.alert('Validation Error', 'Please enter a description');
            return false;
        }

        if (!performedBy.trim()) {
            Alert.alert('Validation Error', 'Please enter who performed the procedure');
            return false;
        }

        const validMedications = medications.filter(med => med.trim());
        if (validMedications.length === 0) {
            Alert.alert('Validation Error', 'Please enter at least one medication');
            return false;
        }

        if (!dosage.trim()) {
            Alert.alert('Validation Error', 'Please enter the dosage information');
            return false;
        }

        if (!cost.trim() || isNaN(parseFloat(cost))) {
            Alert.alert('Validation Error', 'Please enter a valid cost');
            return false;
        }

        if (eventType === 'vaccination' && !nextScheduled) {
            Alert.alert('Validation Error', 'Please set the next scheduled vaccination date');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // Get the actual livestock ID from the animal data
            const livestockId = animalData.rawData._id || animalData.rawData.id || animalId;

            // Filter out empty medications
            const validMedications = medications.filter(med => med.trim());

            // Prepare the payload
            const healthEventData = {
                livestockId,
                eventType,
                date: date.toISOString(),
                description: description.trim(),
                performedBy: performedBy.trim(),
                medications: validMedications,
                dosage: dosage.trim(),
                cost: parseFloat(cost),
                ...(eventType === 'vaccination' && nextScheduled && {
                    nextScheduled: nextScheduled.toISOString()
                })
            };

            console.log('Health Event Payload:', JSON.stringify(healthEventData, null, 2));

            const { data, error } = await recordHealthEvent(healthEventData);

            if (error) {
                Alert.alert('Error', error);
                return;
            }

            Alert.alert(
                'Success',
                `${eventType === 'vaccination' ? 'Vaccination' : 'Treatment'} record saved successfully`,
                [
                    {
                        text: 'View History',
                        onPress: () => {
                            navigation.replace('HealthHistoryScreen', {
                                animalId,
                                animalData
                            });
                        }
                    },
                    {
                        text: 'Add Another',
                        onPress: () => {
                            // Reset form for another entry
                            setEventType('vaccination');
                            setDate(new Date());
                            setDescription(getDefaultDescription('vaccination'));
                            setPerformedBy('');
                            setMedications(['']);
                            setDosage('');
                            setCost('');
                            setNextScheduled(null);
                        }
                    },
                    {
                        text: 'Go Back',
                        onPress: () => navigation.goBack(),
                        style: 'cancel'
                    }
                ]
            );

        } catch (error) {
            console.error('Error recording health event:', error);
            Alert.alert('Error', 'Failed to save health record. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const EventTypeSelector = () => (
        <View style={styles.eventTypeContainer}>
            <Text style={styles.label}>Event Type</Text>
            <View style={styles.eventTypeButtons}>
                <TouchableOpacity
                    style={[
                        styles.eventTypeButton,
                        eventType === 'vaccination' && styles.selectedEventType
                    ]}
                    onPress={() => setEventType('vaccination')}>
                    <FastImage
                        source={icons.health}
                        style={[
                            styles.eventTypeIcon,
                            { tintColor: eventType === 'vaccination' ? COLORS.white : COLORS.green }
                        ]}
                    />
                    <Text style={[
                        styles.eventTypeText,
                        eventType === 'vaccination' && styles.selectedEventTypeText
                    ]}>
                        Vaccination
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.eventTypeButton,
                        eventType === 'treatment' && styles.selectedEventType
                    ]}
                    onPress={() => setEventType('treatment')}>
                    <FastImage
                        source={icons.health}
                        style={[
                            styles.eventTypeIcon,
                            { tintColor: eventType === 'treatment' ? COLORS.white : COLORS.blue }
                        ]}
                    />
                    <Text style={[
                        styles.eventTypeText,
                        eventType === 'treatment' && styles.selectedEventTypeText
                    ]}>
                        Treatment
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const MedicationsList = () => (
        <View style={styles.medicationsContainer}>
            <View style={styles.medicationsHeader}>
                <Text style={styles.label}>Medications Used</Text>
                <TouchableOpacity
                    onPress={handleAddMedication}
                    style={styles.addMedicationButton}>
                    <FastImage
                        source={icons.plus}
                        style={styles.addMedicationIcon}
                        tintColor={COLORS.green}
                    />
                    <Text style={styles.addMedicationText}>Add</Text>
                </TouchableOpacity>
            </View>

            {medications.map((medication, index) => (
                <View key={index} style={styles.medicationRow}>
                    <TextInput
                        style={[styles.input, styles.medicationInput]}
                        placeholder={`Medication ${index + 1}`}
                        value={medication}
                        onChangeText={(value) => handleMedicationChange(index, value)}
                        placeholderTextColor="#999"
                    />
                    {medications.length > 1 && (
                        <TouchableOpacity
                            onPress={() => handleRemoveMedication(index)}
                            style={styles.removeMedicationButton}>
                            <FastImage
                                source={icons.remove}
                                style={styles.removeMedicationIcon}
                                tintColor={COLORS.red}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            ))}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <SecondaryHeader
                title="Health Record"
                subtitle={`${animalData?.title} (ID: ${animalData?.id})`}
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.form}>
                    <EventTypeSelector />

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Date of Procedure</Text>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowDatePicker(true)}>
                            <FastImage
                                source={icons.calendar}
                                style={styles.dateIcon}
                                tintColor={COLORS.gray}
                            />
                            <Text style={styles.dateText}>
                                {date.toLocaleDateString()}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Description */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder={`Enter ${eventType} description...`}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Performed By */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Performed By</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Dr. John Smith (Veterinarian)"
                            value={performedBy}
                            onChangeText={setPerformedBy}
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Medications */}
                    <MedicationsList />

                    {/* Dosage */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Dosage Instructions</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder={eventType === 'vaccination'
                                ? "e.g., 10ml subcutaneous injection"
                                : "e.g., 5ml twice daily for 5 days"
                            }
                            value={dosage}
                            onChangeText={setDosage}
                            multiline
                            numberOfLines={2}
                            textAlignVertical="top"
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Cost */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Cost (KES)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter cost in KES"
                            value={cost}
                            onChangeText={setCost}
                            keyboardType="numeric"
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Next Scheduled (only for vaccinations) */}
                    {eventType === 'vaccination' && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Next Scheduled Vaccination</Text>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowNextScheduledPicker(true)}>
                                <FastImage
                                    source={icons.calendar}
                                    style={styles.dateIcon}
                                    tintColor={COLORS.gray}
                                />
                                <Text style={styles.dateText}>
                                    {nextScheduled ? nextScheduled.toLocaleDateString() : 'Select date'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} size="small" />
                        ) : (
                            <>
                                <FastImage
                                    source={icons.check}
                                    style={styles.submitIcon}
                                    tintColor={COLORS.white}
                                />
                                <Text style={styles.submitText}>
                                    Save {eventType === 'vaccination' ? 'Vaccination' : 'Treatment'} Record
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Date Pickers */}
            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                />
            )}

            {showNextScheduledPicker && (
                <DateTimePicker
                    value={nextScheduled || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleNextScheduledChange}
                    minimumDate={new Date()}
                />
            )}
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
    },
    form: {
        padding: 16,
    },
    eventTypeContainer: {
        marginBottom: 24,
    },
    eventTypeButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    eventTypeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        backgroundColor: COLORS.white,
        borderWidth: 2,
        borderColor: COLORS.lightGray2,
    },
    selectedEventType: {
        backgroundColor: COLORS.green,
        borderColor: COLORS.green,
    },
    eventTypeIcon: {
        width: 20,
        height: 20,
        marginRight: 8,
    },
    eventTypeText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.darkGray3,
    },
    selectedEventTypeText: {
        color: COLORS.white,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.darkGray3,
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
    textArea: {
        minHeight: 80,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.lightGray2,
        borderRadius: 8,
        padding: 12,
    },
    dateIcon: {
        width: 20,
        height: 20,
        marginRight: 12,
    },
    dateText: {
        fontSize: 16,
        color: COLORS.black,
    },
    medicationsContainer: {
        marginBottom: 20,
    },
    medicationsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    addMedicationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: COLORS.lightGreen,
    },
    addMedicationIcon: {
        width: 16,
        height: 16,
        marginRight: 4,
    },
    addMedicationText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.green,
    },
    medicationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    medicationInput: {
        flex: 1,
        marginRight: 8,
    },
    removeMedicationButton: {
        padding: 8,
        backgroundColor: COLORS.lightRed,
        borderRadius: 6,
    },
    removeMedicationIcon: {
        width: 16,
        height: 16,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.green,
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
        marginBottom: 40,
    },
    submitButtonDisabled: {
        backgroundColor: COLORS.gray,
    },
    submitIcon: {
        width: 20,
        height: 20,
        marginRight: 8,
    },
    submitText: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.white,
    },
});

export default HealthEventForm;