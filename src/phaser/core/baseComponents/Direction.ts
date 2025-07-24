import { DIRECTIONS } from "../../shared/consts";
import type { DirectionType, GameObject } from "../../shared/types";
import { BaseGameObject } from "./BaseGameObject";

export class Direction extends BaseGameObject {
  #direction: DirectionType;
  #callback: (direction: DirectionType) => void;

  constructor(gameObject: GameObject, onDirectionCallback = () => undefined) {
    super(gameObject);
    this.#direction = DIRECTIONS.DOWN;
    this.#callback = onDirectionCallback;
  }

  get direction(): DirectionType {
    return this.#direction;
  }

  set direction(direction: DirectionType) {
    this.#direction = direction;
    this.#callback(this.#direction);
  }

  set callback(callback: (direction: DirectionType) => void) {
    this.#callback = callback;
  }
}
