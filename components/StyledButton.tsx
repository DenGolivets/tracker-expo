import { Colors } from "@/constants/Colors";
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
          colors={[Colors.primary[400], Colors.primary[600]]}
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
          <ActivityIndicator color={Colors.primary[500]} />
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
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.neutral[200],
    justifyContent: "center",
    alignItems: "center",
  },
  buttonOutline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: Colors.primary[500],
    justifyContent: "center",
    alignItems: "center",
  },
  textPrimary: {
    color: Colors.text.inverted,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  textSecondary: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  textOutline: {
    color: Colors.primary[500],
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
