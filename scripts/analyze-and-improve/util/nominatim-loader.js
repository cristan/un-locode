const fs = require('fs')
const {getDistanceFromLatLonInKm} = require("./coordinatesConverter");

async function getNominatimData(unlocode) {
    const nominatimData = await loadNominatimData(unlocode)
    if (!nominatimData) {
        return undefined
    }
    const nominatimResult = nominatimData.result

    const withoutUselessEntries = filterOutUselessEntries(nominatimResult);
    if (withoutUselessEntries.length === 0) {
        return undefined
    }

    addConvenienceAttributes(withoutUselessEntries)

    return {scrapeType: nominatimData.scrapeType, result: withoutUselessEntries}
}

async function loadNominatimData(unlocode) {
    const country = unlocode.substring(0, 2)
    const location = unlocode.substring(2)

    const directoryRoot = `../../data/nominatim/${country}/${location}`
    const byRegionFileName = `${directoryRoot}/byRegion/${unlocode}.json`
    const byRegionExists = fs.existsSync(byRegionFileName)
    if (byRegionExists) {
        const byRegion = fs.readFileSync(byRegionFileName, 'utf8')
        if (byRegion !== "[]") {
            return {scrapeType: "byRegion", result: JSON.parse(byRegion)}
        }
    }
    getNominatimDataByCity(unlocode)
}

function getNominatimDataByCity(unlocode) {
    const country = unlocode.substring(0, 2)
    const location = unlocode.substring(2)
    const directoryRoot = `../../data/nominatim/${country}/${location}`
    const byCityFileName = `${directoryRoot}/cityOnly/${unlocode}.json`
    const byCityExists = fs.existsSync(byCityFileName)
    if (!byCityExists) {
        return undefined
    }
    const byCity = fs.readFileSync(byCityFileName, 'utf8')
    if (byCity === "[]") {
        return undefined
    } else {

        const withoutUselessEntries = filterOutUselessEntries(JSON.parse(byCity))
        if (withoutUselessEntries.length === 0) {
            return undefined
        }

        addConvenienceAttributes(withoutUselessEntries)

        return {scrapeType: "byCity", result: withoutUselessEntries}
    }
}

function filterOutUselessEntries(nominatimResult) {
    // Boundaries aren't places. Put at the bottom for now.
    // Categories can be place, boundary, landuse, waterway, natural, mountain_pass, leisure

    // Filter out anything which isn't a place or a boundary
    const filteredByCategory = nominatimResult.filter(n => n.category === "place" || n.category === "boundary")

    // The isolated dwelling tag is used for named places that are smaller than a hamlet - no more than a few buildings
    // Assume there are no unlocodes for places that small.
    const withoutIsolatedDwelling = filteredByCategory.filter(n => n.addresstype !== "isolated_dwelling");

    // Filter out locations which are super close
    // Example: https://nominatim.openstreetmap.org/search?format=jsonv2&accept-language=en&addressdetails=1&limit=20&city=Castelletto%20di%20Branduzzo&country=IT&state=PV
    // In this example, it's tempting to filter out the boundary, as that sounds more vague than a place.
    // However, we are actually interested in the first result (which is the boundary)
    // So instead, filter out locations which are super close
    const withoutVeryClosePlaces = withoutIsolatedDwelling.filter(w => {
        const veryCloseExists = withoutIsolatedDwelling.some(o => o.importance > w.importance && getDistanceFromLatLonInKm(w.lat, w.lon, o.lat, o.lon) < 25)

        return !veryCloseExists
    })

    return withoutVeryClosePlaces
}

function addConvenienceAttributes(nominatimResult) {
    nominatimResult.forEach(n => {
        n.subdivisionCode = getSubdivisionCode(n)
        n.sourceUrl =`https://www.openstreetmap.org/${n.osm_type}/${n.osm_id}`
    })
    return nominatimResult
}

function getSubdivisionCode(nominatimElement) {
    return nominatimElement.address["ISO3166-2-lvl6"]?.substring(3) ?? nominatimElement.address["ISO3166-2-lvl4"]?.substring(3)
}

module.exports = {
    getNominatimData,
    getNominatimDataByCity,
}