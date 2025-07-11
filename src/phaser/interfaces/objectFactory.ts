import type { BaseObjectOptions } from "./baseObject";

export type ObjectFactoryCreateType =
  | "door"
  | "table"
  | "chair"
  | "chest"
  | "TV"
  | "fridge"
  | "boxFloorSmall"
  | "boxFloorWide"
  | "boxUpSmall"
  | "boxUpWide"
  | "furniture"
  | "flowerSmall"
  | "stove";

export interface ObjectFactoryCreateProps {
  type: ObjectFactoryCreateType;
  x: number;
  y: number;
  options?: BaseObjectOptions;
}
