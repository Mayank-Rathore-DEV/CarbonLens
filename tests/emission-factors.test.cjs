/*
 * CarbonLens — emission factor tests
 *
 * Run from the project root:
 *   node --test tests/emission-factors.test.cjs
 *
 * Uses Node's built-in test runner. No packages to install.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const factorsPath = path.join(__dirname, "..", "js", "emissionFactors.js");
const source = fs.readFileSync(factorsPath, "utf8");

const context = {
  console,
  Number,
  Object,
  Array
};

vm.createContext(context);
vm.runInContext(
  source + "\n;globalThis.__carbonLensTest = { EMISSION_FACTORS, getEmissionFactor, validateEmissionFactors };",
  context,
  { filename: "emissionFactors.js" }
);

const { EMISSION_FACTORS, getEmissionFactor, validateEmissionFactors } =
  context.__carbonLensTest;

test("all configured emission factors pass validation", () => {
  assert.equal(validateEmissionFactors(), true);
});

test("every configured factor is a finite, non-negative number", () => {
  function inspect(value, location = "EMISSION_FACTORS") {
    if (!value || typeof value !== "object") return;

    if (Object.prototype.hasOwnProperty.call(value, "factor")) {
      assert.equal(
        typeof value.factor,
        "number",
        location + ".factor must be a number"
      );
      assert.ok(
        Number.isFinite(value.factor) && value.factor >= 0,
        location + ".factor must be finite and non-negative"
      );
    }

    for (const [key, child] of Object.entries(value)) {
      if (child && typeof child === "object") {
        inspect(child, location + "." + key);
      }
    }
  }

  inspect(EMISSION_FACTORS);
});

test("India electricity factor is configured for FY 2025-26", () => {
  assert.equal(EMISSION_FACTORS.energy.electricity.factor, 0.6751);
  assert.equal(EMISSION_FACTORS.energy.electricity.referenceYear, "FY 2025-26");
});

test("LPG cylinder mass is configured as 14.2 kg", () => {
  assert.equal(EMISSION_FACTORS.energy.lpg.cylinderMassKg, 14.2);
});

test("food factors match the selected OWID 2010 global dataset mappings", () => {
  assert.equal(EMISSION_FACTORS.food.beef.factor, 99.48);
  assert.equal(EMISSION_FACTORS.food.lamb.factor, 39.72);
  assert.equal(EMISSION_FACTORS.food.rice.factor, 4.45);
  assert.equal(EMISSION_FACTORS.food.beans.factor, 1.79);
  assert.match(EMISSION_FACTORS.food.beans.source, /Other Pulses/);
  assert.equal(EMISSION_FACTORS.food.beef.geographicScope, "Global lifecycle dataset; not India-specific");
});

test("factor metadata distinguishes geographic scope and confidence", () => {
  assert.equal(EMISSION_FACTORS.energy.electricity.confidence, "high");
  assert.match(EMISSION_FACTORS.food.rice.geographicScope, /Global/);
  assert.match(EMISSION_FACTORS.flights.domestic.geographicScope, /not India-specific/);
  assert.equal(EMISSION_FACTORS.waste.food.confidence, "low");
  assert.equal(EMISSION_FACTORS.waste.mixed.confidence, "low");
});

test("combustion fuel factors are labelled as CO2 rather than CO2e", () => {
  assert.equal(EMISSION_FACTORS.energy.lpg.unit, "kgCO2/kg LPG");
  assert.equal(EMISSION_FACTORS.transportation["petrol-car"].unit, "kgCO2/litre");
  assert.equal(EMISSION_FACTORS.transportation["diesel-car"].unit, "kgCO2/litre");
  assert.equal(EMISSION_FACTORS.transportation.ev.unit, "kgCO2/kWh");
});

test("every positive emission factor has traceable provenance metadata", () => {
  const missing = [];

  function inspect(value, location = "EMISSION_FACTORS") {
    if (!value || typeof value !== "object") return;

    if (Object.prototype.hasOwnProperty.call(value, "factor") &&
        Number.isFinite(value.factor) && value.factor > 0) {
      for (const field of ["unit", "confidence", "geographicScope", "referenceYear", "source", "sourceUrl"]) {
        if (typeof value[field] !== "string" && typeof value[field] !== "number") {
          missing.push(location + "." + field);
        } else if (typeof value[field] === "string" && !value[field].trim()) {
          missing.push(location + "." + field);
        }
      }
      if (typeof value.sourceUrl === "string" && !/^https:\/\//.test(value.sourceUrl)) {
        missing.push(location + ".sourceUrl must use HTTPS");
      }
      if (!["high", "medium", "low"].includes(value.confidence)) {
        missing.push(location + ".confidence must be high, medium or low");
      }
    }

    for (const [key, child] of Object.entries(value)) {
      if (child && typeof child === "object") inspect(child, location + "." + key);
    }
  }

  inspect(EMISSION_FACTORS);
  assert.deepEqual(missing, []);
});

test("getEmissionFactor returns a configured factor", () => {
  assert.equal(getEmissionFactor(EMISSION_FACTORS.energy, "lpg"), 3.00);
});

test("getEmissionFactor safely handles unknown categories and keys", () => {
  assert.equal(getEmissionFactor(null, "lpg"), null);
  assert.equal(getEmissionFactor(EMISSION_FACTORS.energy, "unknown-fuel"), null);
});
