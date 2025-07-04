import Phaser from "phaser";

export function createAnimations(anims: Phaser.Animations.AnimationManager) {
  const maybeCreate = (
    key: string,
    config: Phaser.Types.Animations.Animation
  ) => {
    if (anims.exists(key)) return;
    anims.create({ key, ...config });
  };

  // --- Hero Animations ---
  maybeCreate("walk-down", {
    frames: anims.generateFrameNumbers("catWalkDown"),
    frameRate: 8,
    repeat: -1,
  });

  maybeCreate("walk-up", {
    frames: anims.generateFrameNumbers("catWalkUp"),
    frameRate: 8,
    repeat: -1,
  });

  maybeCreate("walk-right", {
    frames: anims.generateFrameNumbers("catWalkRight"),
    frameRate: 8,
    repeat: -1,
  });

  maybeCreate("walk-left", {
    frames: anims.generateFrameNumbers("catWalkLeft"),
    frameRate: 8,
    repeat: -1,
  });

  maybeCreate("stay-down", {
    frames: anims.generateFrameNumbers("catStayDown"),
    frameRate: 8,
    repeat: -1,
  });

  maybeCreate("stay-up", {
    frames: anims.generateFrameNumbers("catStayUp"),
    frameRate: 8,
    repeat: -1,
  });

  maybeCreate("stay-right", {
    frames: anims.generateFrameNumbers("catStayRight"),
    frameRate: 8,
    repeat: -1,
  });

  maybeCreate("stay-left", {
    frames: anims.generateFrameNumbers("catStayLeft"),
    frameRate: 8,
    repeat: -1,
  });

  maybeCreate("stay-down-start-once", {
    frames: anims.generateFrameNumbers("catStayDownStartOnce"),
    frameRate: 8,
    repeat: 0,
  });

  // --- Door Animations ---
  maybeCreate("door-open", {
    frames: anims.generateFrameNumbers("door", { start: 0, end: 4 }),
    frameRate: 12,
    repeat: 0,
  });

  maybeCreate("door-close", {
    frames: anims.generateFrameNumbers("door", { start: 4, end: 8 }),
    frameRate: 12,
    repeat: 0,
  });
}
