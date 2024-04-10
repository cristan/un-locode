import fs from "node:fs";

export function readWikidata() {
    const data = JSON.parse(fs.readFileSync('../../data/wikidata/wikidata.json', 'utf8'))
    const wikiData = {}

    data.forEach(entry => {
        wikiData[entry.unlocode] = entry
    })

    return wikiData
}