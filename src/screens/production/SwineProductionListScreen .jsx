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

const initialSwineData = [
  {
    id: '1',
    weightGain: 200,
    saleWeight: 300,
    saleDate: '2023-05-20',
    marketPrice: 2.0,
    salePrice: 600,
    buyer: 'Local Market',
    company: 'Swine Co.',
    icon: icons.swine,
  },
  {
    id: '2',
    weightGain: 220,
    saleWeight: 320,
    saleDate: '2023-06-15',
    marketPrice: 2.1,
    salePrice: 672,
    buyer: 'Farm Fresh',
    company: 'Quality Swine Inc.',
    icon: icons.swine,
  },
  {
    id: '3',
    weightGain: 180,
    saleWeight: 290,
    saleDate: '2023-07-10',
    marketPrice: 1.95,
    salePrice: 565,
    buyer: 'City Butcher',
    company: 'Premium Pork Suppliers',
    icon: icons.swine,
  },
  {
    id: '4',
    weightGain: 210,
    saleWeight: 310,
    saleDate: '2023-08-01',
    marketPrice: 2.05,
    salePrice: 638,
    buyer: 'Market Meats',
    company: 'Swine Masters',
    icon: icons.swine,
  },
  {
    id: '5',
    weightGain: 195,
    saleWeight: 305,
    saleDate: '2023-08-20',
    marketPrice: 2.2,
    salePrice: 671,
    buyer: 'Urban Grocers',
    company: 'Pork Prime Suppliers',
    icon: icons.swine,
  },
  {
    id: '6',
    weightGain: 230,
    saleWeight: 340,
    saleDate: '2023-09-12',
    marketPrice: 2.15,
    salePrice: 731,
    buyer: 'Fresh Pork Market',
    company: 'Elite Swine Corp.',
    icon: icons.swine,
  },
  {
    id: '7',
    weightGain: 185,
    saleWeight: 295,
    saleDate: '2023-09-25',
    marketPrice: 1.98,
    salePrice: 583,
    buyer: 'Village Market',
    company: 'Hog Heaven Farms',
    icon: icons.swine,
  },
  {
    id: '8',
    weightGain: 205,
    saleWeight: 315,
    saleDate: '2023-10-05',
    marketPrice: 2.3,
    salePrice: 724,
    buyer: 'Township Meat Co.',
    company: 'Swine Excellence Ltd.',
    icon: icons.swine,
  },
  {
    id: '9',
    weightGain: 215,
    saleWeight: 330,
    saleDate: '2023-10-30',
    marketPrice: 2.25,
    salePrice: 743,
    buyer: 'Regional Farms',
    company: 'Heritage Pork Producers',
    icon: icons.swine,
  },
];

const SwineProductionListScreen = ({navigation}) => {
  const [swine, setSwine] = useState(initialSwineData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSwine, setSelectedSwine] = useState(null);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const filteredSwine = useMemo(() => {
    return swine.filter(item =>
      item.id.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, swine]);

  const handleDelete = useCallback(id => {
    Alert.alert('Delete Swine', 'Are you sure you want to delete this swine?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setSwine(prev => prev.filter(item => item.id !== id));
        },
      },
    ]);
  }, []);

  const handleEdit = useCallback(
    swine => {
      // Navigate to edit screen with swine data
      navigation.navigate('EditSwineScreen', {swine});
    },
    [navigation],
  );

  const handleAddSwine = () => {
    // Navigate to add swine screen
    navigation.navigate('AddSwineScreen');
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
          placeholder="Search by Swine ID..."
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

  const renderSwineCard = ({item}) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        setSelectedSwine(item);
      }}>
      <View style={styles.cardHeader}>
        <FastImage source={item.icon} style={styles.cardIcon} />
        <View style={styles.swineInfo}>
          <Text style={styles.swineId}>Swine ID: {item.id}</Text>
          <Text style={styles.swinePrice}>Sale Price: ${item.salePrice}</Text>
          <Text style={styles.swineDate}>Sale Date: {item.saleDate}</Text>
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
          <Text style={styles.modalTitle}>Filter Swine</Text>
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

  const renderSwineDetailModal = () => {
    if (!selectedSwine) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!selectedSwine}
        onRequestClose={() => setSelectedSwine(null)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedSwine.company} Details
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Swine ID:</Text> {selectedSwine.id}
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Weight Gain:</Text>{' '}
              {selectedSwine.weightGain} lbs
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Sale Weight:</Text>{' '}
              {selectedSwine.saleWeight} lbs
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Sale Date:</Text>{' '}
              {selectedSwine.saleDate}
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Market Price:</Text> $
              {selectedSwine.marketPrice}/lb
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Sale Price:</Text> $
              {selectedSwine.salePrice}
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Buyer:</Text> {selectedSwine.buyer}
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Company:</Text>{' '}
              {selectedSwine.company}
            </Text>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setSelectedSwine(null)}>
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader title="Swine Production Records" />
      <StatusBar
        translucent
        backgroundColor={COLORS.green2}
        animated={true}
        barStyle={'light-content'}
      />
      {renderHeader()}
      <FlatList
        data={filteredSwine}
        renderItem={renderSwineCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
      {renderFilterModal()}
      {renderSwineDetailModal()}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('SwineRecordScreen')}>
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
    
  },
  header: {
    backgroundColor: COLORS.white,
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
    shadowColor: COLORS.black,
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
  swineInfo: {
    flex: 1,
    paddingHorizontal: 10,
  },
  swineId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  swinePrice: {
    fontSize: 16,
    color: '#666',
  },
  swineDate: {
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
    backgroundColor: COLORS.white,
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
    color: COLORS.black,
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
    color: COLORS.white,
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
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  fabIcon: {
    width: 24,
    height: 24,
  },
});

export default SwineProductionListScreen;
