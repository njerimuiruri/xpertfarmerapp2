import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Modal,
    RefreshControl,
    Dimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { icons } from '../../../constants';
import { COLORS } from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';
import {
    getBreedingRecordById,
    registerOffspringAsLivestock
} from '../../../services/breeding';

const { width } = Dimensions.get('window');

const ViewOffspringScreen = ({ navigation, route }) => {
    const { breedingRecord: initialRecord } = route.params;
    const breedingRecordId = initialRecord?.id;

    const [breedingRecord, setBreedingRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedOffspring, setSelectedOffspring] = useState(null);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [registering, setRegistering] = useState(false);

    const [livestockForm, setLivestockForm] = useState({
        type: '',
        breedType: '',
        phenotype: '',
        currentWeight: '',
    });

    const [errors, setErrors] = useState({});

    const animalTypes = [
        'dairy cow',
        'beef cow',
        'bull',
        'heifer',
        'calf',
        'goat',
        'sheep',
        'pig',
        'chicken',
        'duck',
        'turkey',
    ];

    const commonBreeds = [
        'Friesian',
        'Holstein',
        'Jersey',
        'Guernsey',
        'Ayrshire',
        'Angus',
        'Hereford',
        'Simmental',
        'Charolais',
        'Brahman',
    ];

    useEffect(() => {
        fetchBreedingRecord();
    }, []);

    const fetchBreedingRecord = async () => {
        try {
            setLoading(true);
            const record = await getBreedingRecordById(breedingRecordId);
            setBreedingRecord(record);
        } catch (error) {
            console.error('Error fetching breeding record:', error);
            Alert.alert('Error', 'Failed to load breeding record details');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchBreedingRecord();
        setRefreshing(false);
    };

    const handleRegisterOffspring = (offspring) => {
        Alert.alert(
            'Registration Disabled',
            'Offspring registration feature is currently disabled.',
            [{ text: 'OK' }]
        );
        return;


    };

    const handleFormChange = (field, value) => {
        setLivestockForm(prev => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validateLivestockForm = () => {
        const newErrors = {};

        if (!livestockForm.type.trim()) {
            newErrors.type = 'Animal type is required';
        }

        if (!livestockForm.breedType.trim()) {
            newErrors.breedType = 'Breed type is required';
        }

        if (!livestockForm.phenotype.trim()) {
            newErrors.phenotype = 'Phenotype description is required';
        }

        if (livestockForm.currentWeight && isNaN(parseFloat(livestockForm.currentWeight))) {
            newErrors.currentWeight = 'Current weight must be a valid number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const submitLivestockRegistration = async () => {
        if (!validateLivestockForm()) {
            Alert.alert('Validation Error', 'Please correct the errors in the form');
            return;
        }

        setRegistering(true);

        try {
            const payload = {
                type: livestockForm.type,
                breedType: livestockForm.breedType,
                phenotype: livestockForm.phenotype,
                currentWeight: livestockForm.currentWeight ? parseFloat(livestockForm.currentWeight) : null,

                damId: breedingRecord.damId,
                damInfo: breedingRecord.damInfo,
                sireId: breedingRecord.sireId,
                sireInfo: breedingRecord.sireInfo,
                sireCode: breedingRecord.sireCode,
                serviceType: breedingRecord.serviceType,

                birthDate: breedingRecord.birthInfo?.birthDate || breedingRecord.birthDate,
                deliveryMethod: breedingRecord.birthInfo?.deliveryMethod || 'Natural Birth',
                litterWeight: breedingRecord.birthInfo?.litterWeight,
                birthWeight: selectedOffspring.birthWeight,

                breedingRecordId: breedingRecordId,
                breedingDate: breedingRecord.breedingDate,
                expectedDueDate: breedingRecord.expectedDueDate,

                offspringId: selectedOffspring.offspringId,
                sex: selectedOffspring.sex,
                notes: selectedOffspring.notes,
            };

            console.log('Enhanced offspring registration payload:', JSON.stringify(payload, null, 2));

            const { data, error } = await registerOffspringAsLivestock(
                breedingRecordId,
                selectedOffspring.offspringId,
                payload
            );

            if (error) {
                Alert.alert('Error', error);
                return;
            }

            Alert.alert(
                'Success',
                `${selectedOffspring.offspringId} has been successfully registered as livestock with complete parent and birth information!`,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            setShowRegisterModal(false);
                            fetchBreedingRecord();
                        },
                    },
                ]
            );

        } catch (error) {
            console.error('Error registering offspring:', error);
            Alert.alert('Error', 'Failed to register offspring as livestock. Please try again.');
        } finally {
            setRegistering(false);
        }
    };


    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const calculateAge = (birthDate) => {
        const today = new Date();
        const birth = new Date(birthDate);
        const diffTime = Math.abs(today - birth);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 30) {
            return `${diffDays} day${diffDays !== 1 ? 's' : ''} old`;
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `${months} month${months !== 1 ? 's' : ''} old`;
        } else {
            const years = Math.floor(diffDays / 365);
            return `${years} year${years !== 1 ? 's' : ''} old`;
        }
    };

    const renderOffspringCard = (offspring, index) => (
        <View key={index} style={styles.offspringCard}>
            <View style={styles.cardHeader}>
                <View style={styles.avatarContainer}>
                    <View style={[styles.avatar, { backgroundColor: offspring.sex === 'Male' ? '#4A90E2' : '#E91E63' }]}>
                        <Text style={styles.avatarText}>
                            {offspring.sex === 'Male' ? '♂' : '♀'}
                        </Text>
                    </View>
                </View>

                <View style={styles.offspringInfo}>
                    <View style={styles.detailsRow}>
                        <View style={styles.detailChip}>
                            <Text style={styles.detailChipText}>{offspring.sex}</Text>
                        </View>
                        {offspring.birthWeight && (
                            <View style={styles.detailChip}>
                                <Text style={styles.detailChipText}>{offspring.birthWeight} kg</Text>
                            </View>
                        )}
                    </View>
                    {breedingRecord?.birthDate && (
                        <Text style={styles.ageText}>
                            {calculateAge(breedingRecord.birthDate)}
                        </Text>
                    )}

                    <View style={styles.parentInfo}>
                        <Text style={styles.parentInfoTitle}>Lineage</Text>
                        <View style={styles.parentRow}>
                            <Text style={styles.parentLabel}>Dam Code:</Text>
                            <Text style={styles.parentValue}>
                                {breedingRecord?.damInfo?.damCode || breedingRecord?.damCode || breedingRecord?.damInfo?.idNumber || breedingRecord?.damId || 'Unknown'}
                            </Text>
                        </View>
                        <View style={styles.parentRow}>
                            <Text style={styles.parentLabel}>Sire Code:</Text>
                            <Text style={styles.parentValue}>
                                {breedingRecord?.serviceType === 'Artificial Insemination'
                                    ? (breedingRecord?.sireCode || 'AI Code')
                                    : (breedingRecord?.sireInfo?.sireCode || breedingRecord?.sireCode || breedingRecord?.sireInfo?.idNumber || breedingRecord?.sireId || 'Unknown')
                                }
                            </Text>
                        </View>
                        <View style={styles.parentRow}>
                            <Text style={styles.parentLabel}>Delivery:</Text>
                            <Text style={styles.parentValue}>
                                {breedingRecord?.birthInfo?.deliveryMethod || 'Natural Birth'}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.cardActions}>
                {offspring.isRegisteredAsLivestock ? (
                    <View style={styles.registeredContainer}>
                        <View style={styles.registeredBadge}>
                            <FastImage source={icons.check} style={styles.badgeIcon} tintColor={COLORS.white} />
                            <Text style={styles.registeredText}>Registered as Livestock</Text>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[styles.registerButton, styles.disabledButton]}
                        onPress={() => handleRegisterOffspring(offspring)}
                        activeOpacity={0.6}>
                        <View style={styles.buttonContent}>
                            <FastImage source={icons.plus} style={styles.buttonIcon} tintColor={COLORS.white} />
                            <Text style={styles.registerButtonText}>Register as Livestock (Disabled)</Text>
                        </View>
                    </TouchableOpacity>
                )}
            </View>

            {offspring.notes && (
                <View style={styles.notesSection}>
                    <Text style={styles.notesLabel}>Notes</Text>
                    <Text style={styles.notesText}>{offspring.notes}</Text>
                </View>
            )}
        </View>
    );

    const renderRegistrationModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={showRegisterModal}
            onRequestClose={() => setShowRegisterModal(false)}>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Register as Livestock</Text>
                        <TouchableOpacity
                            onPress={() => setShowRegisterModal(false)}
                            style={styles.closeButton}>
                            <FastImage source={icons.close} style={styles.closeIcon} tintColor={COLORS.gray} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                        <View style={styles.offspringModalHeader}>
                            <Text style={styles.offspringModalId}>
                                {selectedOffspring?.offspringId}
                            </Text>
                            <Text style={styles.offspringModalSubtitle}>
                                Complete the details below to register this offspring
                            </Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Animal Type *</Text>
                            <TextInput
                                style={[styles.input, errors.type && styles.inputError]}
                                value={livestockForm.type}
                                onChangeText={(value) => handleFormChange('type', value)}
                                placeholder="e.g., dairy cow, bull, heifer"
                                placeholderTextColor={COLORS.gray}
                            />
                            {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Breed Type *</Text>
                            <TextInput
                                style={[styles.input, errors.breedType && styles.inputError]}
                                value={livestockForm.breedType}
                                onChangeText={(value) => handleFormChange('breedType', value)}
                                placeholder="e.g., Friesian, Holstein"
                                placeholderTextColor={COLORS.gray}
                            />
                            {errors.breedType && <Text style={styles.errorText}>{errors.breedType}</Text>}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phenotype Description *</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, errors.phenotype && styles.inputError]}
                                value={livestockForm.phenotype}
                                onChangeText={(value) => handleFormChange('phenotype', value)}
                                placeholder="Describe physical characteristics, coat color, build, etc."
                                placeholderTextColor={COLORS.gray}
                                multiline
                                numberOfLines={3}
                            />
                            {errors.phenotype && <Text style={styles.errorText}>{errors.phenotype}</Text>}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Current Weight (kg)</Text>
                            <TextInput
                                style={[styles.input, errors.currentWeight && styles.inputError]}
                                value={livestockForm.currentWeight}
                                onChangeText={(value) => handleFormChange('currentWeight', value)}
                                placeholder="Current weight (optional)"
                                placeholderTextColor={COLORS.gray}
                                keyboardType="decimal-pad"
                            />
                            {errors.currentWeight && <Text style={styles.errorText}>{errors.currentWeight}</Text>}
                        </View>
                    </ScrollView>

                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setShowRegisterModal(false)}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.submitButton, registering && styles.submitButtonDisabled]}
                            onPress={submitLivestockRegistration}
                            disabled={registering}>
                            {registering ? (
                                <ActivityIndicator size="small" color={COLORS.white} />
                            ) : (
                                <>
                                    <FastImage source={icons.submited} style={styles.submitIcon} tintColor={COLORS.white} />
                                    <Text style={styles.submitButtonText}>Register</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <SecondaryHeader
                    title="Offspring Details"
                    showBackButton={true}
                    onBackPress={() => navigation.goBack()}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.green} />
                    <Text style={styles.loadingText}>Loading offspring details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!breedingRecord) {
        return (
            <SafeAreaView style={styles.container}>
                <SecondaryHeader
                    title="Offspring Details"
                    showBackButton={true}
                    onBackPress={() => navigation.goBack()}
                />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Failed to load breeding record</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchBreedingRecord}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const offspring = breedingRecord.offspring || [];
    const birthInfo = breedingRecord.birthInfo || {};

    return (

        <SafeAreaView style={styles.container}>
            <SecondaryHeader
                title="Offspring Details"
                showBackButton={true}
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}>


                <View style={styles.offspringSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Offspring</Text>
                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>{offspring.length}</Text>
                        </View>
                    </View>

                    {offspring.length > 0 ? (
                        <View style={styles.offspringGrid}>
                            {offspring.map((offspring, index) => renderOffspringCard(offspring, index))}
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconContainer}>
                                <FastImage source={icons.animals} style={styles.emptyIcon} tintColor={COLORS.gray} />
                            </View>
                            <Text style={styles.emptyTitle}>No Offspring Recorded</Text>
                            <Text style={styles.emptySubtitle}>
                                Offspring details will appear here once they are added to the breeding record.
                            </Text>
                        </View>
                    )}
                </View>

                {birthInfo.notes && (
                    <View style={styles.notesCard}>
                        <Text style={styles.cardTitle}>Birth Notes</Text>
                        <Text style={styles.notesContent}>{birthInfo.notes}</Text>
                    </View>
                )}

            </ScrollView>

            {renderRegistrationModal()}

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#64748B',
        fontWeight: '500',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#F8FAFC',
    },
    retryButton: {
        marginTop: 16,
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: '#10B981',
        borderRadius: 12,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    retryButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },

    // Hero Section
    heroSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
    },
    heroContent: {
        marginBottom: 20,
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 4,
    },
    heroSubtitle: {
        fontSize: 16,
        color: '#64748B',
        lineHeight: 24,
    },
    heroStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#10B981',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
        textAlign: 'center',
    },

    // Details Card
    detailsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 16,
    },
    detailsGrid: {
        gap: 12,
    },
    detailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        color: '#1E293B',
        fontWeight: '600',
        flex: 1,
        textAlign: 'right',
    },

    // Offspring Section
    offspringSection: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    countBadge: {
        backgroundColor: '#EFF6FF',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    countText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2563EB',
    },
    offspringGrid: {
        gap: 16,
    },

    // Offspring Card
    offspringCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        borderLeftWidth: 4,
        borderLeftColor: '#10B981',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    avatarContainer: {
        marginRight: 16,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    offspringInfo: {
        flex: 1,
    },
    offspringId: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 8,
    },
    detailsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 6,
    },
    detailChip: {
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    detailChipText: {
        fontSize: 12,
        color: '#475569',
        fontWeight: '500',
    },
    ageText: {
        fontSize: 12,
        color: '#2563EB',
        fontWeight: '600',
    },
    cardActions: {
        marginTop: 4,
    },
    registerButton: {
        backgroundColor: '#10B981',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    disabledButton: {
        backgroundColor: '#9CA3AF',
        shadowOpacity: 0.1,
        elevation: 2,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonIcon: {
        width: 16,
        height: 16,
        marginRight: 8,
    },
    registerButtonText: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    registeredContainer: {
        alignItems: 'flex-start',
    },
    registeredBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#DCFCE7',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    badgeIcon: {
        width: 14,
        height: 14,
        marginRight: 6,
    },
    registeredText: {
        fontSize: 12,
        color: '#166534',
        fontWeight: '600',
    },
    notesSection: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    notesLabel: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '600',
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    notesText: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
    },
    // Parent Info Section
    parentInfo: {
        marginTop: 12,
        padding: 12,
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    parentInfoTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    parentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    parentLabel: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
    parentValue: {
        fontSize: 12,
        color: '#1E293B',
        fontWeight: '600',
        flex: 1,
        textAlign: 'right',
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyIcon: {
        width: 36,
        height: 36,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
        textAlign: 'center',
        maxWidth: 280,
    },

    // Notes Card
    notesCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        borderLeftWidth: 4,
        borderLeftColor: '#3B82F6',
    },
    notesContent: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
    },

    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeIcon: {
        width: 16,
        height: 16,
    },
    modalForm: {
        flex: 1,
        paddingHorizontal: 20,
    },
    offspringModalHeader: {
        alignItems: 'center',
        paddingVertical: 20,
        marginBottom: 16,
    },
    offspringModalId: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 6,
    },
    offspringModalSubtitle: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 20,
    },

    // Form Inputs
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1F2937',
        backgroundColor: '#FFFFFF',
    },
    inputError: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
        fontWeight: '500',
    },

    // Modal Actions
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
    submitButton: {
        flex: 1,
        backgroundColor: '#10B981',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        backgroundColor: '#9CA3AF',
        shadowOpacity: 0.1,
        elevation: 2,
    },
    submitIcon: {
        width: 16,
        height: 16,
        marginRight: 8,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

export default ViewOffspringScreen;