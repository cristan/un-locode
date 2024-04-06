This is a fork of https://github.com/datasets/un-locode with the aim of improving the quality of the data, especially the coordinates.

The main goal of this repo is to be a collection of scripts to quickly detect problems within the unlocode dataset.

## CSV with improved locations
See code-list-improved.csv: it has many more locations, and it should have way more reliable coordinates (coordinates which are off by a long distance because of a data error should be automatically corrected).

How it is determined:
* When the coordinates can't be found with Nominatim, choose unlocode
* When no coordinates are specified in unlocode, choose Nominatim
* When the unlocode coordinates match the one from Nominatim within 100km (even when the region don't match!), choose unlocode
* Otherwise, choose the first hit from nominatim

2 extra columns are present:
* A distance column. Either the distance between the 2, or `"N/A (no UN/LOCODE)"` / `"N/A (no Nominatim)"` / `"N/A"` (when no result is found)
* Source (either `"N/A"` when no coordinates, `"UN/LOCODE"` or a link to the entry in OpenStreetMap)

## About unlocodes

The United Nations Code for Trade and Transport Locations is a code list mantained by UNECE, United Nations agency, to facilitate trade.

## Data

Data comes from the [UNECE page](http://www.unece.org/cefact/locode/welcome.html), released at least once a year.

## License

All unlocode data is licensed under the [ODC Public Domain Dedication and Licence (PDDL)](http://opendatacommons.org/licenses/pddl/1-0/).

### Nominatim data
ODbL 1.0. http://osm.org/copyright

### All other contents in this repo
Public domain