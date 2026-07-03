import { useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "./firebase";

export default function AuthScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(false);
      if (user) {
        router.replace("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleAuth = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Eksik bilgi", "Lütfen e-posta ve şifre girin.");
      return;
    }

    setAuthenticating(true);

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (error) {
      const code = (error as any)?.code;
      let message = "İşlem gerçekleştirilemedi. Lütfen bilgilerinizi kontrol edin.";

      if (code === "auth/user-not-found") {
        message = "Kullanıcı bulunamadı. Lütfen önce kayıt olun.";
      } else if (code === "auth/wrong-password") {
        message = "Geçersiz şifre.";
      } else if (code === "auth/invalid-email") {
        message = "Geçersiz e-posta adresi.";
      } else if (code === "auth/email-already-in-use") {
        message = "Bu e-posta zaten kayıtlı.";
      } else if (code === "auth/weak-password") {
        message = "Şifre en az 6 karakter olmalıdır.";
      }

      Alert.alert("Hata", message);
    } finally {
      setAuthenticating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>Smart Expense</Text>
        <Text style={styles.title}>Masraflarınızı kontrol edin</Text>
        <Text style={styles.subtitle}>
          E-posta ve şifre ile giriş yapın, odalar oluşturun ve ortak masrafları yönetin.
        </Text>

        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="E-posta"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Şifre"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
        />

        <Pressable style={styles.primaryButton} onPress={handleAuth} disabled={authenticating}>
          <Text style={styles.primaryButtonText}>
            {authenticating ? "İşleniyor..." : isRegistering ? "Kayıt Ol" : "Giriş Yap"}
          </Text>
        </Pressable>

        <Pressable style={styles.linkButton} onPress={() => setIsRegistering((prev) => !prev)} disabled={authenticating}>
          <Text style={styles.linkButtonText}>
            {isRegistering ? "Zaten hesabınız var? Giriş yap" : "Hesabınız yok mu? Kayıt olun"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
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
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    backgroundColor: "#f9fafb",
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
  linkButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  linkButtonText: {
    color: "#2563eb",
    fontWeight: "600",
  },
});
