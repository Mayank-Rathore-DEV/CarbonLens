import { useEffect, useMemo, useState } from "react";
import {
  calculateFootprint,
  CalculationInputError,
  foodFactors,
  type CalculatorValues,
  type CalculationResult
} from "../../lib/calculator";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getLatestCalculatorValues, saveFootprintRecord } from "../../lib/history";

const C = {
  page: "#F7F6FA", white: "#FFFFFF", ink: "#211D2B", muted: "#777183",
  purple: "#5B45A0", purpleSoft: "#F0ECF8", border: "#EAE7F0",
  mint: "#EDF5F0", peach: "#FBF1EA", red: "#B54747"
};

type Values = CalculatorValues;
type FieldDef = { key: string; label: string; unit: string; hint?: string };

const initialValues: Values = {
  householdSize: "1", electricity: "", electricityPeriod: "monthly",
  cookingFuel: "lpg", lpgCylinders: "", pngConsumption: "", pngPeriod: "monthly",
  privateVehicle: "no", vehicleType: "petrol-car", vehicleDistance: "",
  vehicleDistancePeriod: "monthly", vehicleEfficiency: "", vehicleOccupancy: "1",
  railDistance: "", busDistance: "", domesticFlightDistance: "", internationalFlightDistance: "",
  beef: "", lamb: "", pork: "", poultry: "", cheese: "", milk: "", eggs: "",
  rice: "", tofu: "", peas: "", beans: "", potatoes: "", rootVegetables: "",
  bananas: "", apples: "", tomatoes: "", foodWaste: "", mixedWaste: ""
};

const foodFields: FieldDef[] = [
  { key: "beef", label: "Beef (beef-herd proxy)", unit: "kg / person / year", hint: "Uses the global beef-herd factor, not dairy-herd beef or an India-specific buffalo factor." },
  { key: "lamb", label: "Lamb / mutton", unit: "kg / person / year" },
  { key: "pork", label: "Pork", unit: "kg / person / year" },
  { key: "poultry", label: "Chicken / poultry", unit: "kg / person / year" },
  { key: "cheese", label: "Cheese", unit: "kg / person / year" },
  { key: "milk", label: "Milk", unit: "kg / person / year" },
  { key: "eggs", label: "Eggs", unit: "kg / person / year" },
  { key: "rice", label: "Rice", unit: "kg / person / year", hint: "Enter dry/uncooked rice weight, not cooked weight." },
  { key: "tofu", label: "Tofu", unit: "kg / person / year" },
  { key: "peas", label: "Peas", unit: "kg / person / year" },
  { key: "beans", label: "Beans / pulses", unit: "kg / person / year", hint: "Enter dry weight before cooking. Mapped to the global \"Other Pulses\" category, not an India-specific dal factor." },
  { key: "potatoes", label: "Potatoes", unit: "kg / person / year" },
  { key: "rootVegetables", label: "Root vegetables", unit: "kg / person / year" },
  { key: "bananas", label: "Bananas", unit: "kg / person / year" },
  { key: "apples", label: "Apples", unit: "kg / person / year" },
  { key: "tomatoes", label: "Tomatoes", unit: "kg / person / year" }
];

const steps = [
  { title: "Household energy", subtitle: "Electricity and cooking fuel", mark: "01" },
  { title: "Transport", subtitle: "Your annual travel activity", mark: "02" },
  { title: "Food", subtitle: "Average food consumed per person", mark: "03" },
  { title: "Experimental waste", subtitle: "Optional estimate shown separately from your footprint", mark: "04" }
];

