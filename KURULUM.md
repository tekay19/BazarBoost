# Kurulum ve Çalıştırma Kılavuzu

## Gereksinimler

- Python 3.8+
- Supabase hesabı ve API anahtarları
- OpenAI API anahtarı

## Adım 1: Bağımlılıkları Yükleyin

```bash
pip install -r requirements.txt
```

## Adım 2: Environment Variables Ayarlayın

### Backend için:

Terminal'de export edin veya `.env` dosyası oluşturun:

```bash
export SECRET_KEY="your-secret-key-here"
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
export OPENAI_API_KEY="sk-your-openai-api-key"
export OPENAI_MODEL="gpt-4o"  # gpt-4o (önerilen), gpt-4o-mini, gpt-4-turbo
export ADMIN_EMAILS="admin@example.com"
export CORS_ORIGINS="http://localhost:8501"

# Ödeme sağlayıcısı ayarları (opsiyonel)
export PAYMENT_PROVIDER="stripe"  # stripe, iyzico, paytr, etc.
export PAYMENT_BASE_URL="https://your-payment-provider.com"  # Ödeme sağlayıcısı base URL
export STRIPE_SECRET_KEY="sk_your_stripe_secret_key"  # Stripe kullanıyorsanız
export STRIPE_PUBLISHABLE_KEY="pk_your_stripe_publishable_key"  # Stripe kullanıyorsanız
```

### Frontend için:

Streamlit secrets kullanılıyor. `.streamlit/secrets.toml` dosyası oluşturun:

```toml
API_BASE_URL = "http://localhost:8000"
ADMIN_EMAILS = ["admin@example.com"]
```

Veya environment variable olarak:
```bash
export API_BASE_URL="http://localhost:8000"
```

## Adım 3: Supabase Veritabanı Tablolarını Oluşturun

Supabase dashboard'da aşağıdaki tabloları oluşturun:

### users tablosu:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### credits tablosu:
```sql
CREATE TABLE credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### payments tablosu:
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  credits_added INTEGER NOT NULL,
  provider TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Adım 4: Uygulamayı Başlatın

### Terminal 1 - Backend:
```bash
./start_backend.sh
```
veya
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend şu adreste çalışacak: http://localhost:8000
API dokümantasyonu: http://localhost:8000/docs

### Terminal 2 - Frontend:
```bash
./start_frontend.sh
```
veya
```bash
cd frontend
streamlit run app.py --server.port 8501
```

Frontend şu adreste çalışacak: http://localhost:8501

## Test Etme

Backend'in çalıştığını test etmek için:
```bash
curl http://localhost:8000/
```

Başarılı yanıt: `{"status":"ok"}`

## Önemli Notlar

⚠️ **Mock Veriler Kaldırıldı**: Uygulama artık gerçek API'leri kullanıyor:
- ✅ OpenAI API gerçek API çağrıları yapıyor
- ✅ Supabase gerçek veritabanı bağlantısı kullanıyor
- ✅ Payment endpoint'i gerçek ödeme sağlayıcısı URL'i bekliyor

**Tüm environment variable'ların doğru ayarlandığından emin olun!**

## Sorun Giderme

### Backend başlamıyor:
- Environment variable'ların doğru ayarlandığından emin olun
- Supabase URL ve key'lerin doğru olduğunu kontrol edin
- OpenAI API key'in geçerli olduğunu kontrol edin
- Port 8000'in kullanılabilir olduğunu kontrol edin

### OpenAI API hatası:
- `OPENAI_API_KEY` environment variable'ının ayarlandığından emin olun
- API key'in geçerli ve aktif olduğunu kontrol edin
- API quota'nızın yeterli olduğunu kontrol edin

### Payment hatası:
- `PAYMENT_BASE_URL` environment variable'ının ayarlandığından emin olun
- Stripe kullanıyorsanız `STRIPE_SECRET_KEY` ayarlandığından emin olun

### Frontend backend'e bağlanamıyor:
- Backend'in çalıştığından emin olun
- `API_BASE_URL`'in doğru olduğunu kontrol edin (varsayılan: http://localhost:8000)
- CORS ayarlarını kontrol edin

### Database hataları:
- Supabase tablolarının oluşturulduğundan emin olun
- Service role key'in doğru olduğunu kontrol edin
- RLS (Row Level Security) politikalarını kontrol edin

