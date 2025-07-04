import Phaser from "phaser";
import { loadAssets } from "../utils/assetLoader";
import { createAnimations } from "../utils/createAnimations";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    const { width, height } = this.cameras.main;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    const barWidth = 320;
    const barHeight = 25;

    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(
      width / 2 - barWidth / 2,
      height / 2 - barHeight / 2,
      barWidth,
      barHeight
    );

    const loadingText = this.add
      .text(width / 2, height / 2 - 40, "Loading...", {
        font: "18px monospace",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.load.on("progress", (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(
        width / 2 - barWidth / 2,
        height / 2 - barHeight / 2,
        barWidth * value,
        barHeight
      );
    });

    this.load.on("complete", () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    loadAssets(this);
  }

  create() {
    createAnimations(this.anims);

    this.scene.start("MainScene", {
      heroX: 1100,
      heroY: 200,
    });
  }
}
