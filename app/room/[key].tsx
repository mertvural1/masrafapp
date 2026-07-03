import { useLocalSearchParams, useRouter } from "expo-router";
import { child, onValue, ref, remove, set } from "firebase/database";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";
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
        <Text style={styles.pageTitle}>Oda</Text>
        <Text style={styles.pageSubtitle}>
          Bu anahtarı alan herkes aynı masraf listesini görür.
        </Text>
      </View>

      <Card style={styles.formCard}>
        <Card.Content>
          <Text style={styles.label}>Masrafı Yapan</Text>
          <TextInput
            mode="outlined"
            style={styles.input}
            value={name}
            onChangeText={onNameChange}
            placeholder="Mert, Ali, Veli"
            returnKeyType="next"
            blurOnSubmit={false}
          />

          <Text style={styles.label}>Masraf Adı</Text>
          <TextInput
            mode="outlined"
            style={styles.input}
            value={description}
            onChangeText={onDescriptionChange}
            placeholder="Elektrik faturası"
            returnKeyType="next"
            blurOnSubmit={false}
          />

          <Text style={styles.label}>Tutar (TL)</Text>
          <TextInput
            mode="outlined"
            style={styles.input}
            value={amount}
            onChangeText={onAmountChange}
            placeholder="500"
            keyboardType="numeric"
            returnKeyType="done"
            onSubmitEditing={onAddExpense}
          />

          <Button mode="contained" uppercase={false} onPress={onAddExpense} style={styles.button}>
            Masraf Ekle
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Toplam</Text>
          <Text style={styles.totalText}>{total.toFixed(2)} TL</Text>
        </Card.Content>
      </Card>
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

      setExpenses(items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
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
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text style={styles.pageTitle}>Geçersiz oda anahtarı.</Text>
            <Button mode="outlined" uppercase={false} textColor="#0f172a" onPress={() => router.push("/")} style={styles.button}>
              Ana Sayfaya Dön
            </Button>
          </Card.Content>
        </Card>
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
              <Button
                mode="contained"
                uppercase={false}
                buttonColor="#ef4444"
                textColor="#fff"
                onPress={clearRoom}
                style={styles.button}
              >
                Odayı Temizle
              </Button>
              <Button
                mode="outlined"
                uppercase={false}
                textColor="#0f172a"
                onPress={() => router.push("/")}
                style={[styles.button, styles.secondaryButton]}
              >
                Ana Sayfaya Dön
              </Button>
            </View>
          }
          renderItem={({ item }) => (
            <Card style={styles.expenseItem}>
              <View style={styles.expenseRow}>
                <Text style={styles.expenseName}>{item.description}</Text>
                <Text style={styles.expenseAmount}>{item.amount.toFixed(2)} TL</Text>
              </View>
              <Text style={styles.expenseMeta}>{item.name}</Text>
            </Card>
          )}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={!loading ? <Text style={styles.emptyText}>Henüz masraf yok.</Text> : null}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef4ff",
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
  pageTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
  },
  pageSubtitle: {
    color: "#475569",
    fontSize: 15,
    lineHeight: 22,
  },
  formCard: {
    marginBottom: 18,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: "700",
    color: "#334155",
  },
  summaryCard: {
    marginBottom: 18,
  },
  messageCard: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  totalText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#334155",
  },
  messageText: {
    color: "#64748b",
    fontSize: 15,
  },
  expenseItem: {
    marginBottom: 14,
    padding: 18,
  },
  expenseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  expenseName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3366ff",
  },
  expenseMeta: {
    color: "#64748b",
    fontSize: 14,
  },
  actions: {
    marginTop: 20,
    gap: 12,
  },
  secondaryButton: {
    marginTop: 12,
  },
  emptyText: {
    color: "#475569",
    textAlign: "center",
    marginTop: 16,
  },
  emptyCard: {
    margin: 20,
    padding: 22,
  },
});
