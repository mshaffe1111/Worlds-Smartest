// ============================================================================
// WORLD'S SMARTEST v6.0 — 10 Radically Distinct 3D Architectural Stage Worlds
// Real background/midground 3D architecture, procedural PBR materials, custom
// 60fps GLSL shaders (Caustics, Aurora, Water Moat, Radar, Fire, God Rays),
// GPU atmospheric particles, and embedded Double-Leaf Stage Trapdoor Pit!
// ============================================================================

import * as THREE from 'three';
import type { StageAtmosphereThemeV6, StageWorldIdV6 } from '../contracts_v6';
import {
  createInvoluteBrassGear,
  createNixieTubeDisplay,
  disposeObject3DTree,
  getProceduralPbrTextureSet,
  SpringDamper1D,
  type NixieTubeDisplayHandleV6,
  type ProceduralSurfaceKindV6,
} from './HorologyCADKit';
import { getStageVisualRecipeV6, type StageEngineVisualRecipeV6 } from './StageThemesCatalogV6';

export interface BuiltStageWorldV6 {
  stageId: StageWorldIdV6;
  root: THREE.Group;
  trapdoorPitMount: THREE.Group;
  setTrapdoorOpen(open: boolean): void;
  getTrapdoorOpenProgress(): number;
  update(dtSec: number, elapsedSec: number): void;
  dispose(): void;
}

// ----------------------------------------------------------------------------
// 1. Custom 60fps Mobile-Ready Architectural GLSL Shaders
// ----------------------------------------------------------------------------

function createGradientSkyDome(
  zenithHex: number,
  horizonHex: number,
  nadirHex: number
): THREE.Mesh {
  const geom = new THREE.SphereGeometry(42, 32, 20);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uZenith: { value: new THREE.Color(zenithHex) },
      uHorizon: { value: new THREE.Color(horizonHex) },
      uNadir: { value: new THREE.Color(nadirHex) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vWorldDir;
      void main() {
        vWorldDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uZenith;
      uniform vec3 uHorizon;
      uniform vec3 uNadir;
      varying vec3 vWorldDir;
      void main() {
        float y = vWorldDir.y;
        vec3 col = y >= 0.0
          ? mix(uHorizon, uZenith, pow(clamp(y, 0.0, 1.0), 0.65))
          : mix(uHorizon, uNadir, pow(clamp(-y, 0.0, 1.0), 0.55));
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.name = 'StageSkyDome';
  return mesh;
}

/** Stage 09: Live GLSL Multi-Ribbon Aurora Borealis & Starfield Sky Dome */
function createAuroraSkyDome(): { mesh: THREE.Mesh; uniforms: { uTime: { value: number } } } {
  const uniforms = { uTime: { value: 0 } };
  const geom = new THREE.SphereGeometry(42, 40, 28);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms,
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      varying vec3 vDir;

      float hash21(vec2 p) {
        p = fract(p * vec2(234.34, 435.345));
        p += dot(p, p + 34.23);
        return fract(p.x * p.y);
      }

      void main() {
        vec3 d = normalize(vDir);
        float elev = clamp(d.y, 0.0, 1.0);
        vec3 zenith = vec3(0.015, 0.032, 0.095);
        vec3 horizon = vec3(0.055, 0.12, 0.22);
        vec3 col = mix(horizon, zenith, pow(elev, 0.65));

        // Crisp twinkling Arctic starfield
        if (d.y > 0.02) {
          vec2 starUv = vec2(atan(d.x, d.z) * 18.0, d.y * 42.0);
          vec2 id = floor(starUv);
          vec2 gv = fract(starUv) - 0.5;
          float rnd = hash21(id);
          if (rnd > 0.86) {
            float dist = length(gv - (vec2(rnd, fract(rnd * 31.7)) - 0.5) * 0.6);
            float twinkle = 0.65 + 0.35 * sin(uTime * 2.6 + rnd * 90.0);
            float star = smoothstep(0.11, 0.0, dist) * twinkle * smoothstep(0.02, 0.25, d.y);
            col += vec3(0.85, 0.93, 1.0) * star * 1.4;
          }
        }

        // Three undulating polar Aurora Borealis silk curtains (prominent across the open observatory slit)
        if (d.y > 0.02) {
          float az = atan(d.x, -d.z);
          float w1 = sin(az * 2.4 + uTime * 0.48 + sin(az * 5.2 - uTime * 0.25) * 0.65);
          float band1 = exp(-pow((d.y - (0.24 + w1 * 0.09)) * 6.8, 2.0));
          float ray1 = 0.62 + 0.38 * sin(az * 26.0 + uTime * 1.15 + w1 * 4.0);

          float w2 = cos(az * 3.1 - uTime * 0.38 + cos(az * 4.5 + uTime * 0.3) * 0.55);
          float band2 = exp(-pow((d.y - (0.37 + w2 * 0.10)) * 6.2, 2.0));
          float ray2 = 0.58 + 0.42 * sin(az * 34.0 - uTime * 0.95);

          float w3 = sin(az * 1.8 + uTime * 0.24);
          float band3 = exp(-pow((d.y - (0.14 + w3 * 0.06)) * 8.5, 2.0));

          vec3 auroraEmerald = vec3(0.14, 1.0, 0.64);
          vec3 auroraViolet  = vec3(0.58, 0.34, 1.0);
          vec3 auroraCyan    = vec3(0.18, 0.88, 0.98);

          float horizonFade = smoothstep(0.02, 0.14, d.y) * smoothstep(0.95, 0.55, d.y);
          col += auroraEmerald * band1 * ray1 * 1.35 * horizonFade;
          col += auroraViolet * band2 * ray2 * 0.98 * horizonFade;
          col += auroraCyan * band3 * 0.78 * horizonFade;
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.name = 'AuroraSkyDome';
  return { mesh, uniforms };
}

/** Volumetric Fresnel-faded theatrical light shaft cones */
function createVolumetricShaftMesh(
  topRadius: number,
  bottomRadius: number,
  height: number,
  colorHex: number,
  opacity: number
): THREE.Mesh {
  const geom = new THREE.CylinderGeometry(topRadius, bottomRadius, height, 24, 1, true);
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: new THREE.Color(colorHex) },
      uOpacity: { value: opacity },
      uTime: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vNormalView;
      varying vec3 vViewPos;
      void main() {
        vUv = uv;
        vNormalView = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vViewPos = -mv.xyz;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vNormalView;
      varying vec3 vViewPos;
      void main() {
        float fresnel = abs(dot(normalize(vNormalView), normalize(vViewPos)));
        float edge = pow(fresnel, 1.65);
        float vertical = smoothstep(0.0, 0.28, vUv.y) * smoothstep(1.0, 0.45, vUv.y);
        float dust = 0.88 + 0.12 * sin(vUv.y * 18.0 - uTime * 1.2 + vUv.x * 12.0);
        gl_FragColor = vec4(uColor, edge * vertical * dust * uOpacity);
      }
    `,
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.name = 'VolumetricLightShaft';
  return mesh;
}

/** Stage 08: Dual-layer animated underwater Voronoi caustic overlay */
function createUnderwaterCausticsOverlay(radius: number): {
  mesh: THREE.Mesh;
  uniforms: { uTime: { value: number } };
} {
  const uniforms = { uTime: { value: 0 } };
  const geom = new THREE.CircleGeometry(radius, 48);
  geom.rotateX(-Math.PI * 0.5);
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      varying vec2 vUv;

      float causticPattern(vec2 p, float t) {
        vec2 i = p;
        float c = 0.0;
        for (int n = 0; n < 3; n++) {
          float fn = float(n + 1);
          i = p + vec2(
            cos(t * 0.75 * fn - i.x * 1.4) + sin(t * 0.55 + i.y * 1.6),
            sin(t * 0.65 * fn - i.y * 1.5) + cos(t * 0.62 + i.x * 1.3)
          );
          c += 1.0 / max(0.08, length(vec2(p.x / (sin(i.x + t) * 1.6), p.y / (cos(i.y + t) * 1.6))));
        }
        return clamp(pow(c * 0.055, 2.2), 0.0, 1.0);
      }

      void main() {
        vec2 centered = vUv - 0.5;
        float dist = length(centered);
        float mask = smoothstep(0.5, 0.16, dist);
        // Keep central trapdoor seam clean
        vec2 p = centered * 9.5;
        float c1 = causticPattern(p, uTime * 0.65);
        float c2 = causticPattern(p * 1.35 + vec2(3.1, -1.7), -uTime * 0.48);
        float caustic = clamp((c1 + c2) * 0.68, 0.0, 1.0);
        vec3 col = mix(vec3(0.08, 0.72, 0.85), vec3(0.62, 1.0, 0.98), caustic);
        gl_FragColor = vec4(col * caustic * 0.55, caustic * mask * 0.52);
      }
    `,
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.y = 0.018;
  return { mesh, uniforms };
}

/** Stage 06: Kyoto Mirror-Black Water Moat reflecting glowing Shoji lanterns */
function createKyotoWaterMoatMesh(): {
  mesh: THREE.Mesh;
  uniforms: { uTime: { value: number } };
} {
  const uniforms = { uTime: { value: 0 } };
  const geom = new THREE.RingGeometry(4.35, 22.0, 64, 4);
  geom.rotateX(-Math.PI * 0.5);
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      varying vec3 vWorldPos;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      varying vec3 vWorldPos;
      void main() {
        float r = length(vWorldPos.xz);
        float ripple = sin(r * 4.5 - uTime * 1.8) * 0.5 + sin(vWorldPos.x * 2.8 + uTime * 1.1) * 0.5;
        vec3 baseWater = vec3(0.025, 0.032, 0.055);
        // Reflected warm honey shoji lantern bands behind the pavilion
        float lanternAngleA = exp(-pow(vWorldPos.x + 4.8 + ripple * 0.16, 2.0) * 0.14);
        float lanternAngleB = exp(-pow(vWorldPos.x - 4.8 + ripple * 0.16, 2.0) * 0.14);
        float lanternCenter = exp(-pow(vWorldPos.x + ripple * 0.14, 2.0) * 0.08);
        float backMask = smoothstep(2.0, -3.5, vWorldPos.z) * smoothstep(18.0, 5.0, r);
        float shimmer = 0.72 + 0.28 * sin(r * 9.0 - uTime * 2.4 + vWorldPos.x * 3.0);

        vec3 amberGlow = vec3(1.0, 0.66, 0.24) * (lanternAngleA + lanternAngleB) * backMask * shimmer * 0.55;
        vec3 vermilionGlow = vec3(0.86, 0.18, 0.10) * lanternCenter * backMask * 0.34;
        vec3 rippleSpec = vec3(0.28, 0.35, 0.52) * smoothstep(0.55, 0.98, ripple * 0.5 + 0.5) * 0.16;

        gl_FragColor = vec4(baseWater + amberGlow + vermilionGlow + rippleSpec, 1.0);
      }
    `,
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.y = -0.18;
  return { mesh, uniforms };
}

/** Stage 05: 1969 P7 Green-Phosphor Exponential-Decay Sweeping Radar Scope */
function createPhosphorRadarDisc(radius: number): {
  mesh: THREE.Mesh;
  uniforms: { uTime: { value: number } };
} {
  const uniforms = { uTime: { value: 0 } };
  const geom = new THREE.CircleGeometry(radius, 36);
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv * 2.0 - 1.0;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        float r = length(vUv);
        if (r > 1.0) discard;
        float angle = atan(vUv.y, vUv.x);
        float sweep = mod(uTime * 1.45, 6.2831853);
        float diff = mod(sweep - angle + 6.2831853, 6.2831853);
        float trail = exp(-diff * 2.35);
        float beamLine = smoothstep(0.055, 0.0, diff);

        // Concentric range rings & crosshairs
        float rings = smoothstep(0.018, 0.0, abs(fract(r * 4.0) - 0.5) - 0.465);
        float crossH = smoothstep(0.014, 0.0, abs(vUv.x)) + smoothstep(0.014, 0.0, abs(vUv.y));
        float grid = clamp(rings + crossH * 0.5, 0.0, 1.0);

        // Radar target blips lit as sweep passes
        float b1 = exp(-length(vUv - vec2(0.42, 0.28)) * 18.0) * (0.35 + 0.65 * trail);
        float b2 = exp(-length(vUv - vec2(-0.34, -0.45)) * 18.0) * (0.35 + 0.65 * trail);
        float b3 = exp(-length(vUv - vec2(-0.52, 0.36)) * 20.0) * (0.35 + 0.65 * trail);

        vec3 baseBg = vec3(0.02, 0.09, 0.04);
        vec3 phosphor = vec3(0.20, 0.98, 0.46);
        vec3 hotBlip = vec3(0.78, 1.0, 0.85);
        vec3 col = baseBg
          + phosphor * (trail * 0.58 + beamLine * 0.9 + grid * 0.22)
          + hotBlip * (b1 + b2 + b3) * 1.35;
        col *= smoothstep(1.0, 0.86, r);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const mesh = new THREE.Mesh(geom, mat);
  return { mesh, uniforms };
}

/** Stage 10: Sovereign Colosseum Living Flickering Brazier Fire Shader */
function createBrazierFlameMesh(scale = 1.0): {
  mesh: THREE.Mesh;
  uniforms: { uTime: { value: number }; uSeed: { value: number } };
} {
  const uniforms = {
    uTime: { value: 0 },
    uSeed: { value: Math.random() * 10 },
  };
  const geom = new THREE.ConeGeometry(0.42 * scale, 1.35 * scale, 16, 12, true);
  geom.translate(0, 0.62 * scale, 0);
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uSeed;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 pos = position;
        float sway = sin(uTime * 6.5 + pos.y * 4.5 + uSeed) * 0.08 * uv.y;
        float swayZ = cos(uTime * 5.2 + pos.y * 3.8 + uSeed * 1.7) * 0.08 * uv.y;
        pos.x += sway;
        pos.z += swayZ;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uSeed;
      varying vec2 vUv;
      void main() {
        float y = vUv.y;
        float lick = sin(vUv.x * 18.84 + uTime * 7.0 + uSeed) * 0.14
                   + sin(vUv.x * 31.4 - uTime * 10.5 + y * 8.0) * 0.08;
        float shape = smoothstep(0.98, 0.12, y + lick);
        float core = smoothstep(0.65, 0.0, y);
        vec3 crimson = vec3(0.95, 0.18, 0.03);
        vec3 orange  = vec3(1.0, 0.56, 0.08);
        vec3 yellow  = vec3(1.0, 0.96, 0.72);
        vec3 col = mix(crimson, orange, smoothstep(0.85, 0.25, y));
        col = mix(col, yellow, core * 0.85);
        float alpha = shape * smoothstep(0.0, 0.14, y) * 0.92;
        gl_FragColor = vec4(col * 1.45, alpha);
      }
    `,
  });
  return { mesh: new THREE.Mesh(geom, mat), uniforms };
}

// ----------------------------------------------------------------------------
// 2. GPU Atmospheric Particle System (All 10 `particleKind`s)
// ----------------------------------------------------------------------------

function createStageParticleSystem(
  kind: StageAtmosphereThemeV6['lighting']['particleKind'],
  theme: StageAtmosphereThemeV6
): { points: THREE.Points; uniforms: { uTime: { value: number } } } {
  const count = kind === 'COASTAL_MIST_BULBS' ? 140 : 220;
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const rad = 1.6 + Math.random() * 9.8;
    positions[i * 3] = Math.cos(angle) * rad;
    positions[i * 3 + 1] = 0.25 + Math.random() * 7.2;
    positions[i * 3 + 2] = Math.sin(angle) * rad;

    seeds[i * 3] = Math.random() * 100;
    seeds[i * 3 + 1] = 0.35 + Math.random() * 0.9;
    seeds[i * 3 + 2] = Math.random();

    sizes[i] =
      kind === 'COASTAL_MIST_BULBS'
        ? 14 + Math.random() * 18
        : kind === 'ABYSSAL_CAUSTIC_BUBBLES'
          ? 5 + Math.random() * 8
          : 3.5 + Math.random() * 5.8;
  }

  let colorA = new THREE.Color(theme.materials.jewelPrimaryHex);
  let colorB = new THREE.Color(theme.materials.jewelSecondaryHex);
  let riseSpeed = 0.28;
  let swirlAmp = 0.45;
  let isBubble = 0.0;

  switch (kind) {
    case 'GOLDEN_DUST':
      colorA = new THREE.Color(0xffdf96);
      colorB = new THREE.Color(0xffa747);
      riseSpeed = 0.12;
      swirlAmp = 0.42;
      break;
    case 'SUNBEAM_POLLEN':
      colorA = new THREE.Color(0xfffbe6);
      colorB = new THREE.Color(0xf2be9b);
      riseSpeed = -0.08;
      swirlAmp = 0.55;
      break;
    case 'CHAMPAGNE_SPARKLE':
      colorA = new THREE.Color(0xfff1bf);
      colorB = new THREE.Color(0x63f0b6);
      riseSpeed = 0.58;
      swirlAmp = 0.22;
      break;
    case 'COMPASS_FIREFLIES':
      colorA = new THREE.Color(0xffcf66);
      colorB = new THREE.Color(0x52e0c4);
      riseSpeed = 0.16;
      swirlAmp = 0.85;
      break;
    case 'OSCILLOSCOPE_STATIC':
      colorA = new THREE.Color(0xff842b);
      colorB = new THREE.Color(0x42f082);
      riseSpeed = 0.22;
      swirlAmp = 0.3;
      break;
    case 'LANTERN_EMBERS':
      colorA = new THREE.Color(0xffb547);
      colorB = new THREE.Color(0xf03d22);
      riseSpeed = 0.45;
      swirlAmp = 0.48;
      break;
    case 'COASTAL_MIST_BULBS':
      colorA = new THREE.Color(0x68d4de);
      colorB = new THREE.Color(0xffc978);
      riseSpeed = 0.14;
      swirlAmp = 0.65;
      break;
    case 'ABYSSAL_CAUSTIC_BUBBLES':
      colorA = new THREE.Color(0x8ff9f5);
      colorB = new THREE.Color(0x28bdd6);
      riseSpeed = 0.72;
      swirlAmp = 0.28;
      isBubble = 1.0;
      break;
    case 'AURORA_STARDUST':
      colorA = new THREE.Color(0x59f7b8);
      colorB = new THREE.Color(0xa682ff);
      riseSpeed = 0.18;
      swirlAmp = 0.58;
      break;
    case 'COLOSSEUM_FIRE_SPARKS':
      colorA = new THREE.Color(0xffdc66);
      colorB = new THREE.Color(0xff4c1a);
      riseSpeed = 0.92;
      swirlAmp = 0.52;
      break;
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3));
  geom.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

  const uniforms = {
    uTime: { value: 0 },
    uPixelRatio: { value: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 3) },
    uColorA: { value: colorA },
    uColorB: { value: colorB },
    uRiseSpeed: { value: riseSpeed },
    uSwirlAmp: { value: swirlAmp },
    uIsBubble: { value: isBubble },
  };

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms,
    vertexShader: /* glsl */ `
      attribute vec3 aSeed;
      attribute float aSize;
      uniform float uTime;
      uniform float uPixelRatio;
      uniform float uRiseSpeed;
      uniform float uSwirlAmp;
      varying float vMix;
      varying float vTwinkle;
      void main() {
        vec3 p = position;
        float t = uTime * aSeed.y + aSeed.x;
        p.y = mod(p.y + uTime * uRiseSpeed * aSeed.y + 7.5, 7.5) + 0.15;
        p.x += sin(t * 0.75) * uSwirlAmp;
        p.z += cos(t * 0.63 + aSeed.x) * uSwirlAmp;
        vMix = aSeed.z;
        vTwinkle = 0.55 + 0.45 * sin(uTime * (2.2 + aSeed.y * 2.0) + aSeed.x);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = aSize * uPixelRatio * (14.0 / max(1.5, -mv.z));
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform float uIsBubble;
      varying float vMix;
      varying float vTwinkle;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float r = length(c);
        if (r > 0.5) discard;
        vec3 col = mix(uColorA, uColorB, vMix);
        float alpha;
        if (uIsBubble > 0.5) {
          // Crisp hollow underwater bubble ring with specular glint
          float ring = smoothstep(0.5, 0.34, r) * smoothstep(0.18, 0.34, r);
          float spec = exp(-length(c - vec2(-0.14, 0.14)) * 12.0);
          alpha = (ring * 0.55 + spec * 0.85) * vTwinkle;
        } else {
          float glow = exp(-r * r * 14.0);
          alpha = glow * vTwinkle * 0.72;
        }
        gl_FragColor = vec4(col * 1.15, alpha);
      }
    `,
  });

  const points = new THREE.Points(geom, mat);
  points.frustumCulled = false;
  points.name = `StageParticles_${kind}`;
  return { points, uniforms };
}

