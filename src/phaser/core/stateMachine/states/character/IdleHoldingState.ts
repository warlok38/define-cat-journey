import type { CharacterGameObject } from "../../../../gameObjects/common/CharacterGameObject";
import { CHARACTER_STATES } from "../../../../shared/consts";
import { BaseCharacterState } from "./BaseCharacterState";

export class IdleHoldingState extends BaseCharacterState {
  constructor(gameObject: CharacterGameObject) {
    super(CHARACTER_STATES.IDLE_HOLDING_STATE, gameObject);
  }

  onEnter(): void {
    this._gameObject.animation.playAnimation(
      `IDLE_HOLD_${this._gameObject.direction}`
    );

    this._resetObjectVelocity();
  }

  onUpdate(): void {
    const controls = this._gameObject.controls;

    if (controls.isActionKeyJustDown) {
      this._stateMachine.setState(CHARACTER_STATES.THROW_STATE);
      return;
    }

    if (
      !controls.isDownDown &&
      !controls.isUpDown &&
      !controls.isLeftDown &&
      !controls.isRightDown
    ) {
      return;
    }

    this._stateMachine.setState(CHARACTER_STATES.MOVE_HOLDING_STATE);
  }
}
