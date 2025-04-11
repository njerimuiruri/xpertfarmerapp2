import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { icons } from '../../../constants';
import { COLORS } from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';

const BreedingRecordDetailScreen = ({ route, navigation }) => {
  const { record } = route.params;
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  
  const handleEdit = () => {
    navigation.navigate('EditBreedingRecordScreen', { record });
  };
  
  const handleDelete = () => {
    setConfirmDeleteVisible(true);
  };
  
  const confirmDelete = () => {
    setConfirmDeleteVisible(false);
    // Delete logic would go here in a real app
    Alert.alert('Success', 'Record deleted successfully');
    navigation.goBack();
  };
  
  const handleRecordBirth = () => {
    navigation.navigate('RecordBirthScreen', { record });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not recorded';
    
    const date = new Date(dateString);
    return isNaN(date.getTime()) 
      ? dateString 
      : date.toISOString().split('T')[0];
  };
  
  const getStatusColor = status => {
    switch (status) {
      case 'Pregnant':
        return '#FFC107'; // Amber
      case 'Delivered':
        return COLORS.green; // Green
      case 'Failed':
        return '#F44336'; // Red
      default:
        return '#757575'; // Grey
    }
  };

  const renderDetailItem = (icon, label, value) => {
    if (!value) return null;
    
    return (
      <View style={styles.detailItem}>
        <FastImage
          source={icon}
          style={styles.detailIcon}
          tintColor={COLORS.primary}
        />
        <View style={styles.detailContent}>
          <Text style={styles.detailLabel}>{label}</Text>
          <Text style={styles.detailValue}>{value}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader title="Breeding Record" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Animal Info Card */}
        <View style={styles.animalCard}>
          <View style={styles.animalCardContent}>
            <Text style={styles.animalId}>{record.animalId}</Text>
            <Text style={styles.animalType}>{record.animalType}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(record.status) }]}>
            <Text style={styles.statusText}>{record.status}</Text>
          </View>
        </View>
        
        {/* Timeline/Progress Indicator */}
        {record.status !== 'Failed' && (
          <View style={styles.timelineContainer}>
            <View style={styles.timeline}>
              <View style={[styles.timelineStep, styles.timelineStepCompleted]}>
                <View style={styles.timelineDot} />
                <Text style={styles.timelineText}>Service</Text>
              </View>
              <View style={[styles.timelineConnector, record.status === 'Pregnant' || record.status === 'Delivered' ? styles.timelineConnectorActive : null]} />
              <View style={[styles.timelineStep, record.status === 'Pregnant' || record.status === 'Delivered' ? styles.timelineStepCompleted : null]}>
                <View style={[styles.timelineDot, record.status === 'Pregnant' || record.status === 'Delivered' ? styles.timelineDotActive : null]} />
                <Text style={[styles.timelineText, record.status === 'Pregnant' || record.status === 'Delivered' ? styles.timelineTextActive : null]}>Pregnant</Text>
              </View>
              <View style={[styles.timelineConnector, record.status === 'Delivered' ? styles.timelineConnectorActive : null]} />
              <View style={[styles.timelineStep, record.status === 'Delivered' ? styles.timelineStepCompleted : null]}>
                <View style={[styles.timelineDot, record.status === 'Delivered' ? styles.timelineDotActive : null]} />
                <Text style={[styles.timelineText, record.status === 'Delivered' ? styles.timelineTextActive : null]}>Birth</Text>
              </View>
            </View>
          </View>
        )}
        
        {/* Details Section */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Breeding Information</Text>
          
          {renderDetailItem(icons.account, 'Purpose', record.purpose)}
          {renderDetailItem(icons.chart, 'Strategy', record.strategy)}
          {renderDetailItem(icons.submited, 'Service Type', record.serviceType)}
          {renderDetailItem(icons.calendar, 'Service Date', formatDate(record.serviceDate))}
          {renderDetailItem(icons.calendar, 'First Heat', formatDate(record.firstHeatDate))}
          {renderDetailItem(icons.time, 'Services', record.numServices)}
          
          {record.serviceType === 'Artificial Insemination' && (
            <>
              {renderDetailItem(icons.account, 'Sire Code', record.sireCode)}
              {renderDetailItem(icons.submited, 'AI Type', record.aiType)}
              {renderDetailItem(icons.location, 'AI Source', record.aiSource)}
              {renderDetailItem(icons.money, 'AI Cost', record.aiCost)}
            </>
          )}
        </View>
        
        {/* Gestation Section */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Gestation Details</Text>
          
          {renderDetailItem(icons.time, 'Gestation Period', record.gestationPeriod)}
          {renderDetailItem(icons.calendar, 'Expected Birth', formatDate(record.expectedBirthDate))}
          
          {record.status === 'Pregnant' && (
            <View style={styles.pregnancyTimeline}>
              <Text style={styles.pregnancyTimelineLabel}>Progress</Text>
              <View style={styles.pregnancyTimelineBar}>
                <View style={styles.pregnancyTimelineProgress} />
              </View>
              <View style={styles.pregnancyTimelineDates}>
                <Text style={styles.pregnancyTimelineDate}>{formatDate(record.serviceDate)}</Text>
                <Text style={styles.pregnancyTimelineDate}>{formatDate(record.expectedBirthDate)}</Text>
              </View>
            </View>
          )}
        </View>
        
        {/* Birth Details Section (if available) */}
        {record.status === 'Delivered' && (
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Birth Details</Text>
            
            {renderDetailItem(icons.calendar, 'Birth Date', formatDate(record.birthDate))}
            {renderDetailItem(icons.submited, 'Delivery Method', record.deliveryMethod)}
            {renderDetailItem(icons.account, 'Young Ones', record.youngOnes)}
            {renderDetailItem(icons.chart, 'Birth Weight', record.birthWeight)}
            {renderDetailItem(icons.chart, 'Litter Weight', record.litterWeight)}
            {renderDetailItem(icons.account, 'Offspring Sex', record.offspringSex)}
            {renderDetailItem(icons.tag, 'Offspring IDs', record.offspringIds)}
          </View>
        )}
        
        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {record.status === 'Pregnant' && (
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={handleRecordBirth}
            >
              <FastImage
                source={icons.submited}
                style={styles.buttonIcon}
                tintColor="#fff"
              />
              <Text style={styles.buttonText}>Record Birth</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleEdit}>
              <FastImage
                source={icons.edit}
                style={styles.buttonIcon}
                tintColor={COLORS.primary}
              />
              <Text style={styles.secondaryButtonText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.dangerButton} onPress={handleDelete}>
              <FastImage
                source={icons.remove}
                style={styles.buttonIcon}
                tintColor="#F44336"
              />
              <Text style={styles.dangerButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      {/* Delete Confirmation Modal */}
      <Modal
        transparent={true}
        visible={confirmDeleteVisible}
        animationType="fade"
        onRequestClose={() => setConfirmDeleteVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Record?</Text>
            <Text style={styles.modalText}>
              This breeding record will be permanently removed. This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setConfirmDeleteVisible(false)}>
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalDeleteButton}
                onPress={confirmDelete}>
                <Text style={styles.modalDeleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  animalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  animalCardContent: {
    flex: 1,
  },
  animalId: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  animalType: {
    fontSize: 15,
    color: COLORS.gray2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  
  // Timeline styles
  timelineContainer: {
    marginBottom: 16,
  },
  timeline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  timelineStep: {
    alignItems: 'center',
    width: 80,
  },
  timelineStepCompleted: {
    opacity: 1,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    marginBottom: 8,
  },
  timelineDotActive: {
    backgroundColor: COLORS.primary,
  },
  timelineConnector: {
    height: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
  },
  timelineConnectorActive: {
    backgroundColor: COLORS.primary,
  },
  timelineText: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
  },
  timelineTextActive: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  
  // Details card
  detailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.gray2,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.black,
  },
  
  // Pregnancy timeline
  pregnancyTimeline: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  pregnancyTimelineLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.black,
    marginBottom: 8,
  },
  pregnancyTimelineBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  pregnancyTimelineProgress: {
    width: '40%', // Would be calculated dynamically in a real app
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  pregnancyTimelineDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  pregnancyTimelineDate: {
    fontSize: 12,
    color: COLORS.gray2,
  },
  
  // Action buttons
  actionButtonsContainer: {
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginBottom: 12,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginRight: 8,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '500',
  },
  dangerButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#F44336',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginLeft: 8,
  },
  dangerButtonText: {
    color: '#F44336',
    fontSize: 15,
    fontWeight: '500',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
  },
  modalText: {
    fontSize: 15,
    color: COLORS.gray2,
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalCancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  modalCancelButtonText: {
    color: COLORS.gray2,
    fontWeight: '500',
    fontSize: 15,
  },
  modalDeleteButton: {
    backgroundColor: '#F44336',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  modalDeleteButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 15,
  },
});

export default BreedingRecordDetailScreen;