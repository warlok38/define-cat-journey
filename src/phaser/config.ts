import Phaser from "phaser";
import PhaserRaycaster from "phaser-raycaster";
import MainScene from "./scenes/MainScene";
import BasementScene from "./scenes/BasementScene";
import PreloadScene from "./scenes/PreloadScene";

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
    arcade: { debug: true },
  },
  scene: [PreloadScene, MainScene, BasementScene],
  plugins: {
    scene: [
      {
        key: "PhaserRaycaster",
        plugin: PhaserRaycaster,
        mapping: "raycasterPlugin",
      },
    ],
  },
};

export default config;
