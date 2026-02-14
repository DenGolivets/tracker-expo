import { StyledButton } from "@/components/StyledButton";
import { StyledInput } from "@/components/StyledInput";
import { Colors } from "@/constants/Colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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

interface EditNutritionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (targets: {
    dailyCalories: number;
    protein: string;
    fats: string;
    carbs: string;
  }) => Promise<void>;
  initialValues: {
    dailyCalories: number;
    protein: string;
    fats: string;
    carbs: string;
  };
}

export const EditNutritionModal: React.FC<EditNutritionModalProps> = ({
  isVisible,
  onClose,
  onSave,
  initialValues,
}) => {
  const [values, setValues] = useState(initialValues);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setValues(initialValues);
    }
  }, [isVisible, initialValues]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(values);
      onClose();
    } catch (error) {
      console.error("Failed to save nutrition targets:", error);
    } finally {
      setIsSaving(false);
    }
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
                  <Text style={styles.title}>Редагувати цілі</Text>
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
                    label="Денна норма калорій (ккал)"
                    placeholder="2000"
                    keyboardType="numeric"
                    value={values.dailyCalories.toString()}
                    onChangeText={(t) =>
                      setValues((p) => ({
                        ...p,
                        dailyCalories: parseInt(t) || 0,
                      }))
                    }
                    icon="flame-outline"
                  />

                  <View style={styles.macrosRow}>
                    <View style={styles.macroCol}>
                      <View style={styles.macroHeader}>
                        <MaterialCommunityIcons
                          name="dumbbell"
                          size={18}
                          color={Colors.semantic.info}
                        />
                        <Text style={styles.customLabel}>Білки</Text>
                      </View>
                      <StyledInput
                        placeholder="160"
                        keyboardType="numeric"
                        value={values.protein.replace("г", "")}
                        onChangeText={(t) =>
                          setValues((p) => ({ ...p, protein: t }))
                        }
                      />
                    </View>
                    <View style={styles.macroCol}>
                      <View style={styles.macroHeader}>
                        <MaterialCommunityIcons
                          name="oil"
                          size={18}
                          color={Colors.semantic.warning}
                        />
                        <Text style={styles.customLabel}>Жири</Text>
                      </View>
                      <StyledInput
                        placeholder="70"
                        keyboardType="numeric"
                        value={values.fats.replace("г", "")}
                        onChangeText={(t) =>
                          setValues((p) => ({ ...p, fats: t }))
                        }
                      />
                    </View>
                    <View style={styles.macroCol}>
                      <View style={styles.macroHeader}>
                        <MaterialCommunityIcons
                          name="barley"
                          size={18}
                          color={Colors.semantic.success}
                        />
                        <Text style={styles.customLabel}>Вугл.</Text>
                      </View>
                      <StyledInput
                        placeholder="250"
                        keyboardType="numeric"
                        value={values.carbs.replace("г", "")}
                        onChangeText={(t) =>
                          setValues((p) => ({ ...p, carbs: t }))
                        }
                      />
                    </View>
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
  macrosRow: {
    flexDirection: "row",
    gap: 12,
  },
  macroCol: {
    flex: 1,
  },
  macroHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 4,
    marginBottom: 8,
  },
  customLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text.primary,
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
