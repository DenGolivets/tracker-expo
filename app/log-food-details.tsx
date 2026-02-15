import { StyledButton } from "@/components/StyledButton";
import { Colors } from "@/constants/Colors";
import { getFoodDetails } from "@/services/fatSecretService";
import { addDailyLog } from "@/services/userService";
import { useUser } from "@clerk/clerk-expo";
import {
  ArrowLeft01Icon,
  ChefHatIcon,
  FireIcon,
  Moon01Icon,
  PencilEdit01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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

export default function LogFoodDetailsScreen() {
  const router = useRouter();
  const { foodId } = useLocalSearchParams<{ foodId: string }>();
  const { user } = useUser();
  const [food, setFood] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [servingSize, setServingSize] = useState("100");
  const [calories, setCalories] = useState("0");
  const [protein, setProtein] = useState("0");
  const [fat, setFat] = useState("0");
  const [carbs, setCarbs] = useState("0");
  const [baseNutrition, setBaseNutrition] = useState<any>(null);
  const [isLogging, setIsLogging] = useState(false);

  const loadFoodDetails = useCallback(async () => {
    setIsLoading(true);
    const data = await getFoodDetails(foodId);
    if (data) {
      setFood(data);
      // Try to find the first serving
      const primaryServing = Array.isArray(data.servings?.serving)
        ? data.servings.serving[0]
        : data.servings?.serving;

      if (primaryServing) {
        const base = {
          calories: parseFloat(primaryServing.calories) || 0,
          protein: parseFloat(primaryServing.protein) || 0,
          fat: parseFloat(primaryServing.fat) || 0,
          carbs: parseFloat(primaryServing.carbohydrate) || 0,
          servingSize: parseFloat(primaryServing.metric_serving_amount) || 100,
        };
        setBaseNutrition(base);
        setCalories(
          Math.round(parseFloat(primaryServing.calories || "0")).toString(),
        );
        setProtein(parseFloat(primaryServing.protein || "0").toFixed(1));
        setFat(parseFloat(primaryServing.fat || "0").toFixed(1));
        setCarbs(parseFloat(primaryServing.carbohydrate || "0").toFixed(1));
        setServingSize(
          Math.round(
            parseFloat(primaryServing.metric_serving_amount || "100"),
          ).toString(),
        );
      }
    }
    setIsLoading(false);
  }, [foodId]);

  useEffect(() => {
    if (foodId) {
      loadFoodDetails();
    }
  }, [foodId, loadFoodDetails]);

  const handleServingSizeChange = (val: string) => {
    setServingSize(val);
    const newSize = parseFloat(val);
    if (baseNutrition && !isNaN(newSize) && newSize > 0) {
      const ratio = newSize / baseNutrition.servingSize;
      setCalories(Math.round(baseNutrition.calories * ratio).toString());
      setProtein((baseNutrition.protein * ratio).toFixed(1));
      setFat((baseNutrition.fat * ratio).toFixed(1));
      setCarbs((baseNutrition.carbs * ratio).toFixed(1));
    }
  };

  const handeLogFood = async () => {
    if (!user?.id || !food || isLogging) return;

    try {
      setIsLogging(true);
      const dateString = new Date().toISOString().split("T")[0];

      await addDailyLog(user.id, {
        name: food.food_name,
        calories: parseInt(calories),
        protein: parseFloat(protein),
        fats: parseFloat(fat),
        carbs: parseFloat(carbs),
        servingSize: `${servingSize}г`,
        type: "food",
        date: dateString,
      });

      router.dismissAll();
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error logging food:", error);
      alert("Не вдалося зберегти запис.");
    } finally {
      setIsLogging(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            size={24}
            color={Colors.text.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Додати їжу</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.foodName}>{food?.food_name}</Text>

          <View style={styles.inputCard}>
            <View style={styles.inputRow}>
              <View>
                <Text style={styles.inputLabel}>Розмір порції (г)</Text>
                <TextInput
                  style={styles.textInput}
                  value={servingSize}
                  onChangeText={handleServingSizeChange}
                  keyboardType="numeric"
                />
              </View>
              <HugeiconsIcon
                icon={PencilEdit01Icon}
                size={20}
                color={Colors.text.muted}
              />
            </View>
          </View>

          <View style={styles.caloriesCard}>
            <View style={styles.cardHeader}>
              <HugeiconsIcon
                icon={FireIcon}
                size={24}
                color={Colors.primary[500]}
              />
              <Text style={styles.cardTitle}>Калорії</Text>
            </View>
            <View style={styles.caloriesInputRow}>
              <TextInput
                style={styles.caloriesInput}
                value={calories}
                onChangeText={setCalories}
                keyboardType="numeric"
              />
              <Text style={styles.caloriesUnit}>ккал</Text>
            </View>
          </View>

          <View style={styles.macrosContainer}>
            <View style={styles.macroItem}>
              <View style={styles.macroHeader}>
                <HugeiconsIcon
                  icon={ChefHatIcon}
                  size={20}
                  color={Colors.secondary[500]}
                />
                <Text style={styles.macroLabel}>Білки</Text>
              </View>
              <View style={styles.macroInputRow}>
                <TextInput
                  style={styles.macroInput}
                  value={protein}
                  onChangeText={setProtein}
                  keyboardType="numeric"
                />
                <Text style={styles.macroUnit}>г</Text>
              </View>
            </View>

            <View style={styles.macroItem}>
              <View style={styles.macroHeader}>
                <HugeiconsIcon
                  icon={FireIcon}
                  size={20}
                  color={Colors.accent[500]}
                />
                <Text style={styles.macroLabel}>Жири</Text>
              </View>
              <View style={styles.macroInputRow}>
                <TextInput
                  style={styles.macroInput}
                  value={fat}
                  onChangeText={setFat}
                  keyboardType="numeric"
                />
                <Text style={styles.macroUnit}>г</Text>
              </View>
            </View>

            <View style={styles.macroItem}>
              <View style={styles.macroHeader}>
                <HugeiconsIcon
                  icon={Moon01Icon}
                  size={20}
                  color={Colors.primary[500]}
                />
                <Text style={styles.macroLabel}>Вугл.</Text>
              </View>
              <View style={styles.macroInputRow}>
                <TextInput
                  style={styles.macroInput}
                  value={carbs}
                  onChangeText={setCarbs}
                  keyboardType="numeric"
                />
                <Text style={styles.macroUnit}>г</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <StyledButton
            title="Записати"
            onPress={handeLogFood}
            isLoading={isLogging}
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
  center: {
    justifyContent: "center",
    alignItems: "center",
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  content: {
    padding: 20,
    gap: 24,
  },
  foodName: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  inputCard: {
    backgroundColor: Colors.neutral[50],
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.text.muted,
    marginBottom: 4,
  },
  textInput: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text.primary,
    padding: 0,
  },
  caloriesCard: {
    backgroundColor: Colors.primary[50],
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.primary[100],
    alignItems: "center",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary[700],
  },
  caloriesInputRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  caloriesInput: {
    fontSize: 48,
    fontWeight: "800",
    color: Colors.primary[600],
    textAlign: "center",
    padding: 0,
  },
  caloriesUnit: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.primary[300],
  },
  macrosContainer: {
    flexDirection: "row",
    gap: 12,
  },
  macroItem: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
    alignItems: "center",
  },
  macroHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  macroLabel: {
    fontSize: 12,
    color: Colors.text.muted,
    fontWeight: "600",
  },
  macroInputRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  macroInput: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text.primary,
    textAlign: "center",
    padding: 0,
  },
  macroUnit: {
    fontSize: 12,
    color: Colors.text.muted,
    fontWeight: "600",
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.neutral[0],
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
});
