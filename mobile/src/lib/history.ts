import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CalculationResult, CalculatorValues } from "./calculator";

const STORAGE_KEY = "@carbonlens/footprint-history/v1";
const MAX_RECORDS = 100;

export type FootprintRecord = {
  id: string;
  createdAt: string;
  total: number;
  categories: {
    energy: number;
    transport: number;
    food: number;
    waste: number;
  };
  inputs?: CalculatorValues;
};

function isRecord(value: unknown): value is FootprintRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<FootprintRecord>;
  const categories = record.categories;
  return (
    typeof record.id === "string" &&
    typeof record.createdAt === "string" &&
    Number.isFinite(Date.parse(record.createdAt)) &&
    typeof record.total === "number" &&
    Number.isFinite(record.total) &&
    record.total >= 0 &&
    !!categories &&
    (record.inputs === undefined || (!!record.inputs && typeof record.inputs === "object" && Object.values(record.inputs).every((entry) => typeof entry === "string"))) &&
    ["energy", "transport", "food", "waste"].every((key) => {
      const amount = categories[key as keyof typeof categories];
      return typeof amount === "number" && Number.isFinite(amount) && amount >= 0;
    })
  );
}

export async function getFootprintHistory(): Promise<FootprintRecord[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return [];
  }

  if (!Array.isArray(parsed)) {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return [];
  }

  return parsed
    .filter(isRecord)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, MAX_RECORDS);
}

export async function saveFootprintRecord(
  result: CalculationResult,
  inputs: CalculatorValues
): Promise<FootprintRecord> {
  const current = await getFootprintHistory();
  const createdAt = new Date().toISOString();
  const record: FootprintRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt,
    total: result.total,
    categories: { ...result.categories },
    inputs: { ...inputs }
  };

  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([record, ...current].slice(0, MAX_RECORDS))
  );
  return record;
}

export async function getLatestCalculatorValues(): Promise<CalculatorValues | null> {
  const history = await getFootprintHistory();
  const latestWithInputs = history.find((record) => record.inputs);
  return latestWithInputs?.inputs ? { ...latestWithInputs.inputs } : null;
}

export async function clearFootprintHistory(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
