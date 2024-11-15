import React, { useState } from "react";
import { Image, Modal } from "react-native";
import {
  View,
  Text,
  Button,
  Input,
  VStack,
  Pressable,
  Center,
  Box
} from "native-base";
import CustomIcon from '../../components/CustomIcon';

export default function ResetPassword({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = () => {
    if (newPassword && confirmPassword && newPassword === confirmPassword) {
      setModalVisible(true);
    } else {
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, backgroundColor: 'white' }}>

      <Box position="absolute" top={0} left={0}>
        <Image
          source={require("../../assets/images/top-left-decoration.png")}
          style={{ width: 208, height: 144 }}
        />
        <CustomIcon
          library="AntDesign"
          name={showPassword ? "eye" : "eyeo"}
          size={5}
        />
      </Box>
      <Image
        source={require("../../assets/images/xpertLogo.jpeg")}
        style={{ width: 180, height: 180, marginBottom: 10 }} />
      <Text fontSize="22" fontWeight="bold" marginBottom={5}>
        Reset Password
      </Text>

      <Image
        source={require("../../assets/images/teenyicons_password-outline.png")}
        style={{ width: 40, height: 40, marginBottom: 20 }}
      />

      <Text fontSize="14" marginBottom={5} textAlign="center">
        Please enter your new password
      </Text>

      <VStack space={4} width="100%">
        <Input
          placeholder="New password"
          variant="filled"
          height={12}
          backgroundColor="#e5f3e5"
          borderRadius={8}
          secureTextEntry={!showPassword}
          onChangeText={setNewPassword}
          InputRightElement={
            <Pressable onPress={() => setShowPassword(!showPassword)}>
              <CustomIcon
                library="AntDesign"
                name={showPassword ? "eye" : "eyeo"}
                size={5}
              />
            </Pressable>
          }
        />
        <Input
          placeholder="Confirm new password"
          variant="filled"
          height={12}
          backgroundColor="#e5f3e5"
          borderRadius={8}
          secureTextEntry={!showConfirmPassword}
          onChangeText={setConfirmPassword}
          InputRightElement={
            <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <CustomIcon
                library="AntDesign"
                name={showConfirmPassword ? "eye" : "eyeo"}
                size={5}
              />
            </Pressable>
          }
        />
      </VStack>

      <Button
        onPress={handleSubmit}
        width="100%"
        backgroundColor="#74c474"
        marginTop={5}
        borderRadius={8}
      >
        <Text color="white" fontWeight="bold">Submit</Text>
      </Button>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <Center flex={1} backgroundColor="rgba(0,0,0,0.5)">
          <View style={{ width: 300, padding: 20, backgroundColor: 'white', borderRadius: 10, alignItems: 'center' }}>
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: "#74c474",
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20
            }}>
              <CustomIcon
                library="MaterialIcons"
                name="shield"
                size={30}
                style={{ color: "white" }}
              />
            </View>

            <Text fontSize="16" textAlign="center" marginBottom={5}>
              Your new password has been updated successfully
            </Text>

            <Pressable
              backgroundColor="#74c474"
              paddingY={2}
              paddingX={10}
              borderRadius={5}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate('SignInScreen');
              }}
            >
              <Text color="white" fontWeight="bold">Login</Text>
            </Pressable>
          </View>
        </Center>
      </Modal>
    </View>
  );
}