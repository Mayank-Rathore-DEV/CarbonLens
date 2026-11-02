/*
 * ============================================================
 * CarbonLens — Emission Factors
 * ============================================================
 *
 * Purpose:
 *   Stores all emission factors used by CarbonLens.
 *
 * Important:
 *   app.js should perform calculations.
 *   This file should only contain:
 *     - emission factors
 *     - units
 *     - source information
 *     - methodology metadata
 *
 * Main output unit:
 *   kgCO2e
 *
 * ============================================================
 */


/* ============================================================
   GLOBAL METADATA
   ============================================================ */

const EMISSION_FACTORS = {

  metadata: {

    calculatorName: "CarbonLens",

    calculatorVersion: "1.0.0",

    referenceYear: 2026,

    defaultRegion: "India",

    outputUnit: "kgCO2e",

    methodology:
      "Activity data multiplied by category-specific emission factors.",

    importantNote:
      "Results are estimates. Emission factors vary by geography, " +
      "technology, fuel composition, supply chain, system boundary, " +
      "and reference year."

  },


  /* ==========================================================
     HOUSEHOLD ENERGY
     ========================================================== */

  energy: {

     /*
 * India electricity grid factor
 *
 * CEA V22.0
 * FY 2025-26
 *
 * 0.6751 kgCO2/kWh
 */
     

    electricity: {

      factor: 0.6751,

      unit: "kgCO2/kWh",

      basis: "electricity consumption",

      region: "India",
       
      referenceYear: "FY 2025-26",

      source:
       "Central Electricity Authority — CO2 Baseline Database for the Indian Power Sector V22.0",

      sourceUrl:
        "https://cea.nic.in/cdm-co2-baseline-database/",

      notes:
        "All-India weighted-average grid emission rate including renewable and captive generation."

    },


    /*
     * Solar electricity
     *
     * Solar generation is NOT assigned a negative emission
     * factor here.
     *
     * Solar generation is handled in app.js by reducing the
     * grid electricity attributable to the household.
     */

    solar: {

      factor: 0,

      unit: "kgCO2e/kWh",

      basis: "on-site solar generation",

      region: "India",

      notes:
        "Operational emissions are treated as zero for this calculator. " +
        "Embodied lifecycle emissions are outside this calculator boundary."

    },


    /*
     * LPG
     *
     * Approximate direct-combustion factor.
     *
     * LPG composition varies, therefore this should not be
     * interpreted as an exact lifecycle factor.
     */

    lpg: {

      factor: 3.00,

      unit: "kgCO2e/kg LPG",

      basis: "fuel combustion",

      region: "India",

      referenceYear: 2026,

      source:
        "Approximate LPG combustion factor based on carbon content and standard combustion accounting.",

      notes:
        "Does not represent the complete lifecycle of LPG."

    },


    /*
     * PNG
     *
     * The HTML currently does not specify a physical unit
     * for PNG consumption.
     *
     * We standardise this internally as standard cubic metre.
     *
     * IMPORTANT:
     * app.js must interpret pngConsumption as Sm3.
     */

    png: {

      factor: 2.00,

      unit: "kgCO2e/Sm3",

      basis: "natural gas combustion",

      region: "India",

      referenceYear: 2026,

      source:
        "Natural gas combustion estimate based on standard natural-gas carbon content.",

      notes:
        "The actual factor can vary with gas composition and supplier."

    }

  },


  /* ==========================================================
     PRIVATE TRANSPORTATION
     ========================================================== */

  transportation: {

    /*
     * Petrol
     *
     * Fuel-based calculation:
     *
     * litres consumed × kgCO2e/litre
     */

    "petrol-car": {

      fuelType: "petrol",

      calculationBasis: "fuel",

      factor: 2.31,

      unit: "kgCO2e/litre",

      region: "India",

      referenceYear: 2026,

      source:
        "Standard petrol combustion emission factor.",

      notes:
        "Tailpipe-oriented fuel factor; upstream fuel production is not separately modelled."

    },


    /*
     * Diesel
     */

    "diesel-car": {

      fuelType: "diesel",

      calculationBasis: "fuel",

      factor: 2.68,

      unit: "kgCO2e/litre",

      region: "India",

      referenceYear: 2026,

      source:
        "Standard diesel combustion emission factor.",

      notes:
        "Tailpipe-oriented fuel factor; upstream fuel production is not separately modelled."

    },


    /*
     * CNG
     *
     * Efficiency should be interpreted as:
     *
     * km/kg
     *
     * NOT km/litre.
     *
     * app.js should update the displayed unit when CNG
     * is selected.
     */

    "cng-car": {

      fuelType: "cng",

      calculationBasis: "fuel",

      factor: 2.75,

      unit: "kgCO2e/kg CNG",

      efficiencyUnit: "km/kg",

      region: "India",

      referenceYear: 2026,

      source:
        "Natural-gas combustion estimate.",

      notes:
        "Actual CNG composition and methane leakage can change lifecycle emissions."

    },


    /*
     * Petrol motorcycle / scooter
     *
     * Uses the same petrol fuel factor because the user's
     * vehicle efficiency determines how much fuel is consumed.
     */

    "petrol-bike": {

      fuelType: "petrol",

      calculationBasis: "fuel",

      factor: 2.31,

      unit: "kgCO2e/litre",

      efficiencyUnit: "km/litre",

      region: "India",

      referenceYear: 2026,

      source:
        "Standard petrol combustion emission factor."

    },


    /*
     * Electric vehicle
     *
     * EV emissions are based on electricity consumed.
     *
     * distance / efficiency
     *
     * where efficiency is:
     *
     * km/kWh
     *
     * Then:
     *
     * electricity × grid factor
     */

    ev: {

      fuelType: "electricity",

      calculationBasis: "electricity",

      factor: 0.7117,

      unit: "kgCO2e/kWh",

      efficiencyUnit: "km/kWh",

      region: "India",

      referenceYear: "FY 2024-25",

      source:
        "Central Electricity Authority — India grid emission factor.",

      sourceUrl:
        "https://cea.nic.in/cdm-co2-baseline-database/",

      notes:
        "Uses the Indian grid factor. Vehicle manufacturing and battery lifecycle emissions are excluded."

    }

  },


  /* ==========================================================
     PUBLIC TRANSPORTATION
     ========================================================== */

  publicTransport: {

    /*
     * Passenger rail
     *
     * kgCO2e per passenger-km
     */

    rail: {

      factor: 0.0080,

      unit: "kgCO2e/passenger-km",

      calculationBasis: "passenger distance",

      region: "India",

      source:
        "India GHG inventory reporting factor derived from DEFRA 2024 conversion factors.",

      notes:
        "Use as an estimate. Actual rail emissions vary by train technology, occupancy and electricity/fuel mix."

    },


    /*
     * City bus
     */

    bus: {

      factor: 0.0152,

      unit: "kgCO2e/passenger-km",

      calculationBasis: "passenger distance",

      region: "India",

      source:
        "India GHG inventory reporting factor derived from DEFRA 2024 conversion factors.",

      notes:
        "Actual bus emissions vary with vehicle type, fuel, route and passenger occupancy."

    }

  },


  /* ==========================================================
     AIR TRAVEL
     ========================================================== */

  flights: {

    /*
     * Domestic flight
     *
     * 125.2 gCO2e/pkm
     *
     * = 0.1252 kgCO2e/pkm
     */

    domestic: {

      factor: 0.1252,

      unit: "kgCO2e/passenger-km",

      calculationBasis: "passenger distance",

      referenceYear: 2026,

      region: "Generic aviation factor",

      source:
        "UK Government 2026 Greenhouse Gas Conversion Factors",

      sourceUrl:
        "https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2026",

      notes:
        "Average domestic passenger aviation factor. This is not India-specific."

    },


    /*
     * International flight
     *
     * 77.8 gCO2e/pkm
     *
     * = 0.0778 kgCO2e/pkm
     */

    international: {

      factor: 0.0778,

      unit: "kgCO2e/passenger-km",

      calculationBasis: "passenger distance",

      referenceYear: 2026,

      region: "International",

      source:
        "UK Government 2026 Greenhouse Gas Conversion Factors",

      sourceUrl:
        "https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2026",

      notes:
        "Average international passenger aviation factor. This factor excludes distance and radiative-forcing uplifts."

    }

  },


  /* ==========================================================
     FOOD
     ========================================================== */

  /*
   * Food factors are lifecycle greenhouse-gas emission
   * estimates from Poore & Nemecek (2018), as published
   * through Our World in Data.
   *
   * Unit:
   *
   * kgCO2e per kg food
   *
   * These are global averages, NOT India-specific factors.
   *
   * They cover emissions across the food supply chain.
   */

  food: {

    beef: {

      factor: 99.48,

      unit: "kgCO2e/kg",

      source:
        "Poore & Nemecek (2018), Our World in Data",

      sourceUrl:
        "https://ourworldindata.org/grapher/food-emissions-supply-chain"

    },


    lamb: {

      factor: 39.72,

      unit: "kgCO2e/kg",

      source:
        "Poore & Nemecek (2018), Our World in Data",

      sourceUrl:
        "https://ourworldindata.org/grapher/food-emissions-supply-chain"

    },


    pork: {

      factor: 12.31,

      unit: "kgCO2e/kg",

      source:
        "Poore & Nemecek (2018), Our World in Data",

      sourceUrl:
        "https://ourworldindata.org/grapher/food-emissions-supply-chain"

    },


    poultry: {

      factor: 9.87,

      unit: "kgCO2e/kg",

      source:
        "Poore & Nemecek (2018), Our World in Data",

      sourceUrl:
        "https://ourworldindata.org/grapher/food-emissions-supply-chain"

    },


    cheese: {

      factor: 23.88,

      unit: "kgCO2e/kg",

      source:
        "Poore & Nemecek (2018), Our World in Data",

      sourceUrl:
        "https://ourworldindata.org/grapher/food-emissions-supply-chain"

    },


    milk: {

      factor: 3.15,

      unit: "kgCO2e/kg",

      source:
        "Poore & Nemecek (2018), Our World in Data",

      sourceUrl:
        "https://ourworldindata.org/grapher/food-emissions-supply-chain"

    },


    eggs: {

      factor: 4.67,

      unit: "kgCO2e/kg",

      source:
        "Poore & Nemecek (2018), Our World in Data",

      sourceUrl:
        "https://ourworldindata.org/grapher/food-emissions-supply-chain"

    },


    rice: {

      factor: 4.45,

      unit: "kgCO2e/kg",

      source:
        "Poore & Nemecek (2018), Our World in Data",

      sourceUrl:
        "https://ourworldindata.org/grapher/food-emissions-supply-chain"

    },


    tofu: {

      factor: 3.16,

      unit: "kgCO2e/kg",

      source:
        "Poore & Nemecek (2018), Our World in Data",

      sourceUrl:
        "https://ourworldindata.org/grapher/food-emissions-supply-chain"

    },


    peas: {

      factor: 0.98,

      unit: "kgCO2e/kg",

      source:
        "Poore & Nemecek (2018), Our World in Data",

      sourceUrl:
        "https://ourworldindata.org/grapher/food-emissions-supply-chain"

    },


    beans: {

      /*
       * Our World in Data lists beans under broader pulse
       * categories. We use the available beans/pulses factor
       * as an estimate rather than claiming an India-specific
       * bean lifecycle factor.
       */

      factor: 1.37,

      unit: "kgCO2e/kg",

      source:
        "Poore & Nemecek (2018), Our World in Data — beans/pulses estimate",

      sourceUrl:
        "https://ourworldindata.org/grapher/food-emissions-supply-chain"

    },


    potatoes: {

      factor: 0.46,

      unit: "kgCO2e/kg",

      source:
        "Poore & Nemecek (2018), Our World in Data",

      sourceUrl:
        "https://ourworldindata.org/grapher/food-emissions-supply-chain"

    },


    rootVegetables: {

      factor: 0.43,

      unit: "kgCO2e/kg",

      source:
        "Poore & Nemecek (2018), Our World in Data",

      sourceUrl:
        "https://ourworldindata.org/grapher/food-emissions-supply-chain"

    },


    bananas: {

      factor: 0.86,

      unit: "kgCO2e/kg",

      source:
        "Poore & Nemecek (2018), Our World in Data",

      sourceUrl:
        "https://ourworldindata.org/grapher/food-emissions-supply-chain"

    },


    apples: {

      factor: 0.43,

      unit: "kgCO2e/kg",

      source:
        "Poore & Nemecek (2018), Our World in Data",

      sourceUrl:
        "https://ourworldindata.org/grapher/food-emissions-supply-chain"

    },


    tomatoes: {

      factor: 2.09,

      unit: "kgCO2e/kg",

      source:
        "Poore & Nemecek (2018), Our World in Data",

      sourceUrl:
        "https://ourworldindata.org/grapher/food-emissions-supply-chain"

    }

  },


  /* ==========================================================
     WASTE
     ========================================================== */

  /*
   * IMPORTANT:
   *
   * Waste factors are much more dependent on:
   *   - landfill vs composting
   *   - methane capture
   *   - waste composition
   *   - transportation
   *   - treatment technology
   *   - country
   *
   * Therefore these are explicitly marked as ESTIMATES.
   *
   * We should eventually give the user waste-treatment
   * options if we want to make this section more rigorous.
   */

  waste: {

    food: {

      factor: 0.4208,

      unit: "kgCO2e/kg",

      calculationBasis: "waste mass",

      source:
        "Published food-waste disposal emission-factor estimate",

      sourceUrl:
        "https://academic.oup.com/",

      confidence:
        "medium",

      notes:
        "Waste-treatment emissions vary substantially by disposal method. This is not an India-specific municipal-waste factor."

    },


    mixed: {

      factor: 0.3338,

      unit: "kgCO2e/kg",

      calculationBasis: "waste mass",

      source:
        "Government waste-emissions methodology estimate",

      sourceUrl:
        "https://measuringemissionsguide.environment.govt.nz/10_materials_waste.html",

      confidence:
        "medium",

      notes:
        "Proxy factor. Actual emissions depend strongly on landfill, recycling, incineration and methane-management practices."

    }

  }

};


