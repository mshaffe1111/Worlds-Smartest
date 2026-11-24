// ============================================================================
// WORLD'S SMARTEST v6.0 — Three.js WebGL2 PBR 3D Contraption Renderer B
// Renders Families VI–X (Boards 051–100) + Live Visual Choreography for ALL 16
// BoardTwistMutationIdV6 Mutations (3D Blackout Spotlight Cone, 180° Gravity
// Inversion, Rising Caustic Flood Plane, Physical Mole Wobble Tells, Sparking
// Chain-Bomb Fuses, Entangled Quantum Arcs, Velvet Auction Cloches, Twin
// Split-or-Steal Spheres, Moving Conveyors, Rotating 3D Ferris Wheel, & More).
// Strictly adapts to StageAtmosphereThemeV6.materials with full GPU disposal.
// ============================================================================

import * as THREE from 'three';
import type {
  BoardDefinitionV6,
  BoardFamilyIdV6,
  BoardNodeV6,
  BoardRuntimeStateV6,
  StageAtmosphereThemeV6,
} from '../contracts_v6';
import {
  getBoardBlueprintB,
  type BoardContraptionBlueprintB,
} from './BoardCatalog051To100';
import type { TwistDirectorSnapshotV6 } from './BoardTwistDirectorV6';

// ----------------------------------------------------------------------------
// 1. Public Renderer Interfaces (Compatible with UnifiedBoardManagerV6)
// ----------------------------------------------------------------------------

export interface BoardHitResultV6 {
  readonly nodeId: string | null;
  readonly boardPlanePoint: [number, number, number] | null;
}

export interface BoardRendererContractV6 {
  readonly supportedFamilies: readonly BoardFamilyIdV6[];
  mountBoard(
    parent: THREE.Object3D,
    state: BoardRuntimeStateV6,
    twistSnapshot: TwistDirectorSnapshotV6,
    stageTheme?: StageAtmosphereThemeV6,
  ): THREE.Group;
  syncState(
    state: BoardRuntimeStateV6,
    twistSnapshot: TwistDirectorSnapshotV6,
  ): void;
  update(dtSeconds: number, elapsedSeconds: number): void;
  pickNodeAtNdc(
    ndcX: number,
    ndcY: number,
    camera: THREE.Camera,
  ): BoardHitResultV6;
  setHoveredNode(nodeId: string | null): void;
  dispose(): void;
}

// ----------------------------------------------------------------------------
// 2. Internal Visual Rig Types
// ----------------------------------------------------------------------------

interface NodeRigB {
  nodeId: string;
  group: THREE.Group;
  hitMesh: THREE.Mesh;
  gemMesh: THREE.Mesh;
  gemMat: THREE.MeshPhysicalMaterial;
  pedestalMesh: THREE.Mesh;
  chainGroup: THREE.Group;
  fuseGroup: THREE.Group;
  fuseSparkMesh: THREE.Mesh;
  clocheMesh: THREE.Mesh;
  freezeShieldMesh: THREE.Mesh;
  hazardRingMesh: THREE.Mesh;
  jammerMesh: THREE.Mesh;
  bountyCrownMesh: THREE.Mesh;
  basePos: THREE.Vector3;
  targetPos: THREE.Vector3;
  moleTellIntensity: number;
  isMoleRevealed: boolean;
  isSubmerged: boolean;
  isVisible: boolean;
  isAligned: boolean;
  isGondola: boolean;
}

interface StageMaterialKitB {
  trimMetal: THREE.MeshStandardMaterial;
  darkChassis: THREE.MeshStandardMaterial;
  stageStone: THREE.MeshStandardMaterial;
  accentBrass: THREE.MeshStandardMaterial;
  ironChain: THREE.MeshStandardMaterial;
  velvetCloche: THREE.MeshStandardMaterial;
  freezeCrystal: THREE.MeshPhysicalMaterial;
  hazardChevron: THREE.MeshStandardMaterial;
  jammerStatic: THREE.MeshStandardMaterial;
  fuseCord: THREE.MeshStandardMaterial;
  fuseSpark: THREE.MeshBasicMaterial;
  bountyGold: THREE.MeshStandardMaterial;
  waterSurface: THREE.MeshPhysicalMaterial;
  laserBeam: THREE.MeshBasicMaterial;
  quantumArc: THREE.MeshBasicMaterial;
  voltageArc: THREE.MeshBasicMaterial;
  spotlightCone: THREE.MeshBasicMaterial;
}

// ----------------------------------------------------------------------------
// 3. BoardContraptionRendererB Implementation
// ----------------------------------------------------------------------------

export class BoardContraptionRendererB implements BoardRendererContractV6 {
  public readonly supportedFamilies: readonly BoardFamilyIdV6[] = [
    'MONUMENT_INDUSTRIAL',
    'CARTOGRAPHY_EXPEDITION',
    'CARNIVAL_ARCADE',
    'ASTRAL_QUANTUM',
    'RULE_BENDER_TWISTS',
  ] as const;

  private rootGroup: THREE.Group | null = null;
  private boardPivot: THREE.Group | null = null;
  private parentObject: THREE.Object3D | null = null;
  private materials: StageMaterialKitB | null = null;

  private currentDef: BoardDefinitionV6 | null = null;
  private currentBlueprint: BoardContraptionBlueprintB | null = null;
  private nodeRigs = new Map<string, NodeRigB>();
  private hitMeshes: THREE.Mesh[] = [];
  private hoveredNodeId: string | null = null;

  // Dynamic superstructure handles
  private wheelPivot: THREE.Group | null = null;
  private ringPivots: THREE.Object3D[] = [];
  private conveyorRollers: THREE.Mesh[] = [];
  private elevatorCabs: THREE.Mesh[] = [];
  private magneticCoreMesh: THREE.Object3D | null = null;
  private splitSpheresGroup: THREE.Group | null = null;
  private floodWaterMesh: THREE.Mesh | null = null;
  private spotlightGroup: THREE.Group | null = null;
  private spotlightBeamLight: THREE.SpotLight | null = null;
  private spotlightTargetObj: THREE.Object3D | null = null;
  private dynamicLinksGroup: THREE.Group | null = null;
  private hoverRingMesh: THREE.Mesh | null = null;

  // Smooth spring animation targets
  private targetGravityRotZ = 0;
  private currentGravityRotZ = 0;
  private targetFloodY = -1.65;
  private targetRingRad: [number, number, number] = [0, 0, 0];
  private targetSpotPos = new THREE.Vector3(0, 0, 0);
  private targetSpotRadius = 2.15;
  private magneticPolarity: 1 | -1 = 1;
  private kineticSpeed = 1.0;

  // Reusable raycasting helpers
  private readonly raycaster = new THREE.Raycaster();
  private readonly ndcVec = new THREE.Vector2();
  private readonly boardPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private readonly planeHitVec = new THREE.Vector3();

  // Disposal tracking
  private ownedGeometries: THREE.BufferGeometry[] = [];
  private ownedMaterials: THREE.Material[] = [];
  private ownedTextures: THREE.Texture[] = [];

