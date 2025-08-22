import type {
  CHARACTER_ANIMATIONS,
  CHEST_STATE,
  DIRECTIONS,
  HOUSE_ITEM,
  INTERACTIVE_OBJECT_TYPE,
  LEVEL_NAME,
  ROOM_CODES,
} from "./consts";

export type Position = {
  x: number;
  y: number;
};

export type GameObject = Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;

export type DirectionType = keyof typeof DIRECTIONS;

export type ChestState = keyof typeof CHEST_STATE;

export type InteractiveObjectType = keyof typeof INTERACTIVE_OBJECT_TYPE;

export type CharacterAnimation = keyof typeof CHARACTER_ANIMATIONS;

export type AnimationConfig = {
  [key in CharacterAnimation]?: {
    key: string;
    repeat: number;
    ignoreIfPlaying: boolean;
  };
};

export interface CustomGameObject {
  enableObject(): void;
  disableObject(): void;
}

export type LevelName = keyof typeof LEVEL_NAME;
export type RoomCodes = keyof typeof ROOM_CODES;

export type LevelData = {
  level: LevelName;
  doorId: number;
  roomCode: RoomCodes;
};

export type HouseItem = keyof typeof HOUSE_ITEM;
