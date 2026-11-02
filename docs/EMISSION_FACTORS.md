
# CarbonLens — Emission Factor Research Register

## Research Record 001: Electricity — India

### Primary Source
Central Electricity Authority (CEA), Government of India.

Official source:
https://cea.nic.in/cdm-co2-baseline-view?lang=en&mappingId=234

### Database
Version 22.0

Database date: 1 August 2026

### Data Period
Financial Year 2025–26

### Source Location
Results sheet, cell AA14.

Metric:
Weighted Average Grid Emission Rate
(Incl. RES, Captive), including imports.

### Original Value
0.675098683 tonnes CO2/MWh

### Converted Value
0.675098683 kg CO2/kWh

### Intended Use
Candidate factor for location-based household
electricity emission estimates in CarbonLens.

### Important Distinctions
CEA also reports other weighted-average factors.
They must not be confused with this metric.

### Scientific Limitations
- India-wide grid factor.
- Financial-year-specific.
- Expressed as CO2, not automatically CO2e.
- Does not represent full lifecycle electricity emissions.
- Suitability for the household reporting boundary
  requires methodological review.

### Verification Status
Primary CEA Version 22.0 Excel spreadsheet inspected.
User Guide and full methodology review pending.

### Decision
Retain as a provisional candidate.
Do not mark as scientifically approved yet.


## 10. Electricity Factor — Methodology Decision

### Selected Factor

0.675098683 kg CO2/kWh

### Source

CEA Baseline Carbon Dioxide Emission Database,
Version 22.0.

### Exact Location

Results worksheet, cell AA14.

### Metric

Weighted Average Grid Emission Rate
(Incl. RES, Captive), including imports.

### Why This Factor Was Selected

It represents an India-wide weighted-average
grid emission rate that accounts for renewable
and captive generation.

It is more appropriate for an initial
location-based electricity footprint estimate
than the operating, build or combined margins,
which are primarily intended for electricity
project-baseline calculations.

### Import Treatment

- Imports from other Indian grids are adjusted
  using the exporting grid's operating margin.
- Imports from other countries are assigned
  zero emissions in this database calculation.

### Limitations

- India-wide average, not state-specific.
- Represents operational CO2, not automatically
  a complete lifecycle CO2e factor.
- Must be matched to the relevant financial year.
- Further independent scientific review is required.

### Decision

Approved for initial prototype use only,
subject to the limitations above.

This is not a claim of independent scientific
validation of the underlying CEA dataset.

## 11. LPG Emission Factor — Research Record

### Source-derived factor and active calculator value

IPCC-derived estimate: 2.985 kg CO2 per kg of LPG.
The calculator currently rounds this to 3.00 kg CO2/kg LPG.

### Source Data

IPCC 2006 Guidelines, Volume 2,
Chapter 1, as reproduced in the
Kerala GHG Inventory Report.

### Input Values

- Net calorific value: 47.3 TJ/Gg
- CO2 emission factor: 63.1 tonnes CO2/TJ

### Calculation

LPG emissions = LPG consumed (kg)
× 2.985 kg CO2/kg LPG

### Example

14.2 kg × 2.985 = approximately
42.39 kg CO2 per cylinder.

### Limitations

- This is a direct-combustion CO2 estimate.
- It does not include the full LPG supply chain.
- CO2e treatment, including CH4 and N2O,
  requires separate calculation.
- Further review is required before final approval.

### Status

Active in the prototype as a rounded direct-combustion CO2 estimate.
It is not a full lifecycle or complete CO2e factor and is not approved
for formal greenhouse-gas inventory reporting.

## 12. Private Road Vehicle Fuel Factors — Active Prototype Inputs

### Factors currently used by the calculator

- Petrol: 2.31 kg CO2/litre
- Diesel: 2.68 kg CO2/litre
- CNG: 2.75 kg CO2/kg CNG
- Petrol two-wheeler: 2.31 kg CO2/litre
- Electric vehicle: 0.6751 kg CO2/kWh (CEA FY 2025–26 grid factor)

### Source and accounting basis

