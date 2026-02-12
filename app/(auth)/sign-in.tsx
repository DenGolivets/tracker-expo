import { SocialButton } from "@/components/SocialButton";
import { StyledButton } from "@/components/StyledButton";
import { StyledInput } from "@/components/StyledInput";
import { useWarmUpBrowser } from "@/hooks/useWarmUpBrowser";
import { useOAuth, useSignIn } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  useWarmUpBrowser();

  const { signIn, setActive, isLoaded } = useSignIn();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const onSignInPress = async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress,
        password,
      });

      await setActive({ session: completeSignIn.createdSessionId });
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert(
        "Error",
        err.errors ? err.errors[0].message : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  const onGooglePress = async () => {
    setIsGoogleLoading(true);
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();
      if (createdSessionId && typeof setActive === "function") {
        await setActive({ session: createdSessionId });
      } else {
        setIsGoogleLoading(false);
        Alert.alert(
          "Sign In Header",
          "Google sign-in was cancelled or failed. Please try again.",
        );
      }
    } catch (err: any) {
      setIsGoogleLoading(false);
      console.error("OAuth error", err);
      Alert.alert(
        "Error",
        "An unexpected error occurred during Google sign-in.",
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Sign in to continue your journey</Text>
        </View>

        <View style={styles.form}>
          <StyledInput
            label="Email Address"
            placeholder="hello@example.com"
            value={emailAddress}
            onChangeText={setEmailAddress}
            autoCapitalize="none"
            keyboardType="email-address"
            icon="mail-outline"
          />

          <StyledInput
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            isPassword
            icon="lock-closed-outline"
          />

          <StyledButton
            title="Sign In"
            onPress={onSignInPress}
            isLoading={loading}
          />

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.line} />
          </View>

          <SocialButton
            strategy="google"
            onPress={onGooglePress}
            isLoading={isGoogleLoading}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don&apos;t have an account? </Text>
            <Link href="/sign-up" asChild>
              <Text style={styles.link}>Sign Up</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#9ca3af",
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    color: "#6b7280",
    fontSize: 14,
  },
  link: {
    color: "#4f46e5",
    fontSize: 14,
    fontWeight: "600",
  },
});
