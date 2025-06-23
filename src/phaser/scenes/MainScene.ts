import Phaser from "phaser";
import { Hero } from "../characters";
import { setupCamera } from "../utils/camera";

const frameBounds = {
  frameWidth: 32,
  frameHeight: 32,
};

export default class MainScene extends Phaser.Scene {
  private hero!: Hero;

  constructor() {
    super("MainScene");
  }

  preload() {
    this.load.image("background", "/assets/test-background.png");
    this.load.spritesheet(
      "catWalkDown",
      "/assets/cat-walk-down.png",
      frameBounds
    );
    this.load.spritesheet("catWalkUp", "/assets/cat-walk-up.png", frameBounds);
    this.load.spritesheet(
      "catWalkRight",
      "/assets/cat-walk-right.png",
      frameBounds
    );
    this.load.spritesheet(
      "catWalkLeft",
      "/assets/cat-walk-left.png",
      frameBounds
    );
    this.load.spritesheet(
      "catStayDown",
      "/assets/cat-stay-down.png",
      frameBounds
    );
    this.load.spritesheet("catStayUp", "/assets/cat-stay-up.png", frameBounds);
    this.load.spritesheet(
      "catStayRight",
      "/assets/cat-stay-right.png",
      frameBounds
    );
    this.load.spritesheet(
      "catStayLeft",
      "/assets/cat-stay-left.png",
      frameBounds
    );
    this.load.spritesheet(
      "catStayDownStartOnce",
      "/assets/cat-stay-down-start-once.png",
      frameBounds
    );
  }

  create() {
    this.add.image(0, 0, "background").setOrigin(0, 0);

    this.hero = new Hero(this, 400, 300);

    setupCamera(this, this.hero.getSprite(), { width: 1040, height: 704 });
  }

  update() {
    this.hero.update();
  }
}
