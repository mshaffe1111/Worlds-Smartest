import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type {
  Archetype3D,
  DomainId,
  GlyphHint,
  HeroRelicId,
  PeelTier,
  PrismLoadOptions,
  PrismSkinId,
  QuestionRecord,
} from '../types/game';
import { getDomainMeta } from '../data/domains';
import {
  createCalibratorDialTexture,
  createFacetTexture,
  createGauntletPlateTexture,
  createRingLabelTexture,
  getBrushedBrassTextures,
  getGlowSpriteTexture,
  getObsidianTextures,
} from './ProceduralTextures';

type GlbMaterialRole = 'body' | 'metal' | 'titanium' | 'emissive';

interface MaterialSwatch {
  color: number;
  metalness: number;
  roughness: number;
  emissive: number;
  emissiveIntensity: number;
}

interface PrismSkinPalette {
  body: MaterialSwatch;
  metal: MaterialSwatch;
  titanium: MaterialSwatch;
  accentColor: number;
  accentEmissive: number;
  accentIntensity: number;
  pulseHex: number;
  useDomainAccent: boolean;
}

const PRISM_SKINS: Record<PrismSkinId, PrismSkinPalette> = {
  OBSIDIAN_BRASS: {
    body: { color: 0x0e1422, metalness: 0.36, roughness: 0.22, emissive: 0x000000, emissiveIntensity: 0 },
    metal: { color: 0xe3bf6f, metalness: 0.92, roughness: 0.24, emissive: 0x000000, emissiveIntensity: 0 },
    titanium: { color: 0x2b3445, metalness: 0.88, roughness: 0.3, emissive: 0x000000, emissiveIntensity: 0 },
    accentColor: 0xd4a853,
    accentEmissive: 0xf7df9c,
    accentIntensity: 1.15,
    pulseHex: 0xf7df9c,
    useDomainAccent: true,
  },
  KYOTO_KINTSUGI: {
    body: { color: 0x060609, metalness: 0.24, roughness: 0.1, emissive: 0x241200, emissiveIntensity: 0.18 },
    metal: { color: 0xffd25a, metalness: 0.96, roughness: 0.14, emissive: 0xe89b1e, emissiveIntensity: 0.62 },
    titanium: { color: 0x1f160d, metalness: 0.84, roughness: 0.22, emissive: 0xc27a12, emissiveIntensity: 0.38 },
    accentColor: 0xffc845,
    accentEmissive: 0xffa81e,
    accentIntensity: 1.65,
    pulseHex: 0xffc845,
    useDomainAccent: false,
  },
  DAMASCUS_TITANIUM: {
    body: { color: 0x1e2736, metalness: 0.84, roughness: 0.28, emissive: 0x061626, emissiveIntensity: 0.14 },
    metal: { color: 0xb2c8df, metalness: 0.95, roughness: 0.18, emissive: 0x1e567a, emissiveIntensity: 0.28 },
    titanium: { color: 0x3b4a61, metalness: 0.92, roughness: 0.22, emissive: 0x153b59, emissiveIntensity: 0.24 },
    accentColor: 0x5ce6ff,
    accentEmissive: 0x38d8ff,
    accentIntensity: 1.55,
    pulseHex: 0x5ce6ff,
    useDomainAccent: false,
  },
  EMERALD_SOVEREIGN: {
    body: { color: 0x061e17, metalness: 0.38, roughness: 0.16, emissive: 0x052e20, emissiveIntensity: 0.24 },
    metal: { color: 0xedd28a, metalness: 0.94, roughness: 0.2, emissive: 0x453512, emissiveIntensity: 0.2 },
    titanium: { color: 0x113b2d, metalness: 0.82, roughness: 0.26, emissive: 0x0d543b, emissiveIntensity: 0.3 },
    accentColor: 0x38eba2,
    accentEmissive: 0x24d68c,
    accentIntensity: 1.48,
    pulseHex: 0x38eba2,
    useDomainAccent: false,
  },
  BLACK_SALON_CRIMSON: {
    body: { color: 0x0a090d, metalness: 0.22, roughness: 0.42, emissive: 0x210309, emissiveIntensity: 0.2 },
    metal: { color: 0xd4384c, metalness: 0.88, roughness: 0.24, emissive: 0xa61228, emissiveIntensity: 0.52 },
    titanium: { color: 0x1f1419, metalness: 0.86, roughness: 0.32, emissive: 0x6b0d1d, emissiveIntensity: 0.35 },
    accentColor: 0xff2b47,
    accentEmissive: 0xff1c3c,
    accentIntensity: 1.75,
    pulseHex: 0xff2b47,
    useDomainAccent: false,
  },
};

const sharedGltfLoader = new GLTFLoader();
const relicGlbCache = new Map<HeroRelicId, Promise<THREE.Group | null>>();

interface FacetSlot {
  index: number;
  text: string;
  pivot: THREE.Group;
  frameMesh: THREE.Mesh;
  glbHousing: THREE.Object3D | null;
  glbHousingMats: THREE.MeshStandardMaterial[];
  faceMesh: THREE.Mesh;
  faceMaterial: THREE.MeshStandardMaterial;
  faceTexture: THREE.CanvasTexture;
  strutMesh: THREE.Mesh;
  shattered: boolean;
  redacted: boolean;
  stressFracture: boolean;
  correctHighlight: boolean;
  wrongHighlight: boolean;
  localAngle: number;
  forwardOffset: number;
  width: number;
  height: number;
}

interface ShardParticle {
  mesh: THREE.Mesh;
  mat: THREE.MeshStandardMaterial;
  vel: THREE.Vector3;
  rotVel: THREE.Vector3;
  age: number;
  life: number;
}

interface SparkParticle {
  sprite: THREE.Sprite;
  mat: THREE.SpriteMaterial;
  vel: THREE.Vector3;
  age: number;
  life: number;
  baseScale: number;
}

interface PulseRing {
  mesh: THREE.Mesh;
  mat: THREE.MeshBasicMaterial;
  age: number;
  life: number;
  maxScale: number;
}

interface CodexPlateSlot {
  index: number;
  mesh: THREE.Mesh;
  mat: THREE.MeshStandardMaterial;
  tex: THREE.CanvasTexture;
}

export function disposeSubtree(root: THREE.Object3D, protectedMaterials?: Set<THREE.Material>): void {
  root.userData.disposed = true;
  root.traverse((obj) => {
    if (obj.userData?.sharedGlbAsset) return;
    if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.Points) {
      if (!obj.userData?.sharedGlbGeometry) {
        obj.geometry?.dispose();
      }
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      for (const m of mats) {
        if (m && !m.userData?.sharedGlbMaterial && (!protectedMaterials || !protectedMaterials.has(m))) {
          m.dispose();
        }
      }
    }
  });
}

function normalizeAngle(rad: number): number {
  let a = rad % (Math.PI * 2);
  if (a > Math.PI) a -= Math.PI * 2;
  if (a < -Math.PI) a += Math.PI * 2;
  return a;
}

function shortestAngleDiff(from: number, to: number): number {
  return normalizeAngle(to - from);
}

function findGlbNode(root: THREE.Object3D, targetName: string): THREE.Object3D | null {
  const exact = root.getObjectByName(targetName);
  if (exact) return exact;
  const lower = targetName.toLowerCase();
  let found: THREE.Object3D | null = null;
  root.traverse((obj) => {
    if (found) return;
    const n = obj.name.toLowerCase();
    if (n === lower || n.startsWith(`${lower}.`) || n.startsWith(`${lower}_mesh`)) {
      found = obj;
    }
  });
  return found;
}

function detachNodeInRootSpace(node: THREE.Object3D, glbRoot: THREE.Object3D): THREE.Object3D {
  glbRoot.updateMatrixWorld(true);
  const invRoot = new THREE.Matrix4().copy(glbRoot.matrixWorld).invert();
  const relMatrix = new THREE.Matrix4().multiplyMatrices(invRoot, node.matrixWorld);
  node.removeFromParent();
  relMatrix.decompose(node.position, node.quaternion, node.scale);
  node.updateMatrixWorld(true);
  return node;
}

function classifyGlbMaterial(mat: THREE.MeshStandardMaterial): GlbMaterialRole {
  const existing = mat.userData?.skinRole as GlbMaterialRole | undefined;
  if (existing) return existing;

  const n = (mat.name || '').toLowerCase();
  const emLum = mat.emissive ? mat.emissive.r * 0.3 + mat.emissive.g * 0.59 + mat.emissive.b * 0.11 : 0;

  let role: GlbMaterialRole;
  if (
    emLum * (mat.emissiveIntensity ?? 1) > 0.18 ||
    /glow|emissive|core|light|luminous|energy|neon|laser|beam|crystal/.test(n)
  ) {
    role = 'emissive';
  } else if (
    /brass|gold|crown|trim|bezel|rivet|filigree|copper|bronze|champagne|kintsugi/.test(n) ||
    (mat.metalness > 0.72 && mat.color.r > mat.color.b + 0.08)
  ) {
    role = 'metal';
  } else if (/titanium|gunmetal|steel|jaw|clamp|piston|chrome|silver/.test(n) || mat.metalness > 0.62) {
    role = 'titanium';
  } else {
    role = 'body';
  }

  mat.userData.skinRole = role;
  return role;
}

function applySkinSwatchToMaterial(
  mat: THREE.MeshStandardMaterial,
  skin: PrismSkinPalette,
  domainColor: THREE.Color
): void {
  const role = classifyGlbMaterial(mat);
  if (role === 'emissive') {
    if (skin.useDomainAccent) {
      mat.color.copy(domainColor);
      mat.emissive.copy(domainColor);
    } else {
      mat.color.setHex(skin.accentColor);
      mat.emissive.setHex(skin.accentEmissive);
    }
    mat.emissiveIntensity = skin.accentIntensity;
    return;
  }

  const swatch = role === 'metal' ? skin.metal : role === 'titanium' ? skin.titanium : skin.body;
  mat.color.setHex(swatch.color);
  mat.metalness = swatch.metalness;
  mat.roughness = swatch.roughness;
  mat.emissive.setHex(swatch.emissive);
  mat.emissiveIntensity = swatch.emissiveIntensity;
  mat.needsUpdate = true;
}

function collectAndTagGlbMaterials(
  obj: THREE.Object3D,
  targetSet?: Set<THREE.MeshStandardMaterial>,
  markSharedGeometry = true
): THREE.MeshStandardMaterial[] {
  const collected: THREE.MeshStandardMaterial[] = [];
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if (markSharedGeometry) {
        child.userData.sharedGlbGeometry = true;
      }
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      const clonedMats = mats.map((m) => {
        if (m instanceof THREE.MeshStandardMaterial) {
          const cloned = m.clone();
          classifyGlbMaterial(cloned);
          targetSet?.add(cloned);
          collected.push(cloned);
          return cloned;
        }
        return m;
      });
      child.material = Array.isArray(child.material) ? clonedMats : clonedMats[0];
    }
  });
  return collected;
}

function loadRelicGlbTemplate(relicId: HeroRelicId): Promise<THREE.Group | null> {
  const cached = relicGlbCache.get(relicId);
  if (cached) return cached;

  const url = `./assets/models/relic_${relicId}.glb`;
  const promise = new Promise<THREE.Group | null>((resolve) => {
    sharedGltfLoader.load(
      url,
      (gltf) => {
        const wrapper = new THREE.Group();
        const scene = gltf.scene;
        scene.updateMatrixWorld(true);

        const box = new THREE.Box3().setFromObject(scene);
        if (!box.isEmpty()) {
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z, 0.001);
          const scale = 1.72 / maxDim;
          scene.scale.multiplyScalar(scale);
          scene.position.sub(center.multiplyScalar(scale));
        }

        // Attach subtle kinetic spin axes to recognizable orbital/ring/core sub-meshes
        let ringIdx = 0;
        scene.traverse((child) => {
          child.userData.sharedGlbAsset = true;
          if (child instanceof THREE.Mesh) {
            child.userData.sharedGlbGeometry = true;
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            for (const m of mats) {
              if (m) m.userData.sharedGlbMaterial = true;
            }
          }
          const lower = child.name.toLowerCase();
          if (
            child !== scene &&
            /ring|orbit|gimbal|rotor|band|dial|shard|planet|halo|vane|tesseract|core|crystal/.test(lower)
          ) {
            const dir = ringIdx % 2 === 0 ? 1 : -1;
            if (/core|crystal|tesseract/.test(lower)) {
              child.userData.spinAxis = new THREE.Vector3(0.22 * dir, 0.65 * dir, 0.14);
            } else {
              child.userData.spinAxis = new THREE.Vector3(
                (ringIdx % 3 === 1 ? 0.35 : 0.08) * dir,
                (0.32 + (ringIdx % 3) * 0.16) * dir,
                (ringIdx % 3 === 2 ? 0.28 : 0.06) * dir
              );
            }
            ringIdx++;
          }
        });

        wrapper.userData.sharedGlbAsset = true;
        wrapper.add(scene);
        resolve(wrapper);
      },
      undefined,
      () => {
        resolve(null);
      }
    );
  });

  relicGlbCache.set(relicId, promise);
  return promise;
}

/**
 * Builds distinct sculpted 3D holographic wireframe + glowing core geometry
 * for every GlyphHint (16 unique silhouettes).
 */
