
// const fetch = require('node-fetch');

const IMF_INDICATORS = {
    GDP_GROWTH: 'NGDP_RPCH',
    INFLATION: 'PCPIPCH',
    GOV_DEBT: 'GGXWDG_NGDP',
    CURRENT_ACCOUNT: 'BCA_NGDPD'
};

async function testIMF() {
    const countryId = 'USA';
    const indicators = Object.values(IMF_INDICATORS).join('/');
    const url = `https://www.imf.org/external/datamapper/api/v1/${indicators}/${countryId}`;

    console.log(`Fetching ${url}...`);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`HTTP Error: ${response.status} ${response.statusText}`);
            return;
        }
        const json = await response.json();
        console.log('Response keys:', Object.keys(json));
        if (json.values) {
            console.log('Values found:', JSON.stringify(json.values.NGDP_RPCH?.USA, null, 2));
        } else {
            console.log('No values property found');
        }
    } catch (e) {
        console.error('Fetch failed:', e);
    }
}

testIMF();
