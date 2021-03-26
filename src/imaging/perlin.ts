import { exposeToWindow } from "@/util";

const HASH_OFFSET = Math.floor(Number.MAX_SAFE_INTEGER ** 0.5);
const HASH_OFFSET_2 = 7919;

const FLOAT_STEPS = 2 ** 20;
const FLOAT_STEPS_HALF = FLOAT_STEPS / 2;

/**
 * Hash function to generate deterministic pseudo-random numbers
 * Based on www.cs.ubc.ca/~rbridson/docs/schechter-sca08-turbulence.pdf
 * TODO figure out if this even works properly with JS's number type, or needs to be replaced
 * @param seed - Any integer number.
 * @returns Pseudo-random integer number, deterministically dependant on seed.
 */
export function hash(seed: number): number {
    seed ^= 2747636419;
    seed *= 2654435769;
    seed ^= (seed >> 16);
    seed *= 2654435769;
    seed ^= (seed >> 16);
    return seed * 2654435769;
}

/**
 * Returns deterministic pseudo-random float values between 0 and 1 based on seed.
 * @param seed - Any integer number.
 * @returns Pseudo-random float value between 0 and 1.
 */
export function floatHash(seed: number): number {
    return (hash(seed) % FLOAT_STEPS) / FLOAT_STEPS;
}

/**
 * Returns deterministic pseudo-random float values between -1 and 1 based on seed.
 * @param seed - Any integer number.
 * @returns Pseudo-random float value between 0 and 1.
 */
export function symmetricFloatHash(seed: number): number {
    return (hash(seed) % FLOAT_STEPS) / FLOAT_STEPS_HALF - 1;
}

export function perlin(x: number): number {
    const x0 = Math.floor(x), x1 = x0 + 1;
    // Compute random deterministic gradients at x0 and x1. Both should be in [-2, 2] to end up with a function
    // that has values contained in [-0.5, 0.5].
    const d0 = 2 * symmetricFloatHash(x0), d1 = 2 * symmetricFloatHash(x1)
    const dx = x - x0, dx2 = dx * dx;
    return (d0 + d1) * dx2 * dx - (2 * d0 + d1) * dx2 + d0 * dx;
}

export function blob2d(x: number, y: number): number {
    const x0 = Math.floor(x), y0 = Math.floor(y);
    // Step 1: calculate vertical polygons on left and right side
    const baseHash = 37 * x0 + 139 * y0;
    const d00 = 2 * symmetricFloatHash(baseHash), d01 = 2 * symmetricFloatHash(baseHash + 139),
            d10 = 2 * symmetricFloatHash(baseHash + 37), d11 = 2 * symmetricFloatHash(baseHash + 176);
    // Step 2: in order to compute virtual polygon combining these two points, we first obtain height at vertical polygon points
    const dy = y - y0, dy2 = dy * dy, dy3 = dy2 * dy;
    const hLeft = (d00 + d01) * dy3 - (2 * d00 + d01) * dy2 + d00 * dy,
            hRight = (d10 + d11) * dy3 - (2 * d10 + d11) * dy2 + d10 * dy;
    // Step 3: and then linearly interpolate horizontal gradients
    const xBaseHash = HASH_OFFSET + baseHash;
    const dx00 = 2 * symmetricFloatHash(xBaseHash), dx01 = 2 * symmetricFloatHash(xBaseHash + 139),
            dx10 = 2 * symmetricFloatHash(xBaseHash + 37), dx11 = 2 * symmetricFloatHash(xBaseHash + 176);
    const dx0 = dy * dx01 + (1 - dy) * dx00, dx1 = dy * dx11 + (1 - dy) * dx10;
    // Step 4: Compute obtained horizontal polygon
    const dx = x - x0, dx2 = dx * dx;
    return (dx0 + dx1) * dx2 * dx - (2 * dx0 + dx1) * dx2 + dx0 * dx + hLeft + dx * (hRight - hLeft);
}

function dot(ax: number, ay: number, bx: number, by: number): number {
    return ax * bx + ay * by;
}

