import { useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  page: "#F7F6FA",
  white: "#FFFFFF",
  ink: "#211D2B",
  muted: "#777183",
  purple: "#5B45A0",
  purpleSoft: "#F0ECF8",
  border: "#EAE7F0",
  mint: "#EDF5F0",
  blue: "#EEF2F8",
  peach: "#FBF1EA"
};

const categories = [
  { name: "Energy", hint: "Electricity and cooking fuel", tone: COLORS.purpleSoft },
  { name: "Transport", hint: "Private and public travel", tone: COLORS.blue },
  { name: "Food", hint: "Your food consumption", tone: COLORS.mint },
  { name: "Waste", hint: "Household waste generated", tone: COLORS.peach }
];

export default function DashboardScreen() {
  const router = useRouter();

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
          <Text style={styles.subheading}>Your footprint, progress and next steps in one place.</Text>
        </View>

        <View style={styles.footprintCard}>
          <View style={styles.cardTopLine}>
            <Text style={styles.cardEyebrow}>ANNUAL PERSONAL FOOTPRINT</Text>
            <View style={styles.statusPill}><Text style={styles.statusText}>Not calculated</Text></View>
          </View>
          <View style={styles.numberRow}>
            <Text style={styles.numberPlaceholder}>--</Text>
            <View style={styles.unitBlock}>
              <Text style={styles.unit}>kg CO₂e</Text>
              <Text style={styles.unitSub}>per person / year</Text>
            </View>
          </View>
          <Text style={styles.cardDescription}>Complete your first calculation to see your estimated annual emissions here.</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/calculator")}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryButtonText}>Calculate my footprint</Text>
            <Text style={styles.buttonArrow}>›</Text>
          </Pressable>
          <Text style={styles.privacyNote}>No sample numbers. Your dashboard will show your own results.</Text>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Your footprint breakdown</Text>
            <Text style={styles.sectionSubtitle}>Four areas that shape your estimate</Text>
          </View>
          <Text style={styles.sectionMeta}>4 CATEGORIES</Text>
        </View>

        <View style={styles.categoryGrid}>
          {categories.map((category) => (
            <View key={category.name} style={styles.categoryCard}>
              <View style={[styles.categoryMark, { backgroundColor: category.tone }]}>
                <Text style={styles.categoryInitial}>{category.name.slice(0, 1)}</Text>
              </View>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryHint}>{category.hint}</Text>
              <Text style={styles.emptyValue}>No data yet</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Your progress</Text>
            <Text style={styles.sectionSubtitle}>Monthly trends will appear after tracking is connected.</Text>
          </View>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressEmptyMark}><Text style={styles.progressEmptySymbol}>↗</Text></View>
          <Text style={styles.progressTitle}>Your journey starts with a baseline</Text>
          <Text style={styles.progressText}>Calculate your footprint first. As activity tracking is added, this space will show how your emissions change over time.</Text>
          <Pressable onPress={() => router.push("/calculator")} accessibilityRole="button" style={styles.textButton}>
            <Text style={styles.textButtonLabel}>Create my baseline</Text>
            <Text style={styles.textButtonArrow}>→</Text>
          </Pressable>
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
  statusPill: { backgroundColor: COLORS.peach, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 5 },
  statusText: { color: "#8A5C3D", fontSize: 9, fontWeight: "700" },
  numberRow: { flexDirection: "row", alignItems: "center", marginTop: 18, marginBottom: 8 },
  numberPlaceholder: { color: COLORS.ink, fontSize: 54, lineHeight: 60, fontWeight: "800", letterSpacing: -2 },
  unitBlock: { marginLeft: 10, paddingTop: 7 },
  unit: { color: COLORS.ink, fontSize: 14, fontWeight: "700" },
  unitSub: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  cardDescription: { color: COLORS.muted, fontSize: 12, lineHeight: 18, marginBottom: 18 },
  primaryButton: { minHeight: 50, borderRadius: 14, backgroundColor: COLORS.purple, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  pressed: { opacity: 0.82 },
  primaryButtonText: { color: COLORS.white, fontSize: 13, fontWeight: "700" },
  buttonArrow: { color: COLORS.white, fontSize: 21, marginLeft: 8, marginTop: -2 },
  privacyNote: { color: COLORS.muted, fontSize: 10, lineHeight: 15, marginTop: 12 },
  sectionHeader: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 13, marginTop: 2 },
  sectionTitle: { color: COLORS.ink, fontSize: 17, fontWeight: "800", letterSpacing: -0.4 },
  sectionSubtitle: { color: COLORS.muted, fontSize: 11, lineHeight: 16, marginTop: 4, maxWidth: 270 },
  sectionMeta: { color: COLORS.purple, fontSize: 9, fontWeight: "800", letterSpacing: 0.8 },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 27 },
  categoryCard: { width: "48.4%", minHeight: 145, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 17, padding: 13 },
  categoryMark: { width: 29, height: 29, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 9 },
  categoryInitial: { color: COLORS.ink, fontSize: 12, fontWeight: "800" },
  categoryName: { color: COLORS.ink, fontSize: 13, fontWeight: "800" },
  categoryHint: { color: COLORS.muted, fontSize: 10, lineHeight: 14, marginTop: 3, minHeight: 28 },
  emptyValue: { color: COLORS.purple, fontSize: 10, fontWeight: "700", marginTop: 8 },
  progressCard: { backgroundColor: COLORS.white, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border, padding: 18 },
  progressEmptyMark: { width: 34, height: 34, borderRadius: 12, backgroundColor: COLORS.mint, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  progressEmptySymbol: { color: "#477B64", fontSize: 19, fontWeight: "700" },
  progressTitle: { color: COLORS.ink, fontSize: 14, fontWeight: "800", marginBottom: 6 },
  progressText: { color: COLORS.muted, fontSize: 11, lineHeight: 17 },
  textButton: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", marginTop: 13, gap: 8 },
  textButtonLabel: { color: COLORS.purple, fontSize: 12, fontWeight: "800" },
  textButtonArrow: { color: COLORS.purple, fontSize: 16 },
  footerNote: { alignItems: "center", marginTop: 30, paddingTop: 17, borderTopWidth: 1, borderTopColor: COLORS.border },
  footerBrand: { color: COLORS.purple, fontSize: 9, fontWeight: "800", letterSpacing: 1.8 },
  footerText: { color: COLORS.muted, fontSize: 10, marginTop: 5 }
});