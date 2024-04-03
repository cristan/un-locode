import {readCsv} from "./util/readCsv.js";
import {convertToDecimal} from "./util/coordinatesConverter.js";
import {getNominatimData} from "./util/nominatim-loader.js";
import {validateCoordinates} from "./util/entry-validator.js";

async function validateAllCoordinates() {
    // console.debug = function() {};

    const csvDatabase = await readCsv()

    console.log()

    for (const unlocode of Object.keys(csvDatabase)) {
        const entry = csvDatabase[unlocode]

        const decimalCoordinates = convertToDecimal(entry.coordinates)
        if (!decimalCoordinates || entry.country !== "CN") {
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
            const useHtml = true
            if (!useHtml) {
                console.log(generatedLog + "\n")
            } else {
                const html = generatedLog
                    .replaceAll(/https:\/\/unlocode\.info\/(\w{5})/g, '<a href="$&">$1</a>')
                    .replaceAll(/(\d*N\s\d*E) \(([\d\\.]*), ([\d\\.]*)\)/g, '<a href="https://www.google.com/maps/place/$2,$3">$1</a>')
                    +"<br><br>"
                console.log(html)
            }
        }
    }
}

validateAllCoordinates()