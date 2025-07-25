import { InteractiveObject, ThrowableObject } from "../../core/baseComponents";
import { ASSET_KEYS, INTERACTIVE_OBJECT_TYPE } from "../../shared/consts";
import type { CustomGameObject, Position } from "../../shared/types";

type PotConfig = {
  scene: Phaser.Scene;
  position: Position;
};

export class Pot
  extends Phaser.Physics.Arcade.Sprite
  implements CustomGameObject
{
  #position: Position;

  constructor(config: PotConfig) {
    const { scene, position } = config;
    super(scene, position.x, position.y, ASSET_KEYS.POT, 0);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0, 1).setImmovable(true);

    this.#position = { x: position.x, y: position.y };

    new InteractiveObject(this, INTERACTIVE_OBJECT_TYPE.PICKUP);
    new ThrowableObject(this, () => {
      this.break();
    });
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
}
