import type { ComponentType } from 'react';
import type { BehaviorVerb } from '../../lib/types';
import { AttractVerb } from './AttractVerb';
import { BounceVerb } from './BounceVerb';
import { ChimeVerb } from './ChimeVerb';
import { FlutterVerb } from './FlutterVerb';
import { GlowVerb } from './GlowVerb';
import { PuffVerb } from './PuffVerb';
import { SoftVerb } from './SoftVerb';
import { SparkVerb } from './SparkVerb';
import { SpinVerb } from './SpinVerb';
import { WatchVerb } from './WatchVerb';
import { WobbleVerb } from './WobbleVerb';
import { ZoomVerb } from './ZoomVerb';
import type { VerbProps } from './types';

export type { VerbProps };

/**
 * Dispatch table mapping every `BehaviorVerb` enum value to the matching
 * Pixi verb component. `<TestStage />` looks up the verb for each picked
 * part's `behaviorVerb` and instantiates it inside the chamber.
 *
 * Adding a new verb means: (a) extend `BehaviorVerb` in lib/types, (b) add
 * a `<NewVerb />` component in this directory, (c) wire it in here.
 * Exhaustive Record typing means a missing entry is a compile error.
 */
export const VERB_COMPONENTS: Record<BehaviorVerb, ComponentType<VerbProps>> = {
  spin: SpinVerb,
  bounce: BounceVerb,
  spark: SparkVerb,
  puff: PuffVerb,
  chime: ChimeVerb,
  wobble: WobbleVerb,
  soft: SoftVerb,
  flutter: FlutterVerb,
  glow: GlowVerb,
  attract: AttractVerb,
  watch: WatchVerb,
  zoom: ZoomVerb,
};
