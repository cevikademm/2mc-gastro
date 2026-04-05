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
  Ruler, Euro, ExternalLink, Pen, Square, RotateCcw,
  DoorOpen, PanelTop, Columns3, FileDown, Circle
} from 'lucide-react';
import { jsPDF } from 'jspdf';

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

interface DoorMarker {
  id: string;
  wallIndex: number;
  pos: number;       // 0–1 position along wall
  width: number;     // cm
  swing: 'left' | 'right';
}

interface WindowMarker {
  id: string;
  wallIndex: number;
  pos: number;
  width: number;     // cm
}

interface ColumnItem {
  id: string;
  x: number;
  y: number;
  size: number;      // cm
  shape: 'rect' | 'circle';
}

type RoomShape = 'rectangle' | 'polygon';
type PlacementMode = 'none' | 'door' | 'window' | 'column';

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

/** Distance from point P to line segment A–B, returns { dist, t } where t is projection 0–1 */
function pointToSegment(p: Point, a: Point, b: Point): { dist: number; t: number; proj: Point } {
  const dx = b.x - a.x, dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 0.001) return { dist: distancePP(p, a), t: 0, proj: a };
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const proj = { x: a.x + t * dx, y: a.y + t * dy };
  return { dist: distancePP(p, proj), t, proj };
}

