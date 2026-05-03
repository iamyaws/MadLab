import { Application, extend } from '@pixi/react';
import { Container, Graphics, Text } from 'pixi.js';
import type { ReactNode } from 'react';

/**
 * PixiRoot. Mounts a single PixiJS WebGL Application sized to the given
 * width/height and renders children inside the Pixi stage.
 *
 * One Application per route. The plan calls for this to be the only Pixi
 * mount in the codebase: OrbitStage, TestStage, and any future Pixi work
 * compose as children. State stays in React; Pixi is presentational.
 *
 * Default background is the cel-shaded `bg` token (#FFE9C4) so a freshly
 * mounted stage blends with the phone-shell paper if no background art
 * draws over it.
 *
 * `extend({ Container, Graphics, Text })` registers the Pixi v8 classes the
 * children use so the lowercase JSX components (`pixiContainer`,
 * `pixiGraphics`, `pixiText`) resolve at runtime. @pixi/react v8 requires
 * an explicit extend call before any of its JSX is rendered; calling it at
 * module load is fine because `extend` is idempotent.
 */
extend({ Container, Graphics, Text });

export interface PixiRootProps {
  width: number;
  height: number;
  children: ReactNode;
  background?: number;
}

export function PixiRoot({
  width,
  height,
  children,
  background = 0xffe9c4,
}: PixiRootProps) {
  return (
    <Application
      width={width}
      height={height}
      background={background}
      antialias
      autoDensity
      resolution={window.devicePixelRatio || 1}
    >
      {children}
    </Application>
  );
}
