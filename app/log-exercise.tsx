import { Colors } from "@/constants/Colors";
import {
  ArrowLeft01Icon,
  Dumbbell01Icon,
  Note01Icon,
  RunningShoesIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ExerciseOptionProps {
  icon: any;
  title: string;
  description: string;
  onPress: () => void;
}

const ExerciseOption: React.FC<ExerciseOptionProps> = ({
  icon,
  title,
  description,
  onPress,
}) => (
  <TouchableOpacity
    style={styles.optionCard}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.iconCircle}>
      <HugeiconsIcon icon={icon} size={28} color={Colors.primary[500]} />
    </View>
    <View style={styles.optionTextContainer}>
      <Text style={styles.optionTitle}>{title}</Text>
      <Text style={styles.optionDescription} numberOfLines={1}>
        {description}
      </Text>
    </View>
  </TouchableOpacity>
);

export default function LogExerciseScreen() {
  const router = useRouter();

  const options = [
    {
      id: "run",
      title: "Біг, Ходьба",
      description: "Біг, ходьба, велоспорт тощо",
      icon: RunningShoesIcon,
    },
    {
      id: "lifting",
      title: "Силові вправи",
      description: "Зал, тренажери тощо",
      icon: Dumbbell01Icon,
    },
    {
      id: "manual",
      title: "Вручну",
      description: "Введіть спалені калорії вручну",
      icon: Note01Icon,
    },
  ];

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
          <HugeiconsIcon
            icon={Note01Icon}
            size={24}
            color={Colors.primary[500]}
          />
          <Text style={styles.pageTitle}>Записати вправу</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.optionsList}>
          {options.map((option) => (
            <ExerciseOption
              key={option.id}
              icon={option.icon}
              title={option.title}
              description={option.description}
              onPress={() => {
                if (option.id === "run" || option.id === "lifting") {
                  router.push({
                    pathname: "/exercise-details" as any,
                    params: {
                      id: option.id,
                      title: option.title,
                      description: option.description,
                    },
                  });
                } else if (option.id === "manual") {
                  router.push("/log-manual-calories" as any);
                } else {
                  console.log(`Selected: ${option.id}`);
                }
              }}
            />
          ))}
        </View>
      </ScrollView>
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
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  optionsList: {
    gap: 16,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.neutral[50],
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.text.muted,
  },
});
