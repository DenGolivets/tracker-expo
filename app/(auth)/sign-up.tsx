import { SocialButton } from "@/components/SocialButton";
import { StyledButton } from "@/components/StyledButton";
import { StyledInput } from "@/components/StyledInput";
import { Colors } from "@/constants/Colors";
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
        "Помилка",
        err.errors ? err.errors[0].message : "Щось пішло не так",
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
        "Помилка",
        err.errors ? err.errors[0].message : "Щось пішло не так",
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
          "Реєстрація",
          "Реєстрація через Google була скасована або сталася помилка. Будь ласка, спробуйте ще раз.",
        );
      }
    } catch (err: any) {
      console.error("OAuth error", err);
      Alert.alert(
        "Помилка",
        "Сталася непередбачена помилка при реєстрації через Google. Будь ласка, спробуйте пізніше.",
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
          <Text style={styles.title}>Створити акаунт</Text>
          <Text style={styles.subtitle}>Почніть свій шлях з нами сьогодні</Text>
        </View>

        {!pendingVerification ? (
          <View style={styles.form}>
            <StyledInput
              label="Електронна пошта"
              placeholder="hello@example.com"
              value={emailAddress}
              onChangeText={setEmailAddress}
              autoCapitalize="none"
              keyboardType="email-address"
              icon="mail-outline"
            />

            <StyledInput
              label="Пароль"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              isPassword
              icon="lock-closed-outline"
            />

            <StyledButton
              title="Зареєструватися"
              onPress={onSignUpPress}
              isLoading={loading}
            />

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>Або через</Text>
              <View style={styles.line} />
            </View>

            <SocialButton strategy="google" onPress={onGooglePress} />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Вже є акаунт? </Text>
              <Link href="/sign-in" asChild>
                <Text style={styles.link}>Увійти</Text>
              </Link>
            </View>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={[styles.subtitle, { marginBottom: 20 }]}>
              Ми відправили код підтвердження на {emailAddress}
            </Text>
            <StyledInput
              label="Код підтвердження"
              placeholder="123456"
              value={code}
              onChangeText={setCode}
              keyboardType="numeric"
              icon="key-outline"
            />

            <StyledButton
              title="Підтвердити пошту"
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
    backgroundColor: Colors.background,
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
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
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
    backgroundColor: Colors.neutral[200],
  },
  dividerText: {
    marginHorizontal: 16,
    color: Colors.neutral[400],
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    color: Colors.text.secondary,
    fontSize: 14,
  },
  link: {
    color: Colors.primary[600],
    fontSize: 14,
    fontWeight: "600",
  },
});
