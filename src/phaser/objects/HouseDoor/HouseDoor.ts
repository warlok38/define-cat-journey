import Phaser from "phaser";
import { getVisualBottomY } from "../../utils/getVisualBottom";

export class HouseDoor extends Phaser.GameObjects.GameObject {
  private sprite: Phaser.Physics.Arcade.Sprite;
  private _open: boolean = false;
  scene: Phaser.Scene;
  private colliderWithHero?: Phaser.Physics.Arcade.Collider;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string = "door"
  ) {
    super(scene, "HouseDoor");
    this.scene = scene;

    this.sprite = this.scene.physics.add.sprite(x, y, texture, 0);
    this.sprite.setOffset(0, this.sprite.height * -0.05);

    this.sprite.setImmovable(true);
    this.sprite.setDepth(getVisualBottomY(this.sprite) - 8);

    this.sprite.setData("ref", this);

    this.createAnimations();
  }

  private createAnimations() {
    const anims = this.scene.anims;

    anims.create({
      key: "door-open",
      frames: this.scene.anims.generateFrameNumbers("door", {
        start: 0,
        end: 4,
      }),
      frameRate: 12,
      repeat: 0,
    });

    anims.create({
      key: "door-close",
      frames: this.scene.anims.generateFrameNumbers("door", {
        start: 4,
        end: 8,
      }),
      frameRate: 12,
      repeat: 0,
    });
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
