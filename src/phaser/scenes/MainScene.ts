import Phaser from "phaser";
import { Hero } from "../characters";
import { setupCamera } from "../utils/camera";
import { getVisualBottomY } from "../utils/getVisualBottom";
import { HouseWindow } from "../objects";
import { GRID_SIZE } from "../../consts";
import { createCollisionFromObject } from "../utils/createCollisionFromObject";

const frameBounds = {
  frameWidth: 32,
  frameHeight: 32,
};

export default class MainScene extends Phaser.Scene {
  private hero!: Hero;
  private houseWindows: HouseWindow[] = [];

  constructor() {
    super("MainScene");
  }

  preload() {
    //tiles
    this.load.image("houseInteriorTiles", "/assets/tiles/house-interior.png");
    this.load.image("houseObjectsTiles", "/assets/tiles/house-objects.png");
    this.load.tilemapTiledJSON("houseMap", "assets/tiles/house-interior.json");

    //objects
    this.load.image("chest", "/assets/objects/chest.png");
    this.load.image("door", "/assets/objects/door.png");
    this.load.image("table", "/assets/objects/table.png");
    this.load.image("window", "/assets/objects/window.png");
    this.load.image(
      "windowViewGarden",
      "/assets/objects/window-view-garden.png"
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
    //hero shadow
    this.load.image("catShadowFront", "/assets/cat-shadow-front.png");
    this.load.image("catShadowSide", "/assets/cat-shadow-side.png");
  }

  create() {
    const map = this.make.tilemap({ key: "houseMap" });
    const tileset = map.addTilesetImage("house-interior", "houseInteriorTiles");
    const tilesetObjects = map.addTilesetImage(
      "house-objects",
      "houseObjectsTiles"
    );

    if (!tileset) {
      throw new Error("Tileset not found!");
    }

    if (!tilesetObjects) {
      throw new Error("tilesetObjects not found!");
    }

    const floorsLayer = map.createLayer("floors", tileset, 0, 0);
    const wallsLayer = map.createLayer(
      "walls",
      [tileset, tilesetObjects],
      0,
      0
    );
    const boundsLayer = map.createLayer("bounds", tileset, 0, 0);
    const collisionsLayer = map.createLayer("collisions", tileset, 0, -12);
    const collisionOtherLayer = map.getObjectLayer("collisions-other");

    if (!boundsLayer) {
      throw new Error("boundsLayer not found!");
    }
    if (!floorsLayer) {
      throw new Error("floorsLayer not found!");
    }
    if (!wallsLayer) {
      throw new Error("wallsLayer not found!");
    }
    if (!collisionsLayer) {
      throw new Error("collisionsLayer not found!");
    }
    if (!collisionOtherLayer) {
      throw new Error("collisionOtherLayer not found!");
    }
    collisionsLayer.setCollisionByProperty({ isCollide: true });
    boundsLayer.setDepth(9999);

    //light
    this.lights.enable().setAmbientColor(0xffffff);
    floorsLayer.setPipeline("Light2D");
    wallsLayer.setPipeline("Light2D");

    //objects
    const chest = this.physics.add.sprite(920, 450, "chest");
    chest.setImmovable(true);
    chest.setSize(chest.width * 0.9, chest.height * 0.55);
    chest.setOffset(1, 6);
    chest.setPipeline("Light2D");
    chest.setDepth(getVisualBottomY(chest));

    //hero
    this.hero = new Hero(this, 1100, 200);
    //hero colliders
    collisionOtherLayer.objects.forEach((obj) => {
      if (
        obj.properties?.some(
          (p: { name: string; value: unknown }) =>
            p.name === "isCollide" && p.value
        )
      ) {
        const collider = createCollisionFromObject(this, obj);
        this.physics.add.collider(this.hero.getSprite(), collider);
      }
    });

    this.physics.add.collider(this.hero.getSprite(), collisionsLayer);
    this.physics.add.collider(this.hero.getSprite(), chest);
    //hero light
    this.hero.getSprite().setPipeline("Light2D");

    this.houseWindows.push(
      new HouseWindow(
        this,
        this.hero.getSprite(),
        GRID_SIZE * 28,
        GRID_SIZE * 12
      ),
      new HouseWindow(
        this,
        this.hero.getSprite(),
        GRID_SIZE * 21,
        GRID_SIZE * 12
      )
    );

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
    this.houseWindows.forEach((houseWindow) => houseWindow.update());
  }
}
