import {
  ASSET_KEYS,
  DIRECTIONS,
  DOOR_FRAME_KEYS,
  ENABLE_DEBUGGING,
} from "../../shared/consts";
import { DOOR_TYPE } from "../../shared/tiled/common";
import type {
  DoorType,
  TiledDoorObject,
  TrapType,
} from "../../shared/tiled/types";
import type {
  CustomGameObject,
  DirectionType,
  RoomCodes,
} from "../../shared/types";
import { exhaustiveGuard } from "../../shared/utils";

export class Door implements CustomGameObject {
  #scene: Phaser.Scene;
  #roomCode: RoomCodes;
  #targetDoorId: number;
  #targetRoomCode: RoomCodes;
  #x: number;
  #y: number;
  #targetLevel: string;
  #doorTransitionZone: Phaser.GameObjects.Zone;
  #debugDoorTransitionZone: Phaser.GameObjects.Rectangle | undefined;
  #direction: DirectionType;
  #id: number;
  #isUnlocked: boolean;
  #doorObject!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody | undefined;
  #trapDoorTrigger: TrapType;
  #doorType: DoorType;

  constructor(
    scene: Phaser.Scene,
    config: TiledDoorObject,
    roomCode: RoomCodes
  ) {
    this.#scene = scene;
    this.#id = config.id;
    this.#roomCode = roomCode;
    this.#targetDoorId = config.targetDoorId;
    this.#targetRoomCode = config.targetRoomCode;
    this.#targetLevel = config.targetLevel;
    this.#x = config.x;
    this.#y = config.y;
    this.#direction = config.direction;
    this.#doorType = config.doorType;
    this.#isUnlocked = config.isUnlocked;
    this.#trapDoorTrigger = config.trapDoorTrigger;

    // create door transition
    this.#doorTransitionZone = this.#scene.add
      .zone(config.x, config.y, config.width, config.height)
      .setOrigin(0, 1)
      .setName(config.id.toString(10));
    this.#scene.physics.world.enable(this.#doorTransitionZone);

    if (ENABLE_DEBUGGING) {
      this.#debugDoorTransitionZone = this.#scene.add
        .rectangle(
          this.#doorTransitionZone.x,
          this.#doorTransitionZone.y,
          this.#doorTransitionZone.width,
          this.#doorTransitionZone.height,
          0xffff00,
          0.6
        )
        .setOrigin(0, 1);
    }

    // if door exists type create sprite for the door
    if (
      this.#doorType !== DOOR_TYPE.NONE &&
      this.#doorType !== DOOR_TYPE.OPEN_ENTRANCE
    ) {
      const frameName = DOOR_FRAME_KEYS[this.#doorType];

      const door = this.#scene.physics.add
        .image(this.#x, this.y, ASSET_KEYS.DOOR, frameName)
        .setImmovable(true)
        .setName(config.id.toString(10));

      switch (this.#direction) {
        case DIRECTIONS.UP:
          door.setOrigin(0, 1);
          break;
        case DIRECTIONS.DOWN:
          door.setOrigin(0, 1);
          break;
        // case DIRECTIONS.LEFT:
        //   door.setOrigin(0.25, 1);
        //   break;
        // case DIRECTIONS.RIGHT:
        //   door.setOrigin(0.5, 1);
        //   break;
        default:
          //TODO fix if need
          //@ts-expect-error Argument of type '"DOWN_LEFT" | "DOWN_RIGHT" | "UP_LEFT" | "UP_RIGHT"' is not assignable to parameter of type 'never
          exhaustiveGuard(this.#direction);
      }

      this.#doorObject = door;
    }

    // disable physics body and make game objects inactive/not visible
    this.disableObject();
  }

  get x(): number {
    return this.#x;
  }

  get y(): number {
    return this.#y;
  }

  get roomCode(): RoomCodes {
    return this.#roomCode;
  }

  get targetRoomCode(): RoomCodes {
    return this.#targetRoomCode;
  }

  get targetDoorId(): number {
    return this.#targetDoorId;
  }

  get doorTransitionZone(): Phaser.GameObjects.Zone {
    return this.#doorTransitionZone;
  }

  get targetLevel(): string {
    return this.#targetLevel;
  }

  get direction(): DirectionType {
    return this.#direction;
  }

  get doorObject():
    | Phaser.Types.Physics.Arcade.ImageWithDynamicBody
    | undefined {
    return this.#doorObject;
  }

  get id(): number {
    return this.#id;
  }

  get trapDoorTrigger(): TrapType {
    return this.#trapDoorTrigger;
  }

  get doorType(): DoorType {
    return this.#doorType;
  }

  disableObject(disableDoorTrigger = true): void {
    if (disableDoorTrigger) {
      (this.#doorTransitionZone.body as Phaser.Physics.Arcade.Body).enable =
        false;
      this.#doorTransitionZone.active = false;
    }

    if (this.#doorObject !== undefined) {
      this.#doorObject.body.enable = false;
      this.#doorObject.active = false;
      this.#doorObject.visible = false;
    }
  }

  enableObject(): void {
    (this.#doorTransitionZone.body as Phaser.Physics.Arcade.Body).enable = true;
    this.#doorTransitionZone.active = true;

    if (this.#isUnlocked) {
      return;
    }

    if (this.#doorObject !== undefined) {
      this.#doorObject.body.enable = true;
      this.#doorObject.active = true;
      this.#doorObject.visible = true;
    }
  }

  public open(): void {
    if (this.#doorType === DOOR_TYPE.LOCK) {
      this.#isUnlocked = true;
    }

    this.disableObject(false);
  }
}
