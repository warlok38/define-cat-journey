import { InputComponent } from "../../../core/input";
import {
  HurtState,
  IdleState,
  MoveState,
} from "../../../core/stateMachine/states";
import {
  ASSET_KEYS,
  CHARACTER_STATES,
  DIRECTIONS,
  ENEMY_SPIDER_CHANGE_DIRECTION_DELAY_MAX,
  ENEMY_SPIDER_CHANGE_DIRECTION_DELAY_MIN,
  ENEMY_SPIDER_CHANGE_DIRECTION_DELAY_WAIT,
  ENEMY_SPIDER_HURT_PUSH_BACK_SPEED,
  ENEMY_SPIDER_SPEED,
  SPIDER_ANIMATION_KEYS,
} from "../../../shared/consts";
import type {
  AnimationConfig,
  DirectionType,
  Position,
} from "../../../shared/types";
import { exhaustiveGuard } from "../../../shared/utils";
import { CharacterGameObject } from "../../common/CharacterGameObject";

export type SpiderConfig = {
  scene: Phaser.Scene;
  position: Position;
};

export class Spider extends CharacterGameObject {
  constructor(config: SpiderConfig) {
    const animConfig = {
      key: SPIDER_ANIMATION_KEYS.WALK,
      repeat: -1,
      ignoreIfPlaying: true,
    };
    const hurtAnimConfig = {
      key: SPIDER_ANIMATION_KEYS.HIT,
      repeat: 0,
      ignoreIfPlaying: true,
    };

    const animationConfig: AnimationConfig = {
      WALK_DOWN: animConfig,
      WALK_UP: animConfig,
      WALK_LEFT: animConfig,
      WALK_RIGHT: animConfig,
      IDLE_DOWN: animConfig,
      IDLE_UP: animConfig,
      IDLE_LEFT: animConfig,
      IDLE_RIGHT: animConfig,
      HURT_DOWN: hurtAnimConfig,
      HURT_UP: hurtAnimConfig,
      HURT_LEFT: hurtAnimConfig,
      HURT_RIGHT: hurtAnimConfig,
    };

    super({
      scene: config.scene,
      position: config.position,
      assetKey: ASSET_KEYS.SPIDER,
      frame: 0,
      id: `spider-${Phaser.Math.RND.uuid()}`,
      isPlayer: false,
      animationConfig,
      speed: ENEMY_SPIDER_SPEED,
      inputComponent: new InputComponent(),
      isInvulnerable: false,
    });

    this._direction.callback = (direction: DirectionType) => {
      this.#handleDirectionChange(direction);
    };

    //state machine
    this._stateMachine.addState(new IdleState(this));
    this._stateMachine.addState(new MoveState(this));
    this._stateMachine.addState(
      new HurtState(this, ENEMY_SPIDER_HURT_PUSH_BACK_SPEED)
    );
    this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);

    this.scene.time.addEvent({
      delay: Phaser.Math.Between(
        ENEMY_SPIDER_CHANGE_DIRECTION_DELAY_MIN,
        ENEMY_SPIDER_CHANGE_DIRECTION_DELAY_MAX
      ),
      callback: this.#changeDirection,
      callbackScope: this,
      loop: false,
    });
  }

  #handleDirectionChange(direction: DirectionType): void {
    switch (direction) {
      case DIRECTIONS.DOWN:
        this.setAngle(0);
        return;
      case DIRECTIONS.UP:
        this.setAngle(180);
        return;
      case DIRECTIONS.LEFT:
        this.setAngle(90);
        return;
      case DIRECTIONS.RIGHT:
        this.setAngle(270);
        return;
      default:
        exhaustiveGuard(direction);
    }
  }

  #changeDirection(): void {
    // reset existing enemy input
    this.controls.reset();

    // wait a small period of time and then choose a random direction to move
    this.scene.time.delayedCall(
      ENEMY_SPIDER_CHANGE_DIRECTION_DELAY_WAIT,
      () => {
        const randomDirection = Phaser.Math.Between(0, 3);
        if (randomDirection === 0) {
          this.controls.isUpDown = true;
        } else if (randomDirection === 1) {
          this.controls.isRightDown = true;
        } else if (randomDirection === 2) {
          this.controls.isDownDown = true;
        } else {
          this.controls.isLeftDown = true;
        }

        this.scene.time.addEvent({
          delay: Phaser.Math.Between(
            ENEMY_SPIDER_CHANGE_DIRECTION_DELAY_MIN,
            ENEMY_SPIDER_CHANGE_DIRECTION_DELAY_MAX
          ),
          callback: this.#changeDirection,
          callbackScope: this,
          loop: false,
        });
      }
    );
  }
}
