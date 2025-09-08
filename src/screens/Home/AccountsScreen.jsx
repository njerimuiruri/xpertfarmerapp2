import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Dimensions, FlatList,
} from 'react-native';
import Header from '../../components/headers/main-header';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../constants/theme';
import { PieChart, BarChart } from 'react-native-chart-kit';

const { width: screenWidth } = Dimensions.get('window');

const AccountsScreen = () => {
    const navigation = useNavigation();
    const [selectedPeriod, setSelectedPeriod] = useState('This month');
    const [showPeriodModal, setShowPeriodModal] = useState(false);
    const [activeTab, setActiveTab] = useState('accounts');
    const [loading, setLoading] = useState(false);

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

    // Chart of Accounts Data
    const chartOfAccounts = {
        assets: {
            current: [
                { name: 'BoosterStock', code: '1100', balance: 300, type: 'debit' },
                { name: 'Bank/Cash', code: '1200', balance: -2240685, type: 'debit' },
            ],
            nonCurrent: [
                { name: 'Livestock', code: '1300', balance: 35000, type: 'debit' },
                { name: 'WaterStock', code: '1400', balance: 2070000, type: 'debit' },
                { name: 'PowerStock', code: '1500', balance: 45000, type: 'debit' },
                { name: 'Facilities', code: '1600', balance: 99500, type: 'debit' },
                { name: 'Machinery', code: '1700', balance: 1015, type: 'debit' },
            ]
        },
        revenue: [
            { name: 'DairySales', code: '4100', balance: 1090, type: 'credit' },
            { name: 'BeefSales', code: '4200', balance: 3500, type: 'credit' },
            { name: 'Biological Gains', code: '4300', balance: 10000, type: 'credit' },
        ],
        expenses: [
            { name: 'Feeds', code: '5100', balance: 840, type: 'debit' },
            { name: 'Health - Vaccination', code: '5200', balance: 215, type: 'debit' },
            { name: 'Health - Deworming', code: '5201', balance: 215, type: 'debit' },
            { name: 'Health - Treatment', code: '5202', balance: 215, type: 'debit' },
            { name: 'Health - Genetics', code: '5203', balance: 50, type: 'debit' },
            { name: 'Health - Allergies', code: '5204', balance: 50, type: 'debit' },
            { name: 'Health - Boosters', code: '5205', balance: 380, type: 'debit' },
            { name: 'Salaries and Wages', code: '5300', balance: 2240, type: 'debit' },
            { name: 'Servicing Expense', code: '5400', balance: 255, type: 'debit' },
        ],
        liabilities: [
            { name: 'PAYE Payable', code: '2100', balance: 0, type: 'credit' },
        ]
    };

    // Calculate totals for charts
    const assetBalances = [
        ...chartOfAccounts.assets.current.filter(a => a.balance > 0),
        ...chartOfAccounts.assets.nonCurrent.filter(a => a.balance > 0)
    ];

    const totalAssets = assetBalances.reduce((sum, asset) => sum + asset.balance, 0);
    const totalRevenue = chartOfAccounts.revenue.reduce((sum, rev) => sum + rev.balance, 0);
    const totalExpenses = chartOfAccounts.expenses.reduce((sum, exp) => sum + exp.balance, 0);

    // Asset Distribution Pie Chart Data
    const assetDistributionData = assetBalances.map((asset, index) => ({
        name: asset.name,
        population: asset.balance,
        color: [
            '#4C7153', '#8CD18C', '#A7E3A7', '#CBD18F',
            '#91D79E', '#F4EBD0', '#D79F91'
        ][index % 7],
        legendFontColor: '#333',
        legendFontSize: 11,
    }));

    // Revenue Breakdown Chart Data
    const revenueBreakdownData = chartOfAccounts.revenue.map((rev, index) => ({
        name: rev.name,
        population: rev.balance,
        color: ['#4C7153', '#8CD18C', '#A7E3A7'][index],
        legendFontColor: '#333',
        legendFontSize: 11,
    }));

    // Expense Breakdown Chart Data
    const expenseBreakdownData = [
        {
            name: 'Salaries',
            population: 2240,
            color: '#D79F91',
            legendFontColor: '#333',
            legendFontSize: 11,
        },
        {
            name: 'Health Total',
            population: 1125,
            color: '#BD91D7',
            legendFontColor: '#333',
            legendFontSize: 11,
        },
        {
            name: 'Feeds',
            population: 840,
            color: '#CBD18F',
            legendFontColor: '#333',
            legendFontSize: 11,
        },
        {
            name: 'Servicing',
            population: 255,
            color: '#91D79E',
            legendFontColor: '#333',
            legendFontSize: 11,
        },
    ];

    // Account Balance Comparison Bar Chart Data
    const accountComparisonData = {
        labels: ['Assets', 'Revenue', 'Expenses'],
        datasets: [
            {
                data: [totalAssets / 1000, totalRevenue, totalExpenses],
                color: (opacity = 1) => `rgba(76, 113, 83, ${opacity})`,
                strokeWidth: 2,
            },
        ],
    };

    // Recent Transactions Data
    const recentTransactions = [
        { id: 1, date: '2025-05-20', description: 'Milk sales to Retail Store', account: 'DairySales', amount: 340, type: 'credit' },
        { id: 2, date: '2025-05-17', description: 'Purchase of 300kg feed stock', account: 'Feeds', amount: 600, type: 'debit' },
        { id: 3, date: '2025-05-14', description: 'Beef sales to KMC', account: 'BeefSales', amount: 2000, type: 'credit' },
        { id: 4, date: '2025-05-12', description: 'Vaccination services', account: 'Health - Vaccination', amount: 215, type: 'debit' },
        { id: 5, date: '2025-05-11', description: 'Milk sales to Local Dairy', account: 'DairySales', amount: 750, type: 'credit' },
    ];

    // Financial Summary Cards
    const financialSummaryCards = [
        {
            title: 'Total Assets',
            value: 'KES 10,125',
            change: '+15.2%',
            changeType: 'positive',
            icon: 'bank',
            colors: ['#8CD18C', '#4C7153'],
            alert: false,
        },
        {
            title: 'Cash Position',
            value: 'KES -2,240,685',
            change: '-95.8%',
            changeType: 'negative',
            icon: 'cash-minus',
            colors: ['#F4EBD0', '#D79F91'],
            alert: true,
        },
        {
            title: 'Total Revenue',
            value: 'KES 14,590',
            change: '+12.5%',
            changeType: 'positive',
            icon: 'chart-line-variant',
            colors: ['#A7E3A7', '#4C7153'],
            alert: false,
        },
        {
            title: 'Net Profit',
            value: 'KES 10,130',
            change: '+8.3%',
            changeType: 'positive',
            icon: 'trending-up',
            colors: ['#CBD18F', '#4C7153'],
            alert: false,
        },
    ];

    // Journal Sections
    const journalSections = [
        {
            title: 'Sales Journal',
            subtitle: 'Revenue transactions',
            icon: 'cash-register',
            colors: ['#8CD18C', '#4C7153'],
            entries: 3,
            lastEntry: '2025-05-20',
            amount: 'KES 4,590',
            onPress: () => navigation.navigate('SalesJournalScreen'),
        },
        {
            title: 'Purchases Journal',
            subtitle: 'Expense tracking',
            icon: 'shopping',
            colors: ['#D79F91', '#BD91D7'],
            entries: 15,
            lastEntry: '2025-05-17',
            amount: 'KES 4,460',
            onPress: () => navigation.navigate('PurchaseJournalScreen'),
        },
        {
            title: 'Assets Journal',
            subtitle: 'Asset management',
            icon: 'bank',
            colors: ['#CBD18F', '#4C7153'],
            entries: 8,
            lastEntry: '2025-05-17',
            amount: 'KES 2,250,815',
            onPress: () => navigation.navigate('AssetsJournalScreen'),
        },
        {
            title: 'Payroll Journal',
            subtitle: 'Employee wages',
            icon: 'account-group',
            colors: ['#91D79E', '#4C7153'],
            entries: 2,
            lastEntry: '2025-05-09',
            amount: 'KES 1,120',
            onPress: () => navigation.navigate('PayrollJournalScreen'),
        },
        {
            title: 'General Journal',
            subtitle: 'All transactions',
            icon: 'book-open-variant',
            colors: ['#F4EBD0', '#D79F91'],
            entries: 1,
            lastEntry: '2025-05-08',
            amount: 'KES 10,000',
            onPress: () => navigation.navigate('GeneralJournalScreen'),
        },
        {
            title: 'General Ledger',
            subtitle: 'Account summaries',
            icon: 'book-multiple',
            colors: ['#A7E3A7', '#4C7153'],
            entries: 16,
            lastEntry: 'Current',
            amount: 'Updated',
            onPress: () => navigation.navigate('GeneralLedgerScreen'),
        }
    ];

    // Financial Reports
    const financialReports = [
        {
            title: 'Trial Balance',
            subtitle: 'Account verification',
            icon: 'scale-balance',
            colors: ['#8CD18C', '#4C7153'],
            status: 'Balanced',
            lastUpdated: 'Today',
            onPress: () => navigation.navigate('TrialBalanceScreen'),
        },
        {
            title: 'Balance Sheet',
            subtitle: 'Financial position',
            icon: 'chart-pie',
            colors: ['#A7E3A7', '#4C7153'],
            status: 'Current',
            lastUpdated: 'Today',
            onPress: () => navigation.navigate('BalanceSheetScreen'),
        },
        {
            title: 'Profit & Loss',
            subtitle: 'Income statement',
            icon: 'trending-up',
            colors: ['#CBD18F', '#4C7153'],
            status: 'KES 10,130',
            lastUpdated: 'Today',
            onPress: () => navigation.navigate('ProfitLossScreen'),
        },
        {
            title: 'Cash Flow',
            subtitle: 'Cash movement',
            icon: 'cash-fast',
            colors: ['#D79F91', '#BD91D7'],
            status: 'Alert',
            lastUpdated: 'Today',
            onPress: () => navigation.navigate('CashFlowScreen'),
        },
    ];

    const accountTabs = [
        { id: 'accounts', label: 'Chart of Accounts', icon: 'format-list-numbered' },
        { id: 'journals', label: 'Journals', icon: 'book-multiple' },
        { id: 'reports', label: 'Reports', icon: 'file-chart' },
        { id: 'reconcile', label: 'Reconciliation', icon: 'check-circle' },
    ];

    const renderFinancialSummaryCard = ({ title, value, change, changeType, icon, colors, alert }) => (
        <LinearGradient colors={colors} style={[styles.summaryCard, alert && styles.alertCard]} key={title}>
            <View style={styles.summaryHeader}>
                <Icon name={icon} size={24} color="#fff" />
                {alert && (
                    <View style={styles.alertBadge}>
                        <Icon name="alert" size={12} color="#fff" />
                    </View>
                )}
                <View style={[styles.changeContainer, { backgroundColor: changeType === 'positive' ? 'rgba(255,255,255,0.2)' : 'rgba(255,0,0,0.2)' }]}>
                    <Icon
                        name={changeType === 'positive' ? 'arrow-up' : 'arrow-down'}
                        size={12}
                        color="#fff"
                    />
                    <Text style={styles.changeText}>{change}</Text>
                </View>
            </View>
            <Text style={styles.summaryTitle}>{title}</Text>
            <Text style={styles.summaryValue}>{value}</Text>
        </LinearGradient>
    );

    const renderJournalCard = ({ title, subtitle, icon, colors, entries, lastEntry, amount, onPress }) => (
        <TouchableOpacity key={title} onPress={onPress} style={styles.journalCardWrapper}>
            <LinearGradient colors={colors} style={styles.journalCard}>
                <View style={styles.journalCardHeader}>
                    <Icon name={icon} size={28} color="#fff" />
                    <View style={styles.journalStats}>
                        <Text style={styles.journalEntries}>{entries} entries</Text>
                        <Text style={styles.journalLastEntry}>Last: {lastEntry}</Text>
                    </View>
                </View>
                <View style={styles.journalCardContent}>
                    <Text style={styles.journalCardTitle}>{title}</Text>
                    <Text style={styles.journalCardSubtitle}>{subtitle}</Text>
                    <Text style={styles.journalAmount}>{amount}</Text>
                </View>
                <Icon name="chevron-right" size={20} color="rgba(255,255,255,0.8)" />
            </LinearGradient>
        </TouchableOpacity>
    );

    const renderReportCard = ({ title, subtitle, icon, colors, status, lastUpdated, onPress }) => (
        <TouchableOpacity key={title} onPress={onPress} style={styles.reportCardWrapper}>
            <LinearGradient colors={colors} style={styles.reportCard}>
                <Icon name={icon} size={32} color="#fff" />
                <View style={styles.reportCardContent}>
                    <Text style={styles.reportCardTitle}>{title}</Text>
                    <Text style={styles.reportCardSubtitle}>{subtitle}</Text>
                    <View style={styles.reportStatus}>
                        <Text style={styles.reportStatusText}>{status}</Text>
                        <Text style={styles.reportLastUpdated}>Updated: {lastUpdated}</Text>
                    </View>
                </View>
                <Icon name="chevron-right" size={20} color="rgba(255,255,255,0.8)" />
            </LinearGradient>
        </TouchableOpacity>
    );

    const renderAccountItem = (account) => (
        <View style={styles.accountItem} key={account.code}>
            <View style={styles.accountInfo}>
                <Text style={styles.accountCode}>{account.code}</Text>
                <Text style={styles.accountName}>{account.name}</Text>
            </View>
            <Text style={[
                styles.accountBalance,
                { color: account.balance < 0 ? '#D79F91' : '#4C7153' }
            ]}>
                KES {account.balance.toLocaleString()}
            </Text>
        </View>
    );

    const renderTransactionItem = (transaction) => (
        <View style={styles.transactionItem} key={transaction.id}>
            <View style={styles.transactionInfo}>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
                <Text style={styles.transactionDescription}>{transaction.description}</Text>
                <Text style={styles.transactionAccount}>{transaction.account}</Text>
            </View>
            <Text style={[
                styles.transactionAmount,
                { color: transaction.type === 'credit' ? '#4C7153' : '#D79F91' }
            ]}>
                {transaction.type === 'credit' ? '+' : '-'}KES {transaction.amount.toLocaleString()}
            </Text>
        </View>
    );

    const renderAccountTab = ({ id, label, icon }) => (
        <TouchableOpacity
            key={id}
            style={[styles.accountTab, activeTab === id && styles.activeAccountTab]}
            onPress={() => setActiveTab(id)}
        >
            <Icon name={icon} size={20} color={activeTab === id ? '#4C7153' : '#666'} />
            <Text style={[styles.accountTabText, activeTab === id && styles.activeAccountTabText]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    const renderAccountsCharts = () => (
        <View style={styles.chartsSection}>
            {/* Account Balance Overview */}
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Account Balances Overview</Text>
                <BarChart
                    data={accountComparisonData}
                    width={screenWidth - 64}
                    height={180}
                    chartConfig={chartConfig}
                    style={styles.chart}
                    showValuesOnTopOfBars
                />
                <Text style={styles.chartNote}>
                    Assets shown in thousands (KES), Revenue & Expenses in actual amounts
                </Text>
            </View>

            {/* Asset Distribution */}
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Asset Distribution</Text>
                <PieChart
                    data={assetDistributionData}
                    width={screenWidth - 64}
                    height={200}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                />
                <View style={styles.insightContainer}>
                    <Text style={styles.insightTitle}>Asset Insights:</Text>
                    <Text style={styles.insightText}>• Water infrastructure represents 97.5% of total assets</Text>
                    <Text style={styles.insightText}>• Facilities and livestock comprise remaining 2.5%</Text>
                    <Text style={styles.insightText}>• Consider diversifying asset portfolio</Text>
                </View>
            </View>

            {/* Revenue Distribution */}
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Revenue Breakdown</Text>
                <PieChart
                    data={revenueBreakdownData}
                    width={screenWidth - 64}
                    height={200}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                />
                <View style={styles.insightContainer}>
                    <Text style={styles.insightTitle}>Revenue Analysis:</Text>
                    <Text style={styles.insightText}>• Biological gains dominate at 68.5% of revenue</Text>
                    <Text style={styles.insightText}>• Beef sales contribute 24% to total revenue</Text>
                    <Text style={styles.insightText}>• Dairy sales at 7.5% show growth potential</Text>
                </View>
            </View>

            {/* Expense Distribution */}
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Expense Breakdown</Text>
                <PieChart
                    data={expenseBreakdownData}
                    width={screenWidth - 64}
                    height={200}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                />
                <View style={styles.insightContainer}>
                    <Text style={styles.insightTitle}>Expense Analysis:</Text>
                    <Text style={styles.insightText}>• Labor costs account for 50.2% of expenses</Text>
                    <Text style={styles.insightText}>• Health expenses total 25.2% of spending</Text>
                    <Text style={styles.insightText}>• Feed costs optimized at 18.8% of expenses</Text>
                </View>
            </View>
        </View>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'accounts':
                return (
                    <View style={styles.tabContent}>
                        {/* Charts Section */}
                        {renderAccountsCharts()}

                        {/* Traditional Account Listing */}
                        <View style={styles.accountSection}>
                            <Text style={styles.accountSectionTitle}>Assets</Text>
                            <View style={styles.accountSubSection}>
                                <Text style={styles.accountSubSectionTitle}>Current Assets</Text>
                                {chartOfAccounts.assets.current.map(renderAccountItem)}
                            </View>
                            <View style={styles.accountSubSection}>
                                <Text style={styles.accountSubSectionTitle}>Non-Current Assets</Text>
                                {chartOfAccounts.assets.nonCurrent.map(renderAccountItem)}
                            </View>
                        </View>

                        <View style={styles.accountSection}>
                            <Text style={styles.accountSectionTitle}>Revenue</Text>
                            {chartOfAccounts.revenue.map(renderAccountItem)}
                        </View>

                        <View style={styles.accountSection}>
                            <Text style={styles.accountSectionTitle}>Expenses</Text>
                            {chartOfAccounts.expenses.map(renderAccountItem)}
                        </View>

                        <View style={styles.accountSection}>
                            <Text style={styles.accountSectionTitle}>Liabilities</Text>
                            {chartOfAccounts.liabilities.map(renderAccountItem)}
                        </View>
                    </View>
                );

            case 'journals':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.journalsGrid}>
                            {journalSections.map(renderJournalCard)}
                        </View>

                        <View style={styles.recentTransactionsSection}>
                            <Text style={styles.sectionTitle}>Recent Transactions</Text>
                            <View style={styles.transactionsList}>
                                {recentTransactions.map(renderTransactionItem)}
                            </View>
                            <TouchableOpacity style={styles.viewAllButton}>
                                <Text style={styles.viewAllText}>View All Transactions</Text>
                                <Icon name="chevron-right" size={16} color="#4C7153" />
                            </TouchableOpacity>
                        </View>
                    </View>
                );

            case 'reports':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.reportsGrid}>
                            {financialReports.map(renderReportCard)}
                        </View>

                        <View style={styles.quickActionsSection}>
                            <Text style={styles.sectionTitle}>Quick Actions</Text>
                            <View style={styles.quickActionsGrid}>
                                <TouchableOpacity style={styles.quickActionButton}>
                                    <Icon name="download" size={24} color="#4C7153" />
                                    <Text style={styles.quickActionText}>Export All Reports</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.quickActionButton}>
                                    <Icon name="calendar" size={24} color="#4C7153" />
                                    <Text style={styles.quickActionText}>Schedule Reports</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.quickActionButton}>
                                    <Icon name="printer" size={24} color="#4C7153" />
                                    <Text style={styles.quickActionText}>Print Statements</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                );

            case 'reconcile':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.reconciliationSection}>
                            <Text style={styles.sectionTitle}>Account Reconciliation</Text>

                            <View style={styles.reconcileCard}>
                                <View style={styles.reconcileHeader}>
                                    <Icon name="bank" size={24} color="#4C7153" />
                                    <Text style={styles.reconcileTitle}>Bank Reconciliation</Text>
                                    <View style={styles.reconcileStatus}>
                                        <Icon name="alert-circle" size={16} color="#D79F91" />
                                        <Text style={styles.reconcileStatusText}>Needs Attention</Text>
                                    </View>
                                </View>
                                <Text style={styles.reconcileAmount}>Balance: KES -2,240,685</Text>
                                <TouchableOpacity style={styles.reconcileButton}>
                                    <Text style={styles.reconcileButtonText}>Start Reconciliation</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.reconcileCard}>
                                <View style={styles.reconcileHeader}>
                                    <Icon name="account-group" size={24} color="#4C7153" />
                                    <Text style={styles.reconcileTitle}>Supplier Accounts</Text>
                                    <View style={[styles.reconcileStatus, { backgroundColor: '#E8F4EA' }]}>
                                        <Icon name="check-circle" size={16} color="#4C7153" />
                                        <Text style={[styles.reconcileStatusText, { color: '#4C7153' }]}>Up to Date</Text>
                                    </View>
                                </View>
                                <Text style={styles.reconcileAmount}>Outstanding: KES 0</Text>
                                <TouchableOpacity style={[styles.reconcileButton, { backgroundColor: '#E8F4EA' }]}>
                                    <Text style={[styles.reconcileButtonText, { color: '#4C7153' }]}>View Details</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                );

            default:
                return null;
        }
    };

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
                        <Text style={styles.welcomeTitle}>Accounts & Finance</Text>
                        <Text style={styles.welcomeSubtitle}>
                            Complete financial management{"\n"}for your farm operations
                        </Text>
                    </View>
                    <View style={styles.welcomeIconContainer}>
                        <Icon name="calculator" size={60} color="rgba(255,255,255,0.8)" />
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

                {/* Financial Summary Cards */}
                <View style={styles.summaryGrid}>
                    {financialSummaryCards.map(renderFinancialSummaryCard)}
                </View>

                {/* Account Tabs */}
                <View style={styles.accountTabsContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScrollView}>
                        {accountTabs.map(renderAccountTab)}
                    </ScrollView>
                </View>

                {/* Tab Content */}
                <View style={styles.tabContentContainer}>
                    {renderTabContent()}
                </View>

                {/* Quick Add Transaction Button */}
                <TouchableOpacity style={styles.addTransactionFab}>
                    <LinearGradient colors={['#8CD18C', '#4C7153']} style={styles.fabGradient}>
                        <Icon name="plus" size={24} color="#fff" />
                        <Text style={styles.fabText}>Add Transaction</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>

            {/* Period Selection Modal */}
            {/* Period Selection Modal */}
            <Modal
                visible={showPeriodModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowPeriodModal(false)}
            >
                <View style={styles.modalOverlay}>
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
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setShowPeriodModal(false)}
                        >
                            <Text style={styles.modalCloseText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollView: {
        flex: 1,
    },
    welcomeBanner: {
        margin: 16,
        padding: 20,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    welcomeTextContainer: {
        flex: 1,
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 22,
    },
    welcomeIconContainer: {
        marginLeft: 16,
    },
    overviewSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 16,
    },
    overviewTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    monthSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    monthText: {
        fontSize: 14,
        color: '#333',
        marginRight: 4,
    },
    summaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 8,
        marginBottom: 16,
    },
    summaryCard: {
        width: (screenWidth - 48) / 2,
        margin: 8,
        padding: 16,
        borderRadius: 12,
        minHeight: 120,
    },
    alertCard: {
        shadowColor: '#D79F91',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    alertBadge: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: -5,
        right: -5,
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
    summaryTitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    accountTabsContainer: {
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    tabScrollView: {
        flexGrow: 0,
    },
    accountTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        marginRight: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        minWidth: 120,
    },
    activeAccountTab: {
        backgroundColor: '#E8F4EA',
        borderColor: '#4C7153',
    },
    accountTabText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 6,
        fontWeight: '500',
    },
    activeAccountTabText: {
        color: '#4C7153',
        fontWeight: 'bold',
    },
    tabContentContainer: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    tabContent: {
        flex: 1,
    },
    chartsSection: {
        marginBottom: 24,
    },
    chartContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,

    },
    chartTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
        textAlign: 'center',
    },
    chart: {
        borderRadius: 8,
    },
    chartNote: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
        fontStyle: 'italic',
    },
    insightContainer: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#4C7153',
    },
    insightTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4C7153',
        marginBottom: 8,
    },
    insightText: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
        marginBottom: 2,
    },
    accountSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,

    },
    accountSectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: '#4C7153',
        paddingBottom: 8,
    },
    accountSubSection: {
        marginBottom: 16,
    },
    accountSubSectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
        marginLeft: 8,
    },
    accountItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    accountInfo: {
        flex: 1,
    },
    accountCode: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'monospace',
    },
    accountName: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        marginTop: 2,
    },
    accountBalance: {
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'monospace',
    },
    journalsGrid: {
        marginBottom: 24,
    },
    journalCardWrapper: {
        marginBottom: 12,
    },
    journalCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,

    },
    journalCardHeader: {
        alignItems: 'center',
        marginRight: 16,
    },
    journalStats: {
        alignItems: 'center',
        marginTop: 4,
    },
    journalEntries: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: 'bold',
    },
    journalLastEntry: {
        fontSize: 9,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 1,
    },
    journalCardContent: {
        flex: 1,
    },
    journalCardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    journalCardSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 8,
    },
    journalAmount: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
    },
    recentTransactionsSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,

    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    transactionsList: {
        marginBottom: 16,
    },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    transactionInfo: {
        flex: 1,
    },
    transactionDate: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    transactionDescription: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        marginBottom: 2,
    },
    transactionAccount: {
        fontSize: 12,
        color: '#4C7153',
        fontStyle: 'italic',
    },
    transactionAmount: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'right',
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    viewAllText: {
        fontSize: 14,
        color: '#4C7153',
        fontWeight: '600',
        marginRight: 4,
    },
    reportsGrid: {
        marginBottom: 24,
    },
    reportCardWrapper: {
        marginBottom: 12,
    },
    reportCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,

    },
    reportCardContent: {
        flex: 1,
        marginLeft: 16,
    },
    reportCardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    reportCardSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 8,
    },
    reportStatus: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    reportStatusText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
    },
    reportLastUpdated: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.7)',
    },
    quickActionsSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,

    },
    quickActionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    quickActionButton: {
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        minWidth: 80,
    },
    quickActionText: {
        fontSize: 12,
        color: '#4C7153',
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 8,
    },
    reconciliationSection: {
        flex: 1,
    },
    reconcileCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,

    },
    reconcileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    reconcileTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        marginLeft: 12,
    },
    reconcileStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFE6E6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    reconcileStatusText: {
        fontSize: 12,
        color: '#D79F91',
        fontWeight: '600',
        marginLeft: 4,
    },
    reconcileAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    reconcileButton: {
        backgroundColor: '#4C7153',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    reconcileButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    addTransactionFab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        borderRadius: 28,

    },
    fabGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 28,
    },
    fabText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        margin: 20,
        width: screenWidth - 80,
        maxHeight: 400,
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
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
    modalCloseButton: {
        marginTop: 16,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
    },
    modalCloseText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
});

export default AccountsScreen;