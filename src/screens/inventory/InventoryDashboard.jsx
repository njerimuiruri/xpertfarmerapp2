import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Box, HStack } from 'native-base';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import SecondaryHeader from '../../components/headers/secondary-header';
import { icons } from '../../constants';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/theme';
import { getFarmInventory, deleteInventory, getInventoryStats } from '../../services/inventoryService';

export default function InventoryDashboard() {
  const navigation = useNavigation();
  const [activeSection, setActiveSection] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [inventoryData, setInventoryData] = useState({
    all: [],
    machinery: [],
    goodsInStock: [],
    utilities: [],
  });
  const [inventoryStats, setInventoryStats] = useState({
    total: 0,
    machinery: 0,
    goodsInStock: 0,
    utilities: 0,
    alerts: { servicesDue: 0, expiringSoon: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const getItemTypeName = (section) => {
    switch (section) {
      case 'all':
        return 'Inventory Item';
      case 'machinery':
        return 'Machinery';
      case 'goodsInStock':
        return 'Goods Item';
      case 'utilities':
        return 'Utility';
      default:
        return 'Item';
    }
  };
  const loadInventoryData = async () => {
    try {
      const { data, error } = await getFarmInventory();
      if (error) {
        Alert.alert('Error', error);
        return;
      }

      console.log('Raw inventory data:', JSON.stringify(data, null, 2));

      if (!data || !Array.isArray(data)) {
        console.log('No inventory data or invalid format');
        const emptyData = {
          all: [],
          machinery: [],
          goodsInStock: [],
          utilities: [],
        };
        setInventoryData(emptyData);
        setInventoryStats(getInventoryStats([]));
        return;
      }

      // Transform the flattened API response into the expected nested structure
      const transformedData = data.map(item => {
        const transformedItem = {
          id: item.id,
          farmId: item.farmId,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        };

        // Check if this is a machinery item
        if (item.equipmentName && item.equipmentId) {
          transformedItem.machinery = {
            equipmentName: item.equipmentName,
            equipmentId: item.equipmentId,
            purchaseDate: item.purchaseDate,
            currentLocation: item.currentLocation,
            condition: item.condition,
            lastServiceDate: item.lastServiceDate,
            nextServiceDate: item.nextServiceDate,
          };
          transformedItem.type = 'machinery';
        }

        // Check if this is a goods in stock item
        else if (item.itemName && item.sku !== undefined) {
          transformedItem.goodsInStock = {
            itemName: item.itemName,
            sku: item.sku,
            quantity: item.quantity,
            currentLocation: item.currentLocation,
            condition: item.condition,
            expirationDate: item.expirationDate,
          };
          transformedItem.type = 'goodsInStock';
        }

        // Check if this is a utility item
        else if (item.utilityType) {
          const utilityData = {
            utilityType: item.utilityType,
            entryDate: item.entryDate,
            facilityCondition: item.facilityCondition,
          };

          // Add water-specific fields
          if (item.utilityType === 'water') {
            if (item.waterLevel !== undefined) utilityData.waterLevel = item.waterLevel;
            if (item.waterSource) utilityData.waterSource = item.waterSource;
            if (item.waterStorage !== undefined) utilityData.waterStorage = item.waterStorage;
          }

          // Add power-specific fields
          if (item.utilityType === 'power' || item.utilityType === 'electricity') {
            if (item.powerSource) utilityData.powerSource = item.powerSource;
            if (item.powerCapacity) utilityData.powerCapacity = item.powerCapacity;
            if (item.installationCost !== undefined) utilityData.installationCost = item.installationCost;
            if (item.consumptionRate !== undefined) utilityData.consumptionRate = item.consumptionRate;
            if (item.consumptionCost !== undefined) utilityData.consumptionCost = item.consumptionCost;
          }

          // Add structure-specific fields
          if (item.utilityType === 'structure' || item.utilityType === 'building') {
            if (item.structureType) utilityData.structureType = item.structureType;
            if (item.structureCapacity) utilityData.structureCapacity = item.structureCapacity;
            if (item.constructionCost !== undefined) utilityData.constructionCost = item.constructionCost;
          }

          // Add maintenance fields
          if (item.lastMaintenanceDate) utilityData.lastMaintenanceDate = item.lastMaintenanceDate;
          if (item.maintenanceCost !== undefined) utilityData.maintenanceCost = item.maintenanceCost;

          transformedItem.utility = utilityData;
          transformedItem.type = 'utility';
        }

        return transformedItem;
      });

      console.log('Transformed inventory data:', JSON.stringify(transformedData, null, 2));

      const machinery = [];
      const goodsInStock = [];
      const utilities = [];

      transformedData.forEach(item => {
        if (item.machinery && typeof item.machinery === 'object' && item.machinery.equipmentName) {
          machinery.push(item);
        }

        if (item.goodsInStock && typeof item.goodsInStock === 'object' && item.goodsInStock.itemName) {
          goodsInStock.push(item);
        }

        if (item.utility && typeof item.utility === 'object' && item.utility.utilityType) {
          utilities.push(item);
        }
      });

      console.log('Processed inventory counts:', {
        machinery: machinery.length,
        goodsInStock: goodsInStock.length,
        utilities: utilities.length,
        total: transformedData.length
      });

      console.log('Raw inventory data:', JSON.stringify(data, null, 2));  // Check the fetched data
      console.log('Transformed inventory data:', JSON.stringify(transformedData, null, 2));  // Check the transformed data

      const processedData = {
        all: transformedData,
        machinery,
        goodsInStock,
        utilities,
      };

      setInventoryData(processedData);  // Update the state

      setInventoryStats(getInventoryStats(transformedData));
    } catch (error) {
      console.error('Load inventory error:', error);
      Alert.alert('Error', 'Failed to load inventory data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInventoryData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadInventoryData();
  };

  const handleDelete = async (itemId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this inventory item? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleteLoading(true);
            try {
              const { error } = await deleteInventory(itemId);
              if (error) {
                Alert.alert('Error', error);
              } else {
                Alert.alert('Success', 'Inventory item deleted successfully');
                setModalVisible(false);
                setSelectedItem(null);
                loadInventoryData();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete inventory item');
            } finally {
              setDeleteLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleEdit = () => {
    if (selectedItem) {
      setModalVisible(false);
      navigation.navigate('EditInventory', {
        item: selectedItem,
        type: selectedItem.type || activeSection
      });
    }
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const getItemType = (item) => {
    if (item.machinery) return 'machinery';
    if (item.goodsInStock) return 'goodsInStock';
    if (item.utility) return 'utility';
    return 'unknown';
  };

  const StatCard = ({ title, value, subtitle, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const AlertCard = ({ title, count, color, onPress }) => (
    <TouchableOpacity style={[styles.alertCard, { borderColor: color }]} onPress={onPress}>
      <View style={[styles.alertIcon, { backgroundColor: color }]}>
        <FastImage
          source={icons.alert}
          style={styles.alertIconImage}
          resizeMode={FastImage.resizeMode.contain}
        />
      </View>
      <View style={styles.alertContent}>
        <Text style={styles.alertCount}>{count}</Text>
        <Text style={styles.alertTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  const MachineryCard = ({ item, index, gradientColors }) => {
    const machinery = item.machinery;
    const nextServiceDate = new Date(machinery.nextServiceDate);
    const today = new Date();
    const daysUntilService = Math.floor((nextServiceDate - today) / (1000 * 60 * 60 * 24));
    const needsService = daysUntilService <= 14;

    return (
      <LinearGradient
        colors={gradientColors}
        style={styles.equipmentCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <Text style={styles.number}>{index}.</Text>
        <Text style={styles.equipmentTitle}>{machinery.equipmentName}</Text>
        <Text style={styles.equipmentId}>ID: {machinery.equipmentId}</Text>
        <View style={styles.serviceAlert}>
          <Text style={[styles.serviceText, { color: needsService ? '#FF3B30' : 'white' }]}>
            {needsService
              ? `Service due in ${daysUntilService} days`
              : `Next service: ${nextServiceDate.toLocaleDateString()}`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => handleViewDetails(item)}>
          <Text style={styles.detailsButtonText}>Show more details</Text>
        </TouchableOpacity>
        <View style={styles.dotIndicator}>
          <View style={[
            styles.dot,
            { backgroundColor: needsService ? COLORS.red : COLORS.green2 }
          ]} />
        </View>
      </LinearGradient>
    );
  };

  const GoodsCard = ({ item, index, gradientColors }) => {
    const goods = item.goodsInStock;
    const expiryDate = new Date(goods.expirationDate);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
    const nearExpiry = daysUntilExpiry <= 30;

    return (
      <LinearGradient
        colors={gradientColors}
        style={styles.equipmentCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <Text style={styles.number}>{index}.</Text>
        <Text style={styles.equipmentTitle}>{goods.itemName}</Text>
        <Text style={styles.equipmentId}>SKU: {goods.sku}</Text>
        <View style={styles.stockInfo}>
          <Text style={styles.stockText}>
            Quantity: {goods.quantity} - {goods.condition}
          </Text>
          <Text style={[styles.stockText, { color: nearExpiry ? '#FF3B30' : 'white' }]}>
            {nearExpiry
              ? `Expires in ${daysUntilExpiry} days`
              : `Expires: ${expiryDate.toLocaleDateString()}`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => handleViewDetails(item)}>
          <Text style={styles.detailsButtonText}>Show more details</Text>
        </TouchableOpacity>
        <View style={styles.dotIndicator}>
          <View style={[
            styles.dot,
            { backgroundColor: nearExpiry ? COLORS.red : COLORS.green2 }
          ]} />
        </View>
      </LinearGradient>
    );
  };

  const UtilityCard = ({ item, index, gradientColors }) => {
    const utility = item.utility;

    return (
      <LinearGradient
        colors={gradientColors}
        style={styles.utilityCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{utility.utilityType.charAt(0).toUpperCase() + utility.utilityType.slice(1)}</Text>
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{new Date(utility.entryDate).toLocaleDateString()}</Text>
            <FastImage
              source={icons.calendar}
              style={styles.icon}
              resizeMode={FastImage.resizeMode.contain}
            />
          </View>
        </View>

        {utility.utilityType === 'water' && (
          <>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Water Level</Text>
              <Text style={styles.fieldValue}>{utility.waterLevel}L</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Source</Text>
              <Text style={styles.fieldValue}>{utility.waterSource}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Storage</Text>
              <Text style={styles.fieldValue}>{utility.waterStorage}L</Text>
            </View>
          </>
        )}

        {utility.utilityType !== 'water' && (
          <>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Power Source</Text>
              <Text style={styles.fieldValue}>{utility.powerSource}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Capacity</Text>
              <Text style={styles.fieldValue}>{utility.powerCapacity}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Condition</Text>
              <Text style={styles.fieldValue}>{utility.facilityCondition}</Text>
            </View>
          </>
        )}

        <TouchableOpacity
          style={styles.utilityDetailsButton}
          onPress={() => handleViewDetails(item)}>
          <Text style={styles.detailsButtonText}>Show more details</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  };

  const AllItemsCard = ({ item, index }) => {
    const itemType = getItemType(item);
    const gradientColors = index % 3 === 0 ? ['#DBAFA4', '#755D58'] : index % 3 === 1 ? ['#8CD18C', '#486B48'] : ['#D1D6A1', '#6D7054'];

    if (itemType === 'machinery') {
      return <MachineryCard item={item} index={index + 1} gradientColors={gradientColors} />;
    } else if (itemType === 'goodsInStock') {
      return <GoodsCard item={item} index={index + 1} gradientColors={gradientColors} />;
    } else if (itemType === 'utility') {
      return <UtilityCard item={item} index={index + 1} gradientColors={gradientColors} />;
    }
    return null;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.green2} />
          <Text style={styles.loadingText}>Loading inventory...</Text>
        </View>
      );
    }

    const currentData = inventoryData[activeSection] || [];

    if (currentData.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {activeSection === 'all' ? 'No inventory items added yet' :
              activeSection === 'machinery' ? 'No machinery added yet' :
                activeSection === 'goodsInStock' ? 'No goods in stock added yet' :
                  'No utilities added yet'}
          </Text>
          <TouchableOpacity
            style={styles.addFirstButton}
            onPress={() => navigation.navigate('AddInventory', { type: activeSection === 'all' ? 'machinery' : activeSection })}
          >

            <Text style={styles.addFirstButtonText}>Add Your First {
              activeSection === 'all' ? 'Inventory Item' :
                activeSection === 'machinery' ? 'Machinery' :
                  activeSection === 'goodsInStock' ? 'Goods Item' :
                    'Utility'
            }</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.green2]}
          />
        }
      >
        {currentData.map((item, index) => {
          if (activeSection === 'all') {
            return <AllItemsCard key={item.id} item={item} index={index} />;
          } else if (activeSection === 'machinery') {
            const gradientColors = index % 3 === 0 ? ['#DBAFA4', '#755D58'] : index % 3 === 1 ? ['#8CD18C', '#486B48'] : ['#D1D6A1', '#6D7054'];
            return <MachineryCard key={item.id} item={item} index={index + 1} gradientColors={gradientColors} />;
          } else if (activeSection === 'goodsInStock') {
            const gradientColors = index % 3 === 0 ? ['#DBAFA4', '#755D58'] : index % 3 === 1 ? ['#8CD18C', '#486B48'] : ['#D1D6A1', '#6D7054'];
            return <GoodsCard key={item.id} item={item} index={index + 1} gradientColors={gradientColors} />;
          } else if (activeSection === 'utilities') {
            const gradientColors = index % 3 === 0 ? ['#DBAFA4', '#755D58'] : index % 3 === 1 ? ['#8CD18C', '#486B48'] : ['#D1D6A1', '#6D7054'];
            return <UtilityCard key={item.id} item={item} index={index + 1} gradientColors={gradientColors} />;
          }
          return null;
        })}
      </ScrollView>
    );
  };

  const renderDetailModal = () => {
    if (!selectedItem) return null;

    const itemType = getItemType(selectedItem);
    let itemData = null;
    let title = '';

    if (itemType === 'machinery') {
      itemData = selectedItem.machinery;
      title = itemData.equipmentName;
    } else if (itemType === 'goodsInStock') {
      itemData = selectedItem.goodsInStock;
      title = itemData.itemName;
    } else if (itemType === 'utility') {
      itemData = selectedItem.utility;
      title = itemData.utilityType?.charAt(0).toUpperCase() + itemData.utilityType?.slice(1);
    }

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {itemType === 'machinery' && (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Equipment ID:</Text>
                    <Text style={styles.detailValue}>{itemData.equipmentId}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Purchase Date:</Text>
                    <Text style={styles.detailValue}>{new Date(itemData.purchaseDate).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Current Location:</Text>
                    <Text style={styles.detailValue}>{itemData.currentLocation}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Condition:</Text>
                    <Text style={styles.detailValue}>{itemData.condition}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Last Service:</Text>
                    <Text style={styles.detailValue}>{new Date(itemData.lastServiceDate).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Next Service:</Text>
                    <Text style={styles.detailValue}>{new Date(itemData.nextServiceDate).toLocaleDateString()}</Text>
                  </View>
                </>
              )}

              {itemType === 'goodsInStock' && (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>SKU:</Text>
                    <Text style={styles.detailValue}>{itemData.sku}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Quantity:</Text>
                    <Text style={styles.detailValue}>{itemData.quantity}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Current Location:</Text>
                    <Text style={styles.detailValue}>{itemData.currentLocation}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Condition:</Text>
                    <Text style={styles.detailValue}>{itemData.condition}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Expiration Date:</Text>
                    <Text style={styles.detailValue}>{new Date(itemData.expirationDate).toLocaleDateString()}</Text>
                  </View>
                </>
              )}

              {itemType === 'utility' && (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Utility Type:</Text>
                    <Text style={styles.detailValue}>{itemData.utilityType}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Entry Date:</Text>
                    <Text style={styles.detailValue}>{new Date(itemData.entryDate).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Facility Condition:</Text>
                    <Text style={styles.detailValue}>{itemData.facilityCondition}</Text>
                  </View>

                  {itemData.utilityType === 'water' && (
                    <>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Water Level:</Text>
                        <Text style={styles.detailValue}>{itemData.waterLevel}L</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Water Source:</Text>
                        <Text style={styles.detailValue}>{itemData.waterSource}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Water Storage:</Text>
                        <Text style={styles.detailValue}>{itemData.waterStorage}L</Text>
                      </View>
                    </>
                  )}

                  {(itemData.utilityType === 'power' || itemData.utilityType === 'electricity') && (
                    <>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Power Source:</Text>
                        <Text style={styles.detailValue}>{itemData.powerSource}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Power Capacity:</Text>
                        <Text style={styles.detailValue}>{itemData.powerCapacity}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Installation Cost:</Text>
                        <Text style={styles.detailValue}>${itemData.installationCost}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Consumption Rate:</Text>
                        <Text style={styles.detailValue}>{itemData.consumptionRate}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Consumption Cost:</Text>
                        <Text style={styles.detailValue}>${itemData.consumptionCost}</Text>
                      </View>
                    </>
                  )}

                  {(itemData.utilityType === 'structure' || itemData.utilityType === 'building') && (
                    <>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Structure Type:</Text>
                        <Text style={styles.detailValue}>{itemData.structureType}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Structure Capacity:</Text>
                        <Text style={styles.detailValue}>{itemData.structureCapacity}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Construction Cost:</Text>
                        <Text style={styles.detailValue}>${itemData.constructionCost}</Text>
                      </View>
                    </>
                  )}

                  {itemData.lastMaintenanceDate && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Last Maintenance:</Text>
                      <Text style={styles.detailValue}>{new Date(itemData.lastMaintenanceDate).toLocaleDateString()}</Text>
                    </View>
                  )}

                  {itemData.maintenanceCost && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Maintenance Cost:</Text>
                      <Text style={styles.detailValue}>${itemData.maintenanceCost}</Text>
                    </View>
                  )}
                </>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={handleEdit}
              >
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDelete(selectedItem.id)}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.actionButtonText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <SecondaryHeader title="Inventory" />

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <StatCard
          title="Total Items"
          value={inventoryStats.total}
          color={COLORS.green2}
        />
        <StatCard
          title="Machinery"
          value={inventoryStats.machinery}
          color={COLORS.blue}
        />
        <StatCard
          title="Goods"
          value={inventoryStats.goodsInStock}
          color={COLORS.orange}
        />
        <StatCard
          title="Utilities"
          value={inventoryStats.utilities}
          color={COLORS.purple}
        />
      </View>

      {/* Alert Cards */}
      {(inventoryStats.alerts.servicesDue > 0 || inventoryStats.alerts.expiringSoon > 0) && (
        <View style={styles.alertsContainer}>
          {inventoryStats.alerts.servicesDue > 0 && (
            <AlertCard
              title="Services Due"
              count={inventoryStats.alerts.servicesDue}
              color={COLORS.red}
              onPress={() => setActiveSection('machinery')}
            />
          )}
          {inventoryStats.alerts.expiringSoon > 0 && (
            <AlertCard
              title="Expiring Soon"
              count={inventoryStats.alerts.expiringSoon}
              color={COLORS.orange}
              onPress={() => setActiveSection('goodsInStock')}
            />
          )}
        </View>
      )}

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {['all', 'machinery', 'goodsInStock', 'utilities'].map((section) => (
          <TouchableOpacity
            key={section}
            style={[
              styles.filterTab,
              activeSection === section && styles.activeFilterTab
            ]}
            onPress={() => setActiveSection(section)}
          >
            <Text style={[
              styles.filterTabText,
              activeSection === section && styles.activeFilterTabText
            ]}>
              {section === 'all' ? 'All' :
                section === 'machinery' ? 'Machinery' :
                  section === 'goodsInStock' ? 'Goods' :
                    'Utilities'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {renderContent()}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddInventory', { type: activeSection === 'all' ? 'machinery' : activeSection })}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Detail Modal */}
      {renderDetailModal()}
    </View>
  );
}

// Styles (add these to your existing styles)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexWrap: 'wrap',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    minWidth: '23%',
    alignItems: 'center',
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  alertsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  alertCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertIconImage: {
    width: 20,
    height: 20,
    tintColor: 'white',
  },
  alertContent: {
    flex: 1,
  },
  alertCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  alertTitle: {
    fontSize: 12,
    color: '#666',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  activeFilterTab: {
    backgroundColor: COLORS.green2,
  },
  filterTabText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterTabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  addFirstButton: {
    backgroundColor: COLORS.green2,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Add your existing equipment card styles here
  equipmentCard: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  utilityCard: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  number: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  equipmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  equipmentId: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  serviceAlert: {
    marginBottom: 12,
  },
  serviceText: {
    fontSize: 14,
    fontWeight: '500',
  },
  stockInfo: {
    marginBottom: 12,
  },
  stockText: {
    fontSize: 14,
    color: 'white',
    marginBottom: 2,
  },
  detailsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  utilityDetailsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  detailsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  dotIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginRight: 8,
  },
  icon: {
    width: 16,
    height: 16,
    tintColor: 'rgba(255, 255, 255, 0.8)',
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  fieldValue: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.green2,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  modalBody: {
    maxHeight: 400,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '400',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: COLORS.green2,
  },
  deleteButton: {
    backgroundColor: COLORS.red,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});