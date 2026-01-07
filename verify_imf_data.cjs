const https = require('https');

const indicators = [
    'NGDP_RPCH', // Real GDP Growth
    'PCPIPCH',   // Inflation
    'GGXWDG_NGDP', // Gov Debt
    'BCA_NGDPD'  // Current Account
];

const countries = ['USA', 'CHN', 'DEU']; // US, China, Germany

function fetchIndicator(indicator, country) {
    return new Promise((resolve, reject) => {
        const url = `https://www.imf.org/external/datamapper/api/v1/${indicator}/${country}`;
        console.log(`Fetching ${url}...`);

        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ indicator, country, data: json });
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function run() {
    console.log('--- IMF Data Verification ---');
    console.log(`Target Years: 2024 - 2030`);

    for (const country of countries) {
        console.log(`\n\n=== ${country} ===`);
        for (const ind of indicators) {
            try {
                const result = await fetchIndicator(ind, country);
                const values = result.data.values?.[ind]?.[country];

                if (!values) {
                    console.log(`${ind}: No data found`);
                    continue;
                }

                console.log(`${ind} (Raw):`);
                for (let y = 2024; y <= 2030; y++) {
                    console.log(`  ${y}: ${values[y]}`);
                }
            } catch (e) {
                console.error(`Error fetching ${ind} for ${country}:`, e.message);
            }
        }
    }
}

run();
