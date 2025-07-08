import Phaser from "phaser";
import { BaseObject } from "../BaseObject/BaseObject";

export class HouseDoor extends BaseObject {
  private _open: boolean = false;
  private colliderWithHero?: Phaser.Physics.Arcade.Collider;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string = "door"
  ) {
    super(scene, x, y, texture, { offset: { x: 0, y: -8 }, depthOffset: -8 });
  }

  get open(): boolean {
    return this._open;
  }

  set open(value: boolean) {
    this._open = value;
    if (!this.sprite.body) {
      console.error("Error: The door sprite body not found.");
      return;
    }
    if (value) {
      if (this.colliderWithHero) this.colliderWithHero.active = false;
    } else {
      if (this.colliderWithHero) this.colliderWithHero.active = true;
    }
  }

  setCollider(collider: Phaser.Physics.Arcade.Collider) {
    this.colliderWithHero = collider;
  }

  interact() {
    if (this.sprite.anims.isPlaying) {
      return;
    }

    if (!this._open) {
      this.sprite.anims.play("door-open");
      this.sprite.once("animationcomplete-door-open", () => {
        this._open = true;
        if (this.colliderWithHero) this.colliderWithHero.active = false;
      });
    } else {
      this.sprite.anims.play("door-close");
      this.sprite.once("animationcomplete-door-close", () => {
        this._open = false;
        if (this.colliderWithHero) this.colliderWithHero.active = true;
      });
    }
  }

  getSprite() {
    return this.sprite;
  }
}
