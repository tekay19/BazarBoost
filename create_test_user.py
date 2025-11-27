#!/usr/bin/env python3
"""
Test kullanıcısı oluşturma scripti
"""
import sys
import os

# Environment variables kontrolü
if not os.getenv("SUPABASE_URL") or not os.getenv("SUPABASE_SERVICE_ROLE_KEY"):
    print("⚠️  UYARI: Supabase environment variables ayarlanmamış!")
    print("")
    print("📝 Lütfen şu environment variables'ları ayarlayın:")
    print("   export SUPABASE_URL='https://your-project.supabase.co'")
    print("   export SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'")
    print("")
    print("💡 Alternatif olarak .env dosyası oluşturabilirsiniz")
    print("")
    sys.exit(1)

sys.path.insert(0, '.')

from backend import db, config, utils

def create_test_user():
    """Test kullanıcısı oluştur"""
    email = "test@bazarboost.com"
    password = "Test1234!"
    
    print("🔍 Kullanıcı kontrol ediliyor...")
    
    # Check if user exists
    try:
        existing = db.get_user_by_email(email)
        if existing:
            print(f"✅ Kullanıcı zaten mevcut!")
            print("")
            print("📧 E-posta:", email)
            print("🔑 Şifre:", password)
            print("")
            print("🌐 Giriş yapmak için:")
            print("   Frontend: http://localhost:5173/login")
            print("   Backend API: http://localhost:8000/docs")
            return
    except Exception as e:
        print(f"⚠️  Kullanıcı kontrolü sırasında hata: {e}")
        print("   Devam ediliyor...")
    
    # Create user
    print("👤 Yeni kullanıcı oluşturuluyor...")
    try:
        password_hash = utils.get_password_hash(password)
        user = db.create_user(email, password_hash, config.DEFAULT_PLAN)
        db.create_initial_credits(user["id"], config.DEFAULT_CREDITS)
        
        print("✅ Test kullanıcısı başarıyla oluşturuldu!")
        print("")
        print("📧 E-posta:", email)
        print("🔑 Şifre:", password)
        print("💳 Başlangıç Kredisi:", config.DEFAULT_CREDITS)
        print("📦 Plan:", config.DEFAULT_PLAN)
        print("")
        print("🌐 Giriş yapmak için:")
        print("   Frontend: http://localhost:5173/login")
        print("   Backend API: http://localhost:8000/docs")
    except Exception as e:
        print(f"❌ Kullanıcı oluşturma hatası: {e}")
        raise

if __name__ == "__main__":
    try:
        create_test_user()
    except Exception as e:
        print(f"❌ Hata: {e}")
        sys.exit(1)

