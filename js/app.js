/*
 * ============================================================
 * CarbonLens
 * Personal Carbon Footprint Calculator
 *
 * Main application logic
 *
 * IMPORTANT:
 * emissionFactors.js MUST be loaded before this file.
 *
 * Expected order in HTML:
 *
 * <script src="js/emissionFactors.js"></script>
 * <script src="js/app.js"></script>
 *
 * Main calculation output:
 * kgCO2e / year
 * ============================================================
 */


/* ============================================================
   1. DOM ELEMENTS
   ============================================================ */

const carbonForm = document.getElementById("carbon-form");

const menuToggle = document.getElementById("menu-toggle");
const mainMenu = document.getElementById("main-menu");

const cookingFuel = document.getElementById("cooking-fuel");
const lpgField = document.getElementById("lpg-field");
const pngField = document.getElementById("png-field");

const privateVehicleRadios = document.querySelectorAll(
  'input[name="privateVehicle"]'
);

const privateVehicleFields = document.getElementById(
  "private-vehicle-fields"
);

const vehicleType = document.getElementById("vehicle-type");
const efficiencyUnit = document.getElementById("efficiency-unit");

const resultsSection = document.getElementById("results");

const totalEmissions = document.getElementById("total-emissions");
const monthlyEmissions = document.getElementById("monthly-emissions");
const dailyEmissions = document.getElementById("daily-emissions");
const tonneEmissions = document.getElementById("tonne-emissions");
const perPersonEmissions = document.getElementById(
  "per-person-emissions"
);

const resultSummary = document.getElementById("result-summary");

const energyEmissions = document.getElementById(
  "energy-emissions"
);

const transportEmissions = document.getElementById(
  "transport-emissions"
);

const foodEmissions = document.getElementById(
  "food-emissions"
);

const wasteEmissions = document.getElementById(
  "waste-emissions"
);

const energyProgress = document.getElementById(
  "energy-progress"
);

const transportProgress = document.getElementById(
  "transport-progress"
);

const foodProgress = document.getElementById(
  "food-progress"
);

const wasteProgress = document.getElementById(
  "waste-progress"
);

const categoryShareElements = {
  energy: document.getElementById("energy-share"),
  transport: document.getElementById("transport-share"),
  food: document.getElementById("food-share"),
  waste: document.getElementById("waste-share")
};

const insightSummary = document.getElementById("insight-summary");
const insightAction = document.getElementById("insight-action");


const formStatus = document.getElementById("form-status");

const calculationStatus = document.getElementById(
  "calculation-status"
);

const resetButton = document.getElementById("reset-button");

const currentYear = document.getElementById("current-year");


/* ============================================================
   2. APPLICATION STATE
   ============================================================ */

let lastCalculation = null;


/* ============================================================
   3. START APPLICATION
   ============================================================ */

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeApp
  );
} else {
  initializeApp();
}


function initializeApp() {
  setCurrentYear();

  setupMobileNavigation();

  setupCookingFuelFields();

  setupElectricityInputHelper();

  setupPNGInputHelper();

  setupVehicleDistanceHelper();

  setupPrivateVehicleFields();

  setupVehicleEfficiencyUnit();

  setupFormSubmission();

  setupCalculatorWizard();

  setupReductionPlanner();

  setupReportExport();

  setupCSVExport();

  setupFormReset();

  setupSmoothNavigation();

  setupScrollAnimations();

  updateCookingFuelFields();

  updatePrivateVehicleFields();

  updateVehicleEfficiencyUnit();

  verifyEmissionFactors();
}


/* ============================================================
   4. EMISSION FACTOR SAFETY CHECK
   ============================================================ */

function verifyEmissionFactors() {
  if (
    typeof EMISSION_FACTORS === "undefined"
  ) {
    console.error(
      "CarbonLens: EMISSION_FACTORS is unavailable."
    );

    if (formStatus) {
      formStatus.textContent =
        "Calculator configuration error. Please make sure emissionFactors.js is loaded before app.js.";

      formStatus.classList.add("error");
    }

    return false;
  }

  if (
    typeof getEmissionFactor !== "function"
  ) {
    console.error(
      "CarbonLens: getEmissionFactor() is unavailable."
    );

    if (formStatus) {
      formStatus.textContent =
        "Calculator configuration error. Please check emissionFactors.js.";

      formStatus.classList.add("error");
    }

    return false;
  }

  return true;
}


/* ============================================================
   5. CURRENT YEAR
   ============================================================ */

function setCurrentYear() {
  if (currentYear) {
    currentYear.textContent =
      new Date().getFullYear();
  }
}


/* ============================================================
   6. MOBILE NAVIGATION
   ============================================================ */

function setupMobileNavigation() {
  if (!menuToggle || !mainMenu) {
    return;
  }

  menuToggle.addEventListener("click", () => {
    const isOpen =
      mainMenu.classList.toggle("open");

    menuToggle.classList.toggle(
      "active",
      isOpen
    );

    menuToggle.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

    menuToggle.setAttribute(
      "aria-label",
      isOpen
        ? "Close navigation menu"
        : "Open navigation menu"
    );
  });

  const navigationLinks =
    mainMenu.querySelectorAll("a");

  navigationLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mainMenu.classList.remove("open");

      menuToggle.classList.remove("active");

      menuToggle.setAttribute(
        "aria-expanded",
        "false"
      );

      menuToggle.setAttribute(
        "aria-label",
        "Open navigation menu"
      );
    });
  });
}


/* ============================================================
   7. ELECTRICITY INPUT HELPER
   ============================================================ */

function getAnnualElectricityConsumption() {
  const enteredValue = getRequiredNumber("electricity");
  const period = document.getElementById("electricity-period")?.value || "annual";
  return period === "monthly" ? enteredValue * 12 : enteredValue;
}

function setupElectricityInputHelper() {
  const input = document.getElementById("electricity");
  const period = document.getElementById("electricity-period");
  const unit = document.getElementById("electricity-input-unit");
  const preview = document.getElementById("electricity-annual-preview");
  if (!input || !period || !unit || !preview) return;

  const update = () => {
    const isMonthly = period.value === "monthly";
    unit.textContent = isMonthly ? "kWh / month" : "kWh / year";
    input.placeholder = isMonthly ? "e.g. 300" : "e.g. 3600";
    const entered = input.value.trim() === "" ? NaN : Number(input.value);
    if (!Number.isFinite(entered) || entered < 0) {
      preview.textContent = "Annual consumption used in the calculation: enter your kWh figure.";
      return;
    }
    const annual = isMonthly ? entered * 12 : entered;
    preview.textContent = `Annual consumption used in the calculation: ${annual.toLocaleString("en-IN", { maximumFractionDigits: 1 })} kWh/year.${isMonthly ? " Monthly usage is multiplied by 12." : ""}`;
  };

  input.addEventListener("input", update);
  period.addEventListener("change", update);
  update();
}


function getAnnualPNGConsumption() {
  const enteredValue = getRequiredNumber("png-consumption");
  const period = document.getElementById("png-period")?.value || "annual";
  return period === "monthly" ? enteredValue * 12 : enteredValue;
}

function setupPNGInputHelper() {
  const input = document.getElementById("png-consumption");
  const period = document.getElementById("png-period");
  const unit = document.getElementById("png-input-unit");
  const preview = document.getElementById("png-annual-preview");
  if (!input || !period || !unit || !preview) return;

  const update = () => {
    const isMonthly = period.value === "monthly";
    unit.textContent = isMonthly ? "Sm³ / month" : "Sm³ / year";
    input.placeholder = isMonthly ? "e.g. 12" : "e.g. 144";
    const entered = input.value.trim() === "" ? NaN : Number(input.value);
    if (!Number.isFinite(entered) || entered <= 0) {
      preview.textContent = "Annual consumption used in the calculation: enter your gas volume in Sm³.";
      return;
    }
    const annual = isMonthly ? entered * 12 : entered;
    preview.textContent = `Annual consumption used in the calculation: ${annual.toLocaleString("en-IN", { maximumFractionDigits: 2 })} Sm³/year.${isMonthly ? " Monthly usage is multiplied by 12." : ""}`;
  };

  input.addEventListener("input", update);
  period.addEventListener("change", update);
  update();
}


function getAnnualVehicleDistance() {
  const enteredValue = getRequiredNumber("vehicle-distance");
  const period = document.getElementById("vehicle-distance-period")?.value || "annual";
  return period === "monthly" ? enteredValue * 12 : enteredValue;
}

