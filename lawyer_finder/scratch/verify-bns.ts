import { db } from '../lib/db';
import { sql } from 'drizzle-orm';
import { embeddings } from '../lib/db/schema/embeddings';

async function verify() {
  try {
    const result = await db.execute(sql`
      SELECT 
        COUNT(*) as total_sections
      FROM embeddings 
      WHERE type = 'bns_section';
    `);

    const samples = await db.execute(sql`
      SELECT content::json->>'Section' as section_num, content::json->>'Section_name' as section_name
      FROM embeddings
      WHERE type = 'bns_section'
      ORDER BY (content::json->>'Section')::int ASC
      LIMIT 1;
    `);

    const lastSamples = await db.execute(sql`
      SELECT content::json->>'Section' as section_num, content::json->>'Section_name' as section_name
      FROM embeddings
      WHERE type = 'bns_section'
      ORDER BY (content::json->>'Section')::int DESC
      LIMIT 1;
    `);

    console.log('--- BNS DATASET VERIFICATION ---');
    console.log(`Total sections stored in database: ${result[0].total_sections}`);
    
    if (samples.length > 0) {
      console.log(`\nFirst Section: Section ${samples[0].section_num} - ${samples[0].section_name}`);
    }
    if (lastSamples.length > 0) {
      console.log(`Last Section: Section ${lastSamples[0].section_num} - ${lastSamples[0].section_name}`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Verification failed:', err);
    process.exit(1);
  }
}

verify();
