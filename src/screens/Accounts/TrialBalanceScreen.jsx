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

const TrialBalanceScreen = () => {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showSortModal, setShowSortModal] = useState(false);
    const [sortBy, setSortBy] = useState('account');
    const [sortOrder, setSortOrder] = useState('asc');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [balanceView, setBalanceView] = useState('net'); // 'net' or 'separate'

    const trialBalanceData = [
        // Assets
        { id: 1, account: 'Bank/Cash', category: 'Assets', accountType: 'Current Assets', debit: 4590, credit: 2245275, balance: -2240685 },
        { id: 2, account: 'BoosterStock', category: 'Assets', accountType: 'Current Assets', debit: 300, credit: 0, balance: 300 },
        { id: 3, account: 'Livestock', category: 'Assets', accountType: 'Non-Current Assets', debit: 35000, credit: 0, balance: 35000 },
        { id: 4, account: 'WaterStock', category: 'Assets', accountType: 'Non-Current Assets', debit: 2070000, credit: 0, balance: 2070000 },
        { id: 5, account: 'PowerStock', category: 'Assets', accountType: 'Non-Current Assets', debit: 45000, credit: 0, balance: 45000 },
        { id: 6, account: 'Facilities', category: 'Assets', accountType: 'Non-Current Assets', debit: 99500, credit: 0, balance: 99500 },
        { id: 7, account: 'Machinery', category: 'Assets', accountType: 'Non-Current Assets', debit: 1015, credit: 0, balance: 1015 },

        // Revenue
        { id: 8, account: 'DairySales', category: 'Revenue', accountType: 'Operating Revenue', debit: 0, credit: 1090, balance: -1090 },
        { id: 9, account: 'BeefSales', category: 'Revenue', accountType: 'Operating Revenue', debit: 0, credit: 3500, balance: -3500 },
        { id: 10, account: 'General Income – Biological Gains', category: 'Revenue', accountType: 'Other Revenue', debit: 0, credit: 10000, balance: -10000 },

        // Expenses
        { id: 11, account: 'Feeds', category: 'Expenses', accountType: 'Cost of Goods Sold', debit: 840, credit: 0, balance: 840 },
        { id: 12, account: 'Health - Vaccination', category: 'Expenses', accountType: 'Operating Expenses', debit: 215, credit: 0, balance: 215 },
        { id: 13, account: 'Health - Deworming', category: 'Expenses', accountType: 'Operating Expenses', debit: 215, credit: 0, balance: 215 },
        { id: 14, account: 'Health – Treatment', category: 'Expenses', accountType: 'Operating Expenses', debit: 215, credit: 0, balance: 215 },
        { id: 15, account: 'Health – Allergies', category: 'Expenses', accountType: 'Operating Expenses', debit: 50, credit: 0, balance: 50 },
        { id: 16, account: 'Health – Genetics', category: 'Expenses', accountType: 'Operating Expenses', debit: 50, credit: 0, balance: 50 },
        { id: 17, account: 'Health – Boosters', category: 'Expenses', accountType: 'Operating Expenses', debit: 380, credit: 0, balance: 380 },
        { id: 18, account: 'Salaries and Wages', category: 'Expenses', accountType: 'Operating Expenses', debit: 2240, credit: 0, balance: 2240 },
        { id: 19, account: 'Servicing Expense', category: 'Expenses', accountType: 'Operating Expenses', debit: 255, credit: 0, balance: 255 },

        // Liabilities
        { id: 20, account: 'PAYE Payable', category: 'Liabilities', accountType: 'Current Liabilities', debit: 0, credit: 0, balance: 0 },
    ];

    const categories = ['all', 'Assets', 'Revenue', 'Expenses', 'Liabilities'];

    const filteredAndSortedData = useMemo(() => {
        let filtered = trialBalanceData;

        if (searchQuery.trim()) {
            filtered = filtered.filter(item =>
                item.account.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.accountType.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(item => item.category === selectedCategory);
        }

        filtered.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];

            if (sortBy === 'balance' || sortBy === 'debit' || sortBy === 'credit') {
                aVal = Math.abs(aVal || 0);
                bVal = Math.abs(bVal || 0);
            } else if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        return filtered;
    }, [trialBalanceData, searchQuery, selectedCategory, sortBy, sortOrder]);

    const calculateTotals = () => {
        const totalDebit = trialBalanceData.reduce((sum, item) => sum + (item.debit || 0), 0);
        const totalCredit = trialBalanceData.reduce((sum, item) => sum + (item.credit || 0), 0);
        const netBalance = totalDebit - totalCredit;
        return { totalDebit, totalCredit, netBalance, isBalanced: totalDebit === totalCredit };
    };

    const getCategoryTotals = (category) => {
        const categoryData = trialBalanceData.filter(item => item.category === category);
        const totalDebit = categoryData.reduce((sum, item) => sum + (item.debit || 0), 0);
        const totalCredit = categoryData.reduce((sum, item) => sum + (item.credit || 0), 0);
        const netBalance = totalDebit - totalCredit;
        return { totalDebit, totalCredit, netBalance };
    };

    const { totalDebit, totalCredit, netBalance, isBalanced } = calculateTotals();

    const formatCurrency = (amount) => {
        if (!amount) return '';
        return Math.abs(amount).toLocaleString();
    };

    const formatBalance = (balance) => {
        if (!balance) return '0';
        const absBalance = Math.abs(balance);
        return balance < 0 ? `(${absBalance.toLocaleString()})` : absBalance.toLocaleString();
    };

    const getBalanceColor = (balance) => {
        if (balance === 0) return COLORS.gray;
        return balance > 0 ? COLORS.green : COLORS.red;
    };

    const handleExport = () => {
        Alert.alert(
            'Export Trial Balance',
            'Choose export format:',
            [
                {
                    text: 'PDF Report',
                    onPress: () => Alert.alert('Success', 'Trial Balance exported as PDF')
                },
                {
                    text: 'Excel Spreadsheet',
                    onPress: () => Alert.alert('Success', 'Trial Balance exported to Excel')
                },
                {
                    text: 'CSV Data',
                    onPress: () => Alert.alert('Success', 'Trial Balance exported as CSV')
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
                colors={isBalanced ? ['#8CD18C', '#4C7153'] : ['#F4EBD0', '#D79F91']}
                style={styles.balanceStatusCard}
            >
                <View style={styles.balanceStatusHeader}>
                    <Icon
                        name={isBalanced ? "check-circle" : "alert-circle"}
                        size={28}
                        color="#fff"
                    />
                    <Text style={styles.balanceStatusTitle}>
                        {isBalanced ? 'Trial Balance' : 'Balance Alert'}
                    </Text>
                </View>
                <Text style={styles.balanceStatusText}>
                    {isBalanced
                        ? 'Accounts are properly balanced'
                        : `Variance: KES ${Math.abs(netBalance).toLocaleString()}`
                    }
                </Text>
                <View style={styles.balanceStatusTotals}>
                    <Text style={styles.balanceStatusTotal}>
                        Total Debits: KES {totalDebit.toLocaleString()}
                    </Text>
                    <Text style={styles.balanceStatusTotal}>
                        Total Credits: KES {totalCredit.toLocaleString()}
                    </Text>
                </View>
            </LinearGradient>
        </View>
    );

    const renderCategorySummary = () => {
        const summaryData = categories
            .filter(cat => cat !== 'all')
            .map(category => ({
                category,
                ...getCategoryTotals(category),
                count: trialBalanceData.filter(item => item.category === category).length
            }));

        return (
            <View style={styles.categorySummaryContainer}>
                <Text style={styles.sectionTitle}>Category Summary</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.categorySummaryRow}>
                        {summaryData.map(({ category, netBalance, count }) => (
                            <TouchableOpacity
                                key={category}
                                style={[
                                    styles.categorySummaryCard,
                                    selectedCategory === category && styles.selectedCategoryCard
                                ]}
                                onPress={() => setSelectedCategory(selectedCategory === category ? 'all' : category)}
                            >
                                <Text style={styles.categoryName}>{category}</Text>
                                <Text style={styles.categoryCount}>{count} accounts</Text>
                                <Text style={[
                                    styles.categoryBalance,
                                    { color: getBalanceColor(netBalance) }
                                ]}>
                                    KES {formatBalance(netBalance)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>
        );
    };

    const renderTableHeader = () => (
        <View style={styles.tableHeader}>
            <View style={styles.tableHeaderRow}>
                <View style={[styles.headerCell, { flex: 2 }]}>
                    <Text style={styles.headerText}>Account Name</Text>
                </View>
                <View style={[styles.headerCell, { flex: 1 }]}>
                    <Text style={styles.headerText}>Type</Text>
                </View>
                {balanceView === 'separate' ? (
                    <>
                        <View style={[styles.headerCell, { flex: 1 }]}>
                            <Text style={styles.headerText}>Debit</Text>
                        </View>
                        <View style={[styles.headerCell, { flex: 1 }]}>
                            <Text style={styles.headerText}>Credit</Text>
                        </View>
                    </>
                ) : (
                    <View style={[styles.headerCell, { flex: 1 }]}>
                        <Text style={styles.headerText}>Balance</Text>
                    </View>
                )}
            </View>
        </View>
    );

    const renderAccountRow = (item, index) => {
        const isEven = index % 2 === 0;

        return (
            <View key={item.id} style={[styles.tableRow, isEven ? styles.evenRow : styles.oddRow]}>
                <View style={[styles.tableCell, { flex: 2 }]}>
                    <Text style={styles.accountName}>{item.account}</Text>
                    <Text style={styles.accountCategory}>{item.category}</Text>
                </View>
                <View style={[styles.tableCell, { flex: 1 }]}>
                    <Text style={styles.accountType}>{item.accountType}</Text>
                </View>
                {balanceView === 'separate' ? (
                    <>
                        <View style={[styles.tableCell, { flex: 1 }]}>
                            <Text style={[styles.amountText, styles.debitText]}>
                                {formatCurrency(item.debit)}
                            </Text>
                        </View>
                        <View style={[styles.tableCell, { flex: 1 }]}>
                            <Text style={[styles.amountText, styles.creditText]}>
                                {formatCurrency(item.credit)}
                            </Text>
                        </View>
                    </>
                ) : (
                    <View style={[styles.tableCell, { flex: 1 }]}>
                        <Text style={[
                            styles.amountText,
                            { color: getBalanceColor(item.balance) }
                        ]}>
                            {formatBalance(item.balance)}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    const renderCategorySection = (category) => {
        const categoryAccounts = filteredAndSortedData.filter(item => item.category === category);
        if (categoryAccounts.length === 0) return null;

        const categoryTotals = getCategoryTotals(category);

        return (
            <View key={category} style={styles.categorySection}>
                <View style={styles.categoryHeader}>
                    <Text style={styles.categoryHeaderText}>{category}</Text>
                    <Text style={styles.categoryHeaderTotal}>
                        Net: KES {formatBalance(categoryTotals.netBalance)}
                    </Text>
                </View>
                {categoryAccounts.map((item, index) => renderAccountRow(item, index))}
            </View>
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
                        <Text style={styles.headerTitle}>Trial Balance</Text>
                        <Text style={styles.headerSubtitle}>Account balance verification</Text>
                    </View>
                    <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
                        <Icon name="download" size={20} color={COLORS.white} />
                        <Text style={styles.exportButtonText}>Export</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Balance Status */}
            {renderBalanceStatus()}

            {/* Category Summary */}
            {renderCategorySummary()}

            {/* Controls */}
            <View style={styles.controlsSection}>
                <View style={styles.searchContainer}>
                    <Icon name="magnify" size={20} color={COLORS.gray} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search accounts..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={COLORS.gray2}
                    />
                    {searchQuery ? (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Icon name="close-circle" size={20} color={COLORS.gray} />
                        </TouchableOpacity>
                    ) : null}
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.viewToggle, balanceView === 'net' && styles.activeViewToggle]}
                        onPress={() => setBalanceView('net')}
                    >
                        <Text style={[styles.viewToggleText, balanceView === 'net' && styles.activeViewToggleText]}>
                            Net View
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.viewToggle, balanceView === 'separate' && styles.activeViewToggle]}
                        onPress={() => setBalanceView('separate')}
                    >
                        <Text style={[styles.viewToggleText, balanceView === 'separate' && styles.activeViewToggleText]}>
                            Debit/Credit
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => setShowSortModal(true)}
                    >
                        <Icon name="sort" size={18} color={COLORS.gray} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Results Summary */}
            <View style={styles.summarySection}>
                <Text style={styles.summaryText}>
                    {selectedCategory === 'all'
                        ? `Showing ${filteredAndSortedData.length} accounts`
                        : `${selectedCategory}: ${filteredAndSortedData.length} accounts`
                    }
                </Text>
                <TouchableOpacity onPress={() => setSelectedCategory('all')}>
                    <Text style={styles.clearFilterText}>
                        {selectedCategory !== 'all' ? 'Show All' : ''}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.tableContainer}>
                {renderTableHeader()}
                <ScrollView style={styles.tableBody} showsVerticalScrollIndicator={true}>
                    {selectedCategory === 'all'
                        ? categories.filter(cat => cat !== 'all').map(category => renderCategorySection(category))
                        : filteredAndSortedData.map((item, index) => renderAccountRow(item, index))
                    }
                </ScrollView>
            </View>

            <Modal
                visible={showSortModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowSortModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowSortModal(false)}
                >
                    <TouchableOpacity activeOpacity={1} style={styles.sortModalContainer}>
                        <Text style={styles.modalTitle}>Sort Options</Text>

                        <Text style={styles.sortSectionTitle}>Sort By</Text>
                        {[
                            { key: 'account', label: 'Account Name' },
                            { key: 'category', label: 'Category' },
                            { key: 'balance', label: 'Balance Amount' },
                            { key: 'debit', label: 'Debit Amount' },
                            { key: 'credit', label: 'Credit Amount' }
                        ].map(option => (
                            <TouchableOpacity
                                key={option.key}
                                style={styles.sortOption}
                                onPress={() => setSortBy(option.key)}
                            >
                                <Text style={[
                                    styles.sortOptionText,
                                    sortBy === option.key && styles.selectedSortText
                                ]}>
                                    {option.label}
                                </Text>
                                {sortBy === option.key && (
                                    <Icon name="check" size={20} color={COLORS.green} />
                                )}
                            </TouchableOpacity>
                        ))}

                        <Text style={styles.sortSectionTitle}>Order</Text>
                        {[
                            { key: 'asc', label: 'Ascending' },
                            { key: 'desc', label: 'Descending' }
                        ].map(option => (
                            <TouchableOpacity
                                key={option.key}
                                style={styles.sortOption}
                                onPress={() => setSortOrder(option.key)}
                            >
                                <Text style={[
                                    styles.sortOptionText,
                                    sortOrder === option.key && styles.selectedSortText
                                ]}>
                                    {option.label}
                                </Text>
                                {sortOrder === option.key && (
                                    <Icon name="check" size={20} color={COLORS.green} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
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
    categorySummaryContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 12,
    },
    categorySummaryRow: {
        flexDirection: 'row',
        gap: 12,
    },
    categorySummaryCard: {
        backgroundColor: COLORS.white,
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        minWidth: 100,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    selectedCategoryCard: {
        backgroundColor: COLORS.lightGreen,
        borderWidth: 2,
        borderColor: COLORS.green,
    },
    categoryName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 4,
    },
    categoryCount: {
        fontSize: 11,
        color: COLORS.gray,
        marginBottom: 4,
    },
    categoryBalance: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    controlsSection: {
        padding: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray1,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lightGray2,
        borderRadius: 25,
        paddingHorizontal: 16,
        marginBottom: 12,
        height: 50,
        borderWidth: 1,
        borderColor: COLORS.lightGray1,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: COLORS.black,
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    viewToggle: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: COLORS.lightGray2,
        borderWidth: 1,
        borderColor: COLORS.lightGray1,
    },
    activeViewToggle: {
        backgroundColor: COLORS.green,
        borderColor: COLORS.green,
    },
    viewToggleText: {
        fontSize: 12,
        color: COLORS.gray,
        fontWeight: '500',
    },
    activeViewToggleText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    actionButton: {
        padding: 8,
        borderRadius: 16,
        backgroundColor: COLORS.lightGray2,
        borderWidth: 1,
        borderColor: COLORS.lightGray1,
    },
    summarySection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray1,
    },
    summaryText: {
        fontSize: 14,
        color: COLORS.gray,
        fontWeight: '500',
    },
    clearFilterText: {
        fontSize: 14,
        color: COLORS.green,
        fontWeight: '600',
    },
    tableContainer: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    tableHeader: {
        backgroundColor: COLORS.lightGray2,
        borderBottomWidth: 2,
        borderBottomColor: COLORS.lightGray1,
    },
    tableHeaderRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    headerCell: {
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    headerText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black,
        textAlign: 'center',
    },
    tableBody: {
        flex: 1,
    },
    categorySection: {
        marginBottom: 8,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.lightGray3,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    categoryHeaderText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.green,
    },
    categoryHeaderTotal: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray1,
        minHeight: 60,
    },
    evenRow: {
        backgroundColor: COLORS.white,
    },
    oddRow: {
        backgroundColor: COLORS.lightGray3,
    },
    tableCell: {
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    accountName: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.black,
        marginBottom: 2,
    },
    accountCategory: {
        fontSize: 11,
        color: COLORS.gray,
    },
    accountType: {
        fontSize: 12,
        color: COLORS.gray2,
        textAlign: 'center',
    },
    amountText: {
        fontSize: 13,
        fontWeight: 'bold',
        textAlign: 'right',
    },
    debitText: {
        color: COLORS.green,
    },
    creditText: {
        color: COLORS.red,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    sortModalContainer: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
        maxHeight: height * 0.7,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 20,
        textAlign: 'center',
    },
    sortSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
        marginTop: 16,
        marginBottom: 12,
    },
    sortOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray1,
    },
    sortOptionText: {
        fontSize: 16,
        color: COLORS.black,
    },
    selectedSortText: {
        color: COLORS.green,
        fontWeight: 'bold',
    },
});

export default TrialBalanceScreen;