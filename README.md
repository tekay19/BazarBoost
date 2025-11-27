# SEO Optimize Studio

E-ticaret platformları için SEO optimizasyon aracı.

## Kurulum

### Backend

1. Bağımlılıkları yükleyin:
```bash
pip install -r requirements.txt
```

2. Ortam değişkenlerini ayarlayın (.env dosyası oluşturun):
```bash
SECRET_KEY=your-secret-key-here
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
OPENAI_API_KEY=your-openai-api-key
ADMIN_EMAILS=admin@example.com
CORS_ORIGINS=http://localhost:8501
```

3. Backend'i başlatın:
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

1. Streamlit'i başlatın:
```bash
cd frontend
streamlit run app.py --server.port 8501
```

2. Tarayıcıda açın: http://localhost:8501

## API Endpoints

- `POST /auth/register` - Kullanıcı kaydı
- `POST /auth/login` - Giriş
- `GET /auth/me` - Kullanıcı bilgileri
- `GET /user/credits/get` - Kredi bakiyesi
- `POST /user/credits/use` - Kredi kullan
- `POST /seo/optimize` - SEO optimizasyonu
- `POST /payments/create-session` - Ödeme oturumu oluştur
- `GET /admin/users` - Tüm kullanıcıları listele (admin)
- `POST /admin/credits` - Kredi ekle (admin)

# BazarBoost
