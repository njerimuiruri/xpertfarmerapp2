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

const PurchaseJournalScreen = () => {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showSortModal, setShowSortModal] = useState(false);
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [selectedFilters, setSelectedFilters] = useState({
        supplier: 'all',
        account: 'all',
        dateRange: 'all'
    });

    const purchaseJournalData = [
        {
            id: 1,
            date: '2025-08-15',
            description: 'Purchase of office supplies',
            supplier: 'Office Depot',
            account: 'Office Supplies',
            debit: 15000,
            credit: null
        },
        {
            id: 2,
            date: '2025-08-15',
            description: 'Payment for office supplies',
            supplier: 'Office Depot',
            account: 'Accounts Payable',
            debit: null,
            credit: 15000
        },
        {
            id: 3,
            date: '2025-08-14',
            description: 'Purchase of raw materials',
            supplier: 'Material Corp',
            account: 'Raw Materials',
            debit: 85000,
            credit: null
        },
        {
            id: 4,
            date: '2025-08-14',
            description: 'Payment for raw materials',
            supplier: 'Material Corp',
            account: 'Cash/Bank',
            debit: null,
            credit: 85000
        },
        {
            id: 5,
            date: '2025-08-13',
            description: 'Purchase of equipment parts',
            supplier: 'Tech Solutions Ltd',
            account: 'Equipment Parts',
            debit: 45000,
            credit: null
        },
        {
            id: 6,
            date: '2025-08-13',
            description: 'Payment for equipment parts',
            supplier: 'Tech Solutions Ltd',
            account: 'Accounts Payable',
            debit: null,
            credit: 45000
        },
        {
            id: 7,
            date: '2025-08-12',
            description: 'Purchase of inventory items',
            supplier: 'Wholesale Mart',
            account: 'Inventory',
            debit: 120000,
            credit: null
        },
        {
            id: 8,
            date: '2025-08-12',
            description: 'Payment for inventory',
            supplier: 'Wholesale Mart',
            account: 'Cash/Bank',
            debit: null,
            credit: 120000
        },
        {
            id: 9,
            date: '2025-08-10',
            description: 'Purchase of cleaning supplies',
            supplier: 'CleanMax Services',
            account: 'Maintenance Supplies',
            debit: 8500,
            credit: null
        },
        {
            id: 10,
            date: '2025-08-10',
            description: 'Payment for cleaning supplies',
            supplier: 'CleanMax Services',
            account: 'Cash/Bank',
            debit: null,
            credit: 8500
        },
        {
            id: 11,
            date: '2025-08-09',
            description: 'Purchase of marketing materials',
            supplier: 'Print Pro',
            account: 'Marketing Expense',
            debit: 25000,
            credit: null
        },
        {
            id: 12,
            date: '2025-08-09',
            description: 'Payment for marketing materials',
            supplier: 'Print Pro',
            account: 'Accounts Payable',
            debit: null,
            credit: 25000
        },
        {
            id: 13,
            date: '2025-08-08',
            description: 'Purchase of computer software',
            supplier: 'Software Inc',
            account: 'Software License',
            debit: 75000,
            credit: null
        },
        {
            id: 14,
            date: '2025-08-08',
            description: 'Payment for software license',
            supplier: 'Software Inc',
            account: 'Cash/Bank',
            debit: null,
            credit: 75000
        }
    ];

    const filterOptions = {
        supplier: ['all', 'Office Depot', 'Material Corp', 'Tech Solutions Ltd', 'Wholesale Mart', 'CleanMax Services', 'Print Pro', 'Software Inc'],
        account: ['all', 'Office Supplies', 'Raw Materials', 'Equipment Parts', 'Inventory', 'Maintenance Supplies', 'Marketing Expense', 'Software License', 'Accounts Payable', 'Cash/Bank'],
        dateRange: ['all', 'Last 7 days', 'Last 30 days', 'Last 90 days', 'This year']
    };

    const sortOptions = [
        { key: 'date', label: 'Date' },
        { key: 'description', label: 'Description' },
        { key: 'supplier', label: 'Supplier' },
        { key: 'account', label: 'Account' },
        { key: 'debit', label: 'Debit Amount' },
        { key: 'credit', label: 'Credit Amount' }
    ];

    const columnWidths = {
        date: width * 0.12,
        description: width * 0.30,
        supplier: width * 0.18,
        account: width * 0.16,
        debit: width * 0.12,
        credit: width * 0.12
    };

    const filteredAndSortedData = useMemo(() => {
        let filtered = purchaseJournalData;

        if (searchQuery.trim()) {
            filtered = filtered.filter(item =>
                item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.account.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedFilters.supplier !== 'all') {
            filtered = filtered.filter(item => item.supplier === selectedFilters.supplier);
        }

        if (selectedFilters.account !== 'all') {
            filtered = filtered.filter(item => item.account === selectedFilters.account);
        }

        if (selectedFilters.dateRange !== 'all') {
            const now = new Date();
            const filterDate = new Date();

            switch (selectedFilters.dateRange) {
                case 'Last 7 days':
                    filterDate.setDate(now.getDate() - 7);
                    break;
                case 'Last 30 days':
                    filterDate.setDate(now.getDate() - 30);
                    break;
                case 'Last 90 days':
                    filterDate.setDate(now.getDate() - 90);
                    break;
                case 'This year':
                    filterDate.setFullYear(now.getFullYear(), 0, 1);
                    break;
            }

            filtered = filtered.filter(item => new Date(item.date) >= filterDate);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];

            if (sortBy === 'date') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            } else if (sortBy === 'debit' || sortBy === 'credit') {
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
    }, [purchaseJournalData, searchQuery, selectedFilters, sortBy, sortOrder]);

    const handleExport = () => {
        Alert.alert(
            'Export Data',
            'Choose export format:',
            [
                {
                    text: 'CSV',
                    onPress: () => Alert.alert('Success', 'Purchase journal exported to CSV format')
                },
                {
                    text: 'Excel',
                    onPress: () => Alert.alert('Success', 'Purchase journal exported to Excel format')
                },
                {
                    text: 'PDF',
                    onPress: () => Alert.alert('Success', 'Purchase journal exported to PDF format')
                },
                {
                    text: 'Cancel',
                    style: 'cancel'
                }
            ]
        );
    };

    const formatCurrency = (amount) => {
        if (!amount) return '';
        return amount.toLocaleString();
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const resetFilters = () => {
        setSelectedFilters({
            supplier: 'all',
            account: 'all',
            dateRange: 'all'
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
            <View style={[styles.headerCell, { width: columnWidths.date }]}>
                <Text style={styles.headerText}>Date</Text>
            </View>
            <View style={[styles.headerCell, { width: columnWidths.description }]}>
                <Text style={styles.headerText}>Description</Text>
            </View>
            <View style={[styles.headerCell, { width: columnWidths.supplier }]}>
                <Text style={styles.headerText}>Supplier</Text>
            </View>
            <View style={[styles.headerCell, { width: columnWidths.account }]}>
                <Text style={styles.headerText}>Account</Text>
            </View>
            <View style={[styles.headerCell, { width: columnWidths.debit }]}>
                <Text style={styles.headerText}>Debit</Text>
            </View>
            <View style={[styles.headerCell, { width: columnWidths.credit }]}>
                <Text style={styles.headerText}>Credit</Text>
            </View>
        </View>
    );

    const renderTableRow = (item, index) => (
        <View key={item.id} style={[styles.tableRow, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
            <View style={[styles.tableCell, { width: columnWidths.date }]}>
                <Text style={styles.cellText}>{formatDate(item.date)}</Text>
            </View>
            <View style={[styles.tableCell, { width: columnWidths.description }]}>
                <Text style={styles.cellText} numberOfLines={3}>{item.description}</Text>
            </View>
            <View style={[styles.tableCell, { width: columnWidths.supplier }]}>
                <Text style={styles.cellText}>{item.supplier}</Text>
            </View>
            <View style={[styles.tableCell, { width: columnWidths.account }]}>
                <Text style={styles.cellText}>{item.account}</Text>
            </View>
            <View style={[styles.tableCell, { width: columnWidths.debit }]}>
                <Text style={[styles.cellText, styles.debitText]}>{formatCurrency(item.debit)}</Text>
            </View>
            <View style={[styles.tableCell, { width: columnWidths.credit }]}>
                <Text style={[styles.cellText, styles.creditText]}>{formatCurrency(item.credit)}</Text>
            </View>
        </View>
    );

    const renderTotalRow = () => (
        <View style={[styles.tableRow, styles.totalRow]}>
            <View style={[styles.tableCell, { width: columnWidths.date }]}>
                <Text style={styles.totalText}></Text>
            </View>
            <View style={[styles.tableCell, { width: columnWidths.description }]}>
                <Text style={styles.totalText}>TOTAL</Text>
            </View>
            <View style={[styles.tableCell, { width: columnWidths.supplier }]}>
                <Text style={styles.totalText}></Text>
            </View>
            <View style={[styles.tableCell, { width: columnWidths.account }]}>
                <Text style={styles.totalText}></Text>
            </View>
            <View style={[styles.tableCell, { width: columnWidths.debit }]}>
                <Text style={[styles.totalText, styles.debitText]}>{formatCurrency(totalDebit)}</Text>
            </View>
            <View style={[styles.tableCell, { width: columnWidths.credit }]}>
                <Text style={[styles.totalText, styles.creditText]}>{formatCurrency(totalCredit)}</Text>
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
                        <Text style={styles.headerTitle}>Purchase Journal</Text>
                        <Text style={styles.headerSubtitle}>Track all purchase-related transactions</Text>
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
                        placeholder="Search descriptions, suppliers, accounts..."
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
                    Showing {filteredAndSortedData.length} of {purchaseJournalData.length} entries
                </Text>
                <Text style={styles.summaryBalance}>
                    Total Balance: {formatCurrency(totalDebit - totalCredit)}
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
                                <Text style={styles.filterGroupTitle}>Supplier</Text>
                                {filterOptions.supplier.map(option => (
                                    <TouchableOpacity
                                        key={option}
                                        style={styles.filterOption}
                                        onPress={() => setSelectedFilters(prev => ({ ...prev, supplier: option }))}
                                    >
                                        <Text style={[
                                            styles.filterOptionText,
                                            selectedFilters.supplier === option && styles.selectedFilterText
                                        ]}>
                                            {option === 'all' ? 'All Suppliers' : option}
                                        </Text>
                                        {selectedFilters.supplier === option && (
                                            <Icon name="check" size={20} color={COLORS.green} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={styles.filterGroup}>
                                <Text style={styles.filterGroupTitle}>Account</Text>
                                {filterOptions.account.map(option => (
                                    <TouchableOpacity
                                        key={option}
                                        style={styles.filterOption}
                                        onPress={() => setSelectedFilters(prev => ({ ...prev, account: option }))}
                                    >
                                        <Text style={[
                                            styles.filterOptionText,
                                            selectedFilters.account === option && styles.selectedFilterText
                                        ]}>
                                            {option === 'all' ? 'All Accounts' : option}
                                        </Text>
                                        {selectedFilters.account === option && (
                                            <Icon name="check" size={20} color={COLORS.green} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={styles.filterGroup}>
                                <Text style={styles.filterGroupTitle}>Date Range</Text>
                                {filterOptions.dateRange.map(option => (
                                    <TouchableOpacity
                                        key={option}
                                        style={styles.filterOption}
                                        onPress={() => setSelectedFilters(prev => ({ ...prev, dateRange: option }))}
                                    >
                                        <Text style={[
                                            styles.filterOptionText,
                                            selectedFilters.dateRange === option && styles.selectedFilterText
                                        ]}>
                                            {option === 'all' ? 'All Time' : option}
                                        </Text>
                                        {selectedFilters.dateRange === option && (
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
        fontSize: 16,
        color: COLORS.green,
        fontWeight: 'bold',
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
        borderTopColor: COLORS.green,
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
    debitText: {
        textAlign: 'right',
        fontWeight: '600',
        numberOfLines: 1,
    },
    creditText: {
        textAlign: 'right',
        fontWeight: '600',
        numberOfLines: 1,
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
        margin: 20,
        borderRadius: 20,
        padding: 20,
        maxHeight: height * 0.7,
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

export default PurchaseJournalScreen;