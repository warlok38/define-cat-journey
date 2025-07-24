import type { CHARACTER_ANIMATIONS, DIRECTIONS } from "./consts";

export type Position = {
  x: number;
  y: number;
};

export type GameObject = Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;

export type DirectionType = keyof typeof DIRECTIONS;

export type CharacterAnimation = keyof typeof CHARACTER_ANIMATIONS;

export type AnimationConfig = {
  [key in CharacterAnimation]?: {
    key: string;
    repeat: number;
    ignoreIfPlaying: boolean;
  };
};
