import fs from "node:fs"
import {downloadByCityIfNeeded, downloadByQueryIfNeeded, downloadByRegionIfNeeded} from "./nominatim-downloader.js";
import {getDistanceFromLatLonInKm} from "./coordinatesConverter.js";

/**
 * Loads all Nominatim data: it either loads it from cached files or downloads said files when they don't exist yet.
 *
 * Either loads via region, or when the entry doesn't have a subdivisionCode, or that doesn't yield results, it returns
 * the data via city only.
 *
 * Both call {@link filterOutUselessEntries}.
 *
 * Afterwards, this method calls {@link addConvenienceAttributes} on the data.
 *
 * @param entry A CSV entry of a unlocode.
 */
export async function getNominatimData(entry) {
    const nominatimData = await loadNominatimData(entry)
    if (!nominatimData) {
        return undefined
    }

    const nominatimResult = nominatimData.result

    addConvenienceAttributes(nominatimResult)

    return { scrapeType: nominatimData.scrapeType, result: nominatimResult }
}

async function loadNominatimData(entry) {
    const city = entry.city
    if (city.includes(" Apt") || city.includes("/") || city.includes(",")) {
        const query = city.replace(" Apt", " Airport")
        // Entries with a comma are pretty much never the actual city name, like ATMLD: Mollersdorf, Baden
        // Entries with a / definitely aren't the actual city name, like ATBES: Bergheim/Salzburg
        // Airports aren't cities, so we won't find those via city

        // this is why in all cases, we can just return the one via a query
        await downloadByQueryIfNeeded(entry, query)
        return readNominatimDataByQuery(entry.unlocode)
    }

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
    const withoutUselessEntries = filterOutUselessEntries(parsedAndFiltered)
    if (withoutUselessEntries.length === 0) {
        return undefined
    }
    return withoutUselessEntries
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

export function readNominatimDataByQuery(unlocode) {
    const country = unlocode.substring(0, 2)
    const location = unlocode.substring(2)
    const directoryRoot = `../../data/nominatim/${country}/${location}`
    const byQueryFileName = `${directoryRoot}/byQuery/${unlocode}.json`
    const byQuery = fs.readFileSync(byQueryFileName, 'utf8')
    if (byQuery === "[]") {
        return undefined
    } else {
        const withoutUselessEntries = filterOutUselessEntries(JSON.parse(byQuery))
        if (withoutUselessEntries.length === 0) {
            return undefined
        }

        addConvenienceAttributes(withoutUselessEntries)

        return {scrapeType: "byQuery", result: withoutUselessEntries}
    }
}

function filterOutUselessEntries(nominatimResult) {
    // Filter out anything which isn't a place, a boundary or a landuse (CNYTN)
    // TODO: this might be problematic! I only detected that I needed landuse by accident
    //  Also, maybe not use all landuses? The ones with type="industrial" we definitely need, but maybe we don't need type="commercial" (AESZS)
    // Alternatively, we can filter out the ones we don't want
    const filteredByCategory = nominatimResult.filter(n => n.category === "place" || n.category === "boundary" || n.category === "landuse")

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
    // In case of https://unlocode.info/CNHGQ, 4 over 3
    // BFBOY, BFBOG, BFBRO (all BF): 5 over 4
    // IT2AB, IT2C8, IT3YZ: 6 over 4
    // In case of https://unlocode.info/BGGB4, BGNLS, we need level 15 instead of the level 6 (the only ones)
    // In case of https://unlocode.info/BGSOF, we need level 6 instead of the level 15

    // In case of https://unlocode.info/AZNAJ (the only level 3 in AZ, the rest are all level 5), we need level 3 instead of level 5
    if (nominatimElement.address.country_code === "cz") {
        // CZYHO: level 6 should be picked over 7. However, 1 only has 20A as level 7, and we can substring that to 20, which is Středočeský kraj,
        // which translates to Central Bohemian Region which is the correct region
        return nominatimElement.address["ISO3166-2-lvl6"]?.substring(3) ?? nominatimElement.address["ISO3166-2-lvl7"]?.substring(3, 5)
    } else if (nominatimElement.address.country_code === "bd") {
        // All BD: pick 5 (some like BDKUS only have level 4, but that's wrong, so just never pick 4)
        return nominatimElement.address["ISO3166-2-lvl6"]?.substring(4)
    }

    return nominatimElement.address["ISO3166-2-lvl6"]?.substring(3) ??
        nominatimElement.address["ISO3166-2-lvl5"]?.substring(3) ??
        nominatimElement.address["ISO3166-2-lvl4"]?.substring(3) ??
        nominatimElement.address["ISO3166-2-lvl3"]?.substring(3) ??
        nominatimElement.address["ISO3166-2-lvl7"]?.substring(3) ?? // https://unlocode.info/ADALV
        nominatimElement.address["ISO3166-2-lvl8"]?.substring(3) ?? // https://unlocode.info/BSBKC
        nominatimElement.address["ISO3166-2-lvl15"]?.substring(3) // https://unlocode.info/BGSOF (though this one is ignored)
}

export function isSmallVillage(nominatimElement) {
    // Warn about small villages: it's not that likely there's a unlocode for villages or hamlets
    // Industrial results can have a very low rank, but can be very relevant for us, so don't warn about those. Example: CNYTN
    return nominatimElement.place_rank >= 19 && nominatimElement.addresstype !== "industrial"
}