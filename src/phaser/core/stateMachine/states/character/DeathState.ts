import type { CharacterGameObject } from "../../../../gameObjects/common/CharacterGameObject";
import {
  CHARACTER_ANIMATIONS,
  CHARACTER_STATES,
} from "../../../../shared/consts";
import { CUSTOM_EVENTS, EVENT_BUS } from "../../../../shared/eventBus";
import { HeldGameObject, ThrowableObject } from "../../../baseComponents";
import { BaseCharacterState } from "./BaseCharacterState";

export class DeathState extends BaseCharacterState {
  #onDieCallback: () => void;

  constructor(
    gameObject: CharacterGameObject,
    onDieCallback: () => void = () => undefined
  ) {
    super(CHARACTER_STATES.DEATH_STATE, gameObject);
    this.#onDieCallback = onDieCallback;
  }

  public onEnter(): void {
    // reset game object velocity
    this._resetObjectVelocity();

    const heldComponent = HeldGameObject.getComponent<HeldGameObject>(
      this._gameObject
    );
    if (heldComponent !== undefined && heldComponent.object !== undefined) {
      const throwObjectComponent =
        ThrowableObject.getComponent<ThrowableObject>(heldComponent.object);
      if (throwObjectComponent !== undefined) {
        throwObjectComponent.drop();
      }
      heldComponent.drop();
    }

    // make character invulnerable after taking a hit
    this._gameObject.invulnerable.invulnerable = true;

    // disable body on game object so we stop triggering the collision
    (this._gameObject.body as Phaser.Physics.Arcade.Body).enable = false;

    // play animation for character dying
    this._gameObject.animation.playAnimation(
      CHARACTER_ANIMATIONS.DIE_DOWN,
      () => {
        this.#triggerDefeatedEvent();
      }
    );
  }

  #triggerDefeatedEvent(): void {
    this._gameObject.disableObject();

    if (this._gameObject.isEnemy) {
      EVENT_BUS.emit(CUSTOM_EVENTS.ENEMY_DESTROYED);
    } else {
      EVENT_BUS.emit(CUSTOM_EVENTS.HERO_DEFEATED);
    }

    this.#onDieCallback();
  }
}
