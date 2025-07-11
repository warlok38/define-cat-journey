import Phaser from "phaser";

const frameBounds = {
  frameWidth: 32,
  frameHeight: 32,
};

export function loadAssets(scene: Phaser.Scene) {
  // Tiles
  //mainscene
  scene.load.image("houseInteriorTiles", "/assets/tiles/house-interior.png");
  scene.load.image("houseObjectsTiles", "/assets/tiles/house-objects.png");
  scene.load.tilemapTiledJSON("houseMap", "/assets/tiles/house-interior.json");
  //basementscene
  scene.load.image("basementTiles", "/assets/background-test.png");

  // Objects
  scene.load.image("chest", "/assets/objects/chest.png");

  scene.load.image("table", "/assets/objects/table.png");
  scene.load.image("window", "/assets/objects/window.png");
  scene.load.image(
    "windowViewGarden",
    "/assets/objects/window-view-garden.png"
  );
  scene.load.image("stove", "/assets/objects/stove.png");
  scene.load.spritesheet("door", "/assets/objects/door.png", {
    frameWidth: 48,
    frameHeight: 112,
  });
  scene.load.spritesheet("chairs", "/assets/objects/chairs.png", {
    frameWidth: 32,
    frameHeight: 64,
  });
  scene.load.spritesheet("flowerSmall", "/assets/objects/flowers-small.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
  scene.load.spritesheet("furniture", "/assets/objects/furniture.png", {
    frameWidth: 80,
    frameHeight: 80,
  });
  scene.load.spritesheet("TV", "/assets/objects/TV.png", {
    frameWidth: 64,
    frameHeight: 80,
  });
  scene.load.spritesheet("fridge", "/assets/objects/fridge.png", {
    frameWidth: 48,
    frameHeight: 116,
  });
  scene.load.spritesheet(
    "boxFloorSmall",
    "/assets/objects/boxes-floors-small.png",
    {
      frameWidth: 32,
      frameHeight: 63,
    }
  );
  scene.load.spritesheet(
    "boxFloorWide",
    "/assets/objects/boxes-floors-wide.png",
    {
      frameWidth: 64,
      frameHeight: 63,
    }
  );
  scene.load.spritesheet("boxUpSmall", "/assets/objects/boxes-ups-small.png", {
    frameWidth: 32,
    frameHeight: 47,
  });
  scene.load.spritesheet("boxUpWide", "/assets/objects/boxes-ups-wide.png", {
    frameWidth: 64,
    frameHeight: 47,
  });

  // Hero: animations
  scene.load.spritesheet(
    "catWalkDown",
    "/assets/cat-walk-down.png",
    frameBounds
  );
  scene.load.spritesheet("catWalkUp", "/assets/cat-walk-up.png", frameBounds);
  scene.load.spritesheet(
    "catWalkRight",
    "/assets/cat-walk-right.png",
    frameBounds
  );
  scene.load.spritesheet(
    "catWalkLeft",
    "/assets/cat-walk-left.png",
    frameBounds
  );
  scene.load.spritesheet(
    "catStayDown",
    "/assets/cat-stay-down.png",
    frameBounds
  );
  scene.load.spritesheet("catStayUp", "/assets/cat-stay-up.png", frameBounds);
  scene.load.spritesheet(
    "catStayRight",
    "/assets/cat-stay-right.png",
    frameBounds
  );
  scene.load.spritesheet(
    "catStayLeft",
    "/assets/cat-stay-left.png",
    frameBounds
  );
  scene.load.spritesheet(
    "catStayDownStartOnce",
    "/assets/cat-stay-down-start-once.png",
    frameBounds
  );

  // Hero: shadow
  scene.load.image("catShadowFront", "/assets/cat-shadow-front.png");
  scene.load.image("catShadowSide", "/assets/cat-shadow-side.png");
}
