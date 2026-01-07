
import fetch from 'node-fetch'; // Standard fetch might not be in older node, but let's try built-in first or use https
// Actually, let's use standard https to be safe without dependencies
import https from 'https';

const countryId = 'BRA';
const indicator = 'NY.GDP.MKTP.KD.ZG'; // GDP Growth
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
