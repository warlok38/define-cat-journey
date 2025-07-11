import Phaser from "phaser";

export class DebugManager {
  private static instance: DebugManager;
  private isEnabled = false;
  private world?: Phaser.Physics.Arcade.World;

  private constructor() {}

  static getInstance(): DebugManager {
    if (!DebugManager.instance) {
      DebugManager.instance = new DebugManager();
    }
    return DebugManager.instance;
  }

  attachWorld(world: Phaser.Physics.Arcade.World) {
    this.world = world;

    if (!this.world?.debugGraphic) {
      this.world?.createDebugGraphic();
    }

    this.applyDebugState();
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    this.applyDebugState();
  }

  private applyDebugState() {
    if (!this.world) return;

    this.world.drawDebug = this.isEnabled;
    if (this.world.debugGraphic) {
      this.world.debugGraphic.setVisible(this.isEnabled);
    }
  }

  isDebugEnabled() {
    return this.isEnabled;
  }
}
