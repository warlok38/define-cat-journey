import type { CharacterGameObject } from "../../../../gameObjects/common/CharacterGameObject";
import { CHARACTER_STATES, DIRECTIONS } from "../../../../shared/consts";
import type { DirectionType } from "../../../../shared/types";
import { isArcadePhysicsBody } from "../../../../shared/utils";
import { BaseCharacterState } from "./BaseCharacterState";

export class MoveState extends BaseCharacterState {
  constructor(gameObject: CharacterGameObject) {
    super(CHARACTER_STATES.MOVE_STATE, gameObject);
  }
  onUpdate(): void {
    const controls = this._gameObject.controls;

    if (
      !controls.isDownDown &&
      !controls.isUpDown &&
      !controls.isLeftDown &&
      !controls.isRightDown
    ) {
      this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
    }

    if (controls.isUpDown) {
      this.#updateVelocity(false, -1);
      this.#updateDirection(DIRECTIONS.UP);
    } else if (controls.isDownDown) {
      this.#updateVelocity(false, 1);
      this.#updateDirection(DIRECTIONS.DOWN);
    } else this.#updateVelocity(false, 0);

    const isMovingVertically = controls.isDownDown || controls.isUpDown;
    if (controls.isLeftDown) {
      this.#updateVelocity(true, -1);
      if (!isMovingVertically) {
        this.#updateDirection(DIRECTIONS.LEFT);
      }
    } else if (controls.isRightDown) {
      this.#updateVelocity(true, 1);
      if (!isMovingVertically) {
        this.#updateDirection(DIRECTIONS.RIGHT);
      }
    } else {
      this.#updateVelocity(true, 0);
    }

    this.#normalizeVelocity();
  }

  #updateVelocity(isX: boolean, value: number): void {
    if (!isArcadePhysicsBody(this._gameObject.body)) {
      return;
    }
    if (isX) {
      this._gameObject.body.velocity.x = value;
      return;
    }
    this._gameObject.body.velocity.y = value;
  }

  #normalizeVelocity(): void {
    if (!isArcadePhysicsBody(this._gameObject.body)) {
      return;
    }

    this._gameObject.body.velocity.normalize().scale(this._gameObject.speed);
  }

  #updateDirection(direction: DirectionType): void {
    this._gameObject.direction = direction;
    this._gameObject.animation.playAnimation(
      `WALK_${this._gameObject.direction}`
    );
  }
}
