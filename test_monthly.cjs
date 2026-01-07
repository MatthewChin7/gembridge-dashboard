const https = require('https');

const testMonthly = (indicatorCode) => {
    const url = `https://api.worldbank.org/v2/country/BRA/indicator/${indicatorCode}?frequency=M&date=2023:2024&format=json`;
    console.log(`Fetching ${url}...`);

    https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                if (json[1] && json[1].length > 0) {
                    console.log(`[SUCCESS] Found ${json[1].length} monthly records for ${indicatorCode}`);
                    console.log(JSON.stringify(json[1][0], null, 2));
                } else {
                    console.log(`[FAILURE] No monthly data for ${indicatorCode}`);
                }
            } catch (e) {
                console.error('Parse Error', e);
            }
        });
    }).on('error', (e) => console.error(e));
};

// Test Standard CPI and Exchange Rate
testMonthly('FP.CPI.TOTL.ZG'); // Standard CPI
testMonthly('PA.NUS.FCRF'); // Official Exchange Rate
testMonthly('DP.AN.CALL.XB.AD.XD'); // GEM CP TOT (Random guess/search would be better, but lets try standard first)
