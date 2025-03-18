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
import { Box, Select, CheckIcon } from 'native-base';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import SecondaryHeader from '../../components/headers/secondary-header';
import { icons } from '../../constants';
import DateTimePicker from '@react-native-community/datetimepicker';
import {COLORS} from '../../constants/theme';

export default function EditInventoryItem({ route, navigation }) {
  const { item } = route.params;
  
  // Form state
  const [formData, setFormData] = useState({
    name: item.name,
    type: item.type,
    batchNumber: item.batchNumber,
    supplier: item.supplier,
    quantity: item.quantity.split(' ')[0], 
    quantityUnit: item.quantity.includes(' ') ? item.quantity.split(' ')[1] : 'kg', 
    purchaseDate: item.purchaseDate,
    expiryDate: item.expiryDate,
    storageLocation: item.storageLocation,
    status: item.status,
    fcr: item.fcr || '',
    costPerKg: item.costPerKg ? item.costPerKg.replace('$', '') : '',
    costEffectiveness: item.costEffectiveness || '',
    nutrientRating: item.nutrientRating || '',
    applicationRate: item.applicationRate || '',
    vaccineType: item.vaccineType || '',
    effectivenessRating: item.effectivenessRating || '',
    costPerDose: item.costPerDose ? item.costPerDose.replace('$', '') : '',
  });

  const stockStatusOptions = ['In Stock', 'Low Stock', 'Out of Stock', 'On Order'];
  
  const quantityUnitOptions = ['kg', 'g', 'L', 'mL', 'units', 'doses', 'bags'];

  const typeOptions = ['Feed', 'Fertilizer', 'Seed', 'Medical', 'Equipment', 'Other'];

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
        'Inventory item updated successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    
  };

  const renderTypeSpecificFields = () => {
    if (formData.type === 'Feed') {
      return (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Feed Conversion Ratio (FCR)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.fcr}
                backgroundColor={COLORS.lightGreen}
              
              onChangeText={(text) => setFormData({...formData, fcr: text})}
              placeholder="Enter FCR value"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Cost Per Kg</Text>
            <View style={styles.currencyInput}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.currencyTextInput}
                value={formData.costPerKg}
                onChangeText={(text) => setFormData({...formData, costPerKg: text})}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Cost-Effectiveness Score</Text>
            <TextInput
              style={styles.textInput}
                              backgroundColor={COLORS.lightGreen}
              
              value={formData.costEffectiveness}
              onChangeText={(text) => setFormData({...formData, costEffectiveness: text})}
              placeholder="Enter value (0-1)"
              keyboardType="numeric"
            />
          </View>
        </>
      );
    } else if (formData.type === 'Fertilizer') {
      return (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nutrient Rating</Text>
            <TextInput
              style={styles.textInput}
                              backgroundColor={COLORS.lightGreen}
              
              value={formData.nutrientRating}
              onChangeText={(text) => setFormData({...formData, nutrientRating: text})}
              placeholder="e.g. High NPK"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Application Rate</Text>
            <TextInput
              style={styles.textInput}
                              backgroundColor={COLORS.lightGreen}
              
              value={formData.applicationRate}
              onChangeText={(text) => setFormData({...formData, applicationRate: text})}
              placeholder="e.g. 2.5 kg/acre"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Cost Per Kg</Text>
            <View style={styles.currencyInput}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.currencyTextInput}
                
                value={formData.costPerKg}
                onChangeText={(text) => setFormData({...formData, costPerKg: text})}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>
          </View>
        </>
      );
    } else if (formData.type === 'Medical') {
      return (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Vaccine/Medicine Type</Text>
            <TextInput
              style={styles.textInput}
                              backgroundColor={COLORS.lightGreen}
              
              value={formData.vaccineType}
              onChangeText={(text) => setFormData({...formData, vaccineType: text})}
              placeholder="e.g. Antibiotics, Vaccines"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Effectiveness Rating</Text>
            <TextInput
              style={styles.textInput}
              value={formData.effectivenessRating}
                              backgroundColor={COLORS.lightGreen}
              
              onChangeText={(text) => setFormData({...formData, effectivenessRating: text})}
              placeholder="e.g. 98%"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Cost Per Dose</Text>
            <View style={styles.currencyInput}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.currencyTextInput}
                value={formData.costPerDose}
                onChangeText={(text) => setFormData({...formData, costPerDose: text})}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>
          </View>
        </>
      );
    }
    
    return null;
  };

  return (
    <View style={styles.container}>
      <SecondaryHeader title="Edit Inventory Item" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
       
        <View style={styles.formContainer}>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Item Name*</Text>
              <TextInput
                style={styles.textInput}
                                backgroundColor={COLORS.lightGreen}
                
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
                placeholder="Enter item name"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Item Type*</Text>
              <View style={styles.pickerContainer}>
                <Select
                  selectedValue={formData.type}
                  minWidth="100%"
                  placeholder="Select type"
                  _selectedItem={{
                    bg: "rgba(117, 93, 88, 0.2)",
                    endIcon: <CheckIcon size="5" color="#755D58" />
                  }}
                  onValueChange={(value) => setFormData({...formData, type: value})}>
                  {typeOptions.map((type) => (
                    <Select.Item key={type} label={type} value={type} />
                  ))}
                </Select>
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Batch Number</Text>
              <TextInput
                style={styles.textInput}
                value={formData.batchNumber}
                                backgroundColor={COLORS.lightGreen}
                
                onChangeText={(text) => setFormData({...formData, batchNumber: text})}
                placeholder="Enter batch number"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Supplier</Text>
              <TextInput
                style={styles.textInput}
                value={formData.supplier}
                                backgroundColor={COLORS.lightGreen}
                
                onChangeText={(text) => setFormData({...formData, supplier: text})}
                placeholder="Enter supplier name"
              />
            </View>
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Quantity & Storage</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Quantity*</Text>
              <View style={styles.quantityContainer}>
                <TextInput
                  style={styles.quantityInput}
                  value={formData.quantity}
                                  backgroundColor={COLORS.lightGreen}
                  
                  onChangeText={(text) => setFormData({...formData, quantity: text})}
                  placeholder="Amount"
                  keyboardType="numeric"
                />
                <View style={styles.unitSelector}>
                  <Select
                    selectedValue={formData.quantityUnit}
                    minWidth="120"
                    placeholder="Unit"
                    _selectedItem={{
                      bg: "rgba(117, 93, 88, 0.2)",
                      endIcon: <CheckIcon size="5" color="#755D58" />
                    }}
                    onValueChange={(value) => setFormData({...formData, quantityUnit: value})}>
                    {quantityUnitOptions.map((unit) => (
                      <Select.Item key={unit} label={unit} value={unit} />
                    ))}
                  </Select>
                </View>
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Storage Location*</Text>
              <TextInput
                style={styles.textInput}
                                backgroundColor={COLORS.lightGreen}
                
                value={formData.storageLocation}
                onChangeText={(text) => setFormData({...formData, storageLocation: text})}
                placeholder="Enter storage location"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Stock Status</Text>
              <View style={styles.statusContainer}>
                {stockStatusOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.statusButton,
                      formData.status === option && styles.statusButtonActive
                    ]}
                    onPress={() => setFormData({...formData, status: option})}>
                    <Text style={[
                      styles.statusButtonText,
                      formData.status === option && styles.statusButtonTextActive
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Timeline</Text>
            
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
              <Text style={styles.inputLabel}>Expiry Date</Text>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => showDatePickerFor('expiryDate')}>
                <Text style={styles.dateText}>{formData.expiryDate}</Text>
                <FastImage
                  source={icons.calendar}
                  style={styles.icon}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </TouchableOpacity>
            </View>
          </View>

          {renderTypeSpecificFields()}
          
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
    backgroundColor:COLORS.lightGray1,
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
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.gray3,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.black,
    backgroundColor: '#F9F9F9',
    marginRight: 10,
  },
  unitSelector: {
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
    marginBottom: 8,
  },
  statusButtonActive: {
    backgroundColor:COLORS.green3,
  },
  statusButtonText: {
    fontSize: 13,
    color: COLORS.black,
  },
  statusButtonTextActive: {
    color: COLORS.white,
    fontWeight: '500',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: COLORS.gray3,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor:COLORS.lightGray2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 15,
    color: COLORS.black,
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
    backgroundColor:COLORS.green3,
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