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
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { icons } from '../../../constants';
import { COLORS } from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';

const initialDewormingData = [
  {
    id: '1',
    animalIdOrFlockId: 'A001',
    dewormingAgainst: 'Roundworms',
    drugAdministered: 'Ivermectin',
    dateAdministered: '2023-05-10',
    dosage: '5',
    costOfVaccine: '150',
    administeredBy: 'Dr. Jane Doe',
    practiceId: 'VET2023',
    costOfService: '50',
  },
  {
    id: '2',
    animalIdOrFlockId: 'A002',
    dewormingAgainst: 'Tapeworms',
    drugAdministered: 'Praziquantel',
    dateAdministered: '2023-06-15',
    dosage: '3',
    costOfVaccine: '100',
    administeredBy: 'Dr. John Smith',
    practiceId: 'VET2024',
    costOfService: '30',
  },
];

const DewormingRecordsScreen = ({ navigation }) => {
  const [dewormingRecords, setDewormingRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterDewormingType, setFilterDewormingType] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setDewormingRecords(initialDewormingData);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let count = 0;
    if (filterDewormingType) count++;
    if (searchQuery) count++;
    setActiveFilters(count);
  }, [filterDewormingType, searchQuery]);

  const sortedAndFilteredRecords = useMemo(() => {
    return dewormingRecords
      .filter(record => {
        const matchesSearch =
          searchQuery === '' ||
          record.animalIdOrFlockId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.dewormingAgainst.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDewormingType =
          filterDewormingType === '' || record.dewormingAgainst === filterDewormingType;

        return matchesSearch && matchesDewormingType;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return sortOrder === 'desc'
            ? new Date(b.dateAdministered) - new Date(a.dateAdministered)
            : new Date(a.dateAdministered) - new Date(b.dateAdministered);
        } else if (sortBy === 'animalId') {
          return sortOrder === 'asc'
            ? a.animalIdOrFlockId.localeCompare(b.animalIdOrFlockId)
            : b.animalIdOrFlockId.localeCompare(a.animalIdOrFlockId);
        }
        return 0;
      });
  }, [dewormingRecords, searchQuery, sortBy, sortOrder, filterDewormingType]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const showToast = message => {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  };

  const handleDelete = useCallback(id => {
    Alert.alert(
      'Delete Deworming Record',
      'Are you sure you want to delete this deworming record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDewormingRecords(prev => prev.filter(record => record.id !== id));
            showToast('Record deleted successfully');
          },
        },
      ],
    );
  }, []);

  const handleEdit = useCallback(
    record => {
      navigation.navigate('DewormingEditScreen', { record });
    },
    [navigation],
  );

  const toggleSort = useCallback(
    newSortBy => {
      if (sortBy === newSortBy) {
        setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortBy(newSortBy);
        setSortOrder('desc');
      }
      showToast(`Sorted by ${newSortBy === 'date' ? 'date' : 'animal ID'} (${sortOrder})`);
    },
    [sortBy, sortOrder],
  );

  const resetAllFilters = () => {
    setFilterDewormingType('');
    setSearchQuery('');
    setSortBy('date');
    setSortOrder('desc');
    setIsFilterModalVisible(false);
    showToast('All filters reset');
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.searchContainer}>
        <FastImage source={icons.search} style={styles.searchIcon} tintColor={COLORS.black} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by ID or deworming..."
          placeholderTextColor={COLORS.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <FastImage source={icons.close} style={styles.clearIcon} tintColor={COLORS.gray} />
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={[styles.actionButton, activeFilters > 0 && styles.activeFilterButton]}
          onPress={() => setIsFilterModalVisible(true)}>
          <FastImage source={icons.filter} style={styles.actionIcon} tintColor={activeFilters > 0 ? COLORS.white : COLORS.black} />
          <Text style={[styles.actionText, activeFilters > 0 && styles.activeFilterText]}>
            Filters {activeFilters > 0 ? `(${activeFilters})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => toggleSort('date')}>
          <FastImage source={sortBy === 'date' ? icons.calendar : icons.sort} style={styles.actionIcon} tintColor={COLORS.black} />
          <Text style={styles.actionText}>
            {sortBy === 'date' && sortOrder === 'desc' ? 'Newest' : sortBy === 'date' && sortOrder === 'asc' ? 'Oldest' : 'Sort'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <FastImage source={icons.emptyList} style={styles.emptyStateIcon} tintColor={COLORS.gray} />
      <Text style={styles.emptyStateTitle}>No Records Found</Text>
      <Text style={styles.emptyStateMessage}>
        {activeFilters > 0 ? 'Try removing some filters or changing your search.' : 'Start by adding your first deworming record.'}
      </Text>
      {activeFilters > 0 && (
        <TouchableOpacity style={styles.emptyStateButton} onPress={resetAllFilters}>
          <Text style={styles.emptyStateButtonText}>Clear All Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderDewormingCard = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.animalInfo}>
          <Text style={styles.animalId}>{item.animalIdOrFlockId}</Text>
        </View>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{new Date(item.dateAdministered).toLocaleDateString()}</Text>
        </View>
      </View>

      <View style={styles.dewormingDetails}>
        <View style={styles.detailRow}>
          <FastImage source={icons.medicine} style={styles.detailIcon} tintColor={COLORS.green} />
          <Text style={styles.detailLabel}>Against:</Text>
          <Text style={styles.detailText}>{item.dewormingAgainst}</Text>
        </View>

        <View style={styles.detailRow}>
          <FastImage source={icons.droplet} style={styles.detailIcon} tintColor={COLORS.green} />
          <Text style={styles.detailLabel}>Drug:</Text>
          <Text style={styles.detailText}>{item.drugAdministered}</Text>
        </View>

        <View style={styles.detailRow}>
          <FastImage source={icons.chart} style={styles.detailIcon} tintColor={COLORS.green} />
          <Text style={styles.detailLabel}>Dosage:</Text>
          <Text style={styles.detailText}>{item.dosage} ml</Text>
        </View>

        <View style={styles.detailRow}>
          <FastImage source={icons.doctor} style={styles.detailIcon} tintColor={COLORS.green} />
          <Text style={styles.detailLabel}>Admin By:</Text>
          <Text style={styles.detailText}>{item.administeredBy}</Text>
        </View>

        <View style={styles.detailRow}>
          <FastImage source={icons.money} style={styles.detailIcon} tintColor={COLORS.green} />
          <Text style={styles.detailLabel}>Total Cost:</Text>
          <Text style={styles.detailText}>${(parseInt(item.costOfVaccine) + parseInt(item.costOfService)).toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => handleEdit(item)} style={styles.cardActionButton}>
          <FastImage source={icons.edit} style={styles.actionButtonIcon} tintColor="#2196F3" />
          <Text style={[styles.actionButtonText, { color: '#2196F3' }]}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.cardActionButton}>
          <FastImage source={icons.remove} style={styles.actionButtonIcon} tintColor="#F44336" />
          <Text style={[styles.actionButtonText, { color: '#F44336' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderFilterModal = () => {
    const dewormingTypes = [
      'Roundworms',
      'Tapeworms',
    ];
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterModalVisible}
        onRequestClose={() => setIsFilterModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter by Deworming Type</Text>
            
            {dewormingTypes.map(option => (
              <TouchableOpacity
                key={option}
                style={[styles.filterOption, filterDewormingType === option && styles.selectedFilterOption]}
                onPress={() => {
                  setFilterDewormingType(prev => (prev === option ? '' : option));
                }}>
                <Text style={[styles.filterOptionText, filterDewormingType === option && styles.selectedFilterOptionText]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}

            <View style={styles.filterButtonsContainer}>
              <TouchableOpacity style={styles.applyButton} onPress={() => {
                setIsFilterModalVisible(false);
                if (filterDewormingType) {
                  showToast('Filters applied');
                }
              }}>
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.resetButton} onPress={resetAllFilters}>
                <Text style={styles.resetButtonText}>Reset All</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar translucent backgroundColor={COLORS.green2} animated={true} barStyle={'light-content'} />
        <SecondaryHeader title="Deworming Records" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={COLORS.green} />
          <Text style={styles.loadingText}>Loading records...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader title="Deworming Records" />
      <StatusBar translucent backgroundColor={COLORS.green2} animated={true} barStyle={'light-content'} />
      
      {renderHeader()}
      
      <FlatList
        data={sortedAndFilteredRecords}
        renderItem={renderDewormingCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddDewormingRecords')}>
        <FastImage source={icons.plus} style={styles.fabIcon} tintColor="#fff" />
      </TouchableOpacity>
      
      {renderFilterModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGreen,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.lightGreen,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.black,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray2,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  clearIcon: {
    width: 18,
    height: 18,
    padding: 4,
  },
  searchInput: {
    flex: 1,
    height: 42,
    fontSize: 16,
    color: COLORS.black,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray2,
  },
  activeFilterButton: {
    backgroundColor: COLORS.green,
  },
  actionIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.black,
  },
  activeFilterText: {
    color: COLORS.white,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 300,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.green,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  animalInfo: {
    flex: 1,
  },
  animalId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  dateContainer: {
    padding: 6,
    backgroundColor: COLORS.lightGreen,
    borderRadius: 6,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.green,
  },
  dewormingDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.gray,
    width: 80,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.black,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray3,
  },
  cardActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  actionButtonIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.green,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  fabIcon: {
    width: 24,
    height: 24,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 20,
  },
  filterOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray3,
  },
  selectedFilterOption: {
    backgroundColor: COLORS.lightGreen,
  },
  filterOptionText: {
    fontSize: 16,
    color: COLORS.black,
  },
  selectedFilterOptionText: {
    color: COLORS.green,
    fontWeight: 'bold',
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  applyButton: {
    flex: 2,
    backgroundColor: COLORS.green,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  applyButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  resetButton: {
    flex: 1,
    backgroundColor: COLORS.lightGray2,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray3,
  },
  resetButtonText: {
    color: COLORS.black,
    fontWeight: '500',
    fontSize: 16,
  },
});

export default DewormingRecordsScreen;