  public mountBoard(
    parent: THREE.Object3D,
    state: BoardRuntimeStateV6,
    twistSnapshot: TwistDirectorSnapshotV6,
    stageTheme?: StageAtmosphereThemeV6,
  ): THREE.Group {
    this.dispose();

    this.parentObject = parent;
    this.currentDef = state.definition;
    this.currentBlueprint = getBoardBlueprintB(state.definition.boardId) ?? null;
    this.kineticSpeed = this.currentBlueprint?.kineticSpeed ?? 1.0;

    this.rootGroup = new THREE.Group();
    this.rootGroup.name = `v6_board_b_${state.definition.boardId}`;

    this.boardPivot = new THREE.Group();
    this.boardPivot.name = 'v6_board_pivot';
    this.rootGroup.add(this.boardPivot);

    this.materials = this.createStageMaterialKit(state.definition, stageTheme);

    // 1. Build Family-Specific 3D Physical Contraption Chassis & Animated Props
    this.buildFamilySuperstructure(this.boardPivot, state.definition, this.currentBlueprint, this.materials);

    // 2. Build Interactive 3D Board Nodes (Gem Pedestals, Iron Chains, Fuses, Cloches, Freeze Shields)
    const isFerrisWheel =
      this.currentBlueprint?.layoutKind === 'FERRIS_GONDOLA_WHEEL' ||
      this.currentBlueprint?.layoutKind === 'COASTER_LOOP';
    const nodeHost = isFerrisWheel && this.wheelPivot ? this.wheelPivot : this.boardPivot;

    for (const node of state.nodes) {
      const rig = this.createNodeRig(node, state.definition, this.materials, isFerrisWheel);
      this.nodeRigs.set(node.nodeId, rig);
      this.hitMeshes.push(rig.hitMesh);
      nodeHost.add(rig.group);
    }

    // 3. Build Dynamic Conduit Layer (Quantum Entanglement, Laser Ricochet, High-Voltage Arcs)
    this.dynamicLinksGroup = new THREE.Group();
    this.dynamicLinksGroup.name = 'v6_dynamic_links';
    this.boardPivot.add(this.dynamicLinksGroup);

    // 4. Build Floodwater Caustic Plane (for RISING_FLOOD_STAGE)
    const waterGeo = this.trackGeo(new THREE.CylinderGeometry(4.4, 4.4, 0.08, 48));
    this.floodWaterMesh = new THREE.Mesh(waterGeo, this.materials.waterSurface);
    this.floodWaterMesh.position.y = -2.2;
    this.floodWaterMesh.visible = false;
    this.rootGroup.add(this.floodWaterMesh);

    // 5. Build Volumetric 3D Fresnel Spotlight Rig (for BLACKOUT_SPOTLIGHT)
    this.buildSpotlightRig(this.rootGroup, this.materials);

    // 6. Build Hover Selection Brass Ring
    const hoverGeo = this.trackGeo(new THREE.TorusGeometry(0.56, 0.045, 12, 32));
    const hoverMat = this.trackMat(
      new THREE.MeshBasicMaterial({
        color: 0xffe066,
        transparent: true,
        opacity: 0.9,
      }),
    );
    this.hoverRingMesh = new THREE.Mesh(hoverGeo, hoverMat);
    this.hoverRingMesh.rotation.x = Math.PI / 2;
    this.hoverRingMesh.visible = false;
    nodeHost.add(this.hoverRingMesh);

    parent.add(this.rootGroup);
    this.syncState(state, twistSnapshot);
    return this.rootGroup;
  }

  public syncState(
    state: BoardRuntimeStateV6,
    twistSnapshot: TwistDirectorSnapshotV6,
  ): void {
    if (!this.rootGroup || !this.materials) return;

    this.targetGravityRotZ = twistSnapshot.gravityInverted ? Math.PI : 0;
    this.targetFloodY = twistSnapshot.floodWaterLevelY;
    this.magneticPolarity = twistSnapshot.magneticPolarity;
    this.targetRingRad = [
      THREE.MathUtils.degToRad(state.ringRotationsDeg[0]),
      THREE.MathUtils.degToRad(state.ringRotationsDeg[1]),
      THREE.MathUtils.degToRad(state.ringRotationsDeg[2]),
    ];
    this.targetSpotPos.set(
      twistSnapshot.spotlightTarget3d[0],
      twistSnapshot.spotlightTarget3d[1],
      twistSnapshot.spotlightTarget3d[2],
    );
    this.targetSpotRadius = twistSnapshot.spotlightRadius;

    // Toggle Floodwater Plane
    const hasFlood =
      twistSnapshot.activeTwist === 'RISING_FLOOD_STAGE' ||
      twistSnapshot.secondaryTwist === 'RISING_FLOOD_STAGE' ||
      twistSnapshot.submergedNodeIds.length > 0;
    if (this.floodWaterMesh) {
      this.floodWaterMesh.visible = hasFlood;
    }

    // Toggle Volumetric Blackout Spotlight Cone
    const hasBlackout =
      twistSnapshot.activeTwist === 'BLACKOUT_SPOTLIGHT' ||
      twistSnapshot.secondaryTwist === 'BLACKOUT_SPOTLIGHT';
    if (this.spotlightGroup) {
      this.spotlightGroup.visible = hasBlackout;
    }

    // Toggle Split-or-Steal Golden Spheres
    if (this.splitSpheresGroup) {
      const showSpheres =
        twistSnapshot.activeTwist === 'SPLIT_OR_STEAL_VAULT' ||
        twistSnapshot.secondaryTwist === 'SPLIT_OR_STEAL_VAULT' ||
        state.definition.mechanicArchetype === 'SPLIT_OR_STEAL_ARENA';
      this.splitSpheresGroup.visible = showSpheres;
    }

    const submergedSet = new Set(twistSnapshot.submergedNodeIds);
    const frozenSet = new Set(twistSnapshot.frozenNodeIds);
    const hazardSet = new Set(twistSnapshot.hazardNodeIds);
    const jammedSet = new Set(twistSnapshot.jammedNodeIds);
    const revealedMoles = new Set(twistSnapshot.revealedMoleNodeIds);
    const alignedSet = new Set(state.alignedNodeIds);
    const laserSet = new Set(twistSnapshot.laserPathNodeIds);

    for (const node of state.nodes) {
      const rig = this.nodeRigs.get(node.nodeId);
      if (!rig) continue;

      rig.targetPos.set(node.pos3d[0], node.pos3d[1], node.pos3d[2]);
      rig.isSubmerged = submergedSet.has(node.nodeId);
      rig.isAligned = alignedSet.has(node.nodeId);
      rig.isMoleRevealed = revealedMoles.has(node.nodeId);
      rig.moleTellIntensity = node.isDoubleAgentMole
        ? (twistSnapshot.moleTellIntensity[node.nodeId] ?? 0.45)
        : 0;

      // Spotlight darkness check
      const distSpot = Math.hypot(
        node.pos3d[0] - this.targetSpotPos.x,
        node.pos3d[2] - this.targetSpotPos.z,
      );
      rig.isVisible =
        !hasBlackout ||
        node.owner === 'PLAYER' ||
        node.owner === 'RIVAL' ||
        distSpot <= this.targetSpotRadius;

      // Update Gem PBR Color & Emissive by Ownership & Twist State
      this.applyNodeVisualMaterial(
        rig,
        node,
        state.definition,
        laserSet.has(node.nodeId),
        twistSnapshot.bountyNodeId === node.nodeId,
      );

      // Sub-props visibility
      rig.chainGroup.visible = node.lockedChains > 0;
      const fuseLeft = twistSnapshot.fuseTimers[node.nodeId];
      rig.fuseGroup.visible = Boolean(node.hasTrapFuse || (fuseLeft !== undefined && fuseLeft > 0));
      rig.clocheMesh.visible = Boolean(node.isMysteryAuction && node.owner === 'NONE');
      rig.freezeShieldMesh.visible = frozenSet.has(node.nodeId);
      rig.hazardRingMesh.visible = hazardSet.has(node.nodeId) && node.owner === 'NONE';
      rig.jammerMesh.visible = jammedSet.has(node.nodeId) && node.owner === 'NONE';
      rig.bountyCrownMesh.visible = twistSnapshot.bountyNodeId === node.nodeId && node.owner === 'NONE';
    }

    // Rebuild luminous dynamic arcs (Quantum Entangled Pairs, Laser Ricochet, High-Voltage Chains)
    this.rebuildDynamicConduits(state, twistSnapshot);
  }

