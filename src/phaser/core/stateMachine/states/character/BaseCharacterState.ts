import type { CharacterGameObject } from "../../../../gameObjects/common/CharacterGameObject";
import type { State, StateMachine } from "../../StateMachine";

export abstract class BaseCharacterState implements State {
  protected _gameObject: CharacterGameObject;
  protected _stateMachine!: StateMachine;
  #name: string;

  constructor(name: string, gameObject: CharacterGameObject) {
    this._gameObject = gameObject;
    this.#name = name;
  }

  get name(): string {
    return this.#name;
  }

  set stateMachine(stateMachine: StateMachine) {
    this._stateMachine = stateMachine;
  }
}
