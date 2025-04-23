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
        return COLORS.lightGreen; 
      case 'Delivered':
        return COLORS.green; 
      case 'Failed':
        return COLORS.red; 
      default:
        return COLORS.blue; 
    }
  };

  const renderDetailItem = (icon, label, value) => {
    
    return (
      <View style={styles.detailItem}>
        <FastImage
          source={icon}
          style={styles.detailIcon}
          tintColor={COLORS.black}
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
        <View style={styles.animalCard}>
          <View style={styles.animalCardContent}>
            <Text style={styles.animalId}>{record.animalId}</Text>
            <Text style={styles.animalType}>{record.animalType}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(record.status) }]}>
            <Text style={styles.statusText}>{record.status}</Text>
          </View>
        </View>
        
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
        
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Breeding Information</Text>
          
          {renderDetailItem(icons.account, 'Purpose:', record.purpose)}
          {renderDetailItem(icons.strategy, 'Strategy:', record.strategy)}
          {renderDetailItem(icons.submited, 'Service Type:', record.serviceType)}
          {renderDetailItem(icons.calendar, 'Service Date:', formatDate(record.serviceDate))}
          {renderDetailItem(icons.calendar, 'First Heat:', formatDate(record.firstHeatDate))}
          {renderDetailItem(icons.time, 'Services:', record.numServices)}
          
          {record.serviceType === 'Artificial Insemination' && (
            <>
              {renderDetailItem(icons.account, 'Sire Code:', record.sireCode)}
              {renderDetailItem(icons.submited, 'AI Type:', record.aiType)}
              {renderDetailItem(icons.location, 'AI Source:', record.aiSource)}
              {renderDetailItem(icons.money, 'AI Cost:', record.aiCost)}
            </>
          )}
        </View>
        
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Gestation Details</Text>
          
          {renderDetailItem(icons.time, 'Gestation Period:', record.gestationPeriod)}
          {renderDetailItem(icons.calendar, 'Expected Birth:', formatDate(record.expectedBirthDate))}
          
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
        
        {record.status === 'Delivered' && (
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Birth Details</Text>
            
            {renderDetailItem(icons.calendar, 'Birth Date:', formatDate(record.birthDate))}
            {renderDetailItem(icons.submited, 'Delivery Method:', record.deliveryMethod)}
            {renderDetailItem(icons.account, 'Young Ones:', record.youngOnes)}
            {renderDetailItem(icons.chart, 'Birth Weight:', record.birthWeight)}
            {renderDetailItem(icons.chart, 'Litter Weight:', record.litterWeight)}
            {renderDetailItem(icons.account, 'Offspring Sex:', record.offspringSex)}
            {renderDetailItem(icons.tag, 'Offspring IDs:', record.offspringIds)}
          </View>
        )}
        
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
                tintColor="#2196F3"
              />
              <Text style={styles.secondaryButtonText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.dangerButton} >
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
   
  },
  animalCardContent: {
    flex: 1,
  },
  animalId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  animalType: {
    fontSize: 14,
    color: COLORS.black,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  
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
    backgroundColor: COLORS.lightGray2,
    marginBottom: 8,
  },
  timelineDotActive: {
    backgroundColor: COLORS.green,
  },
  timelineConnector: {
    height: 2,
    flex: 1,
    backgroundColor: COLORS.lightGray2,
  },
  timelineConnectorActive: {
    backgroundColor: COLORS.green,
  },
  timelineText: {
    fontSize: 12,
    color: COLORS.black,
    textAlign: 'center',
  },
  timelineTextActive: {
    color: COLORS.green,
    fontWeight: '500',
  },
  
  detailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
   
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray3,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray3,
  },
  detailIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.black,
    width: 100,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.black,
  },
  
  // Pregnancy timeline
  pregnancyTimeline: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray3,
  },
  pregnancyTimelineLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.black,
    marginBottom: 8,
  },
  pregnancyTimelineBar: {
    height: 8,
    backgroundColor: COLORS.lightGray2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  pregnancyTimelineProgress: {
    width: '40%', 
    height: '100%',
    backgroundColor: COLORS.green,
    borderRadius: 4,
  },
  pregnancyTimelineDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  pregnancyTimelineDate: {
    fontSize: 12,
    color: COLORS.black,
  },
  
  actionButtonsContainer: {
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: COLORS.green,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
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
    borderColor: '#2196F3',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginRight: 8,
  },
  secondaryButtonText: {
    color: '#2196F3',
    fontSize: 14,
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
    fontSize: 14,
    fontWeight: '500',
  },
  
  
});

export default BreedingRecordDetailScreen;