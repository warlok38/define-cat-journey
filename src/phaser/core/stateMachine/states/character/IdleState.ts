import type { CharacterGameObject } from "../../../../gameObjects/common/CharacterGameObject";
import { CHARACTER_STATES } from "../../../../shared/consts";
import { isArcadePhysicsBody } from "../../../../shared/utils";
import { BaseCharacterState } from "./BaseCharacterState";

export class IdleState extends BaseCharacterState {
  constructor(gameObject: CharacterGameObject) {
    super(CHARACTER_STATES.IDLE_STATE, gameObject);
  }

  onEnter(): void {
    this._gameObject.animation.playAnimation(
      `IDLE_${this._gameObject.direction}`
    );

    if (isArcadePhysicsBody(this._gameObject.body)) {
      this._gameObject.body.velocity.x = 0;
      this._gameObject.body.velocity.y = 0;
    }
  }

  onUpdate(): void {
    const controls = this._gameObject.controls;

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
