import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { icons } from '../../constants';
import { COLORS } from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';
import { getLivestockById, getLivestockHealthEvents } from '../../services/livestock';

const HealthHistoryScreen = ({ route, navigation }) => {
    const { animalId, animalData } = route.params;

    const [healthHistory, setHealthHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('all');

    useEffect(() => {
        fetchHealthHistory();
    }, []);

    const fetchHealthHistory = async (isRefresh = false) => {
        try {
            if (!isRefresh) setLoading(true);

            const livestockId = animalData?.rawData?._id || animalData?.rawData?.id || animalId;

            const livestock = await getLivestockById(livestockId);
            const events = livestock?.healthEvent || [];

            const sortedEvents = [...events].sort((a, b) => new Date(b.date) - new Date(a.date));
            setHealthHistory(sortedEvents);
        } catch (error) {
            console.error('Error fetching health history:', error);
            Alert.alert('Error', 'Failed to fetch health history. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchHealthHistory(true);
        setRefreshing(false);
    };

    const getFilteredData = () => {
        if (selectedFilter === 'all') {
            return healthHistory;
        }
        return healthHistory.filter(event => event.eventType === selectedFilter);
    };

    const getEventTypeColor = (eventType) => {
        return eventType === 'vaccination' ? COLORS.green : COLORS.blue;
    };

    const getEventTypeIcon = (eventType) => {
        return eventType === 'vaccination' ? icons.health : icons.document;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const FilterButtons = () => {
        const filters = [
            { id: 'all', label: 'All Events' },
            { id: 'vaccination', label: 'Vaccinations' },
            { id: 'treatment', label: 'Treatments' },
        ];

        return (
            <View style={styles.filterContainer}>
                {filters.map((filter) => (
                    <TouchableOpacity
                        key={filter.id}
                        style={[
                            styles.filterButton,
                            selectedFilter === filter.id && styles.selectedFilterButton,
                        ]}
                        onPress={() => setSelectedFilter(filter.id)}>
                        <Text
                            style={[
                                styles.filterButtonText,
                                selectedFilter === filter.id && styles.selectedFilterButtonText,
                            ]}>
                            {filter.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const renderHealthEvent = ({ item }) => (
        <View style={styles.eventCard}>
            <View style={styles.eventHeader}>
                <View style={styles.eventTypeContainer}>
                    <View style={[
                        styles.eventTypeIndicator,
                        { backgroundColor: getEventTypeColor(item.eventType) }
                    ]}>
                        <FastImage
                            source={getEventTypeIcon(item.eventType)}
                            style={styles.eventTypeIcon}
                            tintColor={COLORS.white}
                        />
                    </View>
                    {/* <View style={styles.eventInfo}>
                        <Text style={styles.eventType}>
                            {item.eventType === 'vaccination' ? 'Vaccination' : 'Treatment'}
                        </Text>
                        <Text style={styles.eventDate}>{formatDate(item.date)}</Text>
                    </View> */}
                    <View style={styles.eventInfo}>
                        <Text style={styles.eventType}>
                            {item.eventType === 'vaccination' ? 'Vaccination' : 'Treatment'}
                        </Text>
                        <Text style={styles.eventDate}>{formatDate(item.date)}</Text>
                        {animalData?.title && (
                            <Text style={styles.animalTag}>
                                🐄 {animalData.title} ({animalData.id})
                            </Text>
                        )}
                    </View>

                </View>
                <View style={styles.eventCost}>
                    <Text style={styles.costText}>KES {item.cost?.toLocaleString() || '0'}</Text>
                </View>
            </View>

            <View style={styles.eventBody}>
                <Text style={styles.eventDescription}>{item.description}</Text>

                {item.performedBy && (
                    <View style={styles.eventDetail}>
                        <FastImage
                            source={icons.account}
                            style={styles.detailIcon}
                            tintColor={COLORS.gray}
                        />
                        <Text style={styles.detailText}>Performed by: {item.performedBy}</Text>
                    </View>
                )}

                {item.medications && item.medications.length > 0 && (
                    <View style={styles.eventDetail}>
                        <FastImage
                            source={icons.health}
                            style={styles.detailIcon}
                            tintColor={COLORS.gray}
                        />
                        <Text style={styles.detailText}>
                            Medications: {item.medications.join(', ')}
                        </Text>
                    </View>
                )}

                {item.dosage && (
                    <View style={styles.eventDetail}>
                        <FastImage
                            source={icons.document}
                            style={styles.detailIcon}
                            tintColor={COLORS.gray}
                        />
                        <Text style={styles.detailText}>Dosage: {item.dosage}</Text>
                    </View>
                )}

                {item.nextScheduled && (
                    <View style={styles.eventDetail}>
                        <FastImage
                            source={icons.calendar}
                            style={styles.detailIcon}
                            tintColor={COLORS.orange}
                        />
                        <Text style={styles.detailText}>
                            Next scheduled: {formatDate(item.nextScheduled)}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <FastImage
                source={icons.health}
                style={styles.emptyIcon}
                tintColor={COLORS.gray}
            />
            <Text style={styles.emptyTitle}>No Health Records</Text>
            <Text style={styles.emptyMessage}>
                No health events have been recorded for this animal yet.
            </Text>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('HealthEventForm', { animalId, animalData })}>
                <Text style={styles.addButtonText}>Add Health Record</Text>
            </TouchableOpacity>
        </View>
    );

    const renderLoadingState = () => (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.green} />
            <Text style={styles.loadingText}>Loading health history...</Text>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <SecondaryHeader
                    title="Health History"
                    subtitle={`${animalData?.title} (ID: ${animalData?.id})`}
                />
                {renderLoadingState()}
            </SafeAreaView>
        );
    }

    const filteredData = getFilteredData();

    return (
        <SafeAreaView style={styles.container}>
            <SecondaryHeader
                title="Health History"
                subtitle={`${animalData?.title} (ID: ${animalData?.id})`}
            />

            <View style={styles.content}>
                <FilterButtons />

                {filteredData.length === 0 ? (
                    renderEmptyState()
                ) : (
                    <FlatList
                        data={filteredData}
                        renderItem={renderHealthEvent}
                        keyExtractor={(item, index) => `${item.id || index}`}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[COLORS.green]}
                                tintColor={COLORS.green}
                            />
                        }
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('HealthEventForm', { animalId, animalData })}>
                <FastImage
                    source={icons.plus}
                    style={styles.fabIcon}
                    tintColor={COLORS.white}
                />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.lightGray,
    },
    content: {
        flex: 1,
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray2,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.lightGray2,
        marginRight: 8,
    },
    selectedFilterButton: {
        backgroundColor: COLORS.green,
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.darkGray3,
    },
    selectedFilterButtonText: {
        color: COLORS.white,
    },
    listContent: {
        padding: 16,
    },
    eventCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    eventHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    eventTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    eventTypeIndicator: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    eventTypeIcon: {
        width: 20,
        height: 20,
    },
    eventInfo: {
        flex: 1,
    },
    animalTag: {
        marginTop: 4,
        fontSize: 13,
        color: COLORS.gray,
        fontStyle: 'italic',
    },
    eventType: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.black,
    },
    eventDate: {
        fontSize: 14,
        color: COLORS.gray,
        marginTop: 2,
    },
    eventCost: {
        alignItems: 'flex-end',
    },
    costText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.green,
    },
    eventBody: {
        paddingTop: 8,
    },
    eventDescription: {
        fontSize: 15,
        color: COLORS.darkGray3,
        marginBottom: 12,
        lineHeight: 20,
    },
    eventDetail: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 6,
    },
    detailIcon: {
        width: 16,
        height: 16,
        marginRight: 8,
        marginTop: 2,
    },
    detailText: {
        fontSize: 14,
        color: COLORS.gray,
        flex: 1,
        lineHeight: 18,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    loadingText: {
        fontSize: 16,
        color: COLORS.gray,
        marginTop: 12,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    emptyIcon: {
        width: 64,
        height: 64,
        marginBottom: 16,
        opacity: 0.4,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.darkGray3,
        marginBottom: 4,
    },
    emptyMessage: {
        fontSize: 14,
        color: COLORS.gray,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    addButton: {
        backgroundColor: COLORS.green,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    },
    addButtonText: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: '600',
    },
    fab: {
        position: 'absolute',
        right: 24,
        bottom: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.green,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    fabIcon: {
        width: 24,
        height: 24,
    },
});

export default HealthHistoryScreen;
