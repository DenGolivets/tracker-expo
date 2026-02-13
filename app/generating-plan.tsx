import { StyledButton } from "@/components/StyledButton";
import { Colors } from "@/constants/Colors";
import { useUserContext } from "@/context/UserContext";
import { generateNutritionPlan } from "@/services/aiService";
import {
  completeOnboarding,
  getUserProfile,
  saveUserPlan,
} from "@/services/userService";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type StepStatus = "pending" | "loading" | "completed";

interface Step {
  id: number;
  label: string;
  status: StepStatus;
}

const INITIAL_STEPS: Step[] = [
  { id: 1, label: "Анализ физических параметров", status: "pending" },
  { id: 2, label: "Расчет суточной нормы калорий", status: "pending" },
  { id: 3, label: "Генерация плана питания через AI", status: "pending" },
  { id: 4, label: "Сохранение персонального плана", status: "pending" },
];

export default function GeneratingPlanScreen() {
  const { user } = useUser();
  const router = useRouter();
  const { refreshProfile } = useUserContext();
  const generationStartedRef = React.useRef(false);

  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  const updateStepStatus = (id: number, status: StepStatus) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === id ? { ...step, status } : step)),
    );
  };

  const startGeneration = React.useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsGenerating(true);
      setError(null);
      setSteps(INITIAL_STEPS);

      // --- Step 1: Physical Parameters (Dummy 2s) ---
      updateStepStatus(1, "loading");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      updateStepStatus(1, "completed");

      // --- Step 2: Calorie Calculation (Dummy 2s) ---
      updateStepStatus(2, "loading");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      updateStepStatus(2, "completed");

      // --- Step 3: AI Generation (REAL) ---
      updateStepStatus(3, "loading");
      const profileData = await getUserProfile(user.id);
      if (!profileData) throw new Error("Профиль пользователя не найден");

      const plan = await generateNutritionPlan(profileData);
      if (!plan)
        throw new Error(
          "Не удалось создать план. Пожалуйста, попробуйте снова.",
        );
      updateStepStatus(3, "completed");

      // --- Step 4: Saving Plan (REAL) ---
      updateStepStatus(4, "loading");
      try {
        await saveUserPlan(user.id, plan);
        await completeOnboarding(user.id);
        updateStepStatus(4, "completed");
      } catch (saveError: any) {
        console.error("Error in Step 4 (Save/Complete):", saveError);
        throw new Error(
          `Ошибка сохранения плана: ${saveError.message || "пожалуйста, проверьте интернет-соединение"}`,
        );
      }

      // --- Finalizing ---
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await refreshProfile();
      router.replace("/");
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "Произошла непредвиденная ошибка");
      setIsGenerating(false);
    }
  }, [user, refreshProfile, router]);

  useEffect(() => {
    if (generationStartedRef.current) return;
    generationStartedRef.current = true;
    startGeneration();
  }, [startGeneration]);

  const renderStep = (step: Step) => (
    <View key={step.id} style={styles.stepRow}>
      <View
        style={[
          styles.iconContainer,
          step.status === "completed" && styles.iconCompleted,
          step.status === "loading" && styles.iconLoading,
        ]}
      >
        {step.status === "completed" ? (
          <Ionicons name="checkmark" size={16} color="#fff" />
        ) : step.status === "loading" ? (
          <ActivityIndicator size="small" color={Colors.primary[500]} />
        ) : (
          <View style={styles.dot} />
        )}
      </View>
      <Text
        style={[
          styles.stepLabel,
          step.status === "loading" && styles.labelLoading,
          step.status === "completed" && styles.labelCompleted,
        ]}
      >
        {step.label}
      </Text>
    </View>
  );

  return (
    <LinearGradient
      colors={[Colors.background, Colors.primary[50]]}
      style={styles.container}
    >
      <SafeAreaView style={styles.content}>
        <View style={styles.mainArea}>
          {isGenerating ? (
            <>
              <View style={styles.headerArea}>
                <View style={styles.loaderCircle}>
                  <ActivityIndicator size="large" color={Colors.primary[500]} />
                </View>
                <Text style={styles.titleText}>Создаем ваш план</Text>
                <Text style={styles.subtitleText}>
                  Это займет около 10-15 секунд
                </Text>
              </View>

              <View style={styles.stepsContainer}>{steps.map(renderStep)}</View>
            </>
          ) : (
            <View style={styles.errorArea}>
              <View
                style={[
                  styles.loaderCircle,
                  { backgroundColor: Colors.neutral[50] },
                ]}
              >
                <Text style={{ fontSize: 40 }}>⚠️</Text>
              </View>
              <Text style={styles.errorTitle}>Ошибка генерации</Text>
              <Text style={styles.errorText}>{error}</Text>
              <StyledButton
                title="Попробовать снова"
                onPress={startGeneration}
                style={{ marginTop: 24, width: 200 }}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  mainArea: {
    flex: 1,
    justifyContent: "center",
  },
  headerArea: {
    alignItems: "center",
    marginBottom: 48,
  },
  loaderCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.neutral[0],
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 24,
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitleText: {
    fontSize: 15,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  stepsContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 24,
    padding: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.neutral[100],
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  iconCompleted: {
    backgroundColor: Colors.semantic.success || "#10b981",
  },
  iconLoading: {
    backgroundColor: Colors.primary[50],
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.neutral[300],
  },
  stepLabel: {
    fontSize: 16,
    color: Colors.text.muted,
    flex: 1,
  },
  labelLoading: {
    color: Colors.text.primary,
    fontWeight: "600",
  },
  labelCompleted: {
    color: Colors.text.secondary,
    textDecorationLine: "none",
  },
  errorArea: {
    alignItems: "center",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.semantic.error,
    marginBottom: 8,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: 16,
  },
});
