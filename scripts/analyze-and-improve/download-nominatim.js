const {readCsv} = require("./util/readCsv")
const {convertToDecimal} = require("./util/coordinatesConverter")
const {getNominatimData} = require("./util/nominatim-loader")

async function start() {
    const csvDatabase = await readCsv()

    for (const unlocode of Object.keys(csvDatabase)) {
        const entry = csvDatabase[unlocode]

        const decimalCoordinates = convertToDecimal(entry.coordinates)
        if (!decimalCoordinates) {// || entry.country !== "CN"
            continue
        }

        console.log(`Downloading ${unlocode}`)
        await getNominatimData(entry)
    }
}

start()