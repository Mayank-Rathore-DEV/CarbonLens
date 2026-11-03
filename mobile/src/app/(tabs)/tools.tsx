import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { calculationFactors } from "../../lib/calculator";
import {
  getHouseholdCheckIns,
  saveHouseholdCheckIn,
  type HouseholdCheckIn
} from "../../lib/household";

type ToolSection = "journey" | "household" | "waste";
type VehicleKind = "petrol-car" | "diesel-car" | "cng-car" | "petrol-bike" | "ev";

const C = {
  page: "#F7F6FA", white: "#FFFFFF", ink: "#211D2B", muted: "#777183",
  purple: "#5B45A0", purpleSoft: "#F0ECF8", border: "#EAE7F0",
  mint: "#EDF5F0", green: "#477B64", red: "#A33D3D", blue: "#EEF2F8"
};

const VEHICLES: { id: VehicleKind; label: string; unit: string }[] = [
  { id: "petrol-car", label: "Petrol car", unit: "km per litre" },
  { id: "diesel-car", label: "Diesel car", unit: "km per litre" },
  { id: "cng-car", label: "CNG car", unit: "km per kg" },
  { id: "petrol-bike", label: "Petrol bike", unit: "km per litre" },
  { id: "ev", label: "Electric vehicle", unit: "km per kWh" }
];

const WASTE_GUIDE = [
  { title: "Kitchen scraps and food waste", kind: "Wet waste", keywords: "vegetable peels fruit leftovers tea leaves", guidance: "Keep food scraps separate from dry recyclables. Use a covered wet-waste bin; compost only where you have a suitable system. Do not put plastic, glass or metal into compost." },
  { title: "Clean paper and cardboard", kind: "Dry recyclable", keywords: "newspaper cartons boxes paper", guidance: "Keep paper and cardboard clean and dry, flatten boxes, and hand them to your local dry-waste collection or authorised recycler. Greasy or food-soiled paper may not be accepted." },
  { title: "Plastic bottles and rigid containers", kind: "Dry recyclable", keywords: "pet bottle shampoo detergent plastic", guidance: "Empty and rinse containers where practical, keep them dry, and follow the plastic categories accepted by your local collection service. Do not assume every plastic item is recyclable." },
  { title: "Multilayer wrappers and sachets", kind: "Special collection", keywords: "chips packets snack wrappers sachets", guidance: "These are often difficult to recycle through ordinary household collection. Keep them separate and check for a local authorised take-back or collection programme; do not put them in wet waste." },
  { title: "Glass bottles and jars", kind: "Dry recyclable", keywords: "glass broken bottle jar", guidance: "Reuse intact jars where possible. Keep glass separate and protect handlers from sharp edges. Wrap broken glass securely and label it before disposal according to local rules." },
  { title: "Batteries and e-waste", kind: "Hazardous / e-waste", keywords: "mobile phone charger laptop battery electronics", guidance: "Never put batteries or electronic devices in wet or mixed household waste. Store them safely and hand them to an authorised e-waste collection point, producer take-back programme or municipal facility." },
  { title: "Medicines and chemical containers", kind: "Special handling", keywords: "medicine paint pesticide cleaner chemical", guidance: "Do not pour medicines, paints, oils or chemicals into drains or soil. Follow product or municipal hazardous-waste instructions and use an authorised take-back route where available." },
  { title: "Clothes and textiles", kind: "Reuse first", keywords: "fabric shoes bedsheets textile", guidance: "Donate wearable items, repair or repurpose usable fabric, and look for textile collection programmes. Keep wet or contaminated textiles out of donation streams." },
  { title: "Sanitary and personal hygiene waste", kind: "Domestic sanitary waste", keywords: "diaper pads tissues masks", guidance: "Wrap sanitary waste securely and follow local municipal instructions. Keep it separate from recyclables and never place it loose in a dry-recyclable bag." }
];

