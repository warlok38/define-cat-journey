import type { CharacterGameObject } from "../../../../gameObjects/common/CharacterGameObject";
import {
  CHARACTER_STATES,
  INTERACTIVE_OBJECT_TYPE,
} from "../../../../shared/consts";
import { exhaustiveGuard } from "../../../../shared/utils";
import { CollidingObjects, InteractiveObject } from "../../../baseComponents";
import type { InputComponent } from "../../../input";
import { BaseMoveState } from "./BaseMoveState";

export class MoveState extends BaseMoveState {
  constructor(gameObject: CharacterGameObject) {
    super(CHARACTER_STATES.MOVE_STATE, gameObject, "WALK");
  }
  onUpdate(): void {
    const controls = this._gameObject.controls;

    if (this.isNoInputMovement(controls)) {
      this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
    }

    // if we interacted with an object and switched states, stop processing
    if (this.#checkIfObjectWasInteractedWith(controls)) {
      return;
    }

    this.handleCharacterMovement();
  }

  #checkIfObjectWasInteractedWith(controls: InputComponent): boolean {
    const collideComponent = CollidingObjects.getComponent<CollidingObjects>(
      this._gameObject
    );

    if (
      collideComponent === undefined ||
      collideComponent.objects.length === 0
    ) {
      return false;
    }

    const collisionObject = collideComponent.objects[0];
    const interactiveObject =
      InteractiveObject.getComponent<InteractiveObject>(collisionObject);
    if (interactiveObject === undefined) {
      return false;
    }
    if (!controls.isActionKeyJustDown) {
      return false;
    }

    // check if game object can be interacted with
    if (!interactiveObject.canInteractWith()) {
      return false;
    }
    interactiveObject.interact();

    // we can carry this item
    if (interactiveObject.objectType === INTERACTIVE_OBJECT_TYPE.PICKUP) {
      this._stateMachine.setState(CHARACTER_STATES.LIFT_STATE, collisionObject);
      return true;
    }

    // we can open this item
    if (interactiveObject.objectType === INTERACTIVE_OBJECT_TYPE.OPEN) {
      this._stateMachine.setState(
        CHARACTER_STATES.OPEN_CHEST_STATE,
        collisionObject
      );
      return true;
    }

    if (interactiveObject.objectType === INTERACTIVE_OBJECT_TYPE.AUTO) {
      return false;
    }

    exhaustiveGuard(interactiveObject.objectType);
  }
}
