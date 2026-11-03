import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFootprintHistory, type FootprintRecord } from "../../lib/history";
import {
  completeTodayChallenge,
  getDailyEngagement,
  getTodayChallenge,
  getTodayEcoFact,
  type DailyEngagement
} from "../../lib/daily";

const C = {
  page: "#F7F6FA", white: "#FFFFFF", ink: "#211D2B", muted: "#777183",
  purple: "#5B45A0", purpleSoft: "#F0ECF8", border: "#EAE7F0",
  mint: "#EDF5F0", green: "#477B64", blue: "#EEF2F8", amber: "#F8F1E5"
};

function amount(value: number) {
  return value.toLocaleString("en-IN", { maximumFractionDigits: 1 });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });
}

export default function DashboardScreen() {
  const router = useRouter();
  const [history, setHistory] = useState<FootprintRecord[]>([]);
  const [engagement, setEngagement] = useState<DailyEngagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingChallenge, setSavingChallenge] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const challenge = getTodayChallenge();
  const ecoFact = getTodayEcoFact();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [savedHistory, daily] = await Promise.all([
        getFootprintHistory(),
        getDailyEngagement()
      ]);
      setHistory(savedHistory);
      setEngagement(daily);
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

  const latest = history[0] ?? null;
  const previous = history[1] ?? null;
  const change = latest && previous ? latest.total - previous.total : null;
  const changePercent = change !== null && previous && previous.total > 0
    ? (change / previous.total) * 100
    : null;
  const lowestSaved = history.length > 0
    ? history.reduce((lowest, item) => item.total < lowest.total ? item : lowest)
    : null;
  const categories = latest ? [
    { name: "Energy", value: latest.categories.energy, tone: C.purpleSoft },
    { name: "Transport", value: latest.categories.transport, tone: C.blue },
    { name: "Food", value: latest.categories.food, tone: C.mint },
    { name: "Waste", value: latest.categories.waste, tone: C.amber }
  ] : [];

  const markChallengeComplete = async () => {
    if (savingChallenge || engagement?.completedToday) return;
    setSavingChallenge(true);
    try {
      setEngagement(await completeTodayChallenge());
    } catch {
      setLoadError(true);
    } finally {
      setSavingChallenge(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}><View style={styles.brandMarkInner} /></View>
            <Text style={styles.brand}>CarbonLens</Text>
          </View>
          <View style={styles.todayPill}><Text style={styles.todayPillText}>TODAY</Text></View>
        </View>

        <View style={styles.headingBlock}>
          <Text style={styles.eyebrow}>YOUR EVERYDAY SUSTAINABILITY COMPANION</Text>
          <Text style={styles.heading}>Small choices.{ "\n" }Long-term impact.</Text>
          <Text style={styles.subheading}>One practical action today, a clearer picture of your impact over time.</Text>
        </View>

        <View style={styles.challengeCard}>
          <View style={styles.challengeTop}>
            <Text style={styles.cardEyebrow}>TODAY'S ECO CHALLENGE</Text>
            <View style={styles.pointsPill}><Text style={styles.pointsText}>+10 POINTS</Text></View>
          </View>
          <Text style={styles.challengeTitle}>{challenge.title}</Text>
          <Text style={styles.challengeDescription}>{challenge.description}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !engagement || engagement.completedToday || savingChallenge }}
            disabled={!engagement || engagement.completedToday || savingChallenge}
            onPress={() => void markChallengeComplete()}
            style={[styles.challengeButton, engagement?.completedToday && styles.challengeButtonDone]}
          >
            <Text style={[styles.challengeButtonText, engagement?.completedToday && styles.challengeButtonDoneText]}>
              {savingChallenge ? "Saving…" : engagement?.completedToday ? "✓ Completed today" : "Mark challenge complete"}
            </Text>
          </Pressable>
          <Text style={styles.challengeNote}>A habit check-in, not a measured carbon-saving claim.</Text>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>CURRENT STREAK</Text>
            <Text style={styles.statValue}>{engagement?.currentStreak ?? "—"} <Text style={styles.statUnit}>days</Text></Text>
            <Text style={styles.statHint}>Consecutive challenge days</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>HABIT POINTS</Text>
            <Text style={styles.statValue}>{engagement?.points ?? "—"}</Text>
            <Text style={styles.statHint}>10 points per completed day</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Your impact profile</Text>
            <Text style={styles.sectionSubtitle}>Based on estimates you have saved on this device.</Text>
          </View>
          <Pressable onPress={() => router.push("/activity")} accessibilityRole="button">
            <Text style={styles.linkText}>History →</Text>
          </Pressable>
        </View>

        <View style={styles.footprintCard}>
          <View style={styles.cardTop}>
            <Text style={styles.cardEyebrow}>LATEST ANNUAL PERSONAL FOOTPRINT</Text>
            <View style={[styles.statusPill, latest && styles.statusActive]}>
              <Text style={[styles.statusText, latest && styles.statusActiveText]}>
                {loading ? "Loading" : latest ? "Saved estimate" : "No estimate"}
              </Text>
            </View>
          </View>
          {latest ? (
            <>
              <View style={styles.numberRow}>
                <Text style={styles.number}>{amount(latest.total)}</Text>
                <View style={styles.unitBlock}>
                  <Text style={styles.unit}>kg CO₂e</Text>
                  <Text style={styles.unitSub}>per person / year</Text>
                </View>
              </View>
              <Text style={styles.bodyText}>Last saved {formatDate(latest.createdAt)}. This is an estimate, not a live measurement.</Text>
              <Pressable onPress={() => router.push("/calculator")} accessibilityRole="button" style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Update footprint</Text>
                <Text style={styles.buttonArrow}>›</Text>
              </Pressable>
            </>
          ) : (
            <>
              <View style={styles.numberRow}>
                <Text style={styles.numberPlaceholder}>—</Text>
                <View style={styles.unitBlock}>
                  <Text style={styles.unit}>kg CO₂e</Text>
                  <Text style={styles.unitSub}>per person / year</Text>
                </View>
              </View>
              <Text style={styles.bodyText}>Complete your first calculation to create a personal baseline.</Text>
              <Pressable onPress={() => router.push("/calculator")} accessibilityRole="button" style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Calculate my footprint</Text>
                <Text style={styles.buttonArrow}>›</Text>
              </Pressable>
            </>
          )}
          <Text style={styles.privacyNote}>Your footprint history and habit check-ins stay on this device. No account or cloud sync is currently used.</Text>
        </View>

        {latest ? (
          <>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Where your estimate comes from</Text>
                <Text style={styles.sectionSubtitle}>Latest saved category breakdown.</Text>
              </View>
            </View>
            <View style={styles.categoryGrid}>
              {categories.map((item) => (
                <View key={item.name} style={styles.categoryCard}>
                  <View style={[styles.categoryDot, { backgroundColor: item.tone }]} />
                  <Text style={styles.categoryName}>{item.name}</Text>
                  <Text style={styles.categoryValue}>{amount(item.value)} kg</Text>
                  <Text style={styles.categoryShare}>{latest.total > 0 ? (item.value / latest.total * 100).toFixed(1) : "0.0"}% of total</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Progress snapshot</Text>
            <Text style={styles.sectionSubtitle}>A record of saved estimates, not calendar-month totals.</Text>
          </View>
          <Pressable onPress={() => router.push("/plan")} accessibilityRole="button">
            <Text style={styles.linkText}>My plan →</Text>
          </Pressable>
        </View>
        <View style={styles.profileCard}>
          <View style={styles.profileMetricRow}>
            <View style={styles.profileMetric}>
              <Text style={styles.profileMetricValue}>{history.length}</Text>
              <Text style={styles.profileMetricLabel}>Saved estimates</Text>
            </View>
            <View style={styles.profileMetric}>
              <Text style={styles.profileMetricValue}>{engagement?.completedDays.length ?? "—"}</Text>
              <Text style={styles.profileMetricLabel}>Challenge days</Text>
            </View>
            <View style={styles.profileMetric}>
              <Text style={styles.profileMetricValue}>{lowestSaved ? amount(lowestSaved.total) : "—"}</Text>
              <Text style={styles.profileMetricLabel}>Lowest saved kg</Text>
            </View>
          </View>
          {change !== null ? (
            <>
              <View style={styles.profileDivider} />
              <Text style={styles.profileTitle}>{change <= 0 ? "Latest estimate is lower than the previous one" : "Latest estimate is higher than the previous one"}</Text>
              <Text style={styles.changeValue}>{change > 0 ? "+" : ""}{amount(change)} kg CO₂e{changePercent === null ? "" : ` (${changePercent > 0 ? "+" : ""}${changePercent.toFixed(1)}%)`}</Text>
              <Text style={styles.disclaimer}>A difference may reflect changed inputs or assumptions. It does not prove that real-world emissions changed.</Text>
            </>
          ) : (
            <Text style={styles.profileHint}>{latest ? "Save another estimate later to create a comparison." : "Your saved footprint comparisons will appear here after your first and second calculations."}</Text>
          )}
          {lowestSaved ? <Text style={styles.profileHint}>Lowest saved estimate: {formatDate(lowestSaved.createdAt)}. This is a historical record, not proof of a sustained reduction.</Text> : null}
        </View>

        <View style={styles.factCard}>
          <View style={styles.factHeader}>
            <Text style={styles.cardEyebrow}>DAILY ECO INTELLIGENCE</Text>
            <Text style={styles.factCategory}>{ecoFact.category}</Text>
          </View>
          <Text style={styles.factTitle}>{ecoFact.title}</Text>
          <Text style={styles.factBody}>{ecoFact.body}</Text>
          <Text style={styles.factNote}>Short educational guidance · Content rotates daily</Text>
        </View>

        <View style={styles.quickLinks}>
          <Pressable onPress={() => router.push("/calculator")} style={styles.quickLink} accessibilityRole="button">
            <Text style={styles.quickLinkTitle}>Calculator</Text>
            <Text style={styles.quickLinkBody}>Update your footprint</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/plan")} style={styles.quickLink} accessibilityRole="button">
            <Text style={styles.quickLinkTitle}>Reduction plan</Text>
            <Text style={styles.quickLinkBody}>Review your personal goal</Text>
          </Pressable>
        </View>

        {loadError ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>Some saved information could not be loaded.</Text>
            <Pressable onPress={() => void refresh()}><Text style={styles.retryText}>Try again</Text></Pressable>
          </View>
        ) : null}

        <View style={styles.footer}>
          <Text style={styles.footerBrand}>CARBONLENS</Text>
          <Text style={styles.footerText}>Understand your impact. Make informed choices.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.page },
  content: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 32 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 26 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandMark: { width: 25, height: 25, borderWidth: 2, borderColor: C.purple, borderRadius: 8, alignItems: "center", justifyContent: "center", transform: [{ rotate: "45deg" }] },
  brandMarkInner: { width: 7, height: 7, borderRadius: 3, backgroundColor: C.purple },
  brand: { color: C.ink, fontSize: 19, fontWeight: "800", letterSpacing: -0.7 },
  todayPill: { backgroundColor: C.mint, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  todayPillText: { color: C.green, fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  headingBlock: { marginBottom: 20 },
  eyebrow: { color: C.purple, fontSize: 9, fontWeight: "800", letterSpacing: 1.2, marginBottom: 9 },
  heading: { color: C.ink, fontSize: 32, lineHeight: 37, fontWeight: "800", letterSpacing: -1.2 },
  subheading: { color: C.muted, fontSize: 13, lineHeight: 20, marginTop: 9, maxWidth: 320 },
  challengeCard: { backgroundColor: C.ink, borderRadius: 22, padding: 19, marginBottom: 12 },
  challengeTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardEyebrow: { color: C.muted, fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  pointsPill: { backgroundColor: "#393344", paddingHorizontal: 9, paddingVertical: 6, borderRadius: 20 },
  pointsText: { color: "#D9CFF2", fontSize: 9, fontWeight: "800" },
  challengeTitle: { color: C.white, fontSize: 22, lineHeight: 27, fontWeight: "800", marginTop: 17, letterSpacing: -0.5 },
  challengeDescription: { color: "#D2CED9", fontSize: 12, lineHeight: 18, marginTop: 7 },
  challengeButton: { backgroundColor: "#FFFFFF", minHeight: 45, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 17, paddingHorizontal: 12 },
  challengeButtonDone: { backgroundColor: "#DDEDE3" },
  challengeButtonText: { color: C.ink, fontSize: 12, fontWeight: "800" },
  challengeButtonDoneText: { color: C.green },
  challengeNote: { color: "#B8B2C2", fontSize: 9, marginTop: 10 },
  statRow: { flexDirection: "row", gap: 10, marginBottom: 25 },
  statCard: { flex: 1, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 13 },
  statLabel: { color: C.muted, fontSize: 8, fontWeight: "800", letterSpacing: 0.7 },
  statValue: { color: C.ink, fontSize: 24, fontWeight: "800", marginTop: 7 },
  statUnit: { color: C.muted, fontSize: 10, fontWeight: "700" },
  statHint: { color: C.muted, fontSize: 9, lineHeight: 13, marginTop: 3 },
  sectionHeader: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 11, marginTop: 2 },
  sectionTitle: { color: C.ink, fontSize: 17, fontWeight: "800", letterSpacing: -0.4 },
  sectionSubtitle: { color: C.muted, fontSize: 10, lineHeight: 15, marginTop: 4, maxWidth: 250 },
  linkText: { color: C.purple, fontSize: 10, fontWeight: "800", paddingBottom: 2 },
  footprintCard: { backgroundColor: C.white, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 18, marginBottom: 23 },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  statusPill: { backgroundColor: C.amber, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 5 },
  statusActive: { backgroundColor: C.mint },
  statusText: { color: "#8A5C3D", fontSize: 8, fontWeight: "700" },
  statusActiveText: { color: C.green },
  numberRow: { flexDirection: "row", alignItems: "center", marginTop: 15, marginBottom: 7 },
  number: { color: C.ink, fontSize: 43, lineHeight: 51, fontWeight: "800", letterSpacing: -1.6 },
  numberPlaceholder: { color: C.ink, fontSize: 46, lineHeight: 54, fontWeight: "800" },
  unitBlock: { marginLeft: 9, paddingTop: 6 },
  unit: { color: C.ink, fontSize: 13, fontWeight: "700" },
  unitSub: { color: C.muted, fontSize: 9, marginTop: 2 },
  bodyText: { color: C.muted, fontSize: 11, lineHeight: 17, marginBottom: 14 },
  primaryButton: { minHeight: 47, borderRadius: 13, backgroundColor: C.purple, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 14 },
  primaryButtonText: { color: C.white, fontSize: 12, fontWeight: "800" },
  buttonArrow: { color: C.white, fontSize: 20, marginLeft: 7, marginTop: -2 },
  privacyNote: { color: C.muted, fontSize: 9, lineHeight: 14, marginTop: 11 },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9, marginBottom: 23 },
  categoryCard: { width: "48%", backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 12, minHeight: 91 },
  categoryDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 7 },
  categoryName: { color: C.ink, fontSize: 11, fontWeight: "800" },
  categoryValue: { color: C.purple, fontSize: 13, fontWeight: "800", marginTop: 5 },
  categoryShare: { color: C.muted, fontSize: 9, marginTop: 2 },
  profileCard: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 18, padding: 16, marginBottom: 20 },
  profileMetricRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  profileMetric: { flex: 1 },
  profileMetricValue: { color: C.ink, fontSize: 20, fontWeight: "800" },
  profileMetricLabel: { color: C.muted, fontSize: 8, lineHeight: 12, marginTop: 3 },
  profileDivider: { height: 1, backgroundColor: C.border, marginVertical: 13 },
  profileTitle: { color: C.ink, fontSize: 12, lineHeight: 17, fontWeight: "800" },
  changeValue: { color: C.purple, fontSize: 17, fontWeight: "800", marginTop: 5 },
  disclaimer: { color: C.muted, fontSize: 9, lineHeight: 14, marginTop: 8 },
  profileHint: { color: C.muted, fontSize: 10, lineHeight: 15, marginTop: 12 },
  factCard: { backgroundColor: C.mint, borderRadius: 18, padding: 17, marginBottom: 17 },
  factHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  factCategory: { color: C.green, fontSize: 8, fontWeight: "800", letterSpacing: 0.8 },
  factTitle: { color: C.ink, fontSize: 16, fontWeight: "800", marginTop: 13 },
  factBody: { color: "#4E5C54", fontSize: 11, lineHeight: 17, marginTop: 6 },
  factNote: { color: C.green, fontSize: 8, fontWeight: "700", marginTop: 11 },
  quickLinks: { flexDirection: "row", gap: 10, marginBottom: 12 },
  quickLink: { flex: 1, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 13 },
  quickLinkTitle: { color: C.ink, fontSize: 11, fontWeight: "800" },
  quickLinkBody: { color: C.muted, fontSize: 9, lineHeight: 13, marginTop: 4 },
  errorCard: { backgroundColor: "#FBECEC", borderRadius: 12, padding: 12, marginTop: 8 },
  errorText: { color: "#A33D3D", fontSize: 10 },
  retryText: { color: C.purple, fontSize: 10, fontWeight: "800", marginTop: 7 },
  footer: { alignItems: "center", marginTop: 19, paddingTop: 16, borderTopWidth: 1, borderTopColor: C.border },
  footerBrand: { color: C.purple, fontSize: 9, fontWeight: "800", letterSpacing: 1.8 },
  footerText: { color: C.muted, fontSize: 9, marginTop: 5 }
});
