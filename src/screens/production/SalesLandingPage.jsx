import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ScrollView,
  FlatList,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { icons } from '../../constants';
import { COLORS } from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';

const SalesLandingPage = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('all');

  const salesModules = [
    {
      id: '1',
      title: 'Dairy Cattle Sales',
      icon: icons.dairy,
      category: 'dairy',
      description: 'Milk sales, cattle sales, market pricing',
      metrics: { totalSales: '₦2,450,000', thisMonth: '₦145,000', activeListings: 12 },
      route: 'DairyProductionListScreen'
    },
    {
      id: '2',
      title: 'Beef Cattle Sales',
      icon: icons.beef,
      category: 'beef',
      description: 'Live cattle sales, meat sales, weight-based pricing',
      metrics: { totalSales: 'Ksh,890,000', thisMonth: '₦230,000', activeListings: 8 },
      route: 'BeefCattleProductionListing'
    },
    {
      id: '3',
      title: 'Swine Sales',
      icon: icons.swine,
      category: 'swine',
      description: 'Piglet sales, market weight pigs, breeding stock',
      metrics: { totalSales: '₦980,000', thisMonth: '₦85,000', activeListings: 15 },
      route: 'SwineProductionListScreen '
    },
    {
      id: '4',
      title: 'Sheep & Goat Sales',
      icon: icons.sheep,
      category: 'sheep',
      description: 'Live animal sales, wool sales, milk sales',
      metrics: { totalSales: '₦750,000', thisMonth: '₦65,000', activeListings: 10 },
      route: 'SheepAndGoatProductionListScreen'
    },
    {
      id: '5',
      title: 'Poultry Sales',
      icon: icons.poultry,
      category: 'poultry',
      description: 'Egg sales, live bird sales, meat sales',
      metrics: { totalSales: '₦1,200,000', thisMonth: '₦180,000', activeListings: 25 },
      route: 'PoultryProductionListScreen'
    }
  ];

  const tabs = [
    { id: 'all', title: 'All Livestock', icon: icons.livestock },
    { id: 'dairy', title: 'Dairy', icon: icons.dairy },
    { id: 'beef', title: 'Beef', icon: icons.beef },
    { id: 'swine', title: 'Swine', icon: icons.swine },
    { id: 'sheep', title: 'Sheep & Goats', icon: icons.sheep },
    { id: 'poultry', title: 'Poultry', icon: icons.poultry },
  ];

  const filteredModules = activeTab === 'all'
    ? salesModules
    : salesModules.filter(module => module.category === activeTab);

  const totalRevenue = salesModules.reduce((sum, module) =>
    sum + parseInt(module.metrics.totalSales.replace(/[₦,]/g, '')), 0
  );

  const monthlyRevenue = salesModules.reduce((sum, module) =>
    sum + parseInt(module.metrics.thisMonth.replace(/[₦,]/g, '')), 0
  );

  const renderTab = ({ item }) => (
    <TouchableOpacity
      style={[styles.tab, activeTab === item.id && styles.activeTab]}
      onPress={() => setActiveTab(item.id)}
    >
      <FastImage
        source={item.icon}
        style={[
          styles.tabIcon,
          { tintColor: activeTab === item.id ? COLORS.white : COLORS.green }
        ]}
      />
      <Text style={[
        styles.tabText,
        { color: activeTab === item.id ? COLORS.white : COLORS.green }
      ]}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const renderSalesModule = (module) => (
    <TouchableOpacity
      key={module.id}
      style={styles.moduleCard}
      onPress={() => navigation.navigate(module.route)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <View style={styles.iconContainer}>
            <FastImage
              source={module.icon}
              style={styles.moduleIcon}
              tintColor={COLORS.green}
            />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.moduleTitle}>{module.title}</Text>
            <Text style={styles.moduleDescription}>{module.description}</Text>
          </View>
          <FastImage
            source={icons.arrowRight}
            style={styles.arrowIcon}
            tintColor={COLORS.green}
          />
        </View>
      </View>

      <View style={styles.metricsContainer}>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{module.metrics.totalSales}</Text>
          <Text style={styles.metricLabel}>Total Sales</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{module.metrics.thisMonth}</Text>
          <Text style={styles.metricLabel}>This Month</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{module.metrics.activeListings}</Text>
          <Text style={styles.metricLabel}>Active Listings</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent
        backgroundColor={COLORS.green2}
        animated={true}
        barStyle={'light-content'}
      />
      <SecondaryHeader title="Sales Management" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Revenue Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.heading}>Sales Overview</Text>
          <View style={styles.summaryCards}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>Ksh 2000</Text>
              <Text style={styles.summaryLabel}>Total Revenue</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>Ksh 2000</Text>
              <Text style={styles.summaryLabel}>This Month</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <FlatList
            data={tabs}
            renderItem={renderTab}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsList}
          />
        </View>

        <View style={styles.modulesContainer}>
          <Text style={styles.sectionTitle}>
            {activeTab === 'all' ? 'All Livestock Sales' : `${tabs.find(tab => tab.id === activeTab)?.title} Sales`}
          </Text>
          {filteredModules.map(renderSalesModule)}
        </View>

        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity style={styles.quickActionBtn}>
              <FastImage
                source={icons.add}
                style={styles.quickActionIcon}
                tintColor={COLORS.white}
              />
              <Text style={styles.quickActionText}>New Sale</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBtn}>
              <FastImage
                source={icons.chart}
                style={styles.quickActionIcon}
                tintColor={COLORS.white}
              />
              <Text style={styles.quickActionText}>Analytics</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBtn}>
              <FastImage
                source={icons.report}
                style={styles.quickActionIcon}
                tintColor={COLORS.white}
              />
              <Text style={styles.quickActionText}>Reports</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  scrollContent: {
    padding: 16,
  },
  summaryContainer: {
    marginBottom: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
  },
  summaryCards: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.green,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.8,
  },
  tabsContainer: {
    marginBottom: 20,
  },
  tabsList: {
    paddingHorizontal: 4,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.green,
    backgroundColor: COLORS.white,
  },
  activeTab: {
    backgroundColor: COLORS.green,
  },
  tabIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modulesContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 16,
  },
  moduleCard: {
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
  cardHeader: {
    marginBottom: 16,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  moduleIcon: {
    width: 28,
    height: 28,
  },
  titleContainer: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 12,
    color: COLORS.gray,
    lineHeight: 16,
  },
  arrowIcon: {
    width: 20,
    height: 20,
  },
  metricsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.green,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 10,
    color: COLORS.gray,
  },
  metricDivider: {
    width: 1,
    backgroundColor: COLORS.gray3,
    marginHorizontal: 8,
  },
  quickActionsContainer: {
    marginBottom: 20,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionBtn: {
    flex: 1,
    backgroundColor: COLORS.green,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  quickActionIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default SalesLandingPage;