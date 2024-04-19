import {convertToDecimal, getDistanceFromLatLonInKm} from "./coordinatesConverter.js";
import {getAlternativeNames} from "./coordinates-validator.js";

export function getInvalidRegionMessage(entry, nominatimData) {
    if (entry.subdivisionName) {
        // That's good: the region could be resolved
        return
    }
    if (!entry.subdivisionCode) {
        // No subdivision defined at all. That's not what we're testing here
        return undefined
    }

    if (!nominatimData) {
        // Not what we're testing now
        return undefined
    }

    const decimalCoordinates = convertToDecimal(entry.coordinates)
    const closeResults = nominatimData.result.filter(n => {
        return getDistanceFromLatLonInKm(decimalCoordinates.lat, decimalCoordinates.lon, n.lat, n.lon) < 100
    })

    const baseErrorMessage = `The subdivision code (${entry.subdivisionCode}) doesn't match any region! `
    return getRegionErrorMessage(entry, baseErrorMessage, closeResults, nominatimData);
}

export function getNoRegionMessage(entry, nominatimData) {
    if (entry.subdivisionCode && entry.subdivisionCode.length > 0) {
        // This method is for giving an error when no subdivision exists. Return when it does
        return undefined
    }

    if (!nominatimData) {
        // Not what we're testing now
        return undefined
    }

    const decimalCoordinates = convertToDecimal(entry.coordinates)
    const closeResults = nominatimData.result.filter(n => {
        return getDistanceFromLatLonInKm(decimalCoordinates.lat, decimalCoordinates.lon, n.lat, n.lon) < 100
    })

    const baseErrorMessage = `No subdivision code specified!`
    return getRegionErrorMessage(entry, baseErrorMessage, closeResults, nominatimData)
}

function getRegionErrorMessage(entry, baseErrorMessage, closeResults, nominatimData) {
    let message = `https://unlocode.info/${entry.unlocode}: (${entry.city}): `
    message += baseErrorMessage
    if (closeResults.length === 0) {
        return message
        // TODO: also check for non-close results
    }
    const closeResult = closeResults[0]
    if (closeResult.subdivisionCode) {
        message += `Please change the region to ${closeResult.subdivisionCode}.`
    } else {
        message += `The coordinates seem right (${closeResult.name} is here), but the region should be changed.`
    }
    const otherAlternatives = nominatimData.result
        .filter(nm => {
            return nm !== closeResult
        })
    const otherAlternativesInOtherRegion = otherAlternatives.some(a => a.subdivisionCode !== closeResults.subdivisionCode)
    if (otherAlternatives.length > 0 && otherAlternativesInOtherRegion) {
        message += ` It could also be that ${getAlternativeNames(otherAlternatives)} is meant.`
    }
    return message
}