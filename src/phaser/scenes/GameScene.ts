import { KeyboardComponent } from "../core/input";
import { Hero } from "../gameObjects";
import { ASSET_KEYS } from "../shared/consts";
import { SCENE_KEYS } from "./consts";

export class GameScene extends Phaser.Scene {
  #controls!: KeyboardComponent;
  #hero!: Hero;

  constructor() {
    super({ key: SCENE_KEYS.GAME_SCENE });
  }

  create(): void {
    if (!this.input.keyboard) {
      console.warn("Phaser keyboard plugin is not setup properly.");
      return;
    }
    this.#controls = new KeyboardComponent(this.input.keyboard);

    this.#hero = new Hero({
      scene: this,
      position: { x: this.scale.width / 2, y: this.scale.height / 2 },
      assetKey: ASSET_KEYS.HERO,
      frame: 0,
      controls: this.#controls,
    });
  }
}
