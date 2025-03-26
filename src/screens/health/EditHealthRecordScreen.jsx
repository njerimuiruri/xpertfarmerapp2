import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  StatusBar,
  SafeAreaView,
  Modal,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { icons } from '../../constants';
import { COLORS } from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';
import DateTimePicker from '@react-native-community/datetimepicker';

const EditHealthRecordScreen = ({ route, navigation }) => {
  const { record } = route.params;

  const [healthRecord, setHealthRecord] = useState({ ...record });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateField, setDateField] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate && dateField) {
      const formattedDate = formatDate(selectedDate);
      setHealthRecord({ ...healthRecord, [dateField]: formattedDate });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const showDatePickerModal = (field) => {
    setDateField(field);
    setShowDatePicker(true);
  };


  const handleSaveRecord = () => {
  
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SecondaryHeader title="Edit Health Record" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>Health Record Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Animal ID</Text>
            <TextInput
              style={styles.textInput}
              value={healthRecord.animalId}
              onChangeText={(text) => setHealthRecord({ ...healthRecord, animalId: text })}
              placeholder="Enter Animal ID"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Record Type</Text>
            <TextInput
              style={styles.textInput}
              value={healthRecord.type}
              onChangeText={(text) => setHealthRecord({ ...healthRecord, type: text })}
              placeholder="Enter Record Type (Vaccination/Deworming/etc.)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Vaccine / Drug</Text>
            <TextInput
              style={styles.textInput}
              value={healthRecord.vaccine || healthRecord.drug}
              onChangeText={(text) => 
                healthRecord.type === 'Vaccination'
                  ? setHealthRecord({ ...healthRecord, vaccine: text })
                  : setHealthRecord({ ...healthRecord, drug: text })
              }
              placeholder="Enter Vaccine or Drug Name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date Administered</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => showDatePickerModal('dateAdministered')}
            >
              <Text style={styles.dateText}>
                {healthRecord.dateAdministered || 'Select Date'}
              </Text>
              <FastImage
                source={icons.calendar}
                style={styles.inputIcon}
                tintColor="#666"
              />
            </TouchableOpacity>
            {showDatePicker && dateField === 'dateAdministered' && (
              <DateTimePicker
                value={healthRecord.dateAdministered ? new Date(healthRecord.dateAdministered) : new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Administered By</Text>
            <TextInput
              style={styles.textInput}
              value={healthRecord.administeredBy}
              onChangeText={(text) => setHealthRecord({ ...healthRecord, administeredBy: text })}
              placeholder="Enter Administered By"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveRecord}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Success</Text>
            <Text style={styles.modalMessage}>Health record updated successfully.</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => {
              setModalVisible(false);
              navigation.goBack();
            }}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGreen,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.green2,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.black,
    marginBottom: 8,
  },
  textInput: {
    height: 48,
    borderColor: COLORS.lightGray2,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.lightGreen,
    fontSize: 16,
    color: COLORS.black,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.lightGray2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray1,
    height: 48,
    paddingHorizontal: 12,
  },
  dateText: {
    fontSize: 16,
    color: COLORS.black,
  },
  inputIcon: {
    width: 20,
    height: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  backButton: {
    backgroundColor: COLORS.lightGray2,
    borderRadius: 8,
    flex: 1,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  backButtonText: {
    color: COLORS.black,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: COLORS.green2,
    borderRadius: 8,
    flex: 1,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:COLORS.darkOverlayColor, 
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.green2,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: COLORS.black,
  },
  modalButton: {
    backgroundColor: COLORS.green2,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    width: '100%',
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: 16,
  },
});

export default EditHealthRecordScreen;