function setupVehicleDistanceHelper() {
  const input = document.getElementById("vehicle-distance");
  const period = document.getElementById("vehicle-distance-period");
  const unit = document.getElementById("vehicle-distance-input-unit");
  const preview = document.getElementById("vehicle-distance-annual-preview");
  if (!input || !period || !unit || !preview) return;

  const update = () => {
    const isMonthly = period.value === "monthly";
    unit.textContent = isMonthly ? "km / month" : "km / year";
    input.placeholder = isMonthly ? "e.g. 1000" : "e.g. 12000";
    const entered = input.value.trim() === "" ? NaN : Number(input.value);
    if (!Number.isFinite(entered) || entered < 0) {
      preview.textContent = "Annual distance used in the calculation: enter your distance in kilometres.";
      return;
    }
    const annual = isMonthly ? entered * 12 : entered;
    preview.textContent = `Annual distance used in the calculation: ${annual.toLocaleString("en-IN", { maximumFractionDigits: 0 })} km/year.${isMonthly ? " Monthly distance is multiplied by 12." : ""}`;
  };

  input.addEventListener("input", update);
  period.addEventListener("change", update);
  update();
}


/* ============================================================
   8. COOKING FUEL FIELDS
   ============================================================ */

function setupCookingFuelFields() {
  if (!cookingFuel) {
    return;
  }

  cookingFuel.addEventListener(
    "change",
    updateCookingFuelFields
  );
}


function updateCookingFuelFields() {
  if (!cookingFuel) {
    return;
  }

  const selectedFuel =
    cookingFuel.value;

  const showLPG =
    selectedFuel === "lpg";

  const showPNG =
    selectedFuel === "png";

  toggleField(
    lpgField,
    showLPG
  );

  toggleField(
    pngField,
    showPNG
  );
}


function toggleField(
  element,
  shouldShow
) {
  if (!element) {
    return;
  }

  element.hidden = !shouldShow;

  const inputs =
    element.querySelectorAll(
      "input, select, textarea"
    );

  element.setAttribute(
    "aria-hidden",
    String(!shouldShow)
  );

  inputs.forEach((input) => {
    input.disabled = !shouldShow;
    input.required = shouldShow;
    if (!shouldShow) {
      input.removeAttribute("aria-invalid");
      input.setCustomValidity("");
    }
  });
}


/* ============================================================
   8. PRIVATE VEHICLE
   ============================================================ */

function setupPrivateVehicleFields() {
  if (!privateVehicleRadios.length) {
    return;
  }

  privateVehicleRadios.forEach((radio) => {
    radio.addEventListener(
      "change",
      updatePrivateVehicleFields
    );
  });
}


function updatePrivateVehicleFields() {
  if (!privateVehicleFields) {
    return;
  }

  const selected =
    document.querySelector(
      'input[name="privateVehicle"]:checked'
    );

  const shouldShow =
    selected &&
    selected.value === "yes";

  privateVehicleFields.hidden =
    !shouldShow;

  privateVehicleFields.setAttribute(
    "aria-hidden",
    String(!shouldShow)
  );

  const inputs =
    privateVehicleFields.querySelectorAll(
      "input, select, textarea"
    );

  inputs.forEach((input) => {
    input.disabled = !shouldShow;
    input.required = shouldShow;
    if (!shouldShow) {
      input.removeAttribute("aria-invalid");
      input.setCustomValidity("");
    }
  });

  if (!shouldShow) {
    clearPrivateVehicleErrors();
  }
}


function clearPrivateVehicleErrors() {
  const ids = [
    "vehicle-type",
    "vehicle-distance",
    "vehicle-efficiency",
    "vehicle-occupancy"
  ];

  ids.forEach((id) => {
    const element =
      document.getElementById(id);

    if (element) {
      element.setCustomValidity("");
      element.removeAttribute(
        "aria-invalid"
      );
    }
  });
}


/* ============================================================
   9. VEHICLE EFFICIENCY UNIT
   ============================================================ */

function setupVehicleEfficiencyUnit() {
  if (!vehicleType) {
    return;
  }

  vehicleType.addEventListener(
    "change",
    updateVehicleEfficiencyUnit
  );
}


function updateVehicleEfficiencyUnit() {
  if (!vehicleType || !efficiencyUnit) {
    return;
  }

  const selectedVehicle =
    vehicleType.value;

  const unitMap = {
    "petrol-car": "km / litre",
    "diesel-car": "km / litre",
    "cng-car": "km / kg",
    "petrol-bike": "km / litre",
    ev: "km / kWh"
  };

  efficiencyUnit.textContent =
    unitMap[selectedVehicle] ||
    "km / litre";

  const efficiencyInput =
    document.getElementById(
      "vehicle-efficiency"
    );

  if (!efficiencyInput) {
    return;
  }

  const placeholderMap = {
    "petrol-car": "e.g. 15",
    "diesel-car": "e.g. 18",
    "cng-car": "e.g. 20",
    "petrol-bike": "e.g. 45",
    ev: "e.g. 6"
  };

  efficiencyInput.placeholder =
    placeholderMap[selectedVehicle] ||
    "Enter efficiency";

  const efficiencyHelp = document.getElementById("vehicle-efficiency-help");
  if (efficiencyHelp) {
    const helpMap = {
      "petrol-car": "Use real-world km per litre from normal driving, not only the manufacturer's claimed mileage. A fuel log or trip-computer average is better.",
      "diesel-car": "Use real-world km per litre from normal driving, not only the manufacturer's claimed mileage. A fuel log or trip-computer average is better.",
      "cng-car": "Use real-world km per kg of CNG. Do not enter km per litre; check your fuel records or trip-computer average.",
      "petrol-bike": "Use real-world km per litre from normal riding, not only the manufacturer's claimed mileage.",
      ev: "Use real-world km per kWh. Check your vehicle's energy-consumption display; do not enter km per litre."
    };
    efficiencyHelp.textContent = helpMap[selectedVehicle] ||
      "Use real-world efficiency from normal driving. Match the unit shown beside this field.";
  }
}


/* ============================================================
   10. FORM SUBMISSION
   ============================================================ */

function setupFormSubmission() {
  if (!carbonForm) {
    return;
  }

  carbonForm.addEventListener(
    "submit",
    handleFormSubmit
  );
}


function handleFormSubmit(event) {
  event.preventDefault();

  clearFormStatus();
  clearFieldErrors();

  if (!verifyEmissionFactors()) {
    return;
  }

  const validation =
    validateForm();

  if (!validation.valid) {
    const target = validation.field
      ? document.getElementById(validation.field)
      : null;
    const targetStep = target ? target.closest(".wizard-step") : null;
    if (targetStep) showWizardStep(Number(targetStep.dataset.step));
    showFormError(
      validation.message,
      validation.field
    );

    return;
  }

  const result =
    calculateFootprint();

  if (!result) {
    showFormError(
      "The calculator could not complete the calculation. Please check your inputs and try again."
    );

    return;
  }

  lastCalculation = result;

  displayResults(result);

  showFormSuccess(
    "Calculation completed successfully."
  );
}


/* ============================================================
   11. FORM RESET
   ============================================================ */

function setupFormReset() {
  if (!resetButton) {
    return;
  }

  resetButton.addEventListener(
    "click",
    () => {
      setTimeout(() => {
        lastCalculation = null;

        clearFormStatus();

        if (resultsSection) {
          resultsSection.hidden = true;
        }

        updateCookingFuelFields();

        updatePrivateVehicleFields();

        updateVehicleEfficiencyUnit();

        resetCalculatorWizard();
      }, 0);
    }
  );
}


/* ============================================================
   12. INPUT HELPERS
   ============================================================ */

/*
 * Blank optional fields are treated as zero.
 *
 * This is important because most food, transport and waste
 * fields are optional and have a default value of 0.
 */

function getNumber(id) {
  const element =
    document.getElementById(id);

  if (!element) {
    return 0;
  }

  const rawValue =
    element.value.trim();

  if (rawValue === "") {
    return 0;
  }

  const number =
    Number(rawValue);

  return Number.isFinite(number)
    ? number
    : NaN;
}


function getRequiredNumber(id) {
  const element =
    document.getElementById(id);

  if (!element) {
    return NaN;
  }

  const rawValue =
    element.value.trim();

  if (rawValue === "") {
    return NaN;
  }

  const number =
    Number(rawValue);

  return Number.isFinite(number)
    ? number
    : NaN;
}


function sanitizeNumber(value) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.max(
    0,
    value
  );
}


function setText(
  element,
  value
) {
  if (element) {
    element.textContent = value;
  }
}


function formatNumber(
  value,
  maximumFractionDigits = 1
) {
  const safeValue =
    sanitizeNumber(value);

  return new Intl.NumberFormat(
    "en-IN",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits
    }
  ).format(safeValue);
}


/* ============================================================
   13. FORM VALIDATION
   ============================================================ */

/*
 * Validate a number against the constraints declared in HTML.
 * Returns an error message, or an empty string when valid.
 */
