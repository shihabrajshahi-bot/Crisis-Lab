import * as THREE from 'three';
import { ElementType, StateOfMatter, HazardType } from '../types/game';
import { ELEMENTS } from '../utils/chemistry';

// Procedural Canvas Textures for realistic laboratory materials
export function createHexGridTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Dark slate laboratory deck
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, size, size);

  // Hex circuit tracery
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 3;
  const hexRadius = 40;
  for (let y = 0; y < size + hexRadius; y += hexRadius * 1.5) {
    for (let x = 0; x < size + hexRadius; x += hexRadius * Math.sqrt(3)) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const hx = x + hexRadius * Math.cos(angle);
        const hy = y + hexRadius * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  // Sci-fi micro grid dots
  ctx.fillStyle = '#38bdf8';
  for (let i = 0; i < 80; i++) {
    const rx = Math.random() * size;
    const ry = Math.random() * size;
    ctx.globalAlpha = 0.2 + Math.random() * 0.4;
    ctx.fillRect(rx, ry, 2, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createHazardStripeTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#eab308'; // Amber yellow
  ctx.beginPath();
  const stripeWidth = 24;
  for (let x = -size; x < size * 2; x += stripeWidth * 2) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x + stripeWidth, 0);
    ctx.lineTo(x + stripeWidth + size, size);
    ctx.lineTo(x + size, size);
    ctx.closePath();
  }
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Procedural Contact Shadow Disc
export function createContactShadowDisc(radius = 1.2, opacity = 0.45): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, `rgba(0, 0, 0, ${opacity})`);
  grad.addColorStop(0.6, `rgba(0, 0, 0, ${opacity * 0.4})`);
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  const geo = new THREE.PlaneGeometry(radius * 2, radius * 2);
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.015;
  mesh.renderOrder = 1;
  return mesh;
}

/**
 * 1. SCIENTIST HAZMAT MEEPLE (Composite 3-12 Part Model)
 * Parts:
 * - Pedestal Base with beveled rim
 * - Hazmat Suit Torso
 * - Legs / Boots
 * - Shoulders / Pauldrons
 * - Hazmat Helmet Dome
 * - Gold Reflective Face Visor (high metalness, low roughness)
 * - Life Support Backpack
 * - Dual Oxygen Tanks
 * - Pressure Regulator & Valves
 * - Contact Shadow
 */
export function createScientistMeeple(suitColorHex: string, chemistId: string): THREE.Group {
  const group = new THREE.Group();
  group.name = `meeple_${chemistId}`;

  const suitColor = new THREE.Color(suitColorHex);
  const darkAlloy = new THREE.Color('#1e293b');
  const goldVisorColor = new THREE.Color('#facc15');
  const copperAccent = new THREE.Color('#d97706');

  // Materials
  const suitMat = new THREE.MeshStandardMaterial({
    color: suitColor,
    roughness: 0.45,
    metalness: 0.15,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: darkAlloy,
    roughness: 0.3,
    metalness: 0.7,
  });
  const visorMat = new THREE.MeshStandardMaterial({
    color: goldVisorColor,
    roughness: 0.1,
    metalness: 0.95,
  });
  const copperMat = new THREE.MeshStandardMaterial({
    color: copperAccent,
    roughness: 0.25,
    metalness: 0.85,
  });

  // 1. Pedestal Base
  const baseGeo = new THREE.CylinderGeometry(0.38, 0.44, 0.12, 24);
  const baseMesh = new THREE.Mesh(baseGeo, darkMat);
  baseMesh.position.y = 0.06;
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  group.add(baseMesh);

  // 2. Torso
  const torsoGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.55, 16);
  const torsoMesh = new THREE.Mesh(torsoGeo, suitMat);
  torsoMesh.position.y = 0.42;
  torsoMesh.castShadow = true;
  torsoMesh.receiveShadow = true;
  group.add(torsoMesh);

  // 3. Chest Control Panel / Badge
  const badgeGeo = new THREE.BoxGeometry(0.16, 0.12, 0.05);
  const badgeMesh = new THREE.Mesh(badgeGeo, darkMat);
  badgeMesh.position.set(0, 0.5, 0.23);
  group.add(badgeMesh);

  // 4. Helmet Dome
  const helmetGeo = new THREE.SphereGeometry(0.22, 18, 16);
  const helmetMesh = new THREE.Mesh(helmetGeo, suitMat);
  helmetMesh.position.y = 0.85;
  helmetMesh.castShadow = true;
  group.add(helmetMesh);

  // 5. Gold Visor
  const visorGeo = new THREE.SphereGeometry(0.18, 16, 12, 0, Math.PI, 0, Math.PI / 1.5);
  const visorMesh = new THREE.Mesh(visorGeo, visorMat);
  visorMesh.rotation.x = Math.PI / 2;
  visorMesh.position.set(0, 0.85, 0.09);
  group.add(visorMesh);

  // 6. Backpack Life Support
  const packGeo = new THREE.BoxGeometry(0.28, 0.42, 0.16);
  const packMesh = new THREE.Mesh(packGeo, darkMat);
  packMesh.position.set(0, 0.48, -0.22);
  packMesh.castShadow = true;
  group.add(packMesh);

  // 7 & 8. Dual Oxygen Cylinders
  const tankGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.36, 12);
  const tankLeft = new THREE.Mesh(tankGeo, copperMat);
  tankLeft.position.set(-0.08, 0.48, -0.32);
  tankLeft.castShadow = true;
  group.add(tankLeft);

  const tankRight = new THREE.Mesh(tankGeo, copperMat);
  tankRight.position.set(0.08, 0.48, -0.32);
  tankRight.castShadow = true;
  group.add(tankRight);

  // 9. Contact Shadow
  const shadow = createContactShadowDisc(0.5, 0.5);
  group.add(shadow);

  // Scale adjustment
  group.scale.set(0.85, 0.85, 0.85);
  return group;
}

