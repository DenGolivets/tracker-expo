import { useAuth, useUser } from "@clerk/clerk-expo";
import { Button, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const { signOut } = useAuth();
  const { user } = useUser();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Добро пожаловать в Трекер Калорий</Text>
      <Text style={styles.subtitle}>
        Здравствуйте,{" "}
        {user?.fullName || user?.primaryEmailAddress?.emailAddress}
      </Text>

      <View style={styles.buttonContainer}>
        <Button title="Выйти" onPress={() => signOut()} />
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
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 20,
  },
});
