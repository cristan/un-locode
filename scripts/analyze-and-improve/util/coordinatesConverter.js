const coordinatesRegex = /^(\d{2})(\d{2})([NS])\s+(\d{3})(\d{2})([EW])$/
function convertToDecimal(input) {
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

module.exports = {
    convertToDecimal
}