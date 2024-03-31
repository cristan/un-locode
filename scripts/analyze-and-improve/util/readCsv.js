import fs from "node:fs"

const UNLOCODE_COLUMN_COUNTRY = 1
const UNLOCODE_COLUMN_LOCATION = 2
const UNLOCODE_COLUMN_CITY = 3
const UNLOCODE_COLUMN_SUBDIVISION = 5
const UNLOCODE_COLUMN_COORDINATES = 10
const UNLOCODE_COLUMN_DATE = 8

export function readSubdivisionData() {
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
    return subdivisionDatabase
}

export async function readCsv() {
    const subdivisionDatabase = readSubdivisionData()

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
        const unlocode = `${country}${location}`
        const city = columns[UNLOCODE_COLUMN_CITY]
        const subdivisionCode = columns[UNLOCODE_COLUMN_SUBDIVISION]
        const subdivisionName = subdivisionDatabase[`${country}|${subdivisionCode}`]
        const coordinates = columns[UNLOCODE_COLUMN_COORDINATES]
        const date = columns[UNLOCODE_COLUMN_DATE]
        csvDatabase[unlocode] = { city, country, location, subdivisionCode, subdivisionName, coordinates, date, unlocode }
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