import type { GameObject } from "../../shared/types";
import { BaseGameObject } from "./BaseGameObject";

export class HeldGameObject extends BaseGameObject {
  #object: GameObject | undefined;

  constructor(gameObject: GameObject) {
    super(gameObject);
  }

  get object(): GameObject | undefined {
    return this.#object;
  }

  set object(object: GameObject) {
    this.#object = object;
  }

  drop(): void {
    this.#object = undefined;
  }
}
