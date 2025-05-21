# Code Legalist Homepage

This is the homepage for the Code Legalist platform, built with [Next.js](https://nextjs.org).

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### Environment Variables

Create a `.env.local` file in the root directory and add the following environment variables:

```bash
# Forum Frontend URL
NEXT_PUBLIC_FORUM_URL=https://forumfrontend-kzyqs2twi-rxhulshxrmxs-projects.vercel.app

# Backend API URL
NEXT_PUBLIC_API_URL=https://forumbackend-e759zx3lh-rxhulshxrmxs-projects.vercel.app
```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/page.tsx` - The main page component
- `app/find-lawyer/page.tsx` - Find a lawyer page
- `app/login/page.tsx` - Login page
- `app/signup/page.tsx` - Signup page
- `components/` - Reusable React components
- `public/` - Static files
- `styles/` - Global styles

## Features

- Responsive design
- Dark mode support
- Integration with the Code Legalist forum
- Legal AI chatbot integration
- Find a lawyer functionality

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
