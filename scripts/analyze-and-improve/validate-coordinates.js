const {readCsv} = require("./util/readCsv")
const {convertToDecimal, convertToUnlocode} = require("./util/coordinatesConverter")
const {getNominatimData, getSubdivisionCode, getNominatimDataByCity} = require("./util/nominatim-loader")
const {downloadByCityIfNeeded} = require("./util/nominatim-downloader");

async function validateCoordinates() {
    const csvDatabase = await readCsv()

    for (const unlocode of Object.keys(csvDatabase)) {
        const entry = csvDatabase[unlocode]

        const decimalCoordinates = convertToDecimal(entry.coordinates)
        if (!decimalCoordinates || entry.country !== "IT") {
            continue
        }

        const nominatimData = await getNominatimData(unlocode)
        if (!nominatimData) {
            // Nominatim can't find it, which most likely means a non-standard name is found.
            // For example ITMND which has the name "Mondello, Palermo" or ITAQW with the name "Acconia Di Curinga"
            // These should be called "Mondello" and "Acconia" to be found in nominatim.

            // Let's ignore this for now because these 2 examples are actually fine.
            continue
        }

        const scrapeType = nominatimData.scrapeType
        const nominatimResult = nominatimData.result

        const lat = nominatimResult[0].lat;
        const lon = nominatimResult[0].lon;
        const countyCode = nominatimResult[0].address["ISO3166-2-lvl6"];
        const stateCode = nominatimResult[0].address["ISO3166-2-lvl4"];
        const state = nominatimResult[0].address.state;
        const county = nominatimResult[0].address.county;

        const distance = Math.round(getDistanceFromLatLonInKm(decimalCoordinates.latitude, decimalCoordinates.longitude, lat, lon));

        // TODO: when there's no subdivisionCode and there are more than 1 subdivisions in the nominatim results, suggest setting the region to the one of the closest nominatim entry
        //  if that's within 25 km + the diameter of the bounding box / 2

        if (distance > 100) {
            let nominatimQuery = `https://nominatim.openstreetmap.org/search?format=jsonv2&accept-language=en&addressdetails=1&limit=20&city=${encodeURI(entry.city)}&country=${encodeURI(entry.country)}`
            if (scrapeType === "byRegion") {
                nominatimQuery += `&state=${encodeURI(state)}`
            }

            if (scrapeType === "byRegion" && getSubdivisionCode(nominatimResult[0]) !== entry.subdivisionCode) {
                throw new Error(`${unlocode} has unexpected region stuff going on`)
            }

            if (!entry.subdivisionCode) {
                // It could be that the first result is just the wrong one. Let's see if we can find a close one (which probably is the correct one)
                const closeResults = nominatimResult.filter(n => {
                    return getDistanceFromLatLonInKm(decimalCoordinates.latitude, decimalCoordinates.longitude, n.lat, n.lon) < 25
                })
                if (closeResults.length !== 0) {
                    const subdivisionCodes = closeResults.map(nd => getSubdivisionCode(nd))
                    const uniqueSubdivisionCodes = [...new Set(subdivisionCodes)]
                    const extraLog = Array.from(uniqueSubdivisionCodes).join(' or ')
                    let toLog = `https://unlocode.info/${unlocode}: (${entry.city}): There are ${nominatimResult.length} different results for ${entry.city} in ${entry.country}. Let's set the region to ${extraLog} to avoid the confusion.`
                    if (closeResults.length === 1) {
                        toLog += ` Source: https://www.openstreetmap.org/${closeResults[0].osm_type}/${closeResults[0].osm_id}`
                    }
                    console.log(toLog)
                } else {
                    // TODO: something
                    console.log(`HALP! I don't know what to do with ${unlocode}`)
                }
            }
            else if (scrapeType === "byCity" && getSubdivisionCode(nominatimResult[0]) !== entry.subdivisionCode) {
                const subdivisionCodes = nominatimResult.map(nd => getSubdivisionCode(nd))
                const uniqueSubdivisionCodes = [...new Set(subdivisionCodes)]
                console.log(`https://unlocode.info/${unlocode}: (${entry.city}): No ${entry.city} found in ${entry.subdivisionCode}! The subdivision code and coordinates should probably be updated to ${entry.city} in ${Array.from(uniqueSubdivisionCodes).join(' or ')}`)
            } else {
                // TODO: fix ITAN2: (Antignano). The coordinates point to Antignano,Livorno, but there actually is a village Antignano, Asti. Automatically detect this.
                const allInCorrectRegion = nominatimResult.every(n => getSubdivisionCode(n) === entry.subdivisionCode)
                if (scrapeType === "byRegion" && allInCorrectRegion) {
                    // All are in the correct region. Let's scrape by city as well to see if there is a location in another region whare the coordinates do match (like ITAN2)
                    // This means that either the coordinates are wrong, or the region is wrong.
                    // Example: ITAN2
                    await downloadByCityIfNeeded(entry)
                    const nominatimDataByCity = getNominatimDataByCity(unlocode).result
                    const closeInAnyRegion = nominatimDataByCity.filter(n => {
                        return getDistanceFromLatLonInKm(decimalCoordinates.latitude, decimalCoordinates.longitude, n.lat, n.lon) < 25
                    })

                    if (closeInAnyRegion.length !== 0) {
                        const detected = closeInAnyRegion[0]
                        const detectedSubdivisionCode = getSubdivisionCode(detected)
                        const detectedCoordinates = convertToUnlocode(detected.lat, detected.lon)
                        console.log(`https://unlocode.info/${unlocode}: (${entry.city}): This entry has the subdivision code ${entry.subdivisionCode}, but the coordinates point to ${detected.name} in ${detectedSubdivisionCode}! Either change the region to ${detectedSubdivisionCode} or change the coordinates to ${detectedCoordinates}.`)
                    } else {
                        console.log(`TODO: not yet thought out case encountered at ${unlocode}`)
                    }
                }

                console.log(`https://unlocode.info/${unlocode}: (${entry.city}), // ${entry.subdivisionCode}${entry.subdivisionName ? ` => ${entry.subdivisionName}` : ""} vs ${countyCode ? countyCode + " => " : ""}${county} ${decimalCoordinates.latitude}, ${decimalCoordinates.longitude} vs ${lat}, ${lon} => ${distance} km apart. ${nominatimQuery}`)
            }

        }
    }
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371 // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1) // deg2rad below
    const dLon = deg2rad(lon2 - lon1)
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c // Distance in km
    return d
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

validateCoordinates()