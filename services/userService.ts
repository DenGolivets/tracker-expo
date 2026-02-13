import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
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
