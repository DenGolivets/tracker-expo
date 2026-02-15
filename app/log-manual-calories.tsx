import { StyledButton } from "@/components/StyledButton";
import { Colors } from "@/constants/Colors";
import { addDailyLog } from "@/services/userService";
import { useUser } from "@clerk/clerk-expo";
import {
  ArrowLeft01Icon,
  FireIcon,
  Note01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LogManualCaloriesScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [calories, setCalories] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCaloriesChange = (val: string) => {
    setCalories(val.replace(/[^0-9]/g, ""));
  };

  const handleLogCalories = async () => {
    if (!user?.id || !calories || isLoading) return;

    try {
      setIsLoading(true);
      const dateString = new Date().toISOString().split("T")[0];

      const logId = `manual-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      await addDailyLog(user.id, {
        id: logId,
        name: "Вручну (Вправа)",
        calories: parseInt(calories),
        type: "exercise",
        exerciseId: "manual", // This is required for icon selection on the Home screen
        description,
        date: dateString,
      });

      router.dismissAll();
    } catch (error) {
      console.error("Error logging manual calories:", error);
      alert("Не вдалося зберегти запис. Спробуйте ще раз.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            size={24}
            color={Colors.text.primary}
          />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <HugeiconsIcon
            icon={Note01Icon}
            size={24}
            color={Colors.primary[500]}
          />
          <Text style={styles.pageTitle}>Вручну</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <HugeiconsIcon
                icon={FireIcon}
                size={24}
                color={Colors.primary[500]}
              />
              <Text style={styles.cardTitle}>Введіть спалені калорії</Text>
            </View>

            <View style={styles.inputWrapper}>
              <View style={styles.fireRow}>
                <HugeiconsIcon
                  icon={FireIcon}
                  size={32}
                  color={Colors.primary[200]}
                />
                <HugeiconsIcon
                  icon={FireIcon}
                  size={48}
                  color={Colors.primary[400]}
                />
                <HugeiconsIcon
                  icon={FireIcon}
                  size={32}
                  color={Colors.primary[200]}
                />
              </View>

              <TextInput
                style={styles.caloriesInput}
                placeholder="0"
                placeholderTextColor={Colors.neutral[300]}
                keyboardType="numeric"
                value={calories}
                onChangeText={handleCaloriesChange}
                maxLength={4}
                autoFocus
              />
              <Text style={styles.caloriesUnit}>кал</Text>
            </View>

            <Text style={styles.helperText}>
              Вкажіть кількість калорій, які ви розрахували самостійно.
            </Text>

            <View style={styles.descriptionContainer}>
              <Text style={styles.cardTitleSmall}>Опис (необов’язково)</Text>
              <TextInput
                style={styles.descriptionInput}
                placeholder="Додайте деталі тренування..."
                placeholderTextColor={Colors.neutral[400]}
                multiline
                numberOfLines={3}
                value={description}
                onChangeText={setDescription}
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <StyledButton
            title="Записати калорії"
            onPress={handleLogCalories}
            isLoading={isLoading}
            disabled={!calories || parseInt(calories) === 0}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[50],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.neutral[100],
  },
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    alignItems: "center",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  cardTitleSmall: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  inputWrapper: {
    alignItems: "center",
    width: "100%",
  },
  fireRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 16,
    marginBottom: 16,
  },
  caloriesInput: {
    fontSize: 64,
    fontWeight: "800",
    color: Colors.text.primary,
    textAlign: "center",
    width: "100%",
    padding: 0,
  },
  caloriesUnit: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.text.muted,
    marginTop: 8,
  },
  helperText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
    marginTop: 32,
    lineHeight: 20,
    marginBottom: 24,
  },
  descriptionContainer: {
    width: "100%",
    backgroundColor: Colors.neutral[50],
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
  },
  descriptionInput: {
    fontSize: 14,
    color: Colors.text.primary,
    minHeight: 80,
    paddingTop: 0,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
    backgroundColor: Colors.neutral[0],
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
});
