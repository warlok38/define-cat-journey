import Phaser from "phaser";
import { DebugManager } from "../managers";
import { DEBUG_PLUGIN_NAME } from "../../consts";

export class DebugPlugin extends Phaser.Plugins.ScenePlugin {
  constructor(
    scene: Phaser.Scene,
    pluginManager: Phaser.Plugins.PluginManager
  ) {
    super(scene, pluginManager, DEBUG_PLUGIN_NAME);
  }

  boot() {
    if (!this.scene) {
      return;
    }

    this.scene.events.once("create", () => {
      if (!this.scene) {
        return;
      }

      const input = this.scene.input.keyboard;
      const world = this.scene.physics.world;

      if (input) {
        DebugManager.getInstance().attachWorld(world);

        input.on("keydown", (event: KeyboardEvent) => {
          if (event.code === "Backquote") {
            DebugManager.getInstance().toggle();
          }
        });
      }
    });
  }
}
