import type { GameObject, InteractiveObjectType } from "../../shared/types";
import { BaseGameObject } from "./BaseGameObject";

export class InteractiveObject extends BaseGameObject {
  #objectType: InteractiveObjectType;
  #callback: () => void;
  #canInteractCheck: () => boolean;

  constructor(
    gameObject: GameObject,
    objectType: InteractiveObjectType,
    canInteractCheck = () => true,
    callback = () => undefined
  ) {
    super(gameObject);
    this.#objectType = objectType;
    this.#callback = callback;
    this.#canInteractCheck = canInteractCheck;
  }

  get objectType(): InteractiveObjectType {
    return this.#objectType;
  }

  interact(): void {
    this.#callback();
  }

  canInteractWith(): boolean {
    return this.#canInteractCheck();
  }
}
