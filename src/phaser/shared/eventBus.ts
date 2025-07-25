export const EVENT_BUS = new Phaser.Events.EventEmitter();

export const CUSTOM_EVENTS = {
  OPENED_CHEST: "OPENED_CHEST",
  ENEMY_DESTROYED: "ENEMY_DESTROYED",
  HERO_DEFEATED: "HERO_DEFEATED",
  HERO_HEALTH_UPDATED: "HERO_HEALTH_UPDATED",
  SHOW_DIALOG: "SHOW_DIALOG",
  DIALOG_CLOSED: "DIALOG_CLOSED",
  BOSS_DEFEATED: "BOSS_DEFEATED",
} as const;

export const HERO_HEALTH_UPDATE_TYPE = {
  INCREASE: "INCREASE",
  DECREASE: "DECREASE",
} as const;

export type HeroHealthUpdateType = keyof typeof HERO_HEALTH_UPDATE_TYPE;

export type HeroHealthUpdated = {
  currentHealth: number;
  previousHealth: number;
  type: HeroHealthUpdateType;
};
