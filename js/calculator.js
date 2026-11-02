/* ============================================================
   CARBONLENS
   Personal Carbon Footprint Calculator

   FILE:
   calculator.js

   STATUS: LEGACY / EXPERIMENTAL — NOT USED BY THE CURRENT APP

   The live website calculator is implemented in app.js.
   The Expo mobile calculator uses mobile/src/lib/calculator.ts.
   This older module is not loaded by index.html or the mobile app,
   is not covered by the current test suite, and must not be treated
   as an authoritative calculation engine until it is refactored
   against the current factor register and covered by tests.

   PURPOSE (original):
   ------------------------------------------------------------
   This file converts user activity data into estimated
   greenhouse-gas emissions.

   Responsibilities:
   - validate input
   - normalize input
   - perform calculations
   - use emission factors from emissionFactors.js
   - return structured results

   NOT responsible for:
   - DOM manipulation
   - displaying results
   - animations
   - charts
   - event listeners

   ============================================================ */

"use strict";

import {
    EMISSION_FACTORS
} from "./emissionFactors.js";


/* ============================================================
   01. CONSTANTS
   ============================================================ */

const MONTHS_PER_YEAR = 12;
const DAYS_PER_YEAR = 365;
const KG_PER_TONNE = 1000;


/* ============================================================
   02. BASIC NUMBER UTILITIES
   ============================================================ */

/*
 * Convert user input into a safe number.
 *
 * Examples:
 *
 * "5000" → 5000
 * ""     → 0
 * null   → 0
 * "abc"  → 0
 * -20    → 0
 */

function toNumber(value) {

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return 0;
    }

    return number;

}


/*
 * Emissions and activity data cannot be negative.
 */

function toNonNegativeNumber(value) {

    return Math.max(
        toNumber(value),
        0
    );

}


/*
 * Prevent invalid household sizes.
 */

function normalizeHouseholdSize(value) {

    const householdSize =
        Math.floor(
            toNonNegativeNumber(value)
        );

    return Math.max(
        householdSize,
        1
    );

}


/* ============================================================
   03. ROUNDING
   ============================================================ */

/*
 * Internal calculations retain full precision.
 *
 * We only round when creating values for presentation.
 */

function round(value, decimals = 2) {

    if (!Number.isFinite(value)) {
        return 0;
    }

    const multiplier =
        10 ** decimals;

    return Math.round(
        value * multiplier
    ) / multiplier;

}


/* ============================================================
   04. RESULT HELPERS
   ============================================================ */

function createResult({

    emissions = 0,

    activity = 0,

    activityUnit = null,

    factor = null,

    factorUnit = null,

    source = null,

    status = "calculated",

    note = null

}) {

    return {

        emissions:
            Math.max(
                emissions,
                0
            ),

        activity,

        activityUnit,

        factor,

        factorUnit,

        source,

        status,

        note

    };

}


/*
 * Used when a category has no activity.
 */

function zeroResult(note = null) {

    return createResult({

        emissions: 0,

        activity: 0,

        status: "not-used",

        note

    });

}


/*
 * Used when the calculator cannot safely calculate a category.
 *
 * We return the problem instead of silently producing a
 * potentially incorrect number.
 */

function unsupportedResult(note) {

    return createResult({

        emissions: 0,

        status: "unsupported",

        note

    });

}


/* ============================================================
   05. ELECTRICITY
   ============================================================ */

/*
 * INPUT:
 *
 * annual household electricity:
 * kWh/year
 *
 * solar generation:
 * kWh/year
 *
 *
 * MODEL:
 *
 * Net grid electricity =
 *
 * max(
 *     household electricity - solar generation,
 *     0
 * )
 *
 *
 * Grid emissions =
 *
 * net grid electricity ×
 * grid emission factor
 *
 *
 * IMPORTANT:
 *
 * Solar is treated as displacement of grid electricity.
 *
 * We are NOT assigning a negative lifecycle emission value to
 * solar generation.
 */

function calculateElectricity(
    annualElectricity,
    annualSolar
) {

    const electricity =
        toNonNegativeNumber(
            annualElectricity
        );

    const solar =
        toNonNegativeNumber(
            annualSolar
        );


    const netGridElectricity =
        Math.max(
            electricity - solar,
            0
        );


    const factor =
        EMISSION_FACTORS
            .electricity
            .gridIndia2024_25
            .value;


    const emissions =
        netGridElectricity *
        factor;


    return createResult({

        emissions,

        activity:
            netGridElectricity,

        activityUnit:
            "kWh/year",

        factor,

        factorUnit:
            "kgCO2/kWh",

        source:
            EMISSION_FACTORS
                .electricity
                .gridIndia2024_25
                .source,

        note:
            "Operational grid-electricity emissions. Solar generation is treated as displacement of grid electricity."

    });

}


