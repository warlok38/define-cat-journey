export const ENABLE_LOGGING = false;

//general
export const HURT_PUSH_BACK_DELAY = 200;

export const ASSET_PACK_KEYS = {
  MAIN: "MAIN",
} as const;

export const ASSET_KEYS = {
  HERO: "HERO",
  SPIDER: "SPIDER",
  WISP: "WISP",
  ENEMY_DEATH: "ENEMY_DEATH",
  POT: "POT",
  POT_BREAK: "POT_BREAK",
  CHEST: "CHEST",
} as const;

export const DIRECTIONS = {
  UP: "UP",
  DOWN: "DOWN",
  LEFT: "LEFT",
  RIGHT: "RIGHT",
} as const;

export const INTERACTIVE_OBJECT_TYPE = {
  AUTO: "AUTO",
  PICKUP: "PICKUP",
  OPEN: "OPEN",
} as const;

export const CHEST_STATE = {
  HIDDEN: "HIDDEN",
  REVEALED: "REVEALED",
  OPEN: "OPEN",
} as const;

export const CHEST_FRAME_KEYS = {
  BIG_CHEST_CLOSED: "big_chest_closed",
  SMALL_CHEST_CLOSED: "chest_closed",
  BIG_CHEST_OPEN: "big_chest_open",
  SMALL_CHEST_OPEN: "chest_open",
} as const;

export const CHARACTER_STATES = {
  IDLE_STATE: "IDLE_STATE",
  MOVE_STATE: "MOVE_STATE",
  BOUNCE_MOVE_STATE: "BOUNCE_MOVE_STATE",
  HURT_STATE: "HURT_STATE",
  DEATH_STATE: "DEATH_STATE",
  LIFT_STATE: "LIFT_STATE",
  OPEN_CHEST_STATE: "OPEN_CHEST_STATE",
  IDLE_HOLDING_STATE: "IDLE_HOLDING_STATE",
  MOVE_HOLDING_STATE: "MOVE_HOLDING_STATE",
  THROW_STATE: "THROW_STATE",
  ATTACK_STATE: "ATTACK_STATE",
} as const;

export const CHARACTER_ANIMATIONS = {
  IDLE_DOWN: "IDLE_DOWN",
  IDLE_UP: "IDLE_UP",
  IDLE_LEFT: "IDLE_LEFT",
  IDLE_RIGHT: "IDLE_RIGHT",
  WALK_DOWN: "WALK_DOWN",
  WALK_UP: "WALK_UP",
  WALK_LEFT: "WALK_LEFT",
  WALK_RIGHT: "WALK_RIGHT",
  HURT_DOWN: "HURT_DOWN",
  HURT_UP: "HURT_UP",
  HURT_LEFT: "HURT_LEFT",
  HURT_RIGHT: "HURT_RIGHT",
  DIE_DOWN: "DIE_DOWN",
  DIE_UP: "DIE_UP",
  DIE_LEFT: "DIE_LEFT",
  DIE_RIGHT: "DIE_RIGHT",
  IDLE_HOLD_DOWN: "IDLE_HOLD_DOWN",
  IDLE_HOLD_UP: "IDLE_HOLD_UP",
  IDLE_HOLD_LEFT: "IDLE_HOLD_LEFT",
  IDLE_HOLD_RIGHT: "IDLE_HOLD_RIGHT",
  WALK_HOLD_DOWN: "WALK_HOLD_DOWN",
  WALK_HOLD_UP: "WALK_HOLD_UP",
  WALK_HOLD_LEFT: "WALK_HOLD_LEFT",
  WALK_HOLD_RIGHT: "WALK_HOLD_RIGHT",
  LIFT_DOWN: "LIFT_DOWN",
  LIFT_UP: "LIFT_UP",
  LIFT_LEFT: "LIFT_LEFT",
  LIFT_RIGHT: "LIFT_RIGHT",
} as const;

//hero
export const HERO_START_MAX_HEALTH = 6;
export const HERO_SPEED = 80;
export const HERO_INVULNERABLE_AFTER_HIT_DURATION = 1000;
export const HERO_HURT_PUSH_BACK_SPEED = 50;
export const HERO_ANIMATION_KEYS = {
  IDLE_DOWN: "idle_down",
  IDLE_UP: "idle_up",
  IDLE_RIGHT: "idle_right",
  IDLE_LEFT: "idle_left",
  WALK_DOWN: "walk_down",
  WALK_UP: "walk_up",
  WALK_RIGHT: "walk_right",
  WALK_LEFT: "walk_left",
  //TODO make animations below
  IDLE_HOLD_DOWN: "idle_down",
  IDLE_HOLD_UP: "idle_down",
  IDLE_HOLD_RIGHT: "idle_down",
  IDLE_HOLD_LEFT: "idle_down",
  WALK_HOLD_DOWN: "idle_down",
  WALK_HOLD_UP: "idle_down",
  WALK_HOLD_RIGHT: "idle_down",
  WALK_HOLD_LEFT: "idle_down",
  LIFT_DOWN: "lift",
  LIFT_UP: "lift",
  LIFT_LEFT: "lift",
  LIFT_RIGHT: "lift",
  HURT_DOWN: "idle_down",
  HURT_UP: "idle_down",
  HURT_LEFT: "idle_down",
  HURT_RIGHT: "idle_down",
  DIE_DOWN: "idle_down",
  DIE_UP: "idle_down",
  DIE_LEFT: "idle_down",
  DIE_RIGHT: "idle_down",
} as const;

//npcs
//enemies
export const ENEMY_SPIDER_MAX_HEALTH = 2;
export const ENEMY_SPIDER_SPEED = 80;
export const ENEMY_SPIDER_CHANGE_DIRECTION_DELAY_MIN = 500;
export const ENEMY_SPIDER_CHANGE_DIRECTION_DELAY_MAX = 1500;
export const ENEMY_SPIDER_CHANGE_DIRECTION_DELAY_WAIT = 200;
export const ENEMY_SPIDER_HURT_PUSH_BACK_SPEED = 50;
export const SPIDER_ANIMATION_KEYS = {
  WALK: "spider_walk",
  HIT: "spider_hit",
  DEATH: ASSET_KEYS.ENEMY_DEATH,
} as const;

export const ENEMY_WISP_MAX_HEALTH = 1;
export const ENEMY_WISP_SPEED = 50;
export const ENEMY_WISP_PULSE_ANIMATION_SCALE_X = 1.2;
export const ENEMY_WISP_PULSE_ANIMATION_SCALE_Y = 1.2;
export const ENEMY_WISP_PULSE_ANIMATION_DURATION = 500;
export const WISP_ANIMATION_KEYS = {
  IDLE: "wisp_idle",
} as const;