function validateNumericInputValue(rawValue, constraints = {}) {
  const raw = String(rawValue ?? "").trim();

  if (raw === "") {
    return constraints.required
      ? "This field is required."
      : "";
  }

  const value = Number(raw);

  if (!Number.isFinite(value)) {
    return "Enter a valid number.";
  }

  const min = constraints.min === null || constraints.min === undefined || constraints.min === ""
    ? NaN
    : Number(constraints.min);
  const max = constraints.max === null || constraints.max === undefined || constraints.max === ""
    ? NaN
    : Number(constraints.max);
  const step = constraints.step === "any"
    ? NaN
    : constraints.step === null || constraints.step === undefined || constraints.step === ""
      ? 1
      : Number(constraints.step);

  if (Number.isFinite(min) && value < min) {
    return "Value must be at least " + min + ".";
  }

  if (Number.isFinite(max) && value > max) {
    return "Value must be no more than " + max + ".";
  }

  if (Number.isFinite(step) && step > 0) {
    const base = Number.isFinite(min) ? min : 0;
    const steps = (value - base) / step;
    if (Math.abs(steps - Math.round(steps)) > 1e-8) {
      return "Use increments of " + step + ".";
    }
  }

  return "";
}


function validateNumericInputs() {
  if (!carbonForm) {
    return { valid: true, field: null, message: "" };
  }

  const numericInputs =
    carbonForm.querySelectorAll('input[type="number"]');

  for (const input of numericInputs) {
    if (input.disabled) {
      continue;
    }

    const message = validateNumericInputValue(
      input.value,
      {
        required: input.required,
        min: input.getAttribute("min"),
        max: input.getAttribute("max"),
        step: input.getAttribute("step")
      }
    );

    if (message) {
      return {
        valid: false,
        field: input.id || null,
        message
      };
    }
  }

  return { valid: true, field: null, message: "" };
}


function clearFieldErrors() {
  if (!carbonForm) {
    return;
  }

  carbonForm
    .querySelectorAll("input, select, textarea")
    .forEach((field) => {
      field.removeAttribute("aria-invalid");
      field.setCustomValidity("");
    });
}


function validateForm() {

  const numericValidation =
    validateNumericInputs();

  if (!numericValidation.valid) {
    return numericValidation;
  }

  /* ----------------------------------------------------------
     Household size
     ---------------------------------------------------------- */

  const householdSize =
    getRequiredNumber(
      "household-size"
    );

  if (
    !Number.isInteger(householdSize) ||
    householdSize < 1 ||
    householdSize > 30
  ) {
    return {
      valid: false,
      field: "household-size",
      message:
        "Please enter a household size between 1 and 30."
    };
  }


  /* ----------------------------------------------------------
     Electricity
     ---------------------------------------------------------- */

  const electricity =
    getAnnualElectricityConsumption();

  if (
    !Number.isFinite(electricity) ||
    electricity < 0
  ) {
    return {
      valid: false,
      field: "electricity",
      message:
        "Please enter a valid electricity consumption value."
    };
  }


  /* ----------------------------------------------------------
     Cooking fuel
     ---------------------------------------------------------- */

  const selectedFuel =
    cookingFuel
      ? cookingFuel.value
      : "";


  if (!selectedFuel) {
    return {
      valid: false,
      field: "cooking-fuel",
      message: "Please select your primary cooking fuel, or choose None."
    };
  }


  if (selectedFuel === "lpg") {

    const lpg =
      getNumber("lpg-cylinders");

    if (
      !Number.isFinite(lpg) ||
      lpg <= 0
    ) {
      return {
        valid: false,
        field: "lpg-cylinders",
        message:
          "Please enter an annual LPG quantity greater than zero."
      };
    }
  }


  if (selectedFuel === "png") {

    const png =
      getAnnualPNGConsumption();

    if (
      !Number.isFinite(png) ||
      png <= 0
    ) {
      return {
        valid: false,
        field: "png-consumption",
        message:
          "Please enter an annual PNG quantity greater than zero."
      };
    }
  }


  /* ----------------------------------------------------------
     Private transportation
     ---------------------------------------------------------- */

  const privateVehicle =
    document.querySelector(
      'input[name="privateVehicle"]:checked'
    );


  if (
    privateVehicle &&
    privateVehicle.value === "yes"
  ) {

    const selectedVehicle =
      vehicleType
        ? vehicleType.value
        : "";


    if (!selectedVehicle) {
      return {
        valid: false,
        field: "vehicle-type",
        message:
          "Please select your private vehicle type."
      };
    }


    const distance =
      getAnnualVehicleDistance();


    if (
      !Number.isFinite(distance) ||
      distance < 0
    ) {
      return {
        valid: false,
        field: "vehicle-distance",
        message:
          "Please enter a valid annual vehicle distance."
      };
    }


    if (distance > 0) {
      const efficiency =
        getRequiredNumber("vehicle-efficiency");

      if (!Number.isFinite(efficiency) || efficiency <= 0) {
        return {
          valid: false,
          field: "vehicle-efficiency",
          message: "Please enter a vehicle efficiency greater than zero."
        };
      }

      const occupancy =
        getRequiredNumber("vehicle-occupancy");

      if (
        !Number.isInteger(occupancy) ||
        occupancy < 1 ||
        occupancy > 20
      ) {
        return {
          valid: false,
          field: "vehicle-occupancy",
          message: "Vehicle occupancy must be a whole number between 1 and 20."
        };
      }
    }
  }


  /* ----------------------------------------------------------
     Public transport
     ---------------------------------------------------------- */

  const railDistance =
    getNumber("rail-distance");

  const busDistance =
    getNumber("bus-distance");


  if (
    !Number.isFinite(railDistance) ||
    railDistance < 0
  ) {
    return {
      valid: false,
      field: "rail-distance",
      message:
        "Please enter a valid train travel distance."
    };
  }


  if (
    !Number.isFinite(busDistance) ||
    busDistance < 0
  ) {
    return {
      valid: false,
      field: "bus-distance",
      message:
        "Please enter a valid bus travel distance."
    };
  }


  /* ----------------------------------------------------------
     Air travel
     ---------------------------------------------------------- */

  const domesticFlights =
    getNumber(
      "domestic-flight-distance"
    );

  const internationalFlights =
    getNumber(
      "international-flight-distance"
    );


  if (
    !Number.isFinite(domesticFlights) ||
    domesticFlights < 0
  ) {
    return {
      valid: false,
      field: "domestic-flight-distance",
      message:
        "Please enter a valid domestic flight distance."
    };
  }


  if (
    !Number.isFinite(internationalFlights) ||
    internationalFlights < 0
  ) {
    return {
      valid: false,
      field: "international-flight-distance",
      message:
        "Please enter a valid international flight distance."
    };
  }


  /* ----------------------------------------------------------
     Food
     ---------------------------------------------------------- */

  const foodInputIds = [
    "beef-kg",
    "lamb-kg",
    "pork-kg",
    "poultry-kg",
    "cheese-kg",
    "milk-kg",
    "eggs-kg",
    "rice-kg",
    "tofu-kg",
    "peas-kg",
    "beans-kg",
    "potatoes-kg",
    "root-vegetables-kg",
    "bananas-kg",
    "apples-kg",
    "tomatoes-kg"
  ];


  for (
    const id of foodInputIds
  ) {

    const value =
      getNumber(id);

    if (
      !Number.isFinite(value) ||
      value < 0
    ) {
      return {
        valid: false,
        field: id,
        message:
          "Please enter valid food quantities."
      };
    }
  }


  /* ----------------------------------------------------------
     Waste
     ---------------------------------------------------------- */

  const foodWaste =
    getNumber(
      "food-waste-kg"
    );

  const mixedWaste =
    getNumber(
      "mixed-waste-kg"
    );


  if (
    !Number.isFinite(foodWaste) ||
    foodWaste < 0
  ) {
    return {
      valid: false,
      field: "food-waste-kg",
      message:
        "Please enter a valid annual food-waste quantity."
    };
  }


  if (
    !Number.isFinite(mixedWaste) ||
    mixedWaste < 0
  ) {
    return {
      valid: false,
      field: "mixed-waste-kg",
      message:
        "Please enter a valid annual household-waste quantity."
    };
  }


  return {
    valid: true,
    field: null,
    message: ""
  };
}


/* ============================================================
   14. MAIN CALCULATION
   ============================================================ */

