import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { icons } from '../../constants';
import { COLORS } from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';
import { deleteLivestock } from '../../services/livestock';

const AnimalDetailScreen = ({ route, navigation }) => {
  const { animalData } = route.params || {};
  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    navigation.navigate('EditLivestockScreen', {
      livestockData: animalData,
      isEditing: true
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Livestock',
      `Are you sure you want to delete ${animalData.title || 'this animal'}? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);

      const livestockId = animalData.rawData?.id || animalData.id;

      if (!livestockId) {
        throw new Error('Livestock ID not found');
      }

      console.log('Deleting livestock with ID:', livestockId);
      await deleteLivestock(livestockId);

      Alert.alert(
        'Success',
        'Livestock deleted successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Delete error:', error.message);
      Alert.alert(
        'Error',
        error.message || 'Failed to delete livestock. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const renderTabs = () => {
    const tabs = [
      { id: 'overview', label: 'Overview' },
      { id: 'health', label: 'Health Records' },
      { id: 'breeding', label: 'Breeding' },
      { id: 'feeding', label: 'Feeding' },
    ];

    return (
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.activeTabText,
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderActionButtons = () => (
    <View style={styles.actionButtonsContainer}>
      <TouchableOpacity
        style={[styles.actionButton, styles.editButton]}
        onPress={handleEdit}>
        <FastImage
          source={icons.edit}
          style={styles.actionIcon}
          tintColor={COLORS.white}
        />
        <Text style={styles.actionButtonText}>Edit</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, styles.deleteButton]}
        onPress={handleDelete}
        disabled={isDeleting}>
        <FastImage
          source={icons.delete}
          style={styles.actionIcon}
          tintColor={COLORS.white}
        />
        <Text style={styles.actionButtonText}>
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderOverview = () => (
    <View style={styles.contentSection}>
      <View style={styles.infoCard}>
        <View style={styles.animalIconContainer}>
          <FastImage
            source={icons.livestock}
            style={styles.animalIcon}
            tintColor={COLORS.green2}
          />
        </View>
        <View style={styles.basicInfoContainer}>
          <Text style={styles.infoTitle}>Basic Information</Text>
          <InfoRow label="ID" value={animalData.id || animalData.idNumber} />
          <InfoRow label="Type" value={animalData.type || animalData.livestockType} />
          <InfoRow label="Breed" value={animalData.breedType || animalData.breed} />
          <InfoRow label="Gender" value={animalData.gender || animalData.sex} />
          <InfoRow label="Date of Birth" value={animalData.dateOfBirth || animalData.dob} />
          {/* <InfoRow label="Farm ID" value={animalData.farmId} /> */}

          {animalData.type === 'poultry' && (
            <>
              <InfoRow label="Flock ID" value={animalData.poultry?.flockId} />
              <InfoRow label="Initial Quantity" value={animalData.poultry?.initialQuantity} />
              <InfoRow label="Date of Stocking" value={animalData.poultry?.dateOfStocking} />
              <InfoRow label="Source of Birds" value={animalData.poultry?.sourceOfBirds} />
              <InfoRow label="Initial Avg Weight" value={animalData.poultry?.initialAverageWeight} />
            </>
          )}

          {animalData.type !== 'poultry' && animalData.mammal && (
            <>
              <InfoRow label="Phenotype" value={animalData.mammal.phenotype} />
              <InfoRow label="Birth Weight" value={animalData.mammal.birthWeight} />
              <InfoRow label="Sire ID" value={animalData.mammal.sireId} />
              <InfoRow label="Sire Code" value={animalData.mammal.sireCode} />
              <InfoRow label="Dam ID" value={animalData.mammal.damId} />
              <InfoRow label="Dam Code" value={animalData.mammal.damCode} />
            </>
          )}
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Current Status</Text>
        <InfoRow label="Health Status" value={animalData.healthStatus || 'Healthy'} />
        <InfoRow label="Status" value={animalData.status || 'Active'} />
        <InfoRow label="Production" value={animalData.production || 'N/A'} />
        <InfoRow label="Last Check" value={animalData.lastCheck || 'N/A'} />
      </View>
    </View>
  );

  const renderHealthRecords = () => (
    <View style={styles.contentSection}>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Health Summary</Text>
        <Text style={styles.healthStatus}>
          {animalData.healthStatus || 'Healthy'}
        </Text>
        <View style={styles.addRecordContainer}>
          <TouchableOpacity
            style={styles.addRecordButton}
            onPress={() =>
              navigation.navigate('AddHealthRecords', { animalId: animalData.id })
            }>
            <FastImage
              source={icons.add}
              style={styles.addIcon}
              tintColor={COLORS.white}
            />
            <Text style={styles.addRecordText}>Add Health Record</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Vaccination History</Text>
        {renderVaccinationHistory()}
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Treatment History</Text>
        {renderTreatmentHistory()}
      </View>
    </View>
  );

  const renderVaccinationHistory = () => {
    const vaccinations = animalData.vaccinationHistory || [];
    return vaccinations.length > 0 ? (
      vaccinations.map((record, index) => (
        <View key={index} style={styles.historyItem}>
          <View style={styles.historyDateContainer}>
            <Text style={styles.historyDate}>{record.date}</Text>
          </View>
          <View style={styles.historyDetails}>
            <Text style={styles.historyTitle}>{record.vaccine}</Text>
            <Text style={styles.historySubtext}>
              Batch: {record.batchNumber}
            </Text>
            <Text style={styles.historySubtext}>
              Admin by: {record.adminBy}
            </Text>
          </View>
        </View>
      ))
    ) : (
      <Text style={styles.noRecordsText}>No vaccination records found</Text>
    );
  };

  const renderTreatmentHistory = () => {
    const treatments = animalData.treatmentHistory || [];
    return treatments.length > 0 ? (
      treatments.map((record, index) => (
        <View key={index} style={styles.historyItem}>
          <View style={styles.historyDateContainer}>
            <Text style={styles.historyDate}>{record.date}</Text>
          </View>
          <View style={styles.historyDetails}>
            <Text style={styles.historyTitle}>{record.treatment}</Text>
            <Text style={styles.historySubtext}>{record.notes}</Text>
            <Text style={styles.historySubtext}>
              Admin by: {record.adminBy}
            </Text>
          </View>
        </View>
      ))
    ) : (
      <Text style={styles.noRecordsText}>No treatment records found</Text>
    );
  };

  const renderBreeding = () => (
    <View style={styles.contentSection}>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Breeding Status</Text>
        <Text style={styles.breedingStatus}>
          {animalData.breedingStatus || 'No records available'}
        </Text>
        <View style={styles.addRecordContainer}>
          <TouchableOpacity
            style={styles.addRecordButton}
            onPress={() =>
              navigation.navigate('BreedingRecordForm', {
                animalId: animalData.id,
              })
            }>
            <FastImage
              source={icons.add}
              style={styles.addIcon}
              tintColor={COLORS.white}
            />
            <Text style={styles.addRecordText}>Add Breeding Record</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Breeding History</Text>
        <Text style={styles.noRecordsText}>No breeding records found</Text>
      </View>
    </View>
  );

  const renderFeeding = () => (
    <View style={styles.contentSection}>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Feeding Regimen</Text>
        {renderFeedingRegimen()}
        <View style={styles.addRecordContainer}>
          <TouchableOpacity
            style={styles.addRecordButton}
            onPress={() =>
              navigation.navigate('FarmFeedsScreen', { animalId: animalData.id })
            }>
            <FastImage
              source={icons.edit}
              style={styles.addIcon}
              tintColor={COLORS.white}
            />
            <Text style={styles.addRecordText}>Add Feeding Plan</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Feeding Records</Text>
        <Text style={styles.noRecordsText}>
          No recent feeding records found
        </Text>
      </View>
    </View>
  );

  const renderFeedingRegimen = () => {
    const feedingData = animalData.feedingRegimen || [];

    return (
      <View style={styles.feedingTable}>
        <View style={styles.feedingRow}>
          <Text style={[styles.feedingCell, styles.feedingHeader]}>
            Feed Type
          </Text>
          <Text style={[styles.feedingCell, styles.feedingHeader]}>Amount</Text>
        </View>
        {feedingData.map((item, index) => (
          <View key={index} style={styles.feedingRow}>
            <Text style={styles.feedingCell}>{item.feed}</Text>
            <Text style={styles.feedingCell}>{item.amount}</Text>
          </View>
        ))}
      </View>
    );
  };

  const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value || 'N/A'}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent
        backgroundColor={COLORS.green2}
        animated={true}
        barStyle={'light-content'}
      />
      <SecondaryHeader title={animalData.title || `${animalData.type} Details`} showBackButton={true} />
      {renderTabs()}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'health' && renderHealthRecords()}
        {activeTab === 'breeding' && renderBreeding()}
        {activeTab === 'feeding' && renderFeeding()}
      </ScrollView>
      {renderActionButtons()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  tabContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray3,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 4,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: COLORS.green2,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.black,
  },
  activeTabText: {
    color: COLORS.green2,
    fontWeight: 'bold',
  },
  contentSection: {
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  animalIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  animalIcon: {
    width: 80,
    height: 80,
  },
  basicInfoContainer: {
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 120,
    fontSize: 14,
    color: COLORS.black,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '500',
  },
  healthStatus: {
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 16,
  },
  addRecordContainer: {
    marginTop: 16,
  },
  addRecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.green2,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  addIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  addRecordText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  historyItem: {
    flexDirection: 'row',
    marginBottom: 12,
    padding: 8,
    backgroundColor: COLORS.lightGray2,
    borderRadius: 8,
  },
  historyDateContainer: {
    width: 80,
    marginRight: 12,
  },
  historyDate: {
    fontSize: 13,
    color: COLORS.black,
    fontWeight: '500',
  },
  historyDetails: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '500',
    marginBottom: 4,
  },
  historySubtext: {
    fontSize: 13,
    color: COLORS.black,
  },
  noRecordsText: {
    fontSize: 14,
    color: COLORS.black,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  breedingStatus: {
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 16,
  },
  feedingTable: {
    marginTop: 8,
  },
  feedingRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray3,
  },
  feedingHeader: {
    fontWeight: 'bold',
    backgroundColor: COLORS.lightGray2,
  },
  feedingCell: {
    flex: 1,
    padding: 8,
    fontSize: 14,
    color: COLORS.black,
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray3,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  editButton: {
    backgroundColor: COLORS.green2,
  },
  deleteButton: {
    backgroundColor: '#FF4444',
  },
  actionIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: '500',
    fontSize: 14,
  },
});

export default AnimalDetailScreen;