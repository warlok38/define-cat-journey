import { InteractiveObject } from "../../core/baseComponents";
import { InventoryManager } from "../../core/inventory";
import {
  ASSET_KEYS,
  CHEST_FRAME_KEYS,
  CHEST_STATE,
  INTERACTIVE_OBJECT_TYPE,
} from "../../shared/consts";
import { DataManager } from "../../shared/DataManager";
import { TRAP_TYPE } from "../../shared/tiled/common";
import type {
  ChestReward,
  TiledChestObject,
  TrapType,
} from "../../shared/tiled/types";
import type { ChestState, CustomGameObject } from "../../shared/types";
import { getVisualBottomY } from "../../shared/utils";

export class Chest
  extends Phaser.Physics.Arcade.Image
  implements CustomGameObject
{
  #state: ChestState;
  #isBossKeyChest: boolean;
  #id: number;
  #revealTrigger: TrapType;
  #contents: ChestReward;

  constructor(
    scene: Phaser.Scene,
    config: TiledChestObject,
    chestState = CHEST_STATE.HIDDEN
  ) {
    super(scene, config.x, config.y, ASSET_KEYS.CHEST, 0);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0, 1).setImmovable(true);

    this.body?.setSize(16, 8, true).setOffset(1, this.height / 2);

    this.#state = chestState;
    this.#isBossKeyChest = config.requiresBossKey;
    this.#id = config.id;
    this.#revealTrigger = config.revealChestTrigger;
    this.#contents = config.contents;

    this.setDepth(getVisualBottomY(this));

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
        // use area information from data manager
        if (
          !InventoryManager.instance.getAreaInventory(
            DataManager.instance.data.currentArea.name
          ).bossKey
        ) {
          return false;
        }
        return true;
      },
      () => {
        this.open();
      }
    );

    if (this.#revealTrigger === TRAP_TYPE.NONE) {
      if (this.#state === CHEST_STATE.HIDDEN) {
        this.#state = CHEST_STATE.REVEALED;
      }
      return;
    }

    // disable physics body and make game objects inactive/not visible
    this.disableObject();
  }

  get revealTrigger(): TrapType {
    return this.#revealTrigger;
  }

  get id(): number {
    return this.#id;
  }

  get contents(): ChestReward {
    return this.#contents;
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

  disableObject(): void {
    // disable body on game object so we stop triggering the collision
    (this.body as Phaser.Physics.Arcade.Body).enable = false;
    // make not visible until player re-enters room
    this.active = false;
    this.visible = false;
  }

  enableObject(): void {
    if (this.#state === CHEST_STATE.HIDDEN) {
      return;
    }

    // enable body on game object so we trigger the collision
    (this.body as Phaser.Physics.Arcade.Body).enable = true;
    // make visible to the player
    this.active = true;
    this.visible = true;
  }

  reveal(): void {
    if (this.#state !== CHEST_STATE.HIDDEN) {
      return;
    }
    this.#state = CHEST_STATE.REVEALED;
    this.enableObject();
  }
}
