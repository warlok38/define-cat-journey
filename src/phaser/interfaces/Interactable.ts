import Phaser from "phaser";

export interface Interactable extends Phaser.GameObjects.GameObject {
  interact(): void;
}
