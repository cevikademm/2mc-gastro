import { useEffect, useRef, useState } from 'react';
import {
  Pencil, MousePointer2, Undo2, Trash2,
  ZoomIn, ZoomOut, Maximize2, Info
} from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────────── */
interface Pt  { x: number; y: number }   // world coords → cm
interface Seg { id: string; a: Pt; b: Pt; color: string }

/* ─── Constants ─────────────────────────────────────────────── */
const SNAP   = 5;    // snap-to-grid (cm)
const HIT    = 22;   // touch hit radius (px)
const COLORS = ['#1e293b', '#dc2626', '#16a34a', '#2563eb', '#9333ea', '#ea580c'];

/* ─── Helpers ───────────────────────────────────────────────── */
const snapV  = (v: number) => Math.round(v / SNAP) * SNAP;
const dist   = (a: Pt, b: Pt) => Math.hypot(b.x - a.x, b.y - a.y);
const fmt    = (cm: number) => {
  if (cm >= 100) {
    const m  = Math.floor(cm / 100);
    const rm = cm % 100;
    return rm < 1 ? `${m} m` : `${m},${String(Math.round(rm)).padStart(2, '0')} m`;
  }
  return `${Math.round(cm)} cm`;
};
const ortho  = (a: Pt, b: Pt): Pt => {
  const dx = Math.abs(b.x - a.x), dy = Math.abs(b.y - a.y);
  return dx >= dy ? { x: b.x, y: a.y } : { x: a.x, y: b.y };
};
function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/* ─── SketchPage ─────────────────────────────────────────────── */
export default function SketchPage() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const wrapRef    = useRef<HTMLDivElement>(null);

  /* UI-only state — only what the toolbar needs */
  const [uiMode,   setUiMode]   = useState<'draw' | 'edit'>('draw');
  const [lineCount, setLineCount] = useState(0);
  const [histLen,   setHistLen]   = useState(0);
  const [selColor,  setSelColor]  = useState(COLORS[0]);
  const [showHint,  setShowHint]  = useState(true);

  /* All mutable drawing state lives here — NO re-renders per frame */
  const st = useRef({
    segs:   [] as Seg[],
    hist:   [] as Seg[][],
    pan:    { x: 0, y: 0 } as Pt,
    scale:  3,            // px per cm  → 300px = 1m
    mode:   'draw' as 'draw' | 'edit',
    color:  COLORS[0],
    // drawing
    isDrawing: false,
    dA: null as Pt | null,
    dB: null as Pt | null,
    // editing
    editNode: null as { si: number; w: 'a' | 'b' } | null,
    // two-finger
    twoFinger:    false,
    pinchDist:    0,
    pinchMidS:    { x: 0, y: 0 } as Pt,  // start mid
    pinchPanS:    { x: 0, y: 0 } as Pt,  // pan at start of pinch
    // mouse
    mPanning:     false,
    mPanStart:    { x: 0, y: 0 } as Pt,
    mPanOrigin:   { x: 0, y: 0 } as Pt,
    mDragging:    false,
  });

  /* Keep color ref in sync without re-running useEffect */
  const colorRef = useRef(COLORS[0]);
  colorRef.current = selColor;

  /* sync line count to toolbar */
  const sync = () => {
    setLineCount(st.current.segs.length);
    setHistLen(st.current.hist.length);
  };

  /* mode toggle — updates both ref and UI */
  const applyMode = (m: 'draw' | 'edit') => {
    st.current.mode = m;
    st.current.isDrawing = false;
    st.current.dA = null;
    st.current.dB = null;
    st.current.editNode = null;
    setUiMode(m);
  };

  const undo = () => {
    const s = st.current;
    if (!s.hist.length) return;
    s.segs = s.hist.pop()!;
    sync();
  };

  const clearAll = () => {
    const s = st.current;
    if (!s.segs.length) return;
    s.hist.push(s.segs.map(l => ({ ...l, a: { ...l.a }, b: { ...l.b } })));
    s.segs = [];
    sync();
  };

  const resetView = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    st.current.pan   = { x: rect.width / 2, y: rect.height / 2 };
    st.current.scale = 3;
  };

  /* ─── Main canvas effect ──────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current!;
    const dpr    = window.devicePixelRatio || 1;
    let   raf: number;
    let   initialized = false;

    /* Resize canvas to physical pixels */
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width  = rect.width  * dpr;
      canvas.height = rect.height * dpr;
      if (!initialized) {
        st.current.pan = { x: rect.width / 2, y: rect.height / 2 };
        initialized = true;
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    /* ── Render loop ─────────────────────────────────────────── */
    const render = () => {
      const ctx = canvas.getContext('2d')!;
      const s   = st.current;
      const { pan, scale, segs, isDrawing, dA, dB, editNode, mode } = s;
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      /* ── Background ── */
      ctx.fillStyle = '#f1f5fb';
      ctx.fillRect(0, 0, W, H);

      /* ── Grid ── */
      const wL = -pan.x / scale, wT = -pan.y / scale;
      const wR = (W - pan.x) / scale, wB = (H - pan.y) / scale;

      const drawGridLines = (step: number, color: string, lw: number) => {
        ctx.strokeStyle = color; ctx.lineWidth = lw;
        ctx.beginPath();
        for (let wx = Math.floor(wL / step) * step; wx <= wR + step; wx += step) {
          const sx = wx * scale + pan.x;
          ctx.moveTo(sx, 0); ctx.lineTo(sx, H);
        }
        for (let wy = Math.floor(wT / step) * step; wy <= wB + step; wy += step) {
          const sy = wy * scale + pan.y;
          ctx.moveTo(0, sy); ctx.lineTo(W, sy);
        }
        ctx.stroke();
      };

      drawGridLines(10, '#dce5f0', 0.5);   // 10 cm
      drawGridLines(50, '#c5d4e8', 0.8);   // 50 cm
      drawGridLines(100, '#a8bbd4', 1.2);  // 1 m

      /* ── Grid labels ── */
      const lSize = Math.max(8, Math.min(11, scale * 2.5));
      ctx.font = `${lSize}px monospace`;
      ctx.fillStyle = '#7b93b0';
      ctx.textBaseline = 'top';
      ctx.textAlign    = 'left';
      for (let wx = Math.floor(wL / 100) * 100; wx <= wR; wx += 100) {
        const sx  = wx * scale + pan.x;
        const lbl = wx === 0 ? '0' : (Math.abs(wx) >= 100 ? `${wx / 100}m` : `${wx}cm`);
        ctx.fillText(lbl, sx + 2, pan.y + 2);
      }
      for (let wy = Math.floor(wT / 100) * 100; wy <= wB; wy += 100) {
        if (wy === 0) continue;
        const sy  = wy * scale + pan.y;
        const lbl = Math.abs(wy) >= 100 ? `${wy / 100}m` : `${wy}cm`;
        ctx.fillText(lbl, pan.x + 2, sy + 2);
      }

      /* ── Axis ── */
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
      ctx.beginPath();
      if (pan.x > 0 && pan.x < W) { ctx.moveTo(pan.x, 0); ctx.lineTo(pan.x, H); }
      if (pan.y > 0 && pan.y < H) { ctx.moveTo(0, pan.y); ctx.lineTo(W, pan.y); }
      ctx.stroke();
      ctx.setLineDash([]);

      /* ── Origin dot ── */
      if (pan.x > 0 && pan.x < W && pan.y > 0 && pan.y < H) {
        ctx.fillStyle = '#64748b';
        ctx.beginPath(); ctx.arc(pan.x, pan.y, 4, 0, Math.PI * 2); ctx.fill();
      }

      /* ── Drawn segments ── */
      segs.forEach((seg, si) => {
        const sax = seg.a.x * scale + pan.x, say = seg.a.y * scale + pan.y;
        const sbx = seg.b.x * scale + pan.x, sby = seg.b.y * scale + pan.y;
        const isSel = editNode?.si === si;

        /* Shadow */
        ctx.shadowColor = 'rgba(0,0,0,0.12)';
        ctx.shadowBlur  = isSel ? 8 : 4;

        /* Line */
        ctx.strokeStyle = seg.color;
        ctx.lineWidth   = isSel ? 4 : 3;
        ctx.lineCap     = 'round';
        ctx.beginPath(); ctx.moveTo(sax, say); ctx.lineTo(sbx, sby); ctx.stroke();
        ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';

        /* ── Measurement badge ── */
        const lenCm = dist(seg.a, seg.b);
        const mx = (sax + sbx) / 2, my = (say + sby) / 2;
        const txt = fmt(lenCm);
        ctx.font = 'bold 10px system-ui';
        const tw = ctx.measureText(txt).width;
        const bx = mx - tw / 2 - 6, by = my - 9, bw = tw + 12, bh = 17;

        /* Badge background */
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 4;
        rrect(ctx, bx, by, bw, bh, 4); ctx.fill();
        ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';

        /* Badge border */
        ctx.strokeStyle = seg.color + '55'; ctx.lineWidth = 1;
        rrect(ctx, bx, by, bw, bh, 4); ctx.stroke();

        /* Badge text */
        ctx.fillStyle = seg.color;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(txt, mx, my);

        /* ── Endpoint handles ── */
        [[sax, say, 'a'], [sbx, sby, 'b']].forEach(([px, py, w]) => {
          const isActiveNode = isSel && editNode?.w === w;
          const r = mode === 'edit' ? (isActiveNode ? 11 : 8) : 4;

          ctx.shadowColor = isActiveNode ? seg.color + '66' : 'rgba(0,0,0,0.1)';
          ctx.shadowBlur  = isActiveNode ? 10 : 4;

          ctx.beginPath();
          ctx.arc(px as number, py as number, r, 0, Math.PI * 2);
          ctx.fillStyle = isActiveNode ? seg.color : (mode === 'edit' ? '#ffffff' : seg.color);
          ctx.fill();

          if (mode === 'edit') {
            ctx.strokeStyle = seg.color; ctx.lineWidth = 2;
            ctx.stroke();
          }
          ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
        });
      });

      /* ── Live drawing preview ── */
      if (isDrawing && dA && dB) {
        const sax = dA.x * scale + pan.x, say = dA.y * scale + pan.y;
        const sbx = dB.x * scale + pan.x, sby = dB.y * scale + pan.y;
        const col = colorRef.current;
        const isH = Math.abs(dB.x - dA.x) >= Math.abs(dB.y - dA.y);

        /* Dashed preview line */
        ctx.strokeStyle = col; ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 5]); ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(sax, say); ctx.lineTo(sbx, sby); ctx.stroke();
        ctx.setLineDash([]);

        /* Right-angle corner indicator */
        const cornerSize = 10;
        ctx.strokeStyle = col + '80'; ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (isH) {
          ctx.moveTo(sax + (sax < sbx ? cornerSize : -cornerSize), say);
          ctx.lineTo(sax + (sax < sbx ? cornerSize : -cornerSize), say + cornerSize);
          ctx.lineTo(sax, say + cornerSize);
        } else {
          ctx.moveTo(sax, say + (say < sby ? cornerSize : -cornerSize));
          ctx.lineTo(sax + cornerSize, say + (say < sby ? cornerSize : -cornerSize));
          ctx.lineTo(sax + cornerSize, say);
        }
        ctx.stroke();

        /* Start dot */
        ctx.fillStyle = col;
        ctx.shadowColor = col + '55'; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(sax, say, 7, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';

        /* Pulsing end dot */
        ctx.fillStyle = col + 'aa';
        ctx.beginPath(); ctx.arc(sbx, sby, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(sbx, sby, 5, 0, Math.PI * 2); ctx.fill();

        /* ── Live measurement tooltip ── */
        const lenCm = dist(dA, dB);
        if (lenCm >= 1) {
          const mainTxt = fmt(lenCm);
          const dirTxt  = isH ? '⟷ Yatay' : '⟺ Dikey';

          ctx.font = 'bold 15px system-ui';
          const tw   = ctx.measureText(mainTxt).width;
          let   tx   = sbx + 20;
          let   ty   = sby - 22;
          const bw   = tw + 28;
          const bh   = 42;
          if (tx + bw > W - 10)  tx = sbx - bw - 10;
          if (ty - 4 < 0)        ty = sby + 14;
          if (ty + bh > H - 10)  ty = sby - bh - 6;

          /* Tooltip shadow */
          ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = 14;
          ctx.fillStyle = '#0f172a';
          rrect(ctx, tx - 8, ty - 6, bw, bh, 10); ctx.fill();
          ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';

          /* Accent line */
          ctx.fillStyle = col;
          rrect(ctx, tx - 8, ty - 6, 4, bh, 2); ctx.fill();

          /* Measurement text */
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
          ctx.font = 'bold 15px system-ui';
          ctx.fillText(mainTxt, tx + 2, ty + 12);

          /* Direction label */
          ctx.font = '10px system-ui';
          ctx.fillStyle = '#93c5fd';
          ctx.fillText(dirTxt, tx + 2, ty + 26);

          /* Mini ruler ticks */
          const tickY = ty + 36;
          ctx.strokeStyle = '#334155'; ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(tx + 2, tickY); ctx.lineTo(tx + 2 + Math.min(tw, 60), tickY);
          ctx.stroke();
          [0, 0.25, 0.5, 0.75, 1].forEach(f => {
            const tx2 = tx + 2 + f * Math.min(tw, 60);
            ctx.beginPath();
            ctx.moveTo(tx2, tickY - (f === 0 || f === 1 ? 4 : 2));
            ctx.lineTo(tx2, tickY);
            ctx.stroke();
          });
        }
      }

      /* ── Scale ruler (bottom-right) ── */
      const mPx  = 100 * scale;
      const rx   = W - 16;
      const ry   = H - 18;
      const maxRW = Math.min(mPx, 120);  // cap at 120px display width
      const mCm  = maxRW / scale;        // how many cm that represents

      ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.5; ctx.lineCap = 'square';
      ctx.beginPath();
      ctx.moveTo(rx - maxRW, ry); ctx.lineTo(rx, ry);
      ctx.moveTo(rx - maxRW, ry - 5); ctx.lineTo(rx - maxRW, ry + 5);
      ctx.moveTo(rx, ry - 5); ctx.lineTo(rx, ry + 5);
      ctx.stroke();
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(fmt(mCm), rx - maxRW / 2, ry - 6);

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    /* ── Coordinate utils (closures over canvas/dpr) ── */
    const canvasXY = (clientX: number, clientY: number): Pt => {
      const r = canvas.getBoundingClientRect();
      return { x: clientX - r.left, y: clientY - r.top };
    };
    const toWorld = (sp: Pt): Pt => ({
      x: snapV((sp.x - st.current.pan.x) / st.current.scale),
      y: snapV((sp.y - st.current.pan.y) / st.current.scale),
    });
    const hitNode = (sp: Pt) => {
      const { segs, scale, pan } = st.current;
      for (let si = segs.length - 1; si >= 0; si--) {
        const sax = segs[si].a.x * scale + pan.x, say = segs[si].a.y * scale + pan.y;
        const sbx = segs[si].b.x * scale + pan.x, sby = segs[si].b.y * scale + pan.y;
        if (Math.hypot(sp.x - sax, sp.y - say) < HIT) return { si, w: 'a' as const };
        if (Math.hypot(sp.x - sbx, sp.y - sby) < HIT) return { si, w: 'b' as const };
      }
      return null;
    };
    const commitDraw = () => {
      const s = st.current;
      if (!s.isDrawing || !s.dA || !s.dB) return;
      const len = dist(s.dA, s.dB);
      if (len >= 2) {
        s.hist.push(s.segs.map(l => ({ ...l, a: { ...l.a }, b: { ...l.b } })));
        s.segs = [...s.segs, {
          id: `${Date.now()}-${Math.random()}`,
          a:  { ...s.dA },
          b:  { ...s.dB },
          color: colorRef.current,
        }];
        sync();
      }
      s.isDrawing = false; s.dA = null; s.dB = null;
    };

    /* ── Touch handlers ── */
    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const s = st.current;

      if (e.touches.length >= 2) {
        s.twoFinger = true;
        s.isDrawing = false; s.dA = null; s.dB = null; s.editNode = null;
        const t1 = canvasXY(e.touches[0].clientX, e.touches[0].clientY);
        const t2 = canvasXY(e.touches[1].clientX, e.touches[1].clientY);
        s.pinchDist  = Math.hypot(t2.x - t1.x, t2.y - t1.y);
        s.pinchMidS  = { x: (t1.x + t2.x) / 2, y: (t1.y + t2.y) / 2 };
        s.pinchPanS  = { ...s.pan };
        return;
      }

      s.twoFinger = false;
      const sp = canvasXY(e.touches[0].clientX, e.touches[0].clientY);

      if (s.mode === 'edit') {
        const node = hitNode(sp);
        if (node) s.editNode = node;
        return;
      }

      const wp = toWorld(sp);
      s.isDrawing = true; s.dA = wp; s.dB = { ...wp };
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const s = st.current;

      if (e.touches.length >= 2 && s.twoFinger) {
        const t1  = canvasXY(e.touches[0].clientX, e.touches[0].clientY);
        const t2  = canvasXY(e.touches[1].clientX, e.touches[1].clientY);
        const mid = { x: (t1.x + t2.x) / 2, y: (t1.y + t2.y) / 2 };
        const d2  = Math.hypot(t2.x - t1.x, t2.y - t1.y);

        /* Pan from midpoint delta */
        s.pan = {
          x: s.pinchPanS.x + mid.x - s.pinchMidS.x,
          y: s.pinchPanS.y + mid.y - s.pinchMidS.y,
        };

        /* Zoom around midpoint */
        if (s.pinchDist > 0) {
          const ratio    = d2 / s.pinchDist;
          const newScale = Math.max(0.4, Math.min(30, s.scale * ratio));
          const wx = (mid.x - s.pan.x) / s.scale;
          const wy = (mid.y - s.pan.y) / s.scale;
          s.pan.x  = mid.x - wx * newScale;
          s.pan.y  = mid.y - wy * newScale;
          s.scale  = newScale;
          s.pinchDist = d2;
          s.pinchMidS = mid;
          s.pinchPanS = { ...s.pan };
        }
        return;
      }

      if (e.touches.length !== 1) return;
      const sp = canvasXY(e.touches[0].clientX, e.touches[0].clientY);

      if (s.mode === 'edit' && s.editNode) {
        const wp  = toWorld(sp);
        const seg = s.segs[s.editNode.si];
        if (seg) seg[s.editNode.w] = wp;
        return;
      }

      if (s.isDrawing && s.dA) {
        s.dB = ortho(s.dA, toWorld(sp));
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      const s = st.current;
      if (e.touches.length === 0) s.twoFinger = false;
      if (s.editNode) { s.editNode = null; sync(); return; }
      commitDraw();
    };

    /* ── Mouse handlers ── */
    const onMouseDown = (e: MouseEvent) => {
      const s  = st.current;
      const sp = canvasXY(e.clientX, e.clientY);

      if (e.button === 1 || e.altKey || e.button === 2) {
        s.mPanning   = true;
        s.mPanStart  = { ...sp };
        s.mPanOrigin = { ...s.pan };
        return;
      }

      if (s.mode === 'edit') {
        const node = hitNode(sp);
        if (node) { s.editNode = node; s.mDragging = true; }
        return;
      }

      const wp = toWorld(sp);
      s.isDrawing = true; s.dA = wp; s.dB = { ...wp }; s.mDragging = true;
    };

    const onMouseMove = (e: MouseEvent) => {
      const s  = st.current;
      const sp = canvasXY(e.clientX, e.clientY);

      if (s.mPanning) {
        s.pan = { x: s.mPanOrigin.x + sp.x - s.mPanStart.x, y: s.mPanOrigin.y + sp.y - s.mPanStart.y };
        return;
      }

      if (s.mode === 'edit' && s.editNode && s.mDragging) {
        const wp  = toWorld(sp);
        const seg = s.segs[s.editNode.si];
        if (seg) seg[s.editNode.w] = wp;
        return;
      }

      if (s.isDrawing && s.dA && s.mDragging) {
        s.dB = ortho(s.dA, toWorld(sp));
      }
    };

    const onMouseUp = () => {
      const s    = st.current;
      s.mPanning = false; s.mDragging = false;
      if (s.editNode) { s.editNode = null; sync(); return; }
      commitDraw();
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s        = st.current;
      const sp       = canvasXY(e.clientX, e.clientY);
      const factor   = e.deltaY < 0 ? 1.12 : 0.89;
      const newScale = Math.max(0.4, Math.min(30, s.scale * factor));
      const wx = (sp.x - s.pan.x) / s.scale;
      const wy = (sp.y - s.pan.y) / s.scale;
      s.pan.x  = sp.x - wx * newScale;
      s.pan.y  = sp.y - wy * newScale;
      s.scale  = newScale;
    };

    canvas.addEventListener('touchstart',  onTouchStart, { passive: false });
    canvas.addEventListener('touchmove',   onTouchMove,  { passive: false });
    canvas.addEventListener('touchend',    onTouchEnd,   { passive: false });
    canvas.addEventListener('mousedown',   onMouseDown);
    canvas.addEventListener('mousemove',   onMouseMove);
    canvas.addEventListener('mouseup',     onMouseUp);
    canvas.addEventListener('mouseleave',  onMouseUp);
    canvas.addEventListener('wheel',       onWheel,      { passive: false });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('touchstart',  onTouchStart);
      canvas.removeEventListener('touchmove',   onTouchMove);
      canvas.removeEventListener('touchend',    onTouchEnd);
      canvas.removeEventListener('mousedown',   onMouseDown);
      canvas.removeEventListener('mousemove',   onMouseMove);
      canvas.removeEventListener('mouseup',     onMouseUp);
      canvas.removeEventListener('mouseleave',  onMouseUp);
      canvas.removeEventListener('wheel',       onWheel);
    };
  }, []); // one-time setup

  /* ─── Render ──────────────────────────────────────────────── */
  return (
    <div ref={wrapRef} className="flex flex-col bg-slate-50" style={{ height: 'calc(100vh - 3.5rem)' }}>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-slate-200 shadow-sm z-10 flex-wrap select-none">

        {/* Mode buttons */}
        <div className="flex rounded-lg overflow-hidden border border-slate-200 shadow-sm">
          <button
            onClick={() => applyMode('draw')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all ${
              uiMode === 'draw' ? 'bg-primary text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Pencil size={14} /> Çiz
          </button>
          <div className="w-px bg-slate-200" />
          <button
            onClick={() => applyMode('edit')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all ${
              uiMode === 'edit' ? 'bg-primary text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            <MousePointer2 size={14} /> Düzenle
          </button>
        </div>

        <div className="w-px h-6 bg-slate-200 hidden sm:block" />

        {/* Color palette */}
        <div className="flex items-center gap-1.5">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => { setSelColor(c); colorRef.current = c; }}
              className={`w-6 h-6 rounded-full transition-all border-2 ${
                selColor === c ? 'border-slate-700 scale-125' : 'border-transparent hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="w-px h-6 bg-slate-200 hidden sm:block" />

        {/* Undo / Clear */}
        <button
          onClick={undo}
          disabled={histLen === 0}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition-all"
        >
          <Undo2 size={13} /> Geri
        </button>
        <button
          onClick={clearAll}
          disabled={lineCount === 0}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-30 transition-all"
        >
          <Trash2 size={13} /> Temizle
        </button>

        <div className="w-px h-6 bg-slate-200 hidden sm:block" />

        {/* Zoom + Reset */}
        <div className="flex rounded-lg overflow-hidden border border-slate-200">
          <button
            onClick={() => { st.current.scale = Math.min(30, st.current.scale * 1.25); }}
            className="px-2 py-1.5 bg-white hover:bg-slate-50 text-slate-500 transition-colors"
          ><ZoomIn size={14} /></button>
          <div className="w-px bg-slate-200" />
          <button
            onClick={() => { st.current.scale = Math.max(0.4, st.current.scale / 1.25); }}
            className="px-2 py-1.5 bg-white hover:bg-slate-50 text-slate-500 transition-colors"
          ><ZoomOut size={14} /></button>
          <div className="w-px bg-slate-200" />
          <button
            onClick={resetView}
            className="px-2 py-1.5 bg-white hover:bg-slate-50 text-slate-500 transition-colors"
            title="Görünümü sıfırla"
          ><Maximize2 size={14} /></button>
        </div>

        {/* Stats */}
        <span className="text-[10px] text-slate-400 font-mono ml-1 hidden md:inline">
          {lineCount} çizgi
        </span>

        {/* Hint toggle */}
        <button
          onClick={() => setShowHint(h => !h)}
          className={`ml-auto p-1.5 rounded-lg transition-colors ${showHint ? 'text-primary bg-primary/10' : 'text-slate-400 hover:bg-slate-100'}`}
        >
          <Info size={15} />
        </button>
      </div>

      {/* ── Canvas ── */}
      <div className="relative flex-1 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none block"
          style={{ cursor: uiMode === 'edit' ? 'default' : 'crosshair' }}
        />

        {/* ── Mode badge (floating) ── */}
        <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-[10px] font-bold shadow-md pointer-events-none select-none transition-all ${
          uiMode === 'draw'
            ? 'bg-primary text-white'
            : 'bg-amber-500 text-white'
        }`}>
          {uiMode === 'draw' ? '✏️ Çizim Modu' : '✋ Düzenleme Modu'}
        </div>

        {/* ── Hint panel ── */}
        {showHint && (
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-3 text-[10px] text-slate-500 space-y-1 pointer-events-none select-none max-w-[200px]">
            <p className="font-bold text-slate-700 text-[11px] mb-1.5">Kullanım</p>
            {uiMode === 'draw' ? (
              <>
                <p>👆 <b>Basılı sürükle</b> → çizgi çiz</p>
                <p>📐 Otomatik dik açı</p>
                <p>🔢 Canlı ölçü görünür</p>
                <p>🤙 <b>İki parmak</b> → kaydır / zoom</p>
                <p>🖱 <b>Tekerlek</b> → zoom (masaüstü)</p>
              </>
            ) : (
              <>
                <p>👆 <b>Noktaya bas</b> → seç</p>
                <p>↔ <b>Sürükle</b> → uzat/kısalt</p>
                <p>🤙 <b>İki parmak</b> → kaydır / zoom</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
