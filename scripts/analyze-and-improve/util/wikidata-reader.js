import fs from "node:fs";

export function readWikidata() {
    const data = JSON.parse(fs.readFileSync('../../data/wikidata/wikidata.json', 'utf8'))
    const wikiData = {}

    data.forEach(entry => {
        const subdivisionCodeRaw = entry.subdivisionCode1 ?? entry.subdivisionCode2 ?? entry.subdivisionCode3

        const wikiDataEntry = {
            ...entry,
            sourceUrl: entry.item,
            subdivisionCode: subdivisionCodeRaw?.substring(3),
            alternatives: []
        }

        if (wikiData[entry.unlocode]) {
            // When an entry is there twice, keep the first one
            wikiData[entry.unlocode].alternatives.push({
                wikiDataEntry
            })
            return
        }

        wikiData[entry.unlocode] = wikiDataEntry
    })

    // The script currently doesn't know how to handle 1 entry with 2 unlocodes. Hacky hardcoded workaround for now.
    wikiData["CNHUA"] = wikiData["CNGZG"]

    return wikiData
}