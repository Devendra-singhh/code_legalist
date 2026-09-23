# Code Legalist

Code Legalist is a comprehensive legal technology platform that makes legal assistance accessible, understandable, and efficient. The platform combines multiple components to provide a complete legal solution for users.

## Features

### 1. AI-Powered Legal Assistant
- Real-time legal consultation through AI chatbot
- Context-aware responses based on Indian laws
- Multiple AI models for enhanced accuracy
- Natural language understanding for complex legal queries

### 2. Legal Forum
- Community-driven legal discussions
- Category-based organization
- Advanced search functionality
- Dark mode support
- Guest access capabilities
- Real-time notifications

### 3. Lawyer Finder
- Comprehensive lawyer search
- Detailed lawyer profiles
- Specialization-based filtering
- Location-based search
- Rating and review system

### 4. Modern Homepage
- Clean, intuitive interface
- Quick access to all platform features
- Trending legal topics
- Smart search integration
- Responsive design

## Deployment & Live URLs

The platform components are deployed on **Vercel** (Next.js & Vite frontends) and **Render** (FastAPI AI Backend):

| Component | Platform | Configuration / Default URL |
| :--- | :--- | :--- |
| **Main Portal / Homepage** | Vercel | [https://code-legalist.vercel.app](https://code-legalist.vercel.app) |
| **AI Legal Chatbot** | Vercel + Render | Deployed via `chatbot/frontend` (Vercel) & `chatbot/backend` (Render) |
| **Backend API (FastAPI)** | Render | Configured via [`render.yaml`](render.yaml) (`legal-assistant-backend`) |
| **Lawyer Finder** | Vercel | Deployed via `lawyer_finder` |
| **Legal Forum** | Vercel | Frontend: `forum/forum_frontend`, API: `forum/forum_backend` |

> *Note: Legacy `*.sloq.me` custom domains were tied to a prior DNS registration that is no longer active.*


## Project Structure

```
code_legalist/
├── homepage/          # Main landing page
├── forum/             # Legal discussion forum
├── chatbot/           # AI-powered legal chatbot
└── lawyer_finder/     # Lawyer search and matching
```

## Technology Stack

- Frontend: React.js, Next.js
- Backend: Node.js, Express, FastAPI
- Database: MongoDB, Supabase
- AI/ML: Mistral, Gemini, Cosine Similarity
- Authentication: JWT, OAuth
- Deployment: Docker, AWS

## Project Folders Overview

### Homepage
- A clean, user-friendly landing page that serves as the main entry point for the platform.
- Features a search bar, trending legal topics, and quick links to other components.

### Forum
- A community-driven legal discussion platform where users can post and read legal discussions.
- Includes features like category-based organization, search, dark mode, and guest login.

### Chatbot
- An AI-powered legal assistant that provides real-time legal consultation.
- Generates context-aware responses based on Indian laws using multiple AI models.

### Lawyer Finder
- A tool designed to help users connect with legal professionals.
- Features include comprehensive lawyer search, detailed profiles, and specialization-based filtering.

  
