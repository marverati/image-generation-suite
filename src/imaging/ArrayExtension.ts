/* eslint-disable @typescript-eslint/no-use-before-define */

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
  affectRGB(rfunc?: AffectorFunction, gfunc?: AffectorFunction, bfunc?: AffectorFunction): Array<T>;
  affectRGBA(rfunc?: AffectorFunction, gfunc?: AffectorFunction, bfunc?: AffectorFunction, afunc?: AffectorFunction): Array<T>;
  affectAll(func: AffectorFunction): Array<T>;
  affectR(func: AffectorFunction): Array<T>;
  affectG(func: AffectorFunction): Array<T>;
  affectB(func: AffectorFunction): Array<T>;
  affectA(func: AffectorFunction): Array<T>;
  toHSL(): Array<T>;
  toRGB(): Array<T>;
  affectHSL(hfunc: AffectorFunction, sfunc: AffectorFunction, gfunc: AffectorFunction): Array<T>;
  affectH(func: AffectorFunction): Array<T>;
  affectS(func: AffectorFunction): Array<T>;
  affectL(func: AffectorFunction): Array<T>;
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


Array.prototype.affectRGB = function(rfunc?: AffectorFunction, gfunc = rfunc, bfunc = gfunc) {
  rfunc && (this[0] = rfunc(this[0]));
  gfunc && (this[1] = gfunc(this[1]));
  bfunc && (this[2] = bfunc(this[2]));
  return this;
}

Array.prototype.affectAll = function(func: AffectorFunction) {
  this[0] = func(this[0]);
  this[1] = func(this[1]);
  this[2] = func(this[2]);
  this[3] = func(this[3]);
  return this;
}

Array.prototype.affectRGBA = function(rfunc: AffectorFunction, gfunc = rfunc, bfunc = gfunc, afunc = bfunc) {
  rfunc && (this[0] = rfunc(this[0]));
  gfunc && (this[1] = gfunc(this[1]));
  bfunc && (this[2] = bfunc(this[2]));
  afunc && (this[3] = afunc(this[3]));
  return this;
}

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

Array.prototype.toHSL = function() {
  const out = rgbToHsl(this[0], this[1], this[2]);
  this[0] = out[0]; this[1] = out[1]; this[2] = out[2];
  return this;
};

Array.prototype.toRGB = function() {
  const out = hslToRgb(this[0], this[1], this[2]);
  this[0] = out[0]; this[1] = out[1]; this[2] = out[2];
  return this;
};

Array.prototype.affectHSL = function(hfunc: AffectorFunction, sfunc = hfunc, lfunc = sfunc) {
  return this.toHSL().affectRGB(hfunc, sfunc, lfunc).toRGB();
};
Array.prototype.affectH = function(f: AffectorFunction) { return this.toHSL().affectR(f).toRGB(); };
Array.prototype.affectS = function(f: AffectorFunction) { return this.toHSL().affectG(f).toRGB(); };
Array.prototype.affectL = function(f: AffectorFunction) { return this.toHSL().affectB(f).toRGB(); };


/**
* Converts an RGB color value to HSL. Conversion formula
* adapted from http://en.wikipedia.org/wiki/HSL_color_space.
* Assumes r, g, and b are contained in the set [0, 255] and
* returns h, s, and l in the set [0, 1].
*
* @param   Number  r       The red color value
* @param   Number  g       The green color value
* @param   Number  b       The blue color value
* @return  Array           The HSL representation
*/
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255, g /= 255, b /= 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  let h, s;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    (h as number) /= 6;
  }

  return [ h, s, l ];
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h: number, s: number, l: number) {
  let r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [ r * 255, g * 255, b * 255 ];
  
  function hue2rgb(p: number, q: number, t: number) {
    t = ((t % 1) + 1) % 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  }
}
