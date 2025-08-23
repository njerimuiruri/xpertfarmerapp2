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

const BreedingAnalyticsScreen = () => {
    const navigation = useNavigation();
    const [selectedPeriod, setSelectedPeriod] = useState('This month');
    const [showPeriodModal, setShowPeriodModal] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);

    // Sample breeding data based on your records
    const [breedingServicing] = useState([
        {
            id: 1,
            date: '2025-05-12',
            numberOfAnimals: 2,
            typeOfServicing: 'AI',
            supplier: 'VetHealth Inc.',
            aiPurchaseDate: '2025-05-12',
            costOfAI: 165,
            aiAdministrator: 'Erick Gatwiri',
            costOfAdministration: 50,
            totalCost: 215,
            status: 'Completed'
        },
        {
            id: 2,
            date: '2025-05-12',
            numberOfAnimals: 1,
            typeOfServicing: 'Natural Breeding',
            supplier: 'Jane Kamau',
            aiPurchaseDate: null,
            costOfAI: 40,
            aiAdministrator: 'Jane Kamau',
            costOfAdministration: 0,
            totalCost: 40,
            status: 'Completed'
        }
    ]);

    const [breedingBirth] = useState([
        {
            id: 1,
            date: '2025-05-08',
            numberOfAnimals: 1,
            numberOfOffspring: 1,
            birthWeight: 35, // kg
            estimatedValue: 10000,
            animalType: 'Calf',
            motherID: 'COW-001',
            status: 'Healthy',
            notes: 'Recently birthed animals'
        }
    ]);

    const timePeriods = ['This week', 'This month', 'This quarter', 'This year'];

    // Analytics calculations
    const totalServicingCost = breedingServicing.reduce((sum, service) => sum + service.totalCost, 0);
    const totalAnimalsServiced = breedingServicing.reduce((sum, service) => sum + service.numberOfAnimals, 0);
    const totalOffspring = breedingBirth.reduce((sum, birth) => sum + birth.numberOfOffspring, 0);
    const totalBirthValue = breedingBirth.reduce((sum, birth) => sum + birth.estimatedValue, 0);
    const avgServiceCost = totalServicingCost / breedingServicing.length || 0;
    const successRate = breedingBirth.length > 0 ? ((breedingBirth.length / breedingServicing.length) * 100) : 0;

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

    // Servicing type distribution for pie chart
    const servicingTypeData = [
        {
            name: 'AI',
            population: breedingServicing.filter(s => s.typeOfServicing === 'AI').length,
            color: '#4C7153',
            legendFontColor: '#333',
            legendFontSize: 12,
        },
        {
            name: 'Natural',
            population: breedingServicing.filter(s => s.typeOfServicing === 'Natural Breeding').length,
            color: '#8CD18C',
            legendFontColor: '#333',
            legendFontSize: 12,
        }
    ].filter(item => item.population > 0);

    // Cost analysis data
    const costAnalysisData = {
        labels: ['AI Cost', 'Admin Cost', 'Natural Breeding'],
        datasets: [{
            data: [
                breedingServicing.filter(s => s.typeOfServicing === 'AI').reduce((sum, s) => sum + s.costOfAI, 0),
                breedingServicing.reduce((sum, s) => sum + s.costOfAdministration, 0),
                breedingServicing.filter(s => s.typeOfServicing === 'Natural Breeding').reduce((sum, s) => sum + s.costOfAI, 0)
            ]
        }]
    };

    // Monthly breeding trend (sample data)
    const breedingTrendData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            data: [0, 1, 0, 1, 3, 0], // Services per month
            color: (opacity = 1) => `rgba(76, 113, 83, ${opacity})`,
            strokeWidth: 3
        }]
    };

    const kpiCards = [
        {
            title: 'Total Services',
            value: breedingServicing.length.toString(),
            change: '+1',
            changeType: 'positive',
            icon: 'heart-pulse',
            colors: ['#8CD18C', '#4C7153'],
        },
        {
            title: 'Animals Serviced',
            value: totalAnimalsServiced.toString(),
            change: '+3',
            changeType: 'positive',
            icon: 'cow',
            colors: ['#A7E3A7', '#4C7153'],
        },
        {
            title: 'Total Offspring',
            value: totalOffspring.toString(),
            change: '+1',
            changeType: 'positive',
            icon: 'baby-face-outline',
            colors: ['#CBD18F', '#4C7153'],
        },
        {
            title: 'Success Rate',
            value: `${successRate.toFixed(1)}%`,
            change: '+10%',
            changeType: 'positive',
            icon: 'trending-up',
            colors: ['#91D79E', '#4C7153'],
        },
    ];

    const analysisTabs = [
        { id: 'overview', label: 'Overview', icon: 'view-dashboard' },
        { id: 'servicing', label: 'Servicing', icon: 'needle' },
        { id: 'births', label: 'Births', icon: 'baby-face-outline' },
        { id: 'costs', label: 'Cost Analysis', icon: 'cash-multiple' },
    ];

    const renderKPICard = ({ title, value, change, changeType, icon, colors }) => (
        <LinearGradient colors={colors} style={styles.kpiCard} key={title}>
            <View style={styles.kpiHeader}>
                <Icon name={icon} size={24} color="#fff" />
                <View style={[styles.changeContainer, { backgroundColor: changeType === 'positive' ? 'rgba(255,255,255,0.2)' : 'rgba(255,0,0,0.2)' }]}>
                    <Icon
                        name={changeType === 'positive' ? 'arrow-up' : 'arrow-down'}
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
                            <Text style={styles.chartTitle}>Servicing Type Distribution</Text>
                            {servicingTypeData.length > 0 && (
                                <PieChart
                                    data={servicingTypeData}
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
                            <Text style={styles.insightTitle}>Breeding Overview:</Text>
                            <Text style={styles.insightText}>• {breedingServicing.length} total breeding services completed</Text>
                            <Text style={styles.insightText}>• {totalAnimalsServiced} animals successfully serviced</Text>
                            <Text style={styles.insightText}>• {totalOffspring} offspring produced with value of KES {totalBirthValue.toLocaleString()}</Text>
                            <Text style={styles.insightText}>• {successRate.toFixed(1)}% breeding success rate</Text>
                        </View>
                    </View>
                );

            case 'servicing':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.servicesSummary}>
                            <Text style={styles.sectionTitle}>Servicing Records</Text>
                            {breedingServicing.map(service => (
                                <View key={service.id} style={styles.serviceCard}>
                                    <View style={styles.serviceHeader}>
                                        <Text style={styles.serviceDate}>{new Date(service.date).toLocaleDateString()}</Text>
                                        <View style={[styles.statusBadge, { backgroundColor: service.status === 'Completed' ? '#4C7153' : '#FFA500' }]}>
                                            <Text style={styles.statusText}>{service.status}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.serviceDetails}>
                                        <View style={styles.serviceRow}>
                                            <Text style={styles.serviceLabel}>Type:</Text>
                                            <Text style={styles.serviceValue}>{service.typeOfServicing}</Text>
                                        </View>
                                        <View style={styles.serviceRow}>
                                            <Text style={styles.serviceLabel}>Animals:</Text>
                                            <Text style={styles.serviceValue}>{service.numberOfAnimals}</Text>
                                        </View>
                                        <View style={styles.serviceRow}>
                                            <Text style={styles.serviceLabel}>Administrator:</Text>
                                            <Text style={styles.serviceValue}>{service.aiAdministrator}</Text>
                                        </View>
                                        <View style={styles.serviceRow}>
                                            <Text style={styles.serviceLabel}>Total Cost:</Text>
                                            <Text style={styles.serviceCost}>KES {service.totalCost.toLocaleString()}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                        <View style={styles.servicingStats}>
                            <Text style={styles.sectionTitle}>Servicing Statistics</Text>
                            <View style={styles.statsGrid}>
                                <View style={styles.statCard}>
                                    <Text style={styles.statValue}>KES {totalServicingCost.toLocaleString()}</Text>
                                    <Text style={styles.statLabel}>Total Cost</Text>
                                </View>
                                <View style={styles.statCard}>
                                    <Text style={styles.statValue}>KES {avgServiceCost.toFixed(0)}</Text>
                                    <Text style={styles.statLabel}>Avg Cost/Service</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                );

            case 'births':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.birthsSummary}>
                            <Text style={styles.sectionTitle}>Birth Records</Text>
                            {breedingBirth.map(birth => (
                                <View key={birth.id} style={styles.birthCard}>
                                    <View style={styles.birthHeader}>
                                        <Text style={styles.birthDate}>{new Date(birth.date).toLocaleDateString()}</Text>
                                        <View style={[styles.statusBadge, { backgroundColor: birth.status === 'Healthy' ? '#4C7153' : '#FFA500' }]}>
                                            <Text style={styles.statusText}>{birth.status}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.birthDetails}>
                                        <View style={styles.birthRow}>
                                            <Text style={styles.birthLabel}>Animal Type:</Text>
                                            <Text style={styles.birthValue}>{birth.animalType}</Text>
                                        </View>
                                        <View style={styles.birthRow}>
                                            <Text style={styles.birthLabel}>Offspring:</Text>
                                            <Text style={styles.birthValue}>{birth.numberOfOffspring}</Text>
                                        </View>
                                        <View style={styles.birthRow}>
                                            <Text style={styles.birthLabel}>Birth Weight:</Text>
                                            <Text style={styles.birthValue}>{birth.birthWeight} kg</Text>
                                        </View>
                                        <View style={styles.birthRow}>
                                            <Text style={styles.birthLabel}>Estimated Value:</Text>
                                            <Text style={styles.birthCost}>KES {birth.estimatedValue.toLocaleString()}</Text>
                                        </View>
                                        <View style={styles.birthRow}>
                                            <Text style={styles.birthLabel}>Mother ID:</Text>
                                            <Text style={styles.birthValue}>{birth.motherID}</Text>
                                        </View>
                                    </View>
                                    {birth.notes && (
                                        <View style={styles.notesContainer}>
                                            <Text style={styles.notesLabel}>Notes:</Text>
                                            <Text style={styles.notesText}>{birth.notes}</Text>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                        <View style={styles.birthStats}>
                            <Text style={styles.sectionTitle}>Birth Statistics</Text>
                            <View style={styles.statsGrid}>
                                <View style={styles.statCard}>
                                    <Text style={styles.statValue}>{totalOffspring}</Text>
                                    <Text style={styles.statLabel}>Total Offspring</Text>
                                </View>
                                <View style={styles.statCard}>
                                    <Text style={styles.statValue}>{breedingBirth[0]?.birthWeight || 0} kg</Text>
                                    <Text style={styles.statLabel}>Avg Birth Weight</Text>
                                </View>
                                <View style={styles.statCard}>
                                    <Text style={styles.statValue}>KES {totalBirthValue.toLocaleString()}</Text>
                                    <Text style={styles.statLabel}>Total Value</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                );

            case 'costs':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.chartContainer}>
                            <Text style={styles.chartTitle}>Breeding Cost Breakdown</Text>
                            {costAnalysisData.labels.length > 0 && (
                                <BarChart
                                    data={costAnalysisData}
                                    width={screenWidth - 64}
                                    height={220}
                                    chartConfig={chartConfig}
                                    style={styles.chart}
                                    showValuesOnTopOfBars
                                />
                            )}
                        </View>
                        <View style={styles.costBreakdown}>
                            <Text style={styles.sectionTitle}>Cost Analysis</Text>
                            <View style={styles.costGrid}>
                                <View style={styles.costItem}>
                                    <Text style={styles.costLabel}>AI Services</Text>
                                    <Text style={styles.costValue}>KES {breedingServicing.filter(s => s.typeOfServicing === 'AI').reduce((sum, s) => sum + s.costOfAI, 0).toLocaleString()}</Text>
                                </View>
                                <View style={styles.costItem}>
                                    <Text style={styles.costLabel}>Administration</Text>
                                    <Text style={styles.costValue}>KES {breedingServicing.reduce((sum, s) => sum + s.costOfAdministration, 0).toLocaleString()}</Text>
                                </View>
                                <View style={styles.costItem}>
                                    <Text style={styles.costLabel}>Natural Breeding</Text>
                                    <Text style={styles.costValue}>KES {breedingServicing.filter(s => s.typeOfServicing === 'Natural Breeding').reduce((sum, s) => sum + s.costOfAI, 0).toLocaleString()}</Text>
                                </View>
                                <View style={styles.costItem}>
                                    <Text style={styles.costLabel}>Total Breeding Cost</Text>
                                    <Text style={styles.costValue}>KES {totalServicingCost.toLocaleString()}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.insightContainer}>
                            <Text style={styles.insightTitle}>Cost Insights:</Text>
                            <Text style={styles.insightText}>• AI services represent the highest cost component</Text>
                            <Text style={styles.insightText}>• Administration fees add {((breedingServicing.reduce((sum, s) => sum + s.costOfAdministration, 0) / totalServicingCost) * 100).toFixed(1)}% to total costs</Text>
                            <Text style={styles.insightText}>• Natural breeding offers lower upfront costs</Text>
                            <Text style={styles.insightText}>• ROI from offspring value: {(((totalBirthValue - totalServicingCost) / totalServicingCost) * 100).toFixed(1)}%</Text>
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
                        <Text style={styles.welcomeTitle}>Breeding Analytics</Text>
                        <Text style={styles.welcomeSubtitle}>
                            Monitor breeding performance and{"\n"}track reproductive success
                        </Text>
                    </View>
                    <View style={styles.welcomeIconContainer}>
                        <Icon name="heart-pulse" size={60} color="rgba(255,255,255,0.8)" />
                    </View>
                </LinearGradient>

                <View style={styles.overviewSection}>
                    <Text style={styles.overviewTitle}>Breeding Overview</Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.monthSelector} onPress={() => setShowPeriodModal(true)}>
                            <Text style={styles.monthText}>{selectedPeriod}</Text>
                            <Icon name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.manageButton}
                            onPress={() => navigation.navigate('BreedingManagementScreen')}
                        >
                            <Icon name="plus" size={20} color="#fff" />
                            <Text style={styles.manageButtonText}>Add Record</Text>
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
                            onPress={() => navigation.navigate('BreedingServicingScreen')}
                        >
                            <Icon name="needle" size={24} color="#4C7153" />
                            <Text style={styles.quickActionText}>Add Servicing</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => navigation.navigate('BirthRecordScreen')}
                        >
                            <Icon name="baby-face-outline" size={24} color="#4C7153" />
                            <Text style={styles.quickActionText}>Record Birth</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => navigation.navigate('PurchasesJournal')}
                        >
                            <Icon name="shopping-cart" size={24} color="#4C7153" />
                            <Text style={styles.quickActionText}>Purchases Journal</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.quickActionsGrid, { marginTop: 12 }]}>
                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => navigation.navigate('GeneralJournal')}
                        >
                            <Icon name="book-open-variant" size={24} color="#4C7153" />
                            <Text style={styles.quickActionText}>General Journal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickActionButton}>
                            <Icon name="file-excel" size={24} color="#4C7153" />
                            <Text style={styles.quickActionText}>Export Report</Text>
                        </TouchableOpacity>
                        <View style={styles.quickActionButton} opacity={0}>
                        </View>
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
        borderRadius: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    monthText: {
        marginRight: 4,
        color: '#333',
        fontWeight: '500'
    },
    manageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4C7153',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        gap: 4,
    },
    manageButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    kpiGrid: {
        paddingHorizontal: 16,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    kpiCard: {
        width: '47%',
        padding: 16,
        borderRadius: 12,
        minHeight: 120,
    },
    kpiHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    changeContainer: {
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
        fontWeight: '600',
    },
    kpiTitle: {
        fontSize: 12,
        color: '#fff',
        opacity: 0.9,
        marginBottom: 4,
    },
    kpiValue: {
        fontSize: 16,
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
        marginBottom: 16,
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
        backgroundColor: '#fff',
        borderRadius: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        gap: 6,
    },
    activeAnalysisTab: {
        backgroundColor: '#E8F4EA',
        borderColor: '#4C7153',
        borderWidth: 1,
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
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    tabContent: {
        minHeight: 300,
    },
    chartContainer: {
        marginBottom: 16,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    chart: {
        borderRadius: 8,
    },
    insightContainer: {
        marginTop: 20,
        padding: 16,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
    },
    insightTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    insightText: {
        fontSize: 13,
        color: '#666',
        marginBottom: 4,
        lineHeight: 18,
    },
    // Servicing tab styles
    servicesSummary: {
        marginBottom: 20,
    },
    serviceCard: {
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#4C7153',
    },
    serviceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    serviceDate: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '500',
    },
    serviceDetails: {
        gap: 6,
    },
    serviceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    serviceLabel: {
        fontSize: 13,
        color: '#666',
    },
    serviceValue: {
        fontSize: 13,
        color: '#333',
        fontWeight: '500',
    },
    serviceCost: {
        fontSize: 13,
        color: '#4C7153',
        fontWeight: '600',
    },
    servicingStats: {
        marginTop: 16,
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
    // Birth tab styles
    birthsSummary: {
        marginBottom: 20,
    },
    birthCard: {
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#8CD18C',
    },
    birthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    birthDate: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    birthDetails: {
        gap: 6,
    },
    birthRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    birthLabel: {
        fontSize: 13,
        color: '#666',
    },
    birthValue: {
        fontSize: 13,
        color: '#333',
        fontWeight: '500',
    },
    birthCost: {
        fontSize: 13,
        color: '#4C7153',
        fontWeight: '600',
    },
    notesContainer: {
        marginTop: 8,
        padding: 8,
        backgroundColor: '#fff',
        borderRadius: 6,
    },
    notesLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
        marginBottom: 4,
    },
    notesText: {
        fontSize: 12,
        color: '#333',
        lineHeight: 16,
    },
    birthStats: {
        marginTop: 16,
    },
    // Cost analysis styles
    costBreakdown: {
        marginTop: 20,
    },
    costGrid: {
        gap: 12,
    },
    costItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#F8F9FA',
        borderRadius: 6,
    },
    costLabel: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    costValue: {
        fontSize: 14,
        color: '#4C7153',
        fontWeight: '600',
    },
    quickActionsSection: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    quickActionButton: {
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
        gap: 8,
    },
    quickActionText: {
        fontSize: 12,
        color: '#333',
        fontWeight: '500',
        textAlign: 'center',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    periodModalContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        width: '80%',
        maxWidth: 300,
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
        fontWeight: '600',
    },
});

export default BreedingAnalyticsScreen;