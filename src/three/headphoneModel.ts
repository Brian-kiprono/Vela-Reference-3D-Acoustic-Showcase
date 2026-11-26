import * as THREE from 'three';
import {
  createAcousticMeshTexture,
  createEngravingTexture,
  createWovenFabricTexture,
} from './proceduralTextures';

export interface ProductRig {
  root: THREE.Group;
  headphonesGroup: THREE.Group;
  caseGroup: THREE.Group;
  cableGroup: THREE.Group;
  // Explodable parts on right/left cups
  leftExplodables: { mesh: THREE.Object3D; restX: number; explodeOffset: number }[];
  rightExplodables: { mesh: THREE.Object3D; restX: number; explodeOffset: number }[];
  // Dynamic material references
  materials: {
    shell: THREE.MeshPhysicalMaterial;
    metal: THREE.MeshPhysicalMaterial;
    cushion: THREE.MeshPhysicalMaterial;
    canopy: THREE.MeshPhysicalMaterial;
    accent: THREE.MeshPhysicalMaterial;
    grille: THREE.MeshStandardMaterial;
    driverCoil: THREE.MeshPhysicalMaterial;
    engravePlaque: THREE.MeshStandardMaterial;
  };
  updateEngraving: (text: string, baseHex: string, inkHex: string) => void;
  dispose: () => void;
}

function createRoundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  const hw = w / 2;
  const hh = h / 2;
  const rad = Math.min(r, hw, hh);
  s.moveTo(-hw + rad, -hh);
  s.lineTo(hw - rad, -hh);
  s.quadraticCurveTo(hw, -hh, hw, -hh + rad);
  s.lineTo(hw, hh - rad);
  s.quadraticCurveTo(hw, hh, hw - rad, hh);
  s.lineTo(-hw + rad, hh);
  s.quadraticCurveTo(-hw, hh, -hw, hh - rad);
  s.lineTo(-hw, -hh + rad);
  s.quadraticCurveTo(-hw, -hh, -hw + rad, -hh);
  return s;
}

function createOvalCushionGeometry(
  outerRx: number,
  outerRy: number,
  innerRx: number,
  innerRy: number,
  depth: number,
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.absellipse(0, 0, outerRx, outerRy, 0, Math.PI * 2, false, 0);

  const hole = new THREE.Path();
  hole.absellipse(0, 0, innerRx, innerRy, 0, Math.PI * 2, true, 0);
  shape.holes.push(hole);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.14,
    bevelSize: 0.11,
    bevelSegments: 8,
    curveSegments: 48,
  });
  geo.center();
  return geo;
}

function createEarcupShellGeometry(rx: number, ry: number, depth: number): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.absellipse(0, 0, rx, ry, 0, Math.PI * 2, false, 0);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.16,
    bevelSize: 0.12,
    bevelSegments: 10,
    curveSegments: 48,
  });
  geo.center();
  return geo;
}