  public update(dtSeconds: number, elapsedSeconds: number): void {
    if (!this.rootGroup || !this.boardPivot) return;
    const dt = Math.min(0.05, Math.max(0.001, dtSeconds));
    const damp = 1 - Math.exp(-8.0 * dt);

    // 1. Smooth 180° Gravity Inversion Spring Rotation
    this.currentGravityRotZ += (this.targetGravityRotZ - this.currentGravityRotZ) * damp;
    this.boardPivot.rotation.z = this.currentGravityRotZ;

    // 2. Smooth Rotary Rings / Ferris Wheel Animation
    if (this.wheelPivot) {
      this.wheelPivot.rotation.z +=
        (this.targetRingRad[0] - this.wheelPivot.rotation.z) * damp * 0.85;
      // Gentle living idle breathing rotation on carnival wheel
      const gentleRoll = Math.sin(elapsedSeconds * 0.45 * this.kineticSpeed) * 0.03;
      this.wheelPivot.rotation.z += gentleRoll * dt;
    }

    for (let i = 0; i < this.ringPivots.length; i++) {
      const pivot = this.ringPivots[i];
      const targetAngle = this.targetRingRad[i % 3];
      const idleSpin = elapsedSeconds * (i % 2 === 0 ? 0.16 : -0.12) * this.kineticSpeed;
      pivot.rotation.y += (targetAngle + idleSpin - pivot.rotation.y) * damp * 0.4;
    }

    // 3. Spin Conveyor Belt Idler Rollers
    for (let i = 0; i < this.conveyorRollers.length; i++) {
      this.conveyorRollers[i].rotation.z -= dt * 2.4 * this.kineticSpeed;
    }

    // 4. Animate Express Elevator Cabs
    for (let i = 0; i < this.elevatorCabs.length; i++) {
      const cab = this.elevatorCabs[i];
      cab.position.y = Math.sin(elapsedSeconds * (0.9 + i * 0.25) * this.kineticSpeed + i * 1.4) * 1.1;
    }

    // 5. Spin Magnetic Repulsor Dipole Core
    if (this.magneticCoreMesh) {
      this.magneticCoreMesh.rotation.y += dt * 1.8 * this.magneticPolarity * this.kineticSpeed;
    }

    // 6. Orbit Split-or-Steal Twin Golden Spheres
    if (this.splitSpheresGroup && this.splitSpheresGroup.visible) {
      this.splitSpheresGroup.rotation.y = elapsedSeconds * 0.85;
      this.splitSpheresGroup.position.y = 1.45 + Math.sin(elapsedSeconds * 2.2) * 0.12;
    }

    // 7. Animate Rising Caustic Floodwater Plane
    if (this.floodWaterMesh && this.floodWaterMesh.visible) {
      this.floodWaterMesh.position.y += (this.targetFloodY - this.floodWaterMesh.position.y) * damp;
      this.floodWaterMesh.rotation.y = elapsedSeconds * 0.18;
      this.floodWaterMesh.position.y += Math.sin(elapsedSeconds * 2.4) * 0.0025;
    }

    // 8. Aim Volumetric 3D Fresnel Spotlight Cone
    if (this.spotlightGroup && this.spotlightGroup.visible && this.spotlightTargetObj) {
      this.spotlightTargetObj.position.lerp(this.targetSpotPos, damp);
      this.spotlightGroup.position.x += (this.targetSpotPos.x * 0.35 - this.spotlightGroup.position.x) * damp;
      this.spotlightGroup.position.z += (this.targetSpotPos.z * 0.35 - this.spotlightGroup.position.z) * damp;
      this.spotlightGroup.lookAt(this.spotlightTargetObj.position);
      if (this.spotlightBeamLight) {
        this.spotlightBeamLight.angle = Math.min(0.65, 0.28 + this.targetSpotRadius * 0.08);
      }
    }

    // 9. Per-Node Living Animations (Conveyor lerp, Mole Physical Wobble Tell, Fuse Sparks, Hover Lift!)
    let hoveredPos: THREE.Vector3 | null = null;
    this.nodeRigs.forEach((rig) => {
      rig.group.position.lerp(rig.targetPos, damp);

      // Keep vertical Ferris wheel gondolas upright as the wheel rotates!
      if (rig.isGondola && this.wheelPivot) {
        rig.group.rotation.z = -this.wheelPivot.rotation.z;
      }

      // Hover lift & aligned pulse
      const isHovered = rig.nodeId === this.hoveredNodeId;
      const hoverLift = isHovered ? 0.24 : rig.isAligned ? 0.08 : 0;
      const submergedDrop = rig.isSubmerged ? -0.28 : 0;
      rig.gemMesh.position.y +=
        (0.28 + hoverLift + submergedDrop + Math.sin(elapsedSeconds * 2.3 + rig.basePos.x) * 0.025 - rig.gemMesh.position.y) *
        damp;

      // EAGLE-EYE PHYSICAL 3D TELL ON DOUBLE-AGENT MOLES!
      if (rig.moleTellIntensity > 0 && !rig.isMoleRevealed) {
        const shiver = Math.sin(elapsedSeconds * 15.0 + rig.basePos.x * 4.0) * 0.055 * rig.moleTellIntensity;
        rig.gemMesh.rotation.z = shiver;
        rig.gemMesh.rotation.x = Math.cos(elapsedSeconds * 11.5) * 0.035 * rig.moleTellIntensity;
      } else {
        rig.gemMesh.rotation.z *= 0.85;
        rig.gemMesh.rotation.x *= 0.85;
      }

      // Sparking Bomb Fuse Flicker
      if (rig.fuseGroup.visible) {
        const pulse = 0.85 + Math.sin(elapsedSeconds * 24.0) * 0.45;
        rig.fuseSparkMesh.scale.setScalar(pulse);
      }

      // Golden Bounty Beacon Spin
      if (rig.bountyCrownMesh.visible) {
        rig.bountyCrownMesh.rotation.y = elapsedSeconds * 2.2;
        rig.bountyCrownMesh.position.y = 0.88 + Math.sin(elapsedSeconds * 3.8) * 0.08;
      }

      // Auction Cloche Gentle Hover
      if (rig.clocheMesh.visible) {
        rig.clocheMesh.position.y = 0.34 + Math.sin(elapsedSeconds * 2.5) * 0.04;
      }

      // Jammer static spin
      if (rig.jammerMesh.visible) {
        rig.jammerMesh.rotation.y = -elapsedSeconds * 2.6;
      }

      if (isHovered) {
        hoveredPos = rig.group.position;
      }
    });

    // Update Hover Selection Brass Ring
    if (this.hoverRingMesh) {
      if (hoveredPos) {
        this.hoverRingMesh.visible = true;
        this.hoverRingMesh.position.copy(hoveredPos);
        this.hoverRingMesh.position.y += 0.12;
        this.hoverRingMesh.rotation.z = elapsedSeconds * 1.4;
      } else {
        this.hoverRingMesh.visible = false;
      }
    }
  }

