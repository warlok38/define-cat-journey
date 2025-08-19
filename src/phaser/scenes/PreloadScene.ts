import * as Phaser from "phaser";
import { SCENE_KEYS } from "./consts";
import {
  ASSET_KEYS,
  ASSET_PACK_KEYS,
  LEVEL_NAME,
  ROOM_CODES,
} from "../shared/consts";
import type { LevelData } from "../shared/types";

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

    //TODO finish sceneData
    const sceneData: LevelData = {
      level: LEVEL_NAME.HOUSE_1,
      roomCode: ROOM_CODES.ENTRANCE,
      doorId: 3,
    };
    this.scene.start(SCENE_KEYS.GAME_SCENE, sceneData);
  }

  #createAnimations(): void {
    this.anims.createFromAseprite(ASSET_KEYS.HERO);
    this.anims.createFromAseprite(ASSET_KEYS.SPIDER);
    this.anims.createFromAseprite(ASSET_KEYS.WISP);
    this.anims.create({
      key: ASSET_KEYS.ENEMY_DEATH,
      frames: this.anims.generateFrameNumbers(ASSET_KEYS.ENEMY_DEATH),
      frameRate: 6,
      repeat: 0,
      delay: 0,
    });
    this.anims.create({
      key: ASSET_KEYS.POT_BREAK,
      frames: this.anims.generateFrameNumbers(ASSET_KEYS.POT_BREAK),
      frameRate: 6,
      repeat: 0,
      delay: 0,
      hideOnComplete: true,
    });
  }
}
