# Test Kullanıcı Bilgileri

## 🚀 Hızlı Giriş Bilgileri

**E-posta:** `test@bazarboost.com`  
**Şifre:** `Test1234!`

## 📋 Kullanım

1. Frontend'i açın: http://localhost:5173/login
2. Yukarıdaki bilgilerle giriş yapın
3. Dashboard'a yönlendirileceksiniz

## 🔧 Test Kullanıcısı Oluşturma

### Önkoşullar

Önce Supabase environment variables'larını ayarlayın:

```bash
export SUPABASE_URL='https://your-project.supabase.co'
export SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'
```

### Kullanıcı Oluşturma

```bash
python create_test_user.py
```

### Farklı Kullanıcı Oluşturma

Script'i düzenleyerek farklı bir e-posta ve şifre ile kullanıcı oluşturabilirsiniz:

```python
# create_test_user.py dosyasını düzenleyin
email = "your-email@example.com"
password = "YourPassword123!"
```

## 📝 Notlar

- Test kullanıcısı email doğrulaması olmadan oluşturulur (doğrudan database'e eklenir)
- Başlangıç kredisi: 3
- Plan: Free
- Kullanıcı zaten varsa, mevcut bilgiler gösterilir

## 🔐 Güvenlik

⚠️ **ÖNEMLİ:** Bu script sadece test/development ortamı için kullanılmalıdır. Production'da kullanmayın!

