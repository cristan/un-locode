const {readCsv, readSubdivisionData} = require("./util/readCsv");
const {getRegionCode} = require("./util/nominatim-loader");

async function createReport() {
    const csvDatabase = await readCsv()
    const subdivisions = readSubdivisionData()

    for (const unlocode of Object.keys(csvDatabase)) {
        const entry = csvDatabase[unlocode]
        if (entry.country !== "IT") {
            continue
        }

        if (entry.subdivisionCode && !entry.subdivisionName) {
            const nominatimRegionCode = await getRegionCode(unlocode)
            console.log(`https://unlocode.info/${unlocode} has a non-existing region ${entry.subdivisionCode}.`)
            if (nominatimRegionCode) {
                console.log(`It should be ${nominatimRegionCode} (${subdivisions[entry.country+'|'+nominatimRegionCode]})\n`)
            }
        }
    }
}

createReport()