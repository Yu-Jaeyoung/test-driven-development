declare module "bun:test" {
  interface Matchers<T> {
    toBeValidBase64Url(): T;
  }
}