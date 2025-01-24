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

// Sample data for sheep and goats
const initialSheepAndGoatData = [
  {
    id: '1',
    weightGain: 50, // in lbs
    saleWeight: 120, // in lbs
    saleDate: '2023-05-15',
    marketPrice: 3.0, // price per lb
    salePrice: 360, // total sale price
    buyer: 'Sheep Co.',
    company: 'Sheep Masters',
    icon: icons.sheep,
  },
  {
    id: '2',
    weightGain: 45,
    saleWeight: 110,
    saleDate: '2023-06-10',
    marketPrice: 3.2,
    salePrice: 352,
    buyer: 'Local Market',
    company: 'Goat Co.',
    icon: icons.goat,
  },
  {
    id: '3',
    weightGain: 60,
    saleWeight: 130,
    saleDate: '2023-07-05',
    marketPrice: 3.1,
    salePrice: 403,
    buyer: 'Farm Fresh',
    company: 'Quality Sheep',
    icon: icons.sheep,
  },
  {
    id: '4',
    weightGain: 55,
    saleWeight: 125,
    saleDate: '2023-08-01',
    marketPrice: 3.15,
    salePrice: 393.75,
    buyer: 'City Butcher',
    company: 'Premium Goat Suppliers',
    icon: icons.goat,
  },
  {
    id: '5',
    weightGain: 48, // in lbs
    saleWeight: 118, // in lbs
    saleDate: '2023-09-10',
    marketPrice: 3.25, // price per lb
    salePrice: 383.50, // total sale price
    buyer: 'Urban Grocers',
    company: 'Prime Sheep Co.',
    icon: icons.sheep,
  },
  {
    id: '6',
    weightGain: 52,
    saleWeight: 122,
    saleDate: '2023-10-15',
    marketPrice: 3.3,
    salePrice: 402.60,
    buyer: 'Fresh Farm Market',
    company: 'Elite Goat Corp.',
    icon: icons.goat,
  },
  {
    id: '7',
    weightGain: 58,
    saleWeight: 128,
    saleDate: '2023-11-20',
    marketPrice: 3.4,
    salePrice: 435.20,
    buyer: 'Village Market',
    company: 'Grassland Sheep Co.',
    icon: icons.sheep,
  },
  {
    id: '8',
    weightGain: 62,
    saleWeight: 132,
    saleDate: '2023-12-05',
    marketPrice: 3.35,
    salePrice: 442.20,
    buyer: 'Township Meat Co.',
    company: 'Excellence Goat Ltd.',
    icon: icons.goat,
  },
  {
    id: '9',
    weightGain: 57,
    saleWeight: 127,
    saleDate: '2024-01-10',
    marketPrice: 3.5,
    salePrice: 444.50,
    buyer: 'Regional Farms',
    company: 'Heritage Sheep and Goat Producers',
    icon: icons.sheep,
  },
];

const SheepAndGoatProductionListScreen = ({navigation}) => {
  const [sheepAndGoats, setSheepAndGoats] = useState(initialSheepAndGoatData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const filteredAnimals = useMemo(() => {
    return sheepAndGoats.filter(item =>
      item.id.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, sheepAndGoats]);

  const handleDelete = useCallback(id => {
    Alert.alert(
      'Delete Animal Record',
      'Are you sure you want to delete this animal record?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setSheepAndGoats(prev => prev.filter(item => item.id !== id));
          },
        },
      ],
    );
  }, []);

  const handleEdit = useCallback(
    animal => {
      // Navigate to edit screen with animal data
      navigation.navigate('EditSheepAndGoatScreen', {animal});
    },
    [navigation],
  );

  const handleAddAnimal = () => {
    // Navigate to add animal screen
    navigation.navigate('AddSheepAndGoatScreen');
  };

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
          placeholder="Search by Animal ID..."
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
      </View>
    </View>
  );

  const renderAnimalCard = ({item}) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        setSelectedAnimal(item);
      }}>
      <View style={styles.cardHeader}>
        <FastImage source={item.icon} style={styles.cardIcon} />
        <View style={styles.animalInfo}>
          <Text style={styles.animalId}>Animal ID: {item.id}</Text>
          <Text style={styles.animalPrice}>Sale Price: ${item.salePrice}</Text>
          <Text style={styles.animalDate}>Sale Date: {item.saleDate}</Text>
        </View>
        <View style={styles.cardActions}>
          
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
          <Text style={styles.modalTitle}>Filter Animal Records</Text>
          {/* Add filter options here if needed */}
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setIsFilterModalVisible(false)}>
            <Text style={styles.closeModalButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderAnimalDetailModal = () => {
    if (!selectedAnimal) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!selectedAnimal}
        onRequestClose={() => setSelectedAnimal(null)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedAnimal.company} Details
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Animal ID:</Text>{' '}
              {selectedAnimal.id}
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Weight Gain:</Text>{' '}
              {selectedAnimal.weightGain} lbs
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Sale Weight:</Text>{' '}
              {selectedAnimal.saleWeight} lbs
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Sale Date:</Text>{' '}
              {selectedAnimal.saleDate}
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Market Price:</Text> $
              {selectedAnimal.marketPrice}/lb
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Sale Price:</Text> $
              {selectedAnimal.salePrice}
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Buyer:</Text> {selectedAnimal.buyer}
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Company:</Text>{' '}
              {selectedAnimal.company}
            </Text>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setSelectedAnimal(null)}>
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader title="Sheep and Goat Production Records" />
      <StatusBar
        translucent
        backgroundColor={COLORS.green2}
        animated={true}
        barStyle={'light-content'}
      />
      {renderHeader()}
      <FlatList
        data={filteredAnimals}
        renderItem={renderAnimalCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
      {renderFilterModal()}
      {renderAnimalDetailModal()}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('PoultryFlockDetailsScreen')}>
        <FastImage
          source={icons.plus}
          style={styles.fabIcon}
          tintColor="#fff"
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
    backgroundColor: '#fefefe',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
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
  animalInfo: {
    flex: 1,
    paddingHorizontal: 10,
  },
  animalId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  animalPrice: {
    fontSize: 16,
    color: '#666',
  },
  animalDate: {
    fontSize: 16,
    color: '#666',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
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
  modalText: {
    fontSize: 16,
    marginVertical: 4,
    color: '#000',
  },
  boldText: {
    fontWeight: 'bold',
  },
  closeModalButton: {
    marginTop: 16,
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeModalButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
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
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  fabIcon: {
    width: 24,
    height: 24,
  },
});

export default SheepAndGoatProductionListScreen;
