const {readCsv} = require("./util/readCsv")
const {convertToDecimal} = require("./util/coordinatesConverter")
const fs = require("fs")

async function createReport() {
    const csvDatabase = await readCsv()

    for (const unlocode of Object.keys(csvDatabase)) {
        const entry = csvDatabase[unlocode]

        const decimalCoordinates = convertToDecimal(entry.coordinates)
        if (!decimalCoordinates || entry.country !== "IT") {
            continue
        }

        const nominatimData = await getNominatimData(unlocode)
        if (!nominatimData) {
            // When nominatim can't find it, there's a good chance the name is wrong, but let's ignore that for now
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

        if (distance > 100) {
            let nominatimQuery = `https://nominatim.openstreetmap.org/search?format=jsonv2&accept-language=en&addressdetails=1&limit=20&city=${encodeURI(entry.city)}&country=${encodeURI(entry.country)}`
            if (scrapeType === "byRegion") {
                nominatimQuery += `&state=${encodeURI(state)}`
            }

            console.log(`https://unlocode.info/${unlocode}: (city: ${entry.city}), // ${entry.subdivisionCode}${entry.subdivisionName ? ` => ${entry.subdivisionName}` : ""} vs ${countyCode ? countyCode + " => ": ""}${county} ${decimalCoordinates.latitude}, ${decimalCoordinates.longitude} vs ${lat}, ${lon} => ${distance} km apart. ${nominatimQuery}`)
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

async function getNominatimData(unlocode) {
    const country = unlocode.substring(0,2)
    const location = unlocode.substring(2)

    const directoryRoot = `../../data/nominatim/${country}/${location}`
    const byRegionFileName = `${directoryRoot}/byRegion/${unlocode}.json`
    const byRegionExists = fs.existsSync(byRegionFileName)
    if (byRegionExists) {
        const byRegion = fs.readFileSync(byRegionFileName, 'utf8')
        if (byRegion !== "[]") {
            return { scrapeType: "byRegion", result: JSON.parse(byRegion) }
        }
    }

    const byCityFileName = `${directoryRoot}/cityOnly/${unlocode}.json`
    const byCityExists = fs.existsSync(byCityFileName)
    if (!byCityExists) {
        return undefined
    }
    const byCity = fs.readFileSync(byCityFileName, 'utf8')
    if (byCity === "[]") {
        return undefined
    } else {
        return { scrapeType: "byCity", result: JSON.parse(byCity) }
    }
}

createReport()