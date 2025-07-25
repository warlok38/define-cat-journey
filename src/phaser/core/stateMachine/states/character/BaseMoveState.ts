import type { CharacterGameObject } from "../../../../gameObjects/common/CharacterGameObject";
import { DIRECTIONS } from "../../../../shared/consts";
import type { DirectionType } from "../../../../shared/types";
import { isArcadePhysicsBody } from "../../../../shared/utils";
import type { InputComponent } from "../../../input";
import { BaseCharacterState } from "./BaseCharacterState";

export abstract class BaseMoveState extends BaseCharacterState {
  protected _moveAnimationPrefix: "WALK" | "WALK_HOLD";

  constructor(
    stateName: string,
    gameObject: CharacterGameObject,
    moveAnimationPrefix: "WALK" | "WALK_HOLD"
  ) {
    super(stateName, gameObject);

    this._moveAnimationPrefix = moveAnimationPrefix;
  }

  protected isNoInputMovement(controls: InputComponent): boolean {
    return (
      (!controls.isDownDown &&
        !controls.isUpDown &&
        !controls.isLeftDown &&
        !controls.isRightDown) ||
      controls.isMovementLocked
    );
  }

  protected handleCharacterMovement(): void {
    const controls = this._gameObject.controls;

    if (controls.isUpDown) {
      this.updateVelocity(false, -1);
      this.updateDirection(DIRECTIONS.UP);
    } else if (controls.isDownDown) {
      this.updateVelocity(false, 1);
      this.updateDirection(DIRECTIONS.DOWN);
    } else this.updateVelocity(false, 0);

    const isMovingVertically = controls.isDownDown || controls.isUpDown;
    if (controls.isLeftDown) {
      this.updateVelocity(true, -1);
      if (!isMovingVertically) {
        this.updateDirection(DIRECTIONS.LEFT);
      }
    } else if (controls.isRightDown) {
      this.updateVelocity(true, 1);
      if (!isMovingVertically) {
        this.updateDirection(DIRECTIONS.RIGHT);
      }
    } else {
      this.updateVelocity(true, 0);
    }

    this.normalizeVelocity();
  }

  protected updateVelocity(isX: boolean, value: number): void {
    if (!isArcadePhysicsBody(this._gameObject.body)) {
      return;
    }
    if (isX) {
      this._gameObject.body.velocity.x = value;
      return;
    }
    this._gameObject.body.velocity.y = value;
  }

  protected normalizeVelocity(): void {
    if (!isArcadePhysicsBody(this._gameObject.body)) {
      return;
    }

    this._gameObject.body.velocity.normalize().scale(this._gameObject.speed);
  }

  protected updateDirection(direction: DirectionType): void {
    this._gameObject.direction = direction;
    this._gameObject.animation.playAnimation(
      `${this._moveAnimationPrefix}_${this._gameObject.direction}`
    );
  }
}
