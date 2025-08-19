import { KeyboardComponent } from "../core/input";
import { Hero } from "../gameObjects";
import { CharacterGameObject } from "../gameObjects/common/CharacterGameObject";
import { Spider, Wisp } from "../gameObjects/NPCs/enemies";
import { Chest, Door, Pot } from "../gameObjects/objects";
import {
  ASSET_KEYS,
  DIRECTIONS,
  ENABLE_DEBUGGING,
  HERO_START_MAX_HEALTH,
  ROOM_TRANSITION_CAMERA_ANIMATION_DELAY,
  ROOM_TRANSITION_CAMERA_ANIMATION_DURATION,
  ROOM_TRANSITION_PLAYER_INTO_HALL_DELAY,
  ROOM_TRANSITION_PLAYER_INTO_HALL_DURATION,
  ROOM_TRANSITION_PLAYER_INTO_NEXT_ROOM_DELAY,
  ROOM_TRANSITION_PLAYER_INTO_NEXT_ROOM_DURATION,
} from "../shared/consts";
import { CUSTOM_EVENTS, EVENT_BUS } from "../shared/eventBus";
import { TILED_LAYER_NAMES, TILED_TILESET_NAMES } from "../shared/tiled/common";
import {
  getAllLayerNamesWithPrefix,
  getTiledChestObjectsFromMap,
  getTiledDoorObjectsFromMap,
  getTiledEnemyObjectsFromMap,
  getTiledPotObjectsFromMap,
  getTiledRoomObjectsFromMap,
  getTiledSwitchObjectsFromMap,
} from "../shared/tiled/tiled-utils";
import type { TiledRoomObject } from "../shared/tiled/types";
import type { GameObject, LevelData, RoomCodes } from "../shared/types";
import {
  exhaustiveGuard,
  getDirectionOfObjectFromAnotherObject,
  isArcadePhysicsBody,
  isLevelName,
} from "../shared/utils";
import { SCENE_KEYS } from "./consts";

