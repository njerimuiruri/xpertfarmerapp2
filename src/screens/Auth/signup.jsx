import React, { useState } from "react";
import { Image, Alert, ActivityIndicator } from "react-native";
import { Box, Text, Input, Button, VStack, Pressable } from "native-base";
import FastImage from "react-native-fast-image";
import { icons } from "../../constants";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: 1, 
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password || !formData.phone_number) {
      Alert.alert("Error", "All fields are required!");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://xpert-farmer-bc7936403999.herokuapp.com/api/v1/user/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          password1: formData.confirmPassword, 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const userData = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone_number: formData.phone_number,
          email: formData.email,
          role: data.role || 'User'
        };
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        Alert.alert("Success", "Registration Successful!");
        navigation.navigate("HomeScreen");
      } else {
        Alert.alert("Error", data.message || "Registration failed");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box flex={1} backgroundColor="white" justifyContent="center" alignItems="center" paddingX={6}>
      <Box position="absolute" top={0} left={0}>
        <Image source={require("../../assets/images/top-left-decoration.png")} style={{ width: 208, height: 144 }} />
      </Box>

      <Text fontSize="22" fontWeight="bold" color="#74c474" mb={5}>Register</Text>

      <VStack width="100%" space={4}>
        {["first_name", "last_name", "phone_number", "email"].map((field, index) => (
          <Box key={index}>
            <Text fontSize="16" fontWeight={500} mb={1} color="black" className="capitalize">
              {field.replace("_", " ")}
            </Text>
            <Input
              variant="filled"
              bg="#e5f3e5"
              width="100%"
              p={1}
              borderRadius={8}
              keyboardType={field === "phone_number" ? "phone-pad" : field === "email" ? "email-address" : "default"}
              value={formData[field]}
              onChangeText={(value) => handleInputChange(field, value)}
            />
          </Box>
        ))}

        {["password", "confirmPassword"].map((field, index) => (
          <Box key={index}>
            <Text fontSize="16" fontWeight={500} mb={1} color="black"className="capitalize">{field === "password" ? "Password" : "Confirm Password"}</Text>
            <Input
              variant="filled"
              width="100%"
              height={10}
              backgroundColor="#e5f3e5"
              paddingLeft={2}
              borderRadius={8}
              secureTextEntry={!showPassword}
              value={formData[field]}
              onChangeText={(value) => handleInputChange(field, value)}
              InputRightElement={
                <Pressable onPress={() => setShowPassword(!showPassword)} mr={2}>
                  <FastImage source={showPassword ? icons.eye : icons.eye_close} style={{ width: 24, height: 24 }} />
                </Pressable>
              }
            />
          </Box>
        ))}

        <Button onPress={handleRegister} width="100%" mt={5} backgroundColor="#74c474" padding={3} borderRadius={8} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text color="white" fontWeight="bold">REGISTER</Text>}
        </Button>

        <Box mt={2} flexDirection="row" justifyContent="center">
          <Text fontSize="12" color="black" className="text-[16px] font-semibold">Already have an account? </Text>
          <Pressable onPress={() => navigation.navigate("SignInScreen")}>
            <Text fontSize="12" color="#74c474" fontWeight="bold" className="text-[16px] font-semibold">Login</Text>
          </Pressable>
        </Box>
      </VStack>
    </Box>
  );
}
