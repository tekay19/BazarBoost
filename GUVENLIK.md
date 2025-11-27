# Güvenlik Dokümantasyonu

## Uygulanan Güvenlik Önlemleri

### 🔐 Şifre Güvenliği

1. **Bcrypt Hashing**
   - SHA256 yerine bcrypt kullanılıyor (12 rounds)
   - Her şifre için unique salt
   - Timing attack koruması

2. **Şifre Gereksinimleri**
   - Minimum 8 karakter (kayıt için)
   - Maksimum 128 karakter
   - Güç göstergesi (frontend'de)

### 🛡️ Authentication & Authorization

1. **JWT Token Güvenliği**
   - Token expiration kontrolü
   - Token type validation
   - JWT ID (jti) ile token takibi
   - Issued at (iat) timestamp

2. **Rate Limiting**
   - Auth endpoint'leri için: 10 istek/dakika/IP
   - Brute force koruması
   - IP bazlı limit

3. **Input Validation**
   - Email format kontrolü
   - Password strength kontrolü
   - Input length limitleri
   - XSS koruması (HTML escaping)

### 🔒 API Güvenliği

1. **Security Headers**
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: DENY
   - X-XSS-Protection: 1; mode=block
   - Strict-Transport-Security
   - Referrer-Policy

2. **CORS Ayarları**
   - Sadece izin verilen origin'ler
   - Credentials kontrolü
   - Method ve header kısıtlamaları

3. **Error Handling**
   - Bilgi sızıntısı önleme
   - Generic error mesajları
   - Detaylı logging (server-side)

### 🚫 Saldırı Korumaları

1. **XSS (Cross-Site Scripting)**
   - HTML escaping
   - Script tag filtresi
   - Event handler temizleme

2. **SQL Injection**
   - Supabase ORM kullanımı
   - Parameterized queries
   - Input sanitization

3. **CSRF (Cross-Site Request Forgery)**
   - X-Requested-With header kontrolü
   - SameSite cookie ayarları

4. **Timing Attacks**
   - Constant-time password comparison
   - User enumeration koruması

### 📝 Frontend Güvenliği

1. **Token Storage**
   - Session state'de güvenli saklama
   - Otomatik logout (24 saat)
   - Token format validasyonu

2. **Input Sanitization**
   - Tüm kullanıcı girdileri temizleniyor
   - Length limitleri
   - HTML escaping

3. **Secure Headers**
   - API isteklerinde güvenli header'lar
   - Token validasyonu

## Güvenlik Best Practices

### Production Checklist

- [ ] `SECRET_KEY` değiştirilmeli (güçlü random string)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` güvenli saklanmalı
- [ ] `OPENAI_API_KEY` environment variable'da saklanmalı
- [ ] HTTPS kullanılmalı (production'da)
- [ ] Rate limiting için Redis kullanılmalı (production'da)
- [ ] Token blacklist mekanizması eklenmeli
- [ ] Logging ve monitoring aktif olmalı
- [ ] Regular security audits yapılmalı

### Environment Variables Güvenliği

```bash
# Güvenli SECRET_KEY oluşturma
python -c "import secrets; print(secrets.token_urlsafe(32))"

# .env dosyası güvenliği
chmod 600 .env  # Sadece owner okuyabilir
```

## Güvenlik Testleri

```bash
# Güvenlik testlerini çalıştır
pytest tests/backend/test_security.py -v
```

## Raporlama

Güvenlik açığı bulursanız:
1. Hemen raporlayın
2. Detaylı bilgi verin
3. Proof of concept ekleyin (güvenli şekilde)

