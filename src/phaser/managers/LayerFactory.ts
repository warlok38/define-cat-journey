import Phaser from "phaser";

type LayerNameEnum = "floors" | "walls" | "objects" | "bounds" | "collisions";

type ObjectLayerNameEnum = "collisions-other";

export class LayerFactory {
  private map: Phaser.Tilemaps.Tilemap;
  private scene: Phaser.Scene;
  private layers = new Map<string, Phaser.Tilemaps.TilemapLayer>();
  private objectLayers = new Map<string, Phaser.Tilemaps.ObjectLayer>();

  constructor(scene: Phaser.Scene, mapKey: string) {
    this.scene = scene;
    this.map = scene.make.tilemap({ key: mapKey });

    this.loadAllLayers();
  }

  private loadAllLayers() {
    const tileset = this.map.addTilesetImage(
      "house-interior",
      "houseInteriorTiles"
    );
    const tilesetObjects = this.map.addTilesetImage(
      "house-objects",
      "houseObjectsTiles"
    );

    if (!tileset || !tilesetObjects) {
      throw new Error("Tilesets not found!");
    }

    const layers: {
      layerID: LayerNameEnum;
      tileset:
        | string
        | string[]
        | Phaser.Tilemaps.Tileset
        | Phaser.Tilemaps.Tileset[];
      x?: number;
      y?: number;
    }[] = [
      {
        layerID: "floors",
        tileset: [tileset],
        x: 0,
        y: 0,
      },
      {
        layerID: "walls",
        tileset: [tileset, tilesetObjects],
        x: 0,
        y: 0,
      },
      {
        layerID: "objects",
        tileset: [tilesetObjects],
        x: 0,
        y: 0,
      },
      {
        layerID: "bounds",
        tileset: [tileset],
        x: 0,
        y: 0,
      },
      {
        layerID: "collisions",
        tileset: [tileset],
        x: 0,
        y: -12,
      },
    ];

    const objectLayerNames: ObjectLayerNameEnum[] = ["collisions-other"];

    for (const objectLayerName of objectLayerNames) {
      const objectLayer = this.map.getObjectLayer(objectLayerName);
      if (!objectLayer)
        throw new Error(`Object layer "${objectLayerName}" not found`);
      this.objectLayers.set(objectLayerName, objectLayer);
    }

    for (const layer of layers) {
      const createdLayer = this.map.createLayer(
        layer.layerID,
        layer.tileset,
        layer.x,
        layer.y
      );

      if (!createdLayer)
        throw new Error(`Tilemap layer "${layer.layerID}" not found`);
      this.layers.set(String(layer.layerID), createdLayer);
    }
  }

  getLayer(name: LayerNameEnum): Phaser.Tilemaps.TilemapLayer {
    const layer = this.layers.get(name);
    if (!layer) throw new Error(`Layer "${name}" not loaded`);
    return layer;
  }

  getObjectLayer(name: ObjectLayerNameEnum): Phaser.Tilemaps.ObjectLayer {
    const layer = this.objectLayers.get(name);
    if (!layer) throw new Error(`Object layer "${name}" not loaded`);
    return layer;
  }

  getMap() {
    return this.map;
  }
}
