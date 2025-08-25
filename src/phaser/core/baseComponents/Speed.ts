import type { GameObject } from "../../shared/types";
import { BaseGameObject } from "./BaseGameObject";

export class Speed extends BaseGameObject {
  #speed: number;
  #speedFast: number;

  constructor(gameObject: GameObject, speed: number, speedFast: number) {
    super(gameObject);
    this.#speed = speed;
    this.#speedFast = speedFast;
  }

  get speed(): number {
    return this.#speed;
  }

  get speedFast(): number {
    return this.#speedFast;
  }
}
