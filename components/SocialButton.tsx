import { Colors } from "@/constants/Colors";
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
        return "Продолжить через Google";
      case "apple":
        return "Продолжить через Apple";
      case "facebook":
        return "Продолжить через Facebook";
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
        color={Colors.text.primary}
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
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 16,
    marginTop: 12,
  },
  icon: {
    marginRight: 12,
  },
  text: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: "600",
  },
});
