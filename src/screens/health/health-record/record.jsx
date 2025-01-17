import React, { useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Provider as PaperProvider, Appbar, Card, Title, Paragraph, Chip } from 'react-native-paper';
import { format } from 'date-fns';
import HealthEventModal from './healthmodal';
import SecondaryHeader from '../../../components/headers/secondary-header';

const farmHealthData = [
    {
        animalId: "COW001",
        healthEventDate: "2025-01-05",
        symptoms: "Lethargy, loss of appetite",
        diagnosis: "Bovine Anaplasmosis",
        treatmentGiven: "Doxycycline injection",
        behavioralAndAlternative: "Isolated in a shaded area, increased water intake",
        medicalOfficer: {
            name: "Dr. John Kimani",
            licenseId: "VET-K12345",
        },
        costOfService: 1500,
        farmerOrWitness: "James Mwangi",
    },
    {
        animalId: "SHP023",
        healthEventDate: "2025-01-07",
        symptoms: "Swollen joints, fever",
        diagnosis: "Caprine Arthritis Encephalitis",
        treatmentGiven: "Anti-inflammatory medication",
        behavioralAndAlternative: "Soft bedding, reduced physical activity",
        medicalOfficer: {
            name: "Dr. Grace Nyambura",
            licenseId: "VET-K67890",
        },
        costOfService: 1200,
        farmerOrWitness: "Mary Njeri",
    },
    {
        animalId: "CHKN103",
        healthEventDate: "2025-01-08",
        symptoms: "Respiratory distress, nasal discharge",
        diagnosis: "Infectious Bronchitis",
        treatmentGiven: "Vaccination and antibiotics",
        behavioralAndAlternative: "Improved coop ventilation, herbal decoction",
        medicalOfficer: {
            name: "Dr. Peter Odhiambo",
            licenseId: "VET-K11223",
        },
        costOfService: 500,
        farmerOrWitness: "Samuel Wanjala",
    },
    {
        animalId: "COW002",
        healthEventDate: "2025-01-09",
        symptoms: "Bloody diarrhea, dehydration",
        diagnosis: "Coccidiosis",
        treatmentGiven: "Sulfa drugs and electrolyte therapy",
        behavioralAndAlternative: "Quarantine, increased feed supplements",
        medicalOfficer: {
            name: "Dr. Faith Mutua",
            licenseId: "VET-K44567",
        },
        costOfService: 1800,
        farmerOrWitness: "Josephine Kamau",
    },
    {
        animalId: "PG001",
        healthEventDate: "2025-01-10",
        symptoms: "Skin lesions, weight loss",
        diagnosis: "Swine Erysipelas",
        treatmentGiven: "Penicillin injection",
        behavioralAndAlternative: "Cleaned and sanitized pigsty, probiotics",
        medicalOfficer: {
            name: "Dr. Simon Kiprono",
            licenseId: "VET-K99876",
        },
        costOfService: 2000,
        farmerOrWitness: "Pauline Ndungu",
    },
];

const FarmHealthRecords = () => {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const openModal = (event) => {
        setSelectedEvent(event);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedEvent(null);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => openModal(item)}>
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.header}>
                        <Title>{item.animalId}</Title>
                        <Chip icon="calendar">{format(new Date(item.healthEventDate), 'MMM d, yyyy')}</Chip>
                    </View>
                    <Paragraph style={styles.diagnosis}>{item.diagnosis}</Paragraph>
                    <Chip icon="cash" mode="outlined">KES {item.costOfService}</Chip>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <SecondaryHeader title="Health Records" />
            <FlatList
                data={farmHealthData}
                renderItem={renderItem}
                keyExtractor={(item) => item.animalId}
                contentContainerStyle={styles.listContainer}
            />
            <HealthEventModal
                visible={modalVisible}
                event={selectedEvent}
                onClose={closeModal}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0fff0', // Light mint green background
    },
    listContainer: {
        padding: 16,
    },
    card: {
        marginBottom: 16,
        elevation: 4,
        backgroundColor: '#ffffff',
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
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#1b5e20', // Darker shade of green for important text
    },
});

export default FarmHealthRecords;
