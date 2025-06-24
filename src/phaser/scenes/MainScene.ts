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
    //tiles
    this.load.image("livingRoomTiles", "/assets/tiles/living-room-tilemap.png");
    this.load.tilemapTiledJSON(
      "livingRoomMap",
      "assets/tiles/living-room.json"
    );

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
    const map = this.make.tilemap({ key: "livingRoomMap" });
    const tileset = map.addTilesetImage("living-room", "livingRoomTiles");

    if (!tileset) {
      throw new Error("Tileset not found!");
    }

    const layer = map.createLayer("living-room", tileset, 0, 0);

    if (!layer) {
      throw new Error("Tileset not found!");
    }
    layer.setCollisionByProperty({ isCollide: true });

    this.hero = new Hero(this, 400, 300);
    this.physics.add.collider(this.hero.getSprite(), layer);

    setupCamera(this, this.hero.getSprite(), { width: 1040, height: 704 });
  }

  update() {
    this.hero.update();
  }
}
