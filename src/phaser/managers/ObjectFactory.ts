import Phaser from "phaser";
import { BaseObject, HouseDoor } from "../objects";
import type { Hero } from "../characters";
import type { BaseObjectOptions } from "../interfaces";

interface ObjectDefinition {
  type: string;
  x: number;
  y: number;
  options?: BaseObjectOptions;
}

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

  create(objectDef: ObjectDefinition) {
    const { type, x, y, options = {} } = objectDef;

    switch (type) {
      case "chest": {
        const chest = new BaseObject(this.scene, x, y, "chest", {
          ...options,
        });
        chest.setCollisionWith(this.hero.getSprite());
        this.interactables.add(chest.getSprite());
        return chest;
      }

      case "chair": {
        const chair = new BaseObject(this.scene, x, y, "chairs", {
          frame: options.frame ?? 0,
          sizeOffset: { width: -8, height: -36 },
          offset: { x: 0, y: 10 },
          depthOffset: -4,
          ...options,
        });
        chair.setCollisionWith(this.hero.getSprite());
        return chair;
      }

      case "table": {
        const table = new BaseObject(this.scene, x, y, "furniture", {
          frame: options.frame ?? 1,
          customHitboxes: options.customHitboxes ?? [],
        });
        table.setCollisionWith(this.hero.getSprite());
        this.interactables.add(table.getSprite());
        return table;
      }

      case "door": {
        const door = new HouseDoor(this.scene, x, y);
        const collider = this.scene.physics.add.collider(
          this.hero.getSprite(),
          door.getSprite()
        );
        door.setCollider(collider);
        this.interactables.add(door.getSprite());
        return door;
      }

      default:
        console.warn(`Unknown object type: ${type}`);
        return null;
    }
  }
}
