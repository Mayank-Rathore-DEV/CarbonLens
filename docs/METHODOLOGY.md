
# CarbonLens — Methodology

## 1. Purpose

CarbonLens estimates greenhouse gas emissions
associated with selected personal lifestyle activities.

## 2. Categories currently included

The current calculator includes:

- Household grid electricity
- LPG and PNG cooking fuel
- Private vehicle travel
- Passenger rail and intracity bus travel
- Domestic and international air travel
- Selected food consumption
- Food waste and mixed household waste

## 3. Categories excluded

The current calculator does not include:

- Shopping and durable goods
- Water consumption
- Digital services
- Carbon offsets
- Solar-panel manufacturing and lifecycle emissions

Waste is included only as a low-confidence proxy estimate. It is not
an India-specific municipal-waste inventory and should not be treated
as a reliable measure of local disposal emissions.

## 4. Calculation Formula

Emissions = Activity Data × Emission Factor

The interface reports an indicative kg CO2e estimate, but the current factor set
is not a fully harmonised greenhouse-gas inventory: some factors represent
CO2 only, while other factors include multiple greenhouse gases. The result
must therefore be described as a partial estimate, not a complete CO2e total.

## 5. Data Sources

CarbonLens aims to prioritize:

- Official Indian government datasets
- Peer-reviewed scientific research
- International scientific publications where Indian data is unavailable

## 6. Scientific Principles

Every emission factor should have:

- A traceable source
- A defined unit
- A relevant geographical scope
- A data year
- Documented limitations

## 7. Limitations

Carbon footprint results are estimates, not direct measurements.

Results depend on the quality of user-provided data,
emission factors, and calculation assumptions.

## 8. Future Improvements

- Regional emission factors
- Better food-related datasets
- Uncertainty estimates
- Independent scientific review

- 
## 9. Electricity Emission Factor

CarbonLens uses the Central Electricity Authority (CEA)
CO2 Baseline Database Version 22.0.

Selected reporting period: FY 2025-26

Selected electricity emission factor:
0.6751 kg CO2/kWh

This value represents the all-India weighted-average
grid emission rate including imports.

Source:
Central Electricity Authority — CO2 Baseline Database
for the Indian Power Sector, Version 22.0.

https://cea.nic.in/cdm-co2-baseline-database/

The factor is expressed in kg CO2/kWh, not kg CO2e/kWh.

Electricity consumption must be matched with the
appropriate reporting-year emission factor.

The application must preserve the factor's source
and reporting period with each calculation.

This is a national-average estimate. Actual electricity
emissions may vary by region and time.



## 10. Electricity bill boundary — rooftop solar

The household electricity input is the annualised kWh imported from the
utility grid, taken from the electricity bill. The calculator applies the
CEA grid factor directly to this imported electricity.

Do not subtract rooftop solar generation from a utility-bill kWh figure:
the bill already reflects the electricity imported from the grid (including
any applicable net-metering treatment). Subtracting solar generation again
would double-count the solar reduction and understate emissions.

On-site solar generation is therefore not a separate calculator input in
this version. Embodied emissions from solar panels and their lifecycle are
outside the current operational electricity boundary.


## 11. Mixed greenhouse-gas coverage and interpretation

The calculator currently combines factors with different gas coverage and
system boundaries. In particular:

- CEA electricity, LPG/PNG combustion, road-fuel combustion, Indian rail,
  and Indian intracity bus factors are CO2-only operational/combustion
  proxies.
- The 2026 UK government domestic and non-UK international aviation
  passenger factors include CO2, CH4 and N2O but exclude the distance and
  radiative-forcing uplifts in the base values used here.
- Food factors are global lifecycle CO2e averages.
- Waste factors are low-confidence, non-India-specific disposal proxies.

These factors cannot be presented as a single fully harmonised lifecycle
inventory. The result is an indicative partial footprint with explicit
coverage limitations. Improving this requires compatible CO2e factors for
all categories, with consistent boundaries and regional applicability.
