import Phaser from "phaser";
import { Hero } from "../characters";
import { setupCamera } from "../utils/camera";
import { getVisualBottomY } from "../utils/getVisualBottom";
import { HouseDoor, HouseWindow, SceneTransfer } from "../objects";
import { GRID_SIZE } from "../../consts";
import { createCollisionFromObject } from "../utils/createCollisionFromObject";
import type { SceneCreateDTO } from "../interfaces";

export default class MainScene extends Phaser.Scene {
  private hero!: Hero;
  private houseWindows: HouseWindow[] = [];
  houseDoor!: HouseDoor;

  constructor() {
    super("MainScene");
  }

  create(data: SceneCreateDTO) {
    const heroStartX = data.heroStartX ?? 1100;
    const heroStartY = data.heroStartY ?? 200;
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
    const chest = this.physics.add.sprite(920, 450, "chest");
    chest.setImmovable(true);
    chest.setSize(chest.width * 0.9, chest.height * 0.55);
    chest.setOffset(1, 6);
    chest.setPipeline("Light2D");
    chest.setDepth(getVisualBottomY(chest));
    chest.setData("ref", chest);
    interactables.add(chest);

    const houseDoor = (this.houseDoor = new HouseDoor(this, 1192, 360)); // координаты X, Y по центру двери
    interactables.add(houseDoor.getSprite());

    // houseDoor.open = true;

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
    this.physics.add.collider(this.hero.getSprite(), chest);
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
      heroStartX: 650,
      heroStartY: 120,
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
