import fs from "node:fs"

// TODO: also read the subdivision code via this query: https://w.wiki/9ojz
// It's slower though
/*
SELECT ?item ?locode ?itemLabel ?coords ?subdivisionCode1 ?subdivisionCode2 ?subdivisionCode3
WHERE {
  ?item wdt:P1937 ?locode.
  ?item wdt:P625 ?coords.
  OPTIONAL {
    ?item wdt:P131 ?subdivisionEntity1.
    OPTIONAL { ?subdivisionEntity1 wdt:P300 ?subdivisionCode1. }
    OPTIONAL {
      ?subdivisionEntity1 wdt:P131 ?subdivisionEntity2.
      OPTIONAL { ?subdivisionEntity2 wdt:P300 ?subdivisionCode2. }
      OPTIONAL {
        ?subdivisionEntity2 wdt:P131 ?subdivisionEntity3.
        OPTIONAL { ?subdivisionEntity3 wdt:P300 ?subdivisionCode3. }
      }
    }
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
}
LIMIT 1000
 */

const amountPerRequest = 6500
const sparqlQuery = `
    SELECT DISTINCT ?item ?unlocode ?itemLabel ?coords ?subdivisionCode1 ?subdivisionCode2 ?subdivisionCode3
    WHERE {
      ?item wdt:P1937 ?unlocode.
      ?item wdt:P625 ?coords.
      OPTIONAL {
        ?item wdt:P131 ?subdivisionEntity1.
        OPTIONAL { ?subdivisionEntity1 wdt:P300 ?subdivisionCode1. }
      }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
    }
    ORDER BY ?item
    LIMIT ${amountPerRequest}
    OFFSET $offset
`
/*
OPTIONAL {
          ?subdivisionEntity1 wdt:P131 ?subdivisionEntity2.
          OPTIONAL { ?subdivisionEntity2 wdt:P300 ?subdivisionCode2. }
          OPTIONAL {
            ?subdivisionEntity2 wdt:P131 ?subdivisionEntity3.
            OPTIONAL { ?subdivisionEntity3 wdt:P300 ?subdivisionCode3. }
          }
        }
 */

const endpointUrl = `https://query.wikidata.org/sparql?format=json&flavor=dump`
const coordsRegex = /Point\(([-\d\.]*)\s([-\d\.]*)\)/

async function runWikidataQuery(query) {
    const queryUrl = `${endpointUrl}&query=${encodeURIComponent(query)}`

    const fromWikidata = await fetch(queryUrl, {
        headers: {
            'User-Agent': 'Bot for github.com/cristan/improved-un-locodes'
        }
    })

    return await fromWikidata.json();
}

async function downloadFromWikidata() {
    let offset = 0
    let allData = []

    while (true) {
        console.log(`Downloading Wikidata at offset: ${offset}`)
        const response = await runWikidataQuery(sparqlQuery.replace('$offset', offset))

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
                unlocode: result.unlocode.value,
                subdivisionCode1: result.subdivisionCode1?.value,
                subdivisionCode2: result.subdivisionCode2?.value,
                subdivisionCode3: result.subdivisionCode3?.value,
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
