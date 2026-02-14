import { Colors } from "@/constants/Colors";
import { useAuth, useUser } from "@clerk/clerk-expo";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Профиль</Text>
        <Text style={styles.subtitle}>
          {user?.fullName || user?.primaryEmailAddress?.emailAddress}
        </Text>

        <View style={styles.buttonContainer}>
          <Button title="Выйти" onPress={() => signOut()} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
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
    textAlign: "center",
    marginBottom: 32,
  },
  buttonContainer: {
    width: "100%",
  },
});
