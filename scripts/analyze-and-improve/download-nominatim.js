const {readCsv} = require("./util/readCsv")
const {convertToDecimal} = require("./util/coordinatesConverter")
const {downloadFromNominatimIfNeeded} = require("./util/nominatim-downloader")

async function start() {
    const csvDatabase = await readCsv()

    for (const unlocode of Object.keys(csvDatabase)) {
        const entry = csvDatabase[unlocode]

        const decimalCoordinates = convertToDecimal(entry.coordinates)
        if (!decimalCoordinates || entry.country !== "CN") {
            continue
        }

        console.log(`Downloading ${unlocode}`)
        await downloadFromNominatimIfNeeded(entry)
    }
}

start()