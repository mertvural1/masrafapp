import * as AuthSession from "expo-auth-session";
import { makeRedirectUri } from "expo-auth-session";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { signOut as firebaseSignOut, GoogleAuthProvider, onAuthStateChanged, signInWithCredential } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { GOOGLE_CLIENT_ID } from "../constants/auth";
import { auth } from "./firebase";

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

export default function AuthScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(false);
      if (user) {
        router.replace("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const signInWithGoogle = async () => {
    try {
      setAuthenticating(true);
      const redirectUri = makeRedirectUri({ useProxy: true } as any);
      const request = new AuthSession.AuthRequest({
        clientId: GOOGLE_CLIENT_ID,
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
        scopes: ["openid", "profile", "email"],
        usePKCE: true,
      });

      const result = await request.promptAsync(discovery);
      if (result.type !== "success") {
        throw new Error("Google login cancelled");
      }

      const { code } = result.params;
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }).toString(),
      });

      const tokenJson = await tokenResponse.json();
      const credential = GoogleAuthProvider.credential(tokenJson.id_token, tokenJson.access_token);
      await signInWithCredential(auth, credential);
    } catch (error) {
      Alert.alert("Giriş başarısız", "Google ile giriş yapılamadı.");
    } finally {
      setAuthenticating(false);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>Smart Expense</Text>
        <Text style={styles.title}>Masraflarınızı kontrol edin</Text>
        <Text style={styles.subtitle}>
          Google hesabınızla giriş yapın, odalar oluşturun ve ortak masrafları yönetin.
        </Text>

        <Pressable style={styles.primaryButton} onPress={signInWithGoogle} disabled={authenticating}>
          <Text style={styles.primaryButtonText}>{authenticating ? "Giriş yapılıyor..." : "Google ile devam et"}</Text>
        </Pressable>

        {auth.currentUser ? (
          <Pressable style={styles.secondaryButton} onPress={signOut}>
            <Text style={styles.secondaryButtonText}>Çıkış yap</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f4f7fb",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f7fb",
  },
  heroCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 28,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 8,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563eb",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#6b7280",
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#374151",
    fontWeight: "600",
  },
});