function calculateFootprint() {

  if (!verifyEmissionFactors()) {
    return null;
  }


  const householdSize =
    getRequiredNumber(
      "household-size"
    );


  const electricity =
    getAnnualElectricityConsumption();


  /* ----------------------------------------------------------
     Calculate categories
     ---------------------------------------------------------- */

  const energy =
    calculateEnergyEmissions(electricity);


  const transport =
    calculateTransportationEmissions();


  const food =
    calculateFoodEmissions();


  const waste =
    calculateWasteEmissions();


  /*
   * Energy and waste are household totals.
   * Transport and food are already individual estimates.
   */
  const personalEnergy = energy / householdSize;
  const personalWaste = waste / householdSize;

  const total =
    personalEnergy +
    transport +
    food +
    personalWaste;

  const householdTotal =
    energy +
    waste +
    (transport + food) * householdSize;

  if (
    !Number.isFinite(total) ||
    !Number.isFinite(householdTotal)
  ) {
    console.error(
      "CarbonLens: calculation produced an invalid total."
    );
    return null;
  }

  return {
    total: sanitizeNumber(total),
    householdTotal: sanitizeNumber(householdTotal),
    energy: sanitizeNumber(personalEnergy),
    transport: sanitizeNumber(transport),
    food: sanitizeNumber(food),
    waste: sanitizeNumber(personalWaste),
    householdEnergy: sanitizeNumber(energy),
    householdWaste: sanitizeNumber(waste),
    householdSize,
    details: buildCalculationDetails(householdSize)
  };
}



/* Transparent, per-source calculation detail data. */
function buildCalculationDetails(householdSize) {
  const rows = { energy: [], transport: [], food: [], waste: [] };
  const add = (category,label,activity,data,formula,emissions,note) => {
    if (!data || !Number.isFinite(emissions) || emissions <= 0) return;
    rows[category].push({label,activity,factor:data.factor,unit:data.unit||"",formula,emissions:sanitizeNumber(emissions),source:data.source||"Source not specified",sourceUrl:data.sourceUrl||"",referenceYear:data.referenceYear||"",region:data.geographicScope||data.region||"",confidence:data.confidence||"medium",notes:note||data.notes||""});
  };
  const grid=getAnnualElectricityConsumption();
  const ef=getEmissionFactorData(EMISSION_FACTORS.energy,"electricity");
  add("energy","Grid electricity purchased",`${formatNumber(grid,1)} kWh`,ef,`${formatNumber(grid,1)} kWh × ${ef.factor} kgCO₂/kWh ÷ ${householdSize} people`,grid*ef.factor/householdSize,"Annualised utility-bill kWh is treated as grid electricity imported. On-site solar is not subtracted again.");
  const fuel=cookingFuel?cookingFuel.value:"";
  if(fuel==="lpg"){const n=getNumber("lpg-cylinders"),d=getEmissionFactorData(EMISSION_FACTORS.energy,"lpg");add("energy","LPG cooking gas",`${formatNumber(n,2)} cylinders × ${d.cylinderMassKg} kg`,d,`${formatNumber(n,2)} × ${d.cylinderMassKg} kg × ${d.factor} ÷ ${householdSize} people`,n*d.cylinderMassKg*d.factor/householdSize);}
  if(fuel==="png"){const n=getAnnualPNGConsumption(),d=getEmissionFactorData(EMISSION_FACTORS.energy,"png");add("energy","Piped natural gas",`${formatNumber(n,2)} Sm³/year`,d,`${formatNumber(n,2)} Sm³/year × ${d.factor} ÷ ${householdSize} people`,n*d.factor/householdSize,"Monthly bill usage, when selected, is annualized by multiplying by 12.");}
  const choice=document.querySelector('input[name="privateVehicle"]:checked');
  if(choice&&choice.value==="yes"){
    const type=vehicleType?vehicleType.value:"",km=getAnnualVehicleDistance(),eff=getNumber("vehicle-efficiency"),occupancy=getNumber("vehicle-occupancy"),data=getVehicleFactorData(type);
    if(data&&km>0&&eff>0&&occupancy>0){const ev=type==="ev",activity=km/eff,factor=ev?getEmissionFactorData(EMISSION_FACTORS.transportation,"ev"):data,label=({"petrol-car":"Petrol car","diesel-car":"Diesel car","cng-car":"CNG car","petrol-bike":"Petrol two-wheeler",ev:"Electric vehicle"})[type]||"Private vehicle";const unit=ev?"kWh":(data.unit.includes("kg")?"kg":"litres");const formula=ev?`(${formatNumber(km,0)} km ÷ ${formatNumber(eff,1)} km/kWh) × ${factor.factor} ÷ ${occupancy} people`:`(${formatNumber(km,0)} km ÷ ${formatNumber(eff,1)} km/${unit==="kg"?"kg":"litre"}) × ${factor.factor} ÷ ${occupancy} people`;add("transport",label,`${formatNumber(km,0)} km vehicle distance · ${formatNumber(occupancy,1)} occupants`,factor,formula,activity*factor.factor/occupancy);}
  }
  [["rail-distance","Passenger rail",EMISSION_FACTORS.publicTransport.rail],["bus-distance","City bus",EMISSION_FACTORS.publicTransport.bus],["domestic-flight-distance","Domestic flights",EMISSION_FACTORS.flights.domestic],["international-flight-distance","International flights",EMISSION_FACTORS.flights.international]].forEach(([id,label,d])=>{const km=getNumber(id);add("transport",label,`${formatNumber(km,0)} passenger-km`,d,`${formatNumber(km,0)} passenger-km × ${d.factor} ${d.unit}`,km*d.factor);});
  [["beef-kg","Beef","beef"],["lamb-kg","Lamb","lamb"],["pork-kg","Pork","pork"],["poultry-kg","Poultry","poultry"],["cheese-kg","Cheese","cheese"],["milk-kg","Milk","milk"],["eggs-kg","Eggs","eggs"],["rice-kg","Rice","rice"],["tofu-kg","Tofu","tofu"],["peas-kg","Peas","peas"],["beans-kg","Beans / pulses","beans"],["potatoes-kg","Potatoes","potatoes"],["root-vegetables-kg","Root vegetables","rootVegetables"],["bananas-kg","Bananas","bananas"],["apples-kg","Apples","apples"],["tomatoes-kg","Tomatoes","tomatoes"]].forEach(([id,label,key])=>{const kg=getNumber(id),d=getEmissionFactorData(EMISSION_FACTORS.food,key);add("food",label,`${formatNumber(kg,2)} kg consumed per person`,d,`${formatNumber(kg,2)} kg × ${d.factor} ${d.unit}`,kg*d.factor,"Global lifecycle average; not India-specific.");});
  [["food-waste-kg","Food waste",EMISSION_FACTORS.waste.food],["mixed-waste-kg","Mixed waste",EMISSION_FACTORS.waste.mixed]].forEach(([id,label,d])=>{const kg=getNumber(id);add("waste",label,`${formatNumber(kg,2)} kg household waste`,d,`${formatNumber(kg,2)} kg × ${d.factor} ${d.unit} ÷ ${householdSize} people`,kg*d.factor/householdSize,"Household waste is allocated evenly per person. Factor is an estimate and depends on disposal method.");});
  return rows;
}

function renderCalculationDetails(result) {
  const root=document.getElementById("calculation-details");
  if(!root||!result||!result.details)return;
  root.textContent="";
  const intro=document.createElement("p");intro.className="details-intro";intro.textContent="Each line shows the activity, factor and arithmetic behind the estimate. Household energy and waste are divided by household size; food and travel are personal inputs.";root.appendChild(intro);
  [["energy","Energy",result.energy],["transport","Transportation",result.transport],["food","Food",result.food],["waste","Waste",result.waste]].forEach(([key,label,total])=>{
    const section=document.createElement("details");section.className="calculation-detail";
    const summary=document.createElement("summary"),name=document.createElement("span"),amount=document.createElement("strong");name.textContent=label;amount.textContent=`${formatNumber(total,2)} kgCO₂e / person / year`;summary.append(name,amount);section.appendChild(summary);
    const items=result.details[key];
    if(!items.length){const empty=document.createElement("p");empty.className="detail-empty";empty.textContent="No activity was entered for this category.";section.appendChild(empty);}
    items.forEach(item=>{
      const line=document.createElement("article");line.className="detail-line";
      const title=document.createElement("h4"),value=document.createElement("strong"),activity=document.createElement("p"),math=document.createElement("code"),source=document.createElement("p");
      title.textContent=item.label;value.textContent=`${formatNumber(item.emissions,2)} kgCO₂e`;activity.textContent="Activity: "+item.activity;math.textContent=item.formula;
      source.className="detail-source";source.textContent=`Factor: ${item.factor} ${item.unit}${item.referenceYear?" · "+item.referenceYear:""}${item.region?" · "+item.region:""} · Confidence: ${item.confidence.toUpperCase()} · Source: ${item.source}`;
      line.append(title,value,activity,math,source);
      if(item.notes){const note=document.createElement("p");note.className="detail-note";note.textContent=item.notes;line.appendChild(note);}
      if(item.sourceUrl){const link=document.createElement("a");link.href=item.sourceUrl;link.target="_blank";link.rel="noopener noreferrer";link.textContent="Open source reference";line.appendChild(link);}
      section.appendChild(line);
    });root.appendChild(section);
  });
}


/* Transparent scenario model: category reductions scale the selected
   category total linearly. This is a what-if estimate, not a forecast. */
