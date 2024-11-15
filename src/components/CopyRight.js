import React from "react";
import { View, Text } from "react-native";

function CopyRight({ color }) {
  return (
    <View className="w-screen">
      <Text className={`text-gray-400 text-center text-[11px]`}>
        &copy; {new Date().getFullYear()} XpertFarmer.
      </Text>
    </View>
  );
}

export default CopyRight;
