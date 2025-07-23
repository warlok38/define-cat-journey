import * as Phaser from "phaser";
import { InputComponent } from "./InputComponent";

export class KeyboardComponent extends InputComponent {
  #cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  #actionKey: Phaser.Input.Keyboard.Key;

  constructor(keyboardPlugin: Phaser.Input.Keyboard.KeyboardPlugin) {
    super();
    this.#cursorKeys = keyboardPlugin.createCursorKeys();
    this.#actionKey = keyboardPlugin.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // e - for interacting
    // shift - run, move faster
  }

  get isUpDown(): boolean {
    return this.#cursorKeys.up.isDown;
  }

  get isUpJustDown(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.#cursorKeys.up);
  }

  get isDownDown(): boolean {
    return this.#cursorKeys.down.isDown;
  }

  get isDownJustDown(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.#cursorKeys.down);
  }

  get isLeftDown(): boolean {
    return this.#cursorKeys.left.isDown;
  }

  get isRightDown(): boolean {
    return this.#cursorKeys.right.isDown;
  }

  get isActionKeyJustDown(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.#actionKey);
  }

  get isRunKeyJustDown(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.#cursorKeys.shift);
  }
}
