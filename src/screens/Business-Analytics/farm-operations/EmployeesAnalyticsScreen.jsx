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

const EmployeesAnalyticsScreen = () => {
    const navigation = useNavigation();
    const [selectedPeriod, setSelectedPeriod] = useState('This month');
    const [showPeriodModal, setShowPeriodModal] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);

    // Sample data - replace with actual API calls
    const [employees] = useState([
        {
            id: 1,
            name: 'John Doe',
            employmentType: 'Full-Time',
            rate: 10,
            hoursWorked: 80,
            totalWages: 800,
            department: 'Livestock',
            startDate: '2025-01-15',
            status: 'Active',
            productivity: 92
        },
        {
            id: 2,
            name: 'Jane Smith',
            employmentType: 'Part-Time',
            rate: 8,
            hoursWorked: 40,
            totalWages: 320,
            department: 'Dairy Production',
            startDate: '2025-02-01',
            status: 'Active',
            productivity: 88
        },
        {
            id: 3,
            name: 'Erick Gatwiri',
            employmentType: 'Contract',
            rate: 25,
            hoursWorked: 20,
            totalWages: 500,
            department: 'Veterinary',
            startDate: '2025-03-01',
            status: 'Active',
            productivity: 95
        }
    ]);

    const timePeriods = ['This week', 'This month', 'This quarter', 'This year'];
    const employmentTypes = ['Full-Time', 'Part-Time', 'Contract', 'Seasonal'];
    const departments = ['Livestock', 'Dairy Production', 'Veterinary', 'Feeding', 'Maintenance', 'Administration'];

    // Financial calculations
    const totalEmployees = employees.length;
    const totalWages = employees.reduce((sum, emp) => sum + emp.totalWages, 0);
    const avgWage = totalWages / totalEmployees || 0;
    const activeEmployees = employees.filter(emp => emp.status === 'Active').length;
    const avgProductivity = employees.reduce((sum, emp) => sum + (emp.productivity || 0), 0) / totalEmployees || 0;

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

    // Employment type distribution for pie chart
    const employmentTypeData = employmentTypes.map(type => {
        const count = employees.filter(emp => emp.employmentType === type).length;
        const colors = ['#4C7153', '#8CD18C', '#A7E3A7', '#CBD18F'];
        return {
            name: type,
            population: count,
            color: colors[employmentTypes.indexOf(type)] || '#4C7153',
            legendFontColor: '#333',
            legendFontSize: 12,
        };
    }).filter(item => item.population > 0);

    // Department distribution for bar chart
    const departmentData = {
        labels: departments.filter(dept => employees.some(emp => emp.department === dept)),
        datasets: [{
            data: departments
                .filter(dept => employees.some(emp => emp.department === dept))
                .map(dept => employees.filter(emp => emp.department === dept).length)
        }]
    };

    // Productivity trend data (sample)
    const productivityTrendData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            data: [85, 87, 89, 91, 88, Math.round(avgProductivity)],
            color: (opacity = 1) => `rgba(76, 113, 83, ${opacity})`,
            strokeWidth: 3
        }]
    };

    const kpiCards = [
        {
            title: 'Total Employees',
            value: totalEmployees.toString(),
            change: '+2',
            changeType: 'positive',
            icon: 'account-group',
            colors: ['#8CD18C', '#4C7153'],
        },
        {
            title: 'Monthly Payroll',
            value: `KES ${totalWages.toLocaleString()}`,
            change: '+5.2%',
            changeType: 'positive',
            icon: 'cash',
            colors: ['#A7E3A7', '#4C7153'],
        },
        {
            title: 'Average Wage',
            value: `KES ${avgWage.toFixed(0)}`,
            change: '+3.1%',
            changeType: 'positive',
            icon: 'calculator',
            colors: ['#CBD18F', '#4C7153'],
        },
        {
            title: 'Avg Productivity',
            value: `${avgProductivity.toFixed(1)}%`,
            change: '+2.3%',
            changeType: 'positive',
            icon: 'trending-up',
            colors: ['#91D79E', '#4C7153'],
        },
    ];

    const analysisTabs = [
        { id: 'overview', label: 'Overview', icon: 'view-dashboard' },
        { id: 'payroll', label: 'Payroll', icon: 'cash-multiple' },
        { id: 'departments', label: 'Departments', icon: 'domain' },
        { id: 'performance', label: 'Performance', icon: 'chart-line' },
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
                            <Text style={styles.chartTitle}>Employment Type Distribution</Text>
                            {employmentTypeData.length > 0 && (
                                <PieChart
                                    data={employmentTypeData}
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
                            <Text style={styles.insightTitle}>Workforce Overview:</Text>
                            <Text style={styles.insightText}>• {activeEmployees} active employees across {departments.filter(dept => employees.some(emp => emp.department === dept)).length} departments</Text>
                            <Text style={styles.insightText}>• Average wage rate: KES {avgWage.toFixed(0)} per employee</Text>
                            <Text style={styles.insightText}>• Total monthly payroll: KES {totalWages.toLocaleString()}</Text>
                            <Text style={styles.insightText}>• Average productivity score: {avgProductivity.toFixed(1)}%</Text>
                        </View>
                    </View>
                );

            case 'payroll':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.payrollSummary}>
                            <Text style={styles.sectionTitle}>Payroll Breakdown</Text>
                            <View style={styles.payrollGrid}>
                                <View style={styles.payrollItem}>
                                    <Text style={styles.payrollLabel}>Gross Wages</Text>
                                    <Text style={styles.payrollValue}>KES {totalWages.toLocaleString()}</Text>
                                </View>
                                <View style={styles.payrollItem}>
                                    <Text style={styles.payrollLabel}>PAYE Tax</Text>
                                    <Text style={styles.payrollValue}>KES {Math.round(totalWages * 0.1).toLocaleString()}</Text>
                                </View>
                                <View style={styles.payrollItem}>
                                    <Text style={styles.payrollLabel}>NHIF</Text>
                                    <Text style={styles.payrollValue}>KES {Math.round(totalWages * 0.015).toLocaleString()}</Text>
                                </View>
                                <View style={styles.payrollItem}>
                                    <Text style={styles.payrollLabel}>NSSF</Text>
                                    <Text style={styles.payrollValue}>KES {Math.round(totalWages * 0.06).toLocaleString()}</Text>
                                </View>
                                <View style={styles.payrollItem}>
                                    <Text style={styles.payrollLabel}>Net Pay</Text>
                                    <Text style={styles.payrollValue}>KES {Math.round(totalWages * 0.825).toLocaleString()}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.costBreakdown}>
                            <Text style={styles.sectionTitle}>Cost Analysis</Text>
                            <View style={styles.costItem}>
                                <Text style={styles.costLabel}>Cost per Department</Text>
                                {departments.filter(dept => employees.some(emp => emp.department === dept)).map(dept => {
                                    const deptWages = employees.filter(emp => emp.department === dept).reduce((sum, emp) => sum + emp.totalWages, 0);
                                    return (
                                        <View key={dept} style={styles.costRow}>
                                            <Text style={styles.costDept}>{dept}</Text>
                                            <Text style={styles.costAmount}>KES {deptWages.toLocaleString()}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    </View>
                );

            case 'departments':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.chartContainer}>
                            <Text style={styles.chartTitle}>Staff Distribution by Department</Text>
                            {departmentData.labels.length > 0 && (
                                <BarChart
                                    data={departmentData}
                                    width={screenWidth - 64}
                                    height={220}
                                    chartConfig={chartConfig}
                                    style={styles.chart}
                                    showValuesOnTopOfBars
                                />
                            )}
                        </View>
                        <View style={styles.departmentAnalysis}>
                            <Text style={styles.sectionTitle}>Department Analysis</Text>
                            {departments.filter(dept => employees.some(emp => emp.department === dept)).map(dept => {
                                const deptEmployees = employees.filter(emp => emp.department === dept);
                                const deptWages = deptEmployees.reduce((sum, emp) => sum + emp.totalWages, 0);
                                const avgDeptProductivity = deptEmployees.reduce((sum, emp) => sum + (emp.productivity || 0), 0) / deptEmployees.length;
                                return (
                                    <View key={dept} style={styles.departmentCard}>
                                        <Text style={styles.departmentName}>{dept}</Text>
                                        <View style={styles.departmentStats}>
                                            <View style={styles.statItem}>
                                                <Text style={styles.statValue}>{deptEmployees.length}</Text>
                                                <Text style={styles.statLabel}>Staff</Text>
                                            </View>
                                            <View style={styles.statItem}>
                                                <Text style={styles.statValue}>KES {deptWages.toLocaleString()}</Text>
                                                <Text style={styles.statLabel}>Monthly Cost</Text>
                                            </View>
                                            <View style={styles.statItem}>
                                                <Text style={styles.statValue}>{avgDeptProductivity.toFixed(1)}%</Text>
                                                <Text style={styles.statLabel}>Avg Productivity</Text>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                );

            case 'performance':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.chartContainer}>
                            <Text style={styles.chartTitle}>Productivity Trend</Text>
                            <LineChart
                                data={productivityTrendData}
                                width={screenWidth - 64}
                                height={220}
                                chartConfig={chartConfig}
                                style={styles.chart}
                                bezier
                            />
                        </View>
                        <View style={styles.performanceMetrics}>
                            <Text style={styles.sectionTitle}>Performance Metrics</Text>
                            <View style={styles.metricsGrid}>
                                <View style={styles.metricCard}>
                                    <Text style={styles.metricValue}>{avgProductivity.toFixed(1)}%</Text>
                                    <Text style={styles.metricLabel}>Overall Productivity</Text>
                                </View>
                                <View style={styles.metricCard}>
                                    <Text style={styles.metricValue}>94%</Text>
                                    <Text style={styles.metricLabel}>Attendance Rate</Text>
                                </View>
                                <View style={styles.metricCard}>
                                    <Text style={styles.metricValue}>24h</Text>
                                    <Text style={styles.metricLabel}>Avg Training Hours</Text>
                                </View>
                                <View style={styles.metricCard}>
                                    <Text style={styles.metricValue}>96%</Text>
                                    <Text style={styles.metricLabel}>Retention Rate</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.insightContainer}>
                            <Text style={styles.insightTitle}>Performance Insights:</Text>
                            <Text style={styles.insightText}>• Productivity has increased by 2.3% over the last quarter</Text>
                            <Text style={styles.insightText}>• Veterinary department shows highest productivity at 95%</Text>
                            <Text style={styles.insightText}>• Strong retention rate indicates good employee satisfaction</Text>
                            <Text style={styles.insightText}>• Consider expanding training programs for continued improvement</Text>
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
                        <Text style={styles.welcomeTitle}>Employee Analytics</Text>
                        <Text style={styles.welcomeSubtitle}>
                            Track workforce performance and{"\n"}analyze employee metrics
                        </Text>
                    </View>
                    <View style={styles.welcomeIconContainer}>
                        <Icon name="chart-line" size={60} color="rgba(255,255,255,0.8)" />
                    </View>
                </LinearGradient>

                <View style={styles.overviewSection}>
                    <Text style={styles.overviewTitle}>Workforce Analytics</Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.monthSelector} onPress={() => setShowPeriodModal(true)}>
                            <Text style={styles.monthText}>{selectedPeriod}</Text>
                            <Icon name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.manageButton}
                            onPress={() => navigation.navigate('FarmEmployeeTableScreen')}
                        >
                            <Icon name="account-group" size={20} color="#fff" />
                            <Text style={styles.manageButtonText}>Manage</Text>
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
                            onPress={() => navigation.navigate('FarmEmployeeTableScreen')}
                        >
                            <Icon name="account-group" size={24} color="#4C7153" />
                            <Text style={styles.quickActionText}>View All Employees</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickActionButton}>
                            <Icon name="file-excel" size={24} color="#4C7153" />
                            <Text style={styles.quickActionText}>Export Payroll</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickActionButton}>
                            <Icon name="chart-box-outline" size={24} color="#4C7153" />
                            <Text style={styles.quickActionText}>Generate Report</Text>
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
    payrollSummary: {
        marginBottom: 20,
    },
    payrollGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    payrollItem: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    payrollLabel: {
        fontSize: 11,
        color: '#666',
        marginBottom: 4,
        textAlign: 'center',
    },
    payrollValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4C7153',
        textAlign: 'center',
    },
    costBreakdown: {
        marginTop: 16,
    },
    costItem: {
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 8,
    },
    costLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    costRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    costDept: {
        fontSize: 12,
        color: '#666',
    },
    costAmount: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4C7153',
    },
    departmentAnalysis: {
        marginTop: 16,
    },
    departmentCard: {
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
    },
    departmentName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    departmentStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4C7153',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
    },
    performanceMetrics: {
        marginTop: 16,
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
    },
    metricCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    metricValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4C7153',
        marginBottom: 4,
    },
    metricLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    quickActionsSection: {
        paddingHorizontal: 16,
        marginBottom: 32,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        gap: 12,
        flexWrap: 'wrap',
    },
    quickActionButton: {
        flex: 1,
        minWidth: '30%',
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
        color: '#4C7153',
        fontWeight: '600',
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    periodModalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 24,
        paddingVertical: 20,
        maxHeight: '50%',
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
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    selectedPeriodOption: {
        backgroundColor: '#E8F4EA',
    },
    periodOptionText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    selectedPeriodOptionText: {
        color: '#4C7153',
        fontWeight: '600',
    },
});

export default EmployeesAnalyticsScreen;