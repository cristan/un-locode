import fs from "node:fs";

export function readWikidata() {
    const data = JSON.parse(fs.readFileSync('../../data/wikidata/wikidata.json', 'utf8'))
    const wikiData = {}

    data.forEach(entry => {
        // TODO: there are duplicate items. This just overrides the first one when we encounter the second
        let subdivisionCodeRaw = entry.subdivisionCode1 ?? entry.subdivisionCode2 ?? entry.subdivisionCode3

        wikiData[entry.unlocode] = {
            ...entry,
            sourceUrl: entry.item,
            subdivisionCode: subdivisionCodeRaw?.substring(3)
        }
    })

    // The script currently doesn't know how to handle 1 entry with 2 unlocodes. Hacky hardcoded workaround for now.
    wikiData["CNHUA"] = wikiData["CNGZG"]

    return wikiData
}