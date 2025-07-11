import Phaser from "phaser";
import PhaserRaycaster from "phaser-raycaster";
import MainScene from "./scenes/MainScene";
import BasementScene from "./scenes/BasementScene";
import PreloadScene from "./scenes/PreloadScene";
import { ControlsPlugin, DebugPlugin } from "./plugins";
import { CONTROLS_PLUGIN_NAME, DEBUG_PLUGIN_NAME } from "../consts";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  pixelArt: true,
  width: 480,
  height: 360,
  backgroundColor: "#000",
  parent: "game-container",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 480,
      height: 360,
    },
  },
  physics: {
    default: "arcade",
    arcade: { debug: false },
  },
  scene: [PreloadScene, MainScene, BasementScene],
  plugins: {
    scene: [
      {
        key: "PhaserRaycaster",
        plugin: PhaserRaycaster,
        mapping: "raycasterPlugin",
      },
      {
        key: CONTROLS_PLUGIN_NAME,
        plugin: ControlsPlugin,
        mapping: "controls",
      },
      {
        key: DEBUG_PLUGIN_NAME,
        plugin: DebugPlugin,
        mapping: "debug",
      },
    ],
  },
};

export default config;
