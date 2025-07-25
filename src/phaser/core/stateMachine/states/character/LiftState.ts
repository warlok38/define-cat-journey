import type { CharacterGameObject } from "../../../../gameObjects/common/CharacterGameObject";
import { CHARACTER_STATES } from "../../../../shared/consts";
import type { GameObject } from "../../../../shared/types";
import { isArcadePhysicsBody } from "../../../../shared/utils";
import { HeldGameObject } from "../../../baseComponents";
import { BaseCharacterState } from "./BaseCharacterState";

export class LiftState extends BaseCharacterState {
  constructor(gameObject: CharacterGameObject) {
    super(CHARACTER_STATES.LIFT_STATE, gameObject);
  }

  onEnter(args: unknown[]): void {
    const gameObjectBeingPickedUp = args[0] as GameObject;

    if (isArcadePhysicsBody(this._gameObject.body)) {
      this._gameObject.body.velocity.x = 0;
      this._gameObject.body.velocity.y = 0;
    }

    const heldComponent = HeldGameObject.getComponent<HeldGameObject>(
      this._gameObject
    );
    if (heldComponent === undefined) {
      this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
      return;
    }

    // store a reference to the lifted up game object
    heldComponent.object = gameObjectBeingPickedUp;

    // disable body on the lifted up game object
    if (isArcadePhysicsBody(gameObjectBeingPickedUp.body)) {
      gameObjectBeingPickedUp.body.enable = false;
    }

    // have character carry the object
    gameObjectBeingPickedUp.setDepth(2).setOrigin(0.5, 0.5);

    // play lift animation and then transition to hold item state
    this._gameObject.animation.playAnimation(
      `LIFT_${this._gameObject.direction}`
    );
  }

  onUpdate(): void {
    if (this._gameObject.animation.isAnimationPlaying()) {
      return;
    }

    this._stateMachine.setState(CHARACTER_STATES.IDLE_HOLDING_STATE);
  }
}
