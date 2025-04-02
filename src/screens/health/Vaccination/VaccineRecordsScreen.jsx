import React, {useState, useCallback, useMemo, useEffect} from 'react';
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
import {icons} from '../../../constants';
import {COLORS} from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';

const initialVaccineData = [
  {
    id: '1',
    animalIdOrFlockId: 'A001',
    animalType: 'Dairy Cow',
    vaccinationAgainst: 'Foot and Mouth Disease',
    drugAdministered: 'FMD Vaccine',
    dateAdministered: '2023-05-15',
    dosage: '3',
    costOfVaccine: '1200',
    administeredBy: 'Dr. John Smith',
    practiceId: 'VET2023',
    costOfService: '500',
  },
  {
    id: '2',
    animalIdOrFlockId: 'A002',
    animalType: 'Dairy Cow',
    vaccinationAgainst: 'Anthrax',
    drugAdministered: 'Anthrax Vaccine',
    dateAdministered: '2023-06-20',
    dosage: '2',
    costOfVaccine: '800',
    administeredBy: 'Dr. Sarah Jones',
    practiceId: 'VET2024',
    costOfService: '600',
  },
  {
    id: '3',
    animalIdOrFlockId: 'G005',
    animalType: 'Goat',
    vaccinationAgainst: 'PPR',
    drugAdministered: 'PPR Vaccine',
    dateAdministered: '2023-07-10',
    dosage: '1.5',
    costOfVaccine: '500',
    administeredBy: 'Dr. Emily Brown',
    practiceId: 'VET2025',
    costOfService: '400',
  },
];

