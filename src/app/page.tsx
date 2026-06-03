import Link from "next/link";
import { QrCode, Smartphone, LayoutTemplate, FileUp, ShieldCheck, BarChart3 } from "lucide-react";

export default function Home() {
  const features = [
    { icon: LayoutTemplate, title: "200+ Premium Şablon", desc: "Pizza, burger, kafe, bar, kebap, tatlı ve fine-dining için gerçek farklı tasarımlar." },
    { icon: FileUp, title: "CSV / Excel İçe Aktarma", desc: "Ürünlerinizi tek tıkla toplu yükleyin, hatalı satır raporu ile doğrulayın." },
    { icon: QrCode, title: "QR Kod PNG / PDF", desc: "Baskıya uygun QR kodları indirin, masa bazlı QR üretin." },
    { icon: Smartphone, title: "PWA & Mobil Öncelikli", desc: "Ana ekrana eklenebilir, hızlı açılan, offline destekli menüler." },
    { icon: BarChart3, title: "İstatistikler", desc: "Görüntülenme, cihaz tipi ve tarama analizleri." },
    { icon: ShieldCheck, title: "Çok Kiracılı & Güvenli", desc: "Her işletme tamamen izole, rol bazlı erişim kontrolü." },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2 font-bold text-lg">
            <QrCode className="h-6 w-6" /> QR Menu
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/business/login" className="px-3 py-2 rounded-md hover:bg-slate-100">
              İşletme Girişi
            </Link>
            <Link href="/admin/login" className="px-4 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800">
              Admin Paneli
            </Link>
          </nav>
        </div>
      </header>

      <section className="container py-20 text-center">
        <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium mb-4">
          Restoran · Kafe · Bar · Pizza · Burger · Kebap
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl mx-auto">
          İşletmeniz için premium <span className="text-slate-500">dijital QR menü</span> platformu
        </h1>
        <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
          Ürünlerinizi yükleyin, premium şablon seçin, QR kodu masalarınıza bastırın. Saniyeler içinde
          modern, mobil uyumlu menünüz hazır.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/admin/login" className="px-6 py-3 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800">
            Admin olarak başla
          </Link>
          <Link href="/business/login" className="px-6 py-3 rounded-lg border font-medium hover:bg-slate-50">
            İşletme girişi
          </Link>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          İşletmeler kendi kendine kayıt olamaz — yalnızca admin davetiyle eklenir.
        </p>
      </section>

      <section className="container pb-24 grid md:grid-cols-3 gap-6">
        {features.map((f) => (
          <div key={f.title} className="rounded-xl border p-6 hover:shadow-md transition-shadow">
            <f.icon className="h-8 w-8 mb-3 text-slate-700" />
            <h3 className="font-semibold">{f.title}</h3>
            <p className="text-sm text-slate-600 mt-1">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="border-t py-8 text-center text-sm text-slate-500">
        QR Menu SaaS — Multi-tenant dijital menü platformu
      </footer>
    </div>
  );
}
