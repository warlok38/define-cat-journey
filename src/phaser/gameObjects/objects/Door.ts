import { ENABLE_DEBUGGING } from "../../shared/consts";
import type { TiledDoorObject } from "../../shared/tiled/types";
import type {
  CustomGameObject,
  DirectionType,
  RoomCodes,
} from "../../shared/types";

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

  constructor(
    scene: Phaser.Scene,
    config: TiledDoorObject,
    roomCode: RoomCodes
  ) {
    this.#scene = scene;
    this.#roomCode = roomCode;
    this.#targetDoorId = config.targetDoorId;
    this.#targetRoomCode = config.targetRoomCode;
    this.#targetLevel = config.targetLevel;
    this.#x = config.x;
    this.#y = config.y;
    this.#direction = config.direction;

    // create door transition
    this.#doorTransitionZone = this.#scene.add
      .zone(config.x, config.y, config.width, config.height)
      .setOrigin(0, 1)
      .setName(config.id.toString(10));
    this.#scene.physics.world.enable(this.#doorTransitionZone);

    if (!ENABLE_DEBUGGING) {
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

  disableObject(): void {
    (this.#doorTransitionZone.body as Phaser.Physics.Arcade.Body).enable =
      false;
    this.#doorTransitionZone.active = false;
  }

  enableObject(): void {
    (this.#doorTransitionZone.body as Phaser.Physics.Arcade.Body).enable = true;
    this.#doorTransitionZone.active = true;
  }
}
