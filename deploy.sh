#!/bin/bash
# Code Legalist Automation Script
# Connects to Vercel and pushes the 3 disjoint node services into the cloud

echo "================================================="
echo "🚀 Initializing Vercel Deployments for Production"
echo "================================================="
echo ""
echo "Please ensure you have run 'vercel login' before executing this script!"
echo ""

# 1. Forum Backend (Node.js/Express API connected to MongoDB)
echo "-----------------------------------"
echo "1️⃣ Deploying Forum Backend API..."
echo "-----------------------------------"
cd forum/forum_backend
vercel --prod
cd ../../


# 2. Forum Frontend (Vite/React SPA)
echo "-----------------------------------"
echo "2️⃣ Deploying Forum Frontend UI..."
echo "-----------------------------------"
cd forum/forum_frontend
vercel --prod
cd ../../


# 3. Main Application (Next.js Homepage / Chatbot / Lawyer Finder)
echo "-----------------------------------"
echo "3️⃣ Deploying Main Next.js Package..."
echo "-----------------------------------"
# Note: Homepage, Chatbot, and Lawyer Finder all serve as their own potential Next.js roots depending on how routing is grouped
cd homepage
vercel --prod
cd ../

echo ""
echo "✅ Deployment iterations complete!"
echo "Make sure to securely transfer your API keys inside the Vercel Dashboard's Settings > Environment Variables for each project."
