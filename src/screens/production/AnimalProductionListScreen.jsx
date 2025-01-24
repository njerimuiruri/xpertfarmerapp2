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

const initialAnimalData = [
  {
    id: '1',
    weightGain: 300,
    weaningWeight: 600,
    checkupWeight: 650,
    saleWeight: 700,
    saleDate: '2023-06-01',
    marketPrice: 2.5,
    salePrice: 1750,
    buyer: 'Local Butcher',
    company: 'Beef Co.',
    icon: icons.beef,
  },
  {
    id: '2',
    weightGain: 320,
    weaningWeight: 580,
    checkupWeight: 670,
    saleWeight: 720,
    saleDate: '2023-07-15',
    marketPrice: 2.55,
    salePrice: 1800,
    buyer: 'Farm Fresh Meats',
    company: 'Quality Meats Inc.',
    icon: icons.beef,
  },
  {
    id: '3',
    weightGain: 350,
    weaningWeight: 640,
    checkupWeight: 690,
    saleWeight: 740,
    saleDate: '2023-08-05',
    marketPrice: 2.6,
    salePrice: 1900,
    buyer: 'City Butcher',
    company: 'Premium Beef Suppliers',
    icon: icons.beef,
  },
  {
    id: '4',
    weightGain: 370,
    weaningWeight: 700,
    checkupWeight: 750,
    saleWeight: 780,
    saleDate: '2023-09-10',
    marketPrice: 2.7,
    salePrice: 2100,
    buyer: 'Market Meats',
    company: 'Beef Masters',
    icon: icons.beef,
  },
  {
    id: '5',
    weightGain: 310,
    weaningWeight: 620,
    checkupWeight: 670,
    saleWeight: 710,
    saleDate: '2023-09-20',
    marketPrice: 2.45,
    salePrice: 1740,
    buyer: 'Urban Grocers',
    company: 'Prime Beef Suppliers',
    icon: icons.beef,
  },
  {
    id: '6',
    weightGain: 340,
    weaningWeight: 660,
    checkupWeight: 710,
    saleWeight: 750,
    saleDate: '2023-10-12',
    marketPrice: 2.65,
    salePrice: 1980,
    buyer: 'Fresh Meat Market',
    company: 'Elite Cattle Corp.',
    icon: icons.beef,
  },
  {
    id: '7',
    weightGain: 290,
    weaningWeight: 600,
    checkupWeight: 645,
    saleWeight: 690,
    saleDate: '2023-10-25',
    marketPrice: 2.4,
    salePrice: 1650,
    buyer: 'Village Market',
    company: 'Grassland Beef Co.',
    icon: icons.beef,
  },
  {
    id: '8',
    weightGain: 360,
    weaningWeight: 700,
    checkupWeight: 760,
    saleWeight: 800,
    saleDate: '2023-11-05',
    marketPrice: 2.8,
    salePrice: 2240,
    buyer: 'Township Meat Co.',
    company: 'Excellence Beef Ltd.',
    icon: icons.beef,
  },
  {
    id: '9',
    weightGain: 400,
    weaningWeight: 750,
    checkupWeight: 800,
    saleWeight: 850,
    saleDate: '2023-11-30',
    marketPrice: 2.9,
    salePrice: 2465,
    buyer: 'Regional Farms',
    company: 'Heritage Cattle Producers',
    icon: icons.beef,
  },
  
];

const AnimalProductionListScreen = ({navigation}) => {
  const [animals, setAnimals] = useState(initialAnimalData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const filteredAnimals = useMemo(() => {
    return animals.filter(animal =>
      animal.id.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, animals]);

  const handleDelete = useCallback(id => {
    Alert.alert(
      'Delete Animal',
      'Are you sure you want to delete this animal?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setAnimals(prev => prev.filter(animal => animal.id !== id));
          },
        },
      ],
    );
  }, []);

  const handleEdit = useCallback(
    animal => {
      // Navigate to edit screen with animal data
      navigation.navigate('EditAnimalScreen', {animal});
    },
    [navigation],
  );

  const handleAddAnimal = () => {
    // Navigate to add animal screen
    navigation.navigate('AddAnimalScreen');
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
          <Text style={styles.modalTitle}>Filter Animals</Text>
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
              <Text style={styles.boldText}>Weaning Weight:</Text>{' '}
              {selectedAnimal.weaningWeight} lbs
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Checkup Weight:</Text>{' '}
              {selectedAnimal.checkupWeight} lbs
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
      <SecondaryHeader title="Beef Production Records" />
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
        onPress={() => navigation.navigate('BeefDetailsScreen')}>
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
    fontSize: 20,
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

export default AnimalProductionListScreen;
