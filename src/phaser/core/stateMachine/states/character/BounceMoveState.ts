import type { CharacterGameObject } from "../../../../gameObjects/common/CharacterGameObject";
import { CHARACTER_STATES } from "../../../../shared/consts";
import { BaseCharacterState } from "./BaseCharacterState";

export class BounceMoveState extends BaseCharacterState {
  constructor(gameObject: CharacterGameObject) {
    super(CHARACTER_STATES.BOUNCE_MOVE_STATE, gameObject);
  }

  public onEnter(): void {
    this._gameObject.animation.playAnimation(
      `IDLE_${this._gameObject.direction}`
    );

    // pick a random direction to start moving towards
    const speed = this._gameObject.speed;
    const randomDirection = Phaser.Math.Between(0, 3);
    if (randomDirection === 0) {
      this._gameObject.setVelocity(speed, speed * -1);
    } else if (randomDirection === 1) {
      this._gameObject.setVelocity(speed, speed);
    } else if (randomDirection === 2) {
      this._gameObject.setVelocity(speed * -1, speed);
    } else {
      this._gameObject.setVelocity(speed * -1, speed * -1);
    }
    this._gameObject.setBounce(1);
  }
}
