import { DIRECTIONS } from "../../shared/consts";
import { BaseWeapon } from "./BaseWeapon";

//TODO CHECK DL DR, UL UR methods
export class Claws extends BaseWeapon {
  attackDown(): void {
    this._weaponComponent.body.setSize(30, 16);
    this._weaponComponent.body.position.set(
      this._sprite.x - 13,
      this._sprite.y + 10
    );
    this.attack(DIRECTIONS.DOWN);
  }

  attackDownLeft(): void {
    this._weaponComponent.body.setSize(16, 22);
    this._weaponComponent.body.position.set(
      this._sprite.x - 18,
      this._sprite.y
    );
    this.attack(DIRECTIONS.DOWN_LEFT);
  }

  attackDownRight(): void {
    this._weaponComponent.body.setSize(16, 22);
    this._weaponComponent.body.position.set(this._sprite.x + 4, this._sprite.y);
    this.attack(DIRECTIONS.DOWN_RIGHT);
  }

  attackUp(): void {
    this._weaponComponent.body.setSize(30, 16);
    this._weaponComponent.body.position.set(
      this._sprite.x - 13,
      this._sprite.y - 18
    );
    this.attack(DIRECTIONS.UP);
  }

  attackUpLeft(): void {
    this._weaponComponent.body.setSize(16, 22);
    this._weaponComponent.body.position.set(
      this._sprite.x - 18,
      this._sprite.y - 18
    );
    this.attack(DIRECTIONS.DOWN_LEFT);
  }

  attackUpRight(): void {
    this._weaponComponent.body.setSize(16, 22);
    this._weaponComponent.body.position.set(
      this._sprite.x + 4,
      this._sprite.y - 18
    );
    this.attack(DIRECTIONS.UP_RIGHT);
  }

  attackLeft(): void {
    this._weaponComponent.body.setSize(16, 30);
    this._weaponComponent.body.position.set(
      this._sprite.x - 24,
      this._sprite.y - 10
    );
    this.attack(DIRECTIONS.LEFT);
  }

  attackRight(): void {
    this._weaponComponent.body.setSize(16, 30);
    this._weaponComponent.body.position.set(
      this._sprite.x + 10,
      this._sprite.y - 10
    );
    this.attack(DIRECTIONS.RIGHT);
  }
}
