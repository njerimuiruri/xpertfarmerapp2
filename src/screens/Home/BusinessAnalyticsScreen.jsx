import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Dimensions,
} from 'react-native';
import Header from '../../components/headers/main-header';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../constants/theme';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';

const { width: screenWidth } = Dimensions.get('window');

const BusinessAnalyticsScreen = () => {
    const navigation = useNavigation();
    const [selectedPeriod, setSelectedPeriod] = useState('This month');
    const [showPeriodModal, setShowPeriodModal] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState('overview');
    const [activeTab, setActiveTab] = useState('revenue');
    const [loading, setLoading] = useState(false);

    const timePeriods = ['This week', 'This month', 'This quarter', 'This year'];

    const financialData = {
        revenue: {
            total: 14590,
            dairySales: 1090,
            beefSales: 3500,
            biologicalGains: 10000
        },
        expenses: {
            total: 4460,
            feeds: 840,
            health: 1075,
            breeding: 255,
            salaries: 2240,
            machinery: 15
        },
        assets: {
            total: 2250815,
            livestock: 35000,
            facilities: 99500,
            waterStock: 2070000,
            powerStock: 45000,
            machinery: 1015,
            boosterStock: 300
        },
        cashFlow: {
            operating: 125,
            investing: -2240815,
            financing: 0
        },
        profitability: {
            grossProfit: 10130,
            netProfit: 10130,
            profitMargin: 69.4
        }
    };

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

    // Revenue breakdown pie chart data
    const revenueBreakdownData = [
        {
            name: 'Biological Gains',
            population: financialData.revenue.biologicalGains,
            color: '#4C7153',
            legendFontColor: '#333',
            legendFontSize: 12,
        },
        {
            name: 'Beef Sales',
            population: financialData.revenue.beefSales,
            color: '#8CD18C',
            legendFontColor: '#333',
            legendFontSize: 12,
        },
        {
            name: 'Dairy Sales',
            population: financialData.revenue.dairySales,
            color: '#A7E3A7',
            legendFontColor: '#333',
            legendFontSize: 12,
        },
    ];

    // Expense breakdown pie chart data
    const expenseBreakdownData = [
        {
            name: 'Salaries',
            population: financialData.expenses.salaries,
            color: '#D79F91',
            legendFontColor: '#333',
            legendFontSize: 12,
        },
        {
            name: 'Health',
            population: financialData.expenses.health,
            color: '#BD91D7',
            legendFontColor: '#333',
            legendFontSize: 12,
        },
        {
            name: 'Feeds',
            population: financialData.expenses.feeds,
            color: '#CBD18F',
            legendFontColor: '#333',
            legendFontSize: 12,
        },
        {
            name: 'Breeding',
            population: financialData.expenses.breeding,
            color: '#91D79E',
            legendFontColor: '#333',
            legendFontSize: 12,
        },
    ];

    // Monthly trend data (sample)
    const monthlyTrendData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [
            {
                data: [8000, 9500, 12000, 13500, 14590],
                color: (opacity = 1) => `rgba(76, 113, 83, ${opacity})`,
                strokeWidth: 2,
            },
        ],
    };

    const kpiCards = [
        {
            title: 'Total Revenue',
            value: `KES ${financialData.revenue.total.toLocaleString()}`,
            change: '+12.5%',
            changeType: 'positive',
            icon: 'chart-line-variant',
            colors: ['#8CD18C', '#4C7153'],
        },
        {
            title: 'Net Profit',
            value: `KES ${financialData.profitability.netProfit.toLocaleString()}`,
            change: '+8.3%',
            changeType: 'positive',
            icon: 'trending-up',
            colors: ['#A7E3A7', '#4C7153'],
        },
        {
            title: 'Total Expenses',
            value: `KES ${financialData.expenses.total.toLocaleString()}`,
            change: '+5.1%',
            changeType: 'negative',
            icon: 'cash-minus',
            colors: ['#F4EBD0', '#D79F91'],
        },
        {
            title: 'Profit Margin',
            value: `${financialData.profitability.profitMargin.toFixed(1)}%`,
            change: '+2.1%',
            changeType: 'positive',
            icon: 'percent',
            colors: ['#CBD18F', '#4C7153'],
        },
    ];

    // Farm Operations Sections
    const farmSections = [
        {
            title: 'Employees',
            subtitle: 'Staff management',
            icon: 'account-group',
            colors: ['#8CD18C', '#4C7153'],
            onPress: () => navigation.navigate('EmployeesAnalyticsScreen'),
        },
        {
            title: 'Livestock',
            subtitle: 'Animal inventory',
            icon: 'cow',
            colors: ['#A7E3A7', '#4C7153'],
            onPress: () => navigation.navigate('LivestockAnalyticsScreen'),
        },
        {
            title: 'Feeding',
            subtitle: 'Feed management',
            icon: 'food',
            colors: ['#CBD18F', '#4C7153'],
            onPress: () => navigation.navigate('FeedingAnalyticsScreen'),
        },
        {
            title: 'Health',
            subtitle: 'Veterinary care',
            icon: 'medical-bag',
            colors: ['#BD91D7', '#91D79E'],
            onPress: () => navigation.navigate('HealthAnalyticsScreen'),
        },
        {
            title: 'Breeding',
            subtitle: 'Reproduction tracking',
            icon: 'heart',
            colors: ['#D79F91', '#BD91D7'],
            onPress: () => navigation.navigate('BreedingAnalyticsScreen'),
        },
        {
            title: 'Sales',
            subtitle: 'Milk & beef output',
            icon: 'factory',
            colors: ['#91D79E', '#4C7153'],
            onPress: () => navigation.navigate('SalesAnalyticsScreen'),
        },
        {
            title: 'Inventory',
            subtitle: 'Assets & supplies',
            icon: 'warehouse',
            colors: ['#F4EBD0', '#D79F91'],
            onPress: () => navigation.navigate('InventoryAnalyticsScreen'),
        }
    ];

    const analysisTabs = [
        { id: 'revenue', label: 'Revenue', icon: 'chart-pie' },
        { id: 'expenses', label: 'Expenses', icon: 'chart-donut' },
        { id: 'cashflow', label: 'Cash Flow', icon: 'cash-fast' },
        { id: 'assets', label: 'Assets', icon: 'bank' },
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

    const renderFarmSectionCard = ({ title, subtitle, icon, colors, onPress }) => (
        <TouchableOpacity key={title} onPress={onPress} style={styles.sectionCardWrapper}>
            <LinearGradient colors={colors} style={styles.sectionCard}>
                <Icon name={icon} size={32} color="#fff" />
                <View style={styles.sectionCardContent}>
                    <Text style={styles.sectionCardTitle}>{title}</Text>
                    <Text style={styles.sectionCardSubtitle}>{subtitle}</Text>
                </View>
                <Icon name="chevron-right" size={20} color="#fff" />
            </LinearGradient>
        </TouchableOpacity>
    );

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

    const renderTabContent = () => {
        switch (activeTab) {
            case 'revenue':
                return (
                    <View style={styles.tabContent}>
                        <PieChart
                            data={revenueBreakdownData}
                            width={screenWidth - 64}
                            height={220}
                            chartConfig={chartConfig}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="15"
                            absolute
                        />
                        <View style={styles.insightContainer}>
                            <Text style={styles.insightTitle}>Revenue Insights:</Text>
                            <Text style={styles.insightText}>• Biological gains account for 68.5% of total revenue</Text>
                            <Text style={styles.insightText}>• Beef sales contribute 24% to revenue stream</Text>
                            <Text style={styles.insightText}>• Dairy sales show potential for growth optimization</Text>
                        </View>
                    </View>
                );

            case 'expenses':
                return (
                    <View style={styles.tabContent}>
                        <PieChart
                            data={expenseBreakdownData}
                            width={screenWidth - 64}
                            height={220}
                            chartConfig={chartConfig}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="15"
                            absolute
                        />
                        <View style={styles.insightContainer}>
                            <Text style={styles.insightTitle}>Expense Analysis:</Text>
                            <Text style={styles.insightText}>• Labor costs represent 50.2% of total expenses</Text>
                            <Text style={styles.insightText}>• Health expenses require cost optimization review</Text>
                            <Text style={styles.insightText}>• Feed management shows efficient cost control</Text>
                        </View>
                    </View>
                );

            case 'cashflow':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.cashFlowGrid}>
                            <View style={styles.cashFlowItem}>
                                <Text style={styles.cashFlowLabel}>Operating</Text>
                                <Text style={[styles.cashFlowValue, { color: '#4C7153' }]}>
                                    +KES {Math.abs(financialData.cashFlow.operating).toLocaleString()}
                                </Text>
                            </View>
                            <View style={styles.cashFlowItem}>
                                <Text style={styles.cashFlowLabel}>Investing</Text>
                                <Text style={[styles.cashFlowValue, { color: '#D79F91' }]}>
                                    -KES {Math.abs(financialData.cashFlow.investing).toLocaleString()}
                                </Text>
                            </View>
                            <View style={styles.cashFlowItem}>
                                <Text style={styles.cashFlowLabel}>Financing</Text>
                                <Text style={styles.cashFlowValue}>
                                    KES {financialData.cashFlow.financing.toLocaleString()}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.insightContainer}>
                            <Text style={styles.insightTitle}>Cash Flow Health:</Text>
                            <Text style={styles.insightText}>• Positive operational cash flow indicates healthy operations</Text>
                            <Text style={styles.insightText}>• Significant infrastructure investment period</Text>
                            <Text style={styles.insightText}>• Consider diversifying revenue streams</Text>
                        </View>
                    </View>
                );

            case 'assets':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.assetGrid}>
                            <View style={styles.assetItem}>
                                <Text style={styles.assetLabel}>Water Infrastructure</Text>
                                <Text style={styles.assetValue}>92%</Text>
                            </View>
                            <View style={styles.assetItem}>
                                <Text style={styles.assetLabel}>Facilities</Text>
                                <Text style={styles.assetValue}>4.4%</Text>
                            </View>
                            <View style={styles.assetItem}>
                                <Text style={styles.assetLabel}>Livestock</Text>
                                <Text style={styles.assetValue}>1.6%</Text>
                            </View>
                            <View style={styles.assetItem}>
                                <Text style={styles.assetLabel}>Power Systems</Text>
                                <Text style={styles.assetValue}>2%</Text>
                            </View>
                        </View>
                        <View style={styles.insightContainer}>
                            <Text style={styles.insightTitle}>Asset Distribution:</Text>
                            <Text style={styles.insightText}>• Major capital allocation in water infrastructure</Text>
                            <Text style={styles.insightText}>• Balanced facility and power system development</Text>
                            <Text style={styles.insightText}>• Livestock expansion opportunities available</Text>
                        </View>
                    </View>
                );

            default:
                return null;
        }
    };

    const renderOverviewChart = () => (
        <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Revenue Trend Overview</Text>
            <LineChart
                data={monthlyTrendData}
                width={screenWidth - 32}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
            />
            <View style={styles.insightContainer}>
                <Text style={styles.insightTitle}>Performance Overview:</Text>
                <Text style={styles.insightText}>• Consistent revenue growth over 5-month period</Text>
                <Text style={styles.insightText}>• 82% increase from January to May</Text>
                <Text style={styles.insightText}>• Strong upward business trajectory</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Header navigation={navigation} />
            <ScrollView style={styles.scrollView}>
                {/* Welcome Banner */}
                <LinearGradient
                    colors={['#4C7153', '#8CD18C']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.welcomeBanner}
                >
                    <View style={styles.welcomeTextContainer}>
                        <Text style={styles.welcomeTitle}>Business Analytics</Text>
                        <Text style={styles.welcomeSubtitle}>
                            Track your farm's financial performance{"\n"}and make data-driven decisions
                        </Text>
                    </View>
                    <View style={styles.welcomeIconContainer}>
                        <Icon name="chart-line" size={60} color="rgba(255,255,255,0.8)" />
                    </View>
                </LinearGradient>

                {/* Period Selector */}
                <View style={styles.overviewSection}>
                    <Text style={styles.overviewTitle}>Financial Overview</Text>
                    <TouchableOpacity style={styles.monthSelector} onPress={() => setShowPeriodModal(true)}>
                        <Text style={styles.monthText}>{selectedPeriod}</Text>
                        <Icon name="chevron-down" size={20} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* KPI Cards */}
                <View style={styles.kpiGrid}>
                    {kpiCards.map(renderKPICard)}
                </View>

                {/* Overview Chart */}
                {renderOverviewChart()}

                {/* Farm Operations Sections */}
                <View style={styles.sectionsContainer}>
                    <Text style={styles.sectionTitle}>Farm Operations</Text>
                    <View style={styles.sectionsGrid}>
                        {farmSections.map(renderFarmSectionCard)}
                    </View>
                </View>

                {/* Detailed Analysis with Tabs */}
                <View style={styles.analysisSection}>
                    <Text style={styles.sectionTitle}>Detailed Financial Analysis</Text>

                    <View style={styles.analysisTabsContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScrollView}>
                            {analysisTabs.map(renderAnalysisTab)}
                        </ScrollView>
                    </View>

                    <View style={styles.tabContentContainer}>
                        {renderTabContent()}
                    </View>
                </View>

                <View style={styles.journalSection}>
                    <Text style={styles.sectionTitle}>Financial Journals</Text>
                    <View style={styles.journalGrid}>
                        <TouchableOpacity
                            style={styles.journalCard}
                            onPress={() => navigation.navigate('SalesJournalScreen')}
                        >
                            <LinearGradient colors={['#8CD18C', '#4C7153']} style={styles.journalGradient}>
                                <Icon name="cash-register" size={28} color="#fff" />
                                <Text style={styles.journalTitle}>Sales Journal</Text>
                                <Text style={styles.journalSubtitle}>Revenue entries</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.journalCard}
                            onPress={() => navigation.navigate('PurchaseJournalScreen')}
                        >
                            <LinearGradient colors={['#D79F91', '#BD91D7']} style={styles.journalGradient}>
                                <Icon name="shopping" size={28} color="#fff" />
                                <Text style={styles.journalTitle}>Purchases Journal</Text>
                                <Text style={styles.journalSubtitle}>Expense tracking</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.journalCard}
                            onPress={() => navigation.navigate('AssetsJournalScreen')}
                        >
                            <LinearGradient colors={['#CBD18F', '#4C7153']} style={styles.journalGradient}>
                                <Icon name="bank" size={28} color="#fff" />
                                <Text style={styles.journalTitle}>Assets Journal</Text>
                                <Text style={styles.journalSubtitle}>Asset management</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.journalCard}
                            onPress={() => navigation.navigate('PayrollJournalScreen')}
                        >
                            <LinearGradient colors={['#91D79E', '#4C7153']} style={styles.journalGradient}>
                                <Icon name="account-group" size={28} color="#fff" />
                                <Text style={styles.journalTitle}>Payroll Journal</Text>
                                <Text style={styles.journalSubtitle}>Employee wages</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.journalCard}
                            onPress={() => navigation.navigate('GeneralJournalScreen')}
                        >
                            <LinearGradient colors={['#F4EBD0', '#D79F91']} style={styles.journalGradient}>
                                <Icon name="book-open-variant" size={28} color="#fff" />
                                <Text style={styles.journalTitle}>General Journal</Text>
                                <Text style={styles.journalSubtitle}>All transactions</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.journalCard}
                            onPress={() => navigation.navigate('GeneralLedgerScreen')}
                        >
                            <LinearGradient colors={['#A7E3A7', '#4C7153']} style={styles.journalGradient}>
                                <Icon name="book-multiple" size={28} color="#fff" />
                                <Text style={styles.journalTitle}>General Ledger</Text>
                                <Text style={styles.journalSubtitle}>Account summaries</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActionsSection}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActionsGrid}>
                        <TouchableOpacity style={styles.quickActionButton}>
                            <Icon name="download" size={24} color="#4C7153" />
                            <Text style={styles.quickActionText}>Export Report</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickActionButton}>
                            <Icon name="calendar" size={24} color="#4C7153" />
                            <Text style={styles.quickActionText}>Schedule Report</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickActionButton}>
                            <Icon name="share" size={24} color="#4C7153" />
                            <Text style={styles.quickActionText}>Share Analytics</Text>
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
    chartContainer: {
        margin: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
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
    sectionsContainer: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    sectionsGrid: {
        gap: 12,
    },
    sectionCardWrapper: {
        marginBottom: 8,
    },
    sectionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 16,
    },
    sectionCardContent: {
        flex: 1,
    },
    sectionCardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    sectionCardSubtitle: {
        fontSize: 13,
        color: '#fff',
        opacity: 0.9,
    },
    analysisSection: {
        paddingHorizontal: 16,
        marginBottom: 24,
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
    cashFlowGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 16,
    },
    cashFlowItem: {
        flex: 1,
        minWidth: '30%',
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    cashFlowLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
        textAlign: 'center',
    },
    cashFlowValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    assetGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 16,
    },
    assetItem: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    assetLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
        textAlign: 'center',
    },
    assetValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4C7153',
        textAlign: 'center',
    },
    journalSection: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    journalGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    journalCard: {
        width: '47%',
        height: 120,
        borderRadius: 12,
        overflow: 'hidden',
    },
    journalGradient: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
    journalTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    journalSubtitle: {
        fontSize: 12,
        color: '#fff',
        opacity: 0.9,
        textAlign: 'center',
    },
    quickActionsSection: {
        paddingHorizontal: 16,
        marginBottom: 32,
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
        color: '#4C7153',
        fontWeight: '500',
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
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
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    selectedPeriodOption: {
        backgroundColor: '#E8F4EA',
        borderRadius: 8,
        marginVertical: 2,
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

export default BusinessAnalyticsScreen;