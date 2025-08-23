import { HERO_START_MAX_HEALTH, LEVEL_NAME, ROOM_CODES } from "./consts";
import {
  CUSTOM_EVENTS,
  EVENT_BUS,
  HERO_HEALTH_UPDATE_TYPE,
  type HeroHealthUpdated,
  type HeroHealthUpdateType,
} from "./eventBus";
import type { LevelName, PlayerData, RoomCodes } from "./types";

export class DataManager {
  static #instance: DataManager;

  #data: PlayerData;

  private constructor() {
    this.#data = {
      currentHealth: HERO_START_MAX_HEALTH,
      maxHealth: HERO_START_MAX_HEALTH,
      currentArea: {
        name: LEVEL_NAME.HOUSE_1,
        startRoomCode: ROOM_CODES.ENTRANCE,
        startDoorId: 0,
      },
      areaDetails: {
        HOUSE_1: {},
        BASEMENT: {},
      },
    };
  }

  static get instance(): DataManager {
    if (!DataManager.#instance) {
      DataManager.#instance = new DataManager();
    }
    return DataManager.#instance;
  }

  get data(): PlayerData {
    return { ...this.#data };
  }

  set data(data: PlayerData) {
    this.#data = { ...data };
  }

  updateAreaData(
    area: LevelName,
    startRoomCode: RoomCodes,
    startDoorId: number
  ): void {
    this.#data.currentArea = {
      name: area,
      startDoorId,
      startRoomCode,
    };
  }

  updateChestData(
    roomCode: RoomCodes,
    chestId: number,
    revealed: boolean,
    opened: boolean
  ): void {
    this.#populateDefaultRoomData(roomCode);
    this.#data.areaDetails[this.#data.currentArea.name][roomCode].chests[
      chestId
    ] = {
      revealed,
      opened,
    };
  }

  updateDoorData(roomCode: RoomCodes, doorId: number, unlocked: boolean): void {
    this.#populateDefaultRoomData(roomCode);
    this.#data.areaDetails[this.#data.currentArea.name][roomCode].doors[
      doorId
    ] = {
      unlocked,
    };
  }

  resetPlayerHealthToMin(): void {
    this.#data.currentHealth = HERO_START_MAX_HEALTH;
  }

  updatePlayerCurrentHealth(health: number): void {
    if (health === this.#data.currentHealth) {
      return;
    }

    let healthUpdateType: HeroHealthUpdateType =
      HERO_HEALTH_UPDATE_TYPE.DECREASE;

    if (health > this.#data.currentHealth) {
      healthUpdateType = HERO_HEALTH_UPDATE_TYPE.INCREASE;
    }

    const dataToPass: HeroHealthUpdated = {
      previousHealth: this.#data.currentHealth,
      currentHealth: health,
      type: healthUpdateType,
    };

    EVENT_BUS.emit(CUSTOM_EVENTS.HERO_HEALTH_UPDATED, dataToPass);
    this.#data.currentHealth = health;
  }

  #populateDefaultRoomData(roomCode: RoomCodes): void {
    if (
      this.#data.areaDetails[this.#data.currentArea.name][roomCode] ===
      undefined
    ) {
      this.#data.areaDetails[this.#data.currentArea.name][roomCode] = {
        chests: {},
        doors: {},
      };
    }
  }
}
