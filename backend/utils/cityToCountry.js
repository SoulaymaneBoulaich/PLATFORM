// City to country mapping for auto-filling country field
const cityToCountryMap = {
    // Morocco
    'Casablanca': 'Morocco',
    'Rabat': 'Morocco',
    'Marrakech': 'Morocco',
    'Fes': 'Morocco',
    'Fez': 'Morocco',
    'Tangier': 'Morocco',
    'Agadir': 'Morocco',
    'Meknes': 'Morocco',
    'Oujda': 'Morocco',
    'Kenitra': 'Morocco',
    'Tetouan': 'Morocco',
    'Safi': 'Morocco',
    'El Jadida': 'Morocco',
    'Nador': 'Morocco',
    'Khouribga': 'Morocco',
    'Beni Mellal': 'Morocco',
    'Taza': 'Morocco',

    // France
    'Paris': 'France',
    'Lyon': 'France',
    'Marseille': 'France',
    'Toulouse': 'France',
    'Nice': 'France',
    'Nantes': 'France',
    'Strasbourg': 'France',

    // Spain
    'Madrid': 'Spain',
    'Barcelona': 'Spain',
    'Valencia': 'Spain',
    'Seville': 'Spain',

    // USA
    'New York': 'USA',
    'Los Angeles': 'USA',
    'Chicago': 'USA',
    'Miami': 'USA',
    'San Francisco': 'USA',
};

/**
 * Get country from city name
 * @param {string} city - City name
 * @returns {string} Country name or 'Unknown'
 */
function getCountryFromCity(city) {
    if (!city) return 'Unknown';

    // Try exact match first
    if (cityToCountryMap[city]) {
        return cityToCountryMap[city];
    }

    // Try case-insensitive match
    const cityLower = city.toLowerCase();
    for (const [key, value] of Object.entries(cityToCountryMap)) {
        if (key.toLowerCase() === cityLower) {
            return value;
        }
    }

    return 'Unknown';
}

module.exports = {
    getCountryFromCity,
    cityToCountryMap
};
