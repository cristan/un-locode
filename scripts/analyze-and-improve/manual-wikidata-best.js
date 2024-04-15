// Cases where Wikidata is best.
// A cool thing about this is that Wikidata is an open dataset, so if you encounter any issues,
// you can always fix it there, fixing it for the entire world.
// If the unlocode wasn't in code-list-improved.csv before, it should show up automatically after running download-wikidata.js and generate-improved-coordinates.js
// Otherwise, you'd have to add the unlocode here

export const WIKIDATA_BEST = [
    "CNHUA",
    "PRPSE",
    "AULVO",
    "AUMKR",
    "AUONG",
    "AOJMB",
    "AURCM",
    "CAZFW",
    "COCIE",
    "AUWUN",
    "BECLM",// Quite the important one! Nominatim is pointing to the one in the wrong region!
    "CALAW",
    "VELSV",
    "ESSAT",
    "EGAIS",
    "ESSAT",
    "MYLBU",
    "IDLAT",
    "PRLAM",
    "JPABO",
    "PHZAM",
    "VEBAV",
    "CABAY",
    "ITFAL",
    "CNHNK",
    "RUSTY",
    "RUVIT",
    "JPAOK",
    "VEBJV",
    "CNDAA",
    "VEETV",
    "NGKOK",
    "PELPP",
    "PHMAB",
    "PGMAS",
    "PEMRI",
    "JPSKM",
    "CAPTN",
    "GRADI",
    "PHWNP",
    "ASPPG",// Because of typo in the original. Hopefully will be fixed the next release
    "IDPNJ",// Port
    "CAPTN",
    "VEMIV",
    "ESSCI",
    "GTSNJ",
    "IDTBA",
    "VNVPH",
    "PESNX",// There are 2 times San Nicolas in Peru. This is the one aToBviaC uses though
]