/* ============================================================
   06. LPG
   ============================================================ */

/*
 * INPUT:
 *
 * domestic LPG cylinders/year
 *
 * CarbonLens assumes:
 *
 * 1 cylinder = 14.2 kg LPG
 *
 *
 * MODEL:
 *
 * cylinders
 * ×
 * 14.2 kg LPG/cylinder
 * ×
 * 3.13 kgCO2/kg LPG
 */

function calculateLPG(
    cylinders
) {

    const numberOfCylinders =
        toNonNegativeNumber(
            cylinders
        );


    if (
        numberOfCylinders === 0
    ) {

        return zeroResult();

    }


    const cylinderMass =
        EMISSION_FACTORS
            .lpg
            .standardDomesticCylinder
            .value;


    const factor =
        EMISSION_FACTORS
            .lpg
            .combustion
            .value;


    const fuelConsumed =
        numberOfCylinders *
        cylinderMass;


    const emissions =
        fuelConsumed *
        factor;


    return createResult({

        emissions,

        activity:
            fuelConsumed,

        activityUnit:
            "kg LPG/year",

        factor,

        factorUnit:
            "kgCO2/kg LPG",

        source:
            EMISSION_FACTORS
                .lpg
                .combustion
                .source,

        note:
            `${cylinderMass} kg LPG per standard domestic cylinder. Direct combustion CO2.`

    });

}


/* ============================================================
   07. PNG
   ============================================================ */

/*
 * IMPORTANT:
 *
 * The current emissionFactors.js does NOT contain a validated
 * India-specific PNG factor with a compatible input unit.
 *
 * Therefore this calculator does NOT calculate PNG yet.
 *
 * Returning "unsupported" is intentional.
 *
 * This prevents:
 *
 * m3 × kgCO2/kg
 *
 * which would be dimensionally wrong.
 */

function calculatePNG(
    annualPNG
) {

    const consumption =
        toNonNegativeNumber(
            annualPNG
        );


    if (
        consumption === 0
    ) {

        return zeroResult();

    }


    return unsupportedResult(
        "PNG calculation is temporarily disabled because the current factor registry does not contain a validated factor with a compatible activity unit."
    );

}


/* ============================================================
   08. PETROL VEHICLE
   ============================================================ */

/*
 * INPUT:
 *
 * distance:
 * km/year
 *
 * efficiency:
 * km/litre
 *
 * occupancy:
 * people
 *
 *
 * STEP 1:
 *
 * litres =
 *
 * distance / efficiency
 *
 *
 * STEP 2:
 *
 * vehicle emissions =
 *
 * litres × petrol factor
 *
 *
 * STEP 3:
 *
 * user's allocated share =
 *
 * vehicle emissions / occupancy
 */

function calculatePetrolVehicle({

    distanceKm,

    efficiencyKmPerLitre,

    occupancy = 1

}) {

    const distance =
        toNonNegativeNumber(
            distanceKm
        );


    const efficiency =
        toNonNegativeNumber(
            efficiencyKmPerLitre
        );


    const people =
        Math.max(
            toNonNegativeNumber(
                occupancy
            ),
            1
        );


    if (
        distance === 0
    ) {

        return zeroResult();

    }


    if (
        efficiency <= 0
    ) {

        return unsupportedResult(
            "Petrol vehicle efficiency must be greater than zero."
        );

    }


    const fuelConsumed =
        distance /
        efficiency;


    const factor =
        EMISSION_FACTORS
            .petrol
            .combustion
            .value;


    const vehicleEmissions =
        fuelConsumed *
        factor;


    const personalEmissions =
        vehicleEmissions /
        people;


    return createResult({

        emissions:
            personalEmissions,

        activity:
            distance,

        activityUnit:
            "km/year",

        factor,

        factorUnit:
            "kgCO2/litre",

        source:
            EMISSION_FACTORS
                .petrol
                .combustion
                .source,

        note:
            `Estimated from ${round(fuelConsumed, 2)} litres/year and ${people} person(s) per vehicle.`

    });

}


/* ============================================================
   09. DIESEL VEHICLE
   ============================================================ */

