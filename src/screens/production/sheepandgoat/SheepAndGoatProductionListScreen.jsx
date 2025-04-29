import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { icons } from '../../../constants';
import { COLORS } from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';

const initialSheepGoatData = [
  {
    id: '1',
    animalIdOrFlockId: 'ID 1',
    woolWeight: 5,
    woolQuality: 'High',
    shearingDate: '01/01/2023',
    weaningWeight: 25,
    milkYield: 15,
    saleWeight: 45,
    saleDate: '15/01/2023',
    marketPrice: 120,
    salePrice: 5400,
    buyerName: 'Wool Co.',
    isCompany: true,
    isIndividual: false,
    buyerType: 'Company',
    icon: icons.sheepgoat,
  },
  {
    id: '2',
    animalIdOrFlockId: 'ID 2',
    woolWeight: 4.2,
    woolQuality: 'Medium',
    shearingDate: '15/02/2023',
    weaningWeight: 22,
    milkYield: 12,
    saleWeight: 42,
    saleDate: '20/02/2023',
    marketPrice: 110,
    salePrice: 4620,
    buyerName: 'Local Butcher',
    isCompany: false,
    isIndividual: true,
    buyerType: 'Individual',
    icon: icons.sheepgoat,
  },
  {
    id: '3',
    animalIdOrFlockId: 'ID 3',
    woolWeight: 5.5,
    woolQuality: 'Excellent',
    shearingDate: '10/03/2023',
    weaningWeight: 28,
    milkYield: 18,
    saleWeight: 48,
    saleDate: '25/03/2023',
    marketPrice: 125,
    salePrice: 6000,
    buyerName: 'Organic Meats',
    isCompany: true,
    isIndividual: false,
    buyerType: 'Company',
    icon: icons.sheepgoat,
  },
  {
    id: '4',
    animalIdOrFlockId: 'ID 4',
    woolWeight: 6.1,
    woolQuality: 'Premium',
    shearingDate: '05/04/2023',
    weaningWeight: 30,
    milkYield: 20,
    saleWeight: 50,
    saleDate: '20/04/2023',
    marketPrice: 130,
    salePrice: 6500,
    buyerName: 'Textile Factory',
    isCompany: true,
    isIndividual: false,
    buyerType: 'Company',
    icon: icons.sheepgoat,
  },
  {
    id: '5',
    animalIdOrFlockId: 'ID 5',
    woolWeight: 4.8,
    woolQuality: 'Good',
    shearingDate: '15/05/2023',
    weaningWeight: 26,
    milkYield: 14,
    saleWeight: 46,
    saleDate: '30/05/2023',
    marketPrice: 115,
    salePrice: 5290,
    buyerName: 'Farm Fresh Market',
    isCompany: false,
    isIndividual: true,
    buyerType: 'Individual',
    icon: icons.sheepgoat,
  },
];

