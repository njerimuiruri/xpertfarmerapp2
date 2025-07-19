import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  Alert,
  Modal,
  SafeAreaView,
  Dimensions,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import { icons } from '../../../constants';
import { COLORS } from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';
import {
  getVaccinationsForLivestock,
  deleteVaccination,
  getVaccinationById
} from '../../../services/healthservice';

const { width } = Dimensions.get('window');

const VaccineRecordsScreen = ({ navigation, route }) => {
  const { animalId, animalData } = route.params;

  const [vaccineRecords, setVaccineRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [error, setError] = useState(null);

  // Load vaccination records on component mount
  useEffect(() => {
    loadVaccinationRecords();
  }, [animalId]);

  // Refresh data when coming back to this screen (e.g., after adding a new vaccine)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadVaccinationRecords();
    });

    return unsubscribe;
  }, [navigation, animalId]);

  const loadVaccinationRecords = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getVaccinationsForLivestock(animalId);

      if (result.error) {
        setError(result.error);
        Alert.alert('Error', result.error);
      } else {
        // Transform the data to match your UI expectations
        const transformedData = result.data.map(record => ({
          ...record,
          // Map API fields to UI fields if they're different
          id: record.id || record._id,
          animalId: record.livestockId,
          animalType: animalData?.type || 'Livestock',
          // Add any missing fields with defaults
          category: record.category || determineCategory(record.vaccinationAgainst),
          status: record.status || determineStatus(record.dateAdministered, record.nextDueDate),
          nextDueDate: record.nextDueDate || calculateNextDueDate(record.dateAdministered, record.vaccinationAgainst),
          batchNumber: record.batchNumber || 'N/A',
          manufacturer: record.manufacturer || 'N/A',
          notes: record.notes || '',
          priority: record.priority || 'medium',
        }));

        setVaccineRecords(transformedData);
      }
    } catch (err) {
      console.error('Error loading vaccination records:', err);
      setError('Failed to load vaccination records');
      Alert.alert('Error', 'Failed to load vaccination records');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadVaccinationRecords();
    setRefreshing(false);
  }, [animalId]);

  // Helper function to determine category based on vaccination type
  const determineCategory = (vaccinationAgainst) => {
    const vaccination = vaccinationAgainst?.toLowerCase() || '';
    if (vaccination.includes('newcastle') || vaccination.includes('influenza') || vaccination.includes('fmd')) {
      return 'viral';
    } else if (vaccination.includes('anthrax') || vaccination.includes('blackleg') || vaccination.includes('brucell')) {
      return 'bacterial';
    } else if (vaccination.includes('worm') || vaccination.includes('parasite')) {
      return 'parasitic';
    }
    return 'other';
  };

  // Helper function to determine status based on dates
  const determineStatus = (dateAdministered, nextDueDate) => {
    if (!nextDueDate) return 'completed';

    const now = new Date();
    const dueDate = new Date(nextDueDate);
    const daysDiff = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) return 'overdue';
    if (daysDiff <= 30) return 'due_soon';
    return 'completed';
  };

  // Helper function to calculate next due date (this would be better handled by your backend)
  const calculateNextDueDate = (dateAdministered, vaccinationAgainst) => {
    const adminDate = new Date(dateAdministered);
    const vaccination = vaccinationAgainst?.toLowerCase() || '';

    // Add different intervals based on vaccination type
    let monthsToAdd = 12; // Default to annual
    if (vaccination.includes('fmd')) monthsToAdd = 6;
    if (vaccination.includes('newcastle')) monthsToAdd = 4;

    adminDate.setMonth(adminDate.getMonth() + monthsToAdd);
    return adminDate.toISOString();
  };

  const categories = ['all', 'viral', 'bacterial', 'parasitic', 'other'];
  const statuses = ['all', 'completed', 'due_soon', 'overdue'];

  const sortedAndFilteredRecords = useMemo(() => {
    return vaccineRecords
      .filter(record => {
        const matchesSearch =
          searchQuery === '' ||
          record.vaccinationAgainst?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.drugAdministered?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.administeredBy?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = filterCategory === 'all' || record.category === filterCategory;
        const matchesStatus = filterStatus === 'all' || record.status === filterStatus;

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return sortOrder === 'desc'
            ? new Date(b.dateAdministered) - new Date(a.dateAdministered)
            : new Date(a.dateAdministered) - new Date(b.dateAdministered);
        } else if (sortBy === 'vaccine') {
          return sortOrder === 'asc'
            ? a.vaccinationAgainst?.localeCompare(b.vaccinationAgainst)
            : b.vaccinationAgainst?.localeCompare(a.vaccinationAgainst);
        } else if (sortBy === 'cost') {
          const costA = (parseInt(a.costOfVaccine) || 0) + (parseInt(a.costOfService) || 0);
          const costB = (parseInt(b.costOfVaccine) || 0) + (parseInt(b.costOfService) || 0);
          return sortOrder === 'desc' ? costB - costA : costA - costB;
        }
        return 0;
      });
  }, [vaccineRecords, searchQuery, sortBy, sortOrder, filterCategory, filterStatus]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#22C55E';
      case 'due_soon': return '#F59E0B';
      case 'overdue': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'due_soon': return 'Due Soon';
      case 'overdue': return 'Overdue';
      default: return 'Unknown';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'viral': return '#8B5CF6';
      case 'bacterial': return '#06B6D4';
      case 'parasitic': return '#F97316';
      default: return '#6B7280';
    }
  };

  const toggleSort = useCallback((newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  }, [sortBy]);

  const handleRecordPress = async (record) => {
    try {
      const detailResult = await getVaccinationById(record.id);

      if (detailResult.error) {
        Alert.alert('Error', 'Failed to load vaccination details');
        setSelectedRecord(record);
      } else {
        setSelectedRecord(detailResult.data);
      }

      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching vaccination details:', error);
      setSelectedRecord(record); // Use cached data
      setShowDetailModal(true);
    }
  };

  const handleDelete = useCallback(async (id) => {
    Alert.alert(
      'Delete Vaccine Record',
      'Are you sure you want to delete this vaccine record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteVaccination(id);

              if (result.error) {
                Alert.alert('Error', result.error);
              } else {
                // Remove from local state
                setVaccineRecords(prev => prev.filter(record => record.id !== id));
                Alert.alert('Success', 'Vaccination record deleted successfully');
                setShowDetailModal(false);
              }
            } catch (error) {
              console.error('Error deleting vaccination:', error);
              Alert.alert('Error', 'Failed to delete vaccination record');
            }
          },
        },
      ],
    );
  }, []);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={styles.animalCard}>
        <View style={styles.animalCardContent}>

          <View style={[styles.animalAvatar, { backgroundColor: COLORS.green3 }]}>
            <FastImage
              source={icons.livestock || icons.account}
              style={styles.animalAvatarIcon}
              tintColor="#FFFFFF"
            />
            <View style={styles.statusIndicator} />
          </View>
          <View style={styles.animalInfo}>
            <Text style={styles.animalName}>{animalData?.title || animalData?.name || 'Animal'}</Text>
            <Text style={styles.animalBreed}>{animalData?.breed || 'Unknown Breed'}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadVaccinationRecords} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <FastImage
          source={icons.search}
          style={styles.searchIcon}
          tintColor={COLORS.gray}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search vaccines, drugs, veterinarian..."
          placeholderTextColor={COLORS.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <FastImage
              source={icons.close}
              style={styles.clearIcon}
              tintColor={COLORS.gray}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={[styles.actionButton, showFilters && styles.activeActionButton]}
          onPress={() => setShowFilters(!showFilters)}>
          <FastImage
            source={icons.filter}
            style={styles.actionIcon}
            tintColor={showFilters ? COLORS.white : COLORS.black}
          />
          <Text style={[styles.actionText, showFilters && styles.activeActionText]}>
            Filters {(filterCategory !== 'all' || filterStatus !== 'all') && '●'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => toggleSort('date')}>
          <FastImage
            source={icons.calendar}
            style={styles.actionIcon}
            tintColor={COLORS.black}
          />
          <Text style={styles.actionText}>
            {sortBy === 'date' ? (sortOrder === 'desc' ? 'Newest' : 'Oldest') : 'Date'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => toggleSort('cost')}>
          <FastImage
            source={icons.money}
            style={styles.actionIcon}
            tintColor={COLORS.black}
          />
          <Text style={styles.actionText}>
            {sortBy === 'cost' ? (sortOrder === 'desc' ? 'High Cost' : 'Low Cost') : 'Cost'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Options */}
      {showFilters && (
        <View style={styles.filterContainer}>
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterOptions}>
                {categories.map(category => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.filterOption,
                      filterCategory === category && styles.activeFilter
                    ]}
                    onPress={() => setFilterCategory(category)}>
                    <Text style={[
                      styles.filterOptionText,
                      filterCategory === category && styles.activeFilterText
                    ]}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterOptions}>
                {statuses.map(status => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterOption,
                      filterStatus === status && styles.activeFilter
                    ]}
                    onPress={() => setFilterStatus(status)}>
                    <Text style={[
                      styles.filterOptionText,
                      filterStatus === status && styles.activeFilterText
                    ]}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {sortedAndFilteredRecords.length} vaccination record{sortedAndFilteredRecords.length !== 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  );

  const renderVaccineCard = ({ item }) => (
    <TouchableOpacity
      style={styles.vaccineCard}
      onPress={() => handleRecordPress(item)}
      activeOpacity={0.85}>

      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={styles.cardGradient}>

        <View style={styles.cardHeader}>
          <View style={styles.vaccineInfo}>
            <Text style={styles.vaccineName}>{item.vaccinationAgainst}</Text>
            <Text style={styles.vaccineDrug}>{item.drugAdministered}</Text>
          </View>

          <View style={styles.cardHeaderRight}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
            </View>
          </View>
        </View>

        {/* Card Body */}
        <View style={styles.cardBody}>
          <View style={styles.detailRow}>
            <FastImage source={icons.calendar} style={styles.detailIcon} tintColor="#6B7280" />
            <Text style={styles.detailLabel}>Administered:</Text>
            <Text style={styles.detailValue}>
              {new Date(item.dateAdministered).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <FastImage source={icons.user} style={styles.detailIcon} tintColor="#6B7280" />
            <Text style={styles.detailLabel}>Veterinarian:</Text>
            <Text style={styles.detailValue}>{item.administeredBy}</Text>
          </View>

          <View style={styles.detailRow}>
            <FastImage source={icons.medicine} style={styles.detailIcon} tintColor="#6B7280" />
            <Text style={styles.detailLabel}>Dosage:</Text>
            <Text style={styles.detailValue}>{item.dosage}</Text>
          </View>

          <View style={styles.detailRow}>
            <FastImage source={icons.money} style={styles.detailIcon} tintColor="#6B7280" />
            <Text style={styles.detailLabel}>Total Cost:</Text>
            <Text style={styles.costValue}>
              KES {((parseInt(item.costOfVaccine) || 0) + (parseInt(item.costOfService) || 0)).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Card Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.categoryTag}>
            <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(item.category) }]} />
            <Text style={styles.categoryText}>{item.category?.charAt(0).toUpperCase() + item.category?.slice(1)}</Text>
          </View>

          {item.nextDueDate && (
            <Text style={styles.nextDueText}>
              Next due: {new Date(item.nextDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          )}
        </View>

      </LinearGradient>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <SecondaryHeader
          title="Health Records"
          showBack={true}
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading vaccination records...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderDetailModal = () => (
    <Modal
      visible={showDetailModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowDetailModal(false)}>

      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Vaccination Details</Text>
          <TouchableOpacity onPress={() => setShowDetailModal(false)}>
            <FastImage source={icons.close} style={styles.modalCloseIcon} tintColor={COLORS.black} />
          </TouchableOpacity>
        </View>

        {selectedRecord && (
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>

            {/* Status Card */}
            <View style={[styles.modalStatusCard, { borderLeftColor: getStatusColor(selectedRecord.status) }]}>
              <Text style={styles.modalVaccineName}>{selectedRecord.vaccinationAgainst}</Text>
              <Text style={styles.modalStatusText}>{getStatusText(selectedRecord.status)}</Text>
            </View>

            {/* Basic Information */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Basic Information</Text>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Drug Administered</Text>
                <Text style={styles.modalDetailValue}>{selectedRecord.drugAdministered}</Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Date Administered</Text>
                <Text style={styles.modalDetailValue}>
                  {new Date(selectedRecord.dateAdministered).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Dosage</Text>
                <Text style={styles.modalDetailValue}>{selectedRecord.dosage}</Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Category</Text>
                <View style={styles.modalCategoryContainer}>
                  <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(selectedRecord.category) }]} />
                  <Text style={styles.modalDetailValue}>{selectedRecord.category?.charAt(0).toUpperCase() + selectedRecord.category?.slice(1)}</Text>
                </View>
              </View>
            </View>

            {/* Veterinarian Information */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Veterinarian Information</Text>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Administered By</Text>
                <Text style={styles.modalDetailValue}>{selectedRecord.administeredBy}</Text>
              </View>

              {selectedRecord.practiceId && (
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Practice ID</Text>
                  <Text style={styles.modalDetailValue}>{selectedRecord.practiceId}</Text>
                </View>
              )}
            </View>

            {/* Vaccine Information */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Vaccine Information</Text>

              {selectedRecord.batchNumber && selectedRecord.batchNumber !== 'N/A' && (
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Batch Number</Text>
                  <Text style={styles.modalDetailValue}>{selectedRecord.batchNumber}</Text>
                </View>
              )}

              {selectedRecord.manufacturer && selectedRecord.manufacturer !== 'N/A' && (
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Manufacturer</Text>
                  <Text style={styles.modalDetailValue}>{selectedRecord.manufacturer}</Text>
                </View>
              )}
            </View>

            {/* Cost Information */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Cost Breakdown</Text>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Vaccine Cost</Text>
                <Text style={styles.modalDetailValue}>KES {(parseInt(selectedRecord.costOfVaccine) || 0).toLocaleString()}</Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Service Cost</Text>
                <Text style={styles.modalDetailValue}>KES {(parseInt(selectedRecord.costOfService) || 0).toLocaleString()}</Text>
              </View>

              <View style={[styles.modalDetailRow, styles.totalCostRow]}>
                <Text style={styles.modalTotalLabel}>Total Cost</Text>
                <Text style={styles.modalTotalValue}>
                  KES {((parseInt(selectedRecord.costOfVaccine) || 0) + (parseInt(selectedRecord.costOfService) || 0)).toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Schedule Information */}
            {selectedRecord.nextDueDate && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Schedule</Text>

                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Next Due Date</Text>
                  <Text style={styles.modalDetailValue}>
                    {new Date(selectedRecord.nextDueDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                </View>
              </View>
            )}

            {/* Notes */}
            {selectedRecord.notes && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Notes</Text>
                <Text style={styles.modalNotes}>{selectedRecord.notes}</Text>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalActionButton}
                onPress={() => {
                  setShowDetailModal(false);
                  navigation.navigate('VaccineEditScreen', {
                    recordId: selectedRecord.id,
                    animalId,
                    animalData
                  });
                }}>
                <FastImage source={icons.edit} style={styles.modalActionIcon} tintColor="#2196F3" />
                <Text style={[styles.modalActionText, { color: '#2196F3' }]}>Edit Record</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalActionButton}
                onPress={() => handleDelete(selectedRecord.id)}>
                <FastImage source={icons.remove} style={styles.modalActionIcon} tintColor="#EF4444" />
                <Text style={[styles.modalActionText, { color: '#EF4444' }]}>Delete Record</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <FastImage source={icons.medicine} style={styles.emptyStateIcon} tintColor={COLORS.gray} />
      <Text style={styles.emptyStateTitle}>No Vaccination Records</Text>
      <Text style={styles.emptyStateMessage}>
        This animal doesn't have any vaccination records yet.
      </Text>
      <TouchableOpacity
        style={styles.emptyStateButton}
        onPress={() => navigation.navigate('AddVaccineRecords', { animalId, animalData })}>
        <Text style={styles.emptyStateButtonText}>Add First Record</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader
        title="Health Records"
        showBack={true}
        onBack={() => navigation.goBack()}
      />

      {sortedAndFilteredRecords.length > 0 ? (
        <FlatList
          data={sortedAndFilteredRecords}
          renderItem={renderVaccineCard}
          keyExtractor={item => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ flex: 1 }}>
          {renderHeader()}
          {renderEmptyState()}
        </ScrollView>
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddVaccineRecords', { animalId, animalData })}>
        <FastImage source={icons.plus} style={styles.fabIcon} tintColor="#FFFFFF" />
      </TouchableOpacity>

      {renderDetailModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },

  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  listContent: {
    paddingBottom: 100,
  },

  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  animalCard: {
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  animalCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  animalAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  animalAvatarIcon: {
    width: 30,
    height: 30,
  },
  animalInfo: {
    flex: 1,
  },
  animalName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  animalId: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  animalBreed: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  clearIcon: {
    width: 20,
    height: 20,
    marginLeft: 8,
  },

  actionBar: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activeActionButton: {
    backgroundColor: '#111827',
  },
  actionIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  activeActionText: {
    color: '#FFFFFF',
  },

  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    paddingRight: 16,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#10B981',
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },

  resultsContainer: {
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },

  vaccineCard: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  cardGradient: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 16,
  },
  vaccineInfo: {
    flex: 1,
    marginRight: 12,
  },
  vaccineName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  vaccineDrug: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  cardHeaderRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  cardBody: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    flex: 1,
  },
  costValue: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    flex: 1,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  nextDueText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },

  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    width: 24,
    height: 24,
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyStateButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalCloseIcon: {
    width: 24,
    height: 24,
  },

  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalStatusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalVaccineName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  modalStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },

  modalSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },

  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalDetailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    flex: 1,
  },
  modalDetailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  modalCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 2,
  },

  totalCostRow: {
    borderBottomWidth: 0,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
  },
  modalTotalLabel: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '700',
    flex: 1,
  },
  modalTotalValue: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '700',
    flex: 2,
    textAlign: 'right',
  },

  modalNotes: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    marginBottom: 20,
  },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalActionIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  modalActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default VaccineRecordsScreen;