# UN/LOCODE list with improved coordinates
[The original UN/LOCODE list](https://github.com/datasets/un-locode) has 2 problems:

**1. - Only 80% of locations have coordinates**

This doesn't just include tiny villages, but major transport hubs like Shanhai Port (CNSHG), Port of Shenzhen (CNSZP), Hong Kong (HKHKG) and Los Angeles (USLAX).

**2. - Many coordinates are just wrong**

Problems like typos (AUMID), pointing to the wrong country (CKPZK) and flat out just being wrong (EGSCN)

This project aims to solve most of these cases by combining the data with data from OpenStreetMap's [Nominatim](https://nominatim.org/release-docs/latest/api/Overview/).

## CSV with improved locations
You can find the improved list as [code-list-improved.csv](data/code-list-improved.csv). It has both corrected coordinates, as well as just way more coordinates (96.97% have coordinates. The ones who don't are mostly small villages).

## How the improved list is created
* When the coordinates can't be found with Nominatim, choose unlocode
* When no coordinates are specified in unlocode, choose Nominatim, but only if the region matches or UN/LOCODE hasn't specified a working region
* When the unlocode coordinates match the one from Nominatim within 100km (even when the region don't match!), choose unlocode
* Otherwise, choose the first hit from Nominatim
Other than that, all differences between the 2 have been manually (quickly) tested, so this list should be as reliable as reasonably possible.

## Extra columns
2 extra columns are created:
* A distance column. Either the distance between the 2, or `"N/A (no UN/LOCODE)"` / `"N/A (no Nominatim)"` / `"N/A"` (when no result is found)
* Source (either `"N/A"` when no coordinates, `"UN/LOCODE"` or a link to the entry in OpenStreetMap)
These columns can be used to determine whether you'd want to have a human doublecheck the coordinates or not.

# Extra scripts
This project also contain extra scripts to automatically detect problems with the UN/LOCODE dataset, like incorrect regions.

# About UN/LOCODES
The United Nations Code for Trade and Transport Locations is a code list mantained by UNECE, United Nations agency, to facilitate trade. The list is comes from the [UNECE page](http://www.unece.org/cefact/locode/welcome.html), released twice a year.

# License

### UN/LOCODE data
All unlocode data is licensed under the [ODC Public Domain Dedication and Licence (PDDL)](http://opendatacommons.org/licenses/pddl/1-0/).

### Nominatim data
ODbL 1.0. http://osm.org/copyright

### All other contents in this repo
Public domain
