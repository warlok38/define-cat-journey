import type { CharacterGameObject } from "../../../../gameObjects/common/CharacterGameObject";
import type { Chest } from "../../../../gameObjects/objects";
import { CHARACTER_STATES } from "../../../../shared/consts";
import { CUSTOM_EVENTS, EVENT_BUS } from "../../../../shared/eventBus";
import { isArcadePhysicsBody } from "../../../../shared/utils";
import { BaseCharacterState } from "./BaseCharacterState";

export class OpenChestState extends BaseCharacterState {
  constructor(gameObject: CharacterGameObject) {
    super(CHARACTER_STATES.OPEN_CHEST_STATE, gameObject);
  }

  onEnter(args: unknown[]): void {
    const chest = args[0] as Chest;

    if (isArcadePhysicsBody(this._gameObject.body)) {
      this._gameObject.body.velocity.x = 0;
      this._gameObject.body.velocity.y = 0;
    }

    this._gameObject.animation.playAnimation(
      `LIFT_${this._gameObject.direction}`,
      () => {
        EVENT_BUS.emit(CUSTOM_EVENTS.OPENED_CHEST, chest);
        this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
      }
    );
  }
}
