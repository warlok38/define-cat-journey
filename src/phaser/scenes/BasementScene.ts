import Phaser from "phaser";
import { Hero } from "../characters";
import { setupCamera } from "../utils/camera";
import { SceneTransfer } from "../objects";
import type { SceneCreateDTO } from "../interfaces";

export default class BasementScene extends Phaser.Scene {
  private hero!: Hero;

  constructor() {
    super("BasementScene");
  }

  create(data: SceneCreateDTO) {
    const heroStartX = data.heroStartX ?? 100;
    const heroStartY = data.heroStartY ?? 100;
    const heroStartDirection = data.heroStartDirection ?? "down";

    this.add.image(0, 0, "basementTiles").setOrigin(0).setDepth(-1);

    this.hero = new Hero(this, heroStartX, heroStartY, heroStartDirection);

    const transferZone = new SceneTransfer(this, 650, 20, {
      sceneKey: "MainScene",
      heroStartX: 1200,
      heroStartY: 470,
      heroStartDirection: "up",
    });
    transferZone.setupCollision(this.hero.getSprite());

    this.cameras.main.fadeIn(300, 0, 0, 0);
    setupCamera(this, this.hero.getSprite(), { width: 1280, height: 1920 });
  }

  update() {
    this.hero.update();
  }
}
