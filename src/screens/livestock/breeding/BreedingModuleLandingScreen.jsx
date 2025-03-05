import React, {useState, useCallback, useMemo} from 'react';
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
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {icons} from '../../../constants';
import {COLORS} from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';

const initialBreedingData = [
  {
    id: '1',
    animalId: 'A001',
    animalType: 'Dairy Cow',
    purpose: 'Improve Milk Production',
    strategy: 'Cross Breeding',
    serviceType: 'Artificial Insemination',
    serviceDate: '2023-05-10',
    gestationPeriod: '280 days',
    expectedBirthDate: '2024-02-14',
    status: 'Pregnant',
  },
  {
    id: '2',
    animalId: 'A002',
    animalType: 'Dairy Cow',
    purpose: 'Stocking Number',
    strategy: 'Breeding Within Breeds',
    serviceType: 'Natural Mating',
    serviceDate: '2023-06-15',
    gestationPeriod: '280 days',
    expectedBirthDate: '2024-03-21',
    status: 'Pregnant',
  },
  {
    id: '3',
    animalId: 'G005',
    animalType: 'Goat',
    purpose: 'Immunity',
    strategy: 'Cross Breeding',
    serviceType: 'Artificial Insemination',
    serviceDate: '2023-07-20',
    gestationPeriod: '150 days',
    expectedBirthDate: '2023-12-17',
    status: 'Delivered',
    birthDate: '2023-12-16',
    deliveryMethod: 'Natural Birth',
    youngOnes: 2,
    birthWeight: '3.5 kg',
    offspringSex: 'Male, Female',
    offspringIds: 'G101, G102',
  },
  {
    id: '4',
    animalId: 'P010',
    animalType: 'Swine',
    purpose: 'Stocking Number',
    strategy: 'Breeding Between Breeds',
    serviceType: 'Artificial Insemination',
    serviceDate: '2023-08-05',
    gestationPeriod: '114 days',
    expectedBirthDate: '2023-11-27',
    status: 'Delivered',
    birthDate: '2023-11-28',
    deliveryMethod: 'Assisted',
    youngOnes: 8,
    litterWeight: '12 kg',
    offspringSex: '5 Males, 3 Females',
    offspringIds: 'P201-P208',
  },
  {
    id: '5',
    animalId: 'A008',
    animalType: 'Dairy Cow',
    purpose: 'Improve Milk Production',
    strategy: 'Cross Breeding',
    serviceType: 'Artificial Insemination',
    serviceDate: '2023-09-12',
    gestationPeriod: '280 days',
    expectedBirthDate: '2024-06-18',
    status: 'Pregnant',
  },
];

