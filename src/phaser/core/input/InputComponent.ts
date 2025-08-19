export class InputComponent {
  #up: boolean;
  #down: boolean;
  #left: boolean;
  #right: boolean;
  #actionKey: boolean;
  #runKey: boolean;
  #isMovementLocked: boolean;

  constructor() {
    this.#up = false;
    this.#left = false;
    this.#right = false;
    this.#down = false;
    this.#actionKey = false;
    this.#runKey = false;
    this.#isMovementLocked = false;
  }

  get isMovementLocked(): boolean {
    return this.#isMovementLocked;
  }

  set isMovementLocked(val: boolean) {
    this.#isMovementLocked = val;
  }

  get isUpDown(): boolean {
    return this.#up;
  }

  get isUpJustDown(): boolean {
    return this.#up;
  }

  set isUpDown(val: boolean) {
    this.#up = val;
  }

  get isDownDown(): boolean {
    return this.#down;
  }

  get isDownJustDown(): boolean {
    return this.#down;
  }

  set isDownDown(val: boolean) {
    this.#down = val;
  }

  get isLeftDown(): boolean {
    return this.#left;
  }

  set isLeftDown(val: boolean) {
    this.#left = val;
  }

  get isRightDown(): boolean {
    return this.#right;
  }

  set isRightDown(val: boolean) {
    this.#right = val;
  }

  get isActionKeyJustDown(): boolean {
    return this.#actionKey;
  }

  set isActionKeyJustDown(val: boolean) {
    this.#actionKey = val;
  }

  get isRunKeyJustDown(): boolean {
    return this.#runKey;
  }

  set isRunKeyJustDown(val: boolean) {
    this.#runKey = val;
  }

  public reset(): void {
    this.#isMovementLocked = false;
    this.#down = false;
    this.#up = false;
    this.#left = false;
    this.#right = false;
    this.#actionKey = false;
    this.#runKey = false;
    this.isMovementLocked = false;
  }
}