// ----------------------------------------------------------------------------
// 3. Embedded Double-Leaf Physical 3D Stage Trapdoor & Clockwork Pit Shaft
// ----------------------------------------------------------------------------

interface TrapdoorSystemHandleV6 {
  root: THREE.Group;
  pitMount: THREE.Group;
  setOpen(open: boolean): void;
  getOpenProgress(): number;
  update(dtSec: number, elapsedSec: number): void;
}

function buildStageFloorWithTrapdoorPit(
  floorSurface: ProceduralSurfaceKindV6,
  theme: StageAtmosphereThemeV6,
  recipe: StageEngineVisualRecipeV6,
  floorClearcoat = 0.0,
  outerHalf = 9.0
): TrapdoorSystemHandleV6 {
  const root = new THREE.Group();
  root.name = 'StageFloorAndTrapdoorPit';

  const tileRepeat = Math.max(2, Math.round(outerHalf * 0.55));
  const floorPbr = getProceduralPbrTextureSet(floorSurface, {
    repeatX: tileRepeat,
    repeatY: tileRepeat,
    size: 256,
  });
  const floorMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    map: floorPbr.map,
    normalMap: floorPbr.normalMap,
    normalScale: new THREE.Vector2(0.55, 0.55),
    roughnessMap: floorPbr.roughnessMap,
    roughness: theme.materials.floorRoughness,
    metalness: theme.materials.floorMetalness,
    clearcoat: floorClearcoat,
    clearcoatRoughness: 0.08,
  });

  // 4-Slab floor deck framing a true open 2.2m x 1.8m central trapdoor shaft (ZERO z-fighting!)
  const holeHalfX = 1.1;
  const holeHalfZ = 0.9;
  const slabThick = 0.24;

  const makeSlab = (w: number, d: number, x: number, z: number) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, slabThick, d), floorMat);
    m.position.set(x, -slabThick * 0.5, z);
    m.receiveShadow = true;
    root.add(m);
  };

  // Back slab (-Z), Front slab (+Z), Left slab (-X), Right slab (+X)
  const depthSide = outerHalf - holeHalfZ;
  makeSlab(outerHalf * 2, depthSide, 0, -(holeHalfZ + depthSide * 0.5));
  makeSlab(outerHalf * 2, depthSide, 0, holeHalfZ + depthSide * 0.5);
  const widthSide = outerHalf - holeHalfX;
  makeSlab(widthSide, holeHalfZ * 2, -(holeHalfX + widthSide * 0.5), 0);
  makeSlab(widthSide, holeHalfZ * 2, holeHalfX + widthSide * 0.5, 0);

  // Stage-matched recessed brass/metal trapdoor coaming frame & hinges
  const trimMat = new THREE.MeshStandardMaterial({
    color: recipe.trapdoorFrameHex,
    roughness: theme.materials.trimRoughness,
    metalness: theme.materials.trimMetalness,
  });

  const frameBarH = 0.06;
  const frameBarT = 0.11;
  const northBar = new THREE.Mesh(new THREE.BoxGeometry(holeHalfX * 2 + frameBarT * 2, frameBarH, frameBarT), trimMat);
  northBar.position.set(0, 0.015, -holeHalfZ - frameBarT * 0.5);
  const southBar = northBar.clone();
  southBar.position.z = holeHalfZ + frameBarT * 0.5;
  const westBar = new THREE.Mesh(new THREE.BoxGeometry(frameBarT, frameBarH, holeHalfZ * 2), trimMat);
  westBar.position.set(-holeHalfX - frameBarT * 0.5, 0.015, 0);
  const eastBar = westBar.clone();
  eastBar.position.x = holeHalfX + frameBarT * 0.5;
  for (const b of [northBar, southBar, westBar, eastBar]) {
    b.castShadow = true;
    b.receiveShadow = true;
    root.add(b);
  }

  // Two Physical Hinged Trapdoor Leaves (pivoting along -X and +X brass hinge barrels)
  const leafPbr = getProceduralPbrTextureSet(floorSurface, { repeatX: 1, repeatY: 1, size: 256 });
  const leafTopMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    map: leafPbr.map,
    normalMap: leafPbr.normalMap,
    roughnessMap: leafPbr.roughnessMap,
    roughness: theme.materials.floorRoughness,
    metalness: theme.materials.floorMetalness,
    clearcoat: floorClearcoat,
  });
  const hazardMat = new THREE.MeshStandardMaterial({
    color: recipe.trapdoorHazardHex,
    roughness: 0.42,
    metalness: 0.35,
  });

  const leafLeftPivot = new THREE.Group();
  leafLeftPivot.position.set(-holeHalfX, -0.02, 0);
  const leafRightPivot = new THREE.Group();
  leafRightPivot.position.set(holeHalfX, -0.02, 0);

  const buildLeaf = (pivot: THREE.Group, sign: 1 | -1) => {
    const leafW = holeHalfX - 0.015;
    const leafD = holeHalfZ * 2 - 0.02;
    const body = new THREE.Mesh(new THREE.BoxGeometry(leafW, 0.06, leafD), leafTopMat);
    body.position.set(sign * leafW * 0.5, -0.01, 0);
    body.receiveShadow = true;
    body.castShadow = true;
    pivot.add(body);

    // Brass edge plate + under-leaf hazard warning strip
    const rim = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.07, leafD + 0.01), trimMat);
    rim.position.set(sign * (leafW - 0.03), -0.01, 0);
    pivot.add(rim);

    const underHazard = new THREE.Mesh(new THREE.BoxGeometry(leafW * 0.86, 0.022, leafD * 0.86), hazardMat);
    underHazard.position.set(sign * leafW * 0.5, -0.048, 0);
    pivot.add(underHazard);

    // Twin heavy cylindrical brass hinge barrels
    for (const hz of [-0.52, 0.52]) {
      const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.24, 12), trimMat);
      hinge.rotation.x = Math.PI * 0.5;
      hinge.position.set(0, 0.02, hz);
      pivot.add(hinge);
    }
  };
  buildLeaf(leafLeftPivot, 1);
  buildLeaf(leafRightPivot, -1);
  root.add(leafLeftPivot, leafRightPivot);

  // Clockwork Pit Shaft descending underneath the stage floor (Y = -0.2 .. -7.2)
  const pitGroup = new THREE.Group();
  pitGroup.name = 'ClockworkTrapdoorPit';
  const shaftWallMat = new THREE.MeshStandardMaterial({
    color: 0x16171c,
    roughness: 0.65,
    metalness: 0.72,
    side: THREE.BackSide,
  });
  const shaftCylinder = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.4, 7.2, 8, 1, true), shaftWallMat);
  shaftCylinder.position.y = -3.8;
  pitGroup.add(shaftCylinder);

  // Industrial steel shaft rings
  const steelRibMat = new THREE.MeshStandardMaterial({
    color: 0x353942,
    roughness: 0.42,
    metalness: 0.85,
  });
  for (let y = -1.1; y >= -6.3; y -= 1.3) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.05, 0.09, 8, 24), steelRibMat);
    ring.rotation.x = Math.PI * 0.5;
    ring.position.y = y;
    pitGroup.add(ring);
  }

  // Pit arena survival floor at Y = -6.9
  const pitFloorMat = new THREE.MeshStandardMaterial({
    color: 0x202229,
    roughness: 0.48,
    metalness: 0.68,
  });
  const pitFloor = new THREE.Mesh(new THREE.CylinderGeometry(3.35, 3.35, 0.3, 16), pitFloorMat);
  pitFloor.position.y = -7.05;
  pitFloor.receiveShadow = true;
  pitGroup.add(pitFloor);

  // 4 Counter-rotating Involute Brass Clockwork Gears lining the shaft walls!
  const pitGears: Array<{ mesh: THREE.Object3D; speed: number }> = [];
  const gearSpecs: Array<{ pos: [number, number, number]; rotY: number; radius: number; teeth: number; speed: number }> = [
    { pos: [-2.6, -2.2, -1.2], rotY: 0.4, radius: 1.15, teeth: 22, speed: 0.65 },
    { pos: [2.6, -3.4, -1.0], rotY: -0.45, radius: 1.25, teeth: 24, speed: -0.58 },
    { pos: [-2.4, -4.9, 1.1], rotY: 2.5, radius: 1.05, teeth: 18, speed: -0.78 },
    { pos: [2.5, -5.6, 1.0], rotY: -2.5, radius: 0.95, teeth: 16, speed: 0.88 },
  ];
  for (const gs of gearSpecs) {
    const gear = createInvoluteBrassGear({
      radius: gs.radius,
      teeth: gs.teeth,
      thickness: 0.14,
      spokes: 5,
      metalColorHex: recipe.trapdoorFrameHex,
      includeRubyBearing: true,
    });
    gear.rotation.z = Math.PI * 0.5;
    gear.rotation.y = gs.rotY;
    gear.position.set(...gs.pos);
    pitGroup.add(gear);
    pitGears.push({ mesh: gear, speed: gs.speed });
  }

  // Warm/crimson pulsing hazard beacon lamps inside the trapdoor pit
  const pitLight = new THREE.PointLight(recipe.pitBeaconHex, 0.0, 11.5, 1.5);
  pitLight.position.set(0, -3.4, 0.6);
  pitGroup.add(pitLight);

  const pitMount = new THREE.Group();
  pitMount.name = 'TrapdoorPitMount';
  pitMount.position.set(0, -6.85, 0);
  pitGroup.add(pitMount);
  root.add(pitGroup);

  // Under-damped spring so trapdoor leaves snap open with authentic heavy brass rebound!
  const hingeSpring = new SpringDamper1D(0, 145, 0.56);
  let isOpen = false;

  return {
    root,
    pitMount,
    setOpen(open: boolean) {
      if (open !== isOpen) {
        isOpen = open;
        hingeSpring.target = open ? 1.0 : 0.0;
        hingeSpring.impulse(open ? 2.4 : -1.2);
      }
    },
    getOpenProgress() {
      return Math.max(0, Math.min(1.15, hingeSpring.value));
    },
    update(dtSec: number, elapsedSec: number) {
      const openVal = Math.max(0, hingeSpring.update(dtSec));
      const angle = openVal * (Math.PI * 0.58); // 0° -> ~104° downward swing
      leafLeftPivot.rotation.z = -angle;
      leafRightPivot.rotation.z = angle;

      // Spin pit gears faster when trapdoor is open!
      const speedMult = 0.28 + openVal * 1.65;
      for (const g of pitGears) {
        g.mesh.rotation.x += g.speed * speedMult * dtSec;
      }

      // Illuminate clockwork pit smoothly as trapdoor swings open
      pitLight.intensity = openVal * (7.5 + Math.sin(elapsedSec * 7.5) * 1.8);
    },
  };
}