  public pickNodeAtNdc(
    ndcX: number,
    ndcY: number,
    camera: THREE.Camera,
  ): BoardHitResultV6 {
    this.ndcVec.set(ndcX, ndcY);
    this.raycaster.setFromCamera(this.ndcVec, camera);

    const hits = this.raycaster.intersectObjects(this.hitMeshes, false);
    let nodeId: string | null = null;
    if (hits.length > 0) {
      const hitNodeId = hits[0].object.userData?.nodeId;
      if (typeof hitNodeId === 'string') {
        nodeId = hitNodeId;
      }
    }

    let boardPlanePoint: [number, number, number] | null = null;
    if (this.raycaster.ray.intersectPlane(this.boardPlane, this.planeHitVec)) {
      boardPlanePoint = [this.planeHitVec.x, this.planeHitVec.y, this.planeHitVec.z];
    }

    return { nodeId, boardPlanePoint };
  }

  public setHoveredNode(nodeId: string | null): void {
    this.hoveredNodeId = nodeId;
  }

  public dispose(): void {
    if (this.rootGroup && this.parentObject) {
      this.parentObject.remove(this.rootGroup);
    }
    this.clearDynamicLinks();
    for (const geo of this.ownedGeometries) {
      geo.dispose();
    }
    for (const mat of this.ownedMaterials) {
      mat.dispose();
    }
    for (const tex of this.ownedTextures) {
      tex.dispose();
    }
    this.ownedGeometries = [];
    this.ownedMaterials = [];
    this.ownedTextures = [];
    this.nodeRigs.clear();
    this.hitMeshes = [];
    this.ringPivots = [];
    this.conveyorRollers = [];
    this.elevatorCabs = [];
    this.wheelPivot = null;
    this.magneticCoreMesh = null;
    this.splitSpheresGroup = null;
    this.floodWaterMesh = null;
    this.spotlightGroup = null;
    this.spotlightBeamLight = null;
    this.spotlightTargetObj = null;
    this.dynamicLinksGroup = null;
    this.hoverRingMesh = null;
    this.rootGroup = null;
    this.boardPivot = null;
    this.parentObject = null;
    this.materials = null;
    this.currentDef = null;
    this.currentBlueprint = null;
    this.hoveredNodeId = null;
  }

  // --------------------------------------------------------------------------
  // Stage-Chameleon PBR Material Builder
  // --------------------------------------------------------------------------

