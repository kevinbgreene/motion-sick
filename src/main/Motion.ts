import { DecimalRange, MotionFrame, MotionFrames, MotionTiming } from "./types";
import { framesWithImplicits } from "./utils/framesWIthImplicits";
import { idGenerator } from "./utils/idGenerator";

const TIMING_DEFAULTS: MotionTiming = {
  duration: 5000,
  iterations: 1,
  // http://udn.realityripple.com/docs/Web/API/EffectTiming/fill
  fill: "forwards",
};

type BaseMotionInitArgs = Readonly<{
  element: Element;
  frames: MotionFrames;
  timing?: Partial<MotionTiming>;
}>;

export abstract class Motion {
  static create(args: BaseMotionInitArgs): Motion {
    return new NormalMotion(args);
  }

  id: number;
  playState: AnimationPlayState = "idle";

  constructor() {
    this.id = idGenerator();
  }

  chain(child: Motion): Motion {
    return new ChainedMotion({
      children: [this, child],
    });
  }

  abstract reverse(): Motion;

  abstract pause(): void;

  abstract play(parent?: Motion): Promise<void>;
}

export class ParallelMotion extends Motion {
  #children: ReadonlyArray<Motion>;
  #runningChildren: Set<Motion> = new Set();
  #pending: Promise<void> | null = null;

  constructor({ children }: Readonly<{ children: ReadonlyArray<Motion> }>) {
    super();
    this.#children = children;
  }

  reverse(): Motion {
    const children = this.#children.map((next) => next.reverse()).reverse();
    return new ParallelMotion({ children });
  }

  pause(): void {
    if (this.playState === "running") {
      this.playState = "paused";
      this.#runningChildren.forEach((next) => next.pause());
    }
  }

  async play(): Promise<void> {
    if (this.playState === "idle" || this.playState === "finished") {
      this.playState = "running";
      this.#pending = this.#loopChildren();
    } else if (this.playState === "paused") {
      this.playState = "running";
      this.#runningChildren.forEach((next) => next.play());
    }

    return this.#pending!;
  }

  async #loopChildren(): Promise<void> {
    await Promise.all(
      this.#children.map(async (next) => {
        this.#runningChildren.add(next);
        await next.play();
        this.#runningChildren.delete(next);
      }),
    );

    this.#reset();
  }

  #reset(): void {
    this.#pending = null;
    this.playState = "finished";
    this.#runningChildren.clear();
  }
}

export class ChainedMotion extends Motion {
  #children: ReadonlyArray<Motion>;
  #runningChild: Motion | null = null;
  #pending: Promise<void> | null = null;

  constructor({ children }: Readonly<{ children: ReadonlyArray<Motion> }>) {
    super();
    this.#children = children;
  }

  reverse(): Motion {
    const children = this.#children.map((next) => next.reverse()).reverse();
    return new ChainedMotion({ children });
  }

  pause(): void {
    console.log({ running: this.#runningChild });
    if (this.playState === "running") {
      this.playState = "paused";
      this.#runningChild?.pause();
    }
  }

  play(): Promise<void> {
    if (this.playState === "idle" || this.playState === "finished") {
      this.playState = "running";
      this.#pending = this.#playNext();
    } else if (this.playState === "paused") {
      this.playState = "running";
      this.#runningChild?.play();
    }

    return this.#pending!;
  }

  #playNext(): Promise<void> {
    return this.#getNextChild()
      .play()
      .then(() => {
        console.log("child finished: ", this.#runningChild);
        if (this.#hasMore()) {
          return this.#playNext();
        } else {
          this.#reset();
        }
      });
  }

  #reset(): void {
    this.playState = "finished";
    this.#runningChild = null;
    this.#pending = null;
  }

  #hasMore(): boolean {
    if (this.#runningChild == null) {
      return true;
    }

    const index = this.#children.indexOf(this.#runningChild);
    return index < this.#children.length - 1;
  }

  #getNextChild(): Motion {
    if (this.#runningChild == null) {
      this.#runningChild = this.#children[0];
    } else {
      const index = this.#children.indexOf(this.#runningChild);
      this.#runningChild = this.#children[index + 1];
    }

    return this.#runningChild;
  }
}

function reversedOffset(
  offset: DecimalRange | undefined,
): DecimalRange | undefined {
  if (offset === undefined) {
    return;
  }

  return (1.0 - offset) as DecimalRange;
}

export class NormalMotion extends Motion {
  #element: Element;
  #frames: MotionFrames;
  #timing: MotionTiming;
  #animation: Animation | null = null;
  #pending: Promise<void> | null = null;

  #currentAnimation(): Animation {
    if (this.#animation != null) {
      return this.#animation;
    }

    this.#animation = this.#element.animate([...this.#frames], this.#timing);
    this.#animation.pause();

    return this.#animation;
  }

  constructor({ element, frames, timing }: BaseMotionInitArgs) {
    super();
    this.#element = element;
    this.#frames = framesWithImplicits(element, frames);
    this.#timing = {
      ...TIMING_DEFAULTS,
      ...timing,
    };
  }

  reverse(): Motion {
    const frames = this.#frames.reduceRight(
      (acc: Array<MotionFrame>, next: MotionFrame) => {
        const offset = reversedOffset(next.offset);
        acc.push({
          ...next,
          offset,
        });

        return acc;
      },
      [],
    );

    console.log("reversed: ", { frames, id: this.id });

    return new NormalMotion({
      element: this.#element,
      frames,
      timing: this.#timing,
    });
  }

  pause(): void {
    if (this.#currentAnimation().playState === "running") {
      console.log("pause: ", this);
      this.playState = "paused";
      this.#currentAnimation().pause();
    }
  }

  play(): Promise<void> {
    if (this.playState === "paused") {
      this.playState = "running";
      this.#currentAnimation().play();
    } else if (this.playState === "idle" || this.playState === "finished") {
      this.playState = "running";
      this.#currentAnimation().play();

      this.#pending = this.#currentAnimation().finished.then((animation) => {
        animation.commitStyles();
        this.#reset();
      });
    }

    return this.#pending!;
  }

  #reset(): void {
    this.playState = "finished";
    this.#pending = null;
    this.#animation = null;
  }
}
