import { useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, Text, TextInput } from "react-native-paper";
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
        <ActivityIndicator size="large" color="#3366ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.heroCard}>
          <Card.Content>
            <Text style={styles.eyebrow}>Smart Expense</Text>
            <Text style={styles.title}>Masraflarınızı kolayca yönetin</Text>
            <Text style={styles.subtitle}>
              Hemen giriş yapın veya kayıt olun, odalar açın ve ortak harcamaları düzenli bir şekilde takip edin.
            </Text>

            <TextInput
              mode="outlined"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="E-posta"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <TextInput
              mode="outlined"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Şifre"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
            />

            <Button
              mode="contained"
              uppercase={false}
              loading={authenticating}
              onPress={handleAuth}
              disabled={authenticating}
              style={styles.primaryButton}
            >
              {authenticating ? "İşleniyor..." : isRegistering ? "Kayıt Ol" : "Giriş Yap"}
            </Button>

            <Button
              mode="outlined"
              uppercase={false}
              onPress={() => setIsRegistering((prev) => !prev)}
              disabled={authenticating}
              style={styles.linkButton}
              textColor="#3366ff"
            >
              {isRegistering ? "Zaten hesabınız var? Giriş yap" : "Hesabınız yok mu? Kayıt olun"}
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef4ff",
  },
  content: {
    padding: 24,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eef4ff",
  },
  heroCard: {
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 28,
    shadowColor: "#1f2937",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 25,
    elevation: 10,
  },
  input: {
    marginBottom: 16,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3366ff",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 14,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748b",
    lineHeight: 24,
    marginBottom: 24,
  },
  primaryButton: {
    marginTop: 8,
  },
  linkButton: {
    borderRadius: 20,
    paddingVertical: 12,
    marginTop: 12,
  },
});
