import React, { useState } from "react";
import { Image, Modal } from "react-native";
import { CodeField, Cursor } from 'react-native-confirmation-code-field';
import {
  Box,
  Text,
  Button,
  VStack,
  Center
} from "native-base";

import { useToast } from "native-base";
import { resetPassword } from "../../services/auth";

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
    <Box
      flex={1}
      justifyContent="center"
      alignItems="center"
      paddingX={6}
      backgroundColor="white"
    >
      <Box position="absolute" top={0} left={0} width="208px" height="144px" bg="green.200" borderBottomRightRadius="full">
        <Image
          source={require("../../assets/images/top-left-decoration.png")}
          style={{ width: 208, height: 144 }}
        />
      </Box>

      <Text
        fontSize="22"
        fontWeight="bold"
        color="green.500"
        mb={5}
      >
        Reset Password
      </Text>

      <Image
        source={require("../../assets/images/teenyicons_password-outline.png")}
        style={{ width: 40, height: 40, marginBottom: 5 }}
      />

      <Text fontSize="14" mb={6} textAlign="center" color="black">
        Please enter your new 4-digit PIN
      </Text>

      <VStack width="100%" space={4}>
        <Box>
          <Text fontSize="16" fontWeight={500} mb={1} color="black">
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
                borderWidth={0}
                borderRadius={8}
                justifyContent="center"
                alignItems="center"
                backgroundColor="#e5f3e5"
              >
                <Text fontSize={24}>{symbol ? '•' : isFocused ? <Cursor /> : null}</Text>
              </Box>
            )}
          />
        </Box>

        <Box>
          <Text fontSize="16" fontWeight={500} mb={1} color="black">
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
                borderWidth={0}
                borderRadius={8}
                justifyContent="center"
                alignItems="center"
                backgroundColor="#e5f3e5"
              >
                <Text fontSize={24}>{symbol ? '•' : isFocused ? <Cursor /> : null}</Text>
              </Box>
            )}
          />
        </Box>
        {pinError ? (
          <Text color="red.500" fontSize={13} mt={1}>{pinError}</Text>
        ) : null}
      </VStack>

      <Button
        onPress={handleSubmit}
        width="100%"
        mt={8}
        backgroundColor="#74c474"
        padding={3}
        borderRadius={8}
        isLoading={loading}
      >
        <Text color="white" fontWeight="bold">
          SUBMIT
        </Text>
      </Button>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Center flex={1} backgroundColor="rgba(0,0,0,0.5)">
          <Box
            width="80%"
            maxWidth="300px"
            padding={6}
            backgroundColor="white"
            borderRadius={16}
            alignItems="center"
          >
            <Box
              width="60px"
              height="60px"
              borderRadius="full"
              backgroundColor="#92d192"
              justifyContent="center"
              alignItems="center"
              mb={4}
            >
              <Text fontSize="30" color="white">✓</Text>
            </Box>

            <Text fontSize="16" textAlign="center" mb={5} color="black">
              Your new 4-digit PIN has been updated successfully
            </Text>

            <Button
              backgroundColor="#8ed28e"
              width="120px"
              height="40px"
              borderRadius={8}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate('SignInScreen');
              }}
            >
              <Text color="white" fontWeight="500">
                Login
              </Text>
            </Button>
          </Box>
        </Center>
      </Modal>
    </Box>
  );
}