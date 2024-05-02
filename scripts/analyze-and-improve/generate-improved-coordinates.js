import {readCsv} from "./util/readCsv.js";
import {convertToUnlocode, getDistanceFromLatLonInKm} from "./util/coordinatesConverter.js";
import fs from "node:fs";
import {readWikidata} from "./util/wikidata-reader.js";
import {detectCoordinates} from "./util/coordinate-detector.js";
import {DELETIONS_STILL_IN_USE} from "./manual-undelete.js";

async function generateImprovedCoordinates() {
    const csvDatabase = await readCsv()
    const wikidataDatabase = readWikidata()

    const filename = 'code-list-improved.csv'
    const dataOut = fs.createWriteStream('../../data/' + filename)
    writeCsv(dataOut, ["Change", "Country", "Location", "Name","NameWoDiacritics","Subdivision","Status","Function","Date","IATA","Coordinates","Remarks","Distance","Source"])

    let correctedCoordinates = 0
    let newlyAddedCoordinates = 0
    for (const unlocode of Object.keys(csvDatabase)) {
        const entry = csvDatabase[unlocode]
        const detectedCoordinates = await detectCoordinates(unlocode, csvDatabase, wikidataDatabase, 100)

        const entries = [entry.change, entry.country, entry.location,entry.city,entry.nameWithoutDiacritics,entry.subdivisionCode,entry.status,entry.function,entry.date,entry.iata,entry.coordinates,entry.remarks]
        if (!detectedCoordinates) {
            entries.push("N/A", "N/A")
            writeCsv(dataOut, entries)
        }
        else if (detectedCoordinates.type === "Wikidata") {
            const status = entry.coordinates ? "N/A (hardcoded to Wikidata)" : "N/A (no UN/LOCODE)"
            const wikiDataEntries = [entry.change, entry.country, entry.location, entry.city, entry.nameWithoutDiacritics, entry.subdivisionCode, entry.status, entry.function, entry.date, entry.iata, convertToUnlocode(detectedCoordinates.lat, detectedCoordinates.lon), entry.remarks, status, detectedCoordinates.sourceUrl]
            writeCsv(dataOut, wikiDataEntries)
            if (entry.coordinates) {
                correctedCoordinates++
            } else {
                newlyAddedCoordinates++
            }
        } else if (detectedCoordinates.type === "UN/LOCODE") {
            if (!detectedCoordinates.source) {
                entries.push("N/A (no Nominatim)", "UN/LOCODE")
            } else {
                const distance = Math.round(getDistanceFromLatLonInKm(detectedCoordinates.decimalCoordinates.lat, detectedCoordinates.decimalCoordinates.lon, detectedCoordinates.source.lat, detectedCoordinates.source.lon));
                entries.push(distance, "UN/LOCODE")
            }
            writeCsv(dataOut, entries)
        } else if (detectedCoordinates.type === "Other UN/LOCODE") {
            entries.push("N/A (coordinate of another UN/LOCODE used)", detectedCoordinates.source)
            writeCsv(dataOut, entries)
        } else {
            let distance = "N/A (no UN/LOCODE)"
            if (entry.coordinates) {
                if (detectedCoordinates.decimalCoordinates) {
                    distance = Math.round(getDistanceFromLatLonInKm(detectedCoordinates.decimalCoordinates.lat, detectedCoordinates.decimalCoordinates.lon, detectedCoordinates.lat, detectedCoordinates.lon));
                }
                correctedCoordinates++
            } else {
                newlyAddedCoordinates++
            }
            writeNominatimDataToCsv(dataOut, entry, detectedCoordinates, distance)
        }
    }
    for (const deletedUnlocode of Object.keys(DELETIONS_STILL_IN_USE)) {
        const newUnlocode = DELETIONS_STILL_IN_USE[deletedUnlocode]
        const entry = csvDatabase[newUnlocode]
        const entries = ["X", entry.country, deletedUnlocode.substring(2), entry.city, entry.nameWithoutDiacritics, entry.subdivisionCode, "XX", entry.function, entry.date, entry.iata, entry.coordinates, `Use ${newUnlocode}`, "N/A", newUnlocode]
        writeCsv(dataOut, entries)
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

generateImprovedCoordinates()