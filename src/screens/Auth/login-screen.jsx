import React, { useState } from "react";
import { CodeField, Cursor } from 'react-native-confirmation-code-field';
import { Box, Text, Input, Button, VStack, Pressable } from "native-base";

export default function LoginScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phoneNumber || !pin) {
      Alert.alert("Error", "Please enter both phone number and PIN.");
      return;
    }
    if (pin.length !== 4) {
      Alert.alert("Error", "PIN must be 4 digits.");
      return;
    }

    setLoading(true);

    try {

      navigation.navigate("DrawerNav");

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong. Please try again.");
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
      </Box>

      <Text
        fontSize="20"
        fontWeight="bold"
        color="green.500"
        mb={5}
      >
        Login
      </Text>

      <VStack width="100%" space={2}>
        <Box>
          <Text fontSize="16" fontWeight={500} mb={1} color="black">
            Phone Number
          </Text>
          <Input
            variant="filled"
            width="100%"
            height={10}
            backgroundColor="#e5f3e5"
            paddingLeft={2}
            borderRadius={8}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter phone number"
          />
        </Box>

        <Box>
          <Text fontSize="16" fontWeight={500} mb={1} color="black">
            4-digit PIN
          </Text>
          <CodeField
            value={pin}
            onChangeText={setPin}
            cellCount={4}
            rootStyle={{
              marginBottom: 20,
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
          <Pressable
            onPress={() => navigation.navigate("ForgotPasswordScreen")}
            alignSelf="flex-end"
            mt={1}
          >
            <Text fontSize="13" color="black" textDecorationLine="underline">
              Forgot PIN?
            </Text>
          </Pressable>
        </Box>

        <Button
          onPress={handleLogin}
          width="100%"
          mt={5}
          backgroundColor="#74c474"
          padding={3}
          borderRadius={8}
          isLoading={loading}
        >
          <Text color="white" fontWeight="bold" onPress={handleLogin}>
            LOGIN
          </Text>
        </Button>

        <Box mt={5} flexDirection="row" justifyContent="center">
          <Text fontSize="15" color="black" className="text-[16px] font-semibold">
            Do not have an account?{" "}
          </Text>
          <Pressable onPress={() => navigation.navigate("SignupScreen")}>
            <Text fontSize="15" color="#74c474" fontWeight="bold">
              Register
            </Text>
          </Pressable>
        </Box>
      </VStack>
    </Box>
  );
}