import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const WEB_CALCULATOR = "https://mayank-rathore-dev.github.io/CarbonLens/#calculator";

export default function CalculatorScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>CARBON CALCULATOR</Text>
        <Text style={styles.title}>Measure your footprint.</Text>
        <Text style={styles.body}>The existing CarbonLens calculator is still live and fully available. We are moving its calculation flow into this Android app in the next development step.</Text>
        <Pressable onPress={() => Linking.openURL(WEB_CALCULATOR)} style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]} accessibilityRole="button">
          <Text style={styles.buttonText}>Open current calculator</Text>
          <Text style={styles.arrow}>↗</Text>
        </Pressable>
        <Text style={styles.note}>This opens the existing web calculator. Your current website and its calculation logic have not been changed.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7F6FA" },
  content: { flex: 1, justifyContent: "center", padding: 24 },
  eyebrow: { color: "#5B45A0", fontSize: 10, fontWeight: "800", letterSpacing: 1.5, marginBottom: 12 },
  title: { color: "#211D2B", fontSize: 31, lineHeight: 37, fontWeight: "800", letterSpacing: -1, marginBottom: 12 },
  body: { color: "#777183", fontSize: 14, lineHeight: 22, marginBottom: 22 },
  button: { minHeight: 52, borderRadius: 14, backgroundColor: "#5B45A0", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, paddingHorizontal: 16 },
  buttonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  arrow: { color: "#FFFFFF", fontSize: 17 },
  note: { color: "#777183", fontSize: 11, lineHeight: 17, marginTop: 15 }
});