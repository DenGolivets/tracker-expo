import { ActionMenuModal } from "@/components/ActionMenuModal";
import { WaterIntakeModal } from "@/components/WaterIntakeModal";
import { Colors } from "@/constants/Colors";
import { updateWaterIntake } from "@/services/userService";
import { useUser } from "@clerk/clerk-expo";
import {
  Add01Icon,
  ChartBreakoutSquareIcon,
  Home01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Tabs, usePathname } from "expo-router";
import React, { useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";

const CustomTabButton = (props: any) => {
  const { children, onPress, style, delayLongPress, disabled, ...rest } = props;
  // Remove hoverEffect or other web-specific props that might cause issues if necessary,
  // similar to how we did in the Add button.
  const { hoverEffect, ...sanitizedRest } = rest;

  return (
    <TouchableOpacity
      {...sanitizedRest}
      onPress={onPress}
      disabled={disabled}
      delayLongPress={delayLongPress}
      style={[style, styles.tabBarItem]}
      activeOpacity={0.7}
      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
    >
      {children}
    </TouchableOpacity>
  );
};

export default function TabsLayout() {
  const pathname = usePathname();
  const { user } = useUser();
  const [isActionMenuVisible, setIsActionMenuVisible] = useState(false);
  const [isWaterModalVisible, setIsWaterModalVisible] = useState(false);

  const handleUpdateWater = async (liters: number) => {
    if (!user?.id) return;
    const dateString = new Date().toISOString().split("T")[0];
    try {
      await updateWaterIntake(user.id, dateString, liters);
      // We might need a global refresh mechanism eventually,
      // but for now we update the DB.
    } catch (error) {
      console.error("Error updating water globally:", error);
      throw error;
    }
  };

  const handleAction = (actionId: string) => {
    if (actionId === "add-water") {
      setIsWaterModalVisible(true);
    }
    // Handle other global actions here
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarButton: (props) => (
              <CustomTabButton {...props}>
                <HugeiconsIcon
                  icon={Home01Icon}
                  strokeWidth={2}
                  size={28}
                  color={
                    pathname === "/" || pathname === "/index"
                      ? Colors.primary[500]
                      : Colors.neutral[400]
                  }
                />
              </CustomTabButton>
            ),
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            tabBarButton: (props) => (
              <CustomTabButton {...props}>
                <HugeiconsIcon
                  icon={ChartBreakoutSquareIcon}
                  strokeWidth={2}
                  size={28}
                  color={
                    pathname === "/analytics"
                      ? Colors.primary[500]
                      : Colors.neutral[400]
                  }
                />
              </CustomTabButton>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarButton: (props) => (
              <CustomTabButton {...props}>
                <HugeiconsIcon
                  icon={UserIcon}
                  strokeWidth={2}
                  size={28}
                  color={
                    pathname === "/profile"
                      ? Colors.primary[500]
                      : Colors.neutral[400]
                  }
                />
              </CustomTabButton>
            ),
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            tabBarButton: (props) => {
              const { delayLongPress, disabled, ...rest } = props;
              const { hoverEffect, ...sanitizedRest } = rest as any;

              return (
                <TouchableOpacity
                  {...sanitizedRest}
                  disabled={disabled ?? undefined}
                  delayLongPress={delayLongPress ?? undefined}
                  style={styles.fabButton}
                  activeOpacity={0.8}
                  onPress={() => {
                    setIsActionMenuVisible(true);
                  }}
                >
                  <View style={styles.fabContent}>
                    <HugeiconsIcon icon={Add01Icon} size={28} color="#fff" />
                  </View>
                </TouchableOpacity>
              );
            },
          }}
        />
      </Tabs>
      <ActionMenuModal
        isVisible={isActionMenuVisible}
        onClose={() => setIsActionMenuVisible(false)}
        onAction={handleAction}
      />
      <WaterIntakeModal
        isVisible={isWaterModalVisible}
        onClose={() => setIsWaterModalVisible(false)}
        onSave={handleUpdateWater}
        initialValue={0} // Default to adding fresh water
      />
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 40 : 32,
    marginHorizontal: 20,
    height: 72,
    backgroundColor: Colors.neutral[0],
    borderRadius: 36,
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    paddingBottom: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  tabBarItem: {
    flex: 1,
    height: 72,
    justifyContent: "center",
    alignItems: "center",
  },
  fabButton: {
    flex: 1,
    height: 72,
    justifyContent: "center",
    alignItems: "center",
  },
  fabContent: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
