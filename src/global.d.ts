import type { ControlsPlugin } from "./phaser/plugins";

declare module "phaser" {
  interface Scene {
    controls: ControlsPlugin;
  }
}