// ----------------------------------------------------------------------------
// 4. Individual Architectural Stage World Builders (Stages 01 .. 10)
//    All props strictly respect the Sacred Gameplay Clear-Zone (r > 3.8m)
// ----------------------------------------------------------------------------

type StageAnimatorFn = (dtSec: number, elapsedSec: number) => void;

function buildStage01VaudevillePalace(
  sceneGroup: THREE.Group,
  theme: StageAtmosphereThemeV6,
  animators: StageAnimatorFn[]
): void {
  const brassMat = new THREE.MeshStandardMaterial({
    color: theme.materials.trimMetalHex,
    roughness: 0.22,
    metalness: 0.94,
  });
  const velvetPbr = getProceduralPbrTextureSet('PLEATED_VELVET', { repeatX: 3, repeatY: 1, size: 256 });
  const velvetMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: velvetPbr.map,
    normalMap: velvetPbr.normalMap,
    normalScale: new THREE.Vector2(1.4, 1.4),
    roughnessMap: velvetPbr.roughnessMap,
    roughness: 0.86,
    metalness: 0.04,
  });
  const plasterMat = new THREE.MeshStandardMaterial({
    color: 0x3b171b,
    roughness: 0.65,
    metalness: 0.12,
  });
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xfff0c4,
    emissive: 0xffb347,
    emissiveIntensity: 3.4,
    roughness: 0.12,
  });

  // Curved brass stage-apron trim ring
  const apronTrim = new THREE.Mesh(new THREE.TorusGeometry(4.55, 0.065, 12, 48), brassMat);
  apronTrim.rotation.x = Math.PI * 0.5;
  apronTrim.position.y = 0.03;
  sceneGroup.add(apronTrim);

  // Scalloped Brass Edison Shell Footlights along the curved front-side apron
  const shellGeom = new THREE.CylinderGeometry(0.16, 0.21, 0.18, 12, 1, false, 0, Math.PI);
  const filamentGeom = new THREE.SphereGeometry(0.068, 10, 10);
  const footlightMatList: THREE.MeshStandardMaterial[] = [];
  for (let i = 0; i < 11; i++) {
    const a = -0.88 + (i / 10) * 1.76; // front semicircle
    const r = 3.92;
    const x = Math.sin(a) * r;
    const z = Math.cos(a) * r;
    const shell = new THREE.Mesh(shellGeom, brassMat);
    shell.position.set(x, 0.09, z);
    shell.rotation.y = a + Math.PI;
    sceneGroup.add(shell);

    const bMat = bulbMat.clone();
    footlightMatList.push(bMat);
    const bulb = new THREE.Mesh(filamentGeom, bMat);
    bulb.position.set(Math.sin(a) * (r - 0.09), 0.11, Math.cos(a) * (r - 0.09));
    sceneGroup.add(bulb);
  }

  // Grand 1928 Broadway Gilded Proscenium Arch behind the board (Z = -5.6)
  const prosceniumGroup = new THREE.Group();
  prosceniumGroup.position.set(0, 0, -5.6);

  // Asymmetric left/right fluted gilded columns & pilasters
  for (const sx of [-5.8, 5.8]) {
    const pilaster = new THREE.Mesh(new THREE.BoxGeometry(1.35, 8.2, 1.1), plasterMat);
    pilaster.position.set(sx, 4.1, 0);
    pilaster.castShadow = true;
    pilaster.receiveShadow = true;
    prosceniumGroup.add(pilaster);

    const giltTrim = new THREE.Mesh(new THREE.BoxGeometry(0.24, 8.2, 1.24), brassMat);
    giltTrim.position.set(sx - Math.sign(sx) * 0.56, 4.1, 0.05);
    prosceniumGroup.add(giltTrim);

    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.45, 1.45), brassMat);
    cap.position.set(sx, 8.05, 0.05);
    prosceniumGroup.add(cap);
  }

  // Sweeping gilded proscenium arch crown
  const archRing = new THREE.Mesh(new THREE.TorusGeometry(5.9, 0.36, 12, 40, Math.PI), brassMat);
  archRing.position.set(0, 4.6, 0.15);
  prosceniumGroup.add(archRing);

  const keystone = new THREE.Mesh(new THREE.OctahedronGeometry(0.68, 0), brassMat);
  keystone.scale.set(1.2, 0.85, 0.45);
  keystone.position.set(0, 10.45, 0.25);
  prosceniumGroup.add(keystone);

  // Heavy pleated crimson velvet side drapes & swagged top valance (snugly wrapped tie-backs)
  const leftCurtain = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.48, 8.8, 22, 6, true, -0.45, Math.PI * 1.25), velvetMat);
  leftCurtain.material.side = THREE.DoubleSide;
  leftCurtain.position.set(-4.65, 4.4, 0.55);
  const rightCurtain = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.48, 8.8, 22, 6, true, Math.PI * 0.2, Math.PI * 1.25), velvetMat);
  rightCurtain.position.set(4.65, 4.4, 0.55);
  prosceniumGroup.add(leftCurtain, rightCurtain);

  // Gold bullion tie-back ropes cinched tightly around each curtain waist
  for (const sx of [-4.65, 4.65]) {
    const tie = new THREE.Mesh(new THREE.TorusGeometry(1.32, 0.075, 8, 24), brassMat);
    tie.rotation.x = Math.PI * 0.5;
    tie.rotation.y = sx < 0 ? 0.14 : -0.14;
    tie.position.set(sx, 2.85, 0.55);
    prosceniumGroup.add(tie);
  }

  // Upper velvet pelmet valance
  const valance = new THREE.Mesh(new THREE.BoxGeometry(12.2, 1.35, 0.55), velvetMat);
  valance.position.set(0, 8.15, 0.65);
  prosceniumGroup.add(valance);

  // Rear velvet cyclorama backdrop deep behind arch
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(18, 12), velvetMat);
  backdrop.position.set(0, 5.2, -2.8);
  prosceniumGroup.add(backdrop);
  sceneGroup.add(prosceniumGroup);

  // Orchestra box balconies flanking left & right
  const mahogPbr = getProceduralPbrTextureSet('MAHOGANY_PLANKS', { repeatX: 2, repeatY: 1, size: 256 });
  const balconyMat = new THREE.MeshStandardMaterial({
    map: mahogPbr.map,
    normalMap: mahogPbr.normalMap,
    roughness: 0.45,
  });
  for (const sx of [-7.6, 7.6]) {
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.35, 6.5), balconyMat);
    box.position.set(sx, 3.6, -0.8);
    box.rotation.y = sx < 0 ? 0.22 : -0.22;
    sceneGroup.add(box);

    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 6.55), brassMat);
    rail.position.set(sx - Math.sign(sx) * 0.88, 4.35, -0.8);
    rail.rotation.y = sx < 0 ? 0.22 : -0.22;
    sceneGroup.add(rail);
  }

  // Twin warm Broadway volumetric spotlight beams
  const beamL = createVolumetricShaftMesh(0.45, 2.5, 10.5, 0xffcc78, 0.14);
  beamL.position.set(-2.4, 4.8, -1.6);
  beamL.rotation.z = -0.32;
  const beamR = createVolumetricShaftMesh(0.45, 2.5, 10.5, 0xffad66, 0.12);
  beamR.position.set(2.8, 4.8, -1.4);
  beamR.rotation.z = 0.28;
  sceneGroup.add(beamL, beamR);

  animators.push((_dt, elapsed) => {
    for (let i = 0; i < footlightMatList.length; i++) {
      footlightMatList[i].emissiveIntensity = 3.0 + Math.sin(elapsed * 2.1 + i * 0.55) * 0.45;
    }
    (beamL.material as THREE.ShaderMaterial).uniforms.uTime.value = elapsed;
    (beamR.material as THREE.ShaderMaterial).uniforms.uTime.value = elapsed + 1.4;
  });
}

