import fs from "node:fs";

export function readWikidata() {
    const data = JSON.parse(fs.readFileSync('../../data/wikidata/wikidata.json', 'utf8'))
    const wikiData = {}

    data.forEach(entry => {
        wikiData[entry.unlocode] = entry
    })

    // The script currently doesn't know how to handle 1 entry with 2 unlocodes. Hacky hardcoded workaround for now.
    wikiData["CNHUA"] = wikiData["CNGZG"]

    return wikiData
}