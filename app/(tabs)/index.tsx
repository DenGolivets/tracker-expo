import DateRangePicker from "@/components/DateRangePicker";
import { EditNutritionModal } from "@/components/EditNutritionModal";
import HomeHeader from "@/components/HomeHeader";
import { RecentActivity } from "@/components/RecentActivity";
import { RemainingCaloriesCard } from "@/components/RemainingCaloriesCard";
import { WaterIntakeCard } from "@/components/WaterIntakeCard";
import { WaterIntakeModal } from "@/components/WaterIntakeModal";
import { Colors } from "@/constants/Colors";
import { useDailyStats } from "@/hooks/useDailyStats";
import { saveUserPlan, updateWaterIntake } from "@/services/userService";
import { useUser } from "@clerk/clerk-expo";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { user } = useUser();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isWaterModalVisible, setIsWaterModalVisible] = useState(false);

  const {
    consumedCalories,
    targetCalories,
    remainingCalories,
    consumed,
    targets,
    targetWater,
    consumedWater,
    logs,
    isLoading,
    refresh,
  } = useDailyStats(selectedDate);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const handleSaveTargets = async (newTargets: {
    dailyCalories: number;
    protein: string;
    fats: string;
    carbs: string;
  }) => {
    if (!user?.id) return;

    try {
      await saveUserPlan(user.id, {
        dailyCalories: newTargets.dailyCalories,
        macros: {
          protein: newTargets.protein.endsWith("г")
            ? newTargets.protein
            : `${newTargets.protein}г`,
          fats: newTargets.fats.endsWith("г")
            ? newTargets.fats
            : `${newTargets.fats}г`,
          carbs: newTargets.carbs.endsWith("г")
            ? newTargets.carbs
            : `${newTargets.carbs}г`,
        },
      });
      await refresh();
    } catch (error) {
      console.error("Error saving targets:", error);
      throw error;
    }
  };

  const handleUpdateWater = async (liters: number) => {
    if (!user?.id) return;
    const dateString = selectedDate.toISOString().split("T")[0];
    try {
      await updateWaterIntake(user.id, dateString, liters);
      await refresh();
    } catch (error) {
      console.error("Error updating water:", error);
      throw error;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <HomeHeader />
        <DateRangePicker
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color={Colors.primary[500]} />
          ) : (
            <>
              <RemainingCaloriesCard
                remaining={remainingCalories}
                target={targetCalories}
                consumed={consumedCalories}
                proteinRemaining={Math.max(
                  0,
                  targets.protein - consumed.protein,
                )}
                fatsRemaining={Math.max(0, targets.fats - consumed.fats)}
                carbsRemaining={Math.max(0, targets.carbs - consumed.carbs)}
                onEdit={() => setIsEditModalVisible(true)}
              />

              <WaterIntakeCard
                consumed={consumedWater}
                target={targetWater}
                onEdit={() => setIsWaterModalVisible(true)}
              />

              <RecentActivity logs={logs} />
            </>
          )}
        </ScrollView>

        <EditNutritionModal
          isVisible={isEditModalVisible}
          onClose={() => setIsEditModalVisible(false)}
          onSave={handleSaveTargets}
          initialValues={{
            dailyCalories: targetCalories,
            protein: `${targets.protein}г`,
            fats: `${targets.fats}г`,
            carbs: `${targets.carbs}г`,
          }}
        />

        <WaterIntakeModal
          isVisible={isWaterModalVisible}
          onClose={() => setIsWaterModalVisible(false)}
          onSave={handleUpdateWater}
          initialValue={consumedWater}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 130,
  },
});
