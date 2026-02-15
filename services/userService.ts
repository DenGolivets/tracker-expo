import {
  arrayUnion,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export const saveUser = async (user: any) => {
  if (!user) return;

  const userRef = doc(db, "users", user.id);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const data = {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      fullName: user.fullName,
      imageUrl: user.imageUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(userRef, data);
      console.log("User saved to Firestore");
    } catch (error) {
      console.error("Error saving user to Firestore:", error);
      throw error;
    }
  } else {
    try {
      await setDoc(userRef, { updatedAt: serverTimestamp() }, { merge: true });
    } catch (error) {
      console.error("Error updating user in Firestore:", error);
      throw error;
    }
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

export const saveUserProfile = async (
  userId: string,
  profileData: any,
  isCompleted: boolean = true,
) => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      {
        ...profileData,
        onboardingCompleted: isCompleted,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    console.log("User profile saved to Firestore");
  } catch (error) {
    console.error("Error saving user profile:", error);
    throw error;
  }
};

export const saveUserPlan = async (userId: string, planData: any) => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      {
        nutritionPlan: planData,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    console.log("User plan saved to Firestore");
  } catch (error) {
    console.error("Error saving user plan:", error);
    throw error;
  }
};

export const completeOnboarding = async (userId: string) => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      {
        onboardingCompleted: true,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    console.log("Onboarding marked as complete");
  } catch (error) {
    console.error("Error completing onboarding:", error);
    throw error;
  }
};

export const getDailyLogs = async (userId: string, date: string) => {
  try {
    const logRef = doc(db, "users", userId, "logs", date);
    const logSnap = await getDoc(logRef);

    if (logSnap.exists()) {
      const data = logSnap.data();
      const exercises = (data.exercises || []).map(
        (ex: any, index: number) => ({
          ...ex,
          id: ex.id || `ex-${index}`,
        }),
      );
      const meals = (data.meals || []).map((meal: any, index: number) => ({
        ...meal,
        id: meal.id || `meal-${index}`,
      }));
      return [...exercises, ...meals];
    }
    return [];
  } catch (error) {
    console.error("Error getting daily logs:", error);
    throw error;
  }
};

export const addDailyLog = async (userId: string, logData: any) => {
  try {
    const date = logData.date || new Date().toISOString().split("T")[0];
    const logRef = doc(db, "users", userId, "logs", date);

    const validTypes = ["exercise", "food"];
    if (!validTypes.includes(logData.type)) {
      throw new Error(
        `Invalid log type: "${logData.type}". Expected "exercise" or "food".`,
      );
    }

    const typeKey = logData.type === "exercise" ? "exercises" : "meals";
    const prefix = logData.type === "exercise" ? "ex" : "meal";

    // Ensure unique ID exists for stable React keys and future operations
    const finalLogData = {
      ...logData,
      id:
        logData.id ||
        `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };

    await setDoc(
      logRef,
      {
        [typeKey]: arrayUnion({
          ...finalLogData,
          createdAt: new Date().toISOString(), // arrayUnion doesn't support serverTimestamp inside objects
        }),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    console.log(`Daily ${logData.type} log added to document: ${date}`);
    return date;
  } catch (error) {
    console.error("Error adding daily log:", error);
    throw error;
  }
};

export const getWaterIntake = async (userId: string, date: string) => {
  try {
    const logRef = doc(db, "users", userId, "logs", date);
    const logSnap = await getDoc(logRef);
    if (logSnap.exists()) {
      return logSnap.data().waterIntake || 0;
    }
    return 0;
  } catch (error) {
    console.error("Error getting water intake:", error);
    throw error;
  }
};

export const updateWaterIntake = async (
  userId: string,
  date: string,
  liters: number,
) => {
  try {
    const logRef = doc(db, "users", userId, "logs", date);
    await setDoc(
      logRef,
      {
        waterIntake: increment(liters),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    console.log("Water intake incremented in logs");
  } catch (error) {
    console.error("Error updating water intake:", error);
    throw error;
  }
};
