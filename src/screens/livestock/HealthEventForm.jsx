import React, { useState } from 'react';
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
import { recordHealthEvent } from '../../services/livestock';

const HealthEventForm = ({ route, navigation }) => {
    const { animalId, animalData } = route.params;
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        eventType: 'vaccination',
        description: '',
        medications: '',
        dosage: '',
        cost: '',
        performedBy: '',
        date: new Date().toISOString().split('T')[0],
        nextScheduled: '',
    });

    const handleSubmit = async () => {
        if (!formData.description.trim()) {
            Alert.alert('Error', 'Please enter a description');
            return;
        }

        setLoading(true);
        try {
            const healthEventData = {
                livestockId: animalData.rawData._id,
                eventType: formData.eventType,
                date: new Date(formData.date).toISOString(),
                description: formData.description,
                performedBy: formData.performedBy,
                medications: formData.medications ? [formData.medications] : [],
                dosage: formData.dosage,
                cost: formData.cost ? parseFloat(formData.cost) : 0,
                nextScheduled: formData.nextScheduled ? new Date(formData.nextScheduled).toISOString() : null,
            };

            const { data, error } = await recordHealthEvent(healthEventData);

            if (error) {
                Alert.alert('Error', error);
            } else {
                Alert.alert('Success', 'Health event recorded successfully', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to record health event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <SecondaryHeader title="Record Health Event" />
            <ScrollView style={styles.content}>
                <View style={styles.animalInfo}>
                    <Text style={styles.animalTitle}>{animalData.title}</Text>
                    <Text style={styles.animalId}>ID: {animalData.id}</Text>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Event Type</Text>
                    <View style={styles.radioGroup}>
                        {['vaccination', 'treatment'].map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={styles.radioItem}
                                onPress={() => setFormData({ ...formData, eventType: type })}>
                                <View style={styles.radio}>
                                    {formData.eventType === type && <View style={styles.radioSelected} />}
                                </View>
                                <Text style={styles.radioText}>{type.toUpperCase()}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Description *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.description}
                        onChangeText={(text) => setFormData({ ...formData, description: text })}
                        placeholder="Describe the health event..."
                        multiline
                        numberOfLines={3}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Medications</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.medications}
                        onChangeText={(text) => setFormData({ ...formData, medications: text })}
                        placeholder="Medicine name"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Dosage</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.dosage}
                        onChangeText={(text) => setFormData({ ...formData, dosage: text })}
                        placeholder="e.g., 10ml, 2 tablets"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Cost (KES)</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.cost}
                        onChangeText={(text) => setFormData({ ...formData, cost: text })}
                        placeholder="0.00"
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Performed By</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.performedBy}
                        onChangeText={(text) => setFormData({ ...formData, performedBy: text })}
                        placeholder="Veterinarian or your name"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Date</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.date}
                        onChangeText={(text) => setFormData({ ...formData, date: text })}
                        placeholder="YYYY-MM-DD"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Next Scheduled</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.nextScheduled}
                        onChangeText={(text) => setFormData({ ...formData, nextScheduled: text })}
                        placeholder="YYYY-MM-DD (optional)"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={loading}>
                    <Text style={styles.submitButtonText}>
                        {loading ? 'Recording...' : 'Record Health Event'}
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
    radioGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
        marginBottom: 10,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: COLORS.green,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioSelected: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.green,
    },
    radioText: {
        fontSize: 14,
        color: COLORS.black,
    },
    submitButton: {
        backgroundColor: COLORS.green,
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

export default HealthEventForm;