import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
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
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Giriş kontrol ediliyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.eyebrow}>Smart Expense</Text>
        <Text style={styles.title}>Ortak giderlerin merkezi</Text>
        <Text style={styles.info}>
          Yeni oda oluşturup arkadaşlarınla paylaş, ortak masrafları takip et.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Hızlı başlangıç</Text>
        <Text style={styles.cardText}>Yeni bir oda oluşturup ortak bir liste başlat.</Text>
        <View style={styles.buttonRow}>
          <Button title="Yeni Oda Oluştur" onPress={handleNewRoom} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Var olan odaya gir</Text>
        <TextInput
          style={styles.input}
          placeholder="Oda anahtarını girin"
          value={roomKeyInput}
          onChangeText={setRoomKeyInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Button title="Odaya Gir" onPress={handleDefaultRoom} />
      </View>

      {storedRoomKey ? (
        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>Kaydedilmiş Anahtar</Text>
          <Text style={styles.noteText}>{storedRoomKey}</Text>
          <Text style={styles.noteText}>
            Bu anahtarı arkadaşlarına ver, aynı anahtarı giren herkes aynı listeyi görsün.
          </Text>
        </View>
      ) : null}

      <Text style={styles.beta}>Google giriş sonrası tüm özellikler aktif olur.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f7fb",
  },
  headerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563eb",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
    color: "#111827",
  },
  info: {
    fontSize: 15,
    color: "#6b7280",
    lineHeight: 22,
  },
  card: {
    marginBottom: 18,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
    color: "#111827",
  },
  cardText: {
    color: "#6b7280",
    marginBottom: 12,
  },
  buttonRow: {
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#f9fafb",
  },
  noteBox: {
    marginTop: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#e8f0ff",
  },
  noteTitle: {
    fontWeight: "700",
    marginBottom: 6,
    color: "#1e3a8a",
  },
  noteText: {
    color: "#334155",
    lineHeight: 20,
  },
  beta: {
    marginTop: 24,
    color: "#6b7280",
    fontSize: 13,
  },
  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#4b5563",
  },
});
