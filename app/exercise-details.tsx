import { StyledButton } from "@/components/StyledButton";
import { Colors } from "@/constants/Colors";
import { getUserProfile } from "@/services/userService";
import { useUser } from "@clerk/clerk-expo";
import {
  ArrowLeft01Icon,
  Clock01Icon,
  Dumbbell01Icon,
  EnergyIcon,
  Note01Icon,
  RunningShoesIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
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

export default function ExerciseDetailsScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { id, title, description } = useLocalSearchParams<{
    id: string;
    title: string;
    description: string;
  }>();

  const getIcon = () => {
    switch (id) {
      case "run":
        return RunningShoesIcon;
      case "lifting":
        return Dumbbell01Icon;
      default:
        return Note01Icon;
    }
  };

  const [intensity, setIntensity] = useState(1); // 0: Low, 1: Medium, 2: High
  const [duration, setDuration] = useState("30");
  const [selectedChip, setSelectedChip] = useState("30");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const intensityLabels = ["Низька", "Середня", "Висока"];
  const durationChips = ["15", "30", "60", "90"];

  const handleContinue = async () => {
    if (!user?.id || isLoading) return;

    try {
      setIsLoading(true);
      const profile = await getUserProfile(user.id);
      const weight = profile?.weight ? parseFloat(profile.weight) : 70; // Default 70kg

      // MET values mapping
      const metValues: Record<string, number[]> = {
        run: [4.0, 7.5, 10.0],
        lifting: [3.0, 5.0, 7.5],
      };

      const met = metValues[id]?.[intensity] || 5.0;
      const durationHours = parseInt(duration) / 60;
      const calculatedCalories = Math.round(met * weight * durationHours);

      router.push({
        pathname: "/exercise-result" as any,
        params: {
          calories: calculatedCalories.toString(),
          title,
          description: descriptionInput || description,
          intensity: intensityLabels[intensity],
          duration,
          exerciseId: id,
        },
      });
    } catch (error) {
      console.error("Error calculating calories:", error);
      alert("Помилка розрахунку. Спробуйте ще раз.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChipPress = (val: string) => {
    setSelectedChip(val);
    setDuration(val);
  };

  const handleManualDuration = (val: string) => {
    setSelectedChip("");
    setDuration(val.replace(/[^0-9]/g, ""));
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
        <View style={styles.headerTextContainer}>
          <View style={styles.titleRow}>
            <HugeiconsIcon
              icon={getIcon()}
              size={24}
              color={Colors.primary[500]}
            />
            <Text style={styles.pageTitle}>{title}</Text>
          </View>
          <Text style={styles.pageSubtitle} numberOfLines={1}>
            {description}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {/* Intensity Selection */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <HugeiconsIcon
                icon={EnergyIcon}
                size={20}
                color={Colors.primary[500]}
              />
              <Text style={styles.cardTitle}>Інтенсивність тренування</Text>
            </View>

            <View style={styles.sliderContainer}>
              <View style={styles.sliderTrack}>
                <View
                  style={[
                    styles.sliderProgress,
                    { width: `${(intensity / 2) * 100}%` },
                  ]}
                />
                {[0, 1, 2].map((i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.sliderThumb,
                      { left: `${(i / 2) * 100}%` },
                      intensity === i && styles.sliderThumbActive,
                    ]}
                    onPress={() => setIntensity(i)}
                  />
                ))}
              </View>
              <View style={styles.sliderLabels}>
                {intensityLabels.map((label, i) => (
                  <Text
                    key={i}
                    style={[
                      styles.sliderLabel,
                      intensity === i && styles.sliderLabelActive,
                    ]}
                  >
                    {label}
                  </Text>
                ))}
              </View>
            </View>
          </View>

          {/* Duration Selection */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <HugeiconsIcon
                icon={Clock01Icon}
                size={20}
                color={Colors.primary[500]}
              />
              <Text style={styles.cardTitle}>Тривалість (хвилини)</Text>
            </View>

            <View style={styles.chipsContainer}>
              {durationChips.map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.chip,
                    selectedChip === val && styles.chipSelected,
                  ]}
                  onPress={() => handleChipPress(val)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedChip === val && styles.chipTextSelected,
                    ]}
                  >
                    {val} хв
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.manualInputContainer}>
              <Text style={styles.manualLabel}>Ввести вручну:</Text>
              <TextInput
                style={styles.durationInput}
                placeholder="0"
                keyboardType="numeric"
                value={duration}
                onChangeText={handleManualDuration}
                maxLength={3}
              />
              <Text style={styles.unitLabel}>хв</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <HugeiconsIcon
                icon={Note01Icon}
                size={20}
                color={Colors.primary[500]}
              />
              <Text style={styles.cardTitle}>Опис (необов’язково)</Text>
            </View>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Додайте деталі тренування..."
              placeholderTextColor={Colors.neutral[400]}
              multiline
              numberOfLines={3}
              value={descriptionInput}
              onChangeText={setDescriptionInput}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <StyledButton
            title="Продовжити"
            onPress={handleContinue}
            isLoading={isLoading}
            disabled={!duration || parseInt(duration) === 0}
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
  headerTextContainer: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pageSubtitle: {
    fontSize: 13,
    color: Colors.text.muted,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 20,
  },
  card: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  // --- Custom Slider ---
  sliderContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: Colors.neutral[100],
    borderRadius: 3,
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  sliderProgress: {
    position: "absolute",
    left: 0,
    height: "100%",
    backgroundColor: Colors.primary[500],
    borderRadius: 3,
  },
  sliderThumb: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.neutral[0],
    borderWidth: 2,
    borderColor: Colors.neutral[300],
    transform: [{ translateX: -12 }],
  },
  sliderThumbActive: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[500],
    width: 28,
    height: 28,
    borderRadius: 14,
    transform: [{ translateX: -14 }],
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  sliderLabel: {
    fontSize: 12,
    color: Colors.text.muted,
    fontWeight: "500",
  },
  sliderLabelActive: {
    color: Colors.primary[600],
    fontWeight: "700",
  },
  // --- Chips ---
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.neutral[50],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  chipSelected: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.secondary,
  },
  chipTextSelected: {
    color: Colors.neutral[0],
  },
  // --- Manual Input ---
  manualInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.neutral[50],
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  manualLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginRight: 10,
  },
  durationInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
    textAlign: "right",
    padding: 0,
  },
  unitLabel: {
    fontSize: 14,
    color: Colors.text.muted,
    marginLeft: 6,
    fontWeight: "500",
  },
  descriptionInput: {
    fontSize: 14,
    color: Colors.text.primary,
    backgroundColor: Colors.neutral[50],
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
    minHeight: 100,
    textAlignVertical: "top",
  },
  // --- Footer ---
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
    backgroundColor: Colors.neutral[0],
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
});
