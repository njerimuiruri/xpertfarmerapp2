import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import { icons } from '../../../constants';
import { COLORS } from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';
import {
    getAllergyById,
    deleteAllergy
} from '../../../services/healthservice';
import { getLivestockForActiveFarm } from '../../../services/livestock';

const AllergyDetailScreen = ({ navigation, route }) => {
    const { recordId, recordData } = route.params;

    const [allergyRecord, setAllergyRecord] = useState(recordData || null);
    const [livestock, setLivestock] = useState([]);
    const [isLoading, setIsLoading] = useState(!recordData);
    const [refreshing, setRefreshing] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            if (!recordData) {
                setIsLoading(true);
            }

            await Promise.all([
                loadAllergyRecord(),
                loadLivestock()
            ]);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadAllergyRecord = async () => {
        if (recordData) {
            setAllergyRecord(recordData);
            return;
        }

        try {
            const result = await getAllergyById(recordId);

            if (result.error) {
                Alert.alert('Error', result.error);
                navigation.goBack();
                return;
            }

            setAllergyRecord(result.data);
        } catch (error) {
            console.error('Failed to load allergy record:', error);
            Alert.alert('Error', 'Failed to load allergy record details.');
            navigation.goBack();
        }
    };

    const loadLivestock = async () => {
        try {
            const result = await getLivestockForActiveFarm();
            if (Array.isArray(result)) {
                setLivestock(result);
            } else {
                setLivestock([]);
            }
        } catch (error) {
            console.error('Failed to load livestock:', error);
            setLivestock([]);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const getAnimalInfo = (livestockId) => {
        return livestock.find(animal => animal.id === livestockId);
    };

    const formatAnimalDisplayName = (animal) => {
        if (!animal) return 'Unknown Animal';

        if (animal.category === 'poultry' && animal.poultry) {
            return `${animal.type.toUpperCase()} - Flock ID: ${animal.poultry.flockId || 'N/A'}`;
        } else if (animal.category === 'mammal' && animal.mammal) {
            return `${animal.type.toUpperCase()} - ID: ${animal.mammal.idNumber || 'N/A'}`;
        }
        return `${animal.type.toUpperCase()} - ID: ${animal.id}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatWeight = (weight) => {
        return weight ? `${weight} kg` : 'N/A';
    };

    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return 'Unknown';

        const birth = new Date(dateOfBirth);
        const now = new Date();
        const diffTime = Math.abs(now - birth);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 30) {
            return `${diffDays} days`;
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `${months} month${months > 1 ? 's' : ''}`;
        } else {
            const years = Math.floor(diffDays / 365);
            const remainingMonths = Math.floor((diffDays % 365) / 30);
            return `${years} year${years > 1 ? 's' : ''}${remainingMonths > 0 ? ` ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`;
        }
    };

    const handleEdit = () => {
        navigation.navigate('EditAllergyRecord', {
            recordId: recordId,
            recordData: allergyRecord
        });
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Allergy Record',
            'Are you sure you want to delete this allergy record? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: confirmDelete
                }
            ]
        );
    };

    const confirmDelete = async () => {
        try {
            setDeleting(true);
            const result = await deleteAllergy(recordId);

            if (result.error) {
                Alert.alert('Error', result.error);
                return;
            }

            Alert.alert(
                'Success',
                'Allergy record deleted successfully',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        } catch (error) {
            console.error('Delete error:', error);
            Alert.alert('Error', 'Failed to delete allergy record');
        } finally {
            setDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <SecondaryHeader
                    title="Allergy Details"
                    onBackPress={() => navigation.goBack()}
                    showNotification={true}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.success || '#10B981'} />
                    <Text style={styles.loadingText}>Loading allergy details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!allergyRecord) {
        return (
            <SafeAreaView style={styles.container}>
                <SecondaryHeader
                    title="Allergy Details"
                    onBackPress={() => navigation.goBack()}
                    showNotification={true}
                />
                <View style={styles.errorContainer}>
                    <FastImage
                        source={icons.warning || icons.alert}
                        style={styles.errorIcon}
                        tintColor="#EF4444"
                    />
                    <Text style={styles.errorTitle}>Record Not Found</Text>
                    <Text style={styles.errorSubtitle}>
                        The allergy record could not be loaded.
                    </Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => navigation.goBack()}>
                        <Text style={styles.retryButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const animal = getAnimalInfo(allergyRecord.livestockId);

    return (
        <SafeAreaView style={styles.container}>
            <SecondaryHeader
                title="Allergy Details"
                onBackPress={() => navigation.goBack()}
                showNotification={true}
            />

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.success || '#10B981']}
                        tintColor={COLORS.success || '#10B981'}
                    />
                }
                showsVerticalScrollIndicator={false}>

                {/* Header Card */}
                <View style={styles.headerCard}>
                    <LinearGradient
                        colors={['#F59E0B', '#D97706']}
                        style={styles.headerGradient}>
                        <View style={styles.headerContent}>
                            <View style={styles.allergyIconContainer}>
                                <FastImage
                                    source={icons.warning || icons.alert}
                                    style={styles.allergyIcon}
                                    tintColor="#FFFFFF"
                                />
                            </View>
                            <View style={styles.headerInfo}>
                                <Text style={styles.headerTitle}>{allergyRecord.cause}</Text>
                                <Text style={styles.headerSubtitle}>Allergy Record</Text>
                                <View style={styles.statusBadge}>
                                    <View style={styles.statusDot} />
                                    <Text style={styles.statusText}>Recorded</Text>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                {/* Animal Information Card */}
                {animal && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <FastImage
                                source={icons.livestock || icons.account}
                                style={styles.cardIcon}
                                tintColor={COLORS.success || '#10B981'}
                            />
                            <Text style={styles.cardTitle}>Animal Information</Text>
                        </View>

                        <View style={styles.animalCard}>
                            <LinearGradient
                                colors={['#F0FDF4', '#ECFDF5']}
                                style={styles.animalCardGradient}>
                                <View style={styles.animalCardHeader}>
                                    <View style={styles.animalIconContainer}>
                                        <LinearGradient
                                            colors={[COLORS.success || '#10B981', '#059669']}
                                            style={styles.animalIcon}>
                                            <FastImage
                                                source={icons.livestock || icons.account}
                                                style={styles.animalIconImage}
                                                tintColor="#FFFFFF"
                                            />
                                        </LinearGradient>
                                    </View>
                                    <View style={styles.animalHeaderInfo}>
                                        <Text style={styles.animalName}>{formatAnimalDisplayName(animal)}</Text>
                                        <Text style={styles.animalCategory}>
                                            {animal.category === 'poultry' && animal.poultry?.breedType ||
                                                animal.category === 'mammal' && animal.mammal?.breedType ||
                                                'Unknown breed'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.animalDetailsGrid}>
                                    <View style={styles.detailGridRow}>
                                        <View style={styles.detailGridItem}>
                                            <Text style={styles.detailGridLabel}>Category</Text>
                                            <Text style={styles.detailGridValue}>{animal.category?.toUpperCase()}</Text>
                                        </View>
                                        <View style={styles.detailGridItem}>
                                            <Text style={styles.detailGridLabel}>Type</Text>
                                            <Text style={styles.detailGridValue}>{animal.type?.toUpperCase()}</Text>
                                        </View>
                                    </View>

                                    {animal.dateOfBirth && (
                                        <View style={styles.detailGridRow}>
                                            <View style={styles.detailGridItem}>
                                                <Text style={styles.detailGridLabel}>Age</Text>
                                                <Text style={styles.detailGridValue}>{calculateAge(animal.dateOfBirth)}</Text>
                                            </View>
                                            <View style={styles.detailGridItem}>
                                                <Text style={styles.detailGridLabel}>Weight</Text>
                                                <Text style={styles.detailGridValue}>
                                                    {animal.category === 'mammal' ? formatWeight(animal.mammal?.weight) : 'N/A'}
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            </LinearGradient>
                        </View>
                    </View>
                )}

                {/* Allergy Details Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <FastImage
                            source={icons.warning || icons.alert}
                            style={styles.cardIcon}
                            tintColor="#F59E0B"
                        />
                        <Text style={styles.cardTitle}>Allergy Details</Text>
                    </View>

                    <View style={styles.detailCard}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailKey}>Cause of Allergy</Text>
                            <Text style={styles.detailText}>{allergyRecord.cause}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailKey}>Remedy/Treatment</Text>
                            <Text style={styles.detailText}>{allergyRecord.remedy}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailKey}>Date Recorded</Text>
                            <Text style={styles.detailText}>{formatDate(allergyRecord.dateRecorded)}</Text>
                        </View>

                        {allergyRecord.animalIdOrFlockId && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailKey}>Animal/Flock ID</Text>
                                <Text style={styles.detailText}>{allergyRecord.animalIdOrFlockId}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Treatment Information Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <FastImage
                            source={icons.medical || icons.health}
                            style={styles.cardIcon}
                            tintColor={COLORS.success || '#10B981'}
                        />
                        <Text style={styles.cardTitle}>Treatment Information</Text>
                    </View>

                    <View style={styles.treatmentCard}>
                        <LinearGradient
                            colors={['#FEF3C7', '#FEF3C7']}
                            style={styles.treatmentCardGradient}>
                            <View style={styles.treatmentHeader}>
                                <View style={styles.treatmentIconContainer}>
                                    <LinearGradient
                                        colors={['#F59E0B', '#D97706']}
                                        style={styles.treatmentIcon}>
                                        <FastImage
                                            source={icons.medical || icons.health}
                                            style={styles.treatmentIconImage}
                                            tintColor="#FFFFFF"
                                        />
                                    </LinearGradient>
                                </View>
                                <View style={styles.treatmentInfo}>
                                    <Text style={styles.treatmentTitle}>Remedy Applied</Text>
                                    <Text style={styles.treatmentDescription}>{allergyRecord.remedy}</Text>
                                </View>
                            </View>

                            <View style={styles.treatmentNote}>
                                <Text style={styles.treatmentNoteText}>
                                    Monitor the animal closely and consult a veterinarian if symptoms persist or worsen.
                                </Text>
                            </View>
                        </LinearGradient>
                    </View>
                </View>

            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={handleEdit}
                    activeOpacity={0.8}>
                    <LinearGradient
                        colors={[COLORS.success || '#10B981', '#059669']}
                        style={styles.editGradient}>
                        <FastImage source={icons.edit} style={styles.modalActionIcon} tintColor="#FFFFFF" />
                        <Text style={styles.editButtonText}>Edit Record</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={handleDelete}
                    disabled={deleting}
                    activeOpacity={0.8}>
                    <View style={styles.deleteButtonContainer}>
                        {deleting ? (
                            <ActivityIndicator size="small" color="#EF4444" />
                        ) : (
                            <FastImage source={icons.trash} style={styles.modalActionIcon} tintColor="#EF4444" />
                        )}
                        <Text style={styles.deleteButtonText}>
                            {deleting ? 'Deleting...' : 'Delete Record'}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
        fontFamily: 'Inter-Medium',
    },

    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    errorIcon: {
        width: 64,
        height: 64,
        marginBottom: 16,
    },
    errorTitle: {
        fontSize: 20,
        fontFamily: 'Inter-SemiBold',
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    errorSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        fontFamily: 'Inter-Regular',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    retryButton: {
        backgroundColor: COLORS.success || '#10B981',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'Inter-SemiBold',
    },

    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },

    headerCard: {
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    headerGradient: {
        padding: 20,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    allergyIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    allergyIcon: {
        width: 30,
        height: 30,
    },
    headerInfo: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 22,
        fontFamily: 'Inter-Bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FFFFFF',
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'Inter-Medium',
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    cardIcon: {
        width: 20,
        height: 20,
        marginRight: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontFamily: 'Inter-SemiBold',
        color: '#1F2937',
    },

    animalCard: {
        margin: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    animalCardGradient: {
        padding: 16,
    },
    animalCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    animalIconContainer: {
        marginRight: 12,
    },
    animalIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    animalIconImage: {
        width: 24,
        height: 24,
    },
    animalHeaderInfo: {
        flex: 1,
    },
    animalName: {
        fontSize: 16,
        fontFamily: 'Inter-SemiBold',
        color: '#1F2937',
        marginBottom: 4,
    },
    animalCategory: {
        fontSize: 14,
        color: '#6B7280',
        fontFamily: 'Inter-Regular',
    },

    animalDetailsGrid: {
        gap: 12,
    },
    detailGridRow: {
        flexDirection: 'row',
        gap: 16,
    },
    detailGridItem: {
        flex: 1,
    },
    detailGridLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        fontFamily: 'Inter-Medium',
        marginBottom: 4,
    },
    detailGridValue: {
        fontSize: 14,
        color: '#1F2937',
        fontFamily: 'Inter-SemiBold',
    },

    detailCard: {
        padding: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    detailKey: {
        fontSize: 14,
        color: '#6B7280',
        fontFamily: 'Inter-Medium',
        flex: 1,
    },
    detailText: {
        fontSize: 14,
        color: '#1F2937',
        fontFamily: 'Inter-Regular',
        flex: 1,
        textAlign: 'right',
    },

    treatmentCard: {
        margin: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    treatmentCardGradient: {
        padding: 16,
    },
    treatmentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    treatmentIconContainer: {
        marginRight: 12,
    },
    treatmentIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    treatmentIconImage: {
        width: 24,
        height: 24,
    },
    treatmentInfo: {
        flex: 1,
    },
    treatmentTitle: {
        fontSize: 16,
        fontFamily: 'Inter-SemiBold',
        color: '#92400E',
        marginBottom: 4,
    },
    treatmentDescription: {
        fontSize: 14,
        color: '#78350F',
        fontFamily: 'Inter-Regular',
    },
    treatmentNote: {
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#F59E0B',
    },
    treatmentNoteText: {
        fontSize: 12,
        color: '#92400E',
        fontFamily: 'Inter-Medium',
        fontStyle: 'italic',
    },

    actionContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    actionButton: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    editButton: {
        marginRight: 8,
    },
    editGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    editButtonText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontFamily: 'Inter-SemiBold',
        marginLeft: 8,
    },
    deleteButton: {
        marginLeft: 8,
        borderWidth: 1,
        borderColor: '#FECACA',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
    },
    deleteButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    deleteButtonText: {
        fontSize: 16,
        color: '#EF4444',
        fontFamily: 'Inter-SemiBold',
        marginLeft: 8,
    },
    modalActionIcon: {
        width: 18,
        height: 18,
    },
});

export default AllergyDetailScreen;