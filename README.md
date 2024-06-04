# UN/LOCODE list with improved coordinates
The coordinates in [the original UN/LOCODE list](https://github.com/datasets/un-locode) have 2 major problems:

**1. Only 80% of locations have coordinates**

This doesn't just include tiny villages, but major transport hubs like Shanhai Port (CNSHG), Port of Shenzhen (CNSZP), Hong Kong (HKHKG) and Los Angeles (USLAX).

**2. Many coordinates are just wrong**

Problems like typos (AUMID), pointing to the wrong country (CKPZK) and just flat out being wrong (EGSCN)

This project aims to solve most of these cases by combining the data with data from OpenStreetMap's [Nominatim](https://nominatim.org/release-docs/latest/api/Overview/) and [Wikidata](https://www.wikidata.org/).

## CSV with improved locations
You can find the improved list as [code-list-improved.csv](data/code-list-improved.csv). It has both corrected coordinates, as well as just way more of them (98.26%).

## How the improved list is created
* When the coordinates can't be found with Nominatim, choose unlocode
* When no coordinates are specified in unlocode, choose Nominatim, but only if the region matches or UN/LOCODE hasn't specified a working region
* When the unlocode coordinates match the one from Nominatim within 100km (even when the region don't match!), choose unlocode
* Choose the first hit from Nominatim
* When that doesn't exist, choose the result from Wikidata
Other than that, all differences between the UN/LOCODE have been manually (quickly) tested and the correct ones are manually specified
Differences between Wikidata and this list are also tested and the correct ones manually specified, making this list as reliable as you can reasonably expect.

## Extra columns
2 extra columns are created:
* A distance column. Either the distance between UN/LOCODE and nominatim, or `"N/A (no UN/LOCODE)"` / `"N/A (no Nominatim)"` / `"N/A"` (when no result is found)
* Source (either `"N/A"` when no coordinates, `"UN/LOCODE"`, a link to the entry in OpenStreetMap or a link to the entry in Wikidata)
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

### Wikidata
CC-0 (No rights reserved)

### All other contents in this repo
Public domain
