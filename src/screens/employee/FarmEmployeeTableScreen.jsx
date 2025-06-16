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
  RefreshControl,
  Animated,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { icons } from '../../constants';
import { COLORS } from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';
import { getFarmEmployees, deleteEmployee } from '../../services/employees'; // Import your API functions

const FarmEmployeeListScreen = ({ navigation }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterType, setFilterType] = useState(''); // Keep only filterType, remove filterRole
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast state and animation
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toastAnimation = useState(new Animated.Value(-100))[0];

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Add focus listener to refresh data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchEmployees();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const result = await getFarmEmployees(); // This will use the active farm automatically

      if (result.error) {
        Alert.alert('Error', result.error);
        setEmployees([]);
      } else {
        // Transform the API data to match your component's expected format
        const transformedEmployees = result.data.map(employee => ({
          ...employee,
          fullName: `${employee.firstName}${employee.middleName ? ' ' + employee.middleName : ''} ${employee.lastName}`,
          // Ensure salary is formatted as string with commas if needed
          salary: employee.salary ? employee.salary.toLocaleString() : '0',
        }));
        setEmployees(transformedEmployees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      Alert.alert('Error', 'Failed to fetch employees');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEmployees();
    setRefreshing(false);
  }, []);

  // Toast functions
  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);

    // Animate toast in
    Animated.timing(toastAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto hide after 3 seconds
    setTimeout(() => {
      hideToast();
    }, 3000);
  };

  const hideToast = () => {
    Animated.timing(toastAnimation, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setToastVisible(false);
      setToastMessage('');
    });
  };

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
          const matchesType = filterType === '' || employee.employeeType === filterType;

          return matchesSearch && matchesType;
        }
      )
      .sort((a, b) => {
        if (sortBy === 'name') {
          return sortOrder === 'asc'
            ? a.fullName.localeCompare(b.fullName)
            : b.fullName.localeCompare(a.fullName);
        } else if (sortBy === 'date') {
          const dateA = new Date(a.dateOfEmployment);
          const dateB = new Date(b.dateOfEmployment);

          if (isNaN(dateA.getTime())) return 1;
          if (isNaN(dateB.getTime())) return -1;

          return sortOrder === 'asc'
            ? dateA.getTime() - dateB.getTime()
            : dateB.getTime() - dateA.getTime();
        }
        return 0;
      });
  }, [employees, searchQuery, sortBy, sortOrder, filterType]);

  const handleDelete = useCallback((employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteModalVisible(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!employeeToDelete) return;

    try {
      setIsDeleting(true);
      const result = await deleteEmployee(employeeToDelete.id);

      if (result.error) {
        Alert.alert('Error', result.error);
      } else {
        // Remove employee from local state
        setEmployees(prev => prev.filter(employee => employee.id !== employeeToDelete.id));
        setIsDeleteModalVisible(false);
        setEmployeeToDelete(null);

        // Show success toast instead of Alert
        setTimeout(() => {
          showToast('Employee deleted successfully');
        }, 300);
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      Alert.alert('Error', 'Failed to delete employee');
    } finally {
      setIsDeleting(false);
    }
  }, [employeeToDelete]);

  const cancelDelete = useCallback(() => {
    setIsDeleteModalVisible(false);
    setEmployeeToDelete(null);
  }, []);

  const handleEdit = useCallback(
    employee => {
      navigation.navigate('EditEmployeeScreen', { employeeId: employee.id });
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

      {/* Filter Buttons */}
      <View style={styles.filterButtonsContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterType === '' && styles.activeFilterButton,
          ]}
          onPress={() => setFilterType('')}>
          <Text style={[
            styles.filterButtonText,
            filterType === '' && styles.activeFilterButtonText,
          ]}>
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filterType === 'permanent' && styles.activeFilterButton,
          ]}
          onPress={() => setFilterType('permanent')}>
          <Text style={[
            styles.filterButtonText,
            filterType === 'permanent' && styles.activeFilterButtonText,
          ]}>
            Permanent
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filterType === 'casual' && styles.activeFilterButton,
          ]}
          onPress={() => setFilterType('casual')}>
          <Text style={[
            styles.filterButtonText,
            filterType === 'casual' && styles.activeFilterButtonText,
          ]}>
            Casual
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionBar}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            sortBy === 'date' && styles.activeActionButton // Add visual feedback
          ]}
          onPress={() => toggleSort('date')}>
          <FastImage
            source={icons.calendar}
            style={styles.actionIcon}
            tintColor={sortBy === 'date' ? COLORS.green : "#333"}
          />
          <Text style={[
            styles.actionText,
            sortBy === 'date' && styles.activeActionText
          ]}>
            Sort by Date {sortBy === 'date' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
          </Text>
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
              onPress={() => handleDelete(item)}
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
          {item.idNumber && (
            <View style={styles.detailRow}>
              <FastImage
                source={icons.account}
                style={styles.detailIcon}
                tintColor="#666"
              />
              <Text style={styles.detailText}>ID: {item.idNumber}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <FastImage
              source={icons.calendar}
              style={styles.detailIcon}
              tintColor="#666"
            />
            <Text style={styles.detailText}>
              Employed: {new Date(item.dateOfEmployment).toLocaleDateString()}
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

  const renderDeleteModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isDeleteModalVisible}
      onRequestClose={cancelDelete}>
      <View style={styles.deleteModalOverlay}>
        <View style={styles.deleteModalContainer}>
          <View style={styles.deleteModalContent}>
            {/* Icon */}
            <View style={styles.deleteIconContainer}>
              <FastImage
                source={icons.remove}
                style={styles.deleteModalIcon}
                tintColor="#F44336"
              />
            </View>

            {/* Title */}
            <Text style={styles.deleteModalTitle}>Delete Employee</Text>

            {/* Message */}
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to delete{' '}
              <Text style={styles.deleteModalEmployeeName}>
                {employeeToDelete?.fullName}
              </Text>
              ? This action cannot be undone.
            </Text>

            {/* Buttons */}
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelDelete}
                disabled={isDeleting}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
                onPress={confirmDelete}
                disabled={isDeleting}>
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.deleteButtonText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderToast = () => {
    if (!toastVisible) return null;

    return (
      <Animated.View
        style={[
          styles.toastContainer,
          {
            transform: [{ translateY: toastAnimation }]
          }
        ]}
      >
        <View style={styles.toastContent}>
          <FastImage
            source={icons.submited} // Using a check/success icon
            style={styles.toastIcon}
            tintColor="#fff"
          />
          <Text style={styles.toastText}>{toastMessage}</Text>
          <TouchableOpacity onPress={hideToast} style={styles.toastCloseButton}>
            <Text style={styles.toastCloseText}>×</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <FastImage
        source={icons.account}
        style={styles.emptyIcon}
        tintColor="#ccc"
      />
      <Text style={styles.emptyTitle}>No Employees Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery || filterType
          ? "Try adjusting your search or filters"
          : "Start by adding your first employee"
        }
      </Text>
      {!searchQuery && !filterType && (
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.navigate('AddEmployeeScreen')}>
          <Text style={styles.emptyButtonText}>Add Employee</Text>
        </TouchableOpacity>
      )}
    </View>
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
      <SecondaryHeader title="Farm Employees" />

      <StatusBar
        translucent
        backgroundColor={COLORS.green2}
        animated={true}
        barStyle={'light-content'}
      />

      {/* Toast notification */}
      {renderToast()}

      {renderHeader()}
      <FlatList
        data={sortedAndFilteredEmployees}
        renderItem={renderEmployeeCard}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={[
          styles.listContent,
          sortedAndFilteredEmployees.length === 0 && styles.emptyListContent
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.green]}
            tintColor={COLORS.green}
          />
        }
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
      {renderDeleteModal()}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
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
  filterButtonsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 10,
    paddingHorizontal: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E9ECEF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minHeight: 44,
    position: 'relative',
    overflow: 'hidden',
  },
  activeActionButton: {
    backgroundColor: COLORS.green + '20',
    borderWidth: 1,
    borderColor: COLORS.green,
  },
  activeActionText: {
    color: COLORS.green,
    fontWeight: '600',
  },
  activeFilterButton: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
    elevation: 4,
    shadowColor: COLORS.green,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    transform: [{ scale: 1.02 }],
  },
  filterButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#495057',
    letterSpacing: 0.3,
  },
  activeFilterButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Optional: Add these additional styles for even more enhancement
  filterButtonGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 25,
  },
  filterButtonRipple: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0,
  },

  // Alternative pill-style buttons (choose one approach)
  filterButtonsContainerAlt: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#F1F3F4',
    borderRadius: 30,
    padding: 4,
    marginHorizontal: 8,
  },
  filterButtonAlt: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    minHeight: 40,
  },
  activeFilterButtonAlt: {
    backgroundColor: COLORS.white,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterButtonTextAlt: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeFilterButtonTextAlt: {
    color: '#1F2937',
    fontWeight: '600',
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
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  emptyButton: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
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
  // Delete Modal Styles
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  deleteModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 340,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  deleteModalContent: {
    padding: 24,
    alignItems: 'center',
  },
  deleteIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF3F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteModalIcon: {
    width: 32,
    height: 32,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  deleteModalMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  deleteModalEmployeeName: {
    fontWeight: '600',
    color: '#1F2937',
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  deleteButtonDisabled: {
    backgroundColor: '#FCA5A5',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Toast Styles
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  toastContent: {
    backgroundColor: COLORS.green,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 6,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  toastIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  toastText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  toastCloseButton: {
    padding: 4,
    marginLeft: 8,
  },
  toastCloseText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 20,
  },
});

export default FarmEmployeeListScreen;