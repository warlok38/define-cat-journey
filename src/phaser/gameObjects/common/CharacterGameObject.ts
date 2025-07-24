import {
  Animation,
  ControlsComponent,
  Direction,
  Invulnerable,
  Speed,
} from "../../core/baseComponents";
import { InputComponent } from "../../core/input";
import { StateMachine } from "../../core/stateMachine";
import { CHARACTER_STATES } from "../../shared/consts";
import type {
  AnimationConfig,
  DirectionType,
  Position,
} from "../../shared/types";

export type CharacterConfig = {
  scene: Phaser.Scene;
  position: Position;
  assetKey: string;
  frame?: number;
  inputComponent: InputComponent;
  animationConfig: AnimationConfig;
  speed: number;
  id?: string;
  isPlayer: boolean;
  isInvulnerable?: boolean;
  invulnerableAfterHitAnimationDuration?: number;
};

export abstract class CharacterGameObject extends Phaser.Physics.Arcade.Sprite {
  protected _controlsComponent: ControlsComponent;
  protected _stateMachine: StateMachine;
  protected _direction: Direction;
  protected _speed: Speed;
  protected _animation: Animation;
  protected _invulnerable: Invulnerable;
  protected _isPlayer: boolean;

  constructor(config: CharacterConfig) {
    const {
      scene,
      position,
      assetKey,
      frame,
      speed,
      animationConfig,
      inputComponent,
      id,
      isPlayer,
      isInvulnerable,
      invulnerableAfterHitAnimationDuration,
    } = config;
    super(scene, position.x, position.y, assetKey, frame || 0);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this._controlsComponent = new ControlsComponent(this, inputComponent);
    this._speed = new Speed(this, speed);
    this._direction = new Direction(this);
    this._animation = new Animation(this, animationConfig);
    this._invulnerable = new Invulnerable(
      this,
      isInvulnerable || false,
      invulnerableAfterHitAnimationDuration
    );

    this._stateMachine = new StateMachine(id);

    this._isPlayer = isPlayer;
  }

  //TODO is npc, friendly or enemy
  get isEnemy(): boolean {
    return !this._isPlayer;
  }

  get controls(): InputComponent {
    return this._controlsComponent.controls;
  }

  get speed(): number {
    return this._speed.speed;
  }

  get direction(): DirectionType {
    return this._direction.direction;
  }

  set direction(value: DirectionType) {
    this._direction.direction = value;
  }

  get animation(): Animation {
    return this._animation;
  }

  get invulnerable(): Invulnerable {
    return this._invulnerable;
  }

  update(): void {
    this._stateMachine.update();
  }

  hit(direction: DirectionType): void {
    if (this._invulnerable.invulnerable) {
      return;
    }

    this._stateMachine.setState(CHARACTER_STATES.HURT_STATE, direction);
  }
}
