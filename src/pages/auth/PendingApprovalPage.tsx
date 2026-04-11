import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, ArrowLeft } from 'lucide-react';

export default function PendingApprovalPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-primary uppercase tracking-wider font-headline">2MC Gastro</h1>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl shadow-lg p-8 border border-outline-variant/10">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock size={32} className="text-amber-600" />
          </div>

          <h2 className="text-xl font-headline font-bold text-on-surface mb-3">
            {t('pending.title')}
          </h2>

          <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
            {t('pending.message')}
          </p>

          <div className="bg-surface-container rounded-lg p-4 mb-6">
            <p className="text-xs text-on-surface-variant" dangerouslySetInnerHTML={{ __html: t('pending.timeInfo') }} />
          </div>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline"
          >
            <ArrowLeft size={16} />
            {t('pending.backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
}
