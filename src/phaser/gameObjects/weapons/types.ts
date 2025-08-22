import type { DirectionType } from "../../shared/types";

export interface WeaponInterface {
  baseDamage: number;
  isAttacking: boolean;
  attackDown(): void;
  attackDownLeft(): void;
  attackDownRight(): void;
  attackUp(): void;
  attackUpLeft(): void;
  attackUpRight(): void;
  attackLeft(): void;
  attackRight(): void;
  update(): void;
  onCollisionCallback(): void;
}

export type WeaponAttackAnimationConfig = {
  [key in DirectionType]: string;
};
