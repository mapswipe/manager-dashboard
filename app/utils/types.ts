// eslint-disable-next-line max-len
export type DeepNonNullable<T> = T extends object ? (T extends (infer K)[] ? (DeepNonNullable<K>[]) : ({
    [P in keyof T]-?: DeepNonNullable<T[P]>;
})) : NonNullable<T>;
// eslint-disable-next-line max-len
export type DeepReplace<T, A, B> = (DeepNonNullable<T> extends DeepNonNullable<A> ? B : (T extends (infer Z)[] ? DeepReplace<Z, A, B>[] : (T extends object ? {
    [K in keyof T]: DeepReplace<T[K], A, B>;
} : T)));