function calculateReductionScenario(result, reductions = {}) {
  const categories = ["energy", "transport", "food", "waste"];
  const savingsByCategory = { energy: 0, transport: 0, food: 0, waste: 0 };
  const activities = [];
  categories.forEach((category) => {
    const rows = result.details && Array.isArray(result.details[category])
      ? result.details[category] : [];
    rows.forEach((item, index) => {
      const key = category + ":" + index;
      const percentage = Math.min(50, Math.max(0, Number(reductions[key]) || 0));
      const emissions = sanitizeNumber(item.emissions);
      const saved = emissions * percentage / 100;
      savingsByCategory[category] += saved;
      activities.push({ key, category, label: item.label, emissions, reduction: percentage, saved });
    });
  });
  const current = categories.reduce((sum, key) => sum + sanitizeNumber(result[key]), 0);
  const saved = activities.reduce((sum, item) => sum + item.saved, 0);
  const projected = Math.max(0, current - saved);
  const largestCategory = categories
    .sort((a, b) => sanitizeNumber(result[b]) - sanitizeNumber(result[a]))
    .find((key) => sanitizeNumber(result[key]) > 0) || null;
  return {
    current, saved, projected,
    savedPercent: current > 0 ? saved / current * 100 : 0,
    savingsByCategory, activities, reductions: Object.fromEntries(activities.map(item => [item.key, item.reduction])),
    largestCategory
  };
}

function setupReductionPlanner() {
  const root = document.getElementById("reduction-planner");
  if (!root) return;
  const controls = document.getElementById("scenario-activity-controls");
  if (controls) controls.addEventListener("input", (event) => {
    if (event.target && event.target.matches("[data-scenario-reduction]") && lastCalculation) {
      renderReductionPlanner(lastCalculation, false);
    }
  });
  const reset = document.getElementById("reduction-reset");
  if (reset) reset.addEventListener("click", () => {
    if (controls) controls.querySelectorAll("[data-scenario-reduction]").forEach(input => { input.value = "0"; });
    if (lastCalculation) renderReductionPlanner(lastCalculation, false);
  });
}

function renderReductionPlanner(result, resetControls = true) {
  const root = document.getElementById("reduction-planner");
  const container = document.getElementById("scenario-activity-controls");
  if (!root || !container || !result) return;
  if (resetControls || !container.dataset.rendered) {
    container.textContent = "";
    [["energy","Energy"],["transport","Transportation"],["food","Food"],["waste","Waste"]].forEach(([category,title]) => {
      const rows = result.details && Array.isArray(result.details[category]) ? result.details[category] : [];
      if (!rows.length) return;
      const group = document.createElement("section");
      group.className = "scenario-activity-group";
      const heading = document.createElement("h4");
      heading.textContent = title;
      group.appendChild(heading);
      rows.forEach((item,index) => {
        const key = category + ":" + index;
        const card = document.createElement("div");
        card.className = "scenario-control";
        const label = document.createElement("label");
        label.setAttribute("for","scenario-"+category+"-"+index);
        const name = document.createElement("span");
        name.textContent = item.label + " · " + formatNumber(item.emissions,1) + " kgCO₂e/year";
        const output = document.createElement("output");
        output.id = "scenario-value-"+category+"-"+index;
        output.textContent = "0%";
        label.append(name,output);
        const input = document.createElement("input");
        input.id = "scenario-"+category+"-"+index;
        input.type = "range";
        input.min = "0";
        input.max = "50";
        input.step = "5";
        input.value = "0";
        input.dataset.scenarioReduction = key;
        const saving = document.createElement("small");
        saving.id = "scenario-saving-"+category+"-"+index;
        saving.textContent = "Estimated saving: 0 kgCO₂e/year";
        card.append(label,input,saving);
        group.appendChild(card);
      });
      container.appendChild(group);
    });
    container.dataset.rendered = "true";
  }
  const controls = [...container.querySelectorAll("[data-scenario-reduction]")];
  const reductions = {};
  controls.forEach(input => { reductions[input.dataset.scenarioReduction] = Number(input.value); });
  const scenario = calculateReductionScenario(result, reductions);
  const set = (id,value) => { const node = document.getElementById(id); if (node) node.textContent = value; };
  set("scenario-current",formatNumber(scenario.current,1));
  set("scenario-saved",formatNumber(scenario.saved,1));
  set("scenario-projected",formatNumber(scenario.projected,1));
  set("scenario-saved-percent",scenario.savedPercent.toFixed(1)+"%");
  scenario.activities.forEach(item => {
    const parts = item.key.split(":");
    set("scenario-value-"+parts[0]+"-"+parts[1],item.reduction+"%");
    set("scenario-saving-"+parts[0]+"-"+parts[1],"Estimated saving: "+formatNumber(item.saved,1)+" kgCO₂e/year");
  });
  const categoryNames = {energy:"Energy",transport:"Transportation",food:"Food",waste:"Waste"};
  const largest = scenario.largestCategory;
  set("scenario-priority",largest
    ? "Your largest current category is "+categoryNames[largest]+" at "+formatNumber(result[largest],1)+" kgCO₂e per person per year. Start by testing specific activities in this category."
    : "Your current estimate is zero, so there is no modelled reduction opportunity yet.");
  const status = document.getElementById("scenario-assumptions");
  if (status) status.textContent = "Each slider reduces one entered activity by up to 50%. Savings are calculated from that activity's existing emissions row; separate rows are summed once, so categories are not reduced a second time. This is a proportional what-if estimate, not a forecast. It assumes the activity and its emissions factor both remain otherwise unchanged. Food factors are global averages; waste factors have low confidence.";
}

/* ============================================================
   15. ENERGY CALCULATION
   ============================================================ */

function calculateEnergyEmissions(electricity) {

  let emissions = 0;


  /* ----------------------------------------------------------
     Grid electricity purchased

     The user enters utility-bill kWh, which is already grid
     import. Do not subtract rooftop solar a second time.
     ---------------------------------------------------------- */

  const gridElectricity = electricity;


  const electricityFactor =
    getEmissionFactor(
      EMISSION_FACTORS.energy,
      "electricity"
    );


  if (
    Number.isFinite(
      electricityFactor
    )
  ) {

    emissions +=
      gridElectricity *
      electricityFactor;
  }


  /* ----------------------------------------------------------
     Cooking fuel
     ---------------------------------------------------------- */

  const selectedFuel =
    cookingFuel
      ? cookingFuel.value
      : "";


  /* ----------------------------------------------------------
     LPG
     
     Factor:
     kgCO2e per kg LPG
     
     HTML input:
     number of 14.2 kg cylinders per year
     
     Therefore:
     
     cylinders × 14.2 kg × factor
     ---------------------------------------------------------- */

  if (
    selectedFuel === "lpg"
  ) {

    const lpgCylinders =
      getNumber(
        "lpg-cylinders"
      );


    const lpgFactor =
      getEmissionFactor(
        EMISSION_FACTORS.energy,
        "lpg"
      );

         const cylinderMassKg =
           EMISSION_FACTORS.energy.lpg.cylinderMassKg;


    if (
      Number.isFinite(
        lpgCylinders
      ) &&
      Number.isFinite(
        lpgFactor
      )
    ) {

      emissions +=
        lpgCylinders *
        cylinderMassKg *
        lpgFactor;
    }
  }


  /* ----------------------------------------------------------
     PNG
     
     emissionFactors.js defines PNG consumption as Sm3.
     ---------------------------------------------------------- */

  if (
    selectedFuel === "png"
  ) {

    const pngConsumption =
      getAnnualPNGConsumption();


    const pngFactor =
      getEmissionFactor(
        EMISSION_FACTORS.energy,
        "png"
      );


    if (
      Number.isFinite(
        pngConsumption
      ) &&
      Number.isFinite(
        pngFactor
      )
    ) {

      emissions +=
        pngConsumption *
        pngFactor;
    }
  }


  /*
   * Electricity cooking is already represented by the
   * electricity consumption entered by the user.
   *
   * We therefore do NOT add another electricity calculation.
   */


  return sanitizeNumber(
    emissions
  );
}


/* ============================================================
   16. PRIVATE + PUBLIC TRANSPORTATION
   ============================================================ */

