import type { GameObject } from "../../shared/types";
import { BaseGameObject } from "./BaseGameObject";

export class Life extends BaseGameObject {
  #maxLife: number;
  #currentLife: number;

  constructor(gameObject: GameObject, maxLife: number, currentLife = maxLife) {
    super(gameObject);
    this.#maxLife = maxLife;
    this.#currentLife = currentLife;
  }

  get life(): number {
    return this.#currentLife;
  }

  get maxLife(): number {
    return this.#maxLife;
  }

  public takeDamage(damage: number): void {
    if (this.#currentLife === 0) {
      return;
    }
    this.#currentLife -= damage;
    if (this.#currentLife < 0) {
      this.#currentLife = 0;
    }
  }
}
