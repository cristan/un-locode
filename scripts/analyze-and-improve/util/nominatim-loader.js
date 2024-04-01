import fs from "node:fs"
import {downloadByCityIfNeeded, downloadByRegionIfNeeded} from "./nominatim-downloader.js";
import {getDistanceFromLatLonInKm} from "./coordinatesConverter.js";

/**
 * Loads all Nominatim data: it either loads it from cached files or downloads said files when they don't exist yet.
 *
 * Either loads via region, or when the entry doesn't have a subdivisionCode, or that doesn't yield results, it returns
 * the data via city only.
 *
 * Afterwards, {@link filterOutUselessEntries} and {@link addConvenienceAttributes} are called on the data.
 *
 * @param entry A CSV entry of a unlocode.
 */
export async function getNominatimData(entry) {
    const nominatimData = await loadNominatimData(entry)
    if (!nominatimData) {
        return undefined
    }

    const nominatimResult = nominatimData.result

    const withoutUselessEntries = filterOutUselessEntries(nominatimResult);
    if (withoutUselessEntries.length === 0) {
        return undefined
    }

    addConvenienceAttributes(withoutUselessEntries)

    return { scrapeType: nominatimData.scrapeType, result: withoutUselessEntries }
}

/**
 *
 */
async function loadNominatimData(entry) {
    const subdivisionCode = entry.subdivisionCode
    if (subdivisionCode) {
        await downloadByRegionIfNeeded(entry)
        const byRegion = readNominatimDataByRegion(entry)
        if (byRegion ) {
            return { scrapeType: "byRegion", result: byRegion }
        }
    }

    await downloadByCityIfNeeded(entry)
    return readNominatimDataByCity(entry.unlocode)
}

function readNominatimDataByRegion(entry) {
    const unlocode = entry.unlocode
    const country = unlocode.substring(0, 2)
    const location = unlocode.substring(2)

    const directoryRoot = `../../data/nominatim/${country}/${location}`
    const byRegionFileName = `${directoryRoot}/byRegion/${unlocode}.json`
    const byRegion = fs.readFileSync(byRegionFileName, 'utf8')

    const parsed = JSON.parse(byRegion)
    // Filter out results which aren't in the region after scraping by region.
    // Example: this goes wrong at https://nominatim.openstreetmap.org/search?format=jsonv2&accept-language=en&addressdetails=1&limit=20&city=Laocheng&country=CN&state=CN-HI
    // Which also returns data in HA even though the provided state is CN-HI.
    const parsedAndFiltered = parsed.filter(nm => getSubdivisionCode(nm) === entry.subdivisionCode)
    if (parsedAndFiltered.length === 0) {
        return undefined
    }
    return parsedAndFiltered
}

export function readNominatimDataByCity(unlocode) {
    const country = unlocode.substring(0, 2)
    const location = unlocode.substring(2)
    const directoryRoot = `../../data/nominatim/${country}/${location}`
    const byCityFileName = `${directoryRoot}/cityOnly/${unlocode}.json`
    const byCity = fs.readFileSync(byCityFileName, 'utf8')
    if (byCity === "[]") {
        return undefined
    } else {

        const withoutUselessEntries = filterOutUselessEntries(JSON.parse(byCity))
        if (withoutUselessEntries.length === 0) {
            return undefined
        }

        addConvenienceAttributes(withoutUselessEntries)

        return {scrapeType: "byCity", result: withoutUselessEntries}
    }
}

function filterOutUselessEntries(nominatimResult) {
    // Filter out anything which isn't a place or a boundary
    const filteredByCategory = nominatimResult.filter(n => n.category === "place" || n.category === "boundary")

    // The isolated dwelling tag is used for named places that are smaller than a hamlet - no more than a few buildings
    // Assume there are no unlocodes for places that small.
    const withoutIsolatedDwelling = filteredByCategory.filter(n => n.addresstype !== "isolated_dwelling");

    // Filter out locations which are super close
    // Example: https://nominatim.openstreetmap.org/search?format=jsonv2&accept-language=en&addressdetails=1&limit=20&city=Castelletto%20di%20Branduzzo&country=IT&state=PV
    // In this example, it's tempting to filter out the boundary, as that sounds more vague than a place.
    // However, we are actually interested in the first result (which is the boundary)
    // So instead, filter out locations which are super close
    const withoutVeryClosePlaces = withoutIsolatedDwelling.filter(w => {
        const veryCloseExists = withoutIsolatedDwelling.some(o => o.importance > w.importance && getDistanceFromLatLonInKm(w.lat, w.lon, o.lat, o.lon) < 25)

        return !veryCloseExists
    })

    return withoutVeryClosePlaces
}

function addConvenienceAttributes(nominatimResult) {
    nominatimResult.forEach(n => {
        n.subdivisionCode = getSubdivisionCode(n)
        let sourceUrl = `https://www.openstreetmap.org/${n.osm_type}/${n.osm_id}`
        if (n.osm_type !== "relation") {
            sourceUrl += `#map=12/${n.lat}/${n.lon}`
        }
        n.sourceUrl = sourceUrl
    })
    return nominatimResult
}

function getSubdivisionCode(nominatimElement) {
    return nominatimElement.address["ISO3166-2-lvl6"]?.substring(3) ?? nominatimElement.address["ISO3166-2-lvl4"]?.substring(3)
}