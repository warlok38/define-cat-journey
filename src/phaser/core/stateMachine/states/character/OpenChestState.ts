import type { CharacterGameObject } from "../../../../gameObjects/common/CharacterGameObject";
import type { Chest } from "../../../../gameObjects/objects";
import { CHARACTER_STATES } from "../../../../shared/consts";
import { CUSTOM_EVENTS, EVENT_BUS } from "../../../../shared/eventBus";
import { BaseCharacterState } from "./BaseCharacterState";

export class OpenChestState extends BaseCharacterState {
  constructor(gameObject: CharacterGameObject) {
    super(CHARACTER_STATES.OPEN_CHEST_STATE, gameObject);
  }

  onEnter(args: unknown[]): void {
    const chest = args[0] as Chest;

    // make character invulnerable so we can collect the item
    this._gameObject.invulnerable.invulnerable = true;

    this._resetObjectVelocity();

    // play lift animation based on game object direction
    this._gameObject.animation.playAnimation(
      `LIFT_${this._gameObject.direction}`,
      () => {
        // emit event data regarding chest
        EVENT_BUS.emit(CUSTOM_EVENTS.OPENED_CHEST, chest);
        // after showing message to player, transition to idle state
        EVENT_BUS.once(CUSTOM_EVENTS.DIALOG_CLOSED, () => {
          // make character vulnerable so we can take damage
          this._gameObject.invulnerable.invulnerable = false;
          this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
        });
      }
    );
  }
}