function OptionGroup({
  value, options, onChange
}: {
  value: string;
  options: { label: string; value: string }[];
  onChange: (next: string) => void;
}) {
  return (
    <View style={styles.optionRow}>
      {options.map((option) => {
        const active = value === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[styles.option, active && styles.optionActive]}
          >
            <Text style={[styles.optionText, active && styles.optionTextActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function NumberField({
  label, unit, value, onChange, hint, placeholder = "0"
}: {
  label: string; unit: string; value: string; onChange: (next: string) => void;
  hint?: string; placeholder?: string;
}) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldHeading}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldUnit}>{unit}</Text>
      </View>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="decimal-pad"
        placeholder={placeholder}
        placeholderTextColor="#AAA5B2"
        style={styles.input}
        returnKeyType="done"
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

function ChoiceField({
  label, value, options, onChange
}: {
  label: string; value: string; options: { label: string; value: string }[];
  onChange: (next: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <OptionGroup value={value} options={options} onChange={onChange} />
    </View>
  );
}

export default function CalculatorScreen() {
  const [values, setValues] = useState<Values>(initialValues);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  const [lastInputs, setLastInputs] = useState<Values | null>(null);

  useEffect(() => {
    let active = true;
    getLatestCalculatorValues().then((saved) => {
      if (active) setLastInputs(saved);
    }).catch(() => {
      if (active) setLastInputs(null);
    });
    return () => { active = false; };
  }, []);

  const update = (key: string, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setError("");
  };

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  const persistResult = async (calculated: CalculationResult, inputs: Values) => {
    setSaveStatus("saving");
    try {
      await saveFootprintRecord(calculated, inputs);
      setLastInputs({ ...inputs });
      setSaveStatus("saved");
    } catch {
      setSaveStatus("failed");
    }
  };

  const calculate = () => {
    try {
      const calculated = calculateFootprint(values);
      setResult(calculated);
      void persistResult(calculated, values);
    } catch (calculationError) {
      if (calculationError instanceof CalculationInputError) {
        setError(calculationError.message);
        setStep(calculationError.step);
        return;
      }

      setError("We couldn't calculate this set of inputs. Check the numbers and try again.");
    }
  };

  const reset = () => {
    setValues(initialValues);
    setStep(0);
    setResult(null);
    setError("");
    setSaveStatus("idle");
  };

  if (result) {
    const categoryRows = [
      { name: "Energy", value: result.categories.energy },
      { name: "Transport", value: result.categories.transport },
      { name: "Food", value: result.categories.food }
    ];
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.eyebrow}>YOUR CARBONLENS RESULT</Text>
          <Text style={styles.resultTitle}>Your estimated annual footprint</Text>
          <View style={styles.resultCard}>
            <Text style={styles.resultNumber}>{result.total.toLocaleString("en-IN", { maximumFractionDigits: 1 })}</Text>
            <Text style={styles.resultUnit}>kg CO₂e per person / year</Text>
            <Text style={styles.resultNote}>Estimated from the activity data you entered. This is not a measured value.</Text>
          </View>
          <View style={styles.saveNotice}>
            <Text style={styles.saveNoticeText}>
              {saveStatus === "saving" ? "Saving this estimate on your device…" :
                saveStatus === "saved" ? "Estimate saved on this device. Open History to compare it with earlier estimates." :
                saveStatus === "failed" ? "This estimate could not be saved. Check your device storage and try again." : ""}
            </Text>
            {saveStatus === "failed" ? (
              <Pressable onPress={() => void persistResult(result)} accessibilityRole="button">
                <Text style={styles.saveRetry}>Try saving again</Text>
              </Pressable>
            ) : null}
          </View>
          <Text style={styles.sectionTitle}>Category breakdown</Text>
          {categoryRows.map((row) => (
            <View key={row.name} style={styles.resultRow}>
              <View style={styles.resultRowTop}>
                <Text style={styles.resultLabel}>{row.name}</Text>
                <Text style={styles.resultValue}>{row.value.toLocaleString("en-IN", { maximumFractionDigits: 1 })} kg</Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${result.total > 0 ? Math.max(0, row.value / result.total * 100) : 0}%` }]} />
              </View>
            </View>
          ))}
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Experimental waste estimate — excluded from the headline total</Text>
            <Text style={styles.resultNumber}>{result.categories.waste.toLocaleString("en-IN", { maximumFractionDigits: 1 })}</Text>
            <Text style={styles.resultUnit}>kg CO₂e per person / year (low-confidence proxy)</Text>
            <Text style={styles.resultNote}>This is shown separately only. The factor assumes disposal conditions that may not match your local municipal system, so it is not added to your footprint total.</Text>
          </View>
          <Text style={styles.methodNote}>Method: activity data × emission factor. Electricity uses the India CEA FY 2025–26 grid factor (0.6751 kg CO₂/kWh) on annualised bill kWh. Household energy is divided by household size; food and travel are personal inputs. Food factors are global lifecycle averages. Waste is an experimental low-confidence proxy and is excluded from the headline total. Transport, fuel and electricity factors do not all cover the same greenhouse gases or lifecycle stages: rail, bus and fuel-combustion factors are CO₂-only, while the aviation factors include CO₂, CH₄ and N₂O but exclude radiative-forcing and distance uplifts. Treat this as a partial indicative estimate, not a complete harmonised CO₂e inventory.</Text>
          <Pressable style={styles.primaryButton} onPress={reset}>
            <Text style={styles.primaryButtonText}>Calculate again</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.eyebrow}>CARBON FOOTPRINT CALCULATOR</Text>
          <Text style={styles.title}>Let's measure your impact.</Text>
          <Text style={styles.subtitle}>Four short steps. Enter annual activity where possible; monthly options are provided where useful.</Text>

          {step === 0 && lastInputs ? (
            <View style={styles.reuseCard}>
              <View style={styles.reuseCopy}>
                <Text style={styles.reuseTitle}>Previous answers available</Text>
                <Text style={styles.reuseText}>Prefill your last saved inputs, then update the figures for this period before calculating again.</Text>
              </View>
              <Pressable
                onPress={() => { setValues({ ...initialValues, ...lastInputs }); setError(""); }}
                accessibilityRole="button"
                style={styles.reuseButton}
              >
                <Text style={styles.reuseButtonText}>Use last inputs</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.progressMeta}>
            <Text style={styles.progressLabel}>STEP {step + 1} OF 4</Text>
            <Text style={styles.progressLabel}>{Math.round(progress)}% COMPLETE</Text>
          </View>
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View>

          <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={styles.stepMark}><Text style={styles.stepMarkText}>{steps[step].mark}</Text></View>
              <View style={styles.stepHeading}>
                <Text style={styles.stepTitle}>{steps[step].title}</Text>
                <Text style={styles.stepSubtitle}>{steps[step].subtitle}</Text>
              </View>
            </View>

            {step === 0 ? (
              <>
                <NumberField label="People in your household" unit="people" value={values.householdSize} onChange={(v) => update("householdSize", v)} hint="Used to allocate household electricity, cooking fuel and waste per person." placeholder="1" />
                <NumberField label="Grid electricity consumption" unit={values.electricityPeriod === "monthly" ? "kWh / month" : "kWh / year"} value={values.electricity} onChange={(v) => update("electricity", v)} hint="Use your electricity bill. Monthly use is multiplied by 12." />
                <ChoiceField label="Electricity bill period" value={values.electricityPeriod} options={[{ label: "Monthly", value: "monthly" }, { label: "Annual", value: "annual" }]} onChange={(v) => update("electricityPeriod", v)} />
                <ChoiceField label="Main cooking fuel" value={values.cookingFuel} options={[{ label: "LPG", value: "lpg" }, { label: "PNG", value: "png" }, { label: "Electric", value: "electric" }, { label: "None", value: "none" }]} onChange={(v) => update("cookingFuel", v)} />
                {values.cookingFuel === "lpg" ? <NumberField label="LPG cylinders used" unit="14.2 kg cylinders / year" value={values.lpgCylinders} onChange={(v) => update("lpgCylinders", v)} hint="Count full domestic cylinders used by the household in one year." /> : null}
                {values.cookingFuel === "png" ? (
                  <>
                    <NumberField label="PNG consumption" unit={values.pngPeriod === "monthly" ? "Sm³ / month" : "Sm³ / year"} value={values.pngConsumption} onChange={(v) => update("pngConsumption", v)} />
                    <ChoiceField label="PNG bill period" value={values.pngPeriod} options={[{ label: "Monthly", value: "monthly" }, { label: "Annual", value: "annual" }]} onChange={(v) => update("pngPeriod", v)} />
                  </>
                ) : null}
                <Text style={styles.infoNote}>Electric cooking is already included in household electricity. It is not counted a second time.</Text>
              </>
            ) : null}

            {step === 1 ? (
              <>
                <ChoiceField label="Do you use a private vehicle?" value={values.privateVehicle} options={[{ label: "Yes", value: "yes" }, { label: "No", value: "no" }]} onChange={(v) => update("privateVehicle", v)} />
                {values.privateVehicle === "yes" ? (
                  <>
                    <ChoiceField label="Vehicle type" value={values.vehicleType} options={[
                      { label: "Petrol car", value: "petrol-car" }, { label: "Diesel car", value: "diesel-car" },
                      { label: "CNG car", value: "cng-car" }, { label: "Petrol 2-wheeler", value: "petrol-bike" },
                      { label: "Electric vehicle", value: "ev" }
                    ]} onChange={(v) => update("vehicleType", v)} />
                    <NumberField label="Vehicle distance" unit={values.vehicleDistancePeriod === "monthly" ? "km / month" : "km / year"} value={values.vehicleDistance} onChange={(v) => update("vehicleDistance", v)} hint="Total distance travelled by the vehicle, not just your share." />
                    <ChoiceField label="Distance period" value={values.vehicleDistancePeriod} options={[{ label: "Monthly", value: "monthly" }, { label: "Annual", value: "annual" }]} onChange={(v) => update("vehicleDistancePeriod", v)} />
                    <NumberField label="Real-world vehicle efficiency" unit={values.vehicleType === "ev" ? "km / kWh" : values.vehicleType === "cng-car" ? "km / kg" : "km / litre"} value={values.vehicleEfficiency} onChange={(v) => update("vehicleEfficiency", v)} hint="Use your normal real-world average, not the brochure figure." />
                    <NumberField label="Average occupants" unit="people including you" value={values.vehicleOccupancy} onChange={(v) => update("vehicleOccupancy", v)} placeholder="1" />
                  </>
                ) : null}
                <Text style={styles.groupLabel}>Public transport and flights</Text>
                <NumberField label="Indian Railways travel" unit="passenger-km / year" value={values.railDistance} onChange={(v) => update("railDistance", v)} hint="Indian Railways only; exclude metro/MRTS. The underlying factor uses 2014–15 data." />
                <NumberField label="Intracity bus" unit="passenger-km / year" value={values.busDistance} onChange={(v) => update("busDistance", v)} hint="City bus only; exclude BRTS and intercity buses. Factor is from a 2015 India study." />
                <NumberField label="Domestic flights" unit="passenger-km / year" value={values.domesticFlightDistance} onChange={(v) => update("domesticFlightDistance", v)} />
                <NumberField label="International flights" unit="passenger-km / year" value={values.internationalFlightDistance} onChange={(v) => update("internationalFlightDistance", v)} />
                <Text style={styles.infoNote}>For public transport and flights, enter your own passenger distance for the year.</Text>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <Text style={styles.infoNote}>Estimate the total kilograms of each food you consume in a typical year. These are per-person quantities. Leave items at zero or blank if you do not consume them.</Text>
                {foodFields.map((field) => (
                  <NumberField key={field.key} label={field.label} unit={field.unit} value={values[field.key]} onChange={(v) => update(field.key, v)} />
                ))}
                <Text style={styles.infoNote}>Food factors are global lifecycle averages, not India-specific measurements.</Text>
              </>
            ) : null}

            {step === 3 ? (
              <>
                <Text style={styles.infoNote}>Optional: enter approximate annual household waste to see a separate experimental estimate. It is divided by household size but excluded from the headline footprint because local disposal and methane-capture methods are not captured.</Text>
                <NumberField label="Food waste" unit="kg / household / year" value={values.foodWaste} onChange={(v) => update("foodWaste", v)} hint="Uneaten food and food scraps discarded." />
                <NumberField label="Mixed household waste" unit="kg / household / year" value={values.mixedWaste} onChange={(v) => update("mixedWaste", v)} hint="Other mixed household waste. Recyclable treatment is not separately modelled." />
                <Text style={styles.infoNote}>Waste factors are low-confidence proxies and vary substantially with local disposal and treatment methods.</Text>
              </>
            ) : null}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.navigation}>
            {step > 0 ? (
              <Pressable style={styles.backButton} onPress={() => setStep((current) => current - 1)}>
                <Text style={styles.backText}>Back</Text>
              </Pressable>
            ) : <View style={styles.backSpacer} />}
            <Pressable style={styles.primaryButton} onPress={() => {
              if (step < 3) setStep((current) => current + 1);
              else calculate();
            }}>
              <Text style={styles.primaryButtonText}>{step < 3 ? "Continue" : "Calculate footprint"}</Text>
              <Text style={styles.buttonArrow}>{step < 3 ? "›" : "✓"}</Text>
            </Pressable>
          </View>
          <Text style={styles.footerNote}>CarbonLens estimates are indicative, not a formal greenhouse-gas inventory.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.page },
  keyboard: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
  eyebrow: { color: C.purple, fontSize: 10, fontWeight: "800", letterSpacing: 1.4, marginBottom: 9 },
  title: { color: C.ink, fontSize: 29, lineHeight: 35, fontWeight: "800", letterSpacing: -0.9 },
  subtitle: { color: C.muted, fontSize: 13, lineHeight: 20, marginTop: 8, marginBottom: 22 },
  reuseCard: { backgroundColor: C.purpleSoft, borderRadius: 14, padding: 13, marginBottom: 17 },
  reuseCopy: { marginBottom: 10 },
  reuseTitle: { color: C.ink, fontSize: 12, fontWeight: "800", marginBottom: 4 },
  reuseText: { color: C.muted, fontSize: 10, lineHeight: 15 },
  reuseButton: { alignSelf: "flex-start", borderRadius: 9, backgroundColor: C.purple, paddingHorizontal: 12, paddingVertical: 9 },
  reuseButtonText: { color: C.white, fontSize: 10, fontWeight: "800" },
  progressMeta: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  progressLabel: { color: C.purple, fontSize: 9, fontWeight: "800", letterSpacing: 0.8 },
  progressTrack: { height: 6, borderRadius: 5, backgroundColor: "#E8E4EF", overflow: "hidden", marginBottom: 18 },
  progressFill: { height: 6, borderRadius: 5, backgroundColor: C.purple },
  stepCard: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 21, padding: 17 },
  stepHeader: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  stepMark: { width: 39, height: 39, borderRadius: 13, backgroundColor: C.purpleSoft, alignItems: "center", justifyContent: "center" },
  stepMarkText: { color: C.purple, fontSize: 12, fontWeight: "800" },
  stepHeading: { marginLeft: 11, flex: 1 },
  stepTitle: { color: C.ink, fontSize: 17, fontWeight: "800" },
  stepSubtitle: { color: C.muted, fontSize: 11, marginTop: 3 },
  field: { marginBottom: 17 },
  fieldHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 7 },
  fieldLabel: { color: C.ink, fontSize: 12, fontWeight: "700", flex: 1 },
  fieldUnit: { color: C.muted, fontSize: 9, textAlign: "right" },
  input: { height: 47, borderRadius: 12, borderWidth: 1, borderColor: C.border, backgroundColor: "#FCFBFD", paddingHorizontal: 13, color: C.ink, fontSize: 14 },
  hint: { color: C.muted, fontSize: 10, lineHeight: 15, marginTop: 5 },
  optionRow: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 8 },
  option: { borderRadius: 10, borderWidth: 1, borderColor: C.border, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: C.white },
  optionActive: { backgroundColor: C.purpleSoft, borderColor: C.purple },
  optionText: { color: C.muted, fontSize: 11, fontWeight: "600" },
  optionTextActive: { color: C.purple, fontWeight: "800" },
  infoNote: { color: C.muted, backgroundColor: "#F8F6FB", borderRadius: 11, padding: 11, fontSize: 10, lineHeight: 16, marginBottom: 15 },
  groupLabel: { color: C.purple, fontSize: 11, fontWeight: "800", marginTop: 4, marginBottom: 13, letterSpacing: 0.4 },
  navigation: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 15 },
  backSpacer: { width: 76 },
  backButton: { height: 50, minWidth: 76, borderRadius: 13, borderWidth: 1, borderColor: C.border, alignItems: "center", justifyContent: "center", backgroundColor: C.white, paddingHorizontal: 14 },
  backText: { color: C.ink, fontSize: 12, fontWeight: "700" },
  primaryButton: { flex: 1, height: 50, borderRadius: 13, backgroundColor: C.purple, alignItems: "center", justifyContent: "center", flexDirection: "row", paddingHorizontal: 15 },
  primaryButtonText: { color: C.white, fontSize: 12, fontWeight: "800" },
  buttonArrow: { color: C.white, fontSize: 19, marginLeft: 8, marginTop: -1 },
  error: { color: C.red, fontSize: 11, lineHeight: 16, marginTop: 12 },
  footerNote: { color: C.muted, fontSize: 10, lineHeight: 15, textAlign: "center", marginTop: 16 },
  resultTitle: { color: C.ink, fontSize: 26, lineHeight: 32, fontWeight: "800", marginBottom: 17 },
  resultCard: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 21, padding: 21, marginBottom: 24 },
  resultNumber: { color: C.ink, fontSize: 43, fontWeight: "800", letterSpacing: -1.5 },
  resultUnit: { color: C.purple, fontSize: 12, fontWeight: "800", marginTop: 3 },
  resultNote: { color: C.muted, fontSize: 11, lineHeight: 17, marginTop: 13 },
  saveNotice: { backgroundColor: C.mint, borderRadius: 13, padding: 13, marginBottom: 18 },
  saveNoticeText: { color: "#477B64", fontSize: 11, lineHeight: 17, fontWeight: "600" },
  saveRetry: { color: C.purple, fontSize: 11, fontWeight: "800", marginTop: 8 },
  sectionTitle: { color: C.ink, fontSize: 17, fontWeight: "800", marginBottom: 13 },
  resultRow: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 14, marginBottom: 9 },
  resultRowTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  resultLabel: { color: C.ink, fontSize: 12, fontWeight: "700" },
  resultValue: { color: C.muted, fontSize: 11, fontWeight: "700" },
  barTrack: { height: 7, borderRadius: 6, backgroundColor: "#EEEAF3", overflow: "hidden" },
  barFill: { height: 7, borderRadius: 6, backgroundColor: C.purple },
  methodNote: { color: C.muted, fontSize: 10, lineHeight: 16, marginTop: 13, marginBottom: 18 },
});
