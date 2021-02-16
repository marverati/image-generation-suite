
interface Array<T> {
  toRGBA(): string;
  setAt(index: number | number[], value: number): Array<T>;
  setR(v: number): Array<T>;
  setG(v: number): Array<T>;
  setB(v: number): Array<T>;
  setA(v: number): Array<T>;
  setAll(v: number): Array<T>;
  setRGB(r: number, g?: number, b?: number): Array<T>;
  setRGBA(r: number, g?: number, b?: number, a?: number): Array<T>;
  affect(index: number | number[] | AffectorFunction, func: AffectorFunction): Array<T>;
  affectRGB(func: AffectorFunction): Array<T>;
  affectRGBA(func: AffectorFunction): Array<T>;
  affectAll(func: AffectorFunction): Array<T>;
  affectR(func: AffectorFunction): Array<T>;
  affectG(func: AffectorFunction): Array<T>;
  affectB(func: AffectorFunction): Array<T>;
  affectA(func: AffectorFunction): Array<T>;
}

type AffectorFunction = (v: number) => number;

Array.prototype.toRGBA = function(): string {
  return `rgba(${this[0]},${this[1]},${this[2]},${this[3] ?? 1})`;
}


Array.prototype.setAt = function(index: number | number[], value: number) {
  if (!value) {
      value = index as number;
      index = [0,1,2];
  }
  if (typeof(index) != "number") {
      for (let i = 0; i < index.length; i++) {
          this[index[i]] = value;
      }
      return this;
  }

  // affect single channel
  this[index] = value;

  // allow method chaining
  return this;
}

Array.prototype.setR = function(value: number) {
  this[0] = value;
  return this;
}

Array.prototype.setG = function(value: number) {
  this[1] = value;
  return this;
}

Array.prototype.setB = function(value: number) {
  this[2] = value;
  return this;
}

Array.prototype.setA = function(value: number) {
  this[3] = value;
  return this;
}

Array.prototype.setAll = function(value: number) {
  this[0] = value;
  this[1] = value;
  this[2] = value;
  this[3] = value;
  return this;
}

Array.prototype.setRGB = function(r: number, g = r, b = g) {
  this[0] = r;
  this[1] = g;
  this[2] = b;
  return this;
}

Array.prototype.setRGBA = function(r: number, g = r, b = g, a = b) {
  this[0] = r;
  this[1] = g;
  this[2] = b;
  this[3] = a;
  return this;
}

Array.prototype.affect = function(index: number | number[] | AffectorFunction, func?: AffectorFunction) {
  if (!func) {
      func = index as AffectorFunction;
      index = [0,1,2];
  }
  if (index instanceof Array) {
      for (let i = 0; i < index.length; i++) {
          this.affect(index[i], func);
      }
      return this;
  }

  // affect single channel
  this[index as number] = func(this[index as number]);

  // allow method chaining
  return this;
}


Array.prototype.affectRGB = function(func: AffectorFunction) {
  this[0] = func(this[0]);
  this[1] = func(this[1]);
  this[2] = func(this[2]);
  return this;
}

Array.prototype.affectAll = function(func: AffectorFunction) {
  this[0] = func(this[0]);
  this[1] = func(this[1]);
  this[2] = func(this[2]);
  this[3] = func(this[3]);
  return this;
}
Array.prototype.affectRGBA = Array.prototype.affectAll;

Array.prototype.affectR = function(func: AffectorFunction) {
  this[0] = func(this[0]);
  return this;
}

Array.prototype.affectG = function(func: AffectorFunction) {
  this[1] = func(this[1]);
  return this;
}

Array.prototype.affectB = function(func: AffectorFunction) {
  this[2] = func(this[2]);
  return this;
}

Array.prototype.affectA = function(func: AffectorFunction) {
  this[3] = func(this[3]);
  return this;
}
