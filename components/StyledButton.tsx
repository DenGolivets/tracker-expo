import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

interface StyledButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "outline";
  style?: ViewStyle;
}

export const StyledButton: React.FC<StyledButtonProps> = ({
  title,
  onPress,
  isLoading = false,
  variant = "primary",
  style,
}) => {
  if (variant === "primary") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isLoading}
        style={[styles.container, style]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#6366f1", "#4f46e5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.textPrimary}>{title}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === "outline") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isLoading}
        style={[styles.container, styles.buttonOutline, style]}
      >
        {isLoading ? (
          <ActivityIndicator color="#4f46e5" />
        ) : (
          <Text style={styles.textOutline}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading}
      style={[styles.container, styles.buttonSecondary, style]}
    >
      {isLoading ? (
        <ActivityIndicator color="#4f46e5" />
      ) : (
        <Text style={styles.textSecondary}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 8,
  },
  gradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonSecondary: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonOutline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#4f46e5",
    justifyContent: "center",
    alignItems: "center",
  },
  textPrimary: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  textSecondary: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  textOutline: {
    color: "#4f46e5",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
