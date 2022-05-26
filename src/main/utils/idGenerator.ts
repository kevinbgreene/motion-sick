function id() {
  let _next = 0;
  return () => {
    _next += 1;
    return _next;
  };
}

export const idGenerator = id();
