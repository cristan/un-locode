const fs = require('fs')

async function downloadByRegionIfNeeded(entry) {
    const region = entry.subdivisionCode
    if (!region) {
        throw new Error(`${entry} doesn't have a region`)
    }

    const directory = `../../data/nominatim/${entry.country}/${entry.location}/byRegion`
    if (!fs.existsSync(directory)){
        fs.mkdirSync(directory, { recursive: true });
    }
    const fileName = `${directory}/${entry.unlocode}.json`
    const fileAlreadyExists = fs.existsSync(fileName)
    if (fileAlreadyExists) {
        // console.log(`${fileName} already exists. Skipping.`)
        return
    }

    const nominatimQuery = `https://nominatim.openstreetmap.org/search?format=jsonv2&accept-language=en&addressdetails=1&limit=20&city=${encodeURI(entry.city)}&country=${encodeURI(entry.country)}&state=${entry.country}-${region}`
    await delay(1000)
    const fromNominatim = await (await fetch(nominatimQuery)).text()
    await fs.writeFileSync(fileName, fromNominatim)
}

async function downloadByCityIfNeeded(entry) {
    const directory = `../../data/nominatim/${entry.country}/${entry.location}/cityOnly`
    const fileName = `${directory}/${entry.unlocode}.json`
    const fileAlreadyExists = fs.existsSync(fileName)
    if (fileAlreadyExists) {
        // console.log(`${fileName} already exists. Skipping.`)
        return
    }

    await delay(1000)
    const ogNominatimQuery = `https://nominatim.openstreetmap.org/search?format=jsonv2&accept-language=en&addressdetails=1&limit=20&city=${encodeURI(entry.city)}&country=${encodeURI(entry.country)}`
    const fromNominatim2 = await (await fetch(ogNominatimQuery)).text()
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
    await fs.writeFileSync(fileName, fromNominatim2)
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    downloadByRegionIfNeeded,
    downloadByCityIfNeeded
}