import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Dimensions,
  RefreshControl,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import { icons } from '../../constants';
import { COLORS } from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';
import {
  getFarmInventory,
  getInventoryCounts,
  deleteGoodsInStock,
  deleteMachinery,
  deleteUtility
} from '../../services/inventoryService';

const { width } = Dimensions.get('window');

const InventoryDashboard = ({ navigation }) => {
  const [inventoryData, setInventoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name'); // name, date, condition
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const categories = [
    { id: 'all', name: 'All Items', icon: 'list', count: 0 },
    { id: 'goodsInStock', name: 'Goods in Stock', icon: 'package', count: 0 },
    { id: 'machinery', name: 'Machinery', icon: 'settings', count: 0 },
    { id: 'utility', name: 'Utilities', icon: 'power', count: 0 },
  ];

  const [categoriesWithCounts, setCategoriesWithCounts] = useState(categories);

  const loadInventoryData = async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    try {
      const result = await getFarmInventory();
      if (result.error) {
        Alert.alert('Error', result.error);
        return;
      }

      const inventory = result.data || [];
      setInventoryData(inventory);

      const counts = getInventoryCounts(inventory);
      const updatedCategories = categories.map(cat => {
        if (cat.id === 'all') return { ...cat, count: counts.total };
        if (cat.id === 'goodsInStock') return { ...cat, count: counts.goodsInStock };
        if (cat.id === 'machinery') return { ...cat, count: counts.machinery };
        if (cat.id === 'utility') return { ...cat, count: counts.utilities };
        return cat;
      });

      setCategoriesWithCounts(updatedCategories);
    } catch (error) {
      console.error('Error loading inventory:', error);
      Alert.alert('Error', 'Failed to load inventory data');
    } finally {
      if (showLoader) setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const filterAndSearchData = useCallback(() => {
    let filtered = [...inventoryData];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.type === selectedCategory);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item => {
        const searchFields = [
          item.itemName,
          item.equipmentName,
          item.utilityType,
          item.sku,
          item.equipmentId,
          item.currentLocation,
          item.condition,
          item.waterSource,
          item.powerSource,
          item.structureType
        ].filter(Boolean);

        return searchFields.some(field =>
          field.toString().toLowerCase().includes(query)
        );
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.itemName || a.equipmentName || a.utilityType || '';
          bValue = b.itemName || b.equipmentName || b.utilityType || '';
          break;
        case 'date':
          aValue = new Date(a.createdAt || a.purchaseDate || a.entryDate || 0);
          bValue = new Date(b.createdAt || b.purchaseDate || b.entryDate || 0);
          break;
        case 'condition':
          aValue = a.condition || a.facilityCondition || '';
          bValue = b.condition || b.facilityCondition || '';
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredData(filtered);
  }, [inventoryData, selectedCategory, searchQuery, sortBy, sortOrder]);

  // Effects
  useEffect(() => {
    loadInventoryData();
  }, []);

  useEffect(() => {
    filterAndSearchData();
  }, [filterAndSearchData]);

  // Handlers
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadInventoryData(false);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setShowFilters(false);
  };

  const handleItemPress = (item) => {
    navigation.navigate('InventoryDetails', { item });
  };

  const handleEditItem = (item) => {
    navigation.navigate('EditInventoryItem', { item });
  };

  const handleDeleteItem = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      let result;
      switch (itemToDelete.type) {
        case 'goodsInStock':
          result = await deleteGoodsInStock(itemToDelete.id);
          break;
        case 'machinery':
          result = await deleteMachinery(itemToDelete.id);
          break;
        case 'utility':
          result = await deleteUtility(itemToDelete.id);
          break;
        default:
          Alert.alert('Error', 'Unknown item type');
          return;
      }

      if (result.error) {
        Alert.alert('Error', result.error);
      } else {
        Alert.alert('Success', 'Item deleted successfully');
        loadInventoryData(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete item');
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <FastImage source={icons.search} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search inventory..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
        {searchQuery ? (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}>
            <Text style={styles.clearButtonText}>×</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowFilters(true)}>
        <FastImage source={icons.filter || icons.settings} style={styles.filterIcon} />
      </TouchableOpacity>
    </View>
  );

  const renderCategoryTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryTabs}
      contentContainerStyle={styles.categoryTabsContent}>
      {categoriesWithCounts.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryTab,
            selectedCategory === category.id && styles.categoryTabActive
          ]}
          onPress={() => handleCategorySelect(category.id)}>
          <View style={styles.categoryTabContent}>
            <FastImage
              source={icons[category.icon] || icons.list}
              style={[
                styles.categoryTabIcon,
                selectedCategory === category.id && styles.categoryTabIconActive
              ]}
            />
            <Text style={[
              styles.categoryTabText,
              selectedCategory === category.id && styles.categoryTabTextActive
            ]}>
              {category.name}
            </Text>
            <View style={[
              styles.categoryTabBadge,
              selectedCategory === category.id && styles.categoryTabBadgeActive
            ]}>
              <Text style={[
                styles.categoryTabBadgeText,
                selectedCategory === category.id && styles.categoryTabBadgeTextActive
              ]}>
                {category.count}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderInventoryItem = ({ item, index }) => {
    const getItemName = () => {
      return item.itemName || item.equipmentName || item.utilityType || 'Unknown Item';
    };

    const getItemDetails = () => {
      switch (item.type) {
        case 'goodsInStock':
          return `SKU: ${item.sku} • Qty: ${item.quantity}`;
        case 'machinery':
          return `ID: ${item.equipmentId} • ${item.currentLocation}`;
        case 'utility':
          return `${item.waterSource || item.powerSource || item.structureType}`;
        default:
          return 'No details available';
      }
    };

    const getItemIcon = () => {
      switch (item.type) {
        case 'goodsInStock':
          return icons.package;
        case 'machinery':
          return icons.settings;
        case 'utility':
          return icons.power;
        default:
          return icons.list;
      }
    };

    const getConditionColor = () => {
      const condition = item.condition || item.facilityCondition || '';
      switch (condition.toLowerCase()) {
        case 'excellent':
        case 'new':
          return '#22C55E';
        case 'good':
          return COLORS.green3 || '#10B981';
        case 'fair':
        case 'average':
          return '#F59E0B';
        case 'poor':
          return '#F97316';
        case 'needs repair':
        case 'bad':
        case 'critical':
          return '#EF4444';
        default:
          return COLORS.green3 || '#10B981';
      }
    };

    const getConditionBackgroundColor = () => {
      const condition = item.condition || item.facilityCondition || '';
      switch (condition.toLowerCase()) {
        case 'excellent':
        case 'new':
          return 'rgba(34, 197, 94, 0.1)';
        case 'good':
          return 'rgba(16, 185, 129, 0.1)';
        case 'fair':
        case 'average':
          return 'rgba(245, 158, 11, 0.1)';
        case 'poor':
          return 'rgba(249, 115, 22, 0.1)';
        case 'needs repair':
        case 'bad':
        case 'critical':
          return 'rgba(239, 68, 68, 0.1)';
        default:
          return 'rgba(16, 185, 129, 0.1)';
      }
    };

    const getTypeDisplayName = () => {
      switch (item.type) {
        case 'goodsInStock':
          return 'Goods in Stock';
        case 'machinery':
          return 'Machinery';
        case 'utility':
          return 'Utility';
        default:
          return 'Item';
      }
    };

    const formatCurrency = (amount) => {
      return amount ? `KES ${parseFloat(amount).toLocaleString()}` : 'N/A';
    };

    const formatDate = (dateString) => {
      return dateString ? new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : 'N/A';
    };

    return (
      <View style={styles.inventoryCard}>
        <LinearGradient
          colors={['#F0FDF4', '#FFFFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}>
          <View style={[styles.statusBadge, { backgroundColor: getConditionBackgroundColor() }]}>
            <View style={[styles.statusDot, { backgroundColor: getConditionColor() }]} />
            <Text style={[styles.statusText, { color: getConditionColor() }]}>{getTypeDisplayName()}</Text>
          </View>

          {/* Card Content */}
          <View style={styles.cardContent}>
            {/* Header with item info and date */}
            <View style={styles.cardHeader}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {getItemName()}
                </Text>
                <Text style={styles.itemDetails} numberOfLines={1}>
                  {getItemDetails()}
                </Text>
              </View>
              <View style={styles.dateContainer}>
                <FastImage
                  source={icons.calendar}
                  style={styles.calendarIcon}
                  tintColor={COLORS.green3}
                />
                <Text style={styles.dateText}>
                  {formatDate(item.createdAt || item.purchaseDate || item.entryDate)}
                </Text>
              </View>
            </View>

            <View style={styles.itemSection}>
              <View style={styles.itemIconContainer}>
                <LinearGradient
                  colors={[COLORS.green3 || '#10B981', '#059669']}
                  style={styles.itemIconGradient}>
                  <FastImage
                    source={getItemIcon()}
                    style={styles.itemIconImage}
                    tintColor="#FFFFFF"
                  />
                </LinearGradient>
              </View>
              <View style={styles.itemMetaInfo}>
                <Text style={styles.itemType}>{getTypeDisplayName()}</Text>
                <Text style={styles.itemCategory}>
                  {item.type === 'goodsInStock' && item.category ||
                    item.type === 'machinery' && item.equipmentType ||
                    item.type === 'utility' && item.utilityType ||
                    'General'}
                </Text>
              </View>
            </View>

            <View style={styles.quickInfoRow}>
              <View style={styles.quickInfoItem}>
                <View style={[styles.infoIconContainer, { backgroundColor: getConditionBackgroundColor() }]}>
                  <FastImage
                    source={icons.check || icons.status}
                    style={styles.infoIcon}
                    tintColor={getConditionColor()}
                  />
                </View>
                <Text style={styles.quickInfoLabel}>Condition</Text>
                <Text style={[styles.quickInfoValue, { color: getConditionColor() }]}>
                  {item.condition || item.facilityCondition || 'Good'}
                </Text>
              </View>

              {/* Quantity/Location */}
              <View style={styles.quickInfoItem}>
                <View style={styles.infoIconContainer}>
                  <FastImage
                    source={icons.location || icons.map}
                    style={styles.infoIcon}
                    tintColor={COLORS.green3}
                  />
                </View>
                <Text style={styles.quickInfoLabel}>
                  {item.type === 'goodsInStock' ? 'Quantity' : 'Location'}
                </Text>
                <Text style={styles.quickInfoValue}>
                  {item.type === 'goodsInStock' ? item.quantity :
                    item.currentLocation || 'Farm'}
                </Text>
              </View>

              {(item.purchasePrice || item.value || item.cost) && (
                <View style={styles.quickInfoItem}>
                  <View style={styles.infoIconContainer}>
                    <FastImage
                      source={icons.dollar || icons.money}
                      style={styles.infoIcon}
                      tintColor={COLORS.green3}
                    />
                  </View>
                  <Text style={styles.quickInfoLabel}>Value</Text>
                  <Text style={styles.costValue}>
                    {formatCurrency(item.purchasePrice || item.value || item.cost)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.viewButton]}
              onPress={() => handleItemPress(item)}
              activeOpacity={0.8}>
              <FastImage
                source={icons.eye || icons.view}
                style={styles.actionIcon}
                tintColor="#3B82F6"
              />
              <Text style={[styles.actionButtonText, styles.viewButtonText]}>
                View Details
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => handleEditItem(item)}
              activeOpacity={0.8}>
              <FastImage
                source={icons.edit}
                style={styles.actionIcon}
                tintColor={COLORS.green3}
              />
              <Text style={[styles.actionButtonText, styles.editButtonText]}>
                Edit
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteItem(item)}
              activeOpacity={0.8}>
              <FastImage
                source={icons.trash}
                style={styles.actionIcon}
                tintColor="#EF4444"
              />
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>

          {(item.expirationDate || item.nextServiceDate || item.waterLevel) && (
            <View style={styles.additionalInfoSection}>
              <View style={styles.additionalInfoBorder} />
              <View style={styles.additionalInfoContent}>
                {item.type === 'goodsInStock' && item.expirationDate && (
                  <View style={styles.additionalInfoItem}>
                    <FastImage
                      source={icons.calendar}
                      style={styles.additionalInfoIcon}
                      tintColor="#F59E0B"
                    />
                    <Text style={styles.additionalInfoText}>
                      Expires: {formatDate(item.expirationDate)}
                    </Text>
                  </View>
                )}
                {item.type === 'machinery' && item.nextServiceDate && (
                  <View style={styles.additionalInfoItem}>
                    <FastImage
                      source={icons.tool || icons.settings}
                      style={styles.additionalInfoIcon}
                      tintColor="#3B82F6"
                    />
                    <Text style={styles.additionalInfoText}>
                      Next Service: {formatDate(item.nextServiceDate)}
                    </Text>
                  </View>
                )}
                {item.type === 'utility' && item.waterLevel && (
                  <View style={styles.additionalInfoItem}>
                    <FastImage
                      source={icons.droplet || icons.water}
                      style={styles.additionalInfoIcon}
                      tintColor="#06B6D4"
                    />
                    <Text style={styles.additionalInfoText}>
                      Water Level: {item.waterLevel}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </LinearGradient>
      </View>
    );
  };

  const renderDeleteModal = () => (
    <Modal
      visible={showDeleteModal}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowDeleteModal(false)}>
      <View style={styles.deleteModalOverlay}>
        <View style={styles.deleteModalContainer}>
          <LinearGradient
            colors={['#FFFFFF', '#FEF2F2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.deleteModalCard}>

            <View style={styles.deleteModalIconContainer}>
              <LinearGradient
                colors={['#FEE2E2', '#FECACA']}
                style={styles.deleteModalIconGradient}>
                <FastImage
                  source={icons.trash}
                  style={styles.deleteModalIcon}
                  tintColor="#EF4444"
                />
              </LinearGradient>
            </View>

            {/* Title and Message */}
            <Text style={styles.deleteModalTitle}>Delete Item</Text>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to delete "{itemToDelete?.itemName || itemToDelete?.equipmentName || itemToDelete?.utilityType || 'this item'}"?
            </Text>
            <Text style={styles.deleteModalSubMessage}>
              This action cannot be undone.
            </Text>

            {itemToDelete && (
              <View style={styles.deleteModalItemCard}>
                <View style={styles.deleteModalItemInfo}>
                  <Text style={styles.deleteModalItemName}>
                    {itemToDelete.itemName || itemToDelete.equipmentName || itemToDelete.utilityType}
                  </Text>
                  <Text style={styles.deleteModalItemType}>
                    {itemToDelete.type === 'goodsInStock' ? 'Goods in Stock' :
                      itemToDelete.type === 'machinery' ? 'Machinery' : 'Utility'}
                  </Text>
                </View>
                <View style={styles.deleteModalItemBadge}>
                  <Text style={styles.deleteModalItemBadgeText}>
                    {itemToDelete.condition || itemToDelete.facilityCondition || 'Good'}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={styles.deleteModalCancelButton}
                onPress={() => setShowDeleteModal(false)}
                activeOpacity={0.8}>
                <Text style={styles.deleteModalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteModalConfirmButton}
                onPress={confirmDelete}
                activeOpacity={0.8}>
                <LinearGradient
                  colors={['#EF4444', '#DC2626']}
                  style={styles.deleteModalConfirmGradient}>
                  <FastImage
                    source={icons.trash}
                    style={styles.deleteModalConfirmIcon}
                    tintColor="#FFFFFF"
                  />
                  <Text style={styles.deleteModalConfirmText}>Delete</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.filterModal}>
          <View style={styles.filterModalHeader}>
            <Text style={styles.filterModalTitle}>Filter & Sort</Text>
            <TouchableOpacity
              onPress={() => setShowFilters(false)}
              style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterContent}>
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Sort By</Text>
              {[
                { id: 'name', name: 'Name' },
                { id: 'date', name: 'Date' },
                { id: 'condition', name: 'Condition' }
              ].map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.filterOption,
                    sortBy === option.id && styles.filterOptionSelected
                  ]}
                  onPress={() => setSortBy(option.id)}>
                  <Text style={[
                    styles.filterOptionText,
                    sortBy === option.id && styles.filterOptionTextSelected
                  ]}>
                    {option.name}
                  </Text>
                  {sortBy === option.id && (
                    <FastImage
                      source={icons.check}
                      style={styles.checkIcon}
                      tintColor={COLORS.green3}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Sort Order */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Sort Order</Text>
              {[
                { id: 'asc', name: 'Ascending' },
                { id: 'desc', name: 'Descending' }
              ].map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.filterOption,
                    sortOrder === option.id && styles.filterOptionSelected
                  ]}
                  onPress={() => setSortOrder(option.id)}>
                  <Text style={[
                    styles.filterOptionText,
                    sortOrder === option.id && styles.filterOptionTextSelected
                  ]}>
                    {option.name}
                  </Text>
                  {sortOrder === option.id && (
                    <FastImage
                      source={icons.check}
                      style={styles.checkIcon}
                      tintColor={COLORS.green3}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Reset Filters */}
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSortBy('name');
                setSortOrder('asc');
                setShowFilters(false);
              }}>
              <Text style={styles.resetButtonText}>Reset All Filters</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <FastImage
        source={icons.package}
        style={styles.emptyStateIcon}
        tintColor="#9CA3AF"
      />
      <Text style={styles.emptyStateTitle}>No Inventory Items</Text>
      <Text style={styles.emptyStateMessage}>
        {searchQuery || selectedCategory !== 'all'
          ? 'No items match your current filters'
          : 'Start by adding your first inventory item'
        }
      </Text>
      {!searchQuery && selectedCategory === 'all' && (
        <TouchableOpacity
          style={styles.addFirstItemButton}
          onPress={() => navigation.navigate('AddInventory')}>
          <Text style={styles.addFirstItemButtonText}>Add First Item</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <SecondaryHeader
          title="Inventory Management"
          showBack={true}
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.green3} />
          <Text style={styles.loadingText}>Loading inventory...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader
        title="Inventory Management"
        showBack={true}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        {renderSearchBar()}
        {renderCategoryTabs()}

        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredData.length} item{filteredData.length !== 1 ? 's' : ''} found
          </Text>
        </View>

        <FlatList
          data={filteredData}
          renderItem={renderInventoryItem}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.green3]}
              tintColor={COLORS.green3}
            />
          }
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={[
            styles.listContainer,
            filteredData.length === 0 && styles.emptyListContainer
          ]}
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        />
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddInventory')}>
        <FastImage
          source={icons.plus || icons.add}
          style={styles.fabIcon}
          tintColor={COLORS.white}
        />
      </TouchableOpacity>

      {renderFilterModal()}
      {renderDeleteModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: '#9CA3AF',
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    paddingVertical: 14,
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  filterIcon: {
    width: 20,
    height: 20,
    tintColor: '#6B7280',
  },

  // Category Tabs
  categoryTabs: {
    marginBottom: 16,
  },
  categoryTabsContent: {
    paddingRight: 20,
  },
  categoryTab: {
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryTabActive: {
    backgroundColor: '#F0FDF4',
    borderColor: COLORS.green3,
  },
  categoryTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryTabIcon: {
    width: 18,
    height: 18,
    tintColor: '#6B7280',
  },
  categoryTabIconActive: {
    tintColor: COLORS.green3,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  categoryTabTextActive: {
    color: COLORS.green3,
  },
  categoryTabBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 22,
    alignItems: 'center',
  },
  categoryTabBadgeActive: {
    backgroundColor: COLORS.green3,
  },
  categoryTabBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  categoryTabBadgeTextActive: {
    color: '#FFFFFF',
  },

  // Results Header
  resultsHeader: {
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },

  // List
  listContainer: {
    paddingBottom: 100, // Extra space for FAB
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  itemSeparator: {
    height: 12,
  },

  inventoryCard: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 16,
  },

  // Status Badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '600',
  },

  // Card Content
  cardContent: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  calendarIcon: {
    width: 14,
    height: 14,
    marginRight: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },

  // Enhanced Item Section
  itemSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  itemIconContainer: {
    marginRight: 12,
  },
  itemIconGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemIconImage: {
    width: 18,
    height: 18,
  },
  itemMetaInfo: {
    flex: 1,
  },
  itemType: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Enhanced Quick Info Row
  quickInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickInfoItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoIcon: {
    width: 16,
    height: 16,
  },
  quickInfoLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
    marginBottom: 2,
    textAlign: 'center',
  },
  quickInfoValue: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '700',
    textAlign: 'center',
  },
  costValue: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '800',
    textAlign: 'center',
  },

  // Action Buttons
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  viewButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  editButton: {
    backgroundColor: `rgba(${COLORS.green3 ? '16, 185, 129' : '5, 150, 105'}, 0.08)`,
    borderColor: `rgba(${COLORS.green3 ? '16, 185, 129' : '5, 150, 105'}, 0.3)`,
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  actionIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  viewButtonText: {
    color: '#3B82F6',
  },
  editButtonText: {
    color: COLORS.green3 || '#059669',
  },
  deleteButtonText: {
    color: '#EF4444',
  },

  // Additional Info Section
  additionalInfoSection: {
    marginTop: 8,
  },
  additionalInfoBorder: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },
  additionalInfoContent: {
    gap: 8,
  },
  additionalInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  additionalInfoIcon: {
    width: 14,
    height: 14,
    marginRight: 8,
  },
  additionalInfoText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    flex: 1,
  },

  // Delete Modal
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  deleteModalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  deleteModalCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  deleteModalIconContainer: {
    marginBottom: 20,
  },
  deleteModalIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalIcon: {
    width: 36,
    height: 36,
  },
  deleteModalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  deleteModalMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 4,
  },
  deleteModalSubMessage: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 20,
  },
  deleteModalItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  deleteModalItemInfo: {
    flex: 1,
  },
  deleteModalItemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  deleteModalItemType: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  deleteModalItemBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  deleteModalItemBadgeText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  deleteModalCancelButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  deleteModalCancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  deleteModalConfirmButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  deleteModalConfirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  deleteModalConfirmIcon: {
    width: 16,
    height: 16,
  },
  deleteModalConfirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.green3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.green3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  fabIcon: {
    width: 24,
    height: 24,
  },

  // Filter Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    minHeight: '50%',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: '600',
  },
  filterContent: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterOptionSelected: {
    backgroundColor: '#F0FDF4',
    borderColor: COLORS.green3,
  },
  filterOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  filterOptionTextSelected: {
    color: COLORS.green3,
  },
  checkIcon: {
    width: 20,
    height: 20,
  },
  resetButton: {
    marginTop: 20,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  addFirstItemButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    backgroundColor: COLORS.green3,
    shadowColor: COLORS.green3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  addFirstItemButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default InventoryDashboard;