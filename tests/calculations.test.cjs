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
  assert.ok(Math.abs(calc.api.calculateEnergyEmissions(100) - 152.71) < 1e-9);
});

test("utility-bill electricity is treated as grid import without a second solar deduction", () => {
  const calc = createCalculator({ "cooking-fuel": "none" });
  assert.equal(calc.api.calculateEnergyEmissions(100), 67.51);
});

test("monthly electricity input is annualized before emissions are calculated", () => {
  const calc = createCalculator({
    "household-size": 1,
    electricity: 100,
    "electricity-period": "monthly",
    "cooking-fuel": "none"
  });

  const result = calc.api.calculateFootprint();
  assert.ok(result);
  assert.ok(Math.abs(result.energy - 810.12) < 1e-9);
});

test("monthly PNG bill input is annualized consistently in emissions and source details", () => {
  const calc = createCalculator({
    "household-size": 1,
    electricity: 0,
    "electricity-period": "annual",
    "cooking-fuel": "png",
    "png-consumption": 10,
    "png-period": "monthly"
  });

  const result = calc.api.calculateFootprint();
  assert.ok(result);
  assert.ok(Math.abs(result.energy - 240) < 1e-9);

  const pngRow = result.details.energy.find(item => item.label === "Piped natural gas");
  assert.ok(pngRow);
  assert.ok(Math.abs(pngRow.emissions - 240) < 1e-9);
  assert.match(pngRow.activity, /120 Sm³\/year/);
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

test("monthly private-vehicle distance is annualized in emissions and source details", () => {
  const calc = createCalculator({
    "household-size": 1,
    electricity: 0,
    "electricity-period": "annual",
    "cooking-fuel": "none",
    "vehicle-type": "petrol-car",
    "vehicle-distance": 1000,
    "vehicle-distance-period": "monthly",
    "vehicle-efficiency": 10,
    "vehicle-occupancy": 1
  }, "yes");

  const result = calc.api.calculateFootprint();
  assert.ok(result);
  assert.ok(Math.abs(result.transport - 2772) < 1e-9);

  const vehicleRow = result.details.transport.find(item => item.label === "Petrol car");
  assert.ok(vehicleRow);
  assert.ok(Math.abs(vehicleRow.emissions - 2772) < 1e-9);
  assert.match(vehicleRow.activity, /12,000 km/);
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

  // Source-level detail rows must reconcile with each displayed category.
  for (const category of ["energy", "transport", "food", "waste"]) {
    const detailTotal = result.details[category].reduce((sum, item) => sum + item.emissions, 0);
    assert.ok(Math.abs(detailTotal - result[category]) < 1e-9, `${category} detail rows must reconcile`);
  }
  assert.ok(result.details.energy.some(item => item.label === "Grid electricity purchased"));
  assert.ok(result.details.transport.some(item => item.label === "Passenger rail"));
  assert.ok(result.details.food.some(item => item.label === "Rice"));
  assert.ok(result.details.waste.some(item => item.label === "Food waste"));

  // Household energy and waste are divided across two members.
  assert.ok(Math.abs(result.energy - 422.75) < 1e-9);
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


test("activity scenario planner sums distinct source-row reductions without double counting", () => {
  const calc = createCalculator();
  const result = calc.api.calculateReductionScenario({
    energy: 100, transport: 200, food: 300, waste: 40,
    details: {
      energy: [{ label: "Grid electricity", emissions: 60 }, { label: "LPG", emissions: 40 }],
      transport: [{ label: "Car", emissions: 150 }, { label: "Rail", emissions: 50 }],
      food: [{ label: "Rice", emissions: 200 }, { label: "Dairy", emissions: 100 }],
      waste: [{ label: "Food waste", emissions: 40 }]
    }
  }, { "energy:0": 20, "transport:0": 10, "food:1": 50, "waste:0": 25 });
  assert.equal(result.current, 640);
  assert.equal(result.savingsByCategory.energy, 12);
  assert.equal(result.savingsByCategory.transport, 15);
  assert.equal(result.savingsByCategory.food, 50);
  assert.equal(result.savingsByCategory.waste, 10);
  assert.equal(result.saved, 87);
  assert.equal(result.projected, 553);
  assert.equal(result.savedPercent, 87 / 640 * 100);
  assert.equal(result.activities.length, 7);
  assert.equal(result.largestCategory, "food");
});

test("activity scenario planner clamps sliders and handles zero emissions", () => {
  const calc = createCalculator();
  const result = calc.api.calculateReductionScenario({
    energy: 0, transport: 0, food: 0, waste: 0,
    details: { energy: [{ label: "Grid", emissions: 0 }], transport: [{ label: "Rail", emissions: 0 }], food: [], waste: [] }
  }, { "energy:0": 90, "transport:0": -10 });
  assert.equal(result.saved, 0);
  assert.equal(result.projected, 0);
  assert.equal(result.savedPercent, 0);
  assert.equal(result.reductions["energy:0"], 50);
  assert.equal(result.reductions["transport:0"], 0);
});

