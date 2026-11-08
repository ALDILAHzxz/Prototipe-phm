import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RotateCw, Layers, Sparkles, Eye, Maximize2, RefreshCw } from 'lucide-react';

interface ThreePartViewerProps {
  partName?: string;
  partCode?: string;
  orderId?: string;
  onClose?: () => void;
}

type FinishType = 'steel' | 'anodized_blue' | 'nickel' | 'matte_black';

export const ThreePartViewer: React.FC<ThreePartViewerProps> = ({
  partName = 'Bracket Komponen A',
  partCode = 'BRK-01A',
  orderId = 'DEMO-ORD-001',
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [explodedAmount, setExplodedAmount] = useState<number>(0);
  const [finish, setFinish] = useState<FinishType>('anodized_blue');
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [isControlsCollapsed, setIsControlsCollapsed] = useState<boolean>(false);

  // References to dynamic 3D elements for smooth damping
  const explodedRef = useRef(0);
  const targetExplodedRef = useRef(0);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const partsGroupRef = useRef<THREE.Group | null>(null);
  const dynamicMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const explodedPartsRef = useRef<{
    base: THREE.Mesh;
    boss: THREE.Mesh;
    collar: THREE.Mesh;
    lockRing: THREE.Mesh;
    gussets: THREE.Group;
    bolts: THREE.Group;
  } | null>(null);

  // Update target exploded amount smoothly
  useEffect(() => {
    targetExplodedRef.current = explodedAmount;
  }, [explodedAmount]);

  // Update materials when finish changes
  useEffect(() => {
    const mats = dynamicMaterialsRef.current;
    if (!mats || mats.length === 0) return;

    let metalness = 0.85;
    let roughness = 0.25;
    let baseColor = 0x0077c8; // Beesha bright blue

    if (finish === 'steel') {
      metalness = 0.92;
      roughness = 0.35;
      baseColor = 0x94a3b8;
    } else if (finish === 'nickel') {
      metalness = 0.95;
      roughness = 0.15;
      baseColor = 0xd1d5db;
    } else if (finish === 'matte_black') {
      metalness = 0.4;
      roughness = 0.6;
      baseColor = 0x1e293b;
    }

    mats.forEach((m) => {
      m.metalness = metalness;
      m.roughness = roughness;
      m.color.setHex(baseColor);
      m.wireframe = wireframe;
      m.needsUpdate = true;
    });
  }, [finish, wireframe]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf2f4f7); // Beesha Soft Silver
    scene.fog = new THREE.Fog(0xf2f4f7, 12, 30);

    // Camera
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    camera.position.set(4.5, 3.8, 5.2);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // prevent camera below ground
    controls.minDistance = 2.5;
    controls.maxDistance = 14;
    controls.target.set(0, 0.9, 0);
    controlsRef.current = controls;

    // Studio Environment (RoomEnvironment + PMREMGenerator)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Lighting Setup
    // Warm Key Light
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.2);
    keyLight.position.set(5, 7, 4);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 20;
      keyLight.shadow.camera.left = -4;
      keyLight.shadow.camera.right = 4;
      keyLight.shadow.camera.top = 4;
      keyLight.shadow.camera.bottom = -4;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    // Cool Hemisphere Fill
    const hemiLight = new THREE.HemisphereLight(0xedf4fc, 0x475569, 1.2);
    scene.add(hemiLight);

    // Rim/Back Light
    const rimLight = new THREE.DirectionalLight(0xdbeafe, 1.0);
    rimLight.position.set(-5, 4, -4);
    scene.add(rimLight);

    // Ground Plane with subtle grid markings
    const groundGeo = new THREE.PlaneGeometry(30, 30);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xe5eaf0,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = !isSoftwareGl;
    scene.add(ground);

    // Soft Contact Shadow Plane (procedural gradient canvas texture)
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sctx = shadowCanvas.getContext('2d')!;
    const grad = sctx.createRadialGradient(128, 128, 10, 128, 128, 120);
    grad.addColorStop(0, 'rgba(27, 54, 93, 0.45)');
    grad.addColorStop(0.5, 'rgba(27, 54, 93, 0.18)');
    grad.addColorStop(1, 'rgba(27, 54, 93, 0)');
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 256, 256);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    shadowTex.colorSpace = THREE.SRGBColorSpace;
    const contactShadowGeo = new THREE.PlaneGeometry(3.6, 3.6);
    const contactShadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const contactShadow = new THREE.Mesh(contactShadowGeo, contactShadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.005; // avoid Z-fighting
    scene.add(contactShadow);

    // ==============================================================
    // COMPOSITE PROCEDURAL 3D PART ASSEMBLY (3-12 parts Group)
    // Precision Engineered Bracket & Flange Hub Assembly
    // ==============================================================
    const assemblyGroup = new THREE.Group();
    assemblyGroup.position.set(0, 0, 0); // Grounded bottom-center
    scene.add(assemblyGroup);
    partsGroupRef.current = assemblyGroup;

    // Shared / Coordinated Materials
    const mainFinishMat = new THREE.MeshStandardMaterial({
      color: 0x0077c8, // Primary Beesha Bright Blue
      metalness: 0.85,
      roughness: 0.25,
      wireframe: false,
    });
    dynamicMaterialsRef.current = [mainFinishMat];

    const machinedSteelMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.95,
      roughness: 0.18,
    });

    const darkOxideHardwareMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.7,
      roughness: 0.4,
    });

    // 1. BASE FLANGE PLATE (With chamfers and mounting slots)
    // Extruded rounded shape with central clearance hole
    const baseShape = new THREE.Shape();
    const bw = 2.4;
    const bh = 1.8;
    const r = 0.35;
    baseShape.moveTo(-bw / 2 + r, -bh / 2);
    baseShape.lineTo(bw / 2 - r, -bh / 2);
    baseShape.quadraticCurveTo(bw / 2, -bh / 2, bw / 2, -bh / 2 + r);
    baseShape.lineTo(bw / 2, bh / 2 - r);
    baseShape.quadraticCurveTo(bw / 2, bh / 2, bw / 2 - r, bh / 2);
    baseShape.lineTo(-bw / 2 + r, bh / 2);
    baseShape.quadraticCurveTo(-bw / 2, bh / 2, -bw / 2, bh / 2 - r);
    baseShape.lineTo(-bw / 2, -bh / 2 + r);
    baseShape.quadraticCurveTo(-bw / 2, -bh / 2, -bw / 2 + r, -bh / 2);

    // Central bore hole
    const baseHole = new THREE.Path();
    baseHole.absarc(0, 0, 0.52, 0, Math.PI * 2, true);
    baseShape.holes.push(baseHole);

    const baseExtrudeSettings = {
      depth: 0.2,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.03,
      bevelThickness: 0.03,
    };
    const baseGeo = new THREE.ExtrudeGeometry(baseShape, baseExtrudeSettings);
    baseGeo.center();
    const baseMesh = new THREE.Mesh(baseGeo, mainFinishMat);
    baseMesh.rotation.x = Math.PI / 2;
    baseMesh.position.y = 0.12;
    baseMesh.castShadow = !isSoftwareGl;
    baseMesh.receiveShadow = !isSoftwareGl;
    assemblyGroup.add(baseMesh);

    // 2. CENTRAL REINFORCED CYLINDRICAL BOSS / HOUSING
    const bossGeo = new THREE.CylinderGeometry(0.58, 0.65, 1.1, 32);
    const bossMesh = new THREE.Mesh(bossGeo, mainFinishMat);
    bossMesh.position.y = 0.72;
    bossMesh.castShadow = !isSoftwareGl;
    assemblyGroup.add(bossMesh);

    // 3. INTERNAL PRECISION MACHINED COLLAR / BEARING SLEEVE
    const collarGeo = new THREE.CylinderGeometry(0.48, 0.48, 1.35, 32);
    const collarMesh = new THREE.Mesh(collarGeo, machinedSteelMat);
    collarMesh.position.y = 0.78;
    collarMesh.castShadow = !isSoftwareGl;
    assemblyGroup.add(collarMesh);

    // 4. ANODIZED LOCKING / RETAINING RING WITH KNURLED ACCENT
    const lockRingGeo = new THREE.TorusGeometry(0.52, 0.07, 16, 32);
    const lockRingMesh = new THREE.Mesh(lockRingGeo, machinedSteelMat);
    lockRingMesh.rotation.x = Math.PI / 2;
    lockRingMesh.position.y = 1.48;
    lockRingMesh.castShadow = !isSoftwareGl;
    assemblyGroup.add(lockRingMesh);

    // 5. STIFFENER GUSSETS (4 triangular reinforcement ribs)
    const gussetGroup = new THREE.Group();
    const gussetShape = new THREE.Shape();
    gussetShape.moveTo(0, 0);
    gussetShape.lineTo(0.55, 0);
    gussetShape.lineTo(0, 0.75);
    gussetShape.closePath();
    const gussetExtrudeSettings = {
      depth: 0.08,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.015,
      bevelThickness: 0.015,
    };
    const gussetGeo = new THREE.ExtrudeGeometry(gussetShape, gussetExtrudeSettings);
    gussetGeo.center();

    for (let i = 0; i < 4; i++) {
      const gMesh = new THREE.Mesh(gussetGeo, mainFinishMat);
      const angle = (i * Math.PI) / 2;
      gMesh.rotation.y = angle;
      gMesh.position.x = Math.cos(angle) * 0.48;
      gMesh.position.z = Math.sin(angle) * 0.48;
      gMesh.position.y = 0.55;
      gMesh.castShadow = !isSoftwareGl;
      gussetGroup.add(gMesh);
    }
    assemblyGroup.add(gussetGroup);

    // 6. HIGH-TENSILE FASTENERS (4 bolt locations around base flange)
    const boltsGroup = new THREE.Group();
    const boltHeadGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.12, 6); // Hexagonal head
    const boltShaftGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.28, 16);

    const boltPositions = [
      [-0.9, -0.6],
      [0.9, -0.6],
      [-0.9, 0.6],
      [0.9, 0.6],
    ];

    boltPositions.forEach(([bx, bz]) => {
      const singleBolt = new THREE.Group();
      const head = new THREE.Mesh(boltHeadGeo, darkOxideHardwareMat);
      head.position.y = 0.28;
      head.castShadow = !isSoftwareGl;
      const shaft = new THREE.Mesh(boltShaftGeo, darkOxideHardwareMat);
      shaft.position.y = 0.12;

      singleBolt.add(head);
      singleBolt.add(shaft);
      singleBolt.position.set(bx, 0, bz);
      boltsGroup.add(singleBolt);
    });
    assemblyGroup.add(boltsGroup);

    // Save references for exploded view animation
    explodedPartsRef.current = {
      base: baseMesh,
      boss: bossMesh,
      collar: collarMesh,
      lockRing: lockRingMesh,
      gussets: gussetGroup,
      bolts: boltsGroup,
    };

    // Pre-allocated scratch helpers to avoid GC
    const clock = new THREE.Clock();
    let frameId = 0;

    // Render loop
    const animate = () => {
      const delta = clock.getDelta();

      // Smooth exponential damping for exploded view
      const targetExp = targetExplodedRef.current;
      explodedRef.current = THREE.MathUtils.damp(explodedRef.current, targetExp, 6, delta);
      const exp = explodedRef.current;

      if (explodedPartsRef.current) {
        const { collar, lockRing, bolts, gussets } = explodedPartsRef.current;
        // Collar glides upward
        collar.position.y = 0.78 + exp * 1.2;
        // Lock ring glides even higher
        lockRing.position.y = 1.48 + exp * 1.9;
        // Bolts pop upward
        bolts.position.y = exp * 0.85;
        // Gussets expand slightly outward
        gussets.scale.set(1 + exp * 0.4, 1, 1 + exp * 0.4);
      }

      if (autoRotate && controlsRef.current) {
        assemblyGroup.rotation.y += delta * 0.5;
      }

      controls.update();
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    // Handle Window Resizing
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      baseGeo.dispose();
      bossGeo.dispose();
      collarGeo.dispose();
      lockRingGeo.dispose();
      gussetGeo.dispose();
      boltHeadGeo.dispose();
      boltShaftGeo.dispose();
      groundGeo.dispose();
      contactShadowGeo.dispose();
      shadowTex.dispose();
      mainFinishMat.dispose();
      machinedSteelMat.dispose();
      darkOxideHardwareMat.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [autoRotate]);

  const handleResetCamera = () => {
    if (cameraRef.current && controlsRef.current && partsGroupRef.current) {
      cameraRef.current.position.set(4.5, 3.8, 5.2);
      controlsRef.current.target.set(0, 0.9, 0);
      controlsRef.current.update();
      partsGroupRef.current.rotation.set(0, 0, 0);
      setExplodedAmount(0);
    }
  };

  return (
    <div className="relative w-full h-[520px] rounded-xl overflow-hidden border border-[#D9E0E8] bg-[#F2F4F7] shadow-sm select-none">
      {/* 3D Canvas Mounting Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left Spec Badge (Unobstructed Viewport per Three.js guidelines) */}
      <div className="absolute top-4 left-4 bg-surface/95 border border-line rounded-lg px-3.5 py-2.5 shadow-sm max-w-xs pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-brand" />
          <h4 className="text-sm font-bold text-ink leading-tight truncate">{partName}</h4>
        </div>
        <p className="text-xs text-ink-muted mt-0.5 font-mono">Kode Part: {partCode} · ID: {orderId}</p>
        <p className="text-sm text-success font-medium mt-1">✓ Validasi Toleransi Standar PHM Group</p>
      </div>

      {/* Top Right Actions */}
      <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-auto">
        <button
          onClick={handleResetCamera}
          title="Reset Sudut Pandang"
          className="p-2.5 bg-surface text-ink hover:text-brand border border-line rounded-lg shadow-sm transition-colors text-xs flex items-center gap-1.5 font-medium"
        >
          <RefreshCw className="w-4 h-4 text-brand dark:text-[#8CCBFF]" />
          <span className="hidden sm:inline">Reset Posisi</span>
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="px-3 py-2 bg-brand hover:bg-brand-strong text-white rounded-lg shadow-sm transition-colors text-xs font-semibold"
          >
            Tutup Inspeksi
          </button>
        )}
      </div>

      {/* Collapsible Unified Bottom Control Dock (<=15% Viewport footprint) */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 w-[94%] max-w-3xl transition-transform duration-300 pointer-events-auto ${
          isControlsCollapsed ? 'translate-y-[calc(100%-28px)]' : 'translate-y-0'
        }`}
      >
        {/* Toggle Collapse Bar */}
        <div className="flex justify-center -mb-px">
          <button
            onClick={() => setIsControlsCollapsed(!isControlsCollapsed)}
            className="bg-surface border-t border-x border-line text-ink hover:text-brand text-sm font-semibold px-4 py-1 rounded-t-lg shadow-xs flex items-center gap-1 cursor-pointer"
          >
            {isControlsCollapsed ? '▲ Tampilkan Kontrol Inspeksi' : '▼ Sembunyikan Kontrol'}
          </button>
        </div>

        {/* Dock Surface */}
        <div className="bg-surface border border-line rounded-xl p-3 shadow-md grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          {/* 1. Exploded Assembly Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs font-medium text-ink">
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-brand dark:text-[#8CCBFF]" />
                Exploded View (Pemisahan Part)
              </span>
              <span className="font-mono text-brand font-bold">{Math.round(explodedAmount * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={explodedAmount}
              onChange={(e) => setExplodedAmount(parseFloat(e.target.value))}
              aria-label="Tingkat Pemisahan Komponen"
              className="w-full accent-brand h-1.5 bg-subtle rounded-lg cursor-pointer"
            />
          </div>

          {/* 2. Finish Swatches */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-ink flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-brand dark:text-[#8CCBFF]" />
              Material Finish
            </span>
            <div className="grid grid-cols-4 gap-1">
              <button
                onClick={() => setFinish('anodized_blue')}
                className={`py-1 text-sm font-medium rounded border transition-colors ${
                  finish === 'anodized_blue'
                    ? 'bg-brand text-white border-brand font-bold'
                    : 'bg-subtle text-ink border-line hover:bg-canvas'
                }`}
              >
                Biru
              </button>
              <button
                onClick={() => setFinish('steel')}
                className={`py-1 text-sm font-medium rounded border transition-colors ${
                  finish === 'steel'
                    ? 'bg-navy dark:bg-[#263D5A] text-white dark:text-[#8CCBFF] border-navy dark:border-[#8CCBFF] font-bold'
                    : 'bg-subtle text-ink border-line hover:bg-canvas'
                }`}
              >
                Baja
              </button>
              <button
                onClick={() => setFinish('nickel')}
                className={`py-1 text-sm font-medium rounded border transition-colors ${
                  finish === 'nickel'
                    ? 'bg-slate-700 text-white border-slate-700 font-bold'
                    : 'bg-subtle text-ink border-line hover:bg-canvas'
                }`}
              >
                Nikel
              </button>
              <button
                onClick={() => setFinish('matte_black')}
                className={`py-1 text-sm font-medium rounded border transition-colors ${
                  finish === 'matte_black'
                    ? 'bg-black text-white border-black font-bold'
                    : 'bg-subtle text-ink border-line hover:bg-canvas'
                }`}
              >
                Matte
              </button>
            </div>
          </div>

          {/* 3. Toggles & Auto-Rotate */}
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setWireframe(!wireframe)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1 transition-colors ${
                wireframe
                  ? 'bg-navy dark:bg-brand text-white dark:text-[#0B111B] border-navy dark:border-brand font-bold'
                  : 'bg-subtle text-ink border-line hover:bg-canvas'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-brand dark:text-[#8CCBFF]" />
              Wireframe
            </button>
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1 transition-colors ${
                autoRotate
                  ? 'bg-brand text-white border-brand font-bold'
                  : 'bg-subtle text-ink border-line hover:bg-canvas'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
              Putar 360°
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
