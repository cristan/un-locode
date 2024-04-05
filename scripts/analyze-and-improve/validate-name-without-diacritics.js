import {readCsv, readSubdivisionData} from "./util/readCsv.js";
import {convertToDecimal} from "./util/coordinatesConverter.js";
import {getNominatimData} from "./util/nominatim-loader.js";

async function validateNameWithoutDiacritics() {
    const csvDatabase = await readCsv()

    const validCharactersInNameWithoutDiacritics = /^[&=,/\.'a-zA-Z0-9\s\-\(\)]+$/
    for (const unlocode of Object.keys(csvDatabase)) {
        const entry = csvDatabase[unlocode]
        const nameWithoutDiacritics = entry.nameWithoutDiacritics
        if (!validCharactersInNameWithoutDiacritics.test(nameWithoutDiacritics)) {
            console.log(`${entry.unlocode}: ${entry.nameWithoutDiacritics}`)
        }
    }
}

validateNameWithoutDiacritics()