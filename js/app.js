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

  setupPrivateVehicleFields();

  setupVehicleEfficiencyUnit();

  setupFormSubmission();

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
      mainMenu.classList.toggle("active");

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
      mainMenu.classList.remove("active");

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
   7. COOKING FUEL FIELDS
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

  inputs.forEach((input) => {
    input.disabled = !shouldShow;
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

  const inputs =
    privateVehicleFields.querySelectorAll(
      "input, select, textarea"
    );

  inputs.forEach((input) => {
    input.disabled = !shouldShow;
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

  if (!verifyEmissionFactors()) {
    return;
  }

  const validation =
    validateForm();

  if (!validation.valid) {
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

function validateForm() {

  /* ----------------------------------------------------------
     Household size
     ---------------------------------------------------------- */

  const householdSize =
    getRequiredNumber(
      "household-size"
    );

  if (
    !Number.isFinite(householdSize) ||
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
    getRequiredNumber(
      "electricity"
    );

  if (
    !Number.isFinite(electricity) ||
    electricity < 0
  ) {
    return {
      valid: false,
      field: "electricity",
      message:
        "Please enter a valid annual electricity consumption."
    };
  }


  /* ----------------------------------------------------------
     Solar
     ---------------------------------------------------------- */

  const solar =
    getNumber("solar");

  if (
    !Number.isFinite(solar) ||
    solar < 0
  ) {
    return {
      valid: false,
      field: "solar",
      message:
        "Please enter a valid annual solar generation value."
    };
  }


  /* ----------------------------------------------------------
     Solar cannot exceed electricity consumption
     ---------------------------------------------------------- */

  if (solar > electricity) {
    return {
      valid: false,
      field: "solar",
      message:
        "Solar generation cannot be greater than the annual electricity consumption entered for this calculation."
    };
  }


  /* ----------------------------------------------------------
     Cooking fuel
     ---------------------------------------------------------- */

  const selectedFuel =
    cookingFuel
      ? cookingFuel.value
      : "";


  if (selectedFuel === "lpg") {

    const lpg =
      getNumber("lpg-cylinders");

    if (
      !Number.isFinite(lpg) ||
      lpg < 0
    ) {
      return {
        valid: false,
        field: "lpg-cylinders",
        message:
          "Please enter a valid number of LPG cylinders."
      };
    }
  }


  if (selectedFuel === "png") {

    const png =
      getNumber("png-consumption");

    if (
      !Number.isFinite(png) ||
      png < 0
    ) {
      return {
        valid: false,
        field: "png-consumption",
        message:
          "Please enter a valid annual PNG consumption."
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
      getRequiredNumber(
        "vehicle-distance"
      );


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


    const efficiency =
      getRequiredNumber(
        "vehicle-efficiency"
      );


    if (
      !Number.isFinite(efficiency) ||
      efficiency <= 0
    ) {
      return {
        valid: false,
        field: "vehicle-efficiency",
        message:
          "Please enter a vehicle efficiency greater than zero."
      };
    }


    const occupancy =
      getRequiredNumber(
        "vehicle-occupancy"
      );


    if (
      !Number.isFinite(occupancy) ||
      occupancy < 1 ||
      occupancy > 20
    ) {
      return {
        valid: false,
        field: "vehicle-occupancy",
        message:
          "Vehicle occupancy must be between 1 and 20 people."
      };
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
    getRequiredNumber(
      "electricity"
    );


  const solar =
    getNumber("solar");


  /* ----------------------------------------------------------
     Calculate categories
     ---------------------------------------------------------- */

  const energy =
    calculateEnergyEmissions(
      electricity,
      solar
    );


  const transport =
    calculateTransportationEmissions();


  const food =
    calculateFoodEmissions();


  const waste =
    calculateWasteEmissions();


  const total =
    energy +
    transport +
    food +
    waste;


  if (
    !Number.isFinite(total)
  ) {
    console.error(
      "CarbonLens: calculation produced an invalid total."
    );

    return null;
  }


  return {
    total: sanitizeNumber(total),

    energy: sanitizeNumber(energy),

    transport: sanitizeNumber(
      transport
    ),

    food: sanitizeNumber(food),

    waste: sanitizeNumber(waste),

    householdSize
  };
}


/* ============================================================
   15. ENERGY CALCULATION
   ============================================================ */

function calculateEnergyEmissions(
  electricity,
  solar
) {

  let emissions = 0;


  /* ----------------------------------------------------------
     Grid electricity
     
     The emission-factor file defines solar generation as
     operationally zero and specifies that solar generation
     reduces the electricity attributable to the grid.
     ---------------------------------------------------------- */

  const gridElectricity =
    Math.max(
      electricity - solar,
      0
    );


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
      getNumber(
        "png-consumption"
      );


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
      getNumber(
        "vehicle-distance"
      );


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


  const perPerson =
    result.householdSize > 0
      ? total /
        result.householdSize
      : total;


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
      perPerson,
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


  updateBreakdownBars(
    result
  );


  updateResultSummary(
    total
  );


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
   22. RESULT SUMMARY
   ============================================================ */

function updateResultSummary(
  total
) {

  if (!resultSummary) {
    return;
  }


  const tonnes =
    total / 1000;


  let message;


  if (tonnes < 2) {

    message =
      "Your estimated annual footprint is relatively low. Focus on the categories where your emissions are highest and look for practical reductions.";

  } else if (tonnes < 5) {

    message =
      "Your estimated footprint is moderate. Reducing energy use, private transport and high-emission food choices can make a meaningful difference.";

  } else if (tonnes < 10) {

    message =
      "Your estimated footprint is substantial. Transportation, energy and consumption patterns are likely areas worth examining closely.";

  } else {

    message =
      "Your estimated footprint is high. Start with the largest categories in your breakdown and prioritize changes that can reduce emissions significantly.";
  }


  resultSummary.textContent =
    message;
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
  calculateFootprint,
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
