import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { COLORS } from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';
import { recordLivestockMortality, updateLivestockStatus } from '../../services/livestock';

const MortalityRecordForm = ({ route, navigation }) => {
    const { animalId, animalData, farmId, animalType, breed, onMortalityRecorded } = route.params;
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        cause: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        reportedBy: '',
        location: farmId || '',
        veterinarianNotes: '',
        disposalMethod: '',
    });

    // Pre-populate some fields based on animal data
    useEffect(() => {
        if (animalData) {
            setFormData(prev => ({
                ...prev,
                location: animalData.farmId || '',
                // You can add more pre-populated fields here
            }));
        }
    }, [animalData]);

    const handleSubmit = async () => {
        if (!formData.cause.trim()) {
            Alert.alert('Error', 'Please enter the cause of mortality');
            return;
        }

        if (!formData.date) {
            Alert.alert('Error', 'Please select a date');
            return;
        }

        setLoading(true);
        try {
            // Record the mortality
            const mortalityData = {
                livestockId: animalData.rawData._id,
                animalId: animalId,
                farmId: farmId,
                animalType: animalType,
                breed: breed,
                date: new Date(formData.date).toISOString(),
                cause: formData.cause,
                description: formData.description,
                reportedBy: formData.reportedBy,
                location: formData.location,
                veterinarianNotes: formData.veterinarianNotes,
                disposalMethod: formData.disposalMethod,
                attachments: [],
                // Add timestamp for when the record was created
                recordedAt: new Date().toISOString(),
            };

            const { data, error } = await recordLivestockMortality(mortalityData);

            if (error) {
                Alert.alert('Error', error);
                return;
            }

            // Also update the livestock status to 'deceased'
            const statusUpdateResult = await updateLivestockStatus(
                animalData.rawData._id,
                'deceased',
                `Mortality recorded: ${formData.cause}`
            );

            if (statusUpdateResult.error) {
                console.warn('Warning: Mortality recorded but status update failed:', statusUpdateResult.error);
            }

            Alert.alert(
                'Success',
                'Mortality record created successfully and animal status updated',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Call the callback to refresh livestock data
                            if (onMortalityRecorded) {
                                onMortalityRecorded();
                            }
                            navigation.goBack();
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Error recording mortality:', error);
            Alert.alert('Error', 'Failed to record mortality. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <SecondaryHeader title="Record Mortality" />
            <ScrollView style={styles.content}>
                {/* Enhanced animal info display */}
                <View style={styles.animalInfo}>
                    <Text style={styles.animalTitle}>{animalData.title}</Text>
                    <Text style={styles.animalId}>ID: {animalData.id}</Text>
                    <Text style={styles.animalDetails}>Breed: {animalData.breed}</Text>
                    <Text style={styles.animalDetails}>Type: {animalData.type}</Text>
                    <Text style={styles.animalDetails}>Born: {animalData.dob}</Text>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Cause of Death *</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.cause}
                        onChangeText={(text) => setFormData({ ...formData, cause: text })}
                        placeholder="e.g., Disease, Old age, Accident, Predator attack"
                        multiline
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.description}
                        onChangeText={(text) => setFormData({ ...formData, description: text })}
                        placeholder="Additional details about the mortality, symptoms observed, timeline, etc."
                        multiline
                        numberOfLines={4}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Date of Death *</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.date}
                        onChangeText={(text) => setFormData({ ...formData, date: text })}
                        placeholder="YYYY-MM-DD"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Reported By</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.reportedBy}
                        onChangeText={(text) => setFormData({ ...formData, reportedBy: text })}
                        placeholder="Your name or role"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Location</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.location}
                        onChangeText={(text) => setFormData({ ...formData, location: text })}
                        placeholder="Farm location or specific area"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Veterinarian Notes</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.veterinarianNotes}
                        onChangeText={(text) => setFormData({ ...formData, veterinarianNotes: text })}
                        placeholder="Any veterinarian consultation or diagnosis"
                        multiline
                        numberOfLines={3}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Disposal Method</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.disposalMethod}
                        onChangeText={(text) => setFormData({ ...formData, disposalMethod: text })}
                        placeholder="e.g., Burial, Cremation, Veterinary disposal"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={loading}>
                    <Text style={styles.submitButtonText}>
                        {loading ? 'Recording...' : 'Record Mortality'}
                    </Text>
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
    animalInfo: {
        backgroundColor: COLORS.white,
        padding: 16,
        borderRadius: 8,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.red,
    },
    animalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    animalId: {
        fontSize: 14,
        color: COLORS.gray,
        marginTop: 4,
    },
    animalDetails: {
        fontSize: 12,
        color: COLORS.darkGray3,
        marginTop: 2,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.black,
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
        height: 80,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: COLORS.red,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    disabledButton: {
        backgroundColor: COLORS.gray,
    },
    submitButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default MortalityRecordForm;