function grad(x: number, y: number): [number, number] {
    const ang = floatHash(x + 1000 * y) * 2 * Math.PI;
    return [ Math.sin(ang), Math.cos(ang) ];
}

function fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
}

export function perlin2d(x: number, y: number): number {
    // lattice points
    const x0 = Math.floor(x), y0 = Math.floor(y), x1 = x0 + 1, y1 = y0 + 1;

    // Gradients
    const g00 = grad(x0, y0), g01 = grad(x0, y1), g10 = grad(x1, y0), g11 = grad(x1, y1);

    const t0 = x - x0, fadeT0 = fade(t0); // horizontal interpolation
    const t1 = y - y0, fadeT1 = fade(t1); // vertical interpolation

    const p0p1 = (1 - fadeT0) * dot(g00[0], g00[1], t0, t1    ) + fadeT0 * dot(g10[0], g10[1], t0 - 1, t1    );
    const p2p3 = (1 - fadeT0) * dot(g01[0], g01[1], t0, t1 - 1) + fadeT0 * dot(g11[0], g11[1], t0 - 1, t1 - 1);

    return (1 - fadeT1) * p0p1 + fadeT1 * p2p3;
}

function dot3(ax: number, ay: number, az: number, bx: number, by: number, bz: number): number {
    return ax * bx + ay * by + az * bz;
}

function grad3(x: number, y: number, z: number): [number, number, number] {
    const gx = symmetricFloatHash(37 * x + 139 * y + 157 * z),
        gy = symmetricFloatHash(137 * x + 29 * y + 223 * z + HASH_OFFSET),
        gz = symmetricFloatHash(179 * x + 53 * y + 89 * z + HASH_OFFSET_2);
    const l = Math.sqrt(gx * gx + gy * gy + gz * gz);
    return [gx / l, gy / l, gz / l];
}

export function perlin3d(x: number, y: number, z: number): number {
    // lattice points
    const x0 = Math.floor(x), y0 = Math.floor(y), z0 = Math.floor(z), x1 = x0 + 1, y1 = y0 + 1, z1 = z0 + 1;

    // Gradients
    const g000 = grad3(x0, y0, z0), g010 = grad3(x0, y1, z0), g100 = grad3(x1, y0, z0), g110 = grad3(x1, y1, z0),
          g001 = grad3(x0, y0, z1), g011 = grad3(x0, y1, z1), g101 = grad3(x1, y0, z1), g111 = grad3(x1, y1, z1);

    const t0 = x - x0, fadeX = fade(t0); // horizontal interpolation
    const t1 = y - y0, fadeY = fade(t1); // vertical interpolation
    const t2 = z - z0, fadeZ = fade(t2); // depth interpolation
    const t01 = t0 - 1, t11 = t1 - 1, t21 = t2 - 1;

    const p0p1 = (1 - fadeX) * dot3(g000[0], g000[1], g000[2], t0, t1, t2    ) + fadeX * dot3(g100[0], g100[1], g100[2], t01, t1, t2);
    const p2p3 = (1 - fadeX) * dot3(g010[0], g010[1], g010[2], t0, t11, t2) + fadeX * dot3(g110[0], g110[1], g110[2], t01, t11, t2);

    const p4p5 = (1 - fadeX) * dot3(g001[0], g001[1], g001[2], t0, t1, t21    ) + fadeX * dot3(g101[0], g101[1], g101[2], t01, t1, t21);
    const p6p7 = (1 - fadeX) * dot3(g011[0], g011[1], g011[2], t0, t11, t21) + fadeX * dot3(g111[0], g111[1], g111[2], t01, t11, t21);

    const ry1 = (1 - fadeY) * p0p1 + fadeY * p2p3;
    const ry2 = (1 - fadeY) * p4p5 + fadeY * p6p7;

    return (1 - fadeZ) * ry1 + fadeZ * ry2;
}

exposeToWindow({ perlin, perlin2d, perlin3d, blob2d });