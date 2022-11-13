export function assertIsDefined<T>(
  name: string,
  val: T
): asserts val is NonNullable<T> {
  if (val === undefined || val === null) {
    throw new Error(`Expected '${name}' to be defined, but received '${val}'`);
  }
}
