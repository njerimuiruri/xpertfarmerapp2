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

const LivestockAnalyticsScreen = () => {
    const navigation = useNavigation();
    const [selectedPeriod, setSelectedPeriod] = useState('This month');
    const [showPeriodModal, setShowPeriodModal] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);

    const [livestock] = useState([
        {
            id: 1,
            type: 'Milking Cows',
            quantity: 50,
            currentValue: 25000,
            currentWeight: 450,
            acquisitionDate: '2025-05-08',
            category: 'Dairy',
            healthStatus: 'Good',
            productivity: 85,
            birthCount: 1
        },
        {
            id: 2,
            type: 'Calves',
            quantity: 1,
            currentValue: 10000,
            currentWeight: 80,
            acquisitionDate: '2025-05-08',
            category: 'Young Stock',
            healthStatus: 'Excellent',
            productivity: 90,
            birthCount: 0
        },
        {
            id: 3,
            type: 'Breeding Bulls',
            quantity: 2,
            currentValue: 15000,
            currentWeight: 650,
            acquisitionDate: '2025-04-15',
            category: 'Breeding',
            healthStatus: 'Good',
            productivity: 88,
            birthCount: 0
        }
    ]);

    const timePeriods = ['This week', 'This month', 'This quarter', 'This year'];
    const livestockCategories = ['Dairy', 'Beef', 'Breeding', 'Young Stock'];
    const healthStatuses = ['Excellent', 'Good', 'Fair', 'Poor'];

    // Financial calculations
    const totalLivestock = livestock.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = livestock.reduce((sum, item) => sum + item.currentValue, 0);
    const avgValue = totalValue / totalLivestock || 0;
    const totalBirths = livestock.reduce((sum, item) => sum + item.birthCount, 0);
    const avgProductivity = livestock.reduce((sum, item) => sum + (item.productivity || 0), 0) / livestock.length || 0;

    // Chart configurations
    const chartConfig = {
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        color: (opacity = 1) => `rgba(76, 113, 83, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.7,
        useShadowColorFromDataset: false,
    };

    // Livestock category distribution for pie chart
    const categoryData = livestockCategories.map(category => {
        const count = livestock.filter(item => item.category === category).reduce((sum, item) => sum + item.quantity, 0);
        const colors = ['#4C7153', '#8CD18C', '#A7E3A7', '#CBD18F'];
        return {
            name: category,
            population: count,
            color: colors[livestockCategories.indexOf(category)] || '#4C7153',
            legendFontColor: '#333',
            legendFontSize: 12,
        };
    }).filter(item => item.population > 0);

    // Health status distribution for bar chart
    const healthData = {
        labels: healthStatuses.filter(status => livestock.some(item => item.healthStatus === status)),
        datasets: [{
            data: healthStatuses
                .filter(status => livestock.some(item => item.healthStatus === status))
                .map(status => livestock.filter(item => item.healthStatus === status).reduce((sum, item) => sum + item.quantity, 0))
        }]
    };

    // Productivity trend data (sample)
    const productivityTrendData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            data: [82, 84, 86, 87, 85, Math.round(avgProductivity)],
            color: (opacity = 1) => `rgba(76, 113, 83, ${opacity})`,
            strokeWidth: 3
        }]
    };

    const kpiCards = [
        {
            title: 'Total Livestock',
            value: totalLivestock.toString(),
            change: '+2',
            changeType: 'positive',
            icon: 'cow',
            colors: ['#8CD18C', '#4C7153'],
        },
        {
            title: 'Total Value',
            value: `KES ${totalValue.toLocaleString()}`,
            change: '+12.5%',
            changeType: 'positive',
            icon: 'cash',
            colors: ['#A7E3A7', '#4C7153'],
        },
        {
            title: 'Average Value',
            value: `KES ${avgValue.toFixed(0)}`,
            change: '+8.2%',
            changeType: 'positive',
            icon: 'calculator',
            colors: ['#CBD18F', '#4C7153'],
        },
        {
            title: 'New Births',
            value: totalBirths.toString(),
            change: '+1',
            changeType: 'positive',
            icon: 'baby-face',
            colors: ['#91D79E', '#4C7153'],
        },
    ];

    const analysisTabs = [
        { id: 'overview', label: 'Overview', icon: 'view-dashboard' },
        { id: 'categories', label: 'Categories', icon: 'format-list-bulleted' },
        { id: 'health', label: 'Health', icon: 'medical-bag' },
        { id: 'performance', label: 'Performance', icon: 'chart-line' },
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

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.chartContainer}>
                            <Text style={styles.chartTitle}>Livestock Category Distribution</Text>
                            {categoryData.length > 0 && (
                                <PieChart
                                    data={categoryData}
                                    width={screenWidth - 64}
                                    height={220}
                                    chartConfig={chartConfig}
                                    accessor="population"
                                    backgroundColor="transparent"
                                    paddingLeft="15"
                                    absolute
                                />
                            )}
                        </View>
                        <View style={styles.insightContainer}>
                            <Text style={styles.insightTitle}>Livestock Overview:</Text>
                            <Text style={styles.insightText}>• {totalLivestock} animals across {categoryData.length} categories</Text>
                            <Text style={styles.insightText}>• Total herd value: KES {totalValue.toLocaleString()}</Text>
                            <Text style={styles.insightText}>• Average value per animal: KES {avgValue.toFixed(0)}</Text>
                            <Text style={styles.insightText}>• Recent births: {totalBirths} new calves this period</Text>
                            <Text style={styles.insightText}>• Overall herd productivity: {avgProductivity.toFixed(1)}%</Text>
                        </View>
                    </View>
                );

            case 'categories':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.categoryBreakdown}>
                            <Text style={styles.sectionTitle}>Category Analysis</Text>
                            {livestockCategories.filter(category => livestock.some(item => item.category === category)).map(category => {
                                const categoryItems = livestock.filter(item => item.category === category);
                                const categoryCount = categoryItems.reduce((sum, item) => sum + item.quantity, 0);
                                const categoryValue = categoryItems.reduce((sum, item) => sum + item.currentValue, 0);
                                const avgCategoryProductivity = categoryItems.reduce((sum, item) => sum + (item.productivity || 0), 0) / categoryItems.length;
                                return (
                                    <View key={category} style={styles.categoryCard}>
                                        <Text style={styles.categoryName}>{category}</Text>
                                        <View style={styles.categoryStats}>
                                            <View style={styles.statItem}>
                                                <Text style={styles.statValue}>{categoryCount}</Text>
                                                <Text style={styles.statLabel}>Animals</Text>
                                            </View>
                                            <View style={styles.statItem}>
                                                <Text style={styles.statValue}>KES {categoryValue.toLocaleString()}</Text>
                                                <Text style={styles.statLabel}>Total Value</Text>
                                            </View>
                                            <View style={styles.statItem}>
                                                <Text style={styles.statValue}>{avgCategoryProductivity.toFixed(1)}%</Text>
                                                <Text style={styles.statLabel}>Avg Productivity</Text>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                        <View style={styles.insightContainer}>
                            <Text style={styles.insightTitle}>Category Insights:</Text>
                            <Text style={styles.insightText}>• Dairy cattle represent the largest category by value</Text>
                            <Text style={styles.insightText}>• Young stock shows excellent health potential</Text>
                            <Text style={styles.insightText}>• Breeding stock maintains good productivity rates</Text>
                        </View>
                    </View>
                );

            case 'health':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.chartContainer}>
                            <Text style={styles.chartTitle}>Health Status Distribution</Text>
                            {healthData.labels.length > 0 && (
                                <BarChart
                                    data={healthData}
                                    width={screenWidth - 64}
                                    height={220}
                                    chartConfig={chartConfig}
                                    style={styles.chart}
                                    showValuesOnTopOfBars
                                />
                            )}
                        </View>
                        <View style={styles.healthAnalysis}>
                            <Text style={styles.sectionTitle}>Health Metrics</Text>
                            <View style={styles.healthGrid}>
                                <View style={styles.healthMetric}>
                                    <Text style={styles.healthValue}>95%</Text>
                                    <Text style={styles.healthLabel}>Vaccination Rate</Text>
                                </View>
                                <View style={styles.healthMetric}>
                                    <Text style={styles.healthValue}>98%</Text>
                                    <Text style={styles.healthLabel}>Deworming Rate</Text>
                                </View>
                                <View style={styles.healthMetric}>
                                    <Text style={styles.healthValue}>2</Text>
                                    <Text style={styles.healthLabel}>Treatments This Month</Text>
                                </View>
                                <View style={styles.healthMetric}>
                                    <Text style={styles.healthValue}>KES 1,825</Text>
                                    <Text style={styles.healthLabel}>Health Costs</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.insightContainer}>
                            <Text style={styles.insightTitle}>Health Insights:</Text>
                            <Text style={styles.insightText}>• Overall herd health is excellent with 95% in good condition</Text>
                            <Text style={styles.insightText}>• Vaccination program is up to date</Text>
                            <Text style={styles.insightText}>• Preventive care costs are within budget</Text>
                            <Text style={styles.insightText}>• Regular health monitoring shows positive trends</Text>
                        </View>
                    </View>
                );

            case 'performance':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.chartContainer}>
                            <Text style={styles.chartTitle}>Productivity Trend</Text>
                            <LineChart
                                data={productivityTrendData}
                                width={screenWidth - 64}
                                height={220}
                                chartConfig={chartConfig}
                                style={styles.chart}
                                bezier
                            />
                        </View>
                        <View style={styles.performanceMetrics}>
                            <Text style={styles.sectionTitle}>Performance Metrics</Text>
                            <View style={styles.metricsGrid}>
                                <View style={styles.metricCard}>
                                    <Text style={styles.metricValue}>{avgProductivity.toFixed(1)}%</Text>
                                    <Text style={styles.metricLabel}>Overall Productivity</Text>
                                </View>
                                <View style={styles.metricCard}>
                                    <Text style={styles.metricValue}>450kg</Text>
                                    <Text style={styles.metricLabel}>Avg Weight</Text>
                                </View>
                                <View style={styles.metricCard}>
                                    <Text style={styles.metricValue}>18L</Text>
                                    <Text style={styles.metricLabel}>Daily Milk/Cow</Text>
                                </View>
                                <View style={styles.metricCard}>
                                    <Text style={styles.metricValue}>92%</Text>
                                    <Text style={styles.metricLabel}>Feed Efficiency</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.insightContainer}>
                            <Text style={styles.insightTitle}>Performance Insights:</Text>
                            <Text style={styles.insightText}>• Productivity has improved by 3% over the last quarter</Text>
                            <Text style={styles.insightText}>• Dairy cattle showing excellent milk production</Text>
                            <Text style={styles.insightText}>• Feed conversion efficiency is above industry standards</Text>
                            <Text style={styles.insightText}>• Weight gain trends are positive for young stock</Text>
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
                        <Text style={styles.welcomeTitle}>Livestock Analytics</Text>
                        <Text style={styles.welcomeSubtitle}>
                            Monitor herd performance and{"\n"}track livestock metrics
                        </Text>
                    </View>
                    <View style={styles.welcomeIconContainer}>
                        <Icon name="cow" size={60} color="rgba(255,255,255,0.8)" />
                    </View>
                </LinearGradient>

                <View style={styles.overviewSection}>
                    <Text style={styles.overviewTitle}>Herd Analytics</Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.monthSelector} onPress={() => setShowPeriodModal(true)}>
                            <Text style={styles.monthText}>{selectedPeriod}</Text>
                            <Icon name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.manageButton}
                            onPress={() => navigation.navigate('AssetsJournalScreen')}
                        >
                            <Icon name="book-open-page-variant" size={20} color="#fff" />
                            <Text style={styles.manageButtonText}>Assets Journal</Text>
                        </TouchableOpacity>
                    </View>
                </View>

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
                <View style={styles.farmOpsSection}>
                    <Text style={styles.sectionTitle}>Farm Operations</Text>
                    <View style={styles.farmOpsGrid}>
                        <TouchableOpacity
                            style={styles.farmOpsButton}
                            onPress={() => navigation.navigate('FeedingAnalyticsScreen')}
                        >
                            <LinearGradient colors={['#CBD18F', '#4C7153']} style={styles.farmOpsGradient}>
                                <Icon name="food" size={28} color="#fff" />
                                <Text style={styles.farmOpsText}>Feeding</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.farmOpsButton}
                            onPress={() => navigation.navigate('BreedingModuleLandingScreen')}
                        >
                            <LinearGradient colors={['#D79F91', '#BD91D7']} style={styles.farmOpsGradient}>
                                <Icon name="heart" size={28} color="#fff" />
                                <Text style={styles.farmOpsText}>Breeding</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.farmOpsButton}
                            onPress={() => navigation.navigate('HealthRecordsScreen')}
                        >
                            <LinearGradient colors={['#BD91D7', '#91D79E']} style={styles.farmOpsGradient}>
                                <Icon name="medical-bag" size={28} color="#fff" />
                                <Text style={styles.farmOpsText}>Health</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.farmOpsButton}
                            onPress={() => navigation.navigate('SalesLandingPage')}
                        >
                            <LinearGradient colors={['#91D79E', '#4C7153']} style={styles.farmOpsGradient}>
                                <Icon name="factory" size={28} color="#fff" />
                                <Text style={styles.farmOpsText}>Sales</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.farmOpsButton}
                            onPress={() => navigation.navigate('InventoryDashboard')}
                        >
                            <LinearGradient colors={['#F4EBD0', '#D79F91']} style={styles.farmOpsGradient}>
                                <Icon name="warehouse" size={28} color="#fff" />
                                <Text style={styles.farmOpsText}>Inventory</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.quickActionsSection}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActionsGrid}>
                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => navigation.navigate('AssetsJournalScreen')}
                        >
                            <Icon name="book-open-page-variant" size={24} color="#4C7153" />
                            <Text style={styles.quickActionText}>View Assets Journal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => navigation.navigate('LivestockModuleScreen')}
                        >
                            <Icon name="cow" size={24} color="#4C7153" />
                            <Text style={styles.quickActionText}>Manage Livestock</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickActionButton}>
                            <Icon name="file-excel" size={24} color="#4C7153" />
                            <Text style={styles.quickActionText}>Export Report</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => navigation.navigate('HealthRecordsScreen')}
                        >
                            <Icon name="medical-bag" size={24} color="#4C7153" />
                            <Text style={styles.quickActionText}>Health Records</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => navigation.navigate('BreedingRecordsScreen')}
                        >
                            <Icon name="heart" size={24} color="#4C7153" />
                            <Text style={styles.quickActionText}>Breeding Records</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => navigation.navigate('SalesLandingPage')}
                        >
                            <Icon name="chart-box-outline" size={24} color="#4C7153" />
                            <Text style={styles.quickActionText}>Sales Records</Text>
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
    kpiGrid: {
        paddingHorizontal: 16,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    kpiCard: {
        width: '47%',
        padding: 16,
        borderRadius: 12,
        minHeight: 120,
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
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        gap: 2,
    },
    changeText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: '600',
    },
    kpiTitle: {
        fontSize: 12,
        color: '#fff',
        opacity: 0.9,
        marginBottom: 4,
    },
    kpiValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    analysisSection: {
        paddingHorizontal: 16,
        marginBottom: 24,
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
        marginRight: 12,
        backgroundColor: '#fff',
        borderRadius: 20,
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
        borderRadius: 12,
        padding: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    tabContent: {
        minHeight: 300,
    },
    chartContainer: {
        marginBottom: 16,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    chart: {
        borderRadius: 8,
    },
    insightContainer: {
        marginTop: 20,
        padding: 16,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
    },
    insightTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    insightText: {
        fontSize: 13,
        color: '#666',
        marginBottom: 4,
        lineHeight: 18,
    },
    categoryBreakdown: {
        marginBottom: 20,
    },
    categoryCard: {
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    categoryStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4C7153',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
    },
    healthAnalysis: {
        marginTop: 16,
    },
    healthGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
    },
    healthMetric: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    healthValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4C7153',
        marginBottom: 4,
    },
    healthLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    performanceMetrics: {
        marginTop: 16,
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
    },
    metricCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    metricValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4C7153',
        marginBottom: 4,
    },
    metricLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    farmOpsSection: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    farmOpsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    farmOpsButton: {
        width: '30%',
        height: 100,
        borderRadius: 12,
        overflow: 'hidden',
    },
    farmOpsGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    farmOpsText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
    },
    quickActionsSection: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    quickActionButton: {
        width: '47%',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        gap: 8,
    },
    quickActionText: {
        fontSize: 12,
        color: '#333',
        fontWeight: '500',
        textAlign: 'center',
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
        minWidth: 300,
        maxWidth: '80%',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    periodOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    selectedPeriodOption: {
        backgroundColor: '#E8F4EA',
    },
    periodOptionText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    selectedPeriodOptionText: {
        color: '#4C7153',
        fontWeight: '600',
    },
});

export default LivestockAnalyticsScreen;