function buildStage02GenevaConservatory(
  sceneGroup: THREE.Group,
  theme: StageAtmosphereThemeV6,
  animators: StageAnimatorFn[]
): void {
  const roseGoldMat = new THREE.MeshStandardMaterial({
    color: theme.materials.trimMetalHex,
    roughness: 0.18,
    metalness: 0.95,
  });
  const bluedSteelMat = new THREE.MeshStandardMaterial({
    color: 0x244a85,
    roughness: 0.18,
    metalness: 0.94,
  });
  const ironMat = new THREE.MeshStandardMaterial({
    color: 0x2a3c4d,
    roughness: 0.42,
    metalness: 0.82,
  });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xdff2ff,
    roughness: 0.08,
    metalness: 0.05,
    transparent: true,
    opacity: 0.22,
    clearcoat: 1.0,
    side: THREE.DoubleSide,
  });
  const carraraPbr = getProceduralPbrTextureSet('CARRARA_MARBLE', { repeatX: 2, repeatY: 2, size: 256 });
  const marbleMat = new THREE.MeshStandardMaterial({
    map: carraraPbr.map,
    normalMap: carraraPbr.normalMap,
    roughnessMap: carraraPbr.roughnessMap,
    roughness: 0.22,
  });

  // Inlaid rose-gold & blued-steel horological chapter rings on the Carrara marble deck
  const chapterRing = new THREE.Mesh(new THREE.RingGeometry(4.15, 4.42, 64), roseGoldMat);
  chapterRing.rotation.x = -Math.PI * 0.5;
  chapterRing.position.y = 0.012;
  sceneGroup.add(chapterRing);

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const tick = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.018, 0.48), bluedSteelMat);
    tick.position.set(Math.sin(a) * 4.28, 0.014, Math.cos(a) * 4.28);
    tick.rotation.y = a;
    sceneGroup.add(tick);
  }

  // Wrought-iron & glass Victorian Conservatory Barrel-Vault Dome Ribs
  for (let i = 0; i < 7; i++) {
    const a = (i / 6) * Math.PI - Math.PI * 0.5;
    const rib = new THREE.Mesh(new THREE.TorusGeometry(8.8, 0.11, 10, 40, Math.PI), ironMat);
    rib.rotation.y = a * 0.42;
    rib.position.set(0, 0, -2.0);
    sceneGroup.add(rib);
  }
  const glassCanopy = new THREE.Mesh(
    new THREE.SphereGeometry(8.88, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.48),
    glassMat
  );
  glassCanopy.position.set(0, 0, -2.0);
  sceneGroup.add(glassCanopy);

  // Flanking Carrara marble architectural colonnade piers (asymmetric clockwork pedestals)
  const pierCoords: Array<[number, number, number]> = [
    [-5.6, 0, -4.6],
    [5.8, 0, -4.2],
    [-7.0, 0, 0.4],
    [7.2, 0, -0.2],
  ];
  for (const [px, , pz] of pierCoords) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 6.4, 16), marbleMat);
    col.position.set(px, 3.2, pz);
    col.castShadow = true;
    col.receiveShadow = true;
    sceneGroup.add(col);
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.055, 8, 20), roseGoldMat);
    band.rotation.x = Math.PI * 0.5;
    band.position.set(px, 5.9, pz);
    sceneGroup.add(band);
  }

  // GIANT OVERHEAD ROTATING ROSE-GOLD & BLUED-STEEL TOURBILLON ESCAPEMENT!
  const tourbillonCage = new THREE.Group();
  tourbillonCage.position.set(0.45, 5.4, -4.8);
  tourbillonCage.rotation.x = 0.48;
  tourbillonCage.rotation.z = -0.08;

  const mainGear = createInvoluteBrassGear({
    radius: 2.35,
    teeth: 36,
    thickness: 0.16,
    spokes: 6,
    metalColorHex: 0xe39e7a,
    hubColorHex: 0x244a85,
    includeRubyBearing: true,
  });
  mainGear.rotation.x = Math.PI * 0.5;
  tourbillonCage.add(mainGear);

  const escapeGear = createInvoluteBrassGear({
    radius: 1.25,
    teeth: 18,
    thickness: 0.14,
    spokes: 5,
    metalColorHex: 0x3b6cb8,
    hubColorHex: 0xe39e7a,
    includeRubyBearing: true,
  });
  escapeGear.rotation.x = Math.PI * 0.5;
  escapeGear.position.set(-1.95, 0.4, 0.25);
  tourbillonCage.add(escapeGear);

  const balanceWheel = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.08, 12, 42), roseGoldMat);
  balanceWheel.position.z = 0.24;
  tourbillonCage.add(balanceWheel);

  const bridgeBar = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.28, 0.18), bluedSteelMat);
  bridgeBar.position.z = 0.34;
  tourbillonCage.add(bridgeBar);
  sceneGroup.add(tourbillonCage);

  // Angled Swiss Alpine Daylight Sunbeams
  const sunA = createVolumetricShaftMesh(0.8, 3.2, 11.5, 0xfff6dc, 0.13);
  sunA.position.set(2.4, 5.2, -1.8);
  sunA.rotation.z = 0.36;
  const sunB = createVolumetricShaftMesh(0.6, 2.4, 10.5, 0xd4ecff, 0.1);
  sunB.position.set(-2.6, 5.0, -2.5);
  sunB.rotation.z = 0.32;
  sceneGroup.add(sunA, sunB);

  animators.push((dt, elapsed) => {
    // Authentic stepped Swiss 4Hz escapement tick cadence + smooth secondary rotation
    const tickStep = Math.floor(elapsed * 4) + Math.pow(elapsed * 4 - Math.floor(elapsed * 4), 4);
    mainGear.rotation.y = tickStep * 0.032;
    escapeGear.rotation.y = -tickStep * 0.064;
    balanceWheel.rotation.z = Math.sin(elapsed * 5.2) * 0.65;
    (sunA.material as THREE.ShaderMaterial).uniforms.uTime.value = elapsed;
    (sunB.material as THREE.ShaderMaterial).uniforms.uTime.value = elapsed * 0.8;
    void dt;
  });
}

