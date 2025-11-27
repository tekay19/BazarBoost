import os
import smtplib
import secrets
import hashlib
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Dict
from fastapi import HTTPException, status

# Email configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", SMTP_USERNAME)

# In-memory storage for verification codes (in production, use Redis)
_verification_codes: Dict[str, Dict] = {}


def generate_verification_code() -> str:
    """Generate a 6-digit verification code"""
    return f"{secrets.randbelow(900000) + 100000:06d}"


def hash_code(code: str) -> str:
    """Hash verification code for storage"""
    return hashlib.sha256(code.encode()).hexdigest()


def send_email(to_email: str, subject: str, html_body: str, text_body: str = None) -> bool:
    """Send email using SMTP"""
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email service not configured. Set SMTP_USERNAME and SMTP_PASSWORD environment variables."
        )
    
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = EMAIL_FROM
        msg['To'] = to_email
        
        if text_body:
            part1 = MIMEText(text_body, 'plain')
            msg.attach(part1)
        
        part2 = MIMEText(html_body, 'html')
        msg.attach(part2)
        
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
        
        return True
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send email: {str(e)}"
        )


def send_verification_code(email: str) -> str:
    """Generate and send verification code to email"""
    # Clean old codes
    current_time = datetime.now()
    _verification_codes.clear()
    
    # Generate code
    code = generate_verification_code()
    code_hash = hash_code(code)
    
    # Store code with expiration (10 minutes)
    _verification_codes[email.lower()] = {
        "code_hash": code_hash,
        "expires_at": current_time + timedelta(minutes=10),
        "attempts": 0,
        "created_at": current_time
    }
    
    # Email template
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .code-box {{ background: #f5f5f5; border: 2px dashed #7c3aed; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px; }}
            .code {{ font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #7c3aed; font-family: monospace; }}
            .footer {{ margin-top: 30px; font-size: 12px; color: #666; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h2>BazarBoost Doğrulama Kodu</h2>
            <p>Merhaba,</p>
            <p>BazarBoost'a kayıt olmak için aşağıdaki doğrulama kodunu kullanın:</p>
            <div class="code-box">
                <div class="code">{code}</div>
            </div>
            <p>Bu kod 10 dakika geçerlidir.</p>
            <p>Eğer bu işlemi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
            <div class="footer">
                <p>BazarBoost Ekibi</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_body = f"""
    BazarBoost Doğrulama Kodu
    
    Merhaba,
    
    BazarBoost'a kayıt olmak için aşağıdaki doğrulama kodunu kullanın:
    
    {code}
    
    Bu kod 10 dakika geçerlidir.
    
    Eğer bu işlemi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
    
    BazarBoost Ekibi
    """
    
    send_email(email, "BazarBoost Doğrulama Kodu", html_body, text_body)
    return code


def verify_code(email: str, code: str) -> bool:
    """Verify verification code"""
    email_lower = email.lower()
    
    if email_lower not in _verification_codes:
        return False
    
    code_data = _verification_codes[email_lower]
    
    # Check expiration
    if datetime.now() > code_data["expires_at"]:
        del _verification_codes[email_lower]
        return False
    
    # Check attempts (max 5 attempts)
    if code_data["attempts"] >= 5:
        del _verification_codes[email_lower]
        return False
    
    # Verify code
    code_hash = hash_code(code)
    if code_data["code_hash"] == code_hash:
        del _verification_codes[email_lower]
        return True
    
    # Increment attempts
    code_data["attempts"] += 1
    return False


def send_terms_and_conditions(email: str, username: str = None) -> bool:
    """Send terms and conditions email after successful registration"""
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            h2 {{ color: #333; }}
            .section {{ margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 8px; }}
            .footer {{ margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h2>BazarBoost Kullanım Şartları ve Gizlilik Politikası</h2>
            <p>Merhaba{' ' + username if username else ''},</p>
            <p>BazarBoost'a hoş geldiniz! Hesabınız başarıyla oluşturuldu.</p>
            
            <div class="section">
                <h3>1. Hizmet Kullanımı</h3>
                <p>BazarBoost, e-ticaret ürünleriniz için AI destekli SEO optimizasyonu sağlar. Hizmeti yalnızca yasal amaçlarla kullanabilirsiniz.</p>
            </div>
            
            <div class="section">
                <h3>2. Hesap Güvenliği</h3>
                <p>Hesabınızın güvenliğinden siz sorumlusunuz. Şifrenizi kimseyle paylaşmayın ve güçlü bir şifre kullanın.</p>
            </div>
            
            <div class="section">
                <h3>3. Veri Gizliliği</h3>
                <p>Kişisel verileriniz GDPR ve KVKK uyumlu şekilde işlenir. Verileriniz güvenli sunucularda saklanır ve üçüncü taraflarla paylaşılmaz.</p>
            </div>
            
            <div class="section">
                <h3>4. Ödeme ve İade</h3>
                <p>Satın aldığınız krediler geri iade edilemez. Krediler hesabınızda saklanır ve süresi dolmaz.</p>
            </div>
            
            <div class="section">
                <h3>5. Hizmet Kullanım Limitleri</h3>
                <p>Hizmeti kötüye kullanmak, otomatik botlar veya spam içerik üretmek yasaktır. Bu durumda hesabınız askıya alınabilir.</p>
            </div>
            
            <div class="section">
                <h3>6. Fikri Mülkiyet</h3>
                <p>BazarBoost platformu ve içeriği telif hakkı ile korunmaktadır. İçeriği izinsiz kopyalayamaz veya dağıtamazsınız.</p>
            </div>
            
            <div class="section">
                <h3>7. Değişiklikler</h3>
                <p>Bu şartlar zaman zaman güncellenebilir. Önemli değişikliklerde e-posta ile bilgilendirileceksiniz.</p>
            </div>
            
            <div class="section">
                <h3>8. İletişim</h3>
                <p>Sorularınız için destek ekibimizle iletişime geçebilirsiniz.</p>
            </div>
            
            <p>Bu şartları kabul ederek BazarBoost hizmetini kullanmaya başladınız.</p>
            
            <div class="footer">
                <p><strong>BazarBoost Ekibi</strong></p>
                <p>Bu e-posta otomatik olarak gönderilmiştir.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_body = f"""
    BazarBoost Kullanım Şartları ve Gizlilik Politikası
    
    Merhaba{' ' + username if username else ''},
    
    BazarBoost'a hoş geldiniz! Hesabınız başarıyla oluşturuldu.
    
    1. HİZMET KULLANIMI
    BazarBoost, e-ticaret ürünleriniz için AI destekli SEO optimizasyonu sağlar. Hizmeti yalnızca yasal amaçlarla kullanabilirsiniz.
    
    2. HESAP GÜVENLİĞİ
    Hesabınızın güvenliğinden siz sorumlusunuz. Şifrenizi kimseyle paylaşmayın ve güçlü bir şifre kullanın.
    
    3. VERİ GİZLİLİĞİ
    Kişisel verileriniz GDPR ve KVKK uyumlu şekilde işlenir. Verileriniz güvenli sunucularda saklanır ve üçüncü taraflarla paylaşılmaz.
    
    4. ÖDEME VE İADE
    Satın aldığınız krediler geri iade edilemez. Krediler hesabınızda saklanır ve süresi dolmaz.
    
    5. HİZMET KULLANIM LİMİTLERİ
    Hizmeti kötüye kullanmak, otomatik botlar veya spam içerik üretmek yasaktır. Bu durumda hesabınız askıya alınabilir.
    
    6. FİKRİ MÜLKİYET
    BazarBoost platformu ve içeriği telif hakkı ile korunmaktadır. İçeriği izinsiz kopyalayamaz veya dağıtamazsınız.
    
    7. DEĞİŞİKLİKLER
    Bu şartlar zaman zaman güncellenebilir. Önemli değişikliklerde e-posta ile bilgilendirileceksiniz.
    
    8. İLETİŞİM
    Sorularınız için destek ekibimizle iletişime geçebilirsiniz.
    
    Bu şartları kabul ederek BazarBoost hizmetini kullanmaya başladınız.
    
    BazarBoost Ekibi
    Bu e-posta otomatik olarak gönderilmiştir.
    """
    
    try:
        send_email(email, "BazarBoost Kullanım Şartları ve Gizlilik Politikası", html_body, text_body)
        return True
    except Exception:
        # Don't fail registration if email fails
        return False

