import React from "react";
import { Image } from "react-native";
import {
  Box,
  Text,
  Input,
  Button,
  VStack,
  Pressable,
} from "native-base";

export default function LoginScreen({ navigation }) {
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

      {/* <Image
        source={require("../../assets/images/xpertLogo.jpeg")}
        style={{ width: 180, height: 180, marginBottom: 20 }} /> */}

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
            secureTextEntry
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
          onPress={() => navigation.navigate('DrawerNav')}
          width="100%"
          mt={5}
          backgroundColor="#74c474"
          padding={3}
          borderRadius={8}
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