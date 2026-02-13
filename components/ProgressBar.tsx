import { Colors } from "@/constants/Colors";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
}) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: (currentStep / totalSteps) * 100,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [currentStep, totalSteps, animatedWidth]);

  const widthInterpolated = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepText}>
          Шаг {currentStep} из {totalSteps}
        </Text>
        <Text style={styles.percentText}>
          {Math.round((currentStep / totalSteps) * 100)}%
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: widthInterpolated }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  stepText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.secondary,
  },
  percentText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary[500],
  },
  track: {
    height: 6,
    backgroundColor: Colors.neutral[200],
    borderRadius: 3,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: Colors.primary[500],
    borderRadius: 3,
  },
});
