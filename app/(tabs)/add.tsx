import { StyledButton } from "@/components/StyledButton";
import { StyledInput } from "@/components/StyledInput";
import { Colors } from "@/constants/Colors";
import { addDailyLog } from "@/services/userService";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddScreen() {
  const { user } = useUser();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    calories: "",
    protein: "",
    fats: "",
    carbs: "",
  });

  const handleSave = async () => {
    if (!user?.id) return;
    if (!form.name || !form.calories) {
      Alert.alert("Помилка", "Будь ласка, введіть назву та калорії");
      return;
    }

    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      await addDailyLog(user.id, {
        ...form,
        calories: parseInt(form.calories) || 0,
        protein: parseInt(form.protein) || 0,
        fats: parseInt(form.fats) || 0,
        carbs: parseInt(form.carbs) || 0,
        date: today,
        timestamp: new Date().getTime(),
      });

      router.back();
    } catch (error) {
      console.error("Error saving log:", error);
      Alert.alert("Помилка", "Не вдалося зберегти запис");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Додати запис</Text>
          <Text style={styles.subtitle}>
            Введіть дані про вжиту їжу або активність
          </Text>

          <View style={styles.form}>
            <StyledInput
              label="Назва (напр. Сніданок)"
              placeholder="Сирники з медом"
              value={form.name}
              onChangeText={(t) => setForm((p) => ({ ...p, name: t }))}
              icon="restaurant-outline"
            />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <StyledInput
                  label="Калорії (ккал)"
                  placeholder="0"
                  keyboardType="numeric"
                  value={form.calories}
                  onChangeText={(t) => setForm((p) => ({ ...p, calories: t }))}
                  icon="flame-outline"
                />
              </View>
              <View style={{ width: 16 }} />
              <View style={{ flex: 1 }}>
                <StyledInput
                  label="Білки (г)"
                  placeholder="0"
                  keyboardType="numeric"
                  value={form.protein}
                  onChangeText={(t) => setForm((p) => ({ ...p, protein: t }))}
                  icon="barbell-outline"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <StyledInput
                  label="Жири (г)"
                  placeholder="0"
                  keyboardType="numeric"
                  value={form.fats}
                  onChangeText={(t) => setForm((p) => ({ ...p, fats: t }))}
                  icon="water-outline"
                />
              </View>
              <View style={{ width: 16 }} />
              <View style={{ flex: 1 }}>
                <StyledInput
                  label="Вуглеводи (г)"
                  placeholder="0"
                  keyboardType="numeric"
                  value={form.carbs}
                  onChangeText={(t) => setForm((p) => ({ ...p, carbs: t }))}
                  icon="leaf-outline"
                />
              </View>
            </View>

            <StyledButton
              title={loading ? "Збереження..." : "Зберегти"}
              onPress={handleSave}
              isLoading={loading}
              style={{ marginTop: 20 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },
  container: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
});
