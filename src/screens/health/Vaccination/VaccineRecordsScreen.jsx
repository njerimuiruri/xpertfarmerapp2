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
  

  useEffect(() => {
    setTimeout(() => {
      setVaccineRecords(initialVaccineData);     
    });
  }, []);

  useEffect(() => {
    let count = 0;
    if (searchQuery) count++;
  }, [ searchQuery]);

  const sortedAndFilteredRecords = useMemo(() => {
    return vaccineRecords
      .filter(record => {
        const matchesSearch =
          searchQuery === '' ||
          record.animalIdOrFlockId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.animalType.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.vaccinationAgainst.toLowerCase().includes(searchQuery.toLowerCase());

    

        return matchesSearch;
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
  }, [vaccineRecords, searchQuery, sortBy, sortOrder]);

 
 

  const handleDelete = useCallback(id => {
    Alert.alert(
      'Delete Vaccine Record',
      'Are you sure you want to delete this vaccine record?',
      [
        {text: 'Cancel', style: 'cancel'},
       
      ],
    );
  }, []);

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
     
    },
    [sortBy, sortOrder],
  );
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
          ]}
         >
          <FastImage
            source={icons.filter}
            style={styles.actionIcon}
          />
          <Text 
            style={[
              styles.actionText,              
            ]}>
            Filters 
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

 

  const renderVaccineCard = ({item}) => (
    <View
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
  
      <View style={styles.vaccineStatusContainer}>
        <View style={styles.vaccineBadgeContainer}>
          <View style={styles.vaccineBadge}>
            <Text style={styles.vaccineBadgeText}>
              {item.vaccinationAgainst}
            </Text>
          </View>
        </View>
        
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Drug:</Text>
            <Text style={styles.statusValue}>{item.drugAdministered}</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Dosage:</Text>
            <Text style={styles.statusValue}>{item.dosage} ml</Text>
          </View>
        </View>
        
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Admin By:</Text>
            <Text style={styles.statusValue}>{item.administeredBy}</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Cost:</Text>
            <Text style={styles.statusValue}>
              ${(parseInt(item.costOfVaccine) + parseInt(item.costOfService)).toLocaleString()}
            </Text>
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
    </View>
  );

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
 
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  
  vaccineStatusContainer: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
  },
  vaccineBadgeContainer: {
    marginBottom: 10,
  },
  vaccineBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.green,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  vaccineBadgeText: {
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

export default VaccineRecordsScreen;