/**
 * 2. ACTIVE MOLECULE MARKER (Composite 3-12 Part Model with State FX)
 * Visual representation of the bonded molecule on the facility map:
 * - Central bonded atom cluster
 * - Covalent bonds
 * - Orbiting electron toruses
 * - State of Matter FX:
 *    Solid: Ice / crystal shards around base
 *    Liquid: Ripple fluid ring
 *    Gas: Billowing vapor mist cluster
 * - Contact shadow
 */
export function createActiveMoleculeMarker(state: StateOfMatter, elementColors: string[]): THREE.Group {
  const group = new THREE.Group();
  group.name = 'active_molecule_marker';

  // 1. Central Core Atom
  const coreMat = new THREE.MeshStandardMaterial({
    color: elementColors[0] || '#38bdf8',
    roughness: 0.2,
    metalness: 0.6,
    emissive: elementColors[0] || '#38bdf8',
    emissiveIntensity: 0.35,
  });
  const coreMesh = new THREE.Mesh(new THREE.SphereGeometry(0.3, 20, 20), coreMat);
  coreMesh.position.y = 0.6;
  coreMesh.castShadow = true;
  group.add(coreMesh);

  // 2. Satellite bonded atoms
  const satelliteGeo = new THREE.SphereGeometry(0.18, 16, 16);
  const bondGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.45, 8);
  const bondMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.3, metalness: 0.8 });

  const numSatellites = Math.min(elementColors.length - 1, 4) || 2;
  for (let i = 0; i < numSatellites; i++) {
    const angle = (i / numSatellites) * Math.PI * 2;
    const dist = 0.55;
    const sx = Math.cos(angle) * dist;
    const sz = Math.sin(angle) * dist;

    const satColor = elementColors[i + 1] || '#ffffff';
    const satMat = new THREE.MeshStandardMaterial({
      color: satColor,
      roughness: 0.2,
      metalness: 0.5,
      emissive: satColor,
      emissiveIntensity: 0.2,
    });
    const satMesh = new THREE.Mesh(satelliteGeo, satMat);
    satMesh.position.set(sx, 0.6 + Math.sin(i) * 0.1, sz);
    satMesh.castShadow = true;
    group.add(satMesh);

    // Bond connector
    const bondMesh = new THREE.Mesh(bondGeo, bondMat);
    bondMesh.position.set(sx / 2, 0.6, sz / 2);
    bondMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(sx, 0, sz).normalize());
    group.add(bondMesh);
  }

  // 3. Orbiting Electron Rings
  const ringGeo = new THREE.TorusGeometry(0.72, 0.02, 8, 36);
  const ringMat = new THREE.MeshBasicMaterial({ color: '#38bdf8', wireframe: true });
  const ring1 = new THREE.Mesh(ringGeo, ringMat);
  ring1.position.y = 0.6;
  ring1.rotation.x = Math.PI / 3;
  group.add(ring1);

  const ring2 = new THREE.Mesh(ringGeo, ringMat);
  ring2.position.y = 0.6;
  ring2.rotation.y = Math.PI / 4;
  group.add(ring2);

  // 4. State of Matter FX
  if (state === 'solid') {
    // Sharp crystal shards on floor
    const crystalGeo = new THREE.ConeGeometry(0.12, 0.45, 5);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: '#7dd3fc',
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.85,
    });
    for (let c = 0; c < 5; c++) {
      const cAngle = (c / 5) * Math.PI * 2;
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.set(Math.cos(cAngle) * 0.45, 0.22, Math.sin(cAngle) * 0.45);
      crystal.rotation.x = (Math.random() - 0.5) * 0.4;
      crystal.rotation.z = (Math.random() - 0.5) * 0.4;
      group.add(crystal);
    }
  } else if (state === 'liquid') {
    // Liquid ripple rings
    const rippleGeo = new THREE.RingGeometry(0.4, 0.75, 32);
    const rippleMat = new THREE.MeshStandardMaterial({
      color: '#06b6d4',
      roughness: 0.05,
      metalness: 0.2,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
    });
    const ripple = new THREE.Mesh(rippleGeo, rippleMat);
    ripple.rotation.x = -Math.PI / 2;
    ripple.position.y = 0.05;
    group.add(ripple);
  } else {
    // Gas: Billowing vapor clouds
    const gasMat = new THREE.MeshStandardMaterial({
      color: '#cbd5e1',
      roughness: 0.8,
      metalness: 0.0,
      transparent: true,
      opacity: 0.45,
    });
    for (let g = 0; g < 4; g++) {
      const gasSphere = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), gasMat);
      gasSphere.position.set((Math.random() - 0.5) * 0.5, 0.7 + Math.random() * 0.5, (Math.random() - 0.5) * 0.5);
      group.add(gasSphere);
    }
  }

  // 5. Contact Shadow
  const shadow = createContactShadowDisc(0.7, 0.5);
  group.add(shadow);

  group.userData = { isMoleculeMarker: true, spinSpeed: 0.015 };
  return group;
}

