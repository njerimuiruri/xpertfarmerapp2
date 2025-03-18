import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Box } from 'native-base';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import SecondaryHeader from '../../components/headers/secondary-header';
import { icons } from '../../constants';
import DateTimePicker from '@react-native-community/datetimepicker';
import {COLORS} from '../../constants/theme';

export default function EditMachinery({ route, navigation }) {
  const { item } = route.params;
  
  const [formData, setFormData] = useState({
    name: item.name,
    equipmentId: item.equipmentId,
    purchaseDate: item.purchaseDate,
    location: item.location,
    condition: item.condition,
    lastServiceDate: item.lastServiceDate,
    nextServiceDate: item.nextServiceDate,
    maintenanceCost: item.maintenanceCost.replace('$', ''),
    hoursOperated: item.hoursOperated,
    costPerHour: item.costPerHour.replace('$', ''),
    fuelEfficiency: item.fuelEfficiency || '',
    roi: item.roi.replace('%', ''),
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDateField, setCurrentDateField] = useState(null);

  const parseDate = (dateString) => {
    const parts = dateString.split('/');
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  };

  const formatDate = (date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate && currentDateField) {
      setFormData({
        ...formData,
        [currentDateField]: formatDate(selectedDate),
      });
    }
  };

  const showDatePickerFor = (fieldName) => {
    setCurrentDateField(fieldName);
    setShowDatePicker(true);
  };

  
  const handleSave = () => {
   
      Alert.alert(
        'Success',
        'Machinery updated successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );

  };

  const conditionOptions = ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'];

  return (
    <View style={styles.container}>
      <SecondaryHeader title="Edit Machinery" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
       
        
        <View style={styles.formContainer}>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Equipment Name*</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                                backgroundColor={COLORS.lightGreen}
                
                onChangeText={(text) => setFormData({...formData, name: text})}
                placeholder="Enter equipment name"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Equipment ID*</Text>
              <TextInput
                style={styles.textInput}
                value={formData.equipmentId}
                backgroundColor={COLORS.lightGreen}
                onChangeText={(text) => setFormData({...formData, equipmentId: text})}
                placeholder="Enter equipment ID"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Purchase Date</Text>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => showDatePickerFor('purchaseDate')}>
                <Text style={styles.dateText}>{formData.purchaseDate}</Text>
                <FastImage
                  source={icons.calendar}
                  style={styles.icon}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Location*</Text>
              <TextInput
                style={styles.textInput}
                value={formData.location}
                backgroundColor={COLORS.lightGreen}
                onChangeText={(text) => setFormData({...formData, location: text})}
                placeholder="Enter current location"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Condition</Text>
              <View style={styles.conditionContainer}>
                {conditionOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.conditionButton,
                      formData.condition === option && styles.conditionButtonActive
                    ]}
                    onPress={() => setFormData({...formData, condition: option})}>
                    <Text style={[
                      styles.conditionButtonText,
                      formData.condition === option && styles.conditionButtonTextActive
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Maintenance Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last Service Date</Text>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => showDatePickerFor('lastServiceDate')}>
                <Text style={styles.dateText}>{formData.lastServiceDate}</Text>
                <FastImage
                  source={icons.calendar}
                  style={styles.icon}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Next Service Date</Text>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => showDatePickerFor('nextServiceDate')}>
                <Text style={styles.dateText}>{formData.nextServiceDate}</Text>
                <FastImage
                  source={icons.calendar}
                  style={styles.icon}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Maintenance Cost (YTD)</Text>
              <View style={styles.currencyInput}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.currencyTextInput}
                  value={formData.maintenanceCost}
                  onChangeText={(text) => setFormData({...formData, maintenanceCost: text})}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Performance Metrics</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Hours Operated</Text>
              <TextInput
                style={styles.textInput}
                value={formData.hoursOperated}
                onChangeText={(text) => setFormData({...formData, hoursOperated: text})}
                placeholder="Enter hours operated"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cost Per Hour</Text>
              <View style={styles.currencyInput}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.currencyTextInput}
                  value={formData.costPerHour}
                  onChangeText={(text) => setFormData({...formData, costPerHour: text})}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Fuel Efficiency (if applicable)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.fuelEfficiency}
                onChangeText={(text) => setFormData({...formData, fuelEfficiency: text})}
                placeholder="e.g. 3.2 L/hr"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Return on Investment (%)</Text>
              <View style={styles.percentInput}>
                <TextInput
                  style={styles.percentTextInput}
                  value={formData.roi}
                  onChangeText={(text) => setFormData({...formData, roi: text})}
                  placeholder="0"
                  keyboardType="numeric"
                />
                <Text style={styles.percentSymbol}>%</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {showDatePicker && (
        <DateTimePicker
          value={parseDate(formData[currentDateField])}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },

  formContainer: {
    padding: 15,
  },
  formSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 15,
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
    borderColor: COLORS.gray3,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.black,
    backgroundColor:COLORS.lightGray2,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: COLORS.gray3,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: COLORS.lightGray2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 15,
    color: COLORS.black,
  },
  
  conditionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  conditionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor:COLORS.lightGray2,
    marginRight: 8,
    marginBottom: 8,
  },
  conditionButtonActive: {
    backgroundColor: COLORS.green3,
  },
  conditionButtonText: {
    fontSize: 13,
    color: COLORS.black,
  },
  conditionButtonTextActive: {
    color: COLORS.white,
    fontWeight: '500',
  },
  currencyInput: {
    borderWidth: 1,
    borderColor: COLORS.gray3,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: COLORS.lightGray2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 15,
    color: COLORS.black,
    marginRight: 5,
  },
  currencyTextInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.black,
    padding: 0,
  },
  percentInput: {
    borderWidth: 1,
    borderColor: COLORS.gray3,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: COLORS.lightGray2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  percentTextInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.black,
    padding: 0,
  },
  percentSymbol: {
    fontSize: 15,
    color: COLORS.black,
    marginLeft: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor:COLORS.lightGray1,
    paddingVertical: 15,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 2,
    backgroundColor: COLORS.green3,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
});