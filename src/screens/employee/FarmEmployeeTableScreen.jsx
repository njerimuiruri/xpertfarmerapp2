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
import {icons} from '../../constants';
import {COLORS} from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';

const initialEmployeeData = [
  {
    id: '1',
    fullName: 'John Doe',
    farmId: 'F001',
    position: 'Farm Manager',
    phone: '123-456-7890',
    dateOfEmployment: '2023-01-15',
  },
  {
    id: '2',
    fullName: 'Jane Smith',
    farmId: 'F002',
    position: 'Assistant Manager',
    phone: '098-765-4321',
    dateOfEmployment: '2023-03-22',
  },
  {
    id: '3',
    fullName: 'Alice Johnson',
    farmId: 'F003',
    position: 'Field Supervisor',
    phone: '456-123-7890',
    dateOfEmployment: '2022-11-01',
  },
  {
    id: '4',
    fullName: 'Robert Brown',
    farmId: 'F004',
    position: 'Crop Technician',
    phone: '789-456-1230',
    dateOfEmployment: '2023-02-10',
  },
  {
    id: '5',
    fullName: 'Sarah Wilson',
    farmId: 'F005',
    position: 'Livestock Specialist',
    phone: '321-654-0987',
    dateOfEmployment: '2023-05-15',
  },
];

const FarmEmployeeListScreen = ({navigation}) => {
  const [employees, setEmployees] = useState(initialEmployeeData);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterPosition, setFilterPosition] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const sortedAndFilteredEmployees = useMemo(() => {
    return employees
      .filter(
        employee =>
          employee.fullName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          (filterPosition === '' || employee.position === filterPosition),
      )
      .sort((a, b) => {
        if (sortBy === 'name') {
          return sortOrder === 'asc'
            ? a.fullName.localeCompare(b.fullName)
            : b.fullName.localeCompare(a.fullName);
        } else if (sortBy === 'date') {
          return sortOrder === 'asc'
            ? new Date(a.dateOfEmployment) - new Date(b.dateOfEmployment)
            : new Date(b.dateOfEmployment) - new Date(a.dateOfEmployment);
        }
        return 0;
      });
  }, [employees, searchQuery, sortBy, sortOrder, filterPosition]);

  const handleDelete = useCallback(id => {
    Alert.alert(
      'Delete Employee',
      'Are you sure you want to delete this employee?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setEmployees(prev => prev.filter(employee => employee.id !== id));
          },
        },
      ],
    );
  }, []);

  const handleEdit = useCallback(
    employee => {
      navigation.navigate('EditEmployeeScreen', {employee});
    },
    [navigation],
  );

  const toggleSort = useCallback(
    newSortBy => {
      if (sortBy === newSortBy) {
        setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortBy(newSortBy);
        setSortOrder('asc');
      }
    },
    [sortBy],
  );

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
          placeholder="Search employees..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setIsFilterModalVisible(true)}>
          <FastImage
            source={icons.filter}
            style={styles.actionIcon}
            tintColor="#333"
          />
          <Text style={styles.actionText}>Filter</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => toggleSort('date')}>
          <FastImage
            source={icons.calendar}
            style={styles.actionIcon}
            tintColor="#333"
          />
          <Text style={styles.actionText}>Sort by Date</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmployeeCard = ({item}) => (
<TouchableOpacity 
    style={styles.card}
    onPress={() => navigation.navigate('EmployeeDetailScreen', {employee: item})}>
   
      <View style={styles.cardHeader}>
        <View style={styles.employeeInfo}>
          <Text style={styles.name}>{item.fullName}</Text>
          <Text style={styles.position}>{item.position}</Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={() => handleEdit(item)}
            style={styles.cardActionButton}>
            <FastImage
              source={icons.submited}
              style={styles.cardActionIcon}
              tintColor="#4CAF50"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={styles.cardActionButton}>
            <FastImage
              source={icons.remove}
              style={styles.cardActionIcon}
              tintColor="#F44336"
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <FastImage
            source={icons.account}
            style={styles.detailIcon}
            tintColor="#666"
          />
          <Text style={styles.detailText}>{item.farmId}</Text>
        </View>
        <View style={styles.detailRow}>
          <FastImage
            source={icons.call}
            style={styles.detailIcon}
            tintColor="#666"
          />
          <Text style={styles.detailText}>{item.phone}</Text>
        </View>
        <View style={styles.detailRow}>
          <FastImage
            source={icons.calendar}
            style={styles.detailIcon}
            tintColor="#666"
          />
          <Text style={styles.detailText}>
            Employed: {item.dateOfEmployment}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isFilterModalVisible}
      onRequestClose={() => setIsFilterModalVisible(false)}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filter by Position</Text>
          {[
            'Farm Manager',
            'Assistant Manager',
            'Field Supervisor',
            'Crop Technician',
            'Livestock Specialist',
          ].map(position => (
            <TouchableOpacity
              key={position}
              style={[
                styles.filterOption,
                filterPosition === position && styles.selectedFilterOption,
              ]}
              onPress={() => {
                setFilterPosition(prev => (prev === position ? '' : position));
                setIsFilterModalVisible(false);
              }}>
              <Text
                style={[
                  styles.filterOptionText,
                  filterPosition === position &&
                    styles.selectedFilterOptionText,
                ]}>
                {position}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              setFilterPosition('');
              setSearchQuery('');
              setSortBy('name');
              setSortOrder('asc');
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

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader title="Farm Employees" />

      <StatusBar
        translucent
        backgroundColor={COLORS.green2}
        animated={true}
        barStyle={'light-content'}
      />
      {renderHeader()}
      <FlatList
        data={sortedAndFilteredEmployees}
        renderItem={renderEmployeeCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddEmployeeScreen')}>
        <FastImage
          source={icons.plus}
          style={styles.fabIcon}
          tintColor="#fff"
        />
      </TouchableOpacity>
      {renderFilterModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },
  header: {
    backgroundColor: COLORS.white,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
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
    justifyContent: 'flex-end',
    gap: 10,
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
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
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
  employeeInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  position: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  cardActions: {
    flexDirection: 'row',
  },
  cardActionButton: {
    padding: 8,
    marginLeft: 8,
  },
  cardActionIcon: {
    width: 20,
    height: 20,
  },
  cardDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
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
    color: COLORS.white,
    fontWeight: 'bold',
  },
});

export default FarmEmployeeListScreen;
