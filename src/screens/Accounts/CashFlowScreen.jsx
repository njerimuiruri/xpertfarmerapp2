import React, { useState, useMemo } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Dimensions,
    Alert
} from 'react-native';
import Header from '../../components/headers/main-header';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../constants/theme';
import { LineChart, BarChart } from 'react-native-chart-kit';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CashFlowScreen = () => {
    const navigation = useNavigation();
    const [selectedPeriod, setSelectedPeriod] = useState('This month');
    const [showPeriodModal, setShowPeriodModal] = useState(false);
    const [activeView, setActiveView] = useState('statement'); // 'statement', 'analysis', 'forecast'
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showExportModal, setShowExportModal] = useState(false);

    const timePeriods = ['This week', 'This month', 'This quarter', 'This year'];
    const viewOptions = [
        { id: 'statement', label: 'Cash Flow Statement', icon: 'file-document-outline' },
        { id: 'analysis', label: 'Flow Analysis', icon: 'chart-line-variant' },
        { id: 'forecast', label: 'Cash Forecast', icon: 'crystal-ball' },
    ];

    // Cash flow data based on your accounting structure
    const cashFlowData = {
        operating: {
            cashInflows: {
                dairySales: 1090,
                beefSales: 3500,
                // biologicalGains excluded as non-cash
                total: 4590
            },
            cashOutflows: {
                feeds: 840,
                healthVaccination: 215,
                healthDeworming: 215,
                healthTreatment: 215,
                healthAllergies: 50,
                healthGenetics: 50,
                healthBoosters: 380,
                breedingServices: 255,
                salariesWages: 2240,
                machineryService: 15,
                total: 4475
            },
            netOperating: 115
        },
        investing: {
            cashOutflows: {
                livestock: 25000,
                powerStock: 45000,
                waterInfrastructure: 2070000,
                machinery: 1015,
                facilities: 99500,
                boosterStock: 300,
                total: 2240815
            },
            netInvesting: -2240815
        },
        financing: {
            cashInflows: 0,
            cashOutflows: 0,
            netFinancing: 0
        }
    };

    // Calculate totals
    const totalCashInflow = cashFlowData.operating.cashInflows.total + cashFlowData.financing.cashInflows;
    const totalCashOutflow = cashFlowData.operating.cashOutflows.total +
        cashFlowData.investing.cashOutflows.total +
        cashFlowData.financing.cashOutflows;
    const netCashFlow = totalCashInflow - totalCashOutflow;

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

    // Cash flow trend data (sample)
    const cashFlowTrendData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
            {
                data: [1200, 800, 1500, 1090],
                color: (opacity = 1) => `rgba(76, 113, 83, ${opacity})`,
                strokeWidth: 2,
            },
        ],
    };

    // Cash flow by category for bar chart
    const categoryFlowData = {
        labels: ['Operating', 'Investing', 'Financing'],
        datasets: [
            {
                data: [
                    cashFlowData.operating.netOperating,
                    cashFlowData.investing.netInvesting / 1000, // Scale down for visibility
                    cashFlowData.financing.netFinancing
                ],
                color: (opacity = 1) => `rgba(76, 113, 83, ${opacity})`,
                strokeWidth: 2,
            },
        ],
    };

    // Forecast data (sample)
    const forecastData = [
        { month: 'Jun', operating: 2500, investing: -50000, total: -47500 },
        { month: 'Jul', operating: 3200, investing: -30000, total: -26800 },
        { month: 'Aug', operating: 3800, investing: -20000, total: -16200 },
        { month: 'Sep', operating: 4200, investing: -15000, total: -10800 },
        { month: 'Oct', operating: 4800, investing: -10000, total: -5200 },
        { month: 'Nov', operating: 5200, investing: -5000, total: 200 },
    ];

    const formatCurrency = (amount) => {
        const absAmount = Math.abs(amount);
        if (absAmount >= 1000000) {
            return `${(absAmount / 1000000).toFixed(1)}M`;
        } else if (absAmount >= 1000) {
            return `${(absAmount / 1000).toFixed(0)}K`;
        }
        return absAmount.toLocaleString();
    };

    const formatFullCurrency = (amount) => {
        return `KES ${Math.abs(amount).toLocaleString()}`;
    };

    const getCashFlowColor = (amount) => {
        if (amount > 0) return '#4C7153';
        if (amount < 0) return '#D79F91';
        return '#666';
    };

    const handleExport = (format) => {
        setShowExportModal(false);
        Alert.alert('Export Successful', `Cash flow statement exported as ${format.toUpperCase()}`);
    };

    const renderSummaryCards = () => (
        <View style={styles.summaryCardsContainer}>
            <LinearGradient colors={['#8CD18C', '#4C7153']} style={styles.summaryCard}>
                <View style={styles.summaryCardHeader}>
                    <Icon name="cash-plus" size={28} color="#fff" />
                    <View style={[styles.changeIndicator, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                        <Icon name="arrow-up" size={12} color="#fff" />
                        <Text style={styles.changeText}>+12.5%</Text>
                    </View>
                </View>
                <Text style={styles.summaryCardTitle}>Cash Inflows</Text>
                <Text style={styles.summaryCardValue}>{formatFullCurrency(totalCashInflow)}</Text>
                <Text style={styles.summaryCardDetail}>Operating revenue</Text>
            </LinearGradient>

            <LinearGradient colors={['#F4EBD0', '#D79F91']} style={styles.summaryCard}>
                <View style={styles.summaryCardHeader}>
                    <Icon name="cash-minus" size={28} color="#fff" />
                    <View style={[styles.changeIndicator, { backgroundColor: 'rgba(255,0,0,0.2)' }]}>
                        <Icon name="arrow-up" size={12} color="#fff" />
                        <Text style={styles.changeText}>+1,250%</Text>
                    </View>
                </View>
                <Text style={styles.summaryCardTitle}>Cash Outflows</Text>
                <Text style={styles.summaryCardValue}>{formatFullCurrency(totalCashOutflow)}</Text>
                <Text style={styles.summaryCardDetail}>Major investments</Text>
            </LinearGradient>

            <LinearGradient
                colors={netCashFlow >= 0 ? ['#A7E3A7', '#4C7153'] : ['#D79F91', '#BD91D7']}
                style={[styles.summaryCard, styles.fullWidthCard]}
            >
                <View style={styles.summaryCardHeader}>
                    <Icon name={netCashFlow >= 0 ? "trending-up" : "trending-down"} size={28} color="#fff" />
                    <View style={styles.cashFlowStatus}>
                        <Icon name={netCashFlow >= 0 ? "check-circle" : "alert-circle"} size={16} color="#fff" />
                        <Text style={styles.statusText}>
                            {netCashFlow >= 0 ? 'Positive Flow' : 'Negative Flow'}
                        </Text>
                    </View>
                </View>
                <Text style={styles.summaryCardTitle}>Net Cash Flow</Text>
                <Text style={styles.summaryCardValue}>
                    {netCashFlow < 0 ? '-' : ''}{formatFullCurrency(netCashFlow)}
                </Text>
                <Text style={styles.summaryCardDetail}>
                    {netCashFlow >= 0
                        ? 'Strong operating performance'
                        : 'Investment phase - monitor closely'
                    }
                </Text>
            </LinearGradient>
        </View>
    );

    const renderCashFlowStatement = () => (
        <View style={styles.statementContainer}>
            <Text style={styles.sectionTitle}>Cash Flow Statement</Text>

            {/* Operating Activities */}
            <View style={styles.cashFlowSection}>
                <View style={styles.sectionHeader}>
                    <Icon name="factory" size={24} color="#4C7153" />
                    <Text style={styles.sectionHeaderText}>Operating Activities</Text>
                </View>

                <View style={styles.subsectionHeader}>
                    <Text style={styles.subsectionTitle}>Cash Inflows</Text>
                </View>
                <View style={styles.flowItem}>
                    <Text style={styles.flowItemLabel}>Dairy Sales</Text>
                    <Text style={[styles.flowItemValue, { color: '#4C7153' }]}>
                        +{formatFullCurrency(cashFlowData.operating.cashInflows.dairySales)}
                    </Text>
                </View>
                <View style={styles.flowItem}>
                    <Text style={styles.flowItemLabel}>Beef Sales</Text>
                    <Text style={[styles.flowItemValue, { color: '#4C7153' }]}>
                        +{formatFullCurrency(cashFlowData.operating.cashInflows.beefSales)}
                    </Text>
                </View>
                <View style={[styles.flowItem, styles.totalItem]}>
                    <Text style={styles.totalLabel}>Total Operating Inflows</Text>
                    <Text style={[styles.totalValue, { color: '#4C7153' }]}>
                        +{formatFullCurrency(cashFlowData.operating.cashInflows.total)}
                    </Text>
                </View>

                <View style={styles.subsectionHeader}>
                    <Text style={styles.subsectionTitle}>Cash Outflows</Text>
                </View>
                <View style={styles.flowItem}>
                    <Text style={styles.flowItemLabel}>Feeds</Text>
                    <Text style={[styles.flowItemValue, { color: '#D79F91' }]}>
                        -{formatFullCurrency(cashFlowData.operating.cashOutflows.feeds)}
                    </Text>
                </View>
                <View style={styles.flowItem}>
                    <Text style={styles.flowItemLabel}>Health Services</Text>
                    <Text style={[styles.flowItemValue, { color: '#D79F91' }]}>
                        -{formatFullCurrency(1075)} {/* Sum of all health expenses */}
                    </Text>
                </View>
                <View style={styles.flowItem}>
                    <Text style={styles.flowItemLabel}>Salaries & Wages</Text>
                    <Text style={[styles.flowItemValue, { color: '#D79F91' }]}>
                        -{formatFullCurrency(cashFlowData.operating.cashOutflows.salariesWages)}
                    </Text>
                </View>
                <View style={styles.flowItem}>
                    <Text style={styles.flowItemLabel}>Breeding Services</Text>
                    <Text style={[styles.flowItemValue, { color: '#D79F91' }]}>
                        -{formatFullCurrency(cashFlowData.operating.cashOutflows.breedingServices)}
                    </Text>
                </View>
                <View style={[styles.flowItem, styles.totalItem]}>
                    <Text style={styles.totalLabel}>Total Operating Outflows</Text>
                    <Text style={[styles.totalValue, { color: '#D79F91' }]}>
                        -{formatFullCurrency(cashFlowData.operating.cashOutflows.total)}
                    </Text>
                </View>

                <View style={[styles.flowItem, styles.netItem]}>
                    <Text style={styles.netLabel}>Net Cash from Operating Activities</Text>
                    <Text style={[styles.netValue, { color: getCashFlowColor(cashFlowData.operating.netOperating) }]}>
                        {cashFlowData.operating.netOperating >= 0 ? '+' : '-'}
                        {formatFullCurrency(cashFlowData.operating.netOperating)}
                    </Text>
                </View>
            </View>

            {/* Investing Activities */}
            <View style={styles.cashFlowSection}>
                <View style={styles.sectionHeader}>
                    <Icon name="bank" size={24} color="#4C7153" />
                    <Text style={styles.sectionHeaderText}>Investing Activities</Text>
                </View>

                <View style={styles.subsectionHeader}>
                    <Text style={styles.subsectionTitle}>Cash Outflows</Text>
                </View>
                <View style={styles.flowItem}>
                    <Text style={styles.flowItemLabel}>Livestock Purchase</Text>
                    <Text style={[styles.flowItemValue, { color: '#D79F91' }]}>
                        -{formatFullCurrency(cashFlowData.investing.cashOutflows.livestock)}
                    </Text>
                </View>
                <View style={styles.flowItem}>
                    <Text style={styles.flowItemLabel}>Water Infrastructure</Text>
                    <Text style={[styles.flowItemValue, { color: '#D79F91' }]}>
                        -{formatFullCurrency(cashFlowData.investing.cashOutflows.waterInfrastructure)}
                    </Text>
                </View>
                <View style={styles.flowItem}>
                    <Text style={styles.flowItemLabel}>Facilities & Equipment</Text>
                    <Text style={[styles.flowItemValue, { color: '#D79F91' }]}>
                        -{formatFullCurrency(cashFlowData.investing.cashOutflows.facilities + cashFlowData.investing.cashOutflows.powerStock)}
                    </Text>
                </View>
                <View style={styles.flowItem}>
                    <Text style={styles.flowItemLabel}>Machinery & Tools</Text>
                    <Text style={[styles.flowItemValue, { color: '#D79F91' }]}>
                        -{formatFullCurrency(cashFlowData.investing.cashOutflows.machinery)}
                    </Text>
                </View>
                <View style={[styles.flowItem, styles.totalItem]}>
                    <Text style={styles.totalLabel}>Total Investing Outflows</Text>
                    <Text style={[styles.totalValue, { color: '#D79F91' }]}>
                        -{formatFullCurrency(cashFlowData.investing.cashOutflows.total)}
                    </Text>
                </View>

                <View style={[styles.flowItem, styles.netItem]}>
                    <Text style={styles.netLabel}>Net Cash from Investing Activities</Text>
                    <Text style={[styles.netValue, { color: getCashFlowColor(cashFlowData.investing.netInvesting) }]}>
                        -{formatFullCurrency(Math.abs(cashFlowData.investing.netInvesting))}
                    </Text>
                </View>
            </View>

            {/* Financing Activities */}
            <View style={styles.cashFlowSection}>
                <View style={styles.sectionHeader}>
                    <Icon name="credit-card" size={24} color="#4C7153" />
                    <Text style={styles.sectionHeaderText}>Financing Activities</Text>
                </View>

                <View style={styles.flowItem}>
                    <Text style={styles.flowItemLabel}>No financing activities recorded</Text>
                    <Text style={styles.flowItemValue}>-</Text>
                </View>

                <View style={[styles.flowItem, styles.netItem]}>
                    <Text style={styles.netLabel}>Net Cash from Financing Activities</Text>
                    <Text style={[styles.netValue, { color: getCashFlowColor(cashFlowData.financing.netFinancing) }]}>
                        {formatFullCurrency(cashFlowData.financing.netFinancing)}
                    </Text>
                </View>
            </View>

            {/* Net Change in Cash */}
            <View style={[styles.cashFlowSection, styles.finalSection]}>
                <LinearGradient
                    colors={netCashFlow >= 0 ? ['#E8F4EA', '#fff'] : ['#FFE6E6', '#fff']}
                    style={styles.finalSummary}
                >
                    <View style={[styles.flowItem, styles.finalItem]}>
                        <Text style={styles.finalLabel}>Net Change in Cash</Text>
                        <Text style={[styles.finalValue, { color: getCashFlowColor(netCashFlow) }]}>
                            {netCashFlow >= 0 ? '+' : '-'}{formatFullCurrency(netCashFlow)}
                        </Text>
                    </View>
                    <View style={styles.finalNote}>
                        <Icon
                            name={netCashFlow >= 0 ? "information" : "alert"}
                            size={16}
                            color={getCashFlowColor(netCashFlow)}
                        />
                        <Text style={styles.finalNoteText}>
                            {netCashFlow >= 0
                                ? 'Positive cash generation indicates healthy operations'
                                : 'Significant investment period - ensure adequate financing'
                            }
                        </Text>
                    </View>
                </LinearGradient>
            </View>
        </View>
    );

    const renderFlowAnalysis = () => (
        <View style={styles.analysisContainer}>
            <Text style={styles.sectionTitle}>Cash Flow Analysis</Text>

            {/* Cash Flow Trend Chart */}
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Weekly Cash Flow Trend</Text>
                <LineChart
                    data={cashFlowTrendData}
                    width={screenWidth - 64}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chart}
                />
                <View style={styles.chartInsights}>
                    <Text style={styles.insightTitle}>Trend Analysis:</Text>
                    <Text style={styles.insightText}>• Operating cash flows show seasonal variation</Text>
                    <Text style={styles.insightText}>• Week 3 peak reflects major sales activity</Text>
                    <Text style={styles.insightText}>• Consistent positive operating performance</Text>
                </View>
            </View>

            {/* Category Comparison */}
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Cash Flow by Category</Text>
                <BarChart
                    data={categoryFlowData}
                    width={screenWidth - 64}
                    height={220}
                    chartConfig={chartConfig}
                    style={styles.chart}
                    showValuesOnTopOfBars
                />
                <Text style={styles.chartNote}>
                    *Investing amounts shown in thousands for scale
                </Text>
                <View style={styles.chartInsights}>
                    <Text style={styles.insightTitle}>Category Insights:</Text>
                    <Text style={styles.insightText}>• Operating activities generate consistent positive cash</Text>
                    <Text style={styles.insightText}>• Major infrastructure investment phase ongoing</Text>
                    <Text style={styles.insightText}>• No financing activities - self-funded growth</Text>
                </View>
            </View>

            {/* Cash Flow Ratios */}
            <View style={styles.ratiosContainer}>
                <Text style={styles.ratiosTitle}>Key Cash Flow Ratios</Text>
                <View style={styles.ratiosGrid}>
                    <View style={styles.ratioCard}>
                        <Text style={styles.ratioLabel}>Operating Cash Ratio</Text>
                        <Text style={styles.ratioValue}>2.6%</Text>
                        <Text style={styles.ratioDescription}>Operating cash / Revenue</Text>
                    </View>
                    <View style={styles.ratioCard}>
                        <Text style={styles.ratioLabel}>Cash Coverage Ratio</Text>
                        <Text style={styles.ratioValue}>0.05</Text>
                        <Text style={styles.ratioDescription}>Operating cash / Total expenses</Text>
                    </View>
                    <View style={styles.ratioCard}>
                        <Text style={styles.ratioLabel}>Investment Intensity</Text>
                        <Text style={styles.ratioValue}>488x</Text>
                        <Text style={styles.ratioDescription}>Investment / Operating cash</Text>
                    </View>
                    <View style={styles.ratioCard}>
                        <Text style={styles.ratioLabel}>Cash Burn Rate</Text>
                        <Text style={styles.ratioValue}>KES 2.2M</Text>
                        <Text style={styles.ratioDescription}>Monthly investment outflow</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderCashForecast = () => (
        <View style={styles.forecastContainer}>
            <Text style={styles.sectionTitle}>6-Month Cash Flow Forecast</Text>

            <View style={styles.forecastTable}>
                <View style={styles.forecastHeader}>
                    <Text style={[styles.forecastHeaderText, { flex: 1 }]}>Month</Text>
                    <Text style={[styles.forecastHeaderText, { flex: 1.5 }]}>Operating</Text>
                    <Text style={[styles.forecastHeaderText, { flex: 1.5 }]}>Investing</Text>
                    <Text style={[styles.forecastHeaderText, { flex: 1.5 }]}>Net Flow</Text>
                </View>

                {forecastData.map((item, index) => (
                    <View key={item.month} style={[styles.forecastRow, index % 2 === 0 && styles.evenRow]}>
                        <Text style={[styles.forecastCell, { flex: 1 }]}>{item.month}</Text>
                        <Text style={[styles.forecastCell, { flex: 1.5, color: '#4C7153' }]}>
                            +{formatCurrency(item.operating)}
                        </Text>
                        <Text style={[styles.forecastCell, { flex: 1.5, color: '#D79F91' }]}>
                            {formatCurrency(item.investing)}
                        </Text>
                        <Text style={[styles.forecastCell, {
                            flex: 1.5,
                            color: getCashFlowColor(item.total),
                            fontWeight: 'bold'
                        }]}>
                            {item.total >= 0 ? '+' : ''}{formatCurrency(item.total)}
                        </Text>
                    </View>
                ))}
            </View>

            <View style={styles.forecastInsights}>
                <Text style={styles.insightTitle}>Forecast Insights:</Text>
                <Text style={styles.insightText}>• Operating cash flows projected to improve</Text>
                <Text style={styles.insightText}>• Investment spending to gradually decrease</Text>
                <Text style={styles.insightText}>• Positive net cash flow expected by November</Text>
                <Text style={styles.insightText}>• Infrastructure investments paying off</Text>
            </View>

            <View style={styles.recommendationsContainer}>
                <Text style={styles.recommendationsTitle}>Cash Flow Recommendations</Text>
                <View style={styles.recommendationItem}>
                    <Icon name="lightbulb-outline" size={16} color="#4C7153" />
                    <Text style={styles.recommendationText}>
                        Monitor cash reserves to ensure adequate liquidity during investment phase
                    </Text>
                </View>
                <View style={styles.recommendationItem}>
                    <Icon name="lightbulb-outline" size={16} color="#4C7153" />
                    <Text style={styles.recommendationText}>
                        Consider staggering major capital investments to maintain cash flow stability
                    </Text>
                </View>
                <View style={styles.recommendationItem}>
                    <Icon name="lightbulb-outline" size={16} color="#4C7153" />
                    <Text style={styles.recommendationText}>
                        Explore financing options for future expansion to preserve operating capital
                    </Text>
                </View>
                <View style={styles.recommendationItem}>
                    <Icon name="lightbulb-outline" size={16} color="#4C7153" />
                    <Text style={styles.recommendationText}>
                        Focus on optimizing operating cash flows through revenue growth initiatives
                    </Text>
                </View>
            </View>
        </View>
    );

    const renderViewContent = () => {
        switch (activeView) {
            case 'statement':
                return renderCashFlowStatement();
            case 'analysis':
                return renderFlowAnalysis();
            case 'forecast':
                return renderCashForecast();
            default:
                return renderCashFlowStatement();
        }
    };

    const renderViewTabs = () => (
        <View style={styles.viewTabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScrollView}>
                {viewOptions.map(({ id, label, icon }) => (
                    <TouchableOpacity
                        key={id}
                        style={[styles.viewTab, activeView === id && styles.activeViewTab]}
                        onPress={() => setActiveView(id)}
                    >
                        <Icon name={icon} size={18} color={activeView === id ? '#4C7153' : '#666'} />
                        <Text style={[styles.viewTabText, activeView === id && styles.activeViewTabText]}>
                            {label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    return (
        <View style={styles.container}>
            <Header navigation={navigation} />

            <LinearGradient
                colors={[COLORS.green, COLORS.green2]}
                style={styles.headerSection}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name="arrow-left" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>Cash Flow Statement</Text>
                        <Text style={styles.headerSubtitle}>Track cash movement and liquidity</Text>
                    </View>
                    <TouchableOpacity style={styles.exportButton} onPress={() => setShowExportModal(true)}>
                        <Icon name="download" size={20} color={COLORS.white} />
                        <Text style={styles.exportButtonText}>Export</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
            {/* Period Selector */}
            <View style={styles.controlsSection}>
                <TouchableOpacity style={styles.periodSelector} onPress={() => setShowPeriodModal(true)}>
                    <Text style={styles.periodText}>{selectedPeriod}</Text>
                    <Icon name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
            </View>

            {/* Summary Cards */}
            {renderSummaryCards()}

            {/* View Tabs */}
            {renderViewTabs()}

            <ScrollView style={styles.contentScrollView} showsVerticalScrollIndicator={false}>
                {renderViewContent()}
            </ScrollView>

            {/* Period Selection Modal */}
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
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Time Period</Text>
                        {timePeriods.map((period) => (
                            <TouchableOpacity
                                key={period}
                                style={[
                                    styles.periodOption,
                                    selectedPeriod === period && styles.selectedPeriodOption
                                ]}
                                onPress={() => {
                                    setSelectedPeriod(period);
                                    setShowPeriodModal(false);
                                }}
                            >
                                <Text style={[
                                    styles.periodOptionText,
                                    selectedPeriod === period && styles.selectedPeriodOptionText
                                ]}>
                                    {period}
                                </Text>
                                {selectedPeriod === period && (
                                    <Icon name="check" size={20} color="#4C7153" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Export Modal */}
            <Modal
                visible={showExportModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowExportModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowExportModal(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Export Cash Flow Statement</Text>
                        {['PDF', 'Excel', 'CSV'].map((format) => (
                            <TouchableOpacity
                                key={format}
                                style={styles.exportOption}
                                onPress={() => handleExport(format)}
                            >
                                <Icon
                                    name={format === 'PDF' ? 'file-pdf-box' : format === 'Excel' ? 'file-excel-box' : 'file-delimited-outline'}
                                    size={20}
                                    color="#4C7153"
                                />
                                <Text style={styles.exportOptionText}>Export as {format}</Text>
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
        backgroundColor: '#f8f9fa',
    },
    headerSection: {
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    headerTextContainer: {
        flex: 1,
        marginLeft: 16,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    headerSubtitle: {
        fontSize: 14,
        color: COLORS.white,
        opacity: 0.9,
        marginTop: 4,
    },
    exportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    exportButtonText: {
        color: COLORS.white,
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
    },
    controlsSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    periodSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
    },
    periodText: {
        fontSize: 14,
        color: '#333',
        marginRight: 8,
        fontWeight: '500',
    },
    summaryCardsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 12,
    },
    summaryCard: {
        width: (screenWidth - 52) / 2,
        padding: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    fullWidthCard: {
        width: screenWidth - 40,
    },
    summaryCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    changeIndicator: {
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
        fontWeight: 'bold',
    },
    cashFlowStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statusText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '500',
    },
    summaryCardTitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 4,
    },
    summaryCardValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    summaryCardDetail: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.7)',
    },
    viewTabsContainer: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    tabScrollView: {
        paddingHorizontal: 20,
    },
    viewTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginRight: 8,
        borderRadius: 8,
        backgroundColor: '#f9fafb',
        gap: 6,
    },
    activeViewTab: {
        backgroundColor: '#E8F4EA',
    },
    viewTabText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    activeViewTabText: {
        color: '#4C7153',
        fontWeight: 'bold',
    },
    contentScrollView: {
        flex: 1,
    },
    statementContainer: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    cashFlowSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    sectionHeaderText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    subsectionHeader: {
        marginTop: 8,
        marginBottom: 8,
    },
    subsectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    flowItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    flowItemLabel: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    flowItemValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    totalItem: {
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 8,
        marginVertical: 4,
        borderRadius: 6,
        borderBottomWidth: 0,
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    totalValue: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    netItem: {
        backgroundColor: '#E8F4EA',
        marginTop: 8,
        paddingHorizontal: 8,
        borderRadius: 6,
        borderBottomWidth: 0,
    },
    netLabel: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
    },
    netValue: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    finalSection: {
        backgroundColor: 'transparent',
        elevation: 0,
        shadowOpacity: 0,
        padding: 0,
    },
    finalSummary: {
        padding: 16,
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    finalItem: {
        borderBottomWidth: 0,
        paddingVertical: 12,
    },
    finalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    finalValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    finalNote: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 8,
        gap: 6,
    },
    finalNoteText: {
        fontSize: 12,
        color: '#666',
        flex: 1,
        lineHeight: 16,
    },
    analysisContainer: {
        padding: 20,
    },
    chartContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 8,
    },
    chartNote: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 4,
    },
    chartInsights: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    insightTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 6,
    },
    insightText: {
        fontSize: 13,
        color: '#666',
        marginBottom: 3,
        lineHeight: 18,
    },
    ratiosContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    ratiosTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    ratiosGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    ratioCard: {
        width: (screenWidth - 76) / 2,
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        alignItems: 'center',
    },
    ratioLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginBottom: 4,
    },
    ratioValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4C7153',
        marginBottom: 4,
    },
    ratioDescription: {
        fontSize: 10,
        color: '#999',
        textAlign: 'center',
    },
    forecastContainer: {
        padding: 20,
    },
    forecastTable: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    forecastHeader: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 2,
        borderBottomColor: '#4C7153',
        marginBottom: 8,
    },
    forecastHeaderText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4C7153',
        textAlign: 'center',
    },
    forecastRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    evenRow: {
        backgroundColor: '#f8f9fa',
    },
    forecastCell: {
        fontSize: 13,
        color: '#333',
        textAlign: 'center',
        fontWeight: '500',
    },
    forecastInsights: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    recommendationsContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    recommendationsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    recommendationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
        gap: 8,
    },
    recommendationText: {
        fontSize: 13,
        color: '#666',
        flex: 1,
        lineHeight: 18,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        minHeight: 200,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
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
        fontWeight: 'bold',
    },
    exportOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#f8f9fa',
        gap: 12,
    },
    exportOptionText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
});

export default CashFlowScreen;