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

// Sample data for poultry
const initialPoultryData = [
  {
    id: '1',
    weightGain: 5, // in lbs
    saleWeight: 8, // in lbs
    saleDate: '2023-06-01',
    marketPrice: 1.5, // price per lb
    salePrice: 12.0, // total sale price
    buyer: 'Poultry Farm',
    company: 'Quality Poultry Ltd.',
    icon: icons.poultry,
  },
  {
    id: '2',
    weightGain: 4.5,
    saleWeight: 7.5,
    saleDate: '2023-07-01',
    marketPrice: 1.6,
    salePrice: 12.0,
    buyer: 'Local Market',
    company: 'Fresh Poultry Co.',
    icon: icons.poultry,
  },
  {
    id: '3',
    weightGain: 6,
    saleWeight: 9,
    saleDate: '2023-08-01',
    marketPrice: 1.55,
    salePrice: 13.95,
    buyer: 'City Butcher',
    company: 'Poultry Masters',
    icon: icons.poultry,
  },
  {
    id: '4',
    weightGain: 5.5,
    saleWeight: 8.5,
    saleDate: '2023-09-01',
    marketPrice: 1.7,
    salePrice: 14.45,
    buyer: 'Farm Fresh',
    company: 'Poultry Excellence',
    icon: icons.poultry,
  },
  {
    id: '5',
    weightGain: 5.2, // in lbs
    saleWeight: 8.2, // in lbs
    saleDate: '2023-10-01',
    marketPrice: 1.65, // price per lb
    salePrice: 13.53, // total sale price
    buyer: 'Urban Grocers',
    company: 'Prime Poultry Suppliers',
    icon: icons.poultry,
  },
  {
    id: '6',
    weightGain: 4.8,
    saleWeight: 7.8,
    saleDate: '2023-11-01',
    marketPrice: 1.6,
    salePrice: 12.48,
    buyer: 'Fresh Meat Market',
    company: 'Elite Poultry Corp.',
    icon: icons.poultry,
  },
  {
    id: '7',
    weightGain: 6.3,
    saleWeight: 9.3,
    saleDate: '2023-12-01',
    marketPrice: 1.75,
    salePrice: 16.28,
    buyer: 'Village Market',
    company: 'Grassland Poultry Co.',
    icon: icons.poultry,
  },
  {
    id: '8',
    weightGain: 5.7,
    saleWeight: 8.7,
    saleDate: '2024-01-01',
    marketPrice: 1.7,
    salePrice: 14.79,
    buyer: 'Township Meat Co.',
    company: 'Excellence Poultry Ltd.',
    icon: icons.poultry,
  },
  {
    id: '9',
    weightGain: 6.5,
    saleWeight: 9.5,
    saleDate: '2024-02-01',
    marketPrice: 1.8,
    salePrice: 17.1,
    buyer: 'Regional Farms',
    company: 'Heritage Poultry Producers',
    icon: icons.poultry,
  },
];

const PoultryProductionListScreen = ({navigation}) => {
  const [poultry, setPoultry] = useState(initialPoultryData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPoultry, setSelectedPoultry] = useState(null);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const filteredPoultry = useMemo(() => {
    return poultry.filter(item =>
      item.id.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, poultry]);

  const handleDelete = useCallback(id => {
    Alert.alert(
      'Delete Poultry Record',
      'Are you sure you want to delete this poultry record?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPoultry(prev => prev.filter(item => item.id !== id));
          },
        },
      ],
    );
  }, []);

  const handleEdit = useCallback(
    poultry => {
      // Navigate to edit screen with poultry data
      navigation.navigate('EditPoultryScreen', {poultry});
    },
    [navigation],
  );

  const handleAddPoultry = () => {
    // Navigate to add poultry screen
    navigation.navigate('AddPoultryScreen');
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
          placeholder="Search by Poultry ID..."
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

  const renderPoultryCard = ({item}) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        setSelectedPoultry(item);
      }}>
      <View style={styles.cardHeader}>
        <FastImage source={item.icon} style={styles.cardIcon} />
        <View style={styles.poultryInfo}>
          <Text style={styles.poultryId}>Poultry ID: {item.id}</Text>
          <Text style={styles.poultryPrice}>Sale Price: ${item.salePrice}</Text>
          <Text style={styles.poultryDate}>Sale Date: {item.saleDate}</Text>
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
          <Text style={styles.modalTitle}>Filter Poultry Records</Text>
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

  const renderPoultryDetailModal = () => {
    if (!selectedPoultry) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!selectedPoultry}
        onRequestClose={() => setSelectedPoultry(null)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedPoultry.company} Details
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Poultry ID:</Text>{' '}
              {selectedPoultry.id}
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Weight Gain:</Text>{' '}
              {selectedPoultry.weightGain} lbs
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Sale Weight:</Text>{' '}
              {selectedPoultry.saleWeight} lbs
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Sale Date:</Text>{' '}
              {selectedPoultry.saleDate}
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Market Price:</Text> $
              {selectedPoultry.marketPrice}/lb
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Sale Price:</Text> $
              {selectedPoultry.salePrice}
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Buyer:</Text>{' '}
              {selectedPoultry.buyer}
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Company:</Text>{' '}
              {selectedPoultry.company}
            </Text>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setSelectedPoultry(null)}>
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader title="Poultry Production Records" />
      <StatusBar
        translucent
        backgroundColor={COLORS.green2}
        animated={true}
        barStyle={'light-content'}
      />
      {renderHeader()}
      <FlatList
        data={filteredPoultry}
        renderItem={renderPoultryCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
      {renderFilterModal()}
      {renderPoultryDetailModal()}
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
  poultryInfo: {
    flex: 1,
    paddingHorizontal: 10,
  },
  poultryId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  poultryPrice: {
    fontSize: 16,
    color: '#666',
  },
  poultryDate: {
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

export default PoultryProductionListScreen;
