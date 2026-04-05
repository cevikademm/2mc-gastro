import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProjectStore, type ProductItem } from '../stores/projectStore';
import { useEquipmentStore, CATEGORIES, type EquipmentItem } from '../stores/equipmentStore';
import {
  RotateCw, Trash2, Copy, Undo2, Redo2,
  Grid3x3, Magnet, Flame, Droplets,
  Microwave, Waves, Table, Refrigerator,
  MousePointer2, Hand, Plus, Minus, Lock, Unlock,
  Package, ArrowLeft, Search, X, Heart, Zap,
  Ruler, Euro, ExternalLink, Pen, Square, RotateCcw
} from 'lucide-react';

/* ─── Types ─── */
interface Point { x: number; y: number; }

interface PlacedItem {
  id: string;
  equipmentId?: string;
  name: string;
  icon: string;
  imageData?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  locked: boolean;
  category: string;
  color: string;
  kw: number;
  price?: number;
  brand?: string;
  desc?: string;
}

type RoomShape = 'rectangle' | 'polygon';

const ICON_MAP: Record<string, any> = {
  refrigerator: Refrigerator, flame: Flame, droplets: Droplets,
  microwave: Microwave, waves: Waves, table: Table,
};

const CATEGORY_COLORS: Record<string, string> = {
  cooking: '#fef2f2', cooling: '#eff6ff', dishwash: '#ecfeff', prep_hygiene: '#f9fafb',
  self_service: '#fffbeb', pizza_pasta: '#fef2f2', dynamic_prep: '#f5f3ff',
  cook_chill: '#ecfdf5', ventilation: '#f8fafc', bakery: '#fffbeb',
  trolley_gn: '#fafaf9', coffee_tea: '#fdf4e8', laundry: '#f5f3ff',
  ice_cream: '#fdf2f8', hospitality: '#ecfeff', cleaning_products: '#ecfdf5',
  spare_parts: '#f9fafb', cold: '#eff6ff', cleaning: '#ecfeff', neutral: '#f9fafb', other: '#f5f3ff',
};
const CATEGORY_BORDERS: Record<string, string> = {
  cooking: '#fca5a5', cooling: '#93c5fd', dishwash: '#67e8f9', prep_hygiene: '#d1d5db',
  self_service: '#fcd34d', pizza_pasta: '#fca5a5', dynamic_prep: '#c4b5fd',
  cook_chill: '#6ee7b7', ventilation: '#94a3b8', bakery: '#fcd34d',
  trolley_gn: '#a8a29e', coffee_tea: '#d97706', laundry: '#c4b5fd',
  ice_cream: '#f9a8d4', hospitality: '#67e8f9', cleaning_products: '#6ee7b7',
  spare_parts: '#d1d5db', cold: '#93c5fd', cleaning: '#67e8f9', neutral: '#d1d5db', other: '#c4b5fd',
};

const snapVal = (val: number, gridSize: number) => Math.round(val / gridSize) * gridSize;

/* ─── Geometry helpers ─── */
function polygonArea(pts: Point[]): number {
  if (pts.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    area += pts[i].x * pts[j].y;
    area -= pts[j].x * pts[i].y;
  }
  return Math.abs(area) / 2;
}

function polygonPerimeter(pts: Point[]): number {
  if (pts.length < 2) return 0;
  let perim = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    const dx = pts[j].x - pts[i].x;
    const dy = pts[j].y - pts[i].y;
    perim += Math.sqrt(dx * dx + dy * dy);
  }
  return perim;
}

