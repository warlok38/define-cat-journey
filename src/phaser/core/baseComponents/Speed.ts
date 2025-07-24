import type { GameObject } from "../../shared/types";
import { BaseGameObject } from "./BaseGameObject";

export class Speed extends BaseGameObject {
  #speed: number;

  constructor(gameObject: GameObject, speed: number) {
    super(gameObject);
    this.#speed = speed;
  }

  get speed(): number {
    return this.#speed;
  }
}
