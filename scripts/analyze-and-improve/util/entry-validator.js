import {
    convertNmToUnlocodeText,
    convertToDecimal,
    getDistanceFromLatLonInKm
} from "./coordinatesConverter.js";
import {downloadByCityIfNeeded} from "./nominatim-downloader.js";
import {isSmallVillage, readNominatimDataByCity} from "./nominatim-loader.js";
import {FALSE_POSITIVES} from "../false-positives.js";

/**
 * Checks if the coordinates don't match the first hit on Nominatim and returns an as helpful error message as possible.
 * Note that this doesn't have to be coordinates related: it could also be caused by an incorrect region.
 */
// TODO: problematic case: ITB52: this doesn't exist in OpenStreetMap :O
// TODO: https://unlocode.info/CVBVC points to the one in the wrong country (or MDCAL, MYGTB) :O
export async function validateCoordinates(entry, nominatimData) {
    const decimalCoordinates = convertToDecimal(entry.coordinates)
    if (!decimalCoordinates) {
        // Ignore entries without coordinates for now.
        // Invalid coordinates are already handled by the validate-coordinates.js.
        return
    }
    const unlocode = entry.unlocode
    const nominatimResult = nominatimData.result
    const distance = Math.round(getDistanceFromLatLonInKm(decimalCoordinates.latitude, decimalCoordinates.longitude, nominatimResult[0].lat, nominatimResult[0].lon));
    if (distance < 100 || FALSE_POSITIVES.includes(unlocode)) {
        // The first result is close enough. Let's validate whether the subdivisionCode exists yet though
        if (entry.subdivisionCode && !entry.subdivisionName) {
            const closeResults = nominatimResult.filter(n => {
                return getDistanceFromLatLonInKm(decimalCoordinates.latitude, decimalCoordinates.longitude, n.lat, n.lon) < 100
            })
            return getInvalidSubdivisionCodeMessage(unlocode, entry, nominatimResult, closeResults)
        }
        return undefined
    }
    const scrapeType = nominatimData.scrapeType
    let nominatimQuery = `https://nominatim.openstreetmap.org/search?format=jsonv2&accept-language=en&addressdetails=1&limit=20&city=${encodeURI(entry.city)}&country=${encodeURI(entry.country)}`
    if (scrapeType === "byRegion") {
        nominatimQuery += `&state=${entry.country}-${entry.subdivisionCode}`
    }
    if (scrapeType === "byRegion" && nominatimResult[0].subdivisionCode !== entry.subdivisionCode) {
        throw new Error(`https://unlocode.info/${unlocode} has unexpected region stuff going on. ${nominatimQuery}`)
    }
    const allInCorrectRegion = nominatimResult.every(n => n.subdivisionCode === entry.subdivisionCode)

    if (!entry.subdivisionCode) {
        // It could be that the first result is just the wrong one. Let's see if we can find a close one (which probably is the correct one)
        const closeResults = nominatimResult.filter(n => {
            return getDistanceFromLatLonInKm(decimalCoordinates.latitude, decimalCoordinates.longitude, n.lat, n.lon) < 25
        })
        if (closeResults.length !== 0) {
            const closeResult = closeResults[0]
            if (scrapeType === "byCity" && !closeResult.subdivisionCode) {
                // We couldn't find it by region, but we can find a close one by city and that one doesn't have a region set.
                // This means that the region simply isn't set in OpenStreetMap, so we can't validate this: ignore.
                // (this the case for ATARN which is a false positive)
                return undefined
            }
            const subdivisionCodes = closeResults.map(nd => nd.subdivisionCode)
            const uniqueSubdivisionCodes = [...new Set(subdivisionCodes)]
            const suggestedRegion = Array.from(uniqueSubdivisionCodes).join(' or ')
            const differentResults = nominatimResult.length === 1 ? "There is 1 different result": `There are ${nominatimResult.length} different results`;
            let toLog = `https://unlocode.info/${unlocode}: (${entry.city}): ${differentResults} for ${entry.city} in ${entry.country}. Let's set the region to ${suggestedRegion} to avoid the confusion.`
            if (closeResults.length === 1) {
                toLog += ` Source: ${closeResults[0].sourceUrl}`
            }
            return toLog
        } else {
            return getIncorrectLocationLog(nominatimResult, decimalCoordinates, entry, unlocode)
        }
    }
    else if (scrapeType === "byCity" && nominatimResult[0].subdivisionCode !== entry.subdivisionCode) {
        // First hit doesn't match the subdivision code, and we scraped by city (so we couldn't find anything with the matching region).
        const closeResults = nominatimResult.filter(n => {
            return getDistanceFromLatLonInKm(decimalCoordinates.latitude, decimalCoordinates.longitude, n.lat, n.lon) < 25
        })

        let message = `https://unlocode.info/${unlocode}: (${entry.city}): `
        const validSubdivisionCode = !!entry.subdivisionName
        if (!validSubdivisionCode) {
            message += `Invalid subdivision code ${entry.subdivisionCode}! `
        } else {
            message += `No ${entry.city} found in ${entry.subdivisionCode}! `
        }
        if (closeResults.length !== 0) {
            const closeResult = closeResults[0]
            if (scrapeType === "byCity" && !closeResult.subdivisionCode) {
                // We couldn't find it by region, but we can find a close one by city and that one doesn't have a region set.
                // This means that the region simply isn't set in OpenStreetMap, so we can't validate this: ignore.
                // (this is valid for ATARN: (Auern) which is a false positive, but maybe is invalid for BSGTC (Green Turtle Cay, unclear what the region actually is)
                // but without any data in OpenStreetMap, there's no way to validate this.
                return undefined
            }
            if (!validSubdivisionCode) {
                message += `Please change the region to ${closeResult.subdivisionCode}.`
            } else {
                message += `${closeResult.name} (${closeResult.subdivisionCode}) does exist at the provided coordinates, so the region should probably be changed to ${closeResult.subdivisionCode}.`
            }
            const otherAlternatives = nominatimResult
                .filter(nm => {
                    return nm !== closeResult
                })
            const otherAlternativesInOtherRegion = otherAlternatives.some(a => a.subdivisionCode !== closeResults.subdivisionCode)
            if (otherAlternatives.length > 0 && otherAlternativesInOtherRegion) {
                message += ` It could also be that ${getAlternativeNames(otherAlternatives)} is meant.`
            }
            return message
        } else {
            message +=`The subdivision code and coordinates should probably be updated to ${getAlternativeNames(nominatimResult)}`
            if (nominatimResult.length === 1) {
                const onlyResult = nominatimResult[0]
                // Example: CNUNA. This warning is important: the nominatim result is actually wrong.
                if (isSmallVillage(onlyResult)) {
                    message += ` (WARN: small village)`
                }
                message += `. Source: ${nominatimResult[0].sourceUrl}`
            }
            return `${message}.`
        }
    }
    else if (nominatimResult.some(nm => getDistanceFromLatLonInKm(decimalCoordinates.latitude, decimalCoordinates.longitude, nm.lat, nm.lon) < 100)) {
        // Wrong first hit in Nominatim, but there's actually a hit which does match the coordinates
        let closeItems = nominatimResult.filter(nm => getDistanceFromLatLonInKm(decimalCoordinates.latitude, decimalCoordinates.longitude, nm.lat, nm.lon) < 100)
        const biggestCloseLocationRank = closeItems.reduce((min, current) => Math.min(min, current.place_rank), Infinity);
        const biggestLocationFromResultsRank = nominatimResult.reduce((min, current) => Math.min(min, current.place_rank), Infinity);
        if (biggestCloseLocationRank >= 18 && biggestCloseLocationRank.addresstype !== "industrial" && biggestLocationFromResultsRank <= 16) {
            // Example: https://unlocode.info/CNSTI
            const biggerResults = nominatimResult.filter(nm => nm.place_rank <= 16)
            const biggerResultText = biggerResults.map(b => `${b.addresstype} ${b.name} at ${convertNmToUnlocodeText(b)} (${Math.round(getDistanceFromLatLonInKm(decimalCoordinates.latitude, decimalCoordinates.longitude, b.lat, b.lon))} km away; source: ${b.sourceUrl})`).join(' or ')
            return `https://unlocode.info/${unlocode}: (${entry.city}): The coordinates do point to ${closeItems[0].name}, but it's a small ${closeItems[0].addresstype} and you have the bigger ${biggerResultText}. Please doublecheck if this is pointing to the correct location.`
        }
        // Example: https://unlocode.info/CNBCO
    }
    else if (scrapeType === "byRegion" && allInCorrectRegion) {
        // All are in the correct region. Let's scrape by city as well to see if there is a location in another region where the coordinates do match (like ITAN2)
        // This means that either the coordinates are wrong, or the region is wrong.
        // Example: ITAN2: The coordinates point to Antignano,Livorno, but there actually is a village Antignano, Asti. Automatically detect this.

        await downloadByCityIfNeeded(entry)
        // In some super duper rare cases, can we find something by region which and we can't find anything at all when
        // not searching by region (happens at PKSAW), hence the null check
        const nominatimDataByCity = readNominatimDataByCity(unlocode)?.result

        let closestDistance = Number.MAX_VALUE
        let closestInAnyRegion = undefined
        nominatimDataByCity?.forEach(c => {
            const distance = getDistanceFromLatLonInKm(decimalCoordinates.latitude, decimalCoordinates.longitude, c.lat, c.lon);
            if (distance < closestDistance) {
                closestInAnyRegion = c
                closestDistance = distance
            }
        })

        if (closestDistance < 25) {
            const detectedSubdivisionCode = closestInAnyRegion.subdivisionCode
            let message = `https://unlocode.info/${unlocode}: (${entry.city}): This entry has the subdivision code ${entry.subdivisionCode}, but the coordinates point to ${closestInAnyRegion.name} in ${detectedSubdivisionCode}! Either change the region to ${detectedSubdivisionCode} or change the coordinates to `
            if (nominatimResult.length === 1) {
                const onlyResult = nominatimResult[0];
                message += `${convertNmToUnlocodeText(onlyResult)} (${closestInAnyRegion.sourceUrl})`
                if (onlyResult.name !== entry.city) {
                    message += ` where ${onlyResult.name} (in ${onlyResult.subdivisionCode}) is located`
                }
                if (isSmallVillage(onlyResult)) {
                    message += ` (WARN: small village)`
                }
                message += "."
            } else {
                message += `any of the ${nominatimResult.length} locations in ${entry.subdivisionCode}.`
            }
            return message
        } else {
            // Nothing close found when searching for any region either. The location is probably just wrong.
            if (entry.subdivisionCode !== nominatimResult[0].subdivisionCode) {
                throw new Error(`${unlocode} This shouldn't be possible`)
            }

            return getIncorrectLocationLog(nominatimResult, decimalCoordinates, entry, unlocode)
        }
    }
    else {
        // No special cases whatsoever. Just return the regular wrong coordinates output.
        // This is actually pretty rare. Example: https://unlocode.info/EEMAR
        return getIncorrectLocationLog(nominatimResult, decimalCoordinates, entry, unlocode)
    }
}