function buildStage03MonteCarloSalon(
  sceneGroup: THREE.Group,
  theme: StageAtmosphereThemeV6,
  animators: StageAnimatorFn[]
): void {
  const goldMat = new THREE.MeshStandardMaterial({
    color: theme.materials.trimMetalHex,
    roughness: 0.16,
    metalness: 0.96,
  });
  const walnutPbr = getProceduralPbrTextureSet('WALNUT_BURL', { repeatX: 3, repeatY: 1, size: 256 });
  const walnutMat = new THREE.MeshStandardMaterial({
    map: walnutPbr.map,
    normalMap: walnutPbr.normalMap,
    roughnessMap: walnutPbr.roughnessMap,
    roughness: 0.24,
    metalness: 0.08,
  });
  const crystalMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    emissive: 0xffe4aa,
    emissiveIntensity: 0.48,
    roughness: 0.04,
    metalness: 0.06,
    clearcoat: 1.0,
    ior: 1.62,
  });
  const rivieraGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x16386e,
    emissive: 0x0c244f,
    emissiveIntensity: 0.65,
    roughness: 0.1,
    metalness: 0.15,
    clearcoat: 0.9,
  });

  // Burled walnut octagonal casino gaming bumper rail & brass chip gutter surrounding apron
  const railRing = new THREE.Mesh(new THREE.TorusGeometry(4.55, 0.26, 12, 8), walnutMat);
  railRing.rotation.x = Math.PI * 0.5;
  railRing.rotation.z = Math.PI / 8;
  railRing.position.y = 0.14;
  railRing.castShadow = true;
  railRing.receiveShadow = true;
  sceneGroup.add(railRing);

  const innerGoldLine = new THREE.Mesh(new THREE.RingGeometry(3.85, 3.94, 48), goldMat);
  innerGoldLine.rotation.x = -Math.PI * 0.5;
  innerGoldLine.position.y = 0.014;
  sceneGroup.add(innerGoldLine);

  // Decorative high-roller clay chip stacks tucked along outer walnut rail corners
  const chipRedMat = new THREE.MeshStandardMaterial({ color: 0xb81e30, roughness: 0.35 });
  const chipGoldMat = new THREE.MeshStandardMaterial({ color: 0xf4c754, roughness: 0.25, metalness: 0.85 });
  for (let s = 0; s < 4; s++) {
    const a = -0.95 + s * 0.64;
    const cx = Math.sin(a) * 4.52;
    const cz = -Math.cos(a) * 4.52;
    const stackH = 4 + (s % 3) * 2;
    for (let k = 0; k < stackH; k++) {
      const chip = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.13, 0.032, 16),
        k % 2 === 0 ? chipRedMat : chipGoldMat
      );
      chip.position.set(cx, 0.38 + k * 0.034, cz);
      sceneGroup.add(chip);
    }
  }

  // Curved Riviera Salon Colonnade with tall arched twilight windows
  for (let i = -2; i <= 2; i++) {
    const a = i * 0.36;
    const wx = Math.sin(a) * 8.4;
    const wz = -Math.cos(a) * 8.4;

    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.35, 7.6, 0.36), walnutMat);
    frame.position.set(wx, 3.8, wz);
    frame.rotation.y = -a;
    sceneGroup.add(frame);

    const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.72, 6.2), rivieraGlassMat);
    glass.position.set(Math.sin(a) * 8.2, 3.9, -Math.cos(a) * 8.2);
    glass.rotation.y = -a;
    sceneGroup.add(glass);

    const arch = new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.08, 8, 20, Math.PI), goldMat);
    arch.position.set(Math.sin(a) * 8.15, 6.4, -Math.cos(a) * 8.15);
    arch.rotation.y = -a;
    sceneGroup.add(arch);
  }

  // GRAND TIERED CRYSTAL & BRASS CHANDELIER overhead (framed crisply inside viewport)
  const chandelier = new THREE.Group();
  chandelier.position.set(0, 5.15, -2.2);

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 2.8, 12), goldMat);
  stem.position.y = 1.4;
  chandelier.add(stem);

  const tierSpecs = [
    { y: 0.4, r: 2.15, count: 16 },
    { y: -0.22, r: 1.45, count: 12 },
    { y: -0.78, r: 0.78, count: 8 },
  ];
  const prismGeom = new THREE.OctahedronGeometry(0.14, 0);
  prismGeom.scale(0.55, 1.85, 0.55);

  for (const tier of tierSpecs) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(tier.r, 0.055, 10, 36), goldMat);
    ring.rotation.x = Math.PI * 0.5;
    ring.position.y = tier.y;
    chandelier.add(ring);

    for (let k = 0; k < tier.count; k++) {
      const a = (k / tier.count) * Math.PI * 2;
      const prism = new THREE.Mesh(prismGeom, crystalMat);
      prism.position.set(Math.cos(a) * tier.r, tier.y - 0.24, Math.sin(a) * tier.r);
      chandelier.add(prism);
    }
  }
  sceneGroup.add(chandelier);

  animators.push((dt, elapsed) => {
    chandelier.rotation.y += dt * 0.12;
    crystalMat.emissiveIntensity = 0.42 + Math.sin(elapsed * 2.4) * 0.12;
  });
}

function buildStage04CartographicRotunda(
  sceneGroup: THREE.Group,
  _theme: StageAtmosphereThemeV6,
  animators: StageAnimatorFn[]
): void {
  const verdigrisPbr = getProceduralPbrTextureSet('VERDIGRIS_COPPER', { repeatX: 3, repeatY: 1, size: 256 });
  const verdigrisMat = new THREE.MeshStandardMaterial({
    map: verdigrisPbr.map,
    normalMap: verdigrisPbr.normalMap,
    roughnessMap: verdigrisPbr.roughnessMap,
    roughness: 0.42,
    metalness: 0.78,
  });
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xd9a148,
    roughness: 0.24,
    metalness: 0.94,
  });
  const sapphireGlobeMat = new THREE.MeshPhysicalMaterial({
    color: 0x164e8c,
    emissive: 0x0a2448,
    emissiveIntensity: 0.35,
    roughness: 0.18,
    metalness: 0.15,
    clearcoat: 0.85,
  });
  const flameGlowMat = new THREE.MeshStandardMaterial({
    color: 0xffd578,
    emissive: 0xff9d2e,
    emissiveIntensity: 4.0,
  });

  // Raised brass 16-point Mariner's Compass Rose rim on the teak deck
  const compassRim = new THREE.Mesh(new THREE.RingGeometry(4.1, 4.42, 48), brassMat);
  compassRim.rotation.x = -Math.PI * 0.5;
  compassRim.position.y = 0.015;
  sceneGroup.add(compassRim);

  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const isCardinal = i % 4 === 0;
    const needle = new THREE.Mesh(
      new THREE.ConeGeometry(isCardinal ? 0.18 : 0.1, isCardinal ? 0.82 : 0.45, 4),
      isCardinal ? brassMat : verdigrisMat
    );
    needle.rotation.x = Math.PI * 0.5;
    needle.rotation.z = -a;
    needle.position.set(Math.sin(a) * 4.7, 0.04, Math.cos(a) * 4.7);
    sceneGroup.add(needle);
  }

  // MASSIVE VERDIGRIS-COPPER ASTROLABE MERIDIAN ARCHES spanning overhead
  for (let i = 0; i < 4; i++) {
    const arch = new THREE.Mesh(new THREE.TorusGeometry(7.8, 0.24, 12, 48, Math.PI), verdigrisMat);
    arch.rotation.y = (i / 4) * Math.PI + 0.18;
    arch.position.y = 0.0;
    arch.castShadow = true;
    sceneGroup.add(arch);
  }

  // Slowly rotating tilted brass Ecliptic Astrolabe Horizon Ring overhead
  const eclipticRing = new THREE.Group();
  eclipticRing.position.set(0, 5.2, -1.2);
  eclipticRing.rotation.set(0.32, 0.2, 0.16);
  const bigRing = new THREE.Mesh(new THREE.TorusGeometry(5.6, 0.16, 12, 56), brassMat);
  bigRing.rotation.x = Math.PI * 0.5;
  eclipticRing.add(bigRing);
  sceneGroup.add(eclipticRing);

  // Flanking Sapphire Celestial Globes in Brass Armillary Cradles (asymmetric placement)
  const globeSpots: Array<[number, number, number]> = [
    [-5.4, 0, -3.6],
    [5.8, 0, -2.8],
  ];
  const globes: THREE.Mesh[] = [];
  for (const [gx, , gz] of globeSpots) {
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.62, 1.55, 8), verdigrisMat);
    ped.position.set(gx, 0.78, gz);
    sceneGroup.add(ped);

    const cradle = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.055, 10, 32), brassMat);
    cradle.position.set(gx, 2.55, gz);
    cradle.rotation.y = gx < 0 ? 0.45 : -0.45;
    sceneGroup.add(cradle);

    const gMesh = new THREE.Mesh(new THREE.SphereGeometry(0.8, 24, 18), sapphireGlobeMat);
    gMesh.position.set(gx, 2.55, gz);
    gMesh.rotation.z = 0.41; // 23.5 deg axial tilt
    sceneGroup.add(gMesh);
    globes.push(gMesh);
  }

  // Twin Swaying Gimbaled Ship Lanterns with real moving warm lights!
  const lanterns: Array<{ pivot: THREE.Group; phase: number }> = [];
  for (const [lx, lz, phase] of [
    [-4.2, -2.6, 0.0],
    [4.4, -2.2, 1.9],
  ] as Array<[number, number, number]>) {
    const pivot = new THREE.Group();
    pivot.position.set(lx, 7.2, lz);

    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 3.0, 8), brassMat);
    chain.position.y = -1.5;
    pivot.add(chain);

    const hood = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.32, 8), verdigrisMat);
    hood.position.y = -3.05;
    pivot.add(hood);

    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.44, 12), flameGlowMat);
    core.position.y = -3.38;
    pivot.add(core);

    const lampLight = new THREE.PointLight(0xffb552, 4.2, 10, 1.6);
    lampLight.position.y = -3.4;
    pivot.add(lampLight);

    sceneGroup.add(pivot);
    lanterns.push({ pivot, phase });
  }

  animators.push((dt, elapsed) => {
    eclipticRing.rotation.y += dt * 0.14;
    for (const g of globes) g.rotation.y += dt * 0.22;
    for (const l of lanterns) {
      l.pivot.rotation.z = Math.sin(elapsed * 1.15 + l.phase) * 0.11;
      l.pivot.rotation.x = Math.cos(elapsed * 0.85 + l.phase) * 0.06;
    }
  });
}

