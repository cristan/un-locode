import {readCsv} from "./util/readCsv.js";
import {
    convertToBoth,
    convertToDecimal,
    convertToUnlocode,
    getDistanceFromLatLonInKm
} from "./util/coordinatesConverter.js";
import {getNominatimData} from "./util/nominatim-loader.js";
import {validateCoordinates} from "./util/coordinates-validator.js";
import {UNLOCODE_BEST} from "./manual-unlocode-best.js";
import {getInvalidRegionMessage, getNoRegionMessage} from "./util/region-validator.js";
import {readWikidata} from "./util/wikidata-reader.js";
import {detectCoordinates} from "./util/coordinate-detector.js";

async function validateEntries() {
    // console.debug = function() {};

    const csvDatabase = await readCsv()
    const wikiData = readWikidata()

    console.log()

    const coordinatesLogs = []
    const invalidRegionMessages = []
    const noSuggestionFoundMessages = []
    const newCoordinateLogs = []


    const useHtml = true

    const filteredEntries = Object.values(csvDatabase).filter(entry => {
        return entry.country === "GB"
    })
    for (const entry of Object.values(filteredEntries)) {
        const unlocode = entry.unlocode
        const wikiEntry = wikiData[unlocode]

        const nominatimData = await getNominatimData(entry)
        const coordinatesLog = await validateCoordinates(entry, nominatimData)
        if (coordinatesLog) {
            coordinatesLogs.push(coordinatesLog)
        } else {
            const invalidRegionMessage = getInvalidRegionMessage(entry, nominatimData)
            if (invalidRegionMessage) {
                invalidRegionMessages.push(invalidRegionMessage)
            }
        }

        if (!entry.coordinates) {
            const detected = await detectCoordinates(entry, nominatimData, wikiEntry, 100)
            if (!detected) {
                noSuggestionFoundMessages.push(`https://unlocode.info/${entry.unlocode}: (${entry.city}): Entry could not be found and has no coordinates. Please validate if this entry should be kept`)
            } else {
                const options = detected.options ?? [detected]
                const optionsString = options
                    .map(o => {
                        if (o.sources) {
                            return `${convertToBoth(o.lat, o.lon)} Sources: ${o.sources.map(s => s.sourceUrl).join(" and ")}`
                        } else {
                            return `${convertToBoth(o.lat, o.lon)} Source: ${o.sourceUrl}`
                        }
                    })
                    .join(" or ")
                newCoordinateLogs.push(`https://unlocode.info/${unlocode} (${entry.city}) Coordinates should be set to ${optionsString}`)
            }
        }
    }

    if (coordinatesLogs.length > 0) {
        console.log("<h1>Location issues</h1>")
    }
    for (const coordinatesLog of coordinatesLogs) {
        doLog(coordinatesLog + "\n", useHtml)
    }

    if (invalidRegionMessages.length > 0) {
        console.log("<h1>Non-valid region codes used</h1>")
    }
    for (const invalidRegionMessage of invalidRegionMessages) {
        doLog(invalidRegionMessage, useHtml)
    }

    const noRegionMessages = filteredEntries.map(entry => {
        return getNoRegionMessage(entry)
    }).filter(noRegionMessage => !!noRegionMessage)

    if (noRegionMessages.length > 0) {
        console.log(`<h1>Entries without a region</h1>`)
    }
    for (const noRegionMessage of noRegionMessages) {
        doLog(noRegionMessage, useHtml)
    }

    if (newCoordinateLogs.length > 0) {
        console.log(`<h1>Suggested new coordinates</h1>`)
    }
    for (const newCoordinateLog of newCoordinateLogs) {
        doLog(newCoordinateLog, useHtml)
    }

    if (noSuggestionFoundMessages.length > 0) {
        console.log(`<h1>Entries who could not be found</h1>`)
    }
    for (const noSuggestionFoundMessage of noSuggestionFoundMessages) {
        doLog(noSuggestionFoundMessage, useHtml)
    }

    const noStatusLogs = Object.values(filteredEntries).flatMap(csvEntry => csvEntry.status ? [] : `https://unlocode.info/${csvEntry.unlocode}`)
    if (noStatusLogs.length > 0) {
        console.log(`<h1>Entries without a status</h1>`)
    }
    for (const noStatusLog of noStatusLogs) {
        doLog(noStatusLog, useHtml)
    }

    const noDateLogs = Object.values(filteredEntries).flatMap(csvEntry => csvEntry.date ? [] : `https://unlocode.info/${csvEntry.unlocode}`)
    if (noDateLogs.length > 0) {
        console.log(`<h1>Entries without date</h1>`)
    }
    for (const noDateLog of noDateLogs) {
        doLog(noDateLog, useHtml)
    }

    // const coordinateGroups = {}; // Object to store groups of entries with the same coordinates
    //
    // // Group entries by coordinates
    // Object.values(filteredEntries).forEach(entry => {
    //     const coordinatesString = entry.coordinates.toString();
    //     if (!coordinateGroups[coordinatesString]) {
    //         coordinateGroups[coordinatesString] = [];
    //     }
    //     coordinateGroups[coordinatesString].push(entry);
    // });
    //
    // // Log entries with duplicate coordinates
    // console.log(`<h1>Entries with duplicate coordinates</h1>`)
    // for (const coordinatesString in coordinateGroups) {
    //     const entries = coordinateGroups[coordinatesString];
    //     if (entries.length > 1 && coordinatesString.length > 1) {
    //         const entryLinks = entries.map(entry => `<a href="https://unlocode.info/${entry.unlocode}">${entry.city}</a>`).join(', ');
    //         const logMessage = `<p>${entryLinks} share the same coordinates (${coordinatesString})</p>`;
    //         doLog(logMessage, false);
    //     }
    // }

    // TODO: show number of results after each header
    // TODO: take into account wikidata for the coordinate suggestions (not for GB, but definitely for IT)
    // TODO: Clickable coordinates?
    // TODO: Wrong name?
    // TODO: Determine when an entry has been added in case of missing date?
    // TODO: Wrong status? (like Request Rejected or Request under Consideration, while it's more than 10 years old)
}

function doLog(text, useHtml) {
    if (!useHtml) {
        console.log(text +"\n")
    } else {
        // const urlReplacement = "https://www.openstreetmap.org/#map=12/$2/$3"
        const urlReplacement = "https://www.google.com/maps/@$2,$3,12z"

        const html = text
                .replaceAll(/https:\/\/unlocode\.info\/(\w{5})/g, '<a href="$&">$1</a>')
                .replaceAll(/(\d*[NS]\s\d*[EW]) \((-?[\d\.]*), (-?[\d\.]*)\)/g, `<a href="${urlReplacement}">$1</a>`)
        console.log(html.replaceAll("\n", "<br>")+"<br>")
    }
}

validateEntries()