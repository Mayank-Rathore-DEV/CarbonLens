import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ActivityScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>ACTIVITY</Text>
        <Text style={styles.title}>Your footprint history.</Text>
        <Text style={styles.body}>Daily activity logging and monthly history are planned for the next phase. Nothing is being fabricated or stored yet.</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>No activity recorded</Text>
          <Text style={styles.cardBody}>Once activity tracking is implemented, your entries and monthly totals will appear here.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7F6FA" },
  content: { flex: 1, padding: 24, paddingTop: 42 },
  eyebrow: { color: "#5B45A0", fontSize: 10, fontWeight: "800", letterSpacing: 1.5, marginBottom: 12 },
  title: { color: "#211D2B", fontSize: 30, lineHeight: 36, fontWeight: "800", letterSpacing: -1, marginBottom: 10 },
  body: { color: "#777183", fontSize: 14, lineHeight: 22, marginBottom: 22 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EAE7F0", padding: 18 },
  cardTitle: { color: "#211D2B", fontSize: 15, fontWeight: "800", marginBottom: 6 },
  cardBody: { color: "#777183", fontSize: 12, lineHeight: 18 }
});