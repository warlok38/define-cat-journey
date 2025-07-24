import type { CharacterGameObject } from "../../../../gameObjects/common/CharacterGameObject";
import {
  CHARACTER_ANIMATIONS,
  CHARACTER_STATES,
  DIRECTIONS,
  HURT_PUSH_BACK_DELAY,
} from "../../../../shared/consts";
import type { DirectionType } from "../../../../shared/types";
import { exhaustiveGuard, isArcadePhysicsBody } from "../../../../shared/utils";
import { BaseCharacterState } from "./BaseCharacterState";

export class HurtState extends BaseCharacterState {
  #hurtPushBackSpeed: number;
  #onHurtCallback: () => void;
  #nextState: string;

  constructor(
    gameObject: CharacterGameObject,
    hurtPushBackSpeed: number,
    onHurtCallback: () => void = () => undefined,
    nextState: string = CHARACTER_STATES.IDLE_STATE
  ) {
    super(CHARACTER_STATES.HURT_STATE, gameObject);

    this.#hurtPushBackSpeed = hurtPushBackSpeed;
    this.#onHurtCallback = onHurtCallback;
    this.#nextState = nextState;
  }

  onEnter(args: unknown[]): void {
    const attackDirection = args[0] as DirectionType;

    if (isArcadePhysicsBody(this._gameObject.body)) {
      const body = this._gameObject.body;
      body.velocity.x = 0;
      body.velocity.y = 0;

      switch (attackDirection) {
        case DIRECTIONS.DOWN:
          body.velocity.y = this.#hurtPushBackSpeed;
          break;
        case DIRECTIONS.UP:
          body.velocity.y = this.#hurtPushBackSpeed * -1;
          break;
        case DIRECTIONS.LEFT:
          body.velocity.x = this.#hurtPushBackSpeed * -1;
          break;
        case DIRECTIONS.RIGHT:
          body.velocity.x = this.#hurtPushBackSpeed;
          break;
        default:
          exhaustiveGuard(attackDirection);
      }

      // wait a certain amount of time before resetting velocity to stop the push back
      this._gameObject.scene.time.delayedCall(HURT_PUSH_BACK_DELAY, () => {
        body.velocity.x = 0;
        body.velocity.y = 0;
      });
    }

    // make character invulnerable after taking a hit
    this._gameObject.invulnerable.invulnerable = true;
    this.#onHurtCallback();

    // play animation for character being hurt
    this._gameObject.animation.playAnimation(
      CHARACTER_ANIMATIONS.HURT_DOWN,
      () => {
        this.#transition();
      }
    );
  }
  #transition(): void {
    // wait set amount of time before making character vulnerable again
    this._gameObject.scene.time.delayedCall(
      this._gameObject.invulnerable.invulnerableAfterHitAnimationDuration,
      () => {
        this._gameObject.invulnerable.invulnerable = false;
      }
    );
    this._stateMachine.setState(this.#nextState);
  }
}
