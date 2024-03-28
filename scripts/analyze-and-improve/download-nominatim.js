const fs = require('fs')
const {readCsv} = require("./util/readCsv")
const {convertToDecimal} = require("./util/coordinatesConverter")

async function start() {
    const csvDatabase = await readCsv()
    for (const unlocode of Object.keys(csvDatabase)) {
        const entry = csvDatabase[unlocode]

        const decimalCoordinates = convertToDecimal(entry.coordinates)
        if (decimalCoordinates && entry.country === "IT") {
            console.log(`Downloading ${unlocode}`)
            const ogNominatimQuery = `https://nominatim.openstreetmap.org/search?format=jsonv2&accept-language=en&addressdetails=1&limit=20&city=${encodeURI(entry.city)}&country=${encodeURI(entry.country)}`
            let nominatimQuery = ogNominatimQuery
            const region = entry.subdivisionCode;
            let byRegion = false
            if (region) {
                nominatimQuery += `&state=${encodeURI(region)}`
                byRegion = true
            }

            let scrapeMethod = byRegion ? "byRegion" : "cityOnly"
            let directory = `../../data/nominatim/${entry.country}/${entry.location}/${scrapeMethod}`
            if (!fs.existsSync(directory)){
                fs.mkdirSync(directory, { recursive: true });
            }
            const fileName = `${directory}/${unlocode}.json`;
            const fileAlreadyExists = fs.existsSync(fileName)
            if (fileAlreadyExists) {
                console.log(`${fileName} already exists. Skipping.`)
                continue
            }

            await delay(1000)
            const fromNominatim = await (await fetch(nominatimQuery)).text()
            await fs.writeFileSync(fileName, fromNominatim)
            if (byRegion && fromNominatim === "[]") {
                scrapeMethod = "cityOnly"
                directory = `../../data/nominatim/${entry.country}/${entry.location}/${scrapeMethod}`
                if (!fs.existsSync(directory)) {
                    fs.mkdirSync(directory, { recursive: true });
                }

                const fileName = `${directory}/${unlocode}.json`;
                const fileAlreadyExists = fs.existsSync(fileName)
                if (fileAlreadyExists) {
                    console.log(`${fileName} already exists. Skipping.`)
                    continue
                }

                await delay(1000)
                const fromNominatim2 = await (await fetch(ogNominatimQuery)).text()
                await fs.writeFileSync(fileName, fromNominatim2)
            }
        }
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

start()