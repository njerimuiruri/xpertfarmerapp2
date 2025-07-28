import React, { useState, useEffect, useCallback } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Dimensions,
    Modal,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { icons } from '../../constants';
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';
import { getLivestockForActiveFarm } from '../../services/livestock';
import { getVaccinationsForActiveFarm } from '../../services/healthservice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const BusinessAnalyticsScreen = ({ navigation }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('This month');
    const [showPeriodModal, setShowPeriodModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFarm, setActiveFarm] = useState(null);

    // Updated Analytics Data based on Financial Records
    const [analyticsData, setAnalyticsData] = useState({
        livestock: {
            totalAnimals: 51, // 50 cows + 1 calf
            cattle: 51,
            poultry: 0,
            goats: 0,
            sheep: 0,
            swine: 0,
            rabbits: 0,
            growthRate: 2.0, // 1 new calf from 50 base animals
            totalValue: 35000, // Current livestock value
            biologicalGains: 10000, // Value of newborn calf
        },
        health: {
            totalVaccinations: 50, // Based on vaccination records
            totalDewormings: 50, // Based on deworming records
            totalTreatments: 50, // Based on treatment records
            healthScore: 92, // High due to comprehensive health program
            upcomingVaccinations: 0,
            healthTrend: 'positive',
            totalHealthCost: 1175, // Sum of all health expenses
            vaccinationCost: 215,
            dewormingCost: 215,
            treatmentCost: 215,
            allergiesCost: 50,
            geneticsCost: 50,
            boostersCost: 380,
            breedingServicesCost: 255,
        },
        production: {
            milkProduction: 700, // Total milk produced (500L + 200L)
            milkSold: 700, // All milk was sold
            beefProduction: 800, // Total beef produced (500kg + 300kg)
            beefSold: 800, // All beef was sold
            milkRevenue: 1090, // Actual milk sales revenue
            beefRevenue: 3500, // Actual beef sales revenue
            totalProductionRevenue: 4590, // Combined milk + beef revenue
            efficiency: 95, // High efficiency as all production was sold
            trend: 'increasing',
        },
        financial: {
            totalRevenue: 14590, // Including biological gains
            productionRevenue: 4590, // Milk + Beef sales
            biologicalGains: 10000, // Newborn calf value
            directExpenses: 4460, // Total COGS/Direct expenses
            operatingExpenses: 0, // No operating expenses recorded
            grossProfit: 10130, // Revenue - Direct expenses
            netProfit: 10130, // Same as gross profit (no operating expenses)
            profitMargin: 69.4, // (10130/14590) * 100

            // Expense breakdown
            feedsCost: 840,
            healthCosts: 1175, // Sum of all health-related expenses
            salariesWages: 2240, // Updated to match trial balance
            breedingCosts: 255,
        },
        feed: {
            totalPurchased: 400, // 300kg + 100kg
            totalCost: 840, // Actual feed costs
            costPerKg: 2.1, // 840/400
            efficiency: 100, // Assuming all feed was used
            wastage: 0, // No wastage recorded
            averageCostPerAnimal: 16.5, // 840/51 animals
        },
        employees: {
            totalEmployees: 2, // John Doe + Jane Smith
            fullTimeEmployees: 1, // John Doe
            partTimeEmployees: 1, // Jane Smith
            totalWages: 1120, // May payroll amount
            yearToDateWages: 2240, // Trial balance amount
            averageWagePerEmployee: 560, // 1120/2
        },
        assets: {
            // Current Assets
            currentAssets: {
                boosterStock: 300,
                cashPosition: -2240690, // Negative due to major investments
                totalCurrentAssets: -2240390,
            },

            // Non-Current Assets
            nonCurrentAssets: {
                livestock: 35000,
                waterInfrastructure: 2070000, // Tanks + Borehole
                powerEquipment: 45000, // Generator
                facilities: 99500, // Storage + Fencing + Barn
                machinery: 1015, // Jembes + Wheelbarrow
                totalNonCurrentAssets: 2250515,
            },

            totalAssets: 10125, // As per balance sheet
        },
        inventory: {
            feedStock: 840, // Current feed inventory value
            boosterStock: 300, // Boosters and additives
            totalInventoryValue: 1140,

            // Asset breakdown
            waterAssets: 2070000,
            powerAssets: 45000,
            facilityAssets: 99500,
            machineryAssets: 1015,
        },
        cashFlow: {
            operatingCashInflow: 4590,
            operatingCashOutflow: 4465,
            netOperatingCash: 125,
            investingCashOutflow: 2240815,
            netCashMovement: -2240690,
        },
        performance: {
            revenuePerAnimal: 286.1, // 14590/51
            profitPerAnimal: 198.6, // 10130/51
            feedCostPerAnimal: 16.5, // 840/51
            healthCostPerAnimal: 23.0, // 1175/51
            productivityScore: 88, // Based on efficiency metrics
        }
    });

    const timePeriods = ['This week', 'This month', 'This quarter', 'This year'];

    useEffect(() => {
        loadAnalyticsData();
    }, [selectedPeriod]);

    const loadAnalyticsData = async () => {
        try {
            setIsLoading(true);
            await Promise.all([
                loadLivestockAnalytics(),
                loadHealthAnalytics(),
                loadActiveFarm(),
            ]);
        } catch (error) {
            console.error('Error loading analytics data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadLivestockAnalytics = async () => {
        try {
            const { data: livestock, error } = await getLivestockForActiveFarm();

            if (error || !livestock) {
                // Use default data from financial records if API fails
                return;
            }

            const stats = {
                totalAnimals: 0,
                poultry: 0,
                cattle: 0,
                goats: 0,
                sheep: 0,
                swine: 0,
                rabbits: 0,
            };

            livestock.forEach(animal => {
                if (!animal || !animal.type) return;

                const animalType = animal.type.toLowerCase();

                if (animalType === 'poultry') {
                    const quantity = animal.poultry?.initialQuantity || 1;
                    stats.poultry += quantity;
                    stats.totalAnimals += quantity;
                } else {
                    stats.totalAnimals += 1;

                    switch (animalType) {
                        case 'cattle':
                            stats.cattle += 1;
                            break;
                        case 'goats':
                            stats.goats += 1;
                            break;
                        case 'sheep':
                            stats.sheep += 1;
                            break;
                        case 'swine':
                            stats.swine += 1;
                            break;
                        case 'rabbit':
                            stats.rabbits += 1;
                            break;
                    }
                }
            });

            // Update with real data if available, otherwise keep financial record data
            if (stats.totalAnimals > 0) {
                setAnalyticsData(prev => ({
                    ...prev,
                    livestock: {
                        ...prev.livestock,
                        ...stats,
                        growthRate: calculateGrowthRate(stats.totalAnimals),
                    },
                }));
            }
        } catch (error) {
            console.error('Error loading livestock analytics:', error);
        }
    };

    const loadHealthAnalytics = async () => {
        try {
            const result = await getVaccinationsForActiveFarm();

            if (result.error || !result.data) {
                // Use default health data from financial records
                return;
            }

            const vaccinations = result.data;

            setAnalyticsData(prev => ({
                ...prev,
                health: {
                    ...prev.health,
                    totalVaccinations: vaccinations.length || prev.health.totalVaccinations,
                    healthScore: calculateHealthScore(vaccinations),
                },
            }));
        } catch (error) {
            console.error('Error loading health analytics:', error);
        }
    };

    const loadActiveFarm = async () => {
        try {
            const storedFarm = await AsyncStorage.getItem('activeFarm');
            if (storedFarm) {
                setActiveFarm(JSON.parse(storedFarm));
            }
        } catch (error) {
            console.error('Error loading active farm:', error);
        }
    };

    const calculateGrowthRate = (totalAnimals) => {
        // Based on real data: had 50 cows, now have 51 (1 calf born)
        const baseAnimals = 50;
        return totalAnimals > baseAnimals ? ((totalAnimals - baseAnimals) / baseAnimals) * 100 : 0;
    };

    const calculateHealthScore = (vaccinations) => {
        // High health score due to comprehensive vaccination, deworming, and treatment program
        if (vaccinations.length === 0) return analyticsData.health.healthScore;

        const recentVaccinations = vaccinations.filter(v => {
            const vaccinationDate = new Date(v.dateAdministered);
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            return vaccinationDate >= sixMonthsAgo;
        });

        return Math.min(85 + (recentVaccinations.length * 2), 100);
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadAnalyticsData();
        setRefreshing(false);
    }, []);

    const formatCurrency = (amount) => {
        return `KES ${amount.toLocaleString()}`;
    };

    const formatPercentage = (value) => {
        return `${value.toFixed(1)}%`;
    };

    const formatWeight = (weight) => {
        return `${weight.toLocaleString()}kg`;
    };

    const formatVolume = (volume) => {
        return `${volume.toLocaleString()}L`;
    };

    const renderKPICard = ({ title, value, subtitle, icon, backgroundColor, trend }) => (
        <View style={[styles.kpiCard, { backgroundColor }]} key={title}>
            <View style={styles.kpiHeader}>
                <View style={styles.kpiIconContainer}>
                    <FastImage
                        source={icon}
                        style={styles.kpiIcon}
                        tintColor={COLORS.white}
                    />
                </View>
                {trend && (
                    <View style={[styles.trendIndicator,
                    trend === 'positive' ? styles.trendPositive : styles.trendNegative]}>
                        <FastImage
                            source={trend === 'positive' ? icons.arrowUp : icons.arrowDown}
                            style={styles.trendIcon}
                            tintColor={trend === 'positive' ? COLORS.green : COLORS.red}
                        />
                    </View>
                )}
            </View>

            <Text style={styles.kpiValue}>{value}</Text>
            <Text style={styles.kpiTitle}>{title}</Text>
            <Text style={styles.kpiSubtitle}>{subtitle}</Text>
        </View>
    );

    const renderCategoryBreakdown = () => (
        <View style={[styles.chartCard, { backgroundColor: COLORS.white }]}>
            <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Livestock Distribution</Text>
                <TouchableOpacity style={styles.chartMenuButton}>
                    <FastImage source={icons.menu} style={styles.chartMenuIcon} tintColor={COLORS.gray} />
                </TouchableOpacity>
            </View>

            <View style={styles.distributionContainer}>
                {[
                    { type: 'Cattle', count: analyticsData.livestock.cattle, color: COLORS.green, icon: icons.cow },
                    { type: 'Poultry', count: analyticsData.livestock.poultry, color: COLORS.blue, icon: icons.bird },
                    { type: 'Goats', count: analyticsData.livestock.goats, color: COLORS.orange, icon: icons.goat },
                    { type: 'Sheep', count: analyticsData.livestock.sheep, color: COLORS.purple, icon: icons.sheep },
                ].filter(item => item.count > 0).map((item, index) => (
                    <View key={item.type} style={styles.distributionItem}>
                        <View style={styles.distributionLeft}>
                            <View style={[styles.distributionDot, { backgroundColor: item.color }]} />
                            <FastImage
                                source={item.icon || icons.livestock}
                                style={styles.distributionIcon}
                                tintColor={item.color}
                            />
                            <Text style={styles.distributionType}>{item.type}</Text>
                        </View>
                        <View style={styles.distributionRight}>
                            <Text style={styles.distributionCount}>{item.count}</Text>
                            <Text style={styles.distributionPercentage}>
                                {((item.count / analyticsData.livestock.totalAnimals) * 100).toFixed(1)}%
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );

    const renderProductionBreakdown = () => (
        <View style={[styles.chartCard, { backgroundColor: COLORS.white }]}>
            <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Production Overview</Text>
            </View>

            <View style={styles.distributionContainer}>
                <View style={styles.distributionItem}>
                    <View style={styles.distributionLeft}>
                        <View style={[styles.distributionDot, { backgroundColor: COLORS.blue }]} />
                        <Text style={styles.distributionType}>Milk Production</Text>
                    </View>
                    <View style={styles.distributionRight}>
                        <Text style={styles.distributionCount}>{formatVolume(analyticsData.production.milkProduction)}</Text>
                        <Text style={styles.distributionPercentage}>{formatCurrency(analyticsData.production.milkRevenue)}</Text>
                    </View>
                </View>

                <View style={styles.distributionItem}>
                    <View style={styles.distributionLeft}>
                        <View style={[styles.distributionDot, { backgroundColor: COLORS.red }]} />
                        <Text style={styles.distributionType}>Beef Production</Text>
                    </View>
                    <View style={styles.distributionRight}>
                        <Text style={styles.distributionCount}>{formatWeight(analyticsData.production.beefProduction)}</Text>
                        <Text style={styles.distributionPercentage}>{formatCurrency(analyticsData.production.beefRevenue)}</Text>
                    </View>
                </View>

                <View style={styles.distributionItem}>
                    <View style={styles.distributionLeft}>
                        <View style={[styles.distributionDot, { backgroundColor: COLORS.green }]} />
                        <Text style={styles.distributionType}>Biological Gains</Text>
                    </View>
                    <View style={styles.distributionRight}>
                        <Text style={styles.distributionCount}>1 Calf</Text>
                        <Text style={styles.distributionPercentage}>{formatCurrency(analyticsData.livestock.biologicalGains)}</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderQuickActions = () => (
        <View style={[styles.actionsCard, { backgroundColor: COLORS.white }]}>
            <Text style={styles.actionsTitle}>Quick Actions</Text>

            <View style={styles.actionsGrid}>
                {[
                    { title: 'Add Livestock', icon: icons.plus, screen: 'AddLivestockScreen', color: COLORS.green },
                    { title: 'Health Record', icon: icons.medical, screen: 'AddHealthRecords', color: COLORS.blue },
                    { title: 'Feed Record', icon: icons.feed, screen: 'FarmFeedsScreen', color: COLORS.orange },
                    { title: 'Production', icon: icons.chart, screen: 'ProductionModuleLandingScreen', color: COLORS.purple },
                ].map((action) => (
                    <TouchableOpacity
                        key={action.title}
                        style={[styles.actionButton, { backgroundColor: COLORS.lightGray2 }]}
                        onPress={() => navigation.navigate(action.screen)}
                        activeOpacity={0.8}>
                        <View style={[styles.actionIconContainer, { backgroundColor: action.color }]}>
                            <FastImage
                                source={action.icon}
                                style={styles.actionIcon}
                                tintColor={COLORS.white}
                            />
                        </View>
                        <Text style={styles.actionTitle}>{action.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderExpenseBreakdown = () => (
        <View style={[styles.chartCard, { backgroundColor: COLORS.white }]}>
            <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Direct Expense Breakdown</Text>
            </View>

            <View style={styles.distributionContainer}>
                {[
                    { type: 'Salaries & Wages', amount: analyticsData.financial.salariesWages, color: COLORS.purple },
                    { type: 'Health Services', amount: analyticsData.financial.healthCosts, color: COLORS.blue },
                    { type: 'Animal Feeds', amount: analyticsData.financial.feedsCost, color: COLORS.green },
                    { type: 'Breeding Services', amount: analyticsData.financial.breedingCosts, color: COLORS.orange },
                ].map((expense) => (
                    <View key={expense.type} style={styles.distributionItem}>
                        <View style={styles.distributionLeft}>
                            <View style={[styles.distributionDot, { backgroundColor: expense.color }]} />
                            <Text style={styles.distributionType}>{expense.type}</Text>
                        </View>
                        <View style={styles.distributionRight}>
                            <Text style={styles.distributionCount}>{formatCurrency(expense.amount)}</Text>
                            <Text style={styles.distributionPercentage}>
                                {((expense.amount / analyticsData.financial.directExpenses) * 100).toFixed(1)}%
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );

    const renderHealthBreakdown = () => (
        <View style={[styles.chartCard, { backgroundColor: COLORS.white }]}>
            <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Health Services Breakdown</Text>
            </View>

            <View style={styles.distributionContainer}>
                {[
                    { type: 'Boosters & Additives', amount: analyticsData.health.boostersCost, color: COLORS.purple, count: '50 doses' },
                    { type: 'Vaccination', amount: analyticsData.health.vaccinationCost, color: COLORS.green, count: '50 animals' },
                    { type: 'Deworming', amount: analyticsData.health.dewormingCost, color: COLORS.blue, count: '50 animals' },
                    { type: 'Treatment', amount: analyticsData.health.treatmentCost, color: COLORS.red, count: '50 animals' },
                    { type: 'Breeding Services', amount: analyticsData.health.breedingServicesCost, color: COLORS.orange, count: '3 services' },
                    { type: 'Genetics', amount: analyticsData.health.geneticsCost, color: COLORS.secondary, count: '1 service' },
                    { type: 'Allergies', amount: analyticsData.health.allergiesCost, color: COLORS.yellow, count: '1 service' },
                ].map((item) => (
                    <View key={item.type} style={styles.distributionItem}>
                        <View style={styles.distributionLeft}>
                            <View style={[styles.distributionDot, { backgroundColor: item.color }]} />
                            <Text style={styles.distributionType}>{item.type}</Text>
                        </View>
                        <View style={styles.distributionRight}>
                            <Text style={styles.distributionCount}>{formatCurrency(item.amount)}</Text>
                            <Text style={styles.distributionPercentage}>{item.count}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );

    const renderAssetBreakdown = () => (
        <View style={[styles.chartCard, { backgroundColor: COLORS.white }]}>
            <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Asset Distribution</Text>
            </View>

            <View style={styles.distributionContainer}>
                {[
                    { type: 'Water Infrastructure', amount: analyticsData.inventory.waterAssets, color: COLORS.secondary },
                    { type: 'Power Equipment', amount: analyticsData.inventory.powerAssets, color: COLORS.orange },
                    { type: 'Facilities', amount: analyticsData.inventory.facilityAssets, color: COLORS.purple },
                    { type: 'Livestock', amount: analyticsData.livestock.totalValue, color: COLORS.green },
                    { type: 'Machinery', amount: analyticsData.inventory.machineryAssets, color: COLORS.red },
                    { type: 'Inventory Stock', amount: analyticsData.inventory.totalInventoryValue, color: COLORS.yellow },
                ].map((asset) => (
                    <View key={asset.type} style={styles.distributionItem}>
                        <View style={styles.distributionLeft}>
                            <View style={[styles.distributionDot, { backgroundColor: asset.color }]} />
                            <Text style={styles.distributionType}>{asset.type}</Text>
                        </View>
                        <View style={styles.distributionRight}>
                            <Text style={styles.distributionCount}>{formatCurrency(asset.amount)}</Text>
                            <Text style={styles.distributionPercentage}>
                                {((asset.amount / analyticsData.assets.nonCurrentAssets.totalNonCurrentAssets) * 100).toFixed(1)}%
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );

    const renderPeriodModal = () => (
        <Modal
            visible={showPeriodModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowPeriodModal(false)}>
            <View style={styles.modalOverlay}>
                <View style={[styles.periodModal, { backgroundColor: COLORS.white }]}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Time Period</Text>
                        <TouchableOpacity
                            onPress={() => setShowPeriodModal(false)}
                            style={styles.closeButton}>
                            <FastImage source={icons.close} style={styles.closeIcon} tintColor={COLORS.gray} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.periodOptions}>
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
                                }}>
                                <Text style={[
                                    styles.periodOptionText,
                                    selectedPeriod === period && styles.selectedPeriodOptionText
                                ]}>
                                    {period}
                                </Text>
                                {selectedPeriod === period && (
                                    <FastImage source={icons.check} style={styles.checkIcon} tintColor={COLORS.green} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <SecondaryHeader
                    title="Business Analytics"
                    onBackPress={() => navigation.goBack()}
                    showNotification={true}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading analytics data...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <SecondaryHeader
                title="Business Analytics"
                onBackPress={() => navigation.goBack()}
                showNotification={true}
            />

            {/* Period Selector */}
            <View style={styles.periodContainer}>
                <View style={[styles.periodSelector, { backgroundColor: COLORS.white }]}>
                    <Text style={styles.farmName}>{activeFarm?.name || 'My Dairy Farm'}</Text>
                    <TouchableOpacity
                        style={styles.periodSelectorButton}
                        onPress={() => setShowPeriodModal(true)}
                        activeOpacity={0.8}>
                        <Text style={styles.periodText}>{selectedPeriod}</Text>
                        <FastImage source={icons.chevronDown} style={styles.chevronIcon} tintColor={COLORS.gray} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
                showsVerticalScrollIndicator={false}>

                {/* KPI Cards */}
                <View style={styles.kpiContainer}>
                    {renderKPICard({
                        title: 'Total Revenue',
                        value: formatCurrency(analyticsData.financial.totalRevenue),
                        subtitle: `Profit margin: ${formatPercentage(analyticsData.financial.profitMargin)}`,
                        icon: icons.dollar,
                        backgroundColor: COLORS.primary,
                        trend: 'positive',
                    })}

                    {renderKPICard({
                        title: 'Net Profit',
                        value: formatCurrency(analyticsData.financial.netProfit),
                        subtitle: `Direct expenses: ${formatCurrency(analyticsData.financial.directExpenses)}`,
                        icon: icons.chart,
                        backgroundColor: COLORS.secondary,
                        trend: 'positive',
                    })}

                    {renderKPICard({
                        title: 'Total Animals',
                        value: analyticsData.livestock.totalAnimals.toString(),
                        subtitle: `Growth rate: ${formatPercentage(analyticsData.livestock.growthRate)}`,
                        icon: icons.livestock,
                        backgroundColor: COLORS.blue,
                        trend: 'positive',
                    })}

                    {renderKPICard({
                        title: 'Health Score',
                        value: `${analyticsData.health.healthScore}/100`,
                        subtitle: `Total treatments: ${analyticsData.health.totalTreatments}`,
                        icon: icons.medical,
                        backgroundColor: COLORS.orange,
                        trend: analyticsData.health.healthTrend === 'positive' ? 'positive' : 'negative',
                    })}

                    {renderKPICard({
                        title: 'Production Revenue',
                        value: formatCurrency(analyticsData.production.totalProductionRevenue),
                        subtitle: `Efficiency: ${analyticsData.production.efficiency}%`,
                        icon: icons.production,
                        backgroundColor: COLORS.green,
                        trend: 'positive',
                    })}

                    {renderKPICard({
                        title: 'Feed Efficiency',
                        value: `${formatCurrency(analyticsData.feed.averageCostPerAnimal)}/animal`,
                        subtitle: `Total cost: ${formatCurrency(analyticsData.feed.totalCost)}`,
                        icon: icons.feed,
                        backgroundColor: COLORS.purple,
                        trend: 'positive',
                    })}
                </View>

                {/* Distribution Charts */}
                {renderCategoryBreakdown()}
                {renderProductionBreakdown()}
                {renderExpenseBreakdown()}
                {renderHealthBreakdown()}
                {renderAssetBreakdown()}

                {/* Quick Actions */}
                {renderQuickActions()}

                {/* Performance Metrics */}
                {/* Performance Metrics */}
                <View style={[styles.chartCard, { backgroundColor: COLORS.white }]}>
                    <View style={styles.chartHeader}>
                        <Text style={styles.chartTitle}>Performance Metrics</Text>
                    </View>

                    <View style={styles.distributionContainer}>
                        {/* Revenue per Animal */}
                        <View style={styles.distributionItem}>
                            <View style={styles.distributionLeft}>
                                <View style={[styles.distributionDot, { backgroundColor: COLORS.green }]} />
                                <Text style={styles.distributionType}>Revenue per Animal</Text>
                            </View>
                            <View style={styles.distributionRight}>
                                <Text style={styles.distributionCount}>{formatCurrency(analyticsData.performance.revenuePerAnimal)}</Text>
                                <Text style={styles.distributionPercentage}>KES</Text>
                            </View>
                        </View>

                        {/* Profit per Animal */}
                        <View style={styles.distributionItem}>
                            <View style={styles.distributionLeft}>
                                <View style={[styles.distributionDot, { backgroundColor: COLORS.blue }]} />
                                <Text style={styles.distributionType}>Profit per Animal</Text>
                            </View>
                            <View style={styles.distributionRight}>
                                <Text style={styles.distributionCount}>{formatCurrency(analyticsData.performance.profitPerAnimal)}</Text>
                                <Text style={styles.distributionPercentage}>KES</Text>
                            </View>
                        </View>

                        {/* Feed Cost per Animal */}
                        <View style={styles.distributionItem}>
                            <View style={styles.distributionLeft}>
                                <View style={[styles.distributionDot, { backgroundColor: COLORS.red }]} />
                                <Text style={styles.distributionType}>Feed Cost per Animal</Text>
                            </View>
                            <View style={styles.distributionRight}>
                                <Text style={styles.distributionCount}>{formatCurrency(analyticsData.performance.feedCostPerAnimal)}</Text>
                                <Text style={styles.distributionPercentage}>KES</Text>
                            </View>
                        </View>

                        {/* Health Cost per Animal */}
                        <View style={styles.distributionItem}>
                            <View style={styles.distributionLeft}>
                                <View style={[styles.distributionDot, { backgroundColor: COLORS.orange }]} />
                                <Text style={styles.distributionType}>Health Cost per Animal</Text>
                            </View>
                            <View style={styles.distributionRight}>
                                <Text style={styles.distributionCount}>{formatCurrency(analyticsData.performance.healthCostPerAnimal)}</Text>
                                <Text style={styles.distributionPercentage}>KES</Text>
                            </View>
                        </View>

                        {/* Productivity Score */}
                        <View style={styles.distributionItem}>
                            <View style={styles.distributionLeft}>
                                <View style={[styles.distributionDot, { backgroundColor: COLORS.purple }]} />
                                <Text style={styles.distributionType}>Productivity Score</Text>
                            </View>
                            <View style={styles.distributionRight}>
                                <Text style={styles.distributionCount}>{analyticsData.performance.productivityScore}</Text>
                                <Text style={styles.distributionPercentage}>%</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Refresh/Load more controls */}
                <View style={styles.footerContainer}>
                    <TouchableOpacity
                        onPress={onRefresh}
                        style={styles.refreshButton}>
                        <Text style={styles.refreshButtonText}>Refresh Data</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Period Modal */}
            {renderPeriodModal()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.lightGray1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 18,
        fontFamily: FONTS.medium,
        color: COLORS.primary,
    },
    periodContainer: {
        paddingHorizontal: SIZES.padding,
        marginTop: SIZES.margin,
    },
    periodSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SIZES.base,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: COLORS.gray,
    },
    periodText: {
        fontSize: 16,
        fontFamily: FONTS.regular,
        color: COLORS.black,
    },
    chevronIcon: {
        width: 15,
        height: 15,
    },
    kpiContainer: {
        marginTop: SIZES.margin,
        paddingHorizontal: SIZES.padding,
    },
    kpiCard: {
        marginBottom: SIZES.base,
        padding: SIZES.padding,
        borderRadius: SIZES.radius,
        shadowColor: COLORS.black,
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    kpiHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    kpiIconContainer: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
        backgroundColor: COLORS.white,
        elevation: 2,
    },
    kpiIcon: {
        width: 20,
        height: 20,
    },
    trendIndicator: {
        width: 15,
        height: 15,
        borderRadius: 7.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    trendPositive: {
        backgroundColor: COLORS.green,
    },
    trendNegative: {
        backgroundColor: COLORS.red,
    },
    trendIcon: {
        width: 12,
        height: 12,
    },
    kpiValue: {
        fontSize: 24,
        fontFamily: FONTS.bold,
        color: COLORS.black,
    },
    kpiTitle: {
        fontSize: 16,
        fontFamily: FONTS.medium,
        color: COLORS.gray,
    },
    kpiSubtitle: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: COLORS.gray,
    },
    chartCard: {
        marginTop: SIZES.base,
        padding: SIZES.padding,
        borderRadius: SIZES.radius,
        backgroundColor: COLORS.white,
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    chartTitle: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: COLORS.black,
    },
    distributionContainer: {
        marginTop: SIZES.base,
    },
    distributionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.small,
    },
    distributionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    distributionDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: SIZES.base,
    },
    distributionIcon: {
        width: 20,
        height: 20,
    },
    distributionType: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: COLORS.black,
    },
    distributionRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    distributionCount: {
        fontSize: 14,
        fontFamily: FONTS.bold,
        color: COLORS.black,
    },
    distributionPercentage: {
        fontSize: 12,
        fontFamily: FONTS.regular,
        color: COLORS.gray,
    },
    footerContainer: {
        marginVertical: SIZES.padding,
        alignItems: 'center',
    },
    refreshButton: {
        paddingVertical: SIZES.small,
        paddingHorizontal: SIZES.base,
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radius,
    },
    refreshButtonText: {
        fontSize: 16,
        fontFamily: FONTS.medium,
        color: COLORS.white,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.overlay,
    },
    periodModal: {
        width: '80%',
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: COLORS.black,
    },
    closeButton: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeIcon: {
        width: 12,
        height: 12,
    },
    periodOptions: {
        marginTop: SIZES.base,
    },
    periodOption: {
        paddingVertical: SIZES.base,
        paddingHorizontal: SIZES.padding,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray,
    },
    selectedPeriodOption: {
        backgroundColor: COLORS.lightGray1,
    },
    periodOptionText: {
        fontSize: 16,
        fontFamily: FONTS.regular,
        color: COLORS.black,
    },
    selectedPeriodOptionText: {
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    checkIcon: {
        width: 16,
        height: 16,
    },
});

export default BusinessAnalyticsScreen;
