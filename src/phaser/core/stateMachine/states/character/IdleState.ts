import type { CharacterGameObject } from "../../../../gameObjects/common/CharacterGameObject";
import { CHARACTER_STATES } from "../../../../shared/consts";
import { BaseCharacterState } from "./BaseCharacterState";
import { HeldGameObject, ThrowableObject } from "../../../baseComponents";

export class IdleState extends BaseCharacterState {
  constructor(gameObject: CharacterGameObject) {
    super(CHARACTER_STATES.IDLE_STATE, gameObject);
  }

  onEnter(): void {
    this._gameObject.animation.playAnimation(
      `IDLE_${this._gameObject.direction}`
    );

    this._resetObjectVelocity();

    const heldComponent = HeldGameObject.getComponent<HeldGameObject>(
      this._gameObject
    );
    if (heldComponent !== undefined && heldComponent.object !== undefined) {
      const throwObjectComponent =
        ThrowableObject.getComponent<ThrowableObject>(heldComponent.object);
      if (throwObjectComponent !== undefined) {
        throwObjectComponent.drop();
      }
      heldComponent.drop();
    }
  }

  onUpdate(): void {
    const controls = this._gameObject.controls;

    if (controls.isMovementLocked) {
      return;
    }

    // if attack key was pressed, attack
    if (controls.isAttackKeyJustDown) {
      this._stateMachine.setState(CHARACTER_STATES.ATTACK_STATE);
      return;
    }

    // if no other input is provided, do nothing
    if (
      !controls.isDownDown &&
      !controls.isUpDown &&
      !controls.isLeftDown &&
      !controls.isRightDown
    ) {
      return;
    }

    this._stateMachine.setState(CHARACTER_STATES.MOVE_STATE);
  }
}
