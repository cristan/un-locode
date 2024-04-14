import {readCsv, readSubdivisionData} from "./util/readCsv.js";
import {convertToDecimal} from "./util/coordinatesConverter.js";

async function validateRegionCodes() {
    const csvDatabase = await readCsv(true)
    const subdivisions = readSubdivisionData()

    let count = 0
    let allCount = 0
    for (const unlocode of Object.keys(csvDatabase)) {
        allCount++

        const entry = csvDatabase[unlocode]

        const decimalCoordinates = convertToDecimal(entry.coordinates)
        if (!decimalCoordinates) {
            console.log(`https://unlocode.info/${unlocode} ${unlocode} ${entry.city}`)
            // console.log(entry.iata !== "" ? entry.iata : entry.location)
            count++
            continue
        }

        // const city = entry.city
        // if (city.includes(" Apt") || city.includes("Airport") || city.includes("/") || city.includes(",")) {
        //     console.log(entry.unlocode +": "+ entry.city)
        //     const directory = `../../data/nominatim/${entry.country}/${entry.location}`
        //     fs.rmSync(directory, { recursive: true, force: true });
        //     count++
        // }

        // if (entry.city.includes("/")){
        //     console.log(`${unlocode}: ${entry.city}`)
        //     count++
        // }

        // if (entry.country === "CZ") {
        //     console.log(`${unlocode}: ${entry.subdivisionCode}`)
        // }

        // const nominatimData = await getNominatimData(entry)
        // if (!nominatimData) {
        //     continue
        // }

        // nominatimData.result.forEach(nominatimResult => {
        //     if (!nominatimResult.subdivisionCode) {
        //         return
        //     }
        //     const subdivisionName = subdivisions[entry.country +"|"+ nominatimResult.subdivisionCode]
        //     if (!subdivisionName) {
        //         count++
        //         // console.log(entry.unlocode, "has no subdivision name for", nominatimResult.subdivisionCode)
        //     }
        // })
    }
    console.log(count +" out of "+ allCount +`(${100-((count / allCount) * 100)}%)`)
}

validateRegionCodes()