function createHolographicGlyph(hint: GlyphHint, accentColor: THREE.Color): THREE.Group {
  const group = new THREE.Group();

  const wireMat = new THREE.MeshBasicMaterial({
    color: accentColor,
    wireframe: true,
    transparent: true,
    opacity: 0.92,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const solidMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    emissive: accentColor,
    emissiveIntensity: 1.5,
    roughness: 0.2,
    metalness: 0.6,
    transparent: true,
    opacity: 0.72,
  });

  const goldMat = new THREE.MeshBasicMaterial({
    color: 0xf7df9c,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  switch (hint) {
    case 'globe': {
      group.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 2), wireMat));
      const eq = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.012, 8, 48), goldMat);
      eq.rotation.x = Math.PI * 0.42;
      group.add(eq);
      group.add(new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12), solidMat));
      break;
    }
    case 'atom': {
      group.add(new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), solidMat));
      for (let i = 0; i < 3; i++) {
        const orbit = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.012, 8, 48), i === 0 ? goldMat : wireMat);
        orbit.rotation.x = Math.PI / 3;
        orbit.rotation.y = (i * Math.PI) / 3;
        orbit.scale.set(1, 0.56, 1);
        group.add(orbit);
        const electron = new THREE.Mesh(new THREE.SphereGeometry(0.036, 10, 10), goldMat);
        electron.position.set(Math.cos(i * 2.1) * 0.34, Math.sin(i * 2.1) * 0.16, 0);
        orbit.add(electron);
      }
      break;
    }
    case 'crown': {
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.14, 12, 1, true), wireMat);
      band.position.y = -0.06;
      group.add(band);
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI * 2) / 6;
        const spire = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.24, 4), solidMat);
        spire.position.set(Math.cos(a) * 0.24, 0.12, Math.sin(a) * 0.24);
        group.add(spire);
        const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.036, 0), goldMat);
        gem.position.set(Math.cos(a) * 0.24, 0.27, Math.sin(a) * 0.24);
        group.add(gem);
      }
      break;
    }
    case 'dna': {
      for (let i = 0; i < 12; i++) {
        const t = i / 11;
        const y = (t - 0.5) * 0.72;
        const a = t * Math.PI * 2.6;
        const r = 0.2;
        const n1 = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 10), solidMat);
        n1.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
        const n2 = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 10), goldMat);
        n2.position.set(-Math.cos(a) * r, y, -Math.sin(a) * r);
        const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, r * 2, 6), wireMat);
        rung.position.set(0, y, 0);
        rung.rotation.z = Math.PI / 2;
        rung.rotation.y = -a;
        group.add(n1, n2, rung);
      }
      break;
    }
    case 'compass': {
      group.add(new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.016, 8, 40), goldMat));
      const nNeedle = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.34, 4), solidMat);
      nNeedle.position.y = 0.17;
      const sNeedle = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.34, 4), wireMat);
      sNeedle.position.y = -0.17;
      sNeedle.rotation.z = Math.PI;
      const cross = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), wireMat);
      cross.scale.set(2.1, 0.35, 0.35);
      group.add(nNeedle, sNeedle, cross);
      break;
    }
    case 'prism': {
      group.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.36, 0), wireMat));
      const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.22, 0.48, 3), solidMat);
      group.add(inner);
      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.01, 6, 3), goldMat);
      halo.rotation.x = Math.PI / 2;
      group.add(halo);
      break;
    }
    case 'scales': {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.045, 0.56, 8), solidMat);
      const beam = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.026, 0.026), goldMat);
      beam.position.y = 0.2;
      const leftPan = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.14, 12, 1, true), wireMat);
      leftPan.position.set(-0.27, -0.05, 0);
      leftPan.rotation.x = Math.PI;
      const rightPan = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.14, 12, 1, true), wireMat);
      rightPan.position.set(0.27, -0.05, 0);
      rightPan.rotation.x = Math.PI;
      group.add(pillar, beam, leftPan, rightPan);
      break;
    }
    case 'column': {
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.56, 10), wireMat);
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.07, 0.46), goldMat);
      cap.position.y = 0.31;
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.07, 0.46), solidMat);
      base.position.y = -0.31;
      group.add(shaft, cap, base);
      break;
    }
    case 'rocket': {
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.42, 10), wireMat);
      const nose = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 10), goldMat);
      nose.position.y = 0.32;
      group.add(body, nose);
      for (let i = 0; i < 3; i++) {
        const fin = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.2, 0.16), solidMat);
        const a = (i * Math.PI * 2) / 3;
        fin.position.set(Math.sin(a) * 0.14, -0.16, Math.cos(a) * 0.14);
        fin.rotation.y = a;
        group.add(fin);
      }
      break;
    }
    case 'gear': {
      const hub = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.055, 8, 24), wireMat);
      const center = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.02, 8, 16), goldMat);
      group.add(hub, center);
      for (let i = 0; i < 10; i++) {
        const a = (i * Math.PI * 2) / 10;
        const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.07, 0.09), solidMat);
        tooth.position.set(Math.cos(a) * 0.32, Math.sin(a) * 0.32, 0);
        tooth.rotation.z = a;
        group.add(tooth);
      }
      break;
    }
    case 'mask': {
      const face = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.44, 6, 1, true, -Math.PI * 0.45, Math.PI * 0.9), wireMat);
      const crest = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.015, 6, 6, Math.PI), goldMat);
      crest.position.y = 0.18;
      const eyeL = new THREE.Mesh(new THREE.OctahedronGeometry(0.055, 0), solidMat);
      eyeL.position.set(-0.09, 0.06, 0.2);
      const eyeR = new THREE.Mesh(new THREE.OctahedronGeometry(0.055, 0), solidMat);
      eyeR.position.set(0.09, 0.06, 0.2);
      group.add(face, crest, eyeL, eyeR);
      break;
    }
    case 'flame': {
      const outer = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.64, 7), wireMat);
      outer.position.y = 0.06;
      const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), goldMat);
      core.scale.set(1, 1.8, 1);
      core.position.y = -0.02;
      const base = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), solidMat);
      base.position.y = -0.18;
      group.add(outer, core, base);
      break;
    }
    case 'eye': {
      const topArc = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.018, 8, 28, Math.PI), wireMat);
      topArc.position.y = -0.14;
      const botArc = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.018, 8, 28, Math.PI), wireMat);
      botArc.rotation.z = Math.PI;
      botArc.position.y = 0.14;
      const iris = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.02, 8, 24), goldMat);
      const pupil = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 1), solidMat);
      group.add(topArc, botArc, iris, pupil);
      break;
    }
    case 'wave': {
      for (let i = 0; i < 11; i++) {
        const t = i / 10;
        const x = (t - 0.5) * 0.66;
        const y = Math.sin(t * Math.PI * 2.2) * 0.2;
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.18 + Math.abs(y) * 1.1, 0.032), i % 2 === 0 ? solidMat : goldMat);
        bar.position.set(x, y * 0.45, Math.cos(t * Math.PI * 2.2) * 0.08);
        group.add(bar);
      }
      break;
    }
    case 'star': {
      const t1 = new THREE.Mesh(new THREE.TetrahedronGeometry(0.36, 0), wireMat);
      const t2 = new THREE.Mesh(new THREE.TetrahedronGeometry(0.36, 0), goldMat);
      t2.rotation.x = Math.PI;
      t2.rotation.y = Math.PI / 3;
      const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), solidMat);
      group.add(t1, t2, core);
      break;
    }
    case 'scroll':
    default: {
      const sheet = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.54, 4, 6), wireMat);
      const topRoll = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.52, 12), goldMat);
      topRoll.rotation.z = Math.PI / 2;
      topRoll.position.y = 0.27;
      const botRoll = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.52, 12), solidMat);
      botRoll.rotation.z = Math.PI / 2;
      botRoll.position.y = -0.27;
      group.add(sheet, topRoll, botRoll);
      break;
    }
  }

  return group;
}

/**
 * Builds one of the 8 bespoke collectible 3D Hero Relics (Observatory & Boss Crown).
 * Mounts an instant procedural showcase silhouette while streaming the real Blender
 * `.glb` model (`./assets/models/relic_<id>.glb`) with caching and seamless swap-in!
 */
export function buildHeroRelicMesh(relicId: HeroRelicId): THREE.Group {
  const container = new THREE.Group();
  const fallback = new THREE.Group();
  container.add(fallback);

  const brassTex = getBrushedBrassTextures();
  const obsidianTex = getObsidianTextures();

  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xe6c373,
    map: brassTex.map,
    roughnessMap: brassTex.roughnessMap,
    bumpMap: brassTex.bumpMap,
    bumpScale: 0.015,
    metalness: 0.92,
    roughness: 0.24,
  });

  const darkBronzeMat = new THREE.MeshStandardMaterial({
    color: 0x8f6b36,
    map: brassTex.map,
    metalness: 0.88,
    roughness: 0.34,
  });

  const obsidianMat = new THREE.MeshStandardMaterial({
    color: 0x101624,
    map: obsidianTex.map,
    roughnessMap: obsidianTex.roughnessMap,
    metalness: 0.35,
    roughness: 0.16,
  });

  const pearlGlowMat = new THREE.MeshStandardMaterial({
    color: 0xfff3d4,
    emissive: 0xf7df9c,
    emissiveIntensity: 1.5,
    roughness: 0.1,
    metalness: 0.2,
  });

  switch (relicId) {
    case 'meridian_astrolabe': {
      const outerRing = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.05, 16, 64), brassMat);
      outerRing.userData.spinAxis = new THREE.Vector3(0, 0.35, 0.08);
      fallback.add(outerRing);

      for (let i = 0; i < 12; i++) {
        const a = (i * Math.PI * 2) / 12;
        const stud = new THREE.Mesh(
          new THREE.OctahedronGeometry(i % 3 === 0 ? 0.06 : 0.032, 0),
          i % 3 === 0 ? pearlGlowMat : brassMat
        );
        stud.position.set(Math.cos(a) * 0.95, Math.sin(a) * 0.95, 0);
        outerRing.add(stud);
      }

      const midRing = new THREE.Mesh(new THREE.TorusGeometry(0.74, 0.036, 14, 56), darkBronzeMat);
      midRing.rotation.x = Math.PI * 0.32;
      midRing.userData.spinAxis = new THREE.Vector3(0.55, 0.25, 0);
      fallback.add(midRing);

      const innerRing = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.028, 12, 48), brassMat);
      innerRing.rotation.y = Math.PI * 0.4;
      innerRing.userData.spinAxis = new THREE.Vector3(-0.3, 0.7, 0.4);
      fallback.add(innerRing);

      const vernier = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.48, 8), brassMat);
      midRing.add(vernier);

      const core = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 24), pearlGlowMat);
      fallback.add(core);

      const coreCage = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.28, 1),
        new THREE.MeshBasicMaterial({ color: 0xf7df9c, wireframe: true, transparent: true, opacity: 0.45 })
      );
      coreCage.userData.spinAxis = new THREE.Vector3(0.4, -0.5, 0.2);
      fallback.add(coreCage);
      break;
    }
    case 'armillary_orrery': {
      const ecliptic = new THREE.Mesh(new THREE.TorusGeometry(0.96, 0.042, 14, 64), brassMat);
      ecliptic.rotation.x = Math.PI * 0.42;
      ecliptic.userData.spinAxis = new THREE.Vector3(0, 0.25, 0);
      fallback.add(ecliptic);

      const meridian1 = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.022, 10, 56), darkBronzeMat);
      const meridian2 = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.022, 10, 56), darkBronzeMat);
      meridian2.rotation.y = Math.PI / 2;
      fallback.add(meridian1, meridian2);

      const sun = new THREE.Mesh(new THREE.OctahedronGeometry(0.21, 1), pearlGlowMat);
      sun.userData.spinAxis = new THREE.Vector3(0, 0.8, 0.2);
      fallback.add(sun);

      const planets: Array<{ r: number; size: number; color: number; speed: number; tilt: number; ringed?: boolean }> = [
        { r: 0.38, size: 0.055, color: 0xd98a54, speed: 1.3, tilt: 0.15 },
        { r: 0.54, size: 0.072, color: 0x4ca6e8, speed: 0.9, tilt: -0.22 },
        { r: 0.72, size: 0.095, color: 0xe8c474, speed: 0.6, tilt: 0.28, ringed: true },
        { r: 0.86, size: 0.06, color: 0xc24c5a, speed: 0.42, tilt: -0.14 },
      ];

      planets.forEach((p, idx) => {
        const trackPivot = new THREE.Group();
        trackPivot.rotation.x = p.tilt;
        trackPivot.userData.spinAxis = new THREE.Vector3(0, p.speed, 0);

        const track = new THREE.Mesh(
          new THREE.TorusGeometry(p.r, 0.009, 8, 48),
          new THREE.MeshBasicMaterial({ color: 0xd4a853, transparent: true, opacity: 0.48 })
        );
        track.rotation.x = Math.PI / 2;
        trackPivot.add(track);

        const planet = new THREE.Mesh(
          new THREE.SphereGeometry(p.size, 18, 16),
          new THREE.MeshStandardMaterial({
            color: p.color,
            roughness: 0.25,
            metalness: 0.65,
            emissive: p.color,
            emissiveIntensity: 0.22,
          })
        );
        const startA = idx * 1.6;
        planet.position.set(Math.cos(startA) * p.r, 0, Math.sin(startA) * p.r);
        if (p.ringed) {
          const satRing = new THREE.Mesh(new THREE.TorusGeometry(p.size * 1.7, 0.012, 8, 32), brassMat);
          satRing.rotation.x = Math.PI * 0.4;
          planet.add(satRing);
        }
        trackPivot.add(planet);
        fallback.add(trackPivot);
      });

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 2.05, 8), brassMat);
      pole.rotation.z = 0.24;
      fallback.add(pole);
      break;
    }
    case 'origami_prism': {
      const coreCrystal = new THREE.Mesh(new THREE.IcosahedronGeometry(0.54, 0), obsidianMat);
      coreCrystal.userData.spinAxis = new THREE.Vector3(0.18, 0.55, 0.12);
      fallback.add(coreCrystal);

      const goldCage = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.58, 0),
        new THREE.MeshStandardMaterial({
          color: 0xf7df9c,
          emissive: 0xd4a853,
          emissiveIntensity: 0.65,
          wireframe: true,
        })
      );
      goldCage.userData.spinAxis = new THREE.Vector3(0.18, 0.55, 0.12);
      fallback.add(goldCage);

      const innerPrism = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.28, 0),
        new THREE.MeshStandardMaterial({
          color: 0xff5a6a,
          emissive: 0xff6b52,
          emissiveIntensity: 1.6,
          roughness: 0.15,
        })
      );
      innerPrism.userData.spinAxis = new THREE.Vector3(-0.6, -0.8, 0.4);
      fallback.add(innerPrism);

      const shardOrbit = new THREE.Group();
      shardOrbit.userData.spinAxis = new THREE.Vector3(0.12, -0.48, 0.08);
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI * 2) / 8;
        const elev = (i % 2 === 0 ? 1 : -1) * 0.28;
        const shard = new THREE.Mesh(
          new THREE.ConeGeometry(0.12, 0.34, 3),
          i % 2 === 0 ? brassMat : obsidianMat
        );
        shard.position.set(Math.cos(a) * 0.88, elev, Math.sin(a) * 0.88);
        shard.lookAt(0, 0, 0);
        shard.rotateX(Math.PI / 2);
        shardOrbit.add(shard);
      }
      fallback.add(shardOrbit);
      break;
    }
    case 'emerald_sphere': {
      // Rio: Niemeyer curved white-ceramic & gold arches cradling faceted glowing emerald crystal
      const ceramicMat = new THREE.MeshStandardMaterial({
        color: 0xeef3f0,
        roughness: 0.22,
        metalness: 0.14,
      });
      const emeraldMat = new THREE.MeshStandardMaterial({
        color: 0x26d98c,
        emissive: 0x18b874,
        emissiveIntensity: 1.35,
        roughness: 0.12,
        metalness: 0.35,
      });
      const sphere = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 1), emeraldMat);
      sphere.userData.spinAxis = new THREE.Vector3(0.16, 0.55, 0.12);
      fallback.add(sphere);

      const ribGroup = new THREE.Group();
      ribGroup.userData.spinAxis = new THREE.Vector3(0, -0.28, 0.08);
      for (let i = 0; i < 4; i++) {
        const arch = new THREE.Mesh(new THREE.TorusGeometry(0.84, 0.045, 12, 48, Math.PI * 1.45), i % 2 === 0 ? ceramicMat : brassMat);
        arch.rotation.y = (i * Math.PI) / 4;
        arch.rotation.z = -0.35;
        ribGroup.add(arch);
      }
      fallback.add(ribGroup);
      break;
    }
    case 'cipher_box': {
      // Cairo: Egyptian-modernist sandstone/obsidian & antique-gold cryptex with rotating rings
      const sandstoneMat = new THREE.MeshStandardMaterial({
        color: 0xc29e68,
        roughness: 0.58,
        metalness: 0.18,
      });
      const coreBox = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.32, 8), obsidianMat);
      fallback.add(coreBox);
      for (let i = 0; i < 3; i++) {
        const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.24, 8), i === 1 ? brassMat : sandstoneMat);
        ring.position.y = (i - 1) * 0.34;
        ring.userData.spinAxis = new THREE.Vector3(0, (i % 2 === 0 ? 0.45 : -0.55), 0);
        fallback.add(ring);
      }
      const keystone = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.42, 4), pearlGlowMat);
      keystone.position.y = 0.86;
      keystone.userData.spinAxis = new THREE.Vector3(0, 0.8, 0);
      fallback.add(keystone);
      break;
    }
    case 'cryo_relay': {
      // Reykjavik: Hexagonal basalt spire fused with frosted cryo-glass & aurora-emerald core
      const cryoMat = new THREE.MeshStandardMaterial({
        color: 0x3ef0b4,
        emissive: 0x22d4a0,
        emissiveIntensity: 1.45,
        roughness: 0.14,
        metalness: 0.25,
      });
      const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.36, 1.45, 6), obsidianMat);
      fallback.add(spire);
      const energyCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.34, 0), cryoMat);
      energyCore.userData.spinAxis = new THREE.Vector3(0.2, 0.9, 0.15);
      fallback.add(energyCore);
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI * 2) / 6;
        const fin = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.92, 6), i % 2 === 0 ? obsidianMat : brassMat);
        fin.position.set(Math.cos(a) * 0.48, -0.15 + (i % 2) * 0.16, Math.sin(a) * 0.48);
        fallback.add(fin);
      }
      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.02, 10, 48), cryoMat);
      halo.rotation.x = Math.PI * 0.42;
      halo.userData.spinAxis = new THREE.Vector3(0.3, 0.45, -0.2);
      fallback.add(halo);
      break;
    }
    case 'council_seal': {
      // Singapore: Tripartite platinum & gold medallion hovering inside magnetic brass containment ring
      const platinumMat = new THREE.MeshStandardMaterial({
        color: 0xd8e4f0,
        metalness: 0.94,
        roughness: 0.18,
      });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.045, 14, 64), brassMat);
      ring.userData.spinAxis = new THREE.Vector3(0.12, 0.35, 0.18);
      fallback.add(ring);

      const triad = new THREE.Group();
      triad.userData.spinAxis = new THREE.Vector3(0, -0.5, 0.1);
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI * 2) / 3;
        const seg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.56, 0.56, 0.14, 12, 1, false, a, Math.PI * 0.54),
          i === 0 ? brassMat : platinumMat
        );
        seg.rotation.x = Math.PI / 2;
        seg.position.set(Math.cos(a + 0.85) * 0.08, Math.sin(a + 0.85) * 0.08, 0);
        triad.add(seg);
      }
      const centerCore = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.18, 0),
        new THREE.MeshStandardMaterial({ color: 0x5ce1e6, emissive: 0x3de2f0, emissiveIntensity: 1.6 })
      );
      triad.add(centerCore);
      fallback.add(triad);
      break;
    }
    case 'master_ledger':
    default: {
      // Apex Forum: Nested obsidian-and-gold tesseract monolith core + 3 engraved orbital rings
      const outerCube = new THREE.Mesh(
        new THREE.BoxGeometry(0.76, 0.76, 0.76),
        new THREE.MeshStandardMaterial({ color: 0xf7df9c, emissive: 0xd4a853, emissiveIntensity: 0.8, wireframe: true })
      );
      outerCube.userData.spinAxis = new THREE.Vector3(0.24, 0.42, 0.18);
      const innerCube = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.46, 0.46), obsidianMat);
      innerCube.userData.spinAxis = new THREE.Vector3(-0.32, -0.55, 0.24);
      const coreLight = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), pearlGlowMat);
      coreLight.userData.spinAxis = new THREE.Vector3(0.5, 0.8, -0.3);
      fallback.add(outerCube, innerCube, coreLight);

      for (let i = 0; i < 3; i++) {
        const orb = new THREE.Mesh(new THREE.TorusGeometry(0.74 + i * 0.11, 0.022, 12, 56), i === 1 ? pearlGlowMat : brassMat);
        orb.rotation.set(i * 0.72, i * 0.94, i * 0.48);
        orb.userData.spinAxis = new THREE.Vector3(
          (i === 0 ? 0.42 : -0.22),
          (i === 1 ? 0.54 : -0.34),
          (i === 2 ? 0.48 : 0.16)
        );
        fallback.add(orb);
      }
      break;
    }
  }

  // Stream & seamlessly swap in real Blender 5.3.0 `.glb` relic model
  void loadRelicGlbTemplate(relicId).then((template) => {
    if (!template || container.userData.disposed) return;
    const instance = template.clone(true);
    instance.userData.sharedGlbAsset = true;
    fallback.visible = false;
    container.add(instance);
  });

  return container;
}

