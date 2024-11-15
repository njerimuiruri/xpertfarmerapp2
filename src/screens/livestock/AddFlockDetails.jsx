import React, { useState } from "react";
import { View, ScrollView as RNScrollView, StyleSheet } from "react-native";
import { Text, Input, Button, Radio, Modal, VStack, HStack, Pressable } from "native-base";
import FastImage from 'react-native-fast-image';
import { icons } from '../../constants';
import SecondaryHeader from "../../components/headers/secondary-header";

export default function AddFlockDetailsScreen({ navigation }) {
  const [formData, setFormData] = useState({
    flockId: "",
    dateOfBirth: "",
    gender: ""
  });

  const [showModal, setShowModal] = useState(false);

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    setShowModal(true);
  };

  const handleAddAnother = () => {
    setFormData({
      flockId: "",
      dateOfBirth: "",
      gender: ""
    });
    setShowModal(false);
  };

  const renderFormField = (label, value, onChangeText, keyboardType = "default", placeholder = "") => (
    <View style={styles.formField}>
      <Text style={styles.label}>{label}</Text>
      <Input
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        style={styles.input}
        backgroundColor="#e8f5e9"
        borderWidth={0}
        fontSize="sm"
        height={10}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <SecondaryHeader title="Add Flock Details" />
      <RNScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>Fill in the flock details</Text>

          {renderFormField("Flock ID / Poultry ID", formData.flockId,
            (value) => setFormData(prev => ({ ...prev, flockId: value })))}

          {renderFormField("Date of Birth (DD/MM/YYYY)", formData.dateOfBirth,
            (value) => setFormData(prev => ({ ...prev, dateOfBirth: value })))}

          <View style={styles.formField}>
            <Text style={styles.label}>Gender</Text>
            <Radio.Group
              name="gender"
              value={formData.gender}
              onChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
            >
              <VStack space={2}>
                <Radio value="Male">
                  <Text>Male</Text>
                </Radio>
                <Radio value="Female">
                  <Text>Female</Text>
                </Radio>
                <Radio value="Mixed">
                  <Text>Mixed</Text>
                </Radio>
              </VStack>
            </Radio.Group>
          </View>


          <Button className="bg-emerald-600 border-0 py-3">
            <Text className="font-semibold text-white">Submit</Text>
          </Button>
        </View>
      </RNScrollView>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <Modal.Content style={styles.modalContent}>
          <Modal.Body>
            <VStack space={6} alignItems="center" style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Add another flock</Text>
              <Text style={styles.modalSubtitle}>
                Feel free to add another flock, the more the better
              </Text>
              <HStack space={4} width="100%">
                <Button
                  flex={1}
                  variant="outline"
                  onPress={() => navigation.goBack()}
                  style={styles.modalButton}
                >
                  <Text color="#666">No</Text>
                </Button>
                <Button
                  flex={1}
                  onPress={handleAddAnother}
                  style={[styles.modalButton, styles.modalSubmitButton]}
                >
                  <Text color="white">Yes</Text>
                </Button>
              </HStack>
            </VStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f5e9',
  },
  headerContainer: {
    backgroundColor: 'white',
    paddingVertical: 40,
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 18,
    color: '#8bc34a',
    textAlign: 'center',
    fontWeight: 'bold',
    flex: 1,
  },
  greenLine: {
    height: 2,
    backgroundColor: '#8bc34a',
    width: '100%',
    alignSelf: 'center',
    marginTop: 12,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  formField: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
  },
  buttonContainer: {
    marginTop: 24,
  },
  button: {
    height: 45,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#8bc34a',
    borderWidth: 0,
  },
  modalContent: {
    borderRadius: 16,
    margin: 20,
  },
  modalContainer: {
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalButton: {
    height: 45,
    borderRadius: 8,
  },
  modalSubmitButton: {
    backgroundColor: '#8bc34a',
    borderWidth: 0,
  }
});