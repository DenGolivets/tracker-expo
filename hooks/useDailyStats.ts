import {
  getDailyLogs,
  getUserProfile,
  getWaterIntake,
} from "@/services/userService";
import { parseMacro } from "@/utils/macroUtils";
import { useUser } from "@clerk/clerk-expo";
import { useCallback, useEffect, useState } from "react";

export interface DailyStats {
  targetCalories: number;
  consumedCalories: number;
  remainingCalories: number;
  targetWater: number;
  consumedWater: number;
  targets: {
    protein: number;
    fats: number;
    carbs: number;
  };
  consumed: {
    protein: number;
    fats: number;
    carbs: number;
  };
  logs: any[];
  isLoading: boolean;
}

export const useDailyStats = (date: Date) => {
  const { user } = useUser();
  const [stats, setStats] = useState<DailyStats>({
    targetCalories: 2000,
    consumedCalories: 0,
    remainingCalories: 2000,
    targetWater: 2.0,
    consumedWater: 0,
    targets: { protein: 0, fats: 0, carbs: 0 },
    consumed: { protein: 0, fats: 0, carbs: 0 },
    logs: [],
    isLoading: true,
  });

  const dateString = date.toISOString().split("T")[0];

  const fetchStats = useCallback(async () => {
    if (!user?.id) return;

    try {
      setStats((prev) => ({ ...prev, isLoading: true }));

      // 1. Get user targets from profile
      const profile = await getUserProfile(user.id);
      const plan = profile?.nutritionPlan;

      const targets = {
        calories: plan?.dailyCalories || 2000,
        protein: parseMacro(plan?.macros?.protein),
        fats: parseMacro(plan?.macros?.fats),
        carbs: parseMacro(plan?.macros?.carbs),
        water: parseMacro(profile?.nutritionPlan?.waterIntake),
      };

      // 2. Get today's logs and water
      const [logs, waterIntake] = await Promise.all([
        getDailyLogs(user.id, dateString),
        getWaterIntake(user.id, dateString),
      ]);

      const totals = logs.reduce(
        (acc, log: any) => {
          const isExercise = log.type === "exercise";
          const calories = parseMacro(log.calories) || 0;

          if (isExercise) {
            return {
              ...acc,
              burned: acc.burned + calories,
            };
          } else {
            return {
              ...acc,
              consumed: acc.consumed + calories,
              protein: acc.protein + (parseMacro(log.protein) || 0),
              fats: acc.fats + (parseMacro(log.fats) || 0),
              carbs: acc.carbs + (parseMacro(log.carbs) || 0),
            };
          }
        },
        { consumed: 0, burned: 0, protein: 0, fats: 0, carbs: 0 },
      );

      setStats({
        targetCalories: targets.calories,
        consumedCalories: totals.consumed,
        remainingCalories: Math.max(
          0,
          targets.calories + totals.burned - totals.consumed,
        ),
        targetWater: targets.water,
        consumedWater: waterIntake,
        targets: {
          protein: targets.protein,
          fats: targets.fats,
          carbs: targets.carbs,
        },
        consumed: {
          protein: totals.protein,
          fats: totals.fats,
          carbs: totals.carbs,
        },
        logs: logs,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching daily stats:", error);
      setStats((prev) => ({ ...prev, isLoading: false }));
    }
  }, [user?.id, dateString]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { ...stats, refresh: fetchStats };
};
