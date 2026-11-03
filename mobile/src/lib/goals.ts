import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@carbonlens/reduction-goal/v1";

export type ReductionGoal = {
  id: string;
  baselineRecordId: string;
  baselineTotal: number;
  reductionPercent: number;
  months: number;
  createdAt: string;
  targetDate: string;
};

function isGoal(value: unknown): value is ReductionGoal {
  if (!value || typeof value !== "object") return false;
  const goal = value as Partial<ReductionGoal>;
  return (
    typeof goal.id === "string" &&
    typeof goal.baselineRecordId === "string" &&
    typeof goal.baselineTotal === "number" &&
    Number.isFinite(goal.baselineTotal) &&
    goal.baselineTotal > 0 &&
    typeof goal.reductionPercent === "number" &&
    [5, 10, 15, 20].includes(goal.reductionPercent) &&
    typeof goal.months === "number" &&
    [3, 6, 12].includes(goal.months) &&
    typeof goal.createdAt === "string" &&
    Number.isFinite(Date.parse(goal.createdAt)) &&
    typeof goal.targetDate === "string" &&
    Number.isFinite(Date.parse(goal.targetDate))
  );
}

export async function getReductionGoal(): Promise<ReductionGoal | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (isGoal(parsed)) return parsed;
  } catch {
    // Remove malformed local data below.
  }

  await AsyncStorage.removeItem(STORAGE_KEY);
  return null;
}

export async function saveReductionGoal(
  baselineRecordId: string,
  baselineTotal: number,
  reductionPercent: number,
  months: number
): Promise<ReductionGoal> {
  if (!baselineRecordId || !Number.isFinite(baselineTotal) || baselineTotal <= 0) {
    throw new Error("A valid saved baseline is required to create a reduction goal.");
  }
  if (![5, 10, 15, 20].includes(reductionPercent) || ![3, 6, 12].includes(months)) {
    throw new Error("Select a supported reduction target and time period.");
  }

  const now = new Date();
  const target = new Date(now);
  target.setMonth(target.getMonth() + months);
  const goal: ReductionGoal = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    baselineRecordId,
    baselineTotal,
    reductionPercent,
    months,
    createdAt: now.toISOString(),
    targetDate: target.toISOString()
  };

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(goal));
  return goal;
}

export async function clearReductionGoal(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
