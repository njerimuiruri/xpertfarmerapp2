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
    Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import FastImage from 'react-native-fast-image';
import { icons } from '../../constants';
import { COLORS } from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';
import { recordLivestockMortality, updateLivestockStatus } from '../../services/livestock';

const MortalityForm = ({ route, navigation }) => {
    const { animalId, animalData } = route.params;

    const [selectedCause, setSelectedCause] = useState('');
    const [description, setDescription] = useState('');
    const [reportedBy, setReportedBy] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(false);

    const causeOptions = [
        {
            id: 'disease',
            label: 'Disease',
            description: 'Death caused by illness or disease',
            icon: '🦠',
            color: COLORS.red,
            placeholderText: 'Describe the disease symptoms, progression, and any treatments attempted...',
        },
        {
            id: 'accident',
            label: 'Accident',
            description: 'Death caused by accidental injury',
            icon: '⚠️',
            color: COLORS.orange,
            placeholderText: 'Describe the accident, how it occurred, and any immediate actions taken...',
        },
        {
            id: 'natural',
            label: 'Natural Causes',
            description: 'Death due to old age or natural causes',
            icon: '🕊️',
            color: COLORS.blue,
            placeholderText: 'Provide details about the natural causes and any observations...',
        },
        {
            id: 'predator',
            label: 'Predator Attack',
            description: 'Death caused by predator attack',
            icon: '🐺',
            color: COLORS.darkRed,
            placeholderText: 'Describe the predator attack, evidence found, and preventive measures needed...',
        },
        {
            id: 'poisoning',
            label: 'Poisoning',
            description: 'Death caused by toxic substances',
            icon: '☠️',
            color: COLORS.purple,
            placeholderText: 'Describe suspected poison source, symptoms observed, and timeline...',
        },
        {
            id: 'other',
            label: 'Other',
            description: 'Other cause not listed above',
            icon: '❓',
            color: COLORS.gray,
            placeholderText: 'Please provide detailed explanation of the cause of death...',
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

    useEffect(() => {
        const initializeReportedBy = async () => {
            try {
                const AsyncStorage = require('@react-native-async-storage/async-storage').default;
                const userRaw = await AsyncStorage.getItem('user');
                const user = JSON.parse(userRaw || '{}');

                if (user?.firstName && user?.lastName) {
                    setReportedBy(`${user.firstName} ${user.lastName} (Farm Manager)`);
                }
            } catch (error) {
                console.error('Error getting user info:', error);
            }
        };

        initializeReportedBy();
    }, []);

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
    };

    const handleAddNote = () => {
        Alert.prompt(
            'Add Note',
            'Add a note or observation about this mortality:',
            (text) => {
                if (text && text.trim()) {
                    const note = {
                        id: Date.now().toString(),
                        text: text.trim(),
                        timestamp: new Date().toLocaleString(),
                    };
                    setAttachments(prev => [...prev, note]);
                }
            },
            'plain-text'
        );
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!selectedCause) {
            Alert.alert('Error', 'Please select a cause of death');
            return;
        }

        if (!description.trim()) {
            Alert.alert('Error', 'Please provide a description of the incident');
            return;
        }

        if (!reportedBy.trim()) {
            Alert.alert('Error', 'Please specify who is reporting this mortality');
            return;
        }

        const livestockId = getLivestockId();
        if (!livestockId) {
            Alert.alert('Error', 'Unable to identify the animal. Please try again.');
            return;
        }

        setLoading(true);

        try {
            const mortalityData = {
                livestockId,
                date: date.toISOString(),
                cause: selectedCause.charAt(0).toUpperCase() + selectedCause.slice(1),
                description: description.trim(),
                reportedBy: reportedBy.trim(),
                attachments: attachments,
            };

            console.log('Recording mortality with data:', mortalityData);

            const { data: mortalityResult, error: mortalityError } = await recordLivestockMortality(mortalityData);

            if (mortalityError) {
                Alert.alert('Error', mortalityError);
                return;
            }

            const { data: statusResult, error: statusError } = await updateLivestockStatus(
                livestockId,
                'deceased',
                `Death recorded: ${selectedCause.charAt(0).toUpperCase() + selectedCause.slice(1)}`
            );

            if (statusError) {
                console.warn('Status update failed:', statusError);
            }

            Alert.alert(
                'Mortality Recorded',
                'The animal mortality has been successfully recorded and the status has been updated.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            navigation.navigate('LivestockModuleScreen');
                        },
                    },
                ]
            );

        } catch (error) {
            console.error('Error recording mortality:', error);
            Alert.alert('Error', 'Failed to record mortality. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderCauseOption = (option) => {
        const isSelected = selectedCause === option.id;

        return (
            <TouchableOpacity
                key={option.id}
                style={[
                    styles.causeOption,
                    isSelected && styles.selectedCauseOption,
                    { borderColor: option.color }
                ]}
                onPress={() => setSelectedCause(option.id)}
            >
                <View style={styles.causeOptionHeader}>
                    <Text style={styles.causeIcon}>{option.icon}</Text>
                    <View style={styles.causeOptionContent}>
                        <Text style={[styles.causeOptionLabel, isSelected && styles.selectedCauseLabel]}>
                            {option.label}
                        </Text>
                        <Text style={styles.causeOptionDescription}>
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

    const renderNote = (note, index) => {
        return (
            <View key={note.id || index} style={styles.noteItem}>
                <View style={styles.noteHeader}>
                    <Text style={styles.noteIcon}>📝</Text>
                    <Text style={styles.noteTimestamp}>{note.timestamp}</Text>
                    <TouchableOpacity
                        style={styles.removeNoteButton}
                        onPress={() => removeAttachment(index)}
                    >
                        <Text style={styles.removeNoteText}>✕</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.noteText}>{note.text}</Text>
            </View>
        );
    };

    const selectedCauseOption = causeOptions.find(option => option.id === selectedCause);

    return (
        <SafeAreaView style={styles.container}>
            <SecondaryHeader title="Record Mortality" />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Date of Death <Text style={styles.required}>*</Text></Text>
                    <Text style={styles.sectionDescription}>When did the mortality occur?</Text>

                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text style={styles.dateButtonText}>
                            📅 {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={date}
                            mode="datetime"
                            is24Hour={false}
                            display="default"
                            onChange={onDateChange}
                            maximumDate={new Date()}
                        />
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cause of Death <Text style={styles.required}>*</Text></Text>
                    <Text style={styles.sectionDescription}>
                        Select the primary cause of the animal's death
                    </Text>

                    <View style={styles.causeOptionsContainer}>
                        {causeOptions.map(renderCauseOption)}
                    </View>
                </View>

                {selectedCauseOption && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description <Text style={styles.required}>*</Text></Text>
                        <Text style={styles.sectionDescription}>
                            Provide detailed information about the circumstances of death
                        </Text>

                        <TextInput
                            style={styles.descriptionInput}
                            placeholder={selectedCauseOption.placeholderText}
                            placeholderTextColor="#999"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={5}
                            textAlignVertical="top"
                        />
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reported By <Text style={styles.required}>*</Text></Text>
                    <Text style={styles.sectionDescription}>
                        Who is reporting this mortality?
                    </Text>

                    <TextInput
                        style={styles.textInput}
                        placeholder="e.g., John Doe (Farm Manager)"
                        placeholderTextColor="#999"
                        value={reportedBy}
                        onChangeText={setReportedBy}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
                    <Text style={styles.sectionDescription}>
                        Add any additional observations or notes about this mortality
                    </Text>

                    <TouchableOpacity
                        style={styles.attachmentButton}
                        onPress={handleAddNote}
                    >
                        <Text style={styles.attachmentButtonText}>📝 Add Note</Text>
                    </TouchableOpacity>

                    {attachments.length > 0 && (
                        <View style={styles.notesContainer}>
                            {attachments.map(renderNote)}
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        (!selectedCause || !description.trim() || !reportedBy.trim() || loading) && styles.submitButtonDisabled
                    ]}
                    onPress={handleSubmit}
                    disabled={!selectedCause || !description.trim() || !reportedBy.trim() || loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <Text style={styles.submitButtonText}>Record Mortality</Text>
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
    dateButton: {
        backgroundColor: COLORS.lightGray,
        borderRadius: 8,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.lightGray2,
    },
    dateButtonText: {
        fontSize: 16,
        color: COLORS.black,
        fontWeight: '500',
    },
    causeOptionsContainer: {
        gap: 12,
    },
    causeOption: {
        borderWidth: 2,
        borderColor: COLORS.lightGray2,
        borderRadius: 12,
        padding: 16,
        backgroundColor: COLORS.white,
    },
    selectedCauseOption: {
        backgroundColor: COLORS.lightGray,
        borderWidth: 2,
    },
    causeOptionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    causeIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    causeOptionContent: {
        flex: 1,
    },
    causeOptionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.black,
        marginBottom: 4,
    },
    selectedCauseLabel: {
        color: COLORS.black,
    },
    causeOptionDescription: {
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
    textInput: {
        borderWidth: 1,
        borderColor: COLORS.lightGray2,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: COLORS.black,
        backgroundColor: COLORS.white,
    },
    descriptionInput: {
        borderWidth: 1,
        borderColor: COLORS.lightGray2,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: COLORS.black,
        backgroundColor: COLORS.white,
        minHeight: 120,
    },
    attachmentButton: {
        backgroundColor: COLORS.lightGray,
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.lightGray2,
        borderStyle: 'dashed',
    },
    attachmentButtonText: {
        fontSize: 16,
        color: COLORS.darkGray3,
        fontWeight: '500',
    },
    notesContainer: {
        marginTop: 12,
        gap: 8,
    },
    noteItem: {
        backgroundColor: COLORS.lightGray,
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: COLORS.lightGray2,
    },
    noteHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    noteIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    noteTimestamp: {
        flex: 1,
        fontSize: 12,
        color: COLORS.darkGray3,
        fontWeight: '500',
    },
    removeNoteButton: {
        backgroundColor: COLORS.red,
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeNoteText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    noteText: {
        fontSize: 14,
        color: COLORS.black,
        lineHeight: 18,
    },
    submitButton: {
        backgroundColor: COLORS.red,
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

export default MortalityForm;