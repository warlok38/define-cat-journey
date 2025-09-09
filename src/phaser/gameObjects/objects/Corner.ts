import { ASSET_KEYS } from "../../shared/consts";
import type { TiledCornerObject } from "../../shared/tiled/types";
import { getVisualBottomY } from "../../shared/utils";

export class Corner extends Phaser.Physics.Arcade.Image {
  constructor(scene: Phaser.Scene, config: TiledCornerObject) {
    super(scene, config.x, config.y, ASSET_KEYS.CORNER_32);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0, 1).setImmovable(true);

    this.setDepth(getVisualBottomY(this));
  }
}
