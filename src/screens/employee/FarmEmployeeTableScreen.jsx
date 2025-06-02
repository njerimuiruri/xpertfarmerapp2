import React, { useState, useCallback, useMemo } from 'react';
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
import { icons } from '../../constants';
import { COLORS } from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';

// Updated initial data to match add employee form fields
const initialEmployeeData = [
  {
    id: '1',
    firstName: 'John',
    middleName: '',
    lastName: 'Doe',
    fullName: 'John Doe',
    phone: '123-456-7890',
    emergencyContact: '123-456-0000',
    employeeType: 'permanent',
    idNumber: 'ID12345',
    dateOfEmployment: '2023-01-15',
    role: 'cleaner',
    paymentSchedule: 'monthly',
    salary: '11,000',
    selectedBenefits: {
      paye: true,
      nssf: true,
      nhif: false,
      housingLevy: false,
    },
  },
  {
    id: '2',
    firstName: 'Jane',
    middleName: '',
    lastName: 'Smith',
    fullName: 'Jane Smith',
    phone: '098-765-4321',
    emergencyContact: '098-765-0000',
    employeeType: 'permanent',
    idNumber: 'ID67890',
    dateOfEmployment: '2023-03-22',
    role: 'milker',
    paymentSchedule: 'weekly',
    salary: '8,000',
    selectedBenefits: {
      paye: true,
      nssf: true,
      nhif: true,
      housingLevy: true,
    },
  },
  {
    id: '3',
    firstName: 'Alice',
    middleName: 'K',
    lastName: 'Johnson',
    fullName: 'Alice K Johnson',
    phone: '456-123-7890',
    emergencyContact: '456-123-0000',
    employeeType: 'casual',
    idNumber: 'ID24680',
    dateOfEmployment: '2022-11-01',
    role: 'feeder',
    paymentSchedule: 'daily',
    salary: '5,000',
    workSchedule: 'full',
    selectedBenefits: {},
  },
  {
    id: '4',
    firstName: 'Robert',
    middleName: '',
    lastName: 'Brown',
    fullName: 'Robert Brown',
    phone: '789-456-1230',
    emergencyContact: '789-456-0000',
    employeeType: 'casual',
    idNumber: 'ID13579',
    dateOfEmployment: '2023-02-10',
    role: 'custom',
    customRole: 'Crop Technician',
    workSchedule: 'half',
    paymentSchedule: 'daily',
    salary: '4,500',
    selectedBenefits: {},
  },
  {
    id: '5',
    firstName: 'Sarah',
    middleName: 'J',
    lastName: 'Wilson',
    fullName: 'Sarah J Wilson',
    phone: '321-654-0987',
    emergencyContact: '321-654-0000',
    employeeType: 'permanent',
    idNumber: 'ID97531',
    dateOfEmployment: '2023-05-15',
    role: 'custom',
    customRole: 'Livestock Specialist',
    paymentSchedule: 'monthly',
    salary: '12,000',
    selectedBenefits: {
      paye: true,
      nssf: true,
      nhif: true,
      housingLevy: false,
    },
  },
];

