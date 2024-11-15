import { createDrawerNavigator } from "@react-navigation/drawer";
import React from "react";
import { StyleSheet } from "react-native";
import CustomDrawer1 from "./CustomDrawer1";
import FastImage from "react-native-fast-image";
import Tabs from "../Tabs";
import { icons } from "../../constants";
import { COLORS } from "../../constants/theme";
import { View } from "react-native";

const Drawer = createDrawerNavigator();

const DrawerNav = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerStyle: styles.drawerStyles,
        headerShown: false,
        drawerActiveTintColor: COLORS.green,
        drawerInactiveTintColor: "white",
        drawerActiveTintColor: COLORS.green,
        drawerLabelStyle: styles.drawerLabelStyle,
      }}
      drawerContent={(props) => <CustomDrawer1 {...props} />}
    >
      <Drawer.Screen
        name="Dashboard"
        component={Tabs}
        options={{
          title: "Dashboard",
          drawerIcon: () => (
            <FastImage
              source={icons.home}
              style={styles.icon}
              tintColor={"white"}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Employees"
        component={Tabs}
        options={{
          title: "Employees",
          drawerIcon: () => (
            <FastImage
              source={icons.employees}
              style={styles.icon}
              tintColor={"white"}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Livestock"
        component={Tabs}
        options={{
          title: "Livestock",
          drawerIcon: () => (
            <FastImage
              source={icons.livestock}
              style={styles.icon}
              tintColor={"white"}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Feeding"
        component={Tabs}
        options={{
          title: "Feeding",
          drawerIcon: () => (
            <FastImage
              source={icons.feeding}
              style={styles.icon}
              tintColor={"white"}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Health"
        component={Tabs}
        options={{
          title: "Health",
          drawerIcon: () => (
            <FastImage
              source={icons.health}
              style={styles.icon}
              tintColor={"white"}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="ProductionRecords"
        component={Tabs}
        options={{
          title: "Production",
          drawerIcon: () => (
            <FastImage
              source={icons.agriculture}
              style={styles.icon}
              tintColor={"white"}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="AnalysisRecords"
        component={Tabs}
        options={{
          title: "Analysis",
          drawerIcon: () => (
            <FastImage
              source={icons.analysis}
              style={styles.icon}
              tintColor={"white"}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={Tabs}
        options={{
          title: "Settings",
          drawerIcon: () => (
            <FastImage
              source={icons.settings}
              style={styles.icon}
              tintColor={"white"}
            />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNav;

const styles = StyleSheet.create({
  drawerStyles: {
    width: "65%",
    backgroundColor: "#121212",
  },
  drawerLabelStyle: {
    color: "white",
    fontSize: 15,
    fontWeight: "800",
    fontFamily: "HelveticaNeue-Medium",
  },
  icon: {
    width: 27,
    height: 27,
  },
});
