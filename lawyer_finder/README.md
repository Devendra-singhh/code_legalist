Find a Lawyer  

a simple web tool that helps people search for lawyers based on their legal needs. It uses AI to understand what the user is looking for and matches them with the most relevant lawyers.

Live: [https://lawyer.sloq.me](https://lawyer.sloq.me)

## What It Does

- Lets users search using plain questions like “divorce lawyer in Mumbai”
- Shows lawyer profiles with their experience and specializations
- Uses AI to understand meaning, not just keywords
- Gives real-time search results instantly

## How It Works
```mermaid
flowchart LR
    A[User enters query] --> B[Gemini AI processes query]
    B --> C[Convert query to vector]
    C --> D[Search vector database]
    D --> E[Find relevant lawyers]
    E --> F[Show lawyer details to user]
```

## Tech Overview

- **Frontend**: Built with Next.js (React)
- **AI**: Google Gemini + vector embeddings
- **Database**: PostgreSQL with vector search via Supabase
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
