import { db } from '../lib/db';
import { caseStudies } from '../lib/db/schema/embeddings';

async function seedLandmarkCases() {
  console.log('🏛️ Seeding Landmark Indian Case Studies...');

  const cases = [
    {
      title: "Kesavananda Bharati v. State of Kerala (1973)",
      summary: "Significant case that established the 'Basic Structure Doctrine' of the Indian Constitution, ruling that the Parliament cannot amend elements that constitute its basic structure.",
      year: "1973",
      jurisdiction: "Supreme Court of India",
      sourceUrl: "https://indiankanoon.org/doc/605240/",
      relevance: "Foundation of Constitutional law in India."
    },
    {
      title: "Maneka Gandhi v. Union of India (1978)",
      summary: "Expanded the scope of Article 21 (Right to Life and Personal Liberty), ruling that any law depriving a person of liberty must be 'just, fair and reasonable'.",
      year: "1978",
      jurisdiction: "Supreme Court of India",
      sourceUrl: "https://indiankanoon.org/doc/1766147/",
      relevance: "Civil liberties and due process."
    },
    {
      title: "Vishaka & Others v. State of Rajasthan (1997)",
      summary: "Led to the creation of the 'Vishaka Guidelines' to address sexual harassment at the workplace in the absence of enacted legislation.",
      year: "1997",
      jurisdiction: "Supreme Court of India",
      sourceUrl: "https://indiankanoon.org/doc/1031794/",
      relevance: "Women's rights and workplace safety."
    },
    {
      title: "SR Bommai v. Union of India (1994)",
      summary: "Set strict guidelines for the dismissal of state governments by the President under Article 356, protecting federalism.",
      year: "1994",
      jurisdiction: "Supreme Court of India",
      sourceUrl: "https://indiankanoon.org/doc/60799/",
      relevance: "Federalism and center-state relations."
    },
    {
      title: "Navtej Singh Johar v. Union of India (2018)",
      summary: "Historic judgment that decriminalized consensual homosexual acts by reading down Section 377 of the Indian Penal Code.",
      year: "2018",
      jurisdiction: "Supreme Court of India",
      sourceUrl: "https://indiankanoon.org/doc/168671544/",
      relevance: "LGBTQ+ rights and social justice."
    }
  ];

  try {
    for (const c of cases) {
      await db.insert(caseStudies).values(c);
      console.log(`✅ Seeded Case: ${c.title}`);
    }
    console.log('\n✨ Landmark cases seeding completed successfully!');
  } catch (error) {
    console.error('💥 Error seeding cases:', error);
    process.exit(1);
  }
}

seedLandmarkCases();