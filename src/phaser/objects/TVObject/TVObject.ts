// src/objects/TV.ts
import Phaser from "phaser";
import { BaseObject } from "../BaseObject/BaseObject";
import type { BaseObjectOptions, Interactable } from "../../interfaces";

export class TVObject extends BaseObject implements Interactable {
  private isOn = false;
  private light?: Phaser.GameObjects.Light;
  private pulseEvent?: Phaser.Time.TimerEvent;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    options?: BaseObjectOptions
  ) {
    super(scene, x, y, "TV", options);
    this.getSprite().setPipeline("Light2D");
    this.getSprite().setFrame(0);
    this.updateState();
  }

  interact() {
    this.isOn = !this.isOn;
    this.updateState();
  }

  private updateState() {
    const sprite = this.getSprite();

    if (this.isOn) {
      sprite.anims.play("tv-on", true);
      this.enableLight();
    } else {
      sprite.anims.stop();
      sprite.setFrame(0);
      this.disableLight();
    }
  }

  private enableLight() {
    if (!this.scene.lights.active) return;
    const sprite = this.getSprite();

    if (!this.light) {
      this.light = this.scene.lights.addLight(
        sprite.x,
        sprite.y + 20,
        70, // радиус
        0x87cefa,
        0.7 // интенсивность
      );
    }

    this.pulseEvent = this.scene.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => {
        if (!this.light) return;
        const baseIntensity = 0.7;
        const variation = 0.08;
        const randomOffset = Phaser.Math.FloatBetween(-variation, variation);
        this.light.intensity = baseIntensity + randomOffset;
      },
    });
  }

  private disableLight() {
    if (this.light) {
      this.scene.lights.removeLight(this.light);
      this.light = undefined;
    }

    if (this.pulseEvent) {
      this.pulseEvent.remove();
      this.pulseEvent = undefined;
    }
  }
}
