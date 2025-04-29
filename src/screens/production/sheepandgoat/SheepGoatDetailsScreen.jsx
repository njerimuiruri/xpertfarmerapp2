import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { icons } from '../../../constants';
import { COLORS } from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';

const SheepGoatDetailsScreen = ({ route, navigation }) => {
  const { sheepGoatRecord } = route.params || {};
  const [activeTab, setActiveTab] = useState('overview');

  const totalSaleValue = sheepGoatRecord?.salePrice || 0;
  const estimatedCost = sheepGoatRecord ? (sheepGoatRecord.saleWeight * (sheepGoatRecord.marketPrice * 0.6)) : 0;
  const profit = totalSaleValue - estimatedCost;
  const profitMargin = ((profit / totalSaleValue) * 100).toFixed(1);

  const handleEdit = () => {
    navigation.navigate('AddSheepGoatDetailsScreen', {
      editMode: true,
      sheepGoatRecord: sheepGoatRecord
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this sheep/goat record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Delete logic would go here
            navigation.navigate('SheepAndGoatProductionListScreen');
          },
        },
      ],
    );
  };

  const formatDate = (dateStr) => {
    return dateStr;
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Basic Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Animal/Flock ID:</Text>
          <Text style={styles.infoValue}>{sheepGoatRecord?.animalIdOrFlockId}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Wool Quality:</Text>
          <Text style={styles.infoValue}>{sheepGoatRecord?.woolQuality}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Wool Weight:</Text>
          <Text style={styles.infoValue}>{sheepGoatRecord?.woolWeight} kg</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Sale Weight:</Text>
          <Text style={styles.infoValue}>{sheepGoatRecord?.saleWeight} kg</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Schedule Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Shearing Date:</Text>
          <Text style={styles.infoValue}>{formatDate(sheepGoatRecord?.shearingDate)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Sale Date:</Text>
          <Text style={styles.infoValue}>{sheepGoatRecord?.saleDate}</Text>
        </View>
      </View>
    </View>
  );

  const renderSalesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Sale Details</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Buyer:</Text>
          <Text style={styles.infoValue}>{sheepGoatRecord?.buyerName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Buyer Type:</Text>
          <View style={styles.chipContainer}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{sheepGoatRecord?.buyerType}</Text>
            </View>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Sale Date:</Text>
          <Text style={styles.infoValue}>{sheepGoatRecord?.saleDate}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Sale Weight:</Text>
          <Text style={styles.infoValue}>{sheepGoatRecord?.saleWeight} kg</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Financial Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Market Price/kg:</Text>
          <Text style={styles.infoValue}>${sheepGoatRecord?.marketPrice}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total Sale Price:</Text>
          <Text style={styles.infoValue}>${sheepGoatRecord?.salePrice}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Estimated Cost:</Text>
          <Text style={styles.infoValue}>${estimatedCost.toFixed(2)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Profit:</Text>
          <Text style={styles.infoValue}>${profit.toFixed(2)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Profit Margin:</Text>
          <Text style={styles.infoValue}>{profitMargin}%</Text>
        </View>
      </View>
    </View>
  );

  const renderProductionTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Wool Production Details</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Wool Weight:</Text>
          <Text style={styles.infoValue}>{sheepGoatRecord?.woolWeight} kg</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Wool Quality:</Text>
          <Text style={styles.infoValue}>{sheepGoatRecord?.woolQuality}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Shearing Date:</Text>
          <Text style={styles.infoValue}>{sheepGoatRecord?.shearingDate}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Record ID:</Text>
          <Text style={styles.infoValue}>#{sheepGoatRecord?.id}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Meat & Milk Production</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Weaning Weight:</Text>
          <Text style={styles.infoValue}>{sheepGoatRecord?.weaningWeight} kg</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Milk Yield:</Text>
          <Text style={styles.infoValue}>{sheepGoatRecord?.milkYield} L</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Sale Weight:</Text>
          <Text style={styles.infoValue}>{sheepGoatRecord?.saleWeight} kg</Text>
        </View>
      </View>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtonsContainer}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleEdit}
      >
        <FastImage
          source={icons.edit}
          style={styles.actionIcon}
          tintColor={COLORS.white}
        />
        <Text style={styles.actionButtonText}>Edit</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, styles.deleteButton]}
        onPress={handleDelete}
      >
        <FastImage
          source={icons.remove}
          style={styles.actionIcon}
          tintColor={COLORS.white}
        />
        <Text style={styles.actionButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  // If no record is provided (new record creation mode)
  if (!sheepGoatRecord) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          translucent
          backgroundColor={COLORS.green2}
          barStyle="light-content"
        />
        <SecondaryHeader
          title="Add Sheep/Goat Record"
          onBack={() => navigation.goBack()}
        />
        <View style={styles.emptyStateContainer}>
          <FastImage
            source={icons.sheepgoat}
            style={styles.emptyStateIcon}
            tintColor={COLORS.lightGray}
          />
          <Text style={styles.emptyStateTitle}>Create a New Record</Text>
          <Text style={styles.emptyStateSubtitle}>
            Fill in the sheep/goat details to add a new production record
          </Text>
          <TouchableOpacity
            style={styles.emptyStateButton}
            onPress={() => navigation.navigate('SheepGoatDetailsScreen')}>
            <Text style={styles.emptyStateButtonText}>Add New Record</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent
        backgroundColor={COLORS.green2}
        barStyle="light-content"
      />
      <SecondaryHeader
        title="Sheep/Goat Record Details"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.feedInfoHeader}>
        <View style={styles.feedInfoContainer}>
          <Text style={styles.animalTypeHeading}>{sheepGoatRecord.animalIdOrFlockId}</Text>
          <Text style={styles.feedNameHeading}>{sheepGoatRecord.woolQuality} Quality Wool</Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={styles.nextFeedContainer}>
            <Text style={styles.nextFeedLabel}>Sale Date:</Text>
            <Text style={styles.nextFeedDate}>{sheepGoatRecord.saleDate}</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'overview' && styles.activeTabButton]}
          onPress={() => setActiveTab('overview')}>
          <Text style={[styles.tabButtonText, activeTab === 'overview' && styles.activeTabButtonText]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'sales' && styles.activeTabButton]}
          onPress={() => setActiveTab('sales')}>
          <Text style={[styles.tabButtonText, activeTab === 'sales' && styles.activeTabButtonText]}>
            Sales Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'production' && styles.activeTabButton]}
          onPress={() => setActiveTab('production')}>
          <Text style={[styles.tabButtonText, activeTab === 'production' && styles.activeTabButtonText]}>
            Production
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'sales' && renderSalesTab()}
        {activeTab === 'production' && renderProductionTab()}
      </ScrollView>

      {renderActionButtons()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  feedInfoHeader: {
    backgroundColor: COLORS.green2,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedInfoContainer: {
    flex: 1,
  },
  animalTypeHeading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  feedNameHeading: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 4,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  feedTodayBadge: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  feedTodayText: {
    color: COLORS.green2,
    fontWeight: 'bold',
    fontSize: 14,
  },
  nextFeedContainer: {
    alignItems: 'flex-end',
  },
  nextFeedLabel: {
    color: COLORS.white,
    fontSize: 12,
  },
  nextFeedDate: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 3,
    borderBottomColor: COLORS.green2,
  },
  tabButtonText: {
    fontSize: 14,
    color: COLORS.dark,
  },
  activeTabButtonText: {
    color: COLORS.green2,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  infoCard: {
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
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.green2,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  infoLabel: {
    width: '35%',
    fontSize: 14,
    color: COLORS.dark,
    fontWeight: '500',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  chipContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: '#e0f2f1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 12,
    color: COLORS.green2,
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',

  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.green,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
    marginRight: 0,
    marginLeft: 8,
  },
  actionIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default SheepGoatDetailsScreen;