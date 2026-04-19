import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { lawyerContacts } from "@/lib/db/schema/embeddings";
import { eq } from "drizzle-orm";

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ error: "Lawyer ID is required" }, { status: 400 });
    }

    await db.delete(lawyerContacts).where(eq(lawyerContacts.id, id));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete lawyer:", error);
    return NextResponse.json({ error: "Failed to delete lawyer" }, { status: 500 });
  }
}
