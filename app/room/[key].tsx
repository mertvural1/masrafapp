import { useLocalSearchParams, useRouter } from "expo-router";
import { child, onValue, ref, remove, set } from "firebase/database";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EXPENSES_PATH_SUFFIX, FIREBASE_ROOM_PATH } from "../../constants/room";
import type { ExpenseItem } from "../../types/expense";
import type { HeaderContentProps } from "../../types/header";
import { database } from "../firebase";

const HeaderContent = memo(function HeaderContent({
  roomKey,
  name,
  description,
  amount,
  total,
  loading,
  expenseCount,
  onNameChange,
  onDescriptionChange,
  onAmountChange,
  onAddExpense,
}: HeaderContentProps) {
  return (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Oda: {roomKey}</Text>
        <Text style={styles.subtitle}>
          Bu anahtarı alan herkes aynı masraf listesini görür.
        </Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>Masrafı Yapan</Text>
        <TextInput
          value={name}
          onChangeText={onNameChange}
          placeholder="Mert, Ali, Veli"
          style={styles.input}
          returnKeyType="next"
          blurOnSubmit={false}
        />

        <Text style={styles.label}>Masraf Adı</Text>
        <TextInput
          value={description}
          onChangeText={onDescriptionChange}
          placeholder="Elektrik faturası"
          style={styles.input}
          returnKeyType="next"
          blurOnSubmit={false}
        />

        <Text style={styles.label}>Tutar (TL)</Text>
        <TextInput
          value={amount}
          onChangeText={onAmountChange}
          placeholder="500"
          keyboardType="numeric"
          style={styles.input}
          returnKeyType="done"
          onSubmitEditing={onAddExpense}
        />

        <Button title="Masraf Ekle" onPress={onAddExpense} />
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Toplam</Text>
        <Text style={styles.totalText}>{total.toFixed(2)} TL</Text>
      </View>

      <View style={styles.listCard}>
        <Text style={styles.sectionTitle}>Masraflar</Text>
        {loading ? (
          <Text>Yükleniyor...</Text>
        ) : expenseCount === 0 ? (
          <Text>Henüz masraf yok.</Text>
        ) : null}
      </View>
    </>
  );
});

export default function RoomScreen() {
  const { key } = useLocalSearchParams() as { key?: string };
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);

  const roomPath = key ? `${FIREBASE_ROOM_PATH}/${key}/${EXPENSES_PATH_SUFFIX}` : null;
  const roomRef = roomPath ? ref(database, roomPath) : null;

  const loadExpenses = useCallback(() => {
    if (!roomRef) return () => {};

    setLoading(true);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const value = snapshot.val() ?? {};
      const items = Object.entries(value).map(([id, item]) => ({
        id,
        ...(item as Omit<ExpenseItem, "id">),
      }));

      setExpenses(
        items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      );
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomRef]);

  useEffect(() => {
    const unsubscribe = loadExpenses();
    return () => unsubscribe();
  }, [loadExpenses]);

  const total = useMemo(
    () => expenses.reduce((sum, item) => sum + item.amount, 0),
    [expenses]
  );

  const addExpense = async () => {
    if (!name.trim() || !description.trim() || !amount.trim()) {
      Alert.alert("Eksik bilgi", "Lütfen tüm alanları doldurun.");
      return;
    }

    const value = Number(amount.replace(",", "."));
    if (Number.isNaN(value) || value <= 0) {
      Alert.alert("Geçersiz tutar", "Lütfen geçerli bir tutar girin.");
      return;
    }

    if (!roomRef) return;

    const newItem: ExpenseItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim(),
      description: description.trim(),
      amount: value,
      createdAt: new Date().toISOString(),
    };

    await set(child(roomRef, newItem.id), newItem);
    setName("");
    setDescription("");
    setAmount("");
  };

  const clearRoom = async () => {
    if (!roomRef) return;
    Alert.alert("Masrafları temizle", "Bu oda için tüm masrafları silmek istiyor musunuz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          await remove(roomRef);
          setExpenses([]);
        },
      },
    ]);
  };

  if (!key) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Geçersiz oda anahtarı.</Text>
        <Button title="Geri dön" onPress={() => router.push("/")} />
      </SafeAreaView>
    );
  }

  const headerComponent = (
    <HeaderContent
      roomKey={key ?? ""}
      name={name}
      description={description}
      amount={amount}
      total={total}
      loading={loading}
      expenseCount={expenses.length}
      onNameChange={setName}
      onDescriptionChange={setDescription}
      onAmountChange={setAmount}
      onAddExpense={addExpense}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={headerComponent}
          ListFooterComponent={
            <View style={styles.actions}>
              <Button title="Odayı Temizle" color="#d9534f" onPress={clearRoom} />
              <View style={styles.backButton}>
                <Button title="Ana Sayfaya Dön" onPress={() => router.push("/")} />
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.expenseItem}>
              <View style={styles.expenseRow}>
                <Text style={styles.expenseName}>{item.description}</Text>
                <Text style={styles.expenseAmount}>{item.amount.toFixed(2)} TL</Text>
              </View>
              <Text style={styles.expenseMeta}>{item.name}</Text>
            </View>
          )}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={!loading ? <Text>Henüz masraf yok.</Text> : null}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  keyboardAvoiding: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: "#555",
    fontSize: 15,
    lineHeight: 22,
  },
  formCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#fff",
    marginBottom: 18,
  },
  label: {
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    backgroundColor: "#fafafa",
  },
  summaryCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#fff",
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  totalText: {
    fontSize: 28,
    fontWeight: "800",
  },
  listCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#fff",
    marginBottom: 18,
  },
  expenseItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 12,
  },
  expenseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  expenseName: {
    fontWeight: "600",
  },
  expenseAmount: {
    fontWeight: "700",
  },
  expenseMeta: {
    color: "#666",
    fontSize: 13,
  },
  actions: {
    marginTop: 4,
  },
  backButton: {
    marginTop: 12,
  },
});