/**
 * 3. PARTICLE COLLIDER (Top Central Board)
 * - Main Toroidal Vacuum Tube
 * - 6 Electromagnetic Quadrupole Induction Coils
 * - Central Core Plasma Splitter
 * - 6 Meeple Action Station Pads
 */
export function createParticleCollider(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'particle_collider';

  // Base Pedestal
  const baseGeo = new THREE.CylinderGeometry(4.8, 5.2, 0.4, 36);
  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: '#0f172a',
    roughness: 0.35,
    metalness: 0.8,
  });
  const baseMesh = new THREE.Mesh(baseGeo, darkMetalMat);
  baseMesh.position.y = 0.2;
  baseMesh.receiveShadow = true;
  group.add(baseMesh);

  // Hazard edge ring
  const ringBorderGeo = new THREE.TorusGeometry(4.8, 0.1, 12, 48);
  const warningMat = new THREE.MeshStandardMaterial({
    color: '#f59e0b',
    roughness: 0.3,
    metalness: 0.5,
  });
  const ringBorder = new THREE.Mesh(ringBorderGeo, warningMat);
  ringBorder.rotation.x = Math.PI / 2;
  ringBorder.position.y = 0.4;
  group.add(ringBorder);

  // Accelerator Vacuum Torus
  const torusGeo = new THREE.TorusGeometry(3.6, 0.35, 24, 64);
  const torusMat = new THREE.MeshStandardMaterial({
    color: '#334155',
    roughness: 0.2,
    metalness: 0.9,
  });
  const torusMesh = new THREE.Mesh(torusGeo, torusMat);
  torusMesh.rotation.x = Math.PI / 2;
  torusMesh.position.y = 0.75;
  torusMesh.castShadow = true;
  group.add(torusMesh);

  // Internal glowing beam path inside collider
  const beamGeo = new THREE.TorusGeometry(3.6, 0.08, 12, 48);
  const beamMat = new THREE.MeshBasicMaterial({
    color: '#38bdf8',
    transparent: true,
    opacity: 0.8,
  });
  const beamMesh = new THREE.Mesh(beamGeo, beamMat);
  beamMesh.rotation.x = Math.PI / 2;
  beamMesh.position.y = 0.75;
  beamMesh.name = 'collider_beam';
  group.add(beamMesh);

  // 6 Electromagnetic Quadrupole Induction Coils
  const coilGeo = new THREE.BoxGeometry(0.6, 0.8, 0.9);
  const copperMat = new THREE.MeshStandardMaterial({
    color: '#d97706',
    roughness: 0.2,
    metalness: 0.85,
  });
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const cx = Math.cos(angle) * 3.6;
    const cz = Math.sin(angle) * 3.6;

    const coil = new THREE.Mesh(coilGeo, copperMat);
    coil.position.set(cx, 0.75, cz);
    coil.rotation.y = -angle;
    coil.castShadow = true;
    group.add(coil);
  }

  // Central Core Chamber
  const coreCylinder = new THREE.CylinderGeometry(1.2, 1.4, 0.8, 24);
  const coreMat = new THREE.MeshStandardMaterial({
    color: '#1e293b',
    roughness: 0.25,
    metalness: 0.85,
  });
  const coreMesh = new THREE.Mesh(coreCylinder, coreMat);
  coreMesh.position.y = 0.6;
  coreMesh.castShadow = true;
  group.add(coreMesh);

  // Glowing core lens
  const lensGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.1, 24);
  const lensMat = new THREE.MeshBasicMaterial({ color: '#06b6d4' });
  const lens = new THREE.Mesh(lensGeo, lensMat);
  lens.position.y = 1.05;
  group.add(lens);

  return group;
}

