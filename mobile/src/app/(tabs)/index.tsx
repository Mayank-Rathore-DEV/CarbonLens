import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFootprintHistory, type FootprintRecord } from "../../lib/history";

const COLORS = {
  page: "#F7F6FA", white: "#FFFFFF", ink: "#211D2B", muted: "#777183",
  purple: "#5B45A0", purpleSoft: "#F0ECF8", border: "#EAE7F0",
  mint: "#EDF5F0", blue: "#EEF2F8"
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "numeric", minute: "2-digit"
  });
}

function formatAmount(value: number) {
  return value.toLocaleString("en-IN", { maximumFractionDigits: 1 });
}

export default function DashboardScreen() {
  const router = useRouter();
  const [latest, setLatest] = useState<FootprintRecord | null>(null);
  const [previous, setPrevious] = useState<FootprintRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    getFootprintHistory()
      .then((history) => {
        if (!active) return;
        setLatest(history[0] ?? null);
        setPrevious(history[1] ?? null);
      })
      .catch(() => {
        if (!active) return;
        setLatest(null);
        setPrevious(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []));

  const change = latest && previous ? latest.total - previous.total : null;
  const changePercent = change !== null && previous && previous.total > 0
    ? (change / previous.total) * 100
    : null;

  const categories = latest ? [
    { name: "Energy", hint: "Household electricity and cooking fuel", value: latest.categories.energy, tone: COLORS.purpleSoft },
    { name: "Transport", hint: "Private and public travel", value: latest.categories.transport, tone: COLORS.blue },
    { name: "Food", hint: "Food consumption estimate", value: latest.categories.food, tone: COLORS.mint }
  ] : [];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}><View style={styles.brandMarkInner} /></View>
            <Text style={styles.brand}>CarbonLens</Text>
          </View>
          <View style={styles.profileMark}><Text style={styles.profileInitial}>C</Text></View>
        </View>

        <View style={styles.headingBlock}>
          <Text style={styles.eyebrow}>YOUR PERSONAL DASHBOARD</Text>
          <Text style={styles.heading}>See your impact.{ "\n" }Shape what comes next.</Text>
          <Text style={styles.subheading}>Your latest saved footprint and how it compares with your previous estimate.</Text>
        </View>

        <View style={styles.footprintCard}>
          <View style={styles.cardTopLine}>
            <Text style={styles.cardEyebrow}>LATEST ANNUAL PERSONAL FOOTPRINT</Text>
            <View style={[styles.statusPill, latest && styles.statusPillActive]}>
              <Text style={[styles.statusText, latest && styles.statusTextActive]}>
                {loading ? "Loading" : latest ? "Saved estimate" : "No estimate"}
              </Text>
            </View>
          </View>
          {latest ? (
            <>
              <View style={styles.numberRow}>
                <Text style={styles.number}>{formatAmount(latest.total)}</Text>
                <View style={styles.unitBlock}>
                  <Text style={styles.unit}>kg CO₂e</Text>
                  <Text style={styles.unitSub}>per person / year</Text>
                </View>
              </View>
              <Text style={styles.cardDescription}>Saved {formatDate(latest.createdAt)}. This is an estimate based on the activity data you entered.</Text>
              <Pressable accessibilityRole="button" onPress={() => router.push("/activity")} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>View footprint history</Text>
                <Text style={styles.buttonArrow}>›</Text>
              </Pressable>
            </>
          ) : (
            <>
              <View style={styles.numberRow}>
                <Text style={styles.numberPlaceholder}>--</Text>
                <View style={styles.unitBlock}>
                  <Text style={styles.unit}>kg CO₂e</Text>
                  <Text style={styles.unitSub}>per person / year</Text>
                </View>
              </View>
              <Text style={styles.cardDescription}>Complete your first calculation. CarbonLens will save it locally so you can compare future estimates.</Text>
              <Pressable accessibilityRole="button" onPress={() => router.push("/calculator")} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Calculate my footprint</Text>
                <Text style={styles.buttonArrow}>›</Text>
              </Pressable>
            </>
          )}
          <Text style={styles.privacyNote}>Your history is stored on this device. It is not synced to an account or cloud.</Text>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Latest breakdown</Text>
            <Text style={styles.sectionSubtitle}>Only the three headline categories are shown here.</Text>
          </View>
          <Text style={styles.sectionMeta}>3 CATEGORIES</Text>
        </View>

        {latest ? (
          <View style={styles.categoryGrid}>
            {categories.map((category) => (
              <View key={category.name} style={styles.categoryCard}>
                <View style={[styles.categoryMark, { backgroundColor: category.tone }]}>
                  <Text style={styles.categoryInitial}>{category.name.slice(0, 1)}</Text>
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryHint}>{category.hint}</Text>
                <Text style={styles.categoryValue}>{formatAmount(category.value)} kg</Text>
                <Text style={styles.categoryShare}>{latest.total > 0 ? (category.value / latest.total * 100).toFixed(1) : "0.0"}% of headline total</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No breakdown yet</Text>
            <Text style={styles.emptyText}>Your category estimates will appear here after your first saved calculation.</Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Change over time</Text>
            <Text style={styles.sectionSubtitle}>Compared with your previous saved estimate, not a calendar-month average.</Text>
          </View>
        </View>
        <View style={styles.progressCard}>
          {change !== null ? (
            <>
              <Text style={styles.progressTitle}>{change <= 0 ? "Your latest estimate is lower" : "Your latest estimate is higher"}</Text>
              <Text style={styles.changeValue}>{change > 0 ? "+" : ""}{formatAmount(change)} kg CO₂e ({changePercent === null ? "percentage unavailable" : `${changePercent > 0 ? "+" : ""}${changePercent.toFixed(1)}%`})</Text>
              <Text style={styles.progressText}>Latest: {formatDate(latest!.createdAt)}{"\n"}Previous: {formatDate(previous!.createdAt)}</Text>
              <Text style={styles.disclaimer}>A change may reflect different inputs or assumptions. It does not prove that real-world emissions changed.</Text>
            </>
          ) : (
            <>
              <Text style={styles.progressTitle}>{latest ? "Save another estimate to compare" : "Your journey starts with a baseline"}</Text>
              <Text style={styles.progressText}>{latest ? "Run the calculator again after updating your activity data. Your next saved result will appear here for comparison." : "Calculate your footprint first. Your next saved estimate will let CarbonLens show a comparison."}</Text>
              <Pressable onPress={() => router.push("/calculator")} accessibilityRole="button" style={styles.textButton}>
                <Text style={styles.textButtonLabel}>{latest ? "Create another estimate" : "Create my baseline"}</Text>
                <Text style={styles.textButtonArrow}>→</Text>
              </Pressable>
            </>
          )}
        </View>

        <View style={styles.footerNote}>
          <Text style={styles.footerBrand}>CARBONLENS</Text>
          <Text style={styles.footerText}>Understand your impact. Make informed choices.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.page },
  content: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 30 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 30 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandMark: { width: 25, height: 25, borderWidth: 2, borderColor: COLORS.purple, borderRadius: 8, alignItems: "center", justifyContent: "center", transform: [{ rotate: "45deg" }] },
  brandMarkInner: { width: 7, height: 7, borderRadius: 3, backgroundColor: COLORS.purple },
  brand: { color: COLORS.ink, fontSize: 19, fontWeight: "800", letterSpacing: -0.7 },
  profileMark: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.purpleSoft, alignItems: "center", justifyContent: "center" },
  profileInitial: { color: COLORS.purple, fontWeight: "800", fontSize: 14 },
  headingBlock: { marginBottom: 22 },
  eyebrow: { color: COLORS.purple, fontSize: 10, fontWeight: "800", letterSpacing: 1.5, marginBottom: 10 },
  heading: { color: COLORS.ink, fontSize: 32, lineHeight: 37, fontWeight: "800", letterSpacing: -1.2 },
  subheading: { color: COLORS.muted, fontSize: 14, lineHeight: 21, marginTop: 10, maxWidth: 310 },
  footprintCard: { backgroundColor: COLORS.white, borderRadius: 23, borderWidth: 1, borderColor: COLORS.border, padding: 20, marginBottom: 28 },
  cardTopLine: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  cardEyebrow: { color: COLORS.muted, fontSize: 9, fontWeight: "800", letterSpacing: 1.1 },
  statusPill: { backgroundColor: "#FBF1EA", borderRadius: 20, paddingHorizontal: 9, paddingVertical: 5 },
  statusPillActive: { backgroundColor: COLORS.mint },
  statusText: { color: "#8A5C3D", fontSize: 9, fontWeight: "700" },
  statusTextActive: { color: "#477B64" },
  numberRow: { flexDirection: "row", alignItems: "center", marginTop: 18, marginBottom: 8 },
  number: { color: COLORS.ink, fontSize: 45, lineHeight: 54, fontWeight: "800", letterSpacing: -1.7 },
  numberPlaceholder: { color: COLORS.ink, fontSize: 54, lineHeight: 60, fontWeight: "800", letterSpacing: -2 },
  unitBlock: { marginLeft: 10, paddingTop: 7 },
  unit: { color: COLORS.ink, fontSize: 14, fontWeight: "700" },
  unitSub: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  cardDescription: { color: COLORS.muted, fontSize: 12, lineHeight: 18, marginBottom: 18 },
  primaryButton: { minHeight: 50, borderRadius: 14, backgroundColor: COLORS.purple, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  primaryButtonText: { color: COLORS.white, fontSize: 13, fontWeight: "700" },
  buttonArrow: { color: COLORS.white, fontSize: 21, marginLeft: 8, marginTop: -2 },
  privacyNote: { color: COLORS.muted, fontSize: 10, lineHeight: 15, marginTop: 12 },
  sectionHeader: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 13, marginTop: 2 },
  sectionTitle: { color: COLORS.ink, fontSize: 17, fontWeight: "800", letterSpacing: -0.4 },
  sectionSubtitle: { color: COLORS.muted, fontSize: 11, lineHeight: 16, marginTop: 4, maxWidth: 270 },
  sectionMeta: { color: COLORS.purple, fontSize: 9, fontWeight: "800", letterSpacing: 0.8 },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 27 },
  categoryCard: { width: "47.5%", minHeight: 145, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 17, padding: 13 },
  categoryMark: { width: 29, height: 29, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 9 },
  categoryInitial: { color: COLORS.ink, fontSize: 12, fontWeight: "800" },
  categoryName: { color: COLORS.ink, fontSize: 13, fontWeight: "800" },
  categoryHint: { color: COLORS.muted, fontSize: 10, lineHeight: 14, marginTop: 3, minHeight: 28 },
  categoryValue: { color: COLORS.purple, fontSize: 13, fontWeight: "800", marginTop: 8 },
  categoryShare: { color: COLORS.muted, fontSize: 9, marginTop: 3 },
  emptyCard: { backgroundColor: COLORS.white, borderRadius: 17, borderWidth: 1, borderColor: COLORS.border, padding: 18, marginBottom: 25 },
  emptyTitle: { color: COLORS.ink, fontSize: 14, fontWeight: "800", marginBottom: 5 },
  emptyText: { color: COLORS.muted, fontSize: 11, lineHeight: 17 },
  progressCard: { backgroundColor: COLORS.white, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border, padding: 18 },
  progressTitle: { color: COLORS.ink, fontSize: 14, fontWeight: "800", marginBottom: 6 },
  changeValue: { color: COLORS.purple, fontSize: 19, fontWeight: "800", marginBottom: 8 },
  progressText: { color: COLORS.muted, fontSize: 11, lineHeight: 18 },
  disclaimer: { color: COLORS.muted, fontSize: 10, lineHeight: 15, marginTop: 12 },
  textButton: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", marginTop: 13, gap: 8 },
  textButtonLabel: { color: COLORS.purple, fontSize: 12, fontWeight: "800" },
  textButtonArrow: { color: COLORS.purple, fontSize: 16 },
  footerNote: { alignItems: "center", marginTop: 30, paddingTop: 17, borderTopWidth: 1, borderTopColor: COLORS.border },
  footerBrand: { color: COLORS.purple, fontSize: 9, fontWeight: "800", letterSpacing: 1.8 },
  footerText: { color: COLORS.muted, fontSize: 10, marginTop: 5 }
});
