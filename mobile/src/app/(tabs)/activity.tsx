import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  clearFootprintHistory,
  getFootprintHistory,
  type FootprintRecord
} from "../../lib/history";

const C = {
  page: "#F7F6FA", white: "#FFFFFF", ink: "#211D2B", muted: "#777183",
  purple: "#5B45A0", border: "#EAE7F0", mint: "#EDF5F0", red: "#A33D3D"
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "numeric", minute: "2-digit"
  });
}

function amount(value: number) {
  return value.toLocaleString("en-IN", { maximumFractionDigits: 1 });
}

export default function ActivityScreen() {
  const [history, setHistory] = useState<FootprintRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setHistory(await getFootprintHistory());
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void refresh();
  }, [refresh]));

  const confirmClear = () => {
    Alert.alert(
      "Clear saved history?",
      "This permanently deletes all footprint estimates stored on this device. It cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear history",
          style: "destructive",
          onPress: () => {
            void clearFootprintHistory().then(() => setHistory([])).catch(() => setLoadError(true));
          }
        }
      ]
    );
  };

  const previous = history[1];
  const latest = history[0];
  const change = latest && previous ? latest.total - previous.total : null;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>YOUR ACTIVITY</Text>
        <Text style={styles.title}>Footprint history.</Text>
        <Text style={styles.body}>Every time you complete the calculator, CarbonLens saves an estimate on this device. Compare saved results as your inputs change.</Text>

        {latest ? (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>LATEST SAVED ESTIMATE</Text>
            <Text style={styles.summaryValue}>{amount(latest.total)} <Text style={styles.summaryUnit}>kg CO₂e</Text></Text>
            <Text style={styles.summaryDate}>{formatDate(latest.createdAt)}</Text>
            {change !== null ? (
              <Text style={styles.summaryChange}>
                {change > 0 ? "+" : ""}{amount(change)} kg compared with the previous saved estimate
              </Text>
            ) : (
              <Text style={styles.summaryChange}>Save another estimate to create your first comparison.</Text>
            )}
          </View>
        ) : null}

        <View style={styles.listHeader}>
          <View>
            <Text style={styles.sectionTitle}>Saved estimates</Text>
            <Text style={styles.sectionHint}>{history.length} of 100 most recent records stored</Text>
          </View>
          {history.length > 0 ? (
            <Pressable onPress={confirmClear} accessibilityRole="button">
              <Text style={styles.clearButton}>Clear all</Text>
            </Pressable>
          ) : null}
        </View>

        {loading ? (
          <View style={styles.emptyCard}><Text style={styles.emptyText}>Loading saved estimates…</Text></View>
        ) : loadError ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>History could not be loaded</Text>
            <Text style={styles.emptyText}>Device storage may be unavailable. Try again.</Text>
            <Pressable onPress={() => void refresh()}><Text style={styles.retry}>Retry</Text></Pressable>
          </View>
        ) : history.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No saved estimates yet</Text>
            <Text style={styles.emptyText}>Open Calculator, complete all four steps and calculate your footprint. Your result will appear here automatically.</Text>
          </View>
        ) : (
          history.map((record, index) => (
            <View key={record.id} style={styles.recordCard}>
              <View style={styles.recordTop}>
                <View style={styles.recordDateBlock}>
                  <Text style={styles.recordIndex}>{index === 0 ? "MOST RECENT" : `ESTIMATE ${history.length - index}`}</Text>
                  <Text style={styles.recordDate}>{formatDate(record.createdAt)}</Text>
                </View>
                <Text style={styles.recordTotal}>{amount(record.total)} <Text style={styles.recordUnit}>kg</Text></Text>
              </View>
              <View style={styles.categoryLine}>
                <Text style={styles.categoryName}>Energy</Text><Text style={styles.categoryValue}>{amount(record.categories.energy)} kg</Text>
              </View>
              <View style={styles.categoryLine}>
                <Text style={styles.categoryName}>Transport</Text><Text style={styles.categoryValue}>{amount(record.categories.transport)} kg</Text>
              </View>
              <View style={styles.categoryLine}>
                <Text style={styles.categoryName}>Food</Text><Text style={styles.categoryValue}>{amount(record.categories.food)} kg</Text>
              </View>
              <Text style={styles.wasteNote}>Experimental waste proxy: {amount(record.categories.waste)} kg — excluded from headline total</Text>
              {index < history.length - 1 ? (
                <Text style={styles.comparisonNote}>
                  {record.total - history[index + 1].total > 0 ? "+" : ""}
                  {amount(record.total - history[index + 1].total)} kg vs the previous saved estimate
                </Text>
              ) : null}
            </View>
          ))
        )}

        <View style={styles.privacyCard}>
          <Text style={styles.privacyTitle}>Your data stays on this device</Text>
          <Text style={styles.privacyText}>History is stored locally using device storage. It is not uploaded, synced across devices or linked to an account. Clearing app data or uninstalling the app may erase it.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.page },
  content: { padding: 20, paddingTop: 28, paddingBottom: 36 },
  eyebrow: { color: C.purple, fontSize: 10, fontWeight: "800", letterSpacing: 1.5, marginBottom: 10 },
  title: { color: C.ink, fontSize: 31, lineHeight: 37, fontWeight: "800", letterSpacing: -1 },
  body: { color: C.muted, fontSize: 13, lineHeight: 20, marginTop: 9, marginBottom: 22 },
  summaryCard: { backgroundColor: C.white, borderRadius: 19, borderWidth: 1, borderColor: C.border, padding: 18, marginBottom: 26 },
  summaryLabel: { color: C.muted, fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  summaryValue: { color: C.ink, fontSize: 31, fontWeight: "800", marginTop: 9 },
  summaryUnit: { color: C.muted, fontSize: 13, fontWeight: "700" },
  summaryDate: { color: C.muted, fontSize: 10, marginTop: 4 },
  summaryChange: { color: C.purple, fontSize: 11, fontWeight: "700", lineHeight: 16, marginTop: 12 },
  listHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { color: C.ink, fontSize: 17, fontWeight: "800" },
  sectionHint: { color: C.muted, fontSize: 10, marginTop: 4 },
  clearButton: { color: C.red, fontSize: 11, fontWeight: "800", padding: 8 },
  emptyCard: { backgroundColor: C.white, borderRadius: 17, borderWidth: 1, borderColor: C.border, padding: 18, marginBottom: 18 },
  emptyTitle: { color: C.ink, fontSize: 14, fontWeight: "800", marginBottom: 6 },
  emptyText: { color: C.muted, fontSize: 11, lineHeight: 17 },
  retry: { color: C.purple, fontSize: 11, fontWeight: "800", marginTop: 12 },
  recordCard: { backgroundColor: C.white, borderRadius: 17, borderWidth: 1, borderColor: C.border, padding: 15, marginBottom: 11 },
  recordTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, gap: 8 },
  recordDateBlock: { flex: 1 },
  recordIndex: { color: C.purple, fontSize: 8, fontWeight: "800", letterSpacing: 1 },
  recordDate: { color: C.ink, fontSize: 11, fontWeight: "700", marginTop: 5 },
  recordTotal: { color: C.ink, fontSize: 18, fontWeight: "800" },
  recordUnit: { color: C.muted, fontSize: 10, fontWeight: "600" },
  categoryLine: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
  categoryName: { color: C.muted, fontSize: 10 },
  categoryValue: { color: C.ink, fontSize: 10, fontWeight: "700" },
  wasteNote: { color: C.muted, fontSize: 9, lineHeight: 14, marginTop: 9 },
  comparisonNote: { color: C.purple, fontSize: 10, fontWeight: "700", marginTop: 9 },
  privacyCard: { backgroundColor: C.mint, borderRadius: 16, padding: 15, marginTop: 10 },
  privacyTitle: { color: "#477B64", fontSize: 12, fontWeight: "800", marginBottom: 5 },
  privacyText: { color: "#527463", fontSize: 10, lineHeight: 16 }
});
