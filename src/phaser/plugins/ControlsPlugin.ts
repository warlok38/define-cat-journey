import Phaser from "phaser";
import { CONTROLS_PLUGIN_NAME } from "../../consts";

export class ControlsPlugin extends Phaser.Plugins.ScenePlugin {
  private keys!: Record<
    "W" | "A" | "S" | "D" | "E" | "SHIFT" | "SPACE",
    Phaser.Input.Keyboard.Key
  >;

  constructor(
    scene: Phaser.Scene,
    pluginManager: Phaser.Plugins.PluginManager
  ) {
    super(scene, pluginManager, CONTROLS_PLUGIN_NAME);
  }

  boot() {
    if (!this.scene) {
      return;
    }

    this.keys = {
      W: this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      E: this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      SHIFT: this.scene.input.keyboard!.addKey(
        Phaser.Input.Keyboard.KeyCodes.SHIFT
      ),
      SPACE: this.scene.input.keyboard!.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
      ),
    };
  }

  getKeys() {
    return this.keys;
  }
}
