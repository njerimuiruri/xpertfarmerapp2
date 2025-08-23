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

const HealthAnalyticsScreen = () => {
    const navigation = useNavigation();
    const [selectedPeriod, setSelectedPeriod] = useState('This month');
    const [showPeriodModal, setShowPeriodModal] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);

    const [healthData] = useState({
        vaccination: [
            {
                id: 1,
                date: '2025-05-12',
                supplier: 'VetHealth Inc.',
                animalCount: 50,
                vaccinationAgainst: 'FMD',
                vaccineAdministered: 'FMD Vaccine',
                dosage: '2ml per animal',
                administeredBy: 'Erick Gatwiri',
                vaccineCost: 165,
                serviceCost: 50,
                totalCost: 215
            }
        ],
        deworming: [
            {
                id: 1,
                date: '2025-05-12',
                supplier: 'VetHealth Inc.',
                animalCount: 50,
                dewormingAgainst: 'Internal Parasites',
                drugAdministered: 'Albendazole',
                dosage: '10ml per animal',
                administeredBy: 'Erick Gatwiri',
                drugCost: 165,
                serviceCost: 50,
                totalCost: 215
            }
        ],
        curative: [
            {
                id: 1,
                date: '2025-05-12',
                supplier: 'VetHealth Inc.',
                animalCount: 15,
                diagnosis: 'Respiratory Infection',
                treatmentGiven: 'Antibiotics',
                drugAdministered: 'Oxytetracycline',
                dosage: '5ml per animal',
                administeredBy: 'Erick Gatwiri',
                medicineCost: 165,
                serviceCost: 50,
                totalCost: 215
            }
        ],
        genetic: [
            {
                id: 1,
                date: '2025-05-12',
                animalCount: 5,
                condition: 'Genetic Defect',
                remedy: 'Breeding Selection',
                administeredBy: 'Erick Gatwiri',
                remedyCost: 50,
                totalCost: 50
            }
        ],
        allergies: [
            {
                id: 1,
                date: '2025-05-12',
                animalCount: 3,
                allergyName: 'Feed Allergy',
                remedy: 'Antihistamine',
                dateOfRemedy: '2025-05-12',
                administeredBy: 'Erick Gatwiri',
                remedyCost: 50,
                totalCost: 50
            }
        ],
        boosters: [
            {
                id: 1,
                date: '2025-05-12',
                supplier: 'VetHealth Inc.',
                animalCount: 50,
                boosterName: 'Vitamin Complex',
                quantity: '50 liters',
                supplier: 'VetHealth Inc.',
                boosterCost: 165,
                additiveCost: 165,
                administrationCost: 50,
                totalCost: 380
            }
        ]
    });

    const timePeriods = ['This week', 'This month', 'This quarter', 'This year'];

    const totalAnimalsVaccinated = healthData.vaccination.reduce((sum, item) => sum + item.animalCount, 0);
    const totalAnimalsDewormed = healthData.deworming.reduce((sum, item) => sum + item.animalCount, 0);
    const totalAnimalsTreated = healthData.curative.reduce((sum, item) => sum + item.animalCount, 0);
    const totalHealthCost = [
        ...healthData.vaccination,
        ...healthData.deworming,
        ...healthData.curative,
        ...healthData.genetic,
        ...healthData.allergies,
        ...healthData.boosters
    ].reduce((sum, item) => sum + item.totalCost, 0);

    const avgCostPerAnimal = totalHealthCost / (totalAnimalsVaccinated + totalAnimalsDewormed + totalAnimalsTreated) || 0;

    const chartConfig = {
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        color: (opacity = 1) => `rgba(76, 113, 83, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.7,
        useShadowColorFromDataset: false,
    };

    const healthCategoryData = [
        {
            name: 'Vaccination',
            population: healthData.vaccination.reduce((sum, item) => sum + item.totalCost, 0),
            color: '#4C7153',
            legendFontColor: '#333',
            legendFontSize: 12,
        },
        {
            name: 'Deworming',
            population: healthData.deworming.reduce((sum, item) => sum + item.totalCost, 0),
            color: '#8CD18C',
            legendFontColor: '#333',
            legendFontSize: 12,
        },
        {
            name: 'Treatment',
            population: healthData.curative.reduce((sum, item) => sum + item.totalCost, 0),
            color: '#A7E3A7',
            legendFontColor: '#333',
            legendFontSize: 12,
        },
        {
            name: 'Boosters',
            population: healthData.boosters.reduce((sum, item) => sum + item.totalCost, 0),
            color: '#CBD18F',
            legendFontColor: '#333',
            legendFontSize: 12,
        },
        {
            name: 'Genetic',
            population: healthData.genetic.reduce((sum, item) => sum + item.totalCost, 0),
            color: '#91D79E',
            legendFontColor: '#333',
            legendFontSize: 12,
        },
        {
            name: 'Allergies',
            population: healthData.allergies.reduce((sum, item) => sum + item.totalCost, 0),
            color: '#B8E6C1',
            legendFontColor: '#333',
            legendFontSize: 12,
        }
    ].filter(item => item.population > 0);

    const healthTrendData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            data: [1200, 1350, 1100, 1450, totalHealthCost, 1300],
            color: (opacity = 1) => `rgba(76, 113, 83, ${opacity})`,
            strokeWidth: 3
        }]
    };

    const kpiCards = [
        {
            title: 'Total Health Cost',
            value: `KES ${totalHealthCost.toLocaleString()}`,
            change: '+8.2%',
            changeType: 'positive',
            icon: 'medical-bag',
            colors: ['#8CD18C', '#4C7153'],
        },
        {
            title: 'Animals Vaccinated',
            value: totalAnimalsVaccinated.toString(),
            change: '+12',
            changeType: 'positive',
            icon: 'needle',
            colors: ['#A7E3A7', '#4C7153'],
        },
        {
            title: 'Animals Treated',
            value: totalAnimalsTreated.toString(),
            change: '+5',
            changeType: 'positive',
            icon: 'stethoscope',
            colors: ['#CBD18F', '#4C7153'],
        },
        {
            title: 'Avg Cost/Animal',
            value: `KES ${avgCostPerAnimal.toFixed(0)}`,
            change: '-2.1%',
            changeType: 'negative',
            icon: 'calculator',
            colors: ['#91D79E', '#4C7153'],
        },
    ];

    const analysisTabs = [
        { id: 'overview', label: 'Overview', icon: 'view-dashboard' },
        { id: 'vaccination', label: 'Vaccination', icon: 'needle' },
        { id: 'deworming', label: 'Deworming', icon: 'pill' },
        { id: 'treatment', label: 'Treatment', icon: 'medical-bag' },
        { id: 'genetic', label: 'Genetic', icon: 'dna' },
        { id: 'allergies', label: 'Allergies', icon: 'alert-circle' },
        { id: 'boosters', label: 'Boosters', icon: 'flask' },
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

    const renderHealthRecord = (record, type) => {
        return (
            <View key={record.id} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                    <Text style={styles.recordDate}>{record.date}</Text>
                    <Text style={styles.recordCost}>KES {record.totalCost.toLocaleString()}</Text>
                </View>
                <View style={styles.recordDetails}>
                    <Text style={styles.recordAnimals}>Animals: {record.animalCount}</Text>
                    {record.supplier && <Text style={styles.recordSupplier}>Supplier: {record.supplier}</Text>}
                    {record.administeredBy && <Text style={styles.recordAdmin}>By: {record.administeredBy}</Text>}
                    {record.dosage && <Text style={styles.recordDosage}>Dosage: {record.dosage}</Text>}
                </View>
            </View>
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.chartContainer}>
                            <Text style={styles.chartTitle}>Health Cost Distribution</Text>
                            {healthCategoryData.length > 0 && (
                                <PieChart
                                    data={healthCategoryData}
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
                        <View style={styles.chartContainer}>
                            <Text style={styles.chartTitle}>Health Cost Trend</Text>
                            <LineChart
                                data={healthTrendData}
                                width={screenWidth - 64}
                                height={220}
                                chartConfig={chartConfig}
                                style={styles.chart}
                                bezier
                            />
                        </View>
                        <View style={styles.insightContainer}>
                            <Text style={styles.insightTitle}>Health Overview:</Text>
                            <Text style={styles.insightText}>• Total health expenditure: KES {totalHealthCost.toLocaleString()}</Text>
                            <Text style={styles.insightText}>• {totalAnimalsVaccinated} animals vaccinated this period</Text>
                            <Text style={styles.insightText}>• {totalAnimalsTreated} animals received curative treatment</Text>
                            <Text style={styles.insightText}>• Average cost per animal: KES {avgCostPerAnimal.toFixed(0)}</Text>
                        </View>
                    </View>
                );

            case 'vaccination':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.summaryStats}>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>{totalAnimalsVaccinated}</Text>
                                <Text style={styles.statLabel}>Animals Vaccinated</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>KES {healthData.vaccination.reduce((sum, item) => sum + item.totalCost, 0).toLocaleString()}</Text>
                                <Text style={styles.statLabel}>Total Cost</Text>
                            </View>
                        </View>
                        <View style={styles.recordsList}>
                            <Text style={styles.recordsTitle}>Vaccination Records</Text>
                            {healthData.vaccination.map(record => renderHealthRecord(record, 'vaccination'))}
                        </View>
                    </View>
                );

            case 'deworming':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.summaryStats}>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>{totalAnimalsDewormed}</Text>
                                <Text style={styles.statLabel}>Animals Dewormed</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>KES {healthData.deworming.reduce((sum, item) => sum + item.totalCost, 0).toLocaleString()}</Text>
                                <Text style={styles.statLabel}>Total Cost</Text>
                            </View>
                        </View>
                        <View style={styles.recordsList}>
                            <Text style={styles.recordsTitle}>Deworming Records</Text>
                            {healthData.deworming.map(record => renderHealthRecord(record, 'deworming'))}
                        </View>
                    </View>
                );

            case 'treatment':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.summaryStats}>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>{totalAnimalsTreated}</Text>
                                <Text style={styles.statLabel}>Animals Treated</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>KES {healthData.curative.reduce((sum, item) => sum + item.totalCost, 0).toLocaleString()}</Text>
                                <Text style={styles.statLabel}>Treatment Cost</Text>
                            </View>
                        </View>
                        <View style={styles.recordsList}>
                            <Text style={styles.recordsTitle}>Treatment Records</Text>
                            {healthData.curative.map(record => (
                                <View key={record.id} style={styles.recordCard}>
                                    <View style={styles.recordHeader}>
                                        <Text style={styles.recordDate}>{record.date}</Text>
                                        <Text style={styles.recordCost}>KES {record.totalCost.toLocaleString()}</Text>
                                    </View>
                                    <View style={styles.recordDetails}>
                                        <Text style={styles.recordAnimals}>Animals: {record.animalCount}</Text>
                                        <Text style={styles.recordDiagnosis}>Diagnosis: {record.diagnosis}</Text>
                                        <Text style={styles.recordTreatment}>Treatment: {record.treatmentGiven}</Text>
                                        <Text style={styles.recordAdmin}>By: {record.administeredBy}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                );

            case 'genetic':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.summaryStats}>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>{healthData.genetic.reduce((sum, item) => sum + item.animalCount, 0)}</Text>
                                <Text style={styles.statLabel}>Animals Treated</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>KES {healthData.genetic.reduce((sum, item) => sum + item.totalCost, 0).toLocaleString()}</Text>
                                <Text style={styles.statLabel}>Total Cost</Text>
                            </View>
                        </View>
                        <View style={styles.recordsList}>
                            <Text style={styles.recordsTitle}>Genetic Treatment Records</Text>
                            {healthData.genetic.map(record => (
                                <View key={record.id} style={styles.recordCard}>
                                    <View style={styles.recordHeader}>
                                        <Text style={styles.recordDate}>{record.date}</Text>
                                        <Text style={styles.recordCost}>KES {record.totalCost.toLocaleString()}</Text>
                                    </View>
                                    <View style={styles.recordDetails}>
                                        <Text style={styles.recordAnimals}>Animals: {record.animalCount}</Text>
                                        <Text style={styles.recordCondition}>Condition: {record.condition}</Text>
                                        <Text style={styles.recordRemedy}>Remedy: {record.remedy}</Text>
                                        <Text style={styles.recordAdmin}>By: {record.administeredBy}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                );

            case 'allergies':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.summaryStats}>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>{healthData.allergies.reduce((sum, item) => sum + item.animalCount, 0)}</Text>
                                <Text style={styles.statLabel}>Animals Treated</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>KES {healthData.allergies.reduce((sum, item) => sum + item.totalCost, 0).toLocaleString()}</Text>
                                <Text style={styles.statLabel}>Total Cost</Text>
                            </View>
                        </View>
                        <View style={styles.recordsList}>
                            <Text style={styles.recordsTitle}>Allergy Treatment Records</Text>
                            {healthData.allergies.map(record => (
                                <View key={record.id} style={styles.recordCard}>
                                    <View style={styles.recordHeader}>
                                        <Text style={styles.recordDate}>{record.dateOfRemedy}</Text>
                                        <Text style={styles.recordCost}>KES {record.totalCost.toLocaleString()}</Text>
                                    </View>
                                    <View style={styles.recordDetails}>
                                        <Text style={styles.recordAnimals}>Animals: {record.animalCount}</Text>
                                        <Text style={styles.recordAllergy}>Allergy: {record.allergyName}</Text>
                                        <Text style={styles.recordRemedy}>Remedy: {record.remedy}</Text>
                                        <Text style={styles.recordAdmin}>By: {record.administeredBy}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                );

            case 'boosters':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.summaryStats}>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>{healthData.boosters.reduce((sum, item) => sum + item.animalCount, 0)}</Text>
                                <Text style={styles.statLabel}>Animals Given Boosters</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>KES {healthData.boosters.reduce((sum, item) => sum + item.totalCost, 0).toLocaleString()}</Text>
                                <Text style={styles.statLabel}>Total Cost</Text>
                            </View>
                        </View>
                        <View style={styles.recordsList}>
                            <Text style={styles.recordsTitle}>Booster & Additive Records</Text>
                            {healthData.boosters.map(record => (
                                <View key={record.id} style={styles.recordCard}>
                                    <View style={styles.recordHeader}>
                                        <Text style={styles.recordDate}>{record.date}</Text>
                                        <Text style={styles.recordCost}>KES {record.totalCost.toLocaleString()}</Text>
                                    </View>
                                    <View style={styles.recordDetails}>
                                        <Text style={styles.recordAnimals}>Animals: {record.animalCount}</Text>
                                        <Text style={styles.recordBooster}>Booster: {record.boosterName}</Text>
                                        <Text style={styles.recordQuantity}>Quantity: {record.quantity}</Text>
                                        <Text style={styles.recordSupplier}>Supplier: {record.supplier}</Text>
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
                        <Text style={styles.welcomeTitle}>Health Analytics</Text>
                        <Text style={styles.welcomeSubtitle}>
                            Monitor livestock health status and{"\n"}track medical interventions
                        </Text>
                    </View>
                    <View style={styles.welcomeIconContainer}>
                        <Icon name="medical-bag" size={60} color="rgba(255,255,255,0.8)" />
                    </View>
                </LinearGradient>

                <View style={styles.overviewSection}>
                    <Text style={styles.overviewTitle}>Health Management</Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.monthSelector} onPress={() => setShowPeriodModal(true)}>
                            <Text style={styles.monthText}>{selectedPeriod}</Text>
                            <Icon name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.manageButton}
                            onPress={() => navigation.navigate('PurchasesJournal')}
                        >
                            <Icon name="book-open" size={20} color="#fff" />
                            <Text style={styles.manageButtonText}>Journal</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.kpiGrid}>
                    {kpiCards.map(renderKPICard)}
                </View>

                <View style={styles.analysisSection}>
                    <Text style={styles.sectionTitle}>Health Categories</Text>

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
                            onPress={() => navigation.navigate('PurchasesJournal')}
                        >
                            <Icon name="book-open" size={24} color="#4C7153" />
                            <Text style={styles.quickActionText}>Purchases Journal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickActionButton}>
                            <Icon name="file-excel" size={24} color="#4C7153" />
                            <Text style={styles.quickActionText}>Export Health Data</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickActionButton}>
                            <Icon name="chart-box-outline" size={24} color="#4C7153" />
                            <Text style={styles.quickActionText}>Health Report</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickActionButton}>
                            <Icon name="calendar-plus" size={24} color="#4C7153" />
                            <Text style={styles.quickActionText}>Schedule Treatment</Text>
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
    },
    manageButtonText: {
        color: '#fff',
        fontWeight: '600',
        marginLeft: 4,
    },
    kpiGrid: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    kpiCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
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
        marginBottom: 8,
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
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
        marginBottom: 4,
    },
    kpiValue: {
        fontSize: 20,
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
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        gap: 6,
    },
    activeAnalysisTab: {
        backgroundColor: '#E8F3E8',
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
        borderRadius: 16,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    tabContent: {
        flex: 1,
    },
    chartContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    chart: {
        borderRadius: 12,
    },
    insightContainer: {
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 12,
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
        marginBottom: 4,
        lineHeight: 20,
    },
    summaryStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4C7153',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    recordsList: {
        flex: 1,
    },
    recordsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    recordCard: {
        backgroundColor: '#F9F9F9',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    recordHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    recordDate: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    recordCost: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4C7153',
    },
    recordDetails: {
        gap: 4,
    },
    recordAnimals: {
        fontSize: 13,
        color: '#666',
    },
    recordSupplier: {
        fontSize: 13,
        color: '#666',
    },
    recordAdmin: {
        fontSize: 13,
        color: '#666',
    },
    recordDosage: {
        fontSize: 13,
        color: '#666',
    },
    recordDiagnosis: {
        fontSize: 13,
        color: '#666',
    },
    recordTreatment: {
        fontSize: 13,
        color: '#666',
    },
    recordCondition: {
        fontSize: 13,
        color: '#666',
    },
    recordRemedy: {
        fontSize: 13,
        color: '#666',
    },
    recordAllergy: {
        fontSize: 13,
        color: '#666',
    },
    recordBooster: {
        fontSize: 13,
        color: '#666',
    },
    recordQuantity: {
        fontSize: 13,
        color: '#666',
    },
    quickActionsSection: {
        paddingHorizontal: 16,
        marginBottom: 32,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    quickActionButton: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        width: '47%',
        minHeight: 80,
    },
    quickActionText: {
        fontSize: 12,
        color: '#4C7153',
        fontWeight: '500',
        marginTop: 8,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    periodModalContainer: {
        backgroundColor: '#fff',
        margin: 32,
        borderRadius: 16,
        padding: 24,
        minWidth: 280,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    periodOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    selectedPeriodOption: {
        backgroundColor: '#E8F3E8',
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

export default HealthAnalyticsScreen;