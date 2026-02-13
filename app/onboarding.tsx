import { ProgressBar } from "@/components/ProgressBar";
import { StyledButton } from "@/components/StyledButton";
import { Colors } from "@/constants/Colors";
import { saveUserProfile } from "@/services/userService";
import { useUser } from "@clerk/clerk-expo";
import {
  BodyPartMuscleIcon,
  Calendar03Icon,
  Dumbbell01Icon,
  Female02Icon,
  Male02Icon,
  RunningShoesIcon,
  Target02Icon,
  WeightScale01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const TOTAL_STEPS = 4;

type Gender = "male" | "female";
type Goal = "gain" | "lose" | "maintain";
type WorkoutFrequency = "2-3" | "3-4" | "5-6";

// --- Option Card Component ---
interface OptionCardProps {
  icon: any;
  label: string;
  sublabel?: string;
  selected: boolean;
  onPress: () => void;
}

const OptionCard: React.FC<OptionCardProps> = ({
  icon,
  label,
  sublabel,
  selected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.optionCard, selected && styles.optionCardSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconCircle, selected && styles.iconCircleSelected]}>
        <HugeiconsIcon
          icon={icon}
          size={28}
          color={selected ? Colors.text.inverted : Colors.primary[500]}
        />
      </View>
      <Text
        style={[styles.optionLabel, selected && styles.optionLabelSelected]}
      >
        {label}
      </Text>
      {sublabel && (
        <Text
          style={[
            styles.optionSublabel,
            selected && styles.optionSublabelSelected,
          ]}
        >
          {sublabel}
        </Text>
      )}
      {selected && <View style={styles.checkmark} />}
    </TouchableOpacity>
  );
};

