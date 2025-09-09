export const TILED_ROOM_OBJECT_PROPERTY = {
  CODE: "code",
} as const;

export const TILED_LAYER_NAMES = {
  ROOMS: "rooms",
  SWITCHES: "switches",
  POTS: "pots",
  DOORS: "doors",
  CHESTS: "chests",
  ENEMIES: "enemies",
  COLLISION: "collision",
  ENEMY_COLLISION: "enemy_collision",
  CORNERS: "corners",
} as const;

export const TILED_TILESET_NAMES = {
  COLLISION: "collision",
  CORNER_32: "corner32",
} as const;

export const DOOR_TYPE = {
  OPEN: "OPEN",
  LOCK: "LOCK",
  TRAP: "TRAP",
  OPEN_ENTRANCE: "OPEN_ENTRANCE",
  NONE: "NONE",
} as const;

export const TRAP_TYPE = {
  NONE: "NONE",
  ENEMIES_DEFEATED: "ENEMIES_DEFEATED",
  SWITCH: "SWITCH",
} as const;

export const TILED_DOOR_OBJECT_PROPERTY = {
  DIRECTION: "direction",
  DOOR_TYPE: "doorType",
  ID: "id",
  IS_LEVEL_TRANSITION: "isLevelTransition",
  TARGET_DOOR_ID: "targetDoorId",
  TARGET_LEVEL: "targetLevel",
  TARGET_ROOM_CODE: "targetRoomCode",
  TRAP_DOOR_TRIGGER: "trapDoorTrigger",
} as const;

export const CHEST_REWARD = {
  SMALL_KEY: "SMALL_KEY",
  MAP: "MAP",
  COMPASS: "COMPASS",
  NOTHING: "NOTHING",
} as const;

export const TILED_CHEST_OBJECT_PROPERTY = {
  CONTENTS: "contents",
  ID: "id",
  REVEAL_CHEST_TRIGGER: "revealChestTrigger",
  REQUIRES_BOSS_KEY: "requiresBossKey",
} as const;

export const TILED_SWITCH_OBJECT_PROPERTY = {
  TARGET_IDS: "targetIds",
  ACTION: "action",
  TEXTURE: "texture",
} as const;

export const SWITCH_TEXTURE = {
  PLATE: "PLATE",
  FLOOR: "FLOOR",
} as const;

export const SWITCH_ACTION = {
  NOTHING: "NOTHING",
  OPEN_DOOR: "OPEN_DOOR",
  REVEAL_CHEST: "REVEAL_CHEST",
  REVEAL_KEY: "REVEAL_KEY",
} as const;

export const ENEMY_CODES = {
  WISP: "WISP",
  SPIDER: "SPIDER",
} as const;
