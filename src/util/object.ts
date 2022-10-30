export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj
  }
  const props = Object.getOwnPropertyDescriptors(obj)
  for (const prop in props) {
    props[prop].value = deepClone(props[prop].value)
  }
  return Object.create(Object.getPrototypeOf(obj), props)
}