function calculateDieselVehicle({

    distanceKm,

    efficiencyKmPerLitre,

    occupancy = 1

}) {

    const distance =
        toNonNegativeNumber(
            distanceKm
        );


    const efficiency =
        toNonNegativeNumber(
            efficiencyKmPerLitre
        );


    const people =
        Math.max(
            toNonNegativeNumber(
                occupancy
            ),
            1
        );


    if (
        distance === 0
    ) {

        return zeroResult();

    }


    if (
        efficiency <= 0
    ) {

        return unsupportedResult(
            "Diesel vehicle efficiency must be greater than zero."
        );

    }


    const fuelConsumed =
        distance /
        efficiency;


    const factor =
        EMISSION_FACTORS
            .diesel
            .combustion
            .value;


    const vehicleEmissions =
        fuelConsumed *
        factor;


    const personalEmissions =
        vehicleEmissions /
        people;


    return createResult({

        emissions:
            personalEmissions,

        activity:
            distance,

        activityUnit:
            "km/year",

        factor,

        factorUnit:
            "kgCO2/litre",

        source:
            EMISSION_FACTORS
                .diesel
                .combustion
                .source,

        note:
            `Estimated from ${round(fuelConsumed, 2)} litres/year and ${people} person(s) per vehicle.`

    });

}


/* ============================================================
   10. CNG VEHICLE
   ============================================================ */

/*
 * CNG is intentionally disabled.
 *
 * Reason:
 *
 * The available factor is expressed per litre of CNG while
 * normal CNG vehicle activity data may be entered in kg,
 * kg-equivalent or fuel-volume units depending on the source.
 *
 * Without a documented conversion, calculation would be wrong.
 */

function calculateCNGVehicle({

    distanceKm,

    efficiency,

    occupancy = 1

}) {

    const distance =
        toNonNegativeNumber(
            distanceKm
        );


    if (
        distance === 0
    ) {

        return zeroResult();

    }


    return unsupportedResult(
        "CNG calculation is temporarily disabled because the stored CNG factor and vehicle-efficiency unit are not safely compatible."
    );

}


/* ============================================================
   11. ELECTRIC VEHICLE
   ============================================================ */

/*
 * INPUT:
 *
 * distance:
 * km/year
 *
 * efficiency:
 * km/kWh
 *
 * occupancy:
 * people
 *
 *
 * STEP 1:
 *
 * electricity =
 *
 * distance / km-per-kWh
 *
 *
 * STEP 2:
 *
 * vehicle electricity emissions =
 *
 * electricity × Indian grid factor
 *
 *
 * STEP 3:
 *
 * personal allocation =
 *
 * vehicle emissions / occupancy
 *
 *
 * BOUNDARY:
 *
 * Operational electricity only.
 *
 * Not included:
 *
 * - battery manufacturing
 * - vehicle manufacturing
 * - battery disposal
 * - upstream electricity lifecycle emissions
 */

function calculateElectricVehicle({

    distanceKm,

    efficiencyKmPerKWh,

    occupancy = 1

}) {

    const distance =
        toNonNegativeNumber(
            distanceKm
        );


    const efficiency =
        toNonNegativeNumber(
            efficiencyKmPerKWh
        );


    const people =
        Math.max(
            toNonNegativeNumber(
                occupancy
            ),
            1
        );


    if (
        distance === 0
    ) {

        return zeroResult();

    }


    if (
        efficiency <= 0
    ) {

        return unsupportedResult(
            "EV efficiency must be greater than zero."
        );

    }


    const electricityUsed =
        distance /
        efficiency;


    const factor =
        EMISSION_FACTORS
            .electricity
            .gridIndia2024_25
            .value;


    const vehicleEmissions =
        electricityUsed *
        factor;


    const personalEmissions =
        vehicleEmissions /
        people;


    return createResult({

        emissions:
            personalEmissions,

        activity:
            distance,

        activityUnit:
            "km/year",

        factor,

        factorUnit:
            "kgCO2/kWh",

        source:
            EMISSION_FACTORS
                .electricity
                .gridIndia2024_25
                .source,

        note:
            `Operational charging emissions estimated from ${round(electricityUsed, 2)} kWh/year and ${people} person(s) per vehicle.`

    });

}


/* ============================================================
   12. PRIVATE VEHICLE ROUTER
   ============================================================ */

