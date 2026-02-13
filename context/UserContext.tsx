import { getUserProfile } from "@/services/userService";
import { useUser } from "@clerk/clerk-expo";
import React, { createContext, useContext, useEffect, useState } from "react";

interface UserContextType {
  hasProfile: boolean;
  profileChecked: boolean;
  isLoadingProfile: boolean;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  hasProfile: false,
  profileChecked: false,
  isLoadingProfile: false,
  refreshProfile: async () => {},
});

export const useUserContext = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isLoaded: isClerkLoaded } = useUser();
  const [hasProfile, setHasProfile] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const checkProfile = React.useCallback(async () => {
    if (!user?.id) {
      setHasProfile(false);
      setProfileChecked(true); // Technically checked (no user)
      return;
    }

    setIsLoadingProfile(true);
    try {
      const profile = await getUserProfile(user.id);
      setHasProfile(!!profile?.onboardingCompleted);
    } catch (error) {
      console.error("Error checking profile:", error);
      setHasProfile(false);
    } finally {
      setIsLoadingProfile(false);
      setProfileChecked(true);
    }
  }, [user]);

  useEffect(() => {
    if (isClerkLoaded) {
      checkProfile();
    }
  }, [isClerkLoaded, checkProfile]);

  return (
    <UserContext.Provider
      value={{
        hasProfile,
        profileChecked,
        isLoadingProfile,
        refreshProfile: checkProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
