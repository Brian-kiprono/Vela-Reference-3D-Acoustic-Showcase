import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import type { BoxItemId, ProductFinish } from '../data/finishes';
import { buildProductRig, type ProductRig } from '../three/headphoneModel';
import { createContactShadowTexture } from '../three/proceduralTextures';

interface HeroCanvas3DProps {
  finish: ProductFinish;
  engraving: string;
  activeBoxItem: BoxItemId;
  exploded: boolean;
  autoShowcase: boolean;
  resetTrigger: number;
}

// Pre-allocated math helpers (zero GC inside animation loop)
const _targetShellColor = new THREE.Color();
const _targetMetalColor = new THREE.Color();
const _targetCushionColor = new THREE.Color();
const _targetCanopyColor = new THREE.Color();
const _targetAccentColor = new THREE.Color();
const _targetKeyColor = new THREE.Color();
const _targetRimColor = new THREE.Color();

export function HeroCanvas3D({
  finish,
  engraving,
  activeBoxItem,
  exploded,
  autoShowcase,
  resetTrigger,
}: HeroCanvas3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [contextLost, setContextLost] = useState(false);

  // Mutable refs so React UI updates never tear down WebGL
  const stateRef = useRef({
    finish,
    engraving,
    activeBoxItem,
    exploded,
    autoShowcase,
    pointerX: 0,
    pointerY: 0,
  });

  stateRef.current.finish = finish;
  stateRef.current.engraving = engraving;
  stateRef.current.activeBoxItem = activeBoxItem;
  stateRef.current.exploded = exploded;
  stateRef.current.autoShowcase = autoShowcase;

  const rigRef = useRef<ProductRig | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Update dynamic engraving texture when text or finish changes
  useEffect(() => {
    const rig = rigRef.current;
    if (!rig) return;
    rig.updateEngraving(
      engraving,
      finish.metalHex,
      finish.isLightStage ? '#2A2520' : '#11151C',
    );
  }, [engraving, finish.metalHex, finish.isLightStage]);

  // Reset camera & view when requested
  useEffect(() => {
    if (resetTrigger === 0) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (camera && controls) {
      camera.position.set(0.25, 0.35, 5.25);
      controls.target.set(0, 0.05, 0);
      controls.update();
    }
  }, [resetTrigger]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Detect software WebGL via GPU renderer string
    const isSoftwareGl = (() => {
      const probe = document.createElement('canvas');
      const gl = probe.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 320);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 40);
    camera.position.set(0.25, 0.35, 5.25);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvasEl = renderer.domElement;
    canvasEl.style.width = '100%';
    canvasEl.style.height = '100%';
    canvasEl.style.display = 'block';
    canvasEl.style.touchAction = 'pan-y';
    container.appendChild(canvasEl);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const onContextRestored = () => {
      setContextLost(false);
    };
    canvasEl.addEventListener('webglcontextlost', onContextLost);
    canvasEl.addEventListener('webglcontextrestored', onContextRestored);

    // Studio Environment IBL
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmremGenerator.dispose();

    // 3-Point Warm/Cool Studio Lighting
    const hemiLight = new THREE.HemisphereLight('#DCE8FF', '#282420', 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(stateRef.current.finish.keyLightHex, 2.2);
    keyLight.position.set(4.5, 6.2, 5.0);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 20;
      keyLight.shadow.camera.left = -3.5;
      keyLight.shadow.camera.right = 3.5;
      keyLight.shadow.camera.top = 3.5;
      keyLight.shadow.camera.bottom = -3.5;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(stateRef.current.finish.rimLightHex, 1.8);
    rimLight.position.set(-4.5, 2.5, -4.0);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight('#FFFFFF', 0.65);
    fillLight.position.set(-3.0, -1.5, 4.0);
    scene.add(fillLight);

    // Studio Softboxes on GPU devices
    let rectLight1: THREE.RectAreaLight | null = null;
    if (!isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      rectLight1 = new THREE.RectAreaLight('#FFF9EE', 3.2, 4.5, 2.2);
      rectLight1.position.set(3.2, 3.8, 3.5);
      rectLight1.lookAt(0, 0, 0);
      scene.add(rectLight1);
    }

    // Build Procedural Product Rig
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const rig = buildProductRig(maxAnisotropy);
    rigRef.current = rig;
    scene.add(rig.root);

    // Apply initial finish immediately
    rig.materials.shell.color.set(stateRef.current.finish.shellHex);
    rig.materials.metal.color.set(stateRef.current.finish.metalHex);
    rig.materials.cushion.color.set(stateRef.current.finish.cushionHex);
    rig.materials.canopy.color.set(stateRef.current.finish.canopyHex);
    rig.materials.accent.color.set(stateRef.current.finish.accentHex);

    // Grounding Contact Shadow Plane
    const shadowTex = createContactShadowTexture();
    const shadowGeo = new THREE.PlaneGeometry(3.8, 2.4);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.42,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.set(0, -1.85, 0);
    scene.add(shadowPlane);

    // OrbitControls (zoom disabled so page scrolling remains effortless)
    const controls = new OrbitControls(camera, canvasEl);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minPolarAngle = Math.PI * 0.28;
    controls.maxPolarAngle = Math.PI * 0.72;
    controls.target.set(0, 0.05, 0);
    controls.update();
    controlsRef.current = controls;

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Pointer parallax tracking on window
    const onPointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      stateRef.current.pointerX = nx;
      stateRef.current.pointerY = ny;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // ResizeObserver for crisp responsive framing
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = Math.max(entry.contentRect.width, 280);
      const h = Math.max(entry.contentRect.height, 280);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // Animation loop state
    let frameId = 0;
    let disposed = false;
    let currentExplode = 0;
    let currentItemScale = 1;
    let lastShownItem: BoxItemId = stateRef.current.activeBoxItem;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const status = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (status === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();
      const s = stateRef.current;

      // 1. Switch visible 3D box item with smooth scale pop
      if (lastShownItem !== s.activeBoxItem) {
        lastShownItem = s.activeBoxItem;
        currentItemScale = 0.86;
        rig.headphonesGroup.visible = s.activeBoxItem === 'headphones';
        rig.caseGroup.visible = s.activeBoxItem === 'case';
        rig.cableGroup.visible = s.activeBoxItem === 'cable';
      }
      currentItemScale = THREE.MathUtils.damp(currentItemScale, 1, 9, delta);
      rig.root.scale.setScalar(currentItemScale);

      // 2. Smooth finish color morphing
      const lerpAlpha = 1 - Math.exp(-6.5 * delta);
      _targetShellColor.set(s.finish.shellHex);
      _targetMetalColor.set(s.finish.metalHex);
      _targetCushionColor.set(s.finish.cushionHex);
      _targetCanopyColor.set(s.finish.canopyHex);
      _targetAccentColor.set(s.finish.accentHex);
      _targetKeyColor.set(s.finish.keyLightHex);
      _targetRimColor.set(s.finish.rimLightHex);

      rig.materials.shell.color.lerp(_targetShellColor, lerpAlpha);
      rig.materials.metal.color.lerp(_targetMetalColor, lerpAlpha);
      rig.materials.cushion.color.lerp(_targetCushionColor, lerpAlpha);
      rig.materials.canopy.color.lerp(_targetCanopyColor, lerpAlpha);
      rig.materials.accent.color.lerp(_targetAccentColor, lerpAlpha);
      keyLight.color.lerp(_targetKeyColor, lerpAlpha);
      rimLight.color.lerp(_targetRimColor, lerpAlpha);

      // 3. Smooth exploded driver separation
      const targetExplode = s.exploded && s.activeBoxItem === 'headphones' ? 1 : 0;
      currentExplode = THREE.MathUtils.damp(currentExplode, targetExplode, 7, delta);
      for (const part of rig.leftExplodables) {
        part.mesh.position.x = part.restX + part.explodeOffset * currentExplode;
      }
      for (const part of rig.rightExplodables) {
        part.mesh.position.x = part.restX + part.explodeOffset * currentExplode;
      }

      // 4. Gentle levitation + pointer parallax + showcase rotation
      if (!prefersReducedMotion) {
        rig.root.position.y = Math.sin(elapsed * 1.45) * 0.065;
        const targetRotY = s.autoShowcase
          ? elapsed * 0.45
          : s.pointerX * 0.16;
        const targetRotX = s.pointerY * 0.07;

        if (s.autoShowcase) {
          rig.root.rotation.y = THREE.MathUtils.damp(
            rig.root.rotation.y,
            rig.root.rotation.y + delta * 0.65,
            8,
            delta,
          );
        } else {
          rig.root.rotation.y = THREE.MathUtils.damp(rig.root.rotation.y, targetRotY, 4.5, delta);
        }
        rig.root.rotation.x = THREE.MathUtils.damp(rig.root.rotation.x, targetRotX, 4.5, delta);
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('pointermove', onPointerMove);
      resizeObserver.disconnect();
      canvasEl.removeEventListener('webglcontextlost', onContextLost);
      canvasEl.removeEventListener('webglcontextrestored', onContextRestored);
      controls.dispose();
      rig.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      shadowTex.dispose();
      envTarget.dispose();
      renderer.dispose();
      if (canvasEl.parentElement === container) {
        container.removeChild(canvasEl);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        aria-label="Interactive 3D Vela Reference product preview"
      />
      {contextLost && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 text-white text-sm">
          Restoring 3D studio viewport...
        </div>
      )}
    </div>
  );
}