function calculatePrivateVehicle(data) {

    if (
        data.privateVehicle !== "yes"
    ) {

        return zeroResult(
            "No private vehicle selected."
        );

    }


    switch (
        data.vehicleType
    ) {

        case "petrol-car":

            return calculatePetrolVehicle({

                distanceKm:
                    data.vehicleDistance,

                efficiencyKmPerLitre:
                    data.vehicleEfficiency,

                occupancy:
                    data.vehicleOccupancy

            });


        case "diesel-car":

            return calculateDieselVehicle({

                distanceKm:
                    data.vehicleDistance,

                efficiencyKmPerLitre:
                    data.vehicleEfficiency,

                occupancy:
                    data.vehicleOccupancy

            });


        case "petrol-bike":

            return calculatePetrolVehicle({

                distanceKm:
                    data.vehicleDistance,

                efficiencyKmPerLitre:
                    data.vehicleEfficiency,

                occupancy:
                    data.vehicleOccupancy

            });


        case "cng-car":

            return calculateCNGVehicle({

                distanceKm:
                    data.vehicleDistance,

                efficiency:
                    data.vehicleEfficiency,

                occupancy:
                    data.vehicleOccupancy

            });


        case "ev":

            return calculateElectricVehicle({

                distanceKm:
                    data.vehicleDistance,

                efficiencyKmPerKWh:
                    data.vehicleEfficiency,

                occupancy:
                    data.vehicleOccupancy

            });


        default:

            return zeroResult(
                "No private vehicle type selected."
            );

    }

}


/* ============================================================
   13. PUBLIC TRANSPORT
   ============================================================ */

/*
 * Public transport is entered as passenger-km/year.
 *
 * Passenger-km already includes the passenger component.
 *
 * Therefore:
 *
 * DO NOT divide by occupancy.
 */

function calculatePublicTransport({

    railDistance = 0,

    busDistance = 0

}) {

    const rail =
        toNonNegativeNumber(
            railDistance
        );


    const bus =
        toNonNegativeNumber(
            busDistance
        );


    /* --------------------------------------------------------
       RAIL
       -------------------------------------------------------- */

    const railFactor =
        EMISSION_FACTORS
            .rail
            .nonSuburban
            .value;


    const railEmissions =
        rail *
        railFactor;


    /* --------------------------------------------------------
       BUS
       -------------------------------------------------------- */

    const busFactor =
        EMISSION_FACTORS
            .bus
            .factor
            .value;


    const busEmissions =
        bus *
        busFactor;


    return {

        rail:
            createResult({

                emissions:
                    railEmissions,

                activity:
                    rail,

                activityUnit:
                    "passenger-km/year",

                factor:
                    railFactor,

                factorUnit:
                    "kgCO2/passenger-km",

                source:
                    EMISSION_FACTORS
                        .rail
                        .nonSuburban
                        .source

            }),


        bus:
            createResult({

                emissions:
                    busEmissions,

                activity:
                    bus,

                activityUnit:
                    "passenger-km/year",

                factor:
                    busFactor,

                factorUnit:
                    "kgCO2/passenger-km",

                source:
                    EMISSION_FACTORS
                        .bus
                        .factor
                        .source

            }),


        emissions:
            railEmissions +
            busEmissions

    };

}


/* ============================================================
   14. AVIATION
   ============================================================ */

/*
 * Aviation remains explicitly marked as an estimate.
 *
 * The factor currently available is passenger-km based.
 *
 * We therefore do:
 *
 * passenger-km × factor
 */

function calculateAviation({

    domesticPassengerKm = 0,

    internationalPassengerKm = 0

}) {

    const domestic =
        toNonNegativeNumber(
            domesticPassengerKm
        );


    const international =
        toNonNegativeNumber(
            internationalPassengerKm
        );


    if (
        domestic === 0 &&
        international === 0
    ) {

        return {

            domestic:
                zeroResult(),

            international:
                zeroResult(),

            emissions:
                0

        };

    }


    const factor =
        EMISSION_FACTORS
            .aviation
            .domestic
            .value;


    const domesticEmissions =
        domestic *
        factor;


    /*
     * No separate international factor is currently present
     * in the factor registry.
     *
     * We therefore do NOT pretend the domestic factor is
     * automatically an international factor.
     */

    let internationalResult =
        zeroResult();


    if (
        international > 0
    ) {

        internationalResult =
            unsupportedResult(
                "International aviation is not calculated until a separately documented international aviation factor is added."
            );

    }


    return {

        domestic:

            createResult({

                emissions:
                    domesticEmissions,

                activity:
                    domestic,

                activityUnit:
                    "passenger-km/year",

                factor,

                factorUnit:
                    "kgCO2e/passenger-km",

                source:
                    EMISSION_FACTORS
                        .aviation
                        .domestic
                        .source,

                status:
                    "estimated",

                note:
                    "Domestic aviation estimate. Route, aircraft, cabin class and other aviation variables are not individually modeled."

            }),


        international:
            internationalResult,


        emissions:
            domesticEmissions

    };

}


