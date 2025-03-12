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
import {icons} from '../../../constants';
import {COLORS} from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';

const initialFeedingData = [
  {
    id: '1',
    animalType: 'Dairy Cattle',
    feedName: 'High-protein Dairy Mix',
    frequency: 'Twice Daily',
    amount: '12 kg per animal',
    lastFed: '2025-03-03',
    nextFeeding: '2025-03-04',
    nutritionalInfo: 'Protein: 18%, Fiber: 12%, Fat: 4%',
    timeOfDay: ['Morning', 'Evening'],
  },
  {
    id: '2',
    animalType: 'Beef Cattle',
    feedName: 'Growth Formula',
    frequency: 'Three Times Daily',
    amount: '10 kg per animal',
    lastFed: '2025-03-03',
    nextFeeding: '2025-03-04',
    nutritionalInfo: 'Protein: 16%, Fiber: 15%, Fat: 3%',
    timeOfDay: ['Morning', 'Afternoon', 'Evening'],
  },
  {
    id: '3',
    animalType: 'Poultry',
    feedName: 'Layer Feed',
    frequency: 'Daily',
    amount: '120 g per bird',
    lastFed: '2025-03-03',
    nextFeeding: '2025-03-04',
    nutritionalInfo: 'Protein: 16%, Calcium: 4%, Fiber: 5%',
    timeOfDay: ['Morning'],
  },
  {
    id: '4',
    animalType: 'Swine',
    feedName: 'Starter Feed',
    frequency: 'Three Times Daily',
    amount: '1.5 kg per animal',
    lastFed: '2025-03-03',
    nextFeeding: '2025-03-04',
    nutritionalInfo: 'Protein: 20%, Fiber: 4%, Fat: 6%',
    timeOfDay: ['Morning', 'Afternoon', 'Evening'],
  },
  {
    id: '5',
    animalType: 'Sheep',
    feedName: 'Grazing Supplement',
    frequency: 'Once Daily',
    amount: '0.8 kg per animal',
    lastFed: '2025-03-03',
    nextFeeding: '2025-03-04',
    nutritionalInfo: 'Protein: 14%, Fiber: 20%, Fat: 2%',
    timeOfDay: ['Morning'],
  },
];

