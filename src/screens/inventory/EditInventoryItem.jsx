import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  Keyboard,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { icons } from '../../constants';
import { COLORS } from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';
import {
  updateGoodsInStock,
  updateMachinery,
  updateUtility,
  getInventoryItemDetails,
} from '../../services/inventoryService';

const EditInventoryItem = ({ navigation, route }) => {
  const { item } = route.params;

  // Form state
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState({ show: false, field: null });
  const [showDropdown, setShowDropdown] = useState({ show: false, field: null });
  const [errors, setErrors] = useState({});

  // Initialize form data based on item type
  useEffect(() => {
    initializeFormData();
  }, []);

  const initializeFormData = async () => {
    try {
      setIsLoading(true);
      // Get detailed item information
      const detailedItem = await getInventoryItemDetails(item);

      let initialData = {};

      switch (item.type) {
        case 'goodsInStock':
          initialData = {
            itemName: detailedItem.itemName || '',
            sku: detailedItem.sku || '',
            quantity: detailedItem.quantity?.toString() || '0',
            currentLocation: detailedItem.currentLocation || '',
            condition: detailedItem.condition || 'good',
            expirationDate: detailedItem.expirationDate ? new Date(detailedItem.expirationDate) : new Date(),
          };
          break;

        case 'machinery':
          initialData = {
            equipmentName: detailedItem.equipmentName || '',
            equipmentId: detailedItem.equipmentId || '',
            purchaseDate: detailedItem.purchaseDate ? new Date(detailedItem.purchaseDate) : new Date(),
            currentLocation: detailedItem.currentLocation || '',
            condition: detailedItem.condition || 'good',
            lastServiceDate: detailedItem.lastServiceDate ? new Date(detailedItem.lastServiceDate) : new Date(),
            nextServiceDate: detailedItem.nextServiceDate ? new Date(detailedItem.nextServiceDate) : new Date(),
          };
          break;

        case 'utility':
          initialData = {
            utilityType: detailedItem.utilityType || 'water',
            waterLevel: detailedItem.waterLevel?.toString() || '0',
            waterSource: detailedItem.waterSource || '',
            waterStorage: detailedItem.waterStorage?.toString() || '0',
            entryDate: detailedItem.entryDate ? new Date(detailedItem.entryDate) : new Date(),
            powerSource: detailedItem.powerSource || '',
            powerCapacity: detailedItem.powerCapacity || '',
            installationCost: detailedItem.installationCost?.toString() || '0',
            consumptionRate: detailedItem.consumptionRate?.toString() || '0',
            consumptionCost: detailedItem.consumptionCost?.toString() || '0',
            structureType: detailedItem.structureType || '',
            structureCapacity: detailedItem.structureCapacity || '',
            constructionCost: detailedItem.constructionCost?.toString() || '0',
            facilityCondition: detailedItem.facilityCondition || 'good',
            lastMaintenanceDate: detailedItem.lastMaintenanceDate ? new Date(detailedItem.lastMaintenanceDate) : new Date(),
            maintenanceCost: detailedItem.maintenanceCost?.toString() || '0',
          };
          break;

        default:
          throw new Error('Invalid item type');
      }

      setFormData(initialData);
      setErrors({});
    } catch (error) {
      console.error('Error initializing form data:', error);
      Alert.alert('Error', 'Failed to load item details. Please try again.');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const getDropdownOptions = (field) => {
    switch (field) {
      case 'condition':
        return [
          { label: 'Excellent', value: 'excellent' },
          { label: 'Good', value: 'good' },
          { label: 'Fair', value: 'fair' },
          { label: 'Poor', value: 'poor' },
          ...(item.type === 'machinery' ? [{ label: 'Needs Repair', value: 'needs repair' }] : []),
        ];
      case 'facilityCondition':
        return [
          { label: 'Excellent', value: 'excellent' },
          { label: 'Good', value: 'good' },
          { label: 'Fair', value: 'fair' },
          { label: 'Poor', value: 'poor' },
        ];
      case 'utilityType':
        return [
          { label: 'Water', value: 'water' },
          { label: 'Power', value: 'power' },
          { label: 'Structure', value: 'structure' },
        ];
      default:
        return [];
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const { field } = showDatePicker;
    setShowDatePicker({ show: false, field: null });

    if (selectedDate && field) {
      handleInputChange(field, selectedDate);
    }
  };

  const showDatePickerModal = (field) => {
    Keyboard.dismiss();
    setShowDatePicker({ show: true, field });
  };

  const validateForm = () => {
    const newErrors = {};

    switch (item.type) {
      case 'goodsInStock':
        if (!formData.itemName?.trim()) {
          newErrors.itemName = 'Item name is required';
        }
        if (!formData.sku?.trim()) {
          newErrors.sku = 'SKU is required';
        }
        if (!formData.quantity || isNaN(parseInt(formData.quantity)) || parseInt(formData.quantity) < 0) {
          newErrors.quantity = 'Valid quantity is required';
        }
        break;

      case 'machinery':
        if (!formData.equipmentName?.trim()) {
          newErrors.equipmentName = 'Equipment name is required';
        }
        if (!formData.equipmentId?.trim()) {
          newErrors.equipmentId = 'Equipment ID is required';
        }
        break;

      case 'utility':
        if (!formData.utilityType) {
          newErrors.utilityType = 'Utility type is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly');
      return;
    }

    setIsSaving(true);
    try {
      let result;
      let payload = {};

      switch (item.type) {
        case 'goodsInStock':
          payload = {
            itemName: formData.itemName.trim(),
            sku: formData.sku.trim(),
            quantity: parseInt(formData.quantity),
            currentLocation: formData.currentLocation?.trim() || '',
            condition: formData.condition,
            expirationDate: formData.expirationDate.toISOString(),
          };
          result = await updateGoodsInStock(item.id, payload);
          break;

        case 'machinery':
          payload = {
            equipmentName: formData.equipmentName.trim(),
            equipmentId: formData.equipmentId.trim(),
            purchaseDate: formData.purchaseDate.toISOString(),
            currentLocation: formData.currentLocation?.trim() || '',
            condition: formData.condition,
            lastServiceDate: formData.lastServiceDate.toISOString(),
            nextServiceDate: formData.nextServiceDate.toISOString(),
          };
          result = await updateMachinery(item.id, payload);
          break;

        case 'utility':
          payload = {
            utilityType: formData.utilityType,
            waterLevel: parseInt(formData.waterLevel) || 0,
            waterSource: formData.waterSource?.trim() || '',
            waterStorage: parseInt(formData.waterStorage) || 0,
            entryDate: formData.entryDate.toISOString(),
            powerSource: formData.powerSource?.trim() || '',
            powerCapacity: formData.powerCapacity?.trim() || '',
            installationCost: parseFloat(formData.installationCost) || 0,
            consumptionRate: parseFloat(formData.consumptionRate) || 0,
            consumptionCost: parseFloat(formData.consumptionCost) || 0,
            structureType: formData.structureType?.trim() || '',
            structureCapacity: formData.structureCapacity?.trim() || '',
            constructionCost: parseFloat(formData.constructionCost) || 0,
            facilityCondition: formData.facilityCondition,
            lastMaintenanceDate: formData.lastMaintenanceDate.toISOString(),
            maintenanceCost: parseFloat(formData.maintenanceCost) || 0,
          };
          result = await updateUtility(item.id, payload);
          break;
      }

      if (result.error) {
        Alert.alert('Error', result.error);
      } else {
        Alert.alert('Success', 'Item updated successfully', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      console.error('Error updating item:', error);
      Alert.alert('Error', 'Failed to update item. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderFormField = ({
    label,
    field,
    placeholder,
    keyboardType = 'default',
    multiline = false,
    numberOfLines = 1,
    required = false
  }) => (
    <View style={styles.formField}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.requiredStar}> *</Text>}
      </Text>
      <View style={[
        styles.inputContainer,
        errors[field] && styles.inputContainerError
      ]}>
        <TextInput
          style={[styles.textInput, multiline && styles.multilineInput]}
          placeholder={placeholder}
          value={formData[field] || ''}
          onChangeText={(value) => handleInputChange(field, value)}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          placeholderTextColor="#9CA3AF"
          autoCorrect={false}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        />
      </View>
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

  const renderPickerField = ({ label, field, placeholder, required = false }) => {
    const options = getDropdownOptions(field);
    return (
      <View style={styles.formField}>
        <Text style={styles.fieldLabel}>
          {label}
          {required && <Text style={styles.requiredStar}> *</Text>}
        </Text>
        <TouchableOpacity
          style={[
            styles.dropdownContainer,
            errors[field] && styles.inputContainerError
          ]}
          onPress={() => {
            Keyboard.dismiss();
            setShowDropdown({ show: true, field });
          }}>
          <Text style={[
            styles.dropdownText,
            !formData[field] && styles.dropdownPlaceholder
          ]}>
            {formData[field]
              ? options.find(opt => opt.value === formData[field])?.label || placeholder
              : placeholder
            }
          </Text>
          <FastImage
            source={icons.chevronDown || icons.down}
            style={styles.dropdownIcon}
            tintColor="#6B7280"
            resizeMode="contain"
          />
        </TouchableOpacity>
        {errors[field] && (
          <Text style={styles.errorText}>{errors[field]}</Text>
        )}
      </View>
    );
  };

  const renderDateField = ({ label, field, placeholder, required = false }) => (
    <View style={styles.formField}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.requiredStar}> *</Text>}
      </Text>
      <TouchableOpacity
        style={[
          styles.dateInputContainer,
          errors[field] && styles.inputContainerError
        ]}
        onPress={() => showDatePickerModal(field)}>
        <Text style={[
          styles.dateInputText,
          !formData[field] && styles.dropdownPlaceholder
        ]}>
          {formData[field] ? formData[field].toLocaleDateString() : placeholder}
        </Text>
        <FastImage
          source={icons.calendar || icons.date}
          style={styles.dateIcon}
          tintColor="#6B7280"
          resizeMode="contain"
        />
      </TouchableOpacity>
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

  const renderGoodsInStockForm = () => (
    <>
      {renderFormField({
        label: 'Item Name',
        field: 'itemName',
        placeholder: 'Enter item name',
        required: true,
      })}
      {renderFormField({
        label: 'SKU',
        field: 'sku',
        placeholder: 'Enter SKU',
        required: true,
      })}
      {renderFormField({
        label: 'Quantity',
        field: 'quantity',
        placeholder: 'Enter quantity',
        keyboardType: 'numeric',
        required: true,
      })}
      {renderFormField({
        label: 'Current Location',
        field: 'currentLocation',
        placeholder: 'Enter current location',
      })}
      {renderPickerField({
        label: 'Condition',
        field: 'condition',
        placeholder: 'Select condition',
      })}
      {renderDateField({
        label: 'Expiration Date',
        field: 'expirationDate',
        placeholder: 'Select expiration date',
      })}
    </>
  );

  const renderMachineryForm = () => (
    <>
      {renderFormField({
        label: 'Equipment Name',
        field: 'equipmentName',
        placeholder: 'Enter equipment name',
        required: true,
      })}
      {renderFormField({
        label: 'Equipment ID',
        field: 'equipmentId',
        placeholder: 'Enter equipment ID',
        required: true,
      })}
      {renderDateField({
        label: 'Purchase Date',
        field: 'purchaseDate',
        placeholder: 'Select purchase date',
      })}
      {renderFormField({
        label: 'Current Location',
        field: 'currentLocation',
        placeholder: 'Enter current location',
      })}
      {renderPickerField({
        label: 'Condition',
        field: 'condition',
        placeholder: 'Select condition',
      })}
      {renderDateField({
        label: 'Last Service Date',
        field: 'lastServiceDate',
        placeholder: 'Select last service date',
      })}
      {renderDateField({
        label: 'Next Service Date',
        field: 'nextServiceDate',
        placeholder: 'Select next service date',
      })}
    </>
  );

  const renderUtilityForm = () => (
    <>
      {renderPickerField({
        label: 'Utility Type',
        field: 'utilityType',
        placeholder: 'Select utility type',
        required: true,
      })}

      {/* Water-related fields */}
      {formData.utilityType === 'water' && (
        <>
          {renderFormField({
            label: 'Water Level',
            field: 'waterLevel',
            placeholder: 'Enter water level',
            keyboardType: 'numeric',
          })}
          {renderFormField({
            label: 'Water Source',
            field: 'waterSource',
            placeholder: 'Enter water source',
          })}
          {renderFormField({
            label: 'Water Storage',
            field: 'waterStorage',
            placeholder: 'Enter water storage capacity',
            keyboardType: 'numeric',
          })}
        </>
      )}

      {/* Power-related fields */}
      {formData.utilityType === 'power' && (
        <>
          {renderFormField({
            label: 'Power Source',
            field: 'powerSource',
            placeholder: 'Enter power source',
          })}
          {renderFormField({
            label: 'Power Capacity',
            field: 'powerCapacity',
            placeholder: 'Enter power capacity',
          })}
          {renderFormField({
            label: 'Installation Cost',
            field: 'installationCost',
            placeholder: 'Enter installation cost',
            keyboardType: 'numeric',
          })}
          {renderFormField({
            label: 'Consumption Rate',
            field: 'consumptionRate',
            placeholder: 'Enter consumption rate',
            keyboardType: 'numeric',
          })}
          {renderFormField({
            label: 'Consumption Cost',
            field: 'consumptionCost',
            placeholder: 'Enter consumption cost',
            keyboardType: 'numeric',
          })}
        </>
      )}

      {/* Structure-related fields */}
      {formData.utilityType === 'structure' && (
        <>
          {renderFormField({
            label: 'Structure Type',
            field: 'structureType',
            placeholder: 'Enter structure type',
          })}
          {renderFormField({
            label: 'Structure Capacity',
            field: 'structureCapacity',
            placeholder: 'Enter structure capacity',
          })}
          {renderFormField({
            label: 'Construction Cost',
            field: 'constructionCost',
            placeholder: 'Enter construction cost',
            keyboardType: 'numeric',
          })}
        </>
      )}

      {/* Common utility fields */}
      {renderDateField({
        label: 'Entry Date',
        field: 'entryDate',
        placeholder: 'Select entry date',
      })}
      {renderPickerField({
        label: 'Facility Condition',
        field: 'facilityCondition',
        placeholder: 'Select facility condition',
      })}
      {renderDateField({
        label: 'Last Maintenance Date',
        field: 'lastMaintenanceDate',
        placeholder: 'Select last maintenance date',
      })}
      {renderFormField({
        label: 'Maintenance Cost',
        field: 'maintenanceCost',
        placeholder: 'Enter maintenance cost',
        keyboardType: 'numeric',
      })}
    </>
  );

  const getItemTypeTitle = () => {
    switch (item.type) {
      case 'goodsInStock':
        return 'Edit Goods in Stock';
      case 'machinery':
        return 'Edit Machinery';
      case 'utility':
        return 'Edit Utility';
      default:
        return 'Edit Inventory Item';
    }
  };

  const getItemIcon = () => {
    switch (item.type) {
      case 'goodsInStock':
        return icons.package;
      case 'machinery':
        return icons.settings;
      case 'utility':
        return icons.power;
      default:
        return icons.package;
    }
  };

  const getItemDisplayName = () => {
    return item.itemName || item.equipmentName || item.utilityType || 'Unknown Item';
  };

  const getItemTypeDisplayName = () => {
    switch (item.type) {
      case 'goodsInStock':
        return 'Goods in Stock';
      case 'machinery':
        return 'Machinery';
      case 'utility':
        return 'Utility';
      default:
        return 'Inventory Item';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <SecondaryHeader
          title={getItemTypeTitle()}
          showBack={true}
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.green3} />
          <Text style={styles.loadingText}>Loading item details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader
        title={getItemTypeTitle()}
        showBack={true}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <LinearGradient
          colors={['#FFFFFF', '#F8FAFC']}
          style={styles.card}>

          <View style={styles.cardHeader}>
            <View style={styles.itemTypeIcon}>
              <FastImage
                source={getItemIcon()}
                style={styles.itemTypeIconImage}
                tintColor={COLORS.green3}
                resizeMode="contain"
              />
            </View>
            <View style={styles.itemTypeInfo}>
              <Text style={styles.itemTypeName} numberOfLines={2}>
                {getItemDisplayName()}
              </Text>
              <Text style={styles.itemTypeDescription}>
                {getItemTypeDisplayName()}
              </Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            {item.type === 'goodsInStock' && renderGoodsInStockForm()}
            {item.type === 'machinery' && renderMachineryForm()}
            {item.type === 'utility' && renderUtilityForm()}
          </View>
        </LinearGradient>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={isSaving}
          activeOpacity={0.7}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.8}>
          {isSaving ? (
            <View style={styles.savingContainer}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Saving...</Text>
            </View>
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Custom Dropdown Modal */}
      {showDropdown.show && (
        <Modal
          visible={showDropdown.show}
          animationType="fade"
          transparent={true}
          statusBarTranslucent={true}
          onRequestClose={() => setShowDropdown({ show: false, field: null })}>
          <TouchableOpacity
            style={styles.dropdownOverlay}
            activeOpacity={1}
            onPress={() => setShowDropdown({ show: false, field: null })}>
            <View style={styles.dropdownModal}>
              <View style={styles.dropdownHeader}>
                <Text style={styles.dropdownTitle}>
                  Select {showDropdown.field?.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowDropdown({ show: false, field: null })}>
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.dropdownList} showsVerticalScrollIndicator={false}>
                {getDropdownOptions(showDropdown.field).map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.dropdownOption,
                      formData[showDropdown.field] === option.value && styles.dropdownOptionSelected
                    ]}
                    onPress={() => {
                      handleInputChange(showDropdown.field, option.value);
                      setShowDropdown({ show: false, field: null });
                    }}
                    activeOpacity={0.7}>
                    <Text style={[
                      styles.dropdownOptionText,
                      formData[showDropdown.field] === option.value && styles.dropdownOptionTextSelected
                    ]}>
                      {option.label}
                    </Text>
                    {formData[showDropdown.field] === option.value && (
                      <FastImage
                        source={icons.check}
                        style={styles.checkIcon}
                        tintColor={COLORS.green3}
                        resizeMode="contain"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Date Picker Modal */}
      {showDatePicker.show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={formData[showDatePicker.field] || new Date()}
          mode="date"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date(2030, 11, 31)}
          minimumDate={new Date(1900, 0, 1)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },

  // Card
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  itemTypeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemTypeIconImage: {
    width: 28,
    height: 28,
  },
  itemTypeInfo: {
    flex: 1,
  },
  itemTypeName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 24,
  },
  itemTypeDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },

  // Form
  formContainer: {
    flex: 1,
  },
  formField: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  requiredStar: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
  },
  inputContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputContainerError: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  textInput: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 48,
  },
  multilineInput: {
    paddingVertical: 12,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  dropdownText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
  },
  dropdownPlaceholder: {
    color: '#9CA3AF',
  },
  dropdownIcon: {
    width: 20,
    height: 20,
    marginLeft: 8,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  dateInputText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
  },
  dateIcon: {
    width: 20,
    height: 20,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
    marginTop: 6,
    marginLeft: 4,
  },

  // Action Buttons
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
  },
  saveButton: {
    flex: 2,
    borderRadius: 12,
    backgroundColor: COLORS.green3,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    shadowColor: COLORS.green3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // Dropdown Modal
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  dropdownModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    maxHeight: '70%',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    textTransform: 'capitalize',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
  },
  dropdownList: {
    maxHeight: 300,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownOptionSelected: {
    backgroundColor: '#F0FDF4',
  },
  dropdownOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  dropdownOptionTextSelected: {
    color: COLORS.green3,
    fontWeight: '700',
  },
  checkIcon: {
    width: 20,
    height: 20,
    marginLeft: 12,
  },
});

export default EditInventoryItem;
