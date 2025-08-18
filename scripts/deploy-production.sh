#!/bin/bash

# Production Deployment Script for GrainKeeper
echo "🚀 Starting GrainKeeper Production Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY" ]; then
    echo "❌ Error: Required environment variables not set."
    echo "Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY are set."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Run database migrations
echo "🗄️ Running database migrations..."
node scripts/run-migration.js

# Build the application
echo "🔨 Building application..."
npm run build

# Run tests (if available)
if [ -f "package.json" ] && grep -q "\"test\":" package.json; then
    echo "🧪 Running tests..."
    npm test
fi

# Check build output
if [ ! -d ".next" ]; then
    echo "❌ Error: Build failed. .next directory not found."
    exit 1
fi

echo "✅ Build completed successfully!"

# Deploy to Vercel (if using Vercel)
if command -v vercel &> /dev/null; then
    echo "🚀 Deploying to Vercel..."
    vercel --prod
else
    echo "📋 Manual deployment steps:"
    echo "1. Upload the .next directory to your hosting provider"
    echo "2. Set up environment variables on your hosting platform"
    echo "3. Configure your domain and SSL certificates"
    echo "4. Set up monitoring and error tracking"
fi

echo "🎉 Deployment completed!"
echo "📊 Next steps:"
echo "1. Verify the application is running correctly"
echo "2. Test all major features (yield predictions, chatbot, etc.)"
echo "3. Set up monitoring and analytics"
echo "4. Configure backup and recovery procedures"
