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

const SalesAnalyticsScreen = () => {
    const navigation = useNavigation();
    const [selectedPeriod, setSelectedPeriod] = useState('This month');
    const [showPeriodModal, setShowPeriodModal] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);

    // Sample sales data - replace with actual API calls
    const [salesData] = useState([
        // Dairy Sales
        {
            id: 1,
            category: 'Dairy Cattle',
            product: 'Milk',
            buyer: 'Local Dairy',
            quantity: 500,
            unit: 'L',
            unitPrice: 1.50,
            totalSales: 750,
            saleDate: '2025-05-11',
            marketPrice: 1.40,
            numberOfAnimals: 25,
            yield: 20, // liters per animal
            lactationPeriod: 305
        },
        {
            id: 2,
            category: 'Dairy Cattle',
            product: 'Milk',
            buyer: 'Retail Store',
            quantity: 200,
            unit: 'L',
            unitPrice: 1.70,
            totalSales: 340,
            saleDate: '2025-05-20',
            marketPrice: 1.60,
            numberOfAnimals: 25,
            yield: 8,
            lactationPeriod: 305
        },
        // Beef Sales
        {
            id: 3,
            category: 'Beef Cattle',
            product: 'Beef',
            buyer: 'KMC',
            quantity: 500,
            unit: 'kg',
            unitPrice: 4.00,
            totalSales: 2000,
            saleDate: '2025-05-14',
            marketPrice: 3.80,
            numberOfAnimals: 2,
            weaningWeight: 180,
            saleWeight: 250
        },
        {
            id: 4,
            category: 'Beef Cattle',
            product: 'Beef',
            buyer: 'Beef Market',
            quantity: 300,
            unit: 'kg',
            unitPrice: 5.00,
            totalSales: 1500,
            saleDate: '2025-05-14',
            marketPrice: 4.80,
            numberOfAnimals: 1,
            weaningWeight: 200,
            saleWeight: 300
        },
        // Goat Sales
        {
            id: 5,
            category: 'Dairy Goats',
            product: 'Goat Milk',
            buyer: 'Local Market',
            quantity: 50,
            unit: 'L',
            unitPrice: 3.00,
            totalSales: 150,
            saleDate: '2025-05-15',
            marketPrice: 2.80,
            numberOfAnimals: 10,
            yield: 5
        },
        {
            id: 6,
            category: 'Beef Goats',
            product: 'Goat Meat',
            buyer: 'Restaurant',
            quantity: 25,
            unit: 'kg',
            unitPrice: 8.00,
            totalSales: 200,
            saleDate: '2025-05-18',
            marketPrice: 7.50,
            numberOfAnimals: 1,
            saleWeight: 25
        },
        // Poultry Sales
        {
            id: 7,
            category: 'Poultry',
            product: 'Eggs',
            buyer: 'Supermarket',
            quantity: 300,
            unit: 'pieces',
            unitPrice: 0.25,
            totalSales: 75,
            saleDate: '2025-05-12',
            marketPrice: 0.22,
            flockSize: 50,
            layingRate: 6 // eggs per bird
        },
        {
            id: 8,
            category: 'Poultry',
            product: 'Chicken',
            buyer: 'Local Butcher',
            quantity: 20,
            unit: 'birds',
            unitPrice: 12.00,
            totalSales: 240,
            saleDate: '2025-05-16',
            marketPrice: 11.50,
            flockSize: 20,
            avgWeight: 2.5
        },
        // Swine Sales
        {
            id: 9,
            category: 'Swine',
            product: 'Pork',
            buyer: 'Processing Plant',
            quantity: 180,
            unit: 'kg',
            unitPrice: 6.00,
            totalSales: 1080,
            saleDate: '2025-05-19',
            marketPrice: 5.80,
            numberOfAnimals: 2,
            saleWeight: 90
        },
        // Rabbit Sales
        {
            id: 10,
            category: 'Rabbit',
            product: 'Rabbit Meat',
            buyer: 'Restaurant',
            quantity: 15,
            unit: 'kg',
            unitPrice: 10.00,
            totalSales: 150,
            saleDate: '2025-05-21',
            marketPrice: 9.50,
            numberOfAnimals: 5,
            saleWeight: 3
        }
    ]);

    const timePeriods = ['This week', 'This month', 'This quarter', 'This year'];
    const categories = ['Dairy Cattle', 'Beef Cattle', 'Dairy Goats', 'Beef Goats', 'Poultry', 'Swine', 'Rabbit'];

    // Financial calculations
    const totalSales = salesData.reduce((sum, sale) => sum + sale.totalSales, 0);
    const totalRevenue = totalSales;
    const avgUnitPrice = salesData.reduce((sum, sale) => sum + sale.unitPrice, 0) / salesData.length || 0;
    const totalTransactions = salesData.length;
    const avgTransactionValue = totalSales / totalTransactions || 0;

    // Performance metrics
    const marketPriceDiff = salesData.reduce((sum, sale) => {
        return sum + ((sale.unitPrice - sale.marketPrice) / sale.marketPrice * 100);
    }, 0) / salesData.length || 0;

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

    // Category distribution for pie chart
    const categoryData = categories.map(category => {
        const categoryTotal = salesData
            .filter(sale => sale.category === category)
            .reduce((sum, sale) => sum + sale.totalSales, 0);
        const colors = ['#4C7153', '#8CD18C', '#A7E3A7', '#CBD18F', '#91D79E', '#7BC77B', '#5FA867'];
        return {
            name: category,
            population: categoryTotal,
            color: colors[categories.indexOf(category)] || '#4C7153',
            legendFontColor: '#333',
            legendFontSize: 12,
        };
    }).filter(item => item.population > 0);

    // Monthly sales trend data (sample)
    const salesTrendData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            data: [3200, 3800, 4200, 4800, totalSales, 5200],
            color: (opacity = 1) => `rgba(76, 113, 83, ${opacity})`,
            strokeWidth: 3
        }]
    };

    // Category performance bar chart
    const categoryPerformanceData = {
        labels: categories.filter(cat => salesData.some(sale => sale.category === cat)).map(cat => cat.split(' ')[0]),
        datasets: [{
            data: categories
                .filter(cat => salesData.some(sale => sale.category === cat))
                .map(cat => salesData.filter(sale => sale.category === cat).reduce((sum, sale) => sum + sale.totalSales, 0))
        }]
    };

    const kpiCards = [
        {
            title: 'Total Revenue',
            value: `KES ${totalRevenue.toLocaleString()}`,
            change: '+12.5%',
            changeType: 'positive',
            icon: 'cash-multiple',
            colors: ['#8CD18C', '#4C7153'],
        },
        {
            title: 'Total Transactions',
            value: totalTransactions.toString(),
            change: '+8',
            changeType: 'positive',
            icon: 'chart-line',
            colors: ['#A7E3A7', '#4C7153'],
        },
        {
            title: 'Avg Transaction Value',
            value: `KES ${avgTransactionValue.toFixed(0)}`,
            change: '+15.2%',
            changeType: 'positive',
            icon: 'calculator',
            colors: ['#CBD18F', '#4C7153'],
        },
        {
            title: 'Price Premium',
            value: `${marketPriceDiff.toFixed(1)}%`,
            change: '+2.1%',
            changeType: 'positive',
            icon: 'trending-up',
            colors: ['#91D79E', '#4C7153'],
        },
    ];

    const analysisTabs = [
        { id: 'overview', label: 'Overview', icon: 'view-dashboard' },
        { id: 'dairy-cattle', label: 'Dairy Cattle', icon: 'cow' },
        { id: 'beef-cattle', label: 'Beef Cattle', icon: 'cow' },
        { id: 'goats', label: 'Goats', icon: 'sheep' },
        { id: 'poultry', label: 'Poultry', icon: 'bird' },
        { id: 'swine', label: 'Swine', icon: 'pig' },
        { id: 'rabbit', label: 'Rabbit', icon: 'rabbit' },
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

    const renderCategoryContent = (category) => {
        const categoryData = salesData.filter(sale => {
            if (category === 'goats') {
                return sale.category.includes('Goat');
            }
            return sale.category.toLowerCase().includes(category.replace('-', ' '));
        });

        const categoryRevenue = categoryData.reduce((sum, sale) => sum + sale.totalSales, 0);
        const avgPrice = categoryData.reduce((sum, sale) => sum + sale.unitPrice, 0) / categoryData.length || 0;
        const totalQuantity = categoryData.reduce((sum, sale) => sum + sale.quantity, 0);

        return (
            <View style={styles.tabContent}>
                <View style={styles.categoryOverview}>
                    <Text style={styles.sectionTitle}>{category.replace('-', ' ').toUpperCase()} Performance</Text>
                    <View style={styles.categoryMetrics}>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricValue}>KES {categoryRevenue.toLocaleString()}</Text>
                            <Text style={styles.metricLabel}>Total Revenue</Text>
                        </View>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricValue}>{categoryData.length}</Text>
                            <Text style={styles.metricLabel}>Transactions</Text>
                        </View>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricValue}>KES {avgPrice.toFixed(2)}</Text>
                            <Text style={styles.metricLabel}>Avg Unit Price</Text>
                        </View>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricValue}>{totalQuantity}</Text>
                            <Text style={styles.metricLabel}>Total Quantity</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.salesBreakdown}>
                    <Text style={styles.sectionTitle}>Recent Sales</Text>
                    {categoryData.slice(0, 5).map(sale => (
                        <View key={sale.id} style={styles.saleCard}>
                            <View style={styles.saleHeader}>
                                <Text style={styles.saleProduct}>{sale.product}</Text>
                                <Text style={styles.saleAmount}>KES {sale.totalSales.toLocaleString()}</Text>
                            </View>
                            <View style={styles.saleDetails}>
                                <Text style={styles.saleDetail}>Buyer: {sale.buyer}</Text>
                                <Text style={styles.saleDetail}>Qty: {sale.quantity} {sale.unit}</Text>
                                <Text style={styles.saleDetail}>Price: KES {sale.unitPrice.toFixed(2)}/{sale.unit}</Text>
                                <Text style={styles.saleDetail}>Date: {new Date(sale.saleDate).toLocaleDateString()}</Text>
                            </View>
                            {sale.numberOfAnimals && (
                                <Text style={styles.saleDetail}>Animals: {sale.numberOfAnimals}</Text>
                            )}
                            {sale.flockSize && (
                                <Text style={styles.saleDetail}>Flock Size: {sale.flockSize}</Text>
                            )}
                        </View>
                    ))}
                </View>

                <View style={styles.insightContainer}>
                    <Text style={styles.insightTitle}>Category Insights:</Text>
                    {category === 'dairy-cattle' && (
                        <>
                            <Text style={styles.insightText}>• Average yield: {(categoryData.reduce((sum, sale) => sum + (sale.yield || 0), 0) / categoryData.length || 0).toFixed(1)} L per animal</Text>
                            <Text style={styles.insightText}>• Lactation period: {categoryData[0]?.lactationPeriod || 305} days</Text>
                            <Text style={styles.insightText}>• Price premium over market: {((avgPrice - 1.50) / 1.50 * 100).toFixed(1)}%</Text>
                        </>
                    )}
                    {category === 'beef-cattle' && (
                        <>
                            <Text style={styles.insightText}>• Average sale weight: {(categoryData.reduce((sum, sale) => sum + (sale.saleWeight || 0), 0) / categoryData.length || 0).toFixed(0)} kg</Text>
                            <Text style={styles.insightText}>• Weight gain from weaning: {(categoryData.reduce((sum, sale) => sum + ((sale.saleWeight || 0) - (sale.weaningWeight || 0)), 0) / categoryData.length || 0).toFixed(0)} kg</Text>
                        </>
                    )}
                    {category === 'poultry' && (
                        <>
                            <Text style={styles.insightText}>• Egg production rate: Strong performance with {categoryData.filter(sale => sale.product === 'Eggs').length} egg sales</Text>
                            <Text style={styles.insightText}>• Meat sales complementing egg production</Text>
                        </>
                    )}
                    <Text style={styles.insightText}>• Total category contribution: {((categoryRevenue / totalRevenue) * 100).toFixed(1)}% of total revenue</Text>
                </View>
            </View>
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.chartContainer}>
                            <Text style={styles.chartTitle}>Revenue by Category</Text>
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

                        <View style={styles.chartContainer}>
                            <Text style={styles.chartTitle}>Sales Trend</Text>
                            <LineChart
                                data={salesTrendData}
                                width={screenWidth - 64}
                                height={220}
                                chartConfig={chartConfig}
                                style={styles.chart}
                                bezier
                            />
                        </View>

                        <View style={styles.insightContainer}>
                            <Text style={styles.insightTitle}>Sales Overview:</Text>
                            <Text style={styles.insightText}>• Total revenue: KES {totalRevenue.toLocaleString()} from {totalTransactions} transactions</Text>
                            <Text style={styles.insightText}>• Top performing category: {categoryData.sort((a, b) => b.population - a.population)[0]?.name}</Text>
                            <Text style={styles.insightText}>• Average price premium: {marketPriceDiff.toFixed(1)}% above market rates</Text>
                            <Text style={styles.insightText}>• Diversified portfolio across {categories.filter(cat => salesData.some(sale => sale.category === cat || sale.category.includes(cat.split(' ')[0]))).length} categories</Text>
                        </View>
                    </View>
                );

            case 'dairy-cattle':
                return renderCategoryContent('dairy-cattle');
            case 'beef-cattle':
                return renderCategoryContent('beef-cattle');
            case 'goats':
                return renderCategoryContent('goats');
            case 'poultry':
                return renderCategoryContent('poultry');
            case 'swine':
                return renderCategoryContent('swine');
            case 'rabbit':
                return renderCategoryContent('rabbit');

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
                        <Text style={styles.welcomeTitle}>Sales Analytics</Text>
                        <Text style={styles.welcomeSubtitle}>
                            Track livestock sales performance and{"\n"}analyze revenue across categories
                        </Text>
                    </View>
                    <View style={styles.welcomeIconContainer}>
                        <Icon name="chart-box" size={60} color="rgba(255,255,255,0.8)" />
                    </View>
                </LinearGradient>

                <View style={styles.overviewSection}>
                    <Text style={styles.overviewTitle}>Sales Analytics</Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.monthSelector} onPress={() => setShowPeriodModal(true)}>
                            <Text style={styles.monthText}>{selectedPeriod}</Text>
                            <Icon name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.manageButton}
                            onPress={() => navigation.navigate('SalesRecordsScreen')}
                        >
                            <Icon name="clipboard-list" size={20} color="#fff" />
                            <Text style={styles.manageButtonText}>Records</Text>
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

                <View style={styles.quickActionsSection}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActionsGrid}>
                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => navigation.navigate('SalesRecordsScreen')}
                        >
                            <Icon name="clipboard-list" size={24} color="#4C7153" />
                            <Text style={styles.quickActionText}>View All Sales</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickActionButton}>
                            <Icon name="file-excel" size={24} color="#4C7153" />
                            <Text style={styles.quickActionText}>Export Sales Data</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickActionButton}>
                            <Icon name="chart-box-outline" size={24} color="#4C7153" />
                            <Text style={styles.quickActionText}>Sales Report</Text>
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
        marginBottom: 24,
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
    categoryOverview: {
        marginBottom: 24,
    },
    categoryMetrics: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 12,
    },
    metricCard: {
        width: '47%',
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderLeftWidth: 3,
        borderLeftColor: '#4C7153',
    },
    metricValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    metricLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    salesBreakdown: {
        marginBottom: 24,
    },
    saleCard: {
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#8CD18C',
    },
    saleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    saleProduct: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    saleAmount: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4C7153',
    },
    saleDetails: {
        gap: 2,
    },
    saleDetail: {
        fontSize: 12,
        color: '#666',
    },
    insightContainer: {
        backgroundColor: '#F0F8F2',
        padding: 16,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#4C7153',
    },
    insightTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    insightText: {
        fontSize: 12,
        color: '#555',
        lineHeight: 16,
        marginBottom: 4,
    },
    quickActionsSection: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    quickActionButton: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
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
        fontWeight: '500',
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    periodModalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '50%',
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
        paddingHorizontal: 10,
        borderRadius: 8,
        marginBottom: 8,
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

export default SalesAnalyticsScreen;