export function handleCornerSliding(
  scene: Phaser.Scene,
  sprite: Phaser.Physics.Arcade.Sprite,
  direction: "left" | "right" | "up" | "down",
  step: number = 1
) {
  const body = sprite.body as Phaser.Physics.Arcade.Body;
  if (!body.blocked[direction]) return; // не застрял — не трогаем

  const originalY = sprite.y;
  const originalX = sprite.x;

  // Пробуем сдвигать вверх и вниз поочерёдно (или влево/вправо)
  const offsets = [1, 2, 3, 4, 5].flatMap((i) => [-i * step, i * step]);

  for (const offset of offsets) {
    if (direction === "left" || direction === "right") {
      sprite.y = originalY + offset;
    } else {
      sprite.x = originalX + offset;
    }

    // Проверяем, можно ли в этом смещении идти в нужном направлении
    scene.physics.world.update(0, 0); // на всякий случай обновим физику
    const blocked = (sprite.body as Phaser.Physics.Arcade.Body).blocked[
      direction
    ];

    if (!blocked) {
      return; // найдено свободное место — остаёмся
    }
  }

  // Ничего не нашли — возвращаем назад
  sprite.y = originalY;
  sprite.x = originalX;
}
