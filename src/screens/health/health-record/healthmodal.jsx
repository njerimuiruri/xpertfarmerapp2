import React from 'react';
import { View, StyleSheet, ScrollView, Modal } from 'react-native';
import { Card, Title, Paragraph, Chip, Avatar, Button, Text } from 'react-native-paper';
import { format } from 'date-fns';

const HealthEventModal = ({ visible, event, onClose }) => {
    if (!event) return null;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <ScrollView>
                        <Card>
                            <Card.Content>
                                <View style={styles.header}>
                                    <Title><Text>{event.animalId}</Text></Title>
                                    <Chip icon="calendar"><Text>{format(new Date(event.healthEventDate), 'MMM d, yyyy')}</Text></Chip>
                                </View>
                                <Paragraph style={styles.diagnosis}><Text>{event.diagnosis}</Text></Paragraph>
                                <Paragraph><Text><Text style={{ fontWeight: 'bold' }}>Symptoms:</Text> {event.symptoms}</Text></Paragraph>
                                <Paragraph><Text><Text style={{ fontWeight: 'bold' }}>Treatment:</Text> {event.treatmentGiven}</Text></Paragraph>
                                <Paragraph><Text><Text style={{ fontWeight: 'bold' }}>Behavioral & Alternative:</Text> {event.behavioralAndAlternative}</Text></Paragraph>
                                <View style={styles.footer}>
                                    <View style={styles.medicalOfficer}>
                                        <Avatar.Text size={24} label={event.medicalOfficer.name.split(' ').map(n => n[0]).join('')} />
                                        <View style={styles.officerInfo}>
                                            <Paragraph><Text>{event.medicalOfficer.name}</Text></Paragraph>
                                            <Paragraph style={styles.licenseId}><Text>{event.medicalOfficer.licenseId}</Text></Paragraph>
                                        </View>
                                    </View>
                                    <Chip icon="cash" mode="outlined"><Text>KES {event.costOfService}</Text></Chip>
                                </View>
                                <Paragraph style={styles.witness}><Text>Witness: {event.farmerOrWitness}</Text></Paragraph>
                            </Card.Content>
                        </Card>
                    </ScrollView>
                    <Button mode="contained" onPress={onClose} style={styles.closeButton}>
                        <Text>Close</Text>
                    </Button>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(46, 125, 50, 0.5)', // Semi-transparent green background
    },
    modalView: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
        borderLeftWidth: 4,
        borderLeftColor: '#2e7d32', // Dark green accent
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    diagnosis: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#1b5e20', // Darker shade of green
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#81c784', // Light green border
        paddingTop: 16,
    },
    medicalOfficer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    officerInfo: {
        marginLeft: 8,
    },
    licenseId: {
        fontSize: 12,
        color: '#2e7d32', // Dark green for license ID
    },
    witness: {
        marginTop: 8,
        fontStyle: 'italic',
        color: '#388e3c', // Medium green for witness text
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: '#2e7d32', // Dark green button
    },
});

export default HealthEventModal;
