import { Colors } from "@/constants/Colors";
import { useUser } from "@clerk/clerk-expo";
import { Notification01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeHeader() {
  const { user } = useUser();

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <Image
          source={{ uri: user?.imageUrl }}
          style={styles.avatar}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.textContainer}>
          <Text style={styles.greeting}>З поверненням,</Text>
          <Text style={styles.name} numberOfLines={1}>
            {user?.firstName || "Користувач"}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.notificationButton} activeOpacity={0.7}>
        <HugeiconsIcon
          icon={Notification01Icon}
          size={24}
          color={Colors.neutral[800]}
        />
        {/* Optional: Add a red dot for unread notifications if needed later */}
        {/* <View style={styles.badge} /> */}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.neutral[0], // or transparent if preferred
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.neutral[200], // placeholder color
    borderWidth: 1,
    borderColor: Colors.neutral[100],
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: Colors.neutral[500],
    marginBottom: 2,
    fontWeight: "500",
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.neutral[900],
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.neutral[50],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
});
