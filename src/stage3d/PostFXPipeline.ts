import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export type QualityTier = 'HIGH' | 'BALANCED';

/**
 * Calibrated Cinema PBR Post-Processing Pipeline (Three.js r172, QA #132 & #137 Tuned):
 * - HalfFloat HDR RenderTarget (`samples: 0` for 100% mobile/SwiftShader/ANGLE FBO compatibility + DPR supersampling)
 * - Synced `composer.setPixelRatio(dpr)` + `composer.setSize(w, h)` so `390x844` mobile DPR=2/3 renders 100% crisp
 * - Restrained high-threshold `UnrealBloomPass` (threshold 1.38, strength 0.14, radius 0.28 — zero whiteout!)
 * - ACES Filmic `OutputPass` (exposure 0.88)
 */
export class PostFXPipeline {
  public readonly composer: EffectComposer;
  public readonly renderPass: RenderPass;
  public readonly bloomPass: UnrealBloomPass;
  public readonly outputPass: OutputPass;

  private readonly renderer: THREE.WebGLRenderer;
  private readonly hdrTarget: THREE.WebGLRenderTarget;
  private qualityTier: QualityTier = 'HIGH';

  private baseBloomStrength = 0.14;
  private targetBloomStrength = 0.14;
  private bloomBoost = 0;
  private targetExposure = 0.82;

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    initialWidth = 1280,
    initialHeight = 720
  ) {
    this.renderer = renderer;

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = this.targetExposure;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.hdrTarget = new THREE.WebGLRenderTarget(
      Math.max(1, initialWidth),
      Math.max(1, initialHeight),
      {
        type: THREE.HalfFloatType,
        colorSpace: THREE.LinearSRGBColorSpace,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        samples: 0,
      }
    );

    this.composer = new EffectComposer(renderer, this.hdrTarget);
    this.renderPass = new RenderPass(scene, camera);
    this.composer.addPass(this.renderPass);

    // #171/#172 Photometric Calibration: threshold 1.52 keeps broad 24K gold rich & saturated under 4.2 lux key
    // while catching razor-sharp sapphire ior=1.77 / clearcoat=1.0 bevel glints!
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(Math.max(1, initialWidth), Math.max(1, initialHeight)),
      0.14,
      0.28,
      1.52
    );
    this.composer.addPass(this.bloomPass);

    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);
  }

  public setQualityTier(tier: QualityTier): void {
    this.qualityTier = tier;
    this.bloomPass.enabled = true;
  }

  public getQualityTier(): QualityTier {
    return this.qualityTier;
  }

  public setLightingTargets(bloomStrength: number, exposure: number, instant = false): void {
    this.targetBloomStrength = THREE.MathUtils.clamp(bloomStrength, 0.06, 0.18);
    this.targetExposure = THREE.MathUtils.clamp(exposure, 0.70, 0.90);
    if (instant) {
      this.baseBloomStrength = this.targetBloomStrength;
      this.renderer.toneMappingExposure = this.targetExposure;
      this.bloomPass.strength = this.baseBloomStrength;
    }
  }

  public pulseBloom(boostAmount = 0.05): void {
    this.bloomBoost = Math.min(0.06, Math.max(this.bloomBoost, boostAmount));
  }

  public setSize(width: number, height: number, devicePixelRatio = 1): void {
    const safeW = Math.max(1, Math.floor(width));
    const safeH = Math.max(1, Math.floor(height));
    const maxDpr = this.qualityTier === 'HIGH' ? 2.0 : 1.35;
    const dpr = Math.min(maxDpr, Math.max(1, devicePixelRatio));

    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(safeW, safeH, false);
    // CRITICAL (#137 P0 #1): sync EffectComposer._pixelRatio BEFORE setSize so 390x844 DPR=2/3 never scissors/blacks out!
    this.composer.setPixelRatio(dpr);
    this.composer.setSize(safeW, safeH);
    this.bloomPass.resolution.set(
      Math.max(1, Math.floor(safeW * dpr * 0.5)),
      Math.max(1, Math.floor(safeH * dpr * 0.5))
    );
  }

  public update(dt: number): void {
    const lerpFactor = 1 - Math.exp(-dt * 4.5);
    this.baseBloomStrength = THREE.MathUtils.lerp(
      this.baseBloomStrength,
      this.targetBloomStrength,
      lerpFactor
    );
    this.renderer.toneMappingExposure = THREE.MathUtils.lerp(
      this.renderer.toneMappingExposure,
      this.targetExposure,
      lerpFactor
    );

    if (this.bloomBoost > 0.001) {
      this.bloomBoost *= Math.exp(-dt * 4.5);
    } else {
      this.bloomBoost = 0;
    }

    this.bloomPass.strength = THREE.MathUtils.clamp(
      this.baseBloomStrength + this.bloomBoost,
      0.05,
      0.22
    );
  }

  public render(): void {
    this.composer.render();
  }

  public dispose(): void {
    this.bloomPass.dispose();
    this.outputPass.dispose();
    this.hdrTarget.dispose();
    this.composer.dispose();
  }
}
