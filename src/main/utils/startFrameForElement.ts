import { CSSAnimatedProperties, MotionFrame, MotionFrames } from "../types";
import { frameForCurrentElementState } from "./frameForElement";

export function startFrameForElement(
  element: Element,
  frames: MotionFrames,
  props: Set<keyof CSSAnimatedProperties>,
): MotionFrame {
  const firstFrame = frames[0];

  if (firstFrame?.offset !== 0.0) {
    const startFrame = frameForCurrentElementState(element, 0.0, props);
    return startFrame;
  }

  return firstFrame;
}
