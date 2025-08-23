import React, { useState, useMemo } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Dimensions,
    TextInput, Alert
} from 'react-native';
import Header from '../../../components/headers/main-header';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../../constants/theme';

const { width, height } = Dimensions.get('window');

const GeneralLedgerScreen = () => {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showSortModal, setShowSortModal] = useState(false);
    const [sortBy, setSortBy] = useState('account');
    const [sortOrder, setSortOrder] = useState('asc');
    const [selectedFilters, setSelectedFilters] = useState({
        accountType: 'all',
        balanceType: 'all'
    });

    const generalLedgerData = [
        {
            id: 1,
            account: 'Bank/Cash',
            debit: 4590,
            credit: 2245275,
            accountType: 'Assets',
            balance: -2240685
        },
        {
            id: 2,
            account: 'BeefSales',
            debit: 0,
            credit: 3500,
            accountType: 'Revenue',
            balance: -3500
        },
        {
            id: 3,
            account: 'BoosterStock',
            debit: 300,
            credit: 0,
            accountType: 'Assets',
            balance: 300
        },
        {
            id: 4,
            account: 'DairySales',
            debit: 0,
            credit: 1090,
            accountType: 'Revenue',
            balance: -1090
        },
        {
            id: 5,
            account: 'Facilities',
            debit: 99500,
            credit: 0,
            accountType: 'Assets',
            balance: 99500
        },
        {
            id: 6,
            account: 'Feeds',
            debit: 840,
            credit: 0,
            accountType: 'Expenses',
            balance: 840
        },
        {
            id: 7,
            account: 'Health - Deworming',
            debit: 215,
            credit: 0,
            accountType: 'Expenses',
            balance: 215
        },
        {
            id: 8,
            account: 'Health - Vaccination',
            debit: 215,
            credit: 0,
            accountType: 'Expenses',
            balance: 215
        },
        {
            id: 9,
            account: 'Health – Allergies',
            debit: 50,
            credit: 0,
            accountType: 'Expenses',
            balance: 50
        },
        {
            id: 10,
            account: 'Health – Boosters',
            debit: 380,
            credit: 0,
            accountType: 'Expenses',
            balance: 380
        },
        {
            id: 11,
            account: 'Health – Genetics',
            debit: 50,
            credit: 0,
            accountType: 'Expenses',
            balance: 50
        },
        {
            id: 12,
            account: 'Health – Treatment',
            debit: 215,
            credit: 0,
            accountType: 'Expenses',
            balance: 215
        },
        {
            id: 13,
            account: 'Livestock',
            debit: 35000,
            credit: 0,
            accountType: 'Assets',
            balance: 35000
        },
        {
            id: 14,
            account: 'Machinery',
            debit: 1015,
            credit: 0,
            accountType: 'Assets',
            balance: 1015
        },
        {
            id: 15,
            account: 'Other Income– Biological Gains',
            debit: 0,
            credit: 10000,
            accountType: 'Revenue',
            balance: -10000
        },
        {
            id: 16,
            account: 'PAYE Payable',
            debit: 0,
            credit: 0,
            accountType: 'Liabilities',
            balance: 0
        },
        {
            id: 17,
            account: 'PowerStock',
            debit: 45000,
            credit: 0,
            accountType: 'Assets',
            balance: 45000
        },
        {
            id: 18,
            account: 'Salaries and Wages',
            debit: 2240,
            credit: 0,
            accountType: 'Expenses',
            balance: 2240
        },
        {
            id: 19,
            account: 'Servicing (Expense)',
            debit: 255,
            credit: 0,
            accountType: 'Expenses',
            balance: 255
        },
        {
            id: 20,
            account: 'WaterStock',
            debit: 2070000,
            credit: 0,
            accountType: 'Assets',
            balance: 2070000
        }
    ];

    const filterOptions = {
        accountType: ['all', 'Assets', 'Liabilities', 'Revenue', 'Expenses'],
        balanceType: ['all', 'Debit Balance', 'Credit Balance', 'Zero Balance']
    };

    const sortOptions = [
        { key: 'account', label: 'Account Name' },
        { key: 'debit', label: 'Debit Amount' },
        { key: 'credit', label: 'Credit Amount' },
        { key: 'balance', label: 'Balance' },
        { key: 'accountType', label: 'Account Type' }
    ];

    const columnWidths = {
        account: width * 0.4,
        debit: width * 0.2,
        credit: width * 0.2,
        balance: width * 0.2
    };

    const filteredAndSortedData = useMemo(() => {
        let filtered = generalLedgerData;

        if (searchQuery.trim()) {
            filtered = filtered.filter(item =>
                item.account.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.accountType.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedFilters.accountType !== 'all') {
            filtered = filtered.filter(item => item.accountType === selectedFilters.accountType);
        }

        if (selectedFilters.balanceType !== 'all') {
            switch (selectedFilters.balanceType) {
                case 'Debit Balance':
                    filtered = filtered.filter(item => item.balance > 0);
                    break;
                case 'Credit Balance':
                    filtered = filtered.filter(item => item.balance < 0);
                    break;
                case 'Zero Balance':
                    filtered = filtered.filter(item => item.balance === 0);
                    break;
            }
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];

            if (sortBy === 'debit' || sortBy === 'credit' || sortBy === 'balance') {
                aVal = aVal || 0;
                bVal = bVal || 0;
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
    }, [generalLedgerData, searchQuery, selectedFilters, sortBy, sortOrder]);

    const handleExport = () => {
        Alert.alert(
            'Export General Ledger',
            'Choose export format:',
            [
                {
                    text: 'CSV',
                    onPress: () => Alert.alert('Success', 'General Ledger exported to CSV format')
                },
                {
                    text: 'Excel',
                    onPress: () => Alert.alert('Success', 'General Ledger exported to Excel format')
                },
                {
                    text: 'PDF',
                    onPress: () => Alert.alert('Success', 'General Ledger exported to PDF format')
                },
                {
                    text: 'Cancel',
                    style: 'cancel'
                }
            ]
        );
    };

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return '';
        if (amount === 0) return '0';
        return amount.toLocaleString();
    };

    const formatBalance = (balance) => {
        const absBalance = Math.abs(balance);
        const formatted = absBalance.toLocaleString();
        if (balance > 0) {
            return `${formatted} Dr`;
        } else if (balance < 0) {
            return `${formatted} Cr`;
        } else {
            return '0';
        }
    };

    const resetFilters = () => {
        setSelectedFilters({
            accountType: 'all',
            balanceType: 'all'
        });
        setSearchQuery('');
    };

    const calculateTotals = () => {
        const totalDebit = filteredAndSortedData.reduce((sum, item) => sum + (item.debit || 0), 0);
        const totalCredit = filteredAndSortedData.reduce((sum, item) => sum + (item.credit || 0), 0);
        return { totalDebit, totalCredit };
    };

    const { totalDebit, totalCredit } = calculateTotals();

    const renderTableHeader = () => (
        <View style={styles.tableHeaderRow}>
            <View style={[styles.headerCell, { width: columnWidths.account }]}>
                <Text style={styles.headerText}>Account</Text>
            </View>
            <View style={[styles.headerCell, { width: columnWidths.debit }]}>
                <Text style={styles.headerText}>Debit (KES)</Text>
            </View>
            <View style={[styles.headerCell, { width: columnWidths.credit }]}>
                <Text style={styles.headerText}>Credit (KES)</Text>
            </View>
            <View style={[styles.headerCell, { width: columnWidths.balance }]}>
                <Text style={styles.headerText}>Balance</Text>
            </View>
        </View>
    );

    const renderTableRow = (item, index) => (
        <View key={item.id} style={[styles.tableRow, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
            <View style={[styles.tableCell, { width: columnWidths.account }]}>
                <Text style={styles.cellText} numberOfLines={2}>{item.account}</Text>
                <Text style={styles.accountTypeText}>{item.accountType}</Text>
            </View>
            <View style={[styles.tableCell, { width: columnWidths.debit }]}>
                <Text style={[styles.cellText, styles.debitText]}>{formatCurrency(item.debit)}</Text>
            </View>
            <View style={[styles.tableCell, { width: columnWidths.credit }]}>
                <Text style={[styles.cellText, styles.creditText]}>{formatCurrency(item.credit)}</Text>
            </View>
            <View style={[styles.tableCell, { width: columnWidths.balance }]}>
                <Text style={[styles.cellText, styles.balanceText,
                item.balance > 0 ? styles.debitBalance :
                    item.balance < 0 ? styles.creditBalance : styles.zeroBalance
                ]}>
                    {formatBalance(item.balance)}
                </Text>
            </View>
        </View>
    );

    const renderTotalRow = () => (
        <View style={[styles.tableRow, styles.totalRow]}>
            <View style={[styles.tableCell, { width: columnWidths.account }]}>
                <Text style={styles.totalText}>TOTAL</Text>
            </View>
            <View style={[styles.tableCell, { width: columnWidths.debit }]}>
                <Text style={[styles.totalText, styles.debitText]}>{formatCurrency(totalDebit)}</Text>
            </View>
            <View style={[styles.tableCell, { width: columnWidths.credit }]}>
                <Text style={[styles.totalText, styles.creditText]}>{formatCurrency(totalCredit)}</Text>
            </View>
            <View style={[styles.tableCell, { width: columnWidths.balance }]}>
                <Text style={styles.totalText}>-</Text>
            </View>
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
                        <Text style={styles.headerTitle}>General Ledger</Text>
                        <Text style={styles.headerSubtitle}>Summary of all account balances</Text>
                    </View>
                    <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
                        <Icon name="download" size={20} color={COLORS.white} />
                        <Text style={styles.exportButtonText}>Export</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Controls Section */}
            <View style={styles.controlsSection}>
                <View style={styles.searchContainer}>
                    <Icon name="magnify" size={20} color={COLORS.gray} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search accounts, account types..."
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
                        style={styles.actionButton}
                        onPress={() => setShowFilterModal(true)}
                    >
                        <Icon name="filter" size={18} color={COLORS.gray} />
                        <Text style={styles.actionButtonText}>Filter</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => setShowSortModal(true)}
                    >
                        <Icon name="sort" size={18} color={COLORS.gray} />
                        <Text style={styles.actionButtonText}>Sort</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.resetButton}
                        onPress={resetFilters}
                    >
                        <Icon name="refresh" size={18} color={COLORS.red} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.summarySection}>
                <Text style={styles.summaryText}>
                    Showing {filteredAndSortedData.length} of {generalLedgerData.length} accounts
                </Text>
                <Text style={styles.summaryBalance}>
                    Total Debits: {formatCurrency(totalDebit)} | Total Credits: {formatCurrency(totalCredit)}
                </Text>
            </View>

            <View style={styles.tableContainer}>
                {renderTableHeader()}
                <ScrollView
                    style={styles.tableBody}
                    showsVerticalScrollIndicator={true}
                >
                    {filteredAndSortedData.map(renderTableRow)}
                    {filteredAndSortedData.length > 0 && renderTotalRow()}
                </ScrollView>
            </View>

            {/* Filter Modal */}
            <Modal
                visible={showFilterModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowFilterModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowFilterModal(false)}
                >
                    <TouchableOpacity activeOpacity={1} style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filter Options</Text>
                            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                                <Icon name="close" size={24} color={COLORS.gray} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                            <View style={styles.filterGroup}>
                                <Text style={styles.filterGroupTitle}>Account Type</Text>
                                {filterOptions.accountType.map(option => (
                                    <TouchableOpacity
                                        key={option}
                                        style={styles.filterOption}
                                        onPress={() => setSelectedFilters(prev => ({ ...prev, accountType: option }))}
                                    >
                                        <Text style={[
                                            styles.filterOptionText,
                                            selectedFilters.accountType === option && styles.selectedFilterText
                                        ]}>
                                            {option === 'all' ? 'All Account Types' : option}
                                        </Text>
                                        {selectedFilters.accountType === option && (
                                            <Icon name="check" size={20} color={COLORS.green} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={styles.filterGroup}>
                                <Text style={styles.filterGroupTitle}>Balance Type</Text>
                                {filterOptions.balanceType.map(option => (
                                    <TouchableOpacity
                                        key={option}
                                        style={styles.filterOption}
                                        onPress={() => setSelectedFilters(prev => ({ ...prev, balanceType: option }))}
                                    >
                                        <Text style={[
                                            styles.filterOptionText,
                                            selectedFilters.balanceType === option && styles.selectedFilterText
                                        ]}>
                                            {option === 'all' ? 'All Balances' : option}
                                        </Text>
                                        {selectedFilters.balanceType === option && (
                                            <Icon name="check" size={20} color={COLORS.green} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.clearFiltersButton} onPress={resetFilters}>
                                <Text style={styles.clearFiltersText}>Clear All</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.applyFiltersButton}
                                onPress={() => setShowFilterModal(false)}
                            >
                                <Text style={styles.applyFiltersText}>Apply Filters</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* Sort Modal */}
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
                        {sortOptions.map(option => (
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
                        <TouchableOpacity
                            style={styles.sortOption}
                            onPress={() => setSortOrder('asc')}
                        >
                            <Text style={[
                                styles.sortOptionText,
                                sortOrder === 'asc' && styles.selectedSortText
                            ]}>
                                Ascending
                            </Text>
                            {sortOrder === 'asc' && (
                                <Icon name="check" size={20} color={COLORS.green} />
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.sortOption}
                            onPress={() => setSortOrder('desc')}
                        >
                            <Text style={[
                                styles.sortOptionText,
                                sortOrder === 'desc' && styles.selectedSortText
                            ]}>
                                Descending
                            </Text>
                            {sortOrder === 'desc' && (
                                <Icon name="check" size={20} color={COLORS.green} />
                            )}
                        </TouchableOpacity>
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
        marginBottom: 16,
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
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lightGray2,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.lightGray1,
    },
    actionButtonText: {
        marginLeft: 6,
        color: COLORS.gray,
        fontSize: 14,
        fontWeight: '500',
    },
    resetButton: {
        padding: 10,
        backgroundColor: COLORS.lightGreen,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.green,
    },
    summarySection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray1,
    },
    summaryText: {
        fontSize: 14,
        color: COLORS.gray,
        fontWeight: '500',
    },
    summaryBalance: {
        fontSize: 12,
        color: COLORS.green,
        fontWeight: 'bold',
        textAlign: 'right',
        flex: 1,
        marginLeft: 10,
    },
    tableContainer: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: COLORS.lightGray2,
        paddingVertical: 12,
        borderBottomWidth: 2,
        borderBottomColor: COLORS.lightGray1,
    },
    headerCell: {
        paddingHorizontal: 8,
        justifyContent: 'center',
        borderRightWidth: 1,
        borderRightColor: COLORS.lightGray1,
    },
    headerText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.black,
        textAlign: 'center',
    },
    tableBody: {
        flex: 1,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
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
    totalRow: {
        backgroundColor: COLORS.lightGray2,
        borderTopWidth: 2,
        borderTopColor: COLORS.lightGray1,
    },
    tableCell: {
        paddingHorizontal: 8,
        justifyContent: 'center',
        borderRightWidth: 1,
        borderRightColor: COLORS.lightGray1,
    },
    cellText: {
        fontSize: 11,
        color: COLORS.black,
        textAlign: 'left',
        flexWrap: 'wrap',
    },
    accountTypeText: {
        fontSize: 9,
        color: COLORS.gray,
        fontStyle: 'italic',
        marginTop: 2,
    },
    debitText: {
        textAlign: 'right',
        fontWeight: '600',
    },
    creditText: {
        textAlign: 'right',
        fontWeight: '600',
    },
    balanceText: {
        textAlign: 'right',
        fontWeight: 'bold',
        fontSize: 10,
    },
    debitBalance: {
        color: COLORS.blue,
    },
    creditBalance: {
        color: COLORS.red,
    },
    zeroBalance: {
        color: COLORS.gray,
    },
    totalText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.black,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: height * 0.8,
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    filterGroup: {
        marginBottom: 24,
    },
    filterGroupTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 12,
    },
    filterOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: COLORS.lightGray2,
        borderRadius: 8,
        marginBottom: 8,
    },
    filterOptionText: {
        fontSize: 14,
        color: COLORS.black,
    },
    selectedFilterText: {
        fontWeight: 'bold',
        color: COLORS.green,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray1,
        gap: 12,
    },
    clearFiltersButton: {
        flex: 1,
        paddingVertical: 12,
        backgroundColor: COLORS.lightGray2,
        borderRadius: 8,
        alignItems: 'center',
    },
    clearFiltersText: {
        fontSize: 14,
        color: COLORS.gray,
        fontWeight: '600',
    },
    applyFiltersButton: {
        flex: 1,
        paddingVertical: 12,
        backgroundColor: COLORS.green,
        borderRadius: 8,
        alignItems: 'center',
    },
    applyFiltersText: {
        fontSize: 14,
        color: COLORS.white,
        fontWeight: '600',
    },
    sortModalContainer: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: height * 0.6,
    },
    sortSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
        marginTop: 20,
        marginBottom: 12,
    },
    sortOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: COLORS.lightGray2,
        borderRadius: 8,
        marginBottom: 8,
    },
    sortOptionText: {
        fontSize: 14,
        color: COLORS.black,
    },
    selectedSortText: {
        fontWeight: 'bold',
        color: COLORS.green,
    },
});

export default GeneralLedgerScreen;