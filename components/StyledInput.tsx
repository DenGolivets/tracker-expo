import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

interface StyledInputProps extends TextInputProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
}

export const StyledInput: React.FC<StyledInputProps> = ({
  label,
  icon,
  isPassword = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, isFocused && styles.inputFocused]}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? Colors.primary[500] : Colors.neutral[400]}
            style={styles.icon}
          />
        )}
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.neutral[400]}
          secureTextEntry={isPassword && !showPassword}
          {...props}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color={Colors.neutral[400]}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.neutral[100],
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "transparent",
    height: 56,
  },
  inputFocused: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.background,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: "100%",
    color: Colors.text.primary,
    fontSize: 16,
  },
});
