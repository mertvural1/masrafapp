import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ROOM_CACHE_KEY, ROOM_PREFIX } from "../constants/room";

export default function HomeScreen() {
  const router = useRouter();
  const [storedRoomKey, setStoredRoomKey] = useState<string | null>(null);
  const [roomKeyInput, setRoomKeyInput] = useState("");

  useEffect(() => {
    AsyncStorage.getItem(ROOM_CACHE_KEY).then((value) => {
      if (value) {
        setStoredRoomKey(value);
        setRoomKeyInput(value);
      }
    });
  }, []);

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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Ortak Gider Uygulaması</Text>
      <Text style={styles.info}>
        Yeni oda oluşturup arkadaşlarınıza anahtarı verin. Aynı anahtarı giren herkes
        aynı masraf listesini görür.
      </Text>

      <View style={styles.card}>
        <Button title="Yeni Oda Oluştur" onPress={handleNewRoom} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Varsayılan Oda</Text>
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
            Bu anahtarı arkadaşlarınıza verin, aynı anahtarı giren herkes aynı listeyi görür.
          </Text>
        </View>
      ) : null}

      <Text style={styles.beta}>Beta sürüm: Anahtar paylaşımıyla aynı arayüzü kullanabilirsiniz.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f7f7f7",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 14,
  },
  info: {
    fontSize: 15,
    color: "#555",
    marginBottom: 24,
    lineHeight: 22,
  },
  card: {
    marginBottom: 18,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fafafa",
  },
  noteBox: {
    marginTop: 10,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#e5f1ff",
  },
  noteTitle: {
    fontWeight: "700",
    marginBottom: 6,
  },
  noteText: {
    color: "#333",
    lineHeight: 20,
  },
  beta: {
    marginTop: 24,
    color: "#777",
    fontSize: 13,
  },
});
