/*
 * CarbonLens — calculation engine tests
 *
 * Run from the project root:
 *   node --test tests/calculations.test.cjs
 *
 * Uses Node's built-in test runner and a lightweight DOM mock.
 * No browser or third-party packages are required.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const read = (file) =>
  fs.readFileSync(path.join(__dirname, "..", file), "utf8");

function createCalculator(initialValues = {}, privateVehicle = "no") {
  const values = { ...initialValues };
  const elements = new Map();

  function element(id) {
    if (!elements.has(id)) {
      elements.set(id, {
        value: values[id] === undefined ? "" : String(values[id]),
        hidden: false,
        disabled: false,
        textContent: "",
        classList: { add() {}, remove() {}, toggle() {} },
        setAttribute() {},
        removeAttribute() {},
        setCustomValidity() {},
        querySelectorAll() { return []; }
      });
    }
    return elements.get(id);
  }

  const document = {
    readyState: "loading",
    addEventListener() {},
    getElementById(id) {
      if (Object.prototype.hasOwnProperty.call(values, id) ||
          ["cooking-fuel", "vehicle-type"].includes(id)) {
        return element(id);
      }
      return null;
    },
    querySelectorAll() { return []; },
    querySelector(selector) {
      if (selector === 'input[name="privateVehicle"]:checked') {
        return { value: privateVehicle };
      }
      return null;
    }
  };

  const window = {};
  const context = {
    document,
    window,
    console,
    Number,
    Object,
    Array,
    Math,
    Intl,
    setTimeout,
    clearTimeout
  };

  vm.createContext(context);
  vm.runInContext(read("js/emissionFactors.js"), context, {
    filename: "emissionFactors.js"
  });
  vm.runInContext(read("js/app.js"), context, {
    filename: "app.js"
  });

  return {
    api: window.CarbonLens,
    set(id, value) { element(id).value = String(value); },
    get(id) { return element(id).value; }
  };
}

test("numeric input validation enforces required, minimum, maximum and step", () => {
  const calc = createCalculator();
  const validate = calc.api.validateNumericInputValue;

  assert.equal(validate("", { required: true }), "This field is required.");
  assert.equal(validate("", { required: false }), "");
  assert.equal(validate("-1", { min: "0" }), "Value must be at least 0.");
  assert.equal(validate("31", { max: "30" }), "Value must be no more than 30.");
  assert.equal(validate("2.5", { min: "0", step: "1" }), "Use increments of 1.");
  assert.equal(validate("2.5", { min: "0", step: "0.1" }), "");
  assert.equal(validate("1.5", { min: "0" }), "Use increments of 1.");
  assert.equal(validate("not-a-number", {}), "Enter a valid number.");
});

test("energy calculation handles grid electricity and LPG", () => {
  const calc = createCalculator({
    "cooking-fuel": "lpg",
    "lpg-cylinders": 2
  });
  assert.equal(calc.api.calculateEnergyEmissions(100, 20), 139.208);
});

test("food calculation combines different food categories", () => {
  const calc = createCalculator({
    "beef-kg": 1,
    "rice-kg": 10,
    "milk-kg": 20,
    "potatoes-kg": 5
  });
  assert.ok(Math.abs(calc.api.calculateFoodEmissions() - 209.28) < 1e-9);
});

test("waste calculation combines food and mixed waste", () => {
  const calc = createCalculator({
    "food-waste-kg": 10,
    "mixed-waste-kg": 20
  });
  assert.ok(Math.abs(calc.api.calculateWasteEmissions() - 10.884) < 1e-9);
});

test("transport calculation includes car, rail, bus and flights", () => {
  const calc = createCalculator({
    "vehicle-type": "petrol-car",
    "vehicle-distance": 12000,
    "vehicle-efficiency": 15,
    "vehicle-occupancy": 2,
    "rail-distance": 3000,
    "bus-distance": 2000,
    "domestic-flight-distance": 4000,
    "international-flight-distance": 10000
  }, "yes");
  assert.ok(Math.abs(calc.api.calculateTransportationEmissions() - 2257.2) < 1e-9);
});

test("EV emissions use the configured Indian grid factor", () => {
  const calc = createCalculator({
    "vehicle-type": "ev",
    "vehicle-distance": 6000,
    "vehicle-efficiency": 6,
    "vehicle-occupancy": 1
  }, "yes");
  assert.ok(Math.abs(calc.api.calculateTransportationEmissions() - 675.1) < 1e-9);
});

test("combined footprint total equals the sum of all four categories", () => {
  const calc = createCalculator({
    "household-size": 2,
    electricity: 1000,
    solar: 200,
    "cooking-fuel": "lpg",
    "lpg-cylinders": 4,
    "vehicle-type": "petrol-car",
    "vehicle-distance": 12000,
    "vehicle-efficiency": 15,
    "vehicle-occupancy": 2,
    "rail-distance": 3000,
    "bus-distance": 2000,
    "domestic-flight-distance": 4000,
    "international-flight-distance": 10000,
    "beef-kg": 1,
    "rice-kg": 10,
    "milk-kg": 20,
    "potatoes-kg": 5,
    "food-waste-kg": 10,
    "mixed-waste-kg": 20
  }, "yes");

  const result = calc.api.calculateFootprint();
  assert.ok(result);
  assert.equal(
    result.total,
    result.energy + result.transport + result.food + result.waste
  );
  assert.ok(result.total > 0);
  assert.equal(result.householdSize, 2);

  // Household energy and waste are divided across two members.
  assert.ok(Math.abs(result.energy - 355.24) < 1e-9);
  assert.ok(Math.abs(result.waste - 5.442) < 1e-9);

  // Transport and food remain individual estimates.
  assert.ok(Math.abs(result.transport - 2257.2) < 1e-9);
  assert.ok(Math.abs(result.food - 209.28) < 1e-9);

  assert.ok(Math.abs(result.householdTotal - result.total * 2) < 1e-9);
});

test("zero activity produces zero emissions in optional categories", () => {
  const calc = createCalculator({
    "food-waste-kg": 0,
    "mixed-waste-kg": 0,
    "beef-kg": 0,
    "rice-kg": 0
  });
  assert.equal(calc.api.calculateFoodEmissions(), 0);
  assert.equal(calc.api.calculateWasteEmissions(), 0);
  assert.equal(calc.api.calculateTransportationEmissions(), 0);
});


test("footprint insights identify the largest category and its share", () => {
  const calc = createCalculator();
  const insight = calc.api.getFootprintInsights({
    energy: 100,
    transport: 500,
    food: 200,
    waste: 0
  });
  assert.equal(insight.largest, "transport");
  assert.equal(insight.share, 62.5);
  assert.match(insight.summary, /Transportation is your largest estimated source/);
  assert.match(insight.action, /frequent journeys/);
});

test("footprint insights handle an all-zero result without dividing by zero", () => {
  const calc = createCalculator();
  const insight = calc.api.getFootprintInsights({
    energy: 0,
    transport: 0,
    food: 0,
    waste: 0
  });
  assert.equal(insight.largest, null);
  assert.equal(insight.share, 0);
  assert.match(insight.summary, /add up to zero/);
});
