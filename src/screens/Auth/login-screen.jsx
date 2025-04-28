import React, { useState } from "react";
import { Image, Alert } from "react-native";
import {
  Box,
  Text,
  Input,
  Button,
  VStack,
  Pressable,
} from "native-base";
import FastImage from "react-native-fast-image";
import { icons } from '../../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    if (!phoneNumber || !password) {
      Alert.alert("Error", "Please enter both phone number and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://xpert-farmer-bc7936403999.herokuapp.com/api/v1/user/auth/login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone_number: phoneNumber,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        const userData = {
          phone_number: phoneNumber,
          ...data.user
        };
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        navigation.navigate("DrawerNav");
      } else {
        Alert.alert("Login Failed", data.message || "An error occurred. Please try again.");
      }
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
      <Box position="absolute" top={0} left={0}>
        <Image
          source={require("../../assets/images/top-left-decoration.png")}
          style={{ width: 208, height: 144 }}
        />
      </Box>

      <Text
        fontSize="20"
        fontWeight="bold"
        color="#74c474"
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
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </Box>

        <Box>
          <Text fontSize="16" fontWeight={500} mb={1} color="black">
            Password
          </Text>
          <Input
            variant="filled"
            width="100%"
            height={10}
            backgroundColor="#e5f3e5"
            paddingLeft={2}
            borderRadius={8}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            InputRightElement={
              <Pressable onPress={toggleShowPassword} mr={2}>
                <FastImage
                  source={showPassword ? icons.eye : icons.eye_close}
                  style={{ width: 24, height: 24 }}
                />
              </Pressable>
            }
          />

          <Pressable
            onPress={() => navigation.navigate("ForgotPasswordScreen")}
            alignSelf="flex-end"
            mt={1}
          >
            <Text fontSize="13" color="black" className="underline">
              Forgot Password?
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
          <Text color="white" fontWeight="bold">
            LOGIN
          </Text>
        </Button>

        <Box mt={5} flexDirection="row" justifyContent="center">
          <Text fontSize="15" color="black">
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
