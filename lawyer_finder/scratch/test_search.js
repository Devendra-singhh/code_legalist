const fetch = require('node-fetch');

const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;

async function testSearch(userQuery) {
  console.log(`Testing search for: "${userQuery}"`);
  
  const queryLower = userQuery.toLowerCase();
  const hasLocation = /mumbai|delhi|bangalore|pune|chennai|hyderabad|kolkata|ahmedabad|kochi|indore/i.test(queryLower);
  const cityMatch = queryLower.match(/mumbai|delhi|bangalore|pune|chennai|hyderabad|kolkata|ahmedabad|kochi|indore/i)?.[0];

  const searchParams = new URLSearchParams({
    q: userQuery,
    api_key: SERPAPI_API_KEY,
    engine: hasLocation ? "google_local" : "google",
    gl: "in",
    hl: "en",
    num: "10"
  });

  try {
    const response = await fetch(`https://serpapi.com/search?${searchParams.toString()}`);
    const searchData = await response.json();
    const rawResults = searchData.local_results || searchData.organic_results || [];
    
    console.log(`Found ${rawResults.length} raw results.`);
    
    const matched = rawResults.filter(r => {
        const text = JSON.stringify(r).toLowerCase();
        return cityMatch ? text.includes(cityMatch) : true;
    });

    console.log(`Filtered for "${cityMatch}": ${matched.length} results.`);
    matched.forEach((r, i) => {
        console.log(`[${i}] ${r.title || r.name} - ${r.address || r.location || 'No Loc'}`);
    });

  } catch (e) {
    console.error(e);
  }
}

testSearch("Divorce lawyer in Mumbai");
