export const GRID_SIZE = 32;

//start positions
export const HERO_START_POSITIONS_MAP = {
  mainScene: {
    //delete. this temp for debug
    temp: {
      x: 200, //кухня
      // x: 800, центр 1 комната
      y: 500,
    },
    mainDoor: {
      x: 1100,
      y: 200,
    },
    basementStairs: {
      x: 1200,
      y: 470,
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
