const https = require('https');

const API_KEY = process.env.WIX_API_KEY;
const SITE_ID = 'bf67be59-51df-45f7-855e-dc863c1c1b1f';

function wixRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.wixapis.com',
      path,
      method,
      headers: {
        'Authorization': API_KEY,
        'wix-site-id': SITE_ID,
        'Content-Type': 'application/json',
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { resolve(data); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function queryCollection(collectionId) {
  const result = await wixRequest('POST', '/wix-data/v2/items/query', {
    dataCollectionId: collectionId,
    query: { paging: { limit: 50 } },
    returnTotalCount: true,
  });
  return result;
}

async function main() {
  // List collections
  const collections = await wixRequest('GET', '/wix-data/v2/collections');

  console.log('=== WIX COLLECTIONS ===\n');
  for (const c of collections.collections) {
    const userFields = c.fields.filter(f => f.systemField !== true);
    console.log(`Collection: ${c.id} (${c.displayName})`);
    console.log(`  Fields: ${userFields.map(f => f.displayName + ' [' + f.type + ']').join(', ')}`);
    console.log();
  }

  // Query each relevant collection
  const relevantCollections = ['Talents', 'Areas'];

  // Also check for any other user collections
  const userCollections = collections.collections
    .filter(c => c.collectionType === 'NATIVE')
    .map(c => c.id);

  console.log('=== USER COLLECTIONS ===');
  console.log(userCollections.join(', '));
  console.log();

  for (const collId of userCollections) {
    console.log(`\n=== DATA: ${collId} ===`);
    try {
      const result = await queryCollection(collId);
      console.log(`Total items: ${result.totalCount || 'unknown'}`);
      if (result.dataItems) {
        result.dataItems.forEach((item, i) => {
          console.log(`\n--- Item ${i + 1} ---`);
          console.log(JSON.stringify(item.data, null, 2));
        });
      } else {
        console.log('No items or error:', JSON.stringify(result, null, 2));
      }
    } catch (err) {
      console.log('Error:', err.message);
    }
  }
}

main().catch(console.error);
