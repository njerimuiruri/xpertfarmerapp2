import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { icons } from '../../constants';
import { COLORS } from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';
import { getActiveFarm } from '../../services/farm';
import { getLivestockForActiveFarm, deleteLivestock } from '../../services/livestock';

const LivestockModuleScreen = ({ navigation }) => {
  const [activeFarm, setActiveFarm] = useState(null);
  const [availableTypes, setAvailableTypes] = useState([]);
  const [availableStatuses, setAvailableStatuses] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [livestock, setLivestock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  const typesCatalogue = {
    'dairy_cows': { label: 'Dairy Cows', icon: icons.livestock || icons.account },
    'dairycattle': { label: 'Dairy Cows', icon: icons.livestock || icons.account },
    'beef_cattle': { label: 'Beef Cattle', icon: icons.livestock || icons.account },
    'beefcattle': { label: 'Beef Cattle', icon: icons.livestock || icons.account },
    'poultry': { label: 'Poultry', icon: icons.livestock || icons.account },
    'swine': { label: 'Swine', icon: icons.livestock || icons.account },
    'goats': { label: 'Goats', icon: icons.livestock || icons.account },
    'sheep': { label: 'Sheep', icon: icons.livestock || icons.account },
    'rabbit': { label: 'Rabbits', icon: icons.livestock || icons.account },
  };

  const statusCatalogue = {
    'active': { label: 'Active', color: COLORS.success || '#10B981', icon: icons.check || icons.account },
    'sold': { label: 'Sold', color: COLORS.warning || '#F59E0B', icon: icons.money || icons.document },
    'transferred': { label: 'Transferred', color: COLORS.info || '#3B82F6', icon: icons.transfer || icons.document },
    'transfer': { label: 'Transferred', color: COLORS.info || '#3B82F6', icon: icons.transfer || icons.document },
    'deceased': { label: 'Deceased', color: COLORS.danger || '#EF4444', icon: icons.remove || icons.close },
  };

  const normalizeType = useCallback((type) => {
    const normalized = type?.toLowerCase().replace(/[_\s]/g, '');
    switch (normalized) {
      case 'dairycattle':
      case 'dairycows':
        return 'dairy_cows';
      case 'beefcattle':
        return 'beef_cattle';
      case 'poultry':
        return 'poultry';
      case 'swine':
        return 'swine';
      case 'goats':
        return 'goats';
      case 'sheep':
        return 'sheep';
      case 'rabbit':
        return 'rabbit';
      default:
        return type?.toLowerCase() || 'unknown';
    }
  }, []);

  useEffect(() => {
    loadActiveFarm();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchLivestock();
    });

    return unsubscribe;
  }, [navigation]);

  const loadActiveFarm = async () => {
    try {
      const data = await getActiveFarm();
      setActiveFarm(data);
    } catch (error) {
      console.error('Error loading farm:', error);
    }
  };

  const fetchLivestock = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }

      const data = await getLivestockForActiveFarm();

      if (!Array.isArray(data)) {
        console.error('[fetchLivestock] Expected array but got:', typeof data, data);
        setLivestock([]);
        return;
      }

      const transformedData = data.map(item => {
        const categoryData = item[item.category] || {};
        const normalizedType = normalizeType(item.type);

        return {
          id: item.id || item._id,
          title: categoryData.idNumber || item.name || 'Unknown',
          farmId: item.farmId || activeFarm?.id,
          breed: categoryData.breedType || categoryData.breed || 'Unknown',
          dob: categoryData.dateOfBirth ? new Date(categoryData.dateOfBirth).toLocaleDateString() : 'N/A',
          sex: categoryData.gender || categoryData.sex || 'N/A',
          type: normalizedType,
          originalType: item.type,
          health: item.health || 'Active',
          production: item.production || 'N/A',
          phenotype: categoryData.phenotype || null,
          category: item.category || 'mammal',
          status: (item.status || 'active').toLowerCase(),
          birthWeight: categoryData.birthWeight || null,
          sireId: categoryData.sireId || null,
          sireCode: categoryData.sireCode || null,
          damId: categoryData.damId || null,
          damCode: categoryData.damCode || null,
          idNumber: categoryData.idNumber || null,
          breedType: categoryData.breedType || null,
          rawData: item
        };
      });

      console.log(`[fetchLivestock] Transformed ${transformedData.length} livestock records`);
      setLivestock(transformedData);
      extractTypesAndStatuses(transformedData);

    } catch (error) {
      console.error('Error fetching livestock:', error);
      Alert.alert('Error', 'Failed to fetch livestock data. Please try again.');
      setLivestock([]);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const extractTypesAndStatuses = useCallback((livestockData) => {
    const typeSet = new Set();
    const statusSet = new Set();

    livestockData.forEach(item => {
      if (item.type) {
        typeSet.add(item.type);
      }
      if (item.status) {
        statusSet.add(item.status.toLowerCase());
      }
    });

    const uniqueTypes = Array.from(typeSet).filter(Boolean);
    const uniqueStatuses = Array.from(statusSet).filter(Boolean);

    console.log('[extractTypesAndStatuses] Found types:', uniqueTypes);
    console.log('[extractTypesAndStatuses] Found statuses:', uniqueStatuses);

    setAvailableTypes(uniqueTypes);
    setAvailableStatuses(uniqueStatuses);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLivestock(true);
    setRefreshing(false);
  };

  const filteredData = useMemo(() => {
    let baseData = livestock;

    if (selectedType !== 'all') {
      baseData = baseData.filter(item => item.type === selectedType);
    }

    if (selectedStatus !== 'all') {
      baseData = baseData.filter(item => item.status === selectedStatus);
    }

    if (searchQuery.trim() !== '') {
      const lowercaseQuery = searchQuery.toLowerCase();
      baseData = baseData.filter(item => {
        return (
          item.id.toString().toLowerCase().includes(lowercaseQuery) ||
          item.title.toLowerCase().includes(lowercaseQuery) ||
          (item.breed && item.breed.toLowerCase().includes(lowercaseQuery)) ||
          (item.type && item.type.toLowerCase().includes(lowercaseQuery)) ||
          (item.idNumber && item.idNumber.toString().toLowerCase().includes(lowercaseQuery))
        );
      });
    }

    return baseData;
  }, [selectedType, selectedStatus, livestock, searchQuery]);

  const handleAnimalAction = useCallback((animal, action) => {
    setActionModalVisible(false);

    switch (action) {
      case 'edit':
        navigation.navigate('EditAnimalScreen', { animalId: animal.id, animalData: animal });
        break;
      case 'update_status':
        navigation.navigate('StatusUpdateForm', {
          animalId: animal.id,
          animalData: animal
        });
        break;
      case 'health':
        navigation.navigate('HealthRecordsScreen');
        break;
      case 'delete':
        handleDeleteLivestock(animal);
        break;
    }
  }, [navigation]);

  const handleDeleteLivestock = useCallback(async (item) => {
    Alert.alert(
      'Delete Livestock',
      `Are you sure you want to delete ${item.title} (ID: ${item.id})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLivestock(item.rawData._id || item.id);
              Alert.alert('Success', 'Livestock deleted successfully');
              fetchLivestock();
            } catch (error) {
              console.error('Error deleting livestock:', error);
              Alert.alert('Error', 'Failed to delete livestock. Please try again.');
            }
          },
        },
      ]
    );
  }, [fetchLivestock]);

  const TypeSelector = () => {
    const typeOptions = [
      {
        id: 'all',
        label: 'All Types',
        icon: icons.livestock || icons.account
      },
      ...availableTypes.map(type => ({
        id: type,
        label: typesCatalogue[type]?.label || type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
        icon: typesCatalogue[type]?.icon || icons.livestock || icons.account
      }))
    ];

    return (
      <View style={styles.selectorContainer}>
        <Text style={styles.selectorTitle}>Livestock Type</Text>
        <FlatList
          data={typeOptions}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedType === item.id && styles.selectedFilterChip,
              ]}
              onPress={() => setSelectedType(item.id)}>
              <FastImage
                source={item.icon}
                style={[
                  styles.chipIcon,
                  { tintColor: selectedType === item.id ? COLORS.white : COLORS.gray }
                ]}
              />
              <Text
                style={[
                  styles.filterChipText,
                  selectedType === item.id && styles.selectedFilterChipText,
                ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
        />
      </View>
    );
  };

  const StatusSelector = () => {
    const allStatusOptions = ['active', 'sold', 'transferred', 'deceased'];

    const statusOptions = [
      {
        id: 'all',
        label: 'All Status',
        color: COLORS.success || '#10B981',
        icon: icons.list || icons.document
      },
      ...allStatusOptions.map(status => ({
        id: status,
        label: statusCatalogue[status]?.label || status.charAt(0).toUpperCase() + status.slice(1),
        color: statusCatalogue[status]?.color || COLORS.gray,
        icon: statusCatalogue[status]?.icon || icons.document
      }))
    ];

    return (
      <View style={styles.selectorContainer}>
        <Text style={styles.selectorTitle}>Status Filter</Text>
        <FlatList
          data={statusOptions}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.statusChip,
                selectedStatus === item.id && styles.selectedStatusChip,
                { borderColor: item.color }
              ]}
              onPress={() => setSelectedStatus(item.id)}>
              <View style={[styles.statusDot, { backgroundColor: item.color }]} />
              <FastImage
                source={item.icon}
                style={[
                  styles.statusIcon,
                  { tintColor: selectedStatus === item.id ? item.color : COLORS.gray }
                ]}
              />
              <Text
                style={[
                  styles.statusChipText,
                  selectedStatus === item.id && { color: item.color, fontWeight: '600' },
                ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
        />
      </View>
    );
  };

  const ActionModal = () => {
    const actions = [
      {
        id: 'edit',
        label: 'Edit Details',
        icon: icons.edit || icons.account,
        color: COLORS.success || '#10B981',
        description: 'Update animal information'
      },
      {
        id: 'update_status',
        label: 'Update Status',
        icon: icons.edit || icons.document,
        color: COLORS.success || '#10B981',
        description: 'Change animal status, record sales, transfers, etc.'
      },
      {
        id: 'health',
        label: 'Health Record',
        icon: icons.health || icons.document,
        color: COLORS.success || '#10B981',
        description: 'Add health events and medical records'
      },
      {
        id: 'delete',
        label: 'Delete Animal',
        icon: icons.remove || icons.close,
        color: COLORS.danger || '#EF4444',
        description: 'Permanently remove from system'
      },
    ];

    return (
      <Modal
        visible={actionModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActionModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setActionModalVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>Animal Actions</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedAnimal?.title} • ID: {selectedAnimal?.idNumber || selectedAnimal?.id}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setActionModalVisible(false)}
                style={styles.closeButton}>
                <FastImage source={icons.close || icons.remove} style={styles.closeIcon} />
              </TouchableOpacity>
            </View>

            <View style={styles.actionsList}>
              {actions.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.actionItem,
                    index === actions.length - 1 && styles.lastActionItem
                  ]}
                  onPress={() => handleAnimalAction(selectedAnimal, item.id)}>
                  <View style={[styles.actionIconContainer, { backgroundColor: `${item.color}15` }]}>
                    <FastImage
                      source={item.icon}
                      style={[styles.actionItemIcon, { tintColor: item.color }]}
                    />
                  </View>
                  <View style={styles.actionContent}>
                    <Text style={styles.actionItemText}>{item.label}</Text>
                    <Text style={styles.actionItemDescription}>{item.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <FastImage
            source={icons.search || icons.account}
            style={styles.searchIcon}
            tintColor={COLORS.gray}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by ID, name, breed, or type..."
            placeholderTextColor={COLORS.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearSearchButton}>
              <FastImage
                source={icons.close || icons.remove}
                style={styles.clearSearchIcon}
                tintColor={COLORS.gray}
              />
            </TouchableOpacity>
          )}
        </View>

        <TypeSelector />
        <StatusSelector />

        {filteredData.length > 0 && (
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {filteredData.length} animal{filteredData.length !== 1 ? 's' : ''} found
            </Text>
          </View>
        )}
      </View>
    );
  };

  const getStatusColor = useCallback((status) => {
    return statusCatalogue[status?.toLowerCase()]?.color || COLORS.success || '#10B981';
  }, []);

  const renderAnimalCard = useCallback(({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardTouchable}
        onPress={() => navigation.navigate('AnimalDetailScreen', {
          id: item.id,
          type: item.type,
          animalData: item,
        })}>

        <View style={styles.cardHeader}>
          <View style={styles.animalInfo}>
            <Text style={styles.animalName}>{item.title}</Text>
            <Text style={styles.animalBreed}>{item.breed}</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>
                  {statusCatalogue[item.status]?.label.toUpperCase() || item.status?.toUpperCase() || 'ACTIVE'}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              setSelectedAnimal(item);
              setActionModalVisible(true);
            }}
            style={styles.menuButton}>
            <FastImage
              source={icons.dots3 || icons.document}
              style={styles.menuIcon}
              tintColor={COLORS.gray}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <FastImage
                source={icons.account || icons.livestock}
                style={styles.detailIcon}
                tintColor={COLORS.gray}
              />
              <Text style={styles.detailLabel}>ID Number</Text>
              <Text style={styles.detailValue}>{item.idNumber || item.id}</Text>
            </View>

            <View style={styles.detailItem}>
              <FastImage
                source={icons.calendar || icons.document}
                style={styles.detailIcon}
                tintColor={COLORS.gray}
              />
              <Text style={styles.detailLabel}>Birth Date</Text>
              <Text style={styles.detailValue}>{item.dob}</Text>
            </View>

            <View style={styles.detailItem}>
              <FastImage
                source={icons.health || icons.account}
                style={styles.detailIcon}
                tintColor={COLORS.gray}
              />
              <Text style={styles.detailLabel}>Gender</Text>
              <Text style={styles.detailValue}>{item.sex}</Text>
            </View>

            <View style={styles.detailItem}>
              <FastImage
                source={icons.document || icons.livestock}
                style={styles.detailIcon}
                tintColor={COLORS.gray}
              />
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.detailValue}>
                {typesCatalogue[item.type]?.label || item.type}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <FastImage
                source={icons.breeding || icons.document}
                style={styles.detailIcon}
                tintColor={COLORS.gray}
              />
              <Text style={styles.detailLabel}>Breed</Text>
              <Text style={styles.detailValue}>{item.breedType || item.breed}</Text>
            </View>

            {item.birthWeight && (
              <View style={styles.detailItem}>
                <FastImage
                  source={icons.weight || icons.document}
                  style={styles.detailIcon}
                  tintColor={COLORS.gray}
                />
                <Text style={styles.detailLabel}>Birth Weight</Text>
                <Text style={styles.detailValue}>{item.birthWeight} kg</Text>
              </View>
            )}
          </View>

          {(item.production || item.phenotype || item.sireCode || item.damCode) && (
            <View style={styles.additionalInfo}>
              {item.phenotype && (
                <View style={styles.infoRow}>
                  <FastImage
                    source={icons.breeding || icons.document}
                    style={styles.infoIcon}
                    tintColor={COLORS.gray}
                  />
                  <Text style={styles.infoText}>Phenotype: {item.phenotype}</Text>
                </View>
              )}
              {item.sireCode && (
                <View style={styles.infoRow}>
                  <FastImage
                    source={icons.breeding || icons.document}
                    style={styles.infoIcon}
                    tintColor={COLORS.gray}
                  />
                  <Text style={styles.infoText}>Sire Code: {item.sireCode}</Text>
                </View>
              )}
              {item.damCode && (
                <View style={styles.infoRow}>
                  <FastImage
                    source={icons.breeding || icons.document}
                    style={styles.infoIcon}
                    tintColor={COLORS.gray}
                  />
                  <Text style={styles.infoText}>Dam Code: {item.damCode}</Text>
                </View>
              )}
              {item.production && (
                <View style={styles.infoRow}>
                  <FastImage
                    source={icons.breeding || icons.document}
                    style={styles.infoIcon}
                    tintColor={COLORS.gray}
                  />
                  <Text style={styles.infoText}>{item.production}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  ), [navigation, getStatusColor]);

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.success || '#10B981'} />
      <Text style={styles.loadingText}>Loading livestock data...</Text>
      <Text style={styles.loadingSubText}>Please wait while we fetch your animals</Text>
    </View>
  );

  if (loading && initialLoad) {
    return (
      <SafeAreaView style={styles.container}>
        <SecondaryHeader title="Livestock Module" />
        {renderLoadingState()}
      </SafeAreaView>
    );
  }

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <FastImage
        source={icons.livestock || icons.account}
        style={styles.emptyIcon}
        tintColor={COLORS.gray}
      />
      <Text style={styles.emptyTitle}>No Livestock Found</Text>
      <Text style={styles.emptyMessage}>
        {selectedType === 'all' && selectedStatus === 'all' && searchQuery === ''
          ? "You haven't added any livestock yet. Get started by adding your first animal."
          : `No ${selectedType !== 'all' ? (typesCatalogue[selectedType]?.label || selectedType).toLowerCase() : 'livestock'} ${selectedStatus !== 'all' ? `with ${selectedStatus} status` : ''} ${searchQuery ? `matching "${searchQuery}"` : ''} found.`
        }
      </Text>
      <TouchableOpacity
        style={styles.emptyActionButton}
        onPress={() => navigation.navigate('AddLivestockScreen')}>
        <FastImage
          source={icons.plus || icons.add}
          style={styles.emptyActionIcon}
          tintColor={COLORS.white}
        />
        <Text style={styles.emptyActionText}>Add Livestock</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader title="Livestock Module" />
      {renderHeader()}

      {loading && !initialLoad ? (
        <View style={styles.refreshLoadingContainer}>
          <ActivityIndicator size="small" color={COLORS.success || '#10B981'} />
          <Text style={styles.refreshLoadingText}>Updating livestock data...</Text>
        </View>
      ) : null}

      {filteredData.length === 0 && !loading ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredData}
          renderItem={renderAnimalCard}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.success || '#10B981']}
              tintColor={COLORS.success || '#10B981'}
              title="Pull to refresh livestock data"
              titleColor={COLORS.darkGray3}
            />
          }
          showsVerticalScrollIndicator={false}
          // Performance optimizations for large datasets
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10}
          getItemLayout={(data, index) => (
            { length: 280, offset: 280 * index, index }
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddLivestockScreen')}>
        <FastImage
          source={icons.plus || icons.add}
          style={styles.fabIcon}
          tintColor={COLORS.white}
        />
      </TouchableOpacity>

      <ActionModal />
    </SafeAreaView>
  );
};

// Enhanced styles with better modal visibility
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || COLORS.lightGray,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border || COLORS.lightGray2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background || COLORS.lightGray2,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border || COLORS.lightGray2,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: COLORS.text || COLORS.black,
  },
  clearSearchButton: {
    padding: 4,
  },
  clearSearchIcon: {
    width: 16,
    height: 16,
  },
  selectorContainer: {
    marginBottom: 20,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text || COLORS.black,
    marginBottom: 12,
  },
  horizontalList: {
    paddingRight: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    backgroundColor: COLORS.green3 || COLORS.white,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border || COLORS.lightGray2,
  },
  selectedFilterChip: {
    backgroundColor: COLORS.success || '#10B981',
    borderColor: COLORS.success || '#10B981',
  },
  chipIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.white || COLORS.black,
  },
  selectedFilterChipText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    backgroundColor: COLORS.white,
    marginRight: 12,
    borderWidth: 2,
    borderColor: COLORS.lightGreen || COLORS.lightGray2,
  },
  selectedStatusChip: {
    backgroundColor: COLORS.lightGreen || COLORS.lightGray2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  statusChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text || COLORS.black,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  resultsCount: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text || COLORS.black,
    marginTop: 16,
  },
  loadingSubText: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 8,
    textAlign: 'center',
  },
  refreshLoadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: COLORS.background || COLORS.lightGray,
  },
  refreshLoadingText: {
    fontSize: 14,
    color: COLORS.gray,
    marginLeft: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTouchable: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  animalInfo: {
    flex: 1,
  },
  animalName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text || COLORS.black,
    marginBottom: 4,
  },
  animalBreed: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.background || COLORS.lightGray2,
  },
  menuIcon: {
    width: 20,
    height: 20,
  },
  cardDetails: {
    marginTop: 8,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    marginBottom: 16,
  },
  detailIcon: {
    width: 16,
    height: 16,
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.text || COLORS.black,
    fontWeight: '600',
  },
  additionalInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border || COLORS.lightGray2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    width: 14,
    height: 14,
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text || COLORS.black,
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text || COLORS.black,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success || '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyActionIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  emptyActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.green3 || '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    width: 24,
    height: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border || COLORS.lightGray2,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text || COLORS.black,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.background || COLORS.lightGray2,
  },
  closeIcon: {
    width: 20,
    height: 20,
    tintColor: COLORS.gray,
  },
  actionsList: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border || COLORS.lightGray2,
  },
  lastActionItem: {
    borderBottomWidth: 0,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionItemIcon: {
    width: 24,
    height: 24,
  },
  actionContent: {
    flex: 1,
  },
  actionItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text || COLORS.black,
    marginBottom: 2,
  },
  actionItemDescription: {
    fontSize: 14,
    color: COLORS.gray,
  },
});

export default LivestockModuleScreen;