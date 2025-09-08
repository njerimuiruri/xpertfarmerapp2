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

const { width, height } = Dimensions.get('window');

const BalanceSheetScreen = () => {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showSortModal, setShowSortModal] = useState(false);
    const [sortBy, setSortBy] = useState('category');
    const [sortOrder, setSortOrder] = useState('asc');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewMode, setViewMode] = useState('detailed');

    const balanceSheetData = {
        assets: {
            currentAssets: [
                { id: 1, account: 'BoosterStock', amount: 300, note: 'Livestock supplements inventory' },
                { id: 2, account: 'Bank/Cash', amount: -2240685, note: 'Negative cash position requires attention' },
            ],
            nonCurrentAssets: [
                { id: 3, account: 'Livestock', amount: 35000, note: '50 cows + 1 calf' },
                { id: 4, account: 'WaterStock', amount: 2070000, note: 'Water tanks and borehole infrastructure' },
                { id: 5, account: 'PowerStock', amount: 45000, note: 'Generator and power equipment' },
                { id: 6, account: 'Facilities', amount: 99500, note: 'Storage units, fencing, and barn facilities' },
                { id: 7, account: 'Machinery', amount: 1015, note: 'Jembes and farm equipment' },
            ]
        },
        liabilities: {
            currentLiabilities: [
                { id: 8, account: 'PAYE Payable', amount: 0, note: 'No outstanding tax obligations' },
            ],
            nonCurrentLiabilities: []
        },
        equity: [
            { id: 9, account: 'Retained Earnings', amount: 10130, note: 'Net profit from operations' },
            { id: 10, account: 'Capital Introduced', amount: 0, note: 'Initial capital investment' },
        ]
    };

    const categories = ['all', 'Current Assets', 'Non-Current Assets', 'Current Liabilities', 'Non-Current Liabilities', 'Equity'];

    // Calculate totals
    const calculateTotals = () => {
        const currentAssets = balanceSheetData.assets.currentAssets.reduce((sum, item) => sum + item.amount, 0);
        const nonCurrentAssets = balanceSheetData.assets.nonCurrentAssets.reduce((sum, item) => sum + item.amount, 0);
        const totalAssets = currentAssets + nonCurrentAssets;

        const currentLiabilities = balanceSheetData.liabilities.currentLiabilities.reduce((sum, item) => sum + item.amount, 0);
        const nonCurrentLiabilities = balanceSheetData.liabilities.nonCurrentLiabilities.reduce((sum, item) => sum + item.amount, 0);
        const totalLiabilities = currentLiabilities + nonCurrentLiabilities;

        const totalEquity = balanceSheetData.equity.reduce((sum, item) => sum + item.amount, 0);
        const totalLiabilitiesEquity = totalLiabilities + totalEquity;

        const isBalanced = Math.abs(totalAssets - totalLiabilitiesEquity) < 1; // Allow for rounding

        return {
            currentAssets,
            nonCurrentAssets,
            totalAssets,
            currentLiabilities,
            nonCurrentLiabilities,
            totalLiabilities,
            totalEquity,
            totalLiabilitiesEquity,
            isBalanced,
            variance: totalAssets - totalLiabilitiesEquity
        };
    };

    const totals = calculateTotals();

    const formatCurrency = (amount) => {
        if (amount === 0) return '0';
        const absAmount = Math.abs(amount);
        return amount < 0 ? `(${absAmount.toLocaleString()})` : absAmount.toLocaleString();
    };

    const getAmountColor = (amount) => {
        if (amount === 0) return COLORS.gray;
        return amount < 0 ? COLORS.red : COLORS.green;
    };

    const handleExport = () => {
        Alert.alert(
            'Export Balance Sheet',
            'Choose export format:',
            [
                {
                    text: 'PDF Report',
                    onPress: () => Alert.alert('Success', 'Balance Sheet exported as PDF')
                },
                {
                    text: 'Excel Spreadsheet',
                    onPress: () => Alert.alert('Success', 'Balance Sheet exported to Excel')
                },
                {
                    text: 'Financial Statement Package',
                    onPress: () => Alert.alert('Success', 'Complete financial statements exported')
                },
                {
                    text: 'Cancel',
                    style: 'cancel'
                }
            ]
        );
    };

    const renderBalanceStatus = () => (
        <View style={styles.balanceStatusContainer}>
            <LinearGradient
                colors={totals.isBalanced ? ['#8CD18C', '#4C7153'] : ['#F4EBD0', '#D79F91']}
                style={styles.balanceStatusCard}
            >
                <View style={styles.balanceStatusHeader}>
                    <Icon
                        name={totals.isBalanced ? "scale-balance" : "alert-circle"}
                        size={28}
                        color="#fff"
                    />
                    <Text style={styles.balanceStatusTitle}>
                        {totals.isBalanced ? 'Balance Sheet Balanced' : 'Balance Sheet Alert'}
                    </Text>
                </View>
                <Text style={styles.balanceStatusText}>
                    {totals.isBalanced
                        ? 'Assets equal Liabilities + Equity'
                        : `Variance: KES ${Math.abs(totals.variance).toLocaleString()}`
                    }
                </Text>
                <View style={styles.balanceStatusTotals}>
                    <Text style={styles.balanceStatusTotal}>
                        Total Assets: KES {formatCurrency(totals.totalAssets)}
                    </Text>
                    <Text style={styles.balanceStatusTotal}>
                        Liabilities + Equity: KES {formatCurrency(totals.totalLiabilitiesEquity)}
                    </Text>
                </View>
            </LinearGradient>
        </View>
    );

    const renderFinancialMetrics = () => (
        <View style={styles.metricsContainer}>
            <Text style={styles.sectionTitle}>Key Financial Metrics</Text>
            <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                    <Text style={styles.metricLabel}>Working Capital</Text>
                    <Text style={[styles.metricValue, { color: getAmountColor(totals.currentAssets - totals.currentLiabilities) }]}>
                        KES {formatCurrency(totals.currentAssets - totals.currentLiabilities)}
                    </Text>
                    <Text style={styles.metricNote}>Current Assets - Current Liabilities</Text>
                </View>

                <View style={styles.metricCard}>
                    <Text style={styles.metricLabel}>Debt-to-Equity</Text>
                    <Text style={styles.metricValue}>
                        {totals.totalEquity !== 0 ? (totals.totalLiabilities / totals.totalEquity).toFixed(2) : 'N/A'}
                    </Text>
                    <Text style={styles.metricNote}>Financial leverage ratio</Text>
                </View>

                <View style={styles.metricCard}>
                    <Text style={styles.metricLabel}>Asset Composition</Text>
                    <Text style={styles.metricValue}>
                        {totals.totalAssets !== 0 ? ((totals.nonCurrentAssets / totals.totalAssets) * 100).toFixed(1) : '0'}%
                    </Text>
                    <Text style={styles.metricNote}>Fixed assets percentage</Text>
                </View>

                <View style={styles.metricCard}>
                    <Text style={styles.metricLabel}>Equity Ratio</Text>
                    <Text style={styles.metricValue}>
                        {totals.totalAssets !== 0 ? ((totals.totalEquity / totals.totalAssets) * 100).toFixed(1) : '0'}%
                    </Text>
                    <Text style={styles.metricNote}>Owner's stake in business</Text>
                </View>
            </View>
        </View>
    );

    const renderAccountItem = (item, isSubTotal = false, isTotalLine = false) => (
        <View key={item.id || item.account} style={[
            styles.accountRow,
            isSubTotal && styles.subTotalRow,
            isTotalLine && styles.totalRow
        ]}>
            <View style={[styles.accountInfo, { flex: 3 }]}>
                <Text style={[
                    styles.accountName,
                    isSubTotal && styles.subTotalText,
                    isTotalLine && styles.totalText
                ]}>
                    {item.account}
                </Text>
                {item.note && !isSubTotal && !isTotalLine && (
                    <Text style={styles.accountNote}>{item.note}</Text>
                )}
            </View>
            <View style={[styles.accountAmount, { flex: 1 }]}>
                <Text style={[
                    styles.amountText,
                    { color: getAmountColor(item.amount) },
                    isSubTotal && styles.subTotalText,
                    isTotalLine && styles.totalText
                ]}>
                    {formatCurrency(item.amount)}
                </Text>
            </View>
        </View>
    );

    const renderSectionHeader = (title, amount, alertLevel = 'normal') => (
        <View style={[styles.sectionHeader, alertLevel === 'alert' && styles.alertSectionHeader]}>
            <Text style={styles.sectionHeaderTitle}>{title}</Text>
            <View style={styles.sectionHeaderAmount}>
                <Text style={[
                    styles.sectionHeaderAmountText,
                    { color: getAmountColor(amount) }
                ]}>
                    KES {formatCurrency(amount)}
                </Text>
                {alertLevel === 'alert' && (
                    <Icon name="alert-circle" size={16} color={COLORS.red} style={{ marginLeft: 8 }} />
                )}
            </View>
        </View>
    );

    const renderDetailedView = () => (
        <View style={styles.balanceSheetContainer}>
            {/* ASSETS */}
            <View style={styles.balanceSection}>
                {renderSectionHeader('ASSETS', totals.totalAssets)}

                {/* Current Assets */}
                <View style={styles.subSection}>
                    <Text style={styles.subSectionTitle}>Current Assets</Text>
                    {balanceSheetData.assets.currentAssets.map((item) => renderAccountItem(item))}
                    {renderAccountItem({ account: 'Total Current Assets', amount: totals.currentAssets }, true)}
                </View>

                {/* Non-Current Assets */}
                <View style={styles.subSection}>
                    <Text style={styles.subSectionTitle}>Non-Current Assets</Text>
                    {balanceSheetData.assets.nonCurrentAssets.map((item) => renderAccountItem(item))}
                    {renderAccountItem({ account: 'Total Non-Current Assets', amount: totals.nonCurrentAssets }, true)}
                </View>

                {renderAccountItem({ account: 'TOTAL ASSETS', amount: totals.totalAssets }, false, true)}
            </View>

            {/* LIABILITIES */}
            <View style={styles.balanceSection}>
                {renderSectionHeader('LIABILITIES', totals.totalLiabilities)}

                {/* Current Liabilities */}
                <View style={styles.subSection}>
                    <Text style={styles.subSectionTitle}>Current Liabilities</Text>
                    {balanceSheetData.liabilities.currentLiabilities.length > 0 ? (
                        <>
                            {balanceSheetData.liabilities.currentLiabilities.map((item) => renderAccountItem(item))}
                            {renderAccountItem({ account: 'Total Current Liabilities', amount: totals.currentLiabilities }, true)}
                        </>
                    ) : (
                        <View style={styles.emptyStateContainer}>
                            <Text style={styles.emptyStateText}>No current liabilities recorded</Text>
                        </View>
                    )}
                </View>

                {/* Non-Current Liabilities */}
                <View style={styles.subSection}>
                    <Text style={styles.subSectionTitle}>Non-Current Liabilities</Text>
                    {balanceSheetData.liabilities.nonCurrentLiabilities.length > 0 ? (
                        <>
                            {balanceSheetData.liabilities.nonCurrentLiabilities.map((item) => renderAccountItem(item))}
                            {renderAccountItem({ account: 'Total Non-Current Liabilities', amount: totals.nonCurrentLiabilities }, true)}
                        </>
                    ) : (
                        <View style={styles.emptyStateContainer}>
                            <Text style={styles.emptyStateText}>No non-current liabilities recorded</Text>
                        </View>
                    )}
                </View>

                {renderAccountItem({ account: 'TOTAL LIABILITIES', amount: totals.totalLiabilities }, false, true)}
            </View>

            {/* EQUITY */}
            <View style={styles.balanceSection}>
                {renderSectionHeader('EQUITY', totals.totalEquity)}

                <View style={styles.subSection}>
                    {balanceSheetData.equity.map((item) => renderAccountItem(item))}
                    {renderAccountItem({ account: 'TOTAL EQUITY', amount: totals.totalEquity }, false, true)}
                </View>
            </View>

            {/* TOTAL LIABILITIES + EQUITY */}
            <View style={[styles.balanceSection, styles.finalTotalSection]}>
                {renderAccountItem({ account: 'TOTAL LIABILITIES + EQUITY', amount: totals.totalLiabilitiesEquity }, false, true)}
            </View>
        </View>
    );

    const renderSummaryView = () => (
        <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
                <Text style={styles.summaryCardTitle}>Assets Summary</Text>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Current Assets</Text>
                    <Text style={[styles.summaryAmount, { color: getAmountColor(totals.currentAssets) }]}>
                        KES {formatCurrency(totals.currentAssets)}
                    </Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Non-Current Assets</Text>
                    <Text style={[styles.summaryAmount, { color: getAmountColor(totals.nonCurrentAssets) }]}>
                        KES {formatCurrency(totals.nonCurrentAssets)}
                    </Text>
                </View>
                <View style={[styles.summaryItem, styles.summaryTotal]}>
                    <Text style={styles.summaryTotalLabel}>Total Assets</Text>
                    <Text style={[styles.summaryTotalAmount, { color: getAmountColor(totals.totalAssets) }]}>
                        KES {formatCurrency(totals.totalAssets)}
                    </Text>
                </View>
            </View>

            <View style={styles.summaryCard}>
                <Text style={styles.summaryCardTitle}>Liabilities & Equity</Text>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Total Liabilities</Text>
                    <Text style={[styles.summaryAmount, { color: getAmountColor(totals.totalLiabilities) }]}>
                        KES {formatCurrency(totals.totalLiabilities)}
                    </Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Total Equity</Text>
                    <Text style={[styles.summaryAmount, { color: getAmountColor(totals.totalEquity) }]}>
                        KES {formatCurrency(totals.totalEquity)}
                    </Text>
                </View>
                <View style={[styles.summaryItem, styles.summaryTotal]}>
                    <Text style={styles.summaryTotalLabel}>Total Liab. + Equity</Text>
                    <Text style={[styles.summaryTotalAmount, { color: getAmountColor(totals.totalLiabilitiesEquity) }]}>
                        KES {formatCurrency(totals.totalLiabilitiesEquity)}
                    </Text>
                </View>
            </View>
        </View>
    );

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
                        <Text style={styles.headerTitle}>Balance Sheet</Text>
                        <Text style={styles.headerSubtitle}>Financial position statement</Text>
                    </View>
                    <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
                        <Icon name="download" size={20} color={COLORS.white} />
                        <Text style={styles.exportButtonText}>Export</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Balance Status */}
            {renderBalanceStatus()}

            {/* Financial Metrics */}
            {renderFinancialMetrics()}

            {/* Controls */}
            <View style={styles.controlsSection}>
                <View style={styles.viewControls}>
                    <TouchableOpacity
                        style={[styles.viewToggle, viewMode === 'detailed' && styles.activeViewToggle]}
                        onPress={() => setViewMode('detailed')}
                    >
                        <Text style={[styles.viewToggleText, viewMode === 'detailed' && styles.activeViewToggleText]}>
                            Detailed
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.viewToggle, viewMode === 'summary' && styles.activeViewToggle]}
                        onPress={() => setViewMode('summary')}
                    >
                        <Text style={[styles.viewToggleText, viewMode === 'summary' && styles.activeViewToggleText]}>
                            Summary
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={true}>
                {viewMode === 'detailed' ? renderDetailedView() : renderSummaryView()}
            </ScrollView>
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
    balanceStatusContainer: {
        padding: 16,
    },
    balanceStatusCard: {
        borderRadius: 12,
        padding: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    balanceStatusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    balanceStatusTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginLeft: 12,
    },
    balanceStatusText: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
        marginBottom: 12,
    },
    balanceStatusTotals: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    balanceStatusTotal: {
        fontSize: 12,
        color: '#fff',
        opacity: 0.8,
    },
    metricsContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 12,
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    metricCard: {
        backgroundColor: COLORS.white,
        borderRadius: 8,
        padding: 12,
        width: (width - 48) / 2,
        marginBottom: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    metricLabel: {
        fontSize: 12,
        color: COLORS.gray,
        marginBottom: 4,
    },
    metricValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 2,
    },
    metricNote: {
        fontSize: 10,
        color: COLORS.gray2,
        fontStyle: 'italic',
    },
    controlsSection: {
        padding: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray1,
    },
    viewControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    viewToggle: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: COLORS.lightGray2,
        borderWidth: 1,
        borderColor: COLORS.lightGray1,
    },
    activeViewToggle: {
        backgroundColor: COLORS.green,
        borderColor: COLORS.green,
    },
    viewToggleText: {
        fontSize: 14,
        color: COLORS.gray,
        fontWeight: '500',
    },
    activeViewToggleText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    contentContainer: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    balanceSheetContainer: {
        padding: 16,
    },
    balanceSection: {
        marginBottom: 24,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    finalTotalSection: {
        backgroundColor: COLORS.lightGreen,
        borderWidth: 2,
        borderColor: COLORS.green,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 12,
        marginBottom: 16,
        borderBottomWidth: 2,
        borderBottomColor: COLORS.green,
    },
    alertSectionHeader: {
        borderBottomColor: COLORS.red,
    },
    sectionHeaderTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    sectionHeaderAmount: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionHeaderAmountText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    subSection: {
        marginBottom: 16,
    },
    subSectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.gray,
        marginBottom: 8,
        marginLeft: 8,
    },
    accountRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray1,
        minHeight: 40,
    },
    subTotalRow: {
        backgroundColor: COLORS.lightGray3,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray1,
        marginTop: 4,
    },
    totalRow: {
        backgroundColor: COLORS.lightGreen,
        borderTopWidth: 2,
        borderBottomWidth: 2,
        borderTopColor: COLORS.green,
        borderBottomColor: COLORS.green,
        marginTop: 8,
    },
    accountInfo: {
        justifyContent: 'center',
        paddingRight: 8,
    },
    accountName: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.black,
        marginBottom: 2,
    },
    accountNote: {
        fontSize: 11,
        color: COLORS.gray2,
        fontStyle: 'italic',
    },
    subTotalText: {
        fontWeight: 'bold',
        fontSize: 15,
    },
    totalText: {
        fontWeight: 'bold',
        fontSize: 16,
        color: COLORS.green,
    },
    accountAmount: {
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    amountText: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'right',
    },
    emptyStateContainer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    emptyStateText: {
        fontSize: 14,
        color: COLORS.gray,
        fontStyle: 'italic',
    },
    summaryContainer: {
        padding: 16,
        gap: 16,
    },
    summaryCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    summaryCardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 16,
        textAlign: 'center',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray1,
        paddingBottom: 8,
    },
    summaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray1,
    },
    summaryTotal: {
        borderTopWidth: 2,
        borderTopColor: COLORS.green,
        borderBottomWidth: 0,
        marginTop: 8,
        paddingTop: 12,
    },
    summaryLabel: {
        fontSize: 14,
        color: COLORS.black,
    },
    summaryAmount: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    summaryTotalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.green,
    },
    summaryTotalAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default BalanceSheetScreen;