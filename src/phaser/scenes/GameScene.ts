import { Weapon } from "../core/baseComponents";
import { KeyboardComponent } from "../core/input";
import { InventoryManager } from "../core/inventory";
import { Hero } from "../gameObjects";
import { CharacterGameObject } from "../gameObjects/common/CharacterGameObject";
import { Spider, Wisp } from "../gameObjects/NPCs/enemies";
import { Button, Chest, Door, Pot } from "../gameObjects/objects";
import {
  ASSET_KEYS,
  CHARACTER_STATES,
  CHEST_REWARD_TO_DIALOG_MAP,
  CHEST_REWARD_TO_TEXTURE_FRAME,
  DIRECTIONS,
  ENABLE_DEBUGGING,
  HERO_START_MAX_HEALTH,
  LEVEL_NAME,
  ROOM_TRANSITION_CAMERA_ANIMATION_DELAY,
  ROOM_TRANSITION_CAMERA_ANIMATION_DURATION,
  ROOM_TRANSITION_PLAYER_INTO_HALL_DELAY,
  ROOM_TRANSITION_PLAYER_INTO_HALL_DURATION,
  ROOM_TRANSITION_PLAYER_INTO_NEXT_ROOM_DELAY,
  ROOM_TRANSITION_PLAYER_INTO_NEXT_ROOM_DURATION,
} from "../shared/consts";
import { DataManager } from "../shared/DataManager";
import { CUSTOM_EVENTS, EVENT_BUS } from "../shared/eventBus";
import {
  CHEST_REWARD,
  DOOR_TYPE,
  SWITCH_ACTION,
  TILED_LAYER_NAMES,
  TILED_TILESET_NAMES,
  TRAP_TYPE,
} from "../shared/tiled/common";
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
  #blockingGroup!: Phaser.GameObjects.Group;
  #objectsByRoomCode!: {
    [key in RoomCodes]: {
      chestMap: { [key: number]: Chest };
      doorMap: { [key: number]: Door };
      doors: Door[];
      switches: Button[];
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
  #lockedDoorGroup!: Phaser.GameObjects.Group;
  #switchGroup!: Phaser.GameObjects.Group;
  #rewardItem!: Phaser.GameObjects.Image;

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

    this.#showObjectsInRoomByCode(this.#levelData.roomCode);
    this.#setupHero();
    this.#setupCamera();
    this.#rewardItem = this.add
      .image(0, 0, ASSET_KEYS.UI_ICONS, 0)
      .setVisible(false)
      .setOrigin(0, 1);

    this.#registerColliders();
    this.#registerCustomEvents();

    this.scene.launch(SCENE_KEYS.UI_SCENE);
  }

  #registerColliders(): void {
    // collision between player, enemies and map walls
    this.#collisionLayer.setCollision([
      this.#collisionLayer.tileset[0].firstgid,
    ]);
    this.#enemyCollisionLayer.setCollision([
      this.#enemyCollisionLayer.tileset[0].firstgid,
    ]);
    this.physics.add.collider(this.#hero, this.#collisionLayer);

    // collision between player and game objects in the dungeon/room/world
    this.physics.add.overlap(
      this.#hero,
      this.#doorTransitionGroup,
      (playerObj, doorObj) => {
        this.#handleRoomTransition(
          doorObj as Phaser.Types.Physics.Arcade.GameObjectWithBody
        );
      }
    );

    // register collisions between player and blocking game objects (doors, pots, chests, etc.)
    this.physics.add.collider(
      this.#hero,
      this.#blockingGroup,
      (hero, gameObject) => {
        this.#hero.collidedWithGameObject(gameObject as GameObject);
      }
    );

    // collision between player and switches that can be stepped on
    this.physics.add.overlap(
      this.#hero,
      this.#switchGroup,
      (playerObj, switchObj) => {
        this.#handleButtonPress(switchObj as Button);
      }
    );

    // collision between player and doors that can be unlocked
    this.physics.add.collider(
      this.#hero,
      this.#lockedDoorGroup,
      (hero, gameObject) => {
        const doorObject =
          gameObject as Phaser.Types.Physics.Arcade.GameObjectWithBody;
        const door = this.#objectsByRoomCode[this.#currentRoomCode].doorMap[
          Number(doorObject.name)
        ] as Door;

        if (door.doorType !== DOOR_TYPE.LOCK) {
          return;
        }

        const areaInventory = InventoryManager.instance.getAreaInventory(
          this.#levelData.level
        );
        if (door.doorType === DOOR_TYPE.LOCK) {
          if (areaInventory.keys > 0) {
            InventoryManager.instance.useAreaSmallKey(this.#levelData.level);
            door.open();
            // update data manager so we can persist door state
            DataManager.instance.updateDoorData(
              this.#currentRoomCode,
              door.id,
              true
            );
          }
          return;
        }

        door.open();
      }
    );

    // collisions between enemy groups, collision layers, player, player weapon, and blocking items (pots, chests, etc)
    Object.keys(this.#objectsByRoomCode).forEach((code) => {
      const roomCode: RoomCodes = code as RoomCodes;
      if (this.#objectsByRoomCode[roomCode] === undefined) {
        return;
      }

      if (this.#objectsByRoomCode[roomCode].enemyGroup !== undefined) {
        // collide with walls, doors, etc
        this.physics.add.collider(
          this.#objectsByRoomCode[roomCode].enemyGroup,
          this.#enemyCollisionLayer
        );

        // register collisions between player and enemies
        this.physics.add.overlap(
          this.#hero,
          this.#objectsByRoomCode[roomCode].enemyGroup,
          () => {
            this.#hero.hit(DIRECTIONS.DOWN, 1);
          }
        );

        // register collisions between enemies and blocking game objects (doors, pots, chests, etc.)
        this.physics.add.collider(
          this.#objectsByRoomCode[roomCode].enemyGroup,
          this.#blockingGroup,
          (enemy, gameObject) => {
            // handle when pot objects are thrown at enemies
            if (
              gameObject instanceof Pot &&
              isArcadePhysicsBody(gameObject.body) &&
              (gameObject.body.velocity.x !== 0 ||
                gameObject.body.velocity.y !== 0)
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
        // register collisions between player weapon and enemies
        this.physics.add.overlap(
          this.#objectsByRoomCode[roomCode].enemyGroup,
          this.#hero.weapon.body,
          (enemy) => {
            (enemy as CharacterGameObject).hit(
              this.#hero.direction,
              this.#hero.weapon.weaponDamage
            );
          }
        );

        // register collisions between enemy weapon and player
        const enemyWeapons = this.#objectsByRoomCode[roomCode].enemyGroup
          .getChildren()
          .flatMap((enemy) => {
            const weaponComponent = Weapon.getComponent<Weapon>(
              enemy as GameObject
            );
            if (weaponComponent !== undefined) {
              return [weaponComponent.body];
            }
            return [];
          });
        if (enemyWeapons.length > 0) {
          this.physics.add.overlap(
            enemyWeapons,
            this.#hero,
            (enemyWeaponBody) => {
              // get associated weapon component so we can do things like hide projectiles and disable collisions
              const weaponComponent = Weapon.getComponent<Weapon>(
                enemyWeaponBody as GameObject
              );
              if (
                weaponComponent === undefined ||
                weaponComponent.weapon === undefined
              ) {
                return;
              }
              weaponComponent.weapon.onCollisionCallback();
              this.#hero.hit(DIRECTIONS.DOWN, weaponComponent.weaponDamage);
            }
          );
        }
      }

      // handle collisions between thrown pots and other objects in the current room
      if (this.#objectsByRoomCode[roomCode].pots.length > 0) {
        this.physics.add.collider(
          this.#objectsByRoomCode[roomCode].pots,
          this.#blockingGroup,
          (pot) => {
            if (!(pot instanceof Pot)) {
              return;
            }
            pot.break();
          }
        );
        // collisions between pots and collision layer
        this.physics.add.collider(
          this.#objectsByRoomCode[roomCode].pots,
          this.#collisionLayer,
          (pot) => {
            if (!(pot instanceof Pot)) {
              return;
            }
            pot.break();
          }
        );
      }
    });
  }

  #registerCustomEvents(): void {
    EVENT_BUS.on(CUSTOM_EVENTS.OPENED_CHEST, this.#handleOpenChest, this);
    EVENT_BUS.on(
      CUSTOM_EVENTS.ENEMY_DESTROYED,
      this.#checkForAllEnemiesAreDefeated,
      this
    );
    EVENT_BUS.on(
      CUSTOM_EVENTS.HERO_DEFEATED,
      this.#handleHeroDefeatedEvent,
      this
    );
    EVENT_BUS.on(CUSTOM_EVENTS.DIALOG_CLOSED, this.#handleDialogClosed, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EVENT_BUS.off(CUSTOM_EVENTS.OPENED_CHEST, this.#handleOpenChest, this);
      EVENT_BUS.off(
        CUSTOM_EVENTS.ENEMY_DESTROYED,
        this.#checkForAllEnemiesAreDefeated,
        this
      );
      EVENT_BUS.off(
        CUSTOM_EVENTS.HERO_DEFEATED,
        this.#handleHeroDefeatedEvent,
        this
      );
      EVENT_BUS.off(
        CUSTOM_EVENTS.DIALOG_CLOSED,
        this.#handleDialogClosed,
        this
      );
    });
  }

  #handleOpenChest(chest: Chest): void {
    // update data manager so we can persist chest state
    DataManager.instance.updateChestData(
      this.#currentRoomCode,
      chest.id,
      true,
      true
    );

    if (chest.contents !== CHEST_REWARD.NOTHING) {
      // updated game inventory
      InventoryManager.instance.addHouseItem(
        this.#levelData.level,
        chest.contents
      );
    }

    // show reward from chest
    this.#rewardItem
      .setFrame(CHEST_REWARD_TO_TEXTURE_FRAME[chest.contents])
      .setVisible(true)
      .setPosition(chest.x, chest.y);

    this.tweens.add({
      targets: this.#rewardItem,
      y: this.#rewardItem.y - 16,
      duration: 500,
      onComplete: () => {
        EVENT_BUS.emit(
          CUSTOM_EVENTS.SHOW_DIALOG,
          CHEST_REWARD_TO_DIALOG_MAP[chest.contents]
        );
        this.scene.pause();
      },
    });
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
    this.#blockingGroup = this.add.group([]);
    this.#lockedDoorGroup = this.add.group([]);
    this.#switchGroup = this.add.group([]);

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
    // enemyLayerNames.forEach((layer) =>
    //   this.#createEnemies(map, layer.name, layer.roomCode)
    // );
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

      if (door.doorObject === undefined) {
        return;
      }

      // update door details based on data in data manager
      const existingDoorData =
        DataManager.instance.data.areaDetails[
          DataManager.instance.data.currentArea.name
        ][roomCode]?.doors[tileObject.id];
      if (existingDoorData !== undefined && existingDoorData.unlocked) {
        door.open();
        return;
      }

      // if door is a locked door, use different group so we during collision we can unlock door if able
      if (door.doorType === DOOR_TYPE.LOCK) {
        this.#lockedDoorGroup.add(door.doorObject);
        return;
      }

      this.#blockingGroup.add(door.doorObject);
    });
  }

  #createButtons(
    map: Phaser.Tilemaps.Tilemap,
    layerName: string,
    roomCode: RoomCodes
  ): void {
    const validTiledObjects = getTiledSwitchObjectsFromMap(map, layerName);
    validTiledObjects.forEach((tileObject) => {
      const button = new Button(this, tileObject);
      this.#objectsByRoomCode[roomCode].switches.push(button);
      this.#switchGroup.add(button);
    });
  }

  #createPots(
    map: Phaser.Tilemaps.Tilemap,
    layerName: string,
    roomCode: RoomCodes
  ): void {
    const validTiledObjects = getTiledPotObjectsFromMap(map, layerName);
    validTiledObjects.forEach((tiledObject) => {
      const pot = new Pot(this, tiledObject);
      this.#objectsByRoomCode[roomCode].pots.push(pot);
      this.#blockingGroup.add(pot);
    });
  }

  #createChests(
    map: Phaser.Tilemaps.Tilemap,
    layerName: string,
    roomCode: RoomCodes
  ): void {
    const validTiledObjects = getTiledChestObjectsFromMap(map, layerName);
    validTiledObjects.forEach((tiledObject) => {
      const chest = new Chest(this, tiledObject);
      this.#objectsByRoomCode[roomCode].chests.push(chest);
      this.#objectsByRoomCode[roomCode].chestMap[chest.id] = chest;
      this.#blockingGroup.add(chest);

      // update chest details based on data in data manager
      const existingChestData =
        DataManager.instance.data.areaDetails[
          DataManager.instance.data.currentArea.name
        ][roomCode]?.chests[tiledObject.id];
      if (existingChestData !== undefined) {
        if (existingChestData.revealed) {
          chest.reveal();
        }
        if (existingChestData.opened) {
          chest.open();
        }
      }
    });
  }

  #createEnemies(
    map: Phaser.Tilemaps.Tilemap,
    layerName: string,
    roomCode: RoomCodes
  ): void {
    if (this.#objectsByRoomCode[roomCode].enemyGroup === undefined) {
      this.#objectsByRoomCode[roomCode].enemyGroup = this.add.group([], {
        runChildUpdate: true,
      });
    }

    const validTiledObjects = getTiledEnemyObjectsFromMap(map, layerName);
    for (const tiledObject of validTiledObjects) {
      const enemyCode = tiledObject.code.toUpperCase();
      if (enemyCode !== "WISP" && enemyCode !== "SPIDER") {
        continue;
      }
      if (enemyCode === "SPIDER") {
        const spider = new Spider({
          scene: this,
          position: { x: tiledObject.x, y: tiledObject.y },
        });
        this.#objectsByRoomCode[roomCode].enemyGroup.add(spider);
        continue;
      }
      if (enemyCode === "WISP") {
        const wisp = new Wisp({
          scene: this,
          position: { x: tiledObject.x, y: tiledObject.y },
        });
        this.#objectsByRoomCode[roomCode].enemyGroup.add(wisp);
        continue;
      }
    }
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

    // disable body on game object so we stop triggering the collision
    door.disableObject();
    // update 2nd room to have items visible
    this.#showObjectsInRoomByCode(targetDoor.roomCode);
    // disable body on target door so we don't trigger transition back to original room
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
      onUpdate: () => {
        // play walk anim while transition
        this.#hero.animation.playAnimation(`WALK_${targetDirection}`);
      },
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
        // disable objects in previous room and repopulate this room if needed
        this.#hideObjectsInRoomByCode(door.roomCode);
        this.#currentRoomCode = targetDoor.roomCode;
        this.#checkForAllEnemiesAreDefeated();
        // update camera to follow player again
        this.cameras.main.startFollow(this.#hero);
        // play walk idle anim
        this.#hero.animation.playAnimation(`IDLE_${targetDirection}`);
        // re-enable player input
        this.#controls.isMovementLocked = false;
      },
      onUpdate: () => {
        // play walk anim while transition
        this.#hero.animation.playAnimation(`WALK_${targetDirection}`);
      },
    });
  }

  #handleButtonPress(button: Button): void {
    const buttonPressedData = button.press();
    if (
      buttonPressedData.targetIds.length === 0 ||
      buttonPressedData.action === SWITCH_ACTION.NOTHING
    ) {
      return;
    }

    switch (buttonPressedData.action) {
      case SWITCH_ACTION.OPEN_DOOR:
        // for each door id in the target list, we need to trigger opening the door
        buttonPressedData.targetIds.forEach((id) =>
          this.#objectsByRoomCode[this.#currentRoomCode].doorMap[id].open()
        );
        break;
      case SWITCH_ACTION.REVEAL_CHEST:
        // for each chest id in the target list, we need to trigger revealing the chest
        buttonPressedData.targetIds.forEach((id) => {
          this.#objectsByRoomCode[this.#currentRoomCode].chestMap[id].reveal();
          const existingChestData =
            DataManager.instance.data.areaDetails[
              DataManager.instance.data.currentArea.name
            ][this.#currentRoomCode]?.chests[id];
          if (!existingChestData || !existingChestData.revealed) {
            DataManager.instance.updateChestData(
              this.#currentRoomCode,
              id,
              true,
              false
            );
          }
        });
        break;
      case SWITCH_ACTION.REVEAL_KEY:
        break;
      default:
        exhaustiveGuard(buttonPressedData.action);
    }
  }

  #checkForAllEnemiesAreDefeated(): void {
    const enemyGroup =
      this.#objectsByRoomCode[this.#currentRoomCode].enemyGroup;
    if (enemyGroup === undefined) {
      return;
    }

    const allRequiredEnemiesDefeated = enemyGroup
      .getChildren()
      .every((child) => {
        if (!child.active) {
          return true;
        }
        if (child instanceof Wisp) {
          return true;
        }
        return false;
      });

    if (allRequiredEnemiesDefeated) {
      this.#handleAllEnemiesDefeated();
    }
  }

  #handleAllEnemiesDefeated(): void {
    // check to see if any chests, keys, or doors should be revealed/open
    this.#objectsByRoomCode[this.#currentRoomCode].chests.forEach((chest) => {
      if (chest.revealTrigger === TRAP_TYPE.ENEMIES_DEFEATED) {
        chest.reveal();
        // update data manager so we can persist chest state
        const existingChestData =
          DataManager.instance.data.areaDetails[
            DataManager.instance.data.currentArea.name
          ][this.#currentRoomCode]?.chests[chest.id];
        if (!existingChestData || !existingChestData.revealed) {
          DataManager.instance.updateChestData(
            this.#currentRoomCode,
            chest.id,
            true,
            false
          );
        }
      }
    });
    this.#objectsByRoomCode[this.#currentRoomCode].doors.forEach((door) => {
      if (door.trapDoorTrigger === TRAP_TYPE.ENEMIES_DEFEATED) {
        door.open();
      }
    });
  }

  #showObjectsInRoomByCode(roomCode: RoomCodes): void {
    this.#objectsByRoomCode[roomCode].doors.forEach((door) =>
      door.enableObject()
    );
    this.#objectsByRoomCode[roomCode].switches.forEach((button) =>
      button.enableObject()
    );
    this.#objectsByRoomCode[roomCode].pots.forEach((pot) =>
      pot.resetPosition()
    );
    this.#objectsByRoomCode[roomCode].chests.forEach((chest) =>
      chest.enableObject()
    );
    if (this.#objectsByRoomCode[roomCode].enemyGroup === undefined) {
      return;
    }
    for (const child of this.#objectsByRoomCode[
      roomCode
    ].enemyGroup.getChildren()) {
      (child as CharacterGameObject).enableObject();
    }
  }

  #hideObjectsInRoomByCode(roomCode: RoomCodes): void {
    this.#objectsByRoomCode[roomCode].doors.forEach((door) =>
      door.disableObject()
    );
    this.#objectsByRoomCode[roomCode].switches.forEach((button) =>
      button.disableObject()
    );
    this.#objectsByRoomCode[roomCode].pots.forEach((pot) =>
      pot.disableObject()
    );
    this.#objectsByRoomCode[roomCode].chests.forEach((chest) =>
      chest.disableObject()
    );
    if (this.#objectsByRoomCode[roomCode].enemyGroup === undefined) {
      return;
    }
    for (const child of this.#objectsByRoomCode[
      roomCode
    ].enemyGroup.getChildren()) {
      (child as CharacterGameObject).disableObject();
    }
  }

  #handleHeroDefeatedEvent(): void {
    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        this.scene.start(SCENE_KEYS.GAME_OVER_SCENE);
      }
    );
    this.cameras.main.fadeOut(1000, 0, 0, 0);
  }

  #handleDialogClosed(): void {
    this.#rewardItem.setVisible(false);
    this.scene.resume();
  }
}
