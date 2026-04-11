import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export default function Logo3DBackground({ className = '', src = '/models/2mc-logo.glb' }: { className?: string; src?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020817, 0.015);

    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const key = new THREE.DirectionalLight(0x88bbff, 2.2);
    key.position.set(5, 5, 8);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x4466ff, 1.6);
    rim.position.set(-6, -2, -4);
    scene.add(rim);
    const fill = new THREE.PointLight(0x00aaff, 1.5, 50);
    fill.position.set(0, 0, 6);
    scene.add(fill);

    // Bloom
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.9, 0.5, 0.2);
    composer.addPass(bloom);

    let model: THREE.Object3D | null = null;
    let disposed = false;

    const loader = new GLTFLoader();
    loader.load(
      src,
      (gltf) => {
        if (disposed) return;
        model = gltf.scene;
        // Center & scale
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const scale = 4.5 / maxDim;
        model.scale.setScalar(scale);
        scene.add(model);
      },
      undefined,
      (err) => console.error('Logo3D load error:', err)
    );

    const clock = new THREE.Clock();
    let raf = 0;
    const animate = () => {
      if (disposed) return;
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      if (model) {
        model.rotation.y = t * 0.35;
        model.rotation.x = Math.sin(t * 0.4) * 0.15;
        model.position.y = Math.sin(t * 0.6) * 0.15;
      }
      composer.render();
    };
    animate();

    const onResize = () => {
      const ww = container.clientWidth || window.innerWidth;
      const hh = container.clientHeight || window.innerHeight;
      camera.aspect = ww / hh;
      camera.updateProjectionMatrix();
      renderer.setSize(ww, hh);
      composer.setSize(ww, hh);
    };
    window.addEventListener('resize', onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    };
  }, [src]);

  return <div ref={ref} className={className} aria-hidden="true" />;
}
