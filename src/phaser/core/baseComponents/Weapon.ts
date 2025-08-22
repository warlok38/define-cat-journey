import type { WeaponInterface } from "../../gameObjects/weapons";
import type { GameObject } from "../../shared/types";
import { BaseGameObject } from "./BaseGameObject";

export class Weapon extends BaseGameObject {
  #weapon: WeaponInterface | undefined;
  #weaponPhysicsBody: Phaser.Physics.Arcade.Body;

  constructor(gameObject: GameObject) {
    super(gameObject);
    this.#weaponPhysicsBody = gameObject.scene.physics.add.body(
      gameObject.x,
      gameObject.y,
      1,
      1
    );
    this.#weaponPhysicsBody.enable = false;
    this.assignComponentToObject(this.#weaponPhysicsBody);
  }

  get weapon(): WeaponInterface | undefined {
    return this.#weapon;
  }

  set weapon(weapon: WeaponInterface | undefined) {
    this.#weapon = weapon;
  }

  get body(): Phaser.Physics.Arcade.Body {
    return this.#weaponPhysicsBody;
  }

  get weaponDamage(): number {
    if (this.#weapon === undefined) {
      return 0;
    }
    return this.#weapon.baseDamage;
  }

  public update(): void {
    if (this.#weapon === undefined) {
      return;
    }
    this.#weapon.update();
  }
}
