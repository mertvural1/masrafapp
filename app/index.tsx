import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { ROOM_CACHE_KEY, ROOM_PREFIX } from "../constants/room";
import { auth } from "./firebase";

export default function HomeScreen() {
  const router = useRouter();
  const [storedRoomKey, setStoredRoomKey] = useState<string | null>(null);
  const [roomKeyInput, setRoomKeyInput] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/auth");
        return;
      }

      AsyncStorage.getItem(ROOM_CACHE_KEY).then((value) => {
        if (value) {
          setStoredRoomKey(value);
          setRoomKeyInput(value);
        }
      });
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [router]);

  const saveRoomKey = async (key: string) => {
    await AsyncStorage.setItem(ROOM_CACHE_KEY, key);
    setStoredRoomKey(key);
    setRoomKeyInput(key);
  };

  const handleNewRoom = async () => {
    const newKey = `${ROOM_PREFIX}${Math.random().toString(36).substring(2, 8)}`;
    await saveRoomKey(newKey);
    router.push(`/room/${newKey}`);
  };

  const handleDefaultRoom = async () => {
    const key = roomKeyInput.trim();
    if (!key) {
      Alert.alert("Anahtar gerekli", "Lütfen oda anahtarını girin veya yeni bir oda oluşturun.");
      return;
    }
    await saveRoomKey(key);
    router.push(`/room/${key}`);
  };

  if (checkingAuth) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#3366ff" />
          <Text style={styles.loadingText}>Giriş kontrol ediliyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <Text style={styles.eyebrow}>Masraf Uygulaması</Text>
          <Text style={styles.title}>Ortak harcamaları sade ve keyifli yönetin.</Text>
          <Text style={styles.subtitle}>
            Yeni oda oluşturun, anahtar paylaşın ve herkesin masrafları tek yerde takip etmesini sağlayın.
          </Text>
          <Button mode="contained" uppercase={false} onPress={handleNewRoom} style={styles.button}>
            Yeni Oda Oluştur
          </Button>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Odaya Gir</Text>
            <Text style={styles.sectionSubtitle}>Mevcut oda anahtarınızı girin.</Text>
            <TextInput
              mode="outlined"
              style={styles.input}
              placeholder="Oda anahtarını girin"
              value={roomKeyInput}
              onChangeText={setRoomKeyInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Button mode="contained" uppercase={false} onPress={handleDefaultRoom} style={styles.button}>
              Odaya Gir
            </Button>
          </Card.Content>
        </Card>

        {storedRoomKey ? (
          <Card style={[styles.card, styles.noteCard]}>
            <Card.Content>
              <Text style={styles.noteTitle}>Kaydedilmiş Anahtar</Text>
              <Text style={styles.noteText}>{storedRoomKey}</Text>
              <Text style={styles.noteText}>
                Bu anahtarı arkadaşlarına ver, aynı anahtarı giren herkes aynı listeyi görsün.
              </Text>
            </Card.Content>
          </Card>
        ) : null}

        <Text style={styles.beta}>E-posta/parola ile giriş yaptıktan sonra tüm özellikler aktif olur.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef4ff",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  heroSection: {
    borderRadius: 28,
    backgroundColor: "#fff",
    padding: 24,
    marginBottom: 20,
    shadowColor: "#1f2937",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3366ff",
    letterSpacing: 1.6,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 36,
    color: "#0f172a",
    marginBottom: 12,
  },
  subtitle: {
    color: "#475569",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  card: {
    marginBottom: 18,
    borderRadius: 22,
    overflow: "hidden",
  },
  input: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  sectionSubtitle: {
    color: "#64748b",
    fontSize: 14,
    marginBottom: 16,
  },
  button: {
    marginTop: 12,
  },
  noteCard: {
    backgroundColor: "#eff6ff",
  },
  noteTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: "#1d4ed8",
    marginBottom: 10,
  },
  noteText: {
    color: "#475569",
    lineHeight: 20,
    marginBottom: 6,
  },
  beta: {
    marginTop: 12,
    color: "#64748b",
    fontSize: 13,
    textAlign: "center",
  },
  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#475569",
    fontSize: 15,
  },
});
