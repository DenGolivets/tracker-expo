import { SocialButton } from "@/components/SocialButton";
import { StyledButton } from "@/components/StyledButton";
import { StyledInput } from "@/components/StyledInput";
import { useWarmUpBrowser } from "@/hooks/useWarmUpBrowser";
import { useOAuth, useSignUp } from "@clerk/clerk-expo";
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

export default function SignUpScreen() {
  useWarmUpBrowser();
  const { isLoaded, signUp, setActive } = useSignUp();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setLoading(true);

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
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

  const onPressVerify = async () => {
    if (!isLoaded) return;
    setLoading(true);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
      } else {
        console.error(JSON.stringify(completeSignUp, null, 2));
      }
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
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      } else if (!createdSessionId) {
        Alert.alert(
          "Sign Up Header",
          "Google sign-up was cancelled or failed. Please try again.",
        );
      }
    } catch (err: any) {
      console.error("OAuth error", err);
      Alert.alert(
        "Error",
        "An unexpected error occurred during Google sign-up. Please try again later.",
      );
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start your journey with us today</Text>
        </View>

        {!pendingVerification ? (
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
              title="Sign Up"
              onPress={onSignUpPress}
              isLoading={loading}
            />

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>Or register with</Text>
              <View style={styles.line} />
            </View>

            <SocialButton strategy="google" onPress={onGooglePress} />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/sign-in" asChild>
                <Text style={styles.link}>Sign In</Text>
              </Link>
            </View>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={[styles.subtitle, { marginBottom: 20 }]}>
              We&apos;ve sent a verification code to {emailAddress}
            </Text>
            <StyledInput
              label="Verification Code"
              placeholder="123456"
              value={code}
              onChangeText={setCode}
              keyboardType="numeric"
              icon="key-outline"
            />

            <StyledButton
              title="Verify Email"
              onPress={onPressVerify}
              isLoading={loading}
            />
          </View>
        )}
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