/**
 * 4. FACILITY HEX ROOM PLATFORM (3-12 Part Procedural Model)
 * - Main beveled Hex Floor
 * - Metallic Rim Border
 * - Room Type Specimen (Airlock doors, Vault holographic portal, Reactor dome, Vent blades, etc.)
 * - Floor Decals & Hazard Stripes
 */
export function createFacilityHexRoom(
  roomType: string,
  roomColor: string,
  roomId: number,
  roomCode: string
): THREE.Group {
  const group = new THREE.Group();
  group.name = `room_hex_${roomId}`;

  const hexRadius = 1.8;
  const hexHeight = 0.35;

  // 1. Hex Floor Slab (Extruded Hexagon with bevel)
  const hexShape = new THREE.Shape();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = Math.cos(angle) * hexRadius;
    const y = Math.sin(angle) * hexRadius;
    if (i === 0) hexShape.moveTo(x, y);
    else hexShape.lineTo(x, y);
  }
  hexShape.closePath();

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: hexHeight,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.08,
    bevelThickness: 0.08,
  };

  const floorGeo = new THREE.ExtrudeGeometry(hexShape, extrudeSettings);
  const floorMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(roomColor).lerp(new THREE.Color('#0f172a'), 0.5),
    roughness: 0.4,
    metalness: 0.6,
  });
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.y = hexHeight;
  floorMesh.receiveShadow = true;
  floorMesh.castShadow = true;
  group.add(floorMesh);

  // 2. Room Border Curb
  const curbGeo = new THREE.RingGeometry(hexRadius - 0.15, hexRadius, 6);
  const curbMat = new THREE.MeshStandardMaterial({
    color: '#334155',
    roughness: 0.3,
    metalness: 0.8,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const curbMesh = new THREE.Mesh(curbGeo, curbMat);
  curbMesh.rotation.x = -Math.PI / 2;
  curbMesh.rotation.z = Math.PI / 6;
  curbMesh.position.y = hexHeight + 0.09;
  group.add(curbMesh);

  // 3. Room Center Specimen Equipment based on Type
  if (roomType === 'vault') {
    // Extraction Vault with glowing forcefield ring & heavy blast locks
    const vaultPylonGeo = new THREE.BoxGeometry(0.35, 1.2, 0.35);
    const vaultMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.2, metalness: 0.85 });
    for (let v = 0; v < 3; v++) {
      const vAngle = (v / 3) * Math.PI * 2;
      const pylon = new THREE.Mesh(vaultPylonGeo, vaultMat);
      pylon.position.set(Math.cos(vAngle) * 0.9, hexHeight + 0.6, Math.sin(vAngle) * 0.9);
      pylon.castShadow = true;
      group.add(pylon);
    }
    const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16), new THREE.MeshBasicMaterial({ color: '#fbbf24' }));
    beacon.position.y = hexHeight + 0.1;
    group.add(beacon);
  } else if (roomType === 'airlock') {
    // Airlock Blast Arch
    const archMat = new THREE.MeshStandardMaterial({ color: '#38bdf8', roughness: 0.3, metalness: 0.8 });
    const postGeo = new THREE.BoxGeometry(0.25, 1.1, 0.25);
    const p1 = new THREE.Mesh(postGeo, archMat);
    p1.position.set(-0.8, hexHeight + 0.55, 0);
    p1.castShadow = true;
    group.add(p1);

    const p2 = new THREE.Mesh(postGeo, archMat);
    p2.position.set(0.8, hexHeight + 0.55, 0);
    p2.castShadow = true;
    group.add(p2);

    const lintel = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.25, 0.25), archMat);
    lintel.position.set(0, hexHeight + 1.1, 0);
    lintel.castShadow = true;
    group.add(lintel);
  } else if (roomType === 'reactor') {
    // Main Reactor Core Vessel
    const reactorGeo = new THREE.CylinderGeometry(0.65, 0.75, 1.4, 18);
    const reactorMat = new THREE.MeshStandardMaterial({
      color: '#0284c7',
      roughness: 0.15,
      metalness: 0.9,
    });
    const reactorMesh = new THREE.Mesh(reactorGeo, reactorMat);
    reactorMesh.position.y = hexHeight + 0.7;
    reactorMesh.castShadow = true;
    group.add(reactorMesh);

    // Reactor Rods
    const rodGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.8, 8);
    const rodMat = new THREE.MeshStandardMaterial({ color: '#0ea5e9', roughness: 0.2, metalness: 0.95 });
    for (let r = 0; r < 4; r++) {
      const rAngle = (r / 4) * Math.PI * 2;
      const rod = new THREE.Mesh(rodGeo, rodMat);
      rod.position.set(Math.cos(rAngle) * 0.45, hexHeight + 0.9, Math.sin(rAngle) * 0.45);
      group.add(rod);
    }
  } else if (roomType === 'vent_hub') {
    // Ventilation Turbine Fans
    const grateGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.08, 16);
    const grateMat = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.4, metalness: 0.8 });
    const grate = new THREE.Mesh(grateGeo, grateMat);
    grate.position.y = hexHeight + 0.05;
    group.add(grate);

    const fanGroup = new THREE.Group();
    fanGroup.name = 'vent_fan';
    const bladeGeo = new THREE.BoxGeometry(0.18, 0.04, 0.65);
    const bladeMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.2, metalness: 0.9 });
    for (let b = 0; b < 4; b++) {
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.rotation.y = (b / 4) * Math.PI * 2;
      fanGroup.add(blade);
    }
    fanGroup.position.y = hexHeight + 0.12;
    group.add(fanGroup);
  }

  // 4. Contact Shadow
  const shadow = createContactShadowDisc(hexRadius * 1.05, 0.4);
  group.add(shadow);

  group.userData = { roomId, roomCode, roomType, isRoomHex: true };
  return group;
}