export class VeritasPrism {
  public readonly root = new THREE.Group();

  // Sub-groups for clean morph transitions
  private readonly coreGroup = new THREE.Group();
  private readonly coreProceduralGroup = new THREE.Group();
  private readonly coreGlbGroup = new THREE.Group();

  private readonly upperCrown = new THREE.Group();
  private readonly upperCrownProcedural = new THREE.Group();
  private readonly upperCrownGlb = new THREE.Group();
  private upperCrownBaseY = 0.66;

  private readonly lowerCrown = new THREE.Group();
  private readonly lowerCrownProcedural = new THREE.Group();
  private readonly lowerCrownGlb = new THREE.Group();
  private lowerCrownBaseY = -0.66;

  private readonly shuttersGroup = new THREE.Group();
  private readonly shuttersGlbGroup = new THREE.Group();
  private readonly shutterPivots: THREE.Group[] = [];
  private readonly glbShutterPivots: THREE.Group[] = [];

  private readonly glyphContainer = new THREE.Group();

  private readonly jawsProceduralGroup = new THREE.Group();
  private readonly jawsGlbGroup = new THREE.Group();
  private readonly clampingJaws: THREE.Group[] = [];
  private readonly glbClampingJaws: THREE.Group[] = [];
  private readonly glbJawMaterials: THREE.MeshStandardMaterial[] = [];

  private readonly bossRelicMount = new THREE.Group();

  // Blender FacetHousing_Template (cloned per facet when loaded)
  private facetHousingTemplate: THREE.Group | null = null;
  private facetHousingBaseSize = new THREE.Vector3(1.24, 0.62, 0.08);

  // Tracked GLB materials for real-time Prism Atelier Skin tinting
  private readonly glbSkinnedMaterials = new Set<THREE.MeshStandardMaterial>();
  private currentSkinId: PrismSkinId = 'OBSIDIAN_BRASS';
  private disposed = false;

  // Sightline Lock carousel
  private readonly sightlineGroup = new THREE.Group();
  private readonly facetCarousel = new THREE.Group();
  private readonly sightlineBeamGroup = new THREE.Group();
  private facetSlots: FacetSlot[] = [];

  // Calibrator Dial
  private readonly calibratorGroup = new THREE.Group();
  private readonly calibratorBezelProcedural = new THREE.Group();
  private readonly calibratorBezelGlb = new THREE.Group();
  private dialFaceMesh!: THREE.Mesh;
  private dialFaceTex: THREE.CanvasTexture | null = null;
  private calibratorNeedlePivot = new THREE.Group();
  private readonly calibratorNeedleProcedural = new THREE.Group();
  private readonly calibratorNeedleGlb = new THREE.Group();
  private toleranceConeMesh!: THREE.Mesh;
  private toleranceConeMat!: THREE.MeshBasicMaterial;
  private toleranceBorderLeft!: THREE.Mesh;
  private toleranceBorderRight!: THREE.Mesh;
  private calibratorPos = 0.5;
  private calibratorTol = 0.16;

  // Codex Dual Ring
  private readonly codexGroup = new THREE.Group();
  private readonly codexTopRing = new THREE.Group();
  private readonly codexBottomRing = new THREE.Group();
  private readonly codexConduitsGroup = new THREE.Group();
  private codexTopPlates: CodexPlateSlot[] = [];
  private codexBottomPlates: CodexPlateSlot[] = [];
  private codexCrestMedallion: THREE.Object3D | null = null;
  private codexConduitMats: THREE.MeshBasicMaterial[] = [];
  private codexTopAngle = 0;
  private codexTopVel = 0;
  private codexBottomAngle = 0;
  private codexBottomVel = 0;
  private lastCodexAlignment: number[] = [0, 1, 2];

  // Gauntlet Shatter
  private readonly gauntletGroup = new THREE.Group();
  private gauntletPlateGroup = new THREE.Group();
  private gauntletFaceMesh!: THREE.Mesh;
  private gauntletFaceTex: THREE.CanvasTexture | null = null;
  private gauntletFlightVel = new THREE.Vector3();
  private gauntletFlightRotVel = new THREE.Vector3();
  private gauntletFlying = false;
  private gauntletFlightAge = 0;

  // Chrono Ring
  private readonly chronoGroup = new THREE.Group();
  private chronoArcMesh!: THREE.Mesh;
  private chronoArcMat!: THREE.MeshStandardMaterial;
  private chronoRatio = 1;
  private lastChronoGeoRatio = 1;

  // FX pools
  private readonly fxGroup = new THREE.Group();
  private shards: ShardParticle[] = [];
  private sparks: SparkParticle[] = [];
  private pulseRings: PulseRing[] = [];

  // Shared materials tinted dynamically by Domain Kit & Prism Atelier Skin
  private readonly obsidianMat: THREE.MeshStandardMaterial;
  private readonly brassMat: THREE.MeshStandardMaterial;
  private readonly domainTrimMat: THREE.MeshStandardMaterial;
  private readonly sightlineBeamMat: THREE.MeshBasicMaterial;
  private readonly coreLight: THREE.PointLight;
  private readonly shardGeo = new THREE.TetrahedronGeometry(0.11, 0);

  // State & physics
  private currentArchetype: Archetype3D = 'SIGHTLINE_LOCK';
  private isTitleShowcase = true;
  private currentDomainColor = new THREE.Color('#d4a853');
  private targetDomainColor = new THREE.Color('#d4a853');
  private currentSecondaryColor = new THREE.Color('#6c4d26');
  private readonly scratchMoltenColor = new THREE.Color(0xffb830);
  private readonly scratchBaseColor = new THREE.Color();

  private carouselAngle = 0;
  private spinVelocity = 0;
  private targetDetentIndex: number | null = null;
  private activeFacetIndex = 0;

  private peelTier: PeelTier = 1;
  private peelProgress = 0; // 0 (tier1), 1 (tier2), 2 (tier3)
  private overclockProgress = 0;
  private overclockActive = false;
  private revealLockActive = false;
  private elapsed = 0;

  // Camera trauma & zoom feedback read by SceneManager
  public cameraTrauma = 0;
  public overclockZoom = 0;

  // Callbacks wired by SceneManager
  public onFacetChanged?: (index: number) => void;
  public onCodexChanged?: (alignedIndices: number[]) => void;

