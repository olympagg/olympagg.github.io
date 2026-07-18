export type Brand<K, T> = T & { __brand: K };
export type Digit = `${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`;

// Some magic so Participation types union works correctly

type AllKeys<T> = T extends unknown ? keyof T : never;

type Value<T, K> = T extends unknown
  ? K extends keyof T
    ? T[K]
    : never
  : never;

type IsMandatory<T, K> = [false] extends [
  T extends unknown
    ? K extends keyof T
      ? Record<string, never> extends Pick<T, K>
        ? false
        : true
      : false
    : never,
]
  ? false
  : true;

export type SmartUnion<T> = {
  [K in AllKeys<T> as IsMandatory<T, K> extends true ? K : never]: Value<T, K>;
} & {
  [K in AllKeys<T> as IsMandatory<T, K> extends false ? K : never]?: Value<
    T,
    K
  >;
} extends infer O
  ? { [K in keyof O]: O[K] }
  : never;
