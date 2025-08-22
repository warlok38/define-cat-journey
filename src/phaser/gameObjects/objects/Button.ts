import * as Phaser from "phaser";
import type { SwitchAction, TiledSwitchObject } from "../../shared/tiled/types";
import type { CustomGameObject } from "../../shared/types";
import { ASSET_KEYS, BUTTON_FRAME_KEYS } from "../../shared/consts";

type ButtonPressedEvent = {
  action: SwitchAction;
  targetIds: number[];
};

export class Button
  extends Phaser.Physics.Arcade.Image
  implements CustomGameObject
{
  #switchTargetIds: number[];
  #switchAction: SwitchAction;

  constructor(scene: Phaser.Scene, config: TiledSwitchObject) {
    const frame = BUTTON_FRAME_KEYS.BUTTON_DEFAULT;
    super(scene, config.x, config.y, ASSET_KEYS.BUTTON, frame);

    // add object to scene and enable phaser physics
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0, 1).setImmovable(true);

    this.#switchTargetIds = config.targetIds;
    this.#switchAction = config.action;

    // disable physics body and make game objects inactive/not visible
    this.disableObject();
  }

  press(): ButtonPressedEvent {
    this.disableObject();

    // return data about button being pressed with metadata tied to action
    return {
      action: this.#switchAction,
      targetIds: this.#switchTargetIds,
    };
  }

  disableObject(): void {
    // disable body on game object so we stop triggering the collision
    (this.body as Phaser.Physics.Arcade.Body).enable = false;
    // make not visible until player re-enters room
    this.active = false;
    this.setFrame(BUTTON_FRAME_KEYS.BUTTON_PRESSED);
    // this.visible = false;
  }

  enableObject(): void {
    (this.body as Phaser.Physics.Arcade.Body).enable = true;
    this.active = true;
    this.setFrame(BUTTON_FRAME_KEYS.BUTTON_DEFAULT);
    // this.visible = true;
  }
}
