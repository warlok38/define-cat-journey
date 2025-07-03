import Phaser from "phaser";

export class HouseWindow {
  private scene: Phaser.Scene;
  private hero: Phaser.Physics.Arcade.Sprite;
  private originX: number;
  private originY: number;
  private windowBg: Phaser.GameObjects.Image;
  private windowSprite: Phaser.Physics.Arcade.Sprite;
  private light: Phaser.GameObjects.Light;

  constructor(
    scene: Phaser.Scene,
    hero: Phaser.Physics.Arcade.Sprite,
    originX: number,
    originY: number,
    lightOptions: {
      offsetX?: number;
      offsetY?: number;
      radius?: number;
      color?: number;
      intensity?: number;
    } = {}
  ) {
    this.scene = scene;
    this.hero = hero;
    this.originX = originX;
    this.originY = originY;

    const {
      offsetX = 0,
      offsetY = 0,
      radius = 128,
      color = 0xfff1d0,
      intensity = 0.8,
    } = lightOptions;

    this.windowBg = scene.add.image(originX, originY, "windowViewGarden");
    this.windowBg.setOrigin(0.5, 0.5);
    this.windowBg.setToBack();

    this.windowSprite = scene.physics.add.sprite(originX, originY, "window");

    this.light = scene.lights.addLight(
      originX + offsetX,
      originY + offsetY,
      radius,
      color,
      intensity
    );
  }

  update() {
    const maxShiftX = 32;
    const maxScaleY = 1.1;
    const activationDistanceX = 256;
    const activationDistanceY = 96;

    const dx = Phaser.Math.Clamp(
      this.hero.x - this.originX,
      -activationDistanceX,
      activationDistanceX
    );
    const dy = Phaser.Math.Clamp(
      this.hero.y - this.originY,
      activationDistanceY,
      activationDistanceY * 2
    );
    const t = (dx + activationDistanceX) / (2 * activationDistanceX);
    const eased = Phaser.Math.Easing.Sine.InOut(t);
    const shift = Phaser.Math.Linear(-maxShiftX, maxShiftX, eased);
    this.windowBg.x = this.originX + shift;

    const scaleProgress = dy / activationDistanceY;
    const easedScale = Phaser.Math.Easing.Sine.InOut(scaleProgress);
    const scale = Phaser.Math.Linear(maxScaleY, 1, easedScale);
    this.windowBg.setScale(scale, scale);
  }

  getSprite() {
    return this.windowSprite;
  }
}