The petrol, diesel and CNG values are approximate direct-combustion CO2
proxies informed by IPCC 2006 fuel-combustion defaults and assumed fuel
properties. They are not India-specific fuel assays and do not include
upstream fuel production, vehicle manufacture, or a complete CH4/N2O
calculation. The EV factor uses the CEA India grid factor and operational
electricity consumption only.

The India GHG Program 2015 Road Transport Technical Paper reports
vehicle-kilometre factors for specific vehicle classes. Those are not the
same factors as the fuel-based inputs above and must not be cited as their
source. They may be evaluated as an alternative model in a future revision.

### Calculation

For combustion vehicles:

Emissions = (annual vehicle-km / real-world km per litre or km per kg)
× fuel CO2 factor

For EVs:

Emissions = (annual vehicle-km / real-world km per kWh)
× CEA grid CO2 factor

The app divides whole-vehicle emissions by the entered occupancy to
allocate the result to one passenger.

### Status and limitations

Active in the prototype as direct operational CO2 estimates only.
Not a complete CO2e or lifecycle factor set. Actual values vary by fuel
composition, vehicle technology, age, maintenance, traffic and driving
conditions. Formal reporting requires updated India-specific data and
independent review.

## 13. City Bus Emission Factor — Research Record

### Factor used by the calculator

0.0152 kg CO2/passenger-km (rounded from the source value 0.015161).

### Source

India GHG Program,
India Specific Road Transport Emission Factors,
2015, Version 1.0.

### Scope

Intracity bus transport only.

Not applicable to BRTS or intercity buses.

### Calculation

Emissions = Passenger distance (km)
× 0.015161 kg CO2/passenger-km

### Example

100 passenger-km × 0.015161
= 1.5161 kg CO2

### Limitations

- Source is from 2015.
- Represents CO2, not automatically CO2e.
- Bus occupancy and operating conditions vary.
- Further review is required.

### Status

Active in the headline calculation as a low-confidence, CO2-only
intracity bus proxy. Excludes BRTS and intercity buses; not suitable for
formal inventory reporting without updated data.

---

## 14. Indian Railways Emission Factor — Research Record

### Source values and active calculator proxy

- Non-suburban rail: 0.007837 kg CO2/passenger-km.
- Suburban rail: 0.007976 kg CO2/passenger-km.
- Calculator proxy: 0.0080 kg CO2/passenger-km (rounded generic value).

### Source

India GHG Program,
India Specific Rail Transport Emission Factors
for Passenger Travel and Material Transport,
2015, Version 1.0.

### Reference Year

2014–15.

### Calculation

Emissions = Passenger distance (km)
× Applicable rail emission factor.

### Example

100 passenger-km on non-suburban rail:

100 × 0.007837 = 0.7837 kg CO2

### Limitations

- Old reference-year data.
- Factors are specific to Indian Railways.
- Not applicable to metro systems.
- Does not distinguish AC and non-AC classes.
- Represents CO2, not automatically CO2e.
- Further review and updated data are required.

### Status

Active in the headline calculation as a low-confidence, CO2-only
Indian Railways proxy. It uses 2014–15 data, excludes metro/MRTS, and does
not distinguish passenger class.


## 15. Passenger Aviation Factors — Active Prototype Inputs

### Factors currently used

- Domestic flights: 0.1252 kg CO2e/passenger-km.
- International flights (non-UK average): 0.0778 kg CO2e/passenger-km.

### Source

UK Department for Energy Security and Net Zero, 2026 Government
Greenhouse Gas Conversion Factors for Company Reporting, Methodology
Report, Table 43 (average passenger factors).

Official source:
https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2026

Methodology report:
https://assets.publishing.service.gov.uk/media/6a2940543b15d05a7ce3202e/2026-GHG-conversion-factors-methodology-report.pdf

### Included and excluded emissions

The table reports total passenger GHG factors including CO2, CH4 and N2O.
The base factors used here exclude the distance uplift and the 1.7
radiative-forcing uplift applied to aviation CO2 in separate reporting
factors. The radiative-forcing multiplier is uncertain and is applied only
to the CO2 component in the government methodology.

