import { useTranslation } from 'react-i18next';
import { Diamond } from 'lucide-react';

export default function DiamondPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
      <Diamond size={48} className="text-slate-300 mb-4" />
      <h1 className="text-2xl font-bold text-slate-700 mb-2">Diamond</h1>
      <p className="text-slate-400 text-sm">Bu bölüm henüz yapım aşamasındadır.</p>
    </div>
  );
}
