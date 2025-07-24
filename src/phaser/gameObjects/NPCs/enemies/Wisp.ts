import { InputComponent } from "../../../core/input";
import { BounceMoveState } from "../../../core/stateMachine/states";
import {
  ASSET_KEYS,
  CHARACTER_STATES,
  ENEMY_WISP_PULSE_ANIMATION_DURATION,
  ENEMY_WISP_PULSE_ANIMATION_SCALE_X,
  ENEMY_WISP_PULSE_ANIMATION_SCALE_Y,
  ENEMY_WISP_SPEED,
  WISP_ANIMATION_KEYS,
} from "../../../shared/consts";
import type { AnimationConfig, Position } from "../../../shared/types";
import { CharacterGameObject } from "../../common/CharacterGameObject";

export type WispConfig = {
  scene: Phaser.Scene;
  position: Position;
};

export class Wisp extends CharacterGameObject {
  constructor(config: WispConfig) {
    const animConfig = {
      key: WISP_ANIMATION_KEYS.IDLE,
      repeat: -1,
      ignoreIfPlaying: true,
    };

    const animationConfig: AnimationConfig = {
      IDLE_DOWN: animConfig,
      IDLE_UP: animConfig,
      IDLE_LEFT: animConfig,
      IDLE_RIGHT: animConfig,
    };

    super({
      scene: config.scene,
      position: config.position,
      assetKey: ASSET_KEYS.WISP,
      frame: 0,
      id: `wisp-${Phaser.Math.RND.uuid()}`,
      isPlayer: false,
      animationConfig,
      speed: ENEMY_WISP_SPEED,
      inputComponent: new InputComponent(),
      isInvulnerable: true,
    });

    //state machine
    this._stateMachine.addState(new BounceMoveState(this));
    this._stateMachine.setState(CHARACTER_STATES.BOUNCE_MOVE_STATE);

    // custom animation for movement
    this.scene.tweens.add({
      targets: this,
      scaleX: ENEMY_WISP_PULSE_ANIMATION_SCALE_X,
      scaleY: ENEMY_WISP_PULSE_ANIMATION_SCALE_Y,
      yoyo: true,
      repeat: -1,
      duration: ENEMY_WISP_PULSE_ANIMATION_DURATION,
    });
  }
}
