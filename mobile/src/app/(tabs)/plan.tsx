import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFootprintHistory, type FootprintRecord } from "../../lib/history";
import {
  clearReductionGoal,
  getReductionGoal,
  saveReductionGoal,
  type ReductionGoal
} from "../../lib/goals";

const C = {
  page: "#F7F6FA", white: "#FFFFFF", ink: "#211D2B", muted: "#777183",
  purple: "#5B45A0", purpleSoft: "#F0ECF8", border: "#EAE7F0",
  mint: "#EDF5F0", peach: "#FBF1EA", green: "#477B64", red: "#A33D3D"
};
const REDUCTIONS = [5, 10, 15, 20];
const PERIODS = [3, 6, 12];

function formatAmount(value: number) {
  return value.toLocaleString("en-IN", { maximumFractionDigits: 1 });
}
function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function largestCategory(record: FootprintRecord) {
  const rows = [
    { name: "Energy", value: record.categories.energy },
    { name: "Transport", value: record.categories.transport },
    { name: "Food", value: record.categories.food }
  ];
  return rows.sort((a, b) => b.value - a.value)[0];
}

function adviceFor(category: string) {
  if (category === "Energy") return [
    "Check whether your electricity bill shows unusually high monthly use before changing habits.",
    "Use efficient lighting and switch off appliances that are left running unnecessarily.",
    "If air conditioning is used, try a slightly higher set temperature and use fans where practical."
  ];
  if (category === "Transport") return [
    "Combine nearby errands into one trip instead of making separate journeys.",
    "For suitable routes, compare bus, metro or rail with a private-vehicle trip.",
    "When a car trip is necessary, consider sharing it with people making the same journey."
  ];
  return [
    "Try replacing some higher-impact meat or dairy portions with dal, beans or other pulses.",
    "Use portion planning and storage to avoid buying food that is later discarded.",
    "Enter rice and pulses using dry weight when updating your calculator inputs."
  ];
}