/* ============================================================
   15. FOOD
   ============================================================ */

/*
 * IMPORTANT METHODOLOGICAL RULE
 *
 * Food factors are lifecycle factors.
 *
 * They are NOT direct combustion factors.
 *
 * Each food category must therefore have its own factor.
 *
 *
 * INPUT:
 *
 * kg of food/year
 *
 * OUTPUT:
 *
 * kgCO2e/year
 */


/*
 * Generic food-item calculation.
 */

function calculateFoodItem(
    kilograms,
    factorDefinition
) {

    const amount =
        toNonNegativeNumber(
            kilograms
        );


    if (
        amount === 0
    ) {

        return zeroResult();

    }


    const factor =
        factorDefinition.value;


    const emissions =
        amount *
        factor;


    return createResult({

        emissions,

        activity:
            amount,

        activityUnit:
            "kg food/year",

        factor,

        factorUnit:
            "kgCO2e/kg food",

        source:
            factorDefinition.source,

        note:
            factorDefinition.notes ||
            factorDefinition.boundary

    });

}


/*
 * Calculate the food categories that actually exist in the
 * input.
 *
 * IMPORTANT:
 *
 * We don't force every user to enter every food type.
 */

function calculateFood({

    beefKg = 0,

    lambKg = 0,

    porkKg = 0,

    poultryKg = 0,

    cheeseKg = 0,

    milkKg = 0,

    eggsKg = 0,

    riceKg = 0,

    tofuKg = 0,

    peasKg = 0,

    beansKg = 0,

    potatoesKg = 0,

    rootVegetablesKg = 0,

    bananasKg = 0,

    applesKg = 0,

    tomatoesKg = 0

}) {

    const results = {

        beef:
            calculateFoodItem(
                beefKg,
                EMISSION_FACTORS.food.beef
            ),

        lamb:
            calculateFoodItem(
                lambKg,
                EMISSION_FACTORS.food.lamb
            ),

        pork:
            calculateFoodItem(
                porkKg,
                EMISSION_FACTORS.food.pork
            ),

        poultry:
            calculateFoodItem(
                poultryKg,
                EMISSION_FACTORS.food.poultry
            ),

        cheese:
            calculateFoodItem(
                cheeseKg,
                EMISSION_FACTORS.food.cheese
            ),

        milk:
            calculateFoodItem(
                milkKg,
                EMISSION_FACTORS.food.milk
            ),

        eggs:
            calculateFoodItem(
                eggsKg,
                EMISSION_FACTORS.food.eggs
            ),

        rice:
            calculateFoodItem(
                riceKg,
                EMISSION_FACTORS.food.rice
            ),

        tofu:
            calculateFoodItem(
                tofuKg,
                EMISSION_FACTORS.food.tofu
            ),

        peas:
            calculateFoodItem(
                peasKg,
                EMISSION_FACTORS.food.peas
            ),

        beans:
            calculateFoodItem(
                beansKg,
                EMISSION_FACTORS.food.beans
            ),

        potatoes:
            calculateFoodItem(
                potatoesKg,
                EMISSION_FACTORS.food.potatoes
            ),

        rootVegetables:
            calculateFoodItem(
                rootVegetablesKg,
                EMISSION_FACTORS.food.rootVegetables
            ),

        bananas:
            calculateFoodItem(
                bananasKg,
                EMISSION_FACTORS.food.bananas
            ),

        apples:
            calculateFoodItem(
                applesKg,
                EMISSION_FACTORS.food.apples
            ),

        tomatoes:
            calculateFoodItem(
                tomatoesKg,
                EMISSION_FACTORS.food.tomatoes
            )

    };


    const emissions =
        Object.values(results)
            .reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    item.emissions,
                0
            );


    return {

        ...results,

        emissions

    };

}


/* ============================================================
   16. FOOD WASTE
   ============================================================ */

/*
 * No universal factor is currently used.
 *
 * This avoids double-counting food production emissions or
 * making assumptions about landfill / compost / anaerobic
 * digestion pathways.
 */

