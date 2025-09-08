import React, { useState, useMemo } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Dimensions,
    TextInput, Alert
} from 'react-native';
import Header from '../../components/headers/main-header';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../constants/theme';
import { PieChart, BarChart } from 'react-native-chart-kit';

const { width, height } = Dimensions.get('window');

const ProfitLossScreen = () => {
    const navigation = useNavigation();
    const [selectedPeriod, setSelectedPeriod] = useState('This month');
    const [showPeriodModal, setShowPeriodModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'detailed'

    const timePeriods = ['This week', 'This month', 'This quarter', 'This year'];

    // Chart configuration
    const chartConfig = {
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        color: (opacity = 1) => `rgba(76, 113, 83, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.7,
        useShadowColorFromDataset: false,
    };

    // Profit & Loss Data
    const profitLossData = {
        revenue: {
            dairySales: { amount: 1090, description: 'Milk sales revenue' },
            beefSales: { amount: 3500, description: 'Beef sales revenue' },
            biologicalGains: { amount: 10000, description: 'Livestock appreciation (newborn calf)' },
        },
        costOfGoodsSold: {
            feeds: { amount: 840, description: 'Animal feed costs' },
            healthVaccination: { amount: 215, description: 'Vaccination expenses' },
            healthDeworming: { amount: 215, description: 'Deworming treatments' },
            healthTreatment: { amount: 215, description: 'Medical treatments' },
            healthAllergies: { amount: 50, description: 'Allergy treatments' },
            healthGenetics: { amount: 50, description: 'Genetic services' },
            healthBoosters: { amount: 380, description: 'Boosters and additives' },
            servicing: { amount: 255, description: 'AI & breeding services' },
            salariesWages: { amount: 2240, description: 'Direct labor costs' },
        },
        operatingExpenses: {
            // No operating expenses recorded in current data
        }
    };

    // Calculate totals
    const totalRevenue = Object.values(profitLossData.revenue).reduce((sum, item) => sum + item.amount, 0);
    const totalCOGS = Object.values(profitLossData.costOfGoodsSold).reduce((sum, item) => sum + item.amount, 0);
    const totalOperatingExpenses = Object.values(profitLossData.operatingExpenses).reduce((sum, item) => sum + item.amount, 0);
    const grossProfit = totalRevenue - totalCOGS;
    const netProfit = grossProfit - totalOperatingExpenses;
    const grossMargin = totalRevenue ? (grossProfit / totalRevenue * 100) : 0;
    const netMargin = totalRevenue ? (netProfit / totalRevenue * 100) : 0;

    // Revenue breakdown for pie chart
    const revenueBreakdownData = Object.entries(profitLossData.revenue).map(([key, value], index) => ({
        name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        population: value.amount,
        color: ['#4C7153', '#8CD18C', '#A7E3A7', '#CBD18F'][index % 4],
        legendFontColor: '#333',
        legendFontSize: 11,
    }));

    // Expense breakdown for pie chart
    const expenseBreakdownData = [
        {
            name: 'Salaries & Wages',
            population: 2240,
            color: '#D79F91',
            legendFontColor: '#333',
            legendFontSize: 11,
        },
        {
            name: 'Health Services',
            population: 1125, // Sum of all health-related expenses
            color: '#BD91D7',
            legendFontColor: '#333',
            legendFontSize: 11,
        },
        {
            name: 'Feed Costs',
            population: 840,
            color: '#CBD18F',
            legendFontColor: '#333',
            legendFontSize: 11,
        },
        {
            name: 'Breeding Services',
            population: 255,
            color: '#91D79E',
            legendFontColor: '#333',
            legendFontSize: 11,
        },
    ];

    // Performance comparison data
    const performanceData = {
        labels: ['Revenue', 'COGS', 'Gross Profit', 'Net Profit'],
        datasets: [
            {
                data: [totalRevenue / 1000, totalCOGS / 1000, grossProfit / 1000, netProfit / 1000],
                color: (opacity = 1) => `rgba(76, 113, 83, ${opacity})`,
                strokeWidth: 2,
            },
        ],
    };

    const formatCurrency = (amount) => {
        return `KES ${Math.abs(amount).toLocaleString()}`;
    };

    const getPercentageChange = (current, previous) => {
        if (!previous) return '+100.0%';
        const change = ((current - previous) / previous) * 100;
        return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
    };

    const handleExport = () => {
        Alert.alert(
            'Export Profit & Loss',
            'Choose export format:',
            [
                {
                    text: 'PDF Report',
                    onPress: () => Alert.alert('Success', 'P&L Statement exported as PDF')
                },
                {
                    text: 'Excel Spreadsheet',
                    onPress: () => Alert.alert('Success', 'P&L Statement exported to Excel')
                },
                {
                    text: 'CSV Data',
                    onPress: () => Alert.alert('Success', 'P&L Statement exported as CSV')
                },
                {
                    text: 'Cancel',
                    style: 'cancel'
                }
            ]
        );
    };

    const renderSummaryCards = () => {
        const cards = [
            {
                title: 'Total Revenue',
                amount: totalRevenue,
                change: '+12.5%',
                changeType: 'positive',
                icon: 'chart-line-variant',
                colors: ['#8CD18C', '#4C7153'],
            },
            {
                title: 'Gross Profit',
                amount: grossProfit,
                change: '+15.3%',
                changeType: 'positive',
                icon: 'trending-up',
                colors: ['#A7E3A7', '#4C7153'],
            },
            {
                title: 'Net Profit',
                amount: netProfit,
                change: '+8.3%',
                changeType: 'positive',
                icon: 'cash-multiple',
                colors: ['#CBD18F', '#4C7153'],
            },
            {
                title: 'Gross Margin',
                amount: grossMargin,
                change: '+2.1%',
                changeType: 'positive',
                icon: 'percent',
                colors: ['#91D79E', '#4C7153'],
                isPercentage: true,
            },
        ];

        return (
            <View style={styles.summaryCardsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.summaryCardsRow}>
                        {cards.map((card, index) => (
                            <LinearGradient
                                key={index}
                                colors={card.colors}
                                style={styles.summaryCard}
                            >
                                <View style={styles.summaryCardHeader}>
                                    <Icon name={card.icon} size={24} color="#fff" />
                                    <View style={[styles.changeContainer, {
                                        backgroundColor: card.changeType === 'positive' ? 'rgba(255,255,255,0.2)' : 'rgba(255,0,0,0.2)'
                                    }]}>
                                        <Icon
                                            name={card.changeType === 'positive' ? 'arrow-up' : 'arrow-down'}
                                            size={12}
                                            color="#fff"
                                        />
                                        <Text style={styles.changeText}>{card.change}</Text>
                                    </View>
                                </View>
                                <Text style={styles.summaryCardTitle}>{card.title}</Text>
                                <Text style={styles.summaryCardValue}>
                                    {card.isPercentage ? `${card.amount.toFixed(1)}%` : formatCurrency(card.amount)}
                                </Text>
                            </LinearGradient>
                        ))}
                    </View>
                </ScrollView>
            </View>
        );
    };

    const renderProfitLossStatement = () => (
        <View style={styles.statementContainer}>
            <Text style={styles.statementTitle}>Profit & Loss Statement</Text>
            <Text style={styles.statementPeriod}>For the period: {selectedPeriod}</Text>

            {/* Revenue Section */}
            <View style={styles.statementSection}>
                <TouchableOpacity
                    style={styles.sectionHeader}
                    onPress={() => {
                        setSelectedCategory('revenue');
                        setShowDetailsModal(true);
                    }}
                >
                    <Text style={styles.sectionHeaderText}>Revenue</Text>
                    <View style={styles.sectionHeaderRight}>
                        <Text style={styles.sectionTotal}>{formatCurrency(totalRevenue)}</Text>
                        <Icon name="chevron-right" size={16} color={COLORS.gray} />
                    </View>
                </TouchableOpacity>

                {viewMode === 'detailed' && Object.entries(profitLossData.revenue).map(([key, value]) => (
                    <View key={key} style={styles.statementItem}>
                        <Text style={styles.itemName}>
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Text>
                        <Text style={styles.itemAmount}>{formatCurrency(value.amount)}</Text>
                    </View>
                ))}
            </View>

            {/* Cost of Goods Sold Section */}
            <View style={styles.statementSection}>
                <TouchableOpacity
                    style={styles.sectionHeader}
                    onPress={() => {
                        setSelectedCategory('cogs');
                        setShowDetailsModal(true);
                    }}
                >
                    <Text style={styles.sectionHeaderText}>Cost of Goods Sold</Text>
                    <View style={styles.sectionHeaderRight}>
                        <Text style={[styles.sectionTotal, { color: COLORS.red }]}>
                            ({formatCurrency(totalCOGS)})
                        </Text>
                        <Icon name="chevron-right" size={16} color={COLORS.gray} />
                    </View>
                </TouchableOpacity>

                {viewMode === 'detailed' && Object.entries(profitLossData.costOfGoodsSold).map(([key, value]) => (
                    <View key={key} style={styles.statementItem}>
                        <Text style={styles.itemName}>
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Text>
                        <Text style={[styles.itemAmount, { color: COLORS.red }]}>
                            ({formatCurrency(value.amount)})
                        </Text>
                    </View>
                ))}
            </View>

            {/* Gross Profit */}
            <View style={[styles.statementSection, styles.totalSection]}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.totalLabel}>Gross Profit</Text>
                    <Text style={[styles.totalAmount, { color: grossProfit >= 0 ? COLORS.green : COLORS.red }]}>
                        {formatCurrency(grossProfit)}
                    </Text>
                </View>
                <Text style={styles.marginText}>Gross Margin: {grossMargin.toFixed(1)}%</Text>
            </View>

            {/* Operating Expenses Section */}
            <View style={styles.statementSection}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionHeaderText}>Operating Expenses</Text>
                    <Text style={[styles.sectionTotal, { color: COLORS.red }]}>
                        {totalOperatingExpenses > 0 ? `(${formatCurrency(totalOperatingExpenses)})` : 'KES 0'}
                    </Text>
                </View>
                {totalOperatingExpenses === 0 && (
                    <Text style={styles.noExpensesText}>No operating expenses recorded</Text>
                )}
            </View>

            {/* Net Profit */}
            <View style={[styles.statementSection, styles.totalSection, styles.finalTotal]}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.finalTotalLabel}>Net Profit</Text>
                    <Text style={[styles.finalTotalAmount, { color: netProfit >= 0 ? COLORS.green : COLORS.red }]}>
                        {formatCurrency(netProfit)}
                    </Text>
                </View>
                <Text style={styles.marginText}>Net Margin: {netMargin.toFixed(1)}%</Text>
            </View>
        </View>
    );

    const renderCharts = () => (
        <View style={styles.chartsSection}>
            {/* Performance Overview */}
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Performance Overview</Text>
                <BarChart
                    data={performanceData}
                    width={width - 64}
                    height={180}
                    chartConfig={chartConfig}
                    style={styles.chart}
                    showValuesOnTopOfBars
                />
                <Text style={styles.chartNote}>Amounts shown in thousands (KES)</Text>
            </View>

            {/* Revenue Breakdown */}
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Revenue Breakdown</Text>
                <PieChart
                    data={revenueBreakdownData}
                    width={width - 64}
                    height={200}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                />
                <View style={styles.insightContainer}>
                    <Text style={styles.insightTitle}>Revenue Insights:</Text>
                    <Text style={styles.insightText}>• Biological gains represent 68.5% of total revenue</Text>
                    <Text style={styles.insightText}>• Beef sales contribute 24% to revenue stream</Text>
                    <Text style={styles.insightText}>• Dairy operations show potential for growth</Text>
                </View>
            </View>

            {/* Expense Breakdown */}
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Cost Structure Analysis</Text>
                <PieChart
                    data={expenseBreakdownData}
                    width={width - 64}
                    height={200}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                />
                <View style={styles.insightContainer}>
                    <Text style={styles.insightTitle}>Cost Analysis:</Text>
                    <Text style={styles.insightText}>• Labor represents 50.2% of total costs</Text>
                    <Text style={styles.insightText}>• Health services account for 25.2% of expenses</Text>
                    <Text style={styles.insightText}>• Feed efficiency maintained at 18.8%</Text>
                </View>
            </View>
        </View>
    );

    const renderDetailModal = () => {
        if (!selectedCategory) return null;

        const categoryData = selectedCategory === 'revenue'
            ? profitLossData.revenue
            : profitLossData.costOfGoodsSold;

        const categoryTitle = selectedCategory === 'revenue' ? 'Revenue Details' : 'Cost of Goods Sold Details';

        return (
            <Modal
                visible={showDetailsModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowDetailsModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.detailModalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{categoryTitle}</Text>
                            <TouchableOpacity
                                onPress={() => setShowDetailsModal(false)}
                                style={styles.closeButton}
                            >
                                <Icon name="close" size={24} color={COLORS.gray} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            {Object.entries(categoryData).map(([key, value]) => (
                                <View key={key} style={styles.detailItem}>
                                    <View style={styles.detailItemHeader}>
                                        <Text style={styles.detailItemName}>
                                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                        </Text>
                                        <Text style={[
                                            styles.detailItemAmount,
                                            { color: selectedCategory === 'revenue' ? COLORS.green : COLORS.red }
                                        ]}>
                                            {selectedCategory === 'revenue' ? '' : '('}
                                            {formatCurrency(value.amount)}
                                            {selectedCategory === 'revenue' ? '' : ')'}
                                        </Text>
                                    </View>
                                    <Text style={styles.detailItemDescription}>{value.description}</Text>
                                </View>
                            ))}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <Text style={styles.modalTotal}>
                                Total: {formatCurrency(Object.values(categoryData).reduce((sum, item) => sum + item.amount, 0))}
                            </Text>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    return (
        <View style={styles.container}>
            <Header navigation={navigation} />

            {/* Header Section */}
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
                        <Text style={styles.headerTitle}>Profit & Loss</Text>
                        <Text style={styles.headerSubtitle}>Income statement analysis</Text>
                    </View>
                    <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
                        <Icon name="download" size={20} color={COLORS.white} />
                        <Text style={styles.exportButtonText}>Export</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Period Selector */}
            <View style={styles.periodSection}>
                <Text style={styles.periodLabel}>Period:</Text>
                <TouchableOpacity
                    style={styles.periodSelector}
                    onPress={() => setShowPeriodModal(true)}
                >
                    <Text style={styles.periodText}>{selectedPeriod}</Text>
                    <Icon name="chevron-down" size={20} color={COLORS.gray} />
                </TouchableOpacity>
                <View style={styles.viewModeToggle}>
                    <TouchableOpacity
                        style={[styles.toggleButton, viewMode === 'summary' && styles.activeToggle]}
                        onPress={() => setViewMode('summary')}
                    >
                        <Text style={[styles.toggleText, viewMode === 'summary' && styles.activeToggleText]}>
                            Summary
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleButton, viewMode === 'detailed' && styles.activeToggle]}
                        onPress={() => setViewMode('detailed')}
                    >
                        <Text style={[styles.toggleText, viewMode === 'detailed' && styles.activeToggleText]}>
                            Detailed
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Summary Cards */}
                {renderSummaryCards()}

                {/* Profit & Loss Statement */}
                {renderProfitLossStatement()}

                {/* Charts */}
                {renderCharts()}
            </ScrollView>

            {/* Period Selection Modal */}
            <Modal
                visible={showPeriodModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowPeriodModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.periodModalContainer}>
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
                                    <Icon name="check" size={20} color={COLORS.green} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>

            {/* Detail Modal */}
            {renderDetailModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.lightGreen,
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
    periodSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray1,
    },
    periodLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.black,
    },
    periodSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lightGray2,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.lightGray1,
    },
    periodText: {
        fontSize: 14,
        color: COLORS.black,
        marginRight: 4,
    },
    viewModeToggle: {
        flexDirection: 'row',
        backgroundColor: COLORS.lightGray2,
        borderRadius: 16,
        padding: 2,
    },
    toggleButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14,
    },
    activeToggle: {
        backgroundColor: COLORS.green,
    },
    toggleText: {
        fontSize: 12,
        color: COLORS.gray,
        fontWeight: '500',
    },
    activeToggleText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    scrollView: {
        flex: 1,
    },
    summaryCardsContainer: {
        paddingVertical: 16,
    },
    summaryCardsRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 12,
    },
    summaryCard: {
        width: 150,
        padding: 16,
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    summaryCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    changeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    changeText: {
        fontSize: 10,
        color: '#fff',
        marginLeft: 2,
        fontWeight: 'bold',
    },
    summaryCardTitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 4,
    },
    summaryCardValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    statementContainer: {
        backgroundColor: COLORS.white,
        margin: 16,
        borderRadius: 12,
        padding: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statementTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
        textAlign: 'center',
        marginBottom: 4,
    },
    statementPeriod: {
        fontSize: 14,
        color: COLORS.gray,
        textAlign: 'center',
        marginBottom: 20,
    },
    statementSection: {
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray1,
        paddingBottom: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    sectionHeaderText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    sectionHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.green,
        marginRight: 8,
    },
    statementItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
        paddingLeft: 16,
    },
    itemName: {
        fontSize: 14,
        color: COLORS.gray2,
    },
    itemAmount: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.green,
    },
    totalSection: {
        backgroundColor: COLORS.lightGray3,
        borderRadius: 8,
        padding: 12,
        borderBottomWidth: 0,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    marginText: {
        fontSize: 12,
        color: COLORS.gray,
        textAlign: 'center',
        marginTop: 4,
    },
    finalTotal: {
        backgroundColor: COLORS.green,
        marginTop: 8,
    },
    finalTotalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    finalTotalAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    noExpensesText: {
        fontSize: 14,
        color: COLORS.gray,
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 8,
    },
    chartsSection: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    chartContainer: {
        backgroundColor: COLORS.white,
        marginBottom: 16,
        borderRadius: 12,
        padding: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 12,
        textAlign: 'center',
    },
    chart: {
        marginVertical: 8,
        borderRadius: 8,
    },
    chartNote: {
        fontSize: 12,
        color: COLORS.gray,
        textAlign: 'center',
        marginTop: 8,
        fontStyle: 'italic',
    },
    insightContainer: {
        marginTop: 16,
        padding: 12,
        backgroundColor: COLORS.lightGray3,
        borderRadius: 8,
    },
    insightTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 8,
    },
    insightText: {
        fontSize: 12,
        color: COLORS.gray2,
        marginBottom: 4,
        lineHeight: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    periodModalContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 20,
        width: width * 0.8,
        maxHeight: height * 0.6,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
        textAlign: 'center',
        marginBottom: 20,
    },
    periodOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    selectedPeriodOption: {
        backgroundColor: COLORS.lightGreen,
    },
    periodOptionText: {
        fontSize: 16,
        color: COLORS.black,
    },
    selectedPeriodOptionText: {
        color: COLORS.green,
        fontWeight: 'bold',
    },
    detailModalContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        width: width * 0.9,
        maxHeight: height * 0.8,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray1,
    },
    closeButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: COLORS.lightGray2,
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    detailItem: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: COLORS.lightGray3,
        borderRadius: 8,
    },
    detailItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailItemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
        flex: 1,
    },
    detailItemAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 12,
    },
    detailItemDescription: {
        fontSize: 14,
        color: COLORS.gray2,
        lineHeight: 18,
    },
    modalFooter: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray1,
        backgroundColor: COLORS.lightGray3,
    },
    modalTotal: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
        textAlign: 'center',
    },
});

export default ProfitLossScreen;