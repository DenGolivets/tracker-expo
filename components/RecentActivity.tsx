import { Colors } from "@/constants/Colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Dumbbell01Icon,
  FireIcon,
  Note01Icon,
  RunningShoesIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ActivityLog {
  id: string;
  name: string;
  calories: string | number;
  protein?: string | number;
  fats?: string | number;
  carbs?: string | number;
  time?: string;
  createdAt?: string;
  type?: "food" | "exercise";
  intensity?: string;
  duration?: string;
  exerciseId?: string;
}

interface RecentActivityProps {
  logs: ActivityLog[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ logs }) => {
  const getExerciseIcon = (log: ActivityLog) => {
    // Priority 1: Use specific saved exerciseId
    if (log.exerciseId === "run") return RunningShoesIcon;
    if (log.exerciseId === "lifting") return Dumbbell01Icon;
    if (log.exerciseId === "manual") return Note01Icon;

    // Priority 2: Fallback for existing logs based on title/name
    const name = log.name.toLowerCase();
    if (name.includes("біг") || name.includes("ходьба"))
      return RunningShoesIcon;
    if (name.includes("силові") || name.includes("зал")) return Dumbbell01Icon;

    return Note01Icon;
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString("uk-UA", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  if (logs.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Недавня активність</Text>
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={48}
              color={Colors.primary[500]}
            />
          </View>
          <Text style={styles.emptyText}>Жодних записів за сьогодні</Text>
          <Text style={styles.emptySubtext}>
            Додайте свій перший прийом їжі, щоб почати відстеження!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Недавня активність</Text>
      <View style={styles.list}>
        {logs.map((log, index) => {
          const isExercise = log.type === "exercise";
          const logTime = log.time || formatTime(log.createdAt);

          if (isExercise) {
            return (
              <View key={log.id} style={styles.exerciseCard}>
                <View style={styles.exerciseIconContainer}>
                  <HugeiconsIcon
                    icon={getExerciseIcon(log)}
                    size={32}
                    color={Colors.primary[500]}
                  />
                </View>

                <View style={styles.exerciseInfo}>
                  <Text style={styles.logName}>{log.name}</Text>

                  <View style={styles.cardRow}>
                    <HugeiconsIcon
                      icon={FireIcon}
                      size={14}
                      color={Colors.primary[500]}
                    />
                    <Text style={styles.cardDetailText}>
                      {log.calories} калорій
                    </Text>
                  </View>

                  {(log.intensity || log.duration) && (
                    <View style={styles.cardRow}>
                      <Text style={styles.cardSubDetailText}>
                        {log.intensity && `Інтенсивність: ${log.intensity}`}
                        {log.intensity && log.duration && " • "}
                        {log.duration && `Тривалість: ${log.duration} хв`}
                      </Text>
                    </View>
                  )}
                </View>

                {logTime && <Text style={styles.logTimeTop}>{logTime}</Text>}
              </View>
            );
          }

          return (
            <View key={log.id} style={styles.exerciseCard}>
              <View style={styles.exerciseIconContainer}>
                <MaterialCommunityIcons
                  name="food-apple"
                  size={32}
                  color={Colors.primary[500]}
                />
              </View>

              <View style={styles.exerciseInfo}>
                <Text style={styles.logName}>{log.name}</Text>

                <View style={styles.cardRow}>
                  <HugeiconsIcon
                    icon={FireIcon}
                    size={14}
                    color={Colors.primary[500]}
                  />
                  <Text style={styles.cardDetailText}>{log.calories} ккал</Text>
                </View>

                <View style={styles.cardRow}>
                  <Text style={styles.cardSubDetailText}>
                    П: {log.protein || 0}г • Ж: {log.fats || 0}г • В:{" "}
                    {log.carbs || 0}г
                  </Text>
                </View>
              </View>

              {logTime && <Text style={styles.logTimeTop}>{logTime}</Text>}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 20,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  list: {
    gap: 0,
  },
  logItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  lastLogItem: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  logIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  logInfo: {
    flex: 1,
  },
  logName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 2,
  },
  logStats: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  logTime: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  logTimeTop: {
    fontSize: 12,
    color: Colors.text.secondary,
    position: "absolute",
    top: 12,
    right: 12,
  },
  exerciseCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.neutral[50],
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
    position: "relative",
  },
  exerciseIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: Colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  exerciseInfo: {
    flex: 1,
    gap: 4,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardDetailText: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary[500],
  },
  cardSubDetailText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
});
