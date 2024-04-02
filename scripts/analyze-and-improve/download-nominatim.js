import {readCsv} from "./util/readCsv.js";
import {convertToDecimal} from "./util/coordinatesConverter.js";
import {getNominatimData} from "./util/nominatim-loader.js";

async function start() {
    const csvDatabase = await readCsv()

    for (const unlocode of Object.keys(csvDatabase)) {
        const entry = csvDatabase[unlocode]

        const decimalCoordinates = convertToDecimal(entry.coordinates)
        if (!decimalCoordinates) {// || entry.country !== "CN"
            // No need to download the entries who don't have coordinates in unlocode for now:
            // let's first focus on correcting the coordinates who are in there.
            continue
        }

        console.log(`Downloading ${unlocode}`)
        await getNominatimData(entry)
    }
}

start()