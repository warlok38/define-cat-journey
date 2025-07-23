import * as Phaser from "phaser";
import type { GameObject } from "../../shared/types";

export class BaseGameObject {
  protected scene: Phaser.Scene;
  protected gameObject: GameObject;

  constructor(gameObject: GameObject) {
    this.scene = gameObject.scene;
    this.gameObject = gameObject;
    this.assignComponentToObject(gameObject);
  }

  static getComponent<T>(gameObject: GameObject): T {
    //TODO fix ts errors
    //@ts-expect-error Element implicitly has an 'any'
    return gameObject[`_${this.name}`] as T;
  }

  static removeComponent(gameObject: GameObject): void {
    //@ts-expect-error Element implicitly has an 'any'
    delete gameObject[`_${this.name}`];
  }

  protected assignComponentToObject(
    object: GameObject | Phaser.Physics.Arcade.Body
  ): void {
    //@ts-expect-error Element implicitly has an 'any'
    object[`_${this.constructor.name}`] = this;
  }
}
