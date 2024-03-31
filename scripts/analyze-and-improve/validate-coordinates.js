const {readCsv} = require("./util/readCsv")
const {convertToDecimal, convertToUnlocode, getDistanceFromLatLonInKm} = require("./util/coordinatesConverter")
const {getNominatimData, readNominatimDataByCity} = require("./util/nominatim-loader")
const {downloadByCityIfNeeded} = require("./util/nominatim-downloader");

// TODO: problematic case: ITB52: this doesn't exist in OpenStreetMap :O
// TODO: ITPSU.
async function validateCoordinates() {
    console.debug = function() {};

    const csvDatabase = await readCsv()

    for (const unlocode of Object.keys(csvDatabase)) {
        const entry = csvDatabase[unlocode]

        const decimalCoordinates = convertToDecimal(entry.coordinates)
        if (!decimalCoordinates || entry.country !== "CN") {
            continue
        }

        const nominatimData = await getNominatimData(entry)
        if (!nominatimData) {
            // Nominatim can't find it, which most likely means a non-standard name is found.
            // For example ITMND which has the name "Mondello, Palermo" or ITAQW with the name "Acconia Di Curinga"
            // These should be called "Mondello" and "Acconia" to be found in nominatim.

            // Let's ignore this for now because these 2 examples are actually fine.
            continue
        }

        const scrapeType = nominatimData.scrapeType
        const nominatimResult = nominatimData.result

        const distance = Math.round(getDistanceFromLatLonInKm(decimalCoordinates.latitude, decimalCoordinates.longitude, nominatimResult[0].lat, nominatimResult[0].lon));

        if (distance > 100) {
            let nominatimQuery = `https://nominatim.openstreetmap.org/search?format=jsonv2&accept-language=en&addressdetails=1&limit=20&city=${encodeURI(entry.city)}&country=${encodeURI(entry.country)}`
            if (scrapeType === "byRegion") {
                nominatimQuery += `&state=${entry.country}-${entry.subdivisionCode}`
            }

            if (scrapeType === "byRegion" && nominatimResult[0].subdivisionCode !== entry.subdivisionCode) {
                throw new Error(`https://unlocode.info/${unlocode} has unexpected region stuff going on. ${nominatimQuery}`)
            }

            if (!entry.subdivisionCode) {
                // It could be that the first result is just the wrong one. Let's see if we can find a close one (which probably is the correct one)
                const closeResults = nominatimResult.filter(n => {
                    return getDistanceFromLatLonInKm(decimalCoordinates.latitude, decimalCoordinates.longitude, n.lat, n.lon) < 25
                })
                if (closeResults.length !== 0) {
                    const subdivisionCodes = closeResults.map(nd => nd.subdivisionCode)
                    const uniqueSubdivisionCodes = [...new Set(subdivisionCodes)]
                    const extraLog = Array.from(uniqueSubdivisionCodes).join(' or ')
                    let toLog = `https://unlocode.info/${unlocode}: (${entry.city}): There are ${nominatimResult.length} different results for ${entry.city} in ${entry.country}. Let's set the region to ${extraLog} to avoid the confusion.`
                    if (closeResults.length === 1) {
                        toLog += ` Source: ${closeResults[0].sourceUrl}`
                    }
                    console.log(toLog + "\n")
                } else {
                    // TODO: something
                    throw new Error(`HALP! I don't know what to do with ${unlocode}`)
                }
            }
            else if (scrapeType === "byCity" && nominatimResult[0].subdivisionCode !== entry.subdivisionCode) {
                const subdivisionCodes = nominatimResult.map(nd => nd.subdivisionCode)
                const uniqueSubdivisionCodes = [...new Set(subdivisionCodes)]
                console.log(`https://unlocode.info/${unlocode}: (${entry.city}): No ${entry.city} found in ${entry.subdivisionCode}! The subdivision code and coordinates should probably be updated to ${entry.city} in ${Array.from(uniqueSubdivisionCodes).join(' or ')}\n`)
            } else if(nominatimResult.some(nm => getDistanceFromLatLonInKm(decimalCoordinates.latitude, decimalCoordinates.longitude, nm.lat, nm.lon) < 100)) {
                // Example: CNANP. First hit is somewhere else, but there is another which is close, and it's all in the same region. It's probably fine: continue
            } else {
                // All are in the correct region. Let's scrape by city as well to see if there is a location in another region whare the coordinates do match (like ITAN2)
                // This means that either the coordinates are wrong, or the region is wrong.
                // Example: ITAN2: The coordinates point to Antignano,Livorno, but there actually is a village Antignano, Asti. Automatically detect this.
                const allInCorrectRegion = nominatimResult.every(n => n.subdivisionCode === entry.subdivisionCode)
                if (scrapeType === "byRegion" && allInCorrectRegion) {
                    await downloadByCityIfNeeded(entry)
                    const nominatimDataByCity = readNominatimDataByCity(unlocode).result

                    let closestDistance = Number.MAX_VALUE
                    let closestInAnyRegion = undefined
                    nominatimDataByCity.forEach(c => {
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
                            message += `${convertToUnlocode(onlyResult.lat, onlyResult.lon)} (${closestInAnyRegion.sourceUrl})`
                            if (onlyResult.name !== entry.city) {
                                message += ` where ${onlyResult.name} (in ${onlyResult.subdivisionCode}) is located`
                            }
                            if (onlyResult.place_rank >= 19) {
                                message += ` (WARN: small village)`
                            }
                            message += "."
                        } else {
                            message += `any of the ${nominatimResult.length} locations in ${entry.subdivisionCode}.`
                        }
                        console.log(message)
                        console.debug(`Query which also searches by subdivision: ${nominatimQuery}\n`)
                        console.log()
                    } else {
                        // Nothing close found when searching for any region either. The location is probably just wrong.
                        if (entry.subdivisionCode !== nominatimResult[0].subdivisionCode) {
                            throw new Error(`${unlocode} This shouldn't be possible`)
                        }

                        const options = nominatimResult.map(nm => {
                            const smallVillage = nm.place_rank >= 19
                            const before =  smallVillage ? "maybe " : ""
                            const distance = Math.round(getDistanceFromLatLonInKm(decimalCoordinates.latitude, decimalCoordinates.longitude, nominatimResult[0].lat, nominatimResult[0].lon))
                            let after = ""
                            if (nm.name !== entry.city) {
                                after += ` where ${nm.name} is located`
                            }
                            if (smallVillage) {
                                after += ` (WARN: small village)`
                            }
                            return `${before}${convertToUnlocode(nm.lat, nm.lon)} (${nm.lat}, ${nm.lon}) = ${distance} km${distance > 1000 ? '(!)' : ""} away${after}; source: ${nm.sourceUrl}`
                        })
                        const allOptions = Array.from(options).join(' or ')

                        console.log(`https://unlocode.info/${unlocode}: (${entry.city}): Coordinates ${entry.coordinates} (${decimalCoordinates.latitude}, ${decimalCoordinates.longitude}) should be changed to ${allOptions}`)
                        console.debug(`Found via ${nominatimQuery}\n`)
                        console.log()
                    }
                } else {
                    throw new Error(`https://unlocode.info/${unlocode} Unexpected status encountered`)
                }
            }
        }
    }
}

validateCoordinates()