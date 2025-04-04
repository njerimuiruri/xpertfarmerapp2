import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { icons } from '../../../constants';
import { COLORS } from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';
import DateTimePicker from '@react-native-community/datetimepicker';

const RecordBirthScreen = ({ route, navigation }) => {
  const { record } = route.params;

  const [birthDetails, setBirthDetails] = useState({
    id: record.id,
    birthDate: new Date(),
    deliveryMethod: 'Natural Birth',
    youngOnes: '',
    birthWeight: '',
    litterWeight: '',
    offspringSex: '',
    offspringIds: '',
    status: 'Delivered',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [deliveryMethods] = useState(['Natural Birth', 'Assisted', 'Cesarean']);
  const [showDeliveryMethodPicker, setShowDeliveryMethodPicker] = useState(false);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthDetails({ ...birthDetails, birthDate: selectedDate });
    }
  };

  const handleSelectDeliveryMethod = (method) => {
    setBirthDetails({ ...birthDetails, deliveryMethod: method });
    setShowDeliveryMethodPicker(false);
  };


  return (
    <View style={{ flex: 1, backgroundColor: COLORS.lightGreen }}>
      <SecondaryHeader title="Record Birth" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Animal Details</Text>
          <View style={styles.animalDetailRow}>
            <Text style={styles.detailLabel}>Animal ID:</Text>
            <Text style={styles.detailValue}>{record.animalId}</Text>
          </View>
          <View style={styles.animalDetailRow}>
            <Text style={styles.detailLabel}>Type:</Text>
            <Text style={styles.detailValue}>{record.animalType}</Text>
          </View>
          <View style={styles.animalDetailRow}>
            <Text style={styles.detailLabel}>Service Date:</Text>
            <Text style={styles.detailValue}>{record.serviceDate}</Text>
          </View>
          <View style={styles.animalDetailRow}>
            <Text style={styles.detailLabel}>Expected Birth:</Text>
            <Text style={styles.detailValue}>{record.expectedBirthDate}</Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>Birth Information</Text>

          {/* Birth Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Birth Date</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>{formatDate(birthDetails.birthDate)}</Text>
              <FastImage
                source={icons.calendar}
                style={styles.inputIcon}
                tintColor="#666"
              />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={birthDetails.birthDate}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          {/* Delivery Method */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Delivery Method</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowDeliveryMethodPicker(!showDeliveryMethodPicker)}
            >
              <Text style={styles.pickerText}>{birthDetails.deliveryMethod}</Text>
              <FastImage
                source={icons.dropdown}
                style={styles.inputIcon}
                tintColor="#666"
              />
            </TouchableOpacity>
            {showDeliveryMethodPicker && (
              <View style={styles.pickerOptions}>
                {deliveryMethods.map((method) => (
                  <TouchableOpacity
                    key={method}
                    style={styles.pickerOption}
                    onPress={() => handleSelectDeliveryMethod(method)}
                  >
                    <Text style={styles.pickerOptionText}>{method}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Number of Young Ones */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Number of Offspring</Text>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                value={birthDetails.youngOnes}
                onChangeText={(text) => setBirthDetails({ ...birthDetails, youngOnes: text })}
                keyboardType="numeric"

                placeholder="Enter number"
                placeholderTextColor={COLORS.black}

              />
            </View>
          </View>

          {record.animalType === 'Swine' ? (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Litter Weight</Text>
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={birthDetails.litterWeight}
                  onChangeText={(text) => setBirthDetails({ ...birthDetails, litterWeight: text })}
                  keyboardType="numeric"
                  placeholder="Enter weight in kg"
                  placeholderTextColor={COLORS.black}

                />
                <Text style={styles.unitText}>kg</Text>
              </View>
            </View>
          ) : (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Birth Weight</Text>
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={birthDetails.birthWeight}
                  onChangeText={(text) => setBirthDetails({ ...birthDetails, birthWeight: text })}
                  keyboardType="numeric"
                  placeholder="Enter weight in kg"
                  placeholderTextColor={COLORS.black}

                />
                <Text style={styles.unitText}>kg</Text>
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Offspring Sex</Text>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                value={birthDetails.offspringSex}
                onChangeText={(text) => setBirthDetails({ ...birthDetails, offspringSex: text })}
                placeholder="e.g., 2 Males, 3 Females"
                placeholderTextColor={COLORS.black}

              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Offspring IDs</Text>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                value={birthDetails.offspringIds}
                onChangeText={(text) => setBirthDetails({ ...birthDetails, offspringIds: text })}
                placeholder="e.g., A101, A102"
                placeholderTextColor={COLORS.black}

              />
            </View>
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonCancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}

          >
            <Text style={styles.buttonSaveText}>Save Record</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
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
  formCard: {
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
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray1,
    paddingBottom: 8,
  },
  animalDetailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: 120,
    fontSize: 14,
    color: COLORS.black,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 8,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray1,
    borderRadius: 8,
    backgroundColor: COLORS.lightGreen,
  },
  dateText: {
    fontSize: 16,
    color: COLORS.black,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray1,
    borderRadius: 8,
    backgroundColor: COLORS.lightGreen,
  },
  pickerText: {
    fontSize: 16,
    color: COLORS.black,
  },
  pickerOptions: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: COLORS.lightGray1,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pickerOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray1,
  },
  pickerOptionText: {
    fontSize: 16,
    color: COLORS.black,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray1,
    borderRadius: 8,
    backgroundColor: COLORS.lightGreen,

  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: COLORS.black,
  },
  unitText: {
    fontSize: 16,
    color: COLORS.black,
    marginLeft: 8,
  },
  inputIcon: {
    width: 20,
    height: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 24,
  },
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray1,
  },
  saveButton: {
    backgroundColor: COLORS.green3,
  },
  buttonCancelText: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: '500',
  },
  buttonSaveText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '500',
  },
});

export default RecordBirthScreen;