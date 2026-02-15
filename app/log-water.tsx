import { StyledButton } from "@/components/StyledButton";
import { Colors } from "@/constants/Colors";
import {
  getUserProfile,
  getWaterIntake,
  updateWaterIntake,
} from "@/services/userService";
import { parseMacro } from "@/utils/macroUtils";
import { useUser } from "@clerk/clerk-expo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  ArrowLeft01Icon,
  MinusSignIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const GLASS_CAPACITY = 250; // 250ml per glass
const INCREMENT = 125; // 0.5 glass = 125ml
const SESSION_MAX = 5000; // Absolute safety cap (5L)

export default function LogWaterScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [waterAmount, setWaterAmount] = useState(0); // The amount being added in this session
  const [dbTotal, setDbTotal] = useState(0); // The current total from database
  const [dailyTarget, setDailyTarget] = useState(2000); // Daily target in ml
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      const dateString = new Date().toISOString().split("T")[0];
      try {
        const [amount, profile] = await Promise.all([
          getWaterIntake(user.id, dateString),
          getUserProfile(user.id),
        ]);

        setDbTotal(Math.round(amount * 1000));

        if (profile?.nutritionPlan?.waterIntake) {
          const targetInLiters = parseMacro(profile.nutritionPlan.waterIntake);
          setDailyTarget(Math.round(targetInLiters * 1000));
        }
      } catch (error) {
        console.error("Error fetching water data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  // Use the larger of target or current intake to allow logging over target if needed,
  // but the user's prompt suggests a capping logic. Let's use dailyTarget as the baseline cap.
  const effectiveMaxTarget = dailyTarget > 0 ? dailyTarget : SESSION_MAX;
  const isAtLimit = dbTotal + waterAmount >= effectiveMaxTarget;

  const handleIncrease = () => {
    if (!isAtLimit) {
      setWaterAmount((prev) => prev + INCREMENT);
    }
  };

  const handleDecrease = () => {
    if (waterAmount > 0) {
      setWaterAmount((prev) => prev - INCREMENT);
    }
  };

  const handleLogWater = async () => {
    if (!user?.id || isSaving || waterAmount === 0) return;

    try {
      setIsSaving(true);
      const dateString = new Date().toISOString().split("T")[0];
      // Increment by the session delta (converted to liters)
      await updateWaterIntake(user.id, dateString, waterAmount / 1000);
      router.dismissAll();
    } catch (error) {
      console.error("Error logging water:", error);
      Alert.alert("Помилка", "Не вдалося зберегти запис. Спробуйте ще раз.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderGlasses = () => {
    const glasses = [];
    let remaining = waterAmount;

    // Special case for empty state
    if (remaining === 0) {
      return (
        <Image
          source={require("@/assets/images/empty_glass.png")}
          style={styles.glassImageSmall}
          resizeMode="contain"
        />
      );
    }

    // Dynamic number of glasses based on SESSION_MAX or target
    const maxGlassesToShow = Math.ceil(effectiveMaxTarget / GLASS_CAPACITY);

    // Logic for filling glasses
    for (let i = 0; i < maxGlassesToShow; i++) {
      if (remaining <= 0) break;

      if (remaining >= GLASS_CAPACITY) {
        glasses.push(
          <Image
            key={`full-${i}`}
            source={require("@/assets/images/full_glass.png")}
            style={styles.glassImageSmall}
            resizeMode="contain"
          />,
        );
        remaining -= GLASS_CAPACITY;
      } else if (remaining >= INCREMENT) {
        glasses.push(
          <Image
            key={`half-${i}`}
            source={require("@/assets/images/half_glass.png")}
            style={styles.glassImageSmall}
            resizeMode="contain"
          />,
        );
        remaining -= INCREMENT;
      }
    }

    return <View style={styles.glassesGrid}>{glasses}</View>;
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
          <MaterialCommunityIcons
            name="water"
            size={24}
            color={Colors.primary[500]}
          />
          <Text style={styles.pageTitle}>Додати воду</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.glassContainer}>{renderGlasses()}</View>

        <View style={styles.controlsWrapper}>
          <View style={styles.controls}>
            <TouchableOpacity
              onPress={handleDecrease}
              style={[
                styles.controlButton,
                (waterAmount === 0 || isSaving) && styles.disabledButton,
              ]}
              disabled={waterAmount === 0 || isSaving}
            >
              <HugeiconsIcon
                icon={MinusSignIcon}
                size={32}
                color={
                  waterAmount === 0 || isSaving
                    ? Colors.neutral[300]
                    : Colors.primary[500]
                }
              />
            </TouchableOpacity>

            <View style={styles.amountIndicator}>
              <Text style={styles.amountText}>{waterAmount}</Text>
              <Text style={styles.unitText}>мл</Text>
            </View>

            <TouchableOpacity
              onPress={handleIncrease}
              style={[
                styles.controlButton,
                (isAtLimit || isSaving) && styles.disabledButton,
              ]}
              disabled={isAtLimit || isSaving}
            >
              <HugeiconsIcon
                icon={PlusSignIcon}
                size={32}
                color={
                  isAtLimit || isSaving
                    ? Colors.neutral[300]
                    : Colors.primary[500]
                }
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.helperText}>Одна повна склянка = 250 мл</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <StyledButton
          title="Записати"
          onPress={handleLogWater}
          isLoading={isSaving || isLoading}
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
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  glassContainer: {
    height: 300,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  glassImageSmall: {
    width: 120,
    height: 160,
  },
  glassesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: 10,
  },
  controlsWrapper: {
    alignItems: "center",
    width: "100%",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "80%",
    backgroundColor: Colors.neutral[0],
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: Colors.neutral[50],
  },
  amountIndicator: {
    alignItems: "center",
  },
  amountText: {
    fontSize: 48,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  unitText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.muted,
  },
  helperText: {
    fontSize: 14,
    color: Colors.text.muted,
    marginTop: 20,
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