  constructor() {
    const brassTex = getBrushedBrassTextures();
    const obsidianTex = getObsidianTextures();

    this.obsidianMat = new THREE.MeshStandardMaterial({
      color: 0x0e1422,
      map: obsidianTex.map,
      roughnessMap: obsidianTex.roughnessMap,
      bumpMap: obsidianTex.bumpMap,
      bumpScale: 0.015,
      metalness: 0.36,
      roughness: 0.22,
    });

    this.brassMat = new THREE.MeshStandardMaterial({
      color: 0xe3bf6f,
      map: brassTex.map,
      roughnessMap: brassTex.roughnessMap,
      bumpMap: brassTex.bumpMap,
      bumpScale: 0.018,
      metalness: 0.92,
      roughness: 0.24,
    });

    this.domainTrimMat = new THREE.MeshStandardMaterial({
      color: 0xd4a853,
      emissive: 0xd4a853,
      emissiveIntensity: 1.15,
      metalness: 0.75,
      roughness: 0.2,
    });

    this.sightlineBeamMat = new THREE.MeshBasicMaterial({
      color: 0xf7df9c,
      transparent: true,
      opacity: 0.13,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    this.coreLight = new THREE.PointLight(0xf7df9c, 2.2, 5.5, 1.5);
    this.coreLight.position.set(0, 0.12, 0.25);
    this.coreGroup.add(this.coreLight);

    this.buildCoreArchitecture();
    this.buildChronoRing();
    this.buildSightlineBeam();
    this.buildCalibratorDial();
    this.buildCodexSystem();
    this.buildGauntletSystem();

    this.root.add(
      this.coreGroup,
      this.chronoGroup,
      this.sightlineGroup,
      this.calibratorGroup,
      this.codexGroup,
      this.gauntletGroup,
      this.fxGroup
    );
    this.sightlineGroup.add(this.facetCarousel, this.sightlineBeamGroup);

    // Default elegant Title showcase facets
    this.loadTitleShowcase();

    // Stream real Blender 5.3.0 hero prism model & seamlessly upgrade all animated assemblies
    this.loadHeroPrismGlb();
  }

  private loadHeroPrismGlb(): void {
    sharedGltfLoader.load(
      './assets/models/veritas_prism_hero.glb',
      (gltf) => {
        if (this.disposed) return;
        const glbRoot = gltf.scene;
        glbRoot.updateMatrixWorld(true);

        // 1. Core_Spindle
        const coreSpindle = findGlbNode(glbRoot, 'Core_Spindle');
        if (coreSpindle) {
          detachNodeInRootSpace(coreSpindle, glbRoot);
          const box = new THREE.Box3().setFromObject(coreSpindle);
          if (!box.isEmpty()) {
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            if (size.y < 0.35 || size.y > 3.2) {
              const s = 1.32 / Math.max(0.01, size.y);
              coreSpindle.scale.multiplyScalar(s);
              coreSpindle.position.multiplyScalar(s);
              center.multiplyScalar(s);
            }
            coreSpindle.position.x -= center.x;
            coreSpindle.position.z -= center.z;
          }
          collectAndTagGlbMaterials(coreSpindle, this.glbSkinnedMaterials);
          this.coreGlbGroup.add(coreSpindle);
          this.coreProceduralGroup.visible = false;
        }

        // 2. Crown_Top (preserve Blender pivot when already positioned near +0.66)
        const crownTop = findGlbNode(glbRoot, 'Crown_Top');
        if (crownTop) {
          detachNodeInRootSpace(crownTop, glbRoot);
          const worldY = crownTop.position.y;
          const holder = new THREE.Group();
          if (worldY > 0.25) {
            this.upperCrownBaseY = THREE.MathUtils.clamp(worldY, 0.5, 0.88);
            this.upperCrown.position.y = this.upperCrownBaseY;
            crownTop.position.set(0, 0, 0);
          } else {
            const box = new THREE.Box3().setFromObject(crownTop);
            if (!box.isEmpty()) {
              const center = box.getCenter(new THREE.Vector3());
              crownTop.position.sub(center);
              if (center.y > 0.2) {
                this.upperCrownBaseY = THREE.MathUtils.clamp(center.y, 0.5, 0.88);
                this.upperCrown.position.y = this.upperCrownBaseY;
              }
            }
          }
          holder.add(crownTop);
          const localBox = new THREE.Box3().setFromObject(holder);
          collectAndTagGlbMaterials(holder, this.glbSkinnedMaterials);
          this.upperCrownGlb.add(holder);
          this.upperCrownProcedural.visible = false;
          const topY = localBox.isEmpty() ? 0.26 : Math.max(0.22, localBox.max.y);
          this.bossRelicMount.position.set(0, topY + 0.36, 0);
        }

        // 3. Crown_Bottom (preserve Blender pivot when already positioned near -0.66)
        const crownBottom = findGlbNode(glbRoot, 'Crown_Bottom');
        if (crownBottom) {
          detachNodeInRootSpace(crownBottom, glbRoot);
          const worldY = crownBottom.position.y;
          const holder = new THREE.Group();
          if (worldY < -0.25) {
            this.lowerCrownBaseY = THREE.MathUtils.clamp(worldY, -0.88, -0.5);
            this.lowerCrown.position.y = this.lowerCrownBaseY;
            crownBottom.position.set(0, 0, 0);
          } else {
            const box = new THREE.Box3().setFromObject(crownBottom);
            if (!box.isEmpty()) {
              const center = box.getCenter(new THREE.Vector3());
              crownBottom.position.sub(center);
              if (center.y < -0.2) {
                this.lowerCrownBaseY = THREE.MathUtils.clamp(center.y, -0.88, -0.5);
                this.lowerCrown.position.y = this.lowerCrownBaseY;
              }
            }
          }
          holder.add(crownBottom);
          collectAndTagGlbMaterials(holder, this.glbSkinnedMaterials);
          this.lowerCrownGlb.add(holder);
          this.lowerCrownProcedural.visible = false;
        }

        // 4. Shutter_0..3 (exact radial pivot alignment so Tier-2 Peel irises cleanly outward)
        let mountedShutters = 0;
        for (let i = 0; i < 4; i++) {
          const shutter = findGlbNode(glbRoot, `Shutter_${i}`);
          if (!shutter) continue;
          detachNodeInRootSpace(shutter, glbRoot);
          const box = new THREE.Box3().setFromObject(shutter);
          const center = box.isEmpty() ? new THREE.Vector3() : box.getCenter(new THREE.Vector3());
          const radialDist = Math.hypot(center.x, center.z);
          const angle = radialDist > 0.04 ? Math.atan2(center.x, center.z) : (i * Math.PI) / 2 + Math.PI / 4;

          const outerPivot = new THREE.Group();
          outerPivot.rotation.y = angle;
          const animHolder = new THREE.Group();
          const unrot = new THREE.Group();
          unrot.rotation.y = -angle;
          unrot.add(shutter);
          animHolder.add(unrot);
          outerPivot.add(animHolder);

          collectAndTagGlbMaterials(shutter, this.glbSkinnedMaterials);
          this.glbShutterPivots.push(animHolder);
          this.shuttersGlbGroup.add(outerPivot);
          mountedShutters++;
        }
        if (mountedShutters > 0) {
          this.shuttersGroup.visible = false;
          this.shuttersGlbGroup.visible = true;
        }

        // 5. ClampJaw_0..3 (radial clamp inward + molten gold Overclock pulse)
        let mountedJaws = 0;
        for (let i = 0; i < 4; i++) {
          const jaw = findGlbNode(glbRoot, `ClampJaw_${i}`);
          if (!jaw) continue;
          detachNodeInRootSpace(jaw, glbRoot);
          const box = new THREE.Box3().setFromObject(jaw);
          const center = box.isEmpty() ? new THREE.Vector3() : box.getCenter(new THREE.Vector3());
          const radialDist = Math.hypot(center.x, center.z);
          const angle = radialDist > 0.04 ? Math.atan2(center.x, center.z) : (i * Math.PI) / 2 + Math.PI / 4;

          const outerPivot = new THREE.Group();
          outerPivot.rotation.y = angle;
          const animHolder = new THREE.Group();
          animHolder.userData.clampTravel = THREE.MathUtils.clamp(radialDist * 0.28, 0.18, 0.3);
          animHolder.userData.baseAngle = angle;

          const unrot = new THREE.Group();
          unrot.rotation.y = -angle;
          unrot.add(jaw);
          animHolder.add(unrot);
          outerPivot.add(animHolder);

          const jawMats = collectAndTagGlbMaterials(jaw, this.glbSkinnedMaterials);
          this.glbJawMaterials.push(...jawMats);
          this.glbClampingJaws.push(animHolder);
          this.jawsGlbGroup.add(outerPivot);
          mountedJaws++;
        }
        if (mountedJaws > 0) {
          this.jawsProceduralGroup.visible = false;
          this.jawsGlbGroup.visible = true;
        }

        // 6. FacetHousing_Template (preserve front bezel aperture at local z=0 so rear strut extends cleanly inward!)
        const housing = findGlbNode(glbRoot, 'FacetHousing_Template');
        if (housing) {
          detachNodeInRootSpace(housing, glbRoot);
          housing.position.set(0, 0, 0);
          const wrapper = new THREE.Group();
          wrapper.add(housing);
          wrapper.updateMatrixWorld(true);

          let box = new THREE.Box3().setFromObject(wrapper);
          let size = box.getSize(new THREE.Vector3());
          if (size.z > size.x * 1.2) {
            housing.rotation.y += Math.PI / 2;
            wrapper.updateMatrixWorld(true);
            box = new THREE.Box3().setFromObject(wrapper);
            size = box.getSize(new THREE.Vector3());
          }
          const center = box.getCenter(new THREE.Vector3());
          // Center X/Y cleanly, and align frontmost bezel face (box.max.z) flush at z = +0.028 behind faceMesh
          housing.position.set(-center.x, -center.y, 0.028 - box.max.z);

          wrapper.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.userData.sharedGlbGeometry = true;
            }
          });

          this.facetHousingTemplate = wrapper;
          this.facetHousingBaseSize.set(
            Math.max(0.1, size.x),
            Math.max(0.1, size.y),
            Math.max(0.02, size.z)
          );
          this.retrofitActiveFacetsWithGlbHousing();
        }

        // 7. Calibrator_Bezel (aligned cleanly behind dialFaceMesh so outer bevel frames it in 3D relief)
        let calibratorScale = 1.32;
        const calBezel = findGlbNode(glbRoot, 'Calibrator_Bezel');
        if (calBezel) {
          detachNodeInRootSpace(calBezel, glbRoot);
          const holder = new THREE.Group();
          holder.add(calBezel);
          holder.updateMatrixWorld(true);

          let box = new THREE.Box3().setFromObject(holder);
          let size = box.getSize(new THREE.Vector3());
          if (size.z > size.y * 1.35 && size.x > size.y * 1.35) {
            calBezel.rotation.x += Math.PI / 2;
            holder.updateMatrixWorld(true);
            box = new THREE.Box3().setFromObject(holder);
            size = box.getSize(new THREE.Vector3());
          }
          const maxXY = Math.max(size.x, size.y, 0.01);
          calibratorScale = 2.54 / maxXY;
          const center = box.getCenter(new THREE.Vector3());
          calBezel.position.sub(center);
          holder.scale.setScalar(calibratorScale);

          collectAndTagGlbMaterials(holder, this.glbSkinnedMaterials);
          this.calibratorBezelGlb.position.z = -0.025;
          this.calibratorBezelGlb.add(holder);
          this.calibratorBezelProcedural.visible = false;
        }

        // 8. Calibrator_Needle (preserve hub pivot at local origin when Blender already centered hub at y=0)
        const calNeedle = findGlbNode(glbRoot, 'Calibrator_Needle');
        if (calNeedle) {
          detachNodeInRootSpace(calNeedle, glbRoot);
          calNeedle.position.set(0, 0, 0);
          const holder = new THREE.Group();
          holder.add(calNeedle);
          holder.updateMatrixWorld(true);

          let box = new THREE.Box3().setFromObject(holder);
          let size = box.getSize(new THREE.Vector3());
          if (size.x > size.y * 1.25 && size.x >= size.z) {
            calNeedle.rotation.z += Math.PI / 2;
            holder.updateMatrixWorld(true);
            box = new THREE.Box3().setFromObject(holder);
            size = box.getSize(new THREE.Vector3());
          } else if (size.z > size.y * 1.25) {
            calNeedle.rotation.x -= Math.PI / 2;
            holder.updateMatrixWorld(true);
            box = new THREE.Box3().setFromObject(holder);
            size = box.getSize(new THREE.Vector3());
          }

          if (box.min.y < -0.05 && box.max.y > 0.3) {
            // Blender hub pivot is already cleanly at y = 0; match bezel scale!
            holder.scale.setScalar(calibratorScale);
          } else {
            const length = Math.max(size.y, 0.01);
            const scale = 1.28 / length;
            const center = box.getCenter(new THREE.Vector3());
            calNeedle.position.set(-center.x, -box.min.y - length * 0.16, -center.z);
            holder.scale.setScalar(scale);
          }

          collectAndTagGlbMaterials(holder, this.glbSkinnedMaterials);
          this.calibratorNeedleGlb.add(holder);
          this.calibratorNeedleProcedural.visible = false;
        }

        // Apply active Prism Atelier Skin onto all newly mounted Blender materials
        this.applyCurrentSkinToMaterials();
      },
      undefined,
      () => {
        // Graceful fallback: procedural precision rig remains visible without error
      }
    );
  }

  private attachGlbHousingToSlot(slot: FacetSlot, orbitRadius: number): void {
    if (!this.facetHousingTemplate || slot.glbHousing) return;
    const housingClone = this.facetHousingTemplate.clone(true);
    const mats = collectAndTagGlbMaterials(housingClone, undefined, true);
    const skin = PRISM_SKINS[this.currentSkinId];
    for (const m of mats) {
      applySkinSwatchToMaterial(m, skin, this.currentDomainColor);
    }

    const scaleX = (slot.width + 0.14) / this.facetHousingBaseSize.x;
    const scaleY = (slot.height + 0.12) / this.facetHousingBaseSize.y;
    const scaleZ = THREE.MathUtils.clamp((scaleX + scaleY) * 0.5, 0.45, 1.15);
    housingClone.scale.set(scaleX, scaleY, scaleZ);
    housingClone.position.z = orbitRadius + slot.forwardOffset;

    slot.glbHousing = housingClone;
    slot.glbHousingMats = mats;
    slot.frameMesh.visible = false;
    if (this.facetHousingBaseSize.z > 0.25) {
      // Sculpted Blender housing already includes its own rear gimbal mount strut
      slot.strutMesh.visible = false;
    }
    slot.pivot.add(housingClone);
  }

  private retrofitActiveFacetsWithGlbHousing(): void {
    if (!this.facetHousingTemplate || this.facetSlots.length === 0) return;
    const orbitRadius = this.facetSlots.length >= 5 ? 1.16 : 1.06;
    for (const slot of this.facetSlots) {
      this.attachGlbHousingToSlot(slot, orbitRadius);
    }
  }

  public setPrismSkin(skinId: PrismSkinId): void {
    const resolved: PrismSkinId = PRISM_SKINS[skinId] ? skinId : 'OBSIDIAN_BRASS';
    const changed = this.currentSkinId !== resolved;
    this.currentSkinId = resolved;
    this.applyCurrentSkinToMaterials();

    if (changed) {
      const palette = PRISM_SKINS[resolved];
      this.spawnPulseRing(palette.pulseHex, 2.5, 0.58);
      this.spawnSparks(new THREE.Vector3(0, 0.12, 0.4), 22, palette.pulseHex, 2.6);
    }
  }

  private applyCurrentSkinToMaterials(): void {
    const skin = PRISM_SKINS[this.currentSkinId];

    // Procedural base obsidian & brushed brass
    this.obsidianMat.color.setHex(skin.body.color);
    this.obsidianMat.metalness = skin.body.metalness;
    this.obsidianMat.roughness = skin.body.roughness;
    this.obsidianMat.emissive.setHex(skin.body.emissive);
    this.obsidianMat.emissiveIntensity = skin.body.emissiveIntensity;
    this.obsidianMat.needsUpdate = true;

    this.brassMat.color.setHex(skin.metal.color);
    this.brassMat.metalness = skin.metal.metalness;
    this.brassMat.roughness = skin.metal.roughness;
    this.brassMat.emissive.setHex(skin.metal.emissive);
    this.brassMat.emissiveIntensity = skin.metal.emissiveIntensity;
    this.brassMat.needsUpdate = true;

    if (!skin.useDomainAccent) {
      this.domainTrimMat.color.setHex(skin.accentColor);
      this.domainTrimMat.emissive.setHex(skin.accentEmissive);
      this.domainTrimMat.emissiveIntensity = skin.accentIntensity;
      this.sightlineBeamMat.color.setHex(skin.pulseHex);
    } else {
      this.domainTrimMat.color.copy(this.currentDomainColor);
      this.domainTrimMat.emissive.copy(this.currentDomainColor);
      this.domainTrimMat.emissiveIntensity = skin.accentIntensity;
      this.sightlineBeamMat.color.setHex(0xf7df9c);
    }

    // All mounted Blender `.glb` Hero Prism materials
    for (const mat of this.glbSkinnedMaterials) {
      applySkinSwatchToMaterial(mat, skin, this.currentDomainColor);
    }

    // All cloned Blender Facet Housing materials on active Answer Facets
    for (const slot of this.facetSlots) {
      for (const mat of slot.glbHousingMats) {
        applySkinSwatchToMaterial(mat, skin, this.currentDomainColor);
      }
    }
  }

  private buildCoreArchitecture(): void {
    // Fluted dark obsidian core column (12 architectural flutes) — procedural fallback
    const coreColumn = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 1.24, 12), this.obsidianMat);
    this.coreProceduralGroup.add(coreColumn);

    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI * 2) / 12;
      const flute = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.036, 1.16, 6), this.obsidianMat);
      flute.position.set(Math.cos(a) * 0.34, 0, Math.sin(a) * 0.34);
      this.coreProceduralGroup.add(flute);

      if (i % 3 === 0) {
        const seam = new THREE.Mesh(new THREE.BoxGeometry(0.018, 1.08, 0.025), this.domainTrimMat);
        seam.position.set(Math.cos(a + Math.PI / 12) * 0.33, 0, Math.sin(a + Math.PI / 12) * 0.33);
        seam.rotation.y = -(a + Math.PI / 12);
        this.coreProceduralGroup.add(seam);
      }
    }

    // Inner exploded blueprint architectural rings (revealed prominently at Tier 3!)
    for (const yOff of [-0.28, 0, 0.28]) {
      const innerRing = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.012, 8, 36), this.domainTrimMat);
      innerRing.rotation.x = Math.PI / 2;
      innerRing.position.y = yOff;
      this.coreProceduralGroup.add(innerRing);
    }

    this.coreGroup.add(this.coreProceduralGroup, this.coreGlbGroup);

    // Knurled Upper Brass Crown (procedural + GLB mount)
    const upperTorus = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.065, 14, 36), this.brassMat);
    upperTorus.rotation.x = Math.PI / 2;
    this.upperCrownProcedural.add(upperTorus);

    const upperCap = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.46, 0.14, 12), this.obsidianMat);
    upperCap.position.y = 0.08;
    this.upperCrownProcedural.add(upperCap);

    const upperFinial = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), this.brassMat);
    upperFinial.position.y = 0.24;
    this.upperCrownProcedural.add(upperFinial);

    for (let i = 0; i < 24; i++) {
      const a = (i * Math.PI * 2) / 24;
      const knurl = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.12, 0.03), this.brassMat);
      knurl.position.set(Math.cos(a) * 0.515, 0, Math.sin(a) * 0.515);
      knurl.rotation.y = -a;
      this.upperCrownProcedural.add(knurl);
    }
    this.upperCrown.add(this.upperCrownProcedural, this.upperCrownGlb);
    this.upperCrown.position.y = this.upperCrownBaseY;
    this.upperCrown.add(this.bossRelicMount);
    this.bossRelicMount.position.set(0, 0.58, 0);
    this.coreGroup.add(this.upperCrown);

    // Knurled Lower Brass Crown (procedural + GLB mount)
    const lowerTorus = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.07, 14, 36), this.brassMat);
    lowerTorus.rotation.x = Math.PI / 2;
    this.lowerCrownProcedural.add(lowerTorus);

    const lowerBase = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.34, 0.16, 12), this.obsidianMat);
    lowerBase.position.y = -0.09;
    this.lowerCrownProcedural.add(lowerBase);

    for (let i = 0; i < 24; i++) {
      const a = (i * Math.PI * 2) / 24;
      const knurl = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.13, 0.032), this.brassMat);
      knurl.position.set(Math.cos(a) * 0.555, 0, Math.sin(a) * 0.555);
      knurl.rotation.y = -a;
      this.lowerCrownProcedural.add(knurl);
    }
    this.lowerCrown.add(this.lowerCrownProcedural, this.lowerCrownGlb);
    this.lowerCrown.position.y = this.lowerCrownBaseY;
    this.coreGroup.add(this.lowerCrown);

    // 4 Obsidian Shutter Shields that iris open on Tier 2 Peel (procedural + GLB)
    this.shuttersGroup.position.y = 0.08;
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + Math.PI / 4;
      const pivot = new THREE.Group();
      pivot.rotation.y = a;

      const shield = new THREE.Mesh(
        new THREE.CylinderGeometry(0.48, 0.48, 0.72, 6, 1, false, -0.52, 1.04),
        this.obsidianMat
      );
      const trim = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.74, 0.04), this.brassMat);
      trim.position.set(0, 0, 0.485);
      shield.add(trim);

      const shieldHolder = new THREE.Group();
      shieldHolder.add(shield);
      pivot.add(shieldHolder);
      this.shutterPivots.push(shieldHolder);
      this.shuttersGroup.add(pivot);
    }
    this.shuttersGlbGroup.visible = false;
    this.coreGroup.add(this.shuttersGroup, this.shuttersGlbGroup);

    // Holographic Core Glyph mount (sits inside the shutters; rises & scales up at Tier 2+)
    this.glyphContainer.position.set(0, 0.12, 0);
    this.glyphContainer.scale.setScalar(0.001);
    this.coreGroup.add(this.glyphContainer);

    // 4 Outer Brass Clamping Jaws for Overclock Charging (procedural + GLB)
    for (let i = 0; i < 4; i++) {
      const jaw = new THREE.Group();
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      jaw.userData.baseAngle = angle;

      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.88, 0.095), this.brassMat);
      const tipTop = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, 0.24), this.brassMat);
      tipTop.position.set(0, 0.44, -0.1);
      const tipBot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, 0.24), this.brassMat);
      tipBot.position.set(0, -0.44, -0.1);
      const glowStrip = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.74, 0.03), this.domainTrimMat);
      glowStrip.position.set(0, 0, -0.055);
      jaw.add(arm, tipTop, tipBot, glowStrip);

      const r = 1.48;
      jaw.position.set(Math.sin(angle) * r, 0, Math.cos(angle) * r);
      jaw.rotation.y = angle;
      this.clampingJaws.push(jaw);
      this.jawsProceduralGroup.add(jaw);
    }
    this.jawsGlbGroup.visible = false;
    this.coreGroup.add(this.jawsProceduralGroup, this.jawsGlbGroup);
  }

  private buildChronoRing(): void {
    this.chronoGroup.position.set(0, -0.82, 0);
    this.chronoGroup.rotation.x = Math.PI / 2;

    const track = new THREE.Mesh(
      new THREE.RingGeometry(1.02, 1.09, 64),
      new THREE.MeshBasicMaterial({
        color: 0x262e42,
        transparent: true,
        opacity: 0.42,
        side: THREE.DoubleSide,
      })
    );
    this.chronoGroup.add(track);

    this.chronoArcMat = new THREE.MeshStandardMaterial({
      color: 0xf7df9c,
      emissive: 0xf7df9c,
      emissiveIntensity: 1.35,
      roughness: 0.2,
      metalness: 0.5,
      side: THREE.DoubleSide,
    });
    this.chronoArcMesh = new THREE.Mesh(new THREE.RingGeometry(1.01, 1.11, 72, 1, 0, Math.PI * 2), this.chronoArcMat);
    this.chronoArcMesh.position.z = -0.01;
    this.chronoGroup.add(this.chronoArcMesh);
  }

  private buildSightlineBeam(): void {
    // Sleek architectural Sightline reticle framing the front active facet (no hard milky cone seam)
    const reticleMat = new THREE.MeshBasicMaterial({
      color: 0xf7df9c,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.016, 0.016), reticleMat);
    topBar.position.set(0, 0.44, 1.24);
    const botBar = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.016, 0.016), reticleMat);
    botBar.position.set(0, -0.44, 1.24);
    const pointerTop = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.11, 4), reticleMat);
    pointerTop.rotation.x = Math.PI;
    pointerTop.position.set(0, 0.51, 1.24);
    this.sightlineBeamGroup.add(topBar, botBar, pointerTop);
  }

  private buildCalibratorDial(): void {
    this.calibratorGroup.visible = false;
    this.calibratorGroup.position.set(0, 0.08, 0.2);

    // Sculpted outer knurled brass astrolabe bezel (procedural fallback)
    const outerBezel = new THREE.Mesh(new THREE.TorusGeometry(1.22, 0.072, 16, 64), this.brassMat);
    const innerBezel = new THREE.Mesh(new THREE.TorusGeometry(1.06, 0.025, 12, 56), this.domainTrimMat);
    innerBezel.position.z = 0.03;
    this.calibratorBezelProcedural.add(outerBezel, innerBezel);

    for (let i = 0; i < 36; i++) {
      const a = (i * Math.PI * 2) / 36;
      const stud = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.075, 0.095), this.brassMat);
      stud.position.set(Math.cos(a) * 1.29, Math.sin(a) * 1.29, 0);
      stud.rotation.z = a + Math.PI / 2;
      this.calibratorBezelProcedural.add(stud);
    }

    const backDisc = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.09, 48), this.obsidianMat);
    backDisc.rotation.x = Math.PI / 2;
    backDisc.position.z = -0.04;
    this.calibratorBezelProcedural.add(backDisc);

    this.calibratorBezelGlb.position.z = 0.01;
    this.calibratorGroup.add(this.calibratorBezelProcedural, this.calibratorBezelGlb);

    this.dialFaceTex = createCalibratorDialTexture('#d4a853');
    const faceMat = new THREE.MeshStandardMaterial({
      map: this.dialFaceTex,
      roughness: 0.32,
      metalness: 0.25,
    });
    this.dialFaceMesh = new THREE.Mesh(new THREE.CircleGeometry(1.14, 64), faceMat);
    this.dialFaceMesh.position.z = 0.024;
    this.calibratorGroup.add(this.dialFaceMesh);

    this.toleranceConeMat = new THREE.MeshBasicMaterial({
      color: 0xf7df9c,
      transparent: true,
      opacity: 0.34,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.toleranceConeMesh = new THREE.Mesh(new THREE.RingGeometry(0.14, 1.12, 32, 1, 0, 0.5), this.toleranceConeMat);
    this.toleranceConeMesh.position.z = 0.045;
    this.calibratorGroup.add(this.toleranceConeMesh);

    const caliperMat = new THREE.MeshBasicMaterial({
      color: 0xfff5d4,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const borderGeo = new THREE.BoxGeometry(0.016, 1.04, 0.016);
    borderGeo.translate(0, 0.56, 0);
    this.toleranceBorderLeft = new THREE.Mesh(borderGeo, caliperMat);
    this.toleranceBorderLeft.position.z = 0.056;
    this.toleranceBorderRight = new THREE.Mesh(borderGeo, caliperMat);
    this.toleranceBorderRight.position.z = 0.056;
    this.calibratorGroup.add(this.toleranceBorderLeft, this.toleranceBorderRight);

    // Glowing white-gold rotating laser needle (procedural fallback + Blender GLB mount)
    const needleMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfff0be,
      emissiveIntensity: 2.2,
      roughness: 0.1,
    });
    const blade = new THREE.Mesh(new THREE.ConeGeometry(0.036, 1.14, 4), needleMat);
    blade.position.y = 0.57;
    const counterWeight = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.045, 0.24, 8), this.brassMat);
    counterWeight.position.y = -0.14;
    this.calibratorNeedleProcedural.add(blade, counterWeight);
    this.calibratorNeedlePivot.add(this.calibratorNeedleProcedural, this.calibratorNeedleGlb);
    this.calibratorNeedlePivot.position.z = 0.075;
    this.calibratorGroup.add(this.calibratorNeedlePivot);

    const boss = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.1, 16), this.brassMat);
    boss.rotation.x = Math.PI / 2;
    boss.position.z = 0.08;
    const bossGem = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 12), needleMat);
    bossGem.position.z = 0.12;
    this.calibratorGroup.add(boss, bossGem);

    this.updateCalibratorGeometry();
  }

  private buildCodexSystem(): void {
    this.codexGroup.visible = false;

    this.codexTopRing.position.y = 0.42;
    const topBand = new THREE.Mesh(new THREE.TorusGeometry(1.04, 0.045, 12, 48), this.brassMat);
    topBand.rotation.x = Math.PI / 2;
    const topInner = new THREE.Mesh(new THREE.CylinderGeometry(0.96, 0.96, 0.34, 24, 1, true), this.obsidianMat);
    this.codexTopRing.add(topBand, topInner);

    this.codexBottomRing.position.y = -0.34;
    const botBand = new THREE.Mesh(new THREE.TorusGeometry(1.06, 0.045, 12, 48), this.brassMat);
    botBand.rotation.x = Math.PI / 2;
    const botInner = new THREE.Mesh(new THREE.CylinderGeometry(0.98, 0.98, 0.34, 24, 1, true), this.obsidianMat);
    this.codexBottomRing.add(botBand, botInner);

    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      const mat = new THREE.MeshBasicMaterial({
        color: i === 0 ? 0xf7df9c : 0x5ce1e6,
        transparent: true,
        opacity: i === 0 ? 0.85 : 0.45,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.46, 8), mat);
      beam.position.set(Math.sin(a) * 1.07, 0.04, Math.cos(a) * 1.07);
      this.codexConduitMats.push(mat);
      this.codexConduitsGroup.add(beam);
    }

    const divider = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.018, 10, 48), this.domainTrimMat);
    divider.rotation.x = Math.PI / 2;
    divider.position.y = 0.04;

    this.codexGroup.add(this.codexTopRing, this.codexBottomRing, this.codexConduitsGroup, divider);
  }

  private buildGauntletSystem(): void {
    this.gauntletGroup.visible = false;
    this.gauntletGroup.position.set(0, 0.14, 0.35);

    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.94, 1.32, 0.08), this.brassMat);
    const backing = new THREE.Mesh(new THREE.BoxGeometry(1.86, 1.24, 0.09), this.obsidianMat);
    this.gauntletFaceMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.82, 1.2),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25, metalness: 0.1 })
    );
    this.gauntletFaceMesh.position.z = 0.052;

    for (const sx of [-0.94, 0.94]) {
      for (const sy of [-0.63, 0.63]) {
        const stud = new THREE.Mesh(new THREE.OctahedronGeometry(0.055, 0), this.domainTrimMat);
        stud.position.set(sx, sy, 0.04);
        this.gauntletPlateGroup.add(stud);
      }
    }

    this.gauntletPlateGroup.add(frame, backing, this.gauntletFaceMesh);
    this.gauntletGroup.add(this.gauntletPlateGroup);
  }

  private clearFacets(): void {
    for (const slot of this.facetSlots) {
      this.facetCarousel.remove(slot.pivot);
      slot.faceTexture.dispose();
      slot.faceMaterial.dispose();
      slot.frameMesh.geometry.dispose();
      slot.faceMesh.geometry.dispose();
      slot.strutMesh.geometry.dispose();
      for (const m of slot.glbHousingMats) {
        m.dispose();
      }
    }
    this.facetSlots = [];
  }

  private clearCodexPlates(): void {
    for (const p of this.codexTopPlates) {
      this.codexTopRing.remove(p.mesh);
      p.tex.dispose();
      p.mat.dispose();
      p.mesh.geometry.dispose();
    }
    for (const p of this.codexBottomPlates) {
      this.codexBottomRing.remove(p.mesh);
      p.tex.dispose();
      p.mat.dispose();
      p.mesh.geometry.dispose();
    }
    if (this.codexCrestMedallion) {
      this.codexTopRing.remove(this.codexCrestMedallion);
      disposeSubtree(
        this.codexCrestMedallion,
        new Set<THREE.Material>([this.brassMat, this.obsidianMat, this.domainTrimMat])
      );
      this.codexCrestMedallion = null;
    }
    this.codexTopPlates = [];
    this.codexBottomPlates = [];
  }

  private clearBossRelic(): void {
    while (this.bossRelicMount.children.length > 0) {
      const child = this.bossRelicMount.children[0];
      this.bossRelicMount.remove(child);
      disposeSubtree(child);
    }
  }

  private setGlyph(hint: GlyphHint): void {
    while (this.glyphContainer.children.length > 0) {
      const child = this.glyphContainer.children[0];
      this.glyphContainer.remove(child);
      disposeSubtree(child);
    }
    const glyph = createHolographicGlyph(hint, this.targetDomainColor);
    this.glyphContainer.add(glyph);
  }

  public applyDomainKit(domainId: DomainId): void {
    const meta = getDomainMeta(domainId);
    this.targetDomainColor.set(meta.accentHex);
    this.currentSecondaryColor.set(meta.secondaryHex);

    if (this.currentSkinId === 'OBSIDIAN_BRASS') {
      if (meta.factionAffinity === 'HORIZON') {
        this.obsidianMat.roughness = 0.16;
        this.obsidianMat.metalness = 0.48;
      } else if (meta.factionAffinity === 'SOVEREIGN') {
        this.obsidianMat.roughness = 0.24;
        this.obsidianMat.metalness = 0.34;
      } else {
        this.obsidianMat.roughness = 0.2;
        this.obsidianMat.metalness = 0.4;
      }
    }
  }

  public loadTitleShowcase(): void {
    this.isTitleShowcase = true;
    this.currentArchetype = 'SIGHTLINE_LOCK';
    this.sightlineGroup.visible = true;
    this.calibratorGroup.visible = false;
    this.codexGroup.visible = false;
    this.gauntletGroup.visible = false;
    this.coreGroup.visible = true;
    this.chronoGroup.visible = true;
    this.revealLockActive = false;
    this.peelTier = 1;
    this.peelProgress = 0;
    this.overclockActive = false;
    this.overclockProgress = 0;
    this.clearBossRelic();
    this.applyDomainKit(11);
    this.setGlyph('prism');
    this.setChronoProgress(1);

    this.buildSightlineFacets(['SPIN', 'PEEL', 'OVERCLOCK', 'THE MERIDIAN'], '#f7df9c', [], -1);
  }

  private buildSightlineFacets(
    texts: string[],
    accentHex: string,
    stressIndices: number[],
    redactionIndex: number
  ): void {
    this.clearFacets();
    const count = Math.max(2, texts.length);
    const orbitRadius = count >= 5 ? 1.16 : 1.06;
    const width = count >= 5 ? 1.12 : 1.24;
    const height = 0.62;

    for (let i = 0; i < count; i++) {
      const localAngle = (i * Math.PI * 2) / count;
      const pivot = new THREE.Group();
      pivot.rotation.y = localAngle;

      const stress = stressIndices.includes(i);
      const redacted = i === redactionIndex;
      const isActive = i === 0;

      const tex = createFacetTexture(texts[i], {
        active: isActive,
        accentHex,
        stressFracture: stress,
        redacted,
        indexLabel: `0${i + 1}`,
      });

      const faceMat = new THREE.MeshStandardMaterial({
        map: tex,
        emissiveMap: tex,
        emissive: new THREE.Color(isActive ? 0xfff5db : 0x5c667a),
        emissiveIntensity: isActive ? 0.48 : 0.14,
        roughness: 0.42,
        metalness: 0.06,
      });

      const frameGeo = new THREE.BoxGeometry(width + 0.08, height + 0.08, 0.052);
      const frameMesh = new THREE.Mesh(frameGeo, this.brassMat);
      frameMesh.position.z = orbitRadius;

      const faceGeo = new THREE.PlaneGeometry(width, height);
      const faceMesh = new THREE.Mesh(faceGeo, faceMat);
      faceMesh.position.z = orbitRadius + 0.048;

      const strutLen = orbitRadius - 0.34;
      const strutGeo = new THREE.CylinderGeometry(0.022, 0.026, strutLen, 8);
      strutGeo.rotateX(Math.PI / 2);
      const strutMesh = new THREE.Mesh(strutGeo, this.brassMat);
      strutMesh.position.z = 0.34 + strutLen / 2;

      pivot.add(strutMesh, frameMesh, faceMesh);
      this.facetCarousel.add(pivot);

      const slot: FacetSlot = {
        index: i,
        text: texts[i],
        pivot,
        frameMesh,
        glbHousing: null,
        glbHousingMats: [],
        faceMesh,
        faceMaterial: faceMat,
        faceTexture: tex,
        strutMesh,
        shattered: false,
        redacted,
        stressFracture: stress,
        correctHighlight: false,
        wrongHighlight: false,
        localAngle,
        forwardOffset: isActive ? 0.14 : 0,
        width,
        height,
      };
      this.attachGlbHousingToSlot(slot, orbitRadius);
      this.facetSlots.push(slot);
    }

    this.activeFacetIndex = 0;
    this.carouselAngle = 0;
    this.spinVelocity = 0;
    this.targetDetentIndex = 0;
  }

  private refreshFacetTexture(slot: FacetSlot): void {
    const isActive = slot.index === this.activeFacetIndex;
    const accentHex = `#${this.targetDomainColor.getHexString()}`;
    const newTex = createFacetTexture(slot.text, {
      active: isActive,
      accentHex,
      stressFracture: slot.stressFracture,
      redacted: slot.redacted,
      correct: slot.correctHighlight,
      wrong: slot.wrongHighlight,
      indexLabel: `0${slot.index + 1}`,
      overclockProgress: isActive && this.overclockActive ? this.overclockProgress : 0,
    });
    slot.faceTexture.dispose();
    slot.faceTexture = newTex;
    slot.faceMaterial.map = newTex;
    slot.faceMaterial.emissiveMap = newTex;

    if (slot.correctHighlight) {
      slot.faceMaterial.emissive.setHex(0x88ffd0);
      slot.faceMaterial.emissiveIntensity = 0.72;
    } else if (slot.wrongHighlight) {
      slot.faceMaterial.emissive.setHex(0xff6b7a);
      slot.faceMaterial.emissiveIntensity = 0.65;
    } else if (isActive) {
      slot.faceMaterial.emissive.setHex(0xfff4d6);
      slot.faceMaterial.emissiveIntensity = 0.48 + this.overclockProgress * 0.46;
    } else {
      slot.faceMaterial.emissive.setHex(0x525c73);
      slot.faceMaterial.emissiveIntensity = 0.14;
    }
    slot.faceMaterial.needsUpdate = true;
  }

  public loadQuestion(question: QuestionRecord, options: PrismLoadOptions = {}): void {
    this.isTitleShowcase = false;
    this.currentArchetype = question.archetype;
    this.revealLockActive = false;
    this.peelTier = 1;
    this.peelProgress = 0;
    this.overclockActive = false;
    this.overclockProgress = 0;
    this.overclockZoom = 0;
    this.gauntletFlying = false;
    this.gauntletFlightAge = 0;
    this.gauntletPlateGroup.position.set(0, 0, 0);
    this.gauntletPlateGroup.rotation.set(0.08, -0.06, 0);
    this.gauntletPlateGroup.scale.setScalar(1);

    const domainMeta = getDomainMeta(question.l0Domain);
    this.applyDomainKit(question.l0Domain);
    this.setGlyph(question.glyphHint || domainMeta.glyphShape);
    this.clearBossRelic();

    const isSightline =
      question.archetype === 'SIGHTLINE_LOCK' || question.archetype === 'HERO_ARTIFACT_SYNTHESIS';
    const isCalibrator = question.archetype === 'CALIBRATOR_DIAL';
    const isCodex = question.archetype === 'CODEX_DUAL_RING';
    const isGauntlet = question.archetype === 'GAUNTLET_SHATTER';

    this.sightlineGroup.visible = isSightline;
    this.calibratorGroup.visible = isCalibrator;
    this.codexGroup.visible = isCodex;
    this.gauntletGroup.visible = isGauntlet;
    this.coreGroup.visible = !isCalibrator;
    this.chronoGroup.visible = true;

    if (isSightline) {
      const facetTexts =
        options.facets && options.facets.length > 0
          ? options.facets
          : [question.answerCorrect, ...(question.distractors ?? []).map((d) => d.text)];

      this.buildSightlineFacets(
        facetTexts,
        domainMeta.accentHex,
        options.probabilityHintIndices ?? [],
        options.redactionIndex ?? -1
      );

      // Boss Hero Artifact Synthesis mounts the real Blender Hero Relic atop the Prism crown!
      const relicId = options.relicId ?? question.heroRelicId;
      if (question.archetype === 'HERO_ARTIFACT_SYNTHESIS' && relicId) {
        const relic = buildHeroRelicMesh(relicId);
        relic.scale.setScalar(0.46);
        this.bossRelicMount.add(relic);
      }
    } else if (isCalibrator) {
      if (this.dialFaceTex) this.dialFaceTex.dispose();
      const cal = question.calibratorExt;
      this.dialFaceTex = createCalibratorDialTexture(
        domainMeta.accentHex,
        cal?.minVal,
        cal?.maxVal,
        cal?.logScale
      );
      const mat = this.dialFaceMesh.material as THREE.MeshStandardMaterial;
      mat.map = this.dialFaceTex;
      mat.needsUpdate = true;

      this.setCalibratorState(options.calibratorInitialPos ?? 0.5, options.calibratorInitialTol ?? 0.18);
    } else if (isCodex) {
      this.clearCodexPlates();
      const topLabels =
        options.codexTop ?? question.codexExt?.pairs.map((p) => p.subject) ?? ['Alpha', 'Beta', 'Gamma'];
      const botLabels =
        options.codexBottom ??
        (question.codexExt
          ? [...question.codexExt.pairs.map((p) => p.target), question.codexExt.decoyTarget]
          : ['One', 'Two', 'Three', 'Four']);

      for (let i = 0; i < Math.min(3, topLabels.length); i++) {
        const a = (i * Math.PI) / 2;
        const tex = createRingLabelTexture(topLabels[i], domainMeta.accentHex, true, true);
        const mat = new THREE.MeshStandardMaterial({
          map: tex,
          emissiveMap: tex,
          emissive: new THREE.Color(0xfff0d0),
          emissiveIntensity: i === 0 ? 0.5 : 0.16,
          roughness: 0.4,
          metalness: 0.08,
        });
        const plate = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.38, 0.055), [
          this.brassMat,
          this.brassMat,
          this.brassMat,
          this.brassMat,
          mat,
          this.obsidianMat,
        ]);
        plate.position.set(Math.sin(a) * 1.07, 0, Math.cos(a) * 1.07);
        plate.rotation.y = a;
        this.codexTopRing.add(plate);
        this.codexTopPlates.push({ index: i, mesh: plate, mat, tex });
      }

      const crest = new THREE.Group();
      const crestAngle = (3 * Math.PI) / 2;
      const crestPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.05, 8), this.brassMat);
      crestPlate.rotation.x = Math.PI / 2;
      const crestGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.085, 0), this.domainTrimMat);
      crestGem.position.z = 0.035;
      crest.add(crestPlate, crestGem);
      crest.position.set(Math.sin(crestAngle) * 1.07, 0, Math.cos(crestAngle) * 1.07);
      crest.rotation.y = crestAngle;
      this.codexTopRing.add(crest);
      this.codexCrestMedallion = crest;

      for (let i = 0; i < Math.min(4, botLabels.length); i++) {
        const a = (i * Math.PI) / 2;
        const tex = createRingLabelTexture(botLabels[i], domainMeta.accentHex, false, true);
        const mat = new THREE.MeshStandardMaterial({
          map: tex,
          emissiveMap: tex,
          emissive: new THREE.Color(0xd2f7ff),
          emissiveIntensity: i === 0 ? 0.48 : 0.16,
          roughness: 0.4,
          metalness: 0.08,
        });
        const plate = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.38, 0.055), [
          this.brassMat,
          this.brassMat,
          this.brassMat,
          this.brassMat,
          mat,
          this.obsidianMat,
        ]);
        plate.position.set(Math.sin(a) * 1.09, 0, Math.cos(a) * 1.09);
        plate.rotation.y = a;
        this.codexBottomRing.add(plate);
        this.codexBottomPlates.push({ index: i, mesh: plate, mat, tex });
      }

      this.codexTopAngle = 0;
      this.codexTopVel = 0;
      this.codexBottomAngle = 0;
      this.codexBottomVel = 0;
      this.lastCodexAlignment = this.computeCodexAlignment();
    } else if (isGauntlet) {
      if (this.gauntletFaceTex) this.gauntletFaceTex.dispose();
      this.gauntletFaceTex = createGauntletPlateTexture(
        question.prompt,
        domainMeta.shortName,
        domainMeta.accentHex
      );
      const mat = this.gauntletFaceMesh.material as THREE.MeshStandardMaterial;
      mat.map = this.gauntletFaceTex;
      mat.emissiveMap = this.gauntletFaceTex;
      mat.emissive = new THREE.Color(0xffffff);
      mat.emissiveIntensity = 0.26;
      mat.needsUpdate = true;
    }

    this.spawnPulseRing(this.targetDomainColor.getHex(), 1.8, 0.45);
  }

  public spinBy(deltaX: number, ring?: 'TOP' | 'BOTTOM'): void {
    if (this.revealLockActive) return;

    if (this.currentArchetype === 'CODEX_DUAL_RING') {
      const deltaRad = deltaX * 0.0085;
      if (ring === 'TOP') {
        this.codexTopAngle += deltaRad;
        this.codexTopVel = THREE.MathUtils.clamp(deltaRad * 26, -9, 9);
      } else {
        this.codexBottomAngle += deltaRad;
        this.codexBottomVel = THREE.MathUtils.clamp(deltaRad * 26, -9, 9);
      }
      this.checkCodexChange();
      return;
    }

    if (this.currentArchetype === 'SIGHTLINE_LOCK' || this.currentArchetype === 'HERO_ARTIFACT_SYNTHESIS') {
      this.targetDetentIndex = null;
      const deltaRad = deltaX * 0.0082;
      this.carouselAngle += deltaRad;
      this.spinVelocity = THREE.MathUtils.clamp(deltaRad * 28, -11, 11);
      this.updateActiveFacetFromAngle();
    }
  }

  public stepFacet(direction: -1 | 1): void {
    if (this.revealLockActive) return;

    if (this.currentArchetype === 'CODEX_DUAL_RING') {
      const step = Math.round(-this.codexBottomAngle / (Math.PI / 2)) + direction;
      this.codexBottomAngle = -step * (Math.PI / 2);
      this.codexBottomVel = 0;
      this.checkCodexChange();
      return;
    }

    const n = this.facetSlots.length;
    if (n === 0) return;

    for (let offset = 1; offset <= n; offset++) {
      const candidate = (this.activeFacetIndex + direction * offset + n * 4) % n;
      if (!this.facetSlots[candidate].shattered) {
        this.targetDetentIndex = candidate;
        this.spinVelocity = 0;
        this.setActiveFacetIndex(candidate);
        break;
      }
    }
  }

  public getActiveFacetIndex(): number {
    return this.activeFacetIndex;
  }

  private setActiveFacetIndex(newIdx: number): void {
    if (newIdx === this.activeFacetIndex) return;
    const prevIdx = this.activeFacetIndex;
    this.activeFacetIndex = newIdx;
    if (this.facetSlots[prevIdx]) this.refreshFacetTexture(this.facetSlots[prevIdx]);
    if (this.facetSlots[newIdx]) this.refreshFacetTexture(this.facetSlots[newIdx]);
    this.onFacetChanged?.(newIdx);
  }

  private updateActiveFacetFromAngle(): void {
    let bestIdx = this.activeFacetIndex;
    let bestAbs = Infinity;
    for (const slot of this.facetSlots) {
      if (slot.shattered) continue;
      const worldA = normalizeAngle(slot.localAngle + this.carouselAngle);
      const absA = Math.abs(worldA);
      if (absA < bestAbs) {
        bestAbs = absA;
        bestIdx = slot.index;
      }
    }
    this.setActiveFacetIndex(bestIdx);
  }

  public peelTo(tier: PeelTier, shatterIndices?: number[]): void {
    this.peelTier = tier;
    if (tier === 2) {
      this.spawnPulseRing(this.targetDomainColor.getHex(), 2.2, 0.6);
      this.spawnSparks(new THREE.Vector3(0, 0.16, 0), 18, this.targetDomainColor.getHex(), 2.1);
    } else if (tier === 3) {
      this.spawnPulseRing(0xf7df9c, 2.8, 0.72);
      if (shatterIndices && shatterIndices.length > 0) {
        for (const idx of shatterIndices) {
          this.shatterFacet(idx, false);
        }
        if (this.facetSlots[this.activeFacetIndex]?.shattered) {
          this.stepFacet(1);
        }
      }
    }
  }

  private shatterFacet(index: number, crimson: boolean): void {
    const slot = this.facetSlots[index];
    if (!slot || slot.shattered) return;
    slot.shattered = true;
    slot.pivot.visible = false;

    const worldPos = new THREE.Vector3();
    slot.faceMesh.getWorldPosition(worldPos);
    const localPos = this.fxGroup.worldToLocal(worldPos.clone());
    this.spawnShards(localPos, 15, crimson ? 0xd63649 : 0x161f33, crimson ? 0xff4d60 : 0xd4a853);
    this.spawnSparks(localPos, 14, crimson ? 0xff4d60 : 0xf7df9c, 2.8);
  }

  public markFacetRedacted(index: number): void {
    const slot = this.facetSlots[index];
    if (!slot) return;
    slot.redacted = true;
    this.refreshFacetTexture(slot);
    const worldPos = new THREE.Vector3();
    slot.faceMesh.getWorldPosition(worldPos);
    this.spawnSparks(this.fxGroup.worldToLocal(worldPos), 12, 0xe64553, 1.8);
  }

  public setOverclockVisual(progress: number, active: boolean): void {
    const clamped = THREE.MathUtils.clamp(progress, 0, 1);
    const prevBucket = Math.floor(this.overclockProgress * 8);
    const nextBucket = Math.floor(clamped * 8);
    this.overclockProgress = clamped;
    this.overclockActive = active;
    this.overclockZoom = active ? clamped * 0.42 : 0;

    if (active && nextBucket !== prevBucket && this.facetSlots[this.activeFacetIndex]) {
      this.refreshFacetTexture(this.facetSlots[this.activeFacetIndex]);
    }
  }

  public cancelOverclockVisual(): void {
    if (this.overclockProgress > 0.1 || this.overclockActive) {
      this.spawnPulseRing(0x5ce1e6, 2.0, 0.42);
      this.spawnSparks(new THREE.Vector3(0, 0.1, 0.9), 12, 0x9ceeff, 2.0);
    }
    this.overclockProgress = 0;
    this.overclockActive = false;
    this.overclockZoom = 0;
    if (this.facetSlots[this.activeFacetIndex]) {
      this.refreshFacetTexture(this.facetSlots[this.activeFacetIndex]);
    }
  }

  public setCalibratorState(normalizedPos: number, toleranceRatio: number): void {
    this.calibratorPos = THREE.MathUtils.clamp(normalizedPos, 0, 1);
    this.calibratorTol = THREE.MathUtils.clamp(toleranceRatio, 0.02, 0.45);
    this.updateCalibratorGeometry();
  }

  public getCalibratorState(): { normalizedPos: number; toleranceRatio: number } {
    return {
      normalizedPos: this.calibratorPos,
      toleranceRatio: this.calibratorTol,
    };
  }

  private updateCalibratorGeometry(): void {
    const spanRad = (260 * Math.PI) / 180;
    const needleRotZ = (0.5 - this.calibratorPos) * spanRad;
    this.calibratorNeedlePivot.rotation.z = needleRotZ;

    const centerAngle = Math.PI / 2 + needleRotZ;
    const halfSpread = Math.max(0.035, this.calibratorTol * spanRad);
    const thetaStart = centerAngle - halfSpread;
    const thetaLength = halfSpread * 2;

    this.toleranceConeMesh.geometry.dispose();
    this.toleranceConeMesh.geometry = new THREE.RingGeometry(0.14, 1.12, 32, 1, thetaStart, thetaLength);

    this.toleranceBorderLeft.rotation.z = needleRotZ + halfSpread;
    this.toleranceBorderRight.rotation.z = needleRotZ - halfSpread;

    const bullseyeHeat = THREE.MathUtils.clamp(1 - (this.calibratorTol - 0.03) / 0.28, 0, 1);
    const wideCol = new THREE.Color(0xd4a853);
    const pinCol = new THREE.Color(0xfffbe0);
    this.toleranceConeMat.color.copy(wideCol).lerp(pinCol, bullseyeHeat);
    this.toleranceConeMat.opacity = 0.24 + bullseyeHeat * 0.42;
  }

  private computeCodexAlignment(): number[] {
    const topStep = ((Math.round(-this.codexTopAngle / (Math.PI / 2)) % 4) + 4) % 4;
    const botStep = ((Math.round(-this.codexBottomAngle / (Math.PI / 2)) % 4) + 4) % 4;
    return [0, 1, 2].map((i) => ((i - topStep + botStep) % 4 + 4) % 4);
  }

  public getCodexAlignment(): number[] {
    return this.computeCodexAlignment();
  }

  private checkCodexChange(): void {
    const next = this.computeCodexAlignment();
    if (
      next[0] !== this.lastCodexAlignment[0] ||
      next[1] !== this.lastCodexAlignment[1] ||
      next[2] !== this.lastCodexAlignment[2]
    ) {
      this.lastCodexAlignment = next;
      this.onCodexChanged?.(next);
      this.codexConduitMats.forEach((m) => {
        m.opacity = 1.0;
      });
    }
  }

  public triggerGauntletSwipe(action: 'TRUE' | 'FALSE' | 'CHALLENGE', correct: boolean): void {
    this.gauntletFlying = true;
    this.gauntletFlightAge = 0;

    if (action === 'TRUE') {
      this.gauntletFlightVel.set(7.2, 0.8, -1.2);
      this.gauntletFlightRotVel.set(0.5, 1.8, -3.2);
      this.spawnPulseRing(correct ? 0x57f2a8 : 0xff4c5e, 2.4, 0.5);
      this.spawnSparks(new THREE.Vector3(0.4, 0.1, 0.5), 26, correct ? 0xf7df9c : 0xff4c5e, 3.8);
    } else if (action === 'FALSE') {
      this.gauntletFlightVel.set(-7.2, -0.4, -1.2);
      this.gauntletFlightRotVel.set(-0.4, -2.0, 3.4);
      this.spawnPulseRing(correct ? 0x5ce1e6 : 0xff4c5e, 2.4, 0.5);
      this.spawnShards(new THREE.Vector3(-0.3, 0.1, 0.5), 14, 0x151e34, correct ? 0xd4a853 : 0xff4c5e);
    } else {
      this.gauntletFlightVel.set(0, 7.6, -0.8);
      this.gauntletFlightRotVel.set(-4.5, 2.2, 0.8);
      this.spawnPulseRing(correct ? 0xfff0b3 : 0xff4c5e, 3.0, 0.65);
      this.spawnSparks(new THREE.Vector3(0, 0.3, 0.5), 34, correct ? 0x5ce1e6 : 0xff4c5e, 4.4);
    }

    if (!correct) {
      this.cameraTrauma = Math.max(this.cameraTrauma, 0.55);
    }
  }

  public playRevealAnimation(result: {
    correct: boolean;
    backfired: boolean;
    correctIndex?: number;
    streak?: number;
  }): void {
    this.revealLockActive = true;
    this.overclockActive = false;
    this.overclockZoom = 0;

    if (result.correct) {
      const streak = result.streak ?? 1;
      this.spawnPulseRing(0xf7df9c, 3.2, 0.72);
      if (streak >= 3) {
        this.spawnPulseRing(0x57f2a8, 3.9, 0.92);
      }
      this.spawnSparks(new THREE.Vector3(0, 0.15, 0.9), 36 + Math.min(24, streak * 4), 0xf7df9c, 4.2);

      if (this.facetSlots.length > 0) {
        const winIdx = result.correctIndex ?? this.activeFacetIndex;
        for (const slot of this.facetSlots) {
          if (slot.index === winIdx) {
            slot.correctHighlight = true;
            this.targetDetentIndex = winIdx;
            this.activeFacetIndex = winIdx;
            this.refreshFacetTexture(slot);
          } else if (!slot.shattered) {
            this.shatterFacet(slot.index, false);
          }
        }
      }
    } else if (result.backfired) {
      this.cameraTrauma = 1.0;
      this.spawnPulseRing(0xff2e44, 3.8, 0.65);
      this.spawnPulseRing(0xff784f, 2.7, 0.5);
      this.spawnShards(new THREE.Vector3(0, 0.1, 0.9), 28, 0x26080f, 0xff3b52);
      this.spawnSparks(new THREE.Vector3(0, 0.1, 0.9), 34, 0xff4458, 4.8);

      const activeSlot = this.facetSlots[this.activeFacetIndex];
      if (activeSlot && !activeSlot.shattered) {
        activeSlot.wrongHighlight = true;
        this.refreshFacetTexture(activeSlot);
      }
    } else {
      this.cameraTrauma = Math.max(this.cameraTrauma, 0.42);
      this.spawnPulseRing(0xe64553, 2.2, 0.55);
      this.spawnSparks(new THREE.Vector3(0, 0.1, 0.9), 18, 0xe64553, 2.5);

      const activeSlot = this.facetSlots[this.activeFacetIndex];
      if (activeSlot && !activeSlot.shattered) {
        activeSlot.wrongHighlight = true;
        this.refreshFacetTexture(activeSlot);
      }
      if (result.correctIndex !== undefined && this.facetSlots[result.correctIndex]) {
        const rightSlot = this.facetSlots[result.correctIndex];
        rightSlot.correctHighlight = true;
        this.refreshFacetTexture(rightSlot);
      }
    }
  }

  public setChronoProgress(ratio: number): void {
    const r = THREE.MathUtils.clamp(ratio, 0, 1);
    this.chronoRatio = r;

    if (Math.abs(r - this.lastChronoGeoRatio) > 0.004 || (r === 0 && this.lastChronoGeoRatio !== 0)) {
      this.lastChronoGeoRatio = r;
      const sweep = Math.max(0.001, r * Math.PI * 2);
      this.chronoArcMesh.geometry.dispose();
      this.chronoArcMesh.geometry = new THREE.RingGeometry(1.01, 1.11, 64, 1, Math.PI / 2 - sweep / 2, sweep);
      this.chronoArcMesh.visible = r > 0.002;
    }

    if (r < 0.25) {
      const pulse = 0.5 + 0.5 * Math.sin(this.elapsed * 14);
      this.chronoArcMat.color.setHex(0xff3b52);
      this.chronoArcMat.emissive.setHex(0xff2942);
      this.chronoArcMat.emissiveIntensity = 1.6 + pulse * 1.1;
    } else if (r < 0.48) {
      const t = (0.48 - r) / 0.23;
      const col = new THREE.Color(0xf7df9c).lerp(new THREE.Color(0xf58e3b), t);
      this.chronoArcMat.color.copy(col);
      this.chronoArcMat.emissive.copy(col);
      this.chronoArcMat.emissiveIntensity = 1.45;
    } else {
      this.chronoArcMat.color.setHex(0xf7df9c);
      this.chronoArcMat.emissive.setHex(0xe8bf66);
      this.chronoArcMat.emissiveIntensity = 1.25;
    }
  }

  private spawnShards(origin: THREE.Vector3, count: number, colorHex: number, rimHex: number): void {
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: i % 3 === 0 ? rimHex : colorHex,
        emissive: rimHex,
        emissiveIntensity: i % 3 === 0 ? 1.1 : 0.35,
        metalness: 0.7,
        roughness: 0.2,
        transparent: true,
        opacity: 1,
      });
      const mesh = new THREE.Mesh(this.shardGeo, mat);
      mesh.position.copy(origin).add(
        new THREE.Vector3((Math.random() - 0.5) * 0.55, (Math.random() - 0.5) * 0.38, (Math.random() - 0.5) * 0.16)
      );
      mesh.scale.set(0.7 + Math.random() * 1.3, 0.4 + Math.random() * 0.9, 0.5 + Math.random() * 0.8);
      this.fxGroup.add(mesh);

      const outDir = new THREE.Vector3((Math.random() - 0.5) * 3.4, 0.6 + Math.random() * 2.6, 0.8 + Math.random() * 2.6);
      this.shards.push({
        mesh,
        mat,
        vel: outDir,
        rotVel: new THREE.Vector3(
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 14
        ),
        age: 0,
        life: 0.85 + Math.random() * 0.55,
      });
    }
  }

  private spawnSparks(origin: THREE.Vector3, count: number, colorHex: number, speed: number): void {
    const tex = getGlowSpriteTexture();
    for (let i = 0; i < count; i++) {
      const mat = new THREE.SpriteMaterial({
        map: tex,
        color: colorHex,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.position.copy(origin);
      const baseScale = 0.08 + Math.random() * 0.14;
      sprite.scale.setScalar(baseScale);
      this.fxGroup.add(sprite);

      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.35) * Math.PI;
      const spd = speed * (0.4 + Math.random() * 0.85);
      this.sparks.push({
        sprite,
        mat,
        vel: new THREE.Vector3(
          Math.cos(theta) * Math.cos(phi) * spd,
          Math.sin(phi) * spd + 0.6,
          Math.sin(theta) * Math.cos(phi) * spd * 0.7
        ),
        age: 0,
        life: 0.45 + Math.random() * 0.45,
        baseScale,
      });
    }
  }

  private spawnPulseRing(colorHex: number, maxScale: number, life: number): void {
    const mat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.5, 48), mat);
    mesh.position.set(0, 0.1, 0.35);
    this.fxGroup.add(mesh);
    this.pulseRings.push({ mesh, mat, age: 0, life, maxScale });
  }

  public update(dt: number): void {
    this.elapsed += dt;
    this.cameraTrauma = Math.max(0, this.cameraTrauma - dt * 1.8);

    const skin = PRISM_SKINS[this.currentSkinId];

    // Smooth domain material tinting (respects Atelier Skin accent override)
    this.currentDomainColor.lerp(this.targetDomainColor, Math.min(1, dt * 5));
    if (skin.useDomainAccent) {
      this.domainTrimMat.color.copy(this.currentDomainColor);
      this.domainTrimMat.emissive.copy(this.currentDomainColor);
      this.coreLight.color.copy(this.currentDomainColor);
      for (const mat of this.glbSkinnedMaterials) {
        if (mat.userData.skinRole === 'emissive') {
          mat.color.copy(this.currentDomainColor);
          mat.emissive.copy(this.currentDomainColor);
        }
      }
    } else {
      this.coreLight.color.setHex(skin.accentEmissive);
    }

    // Gentle sculptural levitation + Overclock micro-shake
    const hoverY = 0.05 + Math.sin(this.elapsed * 1.55) * 0.042;
    let shakeX = 0;
    let shakeY = 0;
    if (this.overclockActive && this.overclockProgress > 0.04) {
      const amp = 0.018 * this.overclockProgress * this.overclockProgress;
      shakeX = (Math.random() - 0.5) * amp * 2;
      shakeY = (Math.random() - 0.5) * amp * 2;
    }
    this.root.position.set(shakeX, hoverY + shakeY, 0);

    // Animate Peel Tier architectural choreography (Tier 1 -> 0, Tier 2 -> 1, Tier 3 -> 2)
    const targetPeel = this.peelTier === 3 ? 2 : this.peelTier === 2 ? 1 : 0;
    this.peelProgress = THREE.MathUtils.lerp(this.peelProgress, targetPeel, Math.min(1, dt * 6.5));

    const tier2Amt = THREE.MathUtils.clamp(this.peelProgress, 0, 1);
    const tier3Amt = THREE.MathUtils.clamp(this.peelProgress - 1, 0, 1);

    // Top crown lifts & spins faster when peeled; lower crown expands down at Tier 3 blueprint mode
    this.upperCrown.position.y = this.upperCrownBaseY + tier2Amt * 0.42 + tier3Amt * 0.24;
    this.upperCrown.rotation.y += dt * (0.28 + tier2Amt * 0.95 + this.overclockProgress * 2.2);
    this.lowerCrown.position.y = this.lowerCrownBaseY - tier3Amt * 0.24;
    this.lowerCrown.rotation.y -= dt * (0.22 + tier2Amt * 0.65);

    // 4 Procedural Shutter Shields iris open on Tier 2
    for (const holder of this.shutterPivots) {
      holder.position.z = tier2Amt * 0.26 + tier3Amt * 0.14;
      holder.rotation.x = -tier2Amt * 0.52;
      holder.position.y = tier2Amt * 0.08;
    }

    // 4 Real Blender Shutter Shields (Shutter_0..3) expand radially & flare open on Tier 2 Peel!
    for (const holder of this.glbShutterPivots) {
      holder.position.z = tier2Amt * 0.32 + tier3Amt * 0.18;
      holder.rotation.x = tier2Amt * 0.36;
      holder.position.y = tier2Amt * 0.09;
    }

    // 3D Holographic Core Glyph rises clearly above the front facet bezel & spins luminous inside the opened Prism!
    const glyphScale = THREE.MathUtils.lerp(0.001, 1.08 + tier3Amt * 0.18, tier2Amt);
    this.glyphContainer.scale.setScalar(glyphScale);
    this.glyphContainer.position.y = THREE.MathUtils.lerp(0.08, 0.68 + tier3Amt * 0.12, tier2Amt);
    this.glyphContainer.rotation.y += dt * 1.35;
    this.glyphContainer.rotation.x = Math.sin(this.elapsed * 1.1) * 0.18;
    this.coreLight.intensity = 1.4 + tier2Amt * 1.8 + this.overclockProgress * 2.2;

    // Outer Clamping Jaws squeeze inward & pulse molten gold during Hold-to-Overclock!
    const squeeze = this.overclockActive ? this.overclockProgress : 0;
    for (const jaw of this.clampingJaws) {
      const a = jaw.userData.baseAngle as number;
      const r = THREE.MathUtils.lerp(1.52, 1.08, squeeze);
      jaw.position.set(Math.sin(a) * r, 0, Math.cos(a) * r);
      jaw.rotation.z = squeeze * 0.08 * (a > Math.PI ? -1 : 1);
    }

    for (const jaw of this.glbClampingJaws) {
      const travel = (jaw.userData.clampTravel as number) ?? 0.32;
      jaw.position.z = -squeeze * travel;
      jaw.rotation.x = -squeeze * 0.09;
    }

    if (this.glbJawMaterials.length > 0) {
      const moltenPulse = squeeze > 0.01 ? squeeze * (0.85 + 0.15 * Math.sin(this.elapsed * 22)) : 0;
      for (const mat of this.glbJawMaterials) {
        const role = classifyGlbMaterial(mat);
        if (role === 'emissive') {
          const baseHex = skin.useDomainAccent ? this.currentDomainColor.getHex() : skin.accentEmissive;
          this.scratchBaseColor.setHex(baseHex);
          mat.emissive.copy(this.scratchBaseColor).lerp(this.scratchMoltenColor, moltenPulse);
          mat.emissiveIntensity = skin.accentIntensity + moltenPulse * 2.4;
        } else {
          const swatch = role === 'metal' ? skin.metal : role === 'titanium' ? skin.titanium : skin.body;
          this.scratchBaseColor.setHex(swatch.emissive);
          mat.emissive.copy(this.scratchBaseColor).lerp(this.scratchMoltenColor, moltenPulse * 0.85);
          mat.emissiveIntensity = swatch.emissiveIntensity + moltenPulse * 1.45;
        }
      }
    }

    // Animate Boss Hero Relic mounted atop the upper crown
    if (this.bossRelicMount.children.length > 0) {
      const relic = this.bossRelicMount.children[0];
      relic.rotation.y += dt * 0.65;
      relic.traverse((obj) => {
        const axis = obj.userData.spinAxis as THREE.Vector3 | undefined;
        if (axis) {
          obj.rotation.x += axis.x * dt;
          obj.rotation.y += axis.y * dt;
          obj.rotation.z += axis.z * dt;
        }
      });
    }

    // Sightline Lock carousel inertia + magnetic detent physics
    if (this.sightlineGroup.visible && this.facetSlots.length > 0) {
      if (this.isTitleShowcase) {
        this.carouselAngle += dt * 0.32;
        this.updateActiveFacetFromAngle();
      } else if (this.targetDetentIndex !== null) {
        const targetA = -this.facetSlots[this.targetDetentIndex].localAngle;
        const diff = shortestAngleDiff(this.carouselAngle, targetA);
        this.carouselAngle += diff * Math.min(1, dt * 11);
        if (Math.abs(diff) < 0.003) {
          this.carouselAngle = targetA;
          this.targetDetentIndex = null;
        }
      } else {
        this.carouselAngle += this.spinVelocity * dt;
        this.spinVelocity *= Math.exp(-5.4 * dt);

        if (Math.abs(this.spinVelocity) < 1.8) {
          const activeSlot = this.facetSlots[this.activeFacetIndex];
          if (activeSlot && !activeSlot.shattered) {
            const targetA = -activeSlot.localAngle;
            const diff = shortestAngleDiff(this.carouselAngle, targetA);
            this.carouselAngle += diff * Math.min(1, dt * 7.5);
          }
        }
        this.updateActiveFacetFromAngle();
      }

      this.facetCarousel.rotation.y = this.carouselAngle;

      const count = this.facetSlots.length;
      const baseR = count >= 5 ? 1.16 : 1.06;
      for (const slot of this.facetSlots) {
        if (slot.shattered) continue;
        const isFront = slot.index === this.activeFacetIndex;
        const targetOffset = isFront ? 0.16 + this.overclockProgress * 0.08 : -0.04;
        slot.forwardOffset = THREE.MathUtils.lerp(slot.forwardOffset, targetOffset, Math.min(1, dt * 10));
        slot.frameMesh.position.z = baseR + slot.forwardOffset;
        slot.faceMesh.position.z = baseR + slot.forwardOffset + 0.048;

        const targetScale = isFront ? 1.08 + this.overclockProgress * 0.04 : 0.94;
        const s = THREE.MathUtils.lerp(slot.frameMesh.scale.x, targetScale, Math.min(1, dt * 10));
        slot.frameMesh.scale.setScalar(s);
        slot.faceMesh.scale.setScalar(s);

        if (slot.glbHousing) {
          slot.glbHousing.position.z = baseR + slot.forwardOffset;
          const baseScaleX = (slot.width + 0.14) / this.facetHousingBaseSize.x;
          const baseScaleY = (slot.height + 0.12) / this.facetHousingBaseSize.y;
          const baseScaleZ = THREE.MathUtils.clamp((baseScaleX + baseScaleY) * 0.5, 0.45, 1.15);
          slot.glbHousing.scale.set(baseScaleX * s, baseScaleY * s, baseScaleZ * s);
        }
      }

      this.sightlineBeamMat.opacity =
        0.11 + Math.sin(this.elapsed * 2.8) * 0.025 + this.overclockProgress * 0.14;
    }

    // Codex Dual Ring inertia + 90° magnetic detent snapping
    if (this.codexGroup.visible) {
      this.codexTopAngle += this.codexTopVel * dt;
      this.codexTopVel *= Math.exp(-6.0 * dt);
      if (Math.abs(this.codexTopVel) < 1.6) {
        const snapTop = Math.round(this.codexTopAngle / (Math.PI / 2)) * (Math.PI / 2);
        this.codexTopAngle += shortestAngleDiff(this.codexTopAngle, snapTop) * Math.min(1, dt * 9);
      }
      this.codexTopRing.rotation.y = this.codexTopAngle;

      this.codexBottomAngle += this.codexBottomVel * dt;
      this.codexBottomVel *= Math.exp(-6.0 * dt);
      if (Math.abs(this.codexBottomVel) < 1.6) {
        const snapBot = Math.round(this.codexBottomAngle / (Math.PI / 2)) * (Math.PI / 2);
        this.codexBottomAngle += shortestAngleDiff(this.codexBottomAngle, snapBot) * Math.min(1, dt * 9);
      }
      this.codexBottomRing.rotation.y = this.codexBottomAngle;
      this.checkCodexChange();

      for (const p of this.codexTopPlates) {
        const frontness = Math.max(0, Math.cos(p.index * (Math.PI / 2) + this.codexTopAngle));
        p.mat.emissiveIntensity = 0.12 + frontness * frontness * 0.42;
      }
      for (const p of this.codexBottomPlates) {
        const frontness = Math.max(0, Math.cos(p.index * (Math.PI / 2) + this.codexBottomAngle));
        p.mat.emissiveIntensity = 0.12 + frontness * frontness * 0.42;
      }

      this.codexConduitMats.forEach((m, i) => {
        const baseOp = i === 0 ? 0.72 : 0.35;
        m.opacity = THREE.MathUtils.lerp(m.opacity, baseOp + Math.sin(this.elapsed * 4 + i) * 0.12, Math.min(1, dt * 6));
      });
    }

    // Calibrator Dial gentle breathing + Overclock kinetic scale surge
    if (this.calibratorGroup.visible) {
      const ocPulse = this.overclockActive ? 1 + this.overclockProgress * 0.045 : 1;
      const s = THREE.MathUtils.lerp(this.calibratorGroup.scale.x, ocPulse, Math.min(1, dt * 8));
      this.calibratorGroup.scale.setScalar(s);
      this.calibratorGroup.rotation.y = Math.sin(this.elapsed * 0.8) * 0.045;
      this.calibratorGroup.rotation.x = -0.05 + Math.cos(this.elapsed * 0.95) * 0.02;
    }

    // Gauntlet plate hover & swipe flight physics
    if (this.gauntletGroup.visible) {
      if (this.gauntletFlying) {
        this.gauntletFlightAge += dt;
        this.gauntletPlateGroup.position.addScaledVector(this.gauntletFlightVel, dt);
        this.gauntletPlateGroup.rotation.x += this.gauntletFlightRotVel.x * dt;
        this.gauntletPlateGroup.rotation.y += this.gauntletFlightRotVel.y * dt;
        this.gauntletPlateGroup.rotation.z += this.gauntletFlightRotVel.z * dt;
        const shrink = Math.max(0.01, 1 - this.gauntletFlightAge * 1.4);
        this.gauntletPlateGroup.scale.setScalar(shrink);
      } else {
        this.gauntletPlateGroup.rotation.y = Math.sin(this.elapsed * 1.1) * 0.08;
        this.gauntletPlateGroup.rotation.x = 0.06 + Math.cos(this.elapsed * 1.4) * 0.03;
      }
    }

    if (this.chronoRatio < 0.25 && this.chronoRatio > 0) {
      this.setChronoProgress(this.chronoRatio);
    }

    // Update FX: Shattered Shards with gravity
    for (let i = this.shards.length - 1; i >= 0; i--) {
      const s = this.shards[i];
      s.age += dt;
      if (s.age >= s.life) {
        this.fxGroup.remove(s.mesh);
        s.mat.dispose();
        this.shards.splice(i, 1);
        continue;
      }
      s.vel.y -= 9.8 * dt;
      s.mesh.position.addScaledVector(s.vel, dt);
      s.mesh.rotation.x += s.rotVel.x * dt;
      s.mesh.rotation.y += s.rotVel.y * dt;
      s.mesh.rotation.z += s.rotVel.z * dt;
      const fade = 1 - s.age / s.life;
      s.mat.opacity = fade;
      s.mesh.scale.multiplyScalar(0.992);
    }

    // Update FX: Spark particles
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const sp = this.sparks[i];
      sp.age += dt;
      if (sp.age >= sp.life) {
        this.fxGroup.remove(sp.sprite);
        sp.mat.dispose();
        this.sparks.splice(i, 1);
        continue;
      }
      sp.vel.multiplyScalar(Math.exp(-2.8 * dt));
      sp.vel.y -= 1.6 * dt;
      sp.sprite.position.addScaledVector(sp.vel, dt);
      const t = 1 - sp.age / sp.life;
      sp.mat.opacity = t;
      sp.sprite.scale.setScalar(sp.baseScale * (0.4 + t * 0.8));
    }

    // Update FX: Expanding Shockwave Pulse Rings
    for (let i = this.pulseRings.length - 1; i >= 0; i--) {
      const pr = this.pulseRings[i];
      pr.age += dt;
      if (pr.age >= pr.life) {
        this.fxGroup.remove(pr.mesh);
        pr.mesh.geometry.dispose();
        pr.mat.dispose();
        this.pulseRings.splice(i, 1);
        continue;
      }
      const p = pr.age / pr.life;
      const eased = 1 - Math.pow(1 - p, 3);
      pr.mesh.scale.setScalar(1 + eased * pr.maxScale);
      pr.mat.opacity = (1 - p) * 0.85;
    }
  }

  public dispose(): void {
    this.disposed = true;
    this.clearFacets();
    this.clearCodexPlates();
    this.clearBossRelic();
    for (const mat of this.glbSkinnedMaterials) {
      mat.dispose();
    }
    this.glbSkinnedMaterials.clear();
    this.dialFaceTex?.dispose();
    this.gauntletFaceTex?.dispose();
    this.shardGeo.dispose();
    this.obsidianMat.dispose();
    this.brassMat.dispose();
    this.domainTrimMat.dispose();
    this.sightlineBeamMat.dispose();
    this.chronoArcMat.dispose();
    this.toleranceConeMat.dispose();
  }
}
