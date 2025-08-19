export const GRID_SIZE = 32;

//depth
export const BOUNDS_LAYER_DEPTH = 9999;

//start positions
export const HERO_START_POSITIONS_MAP = {
  mainScene: {
    //delete. this temp for debug
    temp: {
      // x: 200, //кухня
      // x: 800, //центр 1 комната
      // y: 500,
      x: 1100,
      y: 200,
    },
    mainDoor: {
      x: 1100,
      y: 200,
    },
    basementStairs: {
      x: 1200,
      y: 380,
    },
    nearKitchen: {
      x: 620,
      y: 450,
    },
  },
  basementScene: {
    basementStairs: {
      x: 650,
      y: 120,
    },
  },
};

//plugins
export const CONTROLS_PLUGIN_NAME = "ControlsPlugin";
export const DEBUG_PLUGIN_NAME = "DebugPlugin";
