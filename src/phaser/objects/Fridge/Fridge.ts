import Phaser from "phaser";
import { BaseObject } from "../BaseObject/BaseObject";
import type { BaseObjectOptions, Interactable } from "../../interfaces";

export class Fridge extends BaseObject implements Interactable {
  private isOpen = false;
  private light?: Phaser.GameObjects.Light;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    options?: BaseObjectOptions
  ) {
    super(scene, x, y, "fridge", {
      sizeOffset: { width: 0, height: -80 },
      offset: { x: 0, y: 8 },
      depthOffset: -24,
      keepOriginHitbox: true,
      ...options,
    });

    this.getSprite().setPipeline("Light2D");
    this.getSprite().setFrame(0);

    this.setupFrameListeners();
  }

  interact() {
    if (this.isOpen) {
      this.getSprite().anims.play("fridge-close", true);
    } else {
      this.getSprite().anims.play("fridge-open", true);
    }
    this.isOpen = !this.isOpen;

    this.updateCollisionZones();
  }

  private setupFrameListeners() {
    const sprite = this.getSprite();

    sprite.on(
      "animationupdate",
      (
        animation: Phaser.Animations.Animation,
        frame: Phaser.Animations.AnimationFrame
      ) => {
        if (frame.index === 3 && animation.key === "fridge-open") {
          this.enableLight();
        }
        if (frame.index === 2 && animation.key === "fridge-close") {
          this.disableLight();
        }
      }
    );

    sprite.on("animationcomplete", (animation: Phaser.Animations.Animation) => {
      if (animation.key === "fridge-close") {
        sprite.setFrame(0);
        this.disableLight();
      }
    });
  }

  private enableLight() {
    if (this.light || !this.scene.lights.active) return;

    const sprite = this.getSprite();
    this.light = this.scene.lights.addLight(
      sprite.x,
      sprite.y + 20,
      40,
      0xfff0a0,
      0.6
    );
  }

  private disableLight() {
    if (this.light) {
      this.scene.lights.removeLight(this.light);
      this.light = undefined;
    }
  }

  private updateCollisionZones() {
    this.clearCustomZones();

    if (this.isOpen) {
      this.addCustomZone({ x: 10, y: 40, width: 24, height: 25 });
    }

    this.reapplyCollision();
  }
}
