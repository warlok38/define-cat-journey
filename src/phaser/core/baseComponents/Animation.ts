import type {
  AnimationConfig,
  CharacterAnimation,
  GameObject,
} from "../../shared/types";
import { BaseGameObject } from "./BaseGameObject";

export class Animation extends BaseGameObject {
  protected declare gameObject: Phaser.GameObjects.Sprite;
  #config: AnimationConfig;

  constructor(gameObject: GameObject, config: AnimationConfig) {
    super(gameObject);
    this.#config = config;
  }

  getAnimationKey(
    characterAnimationKey: CharacterAnimation
  ): string | undefined {
    if (this.#config[characterAnimationKey] === undefined) {
      return undefined;
    }

    return this.#config[characterAnimationKey].key;
  }

  playAnimation(
    characterAnimationKey: CharacterAnimation,
    callback?: () => void
  ): void {
    if (this.#config[characterAnimationKey] === undefined) {
      if (callback) {
        callback();
      }
      return;
    }

    const animationConfig: Phaser.Types.Animations.PlayAnimationConfig = {
      key: this.#config[characterAnimationKey].key,
      repeat: this.#config[characterAnimationKey].repeat,
      timeScale: 1,
    };

    if (callback) {
      const animationKey =
        Phaser.Animations.Events.ANIMATION_COMPLETE_KEY +
        this.#config[characterAnimationKey].key;
      this.gameObject.once(animationKey, () => {
        callback();
      });
    }

    this.gameObject.play(
      animationConfig,
      this.#config[characterAnimationKey].ignoreIfPlaying
    );
  }

  playAnimationInReverse(
    characterAnimationKey: CharacterAnimation,
    callback?: () => void
  ): void {
    if (this.#config[characterAnimationKey] === undefined) {
      if (callback) {
        callback();
      }
      return;
    }

    const animationConfig: Phaser.Types.Animations.PlayAnimationConfig = {
      key: this.#config[characterAnimationKey].key,
      repeat: this.#config[characterAnimationKey].repeat,
      timeScale: 1.75,
    };

    if (callback) {
      const animationKey =
        Phaser.Animations.Events.ANIMATION_COMPLETE_KEY +
        this.#config[characterAnimationKey].key;
      this.gameObject.once(animationKey, () => {
        callback();
      });
    }

    this.gameObject.playReverse(
      animationConfig,
      this.#config[characterAnimationKey].ignoreIfPlaying
    );
  }

  isAnimationPlaying(): boolean {
    return this.gameObject.anims.isPlaying;
  }
}