### Geographic limitation

These are UK-derived average aviation factors, not India-specific
aircraft, route, airline, load-factor or cabin-class measurements.
They are used as generic proxies until India-relevant route-specific
data or an appropriate harmonised global dataset is adopted.

### Status

Active in the prototype as medium-confidence non-India-specific proxies.
They must not be described as India-specific or as including aviation's
non-CO2 radiative-forcing effects.


## 16. Experimental Waste Factors — Excluded from Headline

### Food waste

- Factor: 0.4208 kg CO2e/kg.
- Source: Beijing urban-dining lifecycle study (2022), Table 4.
- Scope: context-specific home-cooking food-waste disposal estimate.
- Limitation: not India-specific and does not represent every local
  treatment route.

### Mixed household waste

- Factor: 0.333843 kg CO2e/kg (calculator rounds to 0.3338).
- Source: New Zealand Measuring Emissions Catalogue 2026, Table 10.3,
  unknown-composition general waste sent to a municipal landfill with
  landfill-gas recovery.
- Important limitation: the factor is not a universal mixed-waste value.
  New Zealand's same guide reports 0.635339 kg CO2e/kg for general waste
  sent to a municipal landfill without gas recovery. Composting and
  anaerobic digestion have different factors.

### Status

Both factors are retained only to show an experimental waste estimate.
They are excluded from the headline footprint because the app does not
capture the user's actual disposal route, landfill methane capture,
composting, recycling or local waste composition. They must not be used
as India-specific waste factors.


## 17. Food Lifecycle Factors — Active Prototype Inputs

### Source and scope

The food factors are global mean greenhouse-gas emissions per kilogram of
food product from Poore & Nemecek (2018), as processed by Our World in Data.
The displayed dataset is for 2010 and uses kg CO2e/kg food. The underlying
meta-analysis includes approximately 570 studies, 38,700 farms and 119
countries; the values are global averages, not India-specific factors.

Source:
https://ourworldindata.org/grapher/ghg-per-kg-poore

The dataset covers cradle-to-retail stages including land-use change,
farm production, processing, transport to retail and packaging. It does
not include household cooking, refrigeration after retail or household
food waste.

### Food mappings used

| Calculator input | Factor (kg CO2e/kg) | Dataset mapping |
|---|---:|---|
| Beef | 99.48 | Beef (beef herd) |
| Lamb / mutton | 39.72 | Lamb & Mutton |
| Pork | 12.31 | Pig Meat |
| Poultry | 9.87 | Poultry Meat |
| Cheese | 23.88 | Cheese |
| Milk | 3.15 | Milk |
| Eggs | 4.67 | Eggs |
| Rice | 4.45 | Rice |
| Tofu | 3.16 | Tofu |
| Peas | 0.98 | Peas |
| Beans / pulses | 1.79 | Other Pulses |
| Potatoes | 0.46 | Potatoes |
| Root vegetables | 0.43 | Root Vegetables |
| Bananas | 0.86 | Bananas |
| Apples | 0.43 | Apples |
| Tomatoes | 2.09 | Tomatoes |

### Important mappings and limitations

- The 99.48 beef value is specifically the beef-herd factor. The same
  dataset reports 33.30 kg CO2e/kg for beef from dairy herds. The calculator
  labels the input as a beef-herd proxy; it is not a buffalo-specific factor.
- Beans/pulses is mapped to the dataset's "Other Pulses" value of 1.79.
  The previous 1.37 value did not match this cited dataset and has been
  corrected.
- Food quantities are user-entered product mass per person per year.
  Rice and pulses should be entered on a dry/uncooked weight basis.
- These are global 2010 means. Indian production systems, irrigation,
  fertilizer use, yields, livestock systems, cold chains and food loss can
  differ substantially.

### Status

Active in the headline prototype as medium-confidence global lifecycle
proxies. They are traceable and internally consistent with the selected
OWID dataset, but they are not India-specific and should be replaced or
supplemented when suitable Indian product-level LCA data are available.
