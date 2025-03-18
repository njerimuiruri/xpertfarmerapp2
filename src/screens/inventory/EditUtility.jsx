import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    Modal,
} from 'react-native';
import { Select, CheckIcon } from 'native-base';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import SecondaryHeader from '../../components/headers/secondary-header';
import { icons } from '../../constants';
import { COLORS } from '../../constants/theme';

const EditUtility = ({ route, navigation }) => {
    const { item } = route.params;

    const [formData, setFormData] = useState({
        title: item.title,
        date: item.date,
        currentLevel: item.currentLevel,
        capacity: item.capacity,
        source: item.source,
        usageRate: item.usageRate,
        rainwaterHarvested: item.rainwaterHarvested,
        waterQuality: item.waterQuality,
        irrigationCoverage: item.irrigationCoverage,
        carbonFootprint: item.carbonFootprint,
        solarCapacity: item.solarCapacity || '',
        batteryStorage: item.batteryStorage || '',
        generatorFuel: item.generatorFuel || '',
        dailyConsumption: item.dailyConsumption || '',
        backupDuration: item.backupDuration || '',
        carbonEmissions: item.carbonEmissions || '',
        efficiencyRating: item.efficiencyRating || '',
        organicWaste: item.organicWaste || '',
        recycling: item.recycling || '',
        compostProduction: item.compostProduction || '',
        methaneReduction: item.methaneReduction || '',
        wasteDiversion: item.wasteDiversion || '',
        soilEnrichment: item.soilEnrichment || '',
        processingEfficiency: item.processingEfficiency || '',
    });

    const utilityTypes = ['Water Supply', 'Power Supply', 'Waste Management'];


    const handleSave = () => {

        Alert.alert('Success', 'Utility details updated successfully', [
            { text: 'OK', onPress: () => navigation.goBack() },
        ]);

    };

    return (
        <View style={styles.container}>
            <SecondaryHeader title="Edit Utility Details" />
            <ScrollView contentContainerStyle={styles.scrollContainer}>


                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Utility Type*</Text>
                        <Select
                            selectedValue={formData.title}
                            minWidth="100%"
                            placeholder="Select utility type"
                            _selectedItem={{
                                bg: "rgba(117, 93, 88, 0.2)",
                                endIcon: <CheckIcon size="5" color="#755D58" />
                            }}
                            onValueChange={(value) => setFormData({ ...formData, title: value })}>
                            {utilityTypes.map((type) => (
                                <Select.Item key={type} label={type} value={type} />
                            ))}
                        </Select>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Last Updated Date*</Text>
                        <TextInput
                            style={styles.textInput}
                            value={formData.date}
                            backgroundColor={COLORS.lightGreen}

                            onChangeText={(text) => setFormData({ ...formData, date: text })}
                            placeholder="DD/MM/YYYY"
                        />
                    </View>

                    {formData.title === 'Water Supply' && (
                        <>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Current Level*</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.currentLevel}
                                    backgroundColor={COLORS.lightGreen}

                                    onChangeText={(text) => setFormData({ ...formData, currentLevel: text })}
                                    placeholder="Enter current level"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Full Capacity*</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.capacity}
                                    backgroundColor={COLORS.lightGreen}

                                    onChangeText={(text) => setFormData({ ...formData, capacity: text })}
                                    placeholder="Enter full capacity"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Source*</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.source}
                                    backgroundColor={COLORS.lightGreen}

                                    onChangeText={(text) => setFormData({ ...formData, source: text })}
                                    placeholder="Enter source"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Usage Rate*</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.usageRate}
                                    backgroundColor={COLORS.lightGreen}

                                    onChangeText={(text) => setFormData({ ...formData, usageRate: text })}
                                    placeholder="Enter usage rate"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Rainwater Harvested</Text>
                                <TextInput
                                    style={styles.textInput}
                                    backgroundColor={COLORS.lightGreen}

                                    value={formData.rainwaterHarvested}
                                    onChangeText={(text) => setFormData({ ...formData, rainwaterHarvested: text })}
                                    placeholder="Enter rainwater harvested"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Water Quality</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.waterQuality}
                                    backgroundColor={COLORS.lightGreen}

                                    onChangeText={(text) => setFormData({ ...formData, waterQuality: text })}
                                    placeholder="Enter water quality"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Irrigation Coverage</Text>
                                <TextInput
                                    style={styles.textInput}
                                    backgroundColor={COLORS.lightGreen}

                                    value={formData.irrigationCoverage}
                                    onChangeText={(text) => setFormData({ ...formData, irrigationCoverage: text })}
                                    placeholder="Enter irrigation coverage"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Carbon Footprint</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.carbonFootprint}
                                    onChangeText={(text) => setFormData({ ...formData, carbonFootprint: text })}
                                    placeholder="Enter carbon footprint"
                                />
                            </View>
                        </>
                    )}

                    {formData.title === 'Power Supply' && (
                        <>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Solar Capacity</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.solarCapacity}
                                    backgroundColor={COLORS.lightGreen}

                                    onChangeText={(text) => setFormData({ ...formData, solarCapacity: text })}
                                    placeholder="Enter solar capacity"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Battery Storage</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.batteryStorage}
                                    backgroundColor={COLORS.lightGreen}

                                    onChangeText={(text) => setFormData({ ...formData, batteryStorage: text })}
                                    placeholder="Enter battery storage"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Generator Fuel</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.generatorFuel}
                                    backgroundColor={COLORS.lightGreen}

                                    onChangeText={(text) => setFormData({ ...formData, generatorFuel: text })}
                                    placeholder="Enter generator fuel type"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Daily Consumption</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.dailyConsumption}
                                    backgroundColor={COLORS.lightGreen}

                                    onChangeText={(text) => setFormData({ ...formData, dailyConsumption: text })}
                                    placeholder="Enter daily consumption"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Backup Duration</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.backupDuration}
                                    backgroundColor={COLORS.lightGreen}

                                    onChangeText={(text) => setFormData({ ...formData, backupDuration: text })}
                                    placeholder="Enter backup duration"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Carbon Emissions</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.carbonEmissions}
                                    backgroundColor={COLORS.lightGreen}

                                    onChangeText={(text) => setFormData({ ...formData, carbonEmissions: text })}
                                    placeholder="Enter carbon emissions"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Efficiency Rating</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.efficiencyRating}
                                    backgroundColor={COLORS.lightGreen}

                                    onChangeText={(text) => setFormData({ ...formData, efficiencyRating: text })}
                                    placeholder="Enter efficiency rating"
                                />
                            </View>
                        </>
                    )}

                    {formData.title === 'Waste Management' && (
                        <>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Organic Waste</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.organicWaste}
                                    backgroundColor={COLORS.lightGreen}

                                    onChangeText={(text) => setFormData({ ...formData, organicWaste: text })}
                                    placeholder="Enter organic waste amount"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Recycling</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.recycling}
                                    backgroundColor={COLORS.lightGreen}

                                    onChangeText={(text) => setFormData({ ...formData, recycling: text })}
                                    placeholder="Enter recycling amount"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Compost Production</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.compostProduction}
                                    backgroundColor={COLORS.lightGreen}

                                    onChangeText={(text) => setFormData({ ...formData, compostProduction: text })}
                                    placeholder="Enter compost production amount"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Methane Reduction</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.methaneReduction}
                                    backgroundColor={COLORS.lightGreen}

                                    onChangeText={(text) => setFormData({ ...formData, methaneReduction: text })}
                                    placeholder="Enter methane reduction amount"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Waste Diversion</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.wasteDiversion}
                                    backgroundColor={COLORS.lightGreen}

                                    onChangeText={(text) => setFormData({ ...formData, wasteDiversion: text })}
                                    placeholder="Enter waste diversion percentage"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Soil Enrichment</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.soilEnrichment}
                                    backgroundColor={COLORS.lightGreen}

                                    onChangeText={(text) => setFormData({ ...formData, soilEnrichment: text })}
                                    placeholder="Enter soil enrichment level"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Processing Efficiency</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.processingEfficiency}
                                    backgroundColor={COLORS.lightGreen}

                                    onChangeText={(text) => setFormData({ ...formData, processingEfficiency: text })}
                                    placeholder="Enter processing efficiency"
                                />
                            </View>
                        </>
                    )}

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => navigation.goBack()}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        padding: 15,
    },

    formContainer: {
        padding: 15,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
    },
    inputGroup: {
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 14,
        color: COLORS.black,
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: COLORS.lightGray1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        color: COLORS.black,
        backgroundColor: COLORS.lightGray2,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    saveButton: {
        backgroundColor: COLORS.green3,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 1,
        marginRight: 10,
    },
    saveButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    cancelButton: {
        backgroundColor: COLORS.lightGray2,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 1,
    },
    cancelButtonText: {
        color: COLORS.black,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default EditUtility;