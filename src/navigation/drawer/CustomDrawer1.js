import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import FastImage from "react-native-fast-image";
import { icons } from "../../constants";
import { Divider } from "native-base";
import { COLORS } from "../../constants/theme";
import AppVersion from "../../components/AppVersion";
import CopyRight from "../../components/CopyRight";

const CustomDrawer1 = (props) => {
  const { navigation } = props;

  return (
    <View style={styles.container}>
      <View className="items-center mt-[35px] flex space-y-4">
        <View>
          <FastImage
            source={icons.avatar}
            className="w-[80px] h-[80px] rounded-full "
          />
        </View>

        <View>
          <View>
            <View className="flex flex-row space-x-1 justify-center">
              <Text
                className="text-white font-bold text-[15px] text-center"
                style={styles.customFont}
              >
                John
              </Text>
              <Text
                className="text-white font-bold text-[15px] text-center"
                style={styles.customFont}
              >
                Doe,
              </Text>
            </View>
            <Text
              className="text-white font-bold text-[15px] text-center"
              style={styles.customFont}
            >
              Admin
            </Text>
          </View>
        </View>
        <Divider className="" style={{ backgroundColor: COLORS.greenAlpha }} />
      </View>
      <DrawerContentScrollView {...props} style={[styles.view]}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* footer */}

      <View className="items-center relative top-[-5px] flex space-y-1">
        <View className="absolute bottom-2">
          <Divider
            className=" w-[82.4%]"
            style={{ backgroundColor: COLORS.greenAlpha }}
          />
          <AppVersion color="white" />
          <CopyRight color="white" />
        </View>
      </View>
    </View>
  );
};

export default CustomDrawer1;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  customFont: {
    fontFamily: "serif",
  },
  view: {
    backgroundColor: "#121212",
    borderRadius: 0,
    marginHorizontal: 0,
    padding: 4,
  },
  margintop: {
    marginTop: 0,
  },
  marginbottom: {
    marginBottom: 0,
  },
  marginvertical: {
    marginVertical: 0,
  },
});
