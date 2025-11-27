# 🔍 Auth Login Sorun Giderme

## Hata: AxiosError

Eğer login sırasında AxiosError alıyorsanız:

### 1. Backend Durumunu Kontrol Edin

```bash
# Backend çalışıyor mu?
curl http://localhost:8000/

# Veya browser'da açın:
# http://localhost:8000/docs
```

### 2. Backend'i Yeniden Başlatın

```bash
# Backend'i durdurun (Ctrl+C)
# Sonra tekrar başlatın:
bash start_backend.sh
```

### 3. .env Dosyasını Kontrol Edin

Backend'in çalışması için `.env` dosyası gerekli:

```bash
# .env dosyası var mı?
ls -la .env

# Yoksa oluşturun:
cp .env.example .env

# Sonra API key'lerinizi ekleyin
nano .env
```

### 4. CORS Sorunu

Frontend ve backend farklı portlarda çalışıyor:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000

`.env` dosyasında CORS_ORIGINS ayarını kontrol edin:
```env
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 5. Console Loglarını Kontrol Edin

Browser console'da (F12) detaylı hata mesajlarını görebilirsiniz:
- Network sekmesinde API isteklerini kontrol edin
- Console sekmesinde error mesajlarını görün

### 6. Test Kullanıcısı Oluşturun

```bash
python create_test_user.py
```

Bu komut şu bilgilerle kullanıcı oluşturur:
- Email: test@bazarboost.com
- Password: Test1234!

### 7. Manuel Test

Backend API'yi direkt test edin:

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@bazarboost.com","password":"Test1234!"}'
```

Başarılı olursa bir token döner.
