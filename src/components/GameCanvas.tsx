import React, { useEffect } from "react";
import Phaser from "phaser";
import phaserConfig from "../phaser/config";

let game: Phaser.Game | null = null;

const GameCanvas: React.FC = () => {
  useEffect(() => {
    if (!game) {
      game = new Phaser.Game(phaserConfig);
    }

    return () => {
      game?.destroy(true);
      game = null;
    };
  }, []);

  return <div id="game-container" />;
};

export default GameCanvas;
