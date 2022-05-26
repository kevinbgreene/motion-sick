export const isString = (obj: unknown): obj is string => {
  return typeof obj === "string";
};
