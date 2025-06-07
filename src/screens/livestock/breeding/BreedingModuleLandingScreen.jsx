import React, { useState, useCallback, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StatusBar,
  TextInput,
  ScrollView,
  Modal,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { icons } from '../../../constants';
import { COLORS } from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';
import {
  getAllBreedingRecords,
  deleteBreedingRecord,
  getBreedingStatistics,
  getBreedsForActiveFarm,
  getBreedingRecordById,
} from '../../../services/breeding';
import { getLivestockForActiveFarm } from '../../../services/livestock';

const BreedingModuleLandingScreen = ({ navigation }) => {
  const [breedingRecords, setBreedingRecords] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [livestockMap, setLivestockMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('serviceDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeFarm, setActiveFarm] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  const [statistics, setStatistics] = useState({
    totalBreedings: 0,
    pregnantAnimals: 0,
    successfulBirths: 0,
    expectedBirths: 0
  });

  const getActiveFarmInfo = async () => {
    try {
      const activeFarmRaw = await AsyncStorage.getItem('activeFarm');
      const farm = JSON.parse(activeFarmRaw || '{}');
      setActiveFarm(farm);
      return farm;
    } catch (error) {
      console.error('Error getting active farm:', error);
      return null;
    }
  };

  const fetchBreeds = async () => {
    try {
      const { data, error } = await getBreedsForActiveFarm();
      if (error) {
        console.warn('Error loading breeds:', error);
        setBreeds([]);
      } else {
        setBreeds(data || []);
        console.log('✅ Breeds loaded:', data?.length);
      }
    } catch (error) {
      console.error('Unexpected error in fetchBreeds:', error.message);
      setBreeds([]);
    }
  };

  const fetchStatistics = async () => {
    try {
      const farm = await getActiveFarmInfo();
      if (!farm?.id) return;

      const { data, error } = await getBreedingStatistics(farm.id);
      if (!error && data) {
        setStatistics(data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchLivestock = async () => {
    try {
      const farm = await getActiveFarmInfo();
      if (!farm?.id) {
        console.log('No active farm found, not fetching livestock');
        setLivestockMap({});
        return;
      }

      const { data: livestock, error } = await getLivestockForActiveFarm();
      if (error) {
        console.error('Error fetching livestock for active farm:', error);
        setLivestockMap({});
        return;
      }

      const map = {};
      livestock?.forEach(animal => {
        const animalData = animal?.mammal || animal?.poultry;
        map[animal.id] = {
          id: animal.id,
          idNumber: animalData?.idNumber || 'N/A',
          breedType: animalData?.breedType || 'Unknown',
          type: animal.type || 'Unknown',
          gender: animalData?.gender || 'Unknown',
        };
      });

      console.log('Created livestock map for active farm with', Object.keys(map).length, 'animals');
      setLivestockMap(map);
    } catch (error) {
      console.error('Error creating livestock map:', error);
      setLivestockMap({});
    }
  };

  const fetchBreedingRecords = async () => {
    try {
      const farm = await getActiveFarmInfo();
      if (!farm?.id) {
        console.log('No active farm found, not fetching breeding records');
        setBreedingRecords([]);
        return;
      }

      const { data, error } = await getAllBreedingRecords(farm.id);
      if (error) {
        Alert.alert('Error', error);
        setBreedingRecords([]);
        return;
      }

      console.log('Fetched breeding records for active farm:', data?.length || 0, 'records');
      setBreedingRecords(data || []);
    } catch (error) {
      console.error('Error fetching breeding records:', error);
      Alert.alert('Error', 'Failed to fetch breeding records');
      setBreedingRecords([]);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const farm = await getActiveFarmInfo();
      if (!farm?.id) {
        console.log('No active farm selected');
        setBreeds([]);
        setLivestockMap({});
        setBreedingRecords([]);
        setStatistics({ totalBreedings: 0, pregnantAnimals: 0, successfulBirths: 0, expectedBirths: 0 });
        setLoading(false);
        return;
      }

      console.log('Loading data for active farm:', farm.name);
      await Promise.all([
        fetchLivestock(),
        fetchBreedingRecords(),
        fetchBreeds(),
        fetchStatistics(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleViewDetails = async (recordId) => {
    try {
      const record = await getBreedingRecordById(recordId);
      navigation.navigate('BreedingRecordDetailScreen', { record });
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const getPregnancyStatus = (record) => {
    const today = new Date();
    const serviceDate = new Date(record.serviceDate);
    const expectedBirthDate = new Date(record.expectedBirthDate);

    const actualBirthDate = record.birthDate || record.actualBirthDate;

    if (record.birthRecorded || record.offspring?.length > 0 || actualBirthDate) {
      const birthDate = actualBirthDate ? new Date(actualBirthDate) : null;
      return {
        status: 'delivered',
        text: birthDate ? `Delivered` : 'Delivered',
        color: COLORS.green,
        icon: icons.tick,
        actualDate: birthDate,
      };
    }

    if (today > expectedBirthDate) {
      const overdueDays = Math.ceil((today - expectedBirthDate) / (1000 * 60 * 60 * 24));
      return {
        status: 'failed',
        text: `Overdue by ${overdueDays} days`,
        color: COLORS.red,
        icon: icons.warning,
      };
    }

    const daysRemaining = Math.ceil((expectedBirthDate - today) / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 7) {
      return {
        status: 'pregnant',
        text: `Due in ${daysRemaining} days`,
        color: COLORS.orange,
        icon: icons.clock,
      };
    }

    return {
      status: 'pregnant',
      text: `${daysRemaining} days to go`,
      color: COLORS.blue,
      icon: icons.clock,
    };
  };
  const hasOffspring = (record) => {
    return record.offspring && record.offspring.length > 0;
  };
  const sortedAndFilteredRecords = useMemo(() => {
    return breedingRecords
      .filter(record => {
        const damInfo = livestockMap[record.damId];
        const sireInfo = livestockMap[record.sireId];
        const pregnancyStatus = getPregnancyStatus(record);

        const matchesSearch =
          searchQuery === '' ||
          damInfo?.idNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sireInfo?.idNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          damInfo?.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sireInfo?.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.purpose?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.strategy?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          filterStatus === 'all' ||
          pregnancyStatus.status === filterStatus;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'serviceDate') {
          const dateA = new Date(a.serviceDate);
          const dateB = new Date(b.serviceDate);
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        } else if (sortBy === 'expectedBirthDate') {
          const dateA = new Date(a.expectedBirthDate);
          const dateB = new Date(b.expectedBirthDate);
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        }
        return 0;
      });
  }, [breedingRecords, livestockMap, searchQuery, filterStatus, sortBy, sortOrder]);

  const handleDelete = useCallback((recordId) => {
    setRecordToDelete(recordId);
    setDeleteModalVisible(true);
  }, []);
  const confirmDelete = async () => {
    try {
      await deleteBreedingRecord(recordToDelete);
      setDeleteModalVisible(false);
      setRecordToDelete(null);
      Alert.alert('Success', 'Breeding record deleted successfully');
      fetchBreedingRecords();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete breeding record');
    }
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setRecordToDelete(null);
  };
  const toggleSort = useCallback(() => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  const filterOptions = [
    { key: 'all', label: 'All', color: COLORS.gray },
    { key: 'pregnant', label: 'Pregnant', color: COLORS.blue },
    { key: 'delivered', label: 'Delivered', color: COLORS.green },
    { key: 'failed', label: 'Failed', color: COLORS.red }
  ];

  const renderBreedingRecord = ({ item }) => {
    const damInfo = livestockMap[item.damId];
    const sireInfo = livestockMap[item.sireId];
    const pregnancyStatus = getPregnancyStatus(item);

    return (
      <TouchableOpacity
        style={styles.recordCard}
        onPress={() => handleViewDetails(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: pregnancyStatus.color + '20' }]}>
            <FastImage
              source={pregnancyStatus.icon}
              style={[styles.statusIcon, { tintColor: pregnancyStatus.color }]}
            />
            <Text style={[styles.statusText, { color: pregnancyStatus.color }]}>
              {pregnancyStatus.text}
            </Text>
          </View>
        </View>

        <View style={styles.animalsContainer}>
          <View style={styles.animalInfo}>
            <Text style={styles.animalLabel}>Dam (♀)</Text>
            <Text style={styles.animalName}>
              {damInfo ? `${damInfo.idNumber}` : 'Unknown'}
            </Text>
            <Text style={styles.animalDetails}>
              {damInfo ? `${damInfo.type} - ${damInfo.breedType}` : 'N/A'}
            </Text>
          </View>

          <View style={styles.breedingIcon}>
            <FastImage source={icons.heart} style={styles.heartIcon} tintColor={COLORS.pink} />
          </View>

          <View style={styles.animalInfo}>
            <Text style={styles.animalLabel}>Sire (♂)</Text>
            <Text style={styles.animalName}>
              {item.serviceType === 'Artificial Insemination'
                ? item.sireCode || 'AI Code'
                : sireInfo ? `${sireInfo.idNumber}` : 'Unknown'
              }
            </Text>
            <Text style={styles.animalDetails}>
              {item.serviceType === 'Artificial Insemination'
                ? `AI - ${item.aiType || 'Regular'}`
                : sireInfo ? `${sireInfo.type} - ${sireInfo.breedType}` : 'N/A'
              }
            </Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Purpose:</Text>
            <Text style={styles.detailValue}>{item.purpose}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Strategy:</Text>
            <Text style={styles.detailValue}>{item.strategy}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Service Date:</Text>
            <Text style={styles.detailValue}>
              {new Date(item.serviceDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              {pregnancyStatus.actualDate ? 'Birth Date:' : 'Expected Birth:'}
            </Text>
            <Text style={styles.detailValue}>
              {pregnancyStatus.actualDate
                ? pregnancyStatus.actualDate.toLocaleDateString()
                : new Date(item.expectedBirthDate).toLocaleDateString()
              }
            </Text>
          </View>
        </View>

        <View style={styles.actionContainer}>
          {pregnancyStatus.status === 'pregnant' ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.recordBirthButton]}
              onPress={(e) => {
                e.stopPropagation();
                navigation.navigate('RecordBirthScreen', { breedingRecord: item });
              }}
            >
              <FastImage source={icons.submited} style={styles.actionIcon} tintColor={COLORS.white} />
              <Text style={styles.recordBirthText}>Record Birth</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.viewOffspringButton]}
              onPress={(e) => {
                e.stopPropagation();
                navigation.navigate('ViewOffspringScreen', { breedingRecord: item });
              }}
            >
              <FastImage source={icons.eye} style={styles.actionIcon} tintColor={COLORS.white} />
              <Text style={styles.viewOffspringText}>View Offspring</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={(e) => {
              e.stopPropagation();
              navigation.navigate('EditBreedingRecordScreen', { recordId: item.id });
            }}
          >
            <FastImage source={icons.edit} style={styles.actionIcon} tintColor="#2196F3" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.deleteButton,
              hasOffspring(item) && styles.disabledButton
            ]}
            onPress={(e) => {
              e.stopPropagation();
              if (hasOffspring(item)) {
                Alert.alert(
                  'Cannot Delete',
                  'This breeding record cannot be deleted because offspring have been registered.',
                  [{ text: 'OK' }]
                );
                return;
              }
              handleDelete(item.id);
            }}
            disabled={hasOffspring(item)}
          >
            <FastImage
              source={icons.remove}
              style={styles.actionIcon}
              tintColor={hasOffspring(item) ? COLORS.gray : "#F44336"}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (!activeFarm?.id) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <FastImage source={icons.heart} style={styles.emptyIcon} tintColor={COLORS.gray} />
          </View>
          <Text style={styles.emptyTitle}>No Active Farm Selected</Text>
          <Text style={styles.emptyText}>
            Please select an active farm to view breeding records.
          </Text>
        </View>
      );
    }

    if (searchQuery && sortedAndFilteredRecords.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <FastImage source={icons.search} style={styles.emptyIcon} tintColor={COLORS.gray} />
          </View>
          <Text style={styles.emptyTitle}>No Results Found</Text>
          <Text style={styles.emptyText}>
            No breeding records match your search criteria. Try adjusting your search or filters.
          </Text>
        </View>
      );
    }

    if (breedingRecords.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <FastImage source={icons.heart} style={styles.emptyIcon} tintColor={COLORS.green} />
          </View>
          <Text style={styles.emptyTitle}>No Records Yet</Text>
          <Text style={styles.emptyText}>
            Start tracking your breeding program for {activeFarm.name}
          </Text>
          <TouchableOpacity
            style={styles.addFirstButton}
            onPress={() => navigation.navigate('BreedingRecordForm')}
          >
            <FastImage source={icons.plus} style={styles.addButtonIcon} tintColor={COLORS.white} />
            <Text style={styles.addFirstButtonText}>Add First Record</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <SecondaryHeader title="Breeding Records" />
        <StatusBar barStyle="light-content" backgroundColor={COLORS.green} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.green} />
          <Text style={styles.loadingText}>
            Loading breeding records{activeFarm?.name ? ` for ${activeFarm.name}` : ''}...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader title="Breeding Records" />
      <StatusBar barStyle="light-content" backgroundColor={COLORS.green} />

      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <FastImage
            source={icons.search}
            style={styles.searchIcon}
            tintColor="#666"
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search breeding records..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollView}
        >
          <View style={styles.filterContainer}>
            {filterOptions.map(option => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.filterButton,
                  filterStatus === option.key && [styles.activeFilterButton, { backgroundColor: option.color }],
                ]}
                onPress={() => setFilterStatus(option.key)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filterStatus === option.key && styles.activeFilterButtonText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity
          style={styles.sortButton}
          onPress={toggleSort}
        >
          <FastImage
            source={icons.calendar}
            style={styles.sortIcon}
            tintColor="#666"
          />
          <Text style={styles.sortText}>
            Sort by Date ({sortOrder === 'asc' ? '↑' : '↓'})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedAndFilteredRecords}
        keyExtractor={item => item.id}
        renderItem={renderBreedingRecord}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.green]}
            tintColor={COLORS.green}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />

      {activeFarm?.id && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('BreedingRecordForm')}
        >
          <FastImage source={icons.plus} style={styles.fabIcon} tintColor="#fff" />
        </TouchableOpacity>
      )}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.warningIconContainer}>
                <FastImage
                  source={icons.warning}
                  style={styles.warningIcon}
                  tintColor={COLORS.red}
                />
              </View>
              <Text style={styles.modalTitle}>Delete Breeding Record</Text>
              <Text style={styles.modalSubtitle}>
                This action cannot be undone. Are you sure you want to permanently delete this breeding record?
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelDelete}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteConfirmButton}
                onPress={confirmDelete}
                activeOpacity={0.7}
              >
                <FastImage
                  source={icons.remove}
                  style={styles.deleteButtonIcon}
                  tintColor={COLORS.white}
                />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray1,
  },
  scrollView: { flex: 1 },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
  },
  header: {
    backgroundColor: COLORS.white,
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray2,
    borderRadius: 25,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 45,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.dark,
  },
  filterScrollView: {
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray2,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeFilterButton: {
    borderColor: 'transparent',
  },
  filterButtonText: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.lightGray2,
    borderRadius: 16,
  },
  sortIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  sortText: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  recordCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusContainer: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    maxWidth: '80%', // Prevent status from taking full width
  },
  statusIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1, // Allow text to shrink if needed
  },
  animalsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  animalInfo: {
    flex: 1,
    alignItems: 'center',
  },
  animalLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  animalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
  },
  animalDetails: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 2,
  },
  breedingIcon: {
    marginHorizontal: 16,
  },
  heartIcon: {
    width: 24,
    height: 24,
  },
  detailsContainer: {
    backgroundColor: COLORS.lightGray2,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '600',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  recordBirthButton: {
    backgroundColor: COLORS.green,
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  viewOffspringButton: {
    backgroundColor: COLORS.blue,
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  editButton: {
    backgroundColor: COLORS.lightBlue,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: COLORS.lightRed,
  },
  actionIcon: {
    width: 16,
    height: 16,
  },
  recordBirthText: {
    color: COLORS.white,
    fontWeight: '600',
    marginLeft: 6,
  },
  viewOffspringText: {
    color: COLORS.white,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.lightGray2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    width: 48,
    height: 48,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 280,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.green,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  addFirstButtonText: {
    color: COLORS.white,
    fontSize: 18,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 0,
    width: '100%',
    maxWidth: 340,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  warningIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.red + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  warningIcon: {
    width: 28,
    height: 28,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 15,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray2,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.lightGray2,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray,
  },
  deleteConfirmButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: COLORS.red,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  deleteButtonIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  disabledButton: {
    backgroundColor: COLORS.lightGray2,
    opacity: 0.5,
  },
});

export default BreedingModuleLandingScreen;