import type { Weapon } from "../../core/baseComponents";
import type { DirectionType } from "../../shared/types";
import type { WeaponAttackAnimationConfig, WeaponInterface } from "./types";

export abstract class BaseWeapon implements WeaponInterface {
  protected _weaponComponent: Weapon;
  protected _attacking: boolean;
  protected _sprite: Phaser.GameObjects.Sprite;
  protected _attackAnimationConfig: WeaponAttackAnimationConfig;
  protected _baseDamage: number;

  constructor(
    sprite: Phaser.GameObjects.Sprite,
    weaponComponent: Weapon,
    animationConfig: WeaponAttackAnimationConfig,
    baseDamage: number
  ) {
    this._sprite = sprite;
    this._weaponComponent = weaponComponent;
    this._attackAnimationConfig = animationConfig;
    this._baseDamage = baseDamage;
    this._attacking = false;
  }

  get isAttacking(): boolean {
    return this._attacking;
  }

  get baseDamage(): number {
    return this._baseDamage;
  }

  protected attack(direction: DirectionType): void {
    const attackAnimationKey = this._attackAnimationConfig[direction];
    this._attacking = true;
    this._sprite.play({ key: attackAnimationKey, repeat: 0 }, true);
    this._weaponComponent.body.enable = true;
    this._sprite.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + attackAnimationKey,
      () => {
        this.attackAnimationCompleteHandler();
      }
    );
  }

  protected attackAnimationCompleteHandler(): void {
    this._attacking = false;
    this._weaponComponent.body.enable = false;
  }

  // following methods must be implemented by weapon implementations
  abstract attackDown(): void;
  abstract attackDownLeft(): void;
  abstract attackDownRight(): void;

  abstract attackUp(): void;
  abstract attackUpLeft(): void;
  abstract attackUpRight(): void;

  abstract attackLeft(): void;

  abstract attackRight(): void;

  // following methods to be overridden if needed by weapon implementations
  update(): void {
    // not implemented
  }

  onCollisionCallback(): void {
    // not implemented
  }
}
