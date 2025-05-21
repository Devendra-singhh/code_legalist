# Code Legalist

A modern legal forum web application built with Next.js, React, and Node.js.

## Project Structure

The project consists of two main components:

### 1. Homepage (localhost:3000)
- Built with Next.js and Tailwind CSS
- Features dark mode toggle
- Hero section with search
- Trending legal topics
- "Join Forum" button

### 2. Forum Application (localhost:3002)
- Built with React (Vite) and Node.js
- Public post viewing with guest token authentication
- Categories for legal topics
- Responsive card grid layout
- Dark mode support
- Search functionality
- Pagination

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd code-legalist
```

2. Install dependencies and start the homepage:
```bash
cd homepage
npm install
npm run dev
```

3. Install dependencies and start the forum frontend:
```bash
cd ../forum/forum_frontend
npm install
npm run dev
```

4. Install dependencies and start the forum backend:
```bash
cd ../forum_backend
npm install
npm start
```

## Features
- Modern, responsive design
- Dark mode support
- Real-time updates
- Category-based post filtering
- Search functionality
- Pagination
- User authentication
- Public post viewing

## Technologies Used
- Next.js
- React
- Node.js
- Express
- MongoDB
- Tailwind CSS
- Vite 