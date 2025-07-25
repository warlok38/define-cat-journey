import { CollidingObjects, HeldGameObject } from "../../core/baseComponents";
import { InputComponent } from "../../core/input";
import {
  DeathState,
  HurtState,
  IdleHoldingState,
  IdleState,
  LiftState,
  MoveHoldingState,
  MoveState,
  OpenChestState,
  ThrowState,
} from "../../core/stateMachine/states";
import {
  ASSET_KEYS,
  CHARACTER_STATES,
  HERO_ANIMATION_KEYS,
  HERO_HURT_PUSH_BACK_SPEED,
  HERO_INVULNERABLE_AFTER_HIT_DURATION,
  HERO_SPEED,
} from "../../shared/consts";
import type { AnimationConfig, GameObject, Position } from "../../shared/types";
import { flash } from "../../shared/utils";
import { CharacterGameObject } from "../common/CharacterGameObject";

export type HeroConfig = {
  scene: Phaser.Scene;
  position: Position;
  controls: InputComponent;
  maxLife: number;
  currentLife: number;
};

export class Hero extends CharacterGameObject {
  #collidingObjects: CollidingObjects;

  constructor(config: HeroConfig) {
    const animationConfig: AnimationConfig = {
      WALK_DOWN: {
        key: HERO_ANIMATION_KEYS.WALK_DOWN,
        repeat: -1,
        ignoreIfPlaying: true,
      },
      WALK_UP: {
        key: HERO_ANIMATION_KEYS.WALK_UP,
        repeat: -1,
        ignoreIfPlaying: true,
      },
      WALK_LEFT: {
        key: HERO_ANIMATION_KEYS.WALK_LEFT,
        repeat: -1,
        ignoreIfPlaying: true,
      },
      WALK_RIGHT: {
        key: HERO_ANIMATION_KEYS.WALK_RIGHT,
        repeat: -1,
        ignoreIfPlaying: true,
      },
      IDLE_DOWN: {
        key: HERO_ANIMATION_KEYS.IDLE_DOWN,
        repeat: -1,
        ignoreIfPlaying: true,
      },
      IDLE_UP: {
        key: HERO_ANIMATION_KEYS.IDLE_UP,
        repeat: -1,
        ignoreIfPlaying: true,
      },
      IDLE_LEFT: {
        key: HERO_ANIMATION_KEYS.IDLE_LEFT,
        repeat: -1,
        ignoreIfPlaying: true,
      },
      IDLE_RIGHT: {
        key: HERO_ANIMATION_KEYS.IDLE_RIGHT,
        repeat: -1,
        ignoreIfPlaying: true,
      },
      HURT_DOWN: {
        key: HERO_ANIMATION_KEYS.HURT_DOWN,
        repeat: 0,
        ignoreIfPlaying: true,
      },
      HURT_UP: {
        key: HERO_ANIMATION_KEYS.HURT_UP,
        repeat: 0,
        ignoreIfPlaying: true,
      },
      HURT_LEFT: {
        key: HERO_ANIMATION_KEYS.HURT_LEFT,
        repeat: 0,
        ignoreIfPlaying: true,
      },
      HURT_RIGHT: {
        key: HERO_ANIMATION_KEYS.HURT_RIGHT,
        repeat: 0,
        ignoreIfPlaying: true,
      },
      DIE_DOWN: {
        key: HERO_ANIMATION_KEYS.DIE_DOWN,
        repeat: 0,
        ignoreIfPlaying: true,
      },
      DIE_UP: {
        key: HERO_ANIMATION_KEYS.DIE_UP,
        repeat: 0,
        ignoreIfPlaying: true,
      },
      DIE_LEFT: {
        key: HERO_ANIMATION_KEYS.DIE_LEFT,
        repeat: 0,
        ignoreIfPlaying: true,
      },
      DIE_RIGHT: {
        key: HERO_ANIMATION_KEYS.DIE_RIGHT,
        repeat: 0,
        ignoreIfPlaying: true,
      },
      IDLE_HOLD_DOWN: {
        key: HERO_ANIMATION_KEYS.IDLE_HOLD_DOWN,
        repeat: -1,
        ignoreIfPlaying: true,
      },
      IDLE_HOLD_UP: {
        key: HERO_ANIMATION_KEYS.IDLE_HOLD_UP,
        repeat: -1,
        ignoreIfPlaying: true,
      },
      IDLE_HOLD_LEFT: {
        key: HERO_ANIMATION_KEYS.IDLE_HOLD_LEFT,
        repeat: -1,
        ignoreIfPlaying: true,
      },
      IDLE_HOLD_RIGHT: {
        key: HERO_ANIMATION_KEYS.IDLE_HOLD_RIGHT,
        repeat: -1,
        ignoreIfPlaying: true,
      },
      WALK_HOLD_DOWN: {
        key: HERO_ANIMATION_KEYS.WALK_HOLD_DOWN,
        repeat: -1,
        ignoreIfPlaying: true,
      },
      WALK_HOLD_UP: {
        key: HERO_ANIMATION_KEYS.WALK_HOLD_UP,
        repeat: -1,
        ignoreIfPlaying: true,
      },
      WALK_HOLD_LEFT: {
        key: HERO_ANIMATION_KEYS.WALK_HOLD_LEFT,
        repeat: -1,
        ignoreIfPlaying: true,
      },
      WALK_HOLD_RIGHT: {
        key: HERO_ANIMATION_KEYS.WALK_HOLD_RIGHT,
        repeat: -1,
        ignoreIfPlaying: true,
      },
      LIFT_DOWN: {
        key: HERO_ANIMATION_KEYS.LIFT_DOWN,
        repeat: 0,
        ignoreIfPlaying: true,
      },
      LIFT_UP: {
        key: HERO_ANIMATION_KEYS.LIFT_UP,
        repeat: 0,
        ignoreIfPlaying: true,
      },
      LIFT_LEFT: {
        key: HERO_ANIMATION_KEYS.LIFT_LEFT,
        repeat: 0,
        ignoreIfPlaying: true,
      },
      LIFT_RIGHT: {
        key: HERO_ANIMATION_KEYS.LIFT_RIGHT,
        repeat: 0,
        ignoreIfPlaying: true,
      },
    };

    super({
      scene: config.scene,
      position: config.position,
      assetKey: ASSET_KEYS.HERO,
      frame: 0,
      id: "hero",
      isPlayer: true,
      animationConfig,
      speed: HERO_SPEED,
      inputComponent: config.controls,
      isInvulnerable: false,
      invulnerableAfterHitAnimationDuration:
        HERO_INVULNERABLE_AFTER_HIT_DURATION,
      maxLife: config.maxLife,
      currentLife: config.currentLife,
    });

    //components
    this.#collidingObjects = new CollidingObjects(this);
    new HeldGameObject(this);

    //state machine
    this._stateMachine.addState(new IdleState(this));
    this._stateMachine.addState(new MoveState(this));
    this._stateMachine.addState(
      new HurtState(this, HERO_HURT_PUSH_BACK_SPEED, () => {
        flash(this);
      })
    );
    this._stateMachine.addState(new DeathState(this));
    this._stateMachine.addState(new LiftState(this));
    this._stateMachine.addState(new OpenChestState(this));
    this._stateMachine.addState(new IdleHoldingState(this));
    this._stateMachine.addState(new MoveHoldingState(this));
    this._stateMachine.addState(new ThrowState(this));
    this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);

    config.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    config.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      config.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
    });

    this.physicsBody
      .setSize(16, 12, true)
      .setOffset(this.width / 2 - 7, this.height / 2 + 1);
  }

  get physicsBody(): Phaser.Physics.Arcade.Body {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  collidedWithGameObject(gameObject: GameObject): void {
    this.#collidingObjects.add(gameObject);
  }

  update(): void {
    super.update();
    this.#collidingObjects.reset();
  }
}
