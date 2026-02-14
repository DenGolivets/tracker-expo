import { Colors } from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface WaterIntakeCardProps {
  consumed: number; // in liters
  target: number; // in liters
  onEdit: () => void;
}

// 9 glasses represent the total daily target
const MAX_GLASSES = 9;

export const WaterIntakeCard: React.FC<WaterIntakeCardProps> = ({
  consumed,
  target,
  onEdit,
}) => {
  const oneGlassValue = target / MAX_GLASSES;
  const consumedGlasses = consumed / oneGlassValue;
  const remainingGlasses = Math.max(
    0,
    MAX_GLASSES - Math.floor(consumedGlasses),
  );

  const renderGlasses = () => {
    const glasses = [];

    for (let i = 0; i < MAX_GLASSES; i++) {
      let imageSource;
      if (consumedGlasses >= i + 1) {
        imageSource = require("../assets/images/full_glass.png");
      } else if (consumedGlasses > i && consumedGlasses < i + 1) {
        imageSource = require("../assets/images/half_glass.png");
      } else {
        imageSource = require("../assets/images/empty_glass.png");
      }

      glasses.push(
        <Image key={i} source={imageSource} style={styles.glassIcon} />,
      );
    }
    return glasses;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Вода</Text>
          <Text style={styles.subtitle}>
            {consumed}л / {target}л
          </Text>
        </View>
        <TouchableOpacity onPress={onEdit} style={styles.editButton}>
          <Feather name="edit" size={24} color={Colors.primary[500]} />
        </TouchableOpacity>
      </View>

      <View style={styles.glassesContainer}>{renderGlasses()}</View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Залишилось: <Text style={styles.boldText}>{remainingGlasses}</Text>{" "}
          склянок
        </Text>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  editButton: {
    padding: 8,
  },
  glassesContainer: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  glassIcon: {
    flex: 1,
    height: 32,
    resizeMode: "contain",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
    paddingTop: 12,
  },
  footerText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  boldText: {
    fontWeight: "bold",
    color: Colors.text.primary,
  },
});