/* ============================================================
   VALIDATION
   ============================================================ */

/*
 * Ensures that every emission factor intended for calculation
 * is actually numeric and non-negative.
 *
 * This runs once when the file loads.
 */

function validateEmissionFactors() {

  const errors = [];


  function checkFactor(object, path) {

    if (!object || typeof object !== "object") {
      return;
    }


    if (
      Object.prototype.hasOwnProperty.call(object, "factor")
    ) {

      if (
        typeof object.factor !== "number" ||
        !Number.isFinite(object.factor) ||
        object.factor < 0
      ) {

        errors.push(
          `${path}.factor must be a finite non-negative number.`
        );

      }

    }


    Object.entries(object).forEach(
      ([key, value]) => {

        if (
          value &&
          typeof value === "object" &&
          key !== "metadata"
        ) {

          checkFactor(
            value,
            `${path}.${key}`
          );

        }

      }
    );

  }


  checkFactor(
    EMISSION_FACTORS,
    "EMISSION_FACTORS"
  );


  if (errors.length > 0) {

    console.error(
      "CarbonLens emission-factor validation failed:",
      errors
    );

    return false;

  }


  return true;

}


/* ============================================================
   HELPER FUNCTIONS
   ============================================================ */

/*
 * Returns an emission factor from a category.
 *
 * Example:
 *
 * getEmissionFactor(
 *   EMISSION_FACTORS.food,
 *   "rice"
 * )
 *
 */

function getEmissionFactor(category, key) {

  if (
    !category ||
    !Object.prototype.hasOwnProperty.call(category, key)
  ) {

    return null;

  }


  const entry = category[key];


  if (
    !entry ||
    typeof entry.factor !== "number"
  ) {

    return null;

  }


  return entry.factor;

}


/*
 * Returns the complete metadata object for a factor.
 */

function getEmissionFactorData(category, key) {

  if (
    !category ||
    !Object.prototype.hasOwnProperty.call(category, key)
  ) {

    return null;

  }


  return category[key];

}


/* ============================================================
   FREEZE DATA
   ============================================================ */

/*
 * Prevent accidental changes to emission factors at runtime.
 *
 * This is shallow-freezing the top-level object.
 * The actual factor data should be treated as read-only.
 */

Object.freeze(EMISSION_FACTORS);


/* ============================================================
   RUN VALIDATION
   ============================================================ */

validateEmissionFactors();
