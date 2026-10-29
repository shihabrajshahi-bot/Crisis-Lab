import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GameState, FacilityRoom, StateOfMatter } from '../types/game';
import {
  createFacilityHexRoom,
  createParticleCollider,
  createScientistMeeple,
  createActiveMoleculeMarker,
  createHazardSpillMesh,
  createDebrisMesh,
  createPipeConduit,
} from './proceduralModels';
import { ELEMENTS } from '../utils/chemistry';

// Axial hex to Cartesian coordinates conversion
// Radius R = 1.95
const HEX_R = 1.95;
export function hexToWorld(q: number, r: number, originZ = 4.5): THREE.Vector3 {
  const x = HEX_R * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
  const z = HEX_R * ((3 / 2) * r) + originZ;
  return new THREE.Vector3(x, 0, z);
}

export type CameraPreset = 'facility' | 'collider' | 'tactical' | 'airlock';

export class ThreeSceneManager {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public controls: OrbitControls;

  private isSoftwareGl = false;
  private container: HTMLDivElement;
  private animFrameId = 0;
  private isDestroyed = false;

  // Groups
  private roomsGroup = new THREE.Group();
  private colliderGroup = new THREE.Group();
  private meeplesGroup = new THREE.Group();
  private moleculesGroup = new THREE.Group();
  private hazardsGroup = new THREE.Group();
  private connectionsGroup = new THREE.Group();

  // Raycasting
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private onRoomClickCallback?: (roomId: number) => void;

  // Animated elements
  private rotatingParts: { object: THREE.Object3D; speed: number; axis: 'x' | 'y' | 'z' }[] = [];

  // Smooth camera target
  private targetCamPos = new THREE.Vector3(0, 15, 18);
  private targetLookAt = new THREE.Vector3(0, 0, 4);
  private isUserInteracting = false;

  constructor(container: HTMLDivElement, onRoomClick?: (roomId: number) => void) {
    this.container = container;
    this.onRoomClickCallback = onRoomClick;

    // 1. Detect software WebGL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup Scene, Camera, Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#070c18');
    this.scene.fog = new THREE.FogExp2('#070c18', 0.016);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 16, 18);

    // 3. Renderer with PBR settings
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2.05; // Prevent dipping below ground
    this.controls.minDistance = 4;
    this.controls.maxDistance = 45;
    this.controls.target.set(0, 0, 4);
    this.controls.addEventListener('start', () => {
      this.isUserInteracting = true;
    });
    this.controls.addEventListener('end', () => {
      this.isUserInteracting = false;
    });

    // 5. Studio Environment Map (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 6. Balanced 3-Point Studio Lighting
    this.setupLighting();

    // 7. Add root groups
    this.scene.add(this.colliderGroup);
    this.scene.add(this.roomsGroup);
    this.scene.add(this.connectionsGroup);
    this.scene.add(this.hazardsGroup);
    this.scene.add(this.meeplesGroup);
    this.scene.add(this.moleculesGroup);

    // Build base central Particle Collider at top
    this.buildParticleCollider();

