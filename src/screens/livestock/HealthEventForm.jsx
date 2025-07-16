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
            const livestockId = animalData.rawData._id || animalData.rawData.id || animalId;

            const validMedications = medications.filter(med => med.trim());

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

    const EventTypeCard = () => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <FastImage
                    source={icons.health}
                    style={styles.cardHeaderIcon}
                    tintColor={COLORS.green}
                />
                <Text style={styles.cardTitle}>Event Type</Text>
            </View>
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

    const BasicDetailsCard = () => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <FastImage
                    source={icons.calendar}
                    style={styles.cardHeaderIcon}
                    tintColor={COLORS.blue}
                />
                <Text style={styles.cardTitle}>Basic Details</Text>
            </View>

            <View style={styles.cardContent}>
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
            </View>
        </View>
    );

    const MedicationsCard = () => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <FastImage
                    source={icons.health}
                    style={styles.cardHeaderIcon}
                    tintColor={COLORS.orange}
                />
                <View style={styles.cardHeaderContent}>
                    <Text style={styles.cardTitle}>Medications & Dosage</Text>
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
            </View>

            <View style={styles.cardContent}>
                <Text style={styles.sectionSubtitle}>Medications Used</Text>
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
            </View>
        </View>
    );

    const CostAndScheduleCard = () => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <FastImage
                    source={icons.calendar}
                    style={styles.cardHeaderIcon}
                    tintColor={COLORS.purple}
                />
                <Text style={styles.cardTitle}>Cost & Scheduling</Text>
            </View>

            <View style={styles.cardContent}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Cost (KES)</Text>
                    <View style={styles.costInputContainer}>
                        <Text style={styles.currencySymbol}>KES</Text>
                        <TextInput
                            style={[styles.input, styles.costInput]}
                            placeholder="Enter cost"
                            value={cost}
                            onChangeText={setCost}
                            keyboardType="numeric"
                            placeholderTextColor="#999"
                        />
                    </View>
                </View>

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
                            <Text style={[
                                styles.dateText,
                                !nextScheduled && styles.placeholderText
                            ]}>
                                {nextScheduled ? nextScheduled.toLocaleDateString() : 'Select next vaccination date'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );


    return (
        <SafeAreaView style={styles.container}>
            <SecondaryHeader
                title="Health Record"
                subtitle="Record health events and treatments"
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.form}>
                    <EventTypeCard />
                    <BasicDetailsCard />
                    <MedicationsCard />
                    <CostAndScheduleCard />

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
        backgroundColor: '#f8f9fa',
    },
    content: {
        flex: 1,
    },
    form: {
        padding: 16,
    },

    animalInfoCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.green,
    },
    animalInfoContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    animalIcon: {
        width: 40,
        height: 40,
        marginRight: 12,
    },
    animalDetails: {
        flex: 1,
    },
    animalName: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.darkGray3,
        marginBottom: 2,
    },
    animalId: {
        fontSize: 14,
        color: COLORS.gray,
        fontWeight: '500',
    },

    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    cardHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
    },
    cardHeaderIcon: {
        width: 24,
        height: 24,
        marginRight: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.darkGray3,
        flex: 1,
    },
    cardContent: {
        padding: 16,
    },
    sectionSubtitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.gray,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    eventTypeButtons: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    eventTypeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#f8f9fa',
        borderWidth: 2,
        borderColor: '#e9ecef',
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

    // Input Styles
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
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#e9ecef',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: COLORS.black,
    },
    textArea: {
        minHeight: 80,
    },

    // Cost Input
    costInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#e9ecef',
        borderRadius: 12,
    },
    currencySymbol: {
        paddingLeft: 14,
        paddingRight: 8,
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.gray,
    },
    costInput: {
        flex: 1,
        backgroundColor: 'transparent',
        borderWidth: 0,
        paddingLeft: 0,
    },

    // Date Button
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#e9ecef',
        borderRadius: 12,
        padding: 14,
    },
    dateIcon: {
        width: 20,
        height: 20,
        marginRight: 12,
    },
    dateText: {
        fontSize: 16,
        color: COLORS.black,
        fontWeight: '500',
    },
    placeholderText: {
        color: '#999',
        fontWeight: '400',
    },

    // Medications
    addMedicationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#e8f5e8',
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
        marginBottom: 12,
    },
    medicationInput: {
        flex: 1,
        marginRight: 12,
    },
    removeMedicationButton: {
        padding: 10,
        backgroundColor: '#ffe6e6',
        borderRadius: 8,
    },
    removeMedicationIcon: {
        width: 16,
        height: 16,
    },

    // Submit Button
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.green,
        borderRadius: 16,
        padding: 18,
        marginTop: 20,
        marginBottom: 40,
        shadowColor: COLORS.green,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    submitButtonDisabled: {
        backgroundColor: COLORS.gray,
        shadowOpacity: 0.1,
    },
    submitIcon: {
        width: 20,
        height: 20,
        marginRight: 8,
    },
    submitText: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.white,
    },
});

export default HealthEventForm;