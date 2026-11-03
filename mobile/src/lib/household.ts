import AsyncStorage from "@react-native-async-storage/async-storage";
import { calculationFactors } from "./calculator";

const STORAGE_KEY = "@carbonlens/household-checkins/v1";
const MAX_MONTHS = 24;

export type HouseholdCheckIn = {
  id: string;
  month: string;
  electricityKwh: number;
  lpgCylinders: number;
  householdSize: number;
  householdKgCo2e: number;
  perPersonKgCo2e: number;
  createdAt: string;
};

function isCheckIn(value: unknown): value is HouseholdCheckIn {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<HouseholdCheckIn>;
  return typeof item.id === "string" &&
    typeof item.month === "string" && /^\d{4}-\d{2}$/.test(item.month) &&
    ["electricityKwh", "lpgCylinders", "householdSize", "householdKgCo2e", "perPersonKgCo2e"].every((key) =>
      typeof item[key as keyof HouseholdCheckIn] === "number" &&
      Number.isFinite(item[key as keyof HouseholdCheckIn] as number) &&
      (item[key as keyof HouseholdCheckIn] as number) >= 0
    ) &&
    Number.isInteger(item.householdSize) && (item.householdSize ?? 0) >= 1 &&
    typeof item.createdAt === "string" && Number.isFinite(Date.parse(item.createdAt));
}

export function estimateHouseholdEmissions(
  electricityKwh: number,
  lpgCylinders: number,
  householdSize: number
): { householdKgCo2e: number; perPersonKgCo2e: number } {
  if (!Number.isFinite(electricityKwh) || electricityKwh < 0 ||
      !Number.isFinite(lpgCylinders) || lpgCylinders < 0 ||
      !Number.isInteger(householdSize) || householdSize < 1 || householdSize > 30) {
    throw new Error("Enter valid non-negative usage and a household size from 1 to 30.");
  }
  const householdKgCo2e =
    electricityKwh * calculationFactors.electricity +
    lpgCylinders * calculationFactors.lpg.cylinderMassKg * calculationFactors.lpg.factor;
  return { householdKgCo2e, perPersonKgCo2e: householdKgCo2e / householdSize };
}

export async function getHouseholdCheckIns(): Promise<HouseholdCheckIn[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Invalid household history.");
    return parsed.filter(isCheckIn).sort((a, b) => b.month.localeCompare(a.month)).slice(0, MAX_MONTHS);
  } catch {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export async function saveHouseholdCheckIn(
  month: string,
  electricityKwh: number,
  lpgCylinders: number,
  householdSize: number
): Promise<HouseholdCheckIn> {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error("Choose a valid month.");
  const estimate = estimateHouseholdEmissions(electricityKwh, lpgCylinders, householdSize);
  const current = await getHouseholdCheckIns();
  const record: HouseholdCheckIn = {
    id: `${month}-${Date.now()}`,
    month,
    electricityKwh,
    lpgCylinders,
    householdSize,
    ...estimate,
    createdAt: new Date().toISOString()
  };
  const next = [record, ...current.filter((item) => item.month !== month)]
    .sort((a, b) => b.month.localeCompare(a.month))
    .slice(0, MAX_MONTHS);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return record;
}
