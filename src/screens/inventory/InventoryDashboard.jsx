import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {Box, HStack} from 'native-base';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import SecondaryHeader from '../../components/headers/secondary-header';
import {icons} from '../../constants';
import {useNavigation} from '@react-navigation/native';

export default function InventoryDashboard() {
  const navigation = useNavigation();
  const [activeSection, setActiveSection] = useState('machinery');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const TabButton = ({title, isActive, onPress}) => (
    <TouchableOpacity
      style={[styles.tab, isActive && styles.activeTab]}
      onPress={onPress}>
      <Text
        style={[styles.tabText, isActive && styles.activeTabText]}
        numberOfLines={1}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const EquipmentCard = ({index, gradientColors}) => (
    <LinearGradient
      colors={gradientColors}
      style={styles.equipmentCard}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}>
      <Text style={styles.number}>{index}.</Text>
      <Text style={styles.equipmentTitle}>Equipment Name</Text>
      <Text style={styles.equipmentId}>Equipment ID or Serial Number</Text>
      <TouchableOpacity
        style={styles.detailsButton}
        onPress={() => {
          setSelectedItem({
            name: 'Tractor',
            breedingType: 'Cross-breeding',
            id: 'hefdoholediknkened',
            purchaseDate: '19/07/2023',
            location: 'Siaya',
            condition: 'New',
            dam: 'RT5490',
            lastServiceDate: '19/07/2023',
            nextServiceDate: '19/07/2023',
          });
          setModalVisible(true);
        }}>
        <Text style={styles.detailsButtonText}>Show more details</Text>
      </TouchableOpacity>
      <View style={styles.dotIndicator}>
        <View style={styles.dot} />
      </View>
    </LinearGradient>
  );

  const GoodsCard = ({index, gradientColors}) => (
    <LinearGradient
      colors={gradientColors}
      style={styles.equipmentCard}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}>
      <Text style={styles.number}>{index}.</Text>
      <Text style={styles.equipmentTitle}>Item Name</Text>
      <Text style={styles.equipmentId}>
        Type (Organic, Inorganic, Hybrid, etc.)
      </Text>
      <TouchableOpacity
        style={styles.detailsButton}
        onPress={() => {
          setSelectedItem({
            name: 'Organic Fertilizer',
            type: 'Organic',
            batchNumber: 'OF-2025-001',
            supplier: 'AgriFarms Ltd.',
            quantity: '500 kg',
            purchaseDate: '15/01/2025',
            expiryDate: '15/01/2026',
            storageLocation: 'Warehouse A',
            status: 'In Stock',
          });
          setModalVisible(true);
        }}>
        <Text style={styles.detailsButtonText}>Show more details</Text>
      </TouchableOpacity>
      <View style={styles.dotIndicator}>
        <View style={styles.dot} />
      </View>
    </LinearGradient>
  );

  const UtilityCard = ({title, date, fields, gradientColors}) => (
    <LinearGradient
      colors={gradientColors}
      style={styles.utilityCard}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{date}</Text>
          <FastImage
            source={icons.calendar}
            style={styles.icon}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>
      </View>
      {fields.map((field, index) => (
        <View key={index} style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>{field.label}</Text>
          <Text style={styles.fieldValue}>{field.value}</Text>
        </View>
      ))}
    </LinearGradient>
  );

  const renderContent = () => {
    if (activeSection === 'machinery') {
      return (
        <View style={styles.contentContainer}>
          <EquipmentCard index={1} gradientColors={['#DBAFA4', '#755D58']} />
          <EquipmentCard index={2} gradientColors={['#8CD18C', '#486B48']} />
          <EquipmentCard index={3} gradientColors={['#D1D6A1', '#6D7054']} />
        </View>
      );
    } else if (activeSection === 'goods') {
      return (
        <View style={styles.contentContainer}>
          <GoodsCard index={1} gradientColors={['#DBAFA4', '#755D58']} />
          <GoodsCard index={2} gradientColors={['#8CD18C', '#486B48']} />
          <GoodsCard index={3} gradientColors={['#D1D6A1', '#6D7054']} />
        </View>
      );
    } else if (activeSection === 'utilities') {
      return (
        <View style={styles.contentContainer}>
          <UtilityCard
            title="Water Supply"
            date="1st/Jan/2025"
            gradientColors={['#DBAFA4', '#755D58']}
            fields={[
              {label: 'Current Water Level (Liters)', value: '3000Lit'},
              {label: 'Water Source', value: 'Borehole'},
              {label: 'Water Storage Capacity', value: 'Tanks'},
            ]}
          />
          <UtilityCard
            title="Power Supply"
            date="1st/Jan/2025"
            gradientColors={['#8CD18C', '#486B48']}
            fields={[
              {label: 'Power Source', value: 'Generator'},
              {label: 'Generator Fuel Stock (Liters)', value: '40Lit'},
            ]}
          />
          <UtilityCard
            title="Facility"
            date="1st/Jan/2025"
            gradientColors={['#D1D6A1', '#6D7054']}
            fields={[
              {label: 'Power Source', value: 'Generator'},
              {label: 'Generator Fuel Stock (Liters)', value: '40Lit'},
            ]}
          />
        </View>
      );
    }
    return null;
  };

  const handleAddButtonPress = () => {
    if (activeSection === 'machinery') {
      navigation.navigate('AddMachinery');
    } else if (activeSection === 'goods') {
      navigation.navigate('AddGoodsInStock');
    } else if (activeSection === 'utilities') {
      navigation.navigate('AddUtilityDetails');
    }
  };

  return (
    <View style={styles.container}>
      <SecondaryHeader title="Inventory" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}>
          <HStack space={2} p={4}>
            <TabButton
              title="Machinery & Equipment"
              isActive={activeSection === 'machinery'}
              onPress={() => setActiveSection('machinery')}
            />
            <TabButton
              title="Goods in Stock"
              isActive={activeSection === 'goods'}
              onPress={() => setActiveSection('goods')}
            />
            <TabButton
              title="Utilities"
              isActive={activeSection === 'utilities'}
              onPress={() => setActiveSection('utilities')}
            />
          </HStack>
        </ScrollView>

        {renderContent()}

        {/* Modal */}
        {/* Modal */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {activeSection === 'machinery'
                    ? 'Machinery Details'
                    : 'Goods Details'}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              {selectedItem && (
                <ScrollView style={styles.modalScrollContent}>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>
                      {activeSection === 'machinery'
                        ? 'Equipment Name'
                        : 'Item Name'}
                    </Text>
                    <Text style={styles.modalValue}>{selectedItem.name}</Text>
                  </View>

                  {activeSection === 'machinery' ? (
                    <>
                      <View style={styles.modalSection}>
                        <Text style={styles.modalLabel}>Equipment ID</Text>
                        <Text style={styles.modalValue}>{selectedItem.id}</Text>
                      </View>
                      <View style={styles.modalSection}>
                        <Text style={styles.modalLabel}>Purchase Date</Text>
                        <Text style={styles.modalValue}>
                          {selectedItem.purchaseDate}
                        </Text>
                      </View>
                      <View style={styles.modalSection}>
                        <Text style={styles.modalLabel}>Current Location</Text>
                        <Text style={styles.modalValue}>
                          {selectedItem.location}
                        </Text>
                      </View>
                      <View style={styles.modalSection}>
                        <Text style={styles.modalLabel}>Condition</Text>
                        <Text style={styles.modalValue}>
                          {selectedItem.condition}
                        </Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.modalSection}>
                        <Text style={styles.modalLabel}>Type</Text>
                        <Text style={styles.modalValue}>
                          {selectedItem.type}
                        </Text>
                      </View>
                      <View style={styles.modalSection}>
                        <Text style={styles.modalLabel}>Batch Number</Text>
                        <Text style={styles.modalValue}>
                          {selectedItem.batchNumber}
                        </Text>
                      </View>
                      <View style={styles.modalSection}>
                        <Text style={styles.modalLabel}>Supplier</Text>
                        <Text style={styles.modalValue}>
                          {selectedItem.supplier}
                        </Text>
                      </View>
                      <View style={styles.modalSection}>
                        <Text style={styles.modalLabel}>Quantity</Text>
                        <Text style={styles.modalValue}>
                          {selectedItem.quantity}
                        </Text>
                      </View>
                      <View style={styles.modalSection}>
                        <Text style={styles.modalLabel}>Purchase Date</Text>
                        <Text style={styles.modalValue}>
                          {selectedItem.purchaseDate}
                        </Text>
                      </View>
                      <View style={styles.modalSection}>
                        <Text style={styles.modalLabel}>Expiry Date</Text>
                        <Text style={styles.modalValue}>
                          {selectedItem.expiryDate}
                        </Text>
                      </View>
                      <View style={styles.modalSection}>
                        <Text style={styles.modalLabel}>Storage Location</Text>
                        <Text style={styles.modalValue}>
                          {selectedItem.storageLocation}
                        </Text>
                      </View>
                      <View style={styles.modalSection}>
                        <Text style={styles.modalLabel}>Status</Text>
                        <Text style={styles.modalValue}>
                          {selectedItem.status}
                        </Text>
                      </View>
                    </>
                  )}
                </ScrollView>
              )}

              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.backButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleAddButtonPress}>
        <FastImage
          source={icons.plus}
          style={styles.fabIcon}
          tintColor="#fff"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  tabsContainer: {
    maxHeight: 90,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#8CD18C',
    backgroundColor: 'white',
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#8CD18C',
  },
  tabText: {
    color: '#8CD18C',
    fontSize: 14,
    textAlign: 'center',
  },
  activeTabText: {
    color: 'white',
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  equipmentCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    minHeight: 150,
    position: 'relative',
  },
  number: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  equipmentTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  equipmentId: {
    color: 'white',
    fontSize: 16,
    marginBottom: 16,
  },
  detailsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 20,
    alignSelf: 'flex-end',
  },
  detailsButtonText: {
    color: 'white',
    fontSize: 14,
  },
  dotIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  utilityCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    color: 'white',
    fontSize: 14,
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: 'white',
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  fieldLabel: {
    color: '#333',
    fontSize: 14,
  },
  fieldValue: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8CD18C',
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  modalScrollContent: {
    maxHeight: '75%',
  },
  modalSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
  },
  modalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  backButton: {
    backgroundColor: '#8CD18C',
    borderRadius: 12,
    padding: 16,
    alignSelf: 'stretch',
    marginTop: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
