import { KeyboardComponent } from "../core/input";
import { Hero } from "../gameObjects";
import type { CharacterGameObject } from "../gameObjects/common/CharacterGameObject";
import { Spider, Wisp } from "../gameObjects/NPCs/enemies";
import { DIRECTIONS } from "../shared/consts";
import { SCENE_KEYS } from "./consts";

export class GameScene extends Phaser.Scene {
  #controls!: KeyboardComponent;
  #hero!: Hero;
  #enemyGroup!: Phaser.GameObjects.Group;

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
      controls: this.#controls,
    });

    this.#enemyGroup = this.add.group(
      [
        new Spider({
          scene: this,
          position: { x: this.scale.width / 2, y: this.scale.height / 2 + 50 },
        }),
        new Wisp({
          scene: this,
          position: { x: this.scale.width / 2, y: this.scale.height / 2 - 50 },
        }),
      ],
      { runChildUpdate: true }
    );

    this.#registerColliders();
  }

  #registerColliders(): void {
    this.#enemyGroup.getChildren().forEach((enemy) => {
      const enemyGameObject = enemy as CharacterGameObject;
      enemyGameObject.setCollideWorldBounds(true);
    });

    this.physics.add.overlap(this.#hero, this.#enemyGroup, (hero, enemy) => {
      this.#hero.hit(DIRECTIONS.DOWN);
      const enemyGameObject = enemy as CharacterGameObject;
      enemyGameObject.hit(this.#hero.direction);
    });
  }
}
