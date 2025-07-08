import Phaser from "phaser";
import { Hero } from "../characters";
import { setupCamera } from "../utils/camera";
import { BaseObject, HouseDoor, HouseWindow, SceneTransfer } from "../objects";
import { GRID_SIZE, HERO_START_POSITIONS_MAP } from "../../consts";
import { createCollisionFromObject } from "../utils/createCollisionFromObject";
import type { SceneCreateDTO } from "../interfaces";
import { getVisualBottomY } from "../utils/getVisualBottom";

export default class MainScene extends Phaser.Scene {
  private hero!: Hero;
  private houseWindows: HouseWindow[] = [];

  constructor() {
    super("MainScene");
  }

  create(data: SceneCreateDTO) {
    const heroStartX =
      data.heroStartX ?? HERO_START_POSITIONS_MAP.mainScene.temp.x;
    const heroStartY =
      data.heroStartY ?? HERO_START_POSITIONS_MAP.mainScene.temp.y;
    const heroStartDirection = data.heroStartDirection ?? "down";

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
    const objectsLayer = map.createLayer("objects", [tilesetObjects], 0, 0);
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
    if (!objectsLayer) {
      throw new Error("objectsLayer not found!");
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
    objectsLayer.setPipeline("Light2D");

    //interactive objects group
    const interactables = this.add.group();

    //objects
    const woodChair = new BaseObject(this, 1056, 200, "chairs", {
      sizeOffset: { width: -8, height: -36 },
      offset: { x: 0, y: 10 },
      depthOffset: -4,
      frame: 1,
    });

    const tableFigure = new BaseObject(this, 784, 430, "furniture", {
      frame: 1,
      customHitboxes: [
        {
          x: 32,
          y: 26,
          width: 10,
          height: 16,
        },
        {
          x: -32,
          y: 26,
          width: 10,
          height: 16,
        },
      ],
    });
    interactables.add(tableFigure.getSprite());

    const chest = new BaseObject(this, 784, 412, "chest", {
      depthOffset: getVisualBottomY(tableFigure.getSprite()) + 1,
    });
    interactables.add(chest.getSprite());

    const houseDoor = new HouseDoor(this, 1192, 360); // координаты X, Y по центру двери
    interactables.add(houseDoor.getSprite());

    //hero
    this.hero = new Hero(this, heroStartX, heroStartY, heroStartDirection);
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
    woodChair.setCollisionWith(this.hero.getSprite());
    tableFigure.setCollisionWith(this.hero.getSprite());
    chest.setCollisionWith(this.hero.getSprite());

    const doorCollider = this.physics.add.collider(
      this.hero.getSprite(),
      houseDoor.getSprite()
    );
    houseDoor.setCollider(doorCollider);

    //hero light
    this.hero.getSprite().setPipeline("Light2D");

    //hero interactions
    //windows
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
    //interaction zone
    this.physics.add.overlap(
      this.hero.getInteractionZone(),
      interactables,
      (_, target) => {
        this.hero.setCurrentTarget(target as Phaser.GameObjects.GameObject);
      },
      undefined,
      this
    );

    //transfers
    const transferZone = new SceneTransfer(this, 1200, 520, {
      sceneKey: "BasementScene",
      heroStartX: HERO_START_POSITIONS_MAP.basementScene.basementStairs.x,
      heroStartY: HERO_START_POSITIONS_MAP.basementScene.basementStairs.y,
    });
    transferZone.setupCollision(this.hero.getSprite());

    this.cameras.main.fadeIn(300, 0, 0, 0);
    setupCamera(this, this.hero.getSprite(), { width: 1280, height: 1920 });

    //debug
    //hitboxes
    // this.physics.world.createDebugGraphic();

    //map grid cells
    // this.add
    //   .grid(0, 0, 1040, 704, 32, 32, 0xffffff, 0, 0.2)
    //   .setOrigin(0)
    //   .setDepth(9999);
  }

  update() {
    this.hero.update();
    this.houseWindows.forEach((houseWindow) => houseWindow.update());

    if (
      this.hero.getCurrentTarget() &&
      !Phaser.Geom.Intersects.RectangleToRectangle(
        this.hero.getInteractionZone().getBounds(),
        (this.hero.getCurrentTarget() as Phaser.GameObjects.Sprite).getBounds()
      )
    ) {
      this.hero.setCurrentTarget(null);
    }
  }
}