const FeedingModuleScreen = ({navigation}) => {
  const [feedingRequirements, setFeedingRequirements] =
    useState(initialFeedingData);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnimalType, setFilterAnimalType] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const currentDate = new Date().toISOString().split('T')[0];
  const [sortBy, setSortBy] = useState('nextFeeding'); // Default sorting by date
  const [sortOrder, setSortOrder] = useState('asc'); // Default ascending order
  const sortedAndFilteredRequirements = useMemo(() => {
    return feedingRequirements
      .filter(
        requirement =>
          requirement.animalType
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) &&
          (filterAnimalType === '' ||
            requirement.animalType === filterAnimalType),
      )
      .sort((a, b) => {
        if (sortBy === 'nextFeeding') {
          return sortOrder === 'asc'
            ? new Date(a.nextFeeding) - new Date(b.nextFeeding)
            : new Date(b.nextFeeding) - new Date(a.nextFeeding);
        }
        return 0;
      });
  }, [feedingRequirements, searchQuery, sortBy, sortOrder, filterAnimalType]);

  const handleDelete = useCallback(id => {
    Alert.alert(
      'Delete Feeding Requirement',
      'Are you sure you want to delete this feeding requirement?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setFeedingRequirements(prev =>
              prev.filter(requirement => requirement.id !== id),
            );
          },
        },
      ],
    );
  }, []);

  const handleEdit = useCallback(
    requirement => {
      navigation.navigate('EditFeedingRequirementScreen', {requirement});
    },
    [navigation],
  );
  const toggleSort = useCallback(() => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  const renderRequirementCard = ({item}) => {
    const isToday = item.nextFeeding === currentDate;

    return (
      <View style={styles.card}>
        {isToday && (
          <View style={styles.todayCard}>
            <Text style={styles.todayCardText}>Feed Now</Text>
          </View>
        )}
        <View style={styles.cardHeader}>
          <View style={styles.requirementInfo}>
            <Text style={styles.animalType}>{item.animalType}</Text>
            <Text style={styles.feedName}>{item.feedName}</Text>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity
              onPress={() => handleEdit(item)}
              style={styles.cardActionButton}>
              <FastImage
                source={icons.submited}
                style={styles.cardActionIcon}
                tintColor="#4CAF50"
              />
            </TouchableOpacity>
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
        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <FastImage
              source={icons.calendar}
              style={styles.detailIcon}
              tintColor="#666"
            />
            <Text style={styles.detailText}>Frequency: {item.frequency}</Text>
          </View>
          <View style={styles.detailRow}>
            <FastImage
              source={icons.account}
              style={styles.detailIcon}
              tintColor="#666"
            />
            <Text style={styles.detailText}>Amount: {item.amount}</Text>
          </View>
          <View style={styles.nutritionContainer}>
            <Text style={styles.nutritionTitle}>Nutrition Info:</Text>
            <Text style={styles.nutritionText}>{item.nutritionalInfo}</Text>
          </View>
          {isToday && (
            <View style={styles.feedingScheduleContainer}>
              <Text style={styles.scheduleTitleText}>Feed's Schedule:</Text>
              <View style={styles.timeSlotContainer}>
                {item.timeOfDay.map(time => (
                  <View key={time} style={styles.timeSlotWrapper}>
                    <TouchableOpacity
                      style={styles.timeSlot}
                      >
                      <Text style={styles.timeSlotText}>{time}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderFilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isFilterModalVisible}
      onRequestClose={() => setIsFilterModalVisible(false)}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filter by Animal Type</Text>
          {['Dairy Cattle', 'Beef Cattle', 'Poultry', 'Swine', 'Sheep'].map(
            animalType => (
              <TouchableOpacity
                key={animalType}
                style={[
                  styles.filterOption,
                  filterAnimalType === animalType &&
                    styles.selectedFilterOption,
                ]}
                onPress={() => {
                  setFilterAnimalType(prev =>
                    prev === animalType ? '' : animalType,
                  );
                  setIsFilterModalVisible(false);
                }}>
                <Text
                  style={[
                    styles.filterOptionText,
                    filterAnimalType === animalType &&
                      styles.selectedFilterOptionText,
                  ]}>
                  {animalType}
                </Text>
              </TouchableOpacity>
            ),
          )}
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              setFilterAnimalType('');
              setIsFilterModalVisible(false);
            }}>
            <Text style={styles.resetButtonText}>Reset Filters</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setIsFilterModalVisible(false)}>
            <Text style={styles.closeModalButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader title="Feeding" />
      <StatusBar
        translucent
        backgroundColor={COLORS.green2}
        animated={true}
        barStyle={'light-content'}
      />
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <FastImage
            source={icons.search}
            style={styles.searchIcon}
            tintColor="#666"
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search feeding requirements..."
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
          <TouchableOpacity style={styles.actionButton} onPress={toggleSort}>
            <FastImage
              source={icons.calendar}
              style={styles.actionIcon}
              tintColor="#333"
            />
            <Text style={styles.actionText}>Sort by Date</Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={sortedAndFilteredRequirements}
        renderItem={renderRequirementCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('FarmFeedsScreen')}>
        <FastImage
          source={icons.plus}
          style={styles.fabIcon}
          tintColor="#fff"
        />
      </TouchableOpacity>
      {renderFilterModal()}
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  todayCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    padding: 5,
  },
  todayCardText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requirementInfo: {
    flex: 1,
  },
  animalType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  feedName: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
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
  feedingScheduleContainer: {
    marginTop: 12,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
  },
  scheduleTitleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  timeSlotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlotWrapper: {
    marginBottom: 8,
    alignItems: 'center',
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 90,
  },
  timeSlotText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
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
  filterOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  selectedFilterOption: {
    backgroundColor: '#e8f5e9',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedFilterOptionText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  closeModalButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  closeModalButtonText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  resetButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f44336',
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  nutritionContainer: {
    marginTop: 8,
    backgroundColor: '#f0f8ff',
    padding: 10,
    borderRadius: 8,
  },
  nutritionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  nutritionText: {
    fontSize: 13,
    color: '#666',
  },
});

export default FeedingModuleScreen;
