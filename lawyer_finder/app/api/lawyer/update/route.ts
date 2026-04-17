import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { lawyerContacts } from "@/lib/db/schema/embeddings";
import { eq } from "drizzle-orm";
import { createResource } from "@/lib/actions/resources";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { id, name, location, experience, languages, practiceAreas, court, profileLink, about } = data;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    let lawyer;

    // Handle updates if ID exists, else insert new
    if (id) {
      const updated = await db
        .update(lawyerContacts)
        .set({
          name,
          location,
          experience,
          languages,
          practiceAreas,
          court,
          profileLink,
          about,
          updatedAt: new Date(),
        })
        .where(eq(lawyerContacts.id, id))
        .returning();

      lawyer = updated[0];
    } else {
      const inserted = await db
        .insert(lawyerContacts)
        .values({
          name,
          location,
          experience,
          languages,
          practiceAreas,
          court,
          profileLink,
          about,
        })
        .returning();

      lawyer = inserted[0];
    }

    if (!lawyer) {
      throw new Error("Failed to save lawyer contact.");
    }

    // Prepare content string to be embedded
    const embedContent = JSON.stringify({
      Name: lawyer.name,
      Location: lawyer.location,
      Experience: lawyer.experience,
      Languages: lawyer.languages,
      "Practice Areas": lawyer.practiceAreas,
      Court: lawyer.court,
      About: lawyer.about,
      "Profile Link": lawyer.profileLink,
    });

    // Semantic text representation for the AI to understand
    const semanticContent = `Lawyer Profile:
Name: ${lawyer.name}
Location: ${lawyer.location}
Experience: ${lawyer.experience}
Languages: ${lawyer.languages}
Practice Areas: ${lawyer.practiceAreas}
Court: ${lawyer.court}
About: ${lawyer.about}
Profile Link: ${lawyer.profileLink}

Detailed JSON:
${embedContent}`;

    // Create the resource and embedding
    await createResource({ content: semanticContent });

    return NextResponse.json({ success: true, lawyer }, { status: 200 });
  } catch (error) {
    console.error("Lawyer update error:", error);
    return NextResponse.json(
      { error: "Failed to update lawyer." },
      { status: 500 }
    );
  }
}