/**
 * 5. HAZARD SPILL 3D MODEL (3-12 Part Procedural Model)
 * - Corrosive Slime/Fluid Pool base
 * - Animated Bubble Spheres / Plasma fire flames
 * - Warning Beacon Pylon
 */
export function createHazardSpillMesh(type: HazardType, level: 1 | 2 | 3): THREE.Group {
  const group = new THREE.Group();
  group.name = `hazard_${type}_lvl${level}`;

  let color = '#ef4444'; // Red default
  if (type === 'acid_spill') color = '#84cc16'; // Acidic toxic lime green
  if (type === 'plasma_fire') color = '#f97316'; // High heat plasma orange
  if (type === 'toxic_vapor') color = '#a855f7'; // Toxic purple cloud
  if (type === 'corrosive_sludge') color = '#eab308'; // Amber sludge

  // 1. Fluid Pool Base
  const poolRadius = 0.5 + level * 0.2;
  const poolGeo = new THREE.CircleGeometry(poolRadius, 18);
  const poolMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.1,
    metalness: 0.3,
    transparent: true,
    opacity: 0.85,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  const poolMesh = new THREE.Mesh(poolGeo, poolMat);
  poolMesh.rotation.x = -Math.PI / 2;
  poolMesh.position.y = 0.37;
  group.add(poolMesh);

  // 2. Bubbles / Vapor Spheres
  const bubbleGeo = new THREE.SphereGeometry(0.12, 10, 10);
  const bubbleMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.1,
    metalness: 0.4,
    emissive: color,
    emissiveIntensity: 0.3,
  });

  const numBubbles = level * 3;
  for (let b = 0; b < numBubbles; b++) {
    const angle = (b / numBubbles) * Math.PI * 2;
    const dist = (Math.random() * 0.7 + 0.2) * (poolRadius * 0.7);
    const bubble = new THREE.Mesh(bubbleGeo, bubbleMat);
    bubble.position.set(Math.cos(angle) * dist, 0.42 + Math.random() * 0.3, Math.sin(angle) * dist);
    bubble.scale.setScalar(0.7 + Math.random() * 0.6);
    bubble.castShadow = true;
    group.add(bubble);
  }

  // 3. Hazard Warning Beacon Pylon
  const pylonGeo = new THREE.CylinderGeometry(0.08, 0.14, 0.6, 8);
  const pylonMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.3, metalness: 0.7 });
  const pylon = new THREE.Mesh(pylonGeo, pylonMat);
  pylon.position.set(poolRadius * 0.85, 0.65, 0);
  pylon.castShadow = true;
  group.add(pylon);

  const beaconLight = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), new THREE.MeshBasicMaterial({ color: '#ef4444' }));
  beaconLight.position.set(poolRadius * 0.85, 0.98, 0);
  group.add(beaconLight);

  return group;
}

