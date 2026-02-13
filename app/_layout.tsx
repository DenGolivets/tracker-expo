import { UserProvider, useUserContext } from "@/context/UserContext";
import { saveUser } from "@/services/userService";
import { tokenCache } from "@/utils/cache";
import {
  ClerkLoaded,
  ClerkProvider,
  useAuth,
  useUser,
} from "@clerk/clerk-expo";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

const AppRouting = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const segments = useSegments();
  const router = useRouter();
  const { hasProfile, profileChecked } = useUserContext();

  // Save user to Firestore on sign-in
  useEffect(() => {
    if (user) {
      saveUser(user);
    }
  }, [user]);

  // Navigation logic
  useEffect(() => {
    if (!isLoaded || !profileChecked) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboarding = (segments[0] as string) === "onboarding";
    const inGeneratingPlan = (segments[0] as string) === "generating-plan";

    if (!isSignedIn) {
      // Not signed in => go to auth
      if (!inAuthGroup) {
        router.replace("/(auth)/sign-in");
      }
    } else {
      // Signed in
      if (inAuthGroup) {
        // Came from auth.
        if (hasProfile) {
          router.replace("/");
        } else {
          router.replace("/onboarding");
        }
      } else if (!inOnboarding && !inGeneratingPlan && !hasProfile) {
        // Trying to access restricted area without completing onboarding
        router.replace("/onboarding");
      } else if ((inOnboarding || inGeneratingPlan) && hasProfile) {
        // Trying to access onboarding when already completed
        router.replace("/");
      }
    }
  }, [isSignedIn, isLoaded, segments, router, profileChecked, hasProfile]);

  return <Slot />;
};

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

  if (!publishableKey) {
    throw new Error(
      "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env",
    );
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <UserProvider>
          <AppRouting />
        </UserProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
