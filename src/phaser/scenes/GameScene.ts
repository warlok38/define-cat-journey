import { KeyboardComponent } from "../core/input";
import { Hero } from "../gameObjects";
import type { CharacterGameObject } from "../gameObjects/common/CharacterGameObject";
import { Spider, Wisp } from "../gameObjects/NPCs/enemies";
import { Chest, Pot } from "../gameObjects/objects";
import { DIRECTIONS, HERO_START_MAX_HEALTH } from "../shared/consts";
import { CUSTOM_EVENTS, EVENT_BUS } from "../shared/eventBus";
import type { GameObject } from "../shared/types";
import { SCENE_KEYS } from "./consts";

export class GameScene extends Phaser.Scene {
  #controls!: KeyboardComponent;
  #hero!: Hero;
  #enemyGroup!: Phaser.GameObjects.Group;
  #blockingGroup!: Phaser.GameObjects.Group;

  constructor() {
    super({ key: SCENE_KEYS.GAME_SCENE });
  }

  create(): void {
    if (!this.input.keyboard) {
      console.warn("Phaser keyboard plugin is not setup properly.");
      return;
    }
    this.#controls = new KeyboardComponent(this.input.keyboard);

    this.#enemyGroup = this.add.group(
      [
        // new Spider({
        //   scene: this,
        //   position: { x: this.scale.width / 2, y: this.scale.height / 2 + 50 },
        // }),
        // new Wisp({
        //   scene: this,
        //   position: { x: this.scale.width / 2, y: this.scale.height / 2 - 50 },
        // }),
      ],
      { runChildUpdate: true }
    );

    this.#blockingGroup = this.add.group([
      new Pot({
        scene: this,
        position: { x: this.scale.width / 2 + 90, y: this.scale.height / 2 },
      }),

      new Chest({
        scene: this,
        position: { x: this.scale.width / 2 - 90, y: this.scale.height / 2 },
        requiresBossKey: false,
      }),
    ]);

    this.#hero = new Hero({
      scene: this,
      position: { x: this.scale.width / 2, y: this.scale.height / 2 },
      controls: this.#controls,
      maxLife: HERO_START_MAX_HEALTH,
      currentLife: HERO_START_MAX_HEALTH,
    });

    this.#registerColliders();
    this.#registerCustomEvents();
  }

  #registerColliders(): void {
    this.#enemyGroup.getChildren().forEach((enemy) => {
      const enemyGameObject = enemy as CharacterGameObject;
      enemyGameObject.setCollideWorldBounds(true);
    });

    this.physics.add.overlap(this.#hero, this.#enemyGroup, (hero, enemy) => {
      this.#hero.hit(DIRECTIONS.DOWN, 1);
      const enemyGameObject = enemy as CharacterGameObject;
      enemyGameObject.hit(this.#hero.direction, 1);
    });

    this.physics.add.collider(
      this.#hero,
      this.#blockingGroup,
      (hero, gameObject) => {
        this.#hero.collidedWithGameObject(gameObject as GameObject);
      }
    );

    this.physics.add.collider(
      this.#enemyGroup,
      this.#blockingGroup,
      (enemy, gameObject) => {
        //
      }
    );
  }

  #registerCustomEvents(): void {
    EVENT_BUS.on(CUSTOM_EVENTS.OPENED_CHEST, this.#handleOpenChest, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EVENT_BUS.off(CUSTOM_EVENTS.OPENED_CHEST, this.#handleOpenChest, this);
    });
  }

  #handleOpenChest(chest: Chest): void {
    console.log("chest opened");
  }
}
