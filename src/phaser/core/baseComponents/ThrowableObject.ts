import {
  DIRECTIONS,
  THROW_ITEM_DELAY_BEFORE_CALLBACK,
  THROW_ITEM_SPEED,
} from "../../shared/consts";
import type { DirectionType, GameObject } from "../../shared/types";
import {
  exhaustiveGuard,
  isArcadePhysicsBody,
  isCustomGameObject,
} from "../../shared/utils";
import { BaseGameObject } from "./BaseGameObject";

export class ThrowableObject extends BaseGameObject {
  #callback: () => void;

  constructor(gameObject: GameObject, callback = () => undefined) {
    super(gameObject);
    this.#callback = callback;
  }

  drop(): void {
    this.#callback();
  }

  throw(direction: DirectionType): void {
    if (
      !isArcadePhysicsBody(this.gameObject.body) ||
      !isCustomGameObject(this.gameObject)
    ) {
      this.#callback();
      return;
    }

    const body = this.gameObject.body;
    body.velocity.x = 0;
    body.velocity.y = 0;

    const throwSpeed = THROW_ITEM_SPEED;
    switch (direction) {
      case DIRECTIONS.DOWN:
        this.gameObject.y += 20;
        body.velocity.y = throwSpeed;
        break;
      case DIRECTIONS.DOWN_LEFT:
        this.gameObject.y += 20;
        body.velocity.y = throwSpeed;
        body.velocity.x = throwSpeed * -1;
        break;
      case DIRECTIONS.DOWN_RIGHT:
        this.gameObject.y += 20;
        body.velocity.y = throwSpeed;
        body.velocity.x = throwSpeed;
        break;
      case DIRECTIONS.UP:
        body.velocity.y = throwSpeed * -1;
        break;
      case DIRECTIONS.UP_LEFT:
        body.velocity.y = throwSpeed * -1;
        body.velocity.x = throwSpeed * -1;
        break;
      case DIRECTIONS.UP_RIGHT:
        body.velocity.y = throwSpeed * -1;
        body.velocity.x = throwSpeed;
        break;
      case DIRECTIONS.LEFT:
        body.velocity.x = throwSpeed * -1;
        break;
      case DIRECTIONS.RIGHT:
        body.velocity.x = throwSpeed;
        break;
      default:
        exhaustiveGuard(direction);
    }

    this.gameObject.enableObject();
    this.gameObject.scene.time.delayedCall(
      THROW_ITEM_DELAY_BEFORE_CALLBACK,
      () => {
        body.velocity.x = 0;
        body.velocity.y = 0;
        this.#callback();
      }
    );
  }
}
