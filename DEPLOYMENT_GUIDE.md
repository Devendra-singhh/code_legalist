# Deployment Guide for Code Legalist

This guide will help you deploy the three main components of the application:
1. Homepage (Next.js)
2. Forum Frontend (Vite/React)
3. Backend API (Node.js/Express)

## Prerequisites
1. Install Vercel CLI: `npm install -g vercel`
2. Login to Vercel: `vercel login`
3. Make sure all dependencies are installed in each directory

## 1. Deploy the Backend API

```bash
cd forum/forum_backend
vercel
```

When prompted:
- Set up and deploy: Yes
- Scope: Select your Vercel account
- Link to existing project: No
- What's your project's name: code-legalist-backend
- In which directory is your code: ./
- Override settings: No
```

Take note of the deployment URL (e.g., `https://code-legalist-backend.vercel.app`)

## 2. Deploy the Forum Frontend

First, update the API URL in your frontend code to point to the deployed backend.

```bash
cd ../forum_frontend
vercel
```

When prompted:
- Set up and deploy: Yes
- Scope: Select your Vercel account
- Link to existing project: No
- What's your project's name: code-legalist-forum
- In which directory is your code: ./
- Override settings: No
```

## 3. Deploy the Homepage (Next.js)

```bash
cd ../../homepage
vercel
```

When prompted:
- Set up and deploy: Yes
- Scope: Select your Vercel account
- Link to existing project: No
- What's your project's name: code-legalist
- In which directory is your code: ./
- Override settings: No
```

## Environment Variables

For each deployment, make sure to set the following environment variables in the Vercel dashboard:

### Backend
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secret key for JWT token generation
- `NODE_ENV`: `production`

### Frontend (Forum)
- `VITE_API_URL`: The URL of your deployed backend (e.g., `https://code-legalist-backend.vercel.app`)

### Homepage
- `NEXT_PUBLIC_API_URL`: The URL of your deployed backend (e.g., `https://code-legalist-backend.vercel.app`)

## Connecting the Components

1. Make sure the frontend applications are configured to use the correct backend URL.
2. Update any CORS settings in the backend to allow requests from your frontend domains.
3. Test all the integrations after deployment.

## Post-Deployment

1. Verify all services are running correctly
2. Test the authentication flow
3. Test the forum functionality
4. Check for any CORS or API connection issues

## Troubleshooting

- If you encounter CORS issues, verify the `allowedOrigins` array in the backend's `server.js`
- Check the Vercel deployment logs for any errors
- Make sure all environment variables are set correctly in the Vercel dashboard
