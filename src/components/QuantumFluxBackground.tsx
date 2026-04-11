import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// "Quantum Flux Sphere" — exact port of the provided HTML reference.
export default function QuantumFluxBackground({
  className = '',
  count = 20000,
  autoSpin = true,
  speedMult = 1,
}: { className?: string; count?: number; autoSpin?: boolean; speedMult?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const w = () => container.clientWidth || window.innerWidth;
    const h = () => container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.01);

    const camera = new THREE.PerspectiveCamera(60, w() / h(), 0.1, 2000);
    camera.position.set(0, 0, 100);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w(), h());
    renderer.setClearColor(0x000000, 1);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.autoRotate = autoSpin;
    controls.autoRotateSpeed = 2.0;

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(w(), h()), 1.5, 0.4, 0.85);
    bloomPass.strength = 1.8;
    bloomPass.radius = 0.4;
    bloomPass.threshold = 0;
    composer.addPass(bloomPass);

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    const target = new THREE.Vector3();

    const geometry = new THREE.TetrahedronGeometry(0.25);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(instancedMesh);

    const positions: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      positions.push(new THREE.Vector3((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100));
      instancedMesh.setColorAt(i, color.setHex(0x00ff88));
    }

    const PARAMS = { scale: 60, twist: 3, flow: 1.2, chaos: 0.6 };
    const clock = new THREE.Clock();
    let raf = 0;
    let disposed = false;

    function animate() {
      if (disposed) return;
      raf = requestAnimationFrame(animate);
      const time = clock.getElapsedTime() * speedMult;
      controls.update();

      for (let i = 0; i < count; i++) {
        const { scale, twist, flow, chaos } = PARAMS;
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
        target.set(x, y, z);

        const hue = (p + t * 0.05 + wave * 0.1) % 1.0;
        const sat = 0.7 + 0.3 * Math.sin(phi * 2.0 + t);
        const light = 0.5 + 0.25 * wave;
        color.setHSL(hue, sat, light);

        positions[i].lerp(target, 0.1);
        dummy.position.copy(positions[i]);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
        instancedMesh.setColorAt(i, color);
      }
      instancedMesh.instanceMatrix.needsUpdate = true;
      if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;

      composer.render();
    }
    animate();

    const onResize = () => {
      camera.aspect = w() / h();
      camera.updateProjectionMatrix();
      renderer.setSize(w(), h());
      composer.setSize(w(), h());
    };
    window.addEventListener('resize', onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      geometry.dispose();
      material.dispose();
      scene.remove(instancedMesh);
      renderer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    };
  }, [count, autoSpin, speedMult]);

  return <div ref={ref} className={className} aria-hidden="true" />;
}