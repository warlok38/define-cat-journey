import * as Phaser from "phaser";
import { InputComponent } from "./InputComponent";

export class KeyboardComponent extends InputComponent {
  #cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  #actionKey: Phaser.Input.Keyboard.Key;
  #attackKey: Phaser.Input.Keyboard.Key;
  #enterKey: Phaser.Input.Keyboard.Key;
  #jumpKey: Phaser.Input.Keyboard.Key;

  constructor(keyboardPlugin: Phaser.Input.Keyboard.KeyboardPlugin) {
    super();
    this.#cursorKeys = keyboardPlugin.createCursorKeys();
    this.#actionKey = keyboardPlugin.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.#attackKey = keyboardPlugin.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.#enterKey = keyboardPlugin.addKey(
      Phaser.Input.Keyboard.KeyCodes.ENTER
    );
    this.#jumpKey = keyboardPlugin.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // e - interact
    // shift - run, move faster
    // F - attack
    // space = jump
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

  get isRunKeyDown(): boolean {
    return this.#cursorKeys.shift.isDown;
  }

  get isAttackKeyJustDown(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.#attackKey);
  }

  get isEnterKeyJustDown(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.#enterKey);
  }

  get isJumpKeyJustDown(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.#jumpKey);
  }
}
