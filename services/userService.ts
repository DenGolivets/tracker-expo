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
      await setDoc(userRef, data); // merge: true is default for setDoc? No, merge needs to be specified if we want update. But for new user it's fine.
      console.log("User saved to Firestore");
    } catch (error) {
      console.error("Error saving user to Firestore:", error);
    }
  } else {
    // Optional: Update last login
    try {
      await setDoc(userRef, { updatedAt: serverTimestamp() }, { merge: true });
    } catch (error) {
      console.error("Error updating user in Firestore:", error);
    }
  }
};
