#!/bin/bash

echo "🔧 Setting up environment variables..."
echo ""

# Backend setup
if [ ! -f "backend/.env.local" ]; then
    echo "📁 Setting up backend environment..."
    cp backend/.env.example backend/.env.local
    echo "✅ Created backend/.env.local"
    echo "   Please edit backend/.env.local and add your LiveKit credentials"
else
    echo "✅ backend/.env.local already exists"
fi

echo ""

# Frontend setup
if [ ! -f "frontend/.env.local" ]; then
    echo "📁 Setting up frontend environment..."
    cp frontend/.env.example frontend/.env.local
    echo "✅ Created frontend/.env.local"
    echo "   Please edit frontend/.env.local and add your LiveKit credentials"
else
    echo "✅ frontend/.env.local already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env.local with your LiveKit credentials"
echo "2. Edit frontend/.env.local with your LiveKit credentials"
echo "3. Run: pnpm backend:download-files"
echo "4. Run: pnpm dev"
echo ""
echo "Get your credentials from: https://cloud.livekit.io"