const FarmEmployeeListScreen = ({ navigation }) => {
  const [employees, setEmployees] = useState(initialEmployeeData);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterRole, setFilterRole] = useState('');
  const [filterType, setFilterType] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  // Get display role for employee
  const getDisplayRole = (employee) => {
    if (employee.role === 'custom' && employee.customRole) {
      return employee.customRole;
    }
    return employee.role.charAt(0).toUpperCase() + employee.role.slice(1);
  };

  const sortedAndFilteredEmployees = useMemo(() => {
    return employees
      .filter(
        employee => {
          const matchesSearch = employee.fullName.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesRole = filterRole === '' ||
            (employee.role === 'custom' ?
              (employee.customRole === filterRole) :
              (employee.role === filterRole)
            );
          const matchesType = filterType === '' || employee.employeeType === filterType;

          return matchesSearch && matchesRole && matchesType;
        }
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
  }, [employees, searchQuery, sortBy, sortOrder, filterRole, filterType]);

  const handleDelete = useCallback(id => {
    Alert.alert(
      'Delete Employee',
      'Are you sure you want to delete this employee?',
      [
        { text: 'Cancel', style: 'cancel' },
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
      navigation.navigate('EditEmployeeScreen', { employee });
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

  const renderEmployeeCard = ({ item }) => {
    const displayRole = getDisplayRole(item);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('EmployeeDetailScreen', { employee: item })}>

        <View style={styles.cardHeader}>
          <View style={styles.employeeInfo}>
            <Text style={styles.name}>{item.fullName}</Text>
            <View style={styles.roleContainer}>
              <Text style={styles.position}>{displayRole}</Text>
              {item.employeeType === 'casual' && (
                <View style={styles.badgeCasual}>
                  <Text style={styles.badgeText}>Casual</Text>
                </View>
              )}
              {item.employeeType === 'permanent' && (
                <View style={styles.badgePermanent}>
                  <Text style={styles.badgeText}>Permanent</Text>
                </View>
              )}
            </View>
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
              source={icons.call}
              style={styles.detailIcon}
              tintColor="#666"
            />
            <Text style={styles.detailText}>{item.phone}</Text>
          </View>
          <View style={styles.detailRow}>
            <FastImage
              source={icons.account}
              style={styles.detailIcon}
              tintColor="#666"
            />
            <Text style={styles.detailText}>ID: {item.idNumber}</Text>
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
          <View style={styles.detailRow}>
            <FastImage
              source={icons.calendar}
              style={styles.detailIcon}
              tintColor="#666"
            />
            <Text style={styles.detailText}>
              {item.paymentSchedule.charAt(0).toUpperCase() + item.paymentSchedule.slice(1)} payment: KSh {item.salary}
            </Text>
          </View>
          {item.workSchedule && (
            <View style={styles.detailRow}>
              <FastImage
                source={icons.calendar}
                style={styles.detailIcon}
                tintColor="#666"
              />
              <Text style={styles.detailText}>
                Schedule: {item.workSchedule === 'full' ? 'Full Day (8 hours)' : item.workSchedule === 'half' ? 'Half Day (4 hours)' : 'Custom'}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterModal = () => {
    // Get unique roles from employees
    const uniqueRoles = [...new Set(employees.map(emp =>
      emp.role === 'custom' ? emp.customRole : emp.role
    ))].filter(Boolean);

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterModalVisible}
        onRequestClose={() => setIsFilterModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Options</Text>

            {/* Filter by employee type */}
            <Text style={styles.modalSubtitle}>Employee Type</Text>
            <TouchableOpacity
              style={[
                styles.filterOption,
                filterType === 'permanent' && styles.selectedFilterOption,
              ]}
              onPress={() => setFilterType(prev => prev === 'permanent' ? '' : 'permanent')}>
              <Text style={[
                styles.filterOptionText,
                filterType === 'permanent' && styles.selectedFilterOptionText,
              ]}>
                Permanent
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterOption,
                filterType === 'casual' && styles.selectedFilterOption,
              ]}
              onPress={() => setFilterType(prev => prev === 'casual' ? '' : 'casual')}>
              <Text style={[
                styles.filterOptionText,
                filterType === 'casual' && styles.selectedFilterOptionText,
              ]}>
                Casual
              </Text>
            </TouchableOpacity>

            {/* Filter by role */}
            <Text style={styles.modalSubtitle}>Role</Text>
            {uniqueRoles.map(role => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.filterOption,
                  filterRole === role && styles.selectedFilterOption,
                ]}
                onPress={() => setFilterRole(prev => prev === role ? '' : role)}>
                <Text style={[
                  styles.filterOptionText,
                  filterRole === role && styles.selectedFilterOptionText,
                ]}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setFilterRole('');
                setFilterType('');
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
  };

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
    backgroundColor: COLORS.lightGreen,
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
  employeeInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  position: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  badgeCasual: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgePermanent: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
    color: '#555',
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
    color: COLORS.green,
    fontWeight: 'bold',
  },
  closeModalButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  closeModalButtonText: {
    fontSize: 16,
    color: COLORS.green,
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