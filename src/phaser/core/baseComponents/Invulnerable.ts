import type { GameObject } from "../../shared/types";
import { BaseGameObject } from "./BaseGameObject";

export class Invulnerable extends BaseGameObject {
  #invulnerable: boolean;
  #invulnerableAfterHitAnimationDuration: number;

  constructor(
    gameObject: GameObject,
    invulnerable = false,
    invulnerableAfterHitAnimationDuration = 0
  ) {
    super(gameObject);
    this.#invulnerable = invulnerable;
    this.#invulnerableAfterHitAnimationDuration =
      invulnerableAfterHitAnimationDuration;
  }

  get invulnerable(): boolean {
    return this.#invulnerable;
  }

  set invulnerable(value: boolean) {
    this.#invulnerable = value;
  }

  get invulnerableAfterHitAnimationDuration(): number {
    return this.#invulnerableAfterHitAnimationDuration;
  }
}
