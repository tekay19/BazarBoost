import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-slate-50">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="text-slate-500 mt-2">Aradığınız sayfa veya menü bulunamadı.</p>
      <Link href="/" className="mt-6 px-4 py-2 rounded-md bg-slate-900 text-white text-sm">Ana sayfa</Link>
    </div>
  );
}
