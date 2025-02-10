import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
} from 'react-native';
import {Box, Button, HStack, VStack} from 'native-base';
import FastImage from 'react-native-fast-image';
import {icons} from '../../../constants';
import {COLORS} from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';

const initialFeedData = [
  {
    id: '1',
    feedType: 'Basal Feed',
    lifecycleStage: 'Lactating cows',
    source: 'Grown and Purchased',
    schedule: 'Daily',
    quantity: '50 kg',
    cost: '5000 Ksh',
    supplier: 'AgroSupplies Ltd.',
    dateAdded: '2024-02-01',
  },
  {
    id: '2',
    feedType: 'Concentrate',
    lifecycleStage: 'Grower',
    source: 'Purely Purchased',
    schedule: 'Twice a week',
    quantity: '30 kg',
    cost: '3000 Ksh',
    supplier: 'FarmFeeds Co.',
    dateAdded: '2024-02-05',
  },
  {
    id: '3',
    feedType: 'Supplement',
    lifecycleStage: 'Heifer',
    source: 'Purely Purchased',
    schedule: 'Every 3 Days',
    quantity: '20 kg',
    cost: '2500 Ksh',
    supplier: 'DairyFeeds Ltd.',
    dateAdded: '2024-01-28',
  },
  {
    id: '4',
    feedType: 'Mixed Feed',
    lifecycleStage: 'Finisher',
    source: 'Grown and Purchased',
    schedule: 'Weekly',
    quantity: '40 kg',
    cost: '4000 Ksh',
    supplier: 'NutriFeeds Ltd.',
    dateAdded: '2024-02-10',
  },
  {
    id: '5',
    feedType: 'Basal Feed',
    lifecycleStage: 'Starter',
    source: 'Personally Grown',
    schedule: 'Daily',
    quantity: '35 kg',
    cost: '3200 Ksh',
    supplier: 'Self-Sourced',
    dateAdded: '2024-02-07',
  },
  {
    id: '6',
    feedType: 'Concentrate',
    lifecycleStage: 'Layer',
    source: 'Grown and Purchased',
    schedule: 'Twice a week',
    quantity: '25 kg',
    cost: '2700 Ksh',
    supplier: 'PoultryFeeds Ltd.',
    dateAdded: '2024-02-03',
  },
];

const FeedingRecordsScreen = ({navigation}) => {
  const [feeds, setFeeds] = useState(initialFeedData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const filteredFeeds = useMemo(() => {
    return feeds.filter(feed =>
      feed.feedType.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [feeds, searchQuery]);

  const handleOpenDetailsModal = feed => {
    setSelectedFeed(feed);
    setIsDetailsModalVisible(true);
  };

  const handleDeleteConfirmation = feed => {
    setSelectedFeed(feed);
    setIsDeleteModalVisible(true);
  };

  const handleDelete = () => {
    setFeeds(prev => prev.filter(feed => feed.id !== selectedFeed.id));
    setIsDeleteModalVisible(false);
  };

  const renderFeedCard = ({item}) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleOpenDetailsModal(item)}>
      <HStack justifyContent="space-between" alignItems="center">
        <VStack>
          <Text style={styles.cardTitle}>{item.feedType}</Text>
          <Text style={styles.cardDetail}>
            Lifecycle: {item.lifecycleStage}
          </Text>
          <Text style={styles.cardDetail}>Source: {item.source}</Text>
          <Text style={styles.cardDetail}>Schedule: {item.schedule}</Text>
        </VStack>
        <TouchableOpacity onPress={() => handleDeleteConfirmation(item)}>
          <FastImage
            source={icons.remove}
            style={styles.deleteIcon}
            tintColor={COLORS.red}
          />
        </TouchableOpacity>
      </HStack>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SecondaryHeader title="Feed Management" navigation={navigation} />

      <View style={styles.searchContainer}>
        <FastImage
          source={icons.search}
          style={styles.searchIcon}
          tintColor="#666"
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search feeds..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredFeeds}
        renderItem={renderFeedCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />

      <Modal visible={isDetailsModalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <Box style={styles.modalContent}>
            {selectedFeed && (
              <VStack space={3}>
                <Text style={styles.modalTitle}>{selectedFeed.feedType}</Text>
                <Text style={styles.modalText}>
                  Lifecycle: {selectedFeed.lifecycleStage}
                </Text>
                <Text style={styles.modalText}>
                  Source: {selectedFeed.source}
                </Text>
                <Text style={styles.modalText}>
                  Schedule: {selectedFeed.schedule}
                </Text>
                <Text style={styles.modalText}>
                  Quantity: {selectedFeed.quantity}
                </Text>
                <Text style={styles.modalText}>Cost: {selectedFeed.cost}</Text>
                <Text style={styles.modalText}>
                  Supplier: {selectedFeed.supplier}
                </Text>
                <Text style={styles.modalText}>
                  Date Added: {selectedFeed.dateAdded}
                </Text>
                <Button
                  colorScheme="green"
                  mt={4}
                  onPress={() => setIsDetailsModalVisible(false)}>
                  Close
                </Button>
              </VStack>
            )}
          </Box>
        </View>
      </Modal>

      <Modal visible={isDeleteModalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <Box style={styles.modalContent}>
            <FastImage source={icons.warning} style={styles.warningIcon} />
            <Text style={styles.modalText}>
              Are you sure you want to delete this record?
            </Text>
            <HStack space={3} justifyContent="center" mt={4}>
              <Button
                variant="outline"
                onPress={() => setIsDeleteModalVisible(false)}>
                Cancel
              </Button>
              <Button colorScheme="danger" onPress={handleDelete}>
                Delete
              </Button>
            </HStack>
          </Box>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.light},
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f3f4',
    borderRadius: 8,
    padding: 10,
    margin: 16,
  },
  searchIcon: {width: 20, height: 20, marginRight: 8},
  searchInput: {flex: 1, height: 40, fontSize: 16, color: '#333'},
  listContent: {padding: 16},
  card: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  cardTitle: {fontSize: 18, fontWeight: 'bold', color: COLORS.darkGray3},
  cardDetail: {fontSize: 14, color: COLORS.gray},
  deleteIcon: {width: 30, height: 30, tintColor: COLORS.red},
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },
  modalText: {
    color: COLORS.black,
    fontSize: 16,
    marginBottom: 16,
  },
  warningIcon: {
    width: 40,
    height: 40,
    tintColor: COLORS.red,
    marginBottom: 10,
  },
});

export default FeedingRecordsScreen;
