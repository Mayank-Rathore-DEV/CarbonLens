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

test("energy calculation handles grid electricity and LPG", () => {
  const calc = createCalculator({
    "cooking-fuel": "lpg",
    "lpg-cylinders": 2
  });
  assert.equal(calc.api.calculateEnergyEmissions(100, 20), 152.008);
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