function buildStage05AnalogBunker1969(
  sceneGroup: THREE.Group,
  _theme: StageAtmosphereThemeV6,
  animators: StageAnimatorFn[],
  disposables: Array<() => void>
): void {
  const olivePbr = getProceduralPbrTextureSet('WRINKLE_OLIVE_STEEL', { repeatX: 2, repeatY: 2, size: 256 });
  const oliveMat = new THREE.MeshStandardMaterial({
    map: olivePbr.map,
    normalMap: olivePbr.normalMap,
    roughnessMap: olivePbr.roughnessMap,
    roughness: 0.52,
    metalness: 0.65,
  });
  const brushedAlumMat = new THREE.MeshStandardMaterial({
    color: 0xbac2ba,
    roughness: 0.28,
    metalness: 0.9,
  });
  const darkPanelMat = new THREE.MeshStandardMaterial({
    color: 0x1a1e1a,
    roughness: 0.44,
    metalness: 0.55,
  });
  const lampBarMat = new THREE.MeshStandardMaterial({
    color: 0xf4ffe8,
    emissive: 0xdff5cc,
    emissiveIntensity: 3.2,
  });

  // Hardened Cold-War corrugated steel bunker arch ribs overhead
  for (let z = -6.2; z <= 1.8; z += 2.6) {
    const rib = new THREE.Mesh(new THREE.TorusGeometry(8.2, 0.28, 8, 28, Math.PI), oliveMat);
    rib.position.set(0, -0.2, z);
    sceneGroup.add(rib);
  }

  // Industrial overhead fluorescent work-lamp fixtures
  for (const lx of [-2.8, 2.8]) {
    const fixture = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.12, 0.34), lampBarMat);
    fixture.position.set(lx, 6.8, -1.6);
    sceneGroup.add(fixture);
  }

  // STAGE-LEFT & REAR: Angled 1969 Bell Labs Telemetry Console Racks + LIVE ORANGE NIXIE BANKS!
  const nixieLeft = createNixieTubeDisplay({ initialValue: '1969', tubeCount: 4, scale: 1.55 });
  const nixieRight = createNixieTubeDisplay({ initialValue: '0428', tubeCount: 4, scale: 1.35 });
  disposables.push(() => nixieLeft.dispose(), () => nixieRight.dispose());

  const rackLeft = new THREE.Group();
  rackLeft.position.set(-4.9, 0, -3.6);
  rackLeft.rotation.y = 0.52;
  const rackBodyL = new THREE.Mesh(new THREE.BoxGeometry(2.7, 5.2, 1.3), oliveMat);
  rackBodyL.position.y = 2.6;
  rackBodyL.castShadow = true;
  rackLeft.add(rackBodyL);

  const facePanel = new THREE.Mesh(new THREE.BoxGeometry(2.35, 3.8, 0.08), darkPanelMat);
  facePanel.position.set(0, 2.7, 0.65);
  rackLeft.add(facePanel);

  nixieLeft.group.position.set(0, 2.8, 0.72);
  rackLeft.add(nixieLeft.group);

  const nixieGlowLight = new THREE.PointLight(0xff6b1c, 5.8, 8.5, 1.5);
  nixieGlowLight.position.set(0, 3.0, 1.65);
  rackLeft.add(nixieGlowLight);

  // Indicator LED / amber toggle rows
  const indicatorMat = new THREE.MeshStandardMaterial({
    color: 0xff7020,
    emissive: 0xff5a12,
    emissiveIntensity: 3.4,
  });
  for (let row = 0; row < 2; row++) {
    for (let c = 0; c < 6; c++) {
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), indicatorMat);
      lamp.position.set(-0.82 + c * 0.33, 1.65 + row * 0.34, 0.72);
      rackLeft.add(lamp);
    }
  }
  sceneGroup.add(rackLeft);

  // CENTER-REAR: Twin 10.5" Spinning Magnetic Tape Reel Transport Rack!
  const tapeRack = new THREE.Group();
  tapeRack.position.set(0.0, 0, -5.8);
  const tapeChassis = new THREE.Mesh(new THREE.BoxGeometry(3.4, 5.6, 1.25), oliveMat);
  tapeChassis.position.y = 2.8;
  tapeChassis.castShadow = true;
  tapeRack.add(tapeChassis);

  const tapeBay = new THREE.Mesh(new THREE.BoxGeometry(2.9, 2.2, 0.14), darkPanelMat);
  tapeBay.position.set(0, 3.65, 0.62);
  tapeRack.add(tapeBay);

  const buildTapeReel = (x: number) => {
    const reel = new THREE.Group();
    reel.position.set(x, 3.68, 0.75);
    const flange = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.05, 24), brushedAlumMat);
    flange.rotation.x = Math.PI * 0.5;
    const tapePack = new THREE.Mesh(
      new THREE.CylinderGeometry(0.46, 0.46, 0.07, 24),
      new THREE.MeshStandardMaterial({ color: 0x261a14, roughness: 0.38, metalness: 0.2 })
    );
    tapePack.rotation.x = Math.PI * 0.5;
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.11, 0.075), darkPanelMat);
    const spoke2 = spoke.clone();
    spoke2.rotation.z = Math.PI * 0.5;
    reel.add(flange, tapePack, spoke, spoke2);
    tapeRack.add(reel);
    return reel;
  };
  const reelA = buildTapeReel(-0.72);
  const reelB = buildTapeReel(0.72);

  nixieRight.group.position.set(0, 1.62, 0.72);
  tapeRack.add(nixieRight.group);
  sceneGroup.add(tapeRack);

  // STAGE-RIGHT: Curved P7 Green-Phosphor Sweeping Radar Console!
  const radarConsole = new THREE.Group();
  radarConsole.position.set(4.8, 0, -3.5);
  radarConsole.rotation.y = -0.54;

  const rBody = new THREE.Mesh(new THREE.BoxGeometry(2.8, 4.4, 1.35), oliveMat);
  rBody.position.y = 2.2;
  rBody.castShadow = true;
  radarConsole.add(rBody);

  const radarBezel = new THREE.Mesh(new THREE.TorusGeometry(1.04, 0.11, 10, 32), brushedAlumMat);
  radarBezel.position.set(0, 2.75, 0.72);
  radarConsole.add(radarBezel);

  const radar = createPhosphorRadarDisc(0.98);
  radar.mesh.position.set(0, 2.75, 0.71);
  radarConsole.add(radar.mesh);
  const radarGlowLight = new THREE.PointLight(0x32e876, 4.2, 8.0, 1.6);
  radarGlowLight.position.set(0, 2.75, 1.65);
  radarConsole.add(radarGlowLight);
  sceneGroup.add(radarConsole);

  let lastNixieTick = -1;
  animators.push((dt, elapsed) => {
    radar.uniforms.uTime.value = elapsed;
    // Authentic jerky magnetic tape data-seek cadence!
    const seekPulse = Math.sin(elapsed * 2.1) > -0.35 ? 2.6 : -1.4;
    reelA.rotation.z += dt * seekPulse;
    reelB.rotation.z += dt * seekPulse * 1.18;

    const tick = Math.floor(elapsed * 2.5);
    if (tick !== lastNixieTick) {
      lastNixieTick = tick;
      const valA = String((1969 + tick * 7) % 9999).padStart(4, '0');
      const valB = String((420 + tick * 13) % 9999).padStart(4, '0');
      nixieLeft.setValue(valA);
      nixieRight.setValue(valB);
    }
  });
}

function buildStage06KyotoLacquerPavilion(
  sceneGroup: THREE.Group,
  _theme: StageAtmosphereThemeV6,
  animators: StageAnimatorFn[]
): void {
  const vermilionMat = new THREE.MeshPhysicalMaterial({
    color: 0xb82216,
    roughness: 0.14,
    metalness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf1c250,
    roughness: 0.18,
    metalness: 0.96,
  });
  const cedarMat = new THREE.MeshStandardMaterial({
    color: 0x261712,
    roughness: 0.62,
    metalness: 0.08,
  });
  const shojiPaperMat = new THREE.MeshStandardMaterial({
    color: 0xfff0cc,
    emissive: 0xffb347,
    emissiveIntensity: 1.9,
    roughness: 0.72,
  });

  // Dark Reflective Garden Water Moat surrounding the raised Urushi pavilion island
  const moat = createKyotoWaterMoatMesh();
  sceneGroup.add(moat.mesh);

  // Carved Vermilion & Gold Lacquer Pavilion Curb Ring
  const curb = new THREE.Mesh(new THREE.TorusGeometry(4.42, 0.14, 10, 48), vermilionMat);
  curb.rotation.x = Math.PI * 0.5;
  curb.position.y = 0.04;
  sceneGroup.add(curb);

  const goldInlayRing = new THREE.Mesh(new THREE.RingGeometry(4.02, 4.14, 48), goldMat);
  goldInlayRing.rotation.x = -Math.PI * 0.5;
  goldInlayRing.position.y = 0.015;
  sceneGroup.add(goldInlayRing);

  // Sculpted Vermilion Torii-Inspired Overhead Eaves & Pillars
  for (const sx of [-4.6, 4.6]) {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 7.0, 18), vermilionMat);
    pillar.position.set(sx, 3.5, -4.6);
    pillar.castShadow = true;
    sceneGroup.add(pillar);

    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.35, 18), goldMat);
    collar.position.set(sx, 0.22, -4.6);
    sceneGroup.add(collar);
  }
  const upperBeam = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.42, 0.56), vermilionMat);
  upperBeam.position.set(0, 6.95, -4.6);
  const subBeam = new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.26, 0.36), cedarMat);
  subBeam.position.set(0, 5.95, -4.6);
  const capCrest = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.2, 0.72), cedarMat);
  capCrest.position.set(0, 7.25, -4.6);
  sceneGroup.add(upperBeam, subBeam, capCrest);

  // Asymmetric Backlit Washi Shoji Lattice Screens floating above the dark water moat
  const shojiSpecs: Array<{ pos: [number, number, number]; rotY: number; w: number; h: number }> = [
    { pos: [-5.4, 2.2, -5.8], rotY: 0.44, w: 3.1, h: 4.2 },
    { pos: [5.6, 2.0, -5.4], rotY: -0.48, w: 2.8, h: 3.9 },
    { pos: [0.3, 2.3, -7.8], rotY: -0.06, w: 4.4, h: 4.4 },
  ];
  for (const ss of shojiSpecs) {
    const shoji = new THREE.Group();
    shoji.position.set(...ss.pos);
    shoji.rotation.y = ss.rotY;

    const paper = new THREE.Mesh(new THREE.PlaneGeometry(ss.w, ss.h), shojiPaperMat);
    shoji.add(paper);

    // Cedar kumiko wooden lattice muntins
    for (let k = -2; k <= 2; k++) {
      const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.06, ss.h, 0.08), cedarMat);
      vBar.position.x = (k / 2) * (ss.w * 0.48);
      shoji.add(vBar);
    }
    for (let r = -2; r <= 2; r++) {
      const hBar = new THREE.Mesh(new THREE.BoxGeometry(ss.w, 0.06, 0.08), cedarMat);
      hBar.position.y = (r / 2) * (ss.h * 0.48);
      shoji.add(hBar);
    }
    sceneGroup.add(shoji);
  }

  // Floating Water Lanterns (Tōrō) glowing gently on the moat
  const lanterns: THREE.Group[] = [];
  for (const [lx, lz] of [
    [-6.1, -1.2],
    [6.4, -1.8],
    [-3.4, -6.2],
    [3.8, -6.4],
  ]) {
    const lan = new THREE.Group();
    lan.position.set(lx, -0.05, lz);
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.14, 0.68), cedarMat);
    const glow = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.56, 0.46), shojiPaperMat);
    glow.position.y = 0.35;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.56, 0.34, 4), vermilionMat);
    roof.rotation.y = Math.PI * 0.25;
    roof.position.y = 0.78;
    lan.add(base, glow, roof);
    sceneGroup.add(lan);
    lanterns.push(lan);
  }

  animators.push((_dt, elapsed) => {
    moat.uniforms.uTime.value = elapsed;
    shojiPaperMat.emissiveIntensity = 1.85 + Math.sin(elapsed * 1.6) * 0.18;
    for (let i = 0; i < lanterns.length; i++) {
      lanterns[i].position.y = -0.04 + Math.sin(elapsed * 1.4 + i * 1.5) * 0.045;
    }
  });
}

