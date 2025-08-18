import type { CharacterGameObject } from "../../../../gameObjects/common/CharacterGameObject";
import {
  CHARACTER_STATES,
  ENABLE_DEBUGGING,
  LIFT_ITEM_ANIMATION_DELAY,
  LIFT_ITEM_ANIMATION_DURATION,
} from "../../../../shared/consts";
import type { GameObject } from "../../../../shared/types";
import { isArcadePhysicsBody } from "../../../../shared/utils";
import { HeldGameObject } from "../../../baseComponents";
import { BaseCharacterState } from "./BaseCharacterState";

export class LiftState extends BaseCharacterState {
  constructor(gameObject: CharacterGameObject) {
    super(CHARACTER_STATES.LIFT_STATE, gameObject);
  }

  onEnter(args: unknown[]): void {
    const gameObjectBeingPickedUp = args[0] as GameObject;

    this._resetObjectVelocity();

    const heldComponent = HeldGameObject.getComponent<HeldGameObject>(
      this._gameObject
    );
    if (heldComponent === undefined) {
      this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
      return;
    }

    // play lift animation and then transition to hold item state
    this._gameObject.animation.playAnimation(
      `LIFT_${this._gameObject.direction}`
    );

    // store a reference to the lifted up game object
    heldComponent.object = gameObjectBeingPickedUp;

    // disable body on the lifted up game object
    if (isArcadePhysicsBody(gameObjectBeingPickedUp.body)) {
      gameObjectBeingPickedUp.body.enable = false;
    }

    // have character carry the object
    gameObjectBeingPickedUp.setDepth(2).setOrigin(0.5, 0.5);

    // create curved path for ball to follow
    const startPoint = new Phaser.Math.Vector2(
      gameObjectBeingPickedUp.x + 8,
      gameObjectBeingPickedUp.y - 8
    );
    const controlPoint1 = new Phaser.Math.Vector2(
      gameObjectBeingPickedUp.x + 8,
      gameObjectBeingPickedUp.y - 24
    );
    const controlPoint2 = new Phaser.Math.Vector2(
      gameObjectBeingPickedUp.x + 8,
      gameObjectBeingPickedUp.y - 24
    );
    const endPoint = new Phaser.Math.Vector2(
      this._gameObject.x,
      this._gameObject.y - 8
    );
    const curve = new Phaser.Curves.CubicBezier(
      startPoint,
      controlPoint1,
      controlPoint2,
      endPoint
    );
    const curvePath = new Phaser.Curves.Path(startPoint.x, startPoint.y).add(
      curve
    );

    // draw curve (for debugging)
    let g: Phaser.GameObjects.Graphics | undefined;
    if (ENABLE_DEBUGGING) {
      g = this._gameObject.scene.add.graphics();
      g.clear();
      g.lineStyle(4, 0x00ff00, 1);
      curvePath.draw(g);
    }
    gameObjectBeingPickedUp.setAlpha(0);

    const follower = this._gameObject.scene.add
      .follower(
        curvePath,
        startPoint.x,
        startPoint.y,
        gameObjectBeingPickedUp.texture
      )
      .setAlpha(1);

    follower.startFollow({
      delay: LIFT_ITEM_ANIMATION_DELAY,
      duration: LIFT_ITEM_ANIMATION_DURATION,
      onComplete: () => {
        follower.destroy();
        if (g !== undefined) {
          g.destroy();
        }
        gameObjectBeingPickedUp.setPosition(follower.x, follower.y).setAlpha(1);
      },
    });
  }

  onUpdate(): void {
    if (this._gameObject.animation.isAnimationPlaying()) {
      return;
    }

    this._stateMachine.setState(CHARACTER_STATES.IDLE_HOLDING_STATE);
  }
}
