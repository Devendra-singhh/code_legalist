import { parse } from 'csv-parse/sync';
import { readFileSync, existsSync } from 'fs';
import { db } from '../lib/db';
import { resources } from '../lib/db/schema/resources';
import { embeddings, lawyerContacts } from '../lib/db/schema/embeddings';
import { generateEmbedding } from '../lib/ai/embedding';
import { sql } from 'drizzle-orm';
import path from 'path';

interface CSVLawyer {
  Name: string;
  Location: string;
  Experience: string;
  Languages: string;
  'Practice Areas': string;
  About: string;
  Court: string;
  'Profile Link': string;
}

async function seedLawyers() {
  const csvPath = path.join(process.cwd(), 'Advocate_data.csv');
  
  if (!existsSync(csvPath)) {
    console.error(`❌ CSV file not found at ${csvPath}`);
    process.exit(1);
  }

  try {
    console.log('📖 Reading Advocate_data.csv...');
    const fileContent = readFileSync(csvPath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    }) as CSVLawyer[];

    // We will seed the first 30 lawyers for a diverse and manageable dataset
    const TOP_RECORDS_COUNT = 30;
    const recordsToSeed = records.slice(0, TOP_RECORDS_COUNT);
    
    console.log(`🚀 Starting seed process for ${recordsToSeed.length} lawyers...`);

    const BATCH_SIZE = 3; // Smaller batch to avoid overwhelming rate limits
    for (let i = 0; i < recordsToSeed.length; i += BATCH_SIZE) {
      const batch = recordsToSeed.slice(i, i + BATCH_SIZE);
      console.log(`\n📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(recordsToSeed.length / BATCH_SIZE)}`);

      await Promise.all(batch.map(async (lawyer) => {
        try {
          // 1. Insert into lawyer_contacts (Structured Table)
          const [contact] = await db.insert(lawyerContacts).values({
            name: lawyer.Name,
            location: lawyer.Location,
            experience: lawyer.Experience,
            languages: lawyer.Languages,
            practiceAreas: lawyer['Practice Areas'],
            court: lawyer.Court,
            profileLink: lawyer['Profile Link'],
            about: lawyer.About,
          }).returning();

          // 2. Create text representation for embedding
          const lawyerText = `
            Name: ${lawyer.Name}
            Specialty: ${lawyer['Practice Areas']}
            Location: ${lawyer.Location}
            Experience: ${lawyer.Experience} years
            Court: ${lawyer.Court}
            Details: ${lawyer.About}
          `.trim();

          // 3. Insert into resources
          const [resource] = await db.insert(resources).values({
            content: JSON.stringify(lawyer)
          }).returning();

          // 4. Generate & Insert Embedding
          const embedding = await generateEmbedding(lawyerText);
          await db.insert(embeddings).values({
            resourceId: resource.id,
            content: JSON.stringify(lawyer),
            embedding: sql`${JSON.stringify(embedding)}::vector`,
            type: "lawyer"
          });

          console.log(`✅ Seeded: ${lawyer.Name} (ID: ${contact.id})`);
        } catch (error) {
          console.error(`❌ Error seeding ${lawyer.Name}:`, error);
        }
      }));
    }

    console.log('\n✨ Lawyer seeding completed successfully!');
  } catch (error) {
    console.error('💥 Fatal seeding error:', error);
    process.exit(1);
  }
}

seedLawyers();
