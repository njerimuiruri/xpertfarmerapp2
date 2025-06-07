import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import FastImage from 'react-native-fast-image';
import { icons } from '../../../constants';
import { COLORS } from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';
import { getLivestockForActiveFarm } from '../../../services/livestock';
import { createBreedingRecord } from '../../../services/breeding';

const BreedingRecordForm = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [livestockLoading, setLivestockLoading] = useState(true);
  const [femaleAnimals, setFemaleAnimals] = useState([]);
  const [maleAnimals, setMaleAnimals] = useState([]);
  const [selectedDam, setSelectedDam] = useState(null);
  const [selectedSire, setSelectedSire] = useState(null);
  const [selectedAISire, setSelectedAISire] = useState(null);
  const [damSearchQuery, setDamSearchQuery] = useState('');
  const [sireSearchQuery, setSireSearchQuery] = useState('');
  const [aiSireSearchQuery, setAiSireSearchQuery] = useState('');
  const [showDamDropdown, setShowDamDropdown] = useState(false);
  const [showSireDropdown, setShowSireDropdown] = useState(false);
  const [showAISireDropdown, setShowAISireDropdown] = useState(false);

  const [purpose, setPurpose] = useState('Improve Milk Production');
  const [strategy, setStrategy] = useState('Cross Breeding');
  const [serviceType, setServiceType] = useState('Natural Mating');
  const [serviceDate, setServiceDate] = useState(new Date());
  const [showServiceDatePicker, setShowServiceDatePicker] = useState(false);
  const [numServices, setNumServices] = useState('1');
  const [firstHeatDate, setFirstHeatDate] = useState(new Date());
  const [showFirstHeatDatePicker, setShowFirstHeatDatePicker] = useState(false);

  const [sireCode, setSireCode] = useState('');
  const [aiType, setAiType] = useState('Regular AI');
  const [aiSource, setAiSource] = useState('Local');
  const [aiCost, setAiCost] = useState('');

  const [gestationDays, setGestationDays] = useState('');
  const [expectedBirthDate, setExpectedBirthDate] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownOptions, setDropdownOptions] = useState([]);

  const purposeOptions = [
    'Improve Milk Production',
    'Stocking Number',
    'Immunity',
    'Meat Production',
    'Breeding Stock',
  ];

  const strategyOptions = [
    'Cross Breeding',
    'Breeding Within Breeds',
    'Breeding Between Breeds',
    'Line Breeding',
    'Outcrossing',
  ];

  const serviceTypeOptions = ['Natural Mating', 'Artificial Insemination'];
  const aiTypeOptions = ['Sex Cell Semen', 'Regular AI'];
  const aiSourceOptions = ['Local', 'Imported'];

  const getAnimalSpecies = (animal) => {
    if (!animal || !animal.type) return null;

    const animalType = animal.type.toLowerCase().trim();

    if (animalType.includes('cattle') || animalType.includes('cow') || animalType.includes('bull')) {
      return 'cattle';
    } else if (animalType.includes('goat')) {
      return 'goat';
    } else if (animalType.includes('sheep')) {
      return 'sheep';
    } else if (animalType.includes('pig') || animalType.includes('swine')) {
      return 'pig';
    } else if (animalType.includes('chicken') || animalType.includes('poultry')) {
      return 'poultry';
    }

    return animalType;
  };

  const areAnimalsCompatible = (animal1, animal2) => {
    if (!animal1 || !animal2) return false;

    const species1 = getAnimalSpecies(animal1);
    const species2 = getAnimalSpecies(animal2);

    return species1 === species2;
  };

  const getCompatibleMaleAnimals = () => {
    if (!selectedDam) return maleAnimals;

    return maleAnimals.filter(male => areAnimalsCompatible(selectedDam, male));
  };

  useEffect(() => {
    fetchLivestock();
  }, []);

  useEffect(() => {
    if (serviceType === 'Natural Mating') {
      setSelectedAISire(null);
      setSireCode('');
    } else if (serviceType === 'Artificial Insemination') {
      setSelectedSire(null);
    }
  }, [serviceType]);

  useEffect(() => {
    if (selectedAISire) {
      const animalData = selectedAISire?.mammal || selectedAISire?.poultry;
      const idNumber = animalData?.idNumber || '';
      setSireCode(idNumber);
    }
  }, [selectedAISire]);

  useEffect(() => {
    if (selectedDam) {
      if (selectedSire && !areAnimalsCompatible(selectedDam, selectedSire)) {
        setSelectedSire(null);
        Alert.alert(
          'Sire Reset',
          'The previously selected sire is not compatible with the new dam species. Please select a compatible sire.'
        );
      }

      if (selectedAISire && !areAnimalsCompatible(selectedDam, selectedAISire)) {
        setSelectedAISire(null);
        setSireCode('');
        Alert.alert(
          'AI Sire Reset',
          'The previously selected AI sire is not compatible with the new dam species. Please select a compatible sire.'
        );
      }
    }
  }, [selectedDam]);

  const fetchLivestock = async () => {
    try {
      setLivestockLoading(true);
      const { data: livestock, error } = await getLivestockForActiveFarm();

      if (error) {
        Alert.alert('Error', error);
        return;
      }

      if (!livestock || !Array.isArray(livestock)) {
        Alert.alert('Error', 'No livestock data available');
        return;
      }

      console.log('=== LIVESTOCK DEBUG INFO ===');
      console.log('Total livestock fetched:', livestock.length);

      console.log('Sample livestock data:', livestock.slice(0, 3).map(animal => ({
        id: animal.id,
        type: animal.type,
        species: getAnimalSpecies(animal),
        mammal: animal.mammal,
        poultry: animal.poultry,
        mammalGender: animal?.mammal?.gender,
        poultryGender: animal?.poultry?.gender
      })));

      const females = livestock.filter(animal => {
        const mammalGender = animal?.mammal?.gender;
        const poultryGender = animal?.poultry?.gender;
        const gender = mammalGender || poultryGender;

        if (!gender) {
          console.log(`⚠️ Animal ${animal.id} has no gender data`);
          return false;
        }

        const normalizedGender = gender.toString().toLowerCase().trim();
        const isFemale = normalizedGender === 'female';

        if (isFemale) {
          console.log(` Female found: ${animal.id} - ${animal.type} (${getAnimalSpecies(animal)}) (gender: "${gender}")`);
        } else {
          console.log(` Not female: ${animal.id} - gender: "${gender}" (normalized: "${normalizedGender}")`);
        }

        return isFemale;
      });

      const males = livestock.filter(animal => {
        const mammalGender = animal?.mammal?.gender;
        const poultryGender = animal?.poultry?.gender;
        const gender = mammalGender || poultryGender;

        if (!gender) {
          console.log(` Animal ${animal.id} has no gender data`);
          return false;
        }

        const normalizedGender = gender.toString().toLowerCase().trim();
        const isMale = normalizedGender === 'male';

        if (isMale) {
          console.log(` Male found: ${animal.id} - ${animal.type} (${getAnimalSpecies(animal)}) (gender: "${gender}")`);
        } else {
          console.log(` Not male: ${animal.id} - gender: "${gender}" (normalized: "${normalizedGender}")`);
        }

        return isMale;
      });

      setFemaleAnimals(females);
      setMaleAnimals(males);

      console.log('=== FILTERING RESULTS ===');
      console.log('Females found:', females.length);
      console.log('Males found:', males.length);
      console.log('Species breakdown:', {
        females: females.reduce((acc, animal) => {
          const species = getAnimalSpecies(animal);
          acc[species] = (acc[species] || 0) + 1;
          return acc;
        }, {}),
        males: males.reduce((acc, animal) => {
          const species = getAnimalSpecies(animal);
          acc[species] = (acc[species] || 0) + 1;
          return acc;
        }, {})
      });

    } catch (error) {
      console.error('Error fetching livestock:', error);
      Alert.alert('Error', 'Failed to fetch livestock data');
    } finally {
      setLivestockLoading(false);
    }
  };

  const getFilteredAnimals = (animals, searchQuery) => {
    if (!searchQuery.trim()) return animals;

    const query = searchQuery.toLowerCase().trim();

    return animals.filter(animal => {
      const animalData = animal?.mammal || animal?.poultry;
      const idNumber = (animalData?.idNumber || '').toLowerCase();
      const breedType = (animalData?.breedType || '').toLowerCase();
      const type = (animal?.type || '').toLowerCase();
      const gender = (animalData?.gender || '').toLowerCase();

      return (
        idNumber.includes(query) ||
        breedType.includes(query) ||
        type.includes(query) ||
        gender.includes(query)
      );
    });
  };

  const filteredDams = getFilteredAnimals(femaleAnimals, damSearchQuery);
  const compatibleMales = getCompatibleMaleAnimals();
  const filteredSires = getFilteredAnimals(compatibleMales, sireSearchQuery);
  const filteredAISires = getFilteredAnimals(compatibleMales, aiSireSearchQuery);

  useEffect(() => {
    if (!selectedDam) return;

    let days = '280';
    const damSpecies = getAnimalSpecies(selectedDam);

    if (damSpecies === 'goat') days = '150';
    else if (damSpecies === 'pig') days = '114';
    else if (damSpecies === 'sheep') days = '152';
    else if (damSpecies === 'poultry') days = '21';

    setGestationDays(days);

    if (serviceDate) {
      const birthDate = new Date(serviceDate);
      birthDate.setDate(birthDate.getDate() + parseInt(days));
      setExpectedBirthDate(birthDate.toISOString().split('T')[0]);
    }
  }, [selectedDam, serviceDate]);

  const showDropdown = type => {
    switch (type) {
      case 'purpose':
        setDropdownOptions(purposeOptions);
        break;
      case 'strategy':
        setDropdownOptions(strategyOptions);
        break;
      case 'serviceType':
        setDropdownOptions(serviceTypeOptions);
        break;
      case 'aiType':
        setDropdownOptions(aiTypeOptions);
        break;
      case 'aiSource':
        setDropdownOptions(aiSourceOptions);
        break;
      default:
        setDropdownOptions([]);
    }
    setActiveDropdown(type);
    setDropdownVisible(true);
  };

  const handleSelect = value => {
    switch (activeDropdown) {
      case 'purpose':
        setPurpose(value);
        break;
      case 'strategy':
        setStrategy(value);
        break;
      case 'serviceType':
        setServiceType(value);
        break;
      case 'aiType':
        setAiType(value);
        break;
      case 'aiSource':
        setAiSource(value);
        break;
    }
    setDropdownVisible(false);
  };

  const handleServiceDateChange = (event, selectedDate) => {
    setShowServiceDatePicker(false);
    if (selectedDate) setServiceDate(selectedDate);
  };

  const handleFirstHeatDateChange = (event, selectedDate) => {
    setShowFirstHeatDatePicker(false);
    if (selectedDate) setFirstHeatDate(selectedDate);
  };

  const validateAnimalGender = (animal, expectedGender) => {
    const mammalGender = animal?.mammal?.gender;
    const poultryGender = animal?.poultry?.gender;
    const actualGender = mammalGender || poultryGender;

    console.log(`Validating ${expectedGender}: actualGender = "${actualGender}"`);

    if (!actualGender) {
      return {
        isValid: false,
        message: 'Gender information is missing',
        actualGender: null
      };
    }

    const normalizedActual = actualGender.toString().toLowerCase().trim();
    const normalizedExpected = expectedGender.toLowerCase().trim();

    const isValid = normalizedActual === normalizedExpected;

    return {
      isValid,
      message: isValid ? 'Valid' : `Expected exactly "${expectedGender}", got "${actualGender}"`,
      actualGender: actualGender
    };
  };

  const validateSpeciesCompatibility = (dam, sire) => {
    if (!dam || !sire) return { isValid: true, message: '' };

    const damSpecies = getAnimalSpecies(dam);
    const sireSpecies = getAnimalSpecies(sire);

    console.log(`Species compatibility check: Dam=${damSpecies}, Sire=${sireSpecies}`);

    if (damSpecies !== sireSpecies) {
      return {
        isValid: false,
        message: `Cross-species breeding is not possible. Dam is ${damSpecies} but sire is ${sireSpecies}. Please select animals of the same species.`
      };
    }

    return { isValid: true, message: 'Species compatible' };
  };

  const handleSubmit = async () => {
    if (!selectedDam) {
      Alert.alert('Validation Error', 'Please select a dam (female animal)');
      return;
    }

    if (serviceType === 'Natural Mating' && !selectedSire) {
      Alert.alert('Validation Error', 'Please select a sire (male animal) for natural mating');
      return;
    }

    if (serviceType === 'Artificial Insemination') {
      if (!selectedAISire && !sireCode.trim()) {
        Alert.alert('Validation Error', 'Please select a sire or enter sire code for artificial insemination');
        return;
      }
    }

    // Validate gender
    const damValidation = validateAnimalGender(selectedDam, 'female');
    if (!damValidation.isValid) {
      Alert.alert('Validation Error', `Dam validation failed: ${damValidation.message}`);
      console.error(' Dam validation failed:', damValidation);
      return;
    }

    // Validate species compatibility
    let sireToValidate = null;
    if (serviceType === 'Natural Mating' && selectedSire) {
      sireToValidate = selectedSire;
    } else if (serviceType === 'Artificial Insemination' && selectedAISire) {
      sireToValidate = selectedAISire;
    }

    if (sireToValidate) {
      const sireValidation = validateAnimalGender(sireToValidate, 'male');
      if (!sireValidation.isValid) {
        Alert.alert('Validation Error', `Sire validation failed: ${sireValidation.message}`);
        console.error(' Sire validation failed:', sireValidation);
        return;
      }

      // Check species compatibility
      const speciesValidation = validateSpeciesCompatibility(selectedDam, sireToValidate);
      if (!speciesValidation.isValid) {
        Alert.alert('Species Mismatch', speciesValidation.message);
        console.error(' Species validation failed:', speciesValidation);
        return;
      }
    }

    try {
      setLoading(true);

      const payload = {
        damId: selectedDam.id,
        sireId: serviceType === 'Natural Mating' ? selectedSire?.id || null : selectedAISire?.id || null,
        purpose,
        strategy,
        serviceType,
        serviceDate: serviceDate.toISOString(),
        numServices: parseInt(numServices) || 1,
        firstHeatDate: firstHeatDate.toISOString(),
        gestationDays: parseInt(gestationDays),
        expectedBirthDate: new Date(expectedBirthDate).toISOString(),
      };

      if (serviceType === 'Artificial Insemination') {
        payload.sireCode = sireCode;
        payload.aiType = aiType;
        payload.aiSource = aiSource;
        payload.aiCost = parseFloat(aiCost) || 0;
      }

      console.log('✅ Breeding Record Payload (validated):', JSON.stringify(payload, null, 2));

      const { data, error } = await createBreedingRecord(payload);

      if (error) {
        console.log(' Error received:', error);
        Alert.alert('Error', error);
        return;
      }

      console.log('Breeding record created successfully:', data);
      setModalVisible(true);

    } catch (error) {
      console.error(' Error creating breeding record:', error);
      Alert.alert('Error', 'Failed to create breeding record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const CustomDropdown = ({ label, value, onPress, icon }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.dropdownButton} onPress={onPress}>
        <View style={styles.dropdownContent}>
          {icon && <FastImage source={icon} style={styles.inputIcon} tintColor={COLORS.green} />}
          <Text style={styles.dropdownButtonText}>{value}</Text>
        </View>
        <FastImage
          source={icons.downArrow}
          style={styles.dropdownIcon}
          tintColor={COLORS.green}
        />
      </TouchableOpacity>
    </View>
  );

  const CustomDatePicker = ({ label, value, onPress, showPicker, onChange, icon }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.dateInput} onPress={onPress}>
        <View style={styles.dropdownContent}>
          {icon && <FastImage source={icon} style={styles.inputIcon} tintColor={COLORS.green} />}
          <Text style={styles.dateText}>{value.toISOString().split('T')[0]}</Text>
        </View>
        <FastImage
          source={icons.calendar}
          style={styles.dateIcon}
          tintColor={COLORS.green}
        />
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={value}
          mode="date"
          display="default"
          onChange={onChange}
        />
      )}
    </View>
  );

  const AnimalDropdown = ({ label, selectedAnimal, onPress, required = false, count = 0, icon, isFiltered = false, originalCount = 0 }) => (
    <View style={styles.inputGroup}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <View style={styles.countContainer}>
          <Text style={styles.countBadge}>
            {count} {isFiltered ? 'compatible' : 'available'}
          </Text>
          {isFiltered && originalCount > count && (
            <Text style={styles.filteredBadge}>
              ({originalCount - count} filtered out)
            </Text>
          )}
        </View>
      </View>
      <TouchableOpacity style={styles.dropdownButton} onPress={onPress}>
        <View style={styles.dropdownContent}>
          {icon && <FastImage source={icon} style={styles.inputIcon} tintColor={COLORS.green} />}
          <Text style={[styles.dropdownButtonText, !selectedAnimal && styles.placeholderText]}>
            {selectedAnimal
              ? `${selectedAnimal?.mammal?.idNumber || selectedAnimal?.poultry?.idNumber} - ${selectedAnimal.type}`
              : `Select ${label}`
            }
          </Text>
        </View>
        <FastImage
          source={icons.downArrow}
          style={styles.dropdownIcon}
          tintColor={COLORS.green}
        />
      </TouchableOpacity>
      {selectedDam && isFiltered && (
        <Text style={styles.compatibilityNote}>
          Only showing {getAnimalSpecies(selectedDam)} animals compatible with selected dam
        </Text>
      )}
    </View>
  );

  const SectionCard = ({ title, children, icon }) => (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        {icon && <FastImage source={icon} style={styles.sectionIcon} tintColor={COLORS.green} />}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );

  const renderAnimalItem = ({ item, onSelect, onClose, setSearchQuery }) => {
    const animalData = item?.mammal || item?.poultry;
    const idNumber = animalData?.idNumber || 'No ID';
    const breedType = animalData?.breedType || 'Unknown Breed';
    const gender = animalData?.gender || 'Unknown';
    const type = item?.type || 'Unknown Type';
    const species = getAnimalSpecies(item);

    return (
      <TouchableOpacity
        style={styles.animalItem}
        onPress={() => {
          onSelect(item);
          onClose();
          setSearchQuery('');
        }}
      >
        <View style={styles.animalItemHeader}>
          <Text style={styles.animalId}>{idNumber}</Text>
          <View style={styles.badgeContainer}>
            <View style={styles.genderBadge}>
              <Text style={styles.genderText}>{gender}</Text>
            </View>
            <View style={styles.speciesBadge}>
              <Text style={styles.speciesText}>{species}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.animalDetails}>
          {type} - {breedType}
        </Text>
      </TouchableOpacity>
    );
  };

  if (livestockLoading) {
    return (
      <View style={styles.container}>
        <SecondaryHeader title="Add Breeding Record" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.green} />
          <Text style={styles.loadingText}>Loading livestock data...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SecondaryHeader title="Add Breeding Record" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: selectedDam ? '50%' : '25%' }]} />
          </View>
          <Text style={styles.progressText}>
            {selectedDam ? (serviceType === 'Natural Mating' ? (selectedSire ? 'Almost Done' : 'Select Sire') : 'Complete Details') : 'Select Dam'}
          </Text>
        </View>

        <SectionCard title="Select Animals" icon={icons.pets || icons.user}>
          <AnimalDropdown
            label="Dam (Female)"
            selectedAnimal={selectedDam}
            onPress={() => setShowDamDropdown(true)}
            required={true}
            count={femaleAnimals.length}
            icon={icons.female || icons.user}
          />

          {selectedDam && (
            <View style={styles.selectedAnimalCard}>
              <View style={styles.selectedAnimalHeader}>
                <FastImage source={icons.checkCircle} style={styles.checkIcon} tintColor={COLORS.green} />
                <Text style={styles.selectedAnimalTitle}>Selected Dam</Text>
              </View>
              <Text style={styles.selectedAnimalText}>
                ID: {selectedDam?.mammal?.idNumber || selectedDam?.poultry?.idNumber}
              </Text>
              <Text style={styles.selectedAnimalSubtext}>
                {selectedDam.type} ({getAnimalSpecies(selectedDam)}) - {selectedDam?.mammal?.breedType || selectedDam?.poultry?.breedType}
              </Text>
            </View>
          )}

          {serviceType === 'Natural Mating' && (
            <>
              <AnimalDropdown
                label="Sire (Male)"
                selectedAnimal={selectedSire}
                onPress={() => setShowSireDropdown(true)}
                required={true}
                count={compatibleMales.length}
                originalCount={maleAnimals.length}
                isFiltered={selectedDam && compatibleMales.length < maleAnimals.length}
                icon={icons.male || icons.user}
              />

              {selectedSire && (
                <View style={styles.selectedAnimalCard}>
                  <View style={styles.selectedAnimalHeader}>
                    <FastImage source={icons.checkCircle} style={styles.checkIcon} tintColor={COLORS.green} />
                    <Text style={styles.selectedAnimalTitle}>Selected Sire</Text>
                  </View>
                  <Text style={styles.selectedAnimalText}>
                    ID: {selectedSire?.mammal?.idNumber || selectedSire?.poultry?.idNumber}
                  </Text>
                  <Text style={styles.selectedAnimalSubtext}>
                    {selectedSire.type} ({getAnimalSpecies(selectedSire)}) - {selectedSire?.mammal?.breedType || selectedSire?.poultry?.breedType}
                  </Text>
                </View>
              )}
            </>
          )}
        </SectionCard>

        <SectionCard title="Breeding Strategy" icon={icons.target || icons.settings}>
          <CustomDropdown
            label="Purpose"
            value={purpose}
            onPress={() => showDropdown('purpose')}
            icon={icons.flag || icons.star}
          />

          <CustomDropdown
            label="Strategy"
            value={strategy}
            onPress={() => showDropdown('strategy')}
            icon={icons.strategy || icons.layers}
          />
        </SectionCard>

        <SectionCard title="Service Details" icon={icons.calendar || icons.clock}>
          <CustomDropdown
            label="Service Type"
            value={serviceType}
            onPress={() => showDropdown('serviceType')}
            icon={icons.medical || icons.heart}
          />

          <CustomDatePicker
            label="Service Date"
            value={serviceDate}
            onPress={() => setShowServiceDatePicker(true)}
            showPicker={showServiceDatePicker}
            onChange={handleServiceDateChange}
            icon={icons.calendar}
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Number of Services</Text>
            <View style={styles.inputContainer}>
              <FastImage source={icons.hash || icons.number} style={styles.inputIcon} tintColor={COLORS.green} />
              <TextInput
                style={styles.input}
                value={numServices}
                onChangeText={setNumServices}
                placeholder="Number of services"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          </View>

          <CustomDatePicker
            label="First Heat Date"
            value={firstHeatDate}
            onPress={() => setShowFirstHeatDatePicker(true)}
            showPicker={showFirstHeatDatePicker}
            onChange={handleFirstHeatDateChange}
            icon={icons.heart || icons.pulse}
          />
        </SectionCard>

        {serviceType === 'Artificial Insemination' && (
          <SectionCard title="Artificial Insemination Details" icon={icons.medical || icons.science}>
            <AnimalDropdown
              label="AI Sire (Male)"
              selectedAnimal={selectedAISire}
              onPress={() => setShowAISireDropdown(true)}
              required={false}
              count={compatibleMales.length}
              originalCount={maleAnimals.length}
              isFiltered={selectedDam && compatibleMales.length < maleAnimals.length}
              icon={icons.male || icons.user}
            />

            {selectedAISire && (
              <View style={styles.selectedAnimalCard}>
                <View style={styles.selectedAnimalHeader}>
                  <FastImage source={icons.checkCircle} style={styles.checkIcon} tintColor={COLORS.green} />
                  <Text style={styles.selectedAnimalTitle}>Selected AI Sire</Text>
                </View>
                <Text style={styles.selectedAnimalText}>
                  ID: {selectedAISire?.mammal?.idNumber || selectedAISire?.poultry?.idNumber}
                </Text>
                <Text style={styles.selectedAnimalSubtext}>
                  {selectedAISire.type} ({getAnimalSpecies(selectedAISire)}) - {selectedAISire?.mammal?.breedType || selectedAISire?.poultry?.breedType}
                </Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sire Code</Text>
              <View style={styles.inputContainer}>
                <FastImage source={icons.code || icons.tag} style={styles.inputIcon} tintColor={COLORS.green} />
                <TextInput
                  style={styles.input}
                  value={sireCode}
                  onChangeText={setSireCode}
                  placeholder="Enter sire code"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <CustomDropdown
              label="AI Type"
              value={aiType}
              onPress={() => showDropdown('aiType')}
              icon={icons.medical || icons.science}
            />

            <CustomDropdown
              label="AI Source"
              value={aiSource}
              onPress={() => showDropdown('aiSource')}
              icon={icons.location || icons.mapPin}
            />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>AI Cost</Text>
              <View style={styles.inputContainer}>
                <FastImage source={icons.dollar || icons.money} style={styles.inputIcon} tintColor={COLORS.green} />
                <TextInput
                  style={styles.input}
                  value={aiCost}
                  onChangeText={setAiCost}
                  placeholder="Enter AI cost"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </SectionCard>
        )}

        <SectionCard title="Breeding Forecast" icon={icons.calendar || icons.clock}>
          <View style={styles.forecastCard}>
            <View style={styles.forecastItem}>
              <Text style={styles.forecastLabel}>Gestation Period</Text>
              <Text style={styles.forecastValue}>{gestationDays} days</Text>
            </View>
            <View style={styles.forecastItem}>
              <Text style={styles.forecastLabel}>Expected Birth Date</Text>
              <Text style={styles.forecastValue}>{expectedBirthDate || 'Select service date'}</Text>
            </View>
          </View>
        </SectionCard>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <FastImage source={icons.save || icons.check} style={styles.submitIcon} tintColor="#fff" />
              <Text style={styles.submitButtonText}>Create Breeding Record</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showDamDropdown}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDamDropdown(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Dam (Female)</Text>
              <TouchableOpacity onPress={() => setShowDamDropdown(false)}>
                <FastImage source={icons.close} style={styles.closeIcon} tintColor={COLORS.green} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <FastImage source={icons.search} style={styles.searchIcon} tintColor={COLORS.green} />
              <TextInput
                style={styles.searchInput}
                value={damSearchQuery}
                onChangeText={setDamSearchQuery}
                placeholder="Search by ID, breed, or type..."
                placeholderTextColor="#999"
              />
            </View>

            <FlatList
              data={filteredDams}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => renderAnimalItem({
                item,
                onSelect: setSelectedDam,
                onClose: () => setShowDamDropdown(false),
                setSearchQuery: setDamSearchQuery
              })}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No female animals found</Text>
                </View>
              }
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showSireDropdown}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSireDropdown(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Sire (Male)</Text>
              <TouchableOpacity onPress={() => setShowSireDropdown(false)}>
                <FastImage source={icons.close} style={styles.closeIcon} tintColor={COLORS.green} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <FastImage source={icons.search} style={styles.searchIcon} tintColor={COLORS.green} />
              <TextInput
                style={styles.searchInput}
                value={sireSearchQuery}
                onChangeText={setSireSearchQuery}
                placeholder="Search compatible males..."
                placeholderTextColor="#999"
              />
            </View>

            <FlatList
              data={filteredSires}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => renderAnimalItem({
                item,
                onSelect: setSelectedSire,
                onClose: () => setShowSireDropdown(false),
                setSearchQuery: setSireSearchQuery
              })}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {selectedDam
                      ? `No compatible male ${getAnimalSpecies(selectedDam)} animals found`
                      : 'No male animals found'
                    }
                  </Text>
                </View>
              }
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showAISireDropdown}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAISireDropdown(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select AI Sire (Male)</Text>
              <TouchableOpacity onPress={() => setShowAISireDropdown(false)}>
                <FastImage source={icons.close} style={styles.closeIcon} tintColor={COLORS.green} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <FastImage source={icons.search} style={styles.searchIcon} tintColor={COLORS.green} />
              <TextInput
                style={styles.searchInput}
                value={aiSireSearchQuery}
                onChangeText={setAiSireSearchQuery}
                placeholder="Search compatible males..."
                placeholderTextColor="#999"
              />
            </View>

            <FlatList
              data={filteredAISires}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => renderAnimalItem({
                item,
                onSelect: setSelectedAISire,
                onClose: () => setShowAISireDropdown(false),
                setSearchQuery: setAiSireSearchQuery
              })}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {selectedDam
                      ? `No compatible male ${getAnimalSpecies(selectedDam)} animals found`
                      : 'No male animals found'
                    }
                  </Text>
                </View>
              }
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dropdownModal}>
            <FlatList
              data={dropdownOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownOption}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.dropdownOptionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <FastImage source={icons.checkCircle} style={styles.successIcon} tintColor={COLORS.green} />
            <Text style={styles.successTitle}>Success!</Text>
            <Text style={styles.successMessage}>
              Breeding record has been created successfully.
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                setModalVisible(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.successButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.gray,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.green,
    borderRadius: 2,
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark,
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.dark,
  },
  required: {
    color: '#ff4444',
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countBadge: {
    fontSize: 12,
    color: COLORS.green,
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 4,
  },
  filteredBadge: {
    fontSize: 12,
    color: '#ff6b35',
    backgroundColor: '#fff5f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  compatibilityNote: {
    fontSize: 12,
    color: COLORS.green,
    marginTop: 4,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  inputIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: COLORS.dark,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: COLORS.dark,
  },
  placeholderText: {
    color: '#999',
  },
  dropdownIcon: {
    width: 16,
    height: 16,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 16,
    color: COLORS.dark,
  },
  dateIcon: {
    width: 16,
    height: 16,
  },
  selectedAnimalCard: {
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.green,
  },
  selectedAnimalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  selectedAnimalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.green,
  },
  selectedAnimalText: {
    fontSize: 14,
    color: COLORS.dark,
    marginBottom: 2,
  },
  selectedAnimalSubtext: {
    fontSize: 12,
    color: COLORS.gray,
  },
  forecastCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  forecastItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  forecastLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  forecastValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
  },
  submitButton: {
    backgroundColor: COLORS.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark,
  },
  closeIcon: {
    width: 24,
    height: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
  },
  searchIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: COLORS.dark,
  },
  animalItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.green,
  },
  animalItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  animalId: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
  },
  badgeContainer: {
    flexDirection: 'row',
  },
  genderBadge: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 4,
  },
  genderText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500',
  },
  speciesBadge: {
    backgroundColor: '#007bff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  speciesText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500',
  },
  animalDetails: {
    fontSize: 14,
    color: COLORS.gray,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
  },
  dropdownModal: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    minWidth: 200,
    maxHeight: 300,
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  dropdownOptionText: {
    fontSize: 16,
    color: COLORS.dark,
  },
  successModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    width: '80%',
  },
  successIcon: {
    width: 60,
    height: 60,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 20,
  },
  successButton: {
    backgroundColor: COLORS.green,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  successButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BreedingRecordForm;