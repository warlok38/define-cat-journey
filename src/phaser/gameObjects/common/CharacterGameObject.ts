import {
  Animation,
  ControlsComponent,
  Direction,
  Invulnerable,
  Life,
  Speed,
} from "../../core/baseComponents";
import { InputComponent } from "../../core/input";
import { StateMachine } from "../../core/stateMachine";
import { CHARACTER_STATES } from "../../shared/consts";
import type {
  AnimationConfig,
  CustomGameObject,
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
  maxLife: number;
  currentLife?: number;
};

export abstract class CharacterGameObject
  extends Phaser.Physics.Arcade.Sprite
  implements CustomGameObject
{
  protected _controlsComponent: ControlsComponent;
  protected _stateMachine: StateMachine;
  protected _direction: Direction;
  protected _speed: Speed;
  protected _animation: Animation;
  protected _invulnerable: Invulnerable;
  protected _life: Life;
  protected _isPlayer: boolean;
  protected _isDefeated: boolean;

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
      maxLife,
      currentLife,
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
    this._life = new Life(this, maxLife, currentLife);

    this._stateMachine = new StateMachine(id);

    this._isPlayer = isPlayer;
    this._isDefeated = false;

    if (!this._isPlayer) {
      this.disableObject();
    }
  }

  get isDefeated(): boolean {
    return this._isDefeated;
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

  get stateMachine(): StateMachine {
    return this._stateMachine;
  }

  update(): void {
    this._stateMachine.update();
  }

  hit(direction: DirectionType, damage: number): void {
    if (this._isDefeated) {
      return;
    }

    if (this._invulnerable.invulnerable) {
      return;
    }

    this._life.takeDamage(damage);
    if (this._life.life === 0) {
      this._isDefeated = true;
      this._stateMachine.setState(CHARACTER_STATES.DEATH_STATE, direction);
      return;
    }

    this._stateMachine.setState(CHARACTER_STATES.HURT_STATE, direction);
  }

  disableObject(): void {
    // disable body on game object so we stop triggering the collision
    (this.body as Phaser.Physics.Arcade.Body).enable = false;

    // make not active and not visible until player re-enters room
    this.active = false;
    if (!this._isPlayer) {
      this.visible = false;
    }
  }

  enableObject(): void {
    if (this._isDefeated) {
      return;
    }

    (this.body as Phaser.Physics.Arcade.Body).enable = true;
    this.active = true;
    this.visible = true;
  }
}
