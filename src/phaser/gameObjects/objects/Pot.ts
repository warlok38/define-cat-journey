import { InteractiveObject, ThrowableObject } from "../../core/baseComponents";
import { ASSET_KEYS, INTERACTIVE_OBJECT_TYPE } from "../../shared/consts";
import type { TiledPotObject } from "../../shared/tiled/types";
import type { CustomGameObject, Position } from "../../shared/types";

export class Pot
  extends Phaser.Physics.Arcade.Sprite
  implements CustomGameObject
{
  #position: Position;

  constructor(scene: Phaser.Scene, config: TiledPotObject) {
    super(scene, config.x, config.y, ASSET_KEYS.POT, 0);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0, 1).setImmovable(true);

    this.#position = { x: config.x, y: config.y };

    new InteractiveObject(this, INTERACTIVE_OBJECT_TYPE.PICKUP);
    new ThrowableObject(this, () => {
      this.break();
    });

    // disable physics body and make game objects inactive/not visible
    this.disableObject();
  }

  disableObject(): void {
    // disable body on game object so we stop triggering the collision
    (this.body as Phaser.Physics.Arcade.Body).enable = false;
    // make not visible until player re-enters room
    this.active = false;
    this.visible = false;
  }

  enableObject(): void {
    // enable body on game object so we trigger the collision
    (this.body as Phaser.Physics.Arcade.Body).enable = true;
    // make visible to the player
    this.active = true;
    this.visible = true;
  }

  break(): void {
    (this.body as Phaser.Physics.Arcade.Body).enable = false;
    this.setTexture(ASSET_KEYS.POT_BREAK, 0).play(ASSET_KEYS.POT_BREAK);
    // once animation is finished, disable object and reset the initial texture
    this.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + ASSET_KEYS.POT_BREAK,
      () => {
        this.setTexture(ASSET_KEYS.POT, 0);
        this.disableObject();
      }
    );
  }

  resetPosition(): void {
    this.scene.time.delayedCall(1, () => {
      this.setPosition(this.#position.x, this.#position.y).setOrigin(0, 1);
      this.enableObject();
    });
  }
}
