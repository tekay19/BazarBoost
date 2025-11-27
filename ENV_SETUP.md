# 🔧 Environment Variables Kurulumu

## Hızlı Başlangıç

1. **.env dosyası oluşturun:**
```bash
cp .env.example .env
```

2. **.env dosyasını düzenleyin** ve API key'lerinizi ekleyin:
```bash
nano .env
# veya
code .env
```

3. **Backend'i başlatın:**
```bash
bash start_backend.sh
```

## 📋 Gerekli API Key'ler

### 1. Supabase (Zorunlu)
- [Supabase](https://supabase.com) hesabı oluşturun
- Proje oluşturun
- Settings > API > Project URL ve Service Role Key'i kopyalayın

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. OpenAI (Zorunlu)
- [OpenAI](https://platform.openai.com) hesabı oluşturun
- API Keys bölümünden yeni key oluşturun

```env
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4o
```

### 3. Email/SMTP (Opsiyonel - Kayıt için gerekli)
- Gmail için App Password oluşturun:
  1. Google Account > Security > 2-Step Verification
  2. App passwords > Select app > Mail
  3. 16 haneli şifreyi kopyalayın

```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-16-digit-app-password
EMAIL_FROM=your-email@gmail.com
```

### 4. Stripe (Opsiyonel - Ödeme için)
- [Stripe](https://stripe.com) hesabı oluşturun
- API Keys bölümünden test key'leri alın

```env
PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
PAYMENT_BASE_URL=http://localhost:5173
```

### 5. Security (Zorunlu)
```env
SECRET_KEY=your-strong-secret-key-min-32-chars
```

Güçlü bir secret key oluşturmak için:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## ✅ Kontrol

Tüm değişkenlerin doğru yüklendiğini kontrol edin:
```bash
bash start_backend.sh
```

Backend başarıyla başladıysa:
- ✅ http://localhost:8000 - API
- ✅ http://localhost:8000/docs - API Dokümantasyonu

## 🔒 Güvenlik Notları

- ⚠️ `.env` dosyasını **ASLA** git'e commit etmeyin!
- ⚠️ `.env` dosyası zaten `.gitignore`'da
- ⚠️ Production'da güçlü `SECRET_KEY` kullanın
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` çok hassas, güvenli tutun

## 📝 Tüm Environment Variables Listesi

`.env.example` dosyasında tüm değişkenlerin açıklamaları mevcut.
