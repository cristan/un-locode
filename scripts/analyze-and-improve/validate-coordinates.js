import {readCsv} from "./util/readCsv.js";
import {convertToDecimal, convertToUnlocode, getDistanceFromLatLonInKm} from "./util/coordinatesConverter.js";
import {downloadByCityIfNeeded} from "./util/nominatim-downloader.js";
import {getNominatimData, readNominatimDataByCity} from "./util/nominatim-loader.js";
import {validateCoordinates} from "./util/entry-validator.js";

// TODO: problematic case: ITB52: this doesn't exist in OpenStreetMap :O

async function validateAllCoordinates() {
    // console.debug = function() {};

    const csvDatabase = await readCsv()

    for (const unlocode of Object.keys(csvDatabase)) {
        const entry = csvDatabase[unlocode]

        const decimalCoordinates = convertToDecimal(entry.coordinates)
        if (!decimalCoordinates || entry.country !== "IT") {
            continue
        }

        const nominatimData = await getNominatimData(entry)
        if (!nominatimData) {
            // Nominatim can't find it, which most likely means a non-standard name is found.
            // For example ITMND which has the name "Mondello, Palermo" or ITAQW with the name "Acconia Di Curinga"
            // These should be called "Mondello" and "Acconia" to be found in nominatim.

            // Let's ignore this for now because these 2 examples are actually fine.
            continue
        }

        const generatedLog = await validateCoordinates(entry, nominatimData)
        if (generatedLog) {
            console.log(generatedLog)
        }
    }
}

validateAllCoordinates()