export function buildProductRig(maxAnisotropy: number): ProductRig {
  const disposableGeometries: THREE.BufferGeometry[] = [];
  const disposableTextures: THREE.Texture[] = [];

  const acousticTex = createAcousticMeshTexture(maxAnisotropy);
  const fabricTex = createWovenFabricTexture(maxAnisotropy);
  let engraveTex = createEngravingTexture('', '#D5B88A', '#1E2530', maxAnisotropy);
  disposableTextures.push(acousticTex, fabricTex, engraveTex);

  // Calibrated PBR Material Library (distinct roughness & metalness across adjacent parts)
  const shellMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#28364A'),
    metalness: 0.72,
    roughness: 0.24,
    clearcoat: 0.55,
    clearcoatRoughness: 0.16,
    envMapIntensity: 1.25,
  });

  const metalMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#D5B88A'),
    metalness: 0.94,
    roughness: 0.16,
    anisotropy: 0.85,
    clearcoat: 0.25,
    envMapIntensity: 1.4,
  });

  const cushionMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#2A3342'),
    map: fabricTex,
    metalness: 0.02,
    roughness: 0.88,
    sheen: 0.9,
    sheenRoughness: 0.65,
    sheenColor: new THREE.Color('#FFFFFF'),
  });

  const canopyMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#2F3B4D'),
    map: fabricTex,
    metalness: 0.04,
    roughness: 0.84,
    sheen: 0.7,
    sheenRoughness: 0.7,
  });

  const accentMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#E0C596'),
    metalness: 0.96,
    roughness: 0.12,
    clearcoat: 0.35,
    envMapIntensity: 1.5,
  });

  const grilleMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1B1E24'),
    map: acousticTex,
    metalness: 0.45,
    roughness: 0.52,
  });

  const driverCoilMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#C88454'),
    metalness: 0.92,
    roughness: 0.18,
    emissive: new THREE.Color('#42200D'),
    emissiveIntensity: 0.25,
  });

  const engravePlaqueMat = new THREE.MeshStandardMaterial({
    map: engraveTex,
    metalness: 0.82,
    roughness: 0.22,
  });

  const root = new THREE.Group();
  const headphonesGroup = new THREE.Group();
  const leftExplodables: ProductRig['leftExplodables'] = [];
  const rightExplodables: ProductRig['rightExplodables'] = [];

  // ------------------------------------------------------------------
  // 1. HEADPHONES ASSEMBLY (12+ sculpted sub-parts)
  // ------------------------------------------------------------------
  const earcupOffsetX = 1.08;
  const earcupY = -0.35;

  const shellGeo = createEarcupShellGeometry(0.68, 0.88, 0.22);
  shellGeo.rotateY(Math.PI / 2);
  shellGeo.computeTangents();

  const innerRingGeo = new THREE.TorusGeometry(0.62, 0.032, 18, 56);
  innerRingGeo.scale(0.82, 1.05, 1.0);
  innerRingGeo.rotateY(Math.PI / 2);

  const driverPlateGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.045, 48);
  driverPlateGeo.rotateZ(Math.PI / 2);
  driverPlateGeo.scale(1, 1.18, 0.92);

  const coilRingGeo = new THREE.TorusGeometry(0.32, 0.022, 16, 48);
  coilRingGeo.rotateY(Math.PI / 2);

  const magnetBarGeo = new THREE.BoxGeometry(0.035, 0.56, 0.035);

  const cushionGeo = createOvalCushionGeometry(0.66, 0.86, 0.34, 0.54, 0.24);
  cushionGeo.rotateY(Math.PI / 2);

  disposableGeometries.push(
    shellGeo,
    innerRingGeo,
    driverPlateGeo,
    coilRingGeo,
    magnetBarGeo,
    cushionGeo,
  );

  // Build Left & Right Earcups
  ([-1, 1] as const).forEach((side) => {
    const cupAssembly = new THREE.Group();
    cupAssembly.position.set(side * earcupOffsetX, earcupY, 0);
    // Subtle anatomical inward toe-in
    cupAssembly.rotation.z = side * 0.08;

    // Outer anodized aluminum shell
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    shellMesh.position.x = side * 0.12;
    shellMesh.castShadow = true;
    shellMesh.receiveShadow = true;
    cupAssembly.add(shellMesh);

    // Metallic chamfer trim ring
    const trimRing = new THREE.Mesh(innerRingGeo, accentMat);
    trimRing.position.x = side * 0.01;
    cupAssembly.add(trimRing);

    // Planar-magnetic transducer core (revealed when Exploded View is toggled)
    const driverGroup = new THREE.Group();
    const driverPlate = new THREE.Mesh(driverPlateGeo, grilleMat);
    driverGroup.add(driverPlate);

    const coilRing = new THREE.Mesh(coilRingGeo, driverCoilMat);
    coilRing.position.x = side * 0.03;
    driverGroup.add(coilRing);

    for (let b = -2; b <= 2; b++) {
      const bar = new THREE.Mesh(magnetBarGeo, metalMat);
      bar.position.set(side * 0.03, 0, b * 0.09);
      driverGroup.add(bar);
    }
    driverGroup.position.x = -side * 0.03;
    cupAssembly.add(driverGroup);

    // Memory foam acoustic ear cushion
    const cushionMesh = new THREE.Mesh(cushionGeo, cushionMat);
    cushionMesh.position.x = -side * 0.21;
    cushionMesh.castShadow = true;
    cushionMesh.receiveShadow = true;
    cupAssembly.add(cushionMesh);

    // Register explodable offsets
    const list = side === -1 ? leftExplodables : rightExplodables;
    list.push(
      { mesh: shellMesh, restX: shellMesh.position.x, explodeOffset: side * 0.48 },
      { mesh: trimRing, restX: trimRing.position.x, explodeOffset: side * 0.24 },
      { mesh: driverGroup, restX: driverGroup.position.x, explodeOffset: -side * 0.06 },
      { mesh: cushionMesh, restX: cushionMesh.position.x, explodeOffset: -side * 0.42 },
    );

    // Right cup signature knurled digital crown + tactile ANC button
    if (side === 1) {
      const crownGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.07, 32);
      crownGeo.rotateX(Math.PI / 2);
      const crown = new THREE.Mesh(crownGeo, accentMat);
      crown.position.set(0.14, 0.58, -0.44);
      crown.rotation.y = 0.22;
      shellMesh.add(crown);
      disposableGeometries.push(crownGeo);

      const ancBtnGeo = new THREE.CapsuleGeometry(0.032, 0.08, 8, 16);
      ancBtnGeo.rotateZ(Math.PI / 2);
      const ancBtn = new THREE.Mesh(ancBtnGeo, metalMat);
      ancBtn.position.set(0.16, 0.72, -0.22);
      shellMesh.add(ancBtn);
      disposableGeometries.push(ancBtnGeo);
    }

    // Articulated gimbal U-yoke hugging the cup
    const yokeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.14, 0.0, 0.7),
      new THREE.Vector3(side * 0.25, 0.56, 0.45),
      new THREE.Vector3(side * 0.22, 0.92, 0.0),
      new THREE.Vector3(side * 0.25, 0.56, -0.45),
      new THREE.Vector3(side * 0.14, 0.0, -0.7),
    ]);
    const yokeGeo = new THREE.TubeGeometry(yokeCurve, 44, 0.038, 16, false);
    const yokeMesh = new THREE.Mesh(yokeGeo, metalMat);
    yokeMesh.castShadow = true;
    cupAssembly.add(yokeMesh);
    disposableGeometries.push(yokeGeo);

    // Hinge pivot pins on front/back of cup
    const pinGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.08, 24);
    pinGeo.rotateX(Math.PI / 2);
    const frontPin = new THREE.Mesh(pinGeo, accentMat);
    frontPin.position.set(side * 0.11, 0, 0.7);
    const backPin = new THREE.Mesh(pinGeo, accentMat);
    backPin.position.set(side * 0.11, 0, -0.7);
    cupAssembly.add(frontPin, backPin);
    disposableGeometries.push(pinGeo);

    // Telescoping stainless stem + friction collar
    const stemGeo = new THREE.CylinderGeometry(0.044, 0.044, 0.52, 24);
    const stem = new THREE.Mesh(stemGeo, metalMat);
    stem.position.set(side * 0.17, 1.15, 0);
    stem.rotation.z = side * 0.14;
    cupAssembly.add(stem);

    const collarGeo = new THREE.CylinderGeometry(0.068, 0.062, 0.16, 24);
    const collar = new THREE.Mesh(collarGeo, shellMat);
    collar.position.set(side * 0.13, 1.32, 0);
    collar.rotation.z = side * 0.14;
    cupAssembly.add(collar);
    disposableGeometries.push(stemGeo, collarGeo);

    headphonesGroup.add(cupAssembly);
  });

  // Architectural outer headband frame
  const archCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.14, 0.94, 0),
    new THREE.Vector3(-1.05, 1.56, 0),
    new THREE.Vector3(-0.62, 2.02, 0),
    new THREE.Vector3(0, 2.18, 0),
    new THREE.Vector3(0.62, 2.02, 0),
    new THREE.Vector3(1.05, 1.56, 0),
    new THREE.Vector3(1.14, 0.94, 0),
  ]);
  const archGeo = new THREE.TubeGeometry(archCurve, 72, 0.072, 24, false);
  archGeo.scale(1, 1, 1.45);
  const archMesh = new THREE.Mesh(archGeo, metalMat);
  archMesh.castShadow = true;
  headphonesGroup.add(archMesh);
  disposableGeometries.push(archGeo);

  // Breathable woven suspension canopy under the arch
  const canopyCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.04, 1.18, 0),
    new THREE.Vector3(-0.76, 1.72, 0),
    new THREE.Vector3(0, 1.98, 0),
    new THREE.Vector3(0.76, 1.72, 0),
    new THREE.Vector3(1.04, 1.18, 0),
  ]);
  const canopyGeo = new THREE.TubeGeometry(canopyCurve, 56, 0.068, 20, false);
  canopyGeo.scale(1, 0.45, 2.9);
  const canopyMesh = new THREE.Mesh(canopyGeo, canopyMat);
  canopyMesh.castShadow = true;
  headphonesGroup.add(canopyMesh);
  disposableGeometries.push(canopyGeo);

  // Live Laser-Engraved Crest Plaque at top center of headband
  const plaqueGeo = new THREE.BoxGeometry(0.72, 0.028, 0.18);
  const plaqueMesh = new THREE.Mesh(plaqueGeo, engravePlaqueMat);
  plaqueMesh.position.set(0, 2.24, 0);
  headphonesGroup.add(plaqueMesh);
  disposableGeometries.push(plaqueGeo);

  // Orient headphones at an iconic 3/4 hero presentation angle
  headphonesGroup.rotation.set(0.14, -0.52, -0.12);
  headphonesGroup.position.set(0, -0.55, 0);
  root.add(headphonesGroup);

  // ------------------------------------------------------------------
  // 2. SCULPTED FOLIO CASE (for "What's in the Box" inspection)
  // ------------------------------------------------------------------
  const caseGroup = new THREE.Group();
  const caseShape = createRoundedRectShape(2.35, 2.55, 0.85);
  const caseBodyGeo = new THREE.ExtrudeGeometry(caseShape, {
    depth: 0.62,
    bevelEnabled: true,
    bevelThickness: 0.18,
    bevelSize: 0.14,
    bevelSegments: 10,
    curveSegments: 36,
  });
  caseBodyGeo.center();
  const caseBody = new THREE.Mesh(caseBodyGeo, canopyMat);
  caseBody.castShadow = true;
  caseGroup.add(caseBody);

  // Magnetic wrap flap
  const flapShape = createRoundedRectShape(2.4, 1.35, 0.45);
  const flapGeo = new THREE.ExtrudeGeometry(flapShape, {
    depth: 0.08,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.04,
    bevelSegments: 6,
  });
  flapGeo.center();
  const flapMesh = new THREE.Mesh(flapGeo, shellMat);
  flapMesh.position.set(0, 0.48, 0.48);
  flapMesh.rotation.x = 0.06;
  caseGroup.add(flapMesh);

  // Brushed metallic Vela clasp bar
  const claspGeo = new THREE.BoxGeometry(0.75, 0.1, 0.06);
  const claspMesh = new THREE.Mesh(claspGeo, accentMat);
  claspMesh.position.set(0, -0.15, 0.56);
  caseGroup.add(claspMesh);

  caseGroup.rotation.set(0.22, -0.45, -0.08);
  caseGroup.visible = false;
  root.add(caseGroup);
  disposableGeometries.push(caseBodyGeo, flapGeo, claspGeo);

  // ------------------------------------------------------------------
  // 3. BRAIDED USB-C AUDIO CABLE (for "What's in the Box" inspection)
  // ------------------------------------------------------------------
  const cableGroup = new THREE.Group();
  const coilPoints: THREE.Vector3[] = [];
  const turns = 3.2;
  const steps = 120;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = t * Math.PI * 2 * turns;
    const radius = 0.82 + Math.sin(t * Math.PI) * 0.08;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const z = (t - 0.5) * 0.28;
    coilPoints.push(new THREE.Vector3(x, y, z));
  }
  const coilCurve = new THREE.CatmullRomCurve3(coilPoints);
  const coilGeo = new THREE.TubeGeometry(coilCurve, 140, 0.055, 16, false);
  const coilMesh = new THREE.Mesh(coilGeo, canopyMat);
  coilMesh.castShadow = true;
  cableGroup.add(coilMesh);

  // Twin machined anodized USB-C connectors
  const plugBodyGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.34, 24);
  const plugTipGeo = new THREE.BoxGeometry(0.09, 0.16, 0.045);

  [
    { pos: new THREE.Vector3(0.9, -0.2, 0.24), rot: new THREE.Euler(0.3, 0, -0.4) },
    { pos: new THREE.Vector3(-0.85, 0.28, -0.24), rot: new THREE.Euler(-0.2, 0, 0.5) },
  ].forEach((cfg) => {
    const plug = new THREE.Group();
    const body = new THREE.Mesh(plugBodyGeo, metalMat);
    const tip = new THREE.Mesh(plugTipGeo, accentMat);
    tip.position.y = 0.24;
    plug.add(body, tip);
    plug.position.copy(cfg.pos);
    plug.rotation.copy(cfg.rot);
    cableGroup.add(plug);
  });

  cableGroup.rotation.set(0.28, -0.32, 0.1);
  cableGroup.visible = false;
  root.add(cableGroup);
  disposableGeometries.push(coilGeo, plugBodyGeo, plugTipGeo);

  return {
    root,
    headphonesGroup,
    caseGroup,
    cableGroup,
    leftExplodables,
    rightExplodables,
    materials: {
      shell: shellMat,
      metal: metalMat,
      cushion: cushionMat,
      canopy: canopyMat,
      accent: accentMat,
      grille: grilleMat,
      driverCoil: driverCoilMat,
      engravePlaque: engravePlaqueMat,
    },
    updateEngraving(text: string, baseHex: string, inkHex: string) {
      const nextTex = createEngravingTexture(text, baseHex, inkHex, maxAnisotropy);
      const prevTex = engraveTex;
      engraveTex = nextTex;
      engravePlaqueMat.map = nextTex;
      engravePlaqueMat.needsUpdate = true;
      prevTex.dispose();
    },
    dispose() {
      disposableGeometries.forEach((g) => g.dispose());
      disposableTextures.forEach((t) => t.dispose());
      engraveTex.dispose();
      shellMat.dispose();
      metalMat.dispose();
      cushionMat.dispose();
      canopyMat.dispose();
      accentMat.dispose();
      grilleMat.dispose();
      driverCoilMat.dispose();
      engravePlaqueMat.dispose();
    },
  };
}
