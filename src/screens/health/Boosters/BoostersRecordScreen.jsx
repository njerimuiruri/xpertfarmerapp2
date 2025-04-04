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
  ToastAndroid,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {icons} from '../../../constants';
import {COLORS} from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';

const initialBoosterData = [
  {
    id: '1',
    animalIdOrFlockId: 'A001',
    animalType: 'Dairy Cow',
    boostersOrAdditives: 'Vitamin B Complex',
    purpose: 'Immunity',
    quantityGiven: '2',
    quantityUnit: 'milliliters',
    dateAdministered: '2023-05-15',
    costOfBooster: '800',
  },
  {
    id: '2',
    animalIdOrFlockId: 'A002',
    animalType: 'Dairy Cow',
    boostersOrAdditives: 'Calcium Supplement',
    purpose: 'Production',
    quantityGiven: '3',
    quantityUnit: 'kilograms',
    dateAdministered: '2023-06-20',
    costOfBooster: '1200',
  },
  {
    id: '3',
    animalIdOrFlockId: 'G005',
    animalType: 'Goat',
    boostersOrAdditives: 'Selenium Supplement',
    purpose: 'Growth',
    quantityGiven: '1.5',
    quantityUnit: 'grams',
    dateAdministered: '2023-07-10',
    costOfBooster: '600',
  },
];

const BoostersRecordScreen = ({navigation}) => {
  const [boosterRecords, setBoosterRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterBoosterType, setFilterBoosterType] = useState('');
  const [filterAnimalType, setFilterAnimalType] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setBoosterRecords(initialBoosterData);
    });
  }, []);

  useEffect(() => {
    let count = 0;
    if (filterBoosterType) count++;
    if (filterAnimalType) count++;
    if (searchQuery) count++;
    setActiveFilters(count);
  }, [filterBoosterType, filterAnimalType, searchQuery]);

  const showToast = (message) => {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  };

  const sortedAndFilteredRecords = useMemo(() => {
    return boosterRecords
      .filter(record => {
        const matchesSearch =
          searchQuery === '' ||
          record.animalIdOrFlockId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.animalType.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.boostersOrAdditives.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.purpose.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesBoosterType =
          filterBoosterType === '' || record.boostersOrAdditives === filterBoosterType;

        const matchesAnimalType =
          filterAnimalType === '' || record.animalType === filterAnimalType;

        return matchesSearch && matchesBoosterType && matchesAnimalType;
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
  }, [boosterRecords, searchQuery, sortBy, sortOrder, filterBoosterType, filterAnimalType]);

  const handleDelete = useCallback(id => {
  
            showToast('Record deleted successfully');
        
  }, []);

  const handleEdit = useCallback(
    record => {
      navigation.navigate('BoosterEditScreen', {record});
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
    },
    [sortBy, sortOrder],
  );

  const resetAllFilters = () => {
    setFilterBoosterType('');
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
          placeholder="Search by ID, animal type, booster..."
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

  const renderBoosterCard = ({item}) => (
    <TouchableOpacity 
      style={styles.card}      
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
  
      <View style={styles.boosterStatusContainer}>
        <View style={styles.boosterBadgeContainer}>
          <View style={styles.boosterBadge}>
            <Text style={styles.boosterBadgeText}>
              {item.boostersOrAdditives}
            </Text>
          </View>
        </View>
        
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Purpose:</Text>
            <Text style={styles.statusValue}>{item.purpose}</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Quantity:</Text>
            <Text style={styles.statusValue}>{item.quantityGiven} {item.quantityUnit}</Text>
          </View>
        </View>
        
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Cost:</Text>
            <Text style={styles.statusValue}>${parseInt(item.costOfBooster).toLocaleString()}</Text>
          </View>
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
    const boosterTypes = [
      'Vitamin B Complex',
      'Calcium Supplement',
      'Selenium Supplement',
      'Probiotic',
      'Growth Promoter',
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
            
            <Text style={styles.filterSectionTitle}>Booster Type</Text>
            <View style={styles.filterChipContainer}>
              {boosterTypes.map(option => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.filterChip,
                    filterBoosterType === option && styles.selectedFilterChip,
                  ]}
                  onPress={() => setFilterBoosterType(prev => (prev === option ? '' : option))}>
                  <Text
                    style={[
                      styles.filterChipText,
                      filterBoosterType === option && styles.selectedFilterChipText,
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
                  if (filterBoosterType || filterAnimalType) {
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

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader title="Booster Records" />

      <StatusBar
        translucent
        backgroundColor={COLORS.green2}
        animated={true}
        barStyle={'light-content'}
      />
      
      {renderHeader()}
      
      <FlatList
        data={sortedAndFilteredRecords}
        renderItem={renderBoosterCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddBoostersRecords')}>
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
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
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
  boosterStatusContainer: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
  },
  boosterBadgeContainer: {
    marginBottom: 10,
  },
  boosterBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.green,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  boosterBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusItem: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 2,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.black,
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
});

export default BoostersRecordScreen;