import {WIKIDATA_BEST} from "../manual-wikidata-best.js";
import {convertToDecimal, convertToUnlocode, getDistanceFromLatLonInKm} from "./coordinatesConverter.js";
import {UNLOCODE_BEST} from "../manual-unlocode-best.js";
import {downloadByCityIfNeeded} from "./nominatim-downloader.js";
import {getNominatimData, readNominatimDataByCity} from "./nominatim-loader.js";
import {ALIASES} from "../manual-aliases.js";

export async function detectCoordinates(unlocode, csvDatabase, wikidataDatabase, maxDistance) {
    if (ALIASES[unlocode]) {
        const detectedCoordinates = await detectCoordinates(ALIASES[unlocode], csvDatabase, wikidataDatabase, maxDistance)
        detectedCoordinates.type = "Other UN/LOCODE"
        detectedCoordinates.source = ALIASES[unlocode]
        return detectedCoordinates
    }

    const entry = csvDatabase[unlocode]
    const nominatimData = await getNominatimData(entry)
    const decimalCoordinates = convertToDecimal(entry.coordinates)
    const wikiDataEntry = wikidataDatabase[unlocode]


    if (WIKIDATA_BEST.includes(unlocode) || (!nominatimData && wikiDataEntry)) {
        if (decimalCoordinates && getDistanceFromLatLonInKm(decimalCoordinates.lat, decimalCoordinates.lon, wikiDataEntry.lat, wikiDataEntry.lon) < maxDistance) {
            // When we have a Wikidata entry, check if it's close to the original unlocode one. If yes, just go for unlocode
            return getUnlocodeResult(entry, decimalCoordinates)
        }
        return {...wikiDataEntry, type: "Wikidata"}
    }

    const nominatimResult = nominatimData?.result
    const firstNominatimResult = nominatimResult?.[0]
    if (!nominatimData || UNLOCODE_BEST.includes(unlocode)) {
        // When Nominatim can't find it, which most likely means a non-standard name is found.
        // For example ITMND which has the name "Mondello, Palermo" or ITAQW with the name "Acconia Di Curinga"
        // These should be called "Mondello" and "Acconia" to be found in nominatim.

        // Return the UN/LOCODE entry, regardless of whether it has coordinates or not
        return getUnlocodeResult(entry, decimalCoordinates, firstNominatimResult)
    }

    if (decimalCoordinates) {
        const distance = Math.round(getDistanceFromLatLonInKm(decimalCoordinates.lat, decimalCoordinates.lon, firstNominatimResult.lat, firstNominatimResult.lon));
        if (distance < maxDistance) {
            // The first result is close enough.
            return getUnlocodeResult(entry, decimalCoordinates, firstNominatimResult)
        }

        // Check if there's another result than the first one who is close. If yes, return that
        const closeResult =  await findCloseResult(maxDistance, nominatimResult, decimalCoordinates, entry, nominatimData, unlocode);
        if (closeResult) {
            return closeResult
        }
    }

    // No overrides encountered, no results found close to the unlocode coordinates
    let options = undefined
    if (nominatimResult.length > 1 || wikiDataEntry) {
        options = []
        options.push(...nominatimResult)
        let wikiDataEntryUsed = false
        options.forEach(a => {
            if (!wikiDataEntryUsed && wikiDataEntry && convertToUnlocode(a.lat, a.lon) === convertToUnlocode(wikiDataEntry.lat, wikiDataEntry.lon)) {
                a.sources = [a, wikiDataEntry]
                wikiDataEntryUsed = true
            }
        })
        if (wikiDataEntry && !wikiDataEntryUsed) {
            options.push(wikiDataEntry)
        }
    }
    return {...firstNominatimResult, decimalCoordinates, type: "Nominatim", options}
}

async function findCloseResult(maxDistance, nominatimResult, decimalCoordinates, entry, nominatimData, unlocode) {
    // Use at max 25 km distance, because it's not the first result, so it has to be close to compensate for that
    const closeDistance = Math.min(25, maxDistance);
    const closeResults = nominatimResult.filter(n => {
        return getDistanceFromLatLonInKm(decimalCoordinates.lat, decimalCoordinates.lon, n.lat, n.lon) < closeDistance
    })
    if (closeResults.length !== 0) {
        // The first hit isn't close, but there is another one who is. Keep UN/LOCODE
        return getUnlocodeResult(entry, decimalCoordinates, closeResults[0])
    }

    const scrapeType = nominatimData.scrapeType
    if (scrapeType === "byRegion") {
        // We couldn't find any close result by region. Let's scrape by city as well to see if there is a location in another region where the coordinates do match (like ITAN2)
        // This means that either the coordinates are wrong, or the region is wrong.
        await downloadByCityIfNeeded(entry)
        const nominatimDataByCity = readNominatimDataByCity(unlocode)?.result
        const closeResults = nominatimDataByCity?.filter(n => {
            return getDistanceFromLatLonInKm(decimalCoordinates.lat, decimalCoordinates.lon, n.lat, n.lon) < closeDistance
        })
        if (closeResults !== undefined && closeResults.length !== 0) {
            return getUnlocodeResult(entry, decimalCoordinates, closeResults[0])
        }
    }
    return undefined
}

function getUnlocodeResult(entry, decimalCoordinates, source) {
    if (!decimalCoordinates) {
        return undefined
    }
    return {...entry, decimalCoordinates, type: "UN/LOCODE", source}
}