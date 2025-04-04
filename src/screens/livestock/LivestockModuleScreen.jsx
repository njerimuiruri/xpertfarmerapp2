import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  SafeAreaView,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { icons } from '../../constants';
import { COLORS } from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';

const LivestockModuleScreen = ({ route, navigation }) => {
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [livestockData, setLivestockData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const initialLivestockData = [
    {
      id: 'DC001',
      title: 'Holstein Friesian',
      farmId: 'F001',
      breed: 'Holstein Friesian',
      dob: '2022-05-10',
      sex: 'Female',
      type: 'dairy_cows',
      health: 'Vaccinated, recent hoof trimming',
      production: '25 liters/day',
    },
    {
      id: 'BC001',
      title: 'Black Angus',
      farmId: 'F002',
      breed: 'Black Angus',
      dob: '2021-06-15',
      sex: 'Male',
      type: 'beef_cattle',
      health: 'Vaccinated, dewormed',
      production: 'Weight: 850kg',
    },
    {
      id: 'SW001',
      title: 'Yorkshire Sow',
      farmId: 'F003',
      breed: 'Yorkshire',
      dob: '2023-02-20',
      sex: 'Female',
      type: 'swine',
      health: 'Vaccinated, dewormed',
      production: 'Litter size: 12',
    },
    {
      id: 'GT001',
      title: 'Boer Goat',
      farmId: 'F003',
      breed: 'Boer',
      dob: '2022-11-05',
      sex: 'Female',
      type: 'goats',
      health: 'Vaccinated, dewormed',
      production: 'Milk: 3 liters/day',
    },
    {
      id: 'SH001',
      title: 'Merino Sheep',
      farmId: 'F004',
      breed: 'Merino',
      dob: '2022-09-18',
      sex: 'Female',
      type: 'sheep',
      health: 'Vaccinated, sheared recently',
      production: 'Wool: 4.5kg',
    },
    {
      id: 'PL001',
      title: 'White Leghorn',
      farmId: 'F005',
      breed: 'White Leghorn',
      dob: '2023-04-01',
      sex: 'Female',
      type: 'poultry',
      health: 'Vaccinated',
      production: 'Eggs: 300/year',
    },
  ];

  useEffect(() => {
    if (selectedType === 'all') {
      setLivestockData(initialLivestockData);
    } else {
      const filtered = initialLivestockData.filter(
        item => item.type === selectedType,
      );
      setLivestockData(filtered);
    }
  }, [selectedType]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredData(livestockData);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = livestockData.filter(item => {
        return (
          item.id.toLowerCase().includes(lowercaseQuery) ||
          item.title.toLowerCase().includes(lowercaseQuery) ||
          (item.breed && item.breed.toLowerCase().includes(lowercaseQuery)) ||
          (item.farmId && item.farmId.toLowerCase().includes(lowercaseQuery))
        );
      });
      setFilteredData(filtered);
    }
  }, [searchQuery, livestockData]);

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
            placeholder="Search livestock by ID, breed..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TypeSelector />
        <View style={styles.actionBar}>
          <ActionButton
            icon={icons.health}
            text="Health"
            onPress={() =>
              navigation.navigate('HealthRecordsScreen', { type: selectedType })
            }
          />
          <ActionButton
            icon={icons.breeding}
            text="Breeding"
            onPress={() =>
              navigation.navigate('BreedingModuleLandingScreen', {
                type: selectedType,
              })
            }
          />
          <ActionButton
            icon={icons.feeding}
            text="Feeding"
            onPress={() =>
              navigation.navigate('FeedingModuleScreen', {
                type: selectedType,
              })
            }
          />
          <ActionButton
            icon={icons.document}
            text="Reports"
          // onPress={() =>
          //   navigation.navigate('LivestockReportsScreen', {
          //     type: selectedType,
          //   })
          // }
          />
        </View>
      </View>
    );
  };

  const ActionButton = ({ icon, text, onPress }) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <FastImage source={icon} style={styles.actionIcon} tintColor="#333" />
      <Text style={styles.actionText}>{text}</Text>
    </TouchableOpacity>
  );

  const renderAnimalCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.animalInfo}>
          <Text style={styles.name}>{item.title}</Text>
          <Text style={styles.breed}>{item.breed}</Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('AnimalDetailScreen', {
              id: item.id,
              type: item.type || selectedType,
              animalData: item,
            })}
            style={styles.cardActionButton}>
            <FastImage
              source={icons.submited}
              style={styles.cardActionIcon}
              tintColor="#4CAF50"
            />
          </TouchableOpacity>
          <TouchableOpacity
           
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
          <Text style={styles.detailText}>Farm: {item.farmId}</Text>
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
      </View>
    </View>
  );

  const handleCardPress = item => {
    navigation.navigate('AnimalDetailScreen', {
      id: item.id,
      type: item.type || selectedType,
      animalData: item,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader title="Livestock Management" />
      {renderHeader()}
      <FlatList
        data={filteredData}
        renderItem={renderAnimalCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('OptionDetailsScreen')}>
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
  container: { flex: 1 },
  header: {
    backgroundColor: COLORS.white,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.green3,
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
  actionBar: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray2,
  },
  actionIcon: { width: 18, height: 18, marginRight: 6 },
  actionText: { fontSize: 14, color: COLORS.black },
  listContent: { padding: 16 },


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
});

export default LivestockModuleScreen;
