import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Dimensions,
    Alert
} from 'react-native';
import Header from '../../../components/headers/main-header';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../../constants/theme';
import { PieChart, BarChart, LineChart } from 'react-native-chart-kit';

const { width: screenWidth } = Dimensions.get('window');

const FeedingAnalyticsScreen = () => {
    const navigation = useNavigation();
    const [selectedPeriod, setSelectedPeriod] = useState('This month');
    const [showPeriodModal, setShowPeriodModal] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [feedingType, setFeedingType] = useState('all'); // 'all', 'single', 'group'
    const [loading, setLoading] = useState(false);

    // Sample feeding data based on your records
    const [feedingRecords] = useState([
        {
            id: 1,
            type: 'Single',
            date: '2025-05-10',
            supplier: 'AgriFeeds Co.',
            animals: 25,
            quantity: 300, // kg
            purchasePrice: 600,
            transportCost: 20,
            totalCost: 620,
            feedType: 'Dairy Mix',
            costPerKg: 2.00,
            costPerAnimal: 24.80
        },
        {
            id: 2,
            type: 'Group',
            date: '2025-05-10',
            supplier: 'AgriFeeds Co.',
            animals: 53,
            quantity: 100, // kg
            purchasePrice: 200,
            transportCost: 20,
            totalCost: 220,
            feedType: 'General Feed',
            costPerKg: 2.00,
            costPerAnimal: 4.15
        },
        {
            id: 3,
            type: 'Single',
            date: '2025-05-15',
            supplier: 'FarmSupply Ltd.',
            animals: 30,
            quantity: 250,
            purchasePrice: 520,
            transportCost: 25,
            totalCost: 545,
            feedType: 'High Protein',
            costPerKg: 2.08,
            costPerAnimal: 18.17
        },
        {
            id: 4,
            type: 'Group',
            date: '2025-05-18',
            supplier: 'AgriFeeds Co.',
            animals: 53,
            quantity: 150,
            purchasePrice: 300,
            transportCost: 20,
            totalCost: 320,
            feedType: 'Maintenance Feed',
            costPerKg: 2.00,
            costPerAnimal: 6.04
        }
    ]);

    const timePeriods = ['This week', 'This month', 'This quarter', 'This year'];
    const feedingTypes = ['all', 'single', 'group'];
    const suppliers = [...new Set(feedingRecords.map(record => record.supplier))];

    // Filter records based on feeding type
    const filteredRecords = feedingType === 'all'
        ? feedingRecords
        : feedingRecords.filter(record => record.type.toLowerCase() === feedingType);

    // Calculate analytics
    const totalRecords = filteredRecords.length;
    const totalAnimals = Math.max(...feedingRecords.map(r => r.animals));
    const totalQuantity = filteredRecords.reduce((sum, record) => sum + record.quantity, 0);
    const totalCost = filteredRecords.reduce((sum, record) => sum + record.totalCost, 0);
    const totalPurchaseCost = filteredRecords.reduce((sum, record) => sum + record.purchasePrice, 0);
    const totalTransportCost = filteredRecords.reduce((sum, record) => sum + record.transportCost, 0);
    const avgCostPerKg = totalCost / totalQuantity || 0;
    const avgCostPerAnimal = totalCost / totalAnimals || 0;
    const avgQuantityPerFeeding = totalQuantity / totalRecords || 0;

    // Chart configurations - Updated to green theme
    const chartConfig = {
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        color: (opacity = 1) => `rgba(76, 113, 83, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.7,
        useShadowColorFromDataset: false,
    };

    // Feeding type distribution for pie chart - Updated colors
    const typeDistribution = [
        {
            name: 'Single Feeding',
            population: feedingRecords.filter(r => r.type === 'Single').reduce((sum, r) => sum + r.quantity, 0),
            color: '#4C7153',
            legendFontColor: '#333',
            legendFontSize: 12,
        },
        {
            name: 'Group Feeding',
            population: feedingRecords.filter(r => r.type === 'Group').reduce((sum, r) => sum + r.quantity, 0),
            color: '#8CD18C',
            legendFontColor: '#333',
            legendFontSize: 12,
        }
    ];

    // Monthly feeding cost trend (sample data) - Updated colors
    const costTrendData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [{
            data: [800, 950, 1100, 920, Math.round(totalCost)],
            color: (opacity = 1) => `rgba(76, 113, 83, ${opacity})`,
            strokeWidth: 3
        }]
    };

    // Supplier cost comparison
    const supplierData = {
        labels: suppliers,
        datasets: [{
            data: suppliers.map(supplier =>
                filteredRecords
                    .filter(record => record.supplier === supplier)
                    .reduce((sum, record) => sum + record.totalCost, 0)
            )
        }]
    };

    // Updated KPI cards with green color scheme
    const kpiCards = [
        {
            title: 'Total Feed Quantity',
            value: `${totalQuantity.toLocaleString()} kg`,
            change: '+8.5%',
            changeType: 'positive',
            icon: 'silo',
            colors: ['#8CD18C', '#4C7153'],
        },
        {
            title: 'Total Cost',
            value: `KES ${totalCost.toLocaleString()}`,
            change: '+12.3%',
            changeType: 'positive',
            icon: 'cash',
            colors: ['#A7E3A7', '#4C7153'],
        },
        {
            title: 'Cost per Kg',
            value: `KES ${avgCostPerKg.toFixed(2)}`,
            change: '-2.1%',
            changeType: 'negative',
            icon: 'scale',
            colors: ['#CBD18F', '#4C7153'],
        },
        {
            title: 'Feeding Sessions',
            value: totalRecords.toString(),
            change: '+3',
            changeType: 'positive',
            icon: 'counter',
            colors: ['#91D79E', '#4C7153'],
        },
    ];

    const analysisTabs = [
        { id: 'overview', label: 'Overview', icon: 'view-dashboard' },
        { id: 'types', label: 'Feed Types', icon: 'food-variant' },
        { id: 'suppliers', label: 'Suppliers', icon: 'truck-delivery' },
        { id: 'costs', label: 'Cost Analysis', icon: 'chart-line' },
    ];

    const renderKPICard = ({ title, value, change, changeType, icon, colors }) => (
        <LinearGradient colors={colors} style={styles.kpiCard} key={title}>
            <View style={styles.kpiHeader}>
                <Icon name={icon} size={24} color="#fff" />
                <View style={[styles.changeContainer, { backgroundColor: changeType === 'positive' ? 'rgba(255,255,255,0.2)' : 'rgba(255,0,0,0.2)' }]}>
                    <Icon
                        name={changeType === 'positive' ? 'arrow-up' : 'arrow-down'}
                        size={12}
                        color="#fff"
                    />
                    <Text style={styles.changeText}>{change}</Text>
                </View>
            </View>
            <Text style={styles.kpiTitle}>{title}</Text>
            <Text style={styles.kpiValue}>{value}</Text>
        </LinearGradient>
    );

    const renderFeedingTypeSelector = () => (
        <View style={styles.feedingTypeSelector}>
            {feedingTypes.map((type) => (
                <TouchableOpacity
                    key={type}
                    style={[
                        styles.feedingTypeButton,
                        feedingType === type && styles.activeFeedingTypeButton
                    ]}
                    onPress={() => setFeedingType(type)}
                >
                    <Text style={[
                        styles.feedingTypeText,
                        feedingType === type && styles.activeFeedingTypeText
                    ]}>
                        {type === 'all' ? 'All' : type === 'single' ? 'Single' : 'Group'}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.chartContainer}>
                            <Text style={styles.chartTitle}>Feeding Type Distribution (Quantity)</Text>
                            <PieChart
                                data={typeDistribution}
                                width={screenWidth - 64}
                                height={220}
                                chartConfig={chartConfig}
                                accessor="population"
                                backgroundColor="transparent"
                                paddingLeft="15"
                                absolute
                            />
                        </View>
                        <View style={styles.insightContainer}>
                            <Text style={styles.insightTitle}>Feeding Overview:</Text>
                            <Text style={styles.insightText}>• {totalRecords} feeding sessions recorded this period</Text>
                            <Text style={styles.insightText}>• Total feed consumed: {totalQuantity} kg</Text>
                            <Text style={styles.insightText}>• Average cost per kg: KES {avgCostPerKg.toFixed(2)}</Text>
                            <Text style={styles.insightText}>• Transport costs: KES {totalTransportCost} ({((totalTransportCost / totalCost) * 100).toFixed(1)}% of total)</Text>
                            <Text style={styles.insightText}>• Average quantity per session: {avgQuantityPerFeeding.toFixed(1)} kg</Text>
                        </View>
                    </View>
                );

            case 'types':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.feedTypeBreakdown}>
                            <Text style={styles.sectionTitle}>Feeding Type Analysis</Text>

                            <View style={styles.typeCard}>
                                <Text style={styles.typeName}>Single Feeding</Text>
                                <View style={styles.typeStats}>
                                    {(() => {
                                        const singleRecords = feedingRecords.filter(r => r.type === 'Single');
                                        const singleQuantity = singleRecords.reduce((sum, r) => sum + r.quantity, 0);
                                        const singleCost = singleRecords.reduce((sum, r) => sum + r.totalCost, 0);
                                        return (
                                            <>
                                                <View style={styles.statItem}>
                                                    <Text style={styles.statValue}>{singleRecords.length}</Text>
                                                    <Text style={styles.statLabel}>Sessions</Text>
                                                </View>
                                                <View style={styles.statItem}>
                                                    <Text style={styles.statValue}>{singleQuantity} kg</Text>
                                                    <Text style={styles.statLabel}>Total Quantity</Text>
                                                </View>
                                                <View style={styles.statItem}>
                                                    <Text style={styles.statValue}>KES {singleCost}</Text>
                                                    <Text style={styles.statLabel}>Total Cost</Text>
                                                </View>
                                            </>
                                        );
                                    })()}
                                </View>
                            </View>

                            <View style={styles.typeCard}>
                                <Text style={styles.typeName}>Group Feeding</Text>
                                <View style={styles.typeStats}>
                                    {(() => {
                                        const groupRecords = feedingRecords.filter(r => r.type === 'Group');
                                        const groupQuantity = groupRecords.reduce((sum, r) => sum + r.quantity, 0);
                                        const groupCost = groupRecords.reduce((sum, r) => sum + r.totalCost, 0);
                                        return (
                                            <>
                                                <View style={styles.statItem}>
                                                    <Text style={styles.statValue}>{groupRecords.length}</Text>
                                                    <Text style={styles.statLabel}>Sessions</Text>
                                                </View>
                                                <View style={styles.statItem}>
                                                    <Text style={styles.statValue}>{groupQuantity} kg</Text>
                                                    <Text style={styles.statLabel}>Total Quantity</Text>
                                                </View>
                                                <View style={styles.statItem}>
                                                    <Text style={styles.statValue}>KES {groupCost}</Text>
                                                    <Text style={styles.statLabel}>Total Cost</Text>
                                                </View>
                                            </>
                                        );
                                    })()}
                                </View>
                            </View>
                        </View>

                        <View style={styles.insightContainer}>
                            <Text style={styles.insightTitle}>Type Insights:</Text>
                            <Text style={styles.insightText}>• Single feeding sessions use higher quantities per session</Text>
                            <Text style={styles.insightText}>• Group feeding is more cost-efficient per animal</Text>
                            <Text style={styles.insightText}>• Transport costs are distributed better in larger orders</Text>
                        </View>
                    </View>
                );

            case 'suppliers':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.chartContainer}>
                            <Text style={styles.chartTitle}>Supplier Cost Comparison</Text>
                            {supplierData.labels.length > 0 && (
                                <BarChart
                                    data={supplierData}
                                    width={screenWidth - 64}
                                    height={220}
                                    chartConfig={chartConfig}
                                    style={styles.chart}
                                    showValuesOnTopOfBars
                                />
                            )}
                        </View>

                        <View style={styles.supplierBreakdown}>
                            <Text style={styles.sectionTitle}>Supplier Performance</Text>
                            {suppliers.map(supplier => {
                                const supplierRecords = filteredRecords.filter(r => r.supplier === supplier);
                                const supplierQuantity = supplierRecords.reduce((sum, r) => sum + r.quantity, 0);
                                const supplierCost = supplierRecords.reduce((sum, r) => sum + r.totalCost, 0);
                                const avgPricePerKg = supplierCost / supplierQuantity || 0;

                                return (
                                    <View key={supplier} style={styles.supplierCard}>
                                        <Text style={styles.supplierName}>{supplier}</Text>
                                        <View style={styles.supplierStats}>
                                            <View style={styles.statItem}>
                                                <Text style={styles.statValue}>{supplierRecords.length}</Text>
                                                <Text style={styles.statLabel}>Orders</Text>
                                            </View>
                                            <View style={styles.statItem}>
                                                <Text style={styles.statValue}>{supplierQuantity} kg</Text>
                                                <Text style={styles.statLabel}>Total Quantity</Text>
                                            </View>
                                            <View style={styles.statItem}>
                                                <Text style={styles.statValue}>KES {avgPricePerKg.toFixed(2)}</Text>
                                                <Text style={styles.statLabel}>Avg Price/kg</Text>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>

                        <View style={styles.insightContainer}>
                            <Text style={styles.insightTitle}>Supplier Insights:</Text>
                            <Text style={styles.insightText}>• AgriFeeds Co. provides consistent pricing across orders</Text>
                            <Text style={styles.insightText}>• Transport costs vary by supplier location</Text>
                            <Text style={styles.insightText}>• Bulk orders typically reduce per-kg costs</Text>
                        </View>
                    </View>
                );

            case 'costs':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.chartContainer}>
                            <Text style={styles.chartTitle}>Monthly Feeding Cost Trend</Text>
                            <LineChart
                                data={costTrendData}
                                width={screenWidth - 64}
                                height={220}
                                chartConfig={chartConfig}
                                style={styles.chart}
                                bezier
                            />
                        </View>

                        <View style={styles.costBreakdown}>
                            <Text style={styles.sectionTitle}>Cost Breakdown</Text>
                            <View style={styles.costGrid}>
                                <View style={styles.costMetric}>
                                    <Text style={styles.costValue}>KES {totalPurchaseCost.toLocaleString()}</Text>
                                    <Text style={styles.costLabel}>Feed Purchase Cost</Text>
                                    <Text style={styles.costPercentage}>
                                        {((totalPurchaseCost / totalCost) * 100).toFixed(1)}%
                                    </Text>
                                </View>
                                <View style={styles.costMetric}>
                                    <Text style={styles.costValue}>KES {totalTransportCost}</Text>
                                    <Text style={styles.costLabel}>Transport Cost</Text>
                                    <Text style={styles.costPercentage}>
                                        {((totalTransportCost / totalCost) * 100).toFixed(1)}%
                                    </Text>
                                </View>
                                <View style={styles.costMetric}>
                                    <Text style={styles.costValue}>KES {avgCostPerAnimal.toFixed(2)}</Text>
                                    <Text style={styles.costLabel}>Cost per Animal</Text>
                                    <Text style={styles.costPercentage}>Average</Text>
                                </View>
                                <View style={styles.costMetric}>
                                    <Text style={styles.costValue}>KES {avgCostPerKg.toFixed(2)}</Text>
                                    <Text style={styles.costLabel}>Cost per Kg</Text>
                                    <Text style={styles.costPercentage}>Average</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.insightContainer}>
                            <Text style={styles.insightTitle}>Cost Insights:</Text>
                            <Text style={styles.insightText}>• Feed costs have increased by 5.2% over the last quarter</Text>
                            <Text style={styles.insightText}>• Transport represents {((totalTransportCost / totalCost) * 100).toFixed(1)}% of total feeding costs</Text>
                            <Text style={styles.insightText}>• Group feeding shows better cost efficiency per animal</Text>
                            <Text style={styles.insightText}>• Seasonal variations impact feed prices significantly</Text>
                        </View>
                    </View>
                );

            default:
                return null;
        }
    };

    const renderAnalysisTab = ({ id, label, icon }) => (
        <TouchableOpacity
            key={id}
            style={[styles.analysisTab, activeTab === id && styles.activeAnalysisTab]}
            onPress={() => setActiveTab(id)}
        >
            <Icon name={icon} size={20} color={activeTab === id ? '#4C7153' : '#666'} />
            <Text style={[styles.analysisTabText, activeTab === id && styles.activeAnalysisTabText]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Header navigation={navigation} />
            <ScrollView style={styles.scrollView}>
                <LinearGradient
                    colors={['#4C7153', '#8CD18C']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.welcomeBanner}
                >
                    <View style={styles.welcomeTextContainer}>
                        <Text style={styles.welcomeTitle}>Feeding Analytics</Text>
                        <Text style={styles.welcomeSubtitle}>
                            Track feed consumption, costs,{"\n"}and supplier performance
                        </Text>
                    </View>
                    <View style={styles.welcomeIconContainer}>
                        <Icon name="food" size={60} color="rgba(255,255,255,0.8)" />
                    </View>
                </LinearGradient>

                <View style={styles.overviewSection}>
                    <Text style={styles.overviewTitle}>Feed Management</Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.monthSelector} onPress={() => setShowPeriodModal(true)}>
                            <Text style={styles.monthText}>{selectedPeriod}</Text>
                            <Icon name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.manageButton}
                            onPress={() => navigation.navigate('FeedingRecordsScreen')}
                        >
                            <Icon name="notebook" size={20} color="#fff" />
                            <Text style={styles.manageButtonText}>Feed Records</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {renderFeedingTypeSelector()}

                <View style={styles.kpiGrid}>
                    {kpiCards.map(renderKPICard)}
                </View>

                <View style={styles.analysisSection}>
                    <Text style={styles.sectionTitle}>Detailed Analytics</Text>

                    <View style={styles.analysisTabsContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScrollView}>
                            {analysisTabs.map(renderAnalysisTab)}
                        </ScrollView>
                    </View>

                    <View style={styles.tabContentContainer}>
                        {renderTabContent()}
                    </View>
                </View>

                <View style={styles.quickActionsSection}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActionsGrid}>
                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => navigation.navigate('FeedingRecordsScreen')}
                        >
                            <Icon name="notebook" size={24} color="#4C7153" />
                            <Text style={styles.quickActionText}>View Feed Records</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => navigation.navigate('AddFeedingRecord')}
                        >
                            <Icon name="plus-circle" size={24} color="#4C7153" />
                            <Text style={styles.quickActionText}>Add Feeding Record</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickActionButton}>
                            <Icon name="file-excel" size={24} color="#4C7153" />
                            <Text style={styles.quickActionText}>Export Report</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => navigation.navigate('InventoryAnalyticsScreen')}
                        >
                            <Icon name="warehouse" size={24} color="#4C7153" />
                            <Text style={styles.quickActionText}>Feed Inventory</Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => navigation.navigate('SuppliersScreen')}
                        >
                            <Icon name="truck-delivery" size={24} color="#4C7153" />
                            <Text style={styles.quickActionText}>Manage Suppliers</Text>
                        </TouchableOpacity> */}
                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => navigation.navigate('FeedingScheduleScreen')}
                        >
                            <Icon name="calendar-clock" size={24} color="#4C7153" />
                            <Text style={styles.quickActionText}>Feeding Schedule</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            <Modal
                visible={showPeriodModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowPeriodModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowPeriodModal(false)}
                >
                    <View style={styles.periodModalContainer}>
                        <Text style={styles.modalTitle}>Select Time Period</Text>
                        {timePeriods.map((period) => (
                            <TouchableOpacity
                                key={period}
                                style={[styles.periodOption, selectedPeriod === period && styles.selectedPeriodOption]}
                                onPress={() => {
                                    setSelectedPeriod(period);
                                    setShowPeriodModal(false);
                                }}
                            >
                                <Text style={[styles.periodOptionText, selectedPeriod === period && styles.selectedPeriodOptionText]}>
                                    {period}
                                </Text>
                                {selectedPeriod === period && <Icon name="check" size={20} color={COLORS.green} />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA'
    },
    scrollView: {
        flex: 1
    },
    welcomeBanner: {
        margin: 16,
        padding: 20,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        overflow: 'hidden',
        minHeight: 140,
    },
    welcomeTextContainer: {
        flex: 1,
        paddingRight: 20
    },
    welcomeTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8
    },
    welcomeSubtitle: {
        fontSize: 14,
        color: '#fff',
        lineHeight: 20,
        opacity: 0.9
    },
    welcomeIconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    overviewSection: {
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    overviewTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333'
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    monthSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    monthText: {
        marginRight: 4,
        color: '#333',
        fontWeight: '500'
    },
    manageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4C7153',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        gap: 4,
    },
    manageButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    feedingTypeSelector: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 16,
        gap: 8,
    },
    feedingTypeButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        borderRadius: 20,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    activeFeedingTypeButton: {
        backgroundColor: '#E8F4EA',
        borderColor: '#4C7153',
        borderWidth: 1,
    },
    feedingTypeText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    activeFeedingTypeText: {
        color: '#4C7153',
        fontWeight: '600',
    },
    kpiGrid: {
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    kpiCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    kpiHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    changeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    changeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    kpiTitle: {
        color: '#fff',
        fontSize: 12,
        opacity: 0.9,
        marginBottom: 4,
    },
    kpiValue: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
    },
    analysisSection: {
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    analysisTabsContainer: {
        marginBottom: 16,
    },
    tabScrollView: {
        flexGrow: 0,
    },
    analysisTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderRadius: 20,
        marginRight: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        gap: 6,
    },
    activeAnalysisTab: {
        backgroundColor: '#E8F4EA',
        borderColor: '#4C7153',
        borderWidth: 1,
    },
    analysisTabText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    activeAnalysisTabText: {
        color: '#4C7153',
        fontWeight: '600',
    },
    tabContentContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    tabContent: {
        flex: 1,
    },
    chartContainer: {
        marginBottom: 20,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
        textAlign: 'center',
    },
    chart: {
        marginVertical: 8,
        borderRadius: 12,
    },
    insightContainer: {
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 12,
        marginTop: 16,
    },
    insightTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    insightText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 4,
    },
    feedTypeBreakdown: {
        marginBottom: 20,
    },
    typeCard: {
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#4C7153',
    },
    typeName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    typeStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4C7153',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    supplierBreakdown: {
        marginBottom: 20,
    },
    supplierCard: {
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#4C7153',
    },
    supplierName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    supplierStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    costBreakdown: {
        marginBottom: 20,
    },
    costGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    costMetric: {
        width: '48%',
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
        borderLeftWidth: 4,
        borderLeftColor: '#4C7153',
    },
    costValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#4C7153',
        marginBottom: 4,
    },
    costLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginBottom: 4,
    },
    costPercentage: {
        fontSize: 12,
        color: '#4C7153',
        fontWeight: '600',
    },
    quickActionsSection: {
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    quickActionButton: {
        width: '48%',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        gap: 8,
    },
    quickActionText: {
        fontSize: 12,
        color: '#333',
        textAlign: 'center',
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    periodModalContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        width: '80%',
        maxWidth: 300,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    periodOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 4,
    },
    selectedPeriodOption: {
        backgroundColor: '#E8F4EA',
    },
    periodOptionText: {
        fontSize: 16,
        color: '#333',
    },
    selectedPeriodOptionText: {
        color: '#4C7153',
        fontWeight: '600',
    },
});

export default FeedingAnalyticsScreen;