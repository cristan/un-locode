const fs = require('fs')

const UNLOCODE_COLUMN_COUNTRY = 1
const UNLOCODE_COLUMN_LOCATION = 2
const UNLOCODE_COLUMN_CITY = 3
const UNLOCODE_COLUMN_SUBDIVISION = 5
const UNLOCODE_COLUMN_COORDINATES = 10
const UNLOCODE_COLUMN_DATE = 8

async function start() {
    const csvDatabase = await readCsv()
    for (const unlocode of Object.keys(csvDatabase)) {
        const entry = csvDatabase[unlocode]

        const convertedCoordinates = convertCoordinates(entry.coordinates)
        if (convertedCoordinates && entry.country === "IT") {
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

const coordinatesRegex = /^(\d{2})(\d{2})([NS])\s+(\d{3})(\d{2})([EW])$/
function convertCoordinates(input) {
    if (!input) {
        return ""
    }

    // Extract latitude and longitude parts
    const latMatch = input.match(coordinatesRegex)

    // Check if the input format is valid
    if (latMatch) {
        // Extract degrees, minutes, and direction
        const latDegrees = parseInt(latMatch[1])
        const latMinutes = latMatch[2]
        const latDirection = latMatch[3]
        const lonDegrees = parseInt(latMatch[4])
        const lonMinutes = latMatch[5]
        const lonDirection = latMatch[6]

        // Calculate decimal coordinates with proper sign for direction
        const decimalLat = `${latDirection === 'S' ? "-" : ""}${(latDegrees + (latMinutes / 60)).toFixed(5)}`
        const decimalLon = `${lonDirection === 'W' ? "-" : ""}${(lonDegrees + (lonMinutes / 60)).toFixed(5)}`

        // Return the result as an object
        return `${decimalLat},${decimalLon}`
    } else {
        console.warn(`Invalid coordinate format ${input}`)
        return ""
    }
}

async function readCsv() {
    const subdivisionCodesRaw = fs.readFileSync("../../data/subdivision-codes.csv", 'utf8').split("\n")
    subdivisionCodesRaw.shift()
    const subdivisionDatabase = {}
    for (const record of subdivisionCodesRaw) {
        const columns = parseCSV(record)
        const countryCode = columns[0]
        const subdivisionCode = columns[1]
        const subdivisionName = columns[2]
        subdivisionDatabase[`${countryCode}|${subdivisionCode}`] = subdivisionName
    }

    const codeList = fs.readFileSync('../../data/code-list.csv', 'utf8').split("\n")
    codeList.shift()
    const csvDatabase = {}
    for (const record of codeList) {
        const columns = parseCSV(record)
        if (columns[UNLOCODE_COLUMN_COUNTRY] === undefined) {
            continue
        }

        const country = columns[UNLOCODE_COLUMN_COUNTRY]
        const location = columns[UNLOCODE_COLUMN_LOCATION];
        const unLocode = `${country}${location}`
        const city = columns[UNLOCODE_COLUMN_CITY]
        const subdivisionCode = columns[UNLOCODE_COLUMN_SUBDIVISION]
        const subdivisionName = subdivisionDatabase[`${country}|${subdivisionCode}`]
        const coordinates = columns[UNLOCODE_COLUMN_COORDINATES]
        const date = columns[UNLOCODE_COLUMN_DATE]
        csvDatabase[unLocode] = { city, country, location, subdivisionCode, subdivisionName, coordinates, date }
    }
    return csvDatabase
}

function parseCSV(csvString) {
    const result = []
    let currentField = ''
    let insideQuotes = false

    for (let i = 0; i < csvString.length; i++) {
        const char = csvString[i]

        if (char === '"') {
            // Toggle insideQuotes when encountering a quote
            insideQuotes = !insideQuotes
        } else if (char === ',' && !insideQuotes) {
            // Add the current field to the result array and reset currentField
            result.push(currentField)
            currentField = ''
        } else {
            // Add the character to the current field
            currentField += char
        }
        if (i === csvString.length - 1) {
            result.push(currentField)
        }
    }
    return result
}

start()