import React, { useState, useMemo, useCallback } from 'react';
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
  Animated,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { icons } from '../../constants';
import { COLORS } from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';

const initialHealthRecords = [
  {
    id: '1',
    animalId: 'A001',
    type: 'Vaccination',
    vaccine: 'Rabies',
    dateAdministered: '2023-10-10',
    dosage: '1 ml',
    cost: '20',
    administeredBy: 'Dr. Smith',
  },
  {
    id: '2',
    animalId: 'A002',
    type: 'Deworming',
    drug: 'Praziquantel',
    dateAdministered: '2023-10-15',
    dosage: '10 mg',
    cost: '15',
    administeredBy: 'Dr. Jones',
  },
];

const HealthRecordsLandingScreen = ({ navigation }) => {
  const [healthRecords, setHealthRecords] = useState(initialHealthRecords);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterTypes, setSelectedFilterTypes] = useState([]);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));

  const sortedAndFilteredRecords = useMemo(() => {
    return healthRecords
      .filter(record =>
        record.animalId.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (selectedFilterTypes.length === 0 || selectedFilterTypes.includes(record.type))
      )
      .sort((a, b) => new Date(b.dateAdministered) - new Date(a.dateAdministered));
  }, [healthRecords, searchQuery, selectedFilterTypes]);

  const handleDelete = useCallback(id => {
    Alert.alert(
      'Delete Health Record',
      'Are you sure you want to delete this health record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setHealthRecords(prev => prev.filter(record => record.id !== id));
          },
        },
      ]
    );
  }, []);

  const handleEdit = useCallback(record => {
    navigation.navigate('EditHealthRecordScreen', { record });
  }, [navigation]);

  const handleFabPress = () => {
   
      navigation.navigate('HealthRecordsScreen');
  
  };

  const toggleFilterType = (option) => {
    setSelectedFilterTypes((prev) => {
      if (prev.includes(option)) {
        return prev.filter(type => type !== option); 
      } else {
        return [...prev, option]; 
      }
    });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.searchContainer}>
        <FastImage
          source={icons.search}
          style={styles.searchIcon}
          tintColor={COLORS.black}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Animal ID..."
          placeholderTextColor={COLORS.black}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => setIsFilterModalVisible(true)}>
        <FastImage
          source={icons.filter}
          style={styles.actionIcon}
          tintColor="#333"
        />
        <Text style={styles.actionText}>
          {selectedFilterTypes.length > 0 ? selectedFilterTypes.join(', ') : 'Filter Type'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderHealthCard = ({ item }) => {
    const fabScale = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.95]
    });

    return (
      <Animated.View 
        style={[styles.card, { transform: [{ scale: fabScale }] }]}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.animalId}>Animal ID: {item.animalId}</Text>
          <Text style={styles.healthType}>{item.type}</Text>
        </View>
        <View style={styles.healthDetails}>
          <Text style={styles.detailText}>
            {item.type === 'Vaccination' ? `Vaccine: ${item.vaccine}` : `Drug: ${item.drug}`}
          </Text>
          <Text style={styles.detailText}>Date Administered: {item.dateAdministered}</Text>
          <Text style={styles.detailText}>Dosage: {item.dosage}</Text>
          <Text style={styles.detailText}>Cost: ${item.cost}</Text>
          <Text style={styles.detailText}>Administered By: {item.administeredBy}</Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={() => handleEdit(item)}
            style={styles.cardActionButton}>
            <FastImage
              source={icons.edit}
              style={styles.actionButtonIcon}
              tintColor="#2196F3"
            />
            <Text style={[styles.actionButtonText, { color: '#2196F3' }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={styles.cardActionButton}>
            <FastImage
              source={icons.remove}
              style={styles.actionButtonIcon}
              tintColor="#F44336"
            />
            <Text style={[styles.actionButtonText, { color: '#F44336' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
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
          <Text style={styles.modalTitle}>Filter by Type</Text>
          {['Vaccination', 'Deworming', 'Curative Treatment', 'Genetic Disorders', 'Allergies', 'Boosters'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.filterOption, selectedFilterTypes.includes(option) && styles.selectedFilterOption]}
              onPress={() => toggleFilterType(option)}>
              <Text style={styles.filterOptionText}>{option}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setIsFilterModalVisible(false)}>
            <Text style={styles.closeModalButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderFAB = () => {
    const fabScale = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.8]
    });

    return (
      <Animated.View 
        style={[styles.fabContainer, { transform: [{ scale: fabScale }] }]}
      >
        <TouchableOpacity 
          style={styles.fab} 
          onPress={handleFabPress}
        >
          <FastImage 
            source={icons.plus} 
            style={styles.fabIcon} 
            tintColor="#fff" 
          />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader title="Health Records" />
      <StatusBar translucent backgroundColor={COLORS.green2} animated barStyle={'light-content'} />
      {renderHeader()}
      <FlatList
        data={sortedAndFilteredRecords}
        renderItem={renderHealthCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      {renderFAB()}
      {renderFilterModal()}
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
    borderBottomColor: COLORS.gray3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray2,
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
    color: COLORS.black,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray2,
    marginTop: 10,
  },
  actionIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  actionText: {
    fontSize: 14,
    color: COLORS.black,
  },
  listContent: {
    padding: 16,
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
    alignItems: 'center',
    marginBottom: 12,
  },
  animalId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  healthType: {
    fontSize: 16,
    color: COLORS.black,
    fontStyle: 'italic',
  },
  healthDetails: {
    marginTop: 8,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 4,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray3,
  },
  cardActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionButtonIcon: {
    width: 18,
    height: 18,
    marginRight: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  fab: {
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.darkOverlayColor,
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
    color: COLORS.black,
  },
  filterOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray3,
  },
  selectedFilterOption: {
    backgroundColor: COLORS.lightGreen,
  },
  filterOptionText: {
    fontSize: 16,
    color: COLORS.black,
  },
  closeModalButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  closeModalButtonText: {
    fontSize: 16,
    color: COLORS.green,
    fontWeight: 'bold',
  },
});

export default HealthRecordsLandingScreen;