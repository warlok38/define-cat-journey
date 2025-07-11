import Phaser from "phaser";
import { Hero } from "../characters";
import { setupCamera } from "../utils/camera";
import { HouseWindow, SceneTransfer } from "../objects";
import { GRID_SIZE, HERO_START_POSITIONS_MAP } from "../../consts";
import { createCollisionFromObject } from "../utils/createCollisionFromObject";
import type { SceneCreateDTO } from "../interfaces";
import { LayerFactory, ObjectFactory } from "../managers";
import { getVisualBottomY } from "../utils/getVisualBottom";

export default class MainScene extends Phaser.Scene {
  private hero!: Hero;
  private houseWindows: HouseWindow[] = [];
  private objectFactory!: ObjectFactory;

  constructor() {
    super("MainScene");
  }

  create(data: SceneCreateDTO) {
    const heroStartX =
      data.heroStartX ?? HERO_START_POSITIONS_MAP.mainScene.temp.x;
    const heroStartY =
      data.heroStartY ?? HERO_START_POSITIONS_MAP.mainScene.temp.y;
    const heroStartDirection = data.heroStartDirection ?? "down";

    //layers factory
    const layerFactory = new LayerFactory(this, "houseMap");

    const floorsLayer = layerFactory.getLayer("floors");
    const wallsLayer = layerFactory.getLayer("walls");
    const objectsLayer = layerFactory.getLayer("objects");
    const boundsLayer = layerFactory.getLayer("bounds");
    const collisionsLayer = layerFactory.getLayer("collisions");
    const collisionOtherLayer = layerFactory.getObjectLayer("collisions-other");

    collisionsLayer.setCollisionByProperty({ isCollide: true });
    boundsLayer.setDepth(9999);

    //light
    this.lights.enable().setAmbientColor(0xffffff);
    floorsLayer.setPipeline("Light2D");
    wallsLayer.setPipeline("Light2D");
    objectsLayer.setPipeline("Light2D");

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

    //objects factory
    this.objectFactory = new ObjectFactory(this, this.hero);
    this.objectFactory.create({
      type: "chair",
      x: 32 * 9,
      y: 32 * 18,
      options: {
        sizeOffset: { width: -4, height: -40 },
        offset: { x: 0, y: 12 },
        depthOffset: -3,
        frame: 3,
      },
    });

    this.objectFactory.create({
      type: "chair",
      x: 32 * 13,
      y: 32 * 18,
      options: {
        sizeOffset: { width: -4, height: -40 },
        offset: { x: 0, y: 12 },
        depthOffset: -3,
        frame: 2,
      },
    });

    this.objectFactory.create({
      type: "chair",
      x: 32 * 11,
      y: 32 * 17,
      options: {
        sizeOffset: { width: -4, height: -40 },
        offset: { x: 0, y: 12 },
        depthOffset: -3,
        frame: 0,
      },
    });

    this.objectFactory.create({
      type: "chair",
      x: 32 * 11,
      y: 32 * 19,
      options: {
        sizeOffset: { width: -4, height: -40 },
        offset: { x: 0, y: 12 },
        depthOffset: -3,
        frame: 1,
      },
    });

    const tableFigure = this.objectFactory.create({
      type: "furniture",
      x: 784,
      y: 430,
      options: {
        customHitboxes: [
          { x: 32, y: 26, width: 10, height: 16 },
          { x: -32, y: 26, width: 10, height: 16 },
        ],
      },
    });

    this.objectFactory.create({
      type: "chest",
      x: 784,
      y: 412,
      options: {
        depthOffset: getVisualBottomY(tableFigure?.getSprite()) + 1,
      },
    });

    this.objectFactory.create({
      type: "door",
      x: 1192,
      y: 360,
    });

    this.objectFactory.create({
      type: "TV",
      x: 724,
      y: 480,
    });

    this.objectFactory.create({
      type: "fridge",
      x: 32 * 14.75,
      y: 32 * 14 + 8,
    });

    this.objectFactory.create({
      type: "boxFloorSmall",
      x: 32 * 1.5,
      y: 32 * 14,
    });

    this.objectFactory.create({
      type: "boxFloorSmall",
      x: 32 * 2.5,
      y: 32 * 14,
    });

    this.objectFactory.create({
      type: "boxFloorSmall",
      x: 32 * 7.5,
      y: 32 * 14,
      options: {
        frame: 1,
      },
    });

    this.objectFactory.create({
      type: "boxFloorSmall",
      x: 32 * 10.5,
      y: 32 * 14,
    });

    this.objectFactory.create({
      type: "boxFloorSmall",
      x: 32 * 13.5,
      y: 32 * 14,
    });

    this.objectFactory.create({
      type: "boxFloorWide",
      x: 32 * 4,
      y: 32 * 14,
    });

    this.objectFactory.create({
      type: "boxFloorWide",
      x: 32 * 12,
      y: 32 * 14,
    });

    this.objectFactory.create({
      type: "boxFloorWide",
      x: 32 * 9,
      y: 32 * 14,
      options: {
        frame: 1,
      },
    });

    this.objectFactory.create({
      type: "stove",
      x: 32 * 6,
      y: 32 * 14,
    });

    this.objectFactory.create({
      type: "boxUpSmall",
      x: 32 * 1.5,
      y: 32 * 11 - 9,
    });

    this.objectFactory.create({
      type: "boxUpWide",
      x: 32 * 3,
      y: 32 * 11 - 9,
    });

    this.objectFactory.create({
      type: "boxUpWide",
      x: 32 * 9,
      y: 32 * 11 - 9,
    });

    const kitchenTable = this.objectFactory.create({
      type: "table",
      x: 32 * 11,
      y: 32 * 18,
      options: {
        customHitboxes: [
          { x: 40, y: 26, width: 10, height: 20 },
          { x: -40, y: 26, width: 10, height: 20 },
        ],
      },
    });

    this.objectFactory.create({
      type: "flowerSmall",
      x: 32 * 11,
      y: 32 * 17,
      options: {
        depthOffset: getVisualBottomY(kitchenTable?.getSprite()) + 1,
      },
    });

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
      this.objectFactory.getInteractables(),
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
