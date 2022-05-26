export type TransitionDirection = "transition-in" | "transition-out";

export type TransitionState =
  | "waiting"
  | "started"
  | "running"
  | "done"
  | "cleanup";

export type TransitionType = "normal" | "chained" | "when";

export type DecimalRange =
  | 0.0
  | 0.1
  | 0.2
  | 0.3
  | 0.4
  | 0.5
  | 0.6
  | 0.7
  | 0.8
  | 0.9
  | 1.0;

export type EasingFunction =
  | "linear"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | `cubic-bezier(${number}, ${number})`
  | `cubic-bezier(${number}, ${number}, ${number}, ${number})`;

export type CSSUnit =
  | number
  | `${number}%`
  | `${number}px`
  | `${number}vh`
  | `${number}vw`
  | `${number}em`
  | `${number}rem`
  | `${number}ch`;

export type CSSTransform =
  | `matrix(${number}, ${number}, ${number}, ${number}, ${number}, ${number})`
  | `translate(${CSSUnit}, ${CSSUnit})`
  | `translateX(${CSSUnit})`
  | `translateY(${CSSUnit})`
  | `scale(${number}, ${number})`
  | `scale(${number})`
  | `rotate(${number}deg)`
  | `rotate(${number}turn)`;

export type CSSColor =
  | `#${number}`
  | `rgb(${number},${number},${number})`
  | `rgba(${number},${number},${number},${number})`;

// Animated properties: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animated_properties
export type CSSAnimatedProperties = {
  width?: CSSUnit;
  height?: CSSUnit;
  transform?: string;
  opacity?: DecimalRange;
  backgroundColor?: CSSColor;
  borderRadius?: CSSUnit;
  margin?: CSSUnit;
  padding?: CSSUnit;
  border?: string;
};

export type MotionFrame = CSSAnimatedProperties &
  Readonly<{
    easing?: EasingFunction;
    offset?: DecimalRange;
  }>;

export type MotionTiming = Readonly<{
  duration: number;
  iterations: number;
  fill: FillMode;
}>;

export type MotionFrames = ReadonlyArray<MotionFrame>;
