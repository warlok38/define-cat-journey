import type { GameObject } from "../../shared/types";
import type { InputComponent } from "../input";
import { BaseGameObject } from "./BaseGameObject";

export class ControlsComponent extends BaseGameObject {
  #inputComponent: InputComponent;

  constructor(gameObject: GameObject, inputComponent: InputComponent) {
    super(gameObject);
    this.#inputComponent = inputComponent;
  }

  get controls(): InputComponent {
    return this.#inputComponent;
  }
}
