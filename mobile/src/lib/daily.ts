import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@carbonlens/daily-engagement/v1";
const MAX_COMPLETIONS = 365;

export type DailyChallenge = {
  id: string;
  title: string;
  description: string;
  action: string;
};

export type EcoFact = {
  title: string;
  body: string;
  category: string;
};

export type DailyEngagement = {
  completedDays: string[];
  points: number;
  currentStreak: number;
  completedToday: boolean;
};

const CHALLENGES: DailyChallenge[] = [
  { id: "bottle", title: "Carry a reusable bottle", description: "Take a refillable bottle with you instead of buying a single-use plastic bottle.", action: "Use a reusable bottle today" },
  { id: "lights", title: "Switch off unused lights", description: "Check rooms before leaving and switch off lights that nobody needs.", action: "Do a quick lights check" },
  { id: "food-plan", title: "Plan one meal before shopping", description: "Check what is already in your kitchen and plan a meal around it.", action: "Plan a meal using what you have" },
  { id: "short-trip", title: "Rethink one short journey", description: "For a suitable short trip, consider walking, cycling or public transport.", action: "Choose a lower-impact option if practical" },
  { id: "leftovers", title: "Use your leftovers", description: "Turn safely stored leftovers into a meal instead of letting food go to waste.", action: "Use one leftover ingredient" },
  { id: "tap", title: "Avoid unnecessary running water", description: "Turn off the tap while brushing or doing tasks that do not need running water.", action: "Check your water habits" },
  { id: "laundry", title: "Run a fuller laundry load", description: "If laundry can wait, combine items into an appropriately full load.", action: "Avoid an unnecessary small wash" },
  { id: "repair", title: "Repair before replacing", description: "Identify one item that could be cleaned, maintained or repaired instead of replaced.", action: "Give one item a second life" },
  { id: "waste-sort", title: "Separate wet and dry waste", description: "Keep kitchen or wet waste separate from dry recyclable waste where local collection supports it.", action: "Sort today's household waste" },
  { id: "fan", title: "Use a fan when comfortable", description: "When conditions allow, use a fan or natural ventilation instead of automatically switching on cooling.", action: "Choose a comfortable lower-energy option" },
  { id: "shopping", title: "Pause before a purchase", description: "Before buying something new, ask whether you can borrow, repair or reuse an item you already have.", action: "Make one considered purchase decision" },
  { id: "container", title: "Carry a reusable shopping bag", description: "Keep a reusable bag ready for your next grocery or convenience-store trip.", action: "Pack a reusable bag" },
  { id: "meal", title: "Try a plant-forward meal", description: "Make one meal around familiar pulses, vegetables or grains if it suits your diet.", action: "Choose a plant-forward meal" },
  { id: "unplug", title: "Check standby devices", description: "Switch off devices at the plug when safe and practical, rather than leaving them on unnecessarily.", action: "Check one standby device" }
];

const FACTS: EcoFact[] = [
  { title: "Food waste is a resource issue", body: "Wasted food also means wasted land, water, energy, transport and work used to produce it. Planning portions and storing food well can help prevent avoidable waste.", category: "FOOD" },
  { title: "Recycling works best when sorted", body: "Clean, dry recyclable material is easier to recover. Follow your local collection rules because accepted materials and systems differ by city.", category: "WASTE" },
  { title: "Travel choices depend on the trip", body: "Walking, cycling and shared or public transport can reduce per-person travel emissions on many journeys. Distance, vehicle type and occupancy all matter.", category: "MOBILITY" },
  { title: "Electricity use changes with appliances", body: "An appliance's energy use depends on its power rating and how long it runs. Switching off unnecessary use and choosing efficient equipment both matter.", category: "ENERGY" },
  { title: "Repair can avoid new production", body: "Keeping products useful for longer can reduce demand for replacement goods and the materials and energy needed to make them.", category: "CONSUMPTION" },
  { title: "Household habits add up", body: "Small actions are most useful when they become practical routines. Focus on changes that fit your household rather than chasing perfect behaviour.", category: "HABITS" },
  { title: "Local waste rules matter", body: "Waste collection and recycling facilities vary across municipalities. Check your local body's guidance before putting an item in a recycling stream.", category: "WASTE" }
];

function localDayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dayNumber(date = new Date()): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
}

function getCurrentStreak(completedDays: string[], today: string): number {
  const completed = new Set(completedDays);
  let cursor = new Date(`${today}T12:00:00`);
  if (!completed.has(today)) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (completed.has(localDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function parseCompletedDays(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string =>
    typeof item === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item)
  ))].sort().slice(-MAX_COMPLETIONS);
}

export function getTodayChallenge(date = new Date()): DailyChallenge {
  return CHALLENGES[dayNumber(date) % CHALLENGES.length];
}

export function getTodayEcoFact(date = new Date()): EcoFact {
  return FACTS[dayNumber(date) % FACTS.length];
}

export async function getDailyEngagement(date = new Date()): Promise<DailyEngagement> {
  const today = localDayKey(date);
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  let completedDays: string[] = [];
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        completedDays = parseCompletedDays((parsed as { completedDays?: unknown }).completedDays);
      }
    } catch {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  }
  return {
    completedDays,
    points: completedDays.length * 10,
    currentStreak: getCurrentStreak(completedDays, today),
    completedToday: completedDays.includes(today)
  };
}

export async function completeTodayChallenge(date = new Date()): Promise<DailyEngagement> {
  const current = await getDailyEngagement(date);
  if (!current.completedToday) {
    const completedDays = [...current.completedDays, localDayKey(date)].slice(-MAX_COMPLETIONS);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ completedDays }));
  }
  return getDailyEngagement(date);
}
