import type { CharacterGameObject } from "../../../../gameObjects/common/CharacterGameObject";
import { DIRECTIONS } from "../../../../shared/consts";
import type { DirectionType } from "../../../../shared/types";
import { isArcadePhysicsBody } from "../../../../shared/utils";
import type { InputComponent } from "../../../input";
import { BaseCharacterState } from "./BaseCharacterState";

export abstract class BaseMoveState extends BaseCharacterState {
  protected _moveAnimationPrefix: "WALK" | "WALK_HOLD";

  private static readonly DIRECTION_MAP: Record<string, DirectionType> = {
    "-1,-1": DIRECTIONS.UP_LEFT,
    "1,-1": DIRECTIONS.UP_RIGHT,
    "-1,1": DIRECTIONS.DOWN_LEFT,
    "1,1": DIRECTIONS.DOWN_RIGHT,
    "-1,0": DIRECTIONS.LEFT,
    "1,0": DIRECTIONS.RIGHT,
    "0,-1": DIRECTIONS.UP,
    "0,1": DIRECTIONS.DOWN,
  };

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

    const dy = controls.isUpDown ? -1 : controls.isDownDown ? 1 : 0;
    const dx = controls.isLeftDown ? -1 : controls.isRightDown ? 1 : 0;

    this.updateVelocity(false, dy);
    this.updateVelocity(true, dx);
    this.normalizeVelocity();

    if (dx !== 0 || dy !== 0) {
      const direction =
        BaseMoveState.DIRECTION_MAP[`${dx},${dy}`] ??
        this._gameObject.direction;
      this.updateDirection(direction);
    }
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