function numeric(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(value: string) {
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function amount(value: number) {
  return value.toLocaleString("en-IN", { maximumFractionDigits: 1 });
}

export default function ToolsScreen() {
  const [section, setSection] = useState<ToolSection>("journey");
  const [distance, setDistance] = useState("");
  const [vehicle, setVehicle] = useState<VehicleKind>("petrol-car");
  const [efficiency, setEfficiency] = useState("");
  const [occupancy, setOccupancy] = useState("1");
  const [fuelPrice, setFuelPrice] = useState("");
  const [busFare, setBusFare] = useState("");
  const [railFare, setRailFare] = useState("");
  const [carMinutes, setCarMinutes] = useState("");
  const [busMinutes, setBusMinutes] = useState("");
  const [railMinutes, setRailMinutes] = useState("");
  const [month, setMonth] = useState(monthKey());
  const [electricity, setElectricity] = useState("");
  const [lpg, setLpg] = useState("");
  const [householdSize, setHouseholdSize] = useState("1");
  const [householdRows, setHouseholdRows] = useState<HouseholdCheckIn[]>([]);
  const [householdLoading, setHouseholdLoading] = useState(false);
  const [householdError, setHouseholdError] = useState("");
  const [search, setSearch] = useState("");

  const refreshHousehold = useCallback(async () => {
    setHouseholdLoading(true);
    try {
      setHouseholdRows(await getHouseholdCheckIns());
      setHouseholdError("");
    } catch {
      setHouseholdError("Household records could not be loaded. Try again.");
    } finally {
      setHouseholdLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void refreshHousehold();
  }, [refreshHousehold]));

  const selectedVehicle = VEHICLES.find((item) => item.id === vehicle)!;
  const journey = useMemo(() => {
    const km = numeric(distance);
    const efficiencyValue = numeric(efficiency);
    const people = numeric(occupancy);
    if (km === null || km <= 0 || efficiencyValue === null || efficiencyValue <= 0 ||
        people === null || !Number.isInteger(people) || people < 1 || people > 20) return null;
    const factor = calculationFactors.vehicles[vehicle];
    const privateEmissions = (km / efficiencyValue) * factor / people;
    const fuel = numeric(fuelPrice);
    const busCost = numeric(busFare);
    const railCost = numeric(railFare);
    const carTime = numeric(carMinutes);
    const busTime = numeric(busMinutes);
    const railTime = numeric(railMinutes);
    return [
      { name: selectedVehicle.label, emissions: privateEmissions, cost: fuel === null ? null : (km / efficiencyValue) * fuel / people, minutes: carTime },
      { name: "City bus", emissions: km * calculationFactors.publicTransport.bus, cost: busCost, minutes: busTime },
      { name: "Rail / metro", emissions: km * calculationFactors.publicTransport.rail, cost: railCost, minutes: railTime }
    ];
  }, [distance, efficiency, occupancy, fuelPrice, busFare, railFare, carMinutes, busMinutes, railMinutes, vehicle, selectedVehicle.label]);

  const filteredWaste = WASTE_GUIDE.filter((item) =>
    `${item.title} ${item.kind} ${item.keywords} ${item.guidance}`.toLowerCase().includes(search.trim().toLowerCase())
  );

  const saveHousehold = async () => {
    const electricityValue = numeric(electricity);
    const lpgValue = numeric(lpg);
    const sizeValue = numeric(householdSize);
    if (electricityValue === null || lpgValue === null || sizeValue === null ||
        !Number.isInteger(sizeValue) || sizeValue < 1 || sizeValue > 30) {
      setHouseholdError("Enter valid non-negative electricity and LPG use, plus a whole household size from 1 to 30.");
      return;
    }
    setHouseholdLoading(true);
    setHouseholdError("");
    try {
      await saveHouseholdCheckIn(month, electricityValue, lpgValue, sizeValue);
      setHouseholdRows(await getHouseholdCheckIns());
    } catch (error) {
      setHouseholdError(error instanceof Error ? error.message : "The monthly record could not be saved.");
    } finally {
      setHouseholdLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>PRACTICAL TOOLS</Text>
        <Text style={styles.title}>Make informed choices.</Text>
        <Text style={styles.subtitle}>Compare everyday journeys, keep household energy records and check how to handle common waste items.</Text>

        <View style={styles.segmentRow}>
          {([
            ["journey", "Journey"],
            ["household", "Home energy"],
            ["waste", "Waste guide"]
          ] as [ToolSection, string][]).map(([id, label]) => (
            <Pressable key={id} onPress={() => setSection(id)} style={[styles.segment, section === id && styles.segmentActive]}>
              <Text style={[styles.segmentText, section === id && styles.segmentTextActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        {section === "journey" ? (
          <View style={styles.card}>
            <Text style={styles.cardEyebrow}>SMART JOURNEY COMPARISON</Text>
            <Text style={styles.cardTitle}>Compare the same trip</Text>
            <Text style={styles.body}>Enter a one-way distance and your own vehicle and fare details. Results are indicative estimates using the factors currently used by the CarbonLens calculator.</Text>
            <Text style={styles.fieldLabel}>Journey distance (km)</Text>
            <TextInput value={distance} onChangeText={setDistance} keyboardType="decimal-pad" placeholder="e.g. 12" placeholderTextColor="#A39EAB" style={styles.input}/>
            <Text style={styles.fieldLabel}>Private vehicle</Text>
            <View style={styles.chipWrap}>
              {VEHICLES.map((item) => (
                <Pressable key={item.id} onPress={() => { setVehicle(item.id); setEfficiency(""); }} style={[styles.chip, vehicle === item.id && styles.chipActive]}>
                  <Text style={[styles.chipText, vehicle === item.id && styles.chipTextActive]}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.fieldLabel}>Vehicle efficiency ({selectedVehicle.unit})</Text>
            <TextInput value={efficiency} onChangeText={setEfficiency} keyboardType="decimal-pad" placeholder="Enter your vehicle's actual efficiency" placeholderTextColor="#A39EAB" style={styles.input}/>
            <View style={styles.twoColumns}>
              <View style={styles.column}>
                <Text style={styles.fieldLabel}>People in vehicle</Text>
                <TextInput value={occupancy} onChangeText={setOccupancy} keyboardType="number-pad" style={styles.input}/>
              </View>
              <View style={styles.column}>
                <Text style={styles.fieldLabel}>Fuel / energy price per unit (₹)</Text>
                <TextInput value={fuelPrice} onChangeText={setFuelPrice} keyboardType="decimal-pad" placeholder="Optional" placeholderTextColor="#A39EAB" style={styles.input}/>
              </View>
            </View>
            <Text style={styles.fieldLabel}>Bus fare per passenger (₹) · optional</Text>
            <TextInput value={busFare} onChangeText={setBusFare} keyboardType="decimal-pad" placeholder="Enter fare" placeholderTextColor="#A39EAB" style={styles.input}/>
            <Text style={styles.fieldLabel}>Rail / metro fare per passenger (₹) · optional</Text>
            <TextInput value={railFare} onChangeText={setRailFare} keyboardType="decimal-pad" placeholder="Enter fare" placeholderTextColor="#A39EAB" style={styles.input}/>
            <Text style={styles.fieldLabel}>Expected journey time (minutes) · optional</Text>
            <View style={styles.twoColumns}>
              <View style={styles.column}>
                <Text style={styles.smallLabel}>Private vehicle</Text>
                <TextInput value={carMinutes} onChangeText={setCarMinutes} keyboardType="number-pad" placeholder="Minutes" placeholderTextColor="#A39EAB" style={styles.input}/>
              </View>
              <View style={styles.column}>
                <Text style={styles.smallLabel}>Bus</Text>
                <TextInput value={busMinutes} onChangeText={setBusMinutes} keyboardType="number-pad" placeholder="Minutes" placeholderTextColor="#A39EAB" style={styles.input}/>
              </View>
            </View>
            <Text style={styles.smallLabel}>Rail / metro</Text>
            <TextInput value={railMinutes} onChangeText={setRailMinutes} keyboardType="number-pad" placeholder="Minutes" placeholderTextColor="#A39EAB" style={styles.input}/>
            {journey ? (
              <View style={styles.resultsBox}>
                <Text style={styles.resultHeading}>Estimated comparison · per passenger</Text>
                {journey.map((item) => (
                  <View key={item.name} style={styles.resultRow}>
                    <View style={styles.resultMain}>
                      <Text style={styles.resultName}>{item.name}</Text>
                      <Text style={styles.resultMeta}>{item.cost === null ? "Cost not entered" : `₹${amount(item.cost)}`} · {item.minutes === null ? "Time not entered" : `${amount(item.minutes)} min`}</Text>
                    </View>
                    <Text style={styles.resultValue}>{amount(item.emissions)} kg</Text>
                  </View>
                ))}
                <Text style={styles.resultFootnote}>Emissions are calculated per passenger for the entered distance. Cost and time are shown only when you enter them; this screen does not fetch live fares, routes or traffic.</Text>
              </View>
            ) : (
              <View style={styles.hintBox}><Text style={styles.hintText}>Enter a distance, vehicle efficiency and passenger count to see the comparison.</Text></View>
            )}
            <Text style={styles.disclaimer}>The factors are estimates and may not represent a specific Indian city, operator, vehicle model, grid mix or occupancy pattern. This is not a navigation or live journey-planning service.</Text>
          </View>
        ) : null}

        {section === "household" ? (
          <>
            <View style={styles.card}>
              <Text style={styles.cardEyebrow}>ELECTRICITY & HOUSEHOLD TRACKER</Text>
              <Text style={styles.cardTitle}>Log this month's usage</Text>
              <Text style={styles.body}>Record the electricity consumption shown on your bill and the LPG cylinders used by your household during the selected month.</Text>
              <Text style={styles.fieldLabel}>Month (YYYY-MM)</Text>
              <TextInput value={month} onChangeText={setMonth} placeholder="2026-11" placeholderTextColor="#A39EAB" style={styles.input}/>
              <Text style={styles.fieldLabel}>Electricity consumed (kWh)</Text>
              <TextInput value={electricity} onChangeText={setElectricity} keyboardType="decimal-pad" placeholder="e.g. 180" placeholderTextColor="#A39EAB" style={styles.input}/>
              <Text style={styles.fieldLabel}>LPG cylinders used this month (14.2 kg each)</Text>
              <TextInput value={lpg} onChangeText={setLpg} keyboardType="decimal-pad" placeholder="e.g. 1" placeholderTextColor="#A39EAB" style={styles.input}/>
              <Text style={styles.fieldLabel}>People in household</Text>
              <TextInput value={householdSize} onChangeText={setHouseholdSize} keyboardType="number-pad" style={styles.input}/>
              <Pressable onPress={() => void saveHousehold()} disabled={householdLoading} style={[styles.primaryButton, householdLoading && styles.disabled]}>
                <Text style={styles.primaryButtonText}>{householdLoading ? "Saving…" : "Save monthly check-in"}</Text>
              </Pressable>
              {householdError ? <Text style={styles.errorText}>{householdError}</Text> : null}
              <Text style={styles.disclaimer}>Uses the calculator's current electricity and LPG factors. The result covers only these recorded sources, not your household's full footprint. Saving the same month again replaces that month's entry.</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardEyebrow}>YOUR HOUSEHOLD RECORDS</Text>
              <Text style={styles.cardTitle}>Monthly history</Text>
              {householdLoading && householdRows.length === 0 ? <Text style={styles.body}>Loading records…</Text> : null}
              {!householdLoading && householdRows.length === 0 ? <Text style={styles.body}>No monthly records yet. Add your first check-in above.</Text> : null}
              {householdRows.map((item) => (
                <View key={item.id} style={styles.householdRow}>
                  <View style={styles.householdTop}>
                    <Text style={styles.resultName}>{monthLabel(item.month)}</Text>
                    <Text style={styles.resultValue}>{amount(item.perPersonKgCo2e)} kg/person</Text>
                  </View>
                  <Text style={styles.resultMeta}>{amount(item.electricityKwh)} kWh · {amount(item.lpgCylinders)} LPG cylinders · {item.householdSize} people</Text>
                  <Text style={styles.resultMeta}>Household estimate: {amount(item.householdKgCo2e)} kg CO₂e</Text>
                </View>
              ))}
              {householdError ? <Pressable onPress={() => void refreshHousehold()}><Text style={styles.linkText}>Retry loading</Text></Pressable> : null}
            </View>
          </>
        ) : null}

        {section === "waste" ? (
          <View style={styles.card}>
            <Text style={styles.cardEyebrow}>WASTE DISPOSAL ASSISTANT</Text>
            <Text style={styles.cardTitle}>Where should this go?</Text>
            <Text style={styles.body}>Search common household items to see general handling guidance.</Text>
            <TextInput value={search} onChangeText={setSearch} placeholder="Search: battery, wrapper, glass…" placeholderTextColor="#A39EAB" style={styles.input}/>
            {filteredWaste.length === 0 ? <Text style={styles.body}>No match found. Try a broader item name or category.</Text> : null}
            {filteredWaste.map((item) => (
              <View key={item.title} style={styles.wasteItem}>
                <View style={styles.wasteHeader}>
                  <Text style={styles.wasteTitle}>{item.title}</Text>
                  <Text style={styles.wasteKind}>{item.kind}</Text>
                </View>
                <Text style={styles.wasteGuidance}>{item.guidance}</Text>
              </View>
            ))}
            <View style={styles.hintBox}>
              <Text style={styles.hintText}>Important: this is general India-oriented guidance, not a city-specific collection directory. Municipal rules and authorised collection points vary. Follow your local body's instructions, especially for hazardous and sanitary waste.</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.footer}>
          <Text style={styles.footerBrand}>CARBONLENS TOOLS</Text>
          <Text style={styles.footerText}>Estimates are only as reliable as the inputs and factors behind them.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.page },
  content: { padding: 18, paddingTop: 16, paddingBottom: 34 },
  eyebrow: { color: C.purple, fontSize: 9, fontWeight: "800", letterSpacing: 1.4, marginBottom: 8 },
  title: { color: C.ink, fontSize: 29, lineHeight: 35, fontWeight: "800", letterSpacing: -0.8 },
  subtitle: { color: C.muted, fontSize: 12, lineHeight: 19, marginTop: 8, marginBottom: 18 },
  segmentRow: { flexDirection: "row", backgroundColor: "#ECE9F1", borderRadius: 13, padding: 4, marginBottom: 14 },
  segment: { flex: 1, minHeight: 39, alignItems: "center", justifyContent: "center", borderRadius: 10, paddingHorizontal: 3 },
  segmentActive: { backgroundColor: C.white, elevation: 1 },
  segmentText: { color: C.muted, fontSize: 9, fontWeight: "700" },
  segmentTextActive: { color: C.purple },
  card: { backgroundColor: C.white, borderRadius: 18, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 13 },
  cardEyebrow: { color: C.muted, fontSize: 8, fontWeight: "800", letterSpacing: 1 },
  cardTitle: { color: C.ink, fontSize: 17, fontWeight: "800", marginTop: 8 },
  body: { color: C.muted, fontSize: 10, lineHeight: 16, marginTop: 6, marginBottom: 7 },
  fieldLabel: { color: C.ink, fontSize: 10, fontWeight: "800", marginTop: 13, marginBottom: 6 },
  smallLabel: { color: C.muted, fontSize: 9, fontWeight: "700", marginTop: 8, marginBottom: 5 },
  input: { minHeight: 43, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 11, paddingVertical: 9, color: C.ink, fontSize: 12, backgroundColor: "#FDFCFE" },
  twoColumns: { flexDirection: "row", gap: 9 },
  column: { flex: 1 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  chip: { borderWidth: 1, borderColor: C.border, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: C.white },
  chipActive: { backgroundColor: C.purpleSoft, borderColor: C.purple },
  chipText: { color: C.muted, fontSize: 9, fontWeight: "700" },
  chipTextActive: { color: C.purple },
  resultsBox: { backgroundColor: "#F8F6FB", borderRadius: 13, padding: 12, marginTop: 16 },
  resultHeading: { color: C.ink, fontSize: 11, fontWeight: "800", marginBottom: 5 },
  resultRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: C.border, paddingVertical: 10, gap: 8 },
  resultMain: { flex: 1 },
  resultName: { color: C.ink, fontSize: 11, fontWeight: "800" },
  resultMeta: { color: C.muted, fontSize: 9, lineHeight: 14, marginTop: 3 },
  resultValue: { color: C.purple, fontSize: 12, fontWeight: "800" },
  resultFootnote: { color: C.muted, fontSize: 8, lineHeight: 13, marginTop: 5 },
  hintBox: { backgroundColor: C.mint, borderRadius: 11, padding: 12, marginTop: 13 },
  hintText: { color: "#4E6658", fontSize: 9, lineHeight: 14 },
  disclaimer: { color: C.muted, fontSize: 8, lineHeight: 13, marginTop: 12 },
  primaryButton: { minHeight: 45, borderRadius: 12, backgroundColor: C.purple, alignItems: "center", justifyContent: "center", marginTop: 15 },
  primaryButtonText: { color: C.white, fontSize: 11, fontWeight: "800" },
  disabled: { opacity: 0.6 },
  errorText: { color: C.red, fontSize: 9, lineHeight: 14, marginTop: 9 },
  householdRow: { borderTopWidth: 1, borderTopColor: C.border, paddingVertical: 11 },
  householdTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  linkText: { color: C.purple, fontSize: 10, fontWeight: "800", marginTop: 8 },
  wasteItem: { borderTopWidth: 1, borderTopColor: C.border, paddingVertical: 13 },
  wasteHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  wasteTitle: { flex: 1, color: C.ink, fontSize: 11, fontWeight: "800" },
  wasteKind: { color: C.green, fontSize: 8, fontWeight: "800", textAlign: "right" },
  wasteGuidance: { color: C.muted, fontSize: 10, lineHeight: 16, marginTop: 6 },
  footer: { alignItems: "center", paddingTop: 12 },
  footerBrand: { color: C.purple, fontSize: 8, fontWeight: "800", letterSpacing: 1.5 },
  footerText: { color: C.muted, fontSize: 8, textAlign: "center", lineHeight: 13, marginTop: 5 }
});
