import type { CharacterGameObject } from "../../../../gameObjects/common/CharacterGameObject";
import { CHARACTER_STATES, DIRECTIONS } from "../../../../shared/consts";
import { exhaustiveGuard } from "../../../../shared/utils";
import { Weapon } from "../../../baseComponents";
import { BaseCharacterState } from "./BaseCharacterState";

export class AttackState extends BaseCharacterState {
  constructor(gameObject: CharacterGameObject) {
    super(CHARACTER_STATES.ATTACK_STATE, gameObject);
  }

  onEnter(): void {
    // reset game object velocity
    this._resetObjectVelocity();

    const weaponComponent = Weapon.getComponent<Weapon>(this._gameObject);
    if (weaponComponent === undefined || weaponComponent.weapon === undefined) {
      this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
      return;
    }

    const weapon = weaponComponent.weapon;
    switch (this._gameObject.direction) {
      case DIRECTIONS.DOWN:
        return weapon.attackDown();
      case DIRECTIONS.DOWN_LEFT:
        return weapon.attackDownLeft();
      case DIRECTIONS.DOWN_RIGHT:
        return weapon.attackDownRight();
      case DIRECTIONS.UP:
        return weapon.attackUp();
      case DIRECTIONS.UP_LEFT:
        return weapon.attackUpLeft();
      case DIRECTIONS.UP_RIGHT:
        return weapon.attackUpRight();
      case DIRECTIONS.LEFT:
        return weapon.attackLeft();
      case DIRECTIONS.RIGHT:
        return weapon.attackRight();
      default:
        exhaustiveGuard(this._gameObject.direction);
    }
  }

  onUpdate(): void {
    const weaponComponent = Weapon.getComponent<Weapon>(this._gameObject);
    if (weaponComponent === undefined || weaponComponent.weapon === undefined) {
      this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
      return;
    }
    // wait until weapon animation is done for attacking
    const weapon = weaponComponent.weapon;
    if (weapon.isAttacking) {
      return;
    }
    this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
  }
}
