import { useAuth, useUser } from "@clerk/clerk-expo";
import { Button, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const { signOut } = useAuth();
  const { user } = useUser();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Calories Tracker</Text>
      <Text style={styles.subtitle}>
        Hello, {user?.fullName || user?.primaryEmailAddress?.emailAddress}
      </Text>

      <View style={styles.buttonContainer}>
        <Button title="Sign Out" onPress={() => signOut()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
  },
});
