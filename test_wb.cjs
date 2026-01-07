const https = require('https');

const countryId = 'BRA';
const indicator = 'DT.DOD.DIMF.CD'; // Use of IMF Credit (DOD, current US$)
const url = `https://api.worldbank.org/v2/country/${countryId}/indicator/${indicator}?date=2022:2023&format=json`;

console.log(`Fetching ${url}...`);

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log('Status Code:', res.statusCode);
            if (Array.isArray(json) && json.length > 1) {
                console.log('Data found:', json[1][0]);
            } else {
                console.log('No data found or invalid format:', json);
            }
        } catch (e) {
            console.error('Error parsing JSON:', e.message);
            console.log('Raw data:', data);
        }
    });

}).on('error', (err) => {
    console.error('Error:', err.message);
});
