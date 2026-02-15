import { StyledButton } from "@/components/StyledButton";
import { Colors } from "@/constants/Colors";
import { addDailyLog } from "@/services/userService";
import { useUser } from "@clerk/clerk-expo";
import { ArrowLeft01Icon, FireIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExerciseResultScreen() {
  const router = useRouter();
  const { user } = useUser();
  const params = useLocalSearchParams<{
    calories: string;
    title: string;
    description: string;
    intensity: string;
    duration: string;
    exerciseId: string;
  }>();

  const [isLoading, setIsLoading] = useState(false);

  const handleLogExercise = async () => {
    if (!user?.id || isLoading) return;

    try {
      setIsLoading(true);
      const dateString = new Date().toISOString().split("T")[0];

      await addDailyLog(user.id, {
        name: params.title,
        calories: parseInt(params.calories),
        type: "exercise",
        exerciseId: params.exerciseId, // Required for icon selection in Recent Activity
        description: `${params.description} (${params.duration} хв)`,
        date: dateString,
        intensity: params.intensity,
        duration: params.duration,
      });

      router.dismissAll();
    } catch (error) {
      console.error("Error logging exercise:", error);
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
      </View>

      <View style={styles.content}>
        <View style={styles.fireContainer}>
          <HugeiconsIcon
            icon={FireIcon}
            size={80}
            color={Colors.primary[500]}
          />
        </View>

        <Text style={styles.label}>Ваше тренування спалило</Text>
        <Text style={styles.calories}>{params.calories}</Text>
        <Text style={styles.unit}>Калорій</Text>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Час</Text>
            <Text style={styles.detailValue}>{params.duration} хв</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Інтенсивність</Text>
            <Text style={styles.detailValue}>{params.intensity}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <StyledButton
          title="Записати"
          onPress={handleLogExercise}
          isLoading={isLoading}
        />
      </View>
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
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  fireContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  calories: {
    fontSize: 72,
    fontWeight: "900",
    color: Colors.text.primary,
    lineHeight: 72,
  },
  unit: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.text.muted,
    marginTop: 8,
    marginBottom: 40,
  },
  detailsRow: {
    flexDirection: "row",
    backgroundColor: Colors.neutral[50],
    borderRadius: 24,
    padding: 24,
    width: "100%",
    alignItems: "center",
  },
  detailItem: {
    flex: 1,
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.neutral[200],
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.text.muted,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
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
