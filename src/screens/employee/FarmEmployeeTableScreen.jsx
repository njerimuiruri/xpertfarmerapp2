import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  Modal,
  TextInput,
  Animated,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from "../../constants/theme";
import SecondaryHeader from "../../components/headers/secondary-header";
import { getFarmEmployees, deleteEmployee } from '../../services/employees';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const FarmEmployeeTableScreen = ({ navigation, route }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [activeFarm, setActiveFarm] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [fabScale] = useState(new Animated.Value(1));

  const getActiveFarmInfo = async () => {
    try {
      const activeFarmString = await AsyncStorage.getItem('activeFarm');
      if (activeFarmString) {
        const farm = JSON.parse(activeFarmString);
        setActiveFarm(farm);
      }
    } catch (error) {
      console.error('Error getting active farm:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data, error } = await getFarmEmployees();

      if (error) {
        Alert.alert('Error', error);
        setEmployees([]);
      } else {
        setEmployees(data || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      Alert.alert('Error', 'Failed to load employees');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = useCallback(() => {
    let filtered = employees;

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(emp => emp.employeeType === selectedFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(emp =>
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(query) ||
        emp.role?.toLowerCase().includes(query) ||
        emp.phone?.toLowerCase().includes(query)
      );
    }

    setFilteredEmployees(filtered);
  }, [employees, searchQuery, selectedFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEmployees();
    setRefreshing(false);
  };

  const handleDeleteEmployee = (employee) => {
    setEmployeeToDelete(employee);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;

    try {
      const { error } = await deleteEmployee(employeeToDelete.id);

      if (error) {
        Alert.alert('Error', error);
      } else {
        Alert.alert('Success', 'Employee deleted successfully');
        await fetchEmployees();
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      Alert.alert('Error', 'Failed to delete employee');
    } finally {
      setShowDeleteModal(false);
      setEmployeeToDelete(null);
    }
  };

  const handleEditEmployee = (employee) => {
    navigation.navigate('EditEmployeeScreen', { employeeId: employee.id });
  };

  const handleViewEmployee = (employee) => {
    navigation.navigate('EmployeeDetailScreen', { employee });
  };

  const handleAddEmployee = () => {
    Animated.sequence([
      Animated.timing(fabScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fabScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    navigation.navigate('AddEmployeeScreen');
  };

  useEffect(() => {
    getActiveFarmInfo();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [filterEmployees]);

  useFocusEffect(
    useCallback(() => {
      if (route.params?.refresh || route.params?.employeeAdded) {
        fetchEmployees();
        navigation.setParams({ refresh: false, employeeAdded: false });
      } else if (employees.length === 0) {
        fetchEmployees();
      }
    }, [route.params])
  );

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const formatSalary = (salary) => {
    return `KSh ${parseInt(salary || 0).toLocaleString()}`;
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getStatusColor = (type) => {
    switch (type) {
      case 'permanent':
        return {
          bg: COLORS.green + '15',
          border: COLORS.green + '30',
          text: COLORS.green
        };
      case 'casual':
        return {
          bg: COLORS.orange + '15',
          border: COLORS.orange + '30',
          text: COLORS.orange
        };
      default:
        return {
          bg: COLORS.gray + '15',
          border: COLORS.gray + '30',
          text: COLORS.gray
        };
    }
  };

  const renderEmployeeCard = ({ item: employee, index }) => {
    const statusColors = getStatusColor(employee.employeeType);

    return (
      <View style={[styles.employeeCard, { marginTop: index === 0 ? 8 : 0 }]}>
        <View style={styles.cardHeader}>
          <View style={styles.employeeMainInfo}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {getInitials(employee.firstName, employee.lastName)}
              </Text>
            </View>
            <View style={styles.employeeDetails}>
              <Text style={styles.employeeName}>
                {employee.firstName} {employee.lastName}
              </Text>
              <Text style={styles.employeeRole}>
                {employee.role || 'No role assigned'}
              </Text>
              <View style={styles.contactInfo}>
                <Text style={styles.phoneNumber}>📞 {employee.phone || 'No phone'}</Text>
              </View>
            </View>
          </View>

          <View style={[
            styles.statusBadge,
            {
              backgroundColor: statusColors.bg,
              borderColor: statusColors.border,
            }
          ]}>
            <Text style={[styles.statusText, { color: statusColors.text }]}>
              {employee.employeeType?.charAt(0).toUpperCase() + employee.employeeType?.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>💰</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Salary</Text>
                <Text style={styles.infoValue}>{formatSalary(employee.salary)}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>📅</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Payment</Text>
                <Text style={styles.infoValue}>
                  {employee.paymentSchedule?.charAt(0).toUpperCase() + employee.paymentSchedule?.slice(1) || 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>🗓️</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Start Date</Text>
                <Text style={styles.infoValue}>{formatDate(employee.dateOfEmployment)}</Text>
              </View>
            </View>

            {employee.employeeType === 'casual' && employee.endDate && (
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>⏰</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>End Date</Text>
                  <Text style={styles.infoValue}>{formatDate(employee.endDate)}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Enhanced Action Buttons */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => handleViewEmployee(employee)}
            activeOpacity={0.7}>
            {/* <Text style={styles.actionIcon}></Text> */}
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditEmployee(employee)}
            activeOpacity={0.7}>
            {/* <Text style={styles.actionIcon}>✏️</Text> */}
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteEmployee(employee)}
            activeOpacity={0.7}>
            {/* <Text style={styles.actionIcon}>🗑️</Text> */}
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      <Text style={styles.filterTitle}>Filter by Type:</Text>
      <View style={styles.filterButtonsRow}>
        {[
          { key: 'all', label: 'All', icon: '👥' },
          { key: 'permanent', label: 'Permanent', icon: '🏢' },
          { key: 'casual', label: 'Casual', icon: '⏱️' }
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              selectedFilter === filter.key && styles.activeFilterButton
            ]}
            onPress={() => setSelectedFilter(filter.key)}
            activeOpacity={0.7}>
            <Text style={styles.filterIcon}>{filter.icon}</Text>
            <Text style={[
              styles.filterButtonText,
              selectedFilter === filter.key && styles.activeFilterButtonText
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Enhanced search bar
  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, role, or phone..."
          placeholderTextColor={COLORS.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIcon}>👥</Text>
      </View>
      <Text style={styles.emptyTitle}>
        {searchQuery || selectedFilter !== 'all' ? 'No Results Found' : 'No Employees Yet'}
      </Text>
      <Text style={styles.emptyMessage}>
        {searchQuery || selectedFilter !== 'all'
          ? 'Try adjusting your search or filter criteria'
          : 'Start building your team by adding your first employee'
        }
      </Text>
      {!searchQuery && selectedFilter === 'all' && (
        <TouchableOpacity style={styles.emptyActionButton} onPress={handleAddEmployee}>
          <Text style={styles.emptyActionIcon}>➕</Text>
          <Text style={styles.emptyActionText}>Add First Employee</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderDeleteModal = () => (
    <Modal visible={showDeleteModal} transparent animationType="fade">
      <View style={styles.deleteModalOverlay}>
        <View style={styles.deleteModalCard}>
          <View style={styles.deleteModalHeader}>
            <Text style={styles.deleteModalIcon}>⚠️</Text>
            <Text style={styles.deleteModalTitle}>Confirm Deletion</Text>
          </View>

          <Text style={styles.deleteModalMessage}>
            Are you sure you want to delete{' '}
            <Text style={styles.employeeNameInModal}>
              {employeeToDelete?.firstName} {employeeToDelete?.lastName}
            </Text>
            ? This action cannot be undone and will permanently remove all employee data.
          </Text>

          <View style={styles.deleteModalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowDeleteModal(false);
                setEmployeeToDelete(null);
              }}
              activeOpacity={0.7}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmDeleteButton}
              onPress={confirmDelete}
              activeOpacity={0.7}>
              <Text style={styles.confirmDeleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <SecondaryHeader title="Farm Employees" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.green} />
          <Text style={styles.loadingText}>Loading employees...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader
        title="Farm Employees"
        rightButton={{
          text: "Add",
          onPress: handleAddEmployee
        }}
      />

      <StatusBar
        translucent
        backgroundColor={COLORS.green2}
        animated={true}
        barStyle={'light-content'}
      />

      <View style={styles.content}>
        {activeFarm && (
          <View style={styles.farmInfoCard}>
            <View style={styles.farmInfoHeader}>
              <View style={styles.farmInfoDetails}>
                <Text style={styles.farmName}>{activeFarm.name}</Text>
                <Text style={styles.farmDetails}>
                  {employees.length} employee{employees.length !== 1 ? 's' : ''}
                  {activeFarm.location && ` • 📍 ${activeFarm.location}`}
                </Text>
              </View>
            </View>
          </View>
        )}

        {renderSearchBar()}
        {renderFilterButtons()}

        {filteredEmployees.length > 0 && (
          <View style={styles.resultsSummary}>
            <Text style={styles.resultsText}>
              Showing {filteredEmployees.length} of {employees.length} employees
            </Text>
          </View>
        )}

        <FlatList
          data={filteredEmployees}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={renderEmployeeCard}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.green]}
              tintColor={COLORS.green}
            />
          }
          contentContainerStyle={[
            styles.listContainer,
            filteredEmployees.length === 0 && styles.emptyListContainer
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      </View>

      <Animated.View style={[styles.fab, { transform: [{ scale: fabScale }] }]}>
        <TouchableOpacity
          style={styles.fabButton}
          onPress={handleAddEmployee}
          activeOpacity={0.8}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </Animated.View>

      {renderDeleteModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fffe',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fffe',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray,
    fontWeight: '500',
  },

  // Enhanced Farm Info Card
  farmInfoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.green,
  },
  farmInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  farmIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  farmInfoDetails: {
    flex: 1,
  },
  farmName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 6,
  },
  farmDetails: {
    fontSize: 15,
    color: COLORS.gray,
    fontWeight: '500',
  },

  // Enhanced Search Bar
  searchContainer: {
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.lightGray1,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
    paddingVertical: 12,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 16,
    color: COLORS.gray,
    fontWeight: 'bold',
  },

  // Enhanced Filter Buttons
  filterContainer: {
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 12,
  },
  filterButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.lightGray1,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  activeFilterButton: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  filterButtonText: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '600',
  },
  activeFilterButtonText: {
    color: COLORS.white,
  },

  // Results Summary
  resultsSummary: {
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Enhanced Employee Cards
  listContainer: {
    paddingBottom: 100,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  employeeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  employeeMainInfo: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  employeeDetails: {
    flex: 1,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  employeeRole: {
    fontSize: 14,
    color: COLORS.gray,
    fontStyle: 'italic',
    marginBottom: 6,
  },
  contactInfo: {
    marginTop: 4,
  },
  phoneNumber: {
    fontSize: 13,
    color: COLORS.gray,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginLeft: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Info Grid
  cardBody: {
    marginBottom: 20,
  },
  infoGrid: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '600',
  },

  // Enhanced Action Buttons
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  viewButton: {
    backgroundColor: COLORS.blue + '15',
    borderColor: COLORS.blue + '30',
  },
  editButton: {
    backgroundColor: COLORS.green + '15',
    borderColor: COLORS.green + '30',
  },
  deleteButton: {
    backgroundColor: COLORS.red + '15',
    borderColor: COLORS.red + '30',
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.blue,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.green,
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.red,
  },

  // Enhanced Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.lightGray1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.green,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyActionIcon: {
    fontSize: 16,
    color: COLORS.white,
    marginRight: 8,
  },
  emptyActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Enhanced FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  fabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.green,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  fabText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
  },

  // Enhanced Delete Modal
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  deleteModalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 350,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  deleteModalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  deleteModalIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  deleteModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
  },
  deleteModalMessage: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  employeeNameInModal: {
    fontWeight: 'bold',
    color: COLORS.black,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray1,
    borderWidth: 1,
    borderColor: COLORS.gray + '30',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray,
    textAlign: 'center',
  },
  confirmDeleteButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: COLORS.red,
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmDeleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
  },
});

export default FarmEmployeeTableScreen;