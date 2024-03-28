const {readCsv} = require("./readCsv");
const {convertToDecimal} = require("./coordinatesConverter");

async function validateCoordinates() {
    const csvDatabase = await readCsv()
    for (const unlocode of Object.keys(csvDatabase)) {
        const entry = csvDatabase[unlocode]

        const decimalCoordinates = convertToDecimal(entry.coordinates);
        if (entry.coordinates && !decimalCoordinates) {
            console.log(`Invalid coordinates for ${unlocode}: ${entry.coordinates}`)
            continue
        }
        if(decimalCoordinates.latitude > 90 || decimalCoordinates.latitude < -90) {
            console.log(`Invalid latitude for ${unlocode}: ${entry.coordinates} => ${decimalCoordinates.latitude}, ${decimalCoordinates.longitude}`)
            continue
        }
        if(decimalCoordinates.longitude > 180 || decimalCoordinates.longitude < -180) {
            console.log(`Invalid longitude for ${unlocode}: ${entry.coordinates} => ${decimalCoordinates.latitude}, ${decimalCoordinates.longitude}`)
            continue
        }
    }
}

validateCoordinates()