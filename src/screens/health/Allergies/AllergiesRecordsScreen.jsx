import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
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
  getAllergiesForLivestock,
  deleteAllergy,
} from '../../../services/healthservice';

const { width } = Dimensions.get('window');

const AllergiesRecordsScreen = ({ navigation, route }) => {
  const { animalId, animalData } = route.params;

  const [allergyRecords, setAllergyRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [error, setError] = useState(null);

  // Load allergy records on component mount
  useEffect(() => {
    loadAllergyRecords();
  }, [animalId]);

  // Refresh data when coming back to this screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadAllergyRecords();
    });

    return unsubscribe;
  }, [navigation, animalId]);

  const loadAllergyRecords = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getAllergiesForLivestock(animalId);

      if (result.error) {
        setError(result.error);
        Alert.alert('Error', result.error);
      } else {
        setAllergyRecords(result.data || []);
      }
    } catch (err) {
      console.error('Error loading allergy records:', err);
      setError('Failed to load allergy records');
      Alert.alert('Error', 'Failed to load allergy records');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllergyRecords();
    setRefreshing(false);
  }, [animalId]);

  const sortedAndFilteredRecords = useMemo(() => {
    return allergyRecords
      .filter(record => {
        const matchesSearch =
          searchQuery === '' ||
          record.cause?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.remedy?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return sortOrder === 'desc'
            ? new Date(b.dateRecorded) - new Date(a.dateRecorded)
            : new Date(a.dateRecorded) - new Date(b.dateRecorded);
        } else if (sortBy === 'cause') {
          return sortOrder === 'asc'
            ? a.cause?.localeCompare(b.cause)
            : b.cause?.localeCompare(a.cause);
        }
        return 0;
      });
  }, [allergyRecords, searchQuery, sortBy, sortOrder]);

  const toggleSort = useCallback((newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  }, [sortBy]);

  const handleRecordPress = async (record) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  const handleDelete = useCallback(async (id) => {
    Alert.alert(
      'Delete Allergy Record',
      'Are you sure you want to delete this allergy record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteAllergy(id);

              if (result.error) {
                Alert.alert('Error', result.error);
              } else {
                // Remove from local state
                setAllergyRecords(prev => prev.filter(record => record.id !== id));
                Alert.alert('Success', 'Allergy record deleted successfully');
                setShowDetailModal(false);
              }
            } catch (error) {
              console.error('Error deleting allergy:', error);
              Alert.alert('Error', 'Failed to delete allergy record');
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
          <TouchableOpacity onPress={loadAllergyRecords} style={styles.retryButton}>
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
          placeholder="Search cause, remedy..."
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
          onPress={() => toggleSort('cause')}>
          <FastImage
            source={icons.medicine}
            style={styles.actionIcon}
            tintColor={COLORS.black}
          />
          <Text style={styles.actionText}>
            {sortBy === 'cause' ? (sortOrder === 'desc' ? 'Z-A' : 'A-Z') : 'Cause'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {sortedAndFilteredRecords.length} allergy record{sortedAndFilteredRecords.length !== 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  );

  const renderAllergyCard = ({ item }) => (
    <TouchableOpacity
      style={styles.allergyCard}
      onPress={() => handleRecordPress(item)}
      activeOpacity={0.85}>

      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={styles.cardGradient}>

        <View style={styles.cardHeader}>
          <View style={styles.allergyInfo}>
            <Text style={styles.allergyName}>{item.cause}</Text>
            <Text style={styles.allergyRemedy}>{item.remedy}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.cardActionButton}
              onPress={(e) => {
                e.stopPropagation();
                navigation.navigate('EditAllergyRecord', {
                  recordId: item.id,
                  animalId,
                  animalData
                });
              }}>
              <FastImage
                source={icons.edit}
                style={styles.cardActionIcon}
                tintColor="#2196F3"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cardActionButton}
              onPress={(e) => {
                e.stopPropagation();
                handleDelete(item.id);
              }}>
              <FastImage
                source={icons.remove}
                style={styles.cardActionIcon}
                tintColor="#EF4444"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Card Body */}
        <View style={styles.cardBody}>
          <View style={styles.detailRow}>
            <FastImage source={icons.calendar} style={styles.detailIcon} tintColor="#6B7280" />
            <Text style={styles.detailLabel}>Recorded:</Text>
            <Text style={styles.detailValue}>
              {new Date(item.dateRecorded).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <FastImage source={icons.livestock} style={styles.detailIcon} tintColor="#6B7280" />
            <Text style={styles.detailLabel}>Animal ID:</Text>
            <Text style={styles.detailValue}>{item.animalIdOrFlockId}</Text>
          </View>
        </View>

        {/* View More Button */}
        <TouchableOpacity
          style={styles.viewMoreButton}
          onPress={() => handleRecordPress(item)}>
          <Text style={styles.viewMoreText}>View Details</Text>
          <FastImage
            source={icons.rightArrow}
            style={styles.viewMoreIcon}
            tintColor="#6B7280"
          />
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <SecondaryHeader
          title="Allergy Records"
          showBack={true}
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading allergy records...</Text>
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
          <Text style={styles.modalTitle}>Allergy Details</Text>
          <TouchableOpacity onPress={() => setShowDetailModal(false)}>
            <FastImage source={icons.close} style={styles.modalCloseIcon} tintColor={COLORS.black} />
          </TouchableOpacity>
        </View>

        {selectedRecord && (
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>

            {/* Status Card */}
            <View style={styles.modalStatusCard}>
              <Text style={styles.modalAllergyName}>{selectedRecord.cause}</Text>
              <Text style={styles.modalStatusText}>Allergy Record</Text>
            </View>

            {/* Basic Information */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Basic Information</Text>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Allergen/Cause</Text>
                <Text style={styles.modalDetailValue}>{selectedRecord.cause}</Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Animal ID</Text>
                <Text style={styles.modalDetailValue}>{selectedRecord.animalIdOrFlockId}</Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Date Recorded</Text>
                <Text style={styles.modalDetailValue}>
                  {new Date(selectedRecord.dateRecorded).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>
            </View>

            {/* Treatment Information */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Treatment Information</Text>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Remedy/Treatment</Text>
                <Text style={styles.modalDetailValue}>{selectedRecord.remedy}</Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalActionButton}
                onPress={() => {
                  setShowDetailModal(false);
                  navigation.navigate('EditAllergyRecord', {
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
      <Text style={styles.emptyStateTitle}>No Allergy Records</Text>
      <Text style={styles.emptyStateMessage}>
        This animal doesn't have any allergy records yet.
      </Text>
      <TouchableOpacity
        style={styles.emptyStateButton}
        onPress={() => navigation.navigate('AddAllergiesRecords', { animalId, animalData })}>
        <Text style={styles.emptyStateButtonText}>Add First Record</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader
        title="Allergy Records"
        showBack={true}
        onBack={() => navigation.goBack()}
      />

      {sortedAndFilteredRecords.length > 0 ? (
        <FlatList
          data={sortedAndFilteredRecords}
          renderItem={renderAllergyCard}
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
        onPress={() => navigation.navigate('AddAllergiesRecords', { animalId, animalData })}>
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
    marginLeft: 12,
  },

  actionBar: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },

  resultsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },

  allergyCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardGradient: {
    borderRadius: 16,
    padding: 16,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  allergyInfo: {
    flex: 1,
    marginRight: 12,
  },
  allergyName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  allergyRemedy: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },

  cardBody: {
    marginBottom: 12,
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
    marginRight: 6,
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardActionButton: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  cardActionIcon: {
    width: 16,
    height: 16,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  viewMoreText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginRight: 4,
  },
  viewMoreIcon: {
    width: 12,
    height: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateIcon: {
    width: 64,
    height: 64,
    marginBottom: 16,
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
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
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
    padding: 20,
  },

  modalStatusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  modalAllergyName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  modalStatusText: {
    fontSize: 14,
    color: '#6B7280',
  },

  modalSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },

  modalDetailRow: {
    marginBottom: 12,
  },
  modalDetailLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  modalDetailValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  modalActionIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  modalActionText: {
    fontSize: 16,
    fontWeight: '600',
  },

  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

export default AllergiesRecordsScreen;