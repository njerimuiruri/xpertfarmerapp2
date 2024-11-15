import React from "react";
import { View, Text } from "react-native";

function AppVersion({ color }) {
  return (
    <View className="w-screen mt-0.5">
      <Text
        className={`text-${color ? color : "black"} text-center text-[13px]`}
      >
        Version: 0.0.1
      </Text>
    </View>
  );
}

export default AppVersion;