function calculateFoodWaste(
    foodWasteKg
) {

    const amount =
        toNonNegativeNumber(
            foodWasteKg
        );


    if (
        amount === 0
    ) {

        return zeroResult();

    }


    return unsupportedResult(
        "Food-waste emissions require information about the food type and disposal pathway."
    );

}


/* ============================================================
   17. GENERAL WASTE
   ============================================================ */

function calculateWaste(
    mixedWasteKg
) {

    const amount =
        toNonNegativeNumber(
            mixedWasteKg
        );


    if (
        amount === 0
    ) {

        return zeroResult();

    }


    return unsupportedResult(
        "General-waste emissions require material type and disposal/recycling pathway."
    );

}


/* ============================================================
   18. CATEGORY AGGREGATION
   ============================================================ */

function sumEmissions(...results) {

    return results.reduce(

        (
            total,
            result
        ) => {

            if (
                result &&
                Number.isFinite(
                    result.emissions
                )
            ) {

                return (
                    total +
                    result.emissions
                );

            }

            return total;

        },

        0

    );

}


/* ============================================================
   19. DATA NORMALIZATION
   ============================================================ */

/*
 * This function creates one predictable internal data object.
 *
 * That means the rest of the calculator does not care whether
 * the value came from:
 *
 * - an HTML input
 * - FormData
 * - another JavaScript object
 * - future localStorage data
 */

function normalizeInput(
    data = {}
) {

    return {

        householdSize:
            normalizeHouseholdSize(
                data.householdSize
            ),


        /* ENERGY */

        electricity:
            toNonNegativeNumber(
                data.electricity
            ),

        solar:
            toNonNegativeNumber(
                data.solar
            ),

        cookingFuel:
            data.cookingFuel || "",

        lpgCylinders:
            toNonNegativeNumber(
                data.lpgCylinders
            ),

        pngConsumption:
            toNonNegativeNumber(
                data.pngConsumption
            ),


        /* PRIVATE TRANSPORT */

        privateVehicle:
            data.privateVehicle || "no",

        vehicleType:
            data.vehicleType || "",

        vehicleDistance:
            toNonNegativeNumber(
                data.vehicleDistance
            ),

        vehicleEfficiency:
            toNonNegativeNumber(
                data.vehicleEfficiency
            ),

        vehicleOccupancy:
            Math.max(
                toNonNegativeNumber(
                    data.vehicleOccupancy
                ),
                1
            ),


        /* PUBLIC TRANSPORT */

        railDistance:
            toNonNegativeNumber(
                data.railDistance
            ),

        busDistance:
            toNonNegativeNumber(
                data.busDistance
            ),


        /* AVIATION */

        domesticFlightDistance:
            toNonNegativeNumber(
                data.domesticFlightDistance
            ),

        internationalFlightDistance:
            toNonNegativeNumber(
                data.internationalFlightDistance
            ),


        /* FOOD */

        beefKg:
            toNonNegativeNumber(
                data.beefKg
            ),

        lambKg:
            toNonNegativeNumber(
                data.lambKg
            ),

        porkKg:
            toNonNegativeNumber(
                data.porkKg
            ),

        poultryKg:
            toNonNegativeNumber(
                data.poultryKg
            ),

        cheeseKg:
            toNonNegativeNumber(
                data.cheeseKg
            ),

        milkKg:
            toNonNegativeNumber(
                data.milkKg
            ),

        eggsKg:
            toNonNegativeNumber(
                data.eggsKg
            ),

        riceKg:
            toNonNegativeNumber(
                data.riceKg
            ),

        tofuKg:
            toNonNegativeNumber(
                data.tofuKg
            ),

        peasKg:
            toNonNegativeNumber(
                data.peasKg
            ),

        beansKg:
            toNonNegativeNumber(
                data.beansKg
            ),

        potatoesKg:
            toNonNegativeNumber(
                data.potatoesKg
            ),

        rootVegetablesKg:
            toNonNegativeNumber(
                data.rootVegetablesKg
            ),

        bananasKg:
            toNonNegativeNumber(
                data.bananasKg
            ),

        applesKg:
            toNonNegativeNumber(
                data.applesKg
            ),

        tomatoesKg:
            toNonNegativeNumber(
                data.tomatoesKg
            ),


        /* WASTE */

        foodWasteKg:
            toNonNegativeNumber(
                data.foodWasteKg
            ),

        mixedWasteKg:
            toNonNegativeNumber(
                data.mixedWasteKg
            )

    };

}


