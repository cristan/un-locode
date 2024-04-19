import {convertToDecimal} from "./util/coordinatesConverter.js"
import {readCsv} from "./util/readCsv.js"

async function validateBrokenCoordinates() {
    const csvDatabase = await readCsv()
    for (const unlocode of Object.keys(csvDatabase)) {
        const entry = csvDatabase[unlocode]

        const decimalCoordinates = convertToDecimal(entry.coordinates);
        if (entry.coordinates && !decimalCoordinates) {
            console.log(`Invalid coordinates for ${unlocode}: ${entry.coordinates}`)
            continue
        }
        if(decimalCoordinates.lat > 90 || decimalCoordinates.lat < -90) {
            console.log(`Invalid latitude for ${unlocode}: ${entry.coordinates} => ${decimalCoordinates.lat}, ${decimalCoordinates.lon}`)
            continue
        }
        if(decimalCoordinates.lon > 180 || decimalCoordinates.lon < -180) {
            console.log(`Invalid longitude for ${unlocode}: ${entry.coordinates} => ${decimalCoordinates.lat}, ${decimalCoordinates.lon}`)
            continue
        }
    }
}

validateBrokenCoordinates()