/**
 * 6. DEBRIS BARRICADE (Physical Debris Blocking Hallway)
 * Composite twisted steel girders, collapsed plating
 */
export function createDebrisMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'debris_barricade';

  const rustMat = new THREE.MeshStandardMaterial({
    color: '#78350f',
    roughness: 0.8,
    metalness: 0.6,
  });

  // Twisted I-Beam 1
  const beam1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 1.2), rustMat);
  beam1.rotation.set(0.4, 0.6, 0.3);
  beam1.position.set(0, 0.5, 0);
  beam1.castShadow = true;
  group.add(beam1);

  // Twisted I-Beam 2
  const beam2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 1.0), rustMat);
  beam2.rotation.set(-0.3, -0.4, 0.6);
  beam2.position.set(0.2, 0.45, 0.1);
  beam2.castShadow = true;
  group.add(beam2);

  // Concrete / Plating chunks
  const chunkMat = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.9, metalness: 0.1 });
  for (let i = 0; i < 4; i++) {
    const chunk = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18 + Math.random() * 0.1), chunkMat);
    chunk.position.set((Math.random() - 0.5) * 0.8, 0.45, (Math.random() - 0.5) * 0.6);
    chunk.rotation.set(Math.random(), Math.random(), Math.random());
    chunk.castShadow = true;
    group.add(chunk);
  }

  const shadow = createContactShadowDisc(0.8, 0.4);
  group.add(shadow);
  return group;
}

/**
 * 7. PIPELINE CONDUIT / VENT SYSTEM BETWEEN ROOMS
 */
export function createPipeConduit(from: THREE.Vector3, to: THREE.Vector3, type: 'pipe' | 'vent'): THREE.Group {
  const group = new THREE.Group();
  const dir = new THREE.Vector3().subVectors(to, from);
  const length = dir.length();

  const radius = type === 'pipe' ? 0.08 : 0.14;
  const color = type === 'pipe' ? '#0ea5e9' : '#64748b';

  const pipeGeo = new THREE.CylinderGeometry(radius, radius, length, 12);
  const pipeMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.3,
    metalness: 0.85,
  });
  const pipeMesh = new THREE.Mesh(pipeGeo, pipeMat);

  const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
  mid.y += 0.38; // Align slightly above room decks
  pipeMesh.position.copy(mid);

  pipeMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  pipeMesh.castShadow = true;
  group.add(pipeMesh);

  // Rings / Couplings along pipe
  const couplingGeo = new THREE.CylinderGeometry(radius * 1.35, radius * 1.35, 0.1, 12);
  const darkMetal = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.3, metalness: 0.9 });
  const c1 = new THREE.Mesh(couplingGeo, darkMetal);
  c1.position.copy(mid);
  c1.quaternion.copy(pipeMesh.quaternion);
  group.add(c1);

  return group;
}
