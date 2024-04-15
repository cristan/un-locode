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
    "AUBQL",
    "AUMRG",
    "CDFDU",
    "CNHXG",
    "CNXHH",// Not 100% sure, but seems more likely than what Nominatim comes up with
    "CNHUY",// only 60% sure this is better than Nominatim
    "CNHLN",
    "CNYSA",
    "COPBO",// Deceiving one! Coordinates do point to a Puerto Bolívar, but the wrong one. Source: https://www.vesselfinder.com/ports/COPBO001
    "DEEGE",
    "DKFRE",// Much biggger, so seems more likely
    "DKGRI",// Same
    "DKNKV",// Same
    "DKVJN",
    "IDKBU",
    "IDWON",
    "INATT",// Both are possible, but this one is bigger
    "INBDA",// Both equally small, but this has a port
    "INNDC",
    "IRKHS",// At least shows up on Google Maps
    "IRTEW",// Close to Tohid airport
    "ITABO",// Is actually in Parma
    "ITBBG",
    "ITCN5",
    "ITCC2",// The maintainer of Italy actually looked at the Wikidata entries for Italy, so if in doubt, choose Wikidata
    "ITZIC",
    "ITZXG",
    "ITMRZ",
    "IT2LE",
    "ITMRZ",
    "ITPSU",//Official coordinates point to Passerano, Roma, but the region is set to Asti.
    "ITPSP",
    "ITTQR",
    "ITCLM",
    "ITSNN",
    "ITZTX",
    "ITZVB",
    "ITVIN",
    "UGPAF",// Maybe not technically the airport, but close enough
    "USUBP",
    "USARP",// Much bigger
]
// There are 2 San Martino in Strada's! :O The one of the official coordinates, and the one in https://www.wikidata.org/wiki/Q42950
// ITSPC https://maps.app.goo.gl/EARFzs2N9RaX3Cbv7 vs https://www.wikidata.org/wiki/Q42950
