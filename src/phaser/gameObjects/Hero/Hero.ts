import { ControlsComponent } from "../../core/baseComponents";
import { InputComponent } from "../../core/input";
import { HERO_ANIMATION_KEYS } from "../../shared/consts";
import type { Position } from "../../shared/types";
import { isArcadePhysicsBody } from "../../shared/utils";

export type HeroConfig = {
  scene: Phaser.Scene;
  position: Position;
  assetKey: string;
  frame?: number;
  controls: InputComponent;
};

export class Hero extends Phaser.Physics.Arcade.Sprite {
  #controlsComponent: ControlsComponent;

  constructor(config: HeroConfig) {
    const { scene, position, assetKey, frame } = config;
    super(scene, position.x, position.y, assetKey, frame || 0);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.#controlsComponent = new ControlsComponent(this, config.controls);

    this.play({ key: HERO_ANIMATION_KEYS.IDLE_DOWN, repeat: -1 });

    config.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    config.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      config.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
    });
  }

  update(): void {
    const controls = this.#controlsComponent.controls;
    if (controls.isUpDown) {
      this.play({ key: HERO_ANIMATION_KEYS.WALK_UP, repeat: -1 }, true);
      this.#updateVelocity(false, -1);
    } else if (controls.isDownDown) {
      this.play({ key: HERO_ANIMATION_KEYS.WALK_DOWN, repeat: -1 }, true);
      this.#updateVelocity(false, 1);
    } else this.#updateVelocity(false, 0);

    const isMovingVertically = controls.isDownDown || controls.isUpDown;
    if (controls.isLeftDown) {
      this.#updateVelocity(true, -1);
      if (!isMovingVertically) {
        this.play({ key: HERO_ANIMATION_KEYS.WALK_LEFT, repeat: -1 }, true);
      }
    } else if (controls.isRightDown) {
      this.#updateVelocity(true, 1);
      if (!isMovingVertically) {
        this.play({ key: HERO_ANIMATION_KEYS.WALK_RIGHT, repeat: -1 }, true);
      }
    } else {
      this.#updateVelocity(true, 0);
    }

    if (
      !controls.isDownDown &&
      !controls.isUpDown &&
      !controls.isLeftDown &&
      !controls.isRightDown
    ) {
      this.play({ key: HERO_ANIMATION_KEYS.IDLE_DOWN, repeat: -1 }, true);
    }

    this.#normalizeVelocity();
  }

  #updateVelocity(isX: boolean, value: number): void {
    if (!isArcadePhysicsBody(this.body)) {
      return;
    }
    if (isX) {
      this.body.velocity.x = value;
      return;
    }
    this.body.velocity.y = value;
  }

  #normalizeVelocity(): void {
    if (!isArcadePhysicsBody(this.body)) {
      return;
    }
    this.body.velocity.normalize().scale(90);
  }
}
