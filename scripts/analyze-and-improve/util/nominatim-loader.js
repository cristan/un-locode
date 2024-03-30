const fs = require('fs')

async function getNominatimData(unlocode) {
    const nominatimData = await loadNominatimData(unlocode)
    if (!nominatimData) {
        return undefined
    }
    const nominatimResult = nominatimData.result

    // Boundaries aren't places. Put at the bottom for now.
    // Categories can be place, boundary, landuse, waterway, natural, mountain_pass, leisure

    // For now, we first return places, then boundaries, then everything else
    const places = nominatimResult.filter(n => n.category === "place")
    const boundaries = nominatimResult.filter(n => n.category === "boundary")
    const everythingElse = nominatimResult.filter(n => n.category !== "place" && n.category !== "boundary")

    const sortedByCategory = places.concat(boundaries).concat(everythingElse)

    // The isolated dwelling tag is used for named places that are smaller than a hamlet - no more than a few buildings
    // Assume there are no unlocodes for places that small.
    const withoutUselessEntries = sortedByCategory.filter(n => n.addresstype !== "isolated_dwelling")
    if (withoutUselessEntries.length === 0) {
        return undefined
    }

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
        return {scrapeType: "byCity", result: JSON.parse(byCity)}
    }
}

function getSubdivisionCode(nominatimElement) {
    return nominatimElement.address["ISO3166-2-lvl6"]?.substring(3) ?? nominatimElement.address["ISO3166-2-lvl4"]?.substring(3)
}

module.exports = {
    getNominatimData,
    getNominatimDataByCity,
    getSubdivisionCode
}