const BreedingModuleLandingScreen = ({navigation}) => {
  const [breedingRecords, setBreedingRecords] = useState(initialBreedingData);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterPurpose, setFilterPurpose] = useState('');
  const [filterStrategy, setFilterStrategy] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [activeFilterType, setActiveFilterType] = useState('purpose');

  const sortedAndFilteredRecords = useMemo(() => {
    return breedingRecords
      .filter(
        record =>
          (record.animalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.animalType.toLowerCase().includes(searchQuery.toLowerCase())) &&
          (filterPurpose === '' || record.purpose === filterPurpose) &&
          (filterStrategy === '' || record.strategy === filterStrategy) &&
          (filterStatus === '' || record.status === filterStatus),
      )
      .sort((a, b) => {
        if (sortBy === 'date') {
          return sortOrder === 'desc'
            ? new Date(b.serviceDate) - new Date(a.serviceDate)
            : new Date(a.serviceDate) - new Date(b.serviceDate);
        } else if (sortBy === 'animalId') {
          return sortOrder === 'asc'
            ? a.animalId.localeCompare(b.animalId)
            : b.animalId.localeCompare(a.animalId);
        }
        return 0;
      });
  }, [breedingRecords, searchQuery, sortBy, sortOrder, filterPurpose, filterStrategy, filterStatus]);

  const handleDelete = useCallback(id => {
    Alert.alert(
      'Delete Breeding Record',
      'Are you sure you want to delete this breeding record?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setBreedingRecords(prev => prev.filter(record => record.id !== id));
          },
        },
      ],
    );
  }, []);

  const handleEdit = useCallback(
    record => {
    //   navigation.navigate('EditBreedingRecordScreen', {record});
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
    [sortBy],
  );

  const showFilterModal = useCallback(filterType => {
    setActiveFilterType(filterType);
    setIsFilterModalVisible(true);
  }, []);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.searchContainer}>
        <FastImage
          source={icons.search}
          style={styles.searchIcon}
          tintColor="#666"
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by animal ID or type..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => showFilterModal('status')}>
          <FastImage
            source={icons.filter}
            style={styles.actionIcon}
            tintColor="#333"
          />
          <Text style={styles.actionText}>
            {filterStatus ? filterStatus : 'Status'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => showFilterModal('purpose')}>
          <FastImage
            source={icons.filter}
            style={styles.actionIcon}
            tintColor="#333"
          />
          <Text style={styles.actionText}>
            {filterPurpose ? 'Purpose: ' + filterPurpose.split(' ').pop() : 'Purpose'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => toggleSort('date')}>
          <FastImage
            source={icons.calendar}
            style={styles.actionIcon}
            tintColor="#333"
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

  const getStatusColor = status => {
    switch (status) {
      case 'Pregnant':
        return '#FFC107'; // Amber
      case 'Delivered':
        return '#4CAF50'; // Green
      case 'Failed':
        return '#F44336'; // Red
      default:
        return '#757575'; // Grey
    }
  };

  const renderBreedingCard = ({item}) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.animalInfo}>
          <Text style={styles.animalId}>{item.animalId}</Text>
          <Text style={styles.animalType}>{item.animalType}</Text>
        </View>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              {backgroundColor: getStatusColor(item.status)},
            ]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>

      <View style={styles.breedingDetails}>
        <View style={styles.detailRow}>
          <FastImage
            source={icons.account}
            style={styles.detailIcon}
            tintColor="#666"
          />
          <Text style={styles.detailLabel}>Purpose:</Text>
          <Text style={styles.detailText}>{item.purpose}</Text>
        </View>

        <View style={styles.detailRow}>
          <FastImage
            source={icons.chart}
            style={styles.detailIcon}
            tintColor="#666"
          />
          <Text style={styles.detailLabel}>Strategy:</Text>
          <Text style={styles.detailText}>{item.strategy}</Text>
        </View>

        <View style={styles.detailRow}>
          <FastImage
            source={icons.calendar}
            style={styles.detailIcon}
            tintColor="#666"
          />
          <Text style={styles.detailLabel}>Service:</Text>
          <Text style={styles.detailText}>
            {item.serviceType} on {item.serviceDate}
          </Text>
        </View>

        {item.status === 'Pregnant' && (
          <View style={styles.detailRow}>
            <FastImage
              source={icons.time}
              style={styles.detailIcon}
              tintColor="#666"
            />
            <Text style={styles.detailLabel}>Expected:</Text>
            <Text style={styles.detailText}>{item.expectedBirthDate}</Text>
          </View>
        )}

        {item.status === 'Delivered' && (
          <>
            <View style={styles.detailRow}>
              <FastImage
                source={icons.calendar}
                style={styles.detailIcon}
                tintColor="#666"
              />
              <Text style={styles.detailLabel}>Birth:</Text>
              <Text style={styles.detailText}>
                {item.birthDate} ({item.deliveryMethod})
              </Text>
            </View>
            <View style={styles.detailRow}>
              <FastImage
                source={icons.account}
                style={styles.detailIcon}
                tintColor="#666"
              />
              <Text style={styles.detailLabel}>Offspring:</Text>
              <Text style={styles.detailText}>
                {item.youngOnes} ({item.offspringSex})
              </Text>
            </View>
          </>
        )}
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
        
        {item.status === 'Pregnant' && (
          <TouchableOpacity
            // onPress={() => navigation.navigate('RecordBirthScreen', {record: item})}
            style={styles.cardActionButton}>
            <FastImage
              source={icons.submited}
              style={styles.actionButtonIcon}
              tintColor="#4CAF50"
            />
            <Text style={[styles.actionButtonText, {color: '#4CAF50'}]}>
              Record Birth
            </Text>
          </TouchableOpacity>
        )}
        
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
    </View>
  );

  const renderFilterModal = () => {
    let filterOptions = [];
    let currentFilter = '';
    let setFilter = null;

    if (activeFilterType === 'purpose') {
      filterOptions = [
        'Improve Milk Production',
        'Stocking Number',
        'Immunity',
      ];
      currentFilter = filterPurpose;
      setFilter = setFilterPurpose;
    } else if (activeFilterType === 'strategy') {
      filterOptions = [
        'Cross Breeding',
        'Breeding Within Breeds',
        'Breeding Between Breeds',
      ];
      currentFilter = filterStrategy;
      setFilter = setFilterStrategy;
    } else if (activeFilterType === 'status') {
      filterOptions = ['Pregnant', 'Delivered', 'Failed'];
      currentFilter = filterStatus;
      setFilter = setFilterStatus;
    }

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterModalVisible}
        onRequestClose={() => setIsFilterModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Filter by {activeFilterType.charAt(0).toUpperCase() + activeFilterType.slice(1)}
            </Text>
            {filterOptions.map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.filterOption,
                  currentFilter === option && styles.selectedFilterOption,
                ]}
                onPress={() => {
                  setFilter(prev => (prev === option ? '' : option));
                  setIsFilterModalVisible(false);
                }}>
                <Text
                  style={[
                    styles.filterOptionText,
                    currentFilter === option && styles.selectedFilterOptionText,
                  ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setFilterPurpose('');
                setFilterStrategy('');
                setFilterStatus('');
                setSearchQuery('');
                setSortBy('date');
                setSortOrder('desc');
                setIsFilterModalVisible(false);
              }}>
              <Text style={styles.resetButtonText}>Reset All Filters</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setIsFilterModalVisible(false)}>
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader title="Breeding Records" />

      <StatusBar
        translucent
        backgroundColor={COLORS.green2}
        animated={true}
        barStyle={'light-content'}
      />
      {renderHeader()}
      <FlatList
        data={sortedAndFilteredRecords}
        renderItem={renderBreedingCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('BreedingRecordForm')}>
        <FastImage source={icons.plus} style={styles.fabIcon} tintColor="#fff" />
      </TouchableOpacity>
      {renderFilterModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f1f3f4',
  },
  actionIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  actionText: {
    fontSize: 14,
    color: '#333',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
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
    color: '#333',
  },
  animalType: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  breedingDetails: {
    marginTop: 8,
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
    color: '#666',
    width: 80,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cardActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionButtonIcon: {
    width: 18,
    height: 18,
    marginRight: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  filterOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  selectedFilterOption: {
    backgroundColor: '#e8f5e9',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedFilterOptionText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  closeModalButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  closeModalButtonText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  resetButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f44336',
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default BreedingModuleLandingScreen;