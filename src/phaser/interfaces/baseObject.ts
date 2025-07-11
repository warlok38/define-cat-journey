import type { Interactable } from "./Interactable";

export interface CustomHitbox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BaseObjectOptions {
  sizeOffset?: { width: number; height: number };
  offset?: { x: number; y: number };
  frame?: string | number;
  depthOffset?: number;
  ref?: Interactable;
  noLight?: boolean;
  keepOriginHitbox?: boolean;
  customHitboxes?: CustomHitbox[];
}