function buildStage07CarnivalCuriosities(
  sceneGroup: THREE.Group,
  _theme: StageAtmosphereThemeV6,
  animators: StageAnimatorFn[]
): void {
  const copperPbr = getProceduralPbrTextureSet('HAMMERED_COPPER', { repeatX: 2, repeatY: 2, size: 256 });
  const copperMat = new THREE.MeshStandardMaterial({
    map: copperPbr.map,
    normalMap: copperPbr.normalMap,
    roughnessMap: copperPbr.roughnessMap,
    roughness: 0.26,
    metalness: 0.92,
  });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x262a33, roughness: 0.48, metalness: 0.8 });
  const redWoodMat = new THREE.MeshStandardMaterial({ color: 0x6b1728, roughness: 0.48, metalness: 0.1 });

  // STAGE-LEFT REAR: Asymmetric Hammered-Copper Steam Calliope Organ Pipe Bank!
  const calliopeGroup = new THREE.Group();
  calliopeGroup.position.set(-4.3, 0, -4.9);
  calliopeGroup.rotation.y = 0.38;

  const windChest = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.4, 1.15), redWoodMat);
  windChest.position.y = 0.7;
  windChest.castShadow = true;
  calliopeGroup.add(windChest);

  for (let i = 0; i < 9; i++) {
    const h = 2.6 + i * 0.48;
    const rad = 0.14 + i * 0.014;
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad * 0.95, h, 16), copperMat);
    pipe.position.set(-1.8 + i * 0.45, 1.35 + h * 0.5, 0);
    pipe.castShadow = true;
    calliopeGroup.add(pipe);

    const lip = new THREE.Mesh(new THREE.TorusGeometry(rad * 1.06, 0.028, 8, 16), ironMat);
    lip.rotation.x = Math.PI * 0.5;
    lip.position.set(-1.8 + i * 0.45, 1.35 + h, 0);
    calliopeGroup.add(lip);
  }
  sceneGroup.add(calliopeGroup);

  // GRAND CHASING RUBY & TURQUOISE VINTAGE MARQUEE BULB ARCH spanning stage!
  const marqueeArch = new THREE.Mesh(new THREE.TorusGeometry(6.1, 0.34, 10, 38, Math.PI), redWoodMat);
  marqueeArch.position.set(0.3, 0.5, -5.2);
  sceneGroup.add(marqueeArch);

  const marqueeBulbs: Array<{ mat: THREE.MeshStandardMaterial; idx: number }> = [];
  const bulbGeom = new THREE.SphereGeometry(0.11, 10, 10);
  const bulbPalette = [0xff2e58, 0xffcc5c, 0x22e3d8];

  for (let i = 0; i < 25; i++) {
    const a = (i / 24) * Math.PI;
    const bx = 0.3 + Math.cos(a) * 6.1;
    const by = 0.5 + Math.sin(a) * 6.1;
    const hex = bulbPalette[i % bulbPalette.length];
    const bMat = new THREE.MeshStandardMaterial({
      color: hex,
      emissive: hex,
      emissiveIntensity: 3.0,
      roughness: 0.18,
    });
    const bulb = new THREE.Mesh(bulbGeom, bMat);
    bulb.position.set(bx, by, -4.84);
    sceneGroup.add(bulb);
    marqueeBulbs.push({ mat: bMat, idx: i });
  }

  // STAGE-RIGHT REAR: Slowly rotating Spoked Brass Pier Ferris Wheel Silhouette
  const wheelGroup = new THREE.Group();
  wheelGroup.position.set(5.6, 4.4, -6.4);
  wheelGroup.rotation.y = -0.35;
  const wheelRim = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.11, 10, 36), copperMat);
  const wheelInner = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.06, 8, 28), ironMat);
  wheelGroup.add(wheelRim, wheelInner);

  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 6.3, 6), ironMat);
    spoke.rotation.z = a;
    wheelGroup.add(spoke);
  }
  sceneGroup.add(wheelGroup);

  animators.push((dt, elapsed) => {
    wheelGroup.rotation.z -= dt * 0.24;
    const wave = elapsed * 5.2;
    for (const b of marqueeBulbs) {
      const pulse = Math.sin(wave - b.idx * 0.72) * 0.5 + 0.5;
      b.mat.emissiveIntensity = 0.65 + pulse * 3.6;
    }
  });
}

function buildStage08SunkenBathysphere(
  sceneGroup: THREE.Group,
  _theme: StageAtmosphereThemeV6,
  animators: StageAnimatorFn[]
): void {
  const bronzePbr = getProceduralPbrTextureSet('HAMMERED_COPPER', { repeatX: 3, repeatY: 2, size: 256 });
  const bronzeMat = new THREE.MeshStandardMaterial({
    color: 0xc28a52,
    map: bronzePbr.map,
    normalMap: bronzePbr.normalMap,
    roughnessMap: bronzePbr.roughnessMap,
    roughness: 0.32,
    metalness: 0.9,
  });
  const hullMat = new THREE.MeshStandardMaterial({
    color: 0x1b2930,
    roughness: 0.45,
    metalness: 0.76,
  });
  const oceanPortalMat = new THREE.MeshStandardMaterial({
    color: 0x168ea6,
    emissive: 0x1bd4d4,
    emissiveIntensity: 1.65,
    roughness: 0.08,
  });

  // Live GLSL Animated Underwater Voronoi Caustics crawling across the wet basalt deck!
  const caustics = createUnderwaterCausticsOverlay(7.5);
  sceneGroup.add(caustics.mesh);

  // Heavy Curved Riveted Submarine Bulkhead Pressure Wall encircling rear arc
  const bulkhead = new THREE.Mesh(
    new THREE.CylinderGeometry(7.6, 7.6, 8.2, 24, 1, true, Math.PI * 0.55, Math.PI * 0.9),
    hullMat
  );
  bulkhead.material.side = THREE.DoubleSide;
  bulkhead.position.y = 4.0;
  sceneGroup.add(bulkhead);

  // Heavy Structural Cast-Bronze Ribs positioned CLEANLY BETWEEN the 3 portholes
  for (const a of [-0.95, -0.31, 0.31, 0.95]) {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.36, 8.4, 0.52), bronzeMat);
    rib.position.set(Math.sin(a) * 7.35, 4.1, -Math.cos(a) * 7.35);
    rib.rotation.y = -a;
    sceneGroup.add(rib);
  }

  // THREE DEEP CIRCULAR RIVETED CAST-BRONZE PORTHOLE WINDOWS looking into the Abyssal Trench!
  const portholeAngles = [-0.62, 0.0, 0.62];
  const rivetGeom = new THREE.SphereGeometry(0.065, 8, 8);
  for (const a of portholeAngles) {
    const ph = new THREE.Group();
    ph.position.set(Math.sin(a) * 7.15, 3.25, -Math.cos(a) * 7.15);
    ph.rotation.y = -a;

    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.42, 0.22, 14, 32), bronzeMat);
    ph.add(rim);

    const glass = new THREE.Mesh(new THREE.CircleGeometry(1.32, 28), oceanPortalMat);
    glass.position.z = -0.08;
    ph.add(glass);

    for (let r = 0; r < 12; r++) {
      const ra = (r / 12) * Math.PI * 2;
      const rivet = new THREE.Mesh(rivetGeom, bronzeMat);
      rivet.position.set(Math.cos(ra) * 1.44, Math.sin(ra) * 1.44, 0.16);
      ph.add(rivet);
    }
    sceneGroup.add(ph);
  }

  // Pressure Hatch Valve Wheel mounted stage-left
  const valveWheel = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.075, 10, 24), bronzeMat);
  valveWheel.position.set(-5.8, 2.2, -3.2);
  valveWheel.rotation.y = 0.72;
  sceneGroup.add(valveWheel);

  // Underwater Diagonal Turquoise Caustic Light Shafts descending from ocean surface
  const shaftA = createVolumetricShaftMesh(0.7, 2.8, 10.5, 0x3bf0e8, 0.15);
  shaftA.position.set(-1.6, 5.2, -1.8);
  shaftA.rotation.z = -0.22;
  const shaftB = createVolumetricShaftMesh(0.6, 2.5, 10.5, 0x24c6e0, 0.13);
  shaftB.position.set(2.2, 5.0, -2.4);
  shaftB.rotation.z = -0.18;
  sceneGroup.add(shaftA, shaftB);

  animators.push((dt, elapsed) => {
    caustics.uniforms.uTime.value = elapsed;
    oceanPortalMat.emissiveIntensity = 1.55 + Math.sin(elapsed * 1.9) * 0.25;
    valveWheel.rotation.z += dt * 0.15;
    (shaftA.material as THREE.ShaderMaterial).uniforms.uTime.value = elapsed;
    (shaftB.material as THREE.ShaderMaterial).uniforms.uTime.value = elapsed * 1.2;
  });
}

function buildStage09AstralObservatory(
  sceneGroup: THREE.Group,
  _theme: StageAtmosphereThemeV6,
  animators: StageAnimatorFn[]
): void {
  const copperPbr = getProceduralPbrTextureSet('HAMMERED_COPPER', { repeatX: 4, repeatY: 3, size: 256 });
  const copperMat = new THREE.MeshStandardMaterial({
    map: copperPbr.map,
    normalMap: copperPbr.normalMap,
    normalScale: new THREE.Vector2(0.55, 0.55),
    roughnessMap: copperPbr.roughnessMap,
    roughness: 0.28,
    metalness: 0.92,
  });
  const alabasterPbr = getProceduralPbrTextureSet('ALABASTER_STONE', { repeatX: 2, repeatY: 2, size: 256 });
  const alabasterMat = new THREE.MeshStandardMaterial({
    map: alabasterPbr.map,
    normalMap: alabasterPbr.normalMap,
    roughnessMap: alabasterPbr.roughnessMap,
    roughness: 0.22,
  });
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xe6bc62,
    roughness: 0.18,
    metalness: 0.95,
  });

  // LIVE GLSL MULTI-RIBBON AURORA BOREALIS & STARFIELD SKY DOME!
  const aurora = createAuroraSkyDome();
  sceneGroup.add(aurora.mesh);

  // Brass right-ascension degree ring inlaid on alabaster deck
  const degreeRing = new THREE.Mesh(new THREE.RingGeometry(4.2, 4.46, 64), brassMat);
  degreeRing.rotation.x = -Math.PI * 0.5;
  degreeRing.position.y = 0.015;
  sceneGroup.add(degreeRing);

  // SPLIT OPEN HAMMERED-COPPER OBSERVATORY TELESCOPE DOME
  // Parted wide along the -Z stage-center axis so the live Aurora Borealis fills the entire rear sky!
  const domeLeft = new THREE.Mesh(
    new THREE.SphereGeometry(9.6, 28, 18, Math.PI * 0.78, Math.PI * 0.54, 0.18, Math.PI * 0.36),
    copperMat
  );
  domeLeft.material.side = THREE.DoubleSide;
  const domeRight = new THREE.Mesh(
    new THREE.SphereGeometry(9.6, 28, 18, Math.PI * 1.68, Math.PI * 0.54, 0.18, Math.PI * 0.36),
    copperMat
  );
  domeRight.material.side = THREE.DoubleSide;
  sceneGroup.add(domeLeft, domeRight);

  // Heavy riveted copper shutter arch ribs framing the wide open Aurora zenith slot
  for (const ox of [-3.6, 3.6]) {
    const shutterRib = new THREE.Mesh(new THREE.TorusGeometry(9.35, 0.24, 10, 36, Math.PI), copperMat);
    shutterRib.position.set(ox, 0, 0);
    shutterRib.rotation.y = Math.PI * 0.5;
    sceneGroup.add(shutterRib);
  }

  // Asymmetric Equatorial Refractor Telescope Tube angled toward the Aurora!
  const scopeGroup = new THREE.Group();
  scopeGroup.position.set(-4.8, 2.6, -5.2);
  scopeGroup.rotation.set(-0.62, 0.32, 0.12);
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.54, 5.2, 20), copperMat);
  const lensRim = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.07, 10, 24), brassMat);
  lensRim.rotation.x = Math.PI * 0.5;
  lensRim.position.y = 2.6;
  scopeGroup.add(tube, lensRim);
  sceneGroup.add(scopeGroup);

  // 4 Tall Alabaster Piers crowned with Rainbow Optical Dispersion Prisms!
  const prismColors = [0x45f0a8, 0x9970ff, 0x45c8ff, 0xffd066];
  const prisms: THREE.Mesh[] = [];
  const pierAngles = [-0.92, -0.38, 0.38, 0.92];
  for (let i = 0; i < pierAngles.length; i++) {
    const a = pierAngles[i];
    const px = Math.sin(a) * 6.2;
    const pz = -Math.cos(a) * 6.2;

    const pier = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.42, 2.4, 6), alabasterMat);
    pier.position.set(px, 1.2, pz);
    sceneGroup.add(pier);

    const pMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      emissive: prismColors[i],
      emissiveIntensity: 0.72,
      roughness: 0.05,
      metalness: 0.06,
      clearcoat: 1.0,
      ior: 1.66,
    });
    const prism = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 1.35, 3), pMat);
    prism.position.set(px, 3.2, pz);
    sceneGroup.add(prism);
    prisms.push(prism);
  }

  animators.push((dt, elapsed) => {
    aurora.uniforms.uTime.value = elapsed;
    for (let i = 0; i < prisms.length; i++) {
      prisms[i].rotation.y += dt * (0.35 + i * 0.08);
      prisms[i].position.y = 3.2 + Math.sin(elapsed * 1.4 + i) * 0.1;
    }
  });
}

