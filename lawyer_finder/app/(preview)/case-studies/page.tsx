import React from "react";
import { db } from "@/lib/db";
import { caseStudies } from "@/lib/db/schema/embeddings";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default async function CaseStudiesPage() {
  const cases = await db.select().from(caseStudies).orderBy(desc(caseStudies.createdAt));

  return (
    <div className="container mx-auto p-8 max-w-5xl min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight dark:text-white text-neutral-900 mb-2">Legal Case Studies</h1>
          <p className="text-neutral-500 dark:text-neutral-400">Explore AI-researched landmarks and precedent cases.</p>
        </div>
        <Link href="/">
          <Button variant="outline">Back to Search</Button>
        </Link>
      </div>

      {cases.length === 0 ? (
        <div className="text-center py-20 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <p className="text-neutral-500 dark:text-neutral-400">No case studies have been researched and saved yet. Ask the chatbot AI for legal precedents to automatically populate this library.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cases.map((c) => (
            <div key={c.id} className="group relative rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm transition-all hover:shadow-md dark:hover:bg-neutral-900/80">
              <div className="mb-4 flex items-start justify-between">
                <h3 className="font-semibold text-lg leading-snug dark:text-neutral-100">{c.title}</h3>
                <span className="shrink-0 rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1 text-xs font-medium dark:text-neutral-300 ml-4">
                  {c.year || 'N/A'}
                </span>
              </div>
              
              <div className="mb-4">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Jurisdiction</span>
                <p className="text-sm dark:text-neutral-300 mt-1">{c.jurisdiction}</p>
              </div>

              <div className="mb-4">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Summary</span>
                <p className="text-sm dark:text-neutral-300 mt-1 line-clamp-3 leading-relaxed">{c.summary}</p>
              </div>
              
              <div className="mb-6">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Relevance</span>
                <p className="text-sm dark:text-neutral-300/80 mt-1 italic leading-relaxed">{c.relevance}</p>
              </div>

              <a 
                href={c.sourceUrl || '#'} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
              >
                Read Official Source
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