/* ============================================================
   20. MAIN CALCULATOR
   ============================================================ */

function calculateCarbonFootprint(
    rawData = {}
) {

    const data =
        normalizeInput(
            rawData
        );


    /* --------------------------------------------------------
       ENERGY
       -------------------------------------------------------- */

    const electricity =
        calculateElectricity(

            data.electricity,

            data.solar

        );


    let cookingFuelResult =
        zeroResult(
            "No cooking-fuel emissions calculated."
        );


    switch (
        data.cookingFuel
    ) {

        case "lpg":

            cookingFuelResult =
                calculateLPG(
                    data.lpgCylinders
                );

            break;


        case "png":

            cookingFuelResult =
                calculatePNG(
                    data.pngConsumption
                );

            break;


        case "electric":

            /*
             * Electricity used for cooking is already included
             * in household electricity consumption.
             *
             * Therefore we do NOT add another electricity
             * calculation here.
             */

            cookingFuelResult =
                zeroResult(
                    "Electric cooking is already represented by household electricity consumption."
                );

            break;


        case "none":

            cookingFuelResult =
                zeroResult(
                    "No primary cooking fuel selected."
                );

            break;


        default:

            cookingFuelResult =
                zeroResult(
                    "No cooking fuel selected."
                );

    }


    const energyEmissions =
        sumEmissions(

            electricity,

            cookingFuelResult

        );


    /* --------------------------------------------------------
       PRIVATE TRANSPORT
       -------------------------------------------------------- */

    const privateVehicle =
        calculatePrivateVehicle(
            data
        );


    /* --------------------------------------------------------
       PUBLIC TRANSPORT
       -------------------------------------------------------- */

    const publicTransport =
        calculatePublicTransport({

            railDistance:
                data.railDistance,

            busDistance:
                data.busDistance

        });


    /* --------------------------------------------------------
       AVIATION
       -------------------------------------------------------- */

    const aviation =
        calculateAviation({

            domesticPassengerKm:
                data.domesticFlightDistance,

            internationalPassengerKm:
                data.internationalFlightDistance

        });


    /* --------------------------------------------------------
       TRANSPORT TOTAL
       -------------------------------------------------------- */

    const transportEmissions =
        sumEmissions(

            privateVehicle,

            publicTransport,

            aviation

        );


    /* --------------------------------------------------------
       FOOD
       -------------------------------------------------------- */

    const food =
        calculateFood({

            beefKg:
                data.beefKg,

            lambKg:
                data.lambKg,

            porkKg:
                data.porkKg,

            poultryKg:
                data.poultryKg,

            cheeseKg:
                data.cheeseKg,

            milkKg:
                data.milkKg,

            eggsKg:
                data.eggsKg,

            riceKg:
                data.riceKg,

            tofuKg:
                data.tofuKg,

            peasKg:
                data.peasKg,

            beansKg:
                data.beansKg,

            potatoesKg:
                data.potatoesKg,

            rootVegetablesKg:
                data.rootVegetablesKg,

            bananasKg:
                data.bananasKg,

            applesKg:
                data.applesKg,

            tomatoesKg:
                data.tomatoesKg

        });


    /* --------------------------------------------------------
       WASTE
       -------------------------------------------------------- */

    const foodWaste =
        calculateFoodWaste(
            data.foodWasteKg
        );


    const generalWaste =
        calculateWaste(
            data.mixedWasteKg
        );


    /* --------------------------------------------------------
       FOOD TOTAL
       -------------------------------------------------------- */

    const foodEmissions =
        sumEmissions(

            food,

            foodWaste

        );


    /* --------------------------------------------------------
       WASTE TOTAL
       -------------------------------------------------------- */

    const wasteEmissions =
        sumEmissions(
            generalWaste
        );


    /* --------------------------------------------------------
       GRAND TOTAL
       -------------------------------------------------------- */

    const total =
        energyEmissions +
        transportEmissions +
        foodEmissions +
        wasteEmissions;


    /* --------------------------------------------------------
       TIME CONVERSIONS
       -------------------------------------------------------- */

    const monthly =
        total /
        MONTHS_PER_YEAR;


    const daily =
        total /
        DAYS_PER_YEAR;


    const tonnes =
        total /
        KG_PER_TONNE;


    const perPerson =
        total /
        data.householdSize;


    /* --------------------------------------------------------
       CATEGORY BREAKDOWN
       -------------------------------------------------------- */

    const categories = {

        energy:
            energyEmissions,

        transport:
            transportEmissions,

        food:
            foodEmissions,

        waste:
            wasteEmissions

    };


    /* --------------------------------------------------------
       STATUS
       -------------------------------------------------------- */

    const allResults = [

        electricity,

        cookingFuelResult,

        privateVehicle,

        publicTransport.rail,

        publicTransport.bus,

        aviation.domestic,

        aviation.international,

        foodWaste,

        generalWaste

    ];


    const unsupportedCategories =
        allResults.filter(
            result =>
                result.status ===
                "unsupported"
        );


    const hasUnsupportedInputs =
        unsupportedCategories.length >
        0;


    /* --------------------------------------------------------
       FINAL RESULT
       -------------------------------------------------------- */

    return {

        success:
            Number.isFinite(total) &&
            total >= 0,

        hasUnsupportedInputs,

        unsupportedCategories,

        total,

        tonnes,

        monthly,

        daily,

        perPerson,

        householdSize:
            data.householdSize,

        categories,

        details: {

            electricity,

            cooking:
                cookingFuelResult,

            privateVehicle,

            publicTransport,

            aviation,

            food,

            foodWaste,

            waste:
                generalWaste

        },

        methodology: {

            unit:
                "kgCO2e/year",

            region:
                EMISSION_FACTORS
                    .dataset
                    .region,

            datasetVersion:
                EMISSION_FACTORS
                    .dataset
                    .version,

            calculationType:
                "activity data × emission factor",

            note:
                "Results are estimates. Individual factors can have different accounting boundaries and uncertainty."

        }

    };

}


