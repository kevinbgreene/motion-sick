import { CSSAnimatedProperties, DecimalRange, MotionFrame } from "../types";

export function frameForCurrentElementState(
  element: Element,
  offset: DecimalRange,
  props: Set<keyof CSSAnimatedProperties>,
): MotionFrame {
  const newFrame: any = { offset };
  for (const key of props.values()) {
    const computedStyle = window.getComputedStyle(element);
    newFrame[key] = computedStyle.getPropertyValue(key);
  }

  return newFrame;
}
