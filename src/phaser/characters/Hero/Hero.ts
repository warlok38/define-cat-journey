import Phaser from "phaser";
import { getVisualBottomY } from "../../utils/getVisualBottom";
import type { Interactable } from "../../interfaces";

export class Hero {
  private scene: Phaser.Scene;
  private sprite: Phaser.Physics.Arcade.Sprite;
  private keys: Record<"W" | "A" | "S" | "D" | "E", Phaser.Input.Keyboard.Key>;
  private lastDirection: "up" | "down" | "left" | "right" = "down";
  private state: "idle" | "moving" | "transition" = "idle";
  private shadow!: Phaser.GameObjects.Image;

  private interactionZone!: Phaser.GameObjects.Zone;
  private currentTarget: Phaser.GameObjects.GameObject | null = null;
  private eKeyWasDown: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;

    // Игрок
    this.sprite = scene.physics.add.sprite(x, y, "catStayDown", 0);
    // this.sprite.setScale(2);
    this.sprite.setBodySize(this.sprite.width * 0.55, this.sprite.height * 0.4);
    this.sprite.setOffset(this.sprite.width * 0.2, this.sprite.height * 0.5);
    // this.sprite.setVisible(false);

    //shadow
    this.shadow = this.scene.add.image(x - 1, y + 1, "catShadowFront");
    this.shadow.setAlpha(0.6);
    this.shadow.setDepth(getVisualBottomY(this.sprite) - 1);
    this.shadow.setPipeline("Light2D");
    // Клавиши
    this.keys = scene.input!.keyboard!.addKeys("W,A,S,D,E") as typeof this.keys;

    // Interaction zone
    this.interactionZone = scene.add.zone(x, y, 10, 8);
    scene.physics.add.existing(this.interactionZone);
    const body = this.interactionZone.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);

    this.createAnimations();

    this.sprite.on("animationcomplete", (anim: Phaser.Animations.Animation) => {
      if (anim.key === "stay-down-start-once") {
        this.state = "idle";
        this.sprite.anims.play("stay-down", true);
      }
    });
  }

  private createAnimations() {
    const anims = this.scene.anims;

    anims.create({
      key: "walk-down",
      frames: anims.generateFrameNumbers("catWalkDown"),
      frameRate: 8,
      repeat: -1,
    });

    anims.create({
      key: "walk-up",
      frames: anims.generateFrameNumbers("catWalkUp"),
      frameRate: 8,
      repeat: -1,
    });

    anims.create({
      key: "walk-right",
      frames: anims.generateFrameNumbers("catWalkRight"),
      frameRate: 8,
      repeat: -1,
    });

    anims.create({
      key: "walk-left",
      frames: anims.generateFrameNumbers("catWalkLeft"),
      frameRate: 8,
      repeat: -1,
    });

    anims.create({
      key: "stay-down",
      frames: anims.generateFrameNumbers("catStayDown"),
      frameRate: 8,
      repeat: -1,
    });

    anims.create({
      key: "stay-up",
      frames: anims.generateFrameNumbers("catStayUp"),
      frameRate: 8,
      repeat: -1,
    });

    anims.create({
      key: "stay-right",
      frames: anims.generateFrameNumbers("catStayRight"),
      frameRate: 8,
      repeat: -1,
    });

    anims.create({
      key: "stay-left",
      frames: anims.generateFrameNumbers("catStayLeft"),
      frameRate: 8,
      repeat: -1,
    });

    anims.create({
      key: "stay-down-start-once",
      frames: anims.generateFrameNumbers("catStayDownStartOnce"),
      frameRate: 8,
    });
  }

  update() {
    const speed = 100;
    const keys = this.keys;
    const player = this.sprite;

    let vx = 0;
    let vy = 0;
    let animKey: string | null = null;

    if (keys.W.isDown) {
      vy = -speed;
      animKey = "walk-up";
      this.lastDirection = "up";
    } else if (keys.S.isDown) {
      vy = speed;
      animKey = "walk-down";
      this.lastDirection = "down";
    }

    if (keys.A.isDown) {
      vx = -speed;
      animKey = "walk-left";
      this.lastDirection = "left";
    } else if (keys.D.isDown) {
      vx = speed;
      animKey = "walk-right";
      this.lastDirection = "right";
    }

    player.setVelocity(vx, vy);

    if (vx !== 0 || vy !== 0) {
      this.state = "moving";
      if (animKey) {
        player.anims.play(animKey, true);
      }
    } else {
      if (this.state === "moving") {
        // Только что остановились
        if (this.lastDirection === "down") {
          this.state = "transition";
          player.anims.play("stay-down-start-once");
        } else {
          this.state = "idle";
          const stayAnim = `stay-${this.lastDirection}`;
          player.anims.play(stayAnim, true);
        }
      } else if (this.state === "idle") {
        const stayAnim = `stay-${this.lastDirection}`;
        if (player.anims.currentAnim?.key !== stayAnim) {
          player.anims.play(stayAnim, true);
        }
      }
      // если state === "transition", ничего не делаем, ждём завершения
    }

    this.sprite.setDepth(getVisualBottomY(this.sprite));
    this.shadow.setDepth(this.sprite.depth - 1);

    const isSide =
      this.lastDirection === "left" || this.lastDirection === "right";
    const targetTexture = isSide ? "catShadowSide" : "catShadowFront";

    if (this.shadow.texture.key !== targetTexture) {
      this.shadow.setTexture(targetTexture);
    }

    const px = this.sprite.x + (isSide ? 0 : -1);
    const py = this.sprite.y + (isSide ? 6 : 2);
    this.shadow.setPosition(px, py);

    // Обновляем позицию interaction zone
    let zoneX = this.sprite.x;
    let zoneY = this.sprite.y + 6;
    switch (this.lastDirection) {
      case "left":
        zoneX -= 15;
        break;
      case "right":
        zoneX += 14;
        break;
      case "up":
        zoneY -= 13;
        break;
      case "down":
        zoneY += 12;
        break;
    }
    this.interactionZone.setPosition(zoneX, zoneY);

    // Взаимодействие
    if (keys.E.isDown && !this.eKeyWasDown) {
      if (this.currentTarget) {
        const ref = this.currentTarget.getData?.("ref") as
          | Interactable
          | undefined;
        if (ref?.interact) {
          ref.interact(); // Вызовем метод
        } else {
          console.log("Объект перед героем не поддерживает взаимодействие.");
        }
      } else {
        console.log("Перед героем ничего нет");
      }
      this.eKeyWasDown = true;
    } else if (keys.E.isUp) {
      this.eKeyWasDown = false;
    }
  }

  getInteractionZone() {
    return this.interactionZone;
  }

  getCurrentTarget() {
    return this.currentTarget;
  }

  setCurrentTarget(obj: Phaser.GameObjects.GameObject | null) {
    this.currentTarget = obj;
  }

  getSprite() {
    return this.sprite;
  }
}
