import {readCsv, readSubdivisionData} from "./util/readCsv.js";
import {convertToDecimal} from "./util/coordinatesConverter.js";
import {getNominatimData} from "./util/nominatim-loader.js";

async function validateRegionCodes() {
    const csvDatabase = await readCsv()
    const subdivisions = readSubdivisionData()

    for (const unlocode of Object.keys(csvDatabase)) {
        const entry = csvDatabase[unlocode]
        const decimalCoordinates = convertToDecimal(entry.coordinates)
        if (!decimalCoordinates) {
            continue
        }

        const nominatimData = await getNominatimData(entry)
        if (!nominatimData) {
            continue
        }

        nominatimData.result.forEach(nominatimResult => {
            if (!nominatimResult.subdivisionCode) {
                return
            }
            const subdivisionName = subdivisions[entry.country +"|"+ nominatimResult.subdivisionCode]
            if (!subdivisionName) {
                console.log(entry.unlocode, "has no subdivision name for", nominatimResult.subdivisionCode)
            }
        })
    }
}

validateRegionCodes()