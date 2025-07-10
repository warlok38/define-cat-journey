export function getVisualBottomY(sprite?: Phaser.GameObjects.Sprite) {
  return sprite ? sprite.getTopLeft().y + sprite.displayHeight : 0;
}
