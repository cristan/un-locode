const {readCsv} = require("./readCsv");
const {convertCoordinates} = require("./coordinatesConverter");

async function validateCoordinates() {
    const csvDatabase = await readCsv()
    for (const unlocode of Object.keys(csvDatabase)) {
        const entry = csvDatabase[unlocode]

        if (entry.coordinates && !convertCoordinates(entry.coordinates)) {
            console.log(`Invalid coordinates for ${unlocode}`)
        }
    }
}

validateCoordinates()