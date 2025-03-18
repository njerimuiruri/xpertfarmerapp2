import React, {useState, useEffect} from 'react';
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
import { COLORS } from '../../constants/theme';

export default function InventoryDashboard() {
  const navigation = useNavigation();
  const [activeSection, setActiveSection] = useState('machinery');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const machineryData = [
    {
      id: 'mach001',
      name: 'Tractor',
      equipmentId: 'TR-2024-001',
      purchaseDate: '19/07/2023',
      location: 'Field 3',
      condition: 'Good',
      lastServiceDate: '15/01/2025',
      nextServiceDate: '15/04/2025',
      maintenanceCost: '$850',
      hoursOperated: '320',
      costPerHour: '$2.65',
      fuelEfficiency: '3.2 L/hr',
      roi: '118%',
      serviceAlert: false
    },
    {
      id: 'mach002',
      name: 'Harvester',
      equipmentId: 'HV-2024-003',
      purchaseDate: '05/03/2024',
      location: 'Equipment Shed',
      condition: 'Excellent',
      lastServiceDate: '01/02/2025',
      nextServiceDate: '01/03/2025',
      maintenanceCost: '$450',
      hoursOperated: '145',
      costPerHour: '$3.10',
      fuelEfficiency: '4.5 L/hr',
      roi: '95%',
      serviceAlert: true
    },
    {
      id: 'mach003',
      name: 'Irrigation System',
      equipmentId: 'IR-2023-007',
      purchaseDate: '12/05/2023',
      location: 'Field 1 & 2',
      condition: 'Fair',
      lastServiceDate: '20/12/2024',
      nextServiceDate: '20/03/2025',
      maintenanceCost: '$720',
      hoursOperated: '580',
      costPerHour: '$1.24',
      waterEfficiency: '95%',
      roi: '125%',
      serviceAlert: false
    }
  ];

  const goodsData = [
    {
      id: 'goods001',
      name: 'Premium Dairy Feed',
      type: 'Feed',
      batchNumber: 'FD-2025-001',
      supplier: 'AgriNutrient Ltd.',
      quantity: '850 kg',
      purchaseDate: '05/01/2025',
      expiryDate: '05/07/2025',
      fcr: '1.6', 
      costPerKg: '$0.45',
      costEffectiveness: '0.85', 
      storageLocation: 'Feed Storage B',
      status: 'In Stock',
      stockAlert: false
    },
    {
      id: 'goods002',
      name: 'Organic Fertilizer',
      type: 'Fertilizer',
      batchNumber: 'OF-2025-012',
      supplier: 'EcoCrops Inc.',
      quantity: '150 kg',
      purchaseDate: '18/01/2025',
      expiryDate: '18/01/2026',
      nutrientRating: 'High NPK',
      applicationRate: '2.5 kg/acre',
      costPerKg: '$0.75',
      storageLocation: 'Warehouse A',
      status: 'Low Stock',
      stockAlert: true
    },
    {
      id: 'goods003',
      name: 'Livestock Vaccines',
      type: 'Medical',
      batchNumber: 'VX-2025-045',
      supplier: 'VetPharma',
      quantity: '50 doses',
      purchaseDate: '10/02/2025',
      expiryDate: '10/08/2025',
      vaccineType: 'Multi-disease prevention',
      effectivenessRating: '98%',
      costPerDose: '$3.50',
      storageLocation: 'Cold Storage Unit',
      status: 'In Stock',
      stockAlert: false
    }
  ];

  const utilitiesData = {
    waterSupply: {
      id: 'util001',
      title: 'Water Supply',
      date: '01/03/2025',
      currentLevel: '3200L',
      capacity: '5000L',
      source: 'Borehole',
      usageRate: '450L/day',
      rainwaterHarvested: '1200L/month',
      waterQuality: 'Good - pH 7.2',
      irrigationCoverage: '85%',
      carbonFootprint: 'Low'
    },
    powerSupply: {
      id: 'util002',
      title: 'Power Supply',
      date: '01/03/2025',
      source: 'Solar + Generator',
      solarCapacity: '5kW',
      batteryStorage: '10kWh',
      generatorFuel: '40L',
      dailyConsumption: '18kWh',
      backupDuration: '36 hours',
      carbonEmissions: '5kg CO2/day',
      efficiencyRating: '92%'
    },
    wasteManagement: {
      id: 'util003',
      title: 'Waste Management',
      date: '01/03/2025',
      organicWaste: '250kg/month',
      recycling: '180kg/month',
      compostProduction: '220kg/month',
      methaneReduction: '65kg CO2e/month',
      wasteDiversion: '85%',
      soilEnrichment: 'High',
      processingEfficiency: '90%'
    }
  };

  const analyticsData = [
    {
      id: 'analytics001',
      title: 'Feed Conversion Efficiency',
      value: '1.62',
      unit: 'FCR',
      change: '-0.18',
      isPositive: true,
      description: 'Lower FCR means more efficient feed conversion',
      details: 'Feed Conversion Ratio measures kg of feed per kg of output produced'
    },
    {
      id: 'analytics002',
      title: 'Growth Rate',
      value: '0.85',
      unit: 'kg/day',
      change: '+0.05',
      isPositive: true,
      description: 'Average Daily Gain (ADG)',
      details: 'Measures average weight increase per day across livestock'
    },
    {
      id: 'analytics003',
      title: 'Reproductive Performance',
      value: '87',
      unit: '%',
      change: '+3.5',
      isPositive: true,
      description: 'Breeding success rate',
      details: 'Percentage of successful pregnancies relative to breeding attempts'
    },
    {
      id: 'analytics004',
      title: 'Health & Welfare',
      value: '2.3',
      unit: '%',
      change: '-0.8',
      isPositive: true,
      description: 'Mortality rate',
      details: 'Current mortality rate across all livestock'
    },
    {
      id: 'analytics005',
      title: 'Economic Performance',
      value: '125',
      unit: '%',
      change: '+8',
      isPositive: true,
      description: 'Return on investment',
      details: 'Overall ROI on farming operations'
    },
    {
      id: 'analytics006',
      title: 'Carbon Footprint',
      value: '0.8',
      unit: 'kg CO2e/kg',
      change: '-0.15',
      isPositive: true,
      description: 'Carbon emissions per unit',
      details: 'Carbon emissions per kg of agricultural output'
    }
  ];

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

  const EquipmentCard = ({item, index, gradientColors}) => {
    const parts = item.nextServiceDate.split('/');
    const nextServiceDue = new Date(parts[2], parts[1] - 1, parts[0]);
    const today = new Date();
    const daysUntilService = Math.floor((nextServiceDue - today) / (1000 * 60 * 60 * 24));
    const needsService = daysUntilService <= 14; 
    
    return (
      <LinearGradient
        colors={gradientColors}
        style={styles.equipmentCard}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        <Text style={styles.number}>{index}.</Text>
        <Text style={styles.equipmentTitle}>{item.name}</Text>
        <Text style={styles.equipmentId}>ID: {item.equipmentId}</Text>
        <View style={styles.serviceAlert}>
          <Text style={[styles.serviceText, {color: needsService ? '#FF3B30' : 'white'}]}>
            {needsService 
              ? `Service due in ${daysUntilService} days` 
              : `Next service: ${item.nextServiceDate}`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => {
            setSelectedItem(item);
            setModalVisible(true);
          }}>
          <Text style={styles.detailsButtonText}>Show more details</Text>
        </TouchableOpacity>
        <View style={styles.dotIndicator}>
          <View style={[
            styles.dot, 
            {backgroundColor: needsService ? COLORS.red : COLORS.green2}
          ]} />
        </View>
      </LinearGradient>
    );
  };

  const GoodsCard = ({item, index, gradientColors}) => {
    const lowStock = item.status === 'Low Stock';
    
    return (
      <LinearGradient
        colors={gradientColors}
        style={styles.equipmentCard}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        <Text style={styles.number}>{index}.</Text>
        <Text style={styles.equipmentTitle}>{item.name}</Text>
        <Text style={styles.equipmentId}>
          {item.type} {item.type === 'Feed' ? `- FCR: ${item.fcr}` : ''}
        </Text>
        <View style={styles.stockInfo}>
          <Text style={styles.stockText}>
            Quantity: {item.quantity} - {item.status}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => {
            setSelectedItem(item);
            setModalVisible(true);
          }}>
          <Text style={styles.detailsButtonText}>Show more details</Text>
        </TouchableOpacity>
        <View style={styles.dotIndicator}>
          <View style={[
            styles.dot, 
            {backgroundColor: lowStock ? COLORS.red : COLORS.green2}
          ]} />
        </View>
      </LinearGradient>
    );
  };

  const UtilityCard = ({utilityData, gradientColors}) => {
    let fields = [];
    
    if (utilityData.title === 'Water Supply') {
      fields = [
        {label: 'Current Level', value: utilityData.currentLevel},
        {label: 'Source', value: utilityData.source},
        {label: 'Usage Rate', value: utilityData.usageRate},
        {label: 'Water Quality', value: utilityData.waterQuality},
      ];
    } else if (utilityData.title === 'Power Supply') {
      fields = [
        {label: 'Source', value: utilityData.source},
        {label: 'Daily Usage', value: utilityData.dailyConsumption},
        {label: 'Generator Fuel', value: utilityData.generatorFuel},
        {label: 'Carbon Emissions', value: utilityData.carbonEmissions},
      ];
    } else if (utilityData.title === 'Waste Management') {
      fields = [
        {label: 'Organic Waste', value: utilityData.organicWaste},
        {label: 'Compost Production', value: utilityData.compostProduction},
        {label: 'Waste Diversion', value: utilityData.wasteDiversion},
        {label: 'Methane Reduction', value: utilityData.methaneReduction},
      ];
    }
    
    return (
      <LinearGradient
        colors={gradientColors}
        style={styles.utilityCard}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{utilityData.title}</Text>
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{utilityData.date}</Text>
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
        <TouchableOpacity
          style={styles.utilityDetailsButton}
          onPress={() => {
            setSelectedItem(utilityData);
            setModalVisible(true);
          }}>
          <Text style={styles.detailsButtonText}>Show more details</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  };

  const AnalyticsCard = ({item, gradientColors}) => (
    <LinearGradient
      colors={gradientColors}
      style={styles.analyticsCard}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}>
      <View style={styles.analyticsHeader}>
        <Text style={styles.analyticsTitle}>{item.title}</Text>
        <View style={styles.changeIndicator}>
          <Text style={[
            styles.changeText, 
{color: item.isPositive ? COLORS.green2 : COLORS.red}
          ]}>
            {item.change} {item.isPositive ? '↑' : '↓'}
          </Text>
        </View>
      </View>
      <View style={styles.analyticsValue}>
        <Text style={styles.valueText}>{item.value}</Text>
        <Text style={styles.unitText}>{item.unit}</Text>
      </View>
      <Text style={styles.descriptionText}>{item.description}</Text>
      <TouchableOpacity
        style={styles.analyticsDetailsButton}
        onPress={() => {
          setSelectedItem(item);
          setModalVisible(true);
        }}>
        <Text style={styles.detailsButtonText}>More info</Text>
      </TouchableOpacity>
    </LinearGradient>
  );

  const renderContent = () => {
    if (activeSection === 'machinery') {
      return (
        <View style={styles.contentContainer}>
          {machineryData.map((item, index) => (
            <EquipmentCard 
              key={item.id}
              item={item} 
              index={index + 1} 
              gradientColors={
                index % 3 === 0 ? ['#DBAFA4', '#755D58'] : 
                index % 3 === 1 ? ['#8CD18C', '#486B48'] : 
                ['#D1D6A1', '#6D7054']
              } 
            />
          ))}
        </View>
      );
    } else if (activeSection === 'goods') {
      return (
        <View style={styles.contentContainer}>
          {goodsData.map((item, index) => (
            <GoodsCard 
              key={item.id}
              item={item} 
              index={index + 1} 
              gradientColors={
                index % 3 === 0 ? ['#DBAFA4', '#755D58'] : 
                index % 3 === 1 ? ['#8CD18C', '#486B48'] : 
                ['#D1D6A1', '#6D7054']
              } 
            />
          ))}
        </View>
      );
    } else if (activeSection === 'utilities') {
      return (
        <View style={styles.contentContainer}>
          <UtilityCard 
            utilityData={utilitiesData.waterSupply}
            gradientColors={['#DBAFA4', '#755D58']}
          />
          <UtilityCard 
            utilityData={utilitiesData.powerSupply}
            gradientColors={['#8CD18C', '#486B48']}
          />
          <UtilityCard 
            utilityData={utilitiesData.wasteManagement}
            gradientColors={['#D1D6A1', '#6D7054']}
          />
        </View>
      );
    } else if (activeSection === 'analytics') {
      return (
        <View style={styles.contentContainer}>
          <View style={styles.analyticsContainer}>
            {analyticsData.map((item, index) => (
              <AnalyticsCard
                key={item.id}
                item={item}
                gradientColors={
                  index % 3 === 0 ? ['#DBAFA4', '#755D58'] : 
                  index % 3 === 1 ? ['#8CD18C', '#486B48'] : 
                  ['#D1D6A1', '#6D7054']
                }
              />
            ))}
          </View>
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

  const renderModalContent = () => {
    if (!selectedItem) return null;

    if (activeSection === 'machinery') {
      return (
        <ScrollView style={styles.modalScrollContent}>
          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Equipment Name</Text>
            <Text style={styles.modalValue}>{selectedItem.name}</Text>
          </View>
          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Equipment ID</Text>
            <Text style={styles.modalValue}>{selectedItem.equipmentId}</Text>
          </View>
          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Purchase Date</Text>
            <Text style={styles.modalValue}>{selectedItem.purchaseDate}</Text>
          </View>
          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Current Location</Text>
            <Text style={styles.modalValue}>{selectedItem.location}</Text>
          </View>
          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Condition</Text>
            <Text style={styles.modalValue}>{selectedItem.condition}</Text>
          </View>
          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Last Service Date</Text>
            <Text style={styles.modalValue}>{selectedItem.lastServiceDate}</Text>
          </View>
          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Next Service Date</Text>
            <Text style={styles.modalValue}>{selectedItem.nextServiceDate}</Text>
          </View>
          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Maintenance Cost (YTD)</Text>
            <Text style={styles.modalValue}>{selectedItem.maintenanceCost}</Text>
          </View>
          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Hours Operated</Text>
            <Text style={styles.modalValue}>{selectedItem.hoursOperated}</Text>
          </View>
          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Cost Per Hour</Text>
            <Text style={styles.modalValue}>{selectedItem.costPerHour}</Text>
          </View>
          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Return on Investment</Text>
            <Text style={styles.modalValue}>{selectedItem.roi}</Text>
          </View>
        </ScrollView>
      );
    } else if (activeSection === 'goods') {
      return (
        <ScrollView style={styles.modalScrollContent}>
          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Item Name</Text>
            <Text style={styles.modalValue}>{selectedItem.name}</Text>
          </View>
          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Type</Text>
            <Text style={styles.modalValue}>{selectedItem.type}</Text>
          </View>
          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Batch Number</Text>
            <Text style={styles.modalValue}>{selectedItem.batchNumber}</Text>
          </View>
          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Supplier</Text>
            <Text style={styles.modalValue}>{selectedItem.supplier}</Text>
          </View>
          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Quantity</Text>
            <Text style={styles.modalValue}>{selectedItem.quantity}</Text>
          </View>
          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Purchase Date</Text>
            <Text style={styles.modalValue}>{selectedItem.purchaseDate}</Text>
          </View>
          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Expiry Date</Text>
            <Text style={styles.modalValue}>{selectedItem.expiryDate}</Text>
          </View>
          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Storage Location</Text>
            <Text style={styles.modalValue}>{selectedItem.storageLocation}</Text>
          </View>
          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Status</Text>
            <Text style={styles.modalValue}>{selectedItem.status}</Text>
          </View>
          {selectedItem.type === 'Feed' && (
            <>
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Feed Conversion Ratio (FCR)</Text>
                <Text style={styles.modalValue}>{selectedItem.fcr}</Text>
              </View>
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Cost Per Kg</Text>
                <Text style={styles.modalValue}>{selectedItem.costPerKg}</Text>
              </View>
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Cost Effectiveness Score</Text>
                <Text style={styles.modalValue}>{selectedItem.costEffectiveness}</Text>
              </View>
            </>
          )}
        </ScrollView>
      );
    } else if (activeSection === 'utilities') {
      let fields = [];
      
      if (selectedItem.title === 'Water Supply') {
        fields = [
          {label: 'Current Level', value: selectedItem.currentLevel},
          {label: 'Full Capacity', value: selectedItem.capacity},
          {label: 'Source', value: selectedItem.source},
          {label: 'Usage Rate', value: selectedItem.usageRate},
          {label: 'Rainwater Harvested', value: selectedItem.rainwaterHarvested},
          {label: 'Water Quality', value: selectedItem.waterQuality},
          {label: 'Irrigation Coverage', value: selectedItem.irrigationCoverage},
          {label: 'Carbon Footprint', value: selectedItem.carbonFootprint},
        ];
      } else if (selectedItem.title === 'Power Supply') {
        fields = [
          {label: 'Source', value: selectedItem.source},
          {label: 'Solar Capacity', value: selectedItem.solarCapacity},
          {label: 'Battery Storage', value: selectedItem.batteryStorage},
          {label: 'Generator Fuel', value: selectedItem.generatorFuel},
          {label: 'Daily Consumption', value: selectedItem.dailyConsumption},
          {label: 'Backup Duration', value: selectedItem.backupDuration},
          {label: 'Carbon Emissions', value: selectedItem.carbonEmissions},
          {label: 'Efficiency Rating', value: selectedItem.efficiencyRating},
        ];
      } else if (selectedItem.title === 'Waste Management') {
        fields = [
          {label: 'Organic Waste', value: selectedItem.organicWaste},
          {label: 'Recycling', value: selectedItem.recycling},
          {label: 'Compost Production', value: selectedItem.compostProduction},
          {label: 'Methane Reduction', value: selectedItem.methaneReduction},
          {label: 'Waste Diversion', value: selectedItem.wasteDiversion},
          {label: 'Soil Enrichment', value: selectedItem.soilEnrichment},
          {label: 'Processing Efficiency', value: selectedItem.processingEfficiency},
        ];
      }
      
      return (
        <ScrollView style={styles.modalScrollContent}>
          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Utility Type</Text>
            <Text style={styles.modalValue}>{selectedItem.title}</Text>
          </View>
          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Last Updated</Text>
            <Text style={styles.modalValue}>{selectedItem.date}</Text>
          </View>
          {fields.map((field, index) => (
            <View key={index} style={styles.modalSection}>
              <Text style={styles.modalLabel}>{field.label}</Text>
              <Text style={styles.modalValue}>{field.value}</Text>
            </View>
          ))}
        </ScrollView>
      );
    } else if (activeSection === 'analytics') {
      return (
        <ScrollView style={styles.modalScrollContent}>
          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Metric</Text>
            <Text style={styles.modalValue}>{selectedItem.title}</Text>
          </View>
          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Current Value</Text>
            <Text style={styles.modalValue}>{selectedItem.value} {selectedItem.unit}</Text>
          </View>
          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Change</Text>
            <Text style={[
              styles.modalValue, 
              {color: selectedItem.isPositive ? '#34C759' : '#FF3B30'}
            ]}>
              {selectedItem.change} {selectedItem.isPositive ? '↑' : '↓'}
            </Text>
          </View>
          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Description</Text>
            <Text style={styles.modalValue}>{selectedItem.description}</Text>
          </View>
          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Additional Details</Text>
            <Text style={styles.modalValue}>{selectedItem.details}</Text>
          </View>
        </ScrollView>
      );
    }
    
    return null;
  };

  return (
    <View style={styles.container}>
      <SecondaryHeader title="Inventory" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
            <TabButton
              title="Analytics"
              isActive={activeSection === 'analytics'}
              onPress={() => setActiveSection('analytics')}
            />
          </HStack>
        </ScrollView>

        {renderContent()}

        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {activeSection === 'machinery' ? 'Machinery Details' : 
                   activeSection === 'goods' ? 'Inventory Item Details' :
                   activeSection === 'utilities' ? 'Utility Details' :
                   'Analytics Details'}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              {renderModalContent()}

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => {
                    setModalVisible(false);
                    if (activeSection === 'machinery') {
                      navigation.navigate('EditMachinery', { item: selectedItem });
                    } else if (activeSection === 'goods') {
                      navigation.navigate('EditInventoryItem', { item: selectedItem });
                    } else if (activeSection === 'utilities') {
                      navigation.navigate('EditUtility', { item: selectedItem });
                    } 
                  }}>
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeModalButton}
                  onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeModalButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddButtonPress}>
        <FastImage
          source={icons.plus}
          style={styles.addIcon}
          resizeMode={FastImage.resizeMode.contain}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  tabsContainer: {
    flexGrow: 0,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.white,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray2,
    minWidth: 100,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor:COLORS.green2,
  },
  tabText: {
    fontSize: 14,
    color:COLORS.black,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 15,
  },
  equipmentCard: {
    marginBottom: 15,
    borderRadius: 12,
    padding: 15,
    shadowColor:COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  number: {
    color:COLORS.white,
    fontSize: 12,
    marginBottom: 5,
  },
  equipmentTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  equipmentId: {
    color: COLORS.white,
    fontSize: 14,
    marginBottom: 10,
  },
  serviceAlert: {
    backgroundColor:COLORS.transparentBlack1,
    padding: 8,
    borderRadius: 6,
    marginVertical: 8,
  },
  serviceText: {
    color: COLORS.white,
    fontSize: 13,
  },
  stockInfo: {
    backgroundColor:COLORS.transparentBlack1,
    padding: 8,
    borderRadius: 6,
    marginVertical: 8,
  },
  stockText: {
    color: COLORS.white,
    fontSize: 13,
  },
  detailsButton: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.lightOverlayColor,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginTop: 10,
  },
  detailsButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
  },
  dotIndicator: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.lightOverlayColor,
  },
  utilityCard: {
    marginBottom: 15,
    borderRadius: 12,
    padding: 15,
    shadowColor:COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    color: COLORS.white,
    fontSize: 12,
    marginRight: 5,
  },
  icon: {
    width: 14,
    height: 14,
    tintColor: COLORS.white,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray2,
  },
  fieldLabel: {
    color: COLORS.white,
    fontSize: 14,
  },
  fieldValue: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  utilityDetailsButton: {
    alignSelf: 'center',
    backgroundColor: COLORS.lightOverlayColor,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginTop: 15,
  },
  analyticsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  analyticsCard: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyticsHeader: {
    marginBottom: 8,
  },
  analyticsTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
  },
  changeIndicator: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.lightOverlayColor,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  analyticsValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  valueText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '700',
    marginRight: 4,
  },
  unitText: {
    color: COLORS.white,
    fontSize: 12,
  },
  descriptionText: {
    color: COLORS.white,
    fontSize: 12,
    marginBottom: 10,
  },
  analyticsDetailsButton: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.lightOverlayColor,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginTop: 'auto',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor:COLORS.green3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  addIcon: {
    width: 24,
    height: 24,
    tintColor:COLORS.white,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor:COLORS.darkOverlayColor,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor:COLORS.black,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '500',
    color: COLORS.gray,
  },
  modalScrollContent: {
    maxHeight: '70%',
  },
  modalSection: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.white,
  },
  modalLabel: {
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 16,
    color:COLORS.gray,
    fontWeight: '500',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  editButton: {
    backgroundColor:COLORS.green3,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },
  editButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  closeModalButton: {
    backgroundColor: COLORS.lightGray2,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
  },
  closeModalButtonText: {
    color:COLORS.black,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});