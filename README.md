# QR Menu SaaS

PWA uyumlu, çok kiracılı (multi-tenant) QR menü platformu.
Next.js (App Router) · TypeScript · Tailwind · Prisma · PostgreSQL.

## Kurulum

```bash
npm install
cp .env.example .env          # DATABASE_URL ve SECRET_KEY değerlerini ayarlayın
npm run db:push               # şemayı veritabanına uygula
npm run db:seed               # süper admin + 200 şablon + örnek işletmeler
npm run dev                   # http://localhost:3000
```

## Giriş Bilgileri (seed)

- **Süper Admin:** `/admin/login` → `admin@qrmenu.com` / `Admin123!`
- **İşletme:** `/business/login` → `owner@pizzanapoli.com` / `Owner123!`
- **Örnek menü:** http://localhost:3000/m/pizzanapoli/ana-menu

## Subdomain

Üretimde `pizzanapoli.qrmenu.com` → ilgili işletmenin yayındaki menüsü
(middleware host’u çözer). Geliştirmede `/m/{subdomain}/{menuSlug}` yolu kullanılır.

## Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Prod derleme |
| `npm run db:push` | Prisma şemasını uygula |
| `npm run db:seed` | Örnek veri yükle |
| `npm run db:reset` | DB sıfırla + seed |

## Mimari

- **Kimlik:** Süper admin e-posta/şifre; işletmeler admin daveti (güvenli, süreli, tek kullanımlık token) ile onboarding. Roller: `SUPER_ADMIN`, `BUSINESS_OWNER`, `BUSINESS_STAFF`.
- **Tenant izolasyonu:** her sorgu `businessId` ile sınırlanır; üyelik kontrolü `requireBusinessUser` üzerinden.
- **Şablonlar:** `src/lib/templates.ts` — 8 kategori × layout × palet = 200 premium şablon; layout’lar `src/components/menu/MenuRenderer.tsx`.
- **QR/PDF:** `src/lib/qr.ts`, `src/lib/pdf.ts` — PNG ve baskıya uygun A4 PDF.
- **Import:** `src/lib/import.ts` — CSV/Excel parse, doğrulama, hatalı satır raporu, formül enjeksiyonu koruması.
- **Depolama:** S3 uyumlu (`src/lib/storage.ts`); yapılandırılmazsa data-URL fallback.
- **PWA:** `public/manifest.webmanifest`, `public/sw.js` (offline menü cache).
