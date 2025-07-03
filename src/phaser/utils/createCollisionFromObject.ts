import Phaser from "phaser";

export function createCollisionFromObject(
  scene: Phaser.Scene,
  object: Phaser.Types.Tilemaps.TiledObject
): Phaser.GameObjects.Rectangle {
  const { x = 0, y = 0, width = 0, height = 0 } = object;

  const rect = scene.add.rectangle(
    x + width / 2,
    y + height / 2,
    width,
    height,
    0xff0000,
    0 // opacity
  );

  scene.physics.add.existing(rect, true); // true → static body

  rect.setVisible(false);

  return rect;
}