  private createStageMaterialKit(
    def: BoardDefinitionV6,
    stageTheme?: StageAtmosphereThemeV6,
  ): StageMaterialKitB {
    const m = stageTheme?.materials;
    const trimHex = m?.trimMetalHex ?? def.accentPalette.primaryHex;
    const floorHex = m?.floorColorHex ?? def.accentPalette.secondaryHex;
    const stoneHex = m?.stoneOrWoodHex ?? def.accentPalette.secondaryHex;
    const jewelPrimary = m?.jewelPrimaryHex ?? def.accentPalette.gemHex;
    const jewelSecondary = m?.jewelSecondaryHex ?? def.accentPalette.primaryHex;

    return {
      trimMetal: this.trackMat(
        new THREE.MeshStandardMaterial({
          color: trimHex,
          roughness: m?.trimRoughness ?? 0.28,
          metalness: m?.trimMetalness ?? 0.86,
        }),
      ),
      darkChassis: this.trackMat(
        new THREE.MeshStandardMaterial({
          color: floorHex,
          roughness: m?.floorRoughness ?? 0.62,
          metalness: m?.floorMetalness ?? 0.22,
        }),
      ),
      stageStone: this.trackMat(
        new THREE.MeshStandardMaterial({
          color: stoneHex,
          roughness: 0.52,
          metalness: 0.14,
        }),
      ),
      accentBrass: this.trackMat(
        new THREE.MeshStandardMaterial({
          color: def.accentPalette.primaryHex,
          roughness: 0.24,
          metalness: 0.88,
        }),
      ),
      ironChain: this.trackMat(
        new THREE.MeshStandardMaterial({
          color: 0x3b424c,
          roughness: 0.42,
          metalness: 0.85,
        }),
      ),
      velvetCloche: this.trackMat(
        new THREE.MeshStandardMaterial({
          color: 0x8f1120,
          roughness: 0.84,
          metalness: 0.08,
        }),
      ),
      freezeCrystal: this.trackMat(
        new THREE.MeshPhysicalMaterial({
          color: 0x90e0ef,
          roughness: 0.12,
          metalness: 0.1,
          transmission: 0.55,
          transparent: true,
          opacity: 0.65,
          clearcoat: 1.0,
        }),
      ),
      hazardChevron: this.trackMat(
        new THREE.MeshStandardMaterial({
          color: 0xe63946,
          emissive: 0x6b0d14,
          roughness: 0.35,
          metalness: 0.4,
        }),
      ),
      jammerStatic: this.trackMat(
        new THREE.MeshStandardMaterial({
          color: 0x6ec1e4,
          emissive: 0x1d4e89,
          wireframe: true,
          transparent: true,
          opacity: 0.72,
        }),
      ),
      fuseCord: this.trackMat(
        new THREE.MeshStandardMaterial({
          color: 0xc2955d,
          roughness: 0.85,
          metalness: 0.05,
        }),
      ),
      fuseSpark: this.trackMat(
        new THREE.MeshBasicMaterial({
          color: 0xff9f1c,
        }),
      ),
      bountyGold: this.trackMat(
        new THREE.MeshStandardMaterial({
          color: 0xffd700,
          emissive: 0x664400,
          roughness: 0.18,
          metalness: 0.95,
        }),
      ),
      waterSurface: this.trackMat(
        new THREE.MeshPhysicalMaterial({
          color: 0x0096c7,
          emissive: 0x023e8a,
          emissiveIntensity: 0.25,
          roughness: 0.14,
          metalness: 0.12,
          transparent: true,
          opacity: 0.62,
          clearcoat: 0.9,
        }),
      ),
      laserBeam: this.trackMat(
        new THREE.MeshBasicMaterial({
          color: 0xff2a55,
          transparent: true,
          opacity: 0.88,
        }),
      ),
      quantumArc: this.trackMat(
        new THREE.MeshBasicMaterial({
          color: jewelPrimary,
          transparent: true,
          opacity: 0.78,
        }),
      ),
      voltageArc: this.trackMat(
        new THREE.MeshBasicMaterial({
          color: jewelSecondary,
          transparent: true,
          opacity: 0.92,
        }),
      ),
      spotlightCone: this.trackMat(
        new THREE.MeshBasicMaterial({
          color: 0xffe8a3,
          transparent: true,
          opacity: 0.16,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
      ),
    };
  }

  // --------------------------------------------------------------------------
  // Bespoke 3D Contraption Architecture per Family VI–X
  // --------------------------------------------------------------------------

  private buildFamilySuperstructure(
    pivot: THREE.Group,
    def: BoardDefinitionV6,
    blueprint: BoardContraptionBlueprintB | null,
    mats: StageMaterialKitB,
  ): void {
    const kind = blueprint?.layoutKind;

    // 1. Stepped Gold Pyramid / Ziggurat / Escher Inverted Pyramid
    if (
      kind === 'PYRAMID_4321' ||
      kind === 'ESCHER_INVERTED_PYRAMID' ||
      kind === 'ZIGGURAT_TERRACE' ||
      kind === 'HIGH_STRIKER_TOWER'
    ) {
      const terraceMat = this.trackMat(
        new THREE.MeshStandardMaterial({
          color: 0x261d15,
          roughness: 0.58,
          metalness: 0.32,
        }),
      );
      const apexMat = this.trackMat(
        new THREE.MeshStandardMaterial({
          color: 0x7c5821,
          roughness: 0.42,
          metalness: 0.62,
        }),
      );
      const steps = 4;
      for (let s = 0; s < steps; s++) {
        const w = 5.6 - s * 1.18;
        const d = 3.5 - s * 0.6;
        const geo = this.trackGeo(new THREE.BoxGeometry(w, 0.32, d));
        const mesh = new THREE.Mesh(geo, s === steps - 1 ? apexMat : terraceMat);
        mesh.position.set(0, s * 0.74 - 1.1, (steps - 1 - s) * 0.42 - 0.55);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        pivot.add(mesh);

        // Gilded trim cornice around each terrace
        const trimGeo = this.trackGeo(new THREE.BoxGeometry(w + 0.1, 0.055, d + 0.1));
        const trim = new THREE.Mesh(trimGeo, mats.trimMetal);
        trim.position.set(0, mesh.position.y + 0.17, mesh.position.z);
        pivot.add(trim);
      }
      return;
    }

    // 2. Factory Conveyor Belt / Hydro Spillway / Tin-Duck Gallery
    if (
      kind === 'CONVEYOR_DUAL_BELT' ||
      kind === 'SPILLWAY_DAM' ||
      kind === 'TIN_DUCK_GALLERY' ||
      kind === 'RING_TOSS_BOTTLES'
    ) {
      const lanes = kind === 'CONVEYOR_DUAL_BELT' ? 2 : 3;
      for (let l = 0; l < lanes; l++) {
        const z = (l - (lanes - 1) / 2) * 1.35;
        const y = kind === 'SPILLWAY_DAM' ? (lanes - 1 - l) * 0.65 - 0.68 : -0.18;
        const deckGeo = this.trackGeo(new THREE.BoxGeometry(6.8, 0.22, 0.92));
        const deck = new THREE.Mesh(deckGeo, mats.darkChassis);
        deck.position.set(0, y, z);
        deck.receiveShadow = true;
        pivot.add(deck);

        // Twin brass guard rails
        for (const side of [-0.48, 0.48]) {
          const railGeo = this.trackGeo(new THREE.BoxGeometry(6.9, 0.1, 0.06));
          const rail = new THREE.Mesh(railGeo, mats.trimMetal);
          rail.position.set(0, y + 0.12, z + side);
          pivot.add(rail);
        }

        // Rotating conveyor end rollers
        for (const endX of [-3.4, 3.4]) {
          const rollerGeo = this.trackGeo(new THREE.CylinderGeometry(0.16, 0.16, 0.96, 16));
          const roller = new THREE.Mesh(rollerGeo, mats.accentBrass);
          roller.rotation.x = Math.PI / 2;
          roller.position.set(endX, y, z);
          pivot.add(roller);
          this.conveyorRollers.push(roller);
        }
      }

      // Molten Smelter Hood at +X discharge for Factory Conveyor!
      if (kind === 'CONVEYOR_DUAL_BELT') {
        const hoodGeo = this.trackGeo(new THREE.BoxGeometry(0.95, 1.45, 3.4));
        const hood = new THREE.Mesh(hoodGeo, mats.trimMetal);
        hood.position.set(3.85, 0.4, 0);
        hood.castShadow = true;
        pivot.add(hood);

        const glowGeo = this.trackGeo(new THREE.BoxGeometry(0.18, 0.85, 2.8));
        const glowMat = this.trackMat(new THREE.MeshBasicMaterial({ color: 0xff6d00 }));
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.position.set(3.35, 0.25, 0);
        pivot.add(glow);
      }
      return;
    }

    // 3. Vertical 3D Carousel Ferris Wheel & Roller-Coaster Loop!
    if (kind === 'FERRIS_GONDOLA_WHEEL' || kind === 'COASTER_LOOP') {
      // Twin A-frame pier support legs scaled cleanly to fit portrait FOV
      for (const zSide of [-0.48, 0.48]) {
        for (const tilt of [-0.32, 0.32]) {
          const legGeo = this.trackGeo(new THREE.CylinderGeometry(0.065, 0.1, 2.85, 12));
          const leg = new THREE.Mesh(legGeo, mats.trimMetal);
          leg.position.set(tilt * 1.85, -0.95, zSide);
          leg.rotation.z = tilt;
          pivot.add(leg);
        }
      }

      // Rotating spoked Ferris wheel assembly (0.72x scale fits portrait 100%)
      this.wheelPivot = new THREE.Group();
      this.wheelPivot.position.set(0, 0.12, 0);
      this.wheelPivot.scale.setScalar(0.72);
      pivot.add(this.wheelPivot);

      for (const zOff of [-0.28, 0.28]) {
        const rimGeo = this.trackGeo(new THREE.TorusGeometry(2.45, 0.08, 12, 48));
        const rim = new THREE.Mesh(rimGeo, mats.accentBrass);
        rim.position.z = zOff;
        this.wheelPivot.add(rim);
      }

      const spokeCount = 12;
      for (let i = 0; i < spokeCount; i++) {
        const angle = (i / spokeCount) * Math.PI * 2;
        const spokeGeo = this.trackGeo(new THREE.CylinderGeometry(0.03, 0.03, 4.9, 8));
        const spoke = new THREE.Mesh(spokeGeo, mats.trimMetal);
        spoke.rotation.z = angle;
        this.wheelPivot.add(spoke);
      }

      const hubGeo = this.trackGeo(new THREE.CylinderGeometry(0.38, 0.38, 1.45, 24));
      const hub = new THREE.Mesh(hubGeo, mats.darkChassis);
      hub.rotation.x = Math.PI / 2;
      this.wheelPivot.add(hub);
      return;
    }

    // 4. Vertical Elevator Shafts / Pipe Organ / Calliope / Bathysphere Trench
    if (
      kind === 'ELEVATOR_3_SHAFT' ||
      kind === 'CALLIOPE_VALVES' ||
      kind === 'SCAFFOLD_TOWER' ||
      kind === 'BATHYSPHERE_TRENCH' ||
      kind === 'PIPE_ORGAN_RANKS'
    ) {
      const baseGeo = this.trackGeo(new THREE.BoxGeometry(6.6, 0.32, 2.2));
      const base = new THREE.Mesh(baseGeo, mats.darkChassis);
      base.position.set(0, -1.55, 0);
      pivot.add(base);

      const shafts = kind === 'ELEVATOR_3_SHAFT' ? 3 : 4;
      for (let s = 0; s < shafts; s++) {
        const x = (s - (shafts - 1) / 2) * 1.45;
        const height = kind === 'PIPE_ORGAN_RANKS' ? 3.0 + (s % 2) * 0.75 : 3.4;
        const railGeo = this.trackGeo(new THREE.CylinderGeometry(0.06, 0.06, height, 12));
        const leftRail = new THREE.Mesh(railGeo, mats.trimMetal);
        leftRail.position.set(x - 0.38, 0.15, -0.35);
        pivot.add(leftRail);
        const rightRail = new THREE.Mesh(railGeo, mats.trimMetal);
        rightRail.position.set(x + 0.38, 0.15, -0.35);
        pivot.add(rightRail);

        // Moving bronze express cab / valve piston
        const cabGeo = this.trackGeo(new THREE.BoxGeometry(0.68, 0.38, 0.24));
        const cab = new THREE.Mesh(cabGeo, mats.accentBrass);
        cab.position.set(x, 0, -0.45);
        pivot.add(cab);
        this.elevatorCabs.push(cab);
      }
      return;
    }

    // 5. Armillary Rings / Chariot Oval / Foundry Crucible / Flood Island / Magnetic Disk / Sovereign Reactor!
    const plinthGeo = this.trackGeo(new THREE.CylinderGeometry(3.55, 3.85, 0.36, 48));
    const plinth = new THREE.Mesh(plinthGeo, mats.darkChassis);
    plinth.position.y = -0.45;
    plinth.receiveShadow = true;
    pivot.add(plinth);

    const outerBezelGeo = this.trackGeo(new THREE.TorusGeometry(3.48, 0.1, 14, 64));
    const outerBezel = new THREE.Mesh(outerBezelGeo, mats.trimMetal);
    outerBezel.rotation.x = Math.PI / 2;
    outerBezel.position.y = -0.25;
    pivot.add(outerBezel);

    // Three counter-rotating gimbal rings (tilted for Armillary / Astral, flat for Reactor / Chariot)
    const isTiltedGimbal =
      kind === 'ARMILLARY_3_RING' ||
      kind === 'SOVEREIGN_MIND_REACTOR' ||
      kind === 'SUPERNOVA_CORE' ||
      def.family === 'ASTRAL_QUANTUM';
    const radii = [1.48, 2.25, 2.95];
    for (let r = 0; r < radii.length; r++) {
      const ringGroup = new THREE.Group();
      const ringGeo = this.trackGeo(new THREE.TorusGeometry(radii[r], 0.055, 10, 56));
      const ringMesh = new THREE.Mesh(ringGeo, r === 1 ? mats.accentBrass : mats.trimMetal);
      ringMesh.rotation.x = Math.PI / 2 + (isTiltedGimbal ? (r - 1) * 0.28 : 0);
      ringGroup.add(ringMesh);
      pivot.add(ringGroup);
      this.ringPivots.push(ringGroup);
    }

    // Central Dipole Electromagnet for Magnetic Repulsor boards
    if (
      kind === 'MAGNETIC_REPULSOR_DISK' ||
      kind === 'FOUNDRY_CRUCIBLE_RING' ||
      def.defaultTwist === 'MAGNETIC_REPULSOR'
    ) {
      const magGroup = new THREE.Group();
      const coilGeo = this.trackGeo(new THREE.TorusGeometry(0.55, 0.14, 12, 24, Math.PI * 1.45));
      const coil = new THREE.Mesh(coilGeo, mats.accentBrass);
      coil.rotation.x = Math.PI / 2;
      magGroup.add(coil);
      magGroup.position.y = 0.05;
      pivot.add(magGroup);
      this.magneticCoreMesh = magGroup;
    }

    // Floating Twin Golden Spheres for Split-or-Steal Arena & Board 100!
    if (
      kind === 'SPLIT_STEAL_ARENA' ||
      kind === 'SOVEREIGN_MIND_REACTOR' ||
      def.defaultTwist === 'SPLIT_OR_STEAL_VAULT'
    ) {
      this.splitSpheresGroup = new THREE.Group();
      this.splitSpheresGroup.position.set(0, 1.45, 0);
      const sphereGeo = this.trackGeo(new THREE.SphereGeometry(0.32, 24, 24));
      const leftSphere = new THREE.Mesh(sphereGeo, mats.bountyGold);
      leftSphere.position.x = -0.62;
      const rightSphere = new THREE.Mesh(sphereGeo, mats.bountyGold);
      rightSphere.position.x = 0.62;
      this.splitSpheresGroup.add(leftSphere, rightSphere);
      pivot.add(this.splitSpheresGroup);
    }
  }

  // --------------------------------------------------------------------------
  // Individual 3D Node Rig Assembly (Beveled Hex/Octagon + Interactive Overlays)
  // --------------------------------------------------------------------------

  private createNodeRig(
    node: BoardNodeV6,
    def: BoardDefinitionV6,
    mats: StageMaterialKitB,
    isGondola: boolean,
  ): NodeRigB {
    const group = new THREE.Group();
    group.name = `v6_node_${node.nodeId}`;
    group.position.set(node.pos3d[0], node.pos3d[1], node.pos3d[2]);

    // Sculpted brass pedestal collar
    const pedGeo = this.trackGeo(
      isGondola
        ? new THREE.CylinderGeometry(0.34, 0.42, 0.24, 8)
        : new THREE.CylinderGeometry(0.46, 0.54, 0.2, 6),
    );
    const pedestalMesh = new THREE.Mesh(pedGeo, mats.trimMetal);
    pedestalMesh.castShadow = true;
    pedestalMesh.receiveShadow = true;
    group.add(pedestalMesh);

    // Beveled physical crystal gem cap
    const gemGeo = this.trackGeo(
      def.family === 'ASTRAL_QUANTUM'
        ? new THREE.OctahedronGeometry(0.36, 0)
        : new THREE.CylinderGeometry(0.38, 0.42, 0.22, 6),
    );
    const gemMat = this.trackMat(
      new THREE.MeshPhysicalMaterial({
        color: def.accentPalette.gemHex,
        emissive: def.accentPalette.secondaryHex,
        emissiveIntensity: 0.22,
        roughness: 0.16,
        metalness: 0.18,
        clearcoat: 0.95,
        clearcoatRoughness: 0.12,
      }),
    );
    const gemMesh = new THREE.Mesh(gemGeo, gemMat);
    gemMesh.position.y = 0.26;
    gemMesh.castShadow = true;
    gemMesh.userData = { nodeId: node.nodeId };
    group.add(gemMesh);

    // Crisp 256x256 CanvasTexture Top-Cap Category + $Chips Plaque
    if (typeof document !== 'undefined') {
      const cvs = document.createElement('canvas');
      cvs.width = 256;
      cvs.height = 256;
      const c2d = cvs.getContext('2d');
      if (c2d) {
        c2d.fillStyle = '#120e16';
        c2d.beginPath();
        c2d.arc(128, 128, 118, 0, Math.PI * 2);
        c2d.fill();
        c2d.strokeStyle = '#f2ca6b';
        c2d.lineWidth = 10;
        c2d.stroke();

        c2d.fillStyle = '#fff5dc';
        c2d.textAlign = 'center';
        c2d.textBaseline = 'middle';
        c2d.font = '800 30px "Inter", "Segoe UI", sans-serif';
        const shortCat = (node.categoryLabel || 'TRIVIA').toUpperCase().slice(0, 8);
        c2d.fillText(shortCat, 128, 102);

        c2d.fillStyle = '#f8cf6a';
        c2d.font = '900 40px "JetBrains Mono", monospace';
        c2d.fillText(`$${node.baseChips}`, 128, 154);

        const tex = new THREE.CanvasTexture(cvs);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        this.ownedTextures.push(tex);

        const capGeo = this.trackGeo(new THREE.CircleGeometry(0.28, 24));
        const capMat = this.trackMat(
          new THREE.MeshBasicMaterial({
            map: tex,
            polygonOffset: true,
            polygonOffsetFactor: -2,
          }),
        );
        const capMesh = new THREE.Mesh(capGeo, capMat);
        capMesh.rotation.x = -Math.PI / 2;
        capMesh.position.y = def.family === 'ASTRAL_QUANTUM' ? 0.39 : 0.125;
        capMesh.userData = { nodeId: node.nodeId };
        gemMesh.add(capMesh);
      }
    }

    // Generous invisible raycast hit target for crisp finger/mouse tapping
    const hitGeo = this.trackGeo(new THREE.CylinderGeometry(0.55, 0.55, 0.65, 12));
    const hitMat = this.trackMat(new THREE.MeshBasicMaterial({ visible: false }));
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.position.y = 0.26;
    hitMesh.userData = { nodeId: node.nodeId };
    group.add(hitMesh);

    // 3D Crossed Iron Chains (visible when lockedChains > 0)
    const chainGroup = new THREE.Group();
    const chainGeo = this.trackGeo(new THREE.TorusGeometry(0.42, 0.055, 8, 20));
    const chainA = new THREE.Mesh(chainGeo, mats.ironChain);
    chainA.rotation.set(Math.PI / 4, 0, Math.PI / 4);
    chainA.position.y = 0.28;
    const chainB = new THREE.Mesh(chainGeo, mats.ironChain);
    chainB.rotation.set(-Math.PI / 4, 0, -Math.PI / 4);
    chainB.position.y = 0.28;
    chainGroup.add(chainA, chainB);
    chainGroup.visible = false;
    group.add(chainGroup);

    // 3D Sparking Chain-Bomb Fuse
    const fuseGroup = new THREE.Group();
    const fuseGeo = this.trackGeo(new THREE.CylinderGeometry(0.035, 0.04, 0.45, 8));
    const fuseStem = new THREE.Mesh(fuseGeo, mats.fuseCord);
    fuseStem.position.set(0.24, 0.5, 0);
    fuseStem.rotation.z = -0.35;
    const sparkGeo = this.trackGeo(new THREE.OctahedronGeometry(0.11, 0));
    const fuseSparkMesh = new THREE.Mesh(sparkGeo, mats.fuseSpark);
    fuseSparkMesh.position.set(0.32, 0.72, 0);
    fuseGroup.add(fuseStem, fuseSparkMesh);
    fuseGroup.visible = false;
    group.add(fuseGroup);

    // Velvet Auction Cloche Dome
    const clocheGeo = this.trackGeo(
      new THREE.SphereGeometry(0.46, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.58),
    );
    const clocheMesh = new THREE.Mesh(clocheGeo, mats.velvetCloche);
    clocheMesh.position.y = 0.34;
    clocheMesh.visible = false;
    group.add(clocheMesh);

    // Freeze-Node Crystal Shield Dome
    const shieldGeo = this.trackGeo(new THREE.IcosahedronGeometry(0.56, 1));
    const freezeShieldMesh = new THREE.Mesh(shieldGeo, mats.freezeCrystal);
    freezeShieldMesh.position.y = 0.28;
    freezeShieldMesh.visible = false;
    group.add(freezeShieldMesh);

    // Sudden Trapdoor Hazard Chevron Ring
    const hazGeo = this.trackGeo(new THREE.TorusGeometry(0.52, 0.055, 8, 24));
    const hazardRingMesh = new THREE.Mesh(hazGeo, mats.hazardChevron);
    hazardRingMesh.rotation.x = Math.PI / 2;
    hazardRingMesh.position.y = 0.08;
    hazardRingMesh.visible = false;
    group.add(hazardRingMesh);

    // Rival Fog Jammer Wireframe Cage
    const jamGeo = this.trackGeo(new THREE.OctahedronGeometry(0.58, 0));
    const jammerMesh = new THREE.Mesh(jamGeo, mats.jammerStatic);
    jammerMesh.position.y = 0.36;
    jammerMesh.visible = false;
    group.add(jammerMesh);

    // Golden Bounty Floating Crown Diamond
    const crownGeo = this.trackGeo(new THREE.OctahedronGeometry(0.2, 0));
    const bountyCrownMesh = new THREE.Mesh(crownGeo, mats.bountyGold);
    bountyCrownMesh.position.y = 0.88;
    bountyCrownMesh.visible = false;
    group.add(bountyCrownMesh);

    return {
      nodeId: node.nodeId,
      group,
      hitMesh,
      gemMesh,
      gemMat,
      pedestalMesh,
      chainGroup,
      fuseGroup,
      fuseSparkMesh,
      clocheMesh,
      freezeShieldMesh,
      hazardRingMesh,
      jammerMesh,
      bountyCrownMesh,
      basePos: new THREE.Vector3(node.pos3d[0], node.pos3d[1], node.pos3d[2]),
      targetPos: new THREE.Vector3(node.pos3d[0], node.pos3d[1], node.pos3d[2]),
      moleTellIntensity: 0,
      isMoleRevealed: false,
      isSubmerged: false,
      isVisible: true,
      isAligned: false,
      isGondola,
    };
  }

  private applyNodeVisualMaterial(
    rig: NodeRigB,
    node: BoardNodeV6,
    def: BoardDefinitionV6,
    isLaserLit: boolean,
    isBounty: boolean,
  ): void {
    if (!rig.isVisible) {
      rig.gemMat.color.setHex(0x161b26);
      rig.gemMat.emissive.setHex(0x05070a);
      rig.gemMat.emissiveIntensity = 0.1;
      return;
    }

    if (rig.isSubmerged) {
      rig.gemMat.color.setHex(0x16425b);
      rig.gemMat.emissive.setHex(0x0b2545);
      rig.gemMat.emissiveIntensity = 0.15;
      return;
    }

    if (node.owner === 'PLAYER') {
      rig.gemMat.color.setHex(0xffd166);
      rig.gemMat.emissive.setHex(0xc98916);
      rig.gemMat.emissiveIntensity = 0.55;
      return;
    }

    if (node.owner === 'RIVAL') {
      rig.gemMat.color.setHex(0xd62828);
      rig.gemMat.emissive.setHex(0x660708);
      rig.gemMat.emissiveIntensity = 0.45;
      return;
    }

    if (rig.isMoleRevealed) {
      rig.gemMat.color.setHex(0xff006e);
      rig.gemMat.emissive.setHex(0xb5179e);
      rig.gemMat.emissiveIntensity = 0.72;
      return;
    }

    if (isLaserLit) {
      rig.gemMat.color.setHex(0xff4d6d);
      rig.gemMat.emissive.setHex(0xc9184a);
      rig.gemMat.emissiveIntensity = 0.65;
      return;
    }

    if (isBounty) {
      rig.gemMat.color.setHex(0xffe066);
      rig.gemMat.emissive.setHex(0xb07d14);
      rig.gemMat.emissiveIntensity = 0.62;
      return;
    }

    rig.gemMat.color.setHex(def.accentPalette.gemHex);
    rig.gemMat.emissive.setHex(def.accentPalette.primaryHex);
    rig.gemMat.emissiveIntensity = rig.isAligned ? 0.42 : 0.18;
  }

  // --------------------------------------------------------------------------
  // Volumetric 3D Fresnel Spotlight Rig (BLACKOUT_SPOTLIGHT)
  // --------------------------------------------------------------------------

  private buildSpotlightRig(root: THREE.Group, mats: StageMaterialKitB): void {
    this.spotlightTargetObj = new THREE.Object3D();
    this.spotlightTargetObj.position.set(0, 0, 0);
    root.add(this.spotlightTargetObj);

    this.spotlightGroup = new THREE.Group();
    this.spotlightGroup.position.set(0, 5.2, 1.4);

    // Physical brass Fresnel lamp housing
    const barrelGeo = this.trackGeo(new THREE.CylinderGeometry(0.24, 0.34, 0.52, 16));
    const barrel = new THREE.Mesh(barrelGeo, mats.accentBrass);
    barrel.rotation.x = Math.PI / 2;
    this.spotlightGroup.add(barrel);

    // Translucent volumetric light cone pointing along +Z (since lookAt aligns +Z)
    const coneGeo = this.trackGeo(new THREE.ConeGeometry(2.1, 5.8, 28, 1, true));
    coneGeo.translate(0, -2.9, 0);
    coneGeo.rotateX(-Math.PI / 2);
    const coneMesh = new THREE.Mesh(coneGeo, mats.spotlightCone);
    this.spotlightGroup.add(coneMesh);

    this.spotlightBeamLight = new THREE.SpotLight(0xffe599, 6.5, 16, 0.45, 0.55, 1.2);
    this.spotlightBeamLight.target = this.spotlightTargetObj;
    this.spotlightGroup.add(this.spotlightBeamLight);

    this.spotlightGroup.visible = false;
    root.add(this.spotlightGroup);
  }

  // --------------------------------------------------------------------------
  // Dynamic 3D Arc Conduits (Quantum Entanglement, Laser Ricochet, Voltage Chain)
  // --------------------------------------------------------------------------

  private clearDynamicLinks(): void {
    if (!this.dynamicLinksGroup) return;
    while (this.dynamicLinksGroup.children.length > 0) {
      const child = this.dynamicLinksGroup.children[0];
      this.dynamicLinksGroup.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
      }
    }
  }

  private rebuildDynamicConduits(
    state: BoardRuntimeStateV6,
    snapshot: TwistDirectorSnapshotV6,
  ): void {
    if (!this.dynamicLinksGroup || !this.materials) return;
    this.clearDynamicLinks();

    const byId = new Map(state.nodes.map((nd) => [nd.nodeId, nd]));

    // 1. Entangled Mirror-Twin Quantum Arcs
    for (const [idA, idB] of snapshot.entangledPairs) {
      const a = byId.get(idA);
      const b = byId.get(idB);
      if (!a || !b) continue;
      this.addArcTube(a.pos3d, b.pos3d, 0.55, 0.025, this.materials.quantumArc);
    }

    // 2. Ricochet Laser Path Segments
    for (let i = 0; i < snapshot.laserPathNodeIds.length - 1; i++) {
      const a = byId.get(snapshot.laserPathNodeIds[i]);
      const b = byId.get(snapshot.laserPathNodeIds[i + 1]);
      if (!a || !b) continue;
      this.addArcTube(a.pos3d, b.pos3d, 0.14, 0.038, this.materials.laserBeam);
    }

    // 3. High-Voltage Connected Cluster Tesla Arcs
    for (let i = 0; i < snapshot.voltageClusterNodeIds.length - 1; i++) {
      const a = byId.get(snapshot.voltageClusterNodeIds[i]);
      const b = byId.get(snapshot.voltageClusterNodeIds[i + 1]);
      if (!a || !b) continue;
      this.addArcTube(a.pos3d, b.pos3d, 0.42, 0.045, this.materials.voltageArc);
    }
  }

  private addArcTube(
    pA: [number, number, number],
    pB: [number, number, number],
    archHeight: number,
    radius: number,
    material: THREE.Material,
  ): void {
    if (!this.dynamicLinksGroup) return;
    const start = new THREE.Vector3(pA[0], pA[1] + 0.34, pA[2]);
    const end = new THREE.Vector3(pB[0], pB[1] + 0.34, pB[2]);
    const mid = start.clone().add(end).multiplyScalar(0.5);
    mid.y += archHeight;
    const curve = new THREE.CatmullRomCurve3([start, mid, end]);
    const geo = new THREE.TubeGeometry(curve, 16, radius, 6, false);
    const mesh = new THREE.Mesh(geo, material);
    this.dynamicLinksGroup.add(mesh);
  }

  private trackGeo<T extends THREE.BufferGeometry>(geo: T): T {
    this.ownedGeometries.push(geo);
    return geo;
  }

  private trackMat<T extends THREE.Material>(mat: T): T {
    this.ownedMaterials.push(mat);
    return mat;
  }
}
