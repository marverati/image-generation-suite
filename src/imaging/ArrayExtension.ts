
interface Array<T> {
  toRGBA(): string;
}

Array.prototype.toRGBA = function(): string {
  return `rgba(${this[0]},${this[1]},${this[2]},${this[3] ?? 255})`;
}