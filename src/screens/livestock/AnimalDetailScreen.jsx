import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { icons } from '../../constants';
import { COLORS } from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';
import { deleteLivestock, getLivestockById } from '../../services/livestock';

const { width } = Dimensions.get('window');

const AnimalDetailScreen = ({ route, navigation }) => {
  const { animalData } = route.params || {};
  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastAnimation] = useState(new Animated.Value(-100));

  const [healthHistory, setHealthHistory] = useState([]);
  const [healthLoading, setHealthLoading] = useState(false);
  const [selectedHealthFilter, setSelectedHealthFilter] = useState('all');

  useEffect(() => {
    if (activeTab === 'health') {
      fetchHealthHistory();
    }
  }, [activeTab]);

  const fetchHealthHistory = async () => {
    try {
      setHealthLoading(true);
      const livestockId = animalData?.rawData?._id || animalData?.rawData?.id || animalData?.id;

      if (!livestockId) {
        throw new Error('Animal ID not found');
      }

      const livestock = await getLivestockById(livestockId);
      const events = livestock?.healthEvent || [];

      const sortedEvents = [...events].sort((a, b) => new Date(b.date) - new Date(a.date));
      setHealthHistory(sortedEvents);
    } catch (error) {
      console.error('Error fetching health history:', error);
      Alert.alert('Error', 'Failed to fetch health history. Please try again.');
    } finally {
      setHealthLoading(false);
    }
  };

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
      { id: 'overview', label: 'Overview', icon: icons.home },
      { id: 'health', label: 'Health', icon: icons.health },
      { id: 'breeding', label: 'Breeding', icon: icons.heart },
      { id: 'feeding', label: 'Feeding', icon: icons.feed },
    ];

    return (
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}>
              <FastImage
                source={tab.icon}
                style={[styles.tabIcon, activeTab === tab.id && styles.activeTabIcon]}
                tintColor={activeTab === tab.id ? COLORS.white : '#4CAF50'}
              />
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
        <View style={styles.cardHeader}>
          <View style={styles.animalIconContainer}>
            <FastImage
              source={icons.livestock}
              style={styles.animalIcon}
              tintColor="#4CAF50"
            />
          </View>
          <Text style={styles.infoTitle}>Basic Information</Text>
        </View>
        <View style={styles.basicInfoContainer}>
          <InfoRow label="ID" value={animalData.idNumber || animalData.idNumber} />
          <InfoRow label="Type" value={animalData.type || animalData.livestockType} />
          <InfoRow label="Breed" value={animalData.breedType || animalData.breed} />
          <InfoRow label="Gender" value={animalData.gender || animalData.sex} />
          <InfoRow label="Date of Birth" value={animalData.dateOfBirth || animalData.dob} />

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
        <View style={styles.cardHeader}>
          <View style={styles.statusIconContainer}>
            <FastImage
              source={icons.health}
              style={styles.statusIcon}
              tintColor="#4CAF50"
            />
          </View>
          <Text style={styles.infoTitle}>Current Status</Text>
        </View>
        <View style={styles.statusGrid}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Health</Text>
            <Text style={[styles.statusValue, styles.healthyStatus]}>
              {animalData.healthStatus || 'Healthy'}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Status</Text>
            <Text style={[styles.statusValue, styles.activeStatus]}>
              {animalData.status || 'Active'}
            </Text>
          </View>
        </View>
        <InfoRow label="Production" value={animalData.production || 'N/A'} />
        <InfoRow label="Last Check" value={animalData.lastCheck || 'N/A'} />
      </View>
    </View>
  );

  const getFilteredHealthData = () => {
    if (selectedHealthFilter === 'all') {
      return healthHistory;
    }
    return healthHistory.filter(event => event.eventType === selectedHealthFilter);
  };

  const getEventTypeColor = (eventType) => {
    return eventType === 'vaccination' ? '#4CAF50' : '#2196F3';
  };

  const getEventTypeIcon = (eventType) => {
    return eventType === 'vaccination' ? icons.health : icons.document;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const HealthFilterButtons = () => {
    const filters = [
      { id: 'all', label: 'All Events' },
      { id: 'vaccination', label: 'Vaccinations' },
      { id: 'treatment', label: 'Treatments' },
    ];

    return (
      <View style={styles.healthFilterContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.healthFilterButton,
              selectedHealthFilter === filter.id && styles.selectedHealthFilterButton,
            ]}
            onPress={() => setSelectedHealthFilter(filter.id)}>
            <Text
              style={[
                styles.healthFilterButtonText,
                selectedHealthFilter === filter.id && styles.selectedHealthFilterButtonText,
              ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderHealthEvent = ({ item }) => (
    <View style={styles.healthEventCard}>
      <View style={styles.healthEventHeader}>
        <View style={styles.healthEventTypeContainer}>
          <View style={[
            styles.healthEventTypeIndicator,
            { backgroundColor: getEventTypeColor(item.eventType) }
          ]}>
            <FastImage
              source={getEventTypeIcon(item.eventType)}
              style={styles.healthEventTypeIcon}
              tintColor={COLORS.white}
            />
          </View>
          <View style={styles.healthEventInfo}>
            <Text style={styles.healthEventType}>
              {item.eventType === 'vaccination' ? 'Vaccination' : 'Treatment'}
            </Text>
            <Text style={styles.healthEventDate}>{formatDate(item.date)}</Text>
          </View>
        </View>
        <View style={styles.healthEventCost}>
          <Text style={styles.healthCostText}>KES {item.cost?.toLocaleString() || '0'}</Text>
        </View>
      </View>

      <View style={styles.healthEventBody}>
        <Text style={styles.healthEventDescription}>{item.description}</Text>

        {item.performedBy && (
          <View style={styles.healthEventDetail}>
            <FastImage
              source={icons.account}
              style={styles.healthDetailIcon}
              tintColor="#666"
            />
            <Text style={styles.healthDetailText}>Performed by: {item.performedBy}</Text>
          </View>
        )}

        {item.medications && item.medications.length > 0 && (
          <View style={styles.healthEventDetail}>
            <FastImage
              source={icons.health}
              style={styles.healthDetailIcon}
              tintColor="#666"
            />
            <Text style={styles.healthDetailText}>
              Medications: {item.medications.join(', ')}
            </Text>
          </View>
        )}

        {item.dosage && (
          <View style={styles.healthEventDetail}>
            <FastImage
              source={icons.document}
              style={styles.healthDetailIcon}
              tintColor="#666"
            />
            <Text style={styles.healthDetailText}>Dosage: {item.dosage}</Text>
          </View>
        )}

        {item.nextScheduled && (
          <View style={styles.healthEventDetail}>
            <FastImage
              source={icons.calendar}
              style={styles.healthDetailIcon}
              tintColor="#FF9800"
            />
            <Text style={styles.healthDetailText}>
              Next scheduled: {formatDate(item.nextScheduled)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderHealthRecords = () => {
    const filteredHealthData = getFilteredHealthData();

    return (
      <View style={styles.contentSection}>
        {/* Health Summary Card */}
        <View style={styles.infoCard}>
          <View style={styles.healthSummaryHeader}>
            <View style={styles.cardHeader}>
              <View style={styles.healthIconContainer}>
                <FastImage
                  source={icons.health}
                  style={styles.healthIcon}
                  tintColor="#4CAF50"
                />
              </View>
              <Text style={styles.infoTitle}>Health Summary</Text>
            </View>
            <View style={styles.healthStatusBadge}>
              <Text style={styles.healthStatusText}>
                {animalData.healthStatus || 'Healthy'}
              </Text>
            </View>
          </View>

          <View style={styles.healthStatsContainer}>
            <View style={styles.healthStat}>
              <Text style={styles.healthStatNumber}>{healthHistory.length}</Text>
              <Text style={styles.healthStatLabel}>Total Events</Text>
            </View>
            <View style={styles.healthStat}>
              <Text style={styles.healthStatNumber}>
                {healthHistory.filter(e => e.eventType === 'vaccination').length}
              </Text>
              <Text style={styles.healthStatLabel}>Vaccinations</Text>
            </View>
            <View style={styles.healthStat}>
              <Text style={styles.healthStatNumber}>
                {healthHistory.filter(e => e.eventType === 'treatment').length}
              </Text>
              <Text style={styles.healthStatLabel}>Treatments</Text>
            </View>
          </View>

          <View style={styles.addRecordContainer}>
            <TouchableOpacity
              style={styles.addRecordButton}
              onPress={() =>
                navigation.navigate('HealthRecordsScreen', {
                  animalId: animal.id,
                  animalData: animal
                })
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
          <View style={styles.cardHeader}>
            <View style={styles.recordsIconContainer}>
              <FastImage
                source={icons.document}
                style={styles.recordsIcon}
                tintColor="#4CAF50"
              />
            </View>
            <Text style={styles.infoTitle}>Health Records</Text>
          </View>

          {healthLoading ? (
            <View style={styles.healthLoadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.healthLoadingText}>Loading health records...</Text>
            </View>
          ) : (
            <>
              <HealthFilterButtons />

              {filteredHealthData.length === 0 ? (
                <View style={styles.noHealthRecordsContainer}>
                  <FastImage
                    source={icons.health}
                    style={styles.noHealthRecordsIcon}
                    tintColor="#999"
                  />
                  <Text style={styles.noHealthRecordsTitle}>
                    {selectedHealthFilter === 'all'
                      ? 'No Health Records'
                      : `No ${selectedHealthFilter === 'vaccination' ? 'Vaccination' : 'Treatment'} Records`
                    }
                  </Text>
                  <Text style={styles.noHealthRecordsMessage}>
                    {selectedHealthFilter === 'all'
                      ? 'No health events have been recorded for this animal yet.'
                      : `No ${selectedHealthFilter} records found for this animal.`
                    }
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={filteredHealthData}
                  renderItem={renderHealthEvent}
                  keyExtractor={(item, index) => `${item.id || index}`}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </>
          )}
        </View>
      </View>
    );
  };

  const renderBreeding = () => {
    const isFemale = animalData.gender?.toLowerCase() === 'female';
    const isMale = animalData.gender?.toLowerCase() === 'male';
    const isPoultry = animalData.type === 'poultry' || animalData.livestockType === 'poultry';

    if (isPoultry) {
      return (
        <View style={styles.contentSection}>
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <View style={styles.breedingIconContainer}>
                <FastImage
                  source={icons.heart}
                  style={styles.breedingIcon}
                  tintColor="#4CAF50"
                />
              </View>
              <Text style={styles.infoTitle}>Breeding Information</Text>
            </View>
            <View style={styles.breedingNoticeContainer}>
              <FastImage
                source={icons.info}
                style={styles.infoIcon}
                tintColor="#FF9800"
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
        <View style={styles.cardHeader}>
          <View style={styles.femaleIconContainer}>
            <FastImage
              source={icons.heart}
              style={styles.femaleIcon}
              tintColor="#E91E63"
            />
          </View>
          <Text style={styles.infoTitle}>Breeding Status</Text>
        </View>
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
        <View style={styles.cardHeader}>
          <View style={styles.pregnancyIconContainer}>
            <FastImage
              source={icons.calendar}
              style={styles.pregnancyIcon}
              tintColor="#4CAF50"
            />
          </View>
          <Text style={styles.infoTitle}>Pregnancy History</Text>
        </View>
        {renderPregnancyHistory()}
      </View>

      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <View style={styles.offspringIconContainer}>
            <FastImage
              source={icons.livestock}
              style={styles.offspringIcon}
              tintColor="#4CAF50"
            />
          </View>
          <Text style={styles.infoTitle}>Offspring Records</Text>
        </View>
        {renderOffspringHistory()}
      </View>
    </>
  );

  const renderMaleBreeding = () => (
    <>
      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <View style={styles.maleIconContainer}>
            <FastImage
              source={icons.heart}
              style={styles.maleIcon}
              tintColor="#2196F3"
            />
          </View>
          <Text style={styles.infoTitle}>Breeding Service Record</Text>
        </View>
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
        <View style={styles.cardHeader}>
          <View style={styles.serviceIconContainer}>
            <FastImage
              source={icons.calendar}
              style={styles.serviceIcon}
              tintColor="#4CAF50"
            />
          </View>
          <Text style={styles.infoTitle}>Service History</Text>
        </View>
        {renderServiceHistory()}
      </View>

      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <View style={styles.offspringIconContainer}>
            <FastImage
              source={icons.livestock}
              style={styles.offspringIcon}
              tintColor="#4CAF50"
            />
          </View>
          <Text style={styles.infoTitle}>Offspring Records</Text>
        </View>
        {renderOffspringHistory()}
      </View>
    </>
  );

  const renderUnknownGenderBreeding = () => (
    <View style={styles.infoCard}>
      <View style={styles.cardHeader}>
        <View style={styles.unknownIconContainer}>
          <FastImage
            source={icons.info}
            style={styles.unknownIcon}
            tintColor="#FF9800"
          />
        </View>
        <Text style={styles.infoTitle}>Breeding Information</Text>
      </View>
      <View style={styles.breedingNoticeContainer}>
        <FastImage
          source={icons.info}
          style={styles.infoIcon}
          tintColor="#FF9800"
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
            tintColor="#999"
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
              Expected Due: {record.expectedDueDate || 'N/A'}
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
              {record.offspringId || `Offspring ${index + 1}`}
            </Text>
            <Text style={styles.historySubtext}>
              Gender: {record.gender || 'Unknown'}
            </Text>
            <Text style={styles.historySubtext}>
              Birth Weight: {record.birthWeight || 'N/A'}
            </Text>
            <Text style={styles.historySubtext}>
              Status: {record.status || 'Alive'}
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
      'broiler': 'Meat Production',
      'layer': 'Egg Production',
      'dual-purpose': 'Meat & Egg Production',
      'ornamental': 'Show/Ornamental',
    };
    return purposes[breedType?.toLowerCase()] || 'General Purpose';
  };

  const renderFeeding = () => (
    <View style={styles.contentSection}>
      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <View style={styles.feedingIconContainer}>
            <FastImage
              source={icons.feed}
              style={styles.feedingIcon}
              tintColor="#4CAF50"
            />
          </View>
          <Text style={styles.infoTitle}>Feeding Schedule</Text>
        </View>
        <InfoRow label="Feed Type" value={animalData.feedType || 'Standard Feed'} />
        <InfoRow label="Daily Ration" value={animalData.dailyRation || 'N/A'} />
        <InfoRow label="Feeding Times" value={animalData.feedingTimes || 'Morning & Evening'} />
        <InfoRow label="Last Fed" value={animalData.lastFed || 'Today'} />

        <View style={styles.addRecordContainer}>
          <TouchableOpacity
            style={styles.addRecordButton}
            onPress={() =>
              navigation.navigate('FeedingRecordForm', {
                animalId: animalData.id,
                animalData: animalData
              })
            }>
            <FastImage
              source={icons.add}
              style={styles.addIcon}
              tintColor={COLORS.white}
            />
            <Text style={styles.addRecordText}>Record Feeding</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <View style={styles.nutritionIconContainer}>
            <FastImage
              source={icons.health}
              style={styles.nutritionIcon}
              tintColor="#4CAF50"
            />
          </View>
          <Text style={styles.infoTitle}>Nutritional Information</Text>
        </View>
        <InfoRow label="Current Weight" value={animalData.currentWeight || 'N/A'} />
        <InfoRow label="Target Weight" value={animalData.targetWeight || 'N/A'} />
        <InfoRow label="Weight Gain Rate" value={animalData.weightGainRate || 'N/A'} />
        <InfoRow label="Body Condition Score" value={animalData.bodyConditionScore || 'N/A'} />
      </View>

      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <View style={styles.feedHistoryIconContainer}>
            <FastImage
              source={icons.document}
              style={styles.feedHistoryIcon}
              tintColor="#4CAF50"
            />
          </View>
          <Text style={styles.infoTitle}>Recent Feeding Records</Text>
        </View>
        {renderFeedingHistory()}
      </View>
    </View>
  );

  const renderFeedingHistory = () => {
    const feedingRecords = animalData.feedingHistory || [];
    return feedingRecords.length > 0 ? (
      feedingRecords.slice(0, 5).map((record, index) => (
        <View key={index} style={styles.historyItem}>
          <View style={styles.historyDateContainer}>
            <Text style={styles.historyDate}>{record.date}</Text>
          </View>
          <View style={styles.historyDetails}>
            <Text style={styles.historyTitle}>
              {record.feedType || 'Feed'}
            </Text>
            <Text style={styles.historySubtext}>
              Amount: {record.amount || 'N/A'}
            </Text>
            <Text style={styles.historySubtext}>
              Cost: KES {record.cost?.toLocaleString() || '0'}
            </Text>
          </View>
        </View>
      ))
    ) : (
      <Text style={styles.noRecordsText}>No feeding records found</Text>
    );
  };

  const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value || 'N/A'}</Text>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'health':
        return renderHealthRecords();
      case 'breeding':
        return renderBreeding();
      case 'feeding':
        return renderFeeding();
      default:
        return renderOverview();
    }
  };

  if (!animalData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <SecondaryHeader
          title="Animal Details"
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Animal data not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (


    <SafeAreaView style={styles.container}>
      <SecondaryHeader
        title={animalData.title || animalData.idNumber || 'Animal Details'}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.animalImageContainer}>
            <FastImage
              source={animalData.image ? { uri: animalData.image } : icons.livestock}
              style={styles.animalImage}
              resizeMode={animalData.image ? 'cover' : 'contain'}
            />
          </View>
          <View style={styles.animalTitleContainer}>
            <Text style={styles.animalTitle}>
              {animalData.title || animalData.idNumber || 'Unnamed Animal'}
            </Text>
            <Text style={styles.animalSubtitle}>
              {animalData.type || animalData.livestockType} • {animalData.breedType || animalData.breed}
            </Text>
          </View>
        </View>

        {/* Tab Navigation */}
        {renderTabs()}

        {/* Tab Content */}
        {renderTabContent()}

        {/* Action Buttons */}
        {renderActionButtons()}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Delete Modal */}
      {renderDeleteModal()}

      {/* Success Toast */}
      {renderToast()}

      {/* Loading Overlay */}
      {isDeleting && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Deleting livestock...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },

  // Hero Section Styles
  heroSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  animalImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  animalImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  animalTitleContainer: {
    alignItems: 'center',
  },
  animalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  animalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },

  // Tab Styles
  tabContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 25,
    backgroundColor: '#F8F8F8',
    minWidth: 100,
  },
  activeTab: {
    backgroundColor: '#4CAF50',
  },
  tabIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  activeTabIcon: {
    tintColor: COLORS.white,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4CAF50',
  },
  activeTabText: {
    color: COLORS.white,
  },

  // Content Section Styles
  contentSection: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  animalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  animalIcon: {
    width: 24,
    height: 24,
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusIcon: {
    width: 24,
    height: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },

  // Info Row Styles
  basicInfoContainer: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },

  // Status Grid Styles
  statusGrid: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 15,
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  healthyStatus: {
    color: '#4CAF50',
  },
  activeStatus: {
    color: '#2196F3',
  },

  healthSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  healthIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  healthIcon: {
    width: 24,
    height: 24,
  },
  healthStatusBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  healthStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  healthStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  healthStat: {
    alignItems: 'center',
    flex: 1,
  },
  healthStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  healthStatLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },

  // Health Filter Styles
  healthFilterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  healthFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedHealthFilterButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  healthFilterButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  selectedHealthFilterButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },

  healthEventCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  healthEventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  healthEventTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  healthEventTypeIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  healthEventTypeIcon: {
    width: 20,
    height: 20,
  },
  healthEventInfo: {
    flex: 1,
  },
  healthEventType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  healthEventDate: {
    fontSize: 12,
    color: '#666',
  },
  healthEventCost: {
    alignItems: 'flex-end',
  },
  healthCostText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  healthEventBody: {
    gap: 8,
  },
  healthEventDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  healthEventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  healthDetailIcon: {
    width: 16,
    height: 16,
  },
  healthDetailText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },

  // Loading Styles
  healthLoadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  healthLoadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },

  // No Records Styles
  noHealthRecordsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noHealthRecordsIcon: {
    width: 48,
    height: 48,
    marginBottom: 15,
  },
  noHealthRecordsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  noHealthRecordsMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Breeding Styles
  breedingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  breedingIcon: {
    width: 24,
    height: 24,
  },
  femaleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FCE4EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  femaleIcon: {
    width: 24,
    height: 24,
  },
  maleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  maleIcon: {
    width: 24,
    height: 24,
  },
  unknownIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  unknownIcon: {
    width: 24,
    height: 24,
  },
  pregnancyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pregnancyIcon: {
    width: 24,
    height: 24,
  },
  serviceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceIcon: {
    width: 24,
    height: 24,
  },
  offspringIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  offspringIcon: {
    width: 24,
    height: 24,
  },
  breedingNoticeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    gap: 10,
  },
  infoIcon: {
    width: 20,
    height: 20,
    marginTop: 2,
  },
  breedingNoticeText: {
    fontSize: 14,
    color: '#F57C00',
    lineHeight: 20,
    flex: 1,
  },

  // Feeding Styles
  feedingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  feedingIcon: {
    width: 24,
    height: 24,
  },
  nutritionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nutritionIcon: {
    width: 24,
    height: 24,
  },
  feedHistoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  feedHistoryIcon: {
    width: 24,
    height: 24,
  },
  recordsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recordsIcon: {
    width: 24,
    height: 24,
  },

  // History Item Styles
  historyItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  historyDateContainer: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  historyDate: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  historyDetails: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  historySubtext: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  noRecordsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },

  // Add Record Button Styles
  addRecordContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  addRecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
  addIcon: {
    width: 16,
    height: 16,
  },
  addRecordText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  disabledText: {
    color: '#999',
  },

  // Action Buttons Styles
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 15,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 8,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#FF4444',
  },
  actionIcon: {
    width: 20,
    height: 20,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  modalHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  warningIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  warningIcon: {
    width: 30,
    height: 30,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  animalName: {
    fontWeight: 'bold',
    color: '#333',
  },
  modalFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F8F8F8',
    borderRightWidth: 1,
    borderRightColor: '#F0F0F0',
  },
  deleteModalButton: {
    backgroundColor: '#FF4444',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },

  // Toast Styles
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    marginHorizontal: 20,
    marginTop: 50,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    gap: 10,
  },
  toastIcon: {
    width: 20,
    height: 20,
  },
  toastText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
    flex: 1,
  },

  // Loading Overlay
  // Loading overlay continued
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingContainer: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 40,
  },
});

export default AnimalDetailScreen;
