import { CSSAnimatedProperties, MotionFrames } from "../types";
import { frameForCurrentElementState } from "./frameForElement";

function propertiesFromFrames(
  frames: MotionFrames,
): Set<keyof CSSAnimatedProperties> {
  const props = new Set<keyof CSSAnimatedProperties>();
  for (const frame of frames) {
    for (const key in frame) {
      if (key !== "easing" && key !== "offset") {
        props.add(key as keyof CSSAnimatedProperties);
      }
    }
  }

  return props;
}

export function framesWithImplicits(
  element: Element,
  frames: MotionFrames,
): MotionFrames {
  const sortedFrames = [...frames].sort((a, b) =>
    (a.offset ?? 0) > (b.offset ?? 0) ? 1 : -1,
  );
  const frame = sortedFrames[0];
  const props = propertiesFromFrames(sortedFrames);
  if (frame.offset == null || frame.offset !== 0.0) {
    const startFrame = frameForCurrentElementState(element, 0.0, props);
    return [startFrame, ...sortedFrames];
  }

  return sortedFrames;
}
