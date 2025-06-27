import React, { useState, useEffect } from 'react';
import {
    SafeAreaView, View, Text, ScrollView, TextInput, TouchableOpacity,
    Alert, ActivityIndicator, Modal, RefreshControl, StyleSheet
} from 'react-native';
import SecondaryHeader from '../../../components/headers/secondary-header';
import { COLORS } from '../../../constants/theme';
import { icons } from '../../../constants';
import FastImage from 'react-native-fast-image';

import {
    getBreedingRecordById,
    registerOffspringAsLivestock,
} from '../../../services/breeding';

const ViewOffspringScreen = ({ navigation, route }) => {
    const { breedingRecord: initialRecord } = route.params;
    const breedingRecordId = initialRecord?.id;

    const [breedingRecord, setBreedingRecord] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [selectedOffspring, setSelectedOffspring] = useState(null);
    const [registering, setRegistering] = useState(false);

    // Modal states for dropdowns
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [showBreedModal, setShowBreedModal] = useState(false);
    const [showPhenotypeModal, setShowPhenotypeModal] = useState(false);

    const [livestockForm, setLivestockForm] = useState({
        type: '',
        breedType: '',
        phenotype: '',
        currentWeight: '',
    });
    const [errors, setErrors] = useState({});

    // Data for dropdowns
    const animalTypes = [
        { label: "Dairy Cattle", value: "dairyCattle" },
        { label: "Beef Cattle", value: "beefCattle" },
        { label: "Dairy Goats", value: "dairyGoats" },
        { label: "Meat Goats", value: "meatGoats" },
        { label: "Sheep", value: "sheep" },
        { label: "Rabbit", value: "rabbit" },
        { label: "Pig (Swine)", value: "swine" },
        { label: "Poultry", value: "poultry" },
    ];

    const breedsByType = {
        dairyCattle: ["Holstein", "Jersey", "Guernsey", "Ayrshire", "Brown Swiss"],
        beefCattle: ["Angus", "Hereford", "Simmental", "Charolais", "Brahman"],
        dairyGoats: ["Alpine", "Saanen", "Toggenburg", "LaMancha", "Nubian"],
        meatGoats: ["Boer", "Kiko", "Spanish", "Myotonic", "Savanna"],
        sheep: ["Merino", "Suffolk", "Dorper", "Romney", "Corriedale"],
        rabbit: ["New Zealand White", "Californian", "Flemish Giant", "Rex", "Angora"],
        swine: ["Duroc", "Yorkshire", "Hampshire", "Berkshire", "Landrace"],
        poultry: ["Broiler", "Layer", "Dual Purpose", "Indigenous", "Turkey", "Duck", "Quail"],
    };

    const phenotypesByCategory = {
        cattle: ["Black", "White", "Brown", "Spotted", "Red", "Mixed"],
        goats: ["White", "Black", "Brown", "Multi-colored", "Grey"],
        sheep: ["White", "Black", "Brown", "Spotted", "Grey"],
        rabbit: ["White", "Black", "Grey", "Brown", "Spotted"],
        swine: ["White", "Black", "Pink", "Spotted", "Red"],
        poultry: ["White", "Black", "Brown", "Multi-colored", "Grey"],
    };

    const fetchBreedingRecord = async () => {
        try {
            setLoading(true);
            const record = await getBreedingRecordById(breedingRecordId);
            setBreedingRecord(record);
        } catch (error) {
            Alert.alert('Error', 'Failed to load breeding record');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBreedingRecord();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchBreedingRecord();
        setRefreshing(false);
    };

    const inferPhenotype = (record) =>
        record?.damInfo?.phenotype || record?.sireInfo?.phenotype || 'Unknown';

    const getPhenotypeCategory = (animalType) => {
        if (animalType.includes('Cattle')) return 'cattle';
        if (animalType.includes('Goat')) return 'goats';
        if (animalType === 'sheep') return 'sheep';
        if (animalType === 'rabbit') return 'rabbit';
        if (animalType === 'swine') return 'swine';
        if (animalType === 'poultry') return 'poultry';
        return 'cattle'; // default
    };

    const handleRegister = (offspring) => {
        setSelectedOffspring(offspring);
        const defaultType = breedingRecord?.damInfo?.type || 'dairyCattle';
        setLivestockForm({
            type: defaultType,
            breedType: breedingRecord?.damInfo?.breedType || '',
            phenotype: inferPhenotype(breedingRecord),
            currentWeight: offspring?.birthWeight?.toString() || '',
        });
        setErrors({});
        setShowRegisterModal(true);
    };

    const handleChange = (field, value) => {
        setLivestockForm((prev) => {
            const newForm = { ...prev, [field]: value };

            // Reset dependent fields when type changes
            if (field === 'type') {
                newForm.breedType = '';
                newForm.phenotype = '';
            }

            return newForm;
        });

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!livestockForm.type.trim()) newErrors.type = 'Type is required';
        if (!livestockForm.breedType.trim()) newErrors.breedType = 'Breed is required';
        if (!livestockForm.phenotype.trim()) newErrors.phenotype = 'Phenotype is required';
        if (
            livestockForm.currentWeight &&
            (isNaN(parseFloat(livestockForm.currentWeight)) ||
                parseFloat(livestockForm.currentWeight) <= 0)
        ) {
            newErrors.currentWeight = 'Weight must be a valid number';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const submitRegistration = async () => {
        if (!validate()) {
            Alert.alert('Validation Error', 'Please correct the errors in the form');
            return;
        }

        setRegistering(true);
        try {
            const sire = breedingRecord?.sire?.mammal || {};
            const dam = breedingRecord?.dam?.mammal || {};

            const selectedTypeLabel = animalTypes.find(t => t.value === livestockForm.type)?.label || livestockForm.type;

            const payload = {
                type: selectedTypeLabel,
                breedType: livestockForm.breedType,
                phenotype: livestockForm.phenotype,
                currentWeight: parseFloat(livestockForm.currentWeight),
                mammal: {
                    dateOfBirth: breedingRecord?.birthDate || new Date().toISOString(),
                    gender: selectedOffspring?.sex,
                    birthWeight: selectedOffspring?.birthWeight || null,
                    sireId: sire?.idNumber || breedingRecord?.sireId,
                    sireCode: sire?.sireCode || '',
                    damId: dam?.idNumber || breedingRecord?.damId,
                    damCode: dam?.damCode || '',
                },
            };

            const { data, error } = await registerOffspringAsLivestock(
                breedingRecordId,
                selectedOffspring.id,
                payload
            );

            if (error) {
                Alert.alert('Error', error);
                return;
            }

            Alert.alert('Success', 'Offspring registered as livestock', [
                {
                    text: 'OK',
                    onPress: () => {
                        setShowRegisterModal(false);
                        fetchBreedingRecord();
                    },
                },
            ]);
        } catch (err) {
            Alert.alert('Error', 'Something went wrong');
        } finally {
            setRegistering(false);
        }
    };

    const renderDropdownModal = (visible, onClose, title, data, selectedValue, onSelect, keyField = 'value', labelField = 'label') => (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.dropdownModal}>
                    <View style={styles.dropdownHeader}>
                        <Text style={styles.dropdownTitle}>{title}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <FastImage source={icons.close} style={styles.closeIcon} tintColor={COLORS.gray} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.dropdownList}>
                        {data.map((item, index) => {
                            const value = typeof item === 'string' ? item : item[keyField];
                            const label = typeof item === 'string' ? item : item[labelField];
                            const isSelected = selectedValue === value;

                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.dropdownItem, isSelected && styles.selectedDropdownItem]}
                                    onPress={() => {
                                        onSelect(value);
                                        onClose();
                                    }}
                                >
                                    <Text style={[styles.dropdownItemText, isSelected && styles.selectedDropdownItemText]}>
                                        {label}
                                    </Text>
                                    {isSelected && (
                                        <FastImage source={icons.check} style={styles.checkIcon} tintColor={COLORS.green} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    const getAvailableBreeds = () => {
        return breedsByType[livestockForm.type] || [];
    };

    const getAvailablePhenotypes = () => {
        const category = getPhenotypeCategory(livestockForm.type);
        return phenotypesByCategory[category] || [];
    };

    const getDisplayValue = (value, dataArray, keyField = 'value', labelField = 'label') => {
        if (!value) return 'Select...';
        const item = dataArray.find(item =>
            typeof item === 'string' ? item === value : item[keyField] === value
        );
        return typeof item === 'string' ? item : (item ? item[labelField] : value);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.green} />
            </SafeAreaView>
        );
    }

    const offspring = breedingRecord?.offspring || [];

    return (
        <SafeAreaView style={styles.container}>
            <SecondaryHeader
                title="Offspring"
                showBackButton
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {offspring.length === 0 ? (
                    <View style={styles.emptyState}>
                        <FastImage source={icons.empty} style={styles.emptyIcon} tintColor={COLORS.gray} />
                        <Text style={styles.emptyTitle}>No Offspring Records</Text>
                        <Text style={styles.emptySubtitle}>
                            Offspring will appear here once birth is recorded for this breeding record.
                        </Text>
                    </View>
                ) : (
                    offspring.map((o, index) => (
                        <View key={index} style={styles.offspringCard}>
                            <View style={styles.cardHeader}>
                                <View style={styles.idContainer}>
                                    <Text style={styles.offspringId}>{o.offspringId}</Text>
                                    <View style={[styles.statusBadge, o.livestockId ? styles.registeredBadge : styles.unregisteredBadge]}>
                                        <Text style={[styles.statusText, o.livestockId ? styles.registeredText : styles.unregisteredText]}>
                                            {o.livestockId ? 'Registered' : 'Unregistered'}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.cardContent}>
                                <View style={styles.infoRow}>
                                    <View style={styles.infoItem}>
                                        <Text style={styles.infoLabel}>Sex</Text>
                                        <Text style={styles.infoValue}>{o.sex}</Text>
                                    </View>
                                    <View style={styles.infoItem}>
                                        <Text style={styles.infoLabel}>Birth Weight</Text>
                                        <Text style={styles.infoValue}>{o.birthWeight} kg</Text>
                                    </View>
                                </View>

                                {o.notes && (
                                    <View style={styles.notesContainer}>
                                        <Text style={styles.infoLabel}>Notes</Text>
                                        <Text style={styles.notesText}>{o.notes}</Text>
                                    </View>
                                )}
                            </View>

                            {!o.livestockId && (
                                <TouchableOpacity
                                    style={styles.registerButton}
                                    onPress={() => handleRegister(o)}
                                >
                                    <FastImage source={icons.plus} style={styles.buttonIcon} tintColor={COLORS.white} />
                                    <Text style={styles.registerButtonText}>Register as Livestock</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Registration Modal */}
            <Modal visible={showRegisterModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Register Offspring</Text>
                            <TouchableOpacity
                                onPress={() => setShowRegisterModal(false)}
                                style={styles.closeButton}
                            >
                                <FastImage source={icons.close} style={styles.closeIcon} tintColor={COLORS.gray} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSubtitle}>
                            ID: {selectedOffspring?.offspringId}
                        </Text>

                        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
                            {/* Type Selection */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.fieldLabel}>Animal Type *</Text>
                                <TouchableOpacity
                                    style={[styles.dropdownButton, errors.type && styles.inputError]}
                                    onPress={() => setShowTypeModal(true)}
                                >
                                    <Text style={[styles.dropdownButtonText, !livestockForm.type && styles.placeholderText]}>
                                        {getDisplayValue(livestockForm.type, animalTypes)}
                                    </Text>
                                    <FastImage source={icons.down} style={styles.dropdownIcon} tintColor={COLORS.gray} />
                                </TouchableOpacity>
                                {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
                            </View>

                            {/* Breed Selection */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.fieldLabel}>Breed Type *</Text>
                                <TouchableOpacity
                                    style={[
                                        styles.dropdownButton,
                                        errors.breedType && styles.inputError,
                                        !livestockForm.type && styles.disabledButton
                                    ]}
                                    onPress={() => livestockForm.type && setShowBreedModal(true)}
                                    disabled={!livestockForm.type}
                                >
                                    <Text style={[
                                        styles.dropdownButtonText,
                                        (!livestockForm.breedType || !livestockForm.type) && styles.placeholderText
                                    ]}>
                                        {livestockForm.type
                                            ? getDisplayValue(livestockForm.breedType, getAvailableBreeds())
                                            : 'Select animal type first'
                                        }
                                    </Text>
                                    <FastImage source={icons.down} style={styles.dropdownIcon} tintColor={COLORS.gray} />
                                </TouchableOpacity>
                                {errors.breedType && <Text style={styles.errorText}>{errors.breedType}</Text>}
                            </View>

                            {/* Phenotype Selection */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.fieldLabel}>Phenotype *</Text>
                                <TouchableOpacity
                                    style={[
                                        styles.dropdownButton,
                                        errors.phenotype && styles.inputError,
                                        !livestockForm.type && styles.disabledButton
                                    ]}
                                    onPress={() => livestockForm.type && setShowPhenotypeModal(true)}
                                    disabled={!livestockForm.type}
                                >
                                    <Text style={[
                                        styles.dropdownButtonText,
                                        (!livestockForm.phenotype || !livestockForm.type) && styles.placeholderText
                                    ]}>
                                        {livestockForm.type
                                            ? getDisplayValue(livestockForm.phenotype, getAvailablePhenotypes())
                                            : 'Select animal type first'
                                        }
                                    </Text>
                                    <FastImage source={icons.down} style={styles.dropdownIcon} tintColor={COLORS.gray} />
                                </TouchableOpacity>
                                {errors.phenotype && <Text style={styles.errorText}>{errors.phenotype}</Text>}
                            </View>

                            {/* Current Weight */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.fieldLabel}>Current Weight (kg)</Text>
                                <TextInput
                                    style={[styles.textInput, errors.currentWeight && styles.inputError]}
                                    value={livestockForm.currentWeight}
                                    onChangeText={(val) => handleChange('currentWeight', val)}
                                    placeholder="Enter current weight"
                                    placeholderTextColor={COLORS.gray}
                                    keyboardType="decimal-pad"
                                />
                                {errors.currentWeight && <Text style={styles.errorText}>{errors.currentWeight}</Text>}
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowRegisterModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.submitButton, registering && styles.disabledButton]}
                                onPress={submitRegistration}
                                disabled={registering}
                            >
                                {registering ? (
                                    <ActivityIndicator size="small" color={COLORS.white} />
                                ) : (
                                    <>
                                        <FastImage source={icons.check} style={styles.buttonIcon} tintColor={COLORS.white} />
                                        <Text style={styles.submitButtonText}>Register</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Dropdown Modals */}
            {renderDropdownModal(
                showTypeModal,
                () => setShowTypeModal(false),
                'Select Animal Type',
                animalTypes,
                livestockForm.type,
                (value) => handleChange('type', value)
            )}

            {renderDropdownModal(
                showBreedModal,
                () => setShowBreedModal(false),
                'Select Breed Type',
                getAvailableBreeds(),
                livestockForm.breedType,
                (value) => handleChange('breedType', value),
                null,
                null
            )}

            {renderDropdownModal(
                showPhenotypeModal,
                () => setShowPhenotypeModal(false),
                'Select Phenotype',
                getAvailablePhenotypes(),
                livestockForm.phenotype,
                (value) => handleChange('phenotype', value),
                null,
                null
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.lightGreen
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.lightGray1
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },

    // Empty State
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        width: 64,
        height: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.gray,
        textAlign: 'center',
        paddingHorizontal: 32,
    },

    // Offspring Cards
    offspringCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        overflow: 'hidden',
    },
    cardHeader: {
        padding: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray2,
    },
    idContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    offspringId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    registeredBadge: {
        backgroundColor: COLORS.lightGreen,
    },
    unregisteredBadge: {
        backgroundColor: COLORS.lightRed,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    registeredText: {
        color: COLORS.green,
    },
    unregisteredText: {
        color: COLORS.red,
    },
    cardContent: {
        padding: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    infoItem: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: COLORS.gray,
        fontWeight: '500',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        color: COLORS.black,
        fontWeight: '600',
    },
    notesContainer: {
        marginTop: 8,
    },
    notesText: {
        fontSize: 14,
        color: COLORS.black,
        lineHeight: 20,
    },
    registerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.green,
        paddingVertical: 12,
        paddingHorizontal: 16,
        margin: 16,
        marginTop: 0,
        borderRadius: 12,
    },
    buttonIcon: {
        width: 16,
        height: 16,
        marginRight: 8,
    },
    registerButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopRightRadius: 24,
        borderTopLeftRadius: 24,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray2,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.black,
        flex: 1,
    },
    closeButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: COLORS.lightGray2,
    },
    closeIcon: {
        width: 16,
        height: 16,
    },
    modalSubtitle: {
        fontSize: 14,
        color: COLORS.gray,
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    formContainer: {
        paddingHorizontal: 20,
        maxHeight: 400,
    },
    inputGroup: {
        marginBottom: 20,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.black,
        marginBottom: 8,
    },
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.gray3,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
    },
    disabledButton: {
        backgroundColor: COLORS.lightGray2,
        opacity: 0.6,
    },
    dropdownButtonText: {
        fontSize: 16,
        color: COLORS.black,
        flex: 1,
    },
    placeholderText: {
        color: COLORS.gray,
    },
    dropdownIcon: {
        width: 16,
        height: 16,
        marginLeft: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: COLORS.gray3,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: COLORS.black,
        backgroundColor: COLORS.white,
    },
    inputError: {
        borderColor: COLORS.red,
    },
    errorText: {
        fontSize: 12,
        color: COLORS.red,
        marginTop: 4,
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray2,
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: COLORS.lightGray2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.gray,
    },
    submitButton: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: COLORS.green,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.white,
    },

    dropdownModal: {
        backgroundColor: COLORS.white,
        borderTopRightRadius: 24,
        borderTopLeftRadius: 24,
        maxHeight: '70%',
    },
    dropdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray2,
    },
    dropdownTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
        flex: 1,
    },
    dropdownList: {
        maxHeight: 400,
    },
    dropdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray2,
    },
    selectedDropdownItem: {
        backgroundColor: COLORS.lightGreen,
    },
    dropdownItemText: {
        fontSize: 16,
        color: COLORS.black,
        flex: 1,
    },
    selectedDropdownItemText: {
        color: COLORS.green,
        fontWeight: '600',
    },
    checkIcon: {
        width: 16,
        height: 16,
    },
});

export default ViewOffspringScreen;