import { Colors } from "@/constants/Colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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
  type?: "food" | "exercise";
}

interface RecentActivityProps {
  logs: ActivityLog[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ logs }) => {
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
        {logs.map((log, index) => (
          <View
            key={log.id}
            style={[
              styles.logItem,
              index === logs.length - 1 && styles.lastLogItem,
            ]}
          >
            <View style={styles.logIconContainer}>
              <MaterialCommunityIcons
                name={log.type === "exercise" ? "run" : "food-apple"}
                size={24}
                color={Colors.primary[500]}
              />
            </View>
            <View style={styles.logInfo}>
              <Text style={styles.logName}>{log.name}</Text>
              <Text style={styles.logStats}>
                {log.calories} ккал • П: {log.protein || 0} • Ж: {log.fats || 0}{" "}
                • В: {log.carbs || 0}
              </Text>
            </View>
            {log.time && <Text style={styles.logTime}>{log.time}</Text>}
          </View>
        ))}
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
});
