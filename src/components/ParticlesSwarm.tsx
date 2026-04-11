import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

function sampleTextPoints(text: string, count: number): THREE.Vector3[] {
  const cvs = document.createElement('canvas');
  const W = 1400, H = 300;
  cvs.width = W; cvs.height = H;
  const ctx = cvs.getContext('2d')!;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fff';
  let fontSize = 200;
  ctx.font = `bold ${fontSize}px system-ui, Arial, sans-serif`;
  while (ctx.measureText(text).width > W - 60 && fontSize > 20) {
    fontSize -= 5;
    ctx.font = `bold ${fontSize}px system-ui, Arial, sans-serif`;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, W / 2, H / 2);

  const data = ctx.getImageData(0, 0, W, H).data;
  const pts: [number, number][] = [];
  for (let y = 0; y < H; y += 2) {
    for (let x = 0; x < W; x += 2) {
      if (data[(y * W + x) * 4] > 128) pts.push([x, y]);
    }
  }
  const scaleX = 0.13, scaleY = 0.13;
  const targets: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const p = pts[Math.floor(Math.random() * pts.length)] || [W / 2, H / 2];
    const x = (p[0] - W / 2) * scaleX;
    const y = -(p[1] - H / 2) * scaleY;
    const z = (Math.random() - 0.5) * 4;
    targets.push(new THREE.Vector3(x, y, z));
  }
  return targets;
}

class ParticlesSwarm {
  count: number;
  container: HTMLElement;
  speedMult = 0.4;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  composer: EffectComposer;
  dummy = new THREE.Object3D();
  target = new THREE.Vector3();
  pColor = new THREE.Color();
  geometry: THREE.ConeGeometry;
  material: THREE.MeshBasicMaterial;
  mesh: THREE.InstancedMesh;
  positions: THREE.Vector3[] = [];
  clock = new THREE.Clock();
  rafId = 0;
  disposed = false;
  onResize: () => void;

  texts = ['2MC Gastro', 'Para Mı ver !', 'Euro Olarak Ama', 'Şaka Şaka'];
  textIndex = 0;
  textTargets: THREE.Vector3[];
  phase: 'flux' | 'forming' | 'hold' | 'dispersing' = 'flux';
  phaseStart = performance.now() / 1000;
  fluxDuration = 3;
  formDuration = 1.5;
  holdDuration = 5;
  disperseDuration = 1.5;

  constructor(container: HTMLElement, count = 12000) {
    this.count = count;
    this.container = container;

    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x000000, 0.008);
    this.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 2000);
    this.camera.position.set(0, 0, 180);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    this.renderer.setClearColor(0x000000, 0);
    container.appendChild(this.renderer.domElement);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer.addPass(new UnrealBloomPass(new THREE.Vector2(w, h), 1.6, 0.5, 0.0));

    this.geometry = new THREE.ConeGeometry(0.1, 0.5, 4).rotateX(Math.PI / 2) as THREE.ConeGeometry;
    this.material = new THREE.MeshBasicMaterial({ color: 0x00aaff });
    this.mesh = new THREE.InstancedMesh(this.geometry, this.material, this.count);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.scene.add(this.mesh);

    const c = new THREE.Color();
    for (let i = 0; i < this.count; i++) {
      this.positions.push(new THREE.Vector3((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100));
      this.mesh.setColorAt(i, c.setHex(0x00ff88));
    }

    this.textTargets = sampleTextPoints(this.texts[0], this.count);

    this.onResize = () => {
      const ww = container.clientWidth || window.innerWidth;
      const hh = container.clientHeight || window.innerHeight;
      this.camera.aspect = ww / hh;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(ww, hh);
      this.composer.setSize(ww, hh);
    };
    window.addEventListener('resize', this.onResize);

    this.animate = this.animate.bind(this);
    this.animate();
  }

  computeFluxTarget(i: number, time: number) {
    const count = this.count;
    const scale = 60, twist = 3, flow = 1.2, chaos = 0.6;
    const t = time * flow;
    const p = i / count;
    const phi = Math.acos(1.0 - 2.0 * p);
    const theta = Math.PI * 2.0 * p * Math.sqrt(count);
    const wave = Math.sin(theta * twist + t) * 0.5 + Math.cos(phi * twist - t) * 0.5;
    const radius = scale * (1.0 + wave * 0.3);
    const cx = Math.sin(phi * 6.0 + t * 1.3) * chaos;
    const cy = Math.cos(theta * 4.0 - t * 1.1) * chaos;
    const cz = Math.sin(theta * 3.0 + phi * 2.0 + t) * chaos;
    const x = Math.sin(phi) * Math.cos(theta) * radius + cx * 10.0;
    const y = Math.sin(phi) * Math.sin(theta) * radius + cy * 10.0;
    const z = Math.cos(phi) * radius + cz * 10.0;
    this.target.set(x, y, z);
    return { wave, p, phi, t };
  }

  animate() {
    if (this.disposed) return;
    this.rafId = requestAnimationFrame(this.animate);
    const time = this.clock.getElapsedTime() * this.speedMult;
    const now = performance.now() / 1000;
    const elapsed = now - this.phaseStart;

    if (this.phase === 'flux' && elapsed > this.fluxDuration) {
      this.phase = 'forming'; this.phaseStart = now;
    } else if (this.phase === 'forming' && elapsed > this.formDuration) {
      this.phase = 'hold'; this.phaseStart = now;
    } else if (this.phase === 'hold' && elapsed > this.holdDuration) {
      this.phase = 'dispersing'; this.phaseStart = now;
    } else if (this.phase === 'dispersing' && elapsed > this.disperseDuration) {
      this.phase = 'flux'; this.phaseStart = now;
      this.textIndex = (this.textIndex + 1) % this.texts.length;
      this.textTargets = sampleTextPoints(this.texts[this.textIndex], this.count);
    }

    let blend = 0;
    const e = now - this.phaseStart;
    if (this.phase === 'forming') blend = Math.min(1, e / this.formDuration);
    else if (this.phase === 'hold') blend = 1;
    else if (this.phase === 'dispersing') blend = Math.max(0, 1 - e / this.disperseDuration);
    const eb = blend * blend * (3 - 2 * blend);
    const lerpSpeed = (this.phase === 'forming' || this.phase === 'dispersing') ? 0.18 : 0.12;

    for (let i = 0; i < this.count; i++) {
      const info = this.computeFluxTarget(i, time);
      if (eb > 0.001) this.target.lerp(this.textTargets[i], eb);

      const hue = (info.p + info.t * 0.05 + info.wave * 0.1) % 1.0;
      const sat = 0.7 + 0.3 * Math.sin(info.phi * 2.0 + info.t);
      const light = 0.5 + 0.25 * info.wave;
      this.pColor.setHSL(hue, sat, light);

      this.positions[i].lerp(this.target, lerpSpeed);
      this.dummy.position.copy(this.positions[i]);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(i, this.dummy.matrix);
      this.mesh.setColorAt(i, this.pColor);
    }

    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;

    this.scene.rotation.y += 0.006;
    this.composer.render();
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.onResize);
    this.geometry.dispose();
    this.material.dispose();
    this.scene.remove(this.mesh);
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}

export default function ParticlesSwarmBackground({ className = '', count = 12000 }: { className?: string; count?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const swarm = new ParticlesSwarm(ref.current, count);
    return () => swarm.dispose();
  }, [count]);
  return <div ref={ref} className={className} aria-hidden="true" />;
}
