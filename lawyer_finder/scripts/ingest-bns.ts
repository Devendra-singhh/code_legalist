import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { db } from '../lib/db';
import { resources } from '../lib/db/schema/resources';
import { embeddings } from '../lib/db/schema/embeddings';
import { generateEmbedding } from '../lib/ai/embedding';

async function main() {
  console.log('Starting BNS Dataset Ingestion...');
  
  const csvPath = path.resolve(__dirname, '../../homepage/bns dataset/bns_sections.csv');
  console.log(`Reading CSV from ${csvPath}`);
  
  if (!fs.existsSync(csvPath)) {
    console.error(`File not found: ${csvPath}`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  console.log(`Found ${records.length} sections to ingest.`);

  // Create a single resource for the entire BNS dataset
  const [resource] = await db.insert(resources).values({
    content: 'Bharatiya Nyaya Sanhita, 2023 (BNS) Dataset',
  }).returning();

  console.log(`Created Resource ID: ${resource.id}`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    
    // Structure the content to be embedded and searched
    // Columns: Chapter, Chapter_name, Chapter_subtype, Section, Section _name, Description
    const sectionName = record['Section _name'] || record['Section_name'] || '';
    const description = record['Description'] || '';
    
    const content = `Chapter: ${record.Chapter} - ${record.Chapter_name}\nSection: ${record.Section} - ${sectionName}\nDescription: ${description}`;
    
    try {
      const embedding = await generateEmbedding(content);
      
      await db.insert(embeddings).values({
        resourceId: resource.id,
        content: JSON.stringify({
          Chapter: record.Chapter,
          Chapter_name: record.Chapter_name,
          Section: record.Section,
          Section_name: sectionName,
          Description: description
        }),
        type: 'bns_section',
        embedding: embedding,
      });

      successCount++;
      if (successCount % 50 === 0) {
        console.log(`Ingested ${successCount} sections...`);
      }
      
    } catch (err) {
      console.error(`Failed to ingest Section ${record.Section}`, err);
      failCount++;
    }
  }

  console.log('Ingestion Complete!');
  console.log(`Successfully ingested: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  process.exit(0);
}

main().catch(console.error);
