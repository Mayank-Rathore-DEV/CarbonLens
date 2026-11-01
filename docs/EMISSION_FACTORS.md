
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

### Candidate Factor

2.985 kg CO2 per kg of LPG.

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

Research candidate — not yet approved
for production calculations.

## 12. Road Transport Fuel — Research Record

### Candidate Emission Factors

- Petrol: 2.27 kg CO2/litre
- Diesel: 2.6444 kg CO2/litre

### Source

India GHG Program,
India Specific Road Transport Emission Factors,
Technical Paper.

### Calculation

Fuel-based emissions:

Emissions = Fuel consumed (litres)
× Fuel emission factor (kg CO2/litre)

### Example

10 litres of petrol:

10 × 2.27 = 22.7 kg CO2

10 litres of diesel:

10 × 2.6444 = 26.444 kg CO2

### Important Methodology Note

These are fuel-based CO2 factors,
not universal vehicle-kilometre factors.

To estimate emissions per kilometre,
vehicle fuel efficiency must also be considered:

Emissions per km =
Fuel emission factor / Mileage (km/litre)

### Limitations

- The source is an older India-specific
  technical reference (2015).
- These factors represent CO2, not automatically CO2e.
- Actual vehicle emissions vary with fuel,
  vehicle technology, age and operating conditions.
- Updated factors and independent review are required.

### Status

Research candidates — not approved
for production calculations.

