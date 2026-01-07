const https = require('https');
const fs = require('fs');

// Indicators to test
const INDICATOR_GDP_GROWTH = 'NY.GDP.MKTP.KD.ZG';
const INDICATOR_GDP_NOMINAL = 'NY.GDP.MKTP.CD';

const countryId = 'BRA'; // Brazil

const results = {};

function fetchData(indicator) {
    return new Promise((resolve) => {
        const url = `https://api.worldbank.org/v2/country/${countryId}/indicator/${indicator}?date=2020:2024&format=json`;
        console.log(`Fetching ${url}...`);

        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (Array.isArray(json) && json.length > 1) {
                        results[indicator] = json[1];
                    } else {
                        results[indicator] = { error: 'No data', raw: json };
                    }
                } catch (e) {
                    results[indicator] = { error: e.message };
                }
                resolve();
            });
        });
    });
}

async function run() {
    await fetchData(INDICATOR_GDP_GROWTH);
    await fetchData(INDICATOR_GDP_NOMINAL);
    fs.writeFileSync('debug_output.json', JSON.stringify(results, null, 2), 'utf8');
    console.log('Done writing debug_output.json');
}

run();
