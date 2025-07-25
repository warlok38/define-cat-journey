import { InteractiveObject } from "../../core/baseComponents";
import {
  ASSET_KEYS,
  CHEST_FRAME_KEYS,
  CHEST_STATE,
  INTERACTIVE_OBJECT_TYPE,
} from "../../shared/consts";
import type { ChestState, Position } from "../../shared/types";

type ChestConfig = {
  scene: Phaser.Scene;
  position: Position;
  requiresBossKey: boolean;
  chestState?: ChestState;
};

export class Chest extends Phaser.Physics.Arcade.Image {
  #state: ChestState;
  #isBossKeyChest: boolean;

  constructor(config: ChestConfig) {
    const { scene, position } = config;
    super(scene, position.x, position.y, ASSET_KEYS.CHEST, 0);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0, 1).setImmovable(true);

    this.#state = config.chestState || CHEST_STATE.HIDDEN;
    this.#isBossKeyChest = config.requiresBossKey;

    if (this.#isBossKeyChest) {
      (this.body as Phaser.Physics.Arcade.Body).setSize(32, 24).setOffset(0, 8);
    }

    new InteractiveObject(
      this,
      INTERACTIVE_OBJECT_TYPE.OPEN,
      () => {
        if (!this.#isBossKeyChest) {
          return true;
        }

        return false;
      },
      () => {
        this.open();
      }
    );
  }

  open(): void {
    if (this.#state !== CHEST_STATE.REVEALED) {
      return;
    }

    this.#state = CHEST_STATE.OPEN;
    const frameKey = this.#isBossKeyChest
      ? CHEST_FRAME_KEYS.BIG_CHEST_OPEN
      : CHEST_FRAME_KEYS.SMALL_CHEST_OPEN;
    this.setFrame(frameKey);

    // after we open the chest, we can no longer interact with it
    InteractiveObject.removeComponent(this);
  }
}
