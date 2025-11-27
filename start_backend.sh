#!/bin/bash
# Backend başlatma scripti

cd "$(dirname "$0")"

# .env dosyası kontrolü ve yükleme
if [ -f ".env" ]; then
    echo "✅ .env dosyası bulundu, yükleniyor..."
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Environment variables yüklendi"
else
    echo "⚠️  .env dosyası bulunamadı!"
    echo "📝 .env.example dosyasını kopyalayarak .env oluşturun:"
    echo "   cp .env.example .env"
    echo ""
    echo "💡 Ardından .env dosyasını düzenleyip API key'lerinizi ekleyin"
    echo ""
    
    # Environment variables kontrolü (eski yöntem - geriye dönük uyumluluk)
    if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ] || [ -z "$OPENAI_API_KEY" ]; then
        echo "⚠️  UYARI: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY ve OPENAI_API_KEY ayarlanmalı!"
        echo "📝 .env dosyası oluşturun veya environment variable'ları export edin"
        echo ""
    fi
fi

# OpenAI Model bilgisi
if [ -z "$OPENAI_MODEL" ]; then
    export OPENAI_MODEL="gpt-4o"
    echo "ℹ️  OPENAI_MODEL otomatik olarak 'gpt-4o' olarak ayarlandı"
fi

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ] || [ -z "$OPENAI_API_KEY" ]; then
    echo ""
fi

echo "🚀 Backend başlatılıyor..."
echo "📍 URL: http://localhost:8000"
echo "📚 Docs: http://localhost:8000/docs"
echo "🤖 OpenAI Model: $OPENAI_MODEL"
echo ""

# Backend'i proje root'undan başlat (relative import'lar için gerekli)
# backend klasörüne girmeden, backend.main:app şeklinde çağırıyoruz
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

