# Email Servisi Kurulumu

## Gmail ile Email Gönderme

### 1. Gmail App Password Oluşturma

1. Google Hesabınıza giriş yapın
2. [Google Account Security](https://myaccount.google.com/security) sayfasına gidin
3. "2-Step Verification" aktif olmalı (yoksa aktif edin)
4. "App passwords" bölümüne gidin
5. "Select app" → "Mail" seçin
6. "Select device" → "Other (Custom name)" → "BazarBoost" yazın
7. "Generate" butonuna tıklayın
8. Oluşturulan 16 haneli şifreyi kopyalayın

### 2. Environment Variables Ayarlama

```bash
export SMTP_USERNAME='your-email@gmail.com'
export SMTP_PASSWORD='your-16-digit-app-password'
export SMTP_SERVER='smtp.gmail.com'
export SMTP_PORT='587'
export EMAIL_FROM='your-email@gmail.com'
```

### 3. Diğer Email Sağlayıcıları

#### Outlook/Hotmail
```bash
export SMTP_SERVER='smtp-mail.outlook.com'
export SMTP_PORT='587'
```

#### SendGrid
```bash
export SMTP_SERVER='smtp.sendgrid.net'
export SMTP_PORT='587'
export SMTP_USERNAME='apikey'
export SMTP_PASSWORD='your-sendgrid-api-key'
```

#### Mailgun
```bash
export SMTP_SERVER='smtp.mailgun.org'
export SMTP_PORT='587'
export SMTP_USERNAME='your-mailgun-username'
export SMTP_PASSWORD='your-mailgun-password'
```

## Test

Backend başlatıldıktan sonra:
```bash
curl -X POST http://localhost:8000/auth/send-verification-code \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## Güvenlik Özellikleri

- ✅ 6 haneli kod üretimi (güvenli random)
- ✅ Kod hash'leme (SHA256)
- ✅ 10 dakika kod geçerliliği
- ✅ Maksimum 5 deneme hakkı
- ✅ Rate limiting (backend'de)
- ✅ Email doğrulama zorunlu

