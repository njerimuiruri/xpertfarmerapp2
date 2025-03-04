import React, {useState, useEffect} from 'react';
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
import {icons} from '../../constants';
import {COLORS} from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';

const LivestockModuleScreen = ({route, navigation}) => {
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
      {id: 'all', label: 'All Livestock'},
      {id: 'dairy_cows', label: 'Dairy Cows'},
      {id: 'beef_cattle', label: 'Beef Cattle'},
      {id: 'swine', label: 'Swine'},
      {id: 'goats', label: 'Goats'},
      {id: 'sheep', label: 'Sheep'},
      {id: 'poultry', label: 'Poultry'},
    ];

    return (
      <View style={styles.typeSelectorContainer}>
        <FlatList
          data={types}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({item}) => (
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
              navigation.navigate('HealthRecordsScreen', {type: selectedType})
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

  const ActionButton = ({icon, text, onPress}) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <FastImage source={icon} style={styles.actionIcon} tintColor="#333" />
      <Text style={styles.actionText}>{text}</Text>
    </TouchableOpacity>
  );

  const renderAnimalCard = ({item}) => (
    <TouchableOpacity style={styles.card} onPress={() => handleCardPress(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.moduleTitle}>{item.title}</Text>
        <Text style={styles.moduleDescription}>ID: {item.id}</Text>
        <Text style={styles.infoText}>Farm ID: {item.farmId}</Text>
        <Text style={styles.infoText}>Breed: {item.breed}</Text>
        <Text style={styles.infoText}>Born: {item.dob}</Text>
        <Text style={styles.infoText}>Sex: {item.sex}</Text>
      </View>
    </TouchableOpacity>
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
  container: {flex: 1},
  header: {
    backgroundColor: '#fff',
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
  searchIcon: {width: 20, height: 20, marginRight: 8},
  searchInput: {flex: 1, height: 40, fontSize: 16, color: '#333'},
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
    color: '#fff',
  },
  actionBar: {flexDirection: 'row', justifyContent: 'flex-end', gap: 10},
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray2,
  },
  actionIcon: {width: 18, height: 18, marginRight: 6},
  actionText: {fontSize: 14, color: COLORS.black},
  listContent: {padding: 16},
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  cardHeader: {marginBottom: 16},
  moduleTitle: {fontSize: 18, fontWeight: 'bold', color: '#333'},
  moduleDescription: {fontSize: 14, color: COLORS.black},
  infoText: {fontSize: 14, color: COLORS.black},
  cardFooter: {flexDirection: 'row', flexWrap: 'wrap', paddingTop: 12},
  footerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  badgeIcon: {width: 14, height: 14, marginRight: 4},
  badgeText: {fontSize: 12, color: COLORS.black},
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

export default LivestockModuleScreen;
