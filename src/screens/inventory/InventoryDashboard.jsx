import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {Box, HStack} from 'native-base';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import SecondaryHeader from '../../components/headers/secondary-header';
import {icons} from '../../constants';

export default function InventoryDashboard() {
  const [activeSection, setActiveSection] = useState('utilities');

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
      <View style={styles.detailsButton}>
        <Text style={styles.detailsButtonText}>show more details</Text>
      </View>
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
      <Text style={styles.equipmentId}>Type (Organic, Inorganic, Hybrid, etc.)</Text>
      <View style={styles.detailsButton}>
        <Text style={styles.detailsButtonText}>show more details</Text>
      </View>
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
          <TouchableOpacity style={styles.addButton}>
            <FastImage source={icons.plus} style={styles.addIcon} />
          </TouchableOpacity>
        </View>
      );
    } else if (activeSection === 'utilities') {
      return (
        <View style={styles.contentContainer}>
          <UtilityCard
            title="Water supply"
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
            fields={[]}
          />
        </View>
      );
    }
    return null;
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

        {/* Content */}
        {renderContent()}
      </ScrollView>
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
  addButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#8CD18C',
    borderRadius: 50,
    padding: 12,
  },
  addIcon: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
});