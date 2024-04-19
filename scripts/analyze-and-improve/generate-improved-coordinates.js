import {readCsv} from "./util/readCsv.js";
import {convertToDecimal, convertToUnlocode, getDistanceFromLatLonInKm} from "./util/coordinatesConverter.js";
import {getNominatimData, readNominatimDataByCity} from "./util/nominatim-loader.js";
import fs from "node:fs";
import {downloadByCityIfNeeded} from "./util/nominatim-downloader.js";
import {UNLOCODE_BEST} from "./manual-unlocode-best.js";
import {readWikidata} from "./util/wikidata-reader.js";
import {WIKIDATA_BEST} from "./manual-wikidata-best.js";

async function validateAllCoordinates() {
    const csvDatabase = await readCsv()
    const wikidataDatabase = readWikidata()

    const filename = 'code-list-improved.csv'
    const dataOut = fs.createWriteStream('../../data/' + filename)
    writeCsv(dataOut, ["Change", "Country", "Location", "Name","NameWoDiacritics","Subdivision","Status","Function","Date","IATA","Coordinates","Remarks","Distance","Source"])

    let correctedCoordinates = 0
    let newlyAddedCoordinates = 0
    for (const unlocode of Object.keys(csvDatabase)) {
        const entry = csvDatabase[unlocode]

        const entries = [entry.change, entry.country, entry.location,entry.city,entry.nameWithoutDiacritics,entry.subdivisionCode,entry.status,entry.function,entry.date,entry.iata,entry.coordinates,entry.remarks]

        // It doesn't matter what, we have manually determined before that Wikidata is best in these cases
        if (WIKIDATA_BEST.includes(unlocode)) {
            const wikiDataEntry = wikidataDatabase[unlocode]
            const wikiDataEntries = [entry.change, entry.country, entry.location, entry.city, entry.nameWithoutDiacritics, entry.subdivisionCode, entry.status, entry.function, entry.date, entry.iata, convertToUnlocode(wikiDataEntry.lat, wikiDataEntry.lon), entry.remarks, "N/A (hardcoded to Wikidata)", wikiDataEntry.sourceUrl]
            writeCsv(dataOut, wikiDataEntries)
            correctedCoordinates++
            continue
        }

        const decimalCoordinates = convertToDecimal(entry.coordinates)
        if (!decimalCoordinates) {
            const nominatimData = await getNominatimData(entry)
            if (!nominatimData || (nominatimData.scrapeType === "byCity" && entry.subdivisionName && nominatimData.result[0].subdivisionCode)) {
                // Nothing by nominatim or UN/LOCODE, so let's try Wikidata
                // TODO: validate unlocode data by Wikidata as well
                const wikiDataEntry = wikidataDatabase[unlocode]
                if (!wikiDataEntry) {
                    entries.push("N/A", "N/A")
                    writeCsv(dataOut, entries)
                } else {
                    const wikiDataEntries = [entry.change, entry.country, entry.location, entry.city, entry.nameWithoutDiacritics, entry.subdivisionCode, entry.status, entry.function, entry.date, entry.iata, convertToUnlocode(wikiDataEntry.lat, wikiDataEntry.lon), entry.remarks, "N/A (no UN/LOCODE)", wikiDataEntry.sourceUrl]
                    writeCsv(dataOut, wikiDataEntries)
                }
            } else {
                // Nothing at unlocode, so no coordinates to validate against. Therefore, only use the data when we could find it by region or by query or no valid region was specified
                // The exception is when nominatim doesn't return a subdivision code, in that case it's expected that we couldn't find it by region
                newlyAddedCoordinates++
                writeNominatimDataToCsv(dataOut, entry, nominatimData.result[0], "N/A (no UN/LOCODE)")
            }
            continue
        }

        const nominatimData = await getNominatimData(entry)
        if (!nominatimData) {
            // Nominatim can't find it, which most likely means a non-standard name is found.
            // For example ITMND which has the name "Mondello, Palermo" or ITAQW with the name "Acconia Di Curinga"
            // These should be called "Mondello" and "Acconia" to be found in nominatim.

            // Let's choose UN/LOCODE because these examples are actually fine
            entries.push("N/A (no Nominatim)", "UN/LOCODE")
            writeCsv(dataOut, entries)
            continue
        }

        const nominatimResult = nominatimData.result
        const firstNominatimResult = nominatimResult[0]
        const distance = Math.round(getDistanceFromLatLonInKm(decimalCoordinates.lat, decimalCoordinates.lon, firstNominatimResult.lat, firstNominatimResult.lon));
        if (distance < 100 || UNLOCODE_BEST.includes(unlocode)) {
            entries.push(distance, "UN/LOCODE")
            writeCsv(dataOut, entries)
            continue
        }

        const closeResults = nominatimResult.filter(n => {
            return getDistanceFromLatLonInKm(decimalCoordinates.lat, decimalCoordinates.lon, n.lat, n.lon) < 100
        })
        if (closeResults.length !== 0) {
            // The first hit isn't close, but there is another one who is. Keep UN/LOCODE
            const distanceCloseResult = Math.round(getDistanceFromLatLonInKm(decimalCoordinates.lat, decimalCoordinates.lon, closeResults[0].lat, closeResults[0].lon));
            entries.push(distanceCloseResult, "UN/LOCODE")
            writeCsv(dataOut, entries)
            continue
        }

        const scrapeType = nominatimData.scrapeType
        if (scrapeType === "byRegion") {
            // We couldn't find any close result by region. Let's scrape by city as well to see if there is a location in another region where the coordinates do match (like ITAN2)
            // This means that either the coordinates are wrong, or the region is wrong.

            await downloadByCityIfNeeded(entry)
            const nominatimDataByCity = readNominatimDataByCity(unlocode)?.result
            const closeResults = nominatimDataByCity?.filter(n => {
                return getDistanceFromLatLonInKm(decimalCoordinates.lat, decimalCoordinates.lon, n.lat, n.lon) < 100
            })
            if (closeResults !== undefined && closeResults.length !== 0) {
                // We found a close result when not searching by region. Assume the coordinates are correct
                // (which would mean the region is either wrong in unlocode, or not set in OpenStreetMap)

                // Example: ITAN2: The coordinates point to Antignano,Livorno, but there actually is a village Antignano, Asti.
                // Still, in most cases it's just that the wrong region is set in UN/LOCODE: choose that

                entries.push(getDistanceFromLatLonInKm(decimalCoordinates.lat, decimalCoordinates.lon, closeResults[0].lat, closeResults[0].lon), "UN/LOCODE")
                writeCsv(dataOut, entries)
                continue
            }
        }
        // If we're still here and still don't have a close result, choose the first result from Nominatim
        correctedCoordinates++
        writeNominatimDataToCsv(dataOut, entry, firstNominatimResult, distance)
    }
    console.log(`Created ${filename} with ${correctedCoordinates} corrected coordinates and ${newlyAddedCoordinates} new ones`)
}

function writeNominatimDataToCsv(dataOut, entry, firstNominatimResult, distance) {
    const nominatimEntries = [entry.change, entry.country, entry.location, entry.city, entry.nameWithoutDiacritics, entry.subdivisionCode, entry.status, entry.function, entry.date, entry.iata, convertToUnlocode(firstNominatimResult.lat, firstNominatimResult.lon), entry.remarks, distance, firstNominatimResult.sourceUrl]
    writeCsv(dataOut, nominatimEntries)
}

function writeCsv(dataOut, entries) {
    const withQuotesIfNeeded = entries.map(entry => {
        if (typeof entry === "string" && entry.includes(",")) {
            return `\"${entry}\"`
        } else {
            return entry
        }
    })
    dataOut.write(withQuotesIfNeeded.join(",")+ "\n")
}

validateAllCoordinates()