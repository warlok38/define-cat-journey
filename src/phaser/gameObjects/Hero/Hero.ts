import {
  CollidingObjects,
  HeldGameObject,
  Weapon,
} from "../../core/baseComponents";
import { InputComponent } from "../../core/input";
import {
  AttackState,
  DeathState,
  HurtState,
  IdleHoldingState,
  IdleState,
  JumpState,
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
  HERO_ATTACK_DAMAGE,
  HERO_HURT_PUSH_BACK_SPEED,
  HERO_INVULNERABLE_AFTER_HIT_DURATION,
  HERO_SPEED,
  HERO_SPEED_FAST,
} from "../../shared/consts";
import type { GameObject, Position } from "../../shared/types";
import { flash, getVisualBottomY } from "../../shared/utils";
import { CharacterGameObject } from "../common/CharacterGameObject";
import { Claws } from "../weapons";
import { heroAnimationConfig } from "./heroAnimationConfig";

export type HeroConfig = {
  scene: Phaser.Scene;
  position: Position;
  controls: InputComponent;
  maxLife: number;
  currentLife: number;
};

export class Hero extends CharacterGameObject {
  #collidingObjects: CollidingObjects;
  #weapon: Weapon;

  constructor(config: HeroConfig) {
    const animationConfig = heroAnimationConfig;

    super({
      scene: config.scene,
      position: config.position,
      assetKey: ASSET_KEYS.HERO,
      shadowKey: ASSET_KEYS.HERO_SHADOW,
      frame: 0,
      id: "hero",
      isPlayer: true,
      animationConfig,
      speed: HERO_SPEED,
      speedFast: HERO_SPEED_FAST,
      inputComponent: config.controls,
      isInvulnerable: false,
      invulnerableAfterHitAnimationDuration:
        HERO_INVULNERABLE_AFTER_HIT_DURATION,
      maxLife: config.maxLife,
      currentLife: config.currentLife,
    });

    //TODO need in future
    // const fxShadow = this.postFX.addShadow(
    //   0.64,
    //   0,
    //   0.1,
    //   0.7,
    //   0xcb92d1,
    //   10,
    //   0.3
    // );

    // this.postFX.addShadow(0.64, 0, 0.2, 0.5, 0xf8f1f9, 5, 0.2);

    // this.scene.add.tween({
    //   targets: fxShadow,
    //   y: -0.2,
    //   decay: 0.25,
    //   intensity: 0.25,
    //   duration: 1500,
    //   yoyo: true,
    //   repeat: -1,
    // });

    //components
    this.#collidingObjects = new CollidingObjects(this);
    new HeldGameObject(this);
    this.#weapon = new Weapon(this);
    this.#weapon.weapon = new Claws(
      this,
      this.#weapon,
      {
        DOWN: HERO_ANIMATION_KEYS.ATTACK_CLAWS_DOWN,
        DOWN_LEFT: HERO_ANIMATION_KEYS.ATTACK_CLAWS_DOWN_LEFT,
        DOWN_RIGHT: HERO_ANIMATION_KEYS.ATTACK_CLAWS_DOWN_RIGHT,
        UP: HERO_ANIMATION_KEYS.ATTACK_CLAWS_UP,
        UP_LEFT: HERO_ANIMATION_KEYS.ATTACK_CLAWS_UP_LEFT,
        UP_RIGHT: HERO_ANIMATION_KEYS.ATTACK_CLAWS_UP_RIGHT,
        LEFT: HERO_ANIMATION_KEYS.ATTACK_CLAWS_LEFT,
        RIGHT: HERO_ANIMATION_KEYS.ATTACK_CLAWS_RIGHT,
      },
      HERO_ATTACK_DAMAGE
    );

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
    this._stateMachine.addState(new AttackState(this));
    // this._stateMachine.addState(new JumpState(this));
    this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);

    // enable auto update functionality
    config.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    config.scene.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      () => {
        config.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
      },
      this
    );
  }

  get physicsBody(): Phaser.Physics.Arcade.Body {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  get weapon(): Weapon {
    return this.#weapon;
  }

  collidedWithGameObject(gameObject: GameObject): void {
    this.#collidingObjects.add(gameObject);
  }

  update(): void {
    super.update();
    this.#collidingObjects.reset();
    this.#weapon.update();
    this.#calcSizeByDirection();

    this.setDepth(getVisualBottomY(this));
  }

  #calcSizeByDirection(): void {
    if (this.direction.includes("DOWN")) {
      this.physicsBody
        .setSize(16, 12, true)
        .setOffset(this.width / 3 + 1, this.height / 2 + 4);
    } else if (this.direction.includes("UP")) {
      this.physicsBody
        .setSize(16, 12, true)
        .setOffset(this.width / 3 + 1, this.height / 2 + 2);
    } else if (this.direction === "LEFT" || this.direction === "RIGHT") {
      this.physicsBody
        .setSize(20, 12, true)
        .setOffset(this.width / 3 - 1, this.height / 2 + 2);
    }
  }
}
