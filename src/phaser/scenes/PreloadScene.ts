import * as Phaser from "phaser";
import { SCENE_KEYS } from "./consts";
import { ASSET_KEYS, ASSET_PACK_KEYS } from "../shared/consts";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({
      key: SCENE_KEYS.PRELOAD_SCENE,
    });
  }

  preload(): void {
    this.load.pack(ASSET_PACK_KEYS.MAIN, "assets/data/assets.json");
  }

  create(): void {
    this.#createAnimations();
    this.scene.start(SCENE_KEYS.GAME_SCENE);
  }

  #createAnimations(): void {
    this.anims.createFromAseprite(ASSET_KEYS.HERO);
    this.anims.createFromAseprite(ASSET_KEYS.SPIDER);
    this.anims.createFromAseprite(ASSET_KEYS.WISP);
  }
}