function getIncorrectLocationLog(nominatimResult, decimalCoordinates, entry, unlocode) {
    const options = nominatimResult.map(nm => {
        const smallVillage = isSmallVillage(nm)
        const before = smallVillage ? "maybe " : ""
        const distance = Math.round(getDistanceFromLatLonInKm(decimalCoordinates.latitude, decimalCoordinates.longitude, nominatimResult[0].lat, nominatimResult[0].lon))
        let after = ""
        if (nm.name !== entry.city) {
            after += ` where ${nm.name} is located`
        }
        if (smallVillage) {
            after += ` (WARN: small village)`
        }
        return `${before}${convertNmToUnlocodeText(nm)} = ${distance} km${distance > 1000 ? '(!)' : ""} away${after}; source: ${nm.sourceUrl}`
    })
    const allOptions = Array.from(options).join(' or ')

    return `https://unlocode.info/${unlocode}: (${entry.city}): Coordinates ${entry.coordinates} (${decimalCoordinates.latitude}, ${decimalCoordinates.longitude}) should be changed to ${allOptions}`
}

function getAlternativeNames(alternatives) {
    let lastAlternativeName = ""
    let regionsThisName = []

    const mapped = alternatives.map(a => {
        const subdivisionCode = a.subdivisionCode ?? "<unspecified subdivision>"
        if (lastAlternativeName === a.name) {
            if (regionsThisName.includes(subdivisionCode)) {
                // No need for a Bagong in GX or GX (example: CNBGG)
                return ""
            } else {
                regionsThisName.push(subdivisionCode)
            }
            return `${subdivisionCode} (${convertNmToUnlocodeText(a)})`
        } else {
            regionsThisName = [subdivisionCode]
            lastAlternativeName = a.name
            return `${a.name} in ${subdivisionCode} (${convertNmToUnlocodeText(a)})`
        }
    }).filter(a => a !== "")
    const uniqueMapped = [...new Set(mapped)]
    return uniqueMapped.join(' or ')
}

function getInvalidSubdivisionCodeMessage(unlocode, entry, nominatimResult, closeResults) {
    let message = `https://unlocode.info/${unlocode}: (${entry.city}): `
    message += `Invalid subdivision code ${entry.subdivisionCode}! `
    const closeResult = closeResults[0]
    message += `Please change the region to ${closeResult.subdivisionCode}.`
    const otherAlternatives = nominatimResult
        .filter(nm => {
            return nm !== closeResult
        })
    const otherAlternativesInOtherRegion = otherAlternatives.some(a => a.subdivisionCode !== closeResults.subdivisionCode)
    if (otherAlternatives.length > 0 && otherAlternativesInOtherRegion) {
        message += ` It could also be that ${getAlternativeNames(otherAlternatives)} is meant.`
    }
    return message
}