import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { lawyerContacts } from "@/lib/db/schema/embeddings";
import { desc } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const lawyers = await db.select().from(lawyerContacts).orderBy(desc(lawyerContacts.createdAt));
    return NextResponse.json({ lawyers }, { status: 200 });
  } catch (error) {
    console.error("Failed to list lawyers:", error);
    return NextResponse.json({ error: "Failed to list lawyers" }, { status: 500 });
  }
}
