import React, { useState } from "react";
import {
  Image,
  Modal,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native";
import { CodeField, Cursor } from 'react-native-confirmation-code-field';
import {
  Box,
  Text,
  Button,
  VStack,
  Center
} from "native-base";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useToast } from "native-base";
import { resetPassword } from "../../services/auth";

const { width } = Dimensions.get("window");

export default function ResetPassword({ navigation, route }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [pinError, setPinError] = useState("");
  const toast = useToast();

  const phoneNumber = route?.params?.phoneNumber || "";
  const otp = route?.params?.otp || "";

  const handleSubmit = async () => {
    Keyboard.dismiss();
    setPinError("");
    if (!newPin || !confirmPin) {
      setPinError("Both fields are required");
      return;
    }
    if (newPin.length !== 4 || confirmPin.length !== 4) {
      setPinError("PIN must be 4 digits");
      return;
    }
    if (newPin !== confirmPin) {
      setPinError("PINs do not match");
      return;
    }
    setLoading(true);
    try {
      console.log("Resetting PIN...", phoneNumber, otp, newPin);
      await resetPassword(phoneNumber, otp, newPin);
      setModalVisible(true);
      toast.show({ description: "Your new PIN has been set!", placement: "top", backgroundColor: "green.500" });
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to reset PIN. Please try again.";
      setPinError(msg);
      toast.show({ description: msg, placement: "top", backgroundColor: "red.500" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Box flex={1} justifyContent="center" alignItems="center" backgroundColor="white">
          <Box
            position="absolute"
            top={0}
            left={0}
            width="50%"
            height="20%"
            bg="green.100"
            borderBottomRightRadius="full"
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              width="80%"
              height="80%"
              bg="green.200"
              borderBottomRightRadius="full"
            />
          </Box>

          {/* Bottom right decoration */}
          <Box
            position="absolute"
            bottom={0}
            right={0}
            width="30%"
            height="15%"
            bg="green.50"
            borderTopLeftRadius="full"
          />

          <View style={styles.contentContainer}>
            <Box alignItems="center" mb={8}>
              <Box
                width="80px"
                height="80px"
                borderRadius="full"
                bg="green.100"
                justifyContent="center"
                alignItems="center"
                mb={2}
              >
                <Icon name="lock-reset" size={40} color="#059669" />
              </Box>
              <Text fontSize="24" fontWeight="bold" color="green.600">
                Reset PIN
              </Text>
              <Text fontSize="14" color="gray.500" textAlign="center">
                Please enter your new 4-digit PIN
              </Text>
            </Box>

            <VStack width="100%" space={4}>
              <Box>
                <Text fontSize="16" fontWeight="500" mb={3} color="gray.700">
                  New 4-digit PIN
                </Text>
                <CodeField
                  value={newPin}
                  onChangeText={setNewPin}
                  cellCount={4}
                  rootStyle={{
                    marginBottom: 10,
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 8
                  }}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  renderCell={({ index, symbol, isFocused }) => (
                    <Box
                      key={index}
                      width="60px"
                      height="60px"
                      borderWidth={1}
                      borderColor="green.200"
                      borderRadius={8}
                      justifyContent="center"
                      alignItems="center"
                      backgroundColor="green.50"
                      shadow={isFocused ? 2 : 1}
                    >
                      <Text fontSize={24} color="green.700" fontWeight="bold">
                        {symbol ? '•' : isFocused ? <Cursor /> : null}
                      </Text>
                    </Box>
                  )}
                />
              </Box>

              <Box>
                <Text fontSize="16" fontWeight="500" mb={3} color="gray.700">
                  Confirm 4-digit PIN
                </Text>
                <CodeField
                  value={confirmPin}
                  onChangeText={setConfirmPin}
                  cellCount={4}
                  rootStyle={{
                    marginBottom: 10,
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 8
                  }}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  renderCell={({ index, symbol, isFocused }) => (
                    <Box
                      key={index}
                      width="60px"
                      height="60px"
                      borderWidth={1}
                      borderColor="green.200"
                      borderRadius={8}
                      justifyContent="center"
                      alignItems="center"
                      backgroundColor="green.50"
                      shadow={isFocused ? 2 : 1}
                    >
                      <Text fontSize={24} color="green.700" fontWeight="bold">
                        {symbol ? '•' : isFocused ? <Cursor /> : null}
                      </Text>
                    </Box>
                  )}
                />
              </Box>

              {pinError ? (
                <Box flexDirection="row" alignItems="center" mt={2}>
                  <Icon name="alert-circle-outline" size={20} color="#EF4444" style={{ marginRight: 6 }} />
                  <Text color="red.500" fontSize={14} flex={1}>{pinError}</Text>
                </Box>
              ) : null}

              <Button
                onPress={handleSubmit}
                width="100%"
                mt={6}
                backgroundColor="green.500"
                _pressed={{ backgroundColor: "green.600" }}
                padding={4}
                borderRadius={8}
                isLoading={loading}
                isLoadingText="Resetting PIN"
                shadow={3}
              >
                <Text color="white" fontSize="16" fontWeight="bold">
                  RESET PIN
                </Text>
              </Button>
            </VStack>
          </View>

          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <Center flex={1} backgroundColor="rgba(0,0,0,0.5)">
              <Box
                width="85%"
                maxWidth="320px"
                padding={8}
                backgroundColor="white"
                borderRadius={16}
                alignItems="center"
                shadow={5}
              >
                <Box
                  width="80px"
                  height="80px"
                  borderRadius="full"
                  backgroundColor="green.500"
                  justifyContent="center"
                  alignItems="center"
                  mb={6}
                  shadow={3}
                >
                  <Icon name="check" size={40} color="white" />
                </Box>

                <Text fontSize="18" fontWeight="bold" textAlign="center" mb={2} color="gray.800">
                  PIN Reset Successful!
                </Text>

                <Text fontSize="14" textAlign="center" mb={8} color="gray.600">
                  Your new 4-digit PIN has been updated successfully. You can now login with your new PIN.
                </Text>

                <Button
                  backgroundColor="green.500"
                  _pressed={{ backgroundColor: "green.600" }}
                  width="140px"
                  height="48px"
                  borderRadius={8}
                  shadow={2}
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate('SignInScreen');
                  }}
                >
                  <Text color="white" fontWeight="bold" fontSize="16">
                    Login Now
                  </Text>
                </Button>
              </Box>
            </Center>
          </Modal>
        </Box>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    width: width * 0.9,
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
});