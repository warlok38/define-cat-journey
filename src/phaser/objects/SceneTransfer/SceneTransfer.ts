import Phaser from "phaser";
import type { Direction } from "../../interfaces";

interface SceneTransferConfig {
  sceneKey: string;
  heroStartX: number;
  heroStartY: number;
  width?: number;
  height?: number;
  fadeDuration?: number;
  heroStartDirection?: Direction;
}

export class SceneTransfer {
  private scene: Phaser.Scene;
  private zone: Phaser.GameObjects.Zone;
  private config: SceneTransferConfig;
  private triggered = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: SceneTransferConfig
  ) {
    this.scene = scene;
    this.config = config;

    // Создаем невидимую зону
    this.zone = this.scene.add.zone(
      x,
      y,
      config.width ?? 64,
      config.height ?? 64
    );
    this.scene.physics.add.existing(this.zone);

    const body = this.zone.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
  }

  setupCollision(heroSprite: Phaser.GameObjects.GameObject) {
    this.scene.physics.add.overlap(heroSprite, this.zone, () => {
      if (this.triggered) return;
      this.triggered = true;

      const camera = this.scene.cameras.main;
      const fadeDuration = this.config.fadeDuration ?? 300;

      camera.fadeOut(fadeDuration, 0, 0, 0);

      camera.once("camerafadeoutcomplete", () => {
        this.scene.scene.start(this.config.sceneKey, {
          heroStartX: this.config.heroStartX,
          heroStartY: this.config.heroStartY,
          heroStartDirection: this.config.heroStartDirection ?? "down",
        });
      });
    });
  }
}
