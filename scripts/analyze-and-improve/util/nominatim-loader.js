const fs = require('fs')

async function getNominatimData(unlocode) {
    const nominatimData = await loadNominatimData(unlocode)
    if (!nominatimData) {
        return undefined
    }
    const nominatimResult = nominatimData.result

    // Boundaries aren't places. Put at the bottom for now.
    const boundaries = nominatimResult.filter(n => n.category === "boundary")
    // There are other categories like landuse.
    const everythingElse = nominatimResult.filter(n => n.category !== "boundary")

    return {scrapeType: nominatimData.scrapeType, result: everythingElse.concat(boundaries)}
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
    getSubdivisionCode
}