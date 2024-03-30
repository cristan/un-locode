const fs = require('fs')

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

async function getRegionCode(unlocode) {
    let nominatimData = await getNominatimData(unlocode);
    if (nominatimData) {
        const resultElement = nominatimData.result[0];
        return resultElement.address["ISO3166-2-lvl6"]?.substring(3)// ?? resultElement.address["ISO3166-2-lvl4"]?.substring(3)
    }
    return undefined
}

module.exports = {
    getNominatimData,
    getRegionCode
}