import { Tabs } from "expo-router";

const MUTED = "#8A8495";
const PURPLE = "#5B45A0";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PURPLE,
        tabBarInactiveTintColor: MUTED,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600", marginBottom: 5 },
        tabBarStyle: {
          height: 66,
          paddingTop: 8,
          paddingBottom: 7,
          borderTopColor: "#ECE9F1",
          backgroundColor: "#FFFFFF",
          elevation: 0
        }
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarLabel: "Home" }} />
      <Tabs.Screen name="calculator" options={{ title: "Calculator", tabBarLabel: "Calculator" }} />
      <Tabs.Screen name="tools" options={{ title: "Tools", tabBarLabel: "Tools" }} />
      <Tabs.Screen name="activity" options={{ title: "History", tabBarLabel: "History" }} />
      <Tabs.Screen name="plan" options={{ title: "Plan", tabBarLabel: "Plan" }} />
    </Tabs>
  );
}
