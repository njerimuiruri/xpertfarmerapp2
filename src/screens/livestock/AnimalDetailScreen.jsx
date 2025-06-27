import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { icons } from '../../constants';
import { COLORS } from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';
import { deleteLivestock } from '../../services/livestock';

const { width } = Dimensions.get('window');

const AnimalDetailScreen = ({ route, navigation }) => {
  const { animalData } = route.params || {};
  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastAnimation] = useState(new Animated.Value(-100));

  const handleEdit = () => {
    navigation.navigate('EditLivestockScreen', {
      livestockData: animalData,
      isEditing: true
    });
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const showSuccessToast = () => {
    setShowToast(true);
    Animated.sequence([
      Animated.timing(toastAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(toastAnimation, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowToast(false);
      toastAnimation.setValue(-100);
    });
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      setShowDeleteModal(false);

      const livestockId = animalData.rawData?.id || animalData.id;

      if (!livestockId) {
        throw new Error('Livestock ID not found');
      }

      console.log('Deleting livestock with ID:', livestockId);
      await deleteLivestock(livestockId);

      showSuccessToast();

      setTimeout(() => {
        navigation.goBack();
      }, 2500);
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

  const renderDeleteModal = () => (
    <Modal
      transparent={true}
      visible={showDeleteModal}
      animationType="fade"
      onRequestClose={() => setShowDeleteModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.warningIconContainer}>
              <FastImage
                source={icons.warning || icons.delete}
                style={styles.warningIcon}
                tintColor="#FF4444"
              />
            </View>
            <Text style={styles.modalTitle}>Delete Livestock</Text>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete{' '}
              <Text style={styles.animalName}>
                {animalData.title || 'this animal'}
              </Text>
              ? This action cannot be undone.
            </Text>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowDeleteModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.deleteModalButton]}
              onPress={confirmDelete}
              disabled={isDeleting}
            >
              <Text style={styles.deleteButtonText}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderToast = () => {
    if (!showToast) return null;

    return (
      <Animated.View
        style={[
          styles.toastContainer,
          {
            transform: [{ translateY: toastAnimation }],
          },
        ]}
      >
        <View style={styles.toastContent}>
          <FastImage
            source={icons.checkmark || icons.check}
            style={styles.toastIcon}
            tintColor={COLORS.white}
          />
          <Text style={styles.toastText}>
            Livestock deleted successfully
          </Text>
        </View>
      </Animated.View>
    );
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
          <InfoRow label="ID" value={animalData.idNumber || animalData.idNumber} />
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
  const renderBreeding = () => {
    const isFemale = animalData.gender?.toLowerCase() === 'female';
    const isMale = animalData.gender?.toLowerCase() === 'male';
    const isPoultry = animalData.type === 'poultry' || animalData.livestockType === 'poultry';

    // Poultry breeding is typically managed at flock level, not individual level
    if (isPoultry) {
      return (
        <View style={styles.contentSection}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Breeding Information</Text>
            <View style={styles.breedingNoticeContainer}>
              <FastImage
                source={icons.info}
                style={styles.infoIcon}
                tintColor={COLORS.orange}
              />
              <Text style={styles.breedingNoticeText}>
                Poultry breeding is typically managed at the flock level.
                For detailed breeding records, please use the Flock Management section.
              </Text>
            </View>

            <InfoRow label="Flock ID" value={animalData.poultry?.flockId} />
            <InfoRow label="Breed Type" value={animalData.breedType} />
            <InfoRow label="Purpose" value={getPoultryPurpose(animalData.breedType)} />
          </View>
        </View>
      );
    }

    // For mammals - different content for males vs females
    return (
      <View style={styles.contentSection}>
        {isFemale && renderFemaleBreeding()}
        {isMale && renderMaleBreeding()}
        {(!isFemale && !isMale) && renderUnknownGenderBreeding()}
      </View>
    );
  };

  const renderFemaleBreeding = () => (
    <>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Breeding Status</Text>
        <InfoRow label="Current Status" value={animalData.breedingStatus || 'Open (Ready to breed)'} />
        <InfoRow label="Last Breeding Date" value={animalData.lastBreedingDate || 'N/A'} />
        <InfoRow label="Expected Due Date" value={animalData.expectedDueDate || 'N/A'} />
        <InfoRow label="Total Pregnancies" value={animalData.totalPregnancies || '0'} />
        <InfoRow label="Live Births" value={animalData.totalLiveBirths || '0'} />

        <View style={styles.addRecordContainer}>
          <TouchableOpacity
            style={styles.addRecordButton}
            onPress={() =>
              navigation.navigate('BreedingRecordForm', {
                animalId: animalData.id,
                animalGender: 'female',
                recordType: 'breeding'
              })
            }>
            <FastImage
              source={icons.add}
              style={styles.addIcon}
              tintColor={COLORS.white}
            />
            <Text style={styles.addRecordText}>Record Breeding</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Pregnancy History</Text>
        {renderPregnancyHistory()}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Offspring Records</Text>
        {renderOffspringHistory()}
      </View>
    </>
  );

  const renderMaleBreeding = () => (
    <>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Breeding Service Record</Text>
        <InfoRow label="Service Status" value={animalData.serviceStatus || 'Active'} />
        <InfoRow label="Total Services" value={animalData.totalServices || '0'} />
        <InfoRow label="Successful Matings" value={animalData.successfulMatings || '0'} />
        <InfoRow label="Total Offspring" value={animalData.totalOffspring || '0'} />
        <InfoRow label="Last Service Date" value={animalData.lastServiceDate || 'N/A'} />

        <View style={styles.addRecordContainer}>
          <TouchableOpacity
            style={styles.addRecordButton}
            onPress={() =>
              navigation.navigate('BreedingRecordForm', {
                animalId: animalData.id,
                animalGender: 'male',
                recordType: 'service'
              })
            }>
            <FastImage
              source={icons.add}
              style={styles.addIcon}
              tintColor={COLORS.white}
            />
            <Text style={styles.addRecordText}>Record Service</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Service History</Text>
        {renderServiceHistory()}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Offspring Records</Text>
        {renderOffspringHistory()}
      </View>
    </>
  );

  const renderUnknownGenderBreeding = () => (
    <View style={styles.infoCard}>
      <Text style={styles.infoTitle}>Breeding Information</Text>
      <View style={styles.breedingNoticeContainer}>
        <FastImage
          source={icons.info}
          style={styles.infoIcon}
          tintColor={COLORS.orange}
        />
        <Text style={styles.breedingNoticeText}>
          Please specify the animal's gender to access detailed breeding records and functionality.
        </Text>
      </View>

      <View style={styles.addRecordContainer}>
        <TouchableOpacity
          style={[styles.addRecordButton, styles.disabledButton]}
          disabled={true}>
          <FastImage
            source={icons.edit}
            style={styles.addIcon}
            tintColor={COLORS.gray}
          />
          <Text style={[styles.addRecordText, styles.disabledText]}>
            Update Gender to Enable Breeding Records
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPregnancyHistory = () => {
    const pregnancies = animalData.pregnancyHistory || [];
    return pregnancies.length > 0 ? (
      pregnancies.map((record, index) => (
        <View key={index} style={styles.historyItem}>
          <View style={styles.historyDateContainer}>
            <Text style={styles.historyDate}>{record.breedingDate}</Text>
          </View>
          <View style={styles.historyDetails}>
            <Text style={styles.historyTitle}>
              {record.status || 'Pregnancy'} - {record.sireId || 'Unknown Sire'}
            </Text>
            <Text style={styles.historySubtext}>
              Due: {record.expectedDueDate || 'N/A'}
            </Text>
            <Text style={styles.historySubtext}>
              Outcome: {record.outcome || 'Pending'}
            </Text>
          </View>
        </View>
      ))
    ) : (
      <Text style={styles.noRecordsText}>No pregnancy records found</Text>
    );
  };

  const renderServiceHistory = () => {
    const services = animalData.serviceHistory || [];
    return services.length > 0 ? (
      services.map((record, index) => (
        <View key={index} style={styles.historyItem}>
          <View style={styles.historyDateContainer}>
            <Text style={styles.historyDate}>{record.serviceDate}</Text>
          </View>
          <View style={styles.historyDetails}>
            <Text style={styles.historyTitle}>
              Service to: {record.femaleId || 'Unknown'}
            </Text>
            <Text style={styles.historySubtext}>
              Female ID: {record.femaleIdNumber || 'N/A'}
            </Text>
            <Text style={styles.historySubtext}>
              Result: {record.result || 'Pending'}
            </Text>
          </View>
        </View>
      ))
    ) : (
      <Text style={styles.noRecordsText}>No service records found</Text>
    );
  };

  const renderOffspringHistory = () => {
    const offspring = animalData.offspringHistory || [];
    return offspring.length > 0 ? (
      offspring.map((record, index) => (
        <View key={index} style={styles.historyItem}>
          <View style={styles.historyDateContainer}>
            <Text style={styles.historyDate}>{record.birthDate}</Text>
          </View>
          <View style={styles.historyDetails}>
            <Text style={styles.historyTitle}>
              {record.offspringCount || 1} Offspring
            </Text>
            <Text style={styles.historySubtext}>
              IDs: {record.offspringIds?.join(', ') || 'N/A'}
            </Text>
            <Text style={styles.historySubtext}>
              {animalData.gender === 'female' ? 'Sire' : 'Dam'}: {record.partnerId || 'N/A'}
            </Text>
          </View>
        </View>
      ))
    ) : (
      <Text style={styles.noRecordsText}>No offspring records found</Text>
    );
  };

  const getPoultryPurpose = (breedType) => {
    const purposes = {
      'Broiler': 'Meat Production',
      'Layer': 'Egg Production',
      'Dual Purpose': 'Meat & Egg Production',
      'Indigenous': 'Multi-purpose',
      'Turkey': 'Meat Production',
      'Duck': 'Meat & Egg Production',
      'Quail': 'Egg & Meat Production'
    };
    return purposes[breedType] || 'Unknown';
  };

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
      {renderDeleteModal()}
      {renderToast()}
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: width * 0.85,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  warningIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  warningIcon: {
    width: 30,
    height: 30,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
  },
  modalBody: {
    marginBottom: 24,
  },
  modalMessage: {
    fontSize: 16,
    color: COLORS.black,
    textAlign: 'center',
    lineHeight: 24,
  },
  animalName: {
    fontWeight: 'bold',
    color: COLORS.green2,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.gray3,
  },
  deleteModalButton: {
    backgroundColor: '#FF4444',
  },
  cancelButtonText: {
    color: COLORS.black,
    fontWeight: '500',
    fontSize: 16,
  },
  deleteButtonText: {
    color: COLORS.white,
    fontWeight: '500',
    fontSize: 16,
  },
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  toastContent: {
    backgroundColor: COLORS.green2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toastIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  toastText: {
    color: COLORS.white,
    fontWeight: '500',
    fontSize: 16,
  },
  breedingNoticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  breedingNoticeText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.black,
    lineHeight: 20,
  },
  disabledButton: {
    backgroundColor: COLORS.gray3,
  },
  disabledText: {
    color: COLORS.gray,
  },
});

export default AnimalDetailScreen;