export type CalculatorValues = Record<string, string>;

export type CalculationResult = {
  total: number;
  householdTotal: number;
  categories: {
    energy: number;
    transport: number;
    food: number;
    waste: number;
  };
};

export class CalculationInputError extends Error {
  step: number;

  constructor(message: string, step: number) {
    super(message);
    this.name = "CalculationInputError";
    this.step = step;
  }
}

export const foodFactors: Record<string, number> = {
  beef: 99.48,
  lamb: 39.72,
  pork: 12.31,
  poultry: 9.87,
  cheese: 23.88,
  milk: 3.15,
  eggs: 4.67,
  rice: 4.45,
  tofu: 3.16,
  peas: 0.98,
  beans: 1.37,
  potatoes: 0.46,
  rootVegetables: 0.43,
  bananas: 0.86,
  apples: 0.43,
  tomatoes: 2.09
};

export const calculationFactors = {
  electricity: 0.6751,
  lpg: { factor: 3.0, cylinderMassKg: 14.2 },
  png: 2.0,
  vehicles: {
    "petrol-car": 2.31,
    "diesel-car": 2.68,
    "cng-car": 2.75,
    "petrol-bike": 2.31,
    ev: 0.6751
  } as Record<string, number>,
  publicTransport: { rail: 0.008, bus: 0.0152 },
  flights: { domestic: 0.1252, international: 0.0778 },
  waste: { food: 0.4208, mixed: 0.3338 }
};

const numericFieldSteps: Record<string, number> = {
  householdSize: 0,
  electricity: 0,
  lpgCylinders: 0,
  pngConsumption: 0,
  vehicleDistance: 1,
  vehicleEfficiency: 1,
  vehicleOccupancy: 1,
  railDistance: 1,
  busDistance: 1,
  domesticFlightDistance: 1,
  internationalFlightDistance: 1,
  ...Object.fromEntries(Object.keys(foodFactors).map((key) => [key, 2])),
  foodWaste: 3,
  mixedWaste: 3
};

function readNumber(values: CalculatorValues, key: string): number {
  const raw = values[key]?.trim() ?? "";
  if (!raw) return 0;

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new CalculationInputError(
      "Enter a valid non-negative number for " + key + ".",
      numericFieldSteps[key] ?? 0
    );
  }

  return parsed;
}

function annual(
  values: CalculatorValues,
  key: string,
  periodKey: string
): number {
  const value = readNumber(values, key);
  const period = values[periodKey];

  if (period === "monthly") return value * 12;
  if (period === "annual") return value;

  throw new CalculationInputError("Select a valid period for " + key + ".", 0);
}

export function calculateFootprint(values: CalculatorValues): CalculationResult {
  // Validate every numeric field instead of silently converting invalid input to zero.
  for (const key of Object.keys(numericFieldSteps)) {
    readNumber(values, key);
  }

  const householdSize = readNumber(values, "householdSize");
  if (!Number.isInteger(householdSize) || householdSize < 1) {
    throw new CalculationInputError("Enter a whole household size of at least 1.", 0);
  }

  const electricity = annual(values, "electricity", "electricityPeriod");
  let householdEnergy = electricity * calculationFactors.electricity;

  if (values.cookingFuel === "lpg") {
    householdEnergy += readNumber(values, "lpgCylinders") * calculationFactors.lpg.cylinderMassKg * calculationFactors.lpg.factor;
  } else if (values.cookingFuel === "png") {
    householdEnergy += annual(values, "pngConsumption", "pngPeriod") * calculationFactors.png;
  } else if (!["electric", "none"].includes(values.cookingFuel)) {
    throw new CalculationInputError("Select a valid cooking fuel.", 0);
  }

  let transport = 0;
  if (values.privateVehicle === "yes") {
    const distance = annual(values, "vehicleDistance", "vehicleDistancePeriod");
    const efficiency = readNumber(values, "vehicleEfficiency");
    const occupancy = readNumber(values, "vehicleOccupancy");

    if (distance > 0) {
      if (efficiency <= 0) {
        throw new CalculationInputError("Enter a vehicle efficiency greater than zero.", 1);
      }
      if (!Number.isInteger(occupancy) || occupancy < 1) {
        throw new CalculationInputError("Enter a whole number of occupants, at least 1.", 1);
      }

      const factor = calculationFactors.vehicles[values.vehicleType];
      if (factor === undefined) {
        throw new CalculationInputError("Select a valid private vehicle type.", 1);
      }

      transport += (distance / efficiency) * factor / occupancy;
    }
  } else if (values.privateVehicle !== "no") {
    throw new CalculationInputError("Select Yes or No for private vehicle use.", 1);
  }

  transport += readNumber(values, "railDistance") * calculationFactors.publicTransport.rail;
  transport += readNumber(values, "busDistance") * calculationFactors.publicTransport.bus;
  transport += readNumber(values, "domesticFlightDistance") * calculationFactors.flights.domestic;
  transport += readNumber(values, "internationalFlightDistance") * calculationFactors.flights.international;

  let food = 0;
  for (const [key, factor] of Object.entries(foodFactors)) {
    food += readNumber(values, key) * factor;
  }

  const householdWaste =
    readNumber(values, "foodWaste") * calculationFactors.waste.food +
    readNumber(values, "mixedWaste") * calculationFactors.waste.mixed;

  const energyPerPerson = householdEnergy / householdSize;
  const wastePerPerson = householdWaste / householdSize;
  const total = energyPerPerson + transport + food + wastePerPerson;

  if (!Number.isFinite(total) || total < 0) {
    throw new CalculationInputError("The entered values produced an invalid result.", 3);
  }

  return {
    total,
    householdTotal: householdEnergy + householdWaste + (transport + food) * householdSize,
    categories: {
      energy: energyPerPerson,
      transport,
      food,
      waste: wastePerPerson
    }
  };
}