export class GameScene extends Phaser.Scene {
  #levelData!: LevelData;
  #controls!: KeyboardComponent;
  #hero!: Hero;
  #enemyGroup!: Phaser.GameObjects.Group;
  #blockingGroup!: Phaser.GameObjects.Group;
  #potGameObjects!: Pot[];
  #objectsByRoomCode!: {
    [key in RoomCodes]: {
      chestMap: { [key: number]: Chest };
      doorMap: { [key: number]: Door };
      doors: Door[];
      switches: unknown[];
      pots: Pot[];
      chests: Chest[];
      enemyGroup?: Phaser.GameObjects.Group;
      room: TiledRoomObject;
    };
  };
  #collisionLayer!: Phaser.Tilemaps.TilemapLayer;
  #enemyCollisionLayer!: Phaser.Tilemaps.TilemapLayer;
  #doorTransitionGroup!: Phaser.GameObjects.Group;
  #currentRoomCode!: RoomCodes;

  constructor() {
    super({ key: SCENE_KEYS.GAME_SCENE });
  }

  init(data: LevelData): void {
    this.#levelData = data;
    this.#currentRoomCode = data.roomCode;
  }

  create(): void {
    if (!this.input.keyboard) {
      console.warn("Phaser keyboard plugin is not setup properly.");
      return;
    }
    this.#controls = new KeyboardComponent(this.input.keyboard);

    this.#createLevel();
    if (!this.#collisionLayer || !this.#enemyCollisionLayer) {
      console.warn("Missing required collision layers for game.");
      return;
    }
    this.#setupHero();
    this.#setupCamera();

    this.#tempCode();

    this.#registerColliders();
    this.#registerCustomEvents();
  }

  #registerColliders(): void {
    this.#enemyGroup.getChildren().forEach((enemy) => {
      const enemyGameObject = enemy as CharacterGameObject;
      // enemyGameObject.setCollideWorldBounds(true);
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

    this.physics.add.overlap(
      this.#hero,
      this.#doorTransitionGroup,
      (playerObj, doorObj) => {
        this.#handleRoomTransition(
          doorObj as Phaser.Types.Physics.Arcade.GameObjectWithBody
        );
      }
    );

    // register collisions between enemies and blocking game objects (doors, pots, chests, etc.)
    this.physics.add.collider(
      this.#enemyGroup,
      this.#blockingGroup,
      (enemy, gameObject) => {
        // handle when pot objects are thrown at enemies
        if (
          gameObject instanceof Pot &&
          isArcadePhysicsBody(gameObject.body) &&
          (gameObject.body.velocity.x !== 0 || gameObject.body.velocity.y !== 0)
        ) {
          const enemyGameObject = enemy as CharacterGameObject;
          if (enemyGameObject instanceof CharacterGameObject) {
            enemyGameObject.hit(this.#hero.direction, 1);
            gameObject.break();
          }
        }
      },
      // handle when objects are thrown on wisps, ignore collisions and let object move through
      (enemy, gameObject) => {
        const body = (gameObject as unknown as GameObject).body;
        if (
          enemy instanceof Wisp &&
          isArcadePhysicsBody(body) &&
          (body.velocity.x !== 0 || body.velocity.y !== 0)
        ) {
          return false;
        }
        return true;
      }
    );

    if (this.#potGameObjects.length > 0) {
      this.physics.add.collider(
        this.#potGameObjects,
        this.#blockingGroup,
        (pot) => {
          if (!(pot instanceof Pot)) {
            return;
          }
          pot.break();
        }
      );
    }

    this.#collisionLayer.setCollision([
      this.#collisionLayer.tileset[0].firstgid,
    ]);
    this.physics.add.collider(this.#hero, this.#collisionLayer);

    this.#enemyCollisionLayer.setCollision([
      this.#enemyCollisionLayer.tileset[0].firstgid,
    ]);
    this.physics.add.collider(this.#enemyGroup, this.#enemyCollisionLayer);
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

  #createLevel(): void {
    this.add
      .image(0, 0, ASSET_KEYS[`${this.#levelData.level}_BACKGROUND`], 0)
      .setOrigin(0);
    this.add
      .image(0, 0, ASSET_KEYS[`${this.#levelData.level}_FOREGROUND`], 0)
      .setOrigin(0)
      .setDepth(2);

    const map = this.make.tilemap({
      key: ASSET_KEYS[`${this.#levelData.level}_LEVEL`],
    });

    const collisionTiles = map.addTilesetImage(
      TILED_TILESET_NAMES.COLLISION,
      ASSET_KEYS.COLLISION
    );
    if (collisionTiles === null) {
      console.warn(
        `encountered error while creating collision tiles from tiled`
      );
      return;
    }

    const collisionLayer = map.createLayer(
      TILED_LAYER_NAMES.COLLISION,
      [collisionTiles],
      0,
      0
    );
    if (collisionLayer === null) {
      console.warn(
        `encountered error while creating collision layer using data from tiled`
      );
      return;
    }

    this.#collisionLayer = collisionLayer;
    this.#collisionLayer.setDepth(2).setAlpha(ENABLE_DEBUGGING ? 0.5 : 0);

    const enemyCollisionLayer = map.createLayer(
      TILED_LAYER_NAMES.ENEMY_COLLISION,
      [collisionTiles],
      0,
      0
    );
    if (enemyCollisionLayer === null) {
      console.warn(
        `encountered error while creating enemy collision layer using data from tiled. EnemyCollisionLayer convert to -> CollisionLayer`
      );
      this.#enemyCollisionLayer = collisionLayer;
    } else {
      this.#enemyCollisionLayer = enemyCollisionLayer;
    }

    this.#enemyCollisionLayer.setDepth(2).setAlpha(ENABLE_DEBUGGING ? 0.5 : 0);

    //initialize objects
    this.#objectsByRoomCode = {};
    this.#doorTransitionGroup = this.add.group([]);

    this.#createRooms(map, TILED_LAYER_NAMES.ROOMS);

    const rooms = getAllLayerNamesWithPrefix(map, TILED_LAYER_NAMES.ROOMS).map(
      (layerName: string) => {
        return {
          name: layerName,
          roomCode: layerName.split("/")[1].toUpperCase() as RoomCodes,
        };
      }
    );

    const switchLayerNames = rooms.filter((layer) =>
      layer.name.endsWith(`/${TILED_LAYER_NAMES.SWITCHES}`)
    );
    const potLayerNames = rooms.filter((layer) =>
      layer.name.endsWith(`/${TILED_LAYER_NAMES.POTS}`)
    );
    const doorLayerNames = rooms.filter((layer) =>
      layer.name.endsWith(`/${TILED_LAYER_NAMES.DOORS}`)
    );
    const chestLayerNames = rooms.filter((layer) =>
      layer.name.endsWith(`/${TILED_LAYER_NAMES.CHESTS}`)
    );
    const enemyLayerNames = rooms.filter((layer) =>
      layer.name.endsWith(`/${TILED_LAYER_NAMES.ENEMIES}`)
    );

    switchLayerNames.forEach((layer) =>
      this.#createButtons(map, layer.name, layer.roomCode)
    );
    potLayerNames.forEach((layer) =>
      this.#createPots(map, layer.name, layer.roomCode)
    );
    doorLayerNames.forEach((layer) =>
      this.#createDoors(map, layer.name, layer.roomCode)
    );
    chestLayerNames.forEach((layer) =>
      this.#createChests(map, layer.name, layer.roomCode)
    );
    enemyLayerNames.forEach((layer) =>
      this.#createEnemies(map, layer.name, layer.roomCode)
    );
  }

  #setupCamera(): void {
    const roomSize = this.#objectsByRoomCode[this.#levelData.roomCode].room;
    this.cameras.main.setBounds(
      roomSize.x,
      roomSize.y - roomSize.height,
      roomSize.width,
      roomSize.height
    );
    this.cameras.main.startFollow(this.#hero);
  }

  #setupHero(): void {
    const startingDoor =
      this.#objectsByRoomCode[this.#levelData.roomCode].doorMap[
        this.#levelData.doorId
      ];
    const playerStartPosition = {
      x: startingDoor.x + startingDoor.doorTransitionZone.width / 2,
      y: startingDoor.y - startingDoor.doorTransitionZone.height / 2,
    };

    switch (startingDoor.direction) {
      case DIRECTIONS.DOWN:
        playerStartPosition.y -= 40;
        break;
      case DIRECTIONS.DOWN_LEFT:
        playerStartPosition.y -= 40;
        playerStartPosition.x += 40;
        break;
      case DIRECTIONS.DOWN_RIGHT:
        playerStartPosition.y -= 40;
        playerStartPosition.x -= 40;
        break;
      case DIRECTIONS.UP:
        playerStartPosition.y += 40;
        break;
      case DIRECTIONS.UP_LEFT:
        playerStartPosition.y += 40;
        playerStartPosition.x += 40;
        break;
      case DIRECTIONS.UP_RIGHT:
        playerStartPosition.y += 40;
        playerStartPosition.x -= 40;
        break;
      case DIRECTIONS.LEFT:
        playerStartPosition.x += 40;
        break;
      case DIRECTIONS.RIGHT:
        playerStartPosition.x -= 40;
        break;
      default:
        exhaustiveGuard(startingDoor.direction);
    }

    this.#hero = new Hero({
      scene: this,
      position: { x: playerStartPosition.x, y: playerStartPosition.y },
      controls: this.#controls,
      maxLife: HERO_START_MAX_HEALTH,
      currentLife: HERO_START_MAX_HEALTH,
    });
  }

  #tempCode(): void {
    this.#enemyGroup = this.add.group(
      [
        new Spider({
          scene: this,
          position: { x: 800, y: 550 },
        }),
        new Wisp({
          scene: this,
          position: { x: 800, y: 500 },
        }),
      ],
      { runChildUpdate: true }
    );

    this.#potGameObjects = [];
    const pot = new Pot({
      scene: this,
      position: { x: this.scale.width / 2 + 90, y: this.scale.height / 2 },
    });
    this.#potGameObjects.push(pot);

    this.#blockingGroup = this.add.group([
      pot,
      new Chest({
        scene: this,
        position: { x: this.scale.width / 2 - 90, y: this.scale.height / 2 },
        requiresBossKey: false,
      }),
    ]);
  }

  /**
   * Parses the Tiled Map data and creates the 'Room' game objects
   * from the rooms layer in Tiled. The `Room` object is how we group
   * the various game objects in our game.
   */
  #createRooms(map: Phaser.Tilemaps.Tilemap, layerName: string): void {
    const validTiledObjects = getTiledRoomObjectsFromMap(map, layerName);
    validTiledObjects.forEach((tiledObject) => {
      this.#objectsByRoomCode[tiledObject.code] = {
        switches: [],
        pots: [],
        doors: [],
        chests: [],
        room: tiledObject,
        chestMap: {},
        doorMap: {},
      };
    });
  }

  #createDoors(
    map: Phaser.Tilemaps.Tilemap,
    layerName: string,
    roomCode: RoomCodes
  ): void {
    const validTiledObjects = getTiledDoorObjectsFromMap(map, layerName);
    validTiledObjects.forEach((tileObject) => {
      const door = new Door(this, tileObject, roomCode);
      this.#objectsByRoomCode[roomCode].doors.push(door);
      this.#objectsByRoomCode[roomCode].doorMap[tileObject.id] = door;
      this.#doorTransitionGroup.add(door.doorTransitionZone);
    });
  }

  #createButtons(
    map: Phaser.Tilemaps.Tilemap,
    layerName: string,
    roomCode: RoomCodes
  ): void {
    const validTiledObjects = getTiledSwitchObjectsFromMap(map, layerName);
  }

  #createPots(
    map: Phaser.Tilemaps.Tilemap,
    layerName: string,
    roomCode: RoomCodes
  ): void {
    const validTiledObjects = getTiledPotObjectsFromMap(map, layerName);
  }

  #createChests(
    map: Phaser.Tilemaps.Tilemap,
    layerName: string,
    roomCode: RoomCodes
  ): void {
    const validTiledObjects = getTiledChestObjectsFromMap(map, layerName);
  }

  #createEnemies(
    map: Phaser.Tilemaps.Tilemap,
    layerName: string,
    roomCode: RoomCodes
  ): void {
    const validTiledObjects = getTiledEnemyObjectsFromMap(map, layerName);
  }

  #handleRoomTransition(
    doorTrigger: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ): void {
    this.#controls.isMovementLocked = true;

    const door = this.#objectsByRoomCode[this.#currentRoomCode].doorMap[
      Number(doorTrigger.name)
    ] as Door;

    if (isLevelName(door.targetLevel)) {
      const sceneData: LevelData = {
        level: door.targetLevel,
        roomCode: door.targetRoomCode,
        doorId: door.targetDoorId,
      };
      this.scene.start(SCENE_KEYS.GAME_SCENE, sceneData);
      return;
    }

    const targetDoor =
      this.#objectsByRoomCode[door.targetRoomCode].doorMap[door.targetDoorId];

    door.disableObject();
    targetDoor.disableObject();

    const targetDirection = getDirectionOfObjectFromAnotherObject(
      door,
      targetDoor
    );
    const doorDistance = {
      x: Math.abs(
        (door.doorTransitionZone.x - targetDoor.doorTransitionZone.x) / 2
      ),
      y: Math.abs(
        (door.doorTransitionZone.y - targetDoor.doorTransitionZone.y) / 2
      ),
    };
    if (targetDirection === DIRECTIONS.UP) {
      doorDistance.y *= -1;
    }
    if (targetDirection === DIRECTIONS.LEFT) {
      doorDistance.x *= -1;
    }

    // animate player into hallway
    const playerTargetPosition = {
      x: door.x + door.doorTransitionZone.width / 2 + doorDistance.x,
      y: door.y - door.doorTransitionZone.height / 2 + doorDistance.y,
    };
    this.tweens.add({
      targets: this.#hero,
      y: playerTargetPosition.y,
      x: playerTargetPosition.x,
      duration: ROOM_TRANSITION_PLAYER_INTO_HALL_DURATION,
      delay: ROOM_TRANSITION_PLAYER_INTO_HALL_DELAY,
    });

    // animate camera to the next room based on the door positions
    const roomSize = this.#objectsByRoomCode[targetDoor.roomCode].room;
    // reset camera bounds so we have a smooth transition
    this.cameras.main.setBounds(
      this.cameras.main.worldView.x,
      this.cameras.main.worldView.y,
      this.cameras.main.worldView.width,
      this.cameras.main.worldView.height
    );

    this.cameras.main.stopFollow();

    const bounds = this.cameras.main.getBounds();
    this.tweens.add({
      targets: bounds,
      x: roomSize.x,
      y: roomSize.y - roomSize.height,
      duration: ROOM_TRANSITION_CAMERA_ANIMATION_DURATION,
      delay: ROOM_TRANSITION_CAMERA_ANIMATION_DELAY,
      onUpdate: () => {
        this.cameras.main.setBounds(
          bounds.x,
          bounds.y,
          roomSize.width,
          roomSize.height
        );
      },
    });

    // animate player into room
    const playerDistanceToMoveIntoRoom = {
      x: doorDistance.x * 2,
      y: doorDistance.y * 2,
    };

    if (
      targetDirection === DIRECTIONS.UP ||
      targetDirection === DIRECTIONS.DOWN
    ) {
      playerDistanceToMoveIntoRoom.y = Math.max(
        Math.abs(playerDistanceToMoveIntoRoom.y),
        32
      );
      if (targetDirection === DIRECTIONS.UP) {
        playerDistanceToMoveIntoRoom.y *= -1;
      }
    } else {
      playerDistanceToMoveIntoRoom.x = Math.max(
        Math.abs(playerDistanceToMoveIntoRoom.x),
        32
      );
      if (targetDirection === DIRECTIONS.LEFT) {
        playerDistanceToMoveIntoRoom.x *= -1;
      }
    }

    this.tweens.add({
      targets: this.#hero,
      y: playerTargetPosition.y + playerDistanceToMoveIntoRoom.y,
      x: playerTargetPosition.x + playerDistanceToMoveIntoRoom.x,
      duration: ROOM_TRANSITION_PLAYER_INTO_NEXT_ROOM_DURATION,
      delay: ROOM_TRANSITION_PLAYER_INTO_NEXT_ROOM_DELAY,
      onComplete: () => {
        // re-enable the door object player just entered through
        targetDoor.enableObject();
        this.#currentRoomCode = targetDoor.roomCode;
        // update camera to follow player again
        this.cameras.main.startFollow(this.#hero);
        // re-enable player input
        this.#controls.isMovementLocked = false;
      },
    });
  }
}
