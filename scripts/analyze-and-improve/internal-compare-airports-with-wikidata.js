import {readCsv} from "./util/readCsv.js";
import {convertToDecimal} from "./util/coordinatesConverter.js";

async function fetchAirportInfo(iataCode) {
    const sparqlQuery = `
        SELECT ?airport ?airportLabel WHERE {
            ?airport wdt:P238 "${iataCode.toUpperCase()}".
            SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
        }
    `;

    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`;
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Bot for github.com/cristan/improved-un-locodes'
        }
    })
    const data = await response.json();

    const airportData = data.results.bindings;
    if (airportData.length > 0) {
        const airport = airportData[0];
        return {
            name: airport.airportLabel.value,
            link: airport.airport.value
        };
    } else {
        return undefined
    }
}

async function checkAirports() {
    const csvDatabase = await readCsv(true)

    for (const unlocode of Object.keys(csvDatabase)) {
        const entry = csvDatabase[unlocode]
        const decimalCoordinates = convertToDecimal(entry.coordinates)
        if (!decimalCoordinates && entry.function.includes("4") && entry.city.includes("Apt")) {
            // console.log(`https://unlocode.info/${unlocode} ${unlocode} ${entry.city}`)

            // There's no reason this actually is the IATA, but there's a pretty good chance in case of airports
            const iata = entry.iata !== "" ? entry.iata : entry.location

            const airportInfo = await fetchAirportInfo(iata)
            if (airportInfo) {
                console.log(`https://unlocode.info/${unlocode} ${unlocode} ${entry.city} || ${airportInfo.name} at ${airportInfo.link}`)
            }
        }
    }
}

checkAirports()