function buildStage10SovereignColosseum(
  sceneGroup: THREE.Group,
  _theme: StageAtmosphereThemeV6,
  animators: StageAnimatorFn[]
): void {
  const neroPbr = getProceduralPbrTextureSet('NERO_GOLD_MARBLE', { repeatX: 2, repeatY: 3, size: 256 });
  const neroMat = new THREE.MeshPhysicalMaterial({
    map: neroPbr.map,
    normalMap: neroPbr.normalMap,
    roughnessMap: neroPbr.roughnessMap,
    roughness: 0.18,
    metalness: 0.12,
    clearcoat: 0.75,
  });
  const gold24kMat = new THREE.MeshPhysicalMaterial({
    color: 0xf7c94f,
    roughness: 0.15,
    metalness: 0.98,
    clearcoat: 0.45,
  });
  const bronzeMat = new THREE.MeshStandardMaterial({
    color: 0x8f5d2b,
    roughness: 0.34,
    metalness: 0.88,
  });

  // Concentric 24k Gold Championship Arena Rings inlaid on the Nero Marble floor
  for (const [rIn, rOut] of [
    [3.88, 4.02],
    [4.65, 4.82],
  ]) {
    const ring = new THREE.Mesh(new THREE.RingGeometry(rIn, rOut, 64), gold24kMat);
    ring.rotation.x = -Math.PI * 0.5;
    ring.position.y = 0.015;
    sceneGroup.add(ring);
  }

  // TOWERING VEINED BLACK-AND-GOLD MARBLE COLOSSEUM COLONNADE (8 Monumental Columns)
  const colCount = 8;
  for (let i = 0; i < colCount; i++) {
    const a = -1.26 + (i / (colCount - 1)) * 2.52;
    const cx = Math.sin(a) * 8.1;
    const cz = -Math.cos(a) * 8.1;

    const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.7, 1.25), neroMat);
    plinth.position.set(cx, 0.35, cz);
    plinth.rotation.y = -a;
    sceneGroup.add(plinth);

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.54, 7.6, 16), neroMat);
    shaft.position.set(cx, 4.5, cz);
    shaft.castShadow = true;
    shaft.receiveShadow = true;
    sceneGroup.add(shaft);

    const capital = new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.5, 0.62, 8), gold24kMat);
    capital.position.set(cx, 8.5, cz);
    sceneGroup.add(capital);
  }

  // Curved Gilded Upper Entablature Architrave Ring
  const architrave = new THREE.Mesh(
    new THREE.TorusGeometry(8.1, 0.42, 8, 40, Math.PI * 0.88),
    gold24kMat
  );
  architrave.rotation.x = Math.PI * 0.5;
  architrave.rotation.z = Math.PI * 0.06;
  architrave.position.y = 8.95;
  sceneGroup.add(architrave);

  // MONUMENTAL 24K GOLD CHAMPIONSHIP ALTAR ARCH & ROTATING SOVEREIGN HALO (center-rear)
  const altarArch = new THREE.Mesh(new THREE.TorusGeometry(3.35, 0.26, 12, 40, Math.PI), gold24kMat);
  altarArch.position.set(0, 1.1, -6.4);
  sceneGroup.add(altarArch);

  const sovereignGear = createInvoluteBrassGear({
    radius: 1.55,
    teeth: 28,
    thickness: 0.14,
    spokes: 8,
    metalColorHex: 0xf7c94f,
    hubColorHex: 0x16161a,
    includeRubyBearing: true,
  });
  sovereignGear.rotation.x = Math.PI * 0.5;
  sovereignGear.position.set(0, 4.5, -6.55);
  sceneGroup.add(sovereignGear);

  // FOUR FLICKERING BRONZE FIRE BRAZIERS WITH LIVE GLSL FLAMES & DYNAMIC FIRELIGHT!
  const brazierCoords: Array<[number, number, number]> = [
    [-4.6, 0, -4.4],
    [4.6, 0, -4.4],
    [-6.1, 0, -0.6],
    [6.1, 0, -0.6],
  ];
  const flameUniformsList: Array<{ uTime: { value: number } }> = [];
  const fireLights: Array<{ light: THREE.PointLight; phase: number }> = [];

  for (let i = 0; i < brazierCoords.length; i++) {
    const [bx, , bz] = brazierCoords[i];
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.62, 1.45, 8), bronzeMat);
    ped.position.set(bx, 0.72, bz);
    ped.castShadow = true;
    sceneGroup.add(ped);

    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.36, 0.45, 16), gold24kMat);
    bowl.position.set(bx, 1.62, bz);
    sceneGroup.add(bowl);

    const coals = new THREE.Mesh(
      new THREE.SphereGeometry(0.54, 12, 8),
      new THREE.MeshStandardMaterial({
        color: 0xff4512,
        emissive: 0xff5410,
        emissiveIntensity: 3.2,
      })
    );
    coals.scale.set(1, 0.42, 1);
    coals.position.set(bx, 1.82, bz);
    sceneGroup.add(coals);

    const flame = createBrazierFlameMesh(1.1);
    flame.mesh.position.set(bx, 1.85, bz);
    sceneGroup.add(flame.mesh);
    flameUniformsList.push(flame.uniforms);

    // Pair dynamic orange firelights on the two front-flanking braziers for authentic dancing highlights
    if (i < 2) {
      const fLight = new THREE.PointLight(0xff6b22, 9.5, 14, 1.55);
      fLight.position.set(bx, 2.75, bz);
      sceneGroup.add(fLight);
      fireLights.push({ light: fLight, phase: i * 2.3 });
    }
  }

  const crownBeam = createVolumetricShaftMesh(1.1, 3.6, 11.5, 0xffd57a, 0.14);
  crownBeam.position.set(0, 5.4, -1.0);
  sceneGroup.add(crownBeam);

  animators.push((dt, elapsed) => {
    sovereignGear.rotation.y += dt * 0.18;
    for (const fu of flameUniformsList) fu.uTime.value = elapsed;
    for (const fl of fireLights) {
      fl.light.intensity =
        8.8 +
        Math.sin(elapsed * 9.5 + fl.phase) * 1.4 +
        Math.sin(elapsed * 16.3 + fl.phase * 1.7) * 0.7;
    }
    (crownBeam.material as THREE.ShaderMaterial).uniforms.uTime.value = elapsed;
  });
}

// ----------------------------------------------------------------------------
// 5. Public Stage World Factory (`buildStageWorldArchitectureV6`)
// ----------------------------------------------------------------------------

function getFloorRecipeForStage(stageId: StageWorldIdV6): {
  surface: ProceduralSurfaceKindV6;
  clearcoat: number;
} {
  switch (stageId) {
    case 'STAGE_01_VAUDEVILLE_PALACE':
      return { surface: 'MAHOGANY_PLANKS', clearcoat: 0.25 };
    case 'STAGE_02_GENEVA_CONSERVATORY':
      return { surface: 'CARRARA_MARBLE', clearcoat: 0.45 };
    case 'STAGE_03_MONTE_CARLO_SALON':
      return { surface: 'EMERALD_FELT', clearcoat: 0.0 };
    case 'STAGE_04_CARTOGRAPHIC_ROTUNDA':
      return { surface: 'TEAK_DECK', clearcoat: 0.12 };
    case 'STAGE_05_ANALOG_BUNKER_1969':
      return { surface: 'WRINKLE_OLIVE_STEEL', clearcoat: 0.08 };
    case 'STAGE_06_KYOTO_LACQUER_PAVILION':
      return { surface: 'URUSHI_KINTSUGI', clearcoat: 1.0 };
    case 'STAGE_07_CARNIVAL_CURIOSITIES':
      return { surface: 'PIER_TIMBER', clearcoat: 0.22 };
    case 'STAGE_08_SUNKEN_BATHYSPHERE':
      return { surface: 'WET_BASALT', clearcoat: 0.65 };
    case 'STAGE_09_ASTRAL_OBSERVATORY':
      return { surface: 'ALABASTER_STONE', clearcoat: 0.4 };
    case 'STAGE_10_SOVEREIGN_COLOSSEUM':
      return { surface: 'NERO_GOLD_MARBLE', clearcoat: 0.78 };
  }
}

export function buildStageWorldArchitectureV6(theme: StageAtmosphereThemeV6): BuiltStageWorldV6 {
  const recipe = getStageVisualRecipeV6(theme.stageId);
  const root = new THREE.Group();
  root.name = `StageWorld_${theme.stageId}`;

  const animators: StageAnimatorFn[] = [];
  const customDisposables: Array<() => void> = [];

  // 1. Sky Dome (Stage 09 builds its own live GLSL Aurora Borealis dome!)
  if (theme.stageId !== 'STAGE_09_ASTRAL_OBSERVATORY') {
    root.add(createGradientSkyDome(recipe.skyZenithHex, recipe.skyHorizonHex, recipe.skyNadirHex));
  }

  // 2. Stage Floor + Embedded Physical Double-Leaf Trapdoor & Clockwork Pit Shaft
  const { surface, clearcoat } = getFloorRecipeForStage(theme.stageId);
  const floorHalfSize = theme.stageId === 'STAGE_06_KYOTO_LACQUER_PAVILION' ? 4.35 : 9.0;
  const trapdoor = buildStageFloorWithTrapdoorPit(surface, theme, recipe, clearcoat, floorHalfSize);
  root.add(trapdoor.root);

  // 3. Stage-Specific Monumental 3D Architectural Set-Pieces & Shaders
  const setGroup = new THREE.Group();
  setGroup.name = `Architecture_${theme.stageId}`;
  switch (theme.stageId) {
    case 'STAGE_01_VAUDEVILLE_PALACE':
      buildStage01VaudevillePalace(setGroup, theme, animators);
      break;
    case 'STAGE_02_GENEVA_CONSERVATORY':
      buildStage02GenevaConservatory(setGroup, theme, animators);
      break;
    case 'STAGE_03_MONTE_CARLO_SALON':
      buildStage03MonteCarloSalon(setGroup, theme, animators);
      break;
    case 'STAGE_04_CARTOGRAPHIC_ROTUNDA':
      buildStage04CartographicRotunda(setGroup, theme, animators);
      break;
    case 'STAGE_05_ANALOG_BUNKER_1969':
      buildStage05AnalogBunker1969(setGroup, theme, animators, customDisposables);
      break;
    case 'STAGE_06_KYOTO_LACQUER_PAVILION':
      buildStage06KyotoLacquerPavilion(setGroup, theme, animators);
      break;
    case 'STAGE_07_CARNIVAL_CURIOSITIES':
      buildStage07CarnivalCuriosities(setGroup, theme, animators);
      break;
    case 'STAGE_08_SUNKEN_BATHYSPHERE':
      buildStage08SunkenBathysphere(setGroup, theme, animators);
      break;
    case 'STAGE_09_ASTRAL_OBSERVATORY':
      buildStage09AstralObservatory(setGroup, theme, animators);
      break;
    case 'STAGE_10_SOVEREIGN_COLOSSEUM':
      buildStage10SovereignColosseum(setGroup, theme, animators);
      break;
  }
  root.add(setGroup);

  // 4. GPU Instanced Atmospheric Particle Cloud matched to Stage Theme
  const particles = createStageParticleSystem(theme.lighting.particleKind, theme);
  root.add(particles.points);

  return {
    stageId: theme.stageId,
    root,
    trapdoorPitMount: trapdoor.pitMount,
    setTrapdoorOpen(open: boolean) {
      trapdoor.setOpen(open);
    },
    getTrapdoorOpenProgress() {
      return trapdoor.getOpenProgress();
    },
    update(dtSec: number, elapsedSec: number) {
      trapdoor.update(dtSec, elapsedSec);
      particles.uniforms.uTime.value = elapsedSec;
      for (const fn of animators) {
        fn(dtSec, elapsedSec);
      }
    },
    dispose() {
      for (const d of customDisposables) d();
      disposeObject3DTree(root);
    },
  };
}
