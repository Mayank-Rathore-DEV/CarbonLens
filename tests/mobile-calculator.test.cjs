const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const calculatorModule = import("../mobile/src/lib/calculator.ts");

const baseValues = {
  householdSize: "3",
  electricity: "200",
  electricityPeriod: "monthly",
  cookingFuel: "lpg",
  lpgCylinders: "6",
  pngConsumption: "",
  pngPeriod: "monthly",
  privateVehicle: "yes",
  vehicleType: "petrol-car",
  vehicleDistance: "600",
  vehicleDistancePeriod: "monthly",
  vehicleEfficiency: "15",
  vehicleOccupancy: "2",
  railDistance: "1200",
  busDistance: "600",
  domesticFlightDistance: "1500",
  internationalFlightDistance: "0",
  beef: "0",
  lamb: "0",
  pork: "0",
  poultry: "15",
  cheese: "2",
  milk: "60",
  eggs: "5",
  rice: "50",
  tofu: "0",
  peas: "3",
  beans: "15",
  potatoes: "20",
  rootVegetables: "15",
  bananas: "12",
  apples: "8",
  tomatoes: "15",
  foodWaste: "52",
  mixedWaste: "260"
};

test("mobile factors stay in sync with the authoritative web factor register", async () => {
  const { calculationFactors, foodFactors } = await calculatorModule;
  const context = { Number, Object, Array, console };
  vm.createContext(context);
  const factorSource = fs.readFileSync(
    path.join(__dirname, "..", "js", "emissionFactors.js"),
    "utf8"
  );
  vm.runInContext(factorSource, context, { filename: "emissionFactors.js" });
  const web = vm.runInContext("EMISSION_FACTORS", context);

  assert.equal(calculationFactors.electricity, web.energy.electricity.factor);
  assert.equal(calculationFactors.lpg.factor, web.energy.lpg.factor);
  assert.equal(calculationFactors.lpg.cylinderMassKg, web.energy.lpg.cylinderMassKg);
  assert.equal(calculationFactors.png, web.energy.png.factor);
  assert.equal(calculationFactors.vehicles["petrol-car"], web.transportation["petrol-car"].factor);
  assert.equal(calculationFactors.vehicles["diesel-car"], web.transportation["diesel-car"].factor);
  assert.equal(calculationFactors.vehicles["cng-car"], web.transportation["cng-car"].factor);
  assert.equal(calculationFactors.vehicles["petrol-bike"], web.transportation["petrol-bike"].factor);
  assert.equal(calculationFactors.vehicles.ev, web.transportation.ev.factor);
  assert.equal(calculationFactors.publicTransport.rail, web.publicTransport.rail.factor);
  assert.equal(calculationFactors.publicTransport.bus, web.publicTransport.bus.factor);
  assert.equal(calculationFactors.flights.domestic, web.flights.domestic.factor);
  assert.equal(calculationFactors.flights.international, web.flights.international.factor);
  assert.equal(calculationFactors.waste.food, web.waste.food.factor);
  assert.equal(calculationFactors.waste.mixed, web.waste.mixed.factor);

  for (const [key, factor] of Object.entries(foodFactors)) {
    assert.equal(factor, web.food[key].factor, "food factor mismatch: " + key);
  }
});

test("mobile engine reproduces the independently calculated reference case", async () => {
  const { calculateFootprint } = await calculatorModule;
  const result = calculateFootprint({ ...baseValues });

  assert.ok(Math.abs(result.categories.energy - 625.28) < 1e-9);
  assert.ok(Math.abs(result.categories.transport - 760.92) < 1e-9);
  assert.ok(Math.abs(result.categories.food - 714.91) < 1e-9);
  assert.ok(Math.abs(result.categories.waste - 36.2232) < 1e-9);
  assert.ok(Math.abs(result.total - 2101.11) < 1e-9);
  assert.ok(Math.abs(result.categories.waste - 36.2232) < 1e-9);
});

test("experimental waste is calculated separately and excluded from the mobile headline total", async () => {
  const { calculateFootprint } = await calculatorModule;
  const result = calculateFootprint({ ...baseValues });
  assert.ok(Math.abs(result.total - (result.categories.energy + result.categories.transport + result.categories.food)) < 1e-9);
  assert.ok(result.categories.waste > 0);
});

test("monthly electricity is annualised and uses billed grid imports directly", async () => {
  const { calculateFootprint } = await calculatorModule;
  const result = calculateFootprint({
    householdSize: "1",
    electricity: "100",
    electricityPeriod: "monthly",
    cookingFuel: "none",
    privateVehicle: "no"
  });

  assert.ok(Math.abs(result.categories.energy - 810.12) < 1e-9);
  assert.equal(result.total, result.categories.energy);
});

test("private vehicle emissions are divided by the stated whole-vehicle occupancy", async () => {
  const { calculateFootprint } = await calculatorModule;
  const result = calculateFootprint({
    householdSize: "1",
    electricity: "0",
    electricityPeriod: "annual",
    cookingFuel: "none",
    privateVehicle: "yes",
    vehicleType: "petrol-car",
    vehicleDistance: "12000",
    vehicleDistancePeriod: "annual",
    vehicleEfficiency: "15",
    vehicleOccupancy: "2"
  });

  assert.equal(result.categories.transport, 924);
});

test("negative and non-numeric activity inputs are rejected instead of silently treated as zero", async () => {
  const { calculateFootprint, CalculationInputError } = await calculatorModule;

  assert.throws(
    () => calculateFootprint({ ...baseValues, electricity: "-10" }),
    (error) => error instanceof CalculationInputError && error.step === 0
  );
  assert.throws(
    () => calculateFootprint({ ...baseValues, rice: "not-a-number" }),
    (error) => error instanceof CalculationInputError && error.step === 2
  );
});

test("household size and vehicle occupancy must be whole people", async () => {
  const { calculateFootprint, CalculationInputError } = await calculatorModule;

  assert.throws(
    () => calculateFootprint({ ...baseValues, householdSize: "2.5" }),
    (error) => error instanceof CalculationInputError && error.step === 0
  );
  assert.throws(
    () => calculateFootprint({ ...baseValues, vehicleOccupancy: "1.5" }),
    (error) => error instanceof CalculationInputError && error.step === 1
  );
});

test("household size and vehicle occupancy enforce the UI limits", async () => {
  const { calculateFootprint, CalculationInputError } = await calculatorModule;

  assert.throws(
    () => calculateFootprint({ ...baseValues, householdSize: "31" }),
    (error) => error instanceof CalculationInputError && error.step === 0
  );
  assert.throws(
    () => calculateFootprint({ ...baseValues, vehicleOccupancy: "21" }),
    (error) => error instanceof CalculationInputError && error.step === 1
  );
});

test("selected cooking fuel requires a positive annual quantity", async () => {
  const { calculateFootprint, CalculationInputError } = await calculatorModule;

  assert.throws(
    () => calculateFootprint({ ...baseValues, lpgCylinders: "" }),
    (error) => error instanceof CalculationInputError && error.step === 0
  );
});

test("zero activity produces zero emissions without division errors", async () => {
  const { calculateFootprint } = await calculatorModule;
  const result = calculateFootprint({
    householdSize: "1",
    electricity: "0",
    electricityPeriod: "annual",
    cookingFuel: "none",
    privateVehicle: "no"
  });

  assert.equal(result.total, 0);
  assert.deepEqual(result.categories, {
    energy: 0,
    transport: 0,
    food: 0,
    waste: 0
  });
});
