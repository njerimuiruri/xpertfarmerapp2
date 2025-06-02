import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  SafeAreaView,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { icons } from '../../constants';
import { COLORS } from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';
import {
  getLivestockForActiveFarm,
  deleteLivestock,
  getActiveFarmInfo,
  updateLivestockStatus,
  recordLivestockMortality,
  recordLivestockSale,
  transferLivestock,
} from '../../services/livestock';

const LivestockModuleScreen = ({ route, navigation }) => {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [livestockData, setLivestockData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFarm, setActiveFarm] = useState(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchLivestockData();
      loadActiveFarm();
    });

    return unsubscribe;
  }, [navigation]);

  const loadActiveFarm = async () => {
    try {
      const { data, error } = await getActiveFarmInfo();
      if (data) {
        setActiveFarm(data);
      }
    } catch (error) {
      console.error('Error loading active farm:', error);
    }
  };

  const fetchLivestockData = async () => {
    try {
      setLoading(true);
      const { data, error } = await getLivestockForActiveFarm();

      if (error) {
        console.error('Error fetching livestock:', error);
        Alert.alert('Error', error);
        setLivestockData([]);
        return;
      }

      const transformedData = data.map(item => {
        if (item.category === 'poultry' && item.poultry) {
          return {
            id: item.poultry.flockId || item._id,
            title: `${item.poultry.breedType} Flock`,
            farmId: item.farmId,
            breed: item.poultry.breedType,
            dob: new Date(item.poultry.dateOfStocking).toLocaleDateString(),
            sex: item.poultry.gender,
            type: item.type,
            health: item.status || 'Active',
            production: `Quantity: ${item.poultry.initialQuantity}`,
            category: item.category,
            status: item.status || 'active',
            rawData: item
          };
        } else if (item.category === 'mammal' && item.mammal) {
          return {
            id: item.mammal.idNumber || item._id,
            title: `${item.mammal.breedType}`,
            farmId: item.farmId,
            breed: item.mammal.breedType,
            dob: new Date(item.mammal.dateOfBirth).toLocaleDateString(),
            sex: item.mammal.gender,
            type: item.type,
            health: item.status || 'Active',
            production: item.mammal.birthWeight ? `Birth Weight: ${item.mammal.birthWeight}kg` : 'N/A',
            phenotype: item.mammal.phenotype,
            category: item.category,
            status: item.status || 'active',
            rawData: item
          };
        }

        return {
          id: item._id || item.id,
          title: item.type || 'Unknown',
          farmId: item.farmId,
          breed: 'Unknown',
          dob: 'N/A',
          sex: 'N/A',
          type: item.type,
          health: 'N/A',
          production: 'N/A',
          status: item.status || 'active',
          rawData: item
        };
      });

      setLivestockData(transformedData);
    } catch (error) {
      console.error('Error fetching livestock data:', error);
      Alert.alert('Error', 'Failed to fetch livestock data. Please try again.');
      setLivestockData([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLivestockData();
    setRefreshing(false);
  };

  useEffect(() => {
    let baseData = livestockData;

    if (selectedType !== 'all') {
      const typeMapping = {
        'dairy_cows': ['dairyCattle'],
        'beef_cattle': ['beefCattle'],
        'swine': ['swine'],
        'goats': ['dairyGoats', 'meatGoats'],
        'sheep': ['sheep'],
        'poultry': ['poultry']
      };

      baseData = baseData.filter(item =>
        typeMapping[selectedType]?.includes(item.type) || item.type === selectedType
      );
    }

    if (selectedStatus !== 'all') {
      baseData = baseData.filter(item =>
        item.status?.toLowerCase() === selectedStatus.toLowerCase()
      );
    }

    if (searchQuery.trim() !== '') {
      const lowercaseQuery = searchQuery.toLowerCase();
      baseData = baseData.filter(item => {
        return (
          item.id.toLowerCase().includes(lowercaseQuery) ||
          item.title.toLowerCase().includes(lowercaseQuery) ||
          (item.breed && item.breed.toLowerCase().includes(lowercaseQuery)) ||
          (item.farmId && item.farmId.toLowerCase().includes(lowercaseQuery)) ||
          (item.type && item.type.toLowerCase().includes(lowercaseQuery))
        );
      });
    }

    setFilteredData(baseData);
  }, [selectedType, selectedStatus, livestockData, searchQuery]);

  const handleAnimalAction = (animal, action) => {
    setSelectedAnimal(animal);
    setActionModalVisible(false);

    switch (action) {
      case 'status_sold':
        handleMarkAsSold(animal);
        break;
      case 'status_deceased':
        handleMarkAsDeceased(animal);
        break;
      case 'mortality':
        handleRecordMortality(animal);
        break;
      case 'sale':
        handleRecordSale(animal);
        break;
      case 'transfer':
        handleTransfer(animal);
        break;
      case 'health':
        navigation.navigate('HealthEventForm', { animalId: animal.id, animalData: animal });
        break;
      case 'edit':
        navigation.navigate('EditAnimalScreen', { animalId: animal.id, animalData: animal });
        break;
      case 'delete':
        handleDeleteLivestock(animal);
        break;
    }
  };

  const handleMarkAsSold = async (animal) => {
    Alert.prompt(
      'Mark as Sold',
      'Enter reason for sale:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark as Sold',
          onPress: async (reason) => {
            try {
              const { error } = await updateLivestockStatus(
                animal.rawData._id,
                'sold',
                reason || 'Sold to buyer'
              );

              if (error) {
                Alert.alert('Error', error);
              } else {
                Alert.alert('Success', 'Animal marked as sold successfully');
                fetchLivestockData();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to update status');
            }
          }
        }
      ],
      'plain-text',
      'Sold to local farmer'
    );
  };

  const handleMarkAsDeceased = async (animal) => {
    Alert.prompt(
      'Mark as Deceased',
      'Enter reason for death:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark as Deceased',
          onPress: async (reason) => {
            try {
              const { error } = await updateLivestockStatus(
                animal.rawData._id,
                'deceased',
                reason || 'Natural causes'
              );

              if (error) {
                Alert.alert('Error', error);
              } else {
                Alert.alert('Success', 'Animal marked as deceased successfully');
                fetchLivestockData();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to update status');
            }
          }
        }
      ],
      'plain-text',
      'Natural causes due to age'
    );
  };

  const handleRecordMortality = (animal) => {
    navigation.navigate('MortalityRecordForm', {
      animalId: animal.id,
      animalData: animal
    });
  };

  const handleRecordSale = (animal) => {
    navigation.navigate('SaleRecordForm', {
      animalId: animal.id,
      animalData: animal
    });
  };

  const handleTransfer = (animal) => {
    navigation.navigate('TransferForm', {
      animalId: animal.id,
      animalData: animal
    });
  };

  const handleDeleteLivestock = async (item) => {
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
              await deleteLivestock(item.rawData._id);
              Alert.alert('Success', 'Livestock deleted successfully');
              fetchLivestockData();
            } catch (error) {
              console.error('Error deleting livestock:', error);
              Alert.alert('Error', 'Failed to delete livestock. Please try again.');
            }
          },
        },
      ]
    );
  };

  const TypeSelector = () => {
    const types = [
      { id: 'all', label: 'All Livestock' },
      { id: 'dairy_cows', label: 'Dairy Cows' },
      { id: 'beef_cattle', label: 'Beef Cattle' },
      { id: 'swine', label: 'Swine' },
      { id: 'goats', label: 'Goats' },
      { id: 'sheep', label: 'Sheep' },
      { id: 'poultry', label: 'Poultry' },
    ];

    return (
      <View style={styles.typeSelectorContainer}>
        <FlatList
          data={types}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.typeButton,
                selectedType === item.id && styles.selectedTypeButton,
              ]}
              onPress={() => setSelectedType(item.id)}>
              <Text
                style={[
                  styles.typeButtonText,
                  selectedType === item.id && styles.selectedTypeButtonText,
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
    const statuses = [
      { id: 'all', label: 'All Status', color: COLORS.gray },
      { id: 'active', label: 'Active', color: COLORS.green },
      { id: 'sold', label: 'Sold', color: COLORS.orange },
      { id: 'transferred', label: 'Transferred', color: COLORS.purple },
      { id: 'deceased', label: 'Mortality', color: COLORS.red },
    ];

    return (
      <View style={styles.statusSelectorContainer}>
        <FlatList
          data={statuses}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.statusButton,
                selectedStatus === item.id && styles.selectedStatusButton,
                { borderColor: item.color }
              ]}
              onPress={() => setSelectedStatus(item.id)}>
              <View style={[styles.statusIndicator, { backgroundColor: item.color }]} />
              <Text
                style={[
                  styles.statusButtonText,
                  selectedStatus === item.id && styles.selectedStatusButtonText,
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
      { id: 'edit', label: 'Edit Details', icon: icons.edit, color: COLORS.blue },
      { id: 'health', label: 'Health Event', icon: icons.health, color: COLORS.green },
      { id: 'status_sold', label: 'Mark as Sold', icon: icons.money, color: COLORS.orange },
      { id: 'status_deceased', label: 'Mark as Deceased', icon: icons.remove, color: COLORS.red },
      { id: 'mortality', label: 'Record Mortality', icon: icons.document, color: COLORS.darkRed },
      { id: 'sale', label: 'Record Sale', icon: icons.money, color: COLORS.green2 },
      { id: 'transfer', label: 'Transfer Animal', icon: icons.transfer, color: COLORS.purple },
      { id: 'delete', label: 'Delete', icon: icons.remove, color: COLORS.red },
    ];

    return (
      <Modal
        visible={actionModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActionModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Actions for {selectedAnimal?.title}
              </Text>
              <TouchableOpacity
                onPress={() => setActionModalVisible(false)}
                style={styles.closeButton}>
                <FastImage source={icons.close} style={styles.closeIcon} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={actions}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.actionItem}
                  onPress={() => handleAnimalAction(selectedAnimal, item.id)}>
                  <FastImage
                    source={item.icon}
                    style={[styles.actionItemIcon, { tintColor: item.color }]}
                  />
                  <Text style={styles.actionItemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    );
  };

  const renderHeader = () => {
    return (
      <View style={styles.header}>

        <View style={styles.searchContainer}>
          <FastImage
            source={icons.search}
            style={styles.searchIcon}
            tintColor="#666"
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search livestock by ID, breed, type..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TypeSelector />
        <StatusSelector />
      </View>
    );
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'sold': return COLORS.orange;
      case 'deceased': return COLORS.red;
      case 'transferred': return COLORS.purple;
      default: return COLORS.green;
    }
  };

  const renderAnimalCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('AnimalDetailScreen', {
        id: item.id,
        type: item.type,
        animalData: item,
      })}>
      <View style={styles.cardHeader}>
        <View style={styles.animalInfo}>
          <Text style={styles.name}>{item.title}</Text>
          <Text style={styles.breed}>{item.breed}</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{item.status?.toUpperCase() || 'ACTIVE'}</Text>
            </View>
          </View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              setSelectedAnimal(item);
              setActionModalVisible(true);
            }}
            style={styles.cardActionButton}>
            <FastImage
              source={icons.menu}
              style={styles.cardActionIcon}
              tintColor="#333"
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
          <Text style={styles.detailText}>ID: {item.id}</Text>
        </View>
        <View style={styles.detailRow}>
          <FastImage
            source={icons.document}
            style={styles.detailIcon}
            tintColor="#666"
          />
          {/* <Text style={styles.detailText}>Farm: {item.farmId}</Text> */}
        </View>
        <View style={styles.detailRow}>
          <FastImage
            source={icons.calendar}
            style={styles.detailIcon}
            tintColor="#666"
          />
          <Text style={styles.detailText}>Born: {item.dob}</Text>
        </View>
        <View style={styles.detailRow}>
          <FastImage
            source={icons.health}
            style={styles.detailIcon}
            tintColor="#666"
          />
          <Text style={styles.detailText}>Sex: {item.sex}</Text>
        </View>
        <View style={styles.detailRow}>
          <FastImage
            source={icons.document}
            style={styles.detailIcon}
            tintColor="#666"
          />
          <Text style={styles.detailText}>Type: {item.type}</Text>
        </View>
        {item.production && (
          <View style={styles.detailRow}>
            <FastImage
              source={icons.breeding}
              style={styles.detailIcon}
              tintColor="#666"
            />
            <Text style={styles.detailText}>Production: {item.production}</Text>
          </View>
        )}
        {item.phenotype && (
          <View style={styles.detailRow}>
            <FastImage
              source={icons.breeding}
              style={styles.detailIcon}
              tintColor="#666"
            />
            <Text style={styles.detailText}>Phenotype: {item.phenotype}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <SecondaryHeader title="Livestock Management" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading livestock data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Livestock Found</Text>
      <Text style={styles.emptyMessage}>
        {selectedType === 'all' && selectedStatus === 'all'
          ? "You haven't added any livestock yet. Tap the + button to add your first animal."
          : `No ${selectedType !== 'all' ? selectedType.replace('_', ' ') : 'livestock'} ${selectedStatus !== 'all' ? `with ${selectedStatus} status` : ''} found. Try adjusting your filters or add new livestock.`
        }
      </Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddLivestockScreen')}>
        <Text style={styles.addButtonText}>Add Livestock</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader title="Livestock Management" />
      {renderHeader()}

      {filteredData.length === 0 && !loading ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredData}
          renderItem={renderAnimalCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.green]}
            />
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddLivestockScreen')}>
        <FastImage
          source={icons.plus}
          style={styles.fabIcon}
          tintColor="#fff"
        />
      </TouchableOpacity>

      <ActionModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: COLORS.white,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.green3,
  },
  farmInfoContainer: {
    backgroundColor: COLORS.lightGreen,
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  farmInfoText: {
    fontSize: 12,
    color: COLORS.darkGray3,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray2,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: { width: 20, height: 20, marginRight: 8 },
  searchInput: { flex: 1, height: 40, fontSize: 16, color: '#333' },
  typeSelectorContainer: {
    marginBottom: 16,
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray2,
    marginRight: 10,
  },
  selectedTypeButton: {
    backgroundColor: COLORS.green2,
  },
  typeButtonText: {
    fontSize: 14,
    color: '#333',
  },
  selectedTypeButtonText: {
    color: COLORS.white,
  },
  statusSelectorContainer: {
    marginBottom: 10,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    marginRight: 10,
  },
  selectedStatusButton: {
    backgroundColor: COLORS.lightGray,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusButtonText: {
    fontSize: 12,
    color: '#333',
  },
  selectedStatusButtonText: {
    fontWeight: '600',
  },
  listContent: { padding: 16 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.darkGray3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.darkGray3,
    marginBottom: 10,
  },
  emptyMessage: {
    fontSize: 16,
    color: COLORS.darkGray3,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  addButton: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 16,
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
  animalInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  breed: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statusContainer: {
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    color: COLORS.white,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 34,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray2,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  closeButton: {
    padding: 8,
  },
  closeIcon: {
    width: 20,
    height: 20,
    tintColor: COLORS.darkGray3,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray2,
  },
  actionItemIcon: {
    width: 24,
    height: 24,
    marginRight: 16,
  },
  actionItemText: {
    fontSize: 16,
    color: COLORS.black,
  },
});

export default LivestockModuleScreen;