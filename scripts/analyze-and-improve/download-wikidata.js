import fs from "node:fs"

const amountPerRequest = 6000
const sparqlQuery = `
    SELECT ?item ?itemLabel ?coords ?unlocode
    WHERE {
        ?item wdt:P1937 ?unlocode.
        ?item wdt:P625 ?coords.
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
    ORDER BY ?item
    LIMIT ${amountPerRequest}
    OFFSET $offset
`

const endpointUrl = `https://query.wikidata.org/sparql?format=json&flavor=dump`
const coordsRegex = /Point\(([-\d\.]*)\s([-\d\.]*)\)/

async function downloadFromWikidata() {
    let offset = 0
    let allData = []

    while (true) {
        console.log(`Downloading Wikidata at offset: ${offset}`)
        const queryUrl = `${endpointUrl}&query=${encodeURIComponent(sparqlQuery.replace('$offset', offset))}`

        const fromWikidata = await fetch(queryUrl, {
            headers: {
                'User-Agent': 'Bot for github.com/cristan/improved-un-locodes'
            }
        })

        const response = await fromWikidata.json()

        if (response.results.bindings.length === 0) {
            // No more data to fetch, break the loop
            break
        }

        const simplifiedData = response.results.bindings
            .filter(result => {
                const match = coordsRegex.exec(result.coords.value)
                if (!match || match.length < 3) {
                    console.warn(JSON.stringify(result))
                    return false
                }
                return true
            })
            .map(result => ({
                item: result.item.value,
                itemLabel: result.itemLabel.value,
                lat: extractCoordinates(result.coords.value).lat,
                lon: extractCoordinates(result.coords.value).lon,
                unlocode: result.unlocode.value
            }))

        allData = allData.concat(simplifiedData)
        offset += amountPerRequest // Increase the offset for the next iteration
    }

    // Sort the data, so they will have a consistent order
    // This will help a lot with handling the wikidata dataset in Git
    const allDataSorted = allData.sort(function (a, b) {
        return (a.unlocode + a.item > b.unlocode + a.item) ? 1 : -1
    })

    await fs.writeFileSync("../../data/wikidata/wikidata.json", JSON.stringify(allDataSorted, null, 2))
}

function extractCoordinates(coordsValue) {
    const match = coordsRegex.exec(coordsValue)
    return {
        lat: match[2],
        lon: match[1]
    }
}

downloadFromWikidata()
