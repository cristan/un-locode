import {readCsv} from "./util/readCsv.js";
import {convertToDecimal, convertToUnlocode, getDistanceFromLatLonInKm} from "./util/coordinatesConverter.js";
import {readWikidata} from "./util/wikidata-reader.js";
import fs from "node:fs";
import {getSubdivisionCode} from "./util/nominatim-loader.js";

// Before you run this, make sure to run download-wikidata.js to compare with the latest state at Wikidata
// Mostly seems to find problems with region data in either OpenStreetMap or in UN/LOCODE
async function validateAllCoordinates() {
    const csvDatabase = await readCsv(true)
    const wikidata = readWikidata();

    console.log()

    let allCount = 0
    let count = 0
    for (const unlocode of Object.keys(csvDatabase)) {
        const entry = csvDatabase[unlocode]

        const source = entry.source
        if (!source.includes("wikidata.org") || !entry.subdivisionName) {
            continue
        }
        const wikiEntry = wikidata[unlocode]
        const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&accept-language=en&lat=${wikiEntry.lat}&lon=${wikiEntry.lon}`
        await delay(1000)
        const fromNominatim = await (await fetch(nominatimUrl)).json()
        if (fromNominatim.error) {
            console.warn(`Couldn't reverse geocode ${unlocode}!`)
            continue
        }
        const subdivisionCode = getSubdivisionCode(fromNominatim)
        if (subdivisionCode !== entry.subdivisionCode) {
            const decimalCoordinates = convertToDecimal(entry.coordinates)

            console.log(`https://unlocode.info/${unlocode} ${entry.city} with region ${entry.subdivisionCode} (${entry.subdivisionName}) doesn't match ${subdivisionCode} from ${source}. https://www.google.com/maps?z=12&ll=${wikiEntry.lat},${wikiEntry.lon}. ${unlocode},${convertToUnlocode(wikiEntry.lat, wikiEntry.lon)}`)
            count++
        }
        allCount++
    }
    console.log(count +" out of "+ allCount +`(${((count / allCount) * 100)}%)`)
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

validateAllCoordinates()