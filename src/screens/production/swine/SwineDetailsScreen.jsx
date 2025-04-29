import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { icons } from '../../../constants';
import { COLORS } from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';

const SwineDetailsScreen = ({ route, navigation }) => {
    const { swineRecord } = route.params;
    const [activeTab, setActiveTab] = useState('overview');

    const totalSaleValue = swineRecord.salePrice;
    const estimatedCost = swineRecord.saleWeight * (swineRecord.marketPrice * 0.6);
    const profit = totalSaleValue - estimatedCost;
    const profitMargin = (profit / totalSaleValue * 100).toFixed(1);

    const handleEdit = () => {
        navigation.navigate('SwineRecordScreen', {
            editMode: true,
            swineRecord: swineRecord
        });
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Swine Record',
            'Are you sure you want to delete this swine record?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        // Handle delete logic here
                        navigation.navigate('SwineProductionListScreen');
                    },
                },
            ],
        );
    };

    const formatDate = (dateStr) => {
        return dateStr;
    };

    const renderOverviewTab = () => (
        <View style={styles.tabContent}>
            <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Basic Information</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Animal ID:</Text>
                    <Text style={styles.infoValue}>{swineRecord.animalId}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Litter Size:</Text>
                    <Text style={styles.infoValue}>{swineRecord.litterSize}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Birth Weight:</Text>
                    <Text style={styles.infoValue}>{swineRecord.birthWeight} kg</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Sale Weight:</Text>
                    <Text style={styles.infoValue}>{swineRecord.saleWeight} kg</Text>
                </View>
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Growth Information</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Weaning Date:</Text>
                    <Text style={styles.infoValue}>{formatDate(swineRecord.weaningDate)}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Weaning Weight:</Text>
                    <Text style={styles.infoValue}>{swineRecord.weaningWeight} kg</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Entry Weight:</Text>
                    <Text style={styles.infoValue}>{swineRecord.entryWeight} kg</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Finisher Phase:</Text>
                    <Text style={styles.infoValue}>{swineRecord.finisherPhaseWeight} kg</Text>
                </View>
            </View>
        </View>
    );

    const renderSalesTab = () => (
        <View style={styles.tabContent}>
            <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Sale Details</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Buyer:</Text>
                    <Text style={styles.infoValue}>{swineRecord.buyer}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Buyer Type:</Text>
                    <View style={styles.chipContainer}>
                        <View style={styles.chip}>
                            <Text style={styles.chipText}>{swineRecord.buyerType}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Sale Date:</Text>
                    <Text style={styles.infoValue}>{swineRecord.saleDate}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Sale Weight:</Text>
                    <Text style={styles.infoValue}>{swineRecord.saleWeight} kg</Text>
                </View>
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Financial Information</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Market Price/kg:</Text>
                    <Text style={styles.infoValue}>${swineRecord.marketPrice}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Total Sale Price:</Text>
                    <Text style={styles.infoValue}>${swineRecord.salePrice}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Estimated Cost:</Text>
                    <Text style={styles.infoValue}>${estimatedCost.toFixed(2)}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Profit:</Text>
                    <Text style={styles.infoValue}>${profit.toFixed(2)}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Profit Margin:</Text>
                    <Text style={styles.infoValue}>{profitMargin}%</Text>
                </View>
            </View>
        </View>
    );

    const renderGrowthTab = () => (
        <View style={styles.tabContent}>
            <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Farrowing Details</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Litter Size:</Text>
                    <Text style={styles.infoValue}>{swineRecord.litterSize}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Birth Weight:</Text>
                    <Text style={styles.infoValue}>{swineRecord.birthWeight} kg</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Record ID:</Text>
                    <Text style={styles.infoValue}>#{swineRecord.id}</Text>
                </View>
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Growth Timeline</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Weaning Date:</Text>
                    <Text style={styles.infoValue}>{formatDate(swineRecord.weaningDate)}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Weaning Weight:</Text>
                    <Text style={styles.infoValue}>{swineRecord.weaningWeight} kg</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Entry Weight:</Text>
                    <Text style={styles.infoValue}>{swineRecord.entryWeight} kg</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Finisher Phase:</Text>
                    <Text style={styles.infoValue}>{swineRecord.finisherPhaseWeight} kg</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Sale Weight:</Text>
                    <Text style={styles.infoValue}>{swineRecord.saleWeight} kg</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Total Weight Gain:</Text>
                    <Text style={styles.infoValue}>
                        {(swineRecord.saleWeight - swineRecord.birthWeight).toFixed(1)} kg
                    </Text>
                </View>
            </View>
        </View>
    );

    const calculateDaysBetween = (startDate, endDate) => {
        return "180";
    };

    const renderActionButtons = () => (
        <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
                style={styles.actionButton}
                onPress={handleEdit}
            >
                <FastImage
                    source={icons.edit}
                    style={styles.actionIcon}
                    tintColor={COLORS.white}
                />
                <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}
            >
                <FastImage
                    source={icons.remove}
                    style={styles.actionIcon}
                    tintColor={COLORS.white}
                />
                <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                translucent
                backgroundColor={COLORS.green2}
                barStyle="light-content"
            />
            <SecondaryHeader
                title="Swine Record Details"
                onBack={() => navigation.goBack()}
            />

            <View style={styles.feedInfoHeader}>
                <View style={styles.feedInfoContainer}>
                    <Text style={styles.animalTypeHeading}>{swineRecord.animalId}</Text>
                    <Text style={styles.feedNameHeading}>Litter Size: {swineRecord.litterSize}</Text>
                </View>
                <View style={styles.statusContainer}>
                    <View style={styles.nextFeedContainer}>
                        <Text style={styles.nextFeedLabel}>Sale Date:</Text>
                        <Text style={styles.nextFeedDate}>{swineRecord.saleDate}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'overview' && styles.activeTabButton]}
                    onPress={() => setActiveTab('overview')}>
                    <Text style={[styles.tabButtonText, activeTab === 'overview' && styles.activeTabButtonText]}>
                        Overview
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'sales' && styles.activeTabButton]}
                    onPress={() => setActiveTab('sales')}>
                    <Text style={[styles.tabButtonText, activeTab === 'sales' && styles.activeTabButtonText]}>
                        Sales Details
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'growth' && styles.activeTabButton]}
                    onPress={() => setActiveTab('growth')}>
                    <Text style={[styles.tabButtonText, activeTab === 'growth' && styles.activeTabButtonText]}>
                        Growth
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContainer}>
                {activeTab === 'overview' && renderOverviewTab()}
                {activeTab === 'sales' && renderSalesTab()}
                {activeTab === 'growth' && renderGrowthTab()}
            </ScrollView>

            {renderActionButtons()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    feedInfoHeader: {
        backgroundColor: COLORS.green2,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    feedInfoContainer: {
        flex: 1,
    },
    animalTypeHeading: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    feedNameHeading: {
        fontSize: 16,
        color: COLORS.white,
        opacity: 0.9,
        marginTop: 4,
    },
    statusContainer: {
        alignItems: 'flex-end',
    },
    feedTodayBadge: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    feedTodayText: {
        color: COLORS.green2,
        fontWeight: 'bold',
        fontSize: 14,
    },
    nextFeedContainer: {
        alignItems: 'flex-end',
    },
    nextFeedLabel: {
        color: COLORS.white,
        fontSize: 12,
    },
    nextFeedDate: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray3,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
    },
    activeTabButton: {
        borderBottomWidth: 3,
        borderBottomColor: COLORS.green2,
    },
    tabButtonText: {
        fontSize: 14,
        color: COLORS.dark,
    },
    activeTabButtonText: {
        color: COLORS.green2,
        fontWeight: 'bold',
    },
    scrollContainer: {
        flex: 1,
    },
    tabContent: {
        padding: 16,
    },
    infoCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: COLORS.green2,
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'flex-start',
    },
    infoLabel: {
        width: '35%',
        fontSize: 14,
        color: COLORS.dark,
        fontWeight: '500',
    },
    infoValue: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },
    chipContainer: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    chip: {
        backgroundColor: '#e0f2f1',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    chipText: {
        fontSize: 12,
        color: COLORS.green2,
    },
    actionButtonsContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',

    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.green,
        paddingVertical: 12,
        borderRadius: 8,
        marginRight: 8,
    },
    deleteButton: {
        backgroundColor: '#FF6B6B',
        marginRight: 0,
        marginLeft: 8,
    },
    actionIcon: {
        width: 18,
        height: 18,
        marginRight: 8,
    },
    actionButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 14,
    },
});
export default SwineDetailsScreen;