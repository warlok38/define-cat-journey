import type { GameObject } from "../../shared/types";
import { BaseGameObject } from "./BaseGameObject";

export class CollidingObjects extends BaseGameObject {
  #objects: GameObject[];

  constructor(gameObject: GameObject) {
    super(gameObject);
    this.#objects = [];
  }

  get objects(): GameObject[] {
    return this.#objects;
  }

  add(gameObject: GameObject): void {
    this.#objects.push(gameObject);
  }

  reset(): void {
    this.#objects = [];
  }
}
