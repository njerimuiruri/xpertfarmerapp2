import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { PieChart } from 'react-native-svg-charts';
import { icons } from '../../constants';
import { COLORS } from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';

const livestockData = [
  { name: 'Dairy and beef', value: 80, color: '#FFD700' },
  { name: 'Dairy', value: 60, color: '#D4AF37' },
  { name: 'Beef', value: 62, color: '#556B2F' },
  { name: 'Poultry', value: 20, color: '#FF0000' },
  { name: 'Sheep', value: 60, color: '#D2691E' },
  { name: 'Pigs', value: 18, color: '#2F4F4F' },
  { name: 'Rabbit', value: 58, color: '#FA8072' },
];

const LivestockRecordsScreen = () => {
  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <FastImage source={icons.search} style={styles.searchIcon} tintColor="#666" />
      <TextInput
        style={styles.searchInput}
        placeholder="Search animal ID"
        placeholderTextColor="#666"
      />
      <TouchableOpacity>
        <FastImage 
          source={icons.close} 
          style={styles.closeIcon} 
          tintColor="#666" 
        />
      </TouchableOpacity>
    </View>
  );

  const renderOverviewHeader = () => (
    <View style={styles.overviewHeader}>
      <Text style={styles.overviewTitle}>Livestock overview</Text>
      <TouchableOpacity style={styles.periodSelector}>
        <FastImage
          source={icons.calendar}
          style={styles.periodIcon}
          tintColor="#666"
        />
        <Text style={styles.periodText}>This month</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPieChart = () => {
    const pieData = livestockData.map(item => ({
      value: item.value,
      svg: { fill: item.color },
      key: item.name,
    }));

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartAndLegendContainer}>
          <View style={styles.pieContainer}>
            <PieChart
              style={styles.pie}
              data={pieData}
              innerRadius="70%"
              padAngle={0.02}
            />
            <View style={styles.totalContainer}>
              <Text style={styles.totalNumber}>358</Text>
              <Text style={styles.totalLabel}>Livestock</Text>
            </View>
          </View>

          <View style={styles.legendContainer}>
            {livestockData.map(item => (
              <View key={item.name} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.name}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent
        backgroundColor={COLORS.green2}
        animated={true}
        barStyle={'light-content'}
      />
      
      <SecondaryHeader title="Livestock records" />
      
      {renderSearchBar()}
      {renderOverviewHeader()}
      {renderPieChart()}

      <TouchableOpacity style={styles.seeAllLink}>
        <Text style={styles.seeAllText}>See all</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  closeIcon: {
    width: 20,
    height: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  periodIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  periodText: {
    color: '#4CAF50',
    fontSize: 14,
  },
  chartContainer: {
    padding: 16,
  },
  chartAndLegendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pieContainer: {
    width: '60%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pie: {
    height: '100%',
  },
  totalContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  legendContainer: {
    width: '35%',
    paddingLeft: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendColor: {
    width: 16,
    height: 4,
    borderRadius: 2,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#333',
  },
  seeAllLink: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  seeAllText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LivestockRecordsScreen;