import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { StyledButton } from "./StyledButton";
import { StyledInput } from "./StyledInput";

interface WaterIntakeModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (liters: number) => Promise<void>;
  initialValue: number; // in liters
}

export const WaterIntakeModal: React.FC<WaterIntakeModalProps> = ({
  isVisible,
  onClose,
  onSave,
  initialValue,
}) => {
  const [liters, setLiters] = useState(initialValue.toString());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setLiters(initialValue.toString());
    }
  }, [isVisible, initialValue]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(parseFloat(liters) || 0);
      onClose();
    } catch (error) {
      console.error("Error saving water intake:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const addQuick = (amount: number) => {
    const current = parseFloat(liters) || 0;
    setLiters((current + amount).toFixed(2));
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.container}
            >
              <View style={styles.content}>
                <View style={styles.header}>
                  <Text style={styles.title}>Облік води</Text>
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeButton}
                  >
                    <Ionicons
                      name="close"
                      size={24}
                      color={Colors.text.primary}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.form}>
                  <StyledInput
                    label="Вжито води (л)"
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={liters}
                    onChangeText={setLiters}
                    icon="water-outline"
                  />

                  <View style={styles.quickActions}>
                    <TouchableOpacity
                      style={styles.quickButton}
                      onPress={() => addQuick(0.25)}
                    >
                      <Text style={styles.quickButtonText}>+0.25л</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quickButton}
                      onPress={() => addQuick(0.5)}
                    >
                      <Text style={styles.quickButtonText}>+0.5л</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.footer}>
                    <StyledButton
                      title="Скасувати"
                      onPress={onClose}
                      variant="outline"
                      style={styles.cancelButton}
                    />
                    <StyledButton
                      title={isSaving ? "Збереження..." : "Зберегти"}
                      onPress={handleSave}
                      isLoading={isSaving}
                      style={styles.saveButton}
                    />
                  </View>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    width: "100%",
    maxWidth: 400,
  },
  content: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  form: {
    gap: 16,
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    marginBottom: 8,
  },
  quickButton: {
    backgroundColor: Colors.primary[50],
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  quickButtonText: {
    color: Colors.primary[700],
    fontWeight: "600",
  },
  footer: {
    marginTop: 16,
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    marginTop: 0,
  },
  saveButton: {
    flex: 1,
    marginTop: 0,
  },
});
