import Phaser from "phaser";

export function setupCamera(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.GameObject,
  bounds: { width: number; height: number }
) {
  const camera = scene.cameras.main;
  camera.startFollow(target, true, 1, 1);
  camera.setBounds(0, 0, bounds.width, bounds.height);
}