const SheepAndGoatProductionListScreen = ({ navigation }) => {
  const [sheepGoatRecords, setSheepGoatRecords] = useState(initialSheepGoatData);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredRecords = useMemo(() => {
    let filtered = sheepGoatRecords;

    if (searchQuery) {
      filtered = filtered.filter(
        item =>
          item.animalIdOrFlockId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.buyerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== 'All') {
      filtered = filtered.filter(item => item.buyerType === filterStatus);
    }

    return filtered;
  }, [sheepGoatRecords, searchQuery, filterStatus]);

  const handleDelete = useCallback(id => {
    Alert.alert(
      'Delete Sheep/Goat Record',
      'Are you sure you want to delete this sheep/goat record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setSheepGoatRecords(prev => prev.filter(item => item.id !== id));
          },
        },
      ],
    );
  }, []);

  const handleViewDetails = useCallback(
    (record) => {
      navigation.navigate('SheepGoatDetailsScreen', { sheepGoatRecord: record });
    },
    [navigation],
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <FastImage
            source={icons.search}
            style={styles.searchIcon}
            tintColor={COLORS.darkGray3}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Animal ID or Buyer"
            placeholderTextColor={COLORS.darkGray3}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <FastImage
                source={icons.remove}
                style={styles.clearIcon}
                tintColor={COLORS.darkGray3}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.filterChips}>
        <TouchableOpacity
          style={[
            styles.chip,
            filterStatus === 'All' && styles.activeChip
          ]}
          onPress={() => setFilterStatus('All')}>
          <Text style={[
            styles.chipText,
            filterStatus === 'All' && styles.activeChipText
          ]}>All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chip,
            filterStatus === 'Company' && styles.activeChip
          ]}
          onPress={() => setFilterStatus('Company')}>
          <Text style={[
            styles.chipText,
            filterStatus === 'Company' && styles.activeChipText
          ]}>Company</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chip,
            filterStatus === 'Individual' && styles.activeChip
          ]}
          onPress={() => setFilterStatus('Individual')}>
          <Text style={[
            styles.chipText,
            filterStatus === 'Individual' && styles.activeChipText
          ]}>Individual</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <FastImage
        source={icons.sheepgoat}
        style={styles.emptyIcon}
        tintColor={COLORS.lightGray}
      />
      <Text style={styles.emptyTitle}>No Sheep/Goat Records Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? "Try adjusting your search"
          : "Add your first sheep/goat production record"}
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('SheepGoatDetailsScreen')}>
        <Text style={styles.emptyButtonText}>Add Record</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSheepGoatCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleViewDetails(item)}
      activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <FastImage
          source={icons.sheepgoat}
          style={styles.sheepGoatIcon}
          tintColor={COLORS.green}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.animalIdText}>Animal: {item.animalIdOrFlockId}</Text>
          <View style={styles.buyerTypeTag}>
            <Text style={styles.buyerTypeText}>{item.buyerType}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <FastImage
            source={icons.remove}
            style={styles.deleteIcon}
            tintColor={COLORS.red}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.dataRow}>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Wool Weight</Text>
            <Text style={styles.dataValue}>{item.woolWeight} kg</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Quality</Text>
            <Text style={styles.dataValue}>{item.woolQuality}</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Sale</Text>
            <Text style={styles.dataValue}>${item.salePrice}</Text>
          </View>
        </View>

        <View style={styles.buyerContainer}>
          <Text style={styles.buyerLabel}>Buyer:</Text>
          <Text style={styles.buyerValue}>{item.buyerName}</Text>
          <Text style={styles.saleDate}>{item.saleDate}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.viewDetailsText}>Tap to view details</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent
        backgroundColor={COLORS.green2}
        barStyle="light-content"
      />
      <SecondaryHeader title="Sheep & Goat Production Records" />

      {renderHeader()}

      <FlatList
        data={filteredRecords}
        renderItem={renderSheepGoatCard}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContainer,
          filteredRecords.length === 0 && { flex: 1 }
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('SheepGoatDetailsScreen')}
        activeOpacity={0.8}>
        <FastImage
          source={icons.plus}
          style={styles.fabIcon}
          tintColor={COLORS.white}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGreen,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBarContainer: {
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGreen,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.darkGray3,
    height: '100%',
  },
  clearIcon: {
    width: 16,
    height: 16,
  },
  filterChips: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.lightGreen,
    marginRight: 8,
  },
  activeChip: {
    backgroundColor: COLORS.green,
  },
  chipText: {
    fontSize: 14,
    color: COLORS.darkGray3,
  },
  activeChipText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sheepGoatIcon: {
    width: 28,
    height: 28,
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  animalIdText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGray3,
  },
  buyerTypeTag: {
    backgroundColor: COLORS.lightGreen,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  buyerTypeText: {
    fontSize: 12,
    color: COLORS.green,
    fontWeight: '500',
  },
  deleteIcon: {
    width: 20,
    height: 20,
    marginLeft: 10,
    color: COLORS.red,
  },
  cardBody: {
    padding: 12,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dataItem: {
    alignItems: 'center',
    flex: 1,
  },
  dataLabel: {
    fontSize: 12,
    color: COLORS.darkGray3,
    marginBottom: 2,
  },
  dataValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  buyerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  buyerLabel: {
    fontSize: 13,
    color: COLORS.darkGray3,
    marginRight: 4,
  },
  buyerValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.darkGray,
    flex: 1,
  },
  saleDate: {
    fontSize: 13,
    color: COLORS.darkGray3,
  },
  cardFooter: {
    backgroundColor: '#f9f9f9',
    padding: 8,
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 12,
    color: COLORS.green,
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
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabIcon: {
    width: 24,
    height: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkGray3,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.darkGray3,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default SheepAndGoatProductionListScreen;