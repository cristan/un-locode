import {readCsv, readSubdivisionData} from "./util/readCsv.js";
import {getNominatimData} from "./util/nominatim-loader.js";

async function createReport() {
    const csvDatabase = await readCsv()
    const subdivisions = readSubdivisionData()

    for (const unlocode of Object.keys(csvDatabase)) {
        const entry = csvDatabase[unlocode]
        if (entry.country !== "CN") {
            continue
        }

        if (entry.subdivisionCode && !entry.subdivisionName) {
            console.log(`https://unlocode.info/${unlocode} (${entry.city}) has a non-existing region ${entry.subdivisionCode}.`)
            const nominatimData = (await getNominatimData(entry))?.result
            if (nominatimData) {
                const subdivisionCodes = nominatimData.map(nd => {
                    const nominatimRegionCode = nd.subdivisionCode
                    const mappedSubdivision = subdivisions[entry.country + '|' + nominatimRegionCode]
                    return `${nominatimRegionCode} (${mappedSubdivision})`
                })
                const uniqueSubdivisionCodes = [...new Set(subdivisionCodes)]
                const logSubdivisions = Array.from(uniqueSubdivisionCodes).join(' or ')

                console.log(`The region should likely be ${logSubdivisions}\n`)
            } else {
                console.log(`${entry.city}, ${entry.country} could not be found. Please doublecheck if the city is spelled correctly and even is located in ${entry.country}\n`)
            }
        }
    }
}

createReport()