
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

Active in the prototype as a low-confidence, CO2-only proxy.
Not suitable for BRTS, intercity buses or formal inventory reporting.

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

Active in the prototype as a low-confidence, CO2-only Indian Railways proxy.
The rounded single factor does not distinguish suburban/non-suburban service
or passenger class. It is not suitable for metro/MRTS or formal inventory
reporting without updated, mode-specific data.
