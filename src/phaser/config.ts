import Phaser from "phaser";
import MainScene from "./scenes/MainScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  pixelArt: true,
  width: 360,
  height: 270,
  backgroundColor: "#aaaaaa",
  parent: "game-container",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 360,
      height: 270,
    },
  },
  physics: {
    default: "arcade",
    // arcade: { debug: false },
  },
  scene: [MainScene],
};

export default config;
