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

const InventoryAnalyticsScreen = () => {
    const navigation = useNavigation();
    const [selectedPeriod, setSelectedPeriod] = useState('This month');
    const [showPeriodModal, setShowPeriodModal] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);

    // Sample inventory data based on your structure
    const [inventoryData] = useState({
        machinery: [
            {
                id: 1,
                name: 'Jembes',
                quantity: 20,
                purchaseDate: '2025-05-17',
                serviceDate: '2025-06-17',
                purchasePrice: 1000,
                serviceCost: 50,
                supplier: 'AgriFeeds Co.',
                condition: 'Good',
                category: 'Hand Tools'
            },
            {
                id: 2,
                name: 'Wheelbarrow',
                quantity: 2,
                purchaseDate: '2025-05-10',
                serviceDate: '2025-05-10',
                purchasePrice: 150,
                serviceCost: 15,
                supplier: 'Ken Kitulu',
                condition: 'Excellent',
                category: 'Transport Equipment'
            }
        ],
        goodsInStock: [
            {
                id: 1,
                name: 'Pesticides',
                quantity: 4,
                unit: 'liters',
                stockingDate: '2025-05-10',
                expirationDate: '2026-05-10',
                purchasePrice: 130,
                costPerUnit: 32.5,
                category: 'Chemicals',
                status: 'In Stock'
            },
            {
                id: 2,
                name: 'Detergents',
                quantity: 1,
                unit: 'units',
                stockingDate: '2025-05-10',
                expirationDate: '2026-12-31',
                purchasePrice: 15,
                costPerUnit: 15,
                category: 'Cleaning',
                status: 'Low Stock'
            },
            {
                id: 3,
                name: 'Sanitizers',
                quantity: 20,
                unit: 'units',
                stockingDate: '2025-05-10',
                expirationDate: '2026-08-15',
                purchasePrice: 200,
                costPerUnit: 10,
                category: 'Health & Safety',
                status: 'In Stock'
            }
        ],
        utilityWater: [
            {
                id: 1,
                name: 'Borehole',
                quantity: 1,
                waterSource: 'Underground',
                waterLevel: 85,
                storageCapacity: 50000,
                constructionCost: 2000000,
                constructionDate: '2025-05-10',
                status: 'Active'
            },
            {
                id: 2,
                name: 'Water Tank',
                quantity: 2,
                waterSource: 'Storage',
                waterLevel: 75,
                storageCapacity: 5000,
                constructionCost: 35000,
                constructionDate: '2025-05-10',
                status: 'Active'
            }
        ],
        utilityPower: [
            {
                id: 1,
                name: 'Generator',
                quantity: 1,
                powerSource: 'Diesel',
                installationCost: 45000,
                consumptionCost: 5000,
                installationDate: '2025-05-10',
                capacity: '10KVA',
                status: 'Active'
            },
            {
                id: 2,
                name: 'Electricity',
                quantity: 200,
                unit: 'units',
                powerSource: 'Grid',
                installationCost: 0,
                consumptionCost: 5000,
                capacity: 'Unlimited',
                status: 'Active'
            }
        ],
        utilityFacility: [
            {
                id: 1,
                name: 'Barn',
                quantity: 1,
                typeOfStructure: 'Livestock Housing',
                constructionDate: '2025-05-17',
                maintenanceDate: '2025-06-17',
                constructionCost: 500000,
                maintenanceCost: 5000,
                condition: 'Good',
                size: '500 sq ft'
            },
            {
                id: 2,
                name: 'Storage Units',
                quantity: 3,
                typeOfStructure: 'Storage',
                constructionDate: '2025-05-10',
                maintenanceDate: '2025-07-10',
                constructionCost: 173000,
                maintenanceCost: 8000,
                condition: 'Excellent',
                size: '200 sq ft each'
            },
            {
                id: 3,
                name: 'Fence',
                quantity: 1,
                typeOfStructure: 'Security/Boundary',
                constructionDate: '2025-05-10',
                maintenanceDate: '2025-08-10',
                constructionCost: 100000,
                maintenanceCost: 2000,
                condition: 'Good',
                size: '500 meters'
            }
        ]
    });

    const timePeriods = ['This week', 'This month', 'This quarter', 'This year'];

    // Calculate totals and metrics
    const totalMachineryValue = inventoryData.machinery.reduce((sum, item) => sum + item.purchasePrice, 0);
    const totalGoodsValue = inventoryData.goodsInStock.reduce((sum, item) => sum + item.purchasePrice, 0);
    const totalWaterValue = inventoryData.utilityWater.reduce((sum, item) => sum + item.constructionCost, 0);
    const totalPowerValue = inventoryData.utilityPower.reduce((sum, item) => sum + item.installationCost, 0);
    const totalFacilityValue = inventoryData.utilityFacility.reduce((sum, item) => sum + item.constructionCost, 0);

    const totalInventoryValue = totalMachineryValue + totalGoodsValue + totalWaterValue + totalPowerValue + totalFacilityValue;
    const totalMaintenanceCost = inventoryData.machinery.reduce((sum, item) => sum + item.serviceCost, 0) +
        inventoryData.utilityFacility.reduce((sum, item) => sum + item.maintenanceCost, 0);

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

    // Inventory distribution for pie chart
    const inventoryDistributionData = [
        {
            name: 'Machinery',
            population: totalMachineryValue,
            color: '#4C7153',
            legendFontColor: '#333',
            legendFontSize: 12,
        },
        {
            name: 'Goods',
            population: totalGoodsValue,
            color: '#8CD18C',
            legendFontColor: '#333',
            legendFontSize: 12,
        },
        {
            name: 'Water',
            population: totalWaterValue,
            color: '#A7E3A7',
            legendFontColor: '#333',
            legendFontSize: 12,
        },
        {
            name: 'Power',
            population: totalPowerValue,
            color: '#CBD18F',
            legendFontColor: '#333',
            legendFontSize: 12,
        },
        {
            name: 'Facilities',
            population: totalFacilityValue,
            color: '#91D79E',
            legendFontColor: '#333',
            legendFontSize: 12,
        }
    ].filter(item => item.population > 0);

    // Category count data for bar chart
    const categoryCountData = {
        labels: ['Machinery', 'Goods', 'Water', 'Power', 'Facilities'],
        datasets: [{
            data: [
                inventoryData.machinery.length,
                inventoryData.goodsInStock.length,
                inventoryData.utilityWater.length,
                inventoryData.utilityPower.length,
                inventoryData.utilityFacility.length
            ]
        }]
    };

    // Monthly trend data (sample)
    const monthlyTrendData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            data: [2150000, 2200000, 2180000, 2250000, Math.round(totalInventoryValue / 1000), Math.round(totalInventoryValue / 1000) + 50],
            color: (opacity = 1) => `rgba(76, 113, 83, ${opacity})`,
            strokeWidth: 3
        }]
    };

    const kpiCards = [
        {
            title: 'Total Inventory Value',
            value: `KES ${totalInventoryValue.toLocaleString()}`,
            change: '+2.5%',
            changeType: 'positive',
            icon: 'warehouse',
            colors: ['#8CD18C', '#4C7153'],
        },
        {
            title: 'Total Items',
            value: Object.values(inventoryData).flat().length.toString(),
            change: '+3',
            changeType: 'positive',
            icon: 'package-variant',
            colors: ['#A7E3A7', '#4C7153'],
        },
        {
            title: 'Maintenance Cost',
            value: `KES ${totalMaintenanceCost.toLocaleString()}`,
            change: '-5.2%',
            changeType: 'negative',
            icon: 'tools',
            colors: ['#CBD18F', '#4C7153'],
        },
        {
            title: 'Asset Categories',
            value: '5',
            change: '0',
            changeType: 'neutral',
            icon: 'view-grid',
            colors: ['#91D79E', '#4C7153'],
        },
    ];

    const analysisTabs = [
        { id: 'overview', label: 'Overview', icon: 'view-dashboard' },
        { id: 'machinery', label: 'Machinery', icon: 'cog' },
        { id: 'goods', label: 'Goods', icon: 'package-variant' },
        { id: 'utilities', label: 'Utilities', icon: 'power-plug' },
        { id: 'facilities', label: 'Facilities', icon: 'home-variant' },
    ];

    const renderKPICard = ({ title, value, change, changeType, icon, colors }) => (
        <LinearGradient colors={colors} style={styles.kpiCard} key={title}>
            <View style={styles.kpiHeader}>
                <Icon name={icon} size={24} color="#fff" />
                <View style={[
                    styles.changeContainer,
                    {
                        backgroundColor: changeType === 'positive' ? 'rgba(255,255,255,0.2)' :
                            changeType === 'negative' ? 'rgba(255,0,0,0.2)' :
                                'rgba(128,128,128,0.2)'
                    }
                ]}>
                    <Icon
                        name={changeType === 'positive' ? 'arrow-up' :
                            changeType === 'negative' ? 'arrow-down' : 'minus'}
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

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.chartContainer}>
                            <Text style={styles.chartTitle}>Inventory Value Distribution</Text>
                            {inventoryDistributionData.length > 0 && (
                                <PieChart
                                    data={inventoryDistributionData}
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
                        <View style={styles.insightContainer}>
                            <Text style={styles.insightTitle}>Inventory Overview:</Text>
                            <Text style={styles.insightText}>• Total inventory value: KES {totalInventoryValue.toLocaleString()}</Text>
                            <Text style={styles.insightText}>• {Object.values(inventoryData).flat().length} items across 5 categories</Text>
                            <Text style={styles.insightText}>• Monthly maintenance cost: KES {totalMaintenanceCost.toLocaleString()}</Text>
                            <Text style={styles.insightText}>• Water infrastructure represents {((totalWaterValue / totalInventoryValue) * 100).toFixed(1)}% of total value</Text>
                        </View>
                    </View>
                );

            case 'machinery':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.categoryStats}>
                            <Text style={styles.sectionTitle}>Machinery & Equipment</Text>
                            <View style={styles.statsGrid}>
                                <View style={styles.statCard}>
                                    <Text style={styles.statValue}>{inventoryData.machinery.length}</Text>
                                    <Text style={styles.statLabel}>Total Items</Text>
                                </View>
                                <View style={styles.statCard}>
                                    <Text style={styles.statValue}>KES {totalMachineryValue.toLocaleString()}</Text>
                                    <Text style={styles.statLabel}>Total Value</Text>
                                </View>
                                <View style={styles.statCard}>
                                    <Text style={styles.statValue}>KES {inventoryData.machinery.reduce((sum, item) => sum + item.serviceCost, 0).toLocaleString()}</Text>
                                    <Text style={styles.statLabel}>Service Cost</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.itemsList}>
                            {inventoryData.machinery.map(item => (
                                <View key={item.id} style={styles.itemCard}>
                                    <View style={styles.itemHeader}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        <View style={[styles.conditionBadge, { backgroundColor: item.condition === 'Excellent' ? '#4CAF50' : '#FF9800' }]}>
                                            <Text style={styles.conditionText}>{item.condition}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.itemDetails}>
                                        <Text style={styles.itemDetailText}>Quantity: {item.quantity}</Text>
                                        <Text style={styles.itemDetailText}>Value: KES {item.purchasePrice.toLocaleString()}</Text>
                                        <Text style={styles.itemDetailText}>Category: {item.category}</Text>
                                        <Text style={styles.itemDetailText}>Supplier: {item.supplier}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                );

            case 'goods':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.categoryStats}>
                            <Text style={styles.sectionTitle}>Goods in Stock</Text>
                            <View style={styles.statsGrid}>
                                <View style={styles.statCard}>
                                    <Text style={styles.statValue}>{inventoryData.goodsInStock.length}</Text>
                                    <Text style={styles.statLabel}>Stock Items</Text>
                                </View>
                                <View style={styles.statCard}>
                                    <Text style={styles.statValue}>KES {totalGoodsValue.toLocaleString()}</Text>
                                    <Text style={styles.statLabel}>Total Value</Text>
                                </View>
                                <View style={styles.statCard}>
                                    <Text style={styles.statValue}>{inventoryData.goodsInStock.filter(item => item.status === 'Low Stock').length}</Text>
                                    <Text style={styles.statLabel}>Low Stock</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.itemsList}>
                            {inventoryData.goodsInStock.map(item => (
                                <View key={item.id} style={styles.itemCard}>
                                    <View style={styles.itemHeader}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        <View style={[styles.statusBadge, { backgroundColor: item.status === 'In Stock' ? '#4CAF50' : '#FF5722' }]}>
                                            <Text style={styles.statusText}>{item.status}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.itemDetails}>
                                        <Text style={styles.itemDetailText}>Quantity: {item.quantity} {item.unit}</Text>
                                        <Text style={styles.itemDetailText}>Unit Cost: KES {item.costPerUnit.toFixed(2)}</Text>
                                        <Text style={styles.itemDetailText}>Category: {item.category}</Text>
                                        <Text style={styles.itemDetailText}>Expires: {new Date(item.expirationDate).toLocaleDateString()}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                );

            case 'utilities':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.utilitySection}>
                            <Text style={styles.sectionTitle}>Water Infrastructure</Text>
                            <View style={styles.utilityGrid}>
                                {inventoryData.utilityWater.map(item => (
                                    <View key={item.id} style={styles.utilityCard}>
                                        <View style={styles.utilityHeader}>
                                            <Icon name="water" size={24} color="#2196F3" />
                                            <Text style={styles.utilityName}>{item.name}</Text>
                                        </View>
                                        <Text style={styles.utilityDetail}>Capacity: {item.storageCapacity.toLocaleString()}L</Text>
                                        <Text style={styles.utilityDetail}>Level: {item.waterLevel}%</Text>
                                        <Text style={styles.utilityDetail}>Value: KES {item.constructionCost.toLocaleString()}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View style={styles.utilitySection}>
                            <Text style={styles.sectionTitle}>Power Infrastructure</Text>
                            <View style={styles.utilityGrid}>
                                {inventoryData.utilityPower.map(item => (
                                    <View key={item.id} style={styles.utilityCard}>
                                        <View style={styles.utilityHeader}>
                                            <Icon name="flash" size={24} color="#FF9800" />
                                            <Text style={styles.utilityName}>{item.name}</Text>
                                        </View>
                                        <Text style={styles.utilityDetail}>Source: {item.powerSource}</Text>
                                        <Text style={styles.utilityDetail}>Capacity: {item.capacity}</Text>
                                        <Text style={styles.utilityDetail}>Monthly Cost: KES {item.consumptionCost.toLocaleString()}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                );

            case 'facilities':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.categoryStats}>
                            <Text style={styles.sectionTitle}>Farm Facilities</Text>
                            <View style={styles.statsGrid}>
                                <View style={styles.statCard}>
                                    <Text style={styles.statValue}>{inventoryData.utilityFacility.length}</Text>
                                    <Text style={styles.statLabel}>Structures</Text>
                                </View>
                                <View style={styles.statCard}>
                                    <Text style={styles.statValue}>KES {totalFacilityValue.toLocaleString()}</Text>
                                    <Text style={styles.statLabel}>Total Value</Text>
                                </View>
                                <View style={styles.statCard}>
                                    <Text style={styles.statValue}>KES {inventoryData.utilityFacility.reduce((sum, item) => sum + item.maintenanceCost, 0).toLocaleString()}</Text>
                                    <Text style={styles.statLabel}>Maintenance</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.itemsList}>
                            {inventoryData.utilityFacility.map(item => (
                                <View key={item.id} style={styles.itemCard}>
                                    <View style={styles.itemHeader}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        <View style={[styles.conditionBadge, { backgroundColor: item.condition === 'Excellent' ? '#4CAF50' : '#FF9800' }]}>
                                            <Text style={styles.conditionText}>{item.condition}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.itemDetails}>
                                        <Text style={styles.itemDetailText}>Type: {item.typeOfStructure}</Text>
                                        <Text style={styles.itemDetailText}>Size: {item.size}</Text>
                                        <Text style={styles.itemDetailText}>Value: KES {item.constructionCost.toLocaleString()}</Text>
                                        <Text style={styles.itemDetailText}>Built: {new Date(item.constructionDate).toLocaleDateString()}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                );

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
                        <Text style={styles.welcomeTitle}>Inventory Analytics</Text>
                        <Text style={styles.welcomeSubtitle}>
                            Monitor assets, track utilization and{"\n"}optimize inventory management
                        </Text>
                    </View>
                    <View style={styles.welcomeIconContainer}>
                        <Icon name="warehouse" size={60} color="rgba(255,255,255,0.8)" />
                    </View>
                </LinearGradient>

                <View style={styles.overviewSection}>
                    <Text style={styles.overviewTitle}>Asset Overview</Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.monthSelector} onPress={() => setShowPeriodModal(true)}>
                            <Text style={styles.monthText}>{selectedPeriod}</Text>
                            <Icon name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.manageButton}
                            onPress={() => navigation.navigate('AssetsJournalScreen')}
                        >
                            <Icon name="book-open-variant" size={20} color="#fff" />
                            <Text style={styles.manageButtonText}>Assets Journal</Text>
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
                            onPress={() => navigation.navigate('AssetsJournalScreen')}
                        >
                            <Icon name="book-open-variant" size={24} color="#4C7153" />
                            <Text style={styles.quickActionText}>View Assets Journal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickActionButton}>
                            <Icon name="file-excel" size={24} color="#4C7153" />
                            <Text style={styles.quickActionText}>Export Inventory</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickActionButton}>
                            <Icon name="chart-box-outline" size={24} color="#4C7153" />
                            <Text style={styles.quickActionText}>Generate Report</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickActionButton}>
                            <Icon name="plus-circle" size={24} color="#4C7153" />
                            <Text style={styles.quickActionText}>Add New Asset</Text>
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
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        gap: 8,
    },
    monthText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    manageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4C7153',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        gap: 8,
    },
    manageButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    kpiGrid: {
        paddingHorizontal: 16,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    kpiCard: {
        flex: 1,
        minWidth: (screenWidth - 44) / 2,
        padding: 16,
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    kpiHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    changeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    changeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    kpiTitle: {
        fontSize: 12,
        color: '#fff',
        opacity: 0.9,
        marginBottom: 4,
    },
    kpiValue: {
        fontSize: 18,
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
        marginBottom: 20,
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
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        gap: 8,
    },
    activeAnalysisTab: {
        backgroundColor: '#E8F5E8',
        borderWidth: 1,
        borderColor: '#4C7153',
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
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    tabContent: {
        flex: 1,
    },
    chartContainer: {
        marginBottom: 24,
        alignItems: 'center',
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    insightContainer: {
        padding: 16,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#4C7153',
    },
    insightTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    insightText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 4,
    },
    categoryStats: {
        marginBottom: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4C7153',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    itemsList: {
        gap: 12,
    },
    itemCard: {
        backgroundColor: '#FAFBFC',
        padding: 16,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E8EB',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    conditionBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    conditionText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    itemDetails: {
        gap: 4,
    },
    itemDetailText: {
        fontSize: 14,
        color: '#666',
    },
    utilitySection: {
        marginBottom: 24,
    },
    utilityGrid: {
        gap: 12,
    },
    utilityCard: {
        backgroundColor: '#FAFBFC',
        padding: 16,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E8EB',
    },
    utilityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    utilityName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    utilityDetail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    quickActionsSection: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    quickActionButton: {
        flex: 1,
        minWidth: (screenWidth - 44) / 2,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        gap: 8,
    },
    quickActionText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4C7153',
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    periodModalContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        width: '100%',
        maxWidth: 300,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
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
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    selectedPeriodOption: {
        backgroundColor: '#E8F5E8',
    },
    periodOptionText: {
        fontSize: 16,
        color: '#333',
    },
    selectedPeriodOptionText: {
        fontWeight: '600',
        color: '#4C7153',
    },
});

export default InventoryAnalyticsScreen;