// --- Main Screen ---
export default function OnboardingScreen() {
  const { user } = useUser();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [fadeAnim] = useState(new Animated.Value(1));

  // Step 1
  const [gender, setGender] = useState<Gender | null>(null);
  // Step 2
  const [goal, setGoal] = useState<Goal | null>(null);
  // Step 3
  const [workoutFrequency, setWorkoutFrequency] =
    useState<WorkoutFrequency | null>(null);
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  // Step 4
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [weight, setWeight] = useState("");

  const animateTransition = (callback: () => void) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      callback();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleNext = () => {
    if (currentStep === 1 && !gender) {
      Alert.alert("Обязательно", "Пожалуйста, выберите ваш пол.");
      return;
    }
    if (currentStep === 2 && !goal) {
      Alert.alert("Обязательно", "Пожалуйста, выберите вашу цель.");
      return;
    }
    if (currentStep === 3) {
      if (!workoutFrequency) {
        Alert.alert("Обязательно", "Пожалуйста, выберите частоту тренировок.");
        return;
      }
      if (!birthDay || !birthMonth || !birthYear) {
        Alert.alert("Обязательно", "Пожалуйста, введите полную дату рождения.");
        return;
      }
    }
    if (currentStep === 4 && (!heightFeet || !weight)) {
      Alert.alert("Обязательно", "Пожалуйста, введите ваш рост и вес.");
      return;
    }

    if (currentStep < TOTAL_STEPS) {
      animateTransition(() => setCurrentStep(currentStep + 1));
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      animateTransition(() => setCurrentStep(currentStep - 1));
    }
  };

  const handleSubmit = async () => {
    const profileData = {
      gender,
      goal,
      workoutFrequency,
      birthdate: `${birthYear}-${birthMonth.padStart(2, "0")}-${birthDay.padStart(2, "0")}`,
      heightFeet: Number(heightFeet),
      heightInches: Number(heightInches || 0),
      weightKg: Number(weight),
    };

    try {
      // Save to AsyncStorage
      await AsyncStorage.setItem("userProfile", JSON.stringify(profileData));

      // Save to Firestore
      if (user?.id) {
        await saveUserProfile(user.id, profileData, false);
      }

      router.replace("/generating-plan" as any);
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert(
        "Ошибка",
        "Не удалось сохранить профиль. Пожалуйста, попробуйте снова.",
      );
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Ваш пол?";
      case 2:
        return "Ваша цель?";
      case 3:
        return "Активность и возраст";
      case 4:
        return "Параметры тела";
      default:
        return "";
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1:
        return "Помогите нам персонализировать ваш опыт";
      case 2:
        return "Мы подберем план специально для вас";
      case 3:
        return "Помогите рассчитать ваши потребности";
      case 4:
        return "Почти готово! Введите ваши измерения";
      default:
        return "";
    }
  };

  // --- Step renderers ---
  const renderStep1 = () => (
    <View style={styles.optionsRow}>
      <OptionCard
        icon={Male02Icon}
        label="Мужской"
        selected={gender === "male"}
        onPress={() => setGender("male")}
      />
      <OptionCard
        icon={Female02Icon}
        label="Женский"
        selected={gender === "female"}
        onPress={() => setGender("female")}
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.optionsColumn}>
      <OptionCard
        icon={BodyPartMuscleIcon}
        label="Набрать вес"
        sublabel="Нарастить мышцы и массу"
        selected={goal === "gain"}
        onPress={() => setGoal("gain")}
      />
      <OptionCard
        icon={RunningShoesIcon}
        label="Похудеть"
        sublabel="Сжечь жир и стать стройнее"
        selected={goal === "lose"}
        onPress={() => setGoal("lose")}
      />
      <OptionCard
        icon={Target02Icon}
        label="Поддержание"
        sublabel="Быть в форме и здоровым"
        selected={goal === "maintain"}
        onPress={() => setGoal("maintain")}
      />
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.step3Container}>
      {/* Workout Frequency */}
      <Text style={styles.sectionTitle}>
        <HugeiconsIcon
          icon={Dumbbell01Icon}
          size={18}
          color={Colors.primary[500]}
        />{" "}
        Частота тренировок
      </Text>
      <View style={styles.optionsRow}>
        {(["2-3", "3-4", "5-6"] as WorkoutFrequency[]).map((freq) => (
          <TouchableOpacity
            key={freq}
            style={[
              styles.freqCard,
              workoutFrequency === freq && styles.freqCardSelected,
            ]}
            onPress={() => setWorkoutFrequency(freq)}
          >
            <Text
              style={[
                styles.freqNumber,
                workoutFrequency === freq && styles.freqNumberSelected,
              ]}
            >
              {freq}
            </Text>
            <Text
              style={[
                styles.freqLabel,
                workoutFrequency === freq && styles.freqLabelSelected,
              ]}
            >
              дней/нед
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Birthdate */}
      <Text style={[styles.sectionTitle, { marginTop: 28 }]}>
        <HugeiconsIcon
          icon={Calendar03Icon}
          size={18}
          color={Colors.primary[500]}
        />{" "}
        Дата рождения
      </Text>
      <View style={styles.dateRow}>
        <View style={styles.dateField}>
          <Text style={styles.dateLabel}>День</Text>
          <TextInput
            style={styles.dateInput}
            placeholder="DD"
            placeholderTextColor={Colors.neutral[400]}
            keyboardType="numeric"
            maxLength={2}
            value={birthDay}
            onChangeText={setBirthDay}
          />
        </View>
        <View style={styles.dateField}>
          <Text style={styles.dateLabel}>Месяц</Text>
          <TextInput
            style={styles.dateInput}
            placeholder="MM"
            placeholderTextColor={Colors.neutral[400]}
            keyboardType="numeric"
            maxLength={2}
            value={birthMonth}
            onChangeText={setBirthMonth}
          />
        </View>
        <View style={styles.datFieldYear}>
          <Text style={styles.dateLabel}>Год</Text>
          <TextInput
            style={styles.dateInput}
            placeholder="ГГГГ"
            placeholderTextColor={Colors.neutral[400]}
            keyboardType="numeric"
            maxLength={4}
            value={birthYear}
            onChangeText={setBirthYear}
          />
        </View>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.step4Container}>
      {/* Height */}
      <Text style={styles.sectionTitle}>
        <HugeiconsIcon
          icon={WeightScale01Icon}
          size={18}
          color={Colors.primary[500]}
        />{" "}
        Рост
      </Text>
      <View style={styles.metricsRow}>
        <View style={styles.metricField}>
          <TextInput
            style={styles.metricInput}
            placeholder="5"
            placeholderTextColor={Colors.neutral[400]}
            keyboardType="numeric"
            maxLength={1}
            value={heightFeet}
            onChangeText={setHeightFeet}
          />
          <Text style={styles.unitLabel}>фт</Text>
        </View>
        <View style={styles.metricField}>
          <TextInput
            style={styles.metricInput}
            placeholder="10"
            placeholderTextColor={Colors.neutral[400]}
            keyboardType="numeric"
            maxLength={2}
            value={heightInches}
            onChangeText={setHeightInches}
          />
          <Text style={styles.unitLabel}>дюйм</Text>
        </View>
      </View>

      {/* Weight */}
      <Text style={[styles.sectionTitle, { marginTop: 28 }]}>
        <HugeiconsIcon
          icon={WeightScale01Icon}
          size={18}
          color={Colors.primary[500]}
        />{" "}
        Вес
      </Text>
      <View style={styles.metricsRow}>
        <View style={[styles.metricField, { flex: 1 }]}>
          <TextInput
            style={styles.metricInput}
            placeholder="70"
            placeholderTextColor={Colors.neutral[400]}
            keyboardType="numeric"
            maxLength={3}
            value={weight}
            onChangeText={setWeight}
          />
          <Text style={styles.unitLabel}>кг</Text>
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
          <Text style={styles.title}>{getStepTitle()}</Text>
          <Text style={styles.subtitle}>{getStepSubtitle()}</Text>

          <View style={styles.formArea}>{renderCurrentStep()}</View>
        </Animated.View>
      </ScrollView>

      <View style={styles.buttonArea}>
        {currentStep > 1 && (
          <StyledButton
            title="Назад"
            onPress={handleBack}
            variant="outline"
            style={{ flex: 1, marginRight: 12 }}
          />
        )}
        <StyledButton
          title={currentStep === TOTAL_STEPS ? "Готово" : "Далее"}
          onPress={handleNext}
          style={{ flex: 1 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  stepContainer: {
    flex: 1,
    paddingTop: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 32,
  },
  formArea: {
    flex: 1,
  },

  // --- Option Cards ---
  optionsRow: {
    flexDirection: "row",
    gap: 16,
  },
  optionsColumn: {
    gap: 16,
  },
  optionCard: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.neutral[200],
  },
  optionCardSelected: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary[100],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  iconCircleSelected: {
    backgroundColor: Colors.primary[500],
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
    textAlign: "center",
  },
  optionLabelSelected: {
    color: Colors.primary[700],
  },
  optionSublabel: {
    fontSize: 13,
    color: Colors.text.muted,
    marginTop: 4,
    textAlign: "center",
  },
  optionSublabelSelected: {
    color: Colors.primary[600],
  },
  checkmark: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary[500],
  },

  // --- Step 3: Frequency ---
  step3Container: {},
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 16,
  },
  freqCard: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.neutral[200],
  },
  freqCardSelected: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
  },
  freqNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  freqNumberSelected: {
    color: Colors.primary[600],
  },
  freqLabel: {
    fontSize: 12,
    color: Colors.text.muted,
    marginTop: 4,
  },
  freqLabelSelected: {
    color: Colors.primary[500],
  },

  // --- Date Inputs ---
  dateRow: {
    flexDirection: "row",
    gap: 12,
  },
  dateField: {
    flex: 1,
  },
  datFieldYear: {
    flex: 1.5,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text.muted,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dateInput: {
    backgroundColor: Colors.neutral[100],
    borderRadius: 12,
    height: 52,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },

  // --- Step 4: Metrics ---
  step4Container: {},
  metricsRow: {
    flexDirection: "row",
    gap: 16,
  },
  metricField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.neutral[100],
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    height: 60,
  },
  metricInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  unitLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.muted,
    marginLeft: 8,
  },

  // --- Footer Buttons ---
  buttonArea: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 8 : 24,
    paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
});
