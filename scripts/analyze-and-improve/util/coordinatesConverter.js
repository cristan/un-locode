const coordinatesRegex = /^(\d{2})(\d{2})([NS])\s+(\d{3})(\d{2})([EW])$/
export function convertToDecimal(input) {
    if (!input) {
        return ""
    }

    // Extract latitude and longitude parts
    const latMatch = input.match(coordinatesRegex)

    // Check if the input format is valid
    if (latMatch) {
        // Extract degrees, minutes, and direction
        const latDegrees = parseInt(latMatch[1])
        const latMinutes = latMatch[2]
        const latDirection = latMatch[3]
        const lonDegrees = parseInt(latMatch[4])
        const lonMinutes = latMatch[5]
        const lonDirection = latMatch[6]

        // Calculate decimal coordinates with proper sign for direction
        const decimalLat = `${latDirection === 'S' ? "-" : ""}${(latDegrees + (latMinutes / 60)).toFixed(5)}`
        const decimalLon = `${lonDirection === 'W' ? "-" : ""}${(lonDegrees + (lonMinutes / 60)).toFixed(5)}`

        // Return the result as an object
        return {
            latitude: decimalLat,
            longitude: decimalLon
        };
    } else {
        // console.warn(`Invalid coordinate format ${input}`)
        return undefined
    }
}

export function convertNmToUnlocodeText(nm) {
    return `<a href="${nm.sourceUrl}">${convertToUnlocode(nm.lat, nm.lon)}</a>`
}

export function convertToUnlocode(decimalLat, decimalLon) {
    const latDegreesMinutes = convertToDegreesMinutes(Math.abs(decimalLat));
    const lonDegreesMinutes = convertToDegreesMinutes(Math.abs(decimalLon));

    const latDirection = convertToDirection(decimalLat, 'N', 'S');
    const lonDirection = convertToDirection(decimalLon, 'E', 'W');

    const lat = `${latDegreesMinutes[0].toString().padStart(2, '0')}${latDegreesMinutes[1].toString().padStart(2, '0')}${latDirection}`;
    const lon = `${lonDegreesMinutes[0].toString().padStart(3, '0')}${lonDegreesMinutes[1].toString().padStart(2, '0')}${lonDirection}`;

    return `${lat} ${lon}`;
}

function convertToDegreesMinutes(decimal) {
    const degrees = Math.floor(decimal);
    const minutes = (decimal - degrees) * 60;
    return [degrees, minutes.toFixed(0)];
}

function convertToDirection(coord, positiveSymbol, negativeSymbol) {
    return coord >= 0 ? positiveSymbol : negativeSymbol;
}

export function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371 // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1) // deg2rad below
    const dLon = deg2rad(lon2 - lon1)
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c // Distance in km
    return d
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}