function polygonBounds(pts: Point[]): { minX: number; minY: number; maxX: number; maxY: number; w: number; h: number } {
  if (pts.length === 0) return { minX: 0, minY: 0, maxX: 1000, maxY: 600, w: 1000, h: 600 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
}

function polygonSVGPath(pts: Point[]): string {
  if (pts.length < 2) return '';
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
}

function distancePP(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/* ─── Product Image Component ─── */
function ProductImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [error, setError] = useState(false);
  if (error || !src) {
    return <div className={`bg-slate-100 flex items-center justify-center ${className}`}><Package size={20} className="text-slate-300" /></div>;
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setError(true)} className={`object-contain ${className}`} />;
}

/* ─── Editable wall dimension label ─── */
function WallLabel({ a, b, zoom, wallIndex, onLengthChange }: {
  a: Point; b: Point; zoom: number; wallIndex: number;
  onLengthChange?: (wallIndex: number, newLengthCm: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const len = distancePP(a, b);
  if (len < 30) return null;
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const angle = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
  const displayAngle = (angle > 90 || angle < -90) ? angle + 180 : angle;
  const lenM = (len / 100).toFixed(2);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onLengthChange) return;
    setInputVal(lenM);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSubmit = () => {
    const val = parseFloat(inputVal.replace(',', '.'));
    if (!isNaN(val) && val > 0 && onLengthChange) {
      onLengthChange(wallIndex, val * 100); // m → cm
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') setIsEditing(false);
  };

  if (isEditing) {
    return (
      <foreignObject x={mx - 35} y={my - 14} width={70} height={28} style={{ overflow: 'visible' }}>
        <div style={{ transform: `rotate(${displayAngle}deg)`, transformOrigin: 'center' }}>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSubmit}
            style={{
              width: 68, height: 26, fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace',
              textAlign: 'center', border: '2px solid #1d4ed8', borderRadius: 4,
              background: '#eff6ff', color: '#1d4ed8', outline: 'none', padding: 0,
            }}
          />
        </div>
      </foreignObject>
    );
  }

  return (
    <g transform={`translate(${mx}, ${my}) rotate(${displayAngle})`}
       onClick={handleClick} style={{ cursor: onLengthChange ? 'pointer' : 'default' }}>
      <rect x={-28} y={-11} width={56} height={18} rx={4} fill="white" stroke={onLengthChange ? '#3b82f6' : '#94a3b8'} strokeWidth={onLengthChange ? 1 : 0.5} opacity={0.95} />
      <text textAnchor="middle" dominantBaseline="central" fontSize={Math.min(9, 9 / zoom)} fontWeight="bold" fill="#334155" fontFamily="monospace">
        {lenM}m
      </text>
      {onLengthChange && (
        <text textAnchor="middle" y={16} fontSize={Math.min(6, 6 / zoom)} fill="#3b82f6" fontFamily="sans-serif" opacity={0.7}>
          tiklayip degistir
        </text>
      )}
    </g>
  );
}

export default function DesignStudio() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects } = useProjectStore();
  const equipmentStore = useEquipmentStore();
  const canvasRef = useRef<HTMLDivElement>(null);

  const project = id ? projects.find(p => p.id === id) : null;
  const isProjectMode = !!project;
  const storageKey = id ? `2mc-floorplan-${id}` : '2mc-floorplan-global';

  // Load saved data
  const loadSaved = useCallback(() => {
    try {
      const s = localStorage.getItem(storageKey);
      if (s) return JSON.parse(s);
    } catch {}
    return null;
  }, [storageKey]);

  const saved = loadSaved();

  // Room shape state
  const [roomShape, setRoomShape] = useState<RoomShape>(saved?.roomShape || 'rectangle');
  const [roomWidthCm, setRoomWidthCm] = useState(saved?.roomWidthCm || project?.roomWidthCm || 1000);
  const [roomHeightCm, setRoomHeightCm] = useState(saved?.roomHeightCm || project?.roomHeightCm || 600);
  const [roomPolygon, setRoomPolygon] = useState<Point[]>(saved?.roomPolygon || []);
  const [isDrawingRoom, setIsDrawingRoom] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);
  const [mousePos, setMousePos] = useState<Point>({ x: 0, y: 0 });
  const [draggingVertex, setDraggingVertex] = useState<number | null>(null);

  // Canvas state
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize] = useState(10);
  const [activeTool, setActiveTool] = useState<'select' | 'pan' | 'draw'>('select');

  // Items on canvas
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>(saved?.items || []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // History
  const [history, setHistory] = useState<PlacedItem[][]>([saved?.items || []]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Right panel
  const [rightPanelTab, setRightPanelTab] = useState<'catalog' | 'properties'>('catalog');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState('');
  const [trayDragItem, setTrayDragItem] = useState<any>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [popupItem, setPopupItem] = useState<PlacedItem | null>(null);
  const [showMobilePanel, setShowMobilePanel] = useState(false);

  const selectedItem = placedItems.find(i => i.id === selectedId) || null;

  // Compute room bounds
  const bounds = useMemo(() => {
    if (roomShape === 'polygon' && roomPolygon.length >= 3) {
      return polygonBounds(roomPolygon);
    }
    return { minX: 0, minY: 0, maxX: roomWidthCm, maxY: roomHeightCm, w: roomWidthCm, h: roomHeightCm };
  }, [roomShape, roomPolygon, roomWidthCm, roomHeightCm]);

  // Room area in m2
  const roomAreaM2 = useMemo(() => {
    if (roomShape === 'polygon' && roomPolygon.length >= 3) {
      return (polygonArea(roomPolygon) / 10000).toFixed(1);
    }
    return ((roomWidthCm * roomHeightCm) / 10000).toFixed(1);
  }, [roomShape, roomPolygon, roomWidthCm, roomHeightCm]);

  const roomPerimeterM = useMemo(() => {
    if (roomShape === 'polygon' && roomPolygon.length >= 3) {
      return (polygonPerimeter(roomPolygon) / 100).toFixed(1);
    }
    return (((roomWidthCm + roomHeightCm) * 2) / 100).toFixed(1);
  }, [roomShape, roomPolygon, roomWidthCm, roomHeightCm]);

  // Canvas dimensions for rendering
  const canvasW = roomShape === 'polygon' && roomPolygon.length >= 3 ? bounds.w + 100 : roomWidthCm;
  const canvasH = roomShape === 'polygon' && roomPolygon.length >= 3 ? bounds.h + 100 : roomHeightCm;

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        items: placedItems,
        roomWidthCm,
        roomHeightCm,
        roomShape,
        roomPolygon,
      }));
    } catch {}
  }, [placedItems, roomWidthCm, roomHeightCm, roomShape, roomPolygon, storageKey]);

  // Catalog items
  const getCatalogItems = useCallback(() => {
    let items = equipmentStore.allItems;
    if (showFavoritesOnly) items = items.filter(i => equipmentStore.favorites.includes(i.id));
    if (catalogCategory) items = items.filter(i => i.cat === catalogCategory);
    if (catalogSearch) {
      const q = catalogSearch.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q));
    }
    return items.slice(0, 60);
  }, [equipmentStore.allItems, equipmentStore.favorites, catalogCategory, catalogSearch, showFavoritesOnly]);
  const catalogItems = getCatalogItems();

  // Stats
  const totalKW = placedItems.reduce((sum, i) => sum + i.kw, 0);
  const totalPrice = placedItems.reduce((sum, i) => sum + (i.price || 0), 0);
  const totalItems = placedItems.length;
  const equipmentAreaM2 = (placedItems.reduce((sum, i) => sum + (i.width * i.height), 0) / 10000).toFixed(1);

  const formatPrice = (p: number) => p > 0 ? `€${p.toLocaleString('de-DE', { minimumFractionDigits: 2 })}` : '';

  // History management
  const saveHistory = useCallback((items: PlacedItem[]) => {
    setHistory(prev => {
      const nh = prev.slice(0, historyIndex + 1);
      nh.push(JSON.parse(JSON.stringify(items)));
      return nh;
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const undo = () => { if (historyIndex > 0) { setHistoryIndex(historyIndex - 1); setPlacedItems(JSON.parse(JSON.stringify(history[historyIndex - 1]))); } };
  const redo = () => { if (historyIndex < history.length - 1) { setHistoryIndex(historyIndex + 1); setPlacedItems(JSON.parse(JSON.stringify(history[historyIndex + 1]))); } };

  const getCanvasCoords = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - panOffset.x) / zoom,
      y: (e.clientY - rect.top - panOffset.y) / zoom,
    };
  }, [zoom, panOffset]);

  const getCanvasCoordsFromTouch = useCallback((touch: React.Touch) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (touch.clientX - rect.left - panOffset.x) / zoom,
      y: (touch.clientY - rect.top - panOffset.y) / zoom,
    };
  }, [zoom, panOffset]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setPanStart({ x: touch.clientX - panOffset.x, y: touch.clientY - panOffset.y });
      setIsPanning(true);
    }
  }, [panOffset]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1 && isPanning) {
      const touch = e.touches[0];
      setPanOffset({ x: touch.clientX - panStart.x, y: touch.clientY - panStart.y });
    }
  }, [isPanning, panStart]);

  const handleTouchEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  /* ─── Wall length editing ─── */
  const handleWallLengthChange = useCallback((wallIndex: number, newLengthCm: number) => {
    if (roomPolygon.length < 3 || newLengthCm < 10) return;
    const pts = [...roomPolygon];
    const aIdx = wallIndex;
    const bIdx = (wallIndex + 1) % pts.length;
    const a = pts[aIdx];
    const b = pts[bIdx];
    const currentLen = distancePP(a, b);
    if (currentLen < 1) return;

    // Direction vector from A to B
    const dx = (b.x - a.x) / currentLen;
    const dy = (b.y - a.y) / currentLen;

    // New position of B along same direction
    const newB = {
      x: Math.round(a.x + dx * newLengthCm),
      y: Math.round(a.y + dy * newLengthCm),
    };

    // Offset = how much B moved
    const offX = newB.x - b.x;
    const offY = newB.y - b.y;

    // Shift B and all subsequent vertices (up to but not including A) by the offset
    // This keeps the rest of the shape intact, just translated
    const n = pts.length;
    const newPts = pts.map((p, i) => {
      if (i === aIdx) return p; // A stays fixed
      // Check if i is "between" B and A (going forward from B)
      // i.e. i is in the chain: bIdx, bIdx+1, ..., aIdx-1
      let inChain = false;
      if (bIdx <= aIdx) {
        // Normal case: bIdx < aIdx, chain is [bIdx .. aIdx-1]
        // But if bIdx > aIdx (wrapping), chain wraps around
        inChain = i >= bIdx && i < aIdx; // won't happen since bIdx = aIdx+1 mod n, so bIdx > aIdx only when aIdx is last
      }
      // General wrap-safe check
      let idx = bIdx;
      while (idx !== aIdx) {
        if (i === idx) { inChain = true; break; }
        idx = (idx + 1) % n;
      }
      if (inChain) return { x: p.x + offX, y: p.y + offY };
      return p;
    });

    setRoomPolygon(newPts);
  }, [roomPolygon]);

  /* ─── Drawing mode handlers ─── */
  const startDrawingRoom = () => {
    setActiveTool('draw');
    setIsDrawingRoom(true);
    setDrawingPoints([]);
  };

  const finishDrawingRoom = () => {
    if (drawingPoints.length >= 3) {
      setRoomPolygon(drawingPoints);
      setRoomShape('polygon');
    }
    setIsDrawingRoom(false);
    setDrawingPoints([]);
    setActiveTool('select');
  };

  const cancelDrawingRoom = () => {
    setIsDrawingRoom(false);
    setDrawingPoints([]);
    setActiveTool('select');
  };

  const switchToRectangle = () => {
    setRoomShape('rectangle');
    setRoomPolygon([]);
    setActiveTool('select');
  };

  /* ─── Canvas mouse handlers ─── */
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Drawing mode: add point on click
    if (isDrawingRoom) {
      const coords = getCanvasCoords(e);
      let px = coords.x;
      let py = coords.y;
      if (snapToGrid) { px = snapVal(px, gridSize); py = snapVal(py, gridSize); }

      // Close polygon if clicking near first point
      if (drawingPoints.length >= 3 && distancePP({ x: px, y: py }, drawingPoints[0]) < 20 / zoom) {
        finishDrawingRoom();
        return;
      }

      setDrawingPoints(prev => [...prev, { x: px, y: py }]);
      return;
    }

    // Pan mode
    if (activeTool === 'pan' || e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      e.preventDefault();
      return;
    }

    // Check if clicking a polygon vertex (for dragging)
    if (roomShape === 'polygon' && roomPolygon.length >= 3 && activeTool === 'select') {
      const coords = getCanvasCoords(e);
      for (let i = 0; i < roomPolygon.length; i++) {
        if (distancePP(coords, roomPolygon[i]) < 12 / zoom) {
          setDraggingVertex(i);
          e.preventDefault();
          return;
        }
      }
    }

    // Deselect
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('room-floor') || (e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).tagName === 'rect' || (e.target as HTMLElement).tagName === 'path') {
      setSelectedId(null);
      setPopupItem(null);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    const coords = getCanvasCoords(e);

    // Track mouse for drawing preview
    if (isDrawingRoom) {
      let px = coords.x, py = coords.y;
      if (snapToGrid) { px = snapVal(px, gridSize); py = snapVal(py, gridSize); }
      setMousePos({ x: px, y: py });
      return;
    }

    // Dragging polygon vertex
    if (draggingVertex !== null) {
      let px = coords.x, py = coords.y;
      if (snapToGrid) { px = snapVal(px, gridSize); py = snapVal(py, gridSize); }
      setRoomPolygon(prev => prev.map((p, i) => i === draggingVertex ? { x: px, y: py } : p));
      return;
    }

    if (isPanning) {
      setPanOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }

    if (draggingId) {
      let newX = coords.x - dragOffset.x;
      let newY = coords.y - dragOffset.y;
      if (snapToGrid) { newX = snapVal(newX, gridSize); newY = snapVal(newY, gridSize); }
      setPlacedItems(prev => prev.map(i => i.id === draggingId ? { ...i, x: newX, y: newY } : i));
    }
  };

  const handleCanvasMouseUp = () => {
    if (draggingVertex !== null) { setDraggingVertex(null); return; }
    if (draggingId) { saveHistory(placedItems); setDraggingId(null); }
    setIsPanning(false);
  };

  const handleItemMouseDown = (e: React.MouseEvent, item: PlacedItem) => {
    e.stopPropagation();
    if (item.locked) { setSelectedId(item.id); return; }
    const coords = getCanvasCoords(e);
    setDragOffset({ x: coords.x - item.x, y: coords.y - item.y });
    setDraggingId(item.id);
    setSelectedId(item.id);
  };

  const handleItemDoubleClick = (e: React.MouseEvent, item: PlacedItem) => {
    e.stopPropagation();
    setDraggingId(null);
    setPopupItem(item);
  };

  // Add from catalog
  const addEquipmentToFloorPlan = useCallback((eq: EquipmentItem) => {
    const widthCm = Math.max(30, Math.round(eq.l / 10));
    const heightCm = Math.max(30, Math.round(eq.w / 10));
    const centerX = roomShape === 'polygon' && roomPolygon.length >= 3 ? (bounds.minX + bounds.w / 2) : roomWidthCm / 2;
    const centerY = roomShape === 'polygon' && roomPolygon.length >= 3 ? (bounds.minY + bounds.h / 2) : roomHeightCm / 2;

    const newItem: PlacedItem = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      equipmentId: eq.id,
      name: eq.name,
      icon: CATEGORIES.find(c => c.id === eq.cat)?.icon || 'table',
      imageData: eq.img,
      x: centerX - widthCm / 2,
      y: centerY - heightCm / 2,
      width: widthCm, height: heightCm,
      rotation: 0, locked: false,
      category: eq.cat,
      color: CATEGORY_COLORS[eq.cat] || '#f9fafb',
      kw: eq.kw, price: eq.price, brand: eq.brand, desc: eq.desc,
    };
    const updated = [...placedItems, newItem];
    setPlacedItems(updated);
    setSelectedId(newItem.id);
    saveHistory(updated);
  }, [placedItems, roomWidthCm, roomHeightCm, roomShape, roomPolygon, bounds, saveHistory]);

  // Drop from catalog
  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!trayDragItem) return;
    const coords = getCanvasCoords(e as any);
    const widthCm = Math.max(30, Math.round((trayDragItem.l || 700) / 10));
    const heightCm = Math.max(30, Math.round((trayDragItem.w || 700) / 10));
    let x = coords.x - widthCm / 2;
    let y = coords.y - heightCm / 2;
    if (snapToGrid) { x = snapVal(x, gridSize); y = snapVal(y, gridSize); }

    const catKey = trayDragItem.cat || trayDragItem.category || 'neutral';
    const newItem: PlacedItem = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      equipmentId: trayDragItem.id || undefined,
      name: trayDragItem.name,
      icon: CATEGORIES.find(c => c.id === catKey)?.icon || trayDragItem.icon || 'table',
      imageData: trayDragItem.img || trayDragItem.imageData,
      x, y, width: widthCm, height: heightCm,
      rotation: 0, locked: false, category: catKey,
      color: CATEGORY_COLORS[catKey] || '#f9fafb',
      kw: trayDragItem.kw || 0, price: trayDragItem.price, brand: trayDragItem.brand, desc: trayDragItem.desc,
    };
    const updated = [...placedItems, newItem];
    setPlacedItems(updated);
    setSelectedId(newItem.id);
    saveHistory(updated);
    setTrayDragItem(null);
  };

  // Actions
  const rotateSelected = () => {
    if (!selectedId) return;
    const updated = placedItems.map(item =>
      item.id === selectedId && !item.locked ? { ...item, rotation: (item.rotation + 90) % 360, width: item.height, height: item.width } : item
    );
    setPlacedItems(updated);
    saveHistory(updated);
  };
  const deleteSelected = () => {
    if (!selectedId) return;
    setPlacedItems(prev => { const u = prev.filter(i => i.id !== selectedId); saveHistory(u); return u; });
    setSelectedId(null);
    setPopupItem(null);
  };
  const duplicateSelected = () => {
    if (!selectedId) return;
    const item = placedItems.find(i => i.id === selectedId);
    if (!item) return;
    const newItem = { ...item, id: Date.now().toString(), x: item.x + 20, y: item.y + 20 };
    const updated = [...placedItems, newItem];
    setPlacedItems(updated);
    setSelectedId(newItem.id);
    saveHistory(updated);
  };
  const toggleLockSelected = () => {
    if (!selectedId) return;
    setPlacedItems(prev => prev.map(i => i.id === selectedId ? { ...i, locked: !i.locked } : i));
  };

  const zoomIn = () => setZoom(z => Math.min(3, z + 0.1));
  const zoomOut = () => setZoom(z => Math.max(0.2, z - 0.1));
  const zoomFit = () => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const w = roomShape === 'polygon' && roomPolygon.length >= 3 ? bounds.w + 100 : roomWidthCm;
    const h = roomShape === 'polygon' && roomPolygon.length >= 3 ? bounds.h + 100 : roomHeightCm;
    const scaleX = (rect.width - 80) / Math.max(w, 200);
    const scaleY = (rect.height - 80) / Math.max(h, 200);
    const newZoom = Math.min(scaleX, scaleY, 1.5);
    setZoom(newZoom);
    const offX = roomShape === 'polygon' && roomPolygon.length >= 3 ? bounds.minX - 50 : 0;
    const offY = roomShape === 'polygon' && roomPolygon.length >= 3 ? bounds.minY - 50 : 0;
    setPanOffset({
      x: (rect.width - w * newZoom) / 2 - offX * newZoom,
      y: (rect.height - h * newZoom) / 2 - offY * newZoom,
    });
  };

  useEffect(() => { const t = setTimeout(zoomFit, 200); return () => clearTimeout(t); }, []);

  // Listen for floorPlanItemId from catalog
  useEffect(() => {
    const itemId = equipmentStore.floorPlanItemId;
    if (itemId) {
      const eq = equipmentStore.getItemById(itemId);
      if (eq) addEquipmentToFloorPlan(eq);
      equipmentStore.setFloorPlanItem(null);
    }
  }, [equipmentStore.floorPlanItemId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isDrawingRoom) {
        if (e.key === 'Escape') cancelDrawingRoom();
        if (e.key === 'Enter') finishDrawingRoom();
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') deleteSelected();
      if (e.key === 'r' && !e.ctrlKey) rotateSelected();
      if (e.key === 'd' && e.ctrlKey) { e.preventDefault(); duplicateSelected(); }
      if (e.key === 'z' && e.ctrlKey) { e.preventDefault(); undo(); }
      if (e.key === 'y' && e.ctrlKey) { e.preventDefault(); redo(); }
      if (e.key === 'Escape') { setSelectedId(null); setPopupItem(null); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedId, placedItems, historyIndex, isDrawingRoom, drawingPoints]);

  /* ─── Render ─── */
  const renderSVGWidth = roomShape === 'polygon' && roomPolygon.length >= 3 ? bounds.maxX + 50 : roomWidthCm;
  const renderSVGHeight = roomShape === 'polygon' && roomPolygon.length >= 3 ? bounds.maxY + 50 : roomHeightCm;

  return (
    <div className="flex-1 flex overflow-hidden -m-6 md:-m-8" style={{ height: 'calc(100vh - 4rem)' }}>
      {/* Canvas Area */}
      <div className="flex-1 flex flex-col bg-slate-100 min-w-0">
        {/* Toolbar */}
        <div className="h-11 bg-white border-b border-slate-200 flex items-center px-3 gap-1 shrink-0">
          {isProjectMode && (
            <>
              <Link to={`/projects/${id}`} className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-md mr-1"><ArrowLeft size={16} /></Link>
              <span className="text-xs font-bold text-primary mr-2 truncate max-w-[120px]">{project?.name}</span>
              <div className="w-px h-5 bg-slate-200 mr-1" />
            </>
          )}

          <div className="flex bg-slate-100 rounded-lg p-0.5 mr-2">
            <button onClick={() => { setActiveTool('select'); cancelDrawingRoom(); }} className={`p-1.5 rounded-md transition-all ${activeTool === 'select' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`} title="Sec"><MousePointer2 size={15} /></button>
            <button onClick={() => { setActiveTool('pan'); cancelDrawingRoom(); }} className={`p-1.5 rounded-md transition-all ${activeTool === 'pan' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`} title="Kaydir"><Hand size={15} /></button>
            <button onClick={startDrawingRoom} className={`p-1.5 rounded-md transition-all ${activeTool === 'draw' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`} title="Oda Ciz"><Pen size={15} /></button>
          </div>

          {isDrawingRoom && (
            <div className="flex items-center gap-1 mr-2">
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                {drawingPoints.length} nokta — tiklayarak cizin, kapatmak icin ilk noktaya tiklayin
              </span>
              {drawingPoints.length >= 3 && (
                <button onClick={finishDrawingRoom} className="px-2 py-1 text-[10px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded transition-colors">Tamamla</button>
              )}
              <button onClick={cancelDrawingRoom} className="px-2 py-1 text-[10px] font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded transition-colors">Iptal</button>
            </div>
          )}

          {!isDrawingRoom && (
            <>
              <div className="w-px h-5 bg-slate-200 mx-1" />
              <button onClick={undo} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md"><Undo2 size={15} /></button>
              <button onClick={redo} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md"><Redo2 size={15} /></button>
              <div className="w-px h-5 bg-slate-200 mx-1" />
              <button onClick={rotateSelected} disabled={!selectedId} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md disabled:opacity-30"><RotateCw size={15} /></button>
              <button onClick={duplicateSelected} disabled={!selectedId} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md disabled:opacity-30"><Copy size={15} /></button>
              <button onClick={toggleLockSelected} disabled={!selectedId} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md disabled:opacity-30">
                {selectedItem?.locked ? <Lock size={15} /> : <Unlock size={15} />}
              </button>
              <button onClick={deleteSelected} disabled={!selectedId} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md disabled:opacity-30"><Trash2 size={15} /></button>
              <div className="w-px h-5 bg-slate-200 mx-1" />
              <button onClick={() => setShowGrid(!showGrid)} className={`p-1.5 rounded-md ${showGrid ? 'text-primary bg-primary/10' : 'text-slate-400'}`}><Grid3x3 size={15} /></button>
              <button onClick={() => setSnapToGrid(!snapToGrid)} className={`p-1.5 rounded-md ${snapToGrid ? 'text-primary bg-primary/10' : 'text-slate-400'}`}><Magnet size={15} /></button>
            </>
          )}

          <div className="flex-1" />
          <button onClick={zoomOut} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"><Minus size={15} /></button>
          <span className="text-[10px] font-mono font-bold text-slate-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={zoomIn} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"><Plus size={15} /></button>
          <button onClick={zoomFit} className="ml-1 px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-primary hover:bg-slate-100 rounded-md">FIT</button>
          {/* Mobile: ekipman paneli aç */}
          <button
            onClick={() => setShowMobilePanel(true)}
            className="md:hidden ml-2 px-3 py-1.5 text-[10px] font-bold text-white bg-primary rounded-md flex items-center gap-1"
          >
            <Plus size={13} /> Ekipman
          </button>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 overflow-hidden relative"
          style={{ cursor: isDrawingRoom ? 'crosshair' : activeTool === 'pan' || isPanning ? 'grab' : draggingVertex !== null ? 'move' : 'default' }}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleCanvasDrop}
        >
          <div style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`, transformOrigin: '0 0', position: 'absolute', willChange: 'transform' }}>
            <svg width={renderSVGWidth} height={renderSVGHeight} className="overflow-visible">

              {/* Grid */}
              {showGrid && (
                <>
                  <defs>
                    <pattern id="sGrid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
                      <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
                    </pattern>
                    <pattern id="bGrid" width={gridSize * 10} height={gridSize * 10} patternUnits="userSpaceOnUse">
                      <rect width={gridSize * 10} height={gridSize * 10} fill="url(#sGrid)" />
                      <path d={`M ${gridSize * 10} 0 L 0 0 0 ${gridSize * 10}`} fill="none" stroke="#cbd5e1" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect x={-500} y={-500} width={renderSVGWidth + 1000} height={renderSVGHeight + 1000} fill="url(#bGrid)" />
                </>
              )}

              {/* Room shape */}
              {roomShape === 'rectangle' ? (
                <>
                  <rect x={0} y={0} width={roomWidthCm} height={roomHeightCm} fill="#ffffff" stroke="#334155" strokeWidth={3} className="room-floor" />
                  {/* Dimension labels */}
                  <text x={roomWidthCm / 2} y={-12} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#475569" fontFamily="monospace">{(roomWidthCm / 100).toFixed(1)}m</text>
                  <text x={roomWidthCm + 20} y={roomHeightCm / 2} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#475569" fontFamily="monospace" transform={`rotate(90 ${roomWidthCm + 20} ${roomHeightCm / 2})`}>{(roomHeightCm / 100).toFixed(1)}m</text>
                </>
              ) : roomPolygon.length >= 3 ? (
                <>
                  <path d={polygonSVGPath(roomPolygon)} fill="#ffffff" stroke="#334155" strokeWidth={3} className="room-floor" />
                  {/* Wall dimension labels */}
                  {roomPolygon.map((p, i) => {
                    const next = roomPolygon[(i + 1) % roomPolygon.length];
                    return <WallLabel key={`wall-${i}`} a={p} b={next} zoom={zoom} wallIndex={i} onLengthChange={handleWallLengthChange} />;
                  })}
                  {/* Vertex handles (draggable) */}
                  {!isDrawingRoom && roomPolygon.map((p, i) => (
                    <circle
                      key={`v-${i}`}
                      cx={p.x} cy={p.y} r={6 / zoom}
                      fill={draggingVertex === i ? '#1d4ed8' : '#ffffff'}
                      stroke="#1d4ed8"
                      strokeWidth={2 / zoom}
                      style={{ cursor: 'move' }}
                      onMouseDown={(e) => { e.stopPropagation(); setDraggingVertex(i); }}
                    />
                  ))}
                </>
              ) : null}

              {/* Drawing preview */}
              {isDrawingRoom && drawingPoints.length > 0 && (
                <>
                  {/* Existing lines */}
                  <polyline
                    points={[...drawingPoints, mousePos].map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none" stroke="#10b981" strokeWidth={2} strokeDasharray="6 3"
                  />
                  {/* Fill preview if enough points */}
                  {drawingPoints.length >= 3 && (
                    <polygon
                      points={drawingPoints.map(p => `${p.x},${p.y}`).join(' ')}
                      fill="#10b98120" stroke="none"
                    />
                  )}
                  {/* Point handles */}
                  {drawingPoints.map((p, i) => (
                    <circle key={`dp-${i}`} cx={p.x} cy={p.y} r={5 / zoom}
                      fill={i === 0 && drawingPoints.length >= 3 ? '#10b981' : '#ffffff'}
                      stroke="#10b981" strokeWidth={2 / zoom}
                    />
                  ))}
                  {/* Close indicator */}
                  {drawingPoints.length >= 3 && distancePP(mousePos, drawingPoints[0]) < 20 / zoom && (
                    <circle cx={drawingPoints[0].x} cy={drawingPoints[0].y} r={12 / zoom} fill="none" stroke="#10b981" strokeWidth={2 / zoom} strokeDasharray="4 2" />
                  )}
                  {/* Current mouse point */}
                  <circle cx={mousePos.x} cy={mousePos.y} r={4 / zoom} fill="#10b981" opacity={0.6} />
                  {/* Mouse coords label */}
                  <text x={mousePos.x + 12} y={mousePos.y - 8} fontSize={9 / zoom} fill="#10b981" fontWeight="bold" fontFamily="monospace">
                    ({Math.round(mousePos.x)}, {Math.round(mousePos.y)})
                  </text>
                  {/* Distance from last point */}
                  {drawingPoints.length > 0 && (
                    <text x={(mousePos.x + drawingPoints[drawingPoints.length - 1].x) / 2} y={(mousePos.y + drawingPoints[drawingPoints.length - 1].y) / 2 - 8} fontSize={9 / zoom} fill="#059669" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                      {(distancePP(mousePos, drawingPoints[drawingPoints.length - 1]) / 100).toFixed(2)}m
                    </text>
                  )}
                </>
              )}
            </svg>

            {/* Placed items (HTML overlay on top of SVG) */}
            <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
              {placedItems.map((item) => {
                const Icon = ICON_MAP[item.icon] || Package;
                const isSelected = item.id === selectedId;
                const isDragging = item.id === draggingId;
                const borderColor = CATEGORY_BORDERS[item.category] || '#d1d5db';

                return (
                  <div
                    key={item.id}
                    className={`absolute flex flex-col items-center justify-center transition-shadow`}
                    style={{
                      left: item.x, top: item.y, width: item.width, height: item.height,
                      backgroundColor: item.color || '#f9fafb',
                      border: `2px solid ${isSelected ? '#1d4ed8' : borderColor}`,
                      borderRadius: 4,
                      cursor: item.locked ? 'not-allowed' : draggingId === item.id ? 'grabbing' : 'grab',
                      boxShadow: isSelected ? '0 0 0 3px rgba(29,78,216,0.3), 0 4px 12px rgba(0,0,0,0.15)' : isDragging ? '0 8px 24px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.08)',
                      zIndex: isDragging ? 100 : isSelected ? 50 : 1,
                      userSelect: 'none',
                      opacity: isDragging ? 0.8 : 1,
                      pointerEvents: 'auto',
                    }}
                    onMouseDown={(e) => handleItemMouseDown(e, item)}
                    onDoubleClick={(e) => handleItemDoubleClick(e, item)}
                  >
                    {item.imageData ? (
                      <img src={item.imageData} alt={item.name} className="w-2/3 h-1/2 object-contain" style={{ pointerEvents: 'none' }} />
                    ) : (
                      <Icon size={Math.min(item.width, item.height) * 0.3} className="text-slate-500" style={{ pointerEvents: 'none' }} />
                    )}
                    <span className="text-center font-bold leading-tight mt-0.5 text-slate-700" style={{ fontSize: Math.max(7, Math.min(10, item.width * 0.065)), maxWidth: item.width - 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
                      {item.name}
                    </span>
                    <span className="text-slate-400 font-mono" style={{ fontSize: Math.max(6, Math.min(8, item.width * 0.05)), pointerEvents: 'none' }}>
                      {item.width}x{item.height}
                    </span>
                    {item.locked && <div className="absolute top-1 right-1"><Lock size={8} className="text-slate-400" /></div>}
                    {isSelected && !item.locked && (
                      <>
                        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-full" style={{ pointerEvents: 'none' }} />
                        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-full" style={{ pointerEvents: 'none' }} />
                        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-full" style={{ pointerEvents: 'none' }} />
                        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-full" style={{ pointerEvents: 'none' }} />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className="h-7 bg-white border-t border-slate-200 flex items-center px-4 text-[10px] font-mono text-slate-500 gap-6 shrink-0">
          <span>Alan: {roomAreaM2}m2</span>
          <span>Cevre: {roomPerimeterM}m</span>
          <span>Ekipman: {totalItems} ({equipmentAreaM2}m2)</span>
          <span>Guc: {totalKW.toFixed(1)} kW</span>
          {totalPrice > 0 && <span>Toplam: {formatPrice(totalPrice)}</span>}
          <span className="ml-auto">{Math.round(zoom * 100)}%</span>
        </div>
      </div>

      {/* Right Panel */}
      <aside className="w-80 xl:w-96 bg-white border-l border-slate-200 flex flex-col shrink-0 hidden md:flex" style={{ height: 'calc(100vh - 4rem)' }}>
        <div className="flex border-b border-slate-200 shrink-0">
          <button onClick={() => setRightPanelTab('catalog')} className={`flex-1 py-2.5 text-xs font-bold text-center transition-all ${rightPanelTab === 'catalog' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-400 hover:text-slate-600'}`}>Ekipman</button>
          <button onClick={() => setRightPanelTab('properties')} className={`flex-1 py-2.5 text-xs font-bold text-center transition-all ${rightPanelTab === 'properties' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-400 hover:text-slate-600'}`}>Ozellikler</button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {rightPanelTab === 'catalog' && (
            <div className="p-3 space-y-3">
              {/* Room shape controls */}
              <div className="p-3 bg-slate-50 rounded-lg space-y-3">
                <h4 className="text-[10px] font-black uppercase text-slate-500">Oda Sekli</h4>
                <div className="flex gap-2">
                  <button
                    onClick={switchToRectangle}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all ${
                      roomShape === 'rectangle' ? 'bg-primary text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-primary/30'
                    }`}
                  >
                    <Square size={12} /> Dikdortgen
                  </button>
                  <button
                    onClick={startDrawingRoom}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all ${
                      roomShape === 'polygon' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <Pen size={12} /> Ozel Ciz
                  </button>
                </div>

                {roomShape === 'rectangle' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Uzunluk (cm)</label>
                      <input type="number" value={roomWidthCm} onChange={(e) => setRoomWidthCm(Math.max(100, Number(e.target.value)))} className="w-full mt-0.5 px-2 py-1.5 text-sm font-bold border border-slate-200 rounded-md focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Genislik (cm)</label>
                      <input type="number" value={roomHeightCm} onChange={(e) => setRoomHeightCm(Math.max(100, Number(e.target.value)))} className="w-full mt-0.5 px-2 py-1.5 text-sm font-bold border border-slate-200 rounded-md focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                  </div>
                )}

                {roomShape === 'polygon' && roomPolygon.length >= 3 && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-white rounded-lg p-2 border border-slate-200">
                        <div className="text-[8px] font-bold text-slate-400 uppercase">Alan</div>
                        <div className="text-sm font-black text-primary">{roomAreaM2}m2</div>
                      </div>
                      <div className="bg-white rounded-lg p-2 border border-slate-200">
                        <div className="text-[8px] font-bold text-slate-400 uppercase">Cevre</div>
                        <div className="text-sm font-black text-primary">{roomPerimeterM}m</div>
                      </div>
                    </div>
                    <div className="text-[9px] text-slate-400">
                      {roomPolygon.length} kose noktasi — noktalari surukleyerek duzenleyin
                    </div>
                    <button onClick={startDrawingRoom} className="w-full py-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center justify-center gap-1 transition-all">
                      <RotateCcw size={11} /> Yeniden Ciz
                    </button>
                  </div>
                )}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input type="text" value={catalogSearch} onChange={(e) => setCatalogSearch(e.target.value)} placeholder="Urun ara..." className="w-full pl-8 pr-8 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                {catalogSearch && <button onClick={() => setCatalogSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary"><X size={12} /></button>}
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <button onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${showFavoritesOnly ? 'bg-pink-50 text-pink-600 border border-pink-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                  <Heart size={11} fill={showFavoritesOnly ? 'currentColor' : 'none'} /> Favoriler
                  {equipmentStore.favorites.length > 0 && <span className="ml-1 bg-pink-200 text-pink-700 rounded-full px-1.5 text-[9px]">{equipmentStore.favorites.length}</span>}
                </button>
                <select value={catalogCategory} onChange={(e) => setCatalogCategory(e.target.value)} className="flex-1 text-[10px] font-bold px-2 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 outline-none">
                  <option value="">Tum Kategoriler</option>
                  {CATEGORIES.filter(c => c.count > 0).map(c => <option key={c.id} value={c.id}>{c.name} ({c.count})</option>)}
                </select>
              </div>

              <div className="text-[10px] text-slate-400 font-medium px-1">
                {catalogItems.length < 60 ? `${catalogItems.length} urun` : '60+ urun (ilk 60)'}
              </div>

              {/* Equipment grid */}
              <div className="grid grid-cols-2 gap-2">
                {catalogItems.map((item) => {
                  const isFav = equipmentStore.favorites.includes(item.id);
                  return (
                    <div key={item.id} draggable onDragStart={(e) => { setTrayDragItem(item); e.dataTransfer.effectAllowed = 'copy'; }}
                      className="bg-white hover:bg-slate-50 rounded-lg border border-slate-200 hover:border-primary/40 cursor-grab active:cursor-grabbing transition-all group relative overflow-hidden">
                      <button onClick={(e) => { e.stopPropagation(); equipmentStore.toggleFavorite(item.id); }} className="absolute top-1.5 right-1.5 z-10 p-1 rounded-full bg-white/80 hover:bg-white shadow-sm">
                        <Heart size={10} fill={isFav ? '#ec4899' : 'none'} className={isFav ? 'text-pink-500' : 'text-slate-300 group-hover:text-slate-400'} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); addEquipmentToFloorPlan(item); }} className="absolute top-1.5 left-1.5 z-10 p-1 rounded-full bg-white/80 hover:bg-primary hover:text-white text-slate-400 shadow-sm opacity-0 group-hover:opacity-100" title="Ekle">
                        <Plus size={10} />
                      </button>
                      <div className="w-full aspect-[4/3] bg-slate-50 flex items-center justify-center p-1">
                        <ProductImage src={item.img} alt={item.name} className="w-full h-full" />
                      </div>
                      <div className="p-2">
                        <div className="text-[10px] font-bold text-slate-700 leading-tight line-clamp-2 min-h-[28px]">{item.name}</div>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">{item.id}</div>
                        <div className="flex items-center justify-between mt-1.5">
                          {item.kw > 0 && <span className="flex items-center gap-0.5 text-[9px] text-amber-600"><Zap size={8} />{item.kw}kW</span>}
                          {item.price > 0 && <span className="text-[9px] font-bold text-primary">{formatPrice(item.price)}</span>}
                        </div>
                        <div className="text-[8px] text-slate-400 mt-1">{Math.round(item.l / 10)}x{Math.round(item.w / 10)}cm</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {catalogItems.length === 0 && (
                <div className="text-center py-8 text-slate-400"><Package size={28} className="mx-auto mb-2 opacity-40" /><p className="text-xs font-medium">Urun bulunamadi</p></div>
              )}
            </div>
          )}

          {rightPanelTab === 'properties' && (
            <div className="p-4">
              {selectedItem ? (() => {
                const item = selectedItem;
                const eqItem = item.equipmentId ? equipmentStore.getItemById(item.equipmentId) : null;
                const isFav = item.equipmentId ? equipmentStore.favorites.includes(item.equipmentId) : false;
                const catInfo = CATEGORIES.find(c => c.id === item.category);
                return (
                  <div className="space-y-4">
                    <div className="relative rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm">
                      <div className="w-full h-40 bg-slate-50 flex items-center justify-center">
                        {item.imageData ? <ProductImage src={item.imageData} alt={item.name} className="w-full h-full p-2" /> : <Package size={40} className="text-slate-300" />}
                      </div>
                      {catInfo && <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: catInfo.color }}>{catInfo.name}</span>}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-800">{item.name}</h3>
                      {item.equipmentId && <p className="text-[10px] text-slate-400 font-mono mt-1">{item.equipmentId}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 rounded-lg p-2.5">
                        <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Boyutlar</div>
                        <p className="text-xs font-bold text-slate-700">{item.width} x {item.height} cm</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2.5">
                        <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Guc</div>
                        <p className="text-xs font-bold text-slate-700">{item.kw > 0 ? `${item.kw} kW` : 'Yok'}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase text-slate-400">Konum</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-bold text-slate-400">X (cm)</label>
                          <input type="number" value={Math.round(item.x)} onChange={(e) => setPlacedItems(prev => prev.map(i => i.id === item.id ? { ...i, x: Number(e.target.value) } : i))} className="w-full mt-0.5 px-2 py-1.5 text-xs border border-slate-200 rounded-md focus:ring-2 focus:ring-primary outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400">Y (cm)</label>
                          <input type="number" value={Math.round(item.y)} onChange={(e) => setPlacedItems(prev => prev.map(i => i.id === item.id ? { ...i, y: Number(e.target.value) } : i))} className="w-full mt-0.5 px-2 py-1.5 text-xs border border-slate-200 rounded-md focus:ring-2 focus:ring-primary outline-none" />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={rotateSelected} className="flex-1 py-2 text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg flex items-center justify-center gap-1"><RotateCw size={12} /> Dondur</button>
                      <button onClick={duplicateSelected} className="flex-1 py-2 text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center gap-1"><Copy size={12} /> Kopyala</button>
                    </div>
                    <button onClick={deleteSelected} className="w-full py-2 text-[10px] font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center gap-1"><Trash2 size={12} /> Sil</button>
                  </div>
                );
              })() : (
                <div className="text-center py-12 text-slate-400">
                  <MousePointer2 size={32} className="mx-auto mb-3 opacity-40" />
                  <p className="text-xs font-medium">Bir ekipman secin</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 shrink-0">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div><div className="text-[8px] font-bold text-slate-400 uppercase">Alan</div><div className="text-sm font-black text-primary">{roomAreaM2}m2</div></div>
            <div><div className="text-[8px] font-bold text-slate-400 uppercase">Ekipman</div><div className="text-sm font-black text-primary">{totalItems}</div></div>
            <div><div className="text-[8px] font-bold text-slate-400 uppercase">Guc</div><div className="text-sm font-black text-primary">{totalKW.toFixed(1)}kW</div></div>
            <div><div className="text-[8px] font-bold text-slate-400 uppercase">Favori</div><div className="text-sm font-black text-pink-500">{equipmentStore.favorites.length}</div></div>
          </div>
        </div>
      </aside>

      {/* Full product card modal (double click) */}
      {popupItem && (() => {
        const eqItem = popupItem.equipmentId ? equipmentStore.getItemById(popupItem.equipmentId) : null;
        const isFav = popupItem.equipmentId ? equipmentStore.favorites.includes(popupItem.equipmentId) : false;
        const catInfo = CATEGORIES.find(c => c.id === popupItem.category);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setPopupItem(null)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="relative">
                <div className="w-full h-56 bg-slate-50 flex items-center justify-center">
                  {popupItem.imageData ? <ProductImage src={popupItem.imageData} alt={popupItem.name} className="w-full h-full p-4" /> : <Package size={56} className="text-slate-300" />}
                </div>
                <button onClick={() => setPopupItem(null)} className="absolute top-3 right-3 bg-black/40 text-white rounded-full p-2 hover:bg-black/60"><X size={16} /></button>
                {popupItem.equipmentId && (
                  <button onClick={() => equipmentStore.toggleFavorite(popupItem.equipmentId!)} className="absolute top-3 right-14 p-2 bg-white/90 rounded-full shadow-md hover:shadow-lg">
                    <Heart size={16} fill={isFav ? '#ec4899' : 'none'} className={isFav ? 'text-pink-500' : 'text-slate-300'} />
                  </button>
                )}
                {catInfo && <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: catInfo.color }}>{catInfo.name}</span>}
                {popupItem.brand && <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded bg-black/50 text-white text-[10px] font-bold">{popupItem.brand}</span>}
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <h2 className="text-lg font-black text-slate-800">{popupItem.name}</h2>
                  {popupItem.equipmentId && <p className="text-xs font-mono text-slate-400 mt-1">{popupItem.equipmentId}</p>}
                </div>
                {popupItem.desc && <p className="text-sm text-slate-500 leading-relaxed">{popupItem.desc}</p>}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase mb-1.5"><Ruler size={12} /> Boyutlar</div>
                    <p className="font-bold text-slate-700 text-sm">{popupItem.width} x {popupItem.height} cm</p>
                    {eqItem && <p className="text-[10px] text-slate-400 mt-0.5">{eqItem.l} x {eqItem.w} x {eqItem.h} mm</p>}
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase mb-1.5"><Zap size={12} /> Guc</div>
                    <p className="font-bold text-slate-700 text-sm">{popupItem.kw > 0 ? `${popupItem.kw} kW` : 'Yok'}</p>
                  </div>
                  {popupItem.price && popupItem.price > 0 && (
                    <div className="bg-slate-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase mb-1.5"><Euro size={12} /> Fiyat</div>
                      <p className="font-bold text-primary text-sm">{formatPrice(popupItem.price)}</p>
                    </div>
                  )}
                  <div className="bg-slate-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase mb-1.5"><Package size={12} /> Konum</div>
                    <p className="font-bold text-slate-700 text-sm">X: {Math.round(popupItem.x)}, Y: {Math.round(popupItem.y)}</p>
                  </div>
                </div>
                {eqItem && (eqItem.sub || eqItem.fam || eqItem.line) && (
                  <div className="flex flex-wrap gap-2">
                    {eqItem.sub && <span className="px-2.5 py-1 bg-slate-100 rounded-full text-[10px] font-medium text-slate-500">{eqItem.sub}</span>}
                    {eqItem.fam && <span className="px-2.5 py-1 bg-slate-100 rounded-full text-[10px] font-medium text-slate-500">{eqItem.fam}</span>}
                    {eqItem.line && <span className="px-2.5 py-1 bg-slate-100 rounded-full text-[10px] font-medium text-slate-500">{eqItem.line}</span>}
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  <button onClick={() => { setPopupItem(null); rotateSelected(); }} className="flex-1 py-2.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg flex items-center justify-center gap-1.5"><RotateCw size={14} /> Dondur</button>
                  <button onClick={() => { setPopupItem(null); duplicateSelected(); }} className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center gap-1.5"><Copy size={14} /> Kopyala</button>
                  <button onClick={() => { setPopupItem(null); deleteSelected(); }} className="py-2.5 px-4 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center gap-1.5"><Trash2 size={14} /> Sil</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Mobile Equipment Bottom Sheet */}
      {showMobilePanel && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobilePanel(false)} />
          <div className="relative bg-white rounded-t-2xl shadow-2xl flex flex-col max-h-[80vh]">
            {/* Handle */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800">Ekipman Ekle</h3>
              <button onClick={() => setShowMobilePanel(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full">
                <X size={18} />
              </button>
            </div>

            {/* Search */}
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Ürün ara..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Equipment list */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-3">
                {catalogItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { addEquipmentToFloorPlan(item); setShowMobilePanel(false); }}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden text-left active:scale-95 transition-transform shadow-sm"
                  >
                    <div className="w-full aspect-[4/3] bg-slate-50 flex items-center justify-center p-1">
                      <ProductImage src={item.img} alt={item.name} className="w-full h-full" />
                    </div>
                    <div className="p-2">
                      <p className="text-[11px] font-bold text-slate-700 leading-tight line-clamp-2">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.id}</p>
                      {item.price > 0 && <p className="text-[10px] font-bold text-primary mt-1">{formatPrice(item.price)}</p>}
                    </div>
                  </button>
                ))}
                {catalogItems.length === 0 && (
                  <div className="col-span-2 text-center py-10 text-slate-400">
                    <Package size={28} className="mx-auto mb-2 opacity-40" />
                    <p className="text-xs">Ürün bulunamadı</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
