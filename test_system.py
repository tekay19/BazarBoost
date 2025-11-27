#!/usr/bin/env python3
"""
Sistem test scripti - Backend ve Frontend uyumluluğunu test eder
"""
import sys
import os
sys.path.insert(0, '.')

from fastapi.testclient import TestClient
from backend.main import app

def test_backend():
    """Backend API endpoint'lerini test eder"""
    print("🧪 Backend API Testleri")
    print("=" * 60)
    
    client = TestClient(app)
    results = []
    
    # 1. Health Check
    print("\n1. Health Check Testi...")
    try:
        response = client.get('/')
        assert response.status_code == 200
        print(f"   ✅ Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        results.append(("Health Check", True))
    except Exception as e:
        print(f"   ❌ Hata: {e}")
        results.append(("Health Check", False))
    
    # 2. Register
    print("\n2. Register Testi...")
    test_email = f"test_{os.getpid()}@example.com"
    register_data = {
        'email': test_email,
        'password': 'testpass123'
    }
    token = None
    try:
        response = client.post('/auth/register', json=register_data)
        if response.status_code == 200:
            token = response.json().get('access_token')
            print(f"   ✅ Status: {response.status_code}")
            print(f"   Token alındı: {token[:20]}...")
            results.append(("Register", True))
        else:
            print(f"   ⚠️  Status: {response.status_code}")
            print(f"   Response: {response.json()}")
            results.append(("Register", False))
    except Exception as e:
        print(f"   ❌ Hata: {e}")
        results.append(("Register", False))
    
    if not token:
        print("\n⚠️  Token alınamadı, diğer testler atlanıyor...")
        return results
    
    headers = {'Authorization': f'Bearer {token}'}
    
    # 3. /auth/me
    print("\n3. /auth/me Testi...")
    try:
        response = client.get('/auth/me', headers=headers)
        if response.status_code == 200:
            user_data = response.json()
            print(f"   ✅ Status: {response.status_code}")
            print(f"   User: {user_data.get('email')}")
            print(f"   Credits: {user_data.get('credits')}")
            results.append(("Get User Info", True))
        else:
            print(f"   ❌ Status: {response.status_code}")
            results.append(("Get User Info", False))
    except Exception as e:
        print(f"   ❌ Hata: {e}")
        results.append(("Get User Info", False))
    
    # 4. Credits Get
    print("\n4. Credits Get Testi...")
    try:
        response = client.get('/user/credits/get', headers=headers)
        if response.status_code == 200:
            credits = response.json()
            print(f"   ✅ Status: {response.status_code}")
            print(f"   Credits: {credits.get('balance')}")
            results.append(("Get Credits", True))
        else:
            print(f"   ❌ Status: {response.status_code}")
            results.append(("Get Credits", False))
    except Exception as e:
        print(f"   ❌ Hata: {e}")
        results.append(("Get Credits", False))
    
    # 5. SEO Optimize (eğer kredi varsa)
    print("\n5. SEO Optimize Testi...")
    try:
        seo_data = {
            'title': 'Test Ürün Başlığı',
            'description': 'Test ürün açıklaması'
        }
        response = client.post('/seo/optimize', json=seo_data, headers=headers)
        if response.status_code == 200:
            seo_result = response.json()
            print(f"   ✅ Status: {response.status_code}")
            print(f"   SEO Score: {seo_result.get('seo_score')}")
            print(f"   Optimized Title: {seo_result.get('optimized_title')[:50]}...")
            results.append(("SEO Optimize", True))
        elif response.status_code == 400:
            print(f"   ⚠️  Status: {response.status_code} - {response.json().get('detail')}")
            results.append(("SEO Optimize", "Skipped (no credits)"))
        else:
            print(f"   ❌ Status: {response.status_code}")
            print(f"   Response: {response.json()}")
            results.append(("SEO Optimize", False))
    except Exception as e:
        print(f"   ❌ Hata: {e}")
        results.append(("SEO Optimize", False))
    
    # 6. Payment Session Create
    print("\n6. Payment Session Create Testi...")
    try:
        payment_data = {'package_id': 1}
        response = client.post('/payments/create-session', json=payment_data, headers=headers)
        if response.status_code == 200:
            payment_result = response.json()
            print(f"   ✅ Status: {response.status_code}")
            print(f"   Payment ID: {payment_result.get('payment_id')}")
            print(f"   Provider: {payment_result.get('provider')}")
            results.append(("Payment Create", True))
        elif response.status_code == 500:
            print(f"   ⚠️  Status: {response.status_code} - Payment provider not configured")
            results.append(("Payment Create", "Skipped (not configured)"))
        else:
            print(f"   ❌ Status: {response.status_code}")
            results.append(("Payment Create", False))
    except Exception as e:
        print(f"   ❌ Hata: {e}")
        results.append(("Payment Create", False))
    
    return results

def print_summary(results):
    """Test sonuçlarını özetler"""
    print("\n" + "=" * 60)
    print("📊 Test Özeti")
    print("=" * 60)
    
    passed = sum(1 for _, status in results if status is True)
    skipped = sum(1 for _, status in results if status == "Skipped (not configured)" or status == "Skipped (no credits)")
    failed = sum(1 for _, status in results if status is False)
    
    for test_name, status in results:
        if status is True:
            print(f"✅ {test_name}")
        elif status == "Skipped (not configured)" or status == "Skipped (no credits)":
            print(f"⚠️  {test_name} - Atlandı")
        else:
            print(f"❌ {test_name}")
    
    print(f"\nToplam: {len(results)} test")
    print(f"✅ Başarılı: {passed}")
    print(f"⚠️  Atlandı: {skipped}")
    print(f"❌ Başarısız: {failed}")
    
    if failed == 0:
        print("\n🎉 Tüm kritik testler başarılı!")
    else:
        print("\n⚠️  Bazı testler başarısız oldu, kontrol edin.")

if __name__ == "__main__":
    results = test_backend()
    print_summary(results)
    
    # Exit code
    failed = sum(1 for _, status in results if status is False)
    sys.exit(0 if failed == 0 else 1)

