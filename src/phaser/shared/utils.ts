import { DIRECTIONS, LEVEL_NAME } from "./consts";
import type {
  CustomGameObject,
  DirectionType,
  GameObject,
  LevelName,
  Position,
} from "./types";

export function exhaustiveGuard(_value: never): never {
  throw new Error(
    `Error! Reached forbidden guard function with unexpected value: ${JSON.stringify(
      _value
    )}`
  );
}

export function isArcadePhysicsBody(
  body:
    | Phaser.Physics.Arcade.Body
    | Phaser.Physics.Arcade.StaticBody
    | MatterJS.BodyType
    | null
): body is Phaser.Physics.Arcade.Body {
  if (body === undefined || body === null) {
    return false;
  }
  return body instanceof Phaser.Physics.Arcade.Body;
}

export function isDirection(direction: string): direction is DirectionType {
  return direction in DIRECTIONS;
}

/**
 * Creates a flash animation effect by using the built in Phaser 3 Timer Events. The provided game object
 * will be the target of the effect that is created.
 * @param {Phaser.GameObjects.Image | Phaser.GameObjects.Sprite} target The target game object that the effect will be applied to.
 * @param {() => void} [callback] The callback that will be invoked when the tween is finished
 * @returns {void}
 */
export function flash(
  target: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite,
  callback?: () => void
): void {
  const timeEvent = target.scene.time.addEvent({
    delay: 250,
    callback: () => {
      target.setTintFill(0xffffff);
      target.setAlpha(0.7);

      target.scene.time.addEvent({
        delay: 150,
        callback: () => {
          target.setTint(0xffffff);
          target.setAlpha(1);
          if (timeEvent.getOverallProgress() === 1 && callback) {
            callback();
          }
        },
      });
    },
    startAt: 150,
    repeat: 3,
  });
}

export function isCustomGameObject(
  gameObject: GameObject
): gameObject is GameObject & CustomGameObject {
  return (
    //@ts-expect-error Element implicitly has an 'any'
    gameObject["disableObject"] !== undefined &&
    //@ts-expect-error Element implicitly has an 'any'
    gameObject["enableObject"] !== undefined
  );
}

export function getDirectionOfObjectFromAnotherObject(
  object: Position,
  targetObject: Position
): DirectionType {
  if (object.y < targetObject.y) {
    return DIRECTIONS.DOWN;
  }
  if (object.y > targetObject.y) {
    return DIRECTIONS.UP;
  }
  if (object.x < targetObject.x) {
    return DIRECTIONS.RIGHT;
  }
  return DIRECTIONS.LEFT;
}

export function isLevelName(levelName: string): levelName is LevelName {
  return levelName in LEVEL_NAME;
}