function calculateTransportationEmissions() {

  let emissions = 0;


  /* ----------------------------------------------------------
     PRIVATE VEHICLE
     ---------------------------------------------------------- */

  const privateVehicle =
    document.querySelector(
      'input[name="privateVehicle"]:checked'
    );


  if (
    privateVehicle &&
    privateVehicle.value === "yes"
  ) {

    const selectedVehicle =
      vehicleType
        ? vehicleType.value
        : "";


    const distance =
      getAnnualVehicleDistance();


    const efficiency =
      getNumber(
        "vehicle-efficiency"
      );


    const occupancy =
      getNumber(
        "vehicle-occupancy"
      );


    if (
      selectedVehicle &&
      Number.isFinite(distance) &&
      distance >= 0 &&
      Number.isFinite(efficiency) &&
      efficiency > 0 &&
      Number.isFinite(occupancy) &&
      occupancy > 0
    ) {

      const vehicleData =
        getVehicleFactorData(
          selectedVehicle
        );


      if (vehicleData) {

        let vehicleEmissions =
          0;


        /* ----------------------------------------------------
           EV
           
           Efficiency:
           km/kWh
           
           Electricity consumed:
           
           distance / km-per-kWh
           
           Emissions:
           
           electricity × kgCO2e/kWh
           ---------------------------------------------------- */

        if (
          selectedVehicle === "ev"
        ) {

          const electricityUsed =
            distance /
            efficiency;


          const electricityFactor =
            getEmissionFactor(
              EMISSION_FACTORS.energy,
              "electricity"
            );


          /*
           * The EV entry itself also contains the grid factor.
           * We use the EV factor from the configured data.
           * This keeps the calculation tied to the selected
           * vehicle definition.
           */

          const evFactor =
            getEmissionFactor(
              EMISSION_FACTORS.transportation,
              "ev"
            );


          const factorToUse =
            Number.isFinite(evFactor)
              ? evFactor
              : electricityFactor;


          if (
            Number.isFinite(
              factorToUse
            )
          ) {

            vehicleEmissions =
              electricityUsed *
              factorToUse;
          }

        } else {

          /* --------------------------------------------------
             Fuel vehicles
             
             Petrol / diesel:
             km/litre
             
             CNG:
             km/kg
             
             Fuel consumed:
             distance / efficiency
             
             Emissions:
             fuel × emission factor
             -------------------------------------------------- */

          const fuelConsumed =
            distance /
            efficiency;


          const vehicleFactor =
            getEmissionFactor(
              EMISSION_FACTORS.transportation,
              selectedVehicle
            );


          if (
            Number.isFinite(
              vehicleFactor
            )
          ) {

            vehicleEmissions =
              fuelConsumed *
              vehicleFactor;
          }
        }


        /*
         * Distance is assumed to be vehicle distance.
         * Occupancy is therefore used to allocate the vehicle's
         * emissions to the person being calculated.
         */

        emissions +=
          vehicleEmissions /
          occupancy;
      }
    }
  }


  /* ----------------------------------------------------------
     TRAIN
     ---------------------------------------------------------- */

  const railDistance =
    getNumber(
      "rail-distance"
    );


  const railFactor =
    getEmissionFactor(
      EMISSION_FACTORS.publicTransport,
      "rail"
    );


  if (
    Number.isFinite(
      railDistance
    ) &&
    railDistance >= 0 &&
    Number.isFinite(
      railFactor
    )
  ) {

    emissions +=
      railDistance *
      railFactor;
  }


  /* ----------------------------------------------------------
     CITY BUS
     ---------------------------------------------------------- */

  const busDistance =
    getNumber(
      "bus-distance"
    );


  const busFactor =
    getEmissionFactor(
      EMISSION_FACTORS.publicTransport,
      "bus"
    );


  if (
    Number.isFinite(
      busDistance
    ) &&
    busDistance >= 0 &&
    Number.isFinite(
      busFactor
    )
  ) {

    emissions +=
      busDistance *
      busFactor;
  }


  /* ----------------------------------------------------------
     DOMESTIC FLIGHTS
     ---------------------------------------------------------- */

  const domesticFlights =
    getNumber(
      "domestic-flight-distance"
    );


  const domesticFlightFactor =
    getEmissionFactor(
      EMISSION_FACTORS.flights,
      "domestic"
    );


  if (
    Number.isFinite(
      domesticFlights
    ) &&
    domesticFlights >= 0 &&
    Number.isFinite(
      domesticFlightFactor
    )
  ) {

    emissions +=
      domesticFlights *
      domesticFlightFactor;
  }


  /* ----------------------------------------------------------
     INTERNATIONAL FLIGHTS
     ---------------------------------------------------------- */

  const internationalFlights =
    getNumber(
      "international-flight-distance"
    );


  const internationalFlightFactor =
    getEmissionFactor(
      EMISSION_FACTORS.flights,
      "international"
    );


  if (
    Number.isFinite(
      internationalFlights
    ) &&
    internationalFlights >= 0 &&
    Number.isFinite(
      internationalFlightFactor
    )
  ) {

    emissions +=
      internationalFlights *
      internationalFlightFactor;
  }


  return sanitizeNumber(
    emissions
  );
}


/* ============================================================
   17. VEHICLE FACTOR DATA
   ============================================================ */

function getVehicleFactorData(
  vehicleTypeValue
) {

  if (
    !EMISSION_FACTORS ||
    !EMISSION_FACTORS.transportation
  ) {
    return null;
  }


  return (
    EMISSION_FACTORS.transportation[
      vehicleTypeValue
    ] || null
  );
}


/* ============================================================
   18. FOOD CALCULATION
   ============================================================ */

function calculateFoodEmissions() {

  let emissions = 0;


  /*
   * Every key below corresponds directly to an input in
   * the current CarbonLens HTML.
   */

  const foodMap = {

    "beef-kg": "beef",

    "lamb-kg": "lamb",

    "pork-kg": "pork",

    "poultry-kg": "poultry",

    "cheese-kg": "cheese",

    "milk-kg": "milk",

    "eggs-kg": "eggs",

    "rice-kg": "rice",

    "tofu-kg": "tofu",

    "peas-kg": "peas",

    "beans-kg": "beans",

    "potatoes-kg": "potatoes",

    "root-vegetables-kg":
      "rootVegetables",

    "bananas-kg": "bananas",

    "apples-kg": "apples",

    "tomatoes-kg": "tomatoes"
  };


  Object.entries(
    foodMap
  ).forEach(
    ([inputId, factorKey]) => {

      const quantity =
        getNumber(inputId);


      const factor =
        getEmissionFactor(
          EMISSION_FACTORS.food,
          factorKey
        );


      if (
        Number.isFinite(
          quantity
        ) &&
        quantity >= 0 &&
        Number.isFinite(
          factor
        )
      ) {

        emissions +=
          quantity *
          factor;
      }
    }
  );


  return sanitizeNumber(
    emissions
  );
}


/* ============================================================
   19. WASTE CALCULATION
   ============================================================ */

function calculateWasteEmissions() {

  let emissions = 0;


  const foodWaste =
    getNumber(
      "food-waste-kg"
    );


  const mixedWaste =
    getNumber(
      "mixed-waste-kg"
    );


  const foodWasteFactor =
    getEmissionFactor(
      EMISSION_FACTORS.waste,
      "food"
    );


  const mixedWasteFactor =
    getEmissionFactor(
      EMISSION_FACTORS.waste,
      "mixed"
    );


  if (
    Number.isFinite(
      foodWaste
    ) &&
    foodWaste >= 0 &&
    Number.isFinite(
      foodWasteFactor
    )
  ) {

    emissions +=
      foodWaste *
      foodWasteFactor;
  }


  if (
    Number.isFinite(
      mixedWaste
    ) &&
    mixedWaste >= 0 &&
    Number.isFinite(
      mixedWasteFactor
    )
  ) {

    emissions +=
      mixedWaste *
      mixedWasteFactor;
  }


  return sanitizeNumber(
    emissions
  );
}


/* ============================================================
   20. DISPLAY RESULTS
   ============================================================ */

function displayResults(
  result
) {

  if (
    !resultsSection ||
    !result
  ) {
    return;
  }


  const total =
    sanitizeNumber(
      result.total
    );


  const monthly =
    total / 12;


  const daily =
    total / 365;


  const tonnes =
    total / 1000;


  const householdTotal =
    sanitizeNumber(result.householdTotal);


  resultsSection.hidden =
    false;


  setText(
    totalEmissions,
    formatNumber(
      total,
      1
    )
  );


  setText(
    monthlyEmissions,
    formatNumber(
      monthly,
      1
    )
  );


  setText(
    dailyEmissions,
    formatNumber(
      daily,
      2
    )
  );


  setText(
    tonneEmissions,
    tonnes.toFixed(2)
  );


  setText(
    perPersonEmissions,
    formatNumber(
      householdTotal,
      1
    )
  );


  setText(
    energyEmissions,
    `${formatNumber(
      result.energy,
      1
    )} kgCO₂e`
  );


  setText(
    transportEmissions,
    `${formatNumber(
      result.transport,
      1
    )} kgCO₂e`
  );


  setText(
    foodEmissions,
    `${formatNumber(
      result.food,
      1
    )} kgCO₂e`
  );


  setText(
    wasteEmissions,
    `${formatNumber(
      result.waste,
      1
    )} kgCO₂e`
  );


  updateDonutChart(result);
  renderCalculationDetails(result);
  renderReductionPlanner(result);

  updateBreakdownBars(
    result
  );


  updateResultSummary(result);


  if (calculationStatus) {

    calculationStatus.textContent =
      "Calculation completed using the emission factors configured for this version of CarbonLens.";
  }


  /*
   * Give the browser a moment to render the result before
   * scrolling to it.
   */

  setTimeout(() => {

    resultsSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  }, 100);
}



