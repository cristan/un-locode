import {readCsv} from "./util/readCsv.js";
import {convertToDecimal} from "./util/coordinatesConverter.js";
import {getNominatimData} from "./util/nominatim-loader.js";
import fs from "node:fs";

const sparqlQuery = `
    SELECT ?item ?itemLabel ?coords ?unlocode
    WHERE {
        ?item wdt:P1937 ?unlocode.
        ?item wdt:P625 ?coords.
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
`
const endpointUrl = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json&flavor=dump`

export async function downloadFromWikidata() {
    const fromWikidata = await fetch(endpointUrl, {
        headers: {
            'User-Agent': 'Bot for github.com/cristan/improved-un-locodes'
        }
    })

    const response = await fromWikidata.json()
    const coordsRegex = /Point\(([-\d\.]*)\s([-\d\.]*)\)/

    const simplifiedData = response.results.bindings
        .filter(result => {
            const match = coordsRegex.exec(result.coords.value)
            if (!match || match.length < 3) {
                console.warn(JSON.stringify(result))
                return false
            }
            return true
        })
        .map(result => {
            const match = coordsRegex.exec(result.coords.value)
            return {
                item: result.item.value,
                itemLabel: result.itemLabel.value,
                lat: match[1],
                lon: match[2],
                unlocode: result.unlocode.value
            }
    })
    await fs.writeFileSync("../../data/wikidata/wikidata.json", JSON.stringify(simplifiedData, null, 2))
}

downloadFromWikidata()