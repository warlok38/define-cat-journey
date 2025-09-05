import { BaseCharacterState } from "./BaseCharacterState";
import { CHARACTER_STATES, JUMP_PHASE_CODES } from "../../../../shared/consts";
import type { CharacterGameObject } from "../../../../gameObjects/common/CharacterGameObject";
import type { JumpPhaseCodes } from "../../../../shared/types";

export class JumpState extends BaseCharacterState {
  private _phase: JumpPhaseCodes;
  private _jumpStartY: number;
  private _jumpHeight: number;
  private _jumpSpeed: number;
  private _gravity: number;
  private _savedVelocityX: number;

  constructor(gameObject: CharacterGameObject) {
    super(CHARACTER_STATES.JUMP_STATE, gameObject);

    this._phase = JUMP_PHASE_CODES.ASCEND;
    this._jumpStartY = 0;
    this._jumpHeight = 32;
    this._jumpSpeed = -180;
    this._gravity = 400;
    this._savedVelocityX = 0;
  }

  onEnter(): void {
    this._phase = JUMP_PHASE_CODES.ASCEND;
    this._jumpStartY = this._gameObject.y;

    const body = this._gameObject.body as Phaser.Physics.Arcade.Body;
    this._savedVelocityX = body.velocity.x;

    body.setAllowGravity(true);
    body.setGravityY(this._gravity);
    body.setVelocityY(this._jumpSpeed);

    this._gameObject.animation.playAnimation(
      `IDLE_${this._gameObject.direction}`
    );
  }

  onUpdate(): void {
    this.#handleJump();
  }

  #handleJump(): void {
    const body = this._gameObject.body as Phaser.Physics.Arcade.Body;

    body.setVelocityX(this._savedVelocityX);

    //ascend phase
    if (this._phase === JUMP_PHASE_CODES.ASCEND && body.velocity.y >= 0) {
      this._phase = JUMP_PHASE_CODES.DESCEND;
      this._gameObject.animation.playAnimation(
        `IDLE_${this._gameObject.direction}`
      );
    }

    //descend phase
    if (
      this._phase === JUMP_PHASE_CODES.DESCEND &&
      this._gameObject.y >= this._jumpStartY
    ) {
      body.setVelocityY(0);
      body.setGravityY(0);
      this._gameObject.y = this._jumpStartY;

      if (
        this._gameObject.controls.isDownDown ||
        this._gameObject.controls.isUpDown ||
        this._gameObject.controls.isLeftDown ||
        this._gameObject.controls.isRightDown
      ) {
        this._stateMachine.setState(CHARACTER_STATES.MOVE_STATE);
      } else {
        this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
      }
    }
  }
}
