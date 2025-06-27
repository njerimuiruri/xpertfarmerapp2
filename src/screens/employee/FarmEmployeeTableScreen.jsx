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
  Dimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { icons } from '../../constants';
import { COLORS } from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';
import { getFarmEmployees, deleteEmployee } from '../../services/employees';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEMS_PER_PAGE = 10;

const FarmEmployeeListScreen = ({ navigation }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterType, setFilterType] = useState('');
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Toast state and animation
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toastAnimation = useState(new Animated.Value(-100))[0];

  // Animation for cards
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    fetchEmployees();
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchEmployees();
    });
    return unsubscribe;
  }, [navigation]);

  // Reset pagination when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, sortBy, sortOrder]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const result = await getFarmEmployees();

      if (result.error) {
        Alert.alert('Error', result.error);
        setEmployees([]);
      } else {
        const transformedEmployees = result.data.map(employee => ({
          ...employee,
          fullName: `${employee.firstName}${employee.middleName ? ' ' + employee.middleName : ''} ${employee.lastName}`,
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
    setCurrentPage(1);
    await fetchEmployees();
    setRefreshing(false);
  }, []);

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);

    Animated.timing(toastAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

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

  const getDisplayRole = (employee) => {
    if (employee.role === 'custom' && employee.customRole) {
      return employee.customRole;
    }
    return employee.role.charAt(0).toUpperCase() + employee.role.slice(1);
  };

  const sortedAndFilteredEmployees = useMemo(() => {
    return employees
      .filter(employee => {
        const matchesSearch = employee.fullName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === '' || employee.employeeType === filterType;
        return matchesSearch && matchesType;
      })
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

  const paginatedEmployees = useMemo(() => {
    const startIndex = 0;
    const endIndex = currentPage * ITEMS_PER_PAGE;
    return sortedAndFilteredEmployees.slice(startIndex, endIndex);
  }, [sortedAndFilteredEmployees, currentPage]);

  const totalPages = Math.ceil(sortedAndFilteredEmployees.length / ITEMS_PER_PAGE);
  const hasMoreData = currentPage < totalPages;

  const loadMoreData = useCallback(() => {
    if (!isLoadingMore && hasMoreData) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setIsLoadingMore(false);
      }, 500);
    }
  }, [isLoadingMore, hasMoreData]);

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
        setEmployees(prev => prev.filter(employee => employee.id !== employeeToDelete.id));
        setIsDeleteModalVisible(false);
        setEmployeeToDelete(null);

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
      {/* Search Container */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <FastImage
            source={icons.search}
            style={styles.searchIcon}
            tintColor={COLORS.green}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search employees..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearButton}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterSection}>
        <Text style={styles.sectionTitle}>Filter by Type</Text>
        <View style={styles.filterButtonsContainer}>
          {[
            { key: '', label: 'All', count: employees.length },
            { key: 'permanent', label: 'Permanent', count: employees.filter(e => e.employeeType === 'permanent').length },
            { key: 'casual', label: 'Casual', count: employees.filter(e => e.employeeType === 'casual').length }
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                filterType === filter.key && styles.activeFilterButton,
              ]}
              onPress={() => setFilterType(filter.key)}>
              <Text style={[
                styles.filterButtonText,
                filterType === filter.key && styles.activeFilterButtonText,
              ]}>
                {filter.label}
              </Text>
              <View style={[
                styles.filterCount,
                filterType === filter.key && styles.activeFilterCount,
              ]}>
                <Text style={[
                  styles.filterCountText,
                  filterType === filter.key && styles.activeFilterCountText,
                ]}>
                  {filter.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.statsAndSortContainer}>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            Showing {paginatedEmployees.length} of {sortedAndFilteredEmployees.length} employees
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'date' && styles.activeSortButton]}
          onPress={() => toggleSort('date')}>
          <FastImage
            source={icons.calendar}
            style={styles.sortIcon}
            tintColor={sortBy === 'date' ? COLORS.white : COLORS.green}
          />
          <Text style={[
            styles.sortButtonText,
            sortBy === 'date' && styles.activeSortButtonText
          ]}>
            Date {sortBy === 'date' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmployeeCard = ({ item, index }) => {
    const displayRole = getDisplayRole(item);

    return (
      <Animated.View
        style={[
          styles.cardContainer,
          {
            opacity: fadeAnim,
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            }],
          }
        ]}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('EmployeeDetailScreen', { employee: item })}
          activeOpacity={0.7}>

          <View style={styles.cardHeader}>
            <View style={styles.employeeInfo}>
              <Text style={styles.name}>{item.fullName}</Text>
              <View style={styles.roleContainer}>
                <Text style={styles.position}>{displayRole}</Text>
                <View style={[
                  styles.employeeTypeBadge,
                  item.employeeType === 'casual' ? styles.casualBadge : styles.permanentBadge
                ]}>
                  <Text style={[
                    styles.badgeText,
                    item.employeeType === 'casual' ? styles.casualBadgeText : styles.permanentBadgeText
                  ]}>
                    {item.employeeType.charAt(0).toUpperCase() + item.employeeType.slice(1)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity
                onPress={() => handleEdit(item)}
                style={[styles.cardActionButton, styles.editButton]}>
                <FastImage
                  source={icons.submited}
                  style={styles.cardActionIcon}
                  tintColor="#fff"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                style={[styles.cardActionButton, styles.deleteButton]}>
                <FastImage
                  source={icons.remove}
                  style={styles.cardActionIcon}
                  tintColor="#fff"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.cardDetails}>
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <FastImage
                  source={icons.call}
                  style={styles.detailIcon}
                  tintColor={COLORS.green}
                />
              </View>
              <Text style={styles.detailText}>{item.phone}</Text>
            </View>

            {item.idNumber && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <FastImage
                    source={icons.account}
                    style={styles.detailIcon}
                    tintColor={COLORS.green}
                  />
                </View>
                <Text style={styles.detailText}>ID: {item.idNumber}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <FastImage
                  source={icons.calendar}
                  style={styles.detailIcon}
                  tintColor={COLORS.green}
                />
              </View>
              <Text style={styles.detailText}>
                Employed: {new Date(item.dateOfEmployment).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.salaryRow}>
              <Text style={styles.salaryLabel}>
                {item.paymentSchedule.charAt(0).toUpperCase() + item.paymentSchedule.slice(1)} Salary:
              </Text>
              <Text style={styles.salaryAmount}>KSh {item.salary}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderLoadMoreButton = () => {
    if (!hasMoreData) return null;

    return (
      <View style={styles.loadMoreContainer}>
        <TouchableOpacity
          style={styles.loadMoreButton}
          onPress={loadMoreData}
          disabled={isLoadingMore}>
          {isLoadingMore ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.loadMoreText}>Load More</Text>
              <Text style={styles.loadMoreSubtext}>
                {sortedAndFilteredEmployees.length - paginatedEmployees.length} remaining
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
            <View style={styles.deleteIconContainer}>
              <FastImage
                source={icons.remove}
                style={styles.deleteModalIcon}
                tintColor="#EF4444"
              />
            </View>

            <Text style={styles.deleteModalTitle}>Delete Employee</Text>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to delete{' '}
              <Text style={styles.deleteModalEmployeeName}>
                {employeeToDelete?.fullName}
              </Text>
              ? This action cannot be undone.
            </Text>

            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelDelete}
                disabled={isDeleting}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmDeleteButton, isDeleting && styles.deleteButtonDisabled]}
                onPress={confirmDelete}
                disabled={isDeleting}>
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmDeleteButtonText}>Delete</Text>
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
            source={icons.submited}
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
      <View style={styles.emptyIconContainer}>
        <FastImage
          source={icons.account}
          style={styles.emptyIcon}
          tintColor="#D1D5DB"
        />
      </View>
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

      {renderToast()}

      <FlatList
        data={paginatedEmployees}
        renderItem={renderEmployeeCard}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderLoadMoreButton}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContent,
          paginatedEmployees.length === 0 && styles.emptyListContent
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.green]}
            tintColor={COLORS.green}
          />
        }
        showsVerticalScrollIndicator={false}
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
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    width: 18,
    height: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '400',
  },
  clearButton: {
    fontSize: 20,
    color: '#9CA3AF',
    fontWeight: 'bold',
    paddingHorizontal: 6,
  },
  filterSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  activeFilterButton: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 2,
  },
  activeFilterButtonText: {
    color: COLORS.white,
  },
  filterCount: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  activeFilterCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  filterCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  activeFilterCountText: {
    color: COLORS.white,
  },
  statsAndSortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsContainer: {
    flex: 1,
  },
  statsText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeSortButton: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },
  sortIcon: {
    width: 14,
    height: 14,
    marginRight: 5,
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  activeSortButtonText: {
    color: COLORS.white,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardContainer: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  employeeInfo: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  position: {
    fontSize: 13,
    color: '#6B7280',
    marginRight: 8,
    fontWeight: '500',
  },
  employeeTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  casualBadge: {
    backgroundColor: '#FEF3C7',
  },
  permanentBadge: {
    backgroundColor: '#D1FAE5',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  casualBadgeText: {
    color: '#92400E',
  },
  permanentBadgeText: {
    color: '#065F46',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 6,
  },
  cardActionButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: COLORS.green,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  cardActionIcon: {
    width: 16,
    height: 16,
  },
  cardDetails: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  detailIcon: {
    width: 14,
    height: 14,
  },
  detailText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
    flex: 1,
  },
  salaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  salaryLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  salaryAmount: {
    fontSize: 14,
    color: COLORS.green,
    fontWeight: '700',
  },
  loadMoreContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  loadMoreButton: {
    backgroundColor: COLORS.green,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  loadMoreText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  loadMoreSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    width: 32,
    height: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.green,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabIcon: {
    width: 24,
    height: 24,
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  deleteModalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  deleteModalContent: {
    padding: 24,
    alignItems: 'center',
  },
  deleteIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteModalIcon: {
    width: 28,
    height: 28,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  deleteModalMessage: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
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
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  confirmDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonDisabled: {
    opacity: 0.7,
  },
  confirmDeleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    zIndex: 1000,
    elevation: 1000,
  },
  toastContent: {
    backgroundColor: COLORS.green,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  toastIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  toastText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '500',
  },
  toastCloseButton: {
    padding: 4,
  },
  toastCloseText: {
    fontSize: 18,
    color: COLORS.white,
    fontWeight: 'bold',
  },
});

export default FarmEmployeeListScreen;