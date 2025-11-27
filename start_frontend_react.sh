#!/bin/bash

# React Frontend Başlatma Scripti

echo "🚀 React Frontend Başlatılıyor..."
echo ""

cd "$(dirname "$0")/frontend-react" || exit 1

# .env dosyası kontrolü
if [ ! -f .env ]; then
    echo "📝 .env dosyası oluşturuluyor..."
    cat > .env << EOF
VITE_API_BASE_URL=http://localhost:8000
VITE_ADMIN_EMAILS=admin@example.com
EOF
    echo "✅ .env dosyası oluşturuldu"
fi

# Node modules kontrolü
if [ ! -d "node_modules" ]; then
    echo "📦 Dependencies yükleniyor..."
    npm install
fi

echo ""
echo "✅ Frontend hazır!"
echo ""
echo "🌐 Frontend şu adreste çalışacak: http://localhost:5173"
echo "🔗 Backend API: http://localhost:8000"
echo ""
echo "⚠️  Backend'in çalıştığından emin olun!"
echo ""

npm run dev

