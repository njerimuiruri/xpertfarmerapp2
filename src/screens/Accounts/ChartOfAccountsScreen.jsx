import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PieChart } from 'react-native-chart-kit';

const { width: screenWidth } = Dimensions.get('window');

const mockNavigation = {
    navigate: (screen) => console.log(`Navigate to: ${screen}`),
    goBack: () => console.log('Go back')
};

// Header Component
const Header = ({ navigation }) => (
    <LinearGradient
        colors={['#4C7153', '#8CD18C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
    >
        <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chart of Accounts</Text>
        </View>
        <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton}>
                <Icon name="plus" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
                <Icon name="magnify" size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    </LinearGradient>
);

const ChartOfAccountsScreen = () => {
    const navigation = mockNavigation;
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [activeTab, setActiveTab] = useState('structure');

    const chartStructure = {
        assets: {
            title: 'ASSETS',
            icon: 'bank',
            color: '#4C7153',
            total: 2250815,
            accounts: [
                {
                    name: 'Livestock',
                    code: '1100',
                    type: 'Current Assets',
                    balance: 35000,
                    subAccounts: ['Cows (Milking)', 'Calves', 'Bulls'],
                    description: 'Live animals owned by the farm'
                },
                {
                    name: 'Water Stock',
                    code: '1200',
                    type: 'Non-Current Assets',
                    balance: 2070000,
                    subAccounts: ['Borehole', 'Water Tanks', 'Water Supply'],
                    description: 'Water infrastructure and storage'
                },
                {
                    name: 'Power Stock',
                    code: '1300',
                    type: 'Non-Current Assets',
                    balance: 45000,
                    subAccounts: ['Generator', 'Fuel', 'Electricity Units'],
                    description: 'Power generation and consumption assets'
                },
                {
                    name: 'Facilities',
                    code: '1400',
                    type: 'Non-Current Assets',
                    balance: 99500,
                    subAccounts: ['Barn', 'Storage Units', 'Fencing'],
                    description: 'Farm structures and facilities'
                },
                {
                    name: 'Machinery',
                    code: '1500',
                    type: 'Non-Current Assets',
                    balance: 1015,
                    subAccounts: ['Jembes', 'Wheelbarrow', 'Tools'],
                    description: 'Farm equipment and machinery'
                },
                {
                    name: 'Goods in Stock',
                    code: '1600',
                    type: 'Current Assets',
                    balance: 1345,
                    subAccounts: ['Pesticides', 'Detergents', 'Sanitizers'],
                    description: 'Consumable goods inventory'
                },
                {
                    name: 'Booster Stock',
                    code: '1700',
                    type: 'Current Assets',
                    balance: 300,
                    subAccounts: ['Health Boosters', 'Nutritional Additives'],
                    description: 'Health and nutrition supplements'
                }
            ]
        },
        liabilities: {
            title: 'LIABILITIES',
            icon: 'credit-card',
            color: '#D79F91',
            total: 0,
            accounts: [
                {
                    name: 'PAYE Payable',
                    code: '2100',
                    type: 'Current Liabilities',
                    balance: 0,
                    subAccounts: ['Employee Tax Deductions'],
                    description: 'Tax obligations to revenue authority'
                }
            ]
        },
        equity: {
            title: 'EQUITY',
            icon: 'account-balance',
            color: '#8CD18C',
            total: 10130,
            accounts: [
                {
                    name: 'Retained Earnings',
                    code: '3100',
                    type: 'Owner\'s Equity',
                    balance: 10130,
                    subAccounts: ['Current Year Earnings', 'Prior Year Earnings'],
                    description: 'Accumulated profits retained in business'
                }
            ]
        },
        revenue: {
            title: 'REVENUE',
            icon: 'cash-plus',
            color: '#A7E3A7',
            total: 14590,
            accounts: [
                {
                    name: 'Dairy Sales',
                    code: '4100',
                    type: 'Operating Revenue',
                    balance: 1090,
                    subAccounts: ['Local Dairy Sales', 'Retail Store Sales'],
                    description: 'Income from milk and dairy products'
                },
                {
                    name: 'Beef Sales',
                    code: '4200',
                    type: 'Operating Revenue',
                    balance: 3500,
                    subAccounts: ['KMC Sales', 'Beef Market Sales'],
                    description: 'Income from cattle and beef products'
                },
                {
                    name: 'Biological Gains',
                    code: '4300',
                    type: 'Other Revenue',
                    balance: 10000,
                    subAccounts: ['Newborn Animals', 'Weight Gains'],
                    description: 'Value increase from livestock growth'
                }
            ]
        },
        expenses: {
            title: 'EXPENSES',
            icon: 'cash-minus',
            color: '#BD91D7',
            total: 4460,
            accounts: [
                {
                    name: 'Salaries and Wages',
                    code: '5100',
                    type: 'Operating Expenses',
                    balance: 2240,
                    subAccounts: ['Full-Time Wages', 'Part-Time Wages'],
                    description: 'Employee compensation costs'
                },
                {
                    name: 'Feeds',
                    code: '5200',
                    type: 'Operating Expenses',
                    balance: 840,
                    subAccounts: ['Single Feeding', 'Group Feeding', 'Transport'],
                    description: 'Animal feed and nutrition costs'
                },
                {
                    name: 'Health - Vaccination',
                    code: '5300',
                    type: 'Operating Expenses',
                    balance: 215,
                    subAccounts: ['Vaccination Drugs', 'Vaccination Services'],
                    description: 'Preventive vaccination expenses'
                },
                {
                    name: 'Health - Deworming',
                    code: '5310',
                    type: 'Operating Expenses',
                    balance: 215,
                    subAccounts: ['Deworming Drugs', 'Deworming Services'],
                    description: 'Parasite control expenses'
                },
                {
                    name: 'Health - Treatment',
                    code: '5320',
                    type: 'Operating Expenses',
                    balance: 215,
                    subAccounts: ['Curative Drugs', 'Treatment Services'],
                    description: 'Medical treatment expenses'
                },
                {
                    name: 'Health - Genetics',
                    code: '5330',
                    type: 'Operating Expenses',
                    balance: 50,
                    subAccounts: ['Genetic Remedies'],
                    description: 'Genetic condition treatments'
                },
                {
                    name: 'Health - Allergies',
                    code: '5340',
                    type: 'Operating Expenses',
                    balance: 50,
                    subAccounts: ['Allergy Remedies'],
                    description: 'Allergy treatment expenses'
                },
                {
                    name: 'Health - Boosters',
                    code: '5350',
                    type: 'Operating Expenses',
                    balance: 380,
                    subAccounts: ['Boosters', 'Additives', 'Administration'],
                    description: 'Health supplements and additives'
                },
                {
                    name: 'Servicing',
                    code: '5400',
                    type: 'Operating Expenses',
                    balance: 255,
                    subAccounts: ['AI Services', 'Breeding Bulls', 'Administration'],
                    description: 'Breeding and reproduction services'
                },
                {
                    name: 'Machinery Services',
                    code: '5500',
                    type: 'Operating Expenses',
                    balance: 15,
                    subAccounts: ['Equipment Service', 'Repairs'],
                    description: 'Equipment maintenance and repair'
                }
            ]
        }
    };

    const accountCategories = Object.keys(chartStructure);

    const chartConfig = {
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        color: (opacity = 1) => `rgba(76, 113, 83, ${opacity})`,
        strokeWidth: 2,
    };

    // Account distribution data for pie chart
    const accountDistributionData = [
        {
            name: 'Assets',
            population: chartStructure.assets.total,
            color: '#4C7153',
            legendFontColor: '#333',
            legendFontSize: 10,
        },
        {
            name: 'Revenue',
            population: chartStructure.revenue.total,
            color: '#A7E3A7',
            legendFontColor: '#333',
            legendFontSize: 10,
        },
        {
            name: 'Expenses',
            population: chartStructure.expenses.total,
            color: '#BD91D7',
            legendFontColor: '#333',
            legendFontSize: 10,
        },
        {
            name: 'Equity',
            population: chartStructure.equity.total,
            color: '#8CD18C',
            legendFontColor: '#333',
            legendFontSize: 10,
        }
    ];

    const tabs = [
        { id: 'structure', label: 'Structure', icon: 'file-tree' },
        { id: 'overview', label: 'Overview', icon: 'chart-pie' },
        { id: 'accounts', label: 'All Accounts', icon: 'format-list-bulleted' }
    ];

    const renderCategoryCard = (categoryKey) => {
        const category = chartStructure[categoryKey];
        const accountCount = category.accounts.length;

        return (
            <TouchableOpacity
                key={categoryKey}
                style={styles.categoryCard}
                onPress={() => {
                    setSelectedCategory({ key: categoryKey, ...category });
                    setShowDetailModal(true);
                }}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={[category.color, `${category.color}CC`]}
                    style={styles.categoryGradient}
                >
                    <View style={styles.categoryHeader}>
                        <View style={styles.categoryIconContainer}>
                            <Icon name={category.icon} size={28} color="#fff" />
                        </View>
                        <View style={styles.categoryStats}>
                            <Text style={styles.accountCount}>{accountCount}</Text>
                            <Text style={styles.accountLabel}>Accounts</Text>
                        </View>
                    </View>
                    <Text style={styles.categoryTitle}>{category.title}</Text>
                    <Text style={styles.categoryBalance}>
                        KES {category.total.toLocaleString()}
                    </Text>
                    <View style={styles.categoryFooter}>
                        <Text style={styles.viewDetails}>View Details</Text>
                        <Icon name="chevron-right" size={16} color="rgba(255,255,255,0.8)" />
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        );
    };

    const renderAccountItem = (account, categoryColor) => (
        <View key={account.code} style={styles.accountItem}>
            <View style={styles.accountHeader}>
                <View style={[styles.accountCodeBadge, { backgroundColor: categoryColor }]}>
                    <Text style={styles.accountCode}>{account.code}</Text>
                </View>
                <View style={styles.accountInfo}>
                    <Text style={styles.accountName}>{account.name}</Text>
                    <Text style={styles.accountType}>{account.type}</Text>
                </View>
                <Text style={styles.accountBalance}>
                    KES {Math.abs(account.balance).toLocaleString()}
                </Text>
            </View>
            <Text style={styles.accountDescription}>{account.description}</Text>
            {account.subAccounts.length > 0 && (
                <View style={styles.subAccountsContainer}>
                    <Text style={styles.subAccountsLabel}>Sub-accounts:</Text>
                    <View style={styles.subAccountsList}>
                        {account.subAccounts.map((sub, index) => (
                            <View key={index} style={styles.subAccountChip}>
                                <Text style={styles.subAccountText}>{sub}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </View>
    );

    const renderTab = ({ id, label, icon }) => (
        <TouchableOpacity
            key={id}
            style={[styles.tab, activeTab === id && styles.activeTab]}
            onPress={() => setActiveTab(id)}
            activeOpacity={0.7}
        >
            <Icon name={icon} size={18} color={activeTab === id ? '#4C7153' : '#666'} />
            <Text style={[styles.tabText, activeTab === id && styles.activeTabText]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'structure':
                return (
                    <View style={styles.tabContent}>
                        <Text style={styles.sectionTitle}>Account Categories</Text>
                        <Text style={styles.sectionDescription}>
                            Organized structure of your farm's financial accounts
                        </Text>
                        <View style={styles.categoriesGrid}>
                            {accountCategories.map(renderCategoryCard)}
                        </View>
                    </View>
                );

            case 'overview':
                return (
                    <View style={styles.tabContent}>
                        <Text style={styles.sectionTitle}>Account Overview</Text>

                        {/* Summary Cards */}
                        <View style={styles.summaryCards}>
                            <View style={styles.summaryCard}>
                                <Icon name="file-multiple" size={24} color="#4C7153" />
                                <Text style={styles.summaryNumber}>
                                    {Object.values(chartStructure).reduce((total, cat) => total + cat.accounts.length, 0)}
                                </Text>
                                <Text style={styles.summaryLabel}>Total Accounts</Text>
                            </View>
                            <View style={styles.summaryCard}>
                                <Icon name="check-circle" size={24} color="#4C7153" />
                                <Text style={styles.summaryNumber}>
                                    {Object.values(chartStructure).filter(cat => cat.accounts.some(acc => acc.balance > 0)).length}
                                </Text>
                                <Text style={styles.summaryLabel}>Active Categories</Text>
                            </View>
                        </View>

                        {/* Distribution Chart */}
                        <View style={styles.chartContainer}>
                            <Text style={styles.chartTitle}>Account Balance Distribution</Text>
                            <PieChart
                                data={accountDistributionData}
                                width={screenWidth - 64}
                                height={220}
                                chartConfig={chartConfig}
                                accessor="population"
                                backgroundColor="transparent"
                                paddingLeft="15"
                                absolute
                            />
                        </View>

                        {/* Key Insights */}
                        <View style={styles.insightsContainer}>
                            <Text style={styles.insightsTitle}>Key Insights</Text>
                            <View style={styles.insightItem}>
                                <Icon name="trending-up" size={16} color="#4C7153" />
                                <Text style={styles.insightText}>Assets represent 99.4% of total account values</Text>
                            </View>
                            <View style={styles.insightItem}>
                                <Icon name="water" size={16} color="#4C7153" />
                                <Text style={styles.insightText}>Water infrastructure is the largest asset category</Text>
                            </View>
                            <View style={styles.insightItem}>
                                <Icon name="cow" size={16} color="#4C7153" />
                                <Text style={styles.insightText}>Biological gains contribute 68% of revenue</Text>
                            </View>
                        </View>
                    </View>
                );

            case 'accounts':
                return (
                    <View style={styles.tabContent}>
                        <Text style={styles.sectionTitle}>All Accounts</Text>
                        {accountCategories.map(categoryKey => {
                            const category = chartStructure[categoryKey];
                            return (
                                <View key={categoryKey} style={styles.categorySection}>
                                    <View style={styles.categorySectionHeader}>
                                        <Icon name={category.icon} size={20} color={category.color} />
                                        <Text style={[styles.categorySectionTitle, { color: category.color }]}>
                                            {category.title}
                                        </Text>
                                        <Text style={styles.categorySectionBalance}>
                                            KES {category.total.toLocaleString()}
                                        </Text>
                                    </View>
                                    {category.accounts.map(account => renderAccountItem(account, category.color))}
                                </View>
                            );
                        })}
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <Header navigation={navigation} />

            {/* Banner */}
            <LinearGradient
                colors={['#4C7153', '#8CD18C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.banner}
            >
                <View style={styles.bannerContent}>
                    <Text style={styles.bannerTitle}>Chart of Accounts</Text>
                    <Text style={styles.bannerSubtitle}>
                        Complete account structure for farm operations
                    </Text>
                </View>
                <View style={styles.bannerIcon}>
                    <Icon name="file-tree" size={48} color="rgba(255,255,255,0.8)" />
                </View>
            </LinearGradient>

            {/* Navigation Tabs */}
            <View style={styles.tabsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScrollView}>
                    <View style={styles.tabsRow}>
                        {tabs.map(renderTab)}
                    </View>
                </ScrollView>
            </View>

            {/* Content */}
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {renderTabContent()}
                <View style={styles.bottomPadding} />
            </ScrollView>

            {/* Category Detail Modal */}
            <Modal
                visible={showDetailModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowDetailModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedCategory && (
                            <>
                                <View style={styles.modalHeader}>
                                    <View style={styles.modalHeaderLeft}>
                                        <Icon name={selectedCategory.icon} size={24} color={selectedCategory.color} />
                                        <Text style={styles.modalTitle}>{selectedCategory.title}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                                        <Icon name="close" size={24} color="#666" />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView style={styles.modalScrollView}>
                                    <View style={styles.modalSummary}>
                                        <Text style={styles.modalBalance}>
                                            KES {selectedCategory.total.toLocaleString()}
                                        </Text>
                                        <Text style={styles.modalAccountCount}>
                                            {selectedCategory.accounts.length} Accounts
                                        </Text>
                                    </View>

                                    {selectedCategory.accounts.map(account =>
                                        renderAccountItem(account, selectedCategory.color)
                                    )}
                                </ScrollView>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    // Header Styles
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: 44,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginLeft: 12,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerButton: {
        marginLeft: 16,
        padding: 8,
    },
    // Banner Styles
    banner: {
        margin: 16,
        padding: 20,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bannerContent: {
        flex: 1,
        paddingRight: 20,
    },
    bannerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
    },
    bannerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 20,
    },
    bannerIcon: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Tab Styles
    tabsContainer: {
        backgroundColor: '#fff',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    tabScrollView: {
        paddingHorizontal: 16,
    },
    tabsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        backgroundColor: '#f8f9fa',
        gap: 6,
    },
    activeTab: {
        backgroundColor: '#e8f4ea',
        borderWidth: 1,
        borderColor: '#4C7153',
    },
    tabText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#4C7153',
        fontWeight: '600',
    },
    // Content Styles
    scrollView: {
        flex: 1,
    },
    tabContent: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    sectionDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 24,
        lineHeight: 20,
    },
    // Category Card Styles
    categoriesGrid: {
        gap: 16,
    },
    categoryCard: {
        borderRadius: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    categoryGradient: {
        borderRadius: 16,
        padding: 20,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryStats: {
        alignItems: 'center',
    },
    accountCount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    accountLabel: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.8)',
    },
    categoryTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    categoryBalance: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 16,
    },
    categoryFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    viewDetails: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
    },
    // Summary Cards
    summaryCards: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    summaryCard: {
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
    },
    summaryNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4C7153',
        marginVertical: 4,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    // Chart Styles
    chartContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        marginBottom: 16,
    },
    // Insights
    insightsContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    insightsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    insightItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    insightText: {
        fontSize: 14,
        color: '#666',
        flex: 1,
        lineHeight: 20,
    },
    // Category Section (All Accounts tab)
    categorySection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    categorySectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        gap: 12,
    },
    categorySectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    categorySectionBalance: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    // Account Item Styles
    accountItem: {
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f8f9fa',
    },
    accountHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 12,
    },
    accountCodeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        minWidth: 50,
        alignItems: 'center',
    },
    accountCode: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#fff',
    },
    accountInfo: {
        flex: 1,
    },
    accountName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    accountType: {
        fontSize: 11,
        color: '#666',
    },
    accountBalance: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4C7153',
    },
    accountDescription: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
        marginBottom: 8,
    },
    // Sub-accounts
    subAccountsContainer: {
        marginTop: 8,
    },
    subAccountsLabel: {
        fontSize: 11,
        color: '#666',
        marginBottom: 6,
        fontWeight: '500',
    },
    subAccountsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    subAccountChip: {
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    subAccountText: {
        fontSize: 10,
        color: '#495057',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
        paddingTop: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    modalScrollView: {
        padding: 20,
    },
    modalSummary: {
        alignItems: 'center',
        marginBottom: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalBalance: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4C7153',
        marginBottom: 4,
    },
    modalAccountCount: {
        fontSize: 14,
        color: '#666',
    },
    bottomPadding: {
        height: 40,
    },
});

export default ChartOfAccountsScreen;