import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { icons } from '../../../constants';
import { COLORS } from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';

const initialAllergyData = [
  {
    id: '1',
    animalIdOrFlockId: 'A001',
    cause: 'Grass Pollen',
    remedy: 'Antihistamines',
    dateRecorded: '2023-07-10',
  },
  {
    id: '2',
    animalIdOrFlockId: 'A002',
    cause: 'Dust Mites',
    remedy: 'Steroids',
    dateRecorded: '2023-08-15',
  },
];

const AllergiesRecordsScreen = ({ navigation }) => {
  const [allergyRecords, setAllergyRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
 
  const [activeFilters, setActiveFilters] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setAllergyRecords(initialAllergyData);
    ;
    });
  }, []);

  useEffect(() => {
    const count = searchQuery ? 1 : 0;
    setActiveFilters(count);
  }, [searchQuery]);

  const sortedAndFilteredRecords = useMemo(() => {
    return allergyRecords.filter(record => {
      return (
        searchQuery === '' ||
        record.animalIdOrFlockId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.cause.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [allergyRecords, searchQuery]);

 
  const showToast = message => {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  };

  const handleDelete = useCallback(id => {
    
            showToast('Record deleted successfully');
         
  }, []);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.searchContainer}>
        <FastImage source={icons.search} style={styles.searchIcon} tintColor={COLORS.black} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by ID or cause..."
          placeholderTextColor={COLORS.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <FastImage source={icons.close} style={styles.clearIcon} tintColor={COLORS.gray} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  

  const renderAllergyCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.animalInfo}>
          <Text style={styles.animalId}>{item.animalIdOrFlockId}</Text>
        </View>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{new Date(item.dateRecorded).toLocaleDateString()}</Text>
        </View>
      </View>
  
      <View style={styles.vaccineStatusContainer}>
        <View style={styles.vaccineBadgeContainer}>
          <View style={styles.vaccineBadge}>
            <Text style={styles.vaccineBadgeText}>
              {item.cause}
            </Text>
          </View>
        </View>
        
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Remedy:</Text>
            <Text style={styles.statusValue}>{item.remedy}</Text>
          </View>
        </View>
      </View>
  
      <View style={styles.cardActions}>
        <TouchableOpacity
          
          style={styles.cardActionButton}>
          <FastImage
            source={icons.edit}
            style={styles.actionButtonIcon}
            tintColor="#2196F3"
          />
          <Text style={[styles.actionButtonText, {color: '#2196F3'}]}>
            Edit
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={styles.cardActionButton}>
          <FastImage
            source={icons.remove}
            style={styles.actionButtonIcon}
            tintColor="#F44336"
          />
          <Text style={[styles.actionButtonText, {color: '#F44336'}]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

 

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader title="Allergy Records" />
      <StatusBar translucent backgroundColor={COLORS.green2} animated={true} barStyle={'light-content'} />
      
      {renderHeader()}
      
      <FlatList
        data={sortedAndFilteredRecords}
        renderItem={renderAllergyCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddAllergiesRecords')}>
        <FastImage source={icons.plus} style={styles.fabIcon} tintColor="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGreen,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.lightGreen,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.black,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray2,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  clearIcon: {
    width: 18,
    height: 18,
    padding: 4,
  },
  searchInput: {
    flex: 1,
    height: 42,
    fontSize: 16,
    color: COLORS.black,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 300,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
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
  animalId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  dateContainer: {
    padding: 6,
    backgroundColor: COLORS.lightGreen,
    borderRadius: 6,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.green,
  },
  allergyDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.gray,
    width: 80,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.black,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray3,
  },
  cardActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  actionButtonIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
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
  // Add these styles to your StyleSheet
vaccineBadgeContainer: {
  marginBottom: 10,
},
vaccineBadge: {
  alignSelf: 'flex-start',
  backgroundColor: COLORS.green,
  borderRadius: 20,
  paddingVertical: 4,
  paddingHorizontal: 12,
},
vaccineBadgeText: {
  color: COLORS.white,
  fontSize: 12,
  fontWeight: '600',
},
statusRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 8,
},
statusItem: {
  flex: 1,
},
statusLabel: {
  fontSize: 12,
  color: COLORS.gray,
  marginBottom: 2,
},
statusValue: {
  fontSize: 14,
  fontWeight: '500',
  color: COLORS.black,
},
vaccineStatusContainer: {
  marginTop: 8,
  padding: 12,
  borderRadius: 8,
},
animalType: {
  fontSize: 14,
  color: COLORS.black,
  marginTop: 4,
},
});

export default AllergiesRecordsScreen;