export function exhaustiveGuard(_value: never): never {
  throw new Error(
    `Error! Reached forbidden guard function with unexpected value: ${JSON.stringify(
      _value
    )}`
  );
}

export function isArcadePhysicsBody(
  body:
    | Phaser.Physics.Arcade.Body
    | Phaser.Physics.Arcade.StaticBody
    | MatterJS.BodyType
    | null
): body is Phaser.Physics.Arcade.Body {
  if (body === undefined || body === null) {
    return false;
  }
  return body instanceof Phaser.Physics.Arcade.Body;
}
