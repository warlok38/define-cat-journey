import Phaser from "phaser";
import { Hero } from "../characters";
import { setupCamera } from "../utils/camera";
import { getVisualBottomY } from "../utils/getVisualBottom";

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
    //tiles
    this.load.image("houseTiles", "/assets/tiles/house-interior.png");
    this.load.tilemapTiledJSON("houseMap", "assets/tiles/house-interior.json");

    //objects
    this.load.image("chest", "/assets/objects/chest.png");
    this.load.image("door", "/assets/objects/door.png");
    this.load.image("table", "/assets/objects/table.png");

    //hero cat
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
    const map = this.make.tilemap({ key: "houseMap" });
    const tileset = map.addTilesetImage("house-interior", "houseTiles");

    if (!tileset) {
      throw new Error("Tileset not found!");
    }

    const floorsLayer = map.createLayer("floors", tileset, 0, 0);
    const wallsLayer = map.createLayer("walls", tileset, 0, 0);
    const boundsLayer = map.createLayer("bounds", tileset, 0, 0);

    if (!boundsLayer) {
      throw new Error("boundsLayer not found!");
    }
    if (!floorsLayer) {
      throw new Error("floorsLayer not found!");
    }
    if (!wallsLayer) {
      throw new Error("wallsLayer not found!");
    }
    // collisionsLayer.setCollisionByProperty({ isCollide: true });

    //light
    this.lights.enable().setAmbientColor(0xffffff);
    this.lights.addLight(1120, 205, 50, 0xffaa00, 0.5);
    floorsLayer.setPipeline("Light2D");
    wallsLayer.setPipeline("Light2D");

    //objects
    const chest = this.physics.add.sprite(1120, 200, "chest");
    chest.setImmovable(true);
    chest.setSize(chest.width * 0.9, chest.height * 0.55);
    chest.setOffset(1, 6);
    chest.setPipeline("Light2D");
    chest.setDepth(getVisualBottomY(chest));

    //hero
    this.hero = new Hero(this, 1100, 200);
    //hero colliders
    // this.physics.add.collider(this.hero.getSprite(), collisionsLayer);
    this.physics.add.collider(this.hero.getSprite(), chest);
    //hero light
    this.hero.getSprite().setPipeline("Light2D");

    setupCamera(this, this.hero.getSprite(), { width: 1280, height: 1920 });

    //debug
    //hitboxes
    this.physics.world.createDebugGraphic();
    //map grid cells
    // this.add
    //   .grid(0, 0, 1040, 704, 32, 32, 0xffffff, 0, 0.2)
    //   .setOrigin(0)
    //   .setDepth(9999);
  }

  update() {
    this.hero.update();
  }
}
