declare module 'troika-three-text' {
  import * as THREE from 'three';

  export class Text extends THREE.Mesh {
    text: string;
    anchorX: number | 'left' | 'center' | 'right' | string;
    anchorY: number | 'top' | 'top-baseline' | 'top-cap' | 'top-ex' | 'middle' | 'bottom-baseline' | 'bottom' | string;
    curveRadius: number;
    direction: 'auto' | 'ltr' | 'rtl' | string;
    font: string | null;
    unicodeFontsURL: string | null;
    fontSize: number;
    fontWeight: number | 'normal' | 'bold';
    fontStyle: 'normal' | 'italic';
    letterSpacing: number;
    lineHeight: number | 'normal';
    maxWidth: number;
    overflowWrap: 'normal' | 'break-word';
    textAlign: 'left' | 'right' | 'center' | 'justify';
    textIndent: number;
    whiteSpace: 'normal' | 'nowrap';
    color: number | string | THREE.Color;
    fillOpacity: number;
    outlineWidth: number | string;
    outlineColor: number | string | THREE.Color;
    outlineOpacity: number;
    outlineBlur: number | string;
    outlineOffsetX: number | string;
    outlineOffsetY: number | string;
    strokeWidth: number | string;
    strokeColor: number | string | THREE.Color;
    strokeOpacity: number;
    depthOffset: number;
    clipRect: [number, number, number, number] | null;
    orientation: string;
    glyphGeometryDetail: number;
    sdfGlyphSize: number | null;
    gpuAccelerateSDF: boolean;
    sync(callback?: () => void): void;
    dispose(): void;
  }

  export function preloadFont(
    options: { font?: string | null; characters?: string; sdfGlyphSize?: number },
    callback?: () => void
  ): void;
}
