const store: Record<string, unknown> = {}

export const clientLoaderContext = {
  set:  <T>(key: string, value: T) => {store[key] = value;},
  get: <T>(key: string): T | undefined => {return store[key] as T},
  remove: (key: string) => delete store[key],
}