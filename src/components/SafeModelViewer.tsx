import { useEffect, useRef, useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';

interface Props {
  src: string;
  iosSrc?: string;
  alt?: string;
}

let scriptPromise: Promise<void> | null = null;

function ensureModelViewerScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if ((window as any).customElements?.get('model-viewer')) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    let s = document.querySelector('script[data-model-viewer]') as HTMLScriptElement | null;
    if (!s) {
      s = document.createElement('script');
      s.type = 'module';
      s.src = 'https://unpkg.com/@google/model-viewer@3.5.0/dist/model-viewer.min.js';
      s.setAttribute('data-model-viewer', 'true');
      document.head.appendChild(s);
    }
    // model-viewer registers itself when the module evaluates.
    const check = () => {
      if ((window as any).customElements?.get('model-viewer')) resolve();
      else setTimeout(check, 50);
    };
    check();
    setTimeout(() => reject(new Error('model-viewer yüklenemedi')), 15000);
  });

  return scriptPromise;
}

export default function SafeModelViewer({ src, iosSrc, alt }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setLoaded(false);
    setError(null);

    ensureModelViewerScript()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });

    return () => {
      cancelled = true;
    };
  }, [src]);

  useEffect(() => {
    if (!ready || !containerRef.current) return;

    // Eski child'ları temizle, yeni element oluştur
    containerRef.current.innerHTML = '';
    const el = document.createElement('model-viewer') as any;
    el.setAttribute('src', src);
    if (iosSrc) el.setAttribute('ios-src', iosSrc);
    if (alt) el.setAttribute('alt', alt);
    el.setAttribute('camera-controls', '');
    el.setAttribute('auto-rotate', '');
    el.setAttribute('shadow-intensity', '1');
    el.setAttribute('exposure', '1');
    el.setAttribute('environment-image', 'neutral');
    el.setAttribute('loading', 'eager');
    el.setAttribute('reveal', 'auto');
    el.setAttribute('crossorigin', 'anonymous');
    el.style.width = '100%';
    el.style.height = '100%';
    el.style.minHeight = '480px';
    el.style.background = 'transparent';

    const onLoad = () => setLoaded(true);
    const onError = (e: any) => {
      const detail = e?.detail?.sourceError?.message || e?.detail || 'Model yüklenemedi';
      setError(typeof detail === 'string' ? detail : 'Model yüklenemedi (CORS / format)');
    };
    el.addEventListener('load', onLoad);
    el.addEventListener('error', onError);

    containerRef.current.appendChild(el);

    return () => {
      el.removeEventListener('load', onLoad);
      el.removeEventListener('error', onError);
    };
  }, [ready, src, iosSrc, alt]);

  return (
    <div className="relative w-full h-full" style={{ minHeight: 480 }}>
      <div ref={containerRef} className="w-full h-full" />

      {!loaded && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-500 pointer-events-none">
          <Loader2 className="animate-spin" size={28} />
          <p className="text-xs font-medium">3D model yükleniyor…</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
          <AlertTriangle className="text-amber-500" size={32} />
          <p className="text-sm font-bold text-slate-700">Model görüntülenemedi</p>
          <p className="text-xs text-slate-500 max-w-md break-words">{error}</p>
          <a
            href={src}
            download
            className="mt-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-xs font-bold hover:bg-violet-700"
          >
            GLB dosyasını indir
          </a>
        </div>
      )}
    </div>
  );
}
