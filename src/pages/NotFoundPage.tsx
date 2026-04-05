import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-8xl font-black text-primary font-headline">404</h1>
        <p className="text-xl text-on-surface-variant mt-4 font-medium">Sayfa bulunamadı</p>
        <p className="text-sm text-on-surface-variant mt-2">Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
        <Link to="/dashboard" className="inline-flex items-center gap-2 brushed-metal text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:opacity-90 transition-all mt-8">
          <Home size={18} /> Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
