export type Nothing = null | undefined;

export const isNothing = (obj: unknown): obj is Nothing => {
  return obj == null;
};
