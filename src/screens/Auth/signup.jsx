import React, { useState } from "react";
import { Image } from "react-native";
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

export default function RegisterScreen({ navigation }) {
 const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  return (
    <Box
      flex={1}
      backgroundColor="white"
      justifyContent="center"
      alignItems="center"
      paddingX={6}

    >
      <Box position="absolute" top={0} left={0}>
        <Image
          source={require("../../assets/images/top-left-decoration.png")}
          style={{ width: 208, height: 144 }}
        />
      </Box>
      {/* <Image
        source={require("../../assets/images/xpertLogo.jpeg")}
        style={{ width: 180, height: 180, marginBottom: 10 }} /> */}
      <Text
        fontSize="22"
        fontWeight="bold"
        color="#74c474"
        mb={5}
      >
        Register
      </Text>

      <VStack width="100%" space={4}>
        <Box>
          <Text fontSize="16" fontWeight={500} mb={1} color="black"
            
          >
            First Name
          </Text>
          <Input
            variant="filled"
            bg="#e5f3e5"
            width="100%"
            p={1}
            borderRadius={8}
            required

          />
        </Box>



        <Box>
          <Text fontSize="16" fontWeight={500} mb={1} color="black"
            
          >
            Last Name
          </Text>
          <Input
            variant="filled"
            bg="#e5f3e5"
            width="100%"
            p={1}
            borderRadius={8}
            required

          />
        </Box>

        <Box>
          <Text fontSize="16" fontWeight={500} mb={1} color="black"
            
          >
            Phone Number
          </Text>
          <Input
            variant="filled"
            bg="#e5f3e5"
            width="100%"
            p={1}
            borderRadius={8}
            keyboardType="phone-pad"
            required

          />
        </Box>

        <Box>
          <Text fontSize="16" fontWeight={500} mb={1} color="black"
            
          >
            Email
          </Text>
          <Input
            variant="filled"
            bg="#e5f3e5"
            width="100%"
            p={1}
            borderRadius={8}
            keyboardType="email-address"
            required

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
            InputRightElement={
              <Pressable onPress={toggleShowPassword} mr={2}>
                <FastImage 
                  source={showPassword ? icons.eye : icons.eye_close} 
                  style={{ width: 24, height: 24 }} 
                />
              </Pressable>
            }
            required
          />
        </Box>

        <Button
          onPress={() => navigation.navigate("HomeScreen")}
          width="100%"
          mt={5}
          backgroundColor="#74c474"
          padding={3}
          borderRadius={8}
        >
          <Text color="white" fontWeight="bold">
            REGISTER
          </Text>
        </Button>

        <Box mt={2} flexDirection="row" justifyContent="center">
          <Text fontSize="12" color="black"
            
          >
            Already have an account?{" "}
          </Text>
          <Pressable onPress={() => navigation.navigate("SignInScreen")}>
            <Text fontSize="12" color="#74c474" fontWeight="bold"
              
            >
              Login
            </Text>
          </Pressable>
        </Box>
      </VStack>
    </Box>
  );
}