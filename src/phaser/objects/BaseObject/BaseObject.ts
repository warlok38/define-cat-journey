// src/objects/SceneObject.ts
import Phaser from "phaser";
import { getVisualBottomY } from "../../utils/getVisualBottom";
import type { BaseObjectOptions, Interactable } from "../../interfaces";

export class BaseObject
  extends Phaser.GameObjects.GameObject
  implements Interactable
{
  private collider?: Phaser.Physics.Arcade.Collider;
  private customZones: Phaser.GameObjects.Zone[] = [];
  private hitbox?: Phaser.GameObjects.Zone;
  private keepOriginHitbox?: boolean;
  private target?: Phaser.GameObjects.GameObject;
  protected sprite: Phaser.Physics.Arcade.Sprite;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    options?: BaseObjectOptions
  ) {
    super(scene, "BaseObject");
    this.scene = scene;
    this.keepOriginHitbox = options?.keepOriginHitbox;

    this.sprite = scene.physics.add.sprite(x, y, texture, options?.frame);
    this.sprite.setImmovable(true);

    if (options?.sizeOffset) {
      this.sprite.setSize(
        this.sprite.width + options.sizeOffset.width,
        this.sprite.height + options.sizeOffset.height
      );
    }

    if (this.sprite.body && options?.offset) {
      this.sprite.setOffset(
        this.sprite.body.offset.x + options.offset.x,
        this.sprite.body.offset.y + options.offset.y
      );
    }

    if (!options?.noLight) {
      this.sprite.setPipeline("Light2D");
    }

    this.sprite.setDepth(
      getVisualBottomY(this.sprite) + (options?.depthOffset ?? 0)
    );

    // Привязываем ссылку на объект (для взаимодействий)
    this.sprite.setData("ref", this);

    //custom hiboxes
    if (options?.customHitboxes?.length) {
      if (!options.keepOriginHitbox) {
        (this.sprite.body as Phaser.Physics.Arcade.Body).setEnable(false);
      }

      for (const shape of options.customHitboxes) {
        const zone = scene.add.zone(
          x + shape.x,
          y + shape.y,
          shape.width,
          shape.height
        );
        scene.physics.add.existing(zone, true);
        zone.setData("ref", this);
        this.customZones.push(zone);
      }
    }

    // чтобы можно было добавить в scene.add.group и т.п.
    this.scene.add.existing(this);
  }

  setCollisionWith(target: Phaser.GameObjects.GameObject) {
    this.target = target;

    this.collider?.destroy();
    this.collider = undefined;

    for (const zone of this.customZones) {
      this.scene.physics.add.collider(target, zone);
    }

    const shouldAddSpriteCollider =
      this.customZones.length === 0 || this.keepOriginHitbox;

    if (shouldAddSpriteCollider) {
      this.collider = this.scene.physics.add.collider(target, this.sprite);
    }
  }

  interact() {
    console.log("interact() not implemented for", this.constructor.name);
  }

  getSprite() {
    return this.sprite;
  }

  update() {
    this.sprite.setDepth(getVisualBottomY(this.sprite));
  }

  destroy() {
    this.sprite.destroy();
    if (this.collider) {
      this.collider.destroy();
    }
    this.hitbox?.destroy();
  }

  addCustomZone(shape: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) {
    const zone = this.scene.add.zone(
      this.sprite.x + shape.x,
      this.sprite.y + shape.y,
      shape.width,
      shape.height
    );
    this.scene.physics.add.existing(zone, true);
    zone.setData("ref", this);
    this.customZones.push(zone);
  }

  clearCustomZones() {
    for (const zone of this.customZones) {
      zone.destroy();
    }
    this.customZones = [];
  }

  reapplyCollision() {
    if (this.target) {
      this.setCollisionWith(this.target);
    }
  }
}
