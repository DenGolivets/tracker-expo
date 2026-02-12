import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";

interface SocialButtonProps {
  strategy: "google" | "apple" | "facebook";
  onPress: () => void;
  isLoading?: boolean;
  style?: ViewStyle;
}

export const SocialButton: React.FC<SocialButtonProps> = ({
  strategy,
  onPress,
  isLoading,
  style,
}) => {
  const getIconName = () => {
    switch (strategy) {
      case "google":
        return "logo-google";
      case "apple":
        return "logo-apple";
      case "facebook":
        return "logo-facebook";
      default:
        return "logo-google";
    }
  };

  const getTitle = () => {
    switch (strategy) {
      case "google":
        return "Continue with Google";
      case "apple":
        return "Continue with Apple";
      case "facebook":
        return "Continue with Facebook";
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading}
      style={[styles.container, style]}
    >
      <Ionicons
        name={getIconName()}
        size={24}
        color="#1f2937"
        style={styles.icon}
      />
      <Text style={styles.text}>{getTitle()}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    marginTop: 12,
  },
  icon: {
    marginRight: 12,
  },
  text: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
});