/* Interactive category explorer: all values come from the calculation result. */
function updateDonutChart(result) {
  const chart = document.getElementById("emissions-donut");
  const legend = document.getElementById("donut-legend");
  const selection = document.getElementById("donut-selection");
  if (!chart || !legend) return;
  const categories = [
    { key: "energy", label: "Energy", color: "#a6b58b", value: sanitizeNumber(result.energy), detail: "Home electricity and cooking fuel, allocated across household members." },
    { key: "transport", label: "Transportation", color: "#d58b58", value: sanitizeNumber(result.transport), detail: "Allocated private-vehicle emissions plus public transport and air travel." },
    { key: "food", label: "Food", color: "#79a99a", value: sanitizeNumber(result.food), detail: "Estimated emissions associated with the food quantities entered." },
    { key: "waste", label: "Waste", color: "#9b91bd", value: sanitizeNumber(result.waste), detail: "Your allocated share of household food and mixed waste emissions." }
  ];
  const total = categories.reduce((sum, item) => sum + item.value, 0);
  const totalLabel = document.getElementById("donut-total");
  if (totalLabel) totalLabel.textContent = formatNumber(total, 0);
  let cursor = 0;
  const stops = categories.map(item => {
    const start = total > 0 ? cursor / total * 100 : 0;
    cursor += item.value;
    const end = total > 0 ? cursor / total * 100 : 0;
    return `${item.color} ${start}% ${end}%`;
  });
  chart.style.background = total > 0 ? `conic-gradient(${stops.join(", ")})` : "conic-gradient(#34423a 0% 100%)";
  categories.forEach(item => {
    const share = total > 0 ? item.value / total * 100 : 0;
    const value = document.getElementById(`donut-${item.key}-value`);
    const percent = document.getElementById(`donut-${item.key}-share`);
    if (value) value.textContent = `${formatNumber(item.value, 1)} kgCO₂e`;
    if (percent) percent.textContent = `${share.toFixed(1)}%`;
  });
  const buttons = legend.querySelectorAll("[data-category]");
  buttons.forEach(button => {
    const item = categories.find(category => category.key === button.dataset.category);
    button.onclick = () => {
      buttons.forEach(other => other.setAttribute("aria-pressed", String(other === button)));
      const share = total > 0 ? item.value / total * 100 : 0;
      if (!selection) return;
      selection.replaceChildren();
      const eyebrow = document.createElement("span");
      const heading = document.createElement("strong");
      const paragraph = document.createElement("p");
      eyebrow.textContent = "CATEGORY DETAIL";
      heading.textContent = `${item.label} · ${formatNumber(item.value, 1)} kgCO₂e`;
      paragraph.textContent = `${share.toFixed(1)}% of your estimated footprint. ${item.detail}`;
      selection.append(eyebrow, heading, paragraph);
    };
  });
  const largest = [...categories].sort((left, right) => right.value - left.value)[0];
  const initial = largest && largest.value > 0 ? largest : categories[0];
  legend.querySelector(`[data-category="${initial.key}"]`)?.click();
}

/* ============================================================
   21. BREAKDOWN PROGRESS BARS
   ============================================================ */

function updateBreakdownBars(
  result
) {

  const total =
    sanitizeNumber(
      result.total
    );


  updateProgressBar(
    energyProgress,
    result.energy,
    total
  );


  updateProgressBar(
    transportProgress,
    result.transport,
    total
  );


  updateProgressBar(
    foodProgress,
    result.food,
    total
  );


  updateProgressBar(
    wasteProgress,
    result.waste,
    total
  );

  Object.entries(categoryShareElements).forEach(([category, element]) => {
    if (!element) return;
    const value = sanitizeNumber(result[category]);
    const share = total > 0 ? (value / total) * 100 : 0;
    element.textContent = `${share.toFixed(1)}%`;
  });
}


function updateProgressBar(
  element,
  value,
  total
) {

  if (!element) {
    return;
  }


  const safeValue =
    sanitizeNumber(
      value
    );


  const percentage =
    total > 0
      ? Math.min(
          (
            safeValue /
            total
          ) * 100,
          100
        )
      : 0;


  element.style.width =
    `${percentage}%`;


  const track =
    element.parentElement;


  if (track) {

    track.setAttribute(
      "aria-valuenow",
      percentage.toFixed(1)
    );
  }
}


/* ============================================================
   REPORT EXPORT
   ============================================================ */

function setupReportExport() {
  const exportButton = document.getElementById("export-report");
  if (!exportButton) return;

  exportButton.addEventListener("click", () => {
    if (!lastCalculation || !resultsSection || resultsSection.hidden) {
      return;
    }

    window.print();
  });
}

