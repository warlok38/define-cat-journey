import Phaser from "phaser";

export class Hero {
  private scene: Phaser.Scene;
  private sprite: Phaser.Physics.Arcade.Sprite;
  private keys: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
  private lastDirection: "up" | "down" | "left" | "right" = "down";
  private state: "idle" | "moving" | "transition" = "idle";

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;

    // Игрок
    this.sprite = scene.physics.add.sprite(x, y, "catStayDown", 0);
    // this.sprite.setScale(2);

    // Клавиши
    this.keys = scene.input!.keyboard!.addKeys("W,A,S,D") as typeof this.keys;

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
  }

  getSprite() {
    return this.sprite;
  }
}