/* ============================================================
   21. RESULT VALIDATION
   ============================================================ */

function validateCalculationResult(
    result
) {

    if (
        !result ||
        typeof result !== "object"
    ) {

        return false;

    }


    if (
        !Number.isFinite(
            result.total
        )
    ) {

        return false;

    }


    if (
        result.total < 0
    ) {

        return false;

    }


    if (
        !Number.isFinite(
            result.monthly
        )
    ) {

        return false;

    }


    if (
        !Number.isFinite(
            result.daily
        )
    ) {

        return false;

    }


    if (
        !Number.isFinite(
            result.perPerson
        )
    ) {

        return false;

    }


    const categoryValues =
        Object.values(
            result.categories
        );


    return categoryValues.every(

        value =>

            Number.isFinite(value) &&
            value >= 0

    );

}


/* ============================================================
   22. SIMPLE TEST CASES
   ============================================================ */

/*
 * These are development helpers.
 *
 * They are NOT automatically executed.
 *
 * You can import them in a test file later.
 */

function runCalculatorSelfTest() {

    const testInput = {

        householdSize:
            1,

        electricity:
            4000,

        solar:
            0,

        cookingFuel:
            "lpg",

        lpgCylinders:
            8,

        privateVehicle:
            "yes",

        vehicleType:
            "petrol-car",

        vehicleDistance:
            12000,

        vehicleEfficiency:
            15,

        vehicleOccupancy:
            1,

        railDistance:
            3000,

        busDistance:
            2000,

        domesticFlightDistance:
            0,

        internationalFlightDistance:
            0,

        beefKg:
            0,

        lambKg:
            0,

        porkKg:
            0,

        poultryKg:
            20,

        cheeseKg:
            0,

        milkKg:
            100,

        eggsKg:
            0,

        riceKg:
            60,

        tofuKg:
            0,

        peasKg:
            0,

        beansKg:
            20,

        potatoesKg:
            50,

        rootVegetablesKg:
            20,

        bananasKg:
            30,

        applesKg:
            20,

        tomatoesKg:
            20,

        foodWasteKg:
            0,

        mixedWasteKg:
            0

    };


    const result =
        calculateCarbonFootprint(
            testInput
        );


    return {

        valid:
            validateCalculationResult(
                result
            ),

        result

    };

}


/* ============================================================
   23. EXPORT PUBLIC API
   ============================================================ */

export {

    calculateElectricity,

    calculateLPG,

    calculatePNG,

    calculatePetrolVehicle,

    calculateDieselVehicle,

    calculateCNGVehicle,

    calculateElectricVehicle,

    calculatePublicTransport,

    calculateAviation,

    calculateFood,

    calculateFoodWaste,

    calculateWaste,

    normalizeInput,

    calculateCarbonFootprint,

    validateCalculationResult,

    runCalculatorSelfTest

};