/* Export the exact activity-level calculation behind the current result. */
function setupCSVExport() {
  const exportButton = document.getElementById("export-csv");
  if (!exportButton) return;

  exportButton.addEventListener("click", () => {
    if (!lastCalculation || !resultsSection || resultsSection.hidden) return;

    const columns = [
      "Record type", "Category", "Metric", "Value", "Unit", "Activity",
      "Emission factor", "Factor unit", "Formula", "Emissions kgCO2e",
      "Confidence", "Geographic scope", "Reference year", "Source", "Source URL"
    ];

    const escapeCell = (value) => {
      const text = value === null || value === undefined ? "" : String(value);
      return '"' + text.replace(/"/g, '""') + '"';
    };

    const rows = [columns];
    const summary = [
      ["Summary", "All categories", "Annual footprint per person", lastCalculation.total, "kgCO2e/year"],
      ["Summary", "Household", "Annual household footprint", lastCalculation.householdTotal, "kgCO2e/year"],
      ["Summary", "Household", "Household size", lastCalculation.householdSize, "people"],
      ["Summary", "Energy", "Per-person annual emissions", lastCalculation.energy, "kgCO2e/year"],
      ["Summary", "Transportation", "Per-person annual emissions", lastCalculation.transport, "kgCO2e/year"],
      ["Summary", "Food", "Per-person annual emissions", lastCalculation.food, "kgCO2e/year"],
      ["Summary", "Waste", "Per-person annual emissions", lastCalculation.waste, "kgCO2e/year"]
    ];

    summary.forEach((item) => rows.push([
      ...item, "", "", "", "", "", "", "", "", "", ""
    ]));

    const categoryLabels = {
      energy: "Energy",
      transport: "Transportation",
      food: "Food",
      waste: "Waste"
    };

    Object.entries(lastCalculation.details || {}).forEach(([category, items]) => {
      (items || []).forEach((item) => {
        rows.push([
          "Activity", categoryLabels[category] || category, item.label,
          "", "", item.activity, item.factor, item.unit,
          item.formula, item.emissions, item.confidence, item.region,
          item.referenceYear, item.source, item.sourceUrl
        ]);
      });
    });

    rows.push([]);
    rows.push(["Note", "", "Estimates use the factors and boundaries documented by this CarbonLens version. Categories may have different system boundaries; this is not a fully harmonised lifecycle inventory."]);

    const csv = "\uFEFF" + rows.map((row) => row.map(escapeCell).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const now = new Date();
    const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");

    link.href = url;
    link.download = `carbonlens-report-${date}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}


/* ============================================================
   22. RESULT SUMMARY
   ============================================================ */

function getFootprintInsights(result) {
  const categories = [
    { key: "energy", label: "Energy", value: sanitizeNumber(result.energy) },
    { key: "transport", label: "Transportation", value: sanitizeNumber(result.transport) },
    { key: "food", label: "Food", value: sanitizeNumber(result.food) },
    { key: "waste", label: "Waste", value: sanitizeNumber(result.waste) }
  ];

  const total = categories.reduce((sum, item) => sum + item.value, 0);
  const ranked = [...categories].sort((left, right) => right.value - left.value);
  const largest = ranked[0];
  const share = total > 0 ? (largest.value / total) * 100 : 0;

  if (total <= 0 || largest.value <= 0) {
    return {
      largest: null,
      share: 0,
      summary: "Your entered activities currently add up to zero estimated emissions. Check that the activity values reflect a typical year before drawing conclusions.",
      action: "Review your electricity, travel, food and waste entries. Missing activity data can make an estimate look lower than it really is."
    };
  }

  const actions = {
    energy: "Review your electricity bill and identify high-use appliances. Reduce avoidable cooling and standby use, and consider efficient appliances when replacing old ones.",
    transport: "Look at your most frequent journeys first. Combine errands, use public transport for suitable routes, or share rides where practical.",
    food: "Review your highest-impact food choices and avoid unnecessary food waste. Try replacing some high-impact meals with lower-impact alternatives that fit your diet.",
    waste: "Separate wet and dry waste where local collection supports it, compost suitable organic waste, and avoid sending recyclable material into mixed waste."
  };

  return {
    largest: largest.key,
    share,
    summary: `${largest.label} is your largest estimated source at ${share.toFixed(1)}% of the footprint (${formatNumber(largest.value, 1)} kgCO₂e per person each year). Start by improving this category; the other categories remain part of the total.`,
    action: actions[largest.key]
  };
}


function updateResultSummary(result) {
  if (!resultSummary) return;

  const insights = getFootprintInsights(result);
  resultSummary.textContent = insights.largest
    ? `Your largest estimated source is ${insights.largest === "transport" ? "Transportation" : insights.largest.charAt(0).toUpperCase() + insights.largest.slice(1)} (${insights.share.toFixed(1)}%). Explore the breakdown and recommended next step below.`
    : insights.summary;

  if (insightSummary) insightSummary.textContent = insights.summary;
  if (insightAction) insightAction.textContent = insights.action;
}

/* ============================================================
   23. FORM STATUS
   ============================================================ */

function clearFormStatus() {

  if (!formStatus) {
    return;
  }


  formStatus.textContent =
    "";


  formStatus.classList.remove(
    "error",
    "success"
  );
}


function showFormError(
  message,
  fieldId = null
) {

  if (formStatus) {

    formStatus.textContent =
      message;

    formStatus.classList.remove(
      "success"
    );

    formStatus.classList.add(
      "error"
    );
  }


  if (fieldId) {

    const field =
      document.getElementById(
        fieldId
      );


    if (field) {

      field.setAttribute(
        "aria-invalid",
        "true"
      );


      field.focus();
    }
  }
}


function showFormSuccess(
  message
) {

  if (!formStatus) {
    return;
  }


  formStatus.textContent =
    message;


  formStatus.classList.remove(
    "error"
  );


  formStatus.classList.add(
    "success"
  );
}



/* ============================================================
   GUIDED CALCULATOR — FOUR CLEAR STEPS
   ============================================================ */

const wizardSteps = Array.from(document.querySelectorAll(".wizard-step"));
const wizardStepNames = ["Household & energy", "Transportation", "Food", "Waste"];
let activeWizardStep = 0;

function setupCalculatorWizard() {
  if (!carbonForm || wizardSteps.length !== 4) return;

  const back = document.getElementById("wizard-back");
  const next = document.getElementById("wizard-next");

  back?.addEventListener("click", () => showWizardStep(activeWizardStep - 1));
  next?.addEventListener("click", () => {
    if (activeWizardStep < wizardSteps.length - 1) {
      showWizardStep(activeWizardStep + 1);
    }
  });

  showWizardStep(0);
  updateWizardReview();
  carbonForm.addEventListener("input", updateWizardReview);
  carbonForm.addEventListener("change", updateWizardReview);
}

function showWizardStep(index) {
  if (!wizardSteps.length) return;
  activeWizardStep = Math.max(0, Math.min(index, wizardSteps.length - 1));

  wizardSteps.forEach((step, stepIndex) => {
    const active = stepIndex === activeWizardStep;
    step.hidden = !active;
    step.setAttribute("aria-hidden", String(!active));
  });

  const count = document.getElementById("wizard-step-count");
  const name = document.getElementById("wizard-step-name");
  const fill = document.getElementById("wizard-progress-fill");
  const track = document.getElementById("wizard-progress-track");
  const back = document.getElementById("wizard-back");
  const next = document.getElementById("wizard-next");
  const calculate = document.getElementById("calculate-button");
  const dots = document.querySelectorAll(".wizard-step-dots span");
  const review = document.getElementById("wizard-review");

  if (count) count.textContent = `Step ${activeWizardStep + 1} of ${wizardSteps.length}`;
  if (name) name.textContent = wizardStepNames[activeWizardStep];
  if (fill) fill.style.width = `${((activeWizardStep + 1) / wizardSteps.length) * 100}%`;
  if (track) track.setAttribute("aria-valuenow", String(activeWizardStep + 1));
  if (back) back.disabled = activeWizardStep === 0;
  if (next) next.hidden = activeWizardStep === wizardSteps.length - 1;
  if (calculate) calculate.hidden = activeWizardStep !== wizardSteps.length - 1;
  if (review) review.hidden = activeWizardStep !== wizardSteps.length - 1;

  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex <= activeWizardStep);
    dot.classList.toggle("is-current", dotIndex === activeWizardStep);
  });

  const status = document.getElementById("form-status");
  if (status) {
    status.textContent = "";
    status.classList.remove("error");
  }
}

function updateWizardReview() {
  const list = document.getElementById("wizard-review-list");
  if (!list) return;

  const read = (id) => {
    const field = document.getElementById(id);
    if (!field) return "—";
    if (field.type === "radio") return field.checked ? field.value : "—";
    if (field.tagName === "SELECT") return field.selectedOptions?.[0]?.textContent?.trim() || "Not selected";
    return field.value.trim() || "0 / not entered";
  };

  const privateVehicle = document.querySelector('input[name="privateVehicle"]:checked')?.value || "no";
  const fuel = read("cooking-fuel");
  const rows = [
    ["Household size", `${read("household-size")} people`],
    ["Electricity", `${read("electricity")} kWh/year`],
    ["Cooking fuel", fuel],
    ["Private vehicle", privateVehicle === "yes" ? read("vehicle-type") : "No"],
    ["Train / bus", `${read("rail-distance")} / ${read("bus-distance")} passenger-km`],
    ["Domestic / international flights", `${read("domestic-flight-distance")} / ${read("international-flight-distance")} passenger-km`],
    ["Food entries", "Review the Food step"],
    ["Food / mixed waste", `${read("food-waste-kg")} / ${read("mixed-waste-kg")} kg/year`]
  ];

  list.replaceChildren(...rows.map(([label, value]) => {
    const wrapper = document.createElement("div");
    const term = document.createElement("dt");
    const description = document.createElement("dd");
    term.textContent = label;
    description.textContent = value;
    wrapper.append(term, description);
    return wrapper;
  }));
}

function resetCalculatorWizard() {
  showWizardStep(0);
  updateWizardReview();
}


/* ============================================================
   24. SMOOTH NAVIGATION
   ============================================================ */

function setupSmoothNavigation() {

  const internalLinks =
    document.querySelectorAll(
      'a[href^="#"]'
    );


  internalLinks.forEach(
    (link) => {

      link.addEventListener(
        "click",
        (event) => {

          const targetId =
            link.getAttribute(
              "href"
            );


          if (
            !targetId ||
            targetId === "#"
          ) {
            return;
          }


          const target =
            document.querySelector(
              targetId
            );


          if (!target) {
            return;
          }


          event.preventDefault();


          target.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      );
    }
  );
}


/* ============================================================
   25. SCROLL ANIMATIONS
   ============================================================ */

function setupScrollAnimations() {

  const animatedElements =
    document.querySelectorAll(
      ".info-card, .methodology-card, .result-card, .form-section"
    );


  if (
    !animatedElements.length
  ) {
    return;
  }


  /*
   * Respect users who prefer reduced motion.
   */

  if (
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
  ) {
    animatedElements.forEach(
      (element) => {
        element.classList.add(
          "visible"
        );
      }
    );

    return;
  }


  if (
    !("IntersectionObserver" in window)
  ) {

    animatedElements.forEach(
      (element) => {
        element.classList.add(
          "visible"
        );
      }
    );

    return;
  }


  const observer =
    new IntersectionObserver(
      (
        entries,
        observerInstance
      ) => {

        entries.forEach(
          (entry) => {

            if (
              entry.isIntersecting
            ) {

              entry.target.classList.add(
                "visible"
              );


              observerInstance.unobserve(
                entry.target
              );
            }
          }
        );
      },
      {
        threshold: 0.12,
        rootMargin:
          "0px 0px -50px 0px"
      }
    );


  animatedElements.forEach(
    (element) => {

      observer.observe(
        element
      );
    }
  );
}


/* ============================================================
   26. OPTIONAL DEBUG API
   ============================================================ */

/*
 * These functions are intentionally exposed for development
 * and browser-console testing.
 *
 * Example:
 *
 * calculateFootprint()
 *
 * or:
 *
 * lastCalculation
 *
 * They do not affect the website's normal operation.
 */

window.CarbonLens = {
  validateNumericInputValue,
  validateForm,
  calculateFootprint,
  buildCalculationDetails,
  getFootprintInsights,
  calculateReductionScenario,
  calculateEnergyEmissions,
  calculateTransportationEmissions,
  calculateFoodEmissions,
  calculateWasteEmissions,
  getVehicleFactorData,
  getEmissionFactor:
    typeof getEmissionFactor === "function"
      ? getEmissionFactor
      : null
};