    // Event listeners
    window.addEventListener('resize', this.onResize);
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);

    // Start 60fps loop
    this.startLoop();
  }

  private setupLighting() {
    // Warm key directional light with tight shadow frustum
    const keyLight = new THREE.DirectionalLight('#fffbeb', 2.2);
    keyLight.position.set(12, 22, 10);
    if (!this.isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 2048;
      keyLight.shadow.mapSize.height = 2048;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 60;
      keyLight.shadow.camera.left = -16;
      keyLight.shadow.camera.right = 16;
      keyLight.shadow.camera.top = 16;
      keyLight.shadow.camera.bottom = -16;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    this.scene.add(keyLight);

    // Cool sky / ground fill light
    const hemiLight = new THREE.HemisphereLight('#7dd3fc', '#1e293b', 1.1);
    this.scene.add(hemiLight);

    // Subtle Cyan Rim light from behind
    const rimLight = new THREE.DirectionalLight('#06b6d4', 0.9);
    rimLight.position.set(-10, 12, -15);
    this.scene.add(rimLight);
  }

  private buildParticleCollider() {
    const collider = createParticleCollider();
    collider.position.set(0, 0, -8.5); // Positioned at upper section of central board
    this.colliderGroup.add(collider);

    // Rotate collider internal beam
    const beam = collider.getObjectByName('collider_beam');
    if (beam) {
      this.rotatingParts.push({ object: beam, speed: 0.03, axis: 'z' });
    }
  }

  public setCameraPreset(preset: CameraPreset) {
    if (preset === 'facility') {
      this.targetCamPos.set(0, 14, 16);
      this.targetLookAt.set(0, 0, 4);
    } else if (preset === 'collider') {
      this.targetCamPos.set(0, 11, -1);
      this.targetLookAt.set(0, 0, -8.5);
    } else if (preset === 'tactical') {
      this.targetCamPos.set(0, 26, 4.01);
      this.targetLookAt.set(0, 0, 4);
    } else if (preset === 'airlock') {
      this.targetCamPos.set(-6, 7, 10);
      this.targetLookAt.set(-3, 0, 6);
    }
  }

  public updateGameState(state: GameState) {
    // 1. Rebuild facility hex rooms if empty or changed
    if (this.roomsGroup.children.length === 0) {
      this.buildFacilityRooms(state.facilityRooms);
      this.buildConnections(state.facilityRooms);
    }

    // 2. Update Hazards
    this.updateHazards(state.facilityRooms);

    // 3. Update Scientist Meeples
    this.updateMeeples(state);

    // 4. Update Active Molecule Markers
    this.updateMolecules(state);
  }

  private buildFacilityRooms(rooms: FacilityRoom[]) {
    while (this.roomsGroup.children.length > 0) {
      this.roomsGroup.remove(this.roomsGroup.children[0]);
    }

    rooms.forEach((room) => {
      const hexGroup = createFacilityHexRoom(room.type, room.color, room.id, room.code);
      const worldPos = hexToWorld(room.q, room.r);
      hexGroup.position.copy(worldPos);
      this.roomsGroup.add(hexGroup);

      // Register vent fan rotation
      const ventFan = hexGroup.getObjectByName('vent_fan');
      if (ventFan) {
        this.rotatingParts.push({ object: ventFan, speed: 0.04, axis: 'y' });
      }
    });
  }

  private buildConnections(rooms: FacilityRoom[]) {
    while (this.connectionsGroup.children.length > 0) {
      this.connectionsGroup.remove(this.connectionsGroup.children[0]);
    }

    const roomMap = new Map<number, FacilityRoom>();
    rooms.forEach((r) => roomMap.set(r.id, r));

    const drawnEdges = new Set<string>();

    rooms.forEach((room) => {
      const fromPos = hexToWorld(room.q, room.r);

      room.connections.forEach((conn) => {
        const edgeKey = [room.id, conn.targetRoomId].sort().join('-');
        if (drawnEdges.has(edgeKey)) return;
        drawnEdges.add(edgeKey);

        const targetRoom = roomMap.get(conn.targetRoomId);
        if (!targetRoom) return;
        const toPos = hexToWorld(targetRoom.q, targetRoom.r);

        if (conn.pathType === 'pipe' || conn.pathType === 'vent') {
          const pipe = createPipeConduit(fromPos, toPos, conn.pathType);
          this.connectionsGroup.add(pipe);
        } else if (conn.pathType === 'debris' && !conn.isDebrisCleared) {
          const debris = createDebrisMesh();
          const mid = new THREE.Vector3().addVectors(fromPos, toPos).multiplyScalar(0.5);
          debris.position.copy(mid);
          this.connectionsGroup.add(debris);
        }
      });
    });
  }

  private updateHazards(rooms: FacilityRoom[]) {
    while (this.hazardsGroup.children.length > 0) {
      this.hazardsGroup.remove(this.hazardsGroup.children[0]);
    }

    rooms.forEach((room) => {
      if (room.hazard) {
        const hazardMesh = createHazardSpillMesh(room.hazard.type, room.hazard.level);
        const worldPos = hexToWorld(room.q, room.r);
        hazardMesh.position.set(worldPos.x, 0.05, worldPos.z);
        this.hazardsGroup.add(hazardMesh);
      }
    });
  }

  private updateMeeples(state: GameState) {
    while (this.meeplesGroup.children.length > 0) {
      this.meeplesGroup.remove(this.meeplesGroup.children[0]);
    }

    // Place meeples on collider spaces if assigned
    state.colliderSpaces.forEach((space, idx) => {
      if (space.occupiedByChemistId) {
        const chemist = state.chemists.find((c) => c.id === space.occupiedByChemistId);
        if (chemist) {
          const meeple = createScientistMeeple(chemist.color, chemist.id);
          // Position around collider ring (radius 3.6, center (0, 0, -8.5))
          const angle = (idx / 6) * Math.PI * 2;
          const mx = Math.cos(angle) * 3.6;
          const mz = -8.5 + Math.sin(angle) * 3.6;
          meeple.position.set(mx, 0.4, mz);
          this.meeplesGroup.add(meeple);
        }
      }
    });

    // Place remaining free meeples near player's active room
    state.chemists.forEach((chemist, cIdx) => {
      if (chemist.meeplesAvailable > 0) {
        const room = state.facilityRooms.find((r) => r.id === chemist.moleculePosition);
        if (room) {
          const worldPos = hexToWorld(room.q, room.r);
          for (let m = 0; m < chemist.meeplesAvailable; m++) {
            const meeple = createScientistMeeple(chemist.color, chemist.id);
            const offset = (cIdx * 2 + m) * 0.45 - 0.6;
            meeple.position.set(worldPos.x + offset, 0.38, worldPos.z + 0.8);
            this.meeplesGroup.add(meeple);
          }
        }
      }
    });
  }

  private updateMolecules(state: GameState) {
    while (this.moleculesGroup.children.length > 0) {
      this.moleculesGroup.remove(this.moleculesGroup.children[0]);
    }

    state.chemists.forEach((chemist) => {
      if (chemist.currentMolecule) {
        const room = state.facilityRooms.find((r) => r.id === chemist.moleculePosition);
        if (room) {
          const elementColors = chemist.currentMolecule.atoms.map((a) => ELEMENTS[a.element]?.color || '#ffffff');
          const marker = createActiveMoleculeMarker(chemist.currentMolecule.state, elementColors);
          const worldPos = hexToWorld(room.q, room.r);
          marker.position.set(worldPos.x, 0.38, worldPos.z);
          this.moleculesGroup.add(marker);
        }
      }
    });
  }

  private onPointerDown = (event: MouseEvent) => {
    if (!this.onRoomClickCallback) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(this.roomsGroup.children, true);

    if (intersects.length > 0) {
      let obj: THREE.Object3D | null = intersects[0].object;
      while (obj && !obj.userData?.isRoomHex) {
        obj = obj.parent;
      }
      if (obj && typeof obj.userData?.roomId === 'number') {
        this.onRoomClickCallback(obj.userData.roomId);
      }
    }
  };

  private onResize = () => {
    if (!this.container || this.isDestroyed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private startLoop() {
    let lastTime = performance.now();

    const afterDraw = (cb: () => void) => {
      const gl = this.renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const st = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (st === gl.UNSIGNALED) {
          this.animFrameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          this.animFrameId = window.setTimeout(cb, 80);
        }
      };
      this.animFrameId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      if (this.isDestroyed) return;

      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Exponential damping on camera target
      if (!this.isUserInteracting) {
        this.camera.position.x += (this.targetCamPos.x - this.camera.position.x) * (1 - Math.exp(-3.5 * dt));
        this.camera.position.y += (this.targetCamPos.y - this.camera.position.y) * (1 - Math.exp(-3.5 * dt));
        this.camera.position.z += (this.targetCamPos.z - this.camera.position.z) * (1 - Math.exp(-3.5 * dt));

        this.controls.target.x += (this.targetLookAt.x - this.controls.target.x) * (1 - Math.exp(-3.5 * dt));
        this.controls.target.y += (this.targetLookAt.y - this.controls.target.y) * (1 - Math.exp(-3.5 * dt));
        this.controls.target.z += (this.targetLookAt.z - this.controls.target.z) * (1 - Math.exp(-3.5 * dt));
      }

      this.controls.update();

      // Rotate rotating components (Collider beam, vent fans, active molecule orbitals)
      for (const p of this.rotatingParts) {
        if (p.axis === 'y') p.object.rotation.y += p.speed;
        else if (p.axis === 'z') p.object.rotation.z += p.speed;
        else p.object.rotation.x += p.speed;
      }

      // Spin molecule markers gently
      this.moleculesGroup.children.forEach((mol) => {
        mol.rotation.y += 0.015;
      });

      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        afterDraw(tick);
      } else {
        this.animFrameId = requestAnimationFrame(tick);
      }
    };

    if (this.isSoftwareGl) {
      afterDraw(tick);
    } else {
      this.animFrameId = requestAnimationFrame(tick);
    }
  }

  public dispose() {
    this.isDestroyed = true;
    if (this.isSoftwareGl) {
      clearTimeout(this.animFrameId);
    } else {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('resize', this.onResize);
    this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.controls.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
