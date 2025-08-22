import { HOUSE_ITEM } from "../../shared/consts";
import type { HouseItem, LevelName } from "../../shared/types";
import { exhaustiveGuard } from "../../shared/utils";

type AreaInventory = {
  map: boolean;
  compass: boolean;
  bossKey: boolean;
  keys: number;
};

type ItemInventory = {
  sword: boolean;
};

export type InventoryData = {
  general: ItemInventory;
  area: { [key in LevelName]: AreaInventory };
};

export class InventoryManager {
  static #instance: InventoryManager;

  #generalInventory: ItemInventory;
  #areaInventory: { [key in LevelName]: AreaInventory };

  private constructor() {
    this.#generalInventory = {
      sword: true,
    };
    this.#areaInventory = {
      HOUSE_1: {
        map: false,
        bossKey: false,
        compass: false,
        keys: 0,
      },
      BASEMENT: {
        map: false,
        bossKey: false,
        compass: false,
        keys: 0,
      },
    };
  }

  static get instance(): InventoryManager {
    if (!InventoryManager.#instance) {
      InventoryManager.#instance = new InventoryManager();
    }
    return InventoryManager.#instance;
  }

  get data(): InventoryData {
    return {
      general: { ...this.#generalInventory },
      area: { ...this.#areaInventory },
    };
  }

  set data(data: InventoryData) {
    this.#areaInventory = { ...data.area };
    this.#generalInventory = { ...data.general };
  }

  addHouseItem(area: LevelName, houseItem: HouseItem): void {
    switch (houseItem) {
      case HOUSE_ITEM.MAP:
        this.#areaInventory[area].map = true;
        return;
      case HOUSE_ITEM.COMPASS:
        this.#areaInventory[area].compass = true;
        return;
      case HOUSE_ITEM.SMALL_KEY:
        this.#areaInventory[area].keys += 1;
        return;
      default:
        exhaustiveGuard(houseItem);
    }
  }

  getAreaInventory(area: LevelName): AreaInventory {
    return { ...this.#areaInventory[area] };
  }

  useAreaSmallKey(area: LevelName): void {
    if (this.#areaInventory[area].keys > 0) {
      this.#areaInventory[area].keys -= 1;
    }
  }
}