/** Get point along wall at parametric position t (0–1) */
function wallPoint(a: Point, b: Point, t: number): Point {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/** Get wall normal (pointing inward – left side of A→B direction) */
function wallNormal(a: Point, b: Point): Point {
  const len = distancePP(a, b);
  if (len < 0.001) return { x: 0, y: -1 };
  return { x: -(b.y - a.y) / len, y: (b.x - a.x) / len };
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
      onLengthChange(wallIndex, val * 100);
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

/* ─── Main Component ─── */
export default function DesignStudio() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects } = useProjectStore();
  const equipmentStore = useEquipmentStore();
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

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
  const [selectedVertex, setSelectedVertex] = useState<number | null>(null);

  // Wall / architectural state
  const [wallThickness, setWallThickness] = useState<number>(saved?.wallThickness ?? 20);
  const [doors, setDoors] = useState<DoorMarker[]>(saved?.doors || []);
  const [windows, setWindows] = useState<WindowMarker[]>(saved?.windows || []);
  const [columns, setColumns] = useState<ColumnItem[]>(saved?.columns || []);
  const [placementMode, setPlacementMode] = useState<PlacementMode>('none');
  const [columnSize, setColumnSize] = useState<number>(saved?.columnSize ?? 30);
  const [doorWidth, setDoorWidth] = useState<number>(saved?.doorWidth ?? 90);
  const [windowWidth, setWindowWidth] = useState<number>(saved?.windowWidth ?? 120);
  const [selectedDoor, setSelectedDoor] = useState<string | null>(null);
  const [selectedWindow, setSelectedWindow] = useState<string | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);

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
  const [rightPanelTab, setRightPanelTab] = useState<'catalog' | 'properties' | 'architecture'>('catalog');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState('');
  const [trayDragItem, setTrayDragItem] = useState<any>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [popupItem, setPopupItem] = useState<PlacedItem | null>(null);

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
        roomWidthCm, roomHeightCm, roomShape, roomPolygon,
        wallThickness, doors, windows, columns, columnSize, doorWidth, windowWidth,
      }));
    } catch {}
  }, [placedItems, roomWidthCm, roomHeightCm, roomShape, roomPolygon, wallThickness, doors, windows, columns, columnSize, doorWidth, windowWidth, storageKey]);

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

  const getCanvasCoords = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - panOffset.x) / zoom,
      y: (e.clientY - rect.top - panOffset.y) / zoom,
    };
  }, [zoom, panOffset]);

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

    const dx = (b.x - a.x) / currentLen;
    const dy = (b.y - a.y) / currentLen;
    const newB = { x: Math.round(a.x + dx * newLengthCm), y: Math.round(a.y + dy * newLengthCm) };
    const offX = newB.x - b.x;
    const offY = newB.y - b.y;
    const n = pts.length;
    const newPts = pts.map((p, i) => {
      if (i === aIdx) return p;
      let inChain = false;
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

  /* ─── Add vertex to edge ─── */
  const addVertexToEdge = useCallback((edgeIndex: number, position: Point) => {
    if (roomPolygon.length < 3) return;
    const newPoly = [...roomPolygon];
    newPoly.splice(edgeIndex + 1, 0, position);
    // Update door/window indices that come after the insertion
    setDoors(prev => prev.map(d => d.wallIndex > edgeIndex ? { ...d, wallIndex: d.wallIndex + 1 } : d));
    setWindows(prev => prev.map(w => w.wallIndex > edgeIndex ? { ...w, wallIndex: w.wallIndex + 1 } : w));
    setRoomPolygon(newPoly);
    setSelectedVertex(edgeIndex + 1);
  }, [roomPolygon]);

  /* ─── Delete selected vertex ─── */
  const deleteSelectedVertex = useCallback(() => {
    if (selectedVertex === null || roomPolygon.length <= 3) return;
    const idx = selectedVertex;
    const newPoly = roomPolygon.filter((_, i) => i !== idx);
    // Update door/window indices
    setDoors(prev => prev.filter(d => d.wallIndex !== idx && d.wallIndex !== (idx - 1 + roomPolygon.length) % roomPolygon.length).map(d => d.wallIndex > idx ? { ...d, wallIndex: d.wallIndex - 1 } : d));
    setWindows(prev => prev.filter(w => w.wallIndex !== idx && w.wallIndex !== (idx - 1 + roomPolygon.length) % roomPolygon.length).map(w => w.wallIndex > idx ? { ...w, wallIndex: w.wallIndex - 1 } : w));
    setRoomPolygon(newPoly);
    setSelectedVertex(null);
  }, [selectedVertex, roomPolygon]);

  /* ─── Drawing mode handlers ─── */
  const startDrawingRoom = () => {
    setActiveTool('draw');
    setIsDrawingRoom(true);
    setDrawingPoints([]);
    setPlacementMode('none');
  };

  const finishDrawingRoom = () => {
    if (drawingPoints.length >= 3) {
      setRoomPolygon(drawingPoints);
      setRoomShape('polygon');
      setDoors([]);
      setWindows([]);
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
    setDoors([]);
    setWindows([]);
    setActiveTool('select');
  };

  /* ─── Find nearest edge to a point ─── */
  const findNearestEdge = useCallback((pt: Point): { edgeIndex: number; dist: number; proj: Point } | null => {
    if (roomPolygon.length < 3) return null;
    let bestIdx = 0, bestDist = Infinity, bestProj: Point = pt;
    for (let i = 0; i < roomPolygon.length; i++) {
      const next = roomPolygon[(i + 1) % roomPolygon.length];
      const result = pointToSegment(pt, roomPolygon[i], next);
      if (result.dist < bestDist) {
        bestDist = result.dist;
        bestIdx = i;
        bestProj = result.proj;
      }
    }
    return { edgeIndex: bestIdx, dist: bestDist, proj: bestProj };
  }, [roomPolygon]);

  /* ─── Canvas mouse handlers ─── */
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Drawing mode: add point on click
    if (isDrawingRoom) {
      const coords = getCanvasCoords(e);
      let px = coords.x, py = coords.y;
      if (snapToGrid) { px = snapVal(px, gridSize); py = snapVal(py, gridSize); }
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

    const coords = getCanvasCoords(e);

    // Column placement mode
    if (placementMode === 'column' && roomShape === 'polygon' && roomPolygon.length >= 3) {
      let px = coords.x, py = coords.y;
      if (snapToGrid) { px = snapVal(px, gridSize); py = snapVal(py, gridSize); }
      const newCol: ColumnItem = {
        id: 'col-' + Date.now() + Math.random().toString(36).slice(2, 6),
        x: px, y: py, size: columnSize, shape: 'rect',
      };
      setColumns(prev => [...prev, newCol]);
      setSelectedColumn(newCol.id);
      return;
    }

    // Door/Window placement: click on wall edge
    if ((placementMode === 'door' || placementMode === 'window') && roomShape === 'polygon' && roomPolygon.length >= 3) {
      const nearest = findNearestEdge(coords);
      if (nearest && nearest.dist < 30 / zoom) {
        const a = roomPolygon[nearest.edgeIndex];
        const b = roomPolygon[(nearest.edgeIndex + 1) % roomPolygon.length];
        const wallLen = distancePP(a, b);
        const t = pointToSegment(coords, a, b).t;
        const markerWidth = placementMode === 'door' ? doorWidth : windowWidth;

        if (wallLen >= markerWidth + 10) {
          // Clamp t so the marker fits on the wall
          const halfT = (markerWidth / 2) / wallLen;
          const clampedT = Math.max(halfT + 0.01, Math.min(1 - halfT - 0.01, t));

          if (placementMode === 'door') {
            const newDoor: DoorMarker = {
              id: 'door-' + Date.now() + Math.random().toString(36).slice(2, 6),
              wallIndex: nearest.edgeIndex, pos: clampedT, width: doorWidth, swing: 'left',
            };
            setDoors(prev => [...prev, newDoor]);
            setSelectedDoor(newDoor.id);
          } else {
            const newWin: WindowMarker = {
              id: 'win-' + Date.now() + Math.random().toString(36).slice(2, 6),
              wallIndex: nearest.edgeIndex, pos: clampedT, width: windowWidth,
            };
            setWindows(prev => [...prev, newWin]);
            setSelectedWindow(newWin.id);
          }
        }
        return;
      }
    }

    // Check if clicking a polygon vertex (for dragging or selecting)
    if (roomShape === 'polygon' && roomPolygon.length >= 3 && activeTool === 'select' && placementMode === 'none') {
      for (let i = 0; i < roomPolygon.length; i++) {
        if (distancePP(coords, roomPolygon[i]) < 12 / zoom) {
          setDraggingVertex(i);
          setSelectedVertex(i);
          setSelectedId(null);
          setSelectedDoor(null);
          setSelectedWindow(null);
          setSelectedColumn(null);
          e.preventDefault();
          return;
        }
      }

      // Check if clicking on a column
      for (const col of columns) {
        const half = col.size / 2;
        if (coords.x >= col.x - half && coords.x <= col.x + half && coords.y >= col.y - half && coords.y <= col.y + half) {
          setSelectedColumn(col.id);
          setSelectedVertex(null);
          setSelectedId(null);
          setSelectedDoor(null);
          setSelectedWindow(null);
          e.stopPropagation();
          return;
        }
      }

      // Check if clicking near an edge to add a vertex (double-click is handled separately, single click on edge = add vertex)
      // Only in select mode with no placement mode
      const nearest = findNearestEdge(coords);
      if (nearest && nearest.dist < 8 / zoom && nearest.dist > 0) {
        // Check we're not too close to an existing vertex
        const nearestVertexDist = roomPolygon.reduce((min, p) => Math.min(min, distancePP(coords, p)), Infinity);
        if (nearestVertexDist > 20 / zoom) {
          let px = nearest.proj.x, py = nearest.proj.y;
          if (snapToGrid) { px = snapVal(px, gridSize); py = snapVal(py, gridSize); }
          addVertexToEdge(nearest.edgeIndex, { x: px, y: py });
          return;
        }
      }
    }

    // Deselect all
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('room-floor') || (e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).tagName === 'rect' || (e.target as HTMLElement).tagName === 'path') {
      setSelectedId(null);
      setSelectedVertex(null);
      setSelectedDoor(null);
      setSelectedWindow(null);
      setSelectedColumn(null);
      setPopupItem(null);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    const coords = getCanvasCoords(e);

    if (isDrawingRoom) {
      let px = coords.x, py = coords.y;
      if (snapToGrid) { px = snapVal(px, gridSize); py = snapVal(py, gridSize); }
      setMousePos({ x: px, y: py });
      return;
    }

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

    // Update mouse pos for placement preview
    if (placementMode !== 'none') {
      let px = coords.x, py = coords.y;
      if (snapToGrid) { px = snapVal(px, gridSize); py = snapVal(py, gridSize); }
      setMousePos({ x: px, y: py });
    }
  };

  const handleCanvasMouseUp = () => {
    if (draggingVertex !== null) { setDraggingVertex(null); return; }
    if (draggingId) { saveHistory(placedItems); setDraggingId(null); }
    setIsPanning(false);
  };

  const handleItemMouseDown = (e: React.MouseEvent, item: PlacedItem) => {
    e.stopPropagation();
    setSelectedVertex(null);
    setSelectedDoor(null);
    setSelectedWindow(null);
    setSelectedColumn(null);
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
    if (selectedColumn) { setColumns(prev => prev.filter(c => c.id !== selectedColumn)); setSelectedColumn(null); return; }
    if (selectedDoor) { setDoors(prev => prev.filter(d => d.id !== selectedDoor)); setSelectedDoor(null); return; }
    if (selectedWindow) { setWindows(prev => prev.filter(w => w.id !== selectedWindow)); setSelectedWindow(null); return; }
    if (selectedVertex !== null) { deleteSelectedVertex(); return; }
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

  // Keyboard handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isDrawingRoom) {
        if (e.key === 'Escape') cancelDrawingRoom();
        if (e.key === 'Enter') finishDrawingRoom();
        return;
      }
      if (e.key === 'Escape') {
        if (placementMode !== 'none') { setPlacementMode('none'); return; }
        setSelectedId(null); setSelectedVertex(null); setSelectedDoor(null); setSelectedWindow(null); setSelectedColumn(null); setPopupItem(null);
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected();
      }
      if (e.key === 'r' && !e.ctrlKey) rotateSelected();
      if (e.key === 'd' && e.ctrlKey) { e.preventDefault(); duplicateSelected(); }
      if (e.key === 'z' && e.ctrlKey) { e.preventDefault(); undo(); }
      if (e.key === 'y' && e.ctrlKey) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedId, selectedVertex, selectedDoor, selectedWindow, selectedColumn, placedItems, historyIndex, isDrawingRoom, drawingPoints, placementMode, roomPolygon, columns, doors, windows]);

  /* ─── PDF Export ─── */
  const exportPDF = useCallback(() => {
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = 297, pageH = 210;
    const margin = 15;
    const drawW = pageW - margin * 2, drawH = pageH - margin * 2 - 20; // 20mm for title

    // Determine scale
    const pts = roomShape === 'polygon' && roomPolygon.length >= 3 ? roomPolygon : [
      { x: 0, y: 0 }, { x: roomWidthCm, y: 0 }, { x: roomWidthCm, y: roomHeightCm }, { x: 0, y: roomHeightCm }
    ];
    const b = polygonBounds(pts);
    const scaleX = drawW / (b.w / 10); // cm → mm for PDF
    const scaleY = drawH / (b.h / 10);
    const scale = Math.min(scaleX, scaleY) * 0.85;
    const offX = margin + (drawW - (b.w / 10) * scale) / 2 - (b.minX / 10) * scale;
    const offY = margin + 15 + (drawH - (b.h / 10) * scale) / 2 - (b.minY / 10) * scale;

    const tx = (x: number) => offX + (x / 10) * scale;
    const ty = (y: number) => offY + (y / 10) * scale;

    // Title
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(project?.name || '2MC Gastro - Kat Plani', margin, margin + 6);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Alan: ${roomAreaM2}m² | Cevre: ${roomPerimeterM}m | Ekipman: ${totalItems} | Guc: ${totalKW.toFixed(1)}kW | Duvar: ${wallThickness}cm`, margin, margin + 12);

    // Scale bar
    const scaleBarM = 1; // 1 meter bar
    const scaleBarPx = (100 / 10) * scale; // 100cm = 1m → mm on page
    pdf.setLineWidth(0.5);
    pdf.setDrawColor(0);
    pdf.line(pageW - margin - scaleBarPx, pageH - margin + 3, pageW - margin, pageH - margin + 3);
    pdf.line(pageW - margin - scaleBarPx, pageH - margin + 1, pageW - margin - scaleBarPx, pageH - margin + 5);
    pdf.line(pageW - margin, pageH - margin + 1, pageW - margin, pageH - margin + 5);
    pdf.setFontSize(7);
    pdf.text(`${scaleBarM}m`, pageW - margin - scaleBarPx / 2, pageH - margin + 8, { align: 'center' });
    pdf.text(`Olcek: 1:${Math.round(1 / (scale / 10) * 100) / 100}`, pageW - margin - scaleBarPx / 2, pageH - margin + 12, { align: 'center' });

    // Draw walls
    pdf.setLineWidth(wallThickness / 10 * scale * 0.8);
    pdf.setDrawColor(40, 40, 40);
    pdf.setLineCap('square' as any);
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], nb = pts[(i + 1) % pts.length];
      // Check for doors/windows on this wall
      const wallDoors = doors.filter(d => d.wallIndex === i);
      const wallWindows = windows.filter(w => w.wallIndex === i);
      const wallLen = distancePP(a, nb);

      if (wallDoors.length === 0 && wallWindows.length === 0) {
        pdf.line(tx(a.x), ty(a.y), tx(nb.x), ty(nb.y));
      } else {
        // Sort all openings by position
        const openings = [
          ...wallDoors.map(d => ({ t: d.pos, halfW: (d.width / 2) / wallLen, type: 'door' as const, data: d })),
          ...wallWindows.map(w => ({ t: w.pos, halfW: (w.width / 2) / wallLen, type: 'window' as const, data: w })),
        ].sort((a, b) => a.t - b.t);

        let lastT = 0;
        for (const op of openings) {
          const startT = op.t - op.halfW;
          const endT = op.t + op.halfW;
          if (startT > lastT) {
            const s = wallPoint(a, nb, lastT);
            const e = wallPoint(a, nb, startT);
            pdf.line(tx(s.x), ty(s.y), tx(e.x), ty(e.y));
          }
          // Draw window symbol (two thin parallel lines)
          if (op.type === 'window') {
            const norm = wallNormal(a, nb);
            const mid = wallPoint(a, nb, op.t);
            const halfLen = op.data.width / 2;
            const dir = { x: (nb.x - a.x) / wallLen, y: (nb.y - a.y) / wallLen };
            const wt = wallThickness / 2;
            pdf.setLineWidth(0.3);
            // Two parallel lines for window
            for (const side of [-1, 1]) {
              const ox = norm.x * wt * side * 0.6;
              const oy = norm.y * wt * side * 0.6;
              pdf.line(
                tx(mid.x - dir.x * halfLen + ox), ty(mid.y - dir.y * halfLen + oy),
                tx(mid.x + dir.x * halfLen + ox), ty(mid.y + dir.y * halfLen + oy)
              );
            }
            pdf.setLineWidth(wallThickness / 10 * scale * 0.8);
          }
          // Draw door arc
          if (op.type === 'door') {
            const mid = wallPoint(a, nb, op.t);
            const doorHalf = op.data.width / 2;
            pdf.setLineWidth(0.3);
            const hingeT = op.data.swing === 'left' ? op.t - op.halfW : op.t + op.halfW;
            const hinge = wallPoint(a, nb, hingeT);
            const radius = op.data.width / 10 * scale;
            // Simple arc representation
            const norm = wallNormal(a, nb);
            const arcEnd = { x: hinge.x + norm.x * op.data.width, y: hinge.y + norm.y * op.data.width };
            pdf.line(tx(hinge.x), ty(hinge.y), tx(arcEnd.x), ty(arcEnd.y));
            // Draw quarter circle arc
            const cx = tx(hinge.x), cy = ty(hinge.y);
            const steps = 12;
            const startAngle = Math.atan2(ty(arcEnd.y) - cy, tx(arcEnd.x) - cx);
            const endPt = op.data.swing === 'left' ? wallPoint(a, nb, op.t + op.halfW) : wallPoint(a, nb, op.t - op.halfW);
            const endAngle = Math.atan2(ty(endPt.y) - cy, tx(endPt.x) - cx);
            for (let s = 0; s < steps; s++) {
              const a1 = startAngle + (endAngle - startAngle) * (s / steps);
              const a2 = startAngle + (endAngle - startAngle) * ((s + 1) / steps);
              pdf.line(
                cx + Math.cos(a1) * radius, cy + Math.sin(a1) * radius,
                cx + Math.cos(a2) * radius, cy + Math.sin(a2) * radius
              );
            }
            pdf.setLineWidth(wallThickness / 10 * scale * 0.8);
          }
          lastT = endT;
        }
        // Draw remaining wall after last opening
        if (lastT < 1) {
          const s = wallPoint(a, nb, lastT);
          pdf.line(tx(s.x), ty(s.y), tx(nb.x), ty(nb.y));
        }
      }
    }

    // Draw dimension labels
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(60, 60, 60);
    pdf.setLineWidth(0.15);
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], nb = pts[(i + 1) % pts.length];
      const len = distancePP(a, nb);
      if (len < 30) continue;
      const mx = (a.x + nb.x) / 2, my = (a.y + nb.y) / 2;
      pdf.text(`${(len / 100).toFixed(2)}m`, tx(mx), ty(my) - 2, { align: 'center' });
    }

    // Draw columns
    pdf.setFillColor(80, 80, 80);
    for (const col of columns) {
      const s = col.size / 10 * scale;
      if (col.shape === 'circle') {
        pdf.circle(tx(col.x), ty(col.y), s / 2, 'F');
      } else {
        pdf.rect(tx(col.x) - s / 2, ty(col.y) - s / 2, s, s, 'F');
      }
    }

    // Draw equipment items
    pdf.setFontSize(5);
    pdf.setFont('helvetica', 'normal');
    for (const item of placedItems) {
      const x = tx(item.x), y = ty(item.y);
      const w = item.width / 10 * scale, h = item.height / 10 * scale;
      pdf.setFillColor(240, 240, 240);
      pdf.setDrawColor(150, 150, 150);
      pdf.setLineWidth(0.2);
      pdf.rect(x, y, w, h, 'FD');
      pdf.setTextColor(60, 60, 60);
      // Truncate name to fit
      const maxChars = Math.floor(w / 1.5);
      const label = item.name.length > maxChars ? item.name.slice(0, maxChars) + '..' : item.name;
      pdf.text(label, x + w / 2, y + h / 2, { align: 'center', baseline: 'middle' });
      pdf.setFontSize(4);
      pdf.text(`${item.width}x${item.height}`, x + w / 2, y + h / 2 + 2.5, { align: 'center' });
      pdf.setFontSize(5);
    }

    // Date & footer
    pdf.setFontSize(6);
    pdf.setTextColor(150);
    pdf.text(`2MC Gastro | ${new Date().toLocaleDateString('tr-TR')} | Sayfa 1/1`, pageW / 2, pageH - 5, { align: 'center' });

    pdf.save(`${project?.name || '2MC-KatPlani'}-${new Date().toISOString().slice(0, 10)}.pdf`);
  }, [roomShape, roomPolygon, roomWidthCm, roomHeightCm, wallThickness, doors, windows, columns, placedItems, project, roomAreaM2, roomPerimeterM, totalItems, totalKW]);

  /* ─── Wall rendering helpers for SVG ─── */
  const renderWalls = useMemo(() => {
    const pts = roomShape === 'polygon' && roomPolygon.length >= 3 ? roomPolygon : null;
    if (!pts) return null;

    const elements: React.ReactNode[] = [];

    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      const wallLen = distancePP(a, b);
      if (wallLen < 1) continue;

      const wallDoors = doors.filter(d => d.wallIndex === i);
      const wallWindows = windows.filter(w => w.wallIndex === i);

      if (wallDoors.length === 0 && wallWindows.length === 0) {
        // Simple wall line
        elements.push(
          <line key={`wall-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke="#1e293b" strokeWidth={wallThickness} strokeLinecap="square" />
        );
      } else {
        // Wall with openings — sort all openings by position
        const openings = [
          ...wallDoors.map(d => ({ t: d.pos, halfW: (d.width / 2) / wallLen, type: 'door' as const, data: d })),
          ...wallWindows.map(w => ({ t: w.pos, halfW: (w.width / 2) / wallLen, type: 'window' as const, data: w })),
        ].sort((x, y) => x.t - y.t);

        let lastT = 0;
        openings.forEach((op, oi) => {
          const startT = Math.max(0, op.t - op.halfW);
          const endT = Math.min(1, op.t + op.halfW);

          // Wall segment before this opening
          if (startT > lastT + 0.001) {
            const s = wallPoint(a, b, lastT);
            const e = wallPoint(a, b, startT);
            elements.push(
              <line key={`wall-${i}-seg-${oi}`} x1={s.x} y1={s.y} x2={e.x} y2={e.y}
                stroke="#1e293b" strokeWidth={wallThickness} strokeLinecap="square" />
            );
          }

          // Render door symbol
          if (op.type === 'door') {
            const d = op.data as DoorMarker;
            const isSelected = selectedDoor === d.id;
            const norm = wallNormal(a, b);
            const hingeT = d.swing === 'left' ? startT : endT;
            const hinge = wallPoint(a, b, hingeT);
            const openEnd = { x: hinge.x + norm.x * d.width, y: hinge.y + norm.y * d.width };

            // Door line
            elements.push(
              <line key={`door-line-${d.id}`} x1={hinge.x} y1={hinge.y} x2={openEnd.x} y2={openEnd.y}
                stroke={isSelected ? '#2563eb' : '#475569'} strokeWidth={2} />
            );

            // Arc
            const otherT = d.swing === 'left' ? endT : startT;
            const otherPt = wallPoint(a, b, otherT);
            const radius = d.width;
            const sweepFlag = d.swing === 'left' ? 1 : 0;
            elements.push(
              <path key={`door-arc-${d.id}`}
                d={`M ${openEnd.x} ${openEnd.y} A ${radius} ${radius} 0 0 ${sweepFlag} ${otherPt.x} ${otherPt.y}`}
                fill="none" stroke={isSelected ? '#2563eb' : '#475569'} strokeWidth={1.5} strokeDasharray="4 2" />
            );

            // Clickable area
            elements.push(
              <circle key={`door-click-${d.id}`} cx={wallPoint(a, b, op.t).x} cy={wallPoint(a, b, op.t).y} r={12}
                fill="transparent" stroke="none" style={{ cursor: 'pointer' }}
                onClick={(e) => { e.stopPropagation(); setSelectedDoor(d.id); setSelectedWindow(null); setSelectedColumn(null); setSelectedVertex(null); setSelectedId(null); }} />
            );

            if (isSelected) {
              elements.push(
                <circle key={`door-sel-${d.id}`} cx={wallPoint(a, b, op.t).x} cy={wallPoint(a, b, op.t).y} r={8}
                  fill="none" stroke="#2563eb" strokeWidth={2} strokeDasharray="3 2" />
              );
            }
          }

          // Render window symbol
          if (op.type === 'window') {
            const w = op.data as WindowMarker;
            const isSelected = selectedWindow === w.id;
            const norm = wallNormal(a, b);
            const dir = { x: (b.x - a.x) / wallLen, y: (b.y - a.y) / wallLen };
            const mid = wallPoint(a, b, op.t);
            const halfL = w.width / 2;
            const wt = wallThickness / 2;

            // Two parallel lines (window symbol)
            for (const side of [-0.6, 0.6]) {
              const ox = norm.x * wt * side;
              const oy = norm.y * wt * side;
              elements.push(
                <line key={`win-${w.id}-${side}`}
                  x1={mid.x - dir.x * halfL + ox} y1={mid.y - dir.y * halfL + oy}
                  x2={mid.x + dir.x * halfL + ox} y2={mid.y + dir.y * halfL + oy}
                  stroke={isSelected ? '#2563eb' : '#0ea5e9'} strokeWidth={2.5} />
              );
            }
            // Center line
            elements.push(
              <line key={`win-center-${w.id}`}
                x1={mid.x - dir.x * halfL} y1={mid.y - dir.y * halfL}
                x2={mid.x + dir.x * halfL} y2={mid.y + dir.y * halfL}
                stroke={isSelected ? '#2563eb' : '#0ea5e9'} strokeWidth={0.5} />
            );

            // Clickable area
            elements.push(
              <circle key={`win-click-${w.id}`} cx={mid.x} cy={mid.y} r={12}
                fill="transparent" stroke="none" style={{ cursor: 'pointer' }}
                onClick={(e) => { e.stopPropagation(); setSelectedWindow(w.id); setSelectedDoor(null); setSelectedColumn(null); setSelectedVertex(null); setSelectedId(null); }} />
            );

            if (isSelected) {
              elements.push(
                <circle key={`win-sel-${w.id}`} cx={mid.x} cy={mid.y} r={8}
                  fill="none" stroke="#2563eb" strokeWidth={2} strokeDasharray="3 2" />
              );
            }
          }

          lastT = endT;
        });

        // Remaining wall segment
        if (lastT < 0.999) {
          const s = wallPoint(a, b, lastT);
          elements.push(
            <line key={`wall-${i}-end`} x1={s.x} y1={s.y} x2={b.x} y2={b.y}
              stroke="#1e293b" strokeWidth={wallThickness} strokeLinecap="square" />
          );
        }
      }
    }

    return elements;
  }, [roomShape, roomPolygon, wallThickness, doors, windows, selectedDoor, selectedWindow]);

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
            <button onClick={() => { setActiveTool('select'); setPlacementMode('none'); cancelDrawingRoom(); }} className={`p-1.5 rounded-md transition-all ${activeTool === 'select' && placementMode === 'none' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`} title="Sec (Esc)"><MousePointer2 size={15} /></button>
            <button onClick={() => { setActiveTool('pan'); setPlacementMode('none'); cancelDrawingRoom(); }} className={`p-1.5 rounded-md transition-all ${activeTool === 'pan' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`} title="Kaydir"><Hand size={15} /></button>
            <button onClick={startDrawingRoom} className={`p-1.5 rounded-md transition-all ${activeTool === 'draw' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`} title="Oda Ciz"><Pen size={15} /></button>
          </div>

          {/* Placement mode buttons */}
          {roomShape === 'polygon' && roomPolygon.length >= 3 && !isDrawingRoom && (
            <div className="flex bg-slate-100 rounded-lg p-0.5 mr-2">
              <button onClick={() => { setPlacementMode(placementMode === 'door' ? 'none' : 'door'); setActiveTool('select'); }}
                className={`p-1.5 rounded-md transition-all ${placementMode === 'door' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-400'}`} title="Kapi Ekle">
                <DoorOpen size={15} />
              </button>
              <button onClick={() => { setPlacementMode(placementMode === 'window' ? 'none' : 'window'); setActiveTool('select'); }}
                className={`p-1.5 rounded-md transition-all ${placementMode === 'window' ? 'bg-white shadow-sm text-sky-600' : 'text-slate-400'}`} title="Pencere Ekle">
                <PanelTop size={15} />
              </button>
              <button onClick={() => { setPlacementMode(placementMode === 'column' ? 'none' : 'column'); setActiveTool('select'); }}
                className={`p-1.5 rounded-md transition-all ${placementMode === 'column' ? 'bg-white shadow-sm text-stone-600' : 'text-slate-400'}`} title="Kolon Ekle">
                <Columns3 size={15} />
              </button>
            </div>
          )}

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

          {!isDrawingRoom && placementMode !== 'none' && (
            <div className="flex items-center gap-1 mr-2">
              <span className="text-[10px] font-bold px-2 py-1 rounded" style={{
                color: placementMode === 'door' ? '#c2410c' : placementMode === 'window' ? '#0369a1' : '#57534e',
                backgroundColor: placementMode === 'door' ? '#fff7ed' : placementMode === 'window' ? '#f0f9ff' : '#fafaf9',
              }}>
                {placementMode === 'door' ? 'Duvara tiklayarak kapi yerlestirin' : placementMode === 'window' ? 'Duvara tiklayarak pencere yerlestirin' : 'Tiklayarak kolon yerlestirin'}
              </span>
              <button onClick={() => setPlacementMode('none')} className="px-2 py-1 text-[10px] font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded transition-colors">Iptal</button>
            </div>
          )}

          {!isDrawingRoom && placementMode === 'none' && (
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
              <button onClick={deleteSelected} disabled={!selectedId && selectedVertex === null && !selectedDoor && !selectedWindow && !selectedColumn} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md disabled:opacity-30"><Trash2 size={15} /></button>
              <div className="w-px h-5 bg-slate-200 mx-1" />
              <button onClick={() => setShowGrid(!showGrid)} className={`p-1.5 rounded-md ${showGrid ? 'text-primary bg-primary/10' : 'text-slate-400'}`}><Grid3x3 size={15} /></button>
              <button onClick={() => setSnapToGrid(!snapToGrid)} className={`p-1.5 rounded-md ${snapToGrid ? 'text-primary bg-primary/10' : 'text-slate-400'}`}><Magnet size={15} /></button>
              <div className="w-px h-5 bg-slate-200 mx-1" />
              <button onClick={exportPDF} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md" title="PDF Cikti Al"><FileDown size={15} /></button>
            </>
          )}

          <div className="flex-1" />
          <button onClick={zoomOut} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"><Minus size={15} /></button>
          <span className="text-[10px] font-mono font-bold text-slate-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={zoomIn} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"><Plus size={15} /></button>
          <button onClick={zoomFit} className="ml-1 px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-primary hover:bg-slate-100 rounded-md">FIT</button>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 overflow-hidden relative"
          style={{ cursor: isDrawingRoom ? 'crosshair' : placementMode !== 'none' ? 'crosshair' : activeTool === 'pan' || isPanning ? 'grab' : draggingVertex !== null ? 'move' : 'default' }}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleCanvasDrop}
        >
          <div style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`, transformOrigin: '0 0', position: 'absolute', willChange: 'transform' }}>
            <svg ref={svgRef} width={renderSVGWidth} height={renderSVGHeight} className="overflow-visible">

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
                  <rect x={0} y={0} width={roomWidthCm} height={roomHeightCm} fill="#ffffff" stroke="#1e293b" strokeWidth={wallThickness} className="room-floor" />
                  <text x={roomWidthCm / 2} y={-12} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#475569" fontFamily="monospace">{(roomWidthCm / 100).toFixed(1)}m</text>
                  <text x={roomWidthCm + 20} y={roomHeightCm / 2} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#475569" fontFamily="monospace" transform={`rotate(90 ${roomWidthCm + 20} ${roomHeightCm / 2})`}>{(roomHeightCm / 100).toFixed(1)}m</text>
                </>
              ) : roomPolygon.length >= 3 ? (
                <>
                  {/* Floor fill */}
                  <path d={polygonSVGPath(roomPolygon)} fill="#ffffff" stroke="none" className="room-floor" />

                  {/* Thick walls */}
                  {renderWalls}

                  {/* Columns */}
                  {columns.map(col => {
                    const isSelected = selectedColumn === col.id;
                    return (
                      <g key={col.id}>
                        {col.shape === 'circle' ? (
                          <circle cx={col.x} cy={col.y} r={col.size / 2}
                            fill="#475569" stroke={isSelected ? '#2563eb' : '#1e293b'} strokeWidth={isSelected ? 3 : 1.5} />
                        ) : (
                          <rect x={col.x - col.size / 2} y={col.y - col.size / 2} width={col.size} height={col.size}
                            fill="#475569" stroke={isSelected ? '#2563eb' : '#1e293b'} strokeWidth={isSelected ? 3 : 1.5} />
                        )}
                        {isSelected && (
                          <circle cx={col.x} cy={col.y} r={col.size / 2 + 6}
                            fill="none" stroke="#2563eb" strokeWidth={1.5} strokeDasharray="4 3" />
                        )}
                        <rect x={col.x - col.size / 2 - 4} y={col.y - col.size / 2 - 4} width={col.size + 8} height={col.size + 8}
                          fill="transparent" stroke="none" style={{ cursor: 'pointer' }}
                          onClick={(e) => { e.stopPropagation(); setSelectedColumn(col.id); setSelectedDoor(null); setSelectedWindow(null); setSelectedVertex(null); setSelectedId(null); }} />
                      </g>
                    );
                  })}

                  {/* Wall dimension labels */}
                  {roomPolygon.map((p, i) => {
                    const next = roomPolygon[(i + 1) % roomPolygon.length];
                    return <WallLabel key={`wall-${i}`} a={p} b={next} zoom={zoom} wallIndex={i} onLengthChange={handleWallLengthChange} />;
                  })}

                  {/* Vertex handles (draggable + selectable) */}
                  {!isDrawingRoom && roomPolygon.map((p, i) => (
                    <circle
                      key={`v-${i}`}
                      cx={p.x} cy={p.y} r={6 / zoom}
                      fill={selectedVertex === i ? '#1d4ed8' : draggingVertex === i ? '#1d4ed8' : '#ffffff'}
                      stroke={selectedVertex === i ? '#1d4ed8' : '#1d4ed8'}
                      strokeWidth={selectedVertex === i ? 3 / zoom : 2 / zoom}
                      style={{ cursor: 'move' }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setDraggingVertex(i);
                        setSelectedVertex(i);
                        setSelectedId(null);
                        setSelectedDoor(null);
                        setSelectedWindow(null);
                        setSelectedColumn(null);
                      }}
                    />
                  ))}

                  {/* Selected vertex highlight */}
                  {selectedVertex !== null && selectedVertex < roomPolygon.length && (
                    <circle
                      cx={roomPolygon[selectedVertex].x} cy={roomPolygon[selectedVertex].y}
                      r={12 / zoom} fill="none" stroke="#1d4ed8" strokeWidth={1.5 / zoom} strokeDasharray={`${4 / zoom} ${3 / zoom}`}
                    />
                  )}
                </>
              ) : null}

              {/* Drawing preview */}
              {isDrawingRoom && drawingPoints.length > 0 && (
                <>
                  <polyline
                    points={[...drawingPoints, mousePos].map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none" stroke="#10b981" strokeWidth={2} strokeDasharray="6 3"
                  />
                  {drawingPoints.length >= 3 && (
                    <polygon
                      points={drawingPoints.map(p => `${p.x},${p.y}`).join(' ')}
                      fill="#10b98120" stroke="none"
                    />
                  )}
                  {drawingPoints.map((p, i) => (
                    <circle key={`dp-${i}`} cx={p.x} cy={p.y} r={5 / zoom}
                      fill={i === 0 && drawingPoints.length >= 3 ? '#10b981' : '#ffffff'}
                      stroke="#10b981" strokeWidth={2 / zoom}
                    />
                  ))}
                  {drawingPoints.length >= 3 && distancePP(mousePos, drawingPoints[0]) < 20 / zoom && (
                    <circle cx={drawingPoints[0].x} cy={drawingPoints[0].y} r={12 / zoom} fill="none" stroke="#10b981" strokeWidth={2 / zoom} strokeDasharray="4 2" />
                  )}
                  <circle cx={mousePos.x} cy={mousePos.y} r={4 / zoom} fill="#10b981" opacity={0.6} />
                  <text x={mousePos.x + 12} y={mousePos.y - 8} fontSize={9 / zoom} fill="#10b981" fontWeight="bold" fontFamily="monospace">
                    ({Math.round(mousePos.x)}, {Math.round(mousePos.y)})
                  </text>
                  {drawingPoints.length > 0 && (
                    <text x={(mousePos.x + drawingPoints[drawingPoints.length - 1].x) / 2} y={(mousePos.y + drawingPoints[drawingPoints.length - 1].y) / 2 - 8} fontSize={9 / zoom} fill="#059669" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                      {(distancePP(mousePos, drawingPoints[drawingPoints.length - 1]) / 100).toFixed(2)}m
                    </text>
                  )}
                </>
              )}

              {/* Column placement preview */}
              {placementMode === 'column' && (
                <rect x={mousePos.x - columnSize / 2} y={mousePos.y - columnSize / 2} width={columnSize} height={columnSize}
                  fill="#47556950" stroke="#475569" strokeWidth={1.5} strokeDasharray="4 2" />
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
          <span>Alan: {roomAreaM2}m²</span>
          <span>Cevre: {roomPerimeterM}m</span>
          <span>Duvar: {wallThickness}cm</span>
          <span>Ekipman: {totalItems} ({equipmentAreaM2}m²)</span>
          <span>Guc: {totalKW.toFixed(1)} kW</span>
          {totalPrice > 0 && <span>Toplam: {formatPrice(totalPrice)}</span>}
          {doors.length > 0 && <span>Kapi: {doors.length}</span>}
          {windows.length > 0 && <span>Pencere: {windows.length}</span>}
          {columns.length > 0 && <span>Kolon: {columns.length}</span>}
          <span className="ml-auto">{Math.round(zoom * 100)}%</span>
        </div>
      </div>

      {/* Right Panel */}
      <aside className="w-80 xl:w-96 bg-white border-l border-slate-200 flex flex-col shrink-0 hidden md:flex" style={{ height: 'calc(100vh - 4rem)' }}>
        <div className="flex border-b border-slate-200 shrink-0">
          <button onClick={() => setRightPanelTab('catalog')} className={`flex-1 py-2.5 text-xs font-bold text-center transition-all ${rightPanelTab === 'catalog' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-400 hover:text-slate-600'}`}>Ekipman</button>
          <button onClick={() => setRightPanelTab('architecture')} className={`flex-1 py-2.5 text-xs font-bold text-center transition-all ${rightPanelTab === 'architecture' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-400 hover:text-slate-600'}`}>Mimari</button>
          <button onClick={() => setRightPanelTab('properties')} className={`flex-1 py-2.5 text-xs font-bold text-center transition-all ${rightPanelTab === 'properties' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-400 hover:text-slate-600'}`}>Ozellikler</button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* ─── Architecture Panel ─── */}
          {rightPanelTab === 'architecture' && (
            <div className="p-3 space-y-3">
              {/* Room shape controls */}
              <div className="p-3 bg-slate-50 rounded-lg space-y-3">
                <h4 className="text-[10px] font-black uppercase text-slate-500">Oda Sekli</h4>
                <div className="flex gap-2">
                  <button onClick={switchToRectangle}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all ${roomShape === 'rectangle' ? 'bg-primary text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-primary/30'}`}>
                    <Square size={12} /> Dikdortgen
                  </button>
                  <button onClick={startDrawingRoom}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all ${roomShape === 'polygon' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-emerald-300'}`}>
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
                        <div className="text-sm font-black text-primary">{roomAreaM2}m²</div>
                      </div>
                      <div className="bg-white rounded-lg p-2 border border-slate-200">
                        <div className="text-[8px] font-bold text-slate-400 uppercase">Cevre</div>
                        <div className="text-sm font-black text-primary">{roomPerimeterM}m</div>
                      </div>
                    </div>
                    <div className="text-[9px] text-slate-400">
                      {roomPolygon.length} kose — kenarlara tiklayarak nokta ekleyin, secip Delete ile silin
                    </div>
                    <button onClick={startDrawingRoom} className="w-full py-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center justify-center gap-1 transition-all">
                      <RotateCcw size={11} /> Yeniden Ciz
                    </button>
                  </div>
                )}
              </div>

              {/* Wall Thickness */}
              <div className="p-3 bg-slate-50 rounded-lg space-y-2">
                <h4 className="text-[10px] font-black uppercase text-slate-500">Duvar Kalinligi</h4>
                <div className="flex items-center gap-2">
                  <input type="range" min={5} max={60} value={wallThickness}
                    onChange={(e) => setWallThickness(Number(e.target.value))}
                    className="flex-1 h-1.5 accent-slate-600" />
                  <div className="flex items-center gap-1">
                    <input type="number" value={wallThickness} min={5} max={60}
                      onChange={(e) => setWallThickness(Math.max(5, Math.min(60, Number(e.target.value))))}
                      className="w-14 px-2 py-1 text-xs font-bold border border-slate-200 rounded-md text-center outline-none focus:ring-2 focus:ring-primary" />
                    <span className="text-[9px] text-slate-400 font-bold">cm</span>
                  </div>
                </div>
              </div>

              {/* Doors */}
              <div className="p-3 bg-slate-50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase text-slate-500">Kapilar ({doors.length})</h4>
                  <button onClick={() => { setPlacementMode(placementMode === 'door' ? 'none' : 'door'); setActiveTool('select'); }}
                    className={`px-2 py-1 text-[10px] font-bold rounded-lg flex items-center gap-1 transition-all ${placementMode === 'door' ? 'bg-orange-500 text-white' : 'bg-white text-orange-600 border border-orange-200 hover:bg-orange-50'}`}>
                    <DoorOpen size={11} /> {placementMode === 'door' ? 'Yerlestiriliyor...' : 'Kapi Ekle'}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[9px] font-bold text-slate-400">Genislik:</label>
                  <input type="number" value={doorWidth} min={40} max={200}
                    onChange={(e) => setDoorWidth(Math.max(40, Math.min(200, Number(e.target.value))))}
                    className="w-16 px-2 py-1 text-xs font-bold border border-slate-200 rounded-md text-center outline-none" />
                  <span className="text-[9px] text-slate-400">cm</span>
                </div>
                {doors.map(d => (
                  <div key={d.id} className={`flex items-center justify-between p-2 rounded-lg text-[10px] ${selectedDoor === d.id ? 'bg-blue-50 border border-blue-200' : 'bg-white border border-slate-200'}`}
                    onClick={() => { setSelectedDoor(d.id); setSelectedWindow(null); setSelectedColumn(null); }}>
                    <span className="font-bold text-slate-600"><DoorOpen size={10} className="inline mr-1" />Duvar {d.wallIndex + 1} — {d.width}cm</span>
                    <div className="flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); setDoors(prev => prev.map(x => x.id === d.id ? { ...x, swing: x.swing === 'left' ? 'right' : 'left' } : x)); }}
                        className="px-1.5 py-0.5 text-[9px] bg-slate-100 hover:bg-slate-200 rounded">{d.swing === 'left' ? 'Sol' : 'Sag'}</button>
                      <button onClick={(e) => { e.stopPropagation(); setDoors(prev => prev.filter(x => x.id !== d.id)); if (selectedDoor === d.id) setSelectedDoor(null); }}
                        className="px-1.5 py-0.5 text-[9px] text-red-500 bg-red-50 hover:bg-red-100 rounded">Sil</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Windows */}
              <div className="p-3 bg-slate-50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase text-slate-500">Pencereler ({windows.length})</h4>
                  <button onClick={() => { setPlacementMode(placementMode === 'window' ? 'none' : 'window'); setActiveTool('select'); }}
                    className={`px-2 py-1 text-[10px] font-bold rounded-lg flex items-center gap-1 transition-all ${placementMode === 'window' ? 'bg-sky-500 text-white' : 'bg-white text-sky-600 border border-sky-200 hover:bg-sky-50'}`}>
                    <PanelTop size={11} /> {placementMode === 'window' ? 'Yerlestiriliyor...' : 'Pencere Ekle'}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[9px] font-bold text-slate-400">Genislik:</label>
                  <input type="number" value={windowWidth} min={40} max={300}
                    onChange={(e) => setWindowWidth(Math.max(40, Math.min(300, Number(e.target.value))))}
                    className="w-16 px-2 py-1 text-xs font-bold border border-slate-200 rounded-md text-center outline-none" />
                  <span className="text-[9px] text-slate-400">cm</span>
                </div>
                {windows.map(w => (
                  <div key={w.id} className={`flex items-center justify-between p-2 rounded-lg text-[10px] ${selectedWindow === w.id ? 'bg-blue-50 border border-blue-200' : 'bg-white border border-slate-200'}`}
                    onClick={() => { setSelectedWindow(w.id); setSelectedDoor(null); setSelectedColumn(null); }}>
                    <span className="font-bold text-slate-600"><PanelTop size={10} className="inline mr-1" />Duvar {w.wallIndex + 1} — {w.width}cm</span>
                    <button onClick={(e) => { e.stopPropagation(); setWindows(prev => prev.filter(x => x.id !== w.id)); if (selectedWindow === w.id) setSelectedWindow(null); }}
                      className="px-1.5 py-0.5 text-[9px] text-red-500 bg-red-50 hover:bg-red-100 rounded">Sil</button>
                  </div>
                ))}
              </div>

              {/* Columns */}
              <div className="p-3 bg-slate-50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase text-slate-500">Kolonlar ({columns.length})</h4>
                  <button onClick={() => { setPlacementMode(placementMode === 'column' ? 'none' : 'column'); setActiveTool('select'); }}
                    className={`px-2 py-1 text-[10px] font-bold rounded-lg flex items-center gap-1 transition-all ${placementMode === 'column' ? 'bg-stone-500 text-white' : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'}`}>
                    <Columns3 size={11} /> {placementMode === 'column' ? 'Yerlestiriliyor...' : 'Kolon Ekle'}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[9px] font-bold text-slate-400">Boyut:</label>
                  <input type="number" value={columnSize} min={10} max={100}
                    onChange={(e) => setColumnSize(Math.max(10, Math.min(100, Number(e.target.value))))}
                    className="w-16 px-2 py-1 text-xs font-bold border border-slate-200 rounded-md text-center outline-none" />
                  <span className="text-[9px] text-slate-400">cm</span>
                </div>
                {columns.map(col => (
                  <div key={col.id} className={`flex items-center justify-between p-2 rounded-lg text-[10px] ${selectedColumn === col.id ? 'bg-blue-50 border border-blue-200' : 'bg-white border border-slate-200'}`}
                    onClick={() => { setSelectedColumn(col.id); setSelectedDoor(null); setSelectedWindow(null); }}>
                    <span className="font-bold text-slate-600"><Columns3 size={10} className="inline mr-1" />{col.size}x{col.size}cm ({Math.round(col.x)}, {Math.round(col.y)})</span>
                    <div className="flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); setColumns(prev => prev.map(c => c.id === col.id ? { ...c, shape: c.shape === 'rect' ? 'circle' : 'rect' } : c)); }}
                        className="px-1.5 py-0.5 text-[9px] bg-slate-100 hover:bg-slate-200 rounded">{col.shape === 'rect' ? '⬜' : '⬤'}</button>
                      <button onClick={(e) => { e.stopPropagation(); setColumns(prev => prev.filter(c => c.id !== col.id)); if (selectedColumn === col.id) setSelectedColumn(null); }}
                        className="px-1.5 py-0.5 text-[9px] text-red-500 bg-red-50 hover:bg-red-100 rounded">Sil</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* PDF Export */}
              <div className="p-3 bg-slate-50 rounded-lg">
                <button onClick={exportPDF}
                  className="w-full py-2.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm">
                  <FileDown size={14} /> PDF Cikti Al (A4 Yatay)
                </button>
                <p className="text-[9px] text-slate-400 mt-1.5 text-center">Olcekli plan, ekipman listesi ve boyutlarla</p>
              </div>
            </div>
          )}

          {/* ─── Catalog Panel ─── */}
          {rightPanelTab === 'catalog' && (
            <div className="p-3 space-y-3">
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

          {/* ─── Properties Panel ─── */}
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
            <div><div className="text-[8px] font-bold text-slate-400 uppercase">Alan</div><div className="text-sm font-black text-primary">{roomAreaM2}m²</div></div>
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
    </div>
  );
}
