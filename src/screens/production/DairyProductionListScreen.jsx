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

const initialDairyData = [
  {
    id: '1',
    dailyMilkYield: 30, // in liters
    milkQuality: 'High',
    lactationPeriod: '2023-01-01 to 2023-07-01',
    salePrice: 2000,
    buyer: 'Dairy Co.',
    icon: icons.dairy,
  },
  {
    id: '2',
    dailyMilkYield: 25,
    milkQuality: 'Medium',
    lactationPeriod: '2023-02-01 to 2023-08-01',
    salePrice: 1800,
    buyer: 'Milk Factory',
    icon: icons.dairy,
  },
  {
    id: '3',
    dailyMilkYield: 28,
    milkQuality: 'High',
    lactationPeriod: '2023-03-01 to 2023-09-01',
    salePrice: 2100,
    buyer: 'Local Market',
    icon: icons.dairy,
  },
  {
    id: '4',
    dailyMilkYield: 32,
    milkQuality: 'Excellent',
    lactationPeriod: '2023-04-01 to 2023-10-01',
    salePrice: 2200,
    buyer: 'Dairy Farm',
    icon: icons.dairy,
  },
  {
    id: '5',
    dailyMilkYield: 27, // in liters
    milkQuality: 'Good',
    lactationPeriod: '2023-05-01 to 2023-11-01',
    salePrice: 1900,
    buyer: 'Urban Dairy',
    icon: icons.dairy,
  },
  {
    id: '6',
    dailyMilkYield: 35,
    milkQuality: 'Excellent',
    lactationPeriod: '2023-06-01 to 2023-12-01',
    salePrice: 2300,
    buyer: 'Premium Milk Co.',
    icon: icons.dairy,
  },
  {
    id: '7',
    dailyMilkYield: 24,
    milkQuality: 'Medium',
    lactationPeriod: '2023-07-01 to 2024-01-01',
    salePrice: 1750,
    buyer: 'Village Dairy',
    icon: icons.dairy,
  },
  {
    id: '8',
    dailyMilkYield: 29,
    milkQuality: 'High',
    lactationPeriod: '2023-08-01 to 2024-02-01',
    salePrice: 2050,
    buyer: 'Fresh Milk Supplies',
    icon: icons.dairy,
  },
  {
    id: '9',
    dailyMilkYield: 33,
    milkQuality: 'Excellent',
    lactationPeriod: '2023-09-01 to 2024-03-01',
    salePrice: 2250,
    buyer: 'Dairy Excellence',
    icon: icons.dairy,
  },
];

const DairyProductionListScreen = ({navigation}) => {
  const [dairy, setDairy] = useState(initialDairyData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDairy, setSelectedDairy] = useState(null);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const filteredDairy = useMemo(() => {
    return dairy.filter(item =>
      item.id.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, dairy]);

  const handleDelete = useCallback(id => {
    Alert.alert(
      'Delete Dairy Record',
      'Are you sure you want to delete this dairy record?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDairy(prev => prev.filter(item => item.id !== id));
          },
        },
      ],
    );
  }, []);

  const handleEdit = useCallback(
    dairy => {
      // Navigate to edit screen with dairy data
      navigation.navigate('EditDairyScreen', {dairy});
    },
    [navigation],
  );

  const handleAddDairy = () => {
    // Navigate to add dairy screen
    navigation.navigate('AddDairyScreen');
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
          placeholder="Search by Dairy ID..."
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

  const renderDairyCard = ({item}) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        setSelectedDairy(item);
      }}>
      <View style={styles.cardHeader}>
        <FastImage source={item.icon} style={styles.cardIcon} />
        <View style={styles.dairyInfo}>
          <Text style={styles.dairyId}>Dairy ID: {item.id}</Text>
          <Text style={styles.dairyPrice}>Sale Price: ${item.salePrice}</Text>
          <Text style={styles.dairyYield}>
            Daily Milk Yield: {item.dailyMilkYield} L
          </Text>
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
          <Text style={styles.modalTitle}>Filter Dairy Records</Text>
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

  const renderDairyDetailModal = () => {
    if (!selectedDairy) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!selectedDairy}
        onRequestClose={() => setSelectedDairy(null)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedDairy.buyer} Details</Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Dairy ID:</Text> {selectedDairy.id}
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Daily Milk Yield:</Text>{' '}
              {selectedDairy.dailyMilkYield} L
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Milk Quality:</Text>{' '}
              {selectedDairy.milkQuality}
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Lactation Period:</Text>{' '}
              {selectedDairy.lactationPeriod}
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Sale Price:</Text> $
              {selectedDairy.salePrice}
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Buyer:</Text> {selectedDairy.buyer}
            </Text>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setSelectedDairy(null)}>
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader title="Dairy Production Records" />
      <StatusBar
        translucent
        backgroundColor={COLORS.green2}
        animated={true}
        barStyle={'light-content'}
      />
      {renderHeader()}
      <FlatList
        data={filteredDairy}
        renderItem={renderDairyCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
      {renderFilterModal()}
      {renderDairyDetailModal()}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddDairyDetailsScreen')}>
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
  dairyInfo: {
    flex: 1,
    paddingHorizontal: 10,
  },
  dairyId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  dairyPrice: {
    fontSize: 16,
    color: '#666',
  },
  dairyYield: {
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

export default DairyProductionListScreen;