const VaccineRecordsScreen = ({navigation}) => {
  const [vaccineRecords, setVaccineRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterVaccineType, setFilterVaccineType] = useState('');
  const [filterAnimalType, setFilterAnimalType] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setVaccineRecords(initialVaccineData);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let count = 0;
    if (filterVaccineType) count++;
    if (filterAnimalType) count++;
    if (searchQuery) count++;
    setActiveFilters(count);
  }, [filterVaccineType, filterAnimalType, searchQuery]);

  const sortedAndFilteredRecords = useMemo(() => {
    return vaccineRecords
      .filter(record => {
        const matchesSearch =
          searchQuery === '' ||
          record.animalIdOrFlockId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.animalType.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.vaccinationAgainst.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesVaccineType =
          filterVaccineType === '' || record.vaccinationAgainst === filterVaccineType;

        const matchesAnimalType =
          filterAnimalType === '' || record.animalType === filterAnimalType;

        return matchesSearch && matchesVaccineType && matchesAnimalType;
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
  }, [vaccineRecords, searchQuery, sortBy, sortOrder, filterVaccineType, filterAnimalType]);

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
      'Delete Vaccine Record',
      'Are you sure you want to delete this vaccine record?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setVaccineRecords(prev => prev.filter(record => record.id !== id));
            showToast('Record deleted successfully');
          },
        },
      ],
    );
  }, []);

  // Edit handler
  const handleEdit = useCallback(
    record => {
      navigation.navigate('VaccineEditScreen', {record});
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
      showToast(
        `Sorted by ${newSortBy === 'date' ? 'date' : 'animal ID'} (${
          sortOrder === 'asc' ? 'ascending' : 'descending'
        })`,
      );
    },
    [sortBy, sortOrder],
  );

  const resetAllFilters = () => {
    setFilterVaccineType('');
    setFilterAnimalType('');
    setSearchQuery('');
    setSortBy('date');
    setSortOrder('desc');
    setIsFilterModalVisible(false);
    showToast('All filters reset');
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.searchContainer}>
        <FastImage
          source={icons.search}
          style={styles.searchIcon}
          tintColor={COLORS.black}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by ID, animal type, vaccine..."
          placeholderTextColor={COLORS.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
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
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            activeFilters > 0 && styles.activeFilterButton,
          ]}
          onPress={() => setIsFilterModalVisible(true)}>
          <FastImage
            source={icons.filter}
            style={styles.actionIcon}
            tintColor={activeFilters > 0 ? COLORS.white : COLORS.black}
          />
          <Text 
            style={[
              styles.actionText, 
              activeFilters > 0 && styles.activeFilterText
            ]}>
            Filters {activeFilters > 0 ? `(${activeFilters})` : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => toggleSort('date')}>
          <FastImage
            source={sortBy === 'date' ? icons.calendar : icons.sort}
            style={styles.actionIcon}
            tintColor={COLORS.black}
          />
          <Text style={styles.actionText}>
            {sortBy === 'date' && sortOrder === 'desc'
              ? 'Newest'
              : sortBy === 'date' && sortOrder === 'asc'
              ? 'Oldest'
              : 'Sort'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <FastImage
        source={icons.emptyList}
        style={styles.emptyStateIcon}
        tintColor={COLORS.gray}
      />
      <Text style={styles.emptyStateTitle}>No Records Found</Text>
      <Text style={styles.emptyStateMessage}>
        {activeFilters > 0
          ? 'Try removing some filters or changing your search.'
          : 'Start by adding your first vaccination record.'}
      </Text>
      {activeFilters > 0 && (
        <TouchableOpacity
          style={styles.emptyStateButton}
          onPress={resetAllFilters}>
          <Text style={styles.emptyStateButtonText}>Clear All Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderVaccineCard = ({item}) => (
    <TouchableOpacity 
      style={styles.card}
    //   onPress={() => navigation.navigate('VaccineDetailScreen', {record: item})}  activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.animalInfo}>
          <Text style={styles.animalId}>{item.animalIdOrFlockId}</Text>
          <Text style={styles.animalType}>{item.animalType}</Text>
        </View>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{new Date(item.dateAdministered).toLocaleDateString()}</Text>
        </View>
      </View>

      <View style={styles.vaccineBadge}>
        <Text style={styles.vaccineBadgeText}>
          {item.vaccinationAgainst}
        </Text>
      </View>

      <View style={styles.vaccineDetails}>
        <View style={styles.detailRow}>
          <FastImage
            source={icons.medicine}
            style={styles.detailIcon}
            tintColor={COLORS.green}
          />
          <Text style={styles.detailLabel}>Drug:</Text>
          <Text style={styles.detailText}>{item.drugAdministered}</Text>
        </View>

        <View style={styles.detailRow}>
          <FastImage
            source={icons.droplet}
            style={styles.detailIcon}
            tintColor={COLORS.green}
          />
          <Text style={styles.detailLabel}>Dosage:</Text>
          <Text style={styles.detailText}>{item.dosage} ml</Text>
        </View>

        <View style={styles.detailRow}>
          <FastImage
            source={icons.doctor}
            style={styles.detailIcon}
            tintColor={COLORS.green}
          />
          <Text style={styles.detailLabel}>Admin By:</Text>
          <Text style={styles.detailText}>{item.administeredBy}</Text>
        </View>

        <View style={styles.detailRow}>
          <FastImage
            source={icons.money}
            style={styles.detailIcon}
            tintColor={COLORS.green}
          />
          <Text style={styles.detailLabel}>Total Cost:</Text>
          <Text style={styles.detailText}>
            ${(parseInt(item.costOfVaccine) + parseInt(item.costOfService)).toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          onPress={() => handleEdit(item)}
          style={styles.cardActionButton}>
          <FastImage
            source={icons.edit}
            style={styles.actionButtonIcon}
            tintColor="#2196F3"
          />
          <Text style={[styles.actionButtonText, {color: '#2196F3'}]}>
            Edit
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={styles.cardActionButton}>
          <FastImage
            source={icons.remove}
            style={styles.actionButtonIcon}
            tintColor="#F44336"
          />
          <Text style={[styles.actionButtonText, {color: '#F44336'}]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderFilterModal = () => {
    const vaccineTypes = [
      'Foot and Mouth Disease',
      'Anthrax',
      'PPR',
      'Brucellosis',
      'Newcastle Disease',
    ];
    
    const animalTypes = [
      'Dairy Cow',
      'Beef Cow',
      'Goat',
      'Sheep',
      'Chicken',
    ];

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterModalVisible}
        onRequestClose={() => setIsFilterModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Records</Text>
              <TouchableOpacity
                onPress={() => setIsFilterModalVisible(false)}
                hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}>
                <FastImage
                  source={icons.close}
                  style={styles.modalCloseIcon}
                  tintColor={COLORS.black}
                />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.filterSectionTitle}>Vaccine Type</Text>
            <View style={styles.filterChipContainer}>
              {vaccineTypes.map(option => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.filterChip,
                    filterVaccineType === option && styles.selectedFilterChip,
                  ]}
                  onPress={() => setFilterVaccineType(prev => (prev === option ? '' : option))}>
                  <Text
                    style={[
                      styles.filterChipText,
                      filterVaccineType === option && styles.selectedFilterChipText,
                    ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.filterSectionTitle}>Animal Type</Text>
            <View style={styles.filterChipContainer}>
              {animalTypes.map(option => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.filterChip,
                    filterAnimalType === option && styles.selectedFilterChip,
                  ]}
                  onPress={() => setFilterAnimalType(prev => (prev === option ? '' : option))}>
                  <Text
                    style={[
                      styles.filterChipText,
                      filterAnimalType === option && styles.selectedFilterChipText,
                    ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.filterButtonsContainer}>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => {
                  setIsFilterModalVisible(false);
                  if (filterVaccineType || filterAnimalType) {
                    showToast('Filters applied');
                  }
                }}>
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetAllFilters}>
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
        <StatusBar
          translucent
          backgroundColor={COLORS.green2}
          animated={true}
          barStyle={'light-content'}
        />
        <SecondaryHeader title="Vaccination Records" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={COLORS.green} />
          <Text style={styles.loadingText}>Loading records...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader title="Vaccination Records" />

      <StatusBar
        translucent
        backgroundColor={COLORS.green2}
        animated={true}
        barStyle={'light-content'}
      />
      
      {renderHeader()}
      
      <FlatList
        data={sortedAndFilteredRecords}
        renderItem={renderVaccineCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddVaccineRecords')}>
        <FastImage source={icons.plus} style={styles.fabIcon} tintColor="#fff" />
      </TouchableOpacity>
      
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
    shadowOffset: {width: 0, height: 2},
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
  animalType: {
    fontSize: 14,
    color: COLORS.black,
    marginTop: 4,
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
  vaccineBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.green,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  vaccineBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  vaccineDetails: {
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
    shadowOffset: {width: 0, height: 3},
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  modalCloseIcon: {
    width: 20,
    height: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 12,
  },
  filterChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray2,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.gray3,
  },
  selectedFilterChip: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },
  filterChipText: {
    fontSize: 14,
    color: COLORS.black,
  },
  selectedFilterChipText: {
    color: COLORS.white,
    fontWeight: '500',
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

export default VaccineRecordsScreen;