import type { CharacterGameObject } from "../../../../gameObjects/common/CharacterGameObject";
import { CHARACTER_STATES } from "../../../../shared/consts";
import { isArcadePhysicsBody } from "../../../../shared/utils";
import { HeldGameObject, ThrowableObject } from "../../../baseComponents";
import { BaseCharacterState } from "./BaseCharacterState";

export class ThrowState extends BaseCharacterState {
  constructor(gameObject: CharacterGameObject) {
    super(CHARACTER_STATES.THROW_STATE, gameObject);
  }

  public onEnter(): void {
    // reset game object velocity
    if (isArcadePhysicsBody(this._gameObject.body)) {
      this._gameObject.body.velocity.x = 0;
      this._gameObject.body.velocity.y = 0;
    }

    // play lift animation to throw items
    this._gameObject.animation.playAnimationInReverse(
      `LIFT_${this._gameObject.direction}`
    );

    // get item held by character and see if this is a throwable item
    const heldComponent = HeldGameObject.getComponent<HeldGameObject>(
      this._gameObject
    );
    if (heldComponent === undefined || heldComponent.object === undefined) {
      return;
    }
    const throwObjectComponent = ThrowableObject.getComponent<ThrowableObject>(
      heldComponent.object
    );
    if (throwObjectComponent !== undefined) {
      throwObjectComponent.throw(this._gameObject.direction);
    }
    heldComponent.drop();
  }

  public onUpdate(): void {
    if (this._gameObject.animation.isAnimationPlaying()) {
      return;
    }

    this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
  }
}
