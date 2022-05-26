type Result<T> =
  | Readonly<{
      value: T;
      empty: false;
    }>
  | Readonly<{
      empty: true;
    }>;

type HasTail<T extends any[]> = T extends [] | [any] ? false : true;

type Tail<T extends any[]> = ((...t: T) => any) extends (
  _: any,
  ...tail: infer Remaining
) => any
  ? Remaining
  : [];

type Head<T extends any[]> = T extends [any, ...any[]] ? T[0] : never;

type Split<T extends any[]> = HasTail<T> extends true
  ? [T[0], ...Tail<T>]
  : T extends []
  ? []
  : [T[0]];

class Trie<Keys extends any[], Value> {
  #root = new Map<Head<Keys>, Trie<Tail<Keys>, Value>>();
  #value: Result<Value> = { empty: true };

  set(args: Keys, value: Value): void {
    const [current, ...remaining] = args;
    const trie = this.#root.get(current);

    if (trie == null) {
      const nextTrie = new Trie<Tail<Keys>, Value>();
      nextTrie.set(remaining as Tail<Keys>, value);
      this.#root.set(current, nextTrie);
    } else {
      trie.set(remaining as Tail<Keys>, value);
    }
  }

  get(args: Keys): Value | undefined {
    const [current, ...remaining] = args;
    const trie = this.#root.get(current);

    if (trie == null) {
      return;
    }

    if (remaining.length === 0) {
      if (trie.#value.empty) {
        return;
      }

      return trie.#value.value;
    } else {
      return trie.get(remaining as Tail<Keys>);
    }
  }
}

export function memoize<Args extends any[], Result>(
  fn: (...args: Args) => Result,
): (...args: Args) => Result {
  const cache = new Trie();
  return (...args: Args): Result => {
    return fn(...args);
  };
}
