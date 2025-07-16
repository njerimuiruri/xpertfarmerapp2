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
  Dimensions,
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

const { width } = Dimensions.get('window');

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
  const [filterModalVisible, setFilterModalVisible] = useState(false);

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

      console.log('Raw livestock data:', livestock); // Debug log

      const map = {};
      livestock?.forEach(animal => {
        // Try multiple possible data structures
        const animalData = animal?.mammal || animal?.poultry || animal;

        // Create multiple key mappings to handle different ID scenarios
        const animalInfo = {
          id: animal.id,
          idNumber: animalData?.idNumber || animalData?.damCode || animalData?.sireCode || 'N/A',
          breedType: animalData?.breedType || animalData?.breed || 'Unknown',
          type: animal.type || animalData?.type || 'Unknown',
          gender: animalData?.gender || 'Unknown',
          // Add additional fields that might be useful
          name: animalData?.name || animalData?.idNumber || 'Unnamed',
          damCode: animalData?.damCode,
          sireCode: animalData?.sireCode,
        };

        // Map using animal.id (primary)
        map[animal.id] = animalInfo;

        // Also map using idNumber if it exists (for backward compatibility)
        if (animalData?.idNumber) {
          map[animalData.idNumber] = animalInfo;
        }

        // Map using damCode/sireCode if they exist
        if (animalData?.damCode) {
          map[animalData.damCode] = animalInfo;
        }
        if (animalData?.sireCode) {
          map[animalData.sireCode] = animalInfo;
        }
      });

      console.log('Created livestock map keys:', Object.keys(map)); // Debug log
      console.log('Sample livestock map entry:', map[Object.keys(map)[0]]); // Debug log
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

      console.log('Fetched breeding records:', data?.length || 0, 'records');
      console.log('Sample breeding record:', data?.[0]); // Debug log

      // Log the damId and sireId from breeding records
      data?.forEach((record, index) => {
        if (index < 3) { // Log first 3 records
          console.log(`Record ${index}: damId=${record.damId}, sireId=${record.sireId}`);
        }
      });

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
        color: '#FF8C00', // Orange for due soon
        icon: icons.clock,
      };
    }

    return {
      status: 'pregnant',
      text: `${daysRemaining} days to go`,
      color: COLORS.green,
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
    { key: 'all', label: 'All Records', color: '#4A5568', icon: icons.grid },
    { key: 'pregnant', label: 'Pregnant', color: COLORS.green, icon: icons.clock },
    { key: 'delivered', label: 'Delivered', color: '#22C55E', icon: icons.tick },
    { key: 'failed', label: 'Overdue', color: COLORS.red, icon: icons.warning }
  ];

  const getStatusCounts = () => {
    const counts = { all: breedingRecords.length, pregnant: 0, delivered: 0, failed: 0 };
    breedingRecords.forEach(record => {
      const status = getPregnancyStatus(record).status;
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();



  const renderFilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={filterModalVisible}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.filterModalOverlay}>
        <View style={styles.filterModalContainer}>
          <View style={styles.filterModalHeader}>
            <Text style={styles.filterModalTitle}>Filter & Sort</Text>
            <TouchableOpacity
              onPress={() => setFilterModalVisible(false)}
              style={styles.filterModalClose}
            >
              <FastImage source={icons.close} style={styles.closeIcon} tintColor={COLORS.gray} />
            </TouchableOpacity>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Filter by Status</Text>
            <View style={styles.filterOptionsGrid}>
              {filterOptions.map(option => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.filterModalButton,
                    filterStatus === option.key && [styles.activeFilterModalButton, { backgroundColor: option.color }],
                  ]}
                  onPress={() => setFilterStatus(option.key)}
                >
                  <FastImage
                    source={option.icon}
                    style={[
                      styles.filterModalIcon,
                      { tintColor: filterStatus === option.key ? COLORS.white : option.color }
                    ]}
                  />
                  <Text
                    style={[
                      styles.filterModalButtonText,
                      filterStatus === option.key && styles.activeFilterModalButtonText,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <View style={[
                    styles.filterCount,
                    filterStatus === option.key && styles.activeFilterCount
                  ]}>
                    <Text style={[
                      styles.filterCountText,
                      filterStatus === option.key && styles.activeFilterCountText
                    ]}>
                      {statusCounts[option.key] || 0}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Sort Options</Text>
            <View style={styles.sortOptionsContainer}>
              <TouchableOpacity
                style={[
                  styles.sortOptionButton,
                  sortBy === 'serviceDate' && styles.activeSortButton
                ]}
                onPress={() => setSortBy('serviceDate')}
              >
                <FastImage
                  source={icons.calendar}
                  style={[
                    styles.sortOptionIcon,
                    { tintColor: sortBy === 'serviceDate' ? COLORS.white : COLORS.green }
                  ]}
                />
                <Text style={[
                  styles.sortOptionText,
                  sortBy === 'serviceDate' && styles.activeSortText
                ]}>
                  Service Date
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sortOptionButton,
                  sortBy === 'expectedBirthDate' && styles.activeSortButton
                ]}
                onPress={() => setSortBy('expectedBirthDate')}
              >
                <FastImage
                  source={icons.clock}
                  style={[
                    styles.sortOptionIcon,
                    { tintColor: sortBy === 'expectedBirthDate' ? COLORS.white : COLORS.green }
                  ]}
                />
                <Text style={[
                  styles.sortOptionText,
                  sortBy === 'expectedBirthDate' && styles.activeSortText
                ]}>
                  Expected Birth
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.sortOrderButton}
              onPress={toggleSort}
            >
              <FastImage
                source={sortOrder === 'asc' ? icons.arrow_up : icons.arrow_down}
                style={styles.sortOrderIcon}
                tintColor={COLORS.green}
              />
              <Text style={styles.sortOrderText}>
                {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.applyFiltersButton}
            onPress={() => setFilterModalVisible(false)}
          >
            <Text style={styles.applyFiltersText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderSearchAndFilters = () => (
    <View style={styles.searchAndFiltersContainer}>
      <View style={styles.searchContainer}>
        <FastImage
          source={icons.search}
          style={styles.searchIcon}
          tintColor={COLORS.green}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by animal ID, type, purpose..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <FastImage source={icons.close} style={styles.clearSearchIcon} tintColor="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.quickFiltersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.quickFiltersRow}>
            {filterOptions.slice(0, 3).map(option => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.quickFilterChip,
                  filterStatus === option.key && [styles.activeQuickFilterChip, { backgroundColor: option.color }],
                ]}
                onPress={() => setFilterStatus(option.key)}
              >
                <FastImage
                  source={option.icon}
                  style={[
                    styles.quickFilterIcon,
                    { tintColor: filterStatus === option.key ? COLORS.white : option.color }
                  ]}
                />
                <Text
                  style={[
                    styles.quickFilterText,
                    filterStatus === option.key && styles.activeQuickFilterText,
                  ]}
                >
                  {option.label.replace(' Records', '')}
                </Text>
                <View style={[
                  styles.quickFilterBadge,
                  filterStatus === option.key && styles.activeQuickFilterBadge
                ]}>
                  <Text style={[
                    styles.quickFilterBadgeText,
                    filterStatus === option.key && styles.activeQuickFilterBadgeText
                  ]}>
                    {statusCounts[option.key] || 0}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.moreFiltersButton}
              onPress={() => setFilterModalVisible(true)}
            >
              <FastImage source={icons.filter} style={styles.moreFiltersIcon} tintColor={COLORS.green} />
              <Text style={styles.moreFiltersText}>More</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );

  const renderBreedingRecord = ({ item }) => {
    console.log(`Rendering record ${item.id}:`);
    console.log(`- damId: ${item.damId}`);
    console.log(`- sireId: ${item.sireId}`);
    console.log(`- Available livestock keys: ${Object.keys(livestockMap).slice(0, 5).join(', ')}...`);

    let damInfo = livestockMap[item.damId];
    let sireInfo = livestockMap[item.sireId];

    if (!damInfo && item.dam?.mammal) {
      damInfo = {
        name: item.dam.mammal.idNumber,
        breedType: item.dam.mammal.breedType,
        type: item.dam.type,
        damCode: item.dam.mammal.damCode,
      };
    }

    if (!sireInfo && item.sire?.mammal) {
      sireInfo = {
        name: item.sire.mammal.idNumber,
        breedType: item.sire.mammal.breedType,
        type: item.sire.type,
        sireCode: item.sire.mammal.sireCode,
      };
    }



    const pregnancyStatus = getPregnancyStatus(item);

    return (
      <TouchableOpacity
        style={styles.recordCard}
        onPress={() => handleViewDetails(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: pregnancyStatus.color + '15' }]}>
            <FastImage
              source={pregnancyStatus.icon}
              style={[styles.statusIcon, { tintColor: pregnancyStatus.color }]}
            />
            <Text style={[styles.statusText, { color: pregnancyStatus.color }]}>
              {pregnancyStatus.text}
            </Text>
          </View>
          <Text style={styles.recordId}>#{item.id.slice(-6)}</Text>
        </View>

        <View style={styles.animalsContainer}>
          <View style={styles.animalInfo}>
            <View style={styles.animalHeader}>
              <FastImage source={icons.female} style={styles.genderIcon} tintColor="#EC4899" />
              <Text style={styles.animalLabel}>Dam</Text>
            </View>
            <Text style={styles.animalName}>
              {damInfo ? (damInfo.name || damInfo.idNumber || 'Unnamed') : 'Unknown Animal'}
            </Text>
            <Text style={styles.animalCode}>
              Code: {damInfo?.damCode || item.damCode || 'N/A'}
            </Text>
            <Text style={styles.animalDetails}>
              {damInfo ? `${damInfo.type} • ${damInfo.breedType}` : 'N/A'}
            </Text>
          </View>

          <View style={styles.breedingIconContainer}>
            <View style={styles.breedingLine} />
            <FastImage source={icons.heart} style={styles.heartIcon} tintColor={COLORS.green} />
            <View style={styles.breedingLine} />
          </View>

          <View style={styles.animalInfo}>
            <View style={styles.animalHeader}>
              <FastImage source={icons.male} style={styles.genderIcon} tintColor="#3B82F6" />
              <Text style={styles.animalLabel}>Sire</Text>
            </View>
            <Text style={styles.animalName}>
              {item.serviceType === 'Artificial Insemination'
                ? 'AI Service'
                : sireInfo ? (sireInfo.name || sireInfo.idNumber || 'Unnamed') : 'Unknown Animal'
              }
            </Text>
            <Text style={styles.animalCode}>
              Code: {item.serviceType === 'Artificial Insemination'
                ? (item.sireCode || item.aiCode || 'N/A')
                : (sireInfo?.sireCode || item.sireCode || 'N/A')
              }
            </Text>
            <Text style={styles.animalDetails}>
              {item.serviceType === 'Artificial Insemination'
                ? `AI • ${item.aiType || 'Regular'}`
                : sireInfo ? `${sireInfo.type} • ${sireInfo.breedType}` : 'N/A'
              }
            </Text>
          </View>
        </View>

        {/* Rest of the component remains the same */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <FastImage source={icons.target} style={styles.detailIcon} tintColor={COLORS.green} />
              <View>
                <Text style={styles.detailLabel}>Purpose</Text>
                <Text style={styles.detailValue}>{item.purpose}</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <FastImage source={icons.strategy} style={styles.detailIcon} tintColor={COLORS.green} />
              <View>
                <Text style={styles.detailLabel}>Strategy</Text>
                <Text style={styles.detailValue}>{item.strategy}</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <FastImage source={icons.calendar} style={styles.detailIcon} tintColor={COLORS.green} />
              <View>
                <Text style={styles.detailLabel}>Service Date</Text>
                <Text style={styles.detailValue}>
                  {new Date(item.serviceDate).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <FastImage source={icons.clock} style={styles.detailIcon} tintColor={COLORS.green} />
              <View>
                <Text style={styles.detailLabel}>
                  {pregnancyStatus.actualDate ? 'Birth Date' : 'Expected Birth'}
                </Text>
                <Text style={styles.detailValue}>
                  {pregnancyStatus.actualDate
                    ? pregnancyStatus.actualDate.toLocaleDateString()
                    : new Date(item.expectedBirthDate).toLocaleDateString()
                  }
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actionContainer}>
          {pregnancyStatus.status === 'pregnant' ? (
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={(e) => {
                e.stopPropagation();
                navigation.navigate('RecordBirthScreen', { breedingRecord: item });
              }}
            >
              <FastImage source={icons.submited} style={styles.primaryActionIcon} tintColor={COLORS.white} />
              <Text style={styles.primaryActionText}>Record Birth</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.primaryActionButton, { backgroundColor: '#3B82F6' }]}
              onPress={(e) => {
                e.stopPropagation();
                navigation.navigate('ViewOffspringScreen', { breedingRecord: item });
              }}
            >
              <FastImage source={icons.eye} style={styles.primaryActionIcon} tintColor={COLORS.white} />
              <Text style={styles.primaryActionText}>View Offspring</Text>
            </TouchableOpacity>
          )}

          <View style={styles.secondaryActions}>
            <TouchableOpacity
              style={styles.secondaryActionButton}
              onPress={(e) => {
                e.stopPropagation();
                navigation.navigate('EditBreedingRecordScreen', { recordId: item.id });
              }}
            >
              <FastImage source={icons.edit} style={styles.secondaryActionIcon} tintColor={COLORS.green} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryActionButton,
                hasOffspring(item) && styles.disabledSecondaryButton
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
                style={styles.secondaryActionIcon}
                tintColor={hasOffspring(item) ? COLORS.gray : COLORS.red}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (!activeFarm?.id) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <FastImage source={icons.farm} style={styles.emptyIcon} tintColor={COLORS.green} />
          </View>
          <Text style={styles.emptyTitle}>No Active Farm Selected</Text>
          <Text style={styles.emptyText}>
            Please select an active farm to view and manage breeding records.
          </Text>
        </View>
      );
    }

    if (searchQuery && sortedAndFilteredRecords.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <FastImage source={icons.search} style={styles.emptyIcon} tintColor={COLORS.green} />
          </View>
          <Text style={styles.emptyTitle}>No Results Found</Text>
          <Text style={styles.emptyText}>
            No breeding records match "{searchQuery}". Try adjusting your search or filters.
          </Text>
          <TouchableOpacity
            style={styles.clearSearchButton}
            onPress={() => {
              setSearchQuery('');
              setFilterStatus('all');
            }}
          >
            <Text style={styles.clearSearchButtonText}>Clear Search & Filters</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (breedingRecords.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <FastImage source={icons.heart} style={styles.emptyIcon} tintColor={COLORS.green} />
          </View>
          <Text style={styles.emptyTitle}>No Breeding Records</Text>
          <Text style={styles.emptyText}>
            Start tracking your breeding program by creating your first breeding record.
          </Text>
          <TouchableOpacity
            style={styles.createFirstRecordButton}
            onPress={() => navigation.navigate('CreateBreedingRecordScreen')}
          >
            <FastImage source={icons.plus} style={styles.createFirstRecordIcon} tintColor={COLORS.white} />
            <Text style={styles.createFirstRecordText}>Create First Record</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  const renderDeleteModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={deleteModalVisible}
      onRequestClose={cancelDelete}
    >
      <View style={styles.deleteModalOverlay}>
        <View style={styles.deleteModalContainer}>
          <View style={styles.deleteModalIcon}>
            <FastImage source={icons.warning} style={styles.deleteWarningIcon} tintColor={COLORS.red} />
          </View>
          <Text style={styles.deleteModalTitle}>Delete Breeding Record</Text>
          <Text style={styles.deleteModalText}>
            Are you sure you want to delete this breeding record? This action cannot be undone.
          </Text>
          <View style={styles.deleteModalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={cancelDelete}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={confirmDelete}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (

      <SafeAreaView style={styles.container}>
        <SecondaryHeader title="Breeding Records" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.green} />
          <Text style={styles.loadingText}>Loading breed records..</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (

    <SafeAreaView style={styles.container}>
      <SecondaryHeader title="Breeding Records" />

      <StatusBar
        translucent
        backgroundColor={COLORS.green2}
        animated={true}
        barStyle={'light-content'}
      />
      <View style={styles.content}>
        {renderSearchAndFilters()}

        <FlatList
          data={sortedAndFilteredRecords}
          renderItem={renderBreedingRecord}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContainer,
            sortedAndFilteredRecords.length === 0 && styles.emptyListContainer
          ]}
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
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('BreedingRecordForm')}
        activeOpacity={0.8}
      >
        <FastImage source={icons.plus} style={styles.fabIcon} tintColor={COLORS.white} />
      </TouchableOpacity>

      {renderFilterModal()}
      {renderDeleteModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGreen,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray,
  },
  statisticsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statisticsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
  },
  statisticsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statisticsItem: {
    alignItems: 'center',
    flex: 1,
  },
  statisticsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    width: 20,
    height: 20,
  },
  statisticsNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  statisticsLabel: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
  },
  searchAndFiltersContainer: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 48,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
  },
  clearSearchIcon: {
    width: 20,
    height: 20,
  },
  quickFiltersContainer: {
    height: 40,
  },
  quickFiltersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
  },
  quickFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    minWidth: 80,
  },
  activeQuickFilterChip: {
    backgroundColor: COLORS.green,
  },
  quickFilterIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  quickFilterText: {
    fontSize: 12,
    color: COLORS.gray,
    marginRight: 4,
  },
  activeQuickFilterText: {
    color: COLORS.white,
  },
  quickFilterBadge: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
  },
  activeQuickFilterBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  quickFilterBadgeText: {
    fontSize: 10,
    color: COLORS.gray,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  activeQuickFilterBadgeText: {
    color: COLORS.white,
  },
  moreFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  moreFiltersIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  moreFiltersText: {
    fontSize: 12,
    color: COLORS.green,
  },
  listContainer: {
    paddingBottom: 80,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  recordCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    width: 14,
    height: 14,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  recordId: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
  },
  animalsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  animalInfo: {
    flex: 1,
  },
  animalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  genderIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  animalLabel: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
  },
  animalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 2,
  },
  animalDetails: {
    fontSize: 12,
    color: COLORS.gray,
  },
  breedingIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  breedingLine: {
    width: 20,
    height: 1,
    backgroundColor: COLORS.green,
  },
  heartIcon: {
    width: 20,
    height: 20,
    marginHorizontal: 8,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailIcon: {
    width: 14,
    height: 14,
    marginRight: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '500',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.green,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  primaryActionIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  primaryActionText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryActions: {
    flexDirection: 'row',
  },
  secondaryActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledSecondaryButton: {
    backgroundColor: '#F3F4F6',
  },
  secondaryActionIcon: {
    width: 16,
    height: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.green + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    width: 40,
    height: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  clearSearchButton: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearSearchButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  createFirstRecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.green,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstRecordIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  createFirstRecordText: {
    color: COLORS.white,
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
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabIcon: {
    width: 24,
    height: 24,
  },
  // Filter Modal Styles
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 34,
    maxHeight: '80%',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  filterModalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    width: 16,
    height: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 12,
  },
  filterOptionsGrid: {
    gap: 8,
  },
  filterModalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  activeFilterModalButton: {
    backgroundColor: COLORS.green,
  },
  filterModalIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  filterModalButtonText: {
    fontSize: 14,
    color: COLORS.black,
    flex: 1,
  },
  activeFilterModalButtonText: {
    color: COLORS.white,
  },
  filterCount: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
  },
  activeFilterCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterCountText: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  activeFilterCountText: {
    color: COLORS.white,
  },
  sortOptionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  sortOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    flex: 1,
  },
  activeSortButton: {
    backgroundColor: COLORS.green,
  },
  sortOptionIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  sortOptionText: {
    fontSize: 14,
    color: COLORS.black,
  },
  activeSortText: {
    color: COLORS.white,
  },
  animalCode: {
    fontSize: 12,
    color: COLORS.green,
    fontWeight: '600',
    marginBottom: 2,
  },
  sortOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  sortOrderIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  sortOrderText: {
    fontSize: 14,
    color: COLORS.black,
  },
  applyFiltersButton: {
    backgroundColor: COLORS.green,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyFiltersText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  // Delete Modal Styles
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 32,
    alignItems: 'center',
  },
  deleteModalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.red + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteWarningIcon: {
    width: 32,
    height: 32,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  deleteModalText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: COLORS.red,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BreedingModuleLandingScreen;