export default function PlanScreen() {
  const router = useRouter();
  const [latest, setLatest] = useState<FootprintRecord | null>(null);
  const [goal, setGoal] = useState<ReductionGoal | null>(null);
  const [reduction, setReduction] = useState(10);
  const [months, setMonths] = useState(3);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [history, savedGoal] = await Promise.all([getFootprintHistory(), getReductionGoal()]);
      setLatest(history[0] ?? null);
      setGoal(savedGoal);
      if (savedGoal) {
        setReduction(savedGoal.reductionPercent);
        setMonths(savedGoal.months);
      }
      setError("");
    } catch {
      setError("Your saved data could not be loaded. Check device storage and retry.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));

  const createGoal = async () => {
    if (!latest) return;
    setSaving(true);
    setError("");
    try {
      const next = await saveReductionGoal(latest.id, latest.total, reduction, months);
      setGoal(next);
    } catch {
      setError("The goal could not be saved on this device. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const removeGoal = async () => {
    try {
      await clearReductionGoal();
      setGoal(null);
    } catch {
      setError("The saved goal could not be removed. Try again.");
    }
  };

  const largest = latest ? largestCategory(latest) : null;
  const scenarioSavings = largest ? largest.value * 0.1 : 0;
  const scenarioTotal = latest ? Math.max(0, latest.total - scenarioSavings) : 0;
  const hasProgressRecord = !!(goal && latest && latest.id !== goal.baselineRecordId);
  const observedReduction = hasProgressRecord && goal && latest
    ? ((goal.baselineTotal - latest.total) / goal.baselineTotal) * 100
    : null;
  const targetTotal = goal ? goal.baselineTotal * (1 - goal.reductionPercent / 100) : 0;
  const progress = observedReduction !== null && goal
    ? Math.max(0, Math.min(100, observedReduction / goal.reductionPercent * 100))
    : 0;
  const achieved = !!(goal && latest && hasProgressRecord && latest.total <= targetTotal);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>YOUR REDUCTION PLAN</Text>
        <Text style={styles.title}>Turn your estimate into a plan.</Text>
        <Text style={styles.subtitle}>Set a realistic target, test a simple scenario and focus on the category that currently contributes most to your estimate.</Text>

        {loading ? (
          <View style={styles.card}><Text style={styles.body}>Loading your saved estimates…</Text></View>
        ) : !latest ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create a baseline first</Text>
            <Text style={styles.body}>A reduction target needs a saved footprint estimate. Complete the calculator before setting a goal.</Text>
            <Pressable onPress={() => router.push("/calculator")} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Calculate my footprint</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.cardEyebrow}>YOUR CURRENT BASELINE</Text>
              <Text style={styles.baseline}>{formatAmount(latest.total)} <Text style={styles.unit}>kg CO₂e/year</Text></Text>
              <Text style={styles.body}>Latest saved estimate · {formatDate(latest.createdAt)}</Text>
              {goal ? (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.cardTitle}>Your active target</Text>
                  <Text style={styles.targetLine}>Reduce by {goal.reductionPercent}% in {goal.months} months</Text>
                  <Text style={styles.body}>Baseline: {formatAmount(goal.baselineTotal)} kg · Target: {formatAmount(targetTotal)} kg CO₂e/year</Text>
                  <Text style={styles.body}>Target date: {formatDate(goal.targetDate)}</Text>
                  {hasProgressRecord ? (
                    <>
                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${progress}%` }]} />
                      </View>
                      <Text style={achieved ? styles.successText : styles.progressText}>
                        {achieved ? "Target reached in the latest estimate." : `${observedReduction! >= 0 ? "Estimated reduction" : "Estimated increase"}: ${Math.abs(observedReduction!).toFixed(1)}% vs baseline.`}
                      </Text>
                      <Text style={styles.body}>Latest estimate: {formatAmount(latest.total)} kg CO₂e/year</Text>
                    </>
                  ) : (
                    <Text style={styles.progressText}>Baseline saved. Complete the calculator again later to compare a new estimate against this target.</Text>
                  )}
                  <Text style={styles.disclaimer}>This is a comparison of estimates, not a measured emissions reduction or proof that a specific action caused the change.</Text>
                  <Pressable onPress={() => void removeGoal()}><Text style={styles.removeGoal}>Remove goal</Text></Pressable>
                </>
              ) : (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.cardTitle}>Set a reduction target</Text>
                  <Text style={styles.fieldLabel}>Choose a reduction target</Text>
                  <View style={styles.optionRow}>
                    {REDUCTIONS.map((value) => (
                      <Pressable key={value} onPress={() => setReduction(value)} accessibilityRole="button" accessibilityState={{ selected: reduction === value }} style={[styles.option, reduction === value && styles.optionActive]}>
                        <Text style={[styles.optionText, reduction === value && styles.optionTextActive]}>{value}%</Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text style={styles.fieldLabel}>Choose a time period</Text>
                  <View style={styles.optionRow}>
                    {PERIODS.map((value) => (
                      <Pressable key={value} onPress={() => setMonths(value)} accessibilityRole="button" accessibilityState={{ selected: months === value }} style={[styles.option, months === value && styles.optionActive]}>
                        <Text style={[styles.optionText, months === value && styles.optionTextActive]}>{value} months</Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text style={styles.targetLine}>Target: {formatAmount(latest.total * (1 - reduction / 100))} kg CO₂e/year</Text>
                  <Pressable onPress={() => void createGoal()} disabled={saving} style={[styles.primaryButton, saving && styles.disabledButton]}>
                    <Text style={styles.primaryButtonText}>{saving ? "Saving goal…" : "Save my goal"}</Text>
                  </Pressable>
                  <Text style={styles.disclaimer}>This target is a personal planning choice, not a science-based pathway or a guarantee of achievable savings.</Text>
                </>
              )}
            </View>

            {largest ? (
              <View style={styles.card}>
                <Text style={styles.cardEyebrow}>WHAT-IF SCENARIO</Text>
                <Text style={styles.cardTitle}>Reduce your largest category by 10%</Text>
                <Text style={styles.body}>Your largest current category is {largest.name.toLowerCase()} at {formatAmount(largest.value)} kg CO₂e/year.</Text>
                <View style={styles.scenarioRow}>
                  <View style={styles.scenarioCell}>
                    <Text style={styles.scenarioLabel}>Estimated saving</Text>
                    <Text style={styles.scenarioValue}>{formatAmount(scenarioSavings)} kg</Text>
                  </View>
                  <View style={styles.scenarioCell}>
                    <Text style={styles.scenarioLabel}>Scenario total</Text>
                    <Text style={styles.scenarioValue}>{formatAmount(scenarioTotal)} kg</Text>
                  </View>
                </View>
                <Text style={styles.disclaimer}>Illustrative arithmetic only: this assumes the selected category falls by exactly 10%. It is not a forecast or a claim that a listed action will achieve that reduction.</Text>
              </View>
            ) : null}

            {largest ? (
              <View style={styles.card}>
                <Text style={styles.cardEyebrow}>ACTIONS TO CONSIDER</Text>
                <Text style={styles.cardTitle}>Start with {largest.name.toLowerCase()}</Text>
                {adviceFor(largest.name).map((item, index) => (
                  <View key={item} style={styles.adviceRow}>
                    <View style={styles.adviceNumber}><Text style={styles.adviceNumberText}>{index + 1}</Text></View>
                    <Text style={styles.adviceText}>{item}</Text>
                  </View>
                ))}
                <Text style={styles.disclaimer}>Suggestions are general prompts. Their actual impact depends on your circumstances and is not quantified here.</Text>
              </View>
            ) : null}
          </>
        )}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <View style={styles.footer}>
          <Text style={styles.footerText}>CarbonLens · Plan using estimates, then verify with your next calculation.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.page },
  content: { padding: 20, paddingTop: 28, paddingBottom: 36 },
  eyebrow: { color: C.purple, fontSize: 10, fontWeight: "800", letterSpacing: 1.5, marginBottom: 10 },
  title: { color: C.ink, fontSize: 30, lineHeight: 36, fontWeight: "800", letterSpacing: -0.9 },
  subtitle: { color: C.muted, fontSize: 13, lineHeight: 20, marginTop: 9, marginBottom: 22 },
  card: { backgroundColor: C.white, borderRadius: 18, borderWidth: 1, borderColor: C.border, padding: 17, marginBottom: 13 },
  cardEyebrow: { color: C.muted, fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  baseline: { color: C.ink, fontSize: 30, fontWeight: "800", marginTop: 9 },
  unit: { color: C.muted, fontSize: 11, fontWeight: "700" },
  body: { color: C.muted, fontSize: 11, lineHeight: 17, marginTop: 7 },
  cardTitle: { color: C.ink, fontSize: 15, fontWeight: "800", marginTop: 8, marginBottom: 7 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 16 },
  fieldLabel: { color: C.ink, fontSize: 11, fontWeight: "700", marginTop: 13, marginBottom: 8 },
  optionRow: { flexDirection: "row", gap: 7, marginBottom: 5 },
  option: { flex: 1, minHeight: 39, alignItems: "center", justifyContent: "center", borderRadius: 10, borderWidth: 1, borderColor: C.border, backgroundColor: C.white, paddingHorizontal: 5 },
  optionActive: { backgroundColor: C.purpleSoft, borderColor: C.purple },
  optionText: { color: C.muted, fontSize: 11, fontWeight: "700" },
  optionTextActive: { color: C.purple },
  targetLine: { color: C.purple, fontSize: 13, fontWeight: "800", marginTop: 13 },
  primaryButton: { minHeight: 47, borderRadius: 12, backgroundColor: C.purple, alignItems: "center", justifyContent: "center", marginTop: 15, paddingHorizontal: 12 },
  primaryButtonText: { color: C.white, fontSize: 12, fontWeight: "800" },
  disabledButton: { opacity: 0.6 },
  progressTrack: { height: 8, borderRadius: 8, backgroundColor: "#EEEAF3", overflow: "hidden", marginTop: 13 },
  progressFill: { height: 8, borderRadius: 8, backgroundColor: C.green },
  progressText: { color: C.purple, fontSize: 11, fontWeight: "700", marginTop: 9, lineHeight: 16 },
  successText: { color: C.green, fontSize: 11, fontWeight: "800", marginTop: 9 },
  disclaimer: { color: C.muted, fontSize: 9, lineHeight: 14, marginTop: 11 },
  removeGoal: { color: C.red, fontSize: 10, fontWeight: "800", marginTop: 13 },
  scenarioRow: { flexDirection: "row", gap: 9, marginTop: 13 },
  scenarioCell: { flex: 1, backgroundColor: C.purpleSoft, borderRadius: 12, padding: 12 },
  scenarioLabel: { color: C.muted, fontSize: 9, fontWeight: "700" },
  scenarioValue: { color: C.purple, fontSize: 17, fontWeight: "800", marginTop: 5 },
  adviceRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: 12 },
  adviceNumber: { width: 22, height: 22, borderRadius: 8, backgroundColor: C.mint, alignItems: "center", justifyContent: "center" },
  adviceNumberText: { color: C.green, fontSize: 10, fontWeight: "800" },
  adviceText: { flex: 1, color: C.ink, fontSize: 11, lineHeight: 17 },
  errorText: { color: C.red, fontSize: 11, lineHeight: 16, marginTop: 6 },
  footer: { paddingTop: 12, alignItems: "center" },
  footerText: { color: C.muted, fontSize: 9, lineHeight: 14, textAlign: "center" }
});
