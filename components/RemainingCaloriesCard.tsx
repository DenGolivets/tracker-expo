import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/Colors";
import { SegmentedHalfCircleProgress30 } from "./HalfProgress";

type Props = {
  remaining: number;
  target: number;
  consumed: number;
  burned: number;
  proteinRemaining: number;
  fatsRemaining: number;
  carbsRemaining: number;
  onEdit: () => void;
};

export function RemainingCaloriesCard({
  remaining,
  target,
  consumed,
  burned,
  proteinRemaining,
  fatsRemaining,
  carbsRemaining,
  onEdit,
}: Props) {
  const progress = Math.min(
    Math.max(((consumed || 0) - (burned || 0)) / (target || 2000), 0),
    1,
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Калорії</Text>
        <TouchableOpacity onPress={onEdit} style={styles.editButton}>
          <Feather name="edit" size={24} color={Colors.primary[500]} />
        </TouchableOpacity>
      </View>

      <View style={styles.mathRow}>
        <View style={styles.mathItem}>
          <Text style={styles.mathValue}>{target}</Text>
          <Text style={styles.mathLabel}>Ціль</Text>
        </View>
        <Text style={styles.mathOperator}>−</Text>
        <View style={styles.mathItem}>
          <Text style={styles.mathValue}>{consumed}</Text>
          <Text style={styles.mathLabel}>Їжа</Text>
        </View>
        <Text style={styles.mathOperator}>+</Text>
        <View style={styles.mathItem}>
          <Text style={styles.mathValue}>{burned}</Text>
          <Text style={styles.mathLabel}>Вправи</Text>
        </View>
      </View>

      <View style={styles.content}>
        <SegmentedHalfCircleProgress30
          progress={progress}
          value={remaining}
          label="Залишилось"
          size={250}
          strokeWidth={34}
          segments={15}
          gapAngle={24}
        />
      </View>

      <View style={styles.macrosContainer}>
        <View style={styles.macroCard}>
          <MaterialCommunityIcons
            name="dumbbell"
            size={28}
            color={Colors.semantic.info}
          />
          <Text style={styles.macroValue}>
            {(proteinRemaining || 0).toFixed(1)}г
          </Text>
          <Text style={styles.macroLabel}>Білків залишилось</Text>
        </View>
        <View style={styles.macroCard}>
          <MaterialCommunityIcons
            name="oil"
            size={28}
            color={Colors.semantic.warning}
          />
          <Text style={styles.macroValue}>
            {(fatsRemaining || 0).toFixed(1)}г
          </Text>
          <Text style={styles.macroLabel}>Жирів залишилось</Text>
        </View>
        <View style={styles.macroCard}>
          <MaterialCommunityIcons
            name="barley"
            size={28}
            color={Colors.semantic.success}
          />
          <Text style={styles.macroValue}>
            {(carbsRemaining || 0).toFixed(1)}г
          </Text>
          <Text style={styles.macroLabel}>Вуглеводів залишилось</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface, // Used Colors.surface instead of Colors.background.card
    borderRadius: 24,
    padding: 20,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  editButton: {
    padding: 8,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 20,
  },
  mathRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  mathItem: {
    alignItems: "center",
    gap: 4,
  },
  mathValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  mathLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  mathOperator: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.muted,
    marginTop: -16,
  },
  macrosContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 12,
  },
  macroCard: {
    flex: 1,
    backgroundColor: Colors.primary[50],
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginTop: 4,
  },
  macroLabel: {
    fontSize: 10,
    color: Colors.text.secondary,
    textAlign: "center",
  },
});
