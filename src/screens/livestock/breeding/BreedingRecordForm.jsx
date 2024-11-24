import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Button, Checkbox, Divider, Input, Radio } from 'native-base';
import SecondaryHeader from '../../../components/headers/secondary-header';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'react-native';
import { icons } from '../../../constants';
import { COLORS } from '../../../constants/theme';

export default function BreedingRecordForm() {
    const [purposeOfBreeding, setPurposeOfBreeding] = useState([]);
    const [breedingStrategy, setBreedingStrategy] = useState('');
    const [servicing, setServicing] = useState('');
    const [showFirstHeatPicker, setShowFirstHeatPicker] = useState(false);
    const [showServiceDatePicker, setShowServiceDatePicker] = useState(false);
    const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
    const [firstHeatDate, setFirstHeatDate] = useState('');
    const [serviceDate, setServiceDate] = useState('');
    const [numberOfServices, setNumberOfServices] = useState('');
    const [gestationPeriod, setGestationPeriod] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState('');
    const [numberOfYoungOnes, setNumberOfYoungOnes] = useState('');
    const [birthWeight, setBirthWeight] = useState('');
    const [gender, setGender] = useState('');
    const [offspringID, setOffspringID] = useState('');
    const [firstHeatDateObj, setFirstHeatDateObj] = useState(new Date());
    const [serviceDateObj, setServiceDateObj] = useState(new Date());
    const [birthDateObj, setBirthDateObj] = useState(new Date());

    const handleSubmit = () => {
        // Submit data logic here
        const formData = {
            purposeOfBreeding,
            breedingStrategy,
            servicing,
            firstHeatDate,
            serviceDate,
            numberOfServices,
            gestationPeriod,
            birthDate,
            deliveryMethod,
            numberOfYoungOnes,
            birthWeight,
            gender,
            offspringID,
        };
        console.log(formData);
    };
    const handleCheckboxChange = (value) => {
        setPurposeOfBreeding((prev) =>
            prev.includes(value)
                ? prev.filter((item) => item !== value)
                : [...prev, value]
        );
    };

    const onFirstHeatChange = (event, selectedDate) => {
        setShowFirstHeatPicker(false);
        if (selectedDate) {
            setFirstHeatDateObj(selectedDate);
            setFirstHeatDate(selectedDate.toLocaleDateString());
        }
    };

    const onServiceDateChange = (event, selectedDate) => {
        setShowServiceDatePicker(false);
        if (selectedDate) {
            setServiceDateObj(selectedDate);
            setServiceDate(selectedDate.toLocaleDateString());
        }
    };

    const onBirthDateChange = (event, selectedDate) => {
        setShowBirthDatePicker(false);
        if (selectedDate) {
            setBirthDateObj(selectedDate);
            setBirthDate(selectedDate.toLocaleDateString());
        }
    };

    return (
        <View className="flex-1 bg-white">
            <SecondaryHeader title="Add Breeding Record" />
            <ScrollView contentContainerStyle={styles.container}>
                <View>
                    <Text className='text-[18px] font-semibold text-black text-center pb-2'>Breeding Purpose & Strategy</Text>
                    <Divider orientation='horizontal' />

                    <View className=' flex flex-row justify-between'>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Purpose of Breeding</Text>

                            <Checkbox.Group value={purposeOfBreeding}
                            >
                                <Checkbox
                                    value="Improve Milk"
                                    isChecked={purposeOfBreeding.includes("Improve Milk")}
                                    onPress={() => handleCheckboxChange("Improve Milk")}
                                    size="sm"
                                >
                                    Improve Milk
                                </Checkbox>

                                <Checkbox
                                    value="Stocking Number"
                                    isChecked={purposeOfBreeding.includes("Stocking Number")}
                                    onPress={() => handleCheckboxChange("Stocking Number")}
                                    size="sm"
                                >
                                    Stocking Number
                                </Checkbox>

                                <Checkbox
                                    value="Immunity"
                                    isChecked={purposeOfBreeding.includes("Immunity")}
                                    onPress={() => handleCheckboxChange("Immunity")}
                                    size="sm"

                                >
                                    Immunity
                                </Checkbox>
                            </Checkbox.Group>
                        </View>
                        <Divider orientation='vertical' />

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Breeding Strategy</Text>
                            <Radio.Group
                                name="breedingStrategy"
                                accessibilityLabel="breeding strategy"
                                value={breedingStrategy}
                                onChange={setBreedingStrategy}
                            >
                                <Radio value="Cross Breeding" my={1} size="sm">Cross Breeding</Radio>
                                <Radio value="Within Breeds" my={1} size="sm">Within Breeds</Radio>
                                <Radio value="Between Breeds" my={1} size="sm">Between Breeds</Radio>
                            </Radio.Group>
                        </View>
                    </View>
                </View>
                <Divider orientation='horizontal' />

                <View style={styles.section} className='mt-2'>
                    <Text style={styles.sectionTitle}>Servicing</Text>
                    <Radio.Group
                        name="servicing"
                        accessibilityLabel="servicing method"
                        value={servicing}
                        onChange={setServicing}
                        className='flex flex-row space-x-1'
                    >
                        <Radio value="Natural Mating" my={1} size="sm">Natural Mating</Radio>
                        <Radio value="Artificial Mating" my={1} size="sm">Artificial Mating</Radio>
                    </Radio.Group>
                </View>

                <View style={styles.formGroup} >
                    <Text style={styles.label}>First Heat Date</Text>
                    <View className="flex flex-row items-center gap-x-2 mx-0">
                        <Input
                            w="85%"
                            value={firstHeatDate}
                            placeholder="DD/MM/YY"
                            isReadOnly
                        />
                        <TouchableOpacity onPress={() => setShowFirstHeatPicker(true)}>
                            <Image
                                source={icons.calendar}
                                resizeMode="contain"
                                className="w-[40px] h-[40px]"
                                tintColor={COLORS.green2}
                            />
                        </TouchableOpacity>
                    </View>
                    {showFirstHeatPicker && (
                        <DateTimePicker
                            value={firstHeatDateObj}
                            mode="date"
                            onChange={onFirstHeatChange}
                        />
                    )}
                </View>

                <View style={styles.formGroup} >
                    <Text style={styles.label}>Service Date</Text>
                    <View className="flex flex-row items-center gap-x-2 mx-0">
                        <Input
                            w="85%"
                            value={serviceDate}
                            placeholder="DD/MM/YY"
                            isReadOnly
                        />
                        <TouchableOpacity onPress={() => setShowServiceDatePicker(true)}>
                            <Image
                                source={icons.calendar}
                                resizeMode="contain"
                                className="w-[40px] h-[40px]"
                                tintColor={COLORS.green2}
                            />
                        </TouchableOpacity>
                    </View>
                    {showServiceDatePicker && (
                        <DateTimePicker
                            value={serviceDateObj}
                            mode="date"
                            onChange={onServiceDateChange}
                        />
                    )}
                </View>


                <View style={styles.formGroup} >
                    <Text style={styles.label}>Parturition (Birth) Date</Text>
                    <View className="flex flex-row items-center gap-x-2 mx-0">
                        <Input
                            w="85%"
                            value={birthDate}
                            placeholder="DD/MM/YY"
                            isReadOnly
                        />
                        <TouchableOpacity onPress={() => setShowBirthDatePicker(true)}>
                            <Image
                                source={icons.calendar}
                                resizeMode="contain"
                                className="w-[40px] h-[40px]"
                                tintColor={COLORS.green2}
                            />
                        </TouchableOpacity>
                    </View>
                    {showBirthDatePicker && (
                        <DateTimePicker
                            value={birthDateObj}
                            mode="date"
                            onChange={onBirthDateChange}
                        />
                    )}
                </View>


                <View style={styles.formGroup}>
                    <Text style={styles.label}>Number of Services</Text>
                    <Input
                        style={styles.input}
                        placeholder="Enter number"
                        keyboardType="numeric"
                        value={numberOfServices}
                        onChangeText={setNumberOfServices}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Gestation Period (days)</Text>
                    <Input
                        style={styles.input}
                        placeholder="Enter period"
                        keyboardType="numeric"
                        value={gestationPeriod}
                        onChangeText={setGestationPeriod}
                        backgroundColor="#e8f5e9"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Method of Delivery</Text>
                    <Radio.Group
                        name="deliveryMethod"
                        accessibilityLabel="delivery method"
                        value={deliveryMethod}
                        onChange={setDeliveryMethod}
                    >
                        <Radio value="Natural Birth" my={1}>Natural Birth</Radio>
                        <Radio value="Assisted" my={1}>Assisted</Radio>
                        <Radio value="Cesarean" my={1}>Cesarean</Radio>
                    </Radio.Group>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Number of Young Ones</Text>
                    <Input
                        style={styles.input}
                        placeholder="Enter number"
                        keyboardType="numeric"
                        value={numberOfYoungOnes}
                        onChangeText={setNumberOfYoungOnes}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Weight at Birth (kg)</Text>
                    <Input
                        style={styles.input}
                        placeholder="Enter weight"
                        keyboardType="numeric"
                        value={birthWeight}
                        onChangeText={setBirthWeight}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Gender</Text>
                    <Radio.Group
                        name="gender"
                        accessibilityLabel="gender"
                        value={gender}
                        onChange={setGender}
                        className='flex flex-row space-x-4'
                    >
                        <Radio value="Male" my={1}>Male</Radio>
                        <Radio value="Female" my={1}>Female</Radio>
                    </Radio.Group>
                </View>

                <Button className="bg-emerald-600 border-0 py-3">
                    <Text className="font-semibold text-white">Submit</Text>
                </Button>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#F8F9FA',
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4A90E2',
        marginBottom: 16,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#333',
        marginBottom: 4,
    },
    input: {
        borderRadius: 8,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 8,
    },
    cancelButton: {
        backgroundColor: '#E0E0E0',
    },
    submitButton: {
        backgroundColor: '#4A90E2',
    },
    buttonText: {
        color: '#FFF',
        fontWeight: '600',
    },
});
