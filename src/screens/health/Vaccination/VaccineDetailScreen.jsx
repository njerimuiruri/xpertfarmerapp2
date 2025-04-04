import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { icons } from '../../../constants';
import { COLORS, FONTS, SIZES } from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';

const VaccineDetailScreen = ({ route, navigation }) => {
  const { record } = route.params;
  
  const formattedDate = new Date(record.dateAdministered).toLocaleDateString();
  const totalCost = parseInt(record.costOfVaccine) + parseInt(record.costOfService);
  
  const handleDelete = () => {
    Alert.alert(
      "Delete Record",
      "Are you sure you want to delete this vaccination record? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader title="Vaccine Details" />
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.headerBanner}>
            <View style={styles.animalInfoContainer}>
              <View style={styles.animalTypeTag}>
                <Text style={styles.animalTypeText}>{record.animalType}</Text>
              </View>
              <Text style={styles.animalIdTitle}>ANIMAL ID</Text>
              <Text style={styles.animalId}>{record.animalIdOrFlockId}</Text>
            </View>
            
            <View style={styles.dateContainer}>
              <View style={styles.dateIconContainer}>
                <FastImage
                  source={icons.calendar}
                  style={styles.dateIcon}
                  tintColor={COLORS.white}
                />
              </View>
              <Text style={styles.dateLabel}>DATE ADMINISTERED</Text>
              <Text style={styles.dateValue}>{formattedDate}</Text>
            </View>
          </View>
          
          <View style={styles.detailsContainer}>
            <SectionCard title="Vaccination Information">
              <DetailItem label="Vaccination Against" value={record.vaccinationAgainst} />
              <DetailItem label="Drug Administered" value={record.drugAdministered} />
              <DetailItem label="Dosage" value={`${record.dosage} ml`} />
            </SectionCard>
            
            <SectionCard title="Administration Details">
              <DetailItem label="Administered By" value={record.administeredBy} />
              <DetailItem label="Practice ID" value={record.practiceId} />
            </SectionCard>
            
            <SectionCard title="Cost Breakdown">
              <DetailItem label="Cost of Vaccine" value={`$${parseInt(record.costOfVaccine).toLocaleString()}`} />
              <DetailItem label="Cost of Service" value={`$${parseInt(record.costOfService).toLocaleString()}`} />
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total Cost</Text>
                <Text style={styles.totalValue}>${totalCost.toLocaleString()}</Text>
              </View>
            </SectionCard>
            
            <SectionCard title="Notes">
              <View style={styles.notesContainer}>
                <Text style={styles.noteText}>
                  {record.notes || "No additional notes for this vaccination record."}
                </Text>
              </View>
            </SectionCard>
          </View>
        </View>
        
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => navigation.navigate('VaccineEditScreen', { record })}>
            <FastImage
              source={icons.edit}
              style={styles.actionButtonIcon}
              tintColor={COLORS.white}
            />
            <Text style={styles.actionButtonText}>Edit Record</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}>
            <FastImage
              source={icons.remove}
              style={styles.actionButtonIcon}
              tintColor={COLORS.white}
            />
            <Text style={styles.actionButtonText}>Delete Record</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper component for detail items
const DetailItem = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

// Helper component for section cards
const SectionCard = ({ title, children }) => (
  <View style={styles.sectionCard}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>
      {children}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGreen,
  },
  scrollContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  headerBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: COLORS.green,
  },
  animalInfoContainer: {
    flex: 1,
  },
  animalTypeTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  animalTypeText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
  animalIdTitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    letterSpacing: 1,
  },
  animalId: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 4,
  },
  dateContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  dateIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateIcon: {
    width: 20,
    height: 20,
  },
  dateLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    letterSpacing: 1,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginTop: 4,
  },
  detailsContainer: {
    padding: 16,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.green,
    marginBottom: 16,
  },
  sectionContent: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 15,
    color: COLORS.gray,
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.black,
    flex: 1,
    textAlign: 'right',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.green,
  },
  notesContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
  },
  noteText: {
    fontSize: 15,
    color: COLORS.gray,
    lineHeight: 22,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  actionButtonIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});

export default VaccineDetailScreen;