import Phaser from "phaser";
import { BaseObject, Fridge, HouseDoor, TVObject } from "../objects";
import type { Hero } from "../characters";
import type { ObjectFactoryCreateProps } from "../interfaces";

export class ObjectFactory {
  private scene: Phaser.Scene;
  private hero: Hero;
  private interactables: Phaser.GameObjects.Group;

  constructor(scene: Phaser.Scene, hero: Hero) {
    this.scene = scene;
    this.hero = hero;
    this.interactables = this.scene.add.group();
  }

  getInteractables() {
    return this.interactables;
  }

  create(props: ObjectFactoryCreateProps) {
    const { type, x, y, options = {} } = props;

    switch (type) {
      case "fridge": {
        const createdObj = new Fridge(this.scene, x, y, options);
        createdObj.setCollisionWith(this.hero.getSprite());
        this.interactables.add(createdObj.getSprite());
        return createdObj;
      }

      case "TV": {
        const createdObj = new TVObject(this.scene, x, y, options);
        createdObj.setCollisionWith(this.hero.getSprite());
        this.interactables.add(createdObj.getSprite());
        return createdObj;
      }

      case "stove": {
        const createdObj = new BaseObject(this.scene, x, y, "stove", options);
        createdObj.setCollisionWith(this.hero.getSprite());
        return createdObj;
      }

      case "chest": {
        const createdObj = new BaseObject(this.scene, x, y, "chest", options);
        createdObj.setCollisionWith(this.hero.getSprite());
        this.interactables.add(createdObj.getSprite());
        return createdObj;
      }

      case "flowerSmall": {
        const createdObj = new BaseObject(
          this.scene,
          x,
          y,
          "flowerSmall",
          options
        );
        createdObj.setCollisionWith(this.hero.getSprite());
        return createdObj;
      }

      case "boxFloorSmall": {
        const createdObj = new BaseObject(
          this.scene,
          x,
          y,
          "boxFloorSmall",
          options
        );
        createdObj.setCollisionWith(this.hero.getSprite());
        return createdObj;
      }

      case "boxFloorWide": {
        const createdObj = new BaseObject(
          this.scene,
          x,
          y,
          "boxFloorWide",
          options
        );
        createdObj.setCollisionWith(this.hero.getSprite());
        return createdObj;
      }

      case "boxUpSmall": {
        const createdObj = new BaseObject(
          this.scene,
          x,
          y,
          "boxUpSmall",
          options
        );
        createdObj.setCollisionWith(this.hero.getSprite());
        return createdObj;
      }

      case "boxUpWide": {
        const createdObj = new BaseObject(
          this.scene,
          x,
          y,
          "boxUpWide",
          options
        );
        createdObj.setCollisionWith(this.hero.getSprite());
        return createdObj;
      }

      case "chair": {
        const createdObj = new BaseObject(this.scene, x, y, "chairs", options);
        createdObj.setCollisionWith(this.hero.getSprite());
        return createdObj;
      }

      case "furniture": {
        const createdObj = new BaseObject(this.scene, x, y, "furniture", {
          frame: options.frame ?? 1,
          customHitboxes: options.customHitboxes ?? [],
        });
        createdObj.setCollisionWith(this.hero.getSprite());
        return createdObj;
      }

      case "table": {
        const createdObj = new BaseObject(this.scene, x, y, "table", options);
        createdObj.setCollisionWith(this.hero.getSprite());
        return createdObj;
      }

      case "door": {
        const createdObj = new HouseDoor(this.scene, x, y);
        const collider = this.scene.physics.add.collider(
          this.hero.getSprite(),
          createdObj.getSprite()
        );
        createdObj.setCollider(collider);
        this.interactables.add(createdObj.getSprite());
        return createdObj;
      }

      default:
        throw new Error(
          `Object: '${type}' does not exist in ObjectFactory but is specified in types. Please define the object in the factory.`